(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/reading-writing/expression-of-ideas"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Rhetorical Synthesis templates (Expression of Ideas). Every template is
  // one question design paired with its own bank of topic records (scenes).
  // Synthesis topics carry hand-written choices plus the facts the goal
  // requires (`need`), so verify() can confirm that the key contains every
  // required fact and each distractor misses one.

  const { DOMAIN, SECTION, lc, ungroundedWords } = C;

  /* =================================================================== */
  /* Rhetorical Synthesis topic banks                                     */
  /* =================================================================== */

  // Two subjects in the notes. `need` names both subjects and the shared
  // feature (similarity) or both contrasting values (difference); the
  // one-subject choices and the opposite-goal choice each miss one of them.
  const SIMILARITY_TOPICS = [
    {
      scene: "eoi-rsim-leaf-nesting-frogs",
      pair: "the two frog species",
      a: "the Velo tree frog",
      b: "the Carran marsh frog",
      notes: [
        "The Velo tree frog lives in mountain cloud forests and is about 3 centimeters long.",
        "It lays its eggs on leaves that hang over streams.",
        "The Carran marsh frog lives in lowland wetlands and is about 7 centimeters long.",
        "It lays its eggs on leaves that hang over ponds.",
        "When the eggs of either species hatch, the tadpoles drop into the water below.",
        "The Velo tree frog was first described by scientists in 1998.",
      ],
      need: ["Velo", "Carran", "leaves that hang over"],
      key: "The Velo tree frog and the Carran marsh frog both lay their eggs on leaves that hang over water.",
      firstOnly: "The Velo tree frog, which is about 3 centimeters long, lives in mountain cloud forests.",
      secondOnly: "The Carran marsh frog, which is about 7 centimeters long, lives in lowland wetlands.",
      difference: "The Velo tree frog lives in cloud forests, whereas the Carran marsh frog lives in lowland wetlands.",
    },
    {
      scene: "eoi-rsim-frozen-lakes",
      allow: ["covers"],
      pair: "the two lakes",
      a: "Lake Orrin",
      b: "Lake Tessaly",
      notes: [
        "Lake Orrin, a high mountain lake with a surface area of 12 square kilometers, freezes from shore to shore each winter.",
        "Lake Tessaly is a lowland lake with a surface area of 40 square kilometers.",
        "Lake Tessaly also freezes from shore to shore each winter.",
        "Researchers have measured the ice on both lakes since 1975.",
      ],
      need: ["Lake Orrin", "Lake Tessaly", "shore to shore"],
      key: "Lake Orrin and Lake Tessaly both freeze from shore to shore each winter.",
      firstOnly: "Lake Orrin is a high mountain lake with a surface area of 12 square kilometers.",
      secondOnly: "Lake Tessaly is a lowland lake with a surface area of 40 square kilometers.",
      difference: "Lake Orrin covers 12 square kilometers, while Lake Tessaly covers 40 square kilometers.",
    },
    {
      scene: "eoi-rsim-bike-share",
      allow: ["fleet"],
      pair: "the two cities' bike-share programs",
      a: "Tarrow's program",
      b: "Millbrook's program",
      notes: [
        "The city of Tarrow launched a bike-share program in 2016 with 300 bicycles.",
        "Tarrow's program lets riders use bicycles free for the first 30 minutes.",
        "The city of Millbrook launched a bike-share program in 2019 with 1,200 bicycles.",
        "Millbrook's program also lets riders use bicycles free for the first 30 minutes.",
        "Both cities pay for their programs partly by selling advertising at bike stations.",
        "Tarrow's bicycles are painted bright green.",
        "Millbrook's program has 85 stations across the city.",
      ],
      need: ["Tarrow", "Millbrook", "free for the first 30 minutes"],
      key: "Both Tarrow's and Millbrook's programs let riders use bicycles free for the first 30 minutes.",
      firstOnly: "Tarrow launched its bike-share program in 2016 with a fleet of 300 bicycles.",
      secondOnly: "Millbrook launched its bike-share program in 2019 with a fleet of 1,200 bicycles.",
      difference: "Tarrow launched its program with 300 bicycles, while Millbrook launched its program with 1,200.",
    },
    {
      scene: "eoi-rsim-farm-markets",
      pair: "the two markets",
      a: "the Pell market",
      b: "the Castor market",
      notes: [
        "The Saturday market in Pell opened in 1987 and has about 60 vendors.",
        "Most of its vendors are farmers who sell produce they grew themselves.",
        "The night market in Castor opened in 2004 and has about 150 vendors.",
        "Most of its vendors are also farmers who sell produce they grew themselves.",
        "The Castor market stays open until midnight during the summer.",
      ],
      need: ["Pell", "Castor", "farmers who sell produce"],
      key: "At both the Pell and Castor markets, most vendors are farmers who sell produce they grew themselves.",
      firstOnly: "Opened in 1987, the Saturday market in Pell has about 60 vendors, most of them farmers.",
      secondOnly: "Opened in 2004, the night market in Castor has about 150 vendors and stays open until midnight in summer.",
      difference: "The Saturday market in Pell opened in 1987, whereas the night market in Castor opened in 2004.",
    },
    {
      scene: "eoi-rsim-granite-lighthouses",
      allow: ["tall"],
      pair: "the two lighthouses",
      a: "the Brannock Light",
      b: "the Sele Point Light",
      notes: [
        "The Brannock Light was completed in 1851 on a rocky island.",
        "Its tower was built of granite quarried on the mainland.",
        "The Sele Point Light was completed in 1874 on a sandy cape.",
        "Its tower was also built of granite quarried on the mainland.",
        "The Sele Point Light was the taller of the two, at 38 meters.",
        "The Brannock Light's lamp was converted to electricity in 1938.",
      ],
      need: ["Brannock", "Sele Point", "granite"],
      key: "The Brannock Light and the Sele Point Light both have towers built of granite from the mainland.",
      firstOnly: "The Brannock Light, which had a granite tower, was completed in 1851 on a rocky island.",
      secondOnly: "The Sele Point Light, which was 38 meters tall, was completed in 1874 on a sandy cape.",
      difference: "The Brannock Light was built on a rocky island, whereas the Sele Point Light was built on a sandy cape.",
    },
    {
      scene: "eoi-rsim-bilingual-newspapers",
      allow: ["fifteen"],
      pair: "the two newspapers",
      a: "the Harbor Ledger",
      b: "the Valley Courier",
      notes: [
        "The Harbor Ledger was a newspaper founded in 1832 by a group of dockworkers.",
        "It was printed in both English and German.",
        "The Valley Courier, founded in 1847 by a schoolteacher, ceased publication in 1901.",
        "It was also printed in both English and German.",
      ],
      need: ["Harbor Ledger", "Valley Courier", "English and German"],
      key: "Both the Harbor Ledger and the Valley Courier were printed in English and German.",
      firstOnly: "In 1832, a group of dockworkers founded the newspaper known as the Harbor Ledger.",
      secondOnly: "The Valley Courier, founded in 1847 by a schoolteacher, ceased publication in 1901.",
      difference: "The Harbor Ledger was founded in 1832, fifteen years before the Valley Courier.",
    },
    {
      scene: "eoi-rsim-blue-gray-murals",
      allow: ["side"],
      pair: "the two murals",
      a: "Tide Chart",
      b: "Seed Year",
      notes: [
        "Rosa Iturbe painted the mural Tide Chart on a seawall in 2012.",
        "Tide Chart uses only shades of blue and gray.",
        "Daniel Achterberg painted the mural Seed Year on a grain elevator in 2018.",
        "Seed Year also uses only shades of blue and gray.",
        "Seed Year is more than twice as tall as Tide Chart.",
        "Iturbe grew up in the fishing town where the seawall stands.",
        "Achterberg painted Seed Year with the help of twelve student volunteers.",
      ],
      need: ["Tide Chart", "Seed Year", "shades of blue and gray"],
      key: "Iturbe's Tide Chart and Achterberg's Seed Year both use only shades of blue and gray.",
      firstOnly: "Rosa Iturbe painted Tide Chart, a mural in shades of blue and gray, on a seawall in 2012.",
      secondOnly: "In 2018, Daniel Achterberg painted the mural Seed Year on the side of a grain elevator.",
      difference: "Iturbe painted Tide Chart on a seawall, while Achterberg painted Seed Year on a grain elevator.",
    },
    {
      scene: "eoi-rsim-unaccompanied-operas",
      pair: "the two operas",
      a: "The Salt Road",
      b: "Winter Vigil",
      notes: [
        "Composer Ilse Marrow's opera The Salt Road premiered in 1994.",
        "It is sung entirely without instrumental accompaniment.",
        "Composer Tobias Feld's opera Winter Vigil premiered in 2009.",
        "It is also sung entirely without instrumental accompaniment.",
        "Winter Vigil requires a cast of 22 singers, while The Salt Road requires only nine.",
      ],
      need: ["The Salt Road", "Winter Vigil", "without instrumental accompaniment"],
      key: "The Salt Road and Winter Vigil are both sung entirely without instrumental accompaniment.",
      firstOnly: "Ilse Marrow's opera The Salt Road, which premiered in 1994, requires a cast of nine singers.",
      secondOnly: "Tobias Feld's opera Winter Vigil premiered in 2009 and requires a cast of 22 singers.",
      difference: "Winter Vigil requires a cast of 22 singers, whereas The Salt Road requires only nine singers.",
    },
    {
      scene: "eoi-rsim-sonnet-poets",
      allow: ["old"],
      pair: "the two poets",
      a: "Anneliese Kord",
      b: "Julian Osei",
      notes: [
        "Anneliese Kord published her first poetry collection in 1961 at age 19.",
        "Kord wrote only sonnets, a form with fourteen lines.",
        "Julian Osei published his first poetry collection in 1978 at age 41.",
        "Osei also wrote only sonnets.",
        "Kord's collections have been translated into eleven languages.",
        "Osei worked as a high school teacher for thirty years.",
      ],
      need: ["Kord", "Osei", "sonnets"],
      key: "Both Anneliese Kord and Julian Osei wrote only sonnets, a form with fourteen lines.",
      firstOnly: "Anneliese Kord published her first poetry collection in 1961, when she was 19 years old.",
      secondOnly: "Julian Osei was 41 years old when he published his first poetry collection in 1978.",
      difference: "Kord published her first collection at age 19, while Osei published his at age 41.",
    },
    {
      scene: "eoi-rsim-lantern-journals",
      pair: "the two travel writers",
      a: "Petra Lindahl",
      b: "Samuel Okoro",
      notes: [
        "Travel writer Petra Lindahl crossed the Arvel Mountains on foot in 1987.",
        "She wrote her book about the journey from notes she recorded each night by lantern.",
        "Travel writer Samuel Okoro, who sailed the length of the Keswa River in 2003, also wrote his book from notes he recorded each night by lantern.",
        "Okoro's book won a national prize for nonfiction.",
      ],
      need: ["Lindahl", "Okoro", "by lantern"],
      key: "Lindahl and Okoro both wrote their books from notes they recorded each night by lantern.",
      firstOnly: "Travel writer Petra Lindahl crossed the Arvel Mountains on foot and wrote a book about the journey.",
      secondOnly: "Samuel Okoro, whose book won a national prize for nonfiction, sailed the Keswa River.",
      difference: "Lindahl crossed the Arvel Mountains on foot, whereas Okoro sailed the length of the Keswa River.",
    },
  ];
  const DIFFERENCE_TOPICS = [
    {
      scene: "eoi-rdif-warbler-migration",
      pair: "the two warbler species",
      a: "the Ashby warbler",
      b: "the Corran warbler",
      notes: [
        "The Ashby warbler and the Corran warbler both breed in the pine forests of the northern Tellan Range.",
        "Both species feed mainly on caterpillars during the breeding season.",
        "Each autumn, the Ashby warbler migrates about 4,000 kilometers south.",
        "The Corran warbler does not migrate; it spends the winter in the same forests.",
        "Corran warblers survive the winter by eating seeds stored in tree bark.",
        "The Ashby warbler has a bright yellow throat.",
      ],
      need: ["Ashby", "Corran", "migrates about 4,000 kilometers south", "does not migrate"],
      key: "The Ashby warbler migrates about 4,000 kilometers south each autumn, but the Corran warbler does not migrate.",
      firstOnly: "The Ashby warbler, which breeds in the pine forests of the Tellan Range, has a bright yellow throat.",
      secondOnly: "Instead of migrating, the Corran warbler survives the winter in its forests by eating seeds stored in tree bark.",
      similarity: "Both the Ashby warbler and the Corran warbler breed in pine forests and feed mainly on caterpillars.",
    },
    {
      scene: "eoi-rdif-hill-telescopes",
      pair: "the two telescopes",
      a: "the Halvard Telescope",
      b: "the Ines Telescope",
      notes: [
        "The Halvard Telescope and the Ines Telescope, both located in the Sorrel Hills, began operating in 2011.",
        "The Halvard Telescope observes visible light.",
        "The Ines Telescope observes radio waves.",
        "The Ines Telescope can operate during cloudy weather.",
      ],
      need: ["Halvard", "Ines", "visible light", "radio waves"],
      key: "The Halvard Telescope observes visible light, while the Ines Telescope observes radio waves.",
      firstOnly: "Located in the Sorrel Hills, the Halvard Telescope began observing visible light in 2011.",
      secondOnly: "The Ines Telescope, which observes radio waves, can operate during cloudy weather.",
      similarity: "The Halvard Telescope and the Ines Telescope both began operating in the Sorrel Hills in 2011.",
    },
    {
      scene: "eoi-rdif-recycling-bins",
      allow: ["began", "collection"],
      pair: "the two towns' recycling programs",
      a: "Ferris",
      b: "Galloway",
      notes: [
        "The towns of Ferris and Galloway both started recycling programs in 2015.",
        "Both towns collect recycling from homes once every two weeks.",
        "In Ferris, residents must sort paper, glass, and plastic into separate bins.",
        "In Galloway, residents place all recyclables in a single bin.",
        "Galloway's program is run by a regional recycling cooperative.",
        "Ferris has a population of about 9,000.",
        "Galloway's collection trucks run on natural gas.",
      ],
      need: ["Ferris", "Galloway", "separate bins", "a single bin"],
      key: "Ferris residents sort recyclables into separate bins, whereas Galloway residents use a single bin.",
      firstOnly: "Ferris, a town with a population of about 9,000, has collected recycling from homes every two weeks since 2015.",
      secondOnly: "Galloway, whose program is run by a regional cooperative, has collected recycling from homes every two weeks since 2015.",
      similarity: "Since 2015, both Ferris and Galloway have collected recycling from homes every two weeks.",
    },
    {
      scene: "eoi-rdif-remote-work",
      pair: "the two companies' remote-work policies",
      a: "Brightwell",
      b: "Corvo",
      notes: [
        "Brightwell and Corvo are software companies of similar size.",
        "Both companies adopted new remote-work policies in 2021.",
        "Brightwell lets employees work from home on any day they choose.",
        "Corvo requires employees to work in the office three days per week.",
        "Corvo's office is located near a major train station.",
      ],
      need: ["Brightwell", "Corvo", "any day they choose", "three days per week"],
      key: "Brightwell lets employees work from home on any day they choose, but Corvo requires office work three days per week.",
      firstOnly: "In 2021, Brightwell adopted a policy that lets employees work from home on any day they choose.",
      secondOnly: "Corvo, whose office is near a major train station, requires employees to work in the office three days per week.",
      similarity: "Brightwell and Corvo, two software companies of similar size, both adopted new remote-work policies in 2021.",
    },
    {
      scene: "eoi-rdif-coal-canals",
      pair: "the two canals",
      a: "the Ardley Canal",
      b: "the Pellow Canal",
      notes: [
        "The Ardley Canal and the Pellow Canal were both completed in the 1820s.",
        "Both canals were built mainly to carry coal to coastal cities.",
        "The Ardley Canal is 14 kilometers long.",
        "The Pellow Canal is 96 kilometers long.",
        "The Pellow Canal required 41 locks to cross the Brenn Hills.",
        "Barges on the Ardley Canal were pulled by horses until 1900.",
      ],
      need: ["Ardley", "Pellow", "14 kilometers", "96 kilometers"],
      key: "The Ardley Canal is 14 kilometers long, while the Pellow Canal is 96 kilometers long.",
      firstOnly: "Completed in the 1820s, the Ardley Canal is 14 kilometers long and was built to carry coal.",
      secondOnly: "The Pellow Canal, which is 96 kilometers long, required 41 locks to cross the Brenn Hills.",
      similarity: "Both the Ardley Canal and the Pellow Canal were built in the 1820s mainly to carry coal.",
    },
    {
      scene: "eoi-rdif-glacier-expeditions",
      allow: ["crossed", "setting", "archived"],
      pair: "the two expeditions",
      a: "the Carrow expedition",
      b: "the Hale expedition",
      notes: [
        "The Carrow expedition and the Hale expedition both set out from the port of Vesk, and both aimed to map the Ulma Glacier.",
        "The Carrow expedition traveled across the ice by dog sled.",
        "The Hale expedition surveyed the glacier from a small airplane.",
        "Photographs from the Hale expedition are now held in a university archive.",
      ],
      need: ["Carrow", "Hale", "dog sled", "small airplane"],
      key: "The Carrow expedition crossed the glacier by dog sled, whereas the Hale expedition used a small airplane.",
      firstOnly: "The Carrow expedition, which set out from the port of Vesk, aimed to map the Ulma Glacier.",
      secondOnly: "The Hale expedition, whose photographs are now held in a university archive, set out from the port of Vesk.",
      similarity: "Setting out from the port of Vesk, both the Carrow and Hale expeditions aimed to map the Ulma Glacier.",
    },
    {
      scene: "eoi-rdif-harbor-paintings",
      pair: "the two paintings",
      a: "Harbor at Dusk",
      b: "Harbor at Noon",
      notes: [
        "Painter Clara Weist completed Harbor at Dusk and Harbor at Noon in 1908.",
        "Both paintings show the same fishing harbor from the same hillside.",
        "Harbor at Dusk is painted mostly in deep purples and reds.",
        "Harbor at Noon is painted mostly in pale yellows and whites.",
        "Harbor at Noon was displayed in Paris in 1910.",
        "Weist painted outdoors, finishing each canvas in a single day.",
        "Harbor at Dusk now hangs in a museum in Oslo.",
      ],
      need: [
        "Harbor at Dusk",
        "Harbor at Noon",
        "deep purples and reds",
        "pale yellows and whites",
      ],
      key: "Harbor at Dusk uses mostly deep purples and reds, while Harbor at Noon uses pale yellows and whites.",
      firstOnly: "Clara Weist completed Harbor at Dusk, a painting mostly in deep purples and reds, in 1908.",
      secondOnly: "Completed in 1908, Harbor at Noon shows a fishing harbor and was displayed in Paris in 1910.",
      similarity: "Clara Weist's Harbor at Dusk and Harbor at Noon both show the same fishing harbor from the same hillside.",
    },
    {
      scene: "eoi-rdif-amberton-theaters",
      pair: "the two theaters",
      a: "the Garnet Theater",
      b: "the Lowry Playhouse",
      notes: [
        "The Garnet Theater and the Lowry Playhouse both opened in the city of Amberton in 1923.",
        "Both were designed by architect Felix Brandt.",
        "The Garnet Theater seats 1,800 people.",
        "The Lowry Playhouse seats 240 people.",
        "The Lowry Playhouse is known for staging new plays by local writers.",
      ],
      need: ["Garnet", "Lowry", "1,800", "240"],
      key: "The Garnet Theater seats 1,800 people, while the Lowry Playhouse seats only 240 people.",
      firstOnly: "Designed by Felix Brandt, the Garnet Theater opened in Amberton in 1923 and seats 1,800.",
      secondOnly: "The Lowry Playhouse, which seats 240 people, is known for staging new plays by local writers.",
      similarity: "Both the Garnet Theater and the Lowry Playhouse were designed by architect Felix Brandt.",
    },
    {
      scene: "eoi-rdif-family-novels",
      pair: "the two novels",
      a: "The Quiet Mill",
      b: "Lantern Street",
      notes: [
        "Novelist Iris Delacourt wrote both The Quiet Mill and Lantern Street.",
        "Both novels follow the members of one family over several decades.",
        "The Quiet Mill is set in a farming village.",
        "Lantern Street is set in a crowded port city.",
        "Lantern Street was later adapted into a stage play.",
        "Delacourt spent six years writing The Quiet Mill.",
      ],
      need: ["Quiet Mill", "Lantern Street", "a farming village", "a crowded port city"],
      key: "Delacourt set The Quiet Mill in a farming village but set Lantern Street in a crowded port city.",
      firstOnly: "Delacourt spent six years writing The Quiet Mill, a novel that follows one family over several decades.",
      secondOnly: "Lantern Street, a novel that follows one family over several decades, was later adapted into a stage play.",
      similarity: "Iris Delacourt's novels The Quiet Mill and Lantern Street both follow one family over several decades.",
    },
    {
      scene: "eoi-rdif-farm-sisters",
      allow: ["left"],
      pair: "the two sisters' careers",
      a: "Nadia Ferrante",
      b: "Lucia Ferrante",
      notes: [
        "Nadia and Lucia Ferrante grew up on a dairy farm in the Ober Valley, and both sisters studied at the Ober Valley Agricultural College.",
        "Nadia became a veterinarian who treated farm animals for forty years.",
        "Lucia became a botanist who studied wild grasses.",
        "Lucia's field notebooks are now kept at the college library.",
      ],
      need: ["Nadia", "Lucia", "veterinarian", "botanist"],
      key: "Nadia Ferrante became a veterinarian, while her sister Lucia became a botanist who studied wild grasses.",
      firstOnly: "Nadia Ferrante, who grew up on a dairy farm, treated farm animals as a veterinarian for forty years.",
      secondOnly: "Lucia Ferrante, a botanist who studied wild grasses, left field notebooks now kept at the college library.",
      similarity: "Nadia and Lucia Ferrante both grew up on a dairy farm and studied at the same agricultural college.",
    },
  ];
  // Specify when and where an event happened. `need` is the date and the
  // place; `dateOnly`, `placeOnly`, and `neither` each miss at least one.
  const DATE_LOCATION_TOPICS = [
    {
      scene: "eoi-rdl-wren-comet",
      allow: ["homemade", "passes", "using"],
      event: "the Wren Comet's discovery",
      notes: [
        "The Wren Comet was discovered by amateur astronomer Theo Wren.",
        "Wren spotted the comet in March 2004.",
        "He was observing from a hilltop farm near the village of Cadmoor.",
        "The comet's orbit brings it near the Sun once every 71 years.",
        "Wren used a telescope he had built himself.",
        "The comet was visible without a telescope for about two weeks.",
      ],
      need: ["March 2004", "Cadmoor"],
      key: "Theo Wren discovered the Wren Comet in March 2004 while observing from a hilltop farm near Cadmoor.",
      dateOnly: "In March 2004, amateur astronomer Theo Wren discovered a comet using a telescope he built himself.",
      placeOnly: "From a hilltop farm near Cadmoor, Theo Wren spotted a comet that nears the Sun every 71 years.",
      neither: "Using a homemade telescope, Theo Wren discovered a comet that passes near the Sun every 71 years.",
    },
    {
      scene: "eoi-rdl-old-tooth-fossil",
      event: "the discovery of the “Old Tooth” fossil",
      notes: [
        "A fossil jawbone nicknamed “Old Tooth” belongs to an early relative of modern horses.",
        "It was found in June 1998 by a team led by paleontologist Amara Diallo.",
        "The team was excavating a dry riverbed in the Kessel Basin.",
        "The jawbone, which is about 45 million years old, is now displayed at a natural history museum.",
      ],
      need: ["June 1998", "Kessel Basin"],
      key: "In June 1998, Amara Diallo's team found “Old Tooth” while excavating a dry riverbed in the Kessel Basin.",
      dateOnly: "In June 1998, a team led by paleontologist Amara Diallo found the fossil jawbone nicknamed “Old Tooth.”",
      placeOnly: "The 45-million-year-old jawbone “Old Tooth” was found in a dry riverbed in the Kessel Basin.",
      neither: "The jawbone “Old Tooth,” which is about 45 million years old, was found by a team led by paleontologist Amara Diallo.",
    },
    {
      scene: "eoi-rdl-library-conference",
      allow: ["hoping", "gathered"],
      event: "the first national conference on community libraries",
      notes: [
        "The first national conference on community libraries brought together 400 librarians and volunteers.",
        "It took place in October 1972.",
        "The conference was held in a school gymnasium in the town of Wexley.",
        "Its organizers wanted to help small towns open lending libraries.",
        "A second conference was held three years later.",
        "The conference lasted three days.",
        "Each attendee received a booklet of floor plans for small libraries.",
      ],
      need: ["October 1972", "Wexley"],
      key: "The first national conference on community libraries was held in October 1972 in the town of Wexley.",
      dateOnly: "In October 1972, 400 librarians and volunteers gathered for a national conference on community libraries.",
      placeOnly: "Organizers hoping to help small towns open libraries held a conference in a school gymnasium in Wexley.",
      neither: "The first national conference on community libraries brought together 400 librarians and volunteers.",
    },
    {
      scene: "eoi-rdl-youth-parliament",
      allow: ["meeting"],
      event: "the first Youth Parliament session",
      notes: [
        "The first Youth Parliament session gathered 120 students aged 14 to 18.",
        "The students debated and voted on proposals about school transportation.",
        "The session was held in the council chamber of Brevard City Hall.",
        "It took place on May 9, 1995.",
        "Three of the students' proposals were later adopted by the city council.",
      ],
      need: ["May 9, 1995", "Brevard City Hall"],
      key: "On May 9, 1995, the first Youth Parliament session was held in the council chamber of Brevard City Hall.",
      dateOnly: "On May 9, 1995, the first Youth Parliament session gathered 120 students aged 14 to 18.",
      placeOnly: "In the council chamber of Brevard City Hall, the students debated proposals about school transportation.",
      neither: "At the first Youth Parliament session, 120 students aged 14 to 18 debated proposals about school transportation.",
    },
    {
      scene: "eoi-rdl-silver-arrow",
      allow: ["up", "starting"],
      event: "the Silver Arrow locomotive's first run",
      notes: [
        "The Silver Arrow was a steam locomotive designed by engineer Hugo Brandvold.",
        "It made its first run on August 14, 1856.",
        "The run began at a station in the port town of Ellisfort.",
        "On that run, it pulled six passenger cars at a top speed of 48 kilometers per hour.",
        "The locomotive was retired in 1890.",
        "Brandvold later designed bridges for the same railway.",
      ],
      need: ["August 14, 1856", "Ellisfort"],
      key: "The Silver Arrow made its first run on August 14, 1856, starting from a station in Ellisfort.",
      dateOnly: "On August 14, 1856, the Silver Arrow pulled six passenger cars at up to 48 kilometers per hour.",
      placeOnly: "Designed by Hugo Brandvold, the Silver Arrow began its first run at a station in Ellisfort.",
      neither: "The Silver Arrow, a steam locomotive designed by Hugo Brandvold, pulled six passenger cars.",
    },
    {
      scene: "eoi-rdl-seven-rivers-treaty",
      allow: ["settled"],
      event: "the signing of the Treaty of Seven Rivers",
      notes: [
        "The Treaty of Seven Rivers ended a long dispute over fishing rights among three neighboring nations.",
        "It was signed in April 1763.",
        "The signing took place at a monastery in the mountain town of Orvell.",
        "Each nation sent two representatives to the signing, and the treaty remained in force for more than a century.",
      ],
      need: ["April 1763", "Orvell"],
      key: "The Treaty of Seven Rivers was signed in April 1763 at a monastery in the town of Orvell.",
      dateOnly: "Signed in April 1763, the Treaty of Seven Rivers settled a dispute over fishing rights.",
      placeOnly: "Two representatives from each nation signed the Treaty of Seven Rivers at a monastery in Orvell.",
      neither: "Each nation sent two representatives to sign the Treaty of Seven Rivers, which settled a dispute over fishing rights.",
    },
    {
      scene: "eoi-rdl-glass-orchard-premiere",
      allow: ["production", "performed"],
      event: "the premiere of Ada Morrow's play The Glass Orchard",
      notes: [
        "Ada Morrow wrote the play The Glass Orchard about a family of apple growers.",
        "The play premiered on November 3, 1937.",
        "Its first performance took place at the Palisade Theater in Carroway.",
        "Morrow herself played the role of the grandmother.",
        "The play ran for 212 performances.",
        "The set was built to look like an orchard in bloom.",
      ],
      need: ["November 3, 1937", "Carroway"],
      key: "The Glass Orchard premiered on November 3, 1937, at the Palisade Theater in Carroway.",
      dateOnly: "Ada Morrow's The Glass Orchard, which premiered on November 3, 1937, ran for 212 performances.",
      placeOnly: "The Glass Orchard, in which Ada Morrow herself played the grandmother, was first performed at the Palisade Theater in Carroway.",
      neither: "The Glass Orchard, in which Ada Morrow herself played the grandmother, ran for 212 performances.",
    },
    {
      scene: "eoi-rdl-window-glass-exhibition",
      allow: ["drew", "visitors", "town"],
      event: "Tomas Rook's first exhibition",
      notes: [
        "Tomas Rook creates sculptures from recycled window glass.",
        "His first exhibition opened in September 2009.",
        "The exhibition was held in a former bus depot in Lindgate.",
        "It included 31 sculptures, the largest of which weighed 400 kilograms.",
        "More than 6,000 people visited during the exhibition's two-month run.",
        "Rook collects the glass from buildings that are about to be demolished.",
        "Admission to the exhibition was free.",
      ],
      need: ["September 2009", "Lindgate"],
      key: "Tomas Rook's first exhibition opened in September 2009 in a former bus depot in the town of Lindgate.",
      dateOnly: "Rook's first exhibition, which opened in September 2009, included 31 sculptures made from window glass.",
      placeOnly: "Held in a former bus depot in Lindgate, Rook's first exhibition drew more than 6,000 visitors.",
      neither: "Rook's first exhibition, which included 31 sculptures made from window glass, drew more than 6,000 visitors.",
    },
    {
      scene: "eoi-rdl-tern-first-issue",
      allow: ["featuring"],
      event: "the publication of the first issue of the literary magazine Tern",
      notes: [
        "Poets Wilhelmina Otte and Charles Imbe founded the literary magazine Tern.",
        "They published the first issue in January 1949.",
        "They printed it on a secondhand press in the back room of a bakery in Fallow Creek.",
        "The first issue included poems by 14 writers, and Tern continued publishing for 23 years.",
      ],
      need: ["January 1949", "Fallow Creek"],
      key: "In January 1949, the first issue of Tern, printed in a bakery's back room in Fallow Creek, was published.",
      dateOnly: "Featuring poems by 14 writers, the first issue of the magazine Tern was published in January 1949.",
      placeOnly: "Otte and Imbe printed Tern on a secondhand press in the back room of a bakery in Fallow Creek.",
      neither: "The first issue of the magazine Tern, printed by Otte and Imbe on a secondhand press, included poems by 14 writers.",
    },
    {
      scene: "eoi-rdl-quiroga-reading",
      event: "Rafael Quiroga's first public reading",
      notes: [
        "Novelist Rafael Quiroga gave his first public reading in July 1966.",
        "He read the opening chapter of his novel The Ferryman's Daughter.",
        "The reading took place in the courtyard of the public library in Villa Serena.",
        "About 50 people attended.",
        "Quiroga later said the audience's questions changed how he revised the novel.",
      ],
      need: ["July 1966", "Villa Serena"],
      key: "Rafael Quiroga gave his first public reading in July 1966 in the library courtyard in Villa Serena.",
      dateOnly: "In July 1966, Quiroga read the opening chapter of The Ferryman's Daughter to about 50 people.",
      placeOnly: "In the library courtyard in Villa Serena, Quiroga read the opening chapter of The Ferryman's Daughter.",
      neither: "Quiroga later said the audience's questions at his first public reading changed how he revised his novel.",
    },
  ];

  // Introduce a subject to an audience unfamiliar with it. The key names the
  // subject and says what it is (`need`); `assumes` and `detail` name it
  // without identifying it; `person` introduces its creator instead.
  const AUDIENCE_TOPICS = [
    {
      scene: "eoi-aud-lucero-array",
      subject: "the Lucero Array",
      short: "the Lucero Array",
      creator: "Tomás Irigoyen",
      notes: [
        "The Lucero Array is a network of 48 radio antennas in northern Ardel.",
        "Astronomer Tomás Irigoyen designed the array.",
        "Irigoyen has studied radio signals from distant galaxies for thirty years.",
        "The array began collecting data in 2019.",
        "It detects faint signals from clouds of cold hydrogen gas.",
        "The antennas are spread across a high, dry plateau.",
      ],
      need: ["Lucero Array", "network of 48 radio antennas"],
      key: "The Lucero Array, a network of 48 radio antennas in northern Ardel, detects faint signals from clouds of cold hydrogen gas.",
      assumes: "Irigoyen's Lucero Array, which began collecting data in 2019, detects faint signals from clouds of cold hydrogen gas.",
      person: "Tomás Irigoyen, an astronomer who has studied radio signals from distant galaxies for thirty years, designed the array in northern Ardel.",
      detail: "Since the Lucero Array began collecting data in 2019, it has detected faint signals from clouds of cold hydrogen gas.",
    },
    {
      scene: "eoi-aud-tidewatch",
      allow: ["taken", "gathered"],
      subject: "the Tidewatch Project",
      short: "the Tidewatch Project",
      creator: "Ruth Abernathy",
      notes: [
        "The Tidewatch Project is a citizen-science program that tracks sea-level rise along the Varn coast.",
        "It was founded in 2016 by marine geologist Ruth Abernathy.",
        "Abernathy previously spent a decade mapping underwater landslides.",
        "Volunteers photograph high tides at 130 marked sites, and the photos have helped towns plan where to raise roads.",
      ],
      need: ["Tidewatch Project", "citizen-science program"],
      key: "The Tidewatch Project is a citizen-science program in which volunteers photograph high tides along the Varn coast.",
      assumes: "Abernathy's Tidewatch Project has gathered photos of high tides at 130 sites, helping towns plan where to raise roads.",
      person: "Ruth Abernathy, a marine geologist who spent a decade mapping underwater landslides, founded the program in 2016.",
      detail: "Photos taken for the Tidewatch Project since 2016 have helped towns on the Varn coast plan where to raise roads.",
    },
    {
      scene: "eoi-aud-hearth-study",
      allow: ["examines", "living"],
      subject: "the Hearth Study",
      short: "the Hearth Study",
      creator: "Dalia Serrano",
      notes: [
        "The Hearth Study is a 12-year study of how grandparents who live with their grandchildren affect language learning.",
        "Sociologist Dalia Serrano leads the study.",
        "Serrano grew up in a three-generation household in Brisk.",
        "The study follows 640 families in Kessel and Ardel.",
        "Early results suggest that children in these homes hear a wider range of vocabulary.",
        "Researchers visit each family in the study twice a year.",
        "Serrano has written two books about family life in the region.",
      ],
      need: ["Hearth Study", "12-year study"],
      key: "The Hearth Study is a 12-year study of 640 families that examines how live-in grandparents affect children's language learning.",
      assumes: "Early results of Serrano's Hearth Study suggest that children in three-generation homes hear a wider range of vocabulary.",
      person: "Dalia Serrano, a sociologist who grew up in a three-generation household in Brisk, leads a study of 640 families.",
      detail: "The Hearth Study, which Serrano leads, follows 640 families living in Kessel and Ardel.",
    },
    {
      scene: "eoi-aud-open-streets",
      allow: ["drawn", "along", "route"],
      subject: "Open Streets Kalamar",
      short: "Open Streets Kalamar",
      creator: "Nadia Febres",
      notes: [
        "Open Streets Kalamar is a program that closes 12 miles of city streets to cars every Sunday morning.",
        "Urban planner Nadia Febres created the program in 2015.",
        "Febres had studied street design in Bogotá and Copenhagen.",
        "About 40,000 people walk or bike the closed streets each week.",
        "Nearby shops report higher Sunday sales.",
      ],
      need: ["Open Streets Kalamar", "closes 12 miles of city streets"],
      key: "Open Streets Kalamar is a program that closes 12 miles of city streets to cars every Sunday morning.",
      assumes: "Since 2015, Febres's Open Streets Kalamar has drawn about 40,000 people who walk or bike the closed streets each week.",
      person: "Nadia Febres, an urban planner who had studied street design in Bogotá and Copenhagen, created the program in 2015.",
      detail: "Shops along the route of Open Streets Kalamar report higher Sunday sales, when about 40,000 people walk or bike there.",
    },
    {
      scene: "eoi-aud-emery-ledgers",
      subject: "the Emery Ledgers",
      plural: true,
      short: "the Emery Ledgers",
      creator: "Owen Tsai",
      notes: [
        "The Emery Ledgers are account books kept by a general store in Varden from 1841 to 1879.",
        "Historian Owen Tsai rediscovered them in a barn in 2009.",
        "Tsai specializes in the economic history of rural Ardel.",
        "The ledgers record more than 30,000 purchases.",
        "They show that many customers paid in eggs, wool, or labor rather than cash.",
        "The store also served as the town's post office.",
      ],
      need: ["Emery Ledgers", "account books kept by a general store"],
      key: "The Emery Ledgers, account books kept by a general store in Varden from 1841 to 1879, record more than 30,000 purchases.",
      assumes: "The Emery Ledgers that Tsai rediscovered show that many customers paid in eggs, wool, or labor rather than in cash.",
      person: "Owen Tsai, a historian who specializes in the economic history of rural Ardel, rediscovered the ledgers in a barn in 2009.",
      detail: "Of the more than 30,000 purchases in the Emery Ledgers, many were paid for in eggs, wool, or labor instead of cash.",
    },
    {
      scene: "eoi-aud-serrat-aqueduct",
      allow: ["system", "remained"],
      subject: "the Serrat Aqueduct",
      short: "the Serrat Aqueduct",
      creator: "Lluís Pradell",
      notes: [
        "The Serrat Aqueduct is a stone channel that carried spring water 9 miles to the town of Aldena.",
        "Engineer Lluís Pradell, who had earlier built grain mills in the region, designed it in the 1720s.",
        "The aqueduct crosses a valley on 36 arches.",
        "It supplied the town until 1911.",
      ],
      need: ["Serrat Aqueduct", "stone channel"],
      key: "The Serrat Aqueduct, a stone channel designed in the 1720s, carried spring water 9 miles to the town of Aldena.",
      assumes: "Pradell's Serrat Aqueduct, whose 36 arches cross a valley, remained in use until 1911.",
      person: "Lluís Pradell, an engineer who had earlier built grain mills in the region, designed a water system for the town of Aldena in the 1720s.",
      detail: "The Serrat Aqueduct, which Lluís Pradell designed in the 1720s, crosses a valley on 36 arches.",
    },
    {
      scene: "eoi-aud-field-guide",
      subject: "Field Guide",
      short: "Field Guide",
      creator: "Nayeli Ortega",
      notes: [
        "Field Guide is a series of 24 woodcut prints of desert plants.",
        "It was made by printmaker Nayeli Ortega between 2011 and 2014.",
        "Ortega trained as a botanical illustrator before turning to printmaking.",
        "Each print shows a single plant at its actual size.",
        "The series is now owned by a museum in Tucson.",
        "Ortega cut each woodblock by hand.",
        "The prints were first shown together in 2015.",
      ],
      need: ["Field Guide", "series of 24 woodcut prints"],
      key: "Field Guide, a series of 24 woodcut prints of desert plants, shows each plant at its actual size.",
      assumes: "In Field Guide, which is now owned by a museum in Tucson, Ortega shows each plant at its actual size.",
      person: "Nayeli Ortega, a printmaker who trained as a botanical illustrator, made prints of desert plants from 2011 to 2014.",
      detail: "Field Guide, which Ortega made between 2011 and 2014, is now owned by a museum in Tucson.",
    },
    {
      scene: "eoi-aud-estuary-cello",
      allow: ["wrote"],
      subject: "Estuary",
      short: "Estuary",
      creator: "Amara Oyelaran",
      notes: [
        "Estuary is a 40-minute composition for solo cello.",
        "It was written by composer Amara Oyelaran in 2012.",
        "Oyelaran grew up in Lagos and studied composition in London.",
        "The piece imitates the sound of wind over a salt marsh.",
        "Cellists have performed it more than 200 times.",
        "The piece is divided into five movements.",
      ],
      need: ["Estuary", "composition for solo cello"],
      key: "Estuary is a 40-minute composition for solo cello that imitates the sound of wind over a salt marsh.",
      assumes: "Oyelaran's Estuary, which imitates the sound of wind over a salt marsh, has been performed more than 200 times.",
      person: "Amara Oyelaran, a composer who grew up in Lagos and studied composition in London, wrote a piece for cellists in 2012.",
      detail: "Since it was written in 2012, Estuary has been performed by cellists more than 200 times.",
    },
    {
      scene: "eoi-aud-weather-keepers",
      allow: ["publication"],
      subject: "The Weather Keepers",
      short: "The Weather Keepers",
      creator: "Delia Grange",
      notes: [
        "The Weather Keepers is a novel about a family that runs a weather station on a remote island.",
        "It was written by Delia Grange and published in 2004.",
        "Grange worked as a meteorologist for twelve years before becoming a writer.",
        "The novel, narrated by the family's youngest daughter, has been translated into 14 languages.",
      ],
      need: ["The Weather Keepers", "novel about a family that runs a weather station"],
      key: "The Weather Keepers, a 2004 novel about a family that runs a weather station on a remote island, is narrated by a daughter.",
      assumes: "Grange's The Weather Keepers, which is narrated by the family's youngest daughter, has been translated into 14 languages.",
      person: "Delia Grange, a writer who worked for twelve years as a meteorologist, published a novel in 2004.",
      detail: "Translated into 14 languages since its publication in 2004, The Weather Keepers is narrated by the family's youngest daughter.",
    },
    {
      scene: "eoi-aud-long-haul",
      allow: ["largely", "went", "director"],
      subject: "The Long Haul",
      short: "The Long Haul",
      creator: "Marguerite Doucet",
      notes: [
        "The Long Haul is a documentary film about truck drivers who cross frozen lakes in northern Canada.",
        "It was directed by Marguerite Doucet and released in 2020.",
        "Doucet spent two winters riding along with the drivers.",
        "The film won an award at a festival in Toronto.",
        "Much of it was shot at night.",
      ],
      need: ["The Long Haul", "documentary film about truck drivers"],
      key: "The Long Haul, a documentary film about truck drivers who cross frozen lakes in northern Canada, was released in 2020.",
      assumes: "Doucet's The Long Haul, much of which was shot at night, won an award at a film festival in Toronto after its release.",
      person: "Marguerite Doucet, a director, spent two winters riding along with truck drivers who cross frozen lakes in northern Canada.",
      detail: "Released in 2020, The Long Haul was shot largely at night and went on to win an award at a festival in Toronto.",
    },
  ];

  // Explain an advantage of a method or material. The key states the benefit
  // (`need`); `describe` says what it is, `drawback` gives a cost, and
  // `other` gives a related fact, none of which is an advantage.
  const ADVANTAGE_TOPICS = [
    {
      scene: "eoi-adv-seabird-drones",
      allow: ["avoid", "counting", "overhead"],
      method: "using drones to count nesting seabirds",
      short: "drone counts",
      notes: [
        "Biologists have traditionally counted nesting seabirds by walking through colonies.",
        "Walking through a colony can frighten adult birds away from their nests.",
        "A drone flies about 50 meters above a colony while its camera photographs the nests below.",
        "Birds rarely react to drones flying at that height.",
        "A drone's battery lasts only about 25 minutes.",
        "Most drones used for bird counts weigh less than 2 kilograms.",
      ],
      need: ["drone", "rarely react"],
      key: "Because birds rarely react to drones flying overhead, drone counts avoid frightening adults away from their nests.",
      describe: "A drone used for counting seabirds flies about 50 meters above the colony while its camera photographs the nests below.",
      drawback: "A drone used to photograph a colony of nesting seabirds from overhead has a battery that lasts only about 25 minutes.",
      other: "Biologists have traditionally counted nesting seabirds by walking through the colonies where the birds nest.",
    },
    {
      scene: "eoi-adv-mycelium",
      allow: ["shippers", "damage", "transit", "now", "mixture"],
      method: "packaging made from mushroom mycelium",
      short: "mycelium packaging",
      notes: [
        "Polystyrene foam, which is widely used to protect goods during shipping, can persist in landfills for centuries.",
        "Mycelium packaging is grown from fungal threads and farm waste in about a week.",
        "Mycelium packaging breaks down in soil within 45 days.",
        "It currently costs more to produce than polystyrene.",
      ],
      need: ["mycelium packaging", "within 45 days"],
      key: "Unlike polystyrene, which can persist in landfills for centuries, mycelium packaging breaks down in soil within 45 days.",
      describe: "Mycelium packaging is grown in about a week from a mixture of fungal threads and farm waste.",
      drawback: "Mycelium packaging currently costs more to produce than the polystyrene foam that shippers now widely use to protect goods.",
      other: "Polystyrene foam is widely used by shippers to protect goods from damage while they are in transit.",
    },
    {
      scene: "eoi-adv-court-texts",
      allow: ["cannot", "receive", "lack", "sent"],
      method: "sending text-message reminders about court dates",
      short: "text-message reminders",
      notes: [
        "Courts in Harlow County used to notify defendants of court dates only by mailed letter.",
        "In 2021, the county began also sending text-message reminders three days before each date.",
        "The reminders include the courthouse address and the time of the hearing.",
        "Missed court dates fell by 26 percent in the first year.",
        "About 8 percent of defendants do not have a mobile phone.",
        "Harlow County's courts hear about 12,000 cases a year.",
        "Each reminder is written in English and Spanish.",
      ],
      need: ["text-message reminders", "26 percent"],
      key: "After Harlow County began sending text-message reminders, missed court dates fell by 26 percent in the first year.",
      describe: "Harlow County's text-message reminders, sent three days before each court date, include the address and time.",
      drawback: "About 8 percent of defendants in Harlow County cannot receive text-message reminders because they lack a mobile phone.",
      other: "Before 2021, Harlow County notified defendants of their court dates only by sending them a letter in the mail.",
    },
    {
      scene: "eoi-adv-online-council",
      allow: ["having", "every"],
      method: "holding town council meetings online",
      short: "online meetings",
      notes: [
        "The town of Ashgrove held all council meetings in person until 2020.",
        "In-person meetings drew an average of 35 residents.",
        "Online meetings, which began in 2020, have drawn an average of 210 residents.",
        "Online meetings are held on a video platform on Tuesday evenings.",
        "Some older residents have reported difficulty using the meeting software.",
        "The town council has seven members.",
      ],
      need: ["online", "210 residents"],
      key: "Ashgrove's online council meetings draw an average of 210 residents, compared with 35 for in-person meetings.",
      describe: "Ashgrove's online council meetings, which began in 2020, are held on a video platform on Tuesday evenings.",
      drawback: "Some older residents of Ashgrove have reported having difficulty using the software for the town's online council meetings.",
      other: "Until 2020, the town of Ashgrove held every one of its council meetings in person.",
    },
    {
      scene: "eoi-adv-copper-maps",
      allow: ["time", "european"],
      method: "printing maps from engraved copper plates",
      short: "copper plates",
      notes: [
        "Until the 1500s, most printed maps in Europe were made from carved wooden blocks.",
        "Fine lines were difficult to carve in wood, so woodblock maps showed little detail.",
        "In the 1500s, engravers began cutting maps into copper plates.",
        "Copper plates could hold far finer lines than wooden blocks, so maps printed from them could show small towns and streams.",
        "Copper plates wore down with repeated printing and had to be re-engraved.",
      ],
      need: ["copper plates", "finer lines"],
      key: "Because copper plates could hold far finer lines than wooden blocks, maps printed from them could show small towns and streams.",
      describe: "In the 1500s, European engravers began cutting their maps into copper plates rather than carving them in wood.",
      drawback: "Copper plates wore down with repeated printing, so engravers had to re-engrave them from time to time.",
      other: "Because fine lines were difficult to carve in wood, the woodblock maps printed in Europe before the 1500s showed little detail.",
    },
    {
      scene: "eoi-adv-tile-roofs",
      method: "clay tile roofs",
      short: "clay tile roofs",
      notes: [
        "Until the 1400s, most houses in the town of Brevil had roofs of thatch, which caught fire easily.",
        "Thatch could be made cheaply from local reeds.",
        "After a fire in 1433 destroyed 200 homes, Brevil began requiring clay tile roofs.",
        "Clay tiles do not catch fire from stray sparks.",
        "Tile roofs were heavy and required stronger walls.",
        "Brevil lies on a river about 40 kilometers from the coast.",
      ],
      need: ["tile", "do not catch fire"],
      key: "Unlike thatch, which caught fire easily, the clay tile roofs required in Brevil after 1433 do not catch fire from stray sparks.",
      describe: "After a fire in 1433 destroyed 200 homes, the town of Brevil began requiring houses to have clay tile roofs.",
      drawback: "Clay tile roofs were heavy, so houses in Brevil that had them required stronger walls than thatched houses.",
      other: "Until the 1400s, most houses in Brevil had thatched roofs, which could be made cheaply from local reeds.",
    },
    {
      scene: "eoi-adv-acrylic",
      allow: ["canvas"],
      method: "acrylic paint",
      short: "acrylic paint",
      notes: [
        "For centuries, most easel painters worked in oil paint.",
        "Oil paint can take weeks to dry completely.",
        "Acrylic paint, introduced in the 1950s and made with a plastic-based binder, dries in less than an hour.",
        "Acrylic colors can darken slightly as they dry.",
      ],
      need: ["acrylic", "less than an hour"],
      key: "Whereas oil paint can take weeks to dry completely, acrylic paint dries in less than an hour.",
      describe: "Acrylic paint, which was introduced in the 1950s, is made with a binder that is plastic-based.",
      drawback: "Colors made with acrylic paint can darken slightly as they dry on the canvas.",
      other: "For centuries, most easel painters worked in oil paint, which can take weeks to dry completely.",
    },
    {
      scene: "eoi-adv-led-walls",
      allow: ["kind", "perform"],
      method: "LED video walls in filmmaking",
      short: "LED video walls",
      notes: [
        "Many films place actors in front of a green screen, and scenery is added by computer later.",
        "Some productions now use LED video walls that display scenery during filming.",
        "With an LED wall, actors can see the scenery they are reacting to.",
        "An LED wall can cost several million dollars.",
        "The first large LED walls for film were built in the 2010s.",
        "An LED wall is made of thousands of small panels fitted together.",
        "Most LED walls are curved around the stage.",
      ],
      need: ["LED", "can see the scenery"],
      key: "Because an LED video wall displays scenery during filming, actors can see the scenery they are reacting to.",
      describe: "Some film productions now use LED video walls, which display the scenery while the actors are being filmed.",
      drawback: "An LED video wall of the kind that some film productions now use can cost several million dollars.",
      other: "In many films, actors perform in front of a green screen, and the scenery is added later by computer.",
    },
    {
      scene: "eoi-adv-installments",
      allow: ["let", "read", "novels"],
      method: "publishing novels in weekly installments",
      short: "weekly installments",
      notes: [
        "Novelist Clara Ashdown published her books in weekly magazine installments in the 1860s.",
        "Each installment was about 8,000 words long.",
        "Readers sent Ashdown letters reacting to each installment.",
        "She sometimes revised later chapters in response to those letters.",
        "Writing on a weekly deadline left her little time to plan.",
      ],
      need: ["installment", "later chapters"],
      key: "Publishing in weekly installments let Ashdown read her readers' letters and revise later chapters in response.",
      describe: "In the 1860s, Ashdown published her novels in weekly magazine installments of about 8,000 words each.",
      drawback: "Writing each installment on a weekly deadline left Ashdown with little time to plan her novels.",
      other: "Readers sent Ashdown letters reacting to each weekly installment of the novels she published.",
    },
    {
      scene: "eoi-adv-live-take",
      allow: ["without"],
      method: "recording an album in a single live take",
      short: "recording live",
      notes: [
        "Jazz pianist Teodor Varga recorded his 1974 album in a single afternoon with no retakes.",
        "Most albums of the time were assembled from many separate takes.",
        "Varga's band had played together for eleven years.",
        "Critics praised the album's spontaneity.",
        "The live approach also left several wrong notes on the finished record.",
        "The album was recorded in a small studio in Budapest.",
      ],
      need: ["single", "spontaneity"],
      key: "Recording his 1974 album in a single afternoon with no retakes gave Varga a spontaneity that critics praised.",
      describe: "Varga recorded his 1974 album in a single afternoon, without any of the many separate takes that most albums of the time used.",
      drawback: "Because Varga recorded his 1974 album live, several wrong notes were left on the finished record.",
      other: "Unlike Varga's 1974 album, most albums of the time were assembled from many separate takes.",
    },
  ];

  // Make a generalization. The key states the general point with no example
  // named; every distractor names one of `examples`.
  const GENERALIZATION_TOPICS = [
    {
      scene: "eoi-gen-polar-fish",
      allow: ["frigid"],
      category: "fish that live in polar waters",
      notes: [
        "Many fish that live in polar waters produce antifreeze proteins.",
        "These proteins keep ice crystals from growing in the fish's blood.",
        "The Antarctic toothfish lives in water colder than the freezing point of fresh water.",
        "The Arctic cod can survive beneath sea ice.",
        "The winter flounder produces antifreeze proteins only in the colder months.",
        "Antifreeze proteins in fish were first identified in the late 1960s.",
      ],
      need: ["polar waters"],
      examples: ["toothfish", "cod", "flounder"],
      key: "Many fish in polar waters produce proteins that keep ice crystals from growing in their blood.",
      wrong: [
        "Found in Antarctic seas, the toothfish lives in water colder than the freezing point of fresh water.",
        "Arctic cod are polar fish that can survive in the frigid waters found beneath the sea ice.",
        "The winter flounder produces its antifreeze proteins only during the colder months of the year.",
      ],
    },
    {
      scene: "eoi-gen-bird-tools",
      allow: ["open", "dropping", "way", "out", "sharp", "plants", "tree", "hidden", "behavior"],
      category: "tool use among birds",
      notes: [
        "Several bird species have been observed using tools to find food, although researchers once thought tool use was limited to primates.",
        "New Caledonian crows shape twigs into hooks to pull insects from logs.",
        "Woodpecker finches use cactus spines to probe bark for larvae.",
        "Egyptian vultures drop stones on ostrich eggs to crack them.",
      ],
      need: ["tools"],
      examples: ["crow", "finch", "vulture"],
      key: "Several bird species use tools to find food, a behavior once thought to be limited to primates.",
      wrong: [
        "New Caledonian crows shape twigs into hooks, which they then use to pull insects out of logs.",
        "Woodpecker finches use the sharp spines of cactus plants to probe tree bark for hidden larvae.",
        "Egyptian vultures crack open ostrich eggs by dropping stones on them, one way these birds find food.",
      ],
    },
    {
      scene: "eoi-gen-whistled-languages",
      allow: ["used", "village", "residents", "communicate", "traditionally", "mountains", "dense"],
      category: "whistled languages",
      notes: [
        "Whistled languages are forms of speech that people produce by whistling.",
        "They usually develop in mountainous or densely forested areas, where whistles carry farther than spoken words.",
        "Silbo Gomero is whistled on La Gomera in the Canary Islands.",
        "Villagers in Kuşköy, Turkey, whistle a form of Turkish.",
        "The Hmong of Southeast Asia use whistled speech during courtship.",
        "Whistlers usually reproduce the melody and rhythm of spoken words.",
        "Some whistled messages can be understood several kilometers away.",
      ],
      need: ["whistle"],
      examples: ["Silbo Gomero", "Kuşköy", "Hmong"],
      key: "Whistled languages usually develop where whistles carry farther than words, as in mountains or dense forests.",
      wrong: [
        "Silbo Gomero, a form of speech produced by whistling, is used on the island of La Gomera in the Canary Islands.",
        "In the Turkish village of Kuşköy, residents communicate with one another by whistling a form of Turkish.",
        "The Hmong people of Southeast Asia have traditionally used a whistled form of speech during courtship.",
      ],
    },
    {
      scene: "eoi-gen-tool-libraries",
      allow: ["different"],
      category: "tool libraries",
      notes: [
        "Tool libraries lend equipment such as drills, ladders, and saws to members, usually for a small yearly fee.",
        "Most are run by volunteers.",
        "The Easton Tool Library in Pennsylvania lends more than 1,500 items.",
        "The Quarry Street Tool Shed in Portland lends tools and also offers repair classes.",
        "The Corliss Tool Library began in a church basement in 2012.",
      ],
      need: ["tool libraries"],
      examples: ["Easton", "Quarry Street", "Corliss"],
      key: "Tool libraries, most of which are run by volunteers, lend equipment such as drills and ladders to members.",
      wrong: [
        "In Pennsylvania, the Easton Tool Library lends its members more than 1,500 different items.",
        "Portland's Quarry Street Tool Shed lends tools to its members and also offers classes in making repairs.",
        "The Corliss Tool Library began lending equipment to its members from a church basement in 2012.",
      ],
    },
    {
      scene: "eoi-gen-town-walls",
      allow: ["once", "english", "surrounded", "times", "around", "european", "defended", "built"],
      category: "medieval town walls in Europe",
      notes: [
        "Many medieval towns in Europe were enclosed by stone walls.",
        "Besides providing defense, the walls let towns collect tolls on goods entering through the gates.",
        "The walls of Carcassonne, in southern France, were restored in the 1800s.",
        "York, in England, still has most of its medieval walls.",
        "In Dubrovnik, visitors can walk along the top of the old city walls.",
        "Many town walls were torn down in the 1800s as towns grew.",
      ],
      need: ["walls"],
      examples: ["Carcassonne", "York", "Dubrovnik"],
      key: "Many medieval European towns built stone walls that both defended them and let them collect tolls on goods.",
      wrong: [
        "The medieval walls around the city of Carcassonne, in southern France, were restored in the 1800s.",
        "The English city of York still has most of the walls that surrounded it in medieval times.",
        "In Dubrovnik, visitors can walk along the top of the walls that once enclosed the old city.",
      ],
    },
    {
      scene: "eoi-gen-company-towns",
      category: "company towns in the United States",
      notes: [
        "Company towns were communities built by a single employer to house its workers, and the employer typically owned the houses, stores, and schools.",
        "Pullman, Illinois, was built in the 1880s for workers who made railroad cars.",
        "Hershey, Pennsylvania, was built around a chocolate factory.",
        "Scotia, California, housed workers of a lumber company.",
      ],
      need: ["company towns"],
      examples: ["Pullman", "Hershey", "Scotia"],
      key: "Company towns were built by a single employer, which typically owned the houses, stores, and schools.",
      wrong: [
        "Pullman, Illinois, was built in the 1880s to house workers who made railroad cars for a single employer.",
        "The town of Hershey, Pennsylvania, was built by a single employer around a factory that made chocolate.",
        "Scotia, California, was a community built by a single employer to house the workers of a lumber company.",
      ],
    },
    {
      scene: "eoi-gen-gourd-instruments",
      allow: ["africa", "musical"],
      category: "instruments made from gourds",
      notes: [
        "Musicians in many cultures make instruments from dried gourds.",
        "A hollow gourd amplifies sound, acting as a natural resonator.",
        "The kora, a West African harp, has a body made from a large calabash gourd.",
        "The berimbau, played in Brazil, is a bow with a gourd attached near one end.",
        "The shekere is a gourd covered with a net of beads that rattle when shaken.",
        "Gourds grow on vines and become hard and hollow when dried.",
        "Dried gourds are also used as bowls and water containers.",
      ],
      need: ["gourds"],
      examples: ["kora", "berimbau", "shekere"],
      key: "In many cultures, musicians make instruments from dried gourds, which amplify sound as natural resonators.",
      wrong: [
        "The kora, a harp played in West Africa, has a body made from a large, hollow calabash gourd.",
        "In Brazil, musicians play the berimbau, a bow with a gourd attached near one end of it.",
        "A dried gourd covered with a net of beads that rattle when it is shaken, the shekere is a musical instrument.",
      ],
    },
    {
      scene: "eoi-gen-kinetic-sculpture",
      allow: ["kept", "motion", "steady", "flowing", "relies", "inside", "pair", "back", "forth", "whenever", "blows"],
      category: "kinetic sculptures",
      notes: [
        "Kinetic sculptures are artworks that contain moving parts.",
        "Many are powered by wind, water, or small motors.",
        "Ada Ostrowski's Heron has aluminum wings that tilt in the breeze.",
        "Rafael Mendes's Fountain Wheel is turned by a stream of water.",
        "Kenji Arai's Drift uses a hidden motor to rotate 200 glass disks.",
      ],
      need: ["kinetic sculptures"],
      examples: ["Ostrowski", "Mendes", "Arai"],
      key: "Kinetic sculptures are artworks with moving parts, many powered by wind, water, or small motors.",
      wrong: [
        "Ada Ostrowski's sculpture Heron has a pair of aluminum wings that tilt back and forth whenever the breeze blows.",
        "Rafael Mendes's sculpture Fountain Wheel is kept in motion by a steady stream of flowing water.",
        "Kenji Arai's sculpture Drift relies on a motor hidden inside it to rotate its 200 glass disks.",
      ],
    },
    {
      scene: "eoi-gen-epistolary",
      allow: ["series", "published"],
      category: "epistolary novels",
      notes: [
        "Epistolary novels tell their stories through documents such as letters and diary entries.",
        "The form lets readers see events through several characters' eyes.",
        "Mary Shelley's Frankenstein (1818) is framed by letters from an explorer to his sister.",
        "Bram Stoker's Dracula (1897) combines letters, diary entries, and newspaper clippings.",
        "Alice Walker's The Color Purple (1982) is told mostly in letters written by its main character, Celie.",
        "Many epistolary novels were written in the 1700s.",
      ],
      need: ["epistolary novels"],
      examples: ["Frankenstein", "Dracula", "Color Purple"],
      key: "Epistolary novels use letters and diary entries to let readers see events through several characters' eyes.",
      wrong: [
        "Mary Shelley's 1818 novel Frankenstein is framed by a series of letters that an explorer writes to his sister.",
        "Bram Stoker's Dracula, published in 1897, combines letters, diary entries, and newspaper clippings.",
        "Alice Walker's The Color Purple (1982) is told mostly in letters written by its main character, Celie.",
      ],
    },
    {
      scene: "eoi-gen-colonial-printers",
      allow: ["belonged", "taking"],
      category: "women printers in colonial America",
      notes: [
        "In colonial America, several women ran printing businesses, which often also sold books and stationery; many took over shops from husbands or brothers.",
        "Elizabeth Timothy published the South Carolina Gazette in Charleston after her husband died in 1738.",
        "Ann Franklin ran her late husband's print shop in Newport, Rhode Island.",
        "Mary Katherine Goddard printed an early copy of the Declaration of Independence in Baltimore in 1777.",
      ],
      need: ["printing businesses"],
      examples: ["Timothy", "Franklin", "Goddard"],
      key: "Several women in colonial America ran printing businesses, often taking over shops from husbands or brothers.",
      wrong: [
        "In Charleston, Elizabeth Timothy took over publishing the South Carolina Gazette after her husband died in 1738.",
        "Ann Franklin ran the print shop that had belonged to her late husband in Newport, Rhode Island.",
        "In 1777, Mary Katherine Goddard printed an early copy of the Declaration of Independence in Baltimore.",
      ],
    },
  ];

  // Present a finding and its significance. The key has both (`need`);
  // `findingMethod` has the finding without the significance, `aimMethod`
  // neither, and `context` background or significance without the finding.
  const SIGNIFICANCE_TOPICS = [
    {
      scene: "eoi-sig-tomato-signals",
      allow: ["let", "repellents", "neighbors", "point", "ways", "learn", "new", "way"],
      notes: [
        "Plant biologist Rhea Adisa wanted to know whether tomato plants can warn nearby plants of insect attacks.",
        "She grew tomato plants in pairs and allowed caterpillars to feed on one plant in each pair.",
        "The undamaged plants began producing insect-repelling chemicals within 48 hours.",
        "The finding suggests that farmers could protect crops by deliberately exposing a few plants to pests.",
        "Earlier studies of plant warning signals focused mainly on trees.",
        "Adisa's greenhouse held 200 tomato plants.",
      ],
      need: ["within 48 hours", "protect crops"],
      key: "Adisa found that undamaged tomato plants made insect repellents within 48 hours, suggesting a new way for farmers to protect crops.",
      findingMethod: "When Adisa let caterpillars feed on one tomato plant in each pair, the undamaged plants began making repellents within 48 hours.",
      aimMethod: "To learn whether tomato plants can warn their neighbors of insect attacks, Adisa let caterpillars feed on one plant in each pair she grew.",
      context: "Adisa's research on whether tomato plants warn their neighbors of attacks could point to ways for farmers to protect crops.",
    },
    {
      scene: "eoi-sig-fiber-quakes",
      allow: ["existing", "fiber-optic"],
      notes: [
        "Seismologist Karl Engstrom tested whether ordinary fiber-optic internet cables can detect earthquakes.",
        "He sent laser pulses through 30 kilometers of buried cable in Keld and measured tiny changes in the returning light.",
        "The cable detected small earthquakes that the region's seismometers also recorded.",
        "Because such cables already run under many cities, they could provide low-cost earthquake monitoring.",
        "Traditional seismometers can cost tens of thousands of dollars each.",
        "Keld has frequent small earthquakes.",
        "Engstrom's team worked with a national telephone company.",
      ],
      need: ["detected small earthquakes", "low-cost earthquake monitoring"],
      key: "Engstrom's buried cable detected small earthquakes, so existing fiber-optic cables could provide low-cost earthquake monitoring.",
      findingMethod: "By measuring changes in laser pulses sent through buried cable, Engstrom detected small earthquakes that seismometers also recorded.",
      aimMethod: "To test whether internet cables can detect earthquakes, Engstrom sent laser pulses through 30 kilometers of buried cable in Keld.",
      context: "Fiber-optic cables already run under many cities, and traditional seismometers can cost tens of thousands of dollars each.",
    },
    {
      scene: "eoi-sig-savings-photos",
      allow: ["affect", "simply", "shown"],
      notes: [
        "Economist Lucía Ferreyra studied whether people save more when their savings goals are shown as pictures.",
        "She gave 900 bank customers an app that displayed a photo of each customer's goal, such as a new bicycle.",
        "Customers who saw photos saved 18 percent more over six months than customers who saw only numbers.",
        "The finding suggests that banks could encourage saving simply by changing how goals are displayed.",
        "Most savings apps show goals as dollar amounts.",
      ],
      need: ["18 percent more", "encourage saving"],
      key: "Customers shown photos of their goals saved 18 percent more, so banks could encourage saving simply by changing how goals are displayed.",
      findingMethod: "In Ferreyra's six-month study of 900 bank customers, those shown photos of their goals saved 18 percent more than those who saw only numbers.",
      aimMethod: "To see whether pictures affect saving, Ferreyra gave 900 bank customers an app that displayed a photo of each one's goal.",
      context: "Since most savings apps show goals only as dollar amounts, Ferreyra's research on pictures could help banks encourage saving.",
    },
    {
      scene: "eoi-sig-clinic-birdsong",
      allow: ["done", "concerns", "silence", "learn", "spent"],
      notes: [
        "Psychologist Amir Haddadi wanted to know whether recorded nature sounds reduce stress in hospital waiting rooms.",
        "For eight weeks, he alternated between playing birdsong and playing no sound in the waiting room of a clinic that serves about 300 patients a week.",
        "Patients' self-reported stress was 20 percent lower on birdsong days.",
        "The finding suggests that clinics could ease patients' anxiety at almost no cost.",
      ],
      need: ["20 percent lower", "almost no cost"],
      key: "Patients' stress was 20 percent lower on days Haddadi played birdsong, suggesting that clinics could ease anxiety at almost no cost.",
      findingMethod: "When Haddadi alternated birdsong and silence in a clinic's waiting room, patients' stress was 20 percent lower on birdsong days.",
      aimMethod: "To learn whether nature sounds reduce stress, Haddadi spent eight weeks alternating birdsong and silence in a clinic's waiting room.",
      context: "Haddadi's research, done in a clinic that serves about 300 patients a week, concerns easing patients' anxiety at almost no cost.",
    },
    {
      scene: "eoi-sig-church-roof",
      allow: ["regional", "learn", "came"],
      notes: [
        "Historian Greta Solvik wanted to determine when the timber roof of Hallberg Church in Ardel was built.",
        "She compared the growth rings in the roof beams with a record of tree rings from the region.",
        "The trees used for the beams were cut down in the winter of 1181.",
        "The date places the roof among the oldest surviving timber roofs in northern Ardel.",
        "The church's stone walls were rebuilt in the 1600s.",
        "Hallberg Church is still used for services.",
      ],
      need: ["1181", "oldest surviving timber roofs"],
      key: "Hallberg Church's roof beams came from trees cut in 1181, which places the roof among the oldest surviving timber roofs in northern Ardel.",
      findingMethod: "By comparing growth rings in the roof beams with regional tree-ring records, Solvik found that the trees were cut down in 1181.",
      aimMethod: "Solvik compared the growth rings in the roof beams of Hallberg Church with regional records to learn when the roof was built.",
      context: "Hallberg Church in Ardel, whose stone walls were rebuilt in the 1600s, has a timber roof that the historian Solvik studied.",
    },
    {
      scene: "eoi-sig-baltic-jars",
      allow: ["now"],
      notes: [
        "Archaeologist Tomasz Wierzba studied the cargo of a 14th-century shipwreck found off the coast of Ardel.",
        "He tested the chemical makeup of 40 ceramic jars from the wreck.",
        "The clay in the jars came from workshops in southern Selva.",
        "The finding shows that trade between Selva and the Talan region was active a century earlier than written records indicate.",
        "The wreck lies in 20 meters of water.",
      ],
      need: ["southern Selva", "a century earlier"],
      key: "Clay from southern Selva in the wreck's jars shows that trade with the Talan was active a century earlier than records indicate.",
      findingMethod: "Wierzba's chemical tests of 40 ceramic jars from a 14th-century shipwreck showed that their clay came from southern Selva.",
      aimMethod: "In studying the cargo of a 14th-century shipwreck off the coast of Ardel, Wierzba tested the chemical makeup of 40 ceramic jars.",
      context: "A 14th-century shipwreck off the coast of Ardel, whose cargo Wierzba studied, now lies in 20 meters of water.",
    },
    {
      scene: "eoi-sig-hidden-portrait",
      allow: ["now", "wrote", "hidden"],
      notes: [
        "Art historian Colette Marchand examined Rue Verte, an 1889 painting by Émile Dorval, using X-ray imaging.",
        "Beneath the street scene, she discovered a nearly finished portrait of a woman.",
        "Dorval's letters mention that he could not afford new canvases that year.",
        "The finding supports the view that poverty shaped Dorval's working methods more than scholars had recognized.",
        "Rue Verte hangs in a museum in Vell.",
        "Dorval painted mostly street scenes of Vell and Asker.",
        "X-ray imaging can reveal layers of paint beneath a picture's surface.",
      ],
      need: ["portrait", "poverty shaped"],
      key: "The portrait Marchand found beneath Rue Verte suggests that poverty shaped Dorval's methods more than scholars had recognized.",
      findingMethod: "Using X-ray imaging, Marchand discovered a nearly finished portrait of a woman hidden beneath the street scene in Dorval's Rue Verte.",
      aimMethod: "Marchand used X-ray imaging to examine Rue Verte, a street scene that Émile Dorval painted in 1889 and that hangs in Vell.",
      context: "Dorval, whose painting Rue Verte now hangs in Vell, wrote in letters that he could not afford new canvases in 1889.",
    },
    {
      scene: "eoi-sig-albion-tickets",
      allow: ["likely", "drew", "operated", "later", "day's", "1790s"],
      notes: [
        "Theater historian Evan Pryce studied ticket records from Ostby's Albion Theatre, which burned down in 1841, for the years 1790 to 1820.",
        "He compared the prices of the cheapest seats with the daily wages of laborers.",
        "The cheapest seats cost less than a tenth of a laborer's daily wage.",
        "This suggests that the theater's audiences were more working-class than scholars have assumed.",
      ],
      need: ["less than a tenth", "more working-class"],
      key: "Since its cheapest seats cost less than a tenth of a laborer's daily wage, the Albion likely drew more working-class audiences than assumed.",
      findingMethod: "Comparing ticket prices with laborers' wages, Pryce found that the cheapest seats at Ostby's Albion Theatre cost less than a tenth of a day's wage.",
      aimMethod: "Pryce compared the prices of the cheapest seats at the Albion Theatre from 1790 to 1820 with the daily wages of laborers.",
      context: "Pryce studied ticket records from Ostby's Albion Theatre, which operated in the 1790s and later burned down in 1841.",
    },
    {
      scene: "eoi-sig-hesketh-drafts",
      allow: ["set"],
      notes: [
        "Literary scholar Priya Raman studied the surviving drafts of poet Walter Hesketh's final collection.",
        "She counted every change Hesketh made across 212 manuscript pages.",
        "More than half of his revisions shortened lines rather than altering word choice.",
        "The finding challenges the common view that Hesketh's late style came from careful word selection.",
        "Hesketh's final collection was published in 1936.",
      ],
      need: ["shortened lines", "challenges the common view"],
      key: "Most of Hesketh's revisions shortened lines rather than altering word choice, which challenges the common view of his late style.",
      findingMethod: "After counting every change across 212 manuscript pages, Raman found that more than half of Hesketh's revisions had shortened lines.",
      aimMethod: "Raman studied the drafts of Hesketh's final collection, counting every change that he made across 212 manuscript pages.",
      context: "Walter Hesketh's final collection, which was published in 1936, survives in a set of drafts that Raman has studied.",
    },
    {
      scene: "eoi-sig-pembrook-sketches",
      notes: [
        "Biographer Nora Castell studied the notebooks of inventor Josiah Pembrook, who patented an early typewriter in 1868.",
        "She dated each of his 300 sketches using the paper's watermarks.",
        "Pembrook's first typewriter sketch was made in 1859, nine years before his patent.",
        "This suggests that Pembrook developed the machine slowly rather than in the sudden burst of work described in earlier biographies.",
        "Pembrook's notebooks are held by a library in Brisk.",
        "Pembrook's first typewriter had 40 keys.",
      ],
      need: ["1859", "developed the machine slowly"],
      key: "Pembrook sketched his first typewriter in 1859, suggesting that he developed the machine slowly rather than in one sudden burst.",
      findingMethod: "By dating all 300 sketches through the paper's watermarks, Castell found that Pembrook's first typewriter sketch was made in 1859.",
      aimMethod: "Castell dated each of the 300 sketches in inventor Josiah Pembrook's notebooks by using the watermarks on the paper.",
      context: "Josiah Pembrook, whose notebooks are held by a library in Brisk, patented an early typewriter in 1868 after years of work.",
    },
  ];

  // Stress one of a likeness and a difference and concede the other. Every
  // topic holds two similarities (`sim`, `sim2`) and two differences
  // (`diff`, `diff2`), each with the markers verify() looks for, and four
  // sentences built from them, each a subordinate clause (introduced by
  // `conj`) and a main clause (`parts.<name> = [subordinate, main]`):
  //   a: concedes the first difference, stresses the first similarity
  //   b: concedes the second similarity, stresses the second difference
  //   c: concedes the second similarity, stresses the first similarity
  //   e: concedes the first difference, stresses the second difference
  // Each sentence shares one clause with two others (a with c and e, b with
  // c and e), so no sentence is the one the others vary around. The goal
  // decides the key: a when the similarity is to be stressed, b when the
  // difference is. `mainFirst` puts the main clause first ("..., although").
  const CONCESSION_SIMILARITY_TOPICS = [
    {
      scene: "eoi-csim-icy-moons",
      allow: ["orbits", "only"],
      pair: "Europa and Enceladus",
      conj: "Although",
      notes: [
        "Europa is a moon of Jupiter.",
        "Enceladus is a moon of Saturn.",
        "Both moons are thought to have oceans of liquid water beneath their icy surfaces.",
        "Europa is about 3,100 kilometers across.",
        "Enceladus is about 500 kilometers across.",
        "Both moons are covered by a thick shell of ice.",
        "Plumes of water vapor have been observed rising from cracks near the south pole of Enceladus.",
      ],
      sim: "oceans of liquid water",
      sim2: "shell of ice",
      diff: ["Jupiter", "Saturn"],
      diff2: ["3,100", "500"],
      clauses: {
        diff: "Europa orbits Jupiter and Enceladus orbits Saturn",
        sim: "Europa and Enceladus are both thought to have oceans of liquid water beneath their ice",
        sim2: "each moon has a thick shell of ice",
        diff2: "Europa is about 3,100 kilometers across, while Enceladus is only about 500 kilometers across",
      },
    },
    {
      scene: "eoi-csim-willow-meadowsweet",
      allow: ["riverbank", "meadow", "exceeds", "long"],
      pair: "willow and meadowsweet",
      conj: "Although",
      notes: [
        "Willow is a tree that grows along riverbanks.",
        "Meadowsweet is a flowering herb found in damp meadows.",
        "Both plants contain salicylic compounds, which reduce pain and fever.",
        "Ancient Egyptian texts mention willow as a remedy.",
        "Salicylic compounds from meadowsweet were used in developing aspirin in the 1890s.",
        "Both plants have been used as folk remedies for centuries.",
        "Willow can grow more than 20 meters tall.",
        "Meadowsweet rarely grows taller than 2 meters.",
      ],
      sim: "salicylic compounds",
      sim2: "folk remedies",
      diff: ["tree", "herb"],
      diff2: ["20 meters", "2 meters"],
      clauses: {
        diff: "willow is a riverbank tree and meadowsweet a meadow herb",
        sim: "willow and meadowsweet both contain pain-reducing salicylic compounds",
        sim2: "each has long been used in folk remedies",
        diff2: "one can grow more than 20 meters tall, while the other rarely exceeds 2 meters",
      },
    },
    {
      scene: "eoi-csim-traffic-deaths",
      allow: ["changing"],
      pair: "the two cities",
      conj: "While",
      notes: [
        "In 2016, the city of Marlton lowered its speed limits on residential streets.",
        "In 2017, the city of Fenwick added protected bike lanes and wider sidewalks.",
        "Over the next five years, traffic deaths fell by about a third in each city.",
        "Marlton has a population of 410,000.",
        "Fenwick has a population of 280,000.",
        "Both cities held public meetings before making the changes.",
      ],
      sim: "fell by about a third",
      sim2: "public meetings",
      diff: ["speed limits", "bike lanes"],
      diff2: ["410,000", "280,000"],
      clauses: {
        diff: "Marlton lowered its speed limits and Fenwick added protected bike lanes",
        sim: "traffic deaths fell by about a third in each city over the next five years",
        sim2: "Marlton and Fenwick both held public meetings before changing their streets",
        diff2: "Marlton has a population of 410,000 and Fenwick a population of 280,000",
      },
    },
    {
      scene: "eoi-csim-reading-schools",
      allow: ["storybooks"],
      pair: "the two schools",
      conj: "Though",
      mainFirst: true,
      notes: [
        "Alder Primary School teaches reading mainly through phonics lessons.",
        "Crestview Primary School teaches reading mainly through shared storybook reading.",
        "At both schools, about 85 percent of students read at grade level by third grade.",
        "Alder Primary has 22 students per class on average.",
        "Crestview Primary has 26 students per class on average.",
        "Both schools are in the same school district.",
        "Alder Primary opened in 1958.",
      ],
      sim: "85 percent",
      sim2: "same school district",
      diff: ["phonics", "storybook"],
      diff2: ["22 students", "26 students"],
      clauses: {
        diff: "Alder teaches reading through phonics and Crestview through storybooks",
        sim: "about 85 percent of students at each school read at grade level by third grade",
        sim2: "the two schools are in the same school district",
        diff2: "Alder has 22 students per class on average and Crestview has 26 students",
      },
    },
    {
      scene: "eoi-csim-worker-parks",
      allow: ["replaced", "only"],
      pair: "the two parks",
      conj: "While",
      notes: [
        "Rowan Park opened in 1858 on the site of a former brickworks.",
        "Ashcombe Commons opened in 1873 on the site of a former rail yard.",
        "Both parks were designed to give factory workers a place to rest outdoors.",
        "Rowan Park covers 30 hectares.",
        "Ashcombe Commons covers 12 hectares.",
        "Both parks have a bandstand near the main gate.",
      ],
      sim: "factory workers",
      sim2: "bandstand",
      diff: ["brickworks", "rail yard"],
      diff2: ["30 hectares", "12 hectares"],
      clauses: {
        diff: "Rowan Park replaced a brickworks and Ashcombe Commons a rail yard",
        sim: "Rowan Park and Ashcombe Commons were both designed so that factory workers could rest",
        sim2: "each has a bandstand near its main gate",
        diff2: "one park covers 30 hectares and the other only 12 hectares",
      },
    },
    {
      scene: "eoi-csim-scripts",
      allow: ["arose", "scripts", "first", "second"],
      pair: "Egyptian hieroglyphs and Maya script",
      conj: "Although",
      mainFirst: true,
      notes: [
        "Egyptian hieroglyphs were used in northeastern Africa from about 3200 BCE.",
        "Maya script was used in Mesoamerica from about 300 BCE.",
        "Both writing systems combine signs for whole words with signs for sounds.",
        "Scholars deciphered Egyptian hieroglyphs in the 1820s.",
        "Much of Maya script was not deciphered until the late 1900s.",
        "Both scripts were carved on stone monuments as well as written on other materials.",
      ],
      sim: "signs for whole words with signs for sounds",
      sim2: "stone monuments",
      diff: ["northeastern Africa", "Mesoamerica"],
      diff2: ["3200 BCE", "300 BCE"],
      clauses: {
        diff: "hieroglyphs arose in northeastern Africa and Maya script in Mesoamerica",
        sim: "both scripts combine signs for whole words with signs for sounds",
        sim2: "both scripts were carved on stone monuments",
        diff2: "hieroglyphs were used from about 3200 BCE and Maya script from about 300 BCE",
      },
    },
    {
      scene: "eoi-csim-river-painters",
      allow: ["returned", "subject"],
      pair: "the two painters",
      conj: "Though",
      notes: [
        "Painter Odile Marceau worked mainly in watercolor.",
        "Painter Hugo Brask worked mainly in oil.",
        "Both artists painted the Varne River repeatedly over several decades.",
        "Marceau's river scenes are usually smaller than 30 centimeters wide.",
        "Brask's largest river painting is over 4 meters wide.",
        "Both painters exhibited their work in the town of Varne every summer.",
        "Marceau taught painting at a school in Varne for twenty years.",
      ],
      sim: "Varne River",
      sim2: "exhibited",
      diff: ["watercolor", "in oil"],
      diff2: ["30 centimeters", "4 meters"],
      clauses: {
        diff: "Marceau worked mainly in watercolor and Brask mainly in oil",
        sim: "Marceau and Brask both painted the Varne River repeatedly over several decades",
        sim2: "the two painters exhibited in Varne every summer",
        diff2: "one's scenes are usually under 30 centimeters wide, the other's largest over 4 meters",
      },
    },
    {
      scene: "eoi-csim-acoustic-albums",
      allow: ["french"],
      pair: "the two albums",
      conj: "Even though",
      notes: [
        "Folk duo Fenn & Dahl recorded their album Low Country in a professional studio in Nashville.",
        "Singer Mireille Tauber recorded her album Stillwater in a stone chapel in rural France.",
        "Both albums use only acoustic instruments.",
        "Low Country was released in 2019.",
        "Stillwater was released in 2021.",
        "Both albums were produced by the recording engineer Ilse Moreau.",
      ],
      sim: "acoustic instruments",
      sim2: "Ilse Moreau",
      diff: ["studio", "chapel"],
      diff2: ["2019", "2021"],
      clauses: {
        diff: "Low Country was recorded in a Nashville studio and Stillwater in a French chapel",
        sim: "both albums use only acoustic instruments",
        sim2: "Low Country and Stillwater were both produced by the recording engineer Ilse Moreau",
        diff2: "Low Country was released in 2019 and Stillwater in 2021",
      },
    },
    {
      scene: "eoi-csim-mining-memoirs",
      allow: ["hers"],
      pair: "the two memoirs",
      conj: "Although",
      mainFirst: true,
      notes: [
        "Writer Tomasz Wilk wrote his memoir Coal Dust in verse.",
        "Writer Grace Adeyemi wrote her memoir Pit Lane in prose.",
        "Both memoirs describe growing up in coal-mining towns.",
        "Coal Dust was published in 1988.",
        "Pit Lane was published in 2006.",
        "Both memoirs were first published by small presses.",
        "Adeyemi's memoir won a national prize for nonfiction.",
      ],
      sim: "coal-mining towns",
      sim2: "small presses",
      diff: ["verse", "prose"],
      diff2: ["1988", "2006"],
      clauses: {
        diff: "Wilk wrote his memoir in verse and Adeyemi wrote hers in prose",
        sim: "Coal Dust and Pit Lane both describe growing up in coal-mining towns",
        sim2: "both memoirs were first published by small presses",
        diff2: "Coal Dust was published in 1988 and Pit Lane not until 2006",
      },
    },
    {
      scene: "eoi-csim-mail-inventors",
      pair: "the two inventors",
      conj: "While",
      notes: [
        "Ada Lindgren trained as an engineer at a university in Stockholm.",
        "Pieter Van Aalst had no formal schooling and learned by repairing clocks.",
        "Both inventors designed early machines for sorting mail.",
        "Van Aalst's machine was installed in a post office in 1928.",
        "Lindgren's machine was installed in a post office in 1931.",
        "Both inventors were born in 1889.",
      ],
      sim: "sorting mail",
      sim2: "born in 1889",
      diff: ["engineer", "repairing clocks"],
      diff2: ["1928", "1931"],
      clauses: {
        diff: "Lindgren trained as an engineer and Van Aalst learned by repairing clocks",
        sim: "Lindgren and Van Aalst both designed early machines for sorting mail",
        sim2: "the two inventors were both born in 1889",
        diff2: "one machine was installed in a post office in 1928 and the other in 1931",
      },
    },
  ];

  // Emphasize how a result differed from an expectation. The key states both
  // (`need`); `resultMethod` and `resultOther` omit the expectation, and
  // `expectationMethod` omits the result.
  const EXPECTATION_TOPICS = [
    {
      scene: "eoi-exp-bumblebees",
      goal: "emphasize how the study's results differed from what the researchers expected",
      notes: [
        "A team led by ecologist Mina Ueda studied which flowers bumblebees visit in a mountain meadow.",
        "The researchers expected the bees to favor the flowers that produced the most nectar.",
        "They tracked 150 marked bees over three summers.",
        "The bees visited the flowers closest to their nests most often, regardless of nectar.",
        "The finding may help explain why some high-nectar flowers go largely unvisited.",
        "Bumblebees can fly more than a kilometer from their nests to feed.",
      ],
      need: ["most nectar", "closest to their nests"],
      key: "Although the researchers expected the bees to favor flowers with the most nectar, the bees most often visited those closest to their nests.",
      resultMethod: "After tracking 150 marked bees over three summers, Ueda's team found that the bees most often visited the flowers that were closest to their nests.",
      expectationMethod: "Ueda's team, which tracked 150 marked bees over three summers, expected them to favor the flowers that produced the most nectar.",
      resultOther: "Although bumblebees can fly more than a kilometer from their nests to feed, Ueda's bees most often visited the flowers closest to their nests.",
    },
    {
      scene: "eoi-exp-trout-frogs",
      goal: "emphasize how the study's results differed from what the researchers expected",
      notes: [
        "Researchers removed invasive trout from 12 mountain lakes to help native frogs recover.",
        "They predicted that frog populations would double within five years.",
        "They surveyed the lakes each summer for eight years, along with nearby lakes that still had trout.",
        "Frog populations grew only slightly, because a fungal disease was spreading among the frogs.",
        "In the nearby lakes that still had trout, frog populations declined.",
      ],
      need: ["double", "grew only slightly"],
      key: "The researchers predicted that frog populations would double after the trout were removed, but the populations grew only slightly.",
      resultMethod: "Surveys of the 12 lakes over eight years showed that frog populations grew only slightly after the invasive trout had been removed.",
      expectationMethod: "After removing invasive trout from 12 lakes, the researchers predicted that frog populations would double within five years.",
      resultOther: "While frog populations declined in nearby lakes that still had trout, those in the 12 lakes where trout had been removed grew only slightly.",
    },
    {
      scene: "eoi-exp-bag-charge",
      allow: ["brought", "cut", "reduce", "10-cent"],
      goal: "emphasize how the study's results differed from what the economists expected",
      notes: [
        "In 2019, the town of Dunfield began charging shoppers 10 cents for each plastic bag.",
        "Economists studying the policy expected bag use to fall by about 20 percent.",
        "They counted bags used at 15 grocery stores for a year before and a year after the charge began.",
        "Bag use fell by 74 percent.",
        "Many shoppers began bringing reusable bags.",
        "Dunfield has about 40,000 residents.",
        "The charge does not apply to paper bags.",
      ],
      need: ["20 percent", "74 percent"],
      key: "Economists expected Dunfield's 10-cent bag charge to reduce bag use by about 20 percent, but bag use fell by 74 percent.",
      resultMethod: "Counts at 15 grocery stores showed that bag use in Dunfield fell by 74 percent after the town's 10-cent charge began.",
      expectationMethod: "Economists who counted bags at 15 Dunfield grocery stores expected the 10-cent charge to cut bag use by about 20 percent.",
      resultOther: "While the charge does not apply to paper bags, plastic bag use in Dunfield fell by 74 percent after it began.",
    },
    {
      scene: "eoi-exp-loneliness",
      allow: ["people"],
      goal: "emphasize how the study's results differed from what the researchers expected",
      notes: [
        "Sociologists at Brennan University surveyed 5,000 adults about loneliness.",
        "The researchers expected adults over 70 to report the most loneliness.",
        "Adults aged 18 to 25 reported the highest levels of loneliness.",
        "Adults over 70 reported the lowest levels.",
        "The survey asked participants how often they felt left out or isolated.",
      ],
      need: ["expected adults over 70", "18 to 25"],
      key: "Although the researchers expected adults over 70 to report the most loneliness, adults aged 18 to 25 reported the highest levels.",
      resultMethod: "In a survey of 5,000 adults, those aged 18 to 25 reported the highest levels of loneliness, while those over 70 reported the lowest.",
      expectationMethod: "In surveying 5,000 adults about loneliness, the researchers expected adults over 70 to report the most loneliness.",
      resultOther: "The survey, which asked how often people felt left out or isolated, found the most loneliness among adults aged 18 to 25.",
    },
    {
      scene: "eoi-exp-cairn-ridge",
      allow: ["remains"],
      goal: "emphasize how the excavation's results differed from what the archaeologists expected",
      notes: [
        "Archaeologists excavated a 4,000-year-old settlement at Cairn Ridge in Ardel.",
        "Because the site is exposed to harsh winters, they expected it to have been a summer camp.",
        "Seeds and animal bones found at the site came from every season of the year.",
        "The team concluded that people lived at Cairn Ridge year-round.",
        "The excavation took place over four summers.",
        "The settlement had at least nine stone houses.",
      ],
      need: ["summer camp", "year-round"],
      key: "The archaeologists expected Cairn Ridge to have been a summer camp, but remains from every season show people lived there year-round.",
      resultMethod: "Seeds and animal bones from every season of the year showed the archaeologists that people had lived at the Cairn Ridge site year-round.",
      expectationMethod: "Because Cairn Ridge is exposed to harsh winters, the archaeologists who excavated it expected it to have been a summer camp.",
      resultOther: "Although the excavation at Cairn Ridge took place only over four summers, it found seeds and animal bones from every season of the year.",
    },
    {
      scene: "eoi-exp-tavern-books",
      allow: ["identified"],
      goal: "emphasize how Hollister's results differed from what she expected",
      notes: [
        "Historian Lena Hollister studied the account books of four taverns in 1760s Ostby, which list more than 2,000 customers by name.",
        "Hollister expected the customers to be almost entirely men.",
        "About 30 percent of the named customers were women.",
        "Many of the women bought food and drink to take home rather than to consume at the tavern.",
      ],
      need: ["almost entirely men", "30 percent"],
      key: "Hollister expected the taverns' customers to be almost entirely men, but about 30 percent were women.",
      resultMethod: "Of the more than 2,000 customers named in the account books of four 1760s Ostby taverns, about 30 percent were women.",
      expectationMethod: "Studying the account books of four 1760s Ostby taverns, Hollister expected the customers to be almost entirely men.",
      resultOther: "While most of the named customers were men, about 30 percent were women, many of whom bought food and drink to take home.",
    },
    {
      scene: "eoi-exp-theater-acoustics",
      allow: ["explain", "muffle", "12,000-seat"],
      goal: "emphasize how the study's results differed from what the engineers expected",
      notes: [
        "Acoustic engineers studied why speech carries so well in the ancient theater at Leondari.",
        "They expected the theater's steep, bowl-like shape to be the main reason.",
        "Using computer models, they tested the effect of the shape and of the stone seats separately.",
        "The ridged stone seats did most of the work, muffling low-pitched background noise.",
        "The theater could seat about 12,000 people.",
        "Plays are still performed there each summer.",
        "The theater was carved into the side of a hill.",
      ],
      need: ["bowl-like shape", "ridged stone seats"],
      key: "The engineers expected the theater's bowl-like shape to explain its acoustics, but its ridged stone seats did most of the work.",
      resultMethod: "Computer models that tested the shape and the seats separately showed that Leondari's ridged stone seats muffle low-pitched noise.",
      expectationMethod: "The engineers, who tested the theater's shape and seats separately, expected its bowl-like shape to be the main reason speech carries.",
      resultOther: "Although the theater at Leondari could seat about 12,000 people, speech carries well there because its ridged stone seats muffle low-pitched noise.",
    },
    {
      scene: "eoi-exp-composer-quiz",
      allow: ["heard", "named"],
      goal: "emphasize how the study's results differed from what the researchers expected",
      notes: [
        "Music psychologists played short excerpts of classical pieces to 200 listeners.",
        "Half of the listeners were trained musicians.",
        "The researchers expected the musicians to identify the composers far more accurately than the other listeners.",
        "Musicians and nonmusicians identified the composers with nearly the same accuracy.",
        "Both groups did best with pieces by Mozart.",
      ],
      need: ["far more accurately", "nearly the same accuracy"],
      key: "The researchers expected musicians to identify the composers far more accurately, but both groups did so with nearly the same accuracy.",
      resultMethod: "Among 200 listeners who heard short classical excerpts, musicians and nonmusicians named composers with nearly the same accuracy.",
      expectationMethod: "Playing classical excerpts to 200 listeners, half of them musicians, the researchers expected the musicians to identify composers far more accurately.",
      resultOther: "While half of the 200 listeners were trained musicians and half were not, the two groups did best with pieces by the same composer, Mozart.",
    },
    {
      scene: "eoi-exp-grunwald-letters",
      allow: ["unseen"],
      goal: "emphasize how Petrov's results differed from what he expected",
      notes: [
        "Scholar Ivan Petrov studied 1,400 letters that readers sent to novelist Elsa Grunwald in the 1880s.",
        "Because Grunwald's novels are set in cities, Petrov expected most letters to come from city readers.",
        "About two-thirds of the letters came from farms and small villages.",
        "Many rural writers said the novels showed them a world they had never seen.",
        "Grunwald answered nearly every letter herself.",
        "Grunwald published eleven novels.",
      ],
      need: ["city readers", "two-thirds"],
      key: "Petrov expected most of the letters to come from city readers, but about two-thirds came from farms and small villages.",
      resultMethod: "Of the 1,400 letters that readers sent to Grunwald in the 1880s, about two-thirds came from farms and small villages.",
      expectationMethod: "Because Grunwald's novels are set in cities, Petrov expected most of her 1,400 letters to have come from city readers.",
      resultOther: "While about two-thirds of the 1,400 letters came from farms and small villages, Grunwald answered nearly every one herself.",
    },
    {
      scene: "eoi-exp-sand-notebooks",
      allow: ["according", "winning", "prize-winning"],
      goal: "emphasize how Kimani's findings differed from what she expected",
      notes: [
        "Biographer Ruth Kimani studied the laboratory notebooks that chemist Henrik Sand kept from 1904 to 1920; Sand won a major prize in 1921.",
        "Kimani expected the notebooks to show that Sand worked mostly alone.",
        "The notebooks credit 23 assistants and students by name.",
        "Several entries are written in handwriting other than Sand's.",
      ],
      need: ["worked mostly alone", "23 assistants"],
      key: "Kimani expected Sand's notebooks to show that he worked mostly alone, yet they credit 23 assistants and students by name.",
      resultMethod: "According to Kimani, the notebooks that Sand kept from 1904 to 1920 credit 23 assistants and students by name.",
      expectationMethod: "Studying the notebooks that Sand kept from 1904 to 1920, Kimani expected them to show that he worked mostly alone.",
      resultOther: "Although the notebooks from 1904 to 1920 are Sand's own, several of their entries are in handwriting other than his.",
    },
  ];


  // Contrast two subjects on the feature the goal names. Every choice
  // names both subjects; `key` contrasts them on the named feature (markers
  // `featureA` and `featureB`, one per subject), `otherFeature` contrasts
  // them on a different feature (often in the goal's own words: where the
  // finches feed, not what they eat), `mixed` gives the named feature for
  // only one subject and something else for the other, and `shared` states
  // what they have in common.
  const NAMED_FEATURE_TOPICS = [
    {
      scene: "eoi-rnf-bridge-funding",
      goal: "emphasize how the two bridges differ in the way their construction was paid for",
      notes: [
        "The Holm Bridge opened in 1936 and spans 420 meters.",
        "It was paid for with tolls collected from drivers until 1961.",
        "The Kessler Bridge opened in 1958 and spans 610 meters.",
        "It was built with a grant from the national government.",
        "Both bridges cross the Varne River.",
        "The Holm Bridge carries a railway line as well as cars.",
        "The Kessler Bridge has a separate lane for bicycles.",
      ],
      featureA: ["tolls"], featureB: ["grant"],
      key: "The Holm Bridge was paid for with tolls from drivers, whereas the Kessler Bridge was built with a national government grant.",
      otherFeature: "Construction gave the Holm Bridge a span of 420 meters, whereas it gave the Kessler Bridge a span of 610 meters.",
      allow: ["construction", "gave"],
      mixed: "The Holm Bridge was paid for with tolls collected from drivers, whereas the Kessler Bridge has a separate lane for bicycles.",
      shared: "Both the Holm Bridge, which opened in 1936, and the Kessler Bridge, which opened in 1958, cross the Varne River.",
    },
    {
      scene: "eoi-rnf-finch-diets",
      goal: "emphasize how the two finches differ in what they eat",
      notes: [
        "The Arlen finch lives in the pine forests of the Tarn Mountains.",
        "It feeds almost entirely on pine seeds, which it pries from cones with its crossed bill.",
        "The Varne finch lives in the coastal scrub below the same mountains.",
        "It feeds mainly on insects, which it catches in flight.",
        "Both species build cup-shaped nests of moss and grass.",
        "The Arlen finch weighs about 40 grams.",
        "The Varne finch weighs about 15 grams.",
      ],
      featureA: ["pine seeds"], featureB: ["insects"],
      key: "The Arlen finch feeds almost entirely on pine seeds, while the Varne finch feeds mainly on insects that it catches in flight.",
      otherFeature: "The Arlen finch feeds in the pine forests of the Tarn Mountains, while the Varne finch feeds in the coastal scrub below them.",
      mixed: "The Arlen finch feeds almost entirely on pine seeds, while the Varne finch lives in the coastal scrub below the Tarn Mountains.",
      shared: "Both the Arlen finch of the pine forests and the Varne finch of the coastal scrub build cup-shaped nests of moss and grass.",
    },
    {
      scene: "eoi-rnf-orchestra-venues",
      goal: "emphasize how the two orchestras differ in where they perform",
      notes: [
        "The Ostby Chamber Orchestra was founded in 1987 and has 24 musicians.",
        "It performs mostly in churches and school gymnasiums in small towns.",
        "The Varne Philharmonic was founded in 1921 and has 96 musicians.",
        "It performs almost entirely in the city's concert hall.",
        "Both orchestras commission at least one new piece each year.",
        "The Ostby Chamber Orchestra tours for six weeks every spring.",
      ],
      featureA: ["churches"], featureB: ["concert hall"],
      key: "The Ostby Chamber Orchestra performs mostly in small-town churches and gymnasiums, while the Varne Philharmonic plays in a concert hall.",
      otherFeature: "The Ostby Chamber Orchestra performs with 24 musicians, while the Varne Philharmonic, founded in 1921, performs with 96.",
      mixed: "The Ostby Chamber Orchestra performs mostly in small-town churches and gymnasiums, while the Varne Philharmonic was founded in 1921.",
      shared: "Both the Ostby Chamber Orchestra, which tours for six weeks every spring, and the Varne Philharmonic commission at least one new piece each year.",
      allow: ["small-town", "plays"],
    },
    {
      scene: "eoi-rnf-library-selection",
      goal: "emphasize how the two libraries differ in the way new books are chosen",
      notes: [
        "The Kell Public Library has about 60,000 books.",
        "Its librarians choose new books based on requests from patrons.",
        "The Brisk Public Library has about 45,000 books.",
        "A committee of local teachers chooses its new books.",
        "Both libraries are open seven days a week.",
        "The Kell library opened a children's wing in 2019.",
        "The Brisk library is housed in a former train station.",
        "The Brisk library lends laptops as well as books.",
      ],
      featureA: ["requests"], featureB: ["committee"],
      key: "At the Kell Public Library, librarians choose new books based on patrons' requests, whereas a committee of teachers chooses them at Brisk.",
      otherFeature: "The Kell Public Library holds about 60,000 books, whereas the Brisk Public Library, housed in a former train station, holds about 45,000.",
      mixed: "At the Kell Public Library, librarians choose new books based on patrons' requests, whereas the Brisk library is housed in a former train station.",
      shared: "Both the Kell Public Library, with about 60,000 books, and the Brisk Public Library, with about 45,000, are open seven days a week.",
      allow: ["holds"],
    },
    {
      scene: "eoi-rnf-farm-pests",
      goal: "emphasize how the two farms differ in the way they control insect pests",
      notes: [
        "The Ruiz farm grows tomatoes and peppers on 12 hectares.",
        "It controls insect pests by releasing ladybugs and lacewings that eat them.",
        "The Okafor farm grows tomatoes and squash on 20 hectares.",
        "It controls insect pests by covering young plants with fine netting.",
        "Both farms sell most of their produce at the Ostby market.",
        "The Ruiz farm has been organic since 2008.",
        "The Okafor farm switched to organic methods in 2016.",
      ],
      featureA: ["ladybugs"], featureB: ["netting"],
      key: "The Ruiz farm releases ladybugs and lacewings to eat pests, whereas the Okafor farm protects young plants with fine netting.",
      otherFeature: "The Ruiz farm has been organic since 2008, whereas the Okafor farm, which covers 20 hectares, switched to organic methods in 2016.",
      mixed: "The Ruiz farm releases ladybugs and lacewings to eat insect pests, whereas the Okafor farm grows tomatoes and squash on 20 hectares.",
      shared: "Both the Ruiz farm, which grows peppers, and the Okafor farm, which grows squash, sell most of their produce at the Ostby market.",
      allow: ["protects", "covers"],
    },
    {
      scene: "eoi-rnf-poets-methods",
      goal: "emphasize how the two poets differ in the way they compose their poems",
      notes: [
        "The poet Hana Moll published her first collection in 1994.",
        "She drafts every poem by hand in notebooks, sometimes over several years.",
        "The poet Leo Aberg published his first collection in 2011.",
        "He composes his poems aloud, recording himself on his phone while walking.",
        "Both poets have won the Varden Prize for poetry.",
        "Moll's collections are known for their long, winding lines.",
        "Aberg's poems rarely run longer than twelve lines.",
      ],
      featureA: ["by hand"], featureB: ["aloud"],
      key: "Hana Moll drafts every poem by hand in notebooks, whereas Leo Aberg composes his poems aloud, recording himself while he walks.",
      otherFeature: "Hana Moll's collections are known for their long, winding lines, whereas Leo Aberg's poems rarely run longer than twelve lines.",
      mixed: "Hana Moll drafts every poem by hand in notebooks, whereas Leo Aberg published his first collection of poems in 2011.",
      shared: "Both Hana Moll, who published her first collection in 1994, and Leo Aberg have won the Varden Prize for poetry.",
      allow: ["walks"],
    },
    {
      scene: "eoi-rnf-ferry-power",
      goal: "emphasize how the two ferries differ in what powers them",
      notes: [
        "The ferry Kestrel began carrying passengers across Holm Bay in 1998.",
        "It runs on diesel fuel.",
        "The ferry Tern began service on the same route in 2022.",
        "It runs on batteries that are recharged at each dock.",
        "Both ferries make the crossing in about 25 minutes.",
        "The Kestrel can carry 40 cars.",
        "The Tern can carry 60 cars.",
      ],
      featureA: ["diesel"], featureB: ["batteries"],
      key: "The Kestrel runs on diesel fuel, while the Tern, which began service in 2022, runs on batteries recharged at each dock.",
      otherFeature: "The Kestrel, which began service in 1998, can carry 40 cars, while the Tern, which began service in 2022, can carry 60 cars.",
      mixed: "The Kestrel runs on diesel fuel, while the Tern, which can carry 60 cars, began service on the same route in 2022.",
      shared: "Both the Kestrel and the Tern, which serve the same route across Holm Bay, make the crossing in about 25 minutes.",
      allow: ["serve"],
    },
    {
      scene: "eoi-rnf-festival-performers",
      goal: "emphasize how the two festivals differ in the way performers are selected",
      notes: [
        "The Ostby Folk Festival began in 1979 and lasts three days.",
        "Its performers are chosen by audition from musicians who live in the region.",
        "The Harbor Jazz Festival began in 2004 and lasts one weekend.",
        "Its performers are invited by a director who books touring bands from around the world.",
        "Both festivals take place in July.",
        "The Ostby Folk Festival is free to attend.",
        "Tickets to the Harbor Jazz Festival cost $40 a day.",
      ],
      featureA: ["audition"], featureB: ["invite"],
      key: "The Ostby Folk Festival chooses performers by audition from local musicians, whereas the Harbor Jazz Festival's director invites touring bands.",
      otherFeature: "The Ostby Folk Festival is free to attend, whereas tickets to the Harbor Jazz Festival, which began in 2004, cost $40 a day.",
      mixed: "The Ostby Folk Festival chooses its performers by audition from the region's musicians, whereas the Harbor Jazz Festival began in 2004 and lasts one weekend.",
      shared: "Both the Ostby Folk Festival, which began in 1979, and the Harbor Jazz Festival, which began in 2004, take place in July.",
      allow: ["chooses", "local"],
    },
    {
      scene: "eoi-rnf-rent-studies",
      goal: "emphasize how the two studies differ in the kind of evidence they relied on",
      notes: [
        "Economist Lena Varga studied how rising rents affect small businesses.",
        "She analyzed tax records from 4,000 shops in the city of Harlow.",
        "Economist Omar Diallo studied the same question.",
        "He interviewed the owners of 60 shops in the town of Kell.",
        "Both economists concluded that rising rents push out older family businesses first.",
        "Varga's study was published in 2019.",
        "Diallo's study was published in 2021.",
      ],
      featureA: ["tax records"], featureB: ["interviewed"],
      key: "Varga analyzed tax records from 4,000 shops in the city of Harlow, whereas Diallo interviewed the owners of 60 shops in the town of Kell.",
      otherFeature: "Varga's evidence on rising rents was published in 2019, whereas Diallo's evidence on the same question was published in 2021.",
      allow: ["evidence"],
      mixed: "Varga analyzed tax records from 4,000 shops in Harlow, whereas Diallo's study of rising rents was published in 2021.",
      shared: "Both Varga, who studied shops in Harlow, and Diallo, who studied shops in Kell, concluded that rising rents push out older family businesses first.",
    },
    {
      scene: "eoi-rnf-sculpture-materials",
      goal: "emphasize how the two sculptures differ in the materials they are made of",
      notes: [
        "Ada Brenn's sculpture Heron stands at the entrance to the Kell harbor.",
        "It is made of aluminum.",
        "Rafael Soto's sculpture Tide stands in the town square of Brisk.",
        "It is carved from a single block of granite.",
        "Both sculptures were commissioned for the region's 1999 arts festival.",
        "Heron is 6 meters tall.",
        "Tide weighs about 9 tonnes.",
      ],
      featureA: ["aluminum"], featureB: ["granite"],
      key: "Ada Brenn's Heron is made of aluminum, whereas Rafael Soto's Tide is carved from a single block of granite.",
      otherFeature: "Ada Brenn's Heron stands at the entrance to the Kell harbor, whereas Rafael Soto's Tide stands in the town square of Brisk.",
      mixed: "Ada Brenn's Heron is made of aluminum, whereas Rafael Soto's Tide stands in the town square of Brisk.",
      shared: "Both Ada Brenn's Heron and Rafael Soto's Tide were commissioned for the region's 1999 arts festival.",
    },
    {
      scene: "eoi-rnf-school-days",
      goal: "emphasize how the two schools differ in how many days of classes they hold each year",
      notes: [
        "Birch Academy holds classes 180 days a year.",
        "Its school year runs from September to June.",
        "Linden School holds classes 210 days a year.",
        "Its year is divided into four terms with three-week breaks between them.",
        "Both schools enroll about 400 students.",
        "Birch Academy was founded in 1962.",
        "Linden School was founded in 2005.",
      ],
      featureA: ["180"], featureB: ["210"],
      key: "Birch Academy, whose school year runs from September to June, holds classes 180 days a year, whereas Linden School holds classes 210 days a year.",
      otherFeature: "Birch Academy holds classes in a school year that runs from September to June, whereas Linden School divides its year into four terms.",
      allow: ["divides"],
      mixed: "Birch Academy holds classes 180 days a year, whereas Linden School, which enrolls about 400 students, was founded in 2005.",
      shared: "Both Birch Academy, founded in 1962, and Linden School, founded in 2005, enroll about 400 students.",
    },
    {
      scene: "eoi-rnf-dam-purposes",
      goal: "emphasize how the two dams differ in the purpose they were built for",
      notes: [
        "The Harlow Dam was completed in 1952 on the Varne River.",
        "It was built to generate electricity for the region's factories.",
        "The Kessel Dam was completed in 1967 on the Tarn River.",
        "It was built to hold back spring floods that had damaged farms downstream.",
        "Both dams are made of concrete.",
        "The Harlow Dam is 85 meters tall.",
        "The Kessel Dam is 40 meters tall.",
      ],
      featureA: ["electricity"], featureB: ["floods"],
      key: "The Harlow Dam was built to generate electricity for factories, whereas the Kessel Dam was built to hold back spring floods.",
      otherFeature: "The Harlow Dam was built 85 meters tall on the Varne River, whereas the Kessel Dam was built 40 meters tall on the Tarn River.",
      mixed: "The Harlow Dam was built to generate electricity for factories, whereas the Kessel Dam is 40 meters tall.",
      shared: "Both the Harlow Dam on the Varne River and the Kessel Dam on the Tarn River are made of concrete.",
    },
  ];

  // Show how large a difference is. Every choice names both subjects;
  // `key` gives both values of the measure the goal names (`values`),
  // `direction` says which is greater without saying by how much, `otherSize`
  // gives both values of a different measure, and `oneValue` gives the named
  // measure for only one subject. A ratio ("four times") appears in some keys
  // and some other-measure choices, so it never marks the key.
  const DIFFERENCE_SIZE_TOPICS = [
    {
      scene: "eoi-rsz-rask-rainfall",
      goal: "emphasize the size of the difference in yearly rainfall between the two towns",
      notes: [
        "The town of Rask receives about 2,400 millimeters of rain a year.",
        "Most of it falls between October and March.",
        "The town of Ostby, 60 kilometers to the east, receives about 600 millimeters a year.",
        "Ostby lies in the rain shadow of the Tarn Mountains.",
        "Both towns grow barley on nearby farms.",
        "Rask's average July temperature is 16°C.",
        "Ostby's average July temperature is 21°C.",
      ],
      values: ["2,400", "600"],
      key: "Rask receives about 2,400 millimeters of rain a year, while Ostby, 60 kilometers to the east, receives about 600.",
      direction: "Rask, where most of the rain falls between October and March, is a wetter town than Ostby, which lies in a rain shadow.",
      otherSize: "Rask's average July temperature is 16°C, five degrees cooler than the 21°C average in Ostby.",
      oneValue: "Rask receives about 2,400 millimeters of rain a year, while Ostby lies in the rain shadow of the Tarn Mountains.",
      allow: ["times", "wetter", "fall", "degrees", "cooler"],
    },
    {
      scene: "eoi-rsz-bridge-spans",
      goal: "emphasize the size of the difference between the lengths of the two bridges' main spans",
      notes: [
        "The main span of the Ostby Bridge is 900 meters long.",
        "The Ostby Bridge opened in 1998.",
        "The main span of the older Varne Bridge is 150 meters long.",
        "The Varne Bridge opened in 1921.",
        "Both bridges carry four lanes of traffic.",
        "The Varne Bridge was built mostly by hand.",
      ],
      values: ["900", "150"],
      key: "The Ostby Bridge's 900-meter main span is six times as long as the 150-meter main span of the Varne Bridge.",
      direction: "The main span of the Ostby Bridge, which opened in 1998, is longer than that of the Varne Bridge, which opened in 1921.",
      otherSize: "The Ostby Bridge opened in 1998, nearly eighty years after the Varne Bridge, which was built mostly by hand, opened in 1921.",
      oneValue: "The Ostby Bridge has a main span 900 meters long, while the Varne Bridge was built mostly by hand.",
      allow: ["times", "longer", "nearly", "eighty"],
    },
    {
      scene: "eoi-rsz-museum-attendance",
      goal: "emphasize how much the number of visitors to the museum changed after the renovation",
      notes: [
        "The Varden Museum closed for two years for a renovation and reopened in 2019.",
        "In the year before it closed, it drew about 40,000 visitors.",
        "In its first year after reopening, it drew about 160,000 visitors.",
        "Before the renovation, the museum was open 30 hours a week.",
        "Since reopening, it has been open 56 hours a week.",
        "The renovation added a glass roof over the central courtyard.",
        "The museum's collection includes 12,000 objects.",
      ],
      values: ["40,000", "160,000"],
      key: "The Varden Museum drew about 160,000 visitors in its first year after reopening, four times the 40,000 it drew the year before it closed.",
      direction: "The Varden Museum drew more visitors in its first year after reopening than it had in the year before it closed for renovation.",
      otherSize: "Before its renovation, the Varden Museum was open 30 hours a week; since reopening, it has been open 56 hours a week.",
      oneValue: "The Varden Museum, which closed for two years for a renovation, drew about 160,000 visitors in its first year after reopening.",
      allow: ["people", "times"],
    },
    {
      scene: "eoi-rsz-marsh-species",
      goal: "emphasize how much the number of breeding bird species in the marsh increased between the two surveys",
      notes: [
        "Harlow Marsh was drained for farmland in the 1950s and restored beginning in 1998.",
        "A 2004 survey found 32 species of breeding birds in the marsh.",
        "A 2022 survey found 71 species of breeding birds in the marsh.",
        "Both surveys were carried out by volunteers from the Harlow Bird Club.",
        "The 2004 survey took 12 days.",
        "The 2022 survey took 20 days.",
        "Beavers were reintroduced to the marsh in 2010.",
      ],
      values: ["32", "71"],
      key: "Volunteers found 32 species of breeding birds in Harlow Marsh in 2004 and 71 species in 2022, more than twice as many.",
      direction: "Volunteers found more species of breeding birds in Harlow Marsh in 2022 than they had found in 2004.",
      otherSize: "The volunteers' 2004 survey of breeding birds in Harlow Marsh took 12 days, while their 2022 survey took 20 days.",
      oneValue: "The 2022 survey of Harlow Marsh, which volunteers had also surveyed in 2004, found 71 species of breeding birds.",
      allow: ["surveyed"],
    },
    {
      scene: "eoi-rsz-hawks-tickets",
      goal: "emphasize how much the price of a ticket rose between 2010 and 2023",
      notes: [
        "In 2010, a ticket to a Harlow Hawks home game cost $12.",
        "That year, the team's games drew an average of 4,100 fans.",
        "In 2023, a ticket cost $45.",
        "That year, the team's games drew an average of 11,800 fans.",
        "The team moved to a new 15,000-seat arena in 2018.",
        "The Hawks won the league title in 2021.",
      ],
      values: ["$12", "$45"],
      key: "A ticket to a Harlow Hawks home game cost $12 in 2010 but $45 in 2023.",
      direction: "A ticket to a Harlow Hawks home game cost more in 2023, after the team moved to a new arena, than it had in 2010.",
      otherSize: "Harlow Hawks home games drew an average of 4,100 fans in 2010 and 11,800 in 2023, nearly three times as many.",
      oneValue: "A ticket to a Harlow Hawks home game cost $45 in 2023, five years after the team moved to its 15,000-seat arena.",
      allow: ["times", "nearly"],
    },
    {
      scene: "eoi-rsz-glacier-retreat",
      goal: "emphasize how much farther one glacier has retreated than the other",
      notes: [
        "Since 1950, the Kolm Glacier has retreated about 2.1 kilometers.",
        "Over the same period, the Sund Glacier has retreated about 300 meters.",
        "The Kolm Glacier faces south.",
        "The Sund Glacier lies in the shadow of a high ridge.",
        "Both glaciers are in the Tarn Mountains.",
        "The Kolm Glacier is about 9 kilometers long.",
        "The Sund Glacier is about 4 kilometers long.",
      ],
      values: ["2.1", "300"],
      key: "Since 1950, the Kolm Glacier has retreated about 2.1 kilometers, seven times the 300 meters that the Sund Glacier has retreated.",
      direction: "Since 1950, the south-facing Kolm Glacier has retreated farther than the Sund Glacier, which lies in the shadow of a high ridge.",
      otherSize: "The Kolm Glacier is about 9 kilometers long, more than twice the length of the Sund Glacier, which is about 4 kilometers long.",
      oneValue: "The Kolm Glacier has retreated about 2.1 kilometers since 1950, while the Sund Glacier lies in the shadow of a high ridge.",
      allow: ["times", "farther", "south-facing", "length"],
    },
    {
      scene: "eoi-rsz-bike-commuters",
      goal: "emphasize the size of the difference in how many workers commute by bicycle in the two cities",
      notes: [
        "In the city of Ostby, 31 percent of workers commute by bicycle.",
        "Ostby has 140 kilometers of protected bike lanes.",
        "In the city of Harlow, 4 percent of workers commute by bicycle.",
        "Harlow has 12 kilometers of protected bike lanes.",
        "Both cities have populations of about 300,000.",
        "Ostby's winters are colder than Harlow's.",
        "Harlow opened a bike-share program in 2021.",
      ],
      values: ["31 percent", "4 percent"],
      key: "About 31 percent of Ostby's workers commute by bicycle, compared with only 4 percent of Harlow's workers.",
      direction: "A larger share of workers commute by bicycle in Ostby than in Harlow, even though Ostby's winters are colder.",
      otherSize: "Ostby has 140 kilometers of protected bike lanes, more than ten times the 12 kilometers in Harlow.",
      oneValue: "About 31 percent of Ostby's workers commute by bicycle, while Harlow opened a bike-share program in 2021.",
      allow: ["compared", "larger", "share", "times"],
    },
    {
      scene: "eoi-rsz-lund-novels",
      goal: "emphasize how much more Lund's second novel sold than her first in its first year",
      notes: [
        "The novelist Pia Lund's first novel sold about 3,000 copies in its first year.",
        "It took her seven years to write.",
        "Her second novel, published four years later, sold about 90,000 copies in its first year.",
        "It took her two years to write.",
        "The second novel was adapted into a film in 2016.",
        "Both novels are set in the town where Lund grew up.",
      ],
      values: ["3,000", "90,000"],
      key: "Pia Lund's first novel sold about 3,000 copies in its first year, and her second sold about 90,000 in its first year.",
      direction: "Pia Lund's second novel, which was adapted into a film, sold more copies in its first year than her first novel did.",
      otherSize: "Pia Lund's first novel took her seven years to write, more than three times as long as the two years her second took.",
      oneValue: "Pia Lund's second novel sold about 90,000 copies in its first year and, like her first, is set in the town where she grew up.",
      allow: ["times", "thirty", "only", "long"],
    },
    {
      scene: "eoi-rsz-aurora-crossing",
      goal: "emphasize how much the steamship Aurora shortened the crossing compared with the sailing ships",
      notes: [
        "In 1842, the steamship Aurora began carrying mail from the port of Holm to the port of Varne.",
        "Its crossing took 16 days.",
        "The sailing ships that had carried the mail before then took about 40 days on the same route.",
        "The Aurora burned coal and carried sails as a backup.",
        "Both the Aurora and the sailing ships carried passengers as well as mail.",
        "The Aurora could carry 120 passengers.",
        "A typical sailing ship on the route carried about 30 passengers.",
      ],
      values: ["16", "40"],
      key: "The Aurora crossed from Holm to Varne in 16 days, less than half the 40 days that the sailing ships had needed.",
      direction: "The steamship Aurora, which burned coal, made the crossing from Holm to Varne faster than the sailing ships had.",
      otherSize: "The Aurora could carry 120 passengers, four times as many as a typical sailing ship on the route from Holm to Varne.",
      oneValue: "The Aurora crossed from Holm to Varne in 16 days and, like the sailing ships, carried passengers as well as mail.",
      allow: ["crossed", "needed", "faster", "times", "less", "made"],
    },
    {
      scene: "eoi-rsz-watershed-cost",
      goal: "emphasize how much less one option would cost than the other",
      notes: [
        "The town of Kell must upgrade its water supply to meet new standards.",
        "Building a new filtration plant would cost about $60 million.",
        "Protecting the forested watershed that feeds Kell's reservoir would cost about $9 million.",
        "Both options would keep the town's water safe to drink.",
        "The filtration plant would take four years to build.",
        "Protecting the watershed would take about ten years.",
        "Kell has about 25,000 residents.",
      ],
      values: ["$60 million", "$9 million"],
      key: "Protecting the watershed would cost Kell about $9 million, compared with about $60 million for a new filtration plant.",
      direction: "Protecting the forested watershed would cost Kell less than building a new filtration plant would.",
      otherSize: "A new filtration plant would take Kell four years to build, whereas protecting the watershed would take about ten years.",
      oneValue: "A new filtration plant would cost Kell about $60 million, and protecting the watershed would also keep the water safe.",
      allow: ["compared", "less"],
    },
    {
      scene: "eoi-rsz-mayor-margin",
      goal: "emphasize how narrow Ruud's margin of victory was",
      notes: [
        "In the 2019 election for mayor of Harlow, Ines Ruud received 18,400 votes.",
        "Her opponent, Paul Bekker, received 17,950 votes.",
        "Ruud won by 450 votes.",
        "Ruud spent about $80,000 on her campaign.",
        "Bekker spent about $210,000 on his.",
        "Turnout was 61 percent.",
        "Ruud had served on the city council for eight years.",
      ],
      values: ["18,400", "17,950"],
      key: "Ines Ruud defeated Paul Bekker by only 450 votes, 18,400 to 17,950, in Harlow's 2019 election for mayor.",
      direction: "In Harlow's 2019 election for mayor, Ines Ruud received more votes than her opponent, Paul Bekker.",
      otherSize: "In Harlow's 2019 race for mayor, Ines Ruud spent about $80,000 on her campaign, while Paul Bekker spent about $210,000.",
      oneValue: "Ines Ruud received 18,400 votes in Harlow's 2019 election for mayor, in which Paul Bekker was her opponent.",
      allow: ["defeated", "race", "only"],
    },
    {
      scene: "eoi-rsz-keld-population",
      goal: "emphasize how much the island's population declined between 1900 and 2000",
      notes: [
        "In 1900, the island of Keld had about 3,200 residents.",
        "By 2000, its population had fallen to about 400.",
        "Most of those who left moved to cities on the mainland.",
        "In 1900, about 40 fishing boats worked from Keld's harbor.",
        "By 2000, about 6 did.",
        "The island's school closed in 1971 and reopened in 2008.",
      ],
      values: ["3,200", "400"],
      key: "The population of Keld fell from about 3,200 in 1900 to about 400 in 2000, a loss of nearly nine in every ten residents.",
      direction: "The island of Keld had fewer residents in 2000 than in 1900, since many had moved to cities on the mainland.",
      otherSize: "About 40 fishing boats worked from Keld's harbor in 1900, compared with about 6 in 2000.",
      oneValue: "The island of Keld, which had about 3,200 residents in 1900, closed its school in 1971 and reopened it in 2008.",
      allow: ["loss", "fewer", "compared", "nearly"],
    },
  ];

  // Medium: stress one element of a study while noting another. Each topic's
  // notes give an aim, a method (`markers.method`), a finding
  // (`markers.finding`), and what the finding suggests (`markers.meaning`),
  // plus details no choice needs. Its four sentences all contain the
  // finding and differ in which element the main clause carries and which a
  // subordinate clause or phrase carries:
  //   fm: stresses the finding, notes the method
  //   mf: stresses the method, notes the finding
  //   fs: stresses the finding, notes what it suggests
  //   sf: stresses what it suggests, notes the finding
  // Every draw offers all four, and the goal names one pairing, so each
  // sentence is the key in a quarter of the draws.
  const STRESS_TOPICS = [
    {
      scene: "eoi-snw-whistled-speech",
      allow: ["whistled", "lifelong"],
      notes: [
        "Linguist Noor Haddad studied the whistled form of Spanish used on the island of Tamarel.",
        "She wanted to know how much of a whistled message listeners actually understand.",
        "She played 200 recorded whistled sentences to 40 islanders who had whistled since childhood.",
        "The listeners correctly repeated about 90 percent of the sentences.",
        "The finding suggests that whistled speech carries nearly as much information as spoken words.",
        "Whistled messages on Tamarel can be heard up to 3 kilometers away.",
        "Fewer than 500 people on the island still whistle fluently.",
      ],
      markers: { method: "played 200 recorded", finding: "about 90 percent", meaning: "nearly as much information" },
      sentences: {
        fm: "After Haddad played 200 recorded whistled sentences to 40 islanders, she found that they correctly repeated about 90 percent of them.",
        mf: "Haddad played 200 recorded whistled sentences to 40 islanders, who correctly repeated about 90 percent of them.",
        fs: "Listeners repeated about 90 percent of Haddad's whistled sentences correctly, suggesting whistled speech carries nearly as much information as spoken words.",
        sf: "Whistled speech may carry nearly as much information as spoken words, since listeners correctly repeated about 90 percent of Haddad's sentences.",
      },
    },
    {
      scene: "eoi-snw-owl-boxes",
      allow: ["owl"],
      notes: [
        "Ecologist Tomas Arvid studied barn owls on farms in the Lenne Valley.",
        "He wanted to know whether nest boxes for owls reduce the number of mice in farm fields.",
        "He put up nest boxes on 20 farms and counted mice in their fields for three years, comparing them with 20 farms that had no boxes.",
        "Fields on farms with nest boxes had about 40 percent fewer mice.",
        "The finding suggests that farmers could protect their grain without using poison.",
        "A pair of barn owls can eat more than 2,000 mice a year.",
        "Owls began nesting in most of the boxes within one season.",
      ],
      markers: { method: "counted mice", finding: "about 40 percent fewer mice", meaning: "without using poison" },
      sentences: {
        fm: "Having counted mice for three years on 20 farms with owl nest boxes, Arvid found about 40 percent fewer mice there than on farms without boxes.",
        mf: "Arvid put up owl nest boxes on 20 farms and counted mice there for three years, finding about 40 percent fewer mice than on farms without boxes.",
        fs: "Farms with owl nest boxes had about 40 percent fewer mice in their fields, which suggests that farmers could protect their grain without using poison.",
        sf: "Farmers could protect their grain without using poison, since farms with owl nest boxes had about 40 percent fewer mice in their fields.",
      },
    },
    {
      scene: "eoi-snw-kessa-anchors",
      allow: ["work", "apparently"],
      notes: [
        "Archaeologist Ines Varro studied the ancient harbor at Kessa, on the coast of the Talan Sea.",
        "She wanted to know how long the harbor had been in use.",
        "She dated the pottery found beside 60 stone anchors on the harbor floor.",
        "The oldest anchors were about 3,000 years old, a thousand years older than the town's earliest buildings.",
        "The finding suggests that sailors used the harbor long before anyone settled beside it.",
        "The anchors weigh between 20 and 150 kilograms.",
        "Most of the anchors were found in water less than 5 meters deep.",
      ],
      markers: { method: "pottery found beside 60 stone anchors", finding: "about 3,000 years old", meaning: "long before anyone settled" },
      sentences: {
        fm: "By dating the pottery found beside 60 stone anchors on the harbor floor, Varro found that the oldest anchors were about 3,000 years old.",
        mf: "Varro dated the pottery found beside 60 stone anchors on the harbor floor, work that showed the oldest anchors to be about 3,000 years old.",
        fs: "The oldest of Kessa's anchors are about 3,000 years old, which suggests that sailors used the harbor long before anyone settled beside it.",
        sf: "Sailors apparently used the harbor at Kessa long before anyone settled beside it, since its oldest anchors are about 3,000 years old.",
      },
    },
    {
      scene: "eoi-snw-handwritten-notes",
      notes: [
        "Psychologist Lena Marsh studied note-taking among students at Harwell College.",
        "She wanted to know whether taking notes by hand helps students remember a lecture better than typing does.",
        "She had 120 students watch the same lecture, half taking notes by hand and half on laptops, and tested them a week later.",
        "Students who took notes by hand answered about 25 percent more questions correctly.",
        "The finding suggests that schools should be cautious about replacing notebooks with laptops.",
        "The laptop group took nearly twice as many words of notes.",
        "The lecture lasted 40 minutes.",
      ],
      markers: { method: "tested", finding: "about 25 percent more questions", meaning: "cautious about replacing notebooks" },
      sentences: {
        fm: "Having tested 120 students a week after a lecture, Marsh found that those who took notes by hand answered about 25 percent more questions correctly.",
        mf: "Marsh tested 120 students a week after a lecture, finding that those who had taken notes by hand answered about 25 percent more questions correctly.",
        fs: "Students who took notes by hand answered about 25 percent more questions correctly, which suggests that schools should be cautious about replacing notebooks.",
        sf: "Schools should be cautious about replacing notebooks with laptops, since students who took notes by hand answered about 25 percent more questions correctly.",
      },
    },
    {
      scene: "eoi-snw-bridge-sensors",
      allow: ["trial"],
      notes: [
        "Engineer Paulo Sena studied the steel footbridge over the Arn River in the city of Vessel.",
        "He wanted to know whether cheap vibration sensors could detect damage in bridges.",
        "He attached 30 sensors, each costing about $20, to the bridge and recorded its vibrations for a year.",
        "The sensors detected a cracked bolt months before inspectors found it.",
        "The finding suggests that cities could monitor small bridges at a fraction of the usual cost.",
        "The bridge carries about 8,000 pedestrians a day.",
        "Standard monitoring systems can cost more than $100,000 per bridge.",
      ],
      markers: { method: "for a year", finding: "cracked bolt", meaning: "fraction of the usual cost" },
      sentences: {
        fm: "Recording the footbridge's vibrations for a year with 30 sensors, Sena found that they detected a cracked bolt months before inspectors found it.",
        mf: "Sena recorded the footbridge's vibrations for a year with 30 sensors, a trial in which they detected a cracked bolt months before inspectors found it.",
        fs: "Sena's $20 sensors detected a cracked bolt months before inspectors found it, suggesting that cities could monitor bridges at a fraction of the usual cost.",
        sf: "Cities could monitor small bridges at a fraction of the usual cost, since Sena's $20 sensors detected a cracked bolt months before inspectors found it.",
      },
    },
    {
      scene: "eoi-snw-merrin-tea",
      allow: ["method"],
      notes: [
        "Historian Clara Ondine studied trade at the port of Merrin in the 1700s.",
        "She wanted to know where the tea that Merrin imported came from.",
        "She compared 400 ship manifests with the records of tea merchants in three other ports.",
        "Nearly half of Merrin's tea was shipped from Asker, a port farther up the coast.",
        "The finding suggests that Asker's merchants controlled more of the region's tea trade than historians had thought.",
        "Merrin imported about 90 tonnes of tea a year.",
        "Most of the ships' crews were hired in Merrin.",
      ],
      markers: { method: "compared 400 ship manifests", finding: "shipped from Asker", meaning: "than historians had thought" },
      sentences: {
        fm: "Having compared 400 ship manifests with merchants' records, Ondine found that nearly half of Merrin's tea was shipped from Asker.",
        mf: "Ondine compared 400 ship manifests with merchants' records, a method that showed nearly half of Merrin's tea was shipped from Asker.",
        fs: "Nearly half of Merrin's tea was shipped from Asker, which suggests that Asker's merchants controlled more of the tea trade than historians had thought.",
        sf: "Asker's merchants may have controlled more of the region's tea trade than historians had thought, since nearly half of Merrin's tea was shipped from Asker.",
      },
    },
    {
      scene: "eoi-snw-meteor-cameras",
      allow: ["large"],
      notes: [
        "Astronomer Rafael Ito studied meteors over the Varn Highlands.",
        "He wanted to know how often meteorites large enough to be found on the ground fall in the region.",
        "He set up 12 cameras that filmed the night sky continuously for five years.",
        "The cameras recorded 9 falls of meteorites large enough to be found on the ground.",
        "The finding suggests that such falls are about three times as common as earlier estimates held.",
        "Volunteers recovered meteorites from 4 of the falls.",
        "Each camera covers about a sixth of the sky.",
      ],
      markers: { method: "12 cameras", finding: "9 falls", meaning: "three times as common" },
      sentences: {
        fm: "Filming the night sky with 12 cameras for five years, Ito recorded 9 falls of meteorites large enough to be found on the ground.",
        mf: "Ito filmed the night sky with 12 cameras for five years, during which they recorded 9 falls of meteorites large enough to be found on the ground.",
        fs: "Ito's cameras recorded 9 falls of meteorites large enough to be found on the ground, suggesting such falls are about three times as common as estimates held.",
        sf: "Large meteorite falls may be about three times as common as earlier estimates held, since Ito's cameras recorded 9 falls in five years.",
      },
    },
    {
      scene: "eoi-snw-rice-ducks",
      allow: ["sprayed", "letting"],
      notes: [
        "Agronomist Sora Imbe studied rice farming in the Hallan Delta.",
        "She wanted to know whether ducks can take the place of herbicides in rice paddies.",
        "She let ducks swim in 15 paddies for a growing season and compared them with 15 paddies treated with herbicide.",
        "Paddies with ducks produced nearly the same amount of rice as those treated with herbicide.",
        "The finding suggests that farmers could stop spraying herbicide without losing much of their harvest.",
        "The ducks ate weeds and insects but not the rice plants.",
        "Each paddy held about 20 ducks.",
      ],
      markers: { method: "15 paddies for a growing season", finding: "nearly the same amount of rice", meaning: "without losing much" },
      sentences: {
        fm: "Letting ducks swim in 15 paddies for a growing season, Imbe found that the paddies produced nearly the same amount of rice as sprayed ones.",
        mf: "Imbe let ducks swim in 15 paddies for a growing season, paddies that produced nearly the same amount of rice as those treated with herbicide.",
        fs: "Paddies with ducks produced nearly the same amount of rice as sprayed ones, suggesting that farmers could stop spraying without losing much of their harvest.",
        sf: "Farmers could stop spraying herbicide without losing much of their harvest, since paddies with ducks produced nearly the same amount of rice as sprayed ones.",
      },
    },
    {
      scene: "eoi-snw-library-fines",
      allow: ["returns"],
      notes: [
        "Economist Aisha Varga studied the public libraries of the city of Dorran.",
        "She wanted to know whether ending overdue fines would change how many books were returned late.",
        "She compared return records from the year before and the year after Dorran's libraries stopped charging fines in 2019.",
        "The share of books returned late rose by only 2 percent.",
        "The finding suggests that fines do little to make borrowers return books on time.",
        "Borrowing by children rose by 18 percent after fines ended.",
        "Dorran's libraries lend about 900,000 items a year.",
      ],
      markers: { method: "compared return records", finding: "only 2 percent", meaning: "do little to make borrowers" },
      sentences: {
        fm: "Having compared return records before and after fines ended, Varga found that the share of books returned late rose by only 2 percent.",
        mf: "Varga compared return records before and after fines ended, finding that the share of books returned late rose by only 2 percent.",
        fs: "The share of books returned late rose by only 2 percent after fines ended, suggesting that fines do little to make borrowers return books on time.",
        sf: "Fines may do little to make borrowers return books on time, since the share of books returned late rose by only 2 percent after fines ended.",
      },
    },
    {
      scene: "eoi-snw-glacier-moss",
      allow: ["newly"],
      notes: [
        "Botanist Erik Solheim studied mosses on ground uncovered by the retreating Varn Glacier.",
        "He wanted to know whether mosses buried under ice for centuries could still grow.",
        "He placed 50 moss samples from ground the ice had uncovered within the past year in a warm growth chamber.",
        "Eleven of the samples sprouted new shoots within a month.",
        "The finding suggests that plants could recolonize ground left by glaciers faster than scientists had assumed.",
        "Radiocarbon dating showed that the mosses had been covered by ice for about 400 years.",
        "The growth chamber was kept at 17°C.",
      ],
      markers: { method: "growth chamber", finding: "sprouted new shoots", meaning: "faster than" },
      sentences: {
        fm: "Placing 50 moss samples from newly uncovered ground in a warm growth chamber, Solheim found that eleven sprouted new shoots within a month.",
        mf: "Solheim placed 50 moss samples from newly uncovered ground in a warm growth chamber, where eleven of them sprouted new shoots within a month.",
        fs: "Eleven of Solheim's moss samples sprouted new shoots within a month, suggesting that plants could recolonize ground left by glaciers faster than assumed.",
        sf: "Plants could recolonize ground left by glaciers faster than scientists had assumed, since eleven of Solheim's moss samples sprouted new shoots within a month.",
      },
    },
  ];

  // Medium: reconcile apparently conflicting findings using a denominator,
  // sampling scope, time window, or mechanism supplied in separated notes.
  const RECONCILIATION_TOPICS = [
    {
      scene: "eoi-rec-bus-ridership",
      notes: [
        "Harlow's transit office reported 10 percent more bus users in 2023 than in 2018.",
        "The office counted individual residents using passenger-card records.",
        "A census report found that the share of residents using buses fell over the same period.",
        "The census measured bus use with a travel question sent to households.",
        "Harlow's population grew by 20 percent between 2018 and 2023.",
        "Passenger cards began in 2016, after the household travel question began in 2010.",
      ],
      key: "Harlow's population grew faster than its bus-user count, allowing that count to rise while the share of residents using buses fell.",
      contrast: "Harlow's bus-user count rose between 2018 and 2023, while the census report recorded a decline in the share of residents using buses.",
      method: "Passenger cards tracked individuals and the census asked about household travel, giving Harlow two sources of information about residents' bus use.",
      detail: "Harlow's household travel question began in 2010, six years before passenger cards, so household travel answers were collected first.",
      why: "Population growth changes the denominator: a larger rider count can be a smaller share. The key connects that change to both findings, rather than merely repeating them.",
      allow: ["faster","allowing","rise","rose","decline","tracked","asked","sources","information","collected","answers"],
    },
    {
      scene: "eoi-rec-forest-surveys",
      notes: [
        "A survey found fewer mature trees in the whole Keld forest in 2024 than in 2004.",
        "Surveyors sampled plots distributed across the whole forest.",
        "The protected reserve gained about 500 mature trees over the same period.",
        "The reserve occupies one tenth of the forest; a second survey counted trees only there.",
        "Logging outside the reserve removed about 4,000 mature trees during the period.",
        "Both surveys used trunk diameter to define maturity, allowing their tree counts to be compared.",
      ],
      key: "Gains inside the protected reserve coexisted with a forest-wide loss because logging elsewhere removed more mature trees than the reserve gained.",
      contrast: "The whole-forest survey found fewer mature trees in 2024 than in 2004, whereas the protected reserve survey found more over that period.",
      method: "Both surveys defined maturity by trunk diameter, allowing their counts to be compared even though their plots were distributed across different areas.",
      detail: "The reserve occupied one tenth of the forest, so its survey covered a smaller area than the survey with plots distributed across the whole forest.",
      why: "The reserve is only part of the forest, and its gains were outweighed elsewhere. The key gives that balancing fact; merely identifying different survey areas does not show why the total fell.",
      allow: ["inside","coexisted","wide","loss","elsewhere","areas","covered","smaller","area"],
    },
    {
      scene: "eoi-elb-catalog-entries",
      notes: [
        "An archive reported more catalog entries in 2024 than in 2014.",
        "In 2014, the catalog gave each distinct play one entry, regardless of how often it had been reprinted.",
        "A historian reported that the archive held the same number of distinct plays in both years.",
        "The historian matched plays by title and author in the database.",
        "In 2024, each reprinting had a separate catalog entry.",
        "No additional plays were acquired between 2014 and 2024; matching title and author identified reprintings of a single play.",
      ],
      key: "Separate entries for reprintings increased the catalog's entry count without adding distinct plays, so both reports can describe the same archive.",
      contrast: "The archive reported a rise in catalog entries from 2014 to 2024, while the historian reported no change in the number of distinct plays.",
      method: "Matching titles and authors let the historian identify reprintings of a single play, providing a way to count distinct plays in the database.",
      detail: "The archive acquired no additional plays between 2014 and 2024, so the historian could examine the same set of plays across both catalog years.",
      why: "The counting unit changed for entries but not for distinct plays. The key states what produced more entries without more plays; the contrast alone leaves that mechanism unexplained.",
      allow: ["increased","count","without","adding","rise","change","let","providing","way","examine","set","across"],
    },
    {
      scene: "eoi-rec-museum-hours",
      notes: [
        "The Varden Museum reported higher annual attendance in 2023 than in 2022.",
        "The annual report totaled every admission in each calendar year.",
        "An auditor found 5,000 fewer admissions during the original opening hours in 2023.",
        "The auditor matched hours to exclude attendance during any added hours.",
        "In 2023, new evening hours attracted 20,000 admissions.",
        "The original hours remained unchanged; both reports used the museum's ticket records.",
      ],
      key: "Admissions during the added evenings outweighed the decline during the original hours, so annual attendance rose despite the auditor's finding.",
      contrast: "Museum attendance increased in 2023 according to the annual report, while admissions during the original opening hours declined according to the auditor.",
      method: "The auditor matched original opening hours to exclude admissions during added hours, while the annual report included every admission in each year.",
      detail: "Because the original hours remained unchanged, the auditor could match those hours across both years using the museum's ticket records.",
      why: "The key supplies the offsetting attendance outside the auditor's time window. Mentioning different windows or repeating the opposing findings does not itself explain the net increase.",
      allow: ["evenings","outweighed","decline","rose","despite","increased","declined","across"],
    },
    {
      scene: "eoi-rec-crop-harvest",
      notes: [
        "The Kell cooperative reported a larger total wheat harvest in 2024 than in 2023.",
        "The cooperative weighed wheat delivered by every member farm.",
        "An agronomist reported 10 percent less wheat harvested per hectare in 2024.",
        "The agronomist divided the total harvest weights by hectares planted to compare harvests per hectare.",
        "The planted area increased by 25 percent in 2024.",
        "Both reports covered the same farms and used the weights recorded when wheat arrived at the cooperative's warehouses.",
      ],
      key: "The additional hectares produced enough wheat to outweigh lower harvests per hectare, allowing the cooperative's total harvest to increase.",
      contrast: "The cooperative reported a larger total wheat harvest in 2024, while the agronomist reported less wheat harvested per hectare that year.",
      method: "Dividing total harvest weights by planted hectares allowed the agronomist to compare output per hectare rather than the weight of all wheat delivered.",
      detail: "The cooperative recorded wheat weights at its warehouses, giving both reports a record of deliveries from the same farms in both years.",
      why: "The planted area is the missing multiplier. The key explains how more hectares outweighed lower output on each hectare; the contrast option states the puzzle without resolving it.",
      allow: ["additional","produced","enough","outweigh","lower","allowing","allowed","output","deliveries"],
    },
    {
      scene: "eoi-rec-wages-prices",
      notes: [
        "A factory's payroll office reported that the average hourly wage rose 10 percent between 2020 and 2024.",
        "The office compared money paid per hour in each year.",
        "An economist reported that the average hourly wage bought fewer goods in 2024.",
        "The economist priced a fixed basket of goods to compare what hourly wages could buy.",
        "That basket's price rose 25 percent between 2020 and 2024.",
        "Both reports used the same payroll records and covered the same workers.",
      ],
      key: "Prices rose faster than hourly wages, so workers received more money per hour while that money bought less of the fixed basket of goods.",
      contrast: "The payroll office reported higher average hourly wages in 2024, while the economist reported that an average hourly wage bought fewer goods.",
      method: "Pricing a fixed basket let the economist compare what wages could buy, while the payroll office compared the money paid for an hour's work.",
      detail: "Using the same factory payroll records gave both reports information about the same workers' hourly wages, rather than wages from different factories.",
      why: "The key relates the two rates of growth. Describing the money and purchasing-power measures without saying which grew faster does not explain their opposing directions.",
      allow: ["faster","received","less","higher","let","work","information"],
    },
    {
      scene: "eoi-rec-battery-tests",
      notes: [
        "The Varn laboratory found that new battery A held 120 units of charge and new battery B held 100.",
        "Both batteries were tested with the same instrument model.",
        "A workshop found that B held more charge than A after five hundred charging cycles.",
        "Using the same temperature prevented temperature differences from affecting the comparison.",
        "After five hundred cycles, A retained 60 percent of its initial capacity and B retained 90 percent.",
        "Both batteries were the same size and were tested at the same temperature.",
      ],
      key: "Battery A's initially greater capacity fell below B's as it lost capacity faster with use, so the two tests describe different stages.",
      contrast: "The laboratory found more charge in battery A than B, while the workshop found more charge in battery B than A in its test.",
      method: "Testing both batteries at the same temperature prevented temperature differences from affecting their comparison, which also used the same instrument model.",
      detail: "The laboratory measured the batteries when new, establishing their initial capacities before the workshop measured them after repeated charging cycles.",
      why: "The key explains the reversal over time through unequal capacity loss. Merely labeling tests new and used does not explain why the ordering reversed.",
      allow: ["greater","fell","below","lost","faster","stages","measured","establishing","repeated"],
    },
    {
      scene: "eoi-rec-cohort-scores",
      notes: [
        "The Talan language course reported that its returning learners improved between the first and second terms.",
        "The first term had 20 learners, whose mean test score was 60 out of 100.",
        "An evaluator reported that the mean score for the whole course fell in the second term.",
        "All 20 learners returned and scored a mean of 80 in the second term.",
        "The second term also included 80 new beginners, whose mean score was 20.",
        "Everyone took the same test, allowing scores to be compared across terms; the whole-course mean included every learner.",
      ],
      key: "Returning learners improved, but the many new beginners lowered the course-wide average because their scores were below the returning group's.",
      contrast: "The course reported improved scores among returning learners in the second term, while the evaluator reported a lower whole-course mean score.",
      method: "Everyone took the same test, allowing scores from the first and second terms to be compared without using different tests for the two groups.",
      detail: "The 20 returning learners and 80 new beginners made 100 learners in the second term, all of whom were included in the whole-course mean score.",
      why: "The returning group rose from 60 to 80, but it was only one fifth of the second-term cohort. The 80 beginners averaging 20 brought the whole-course mean to 32, below the first-term 60. The key reconciles within-group improvement with the changed group composition.",
      allow: ["lowered","wide","average","below","group's","lower","without","groups"],
    },
    {
      scene: "eoi-rec-pollinator-visits",
      notes: [
        "A garden's cameras recorded more bee visits in June than in May.",
        "Each arrival at a flower counted as a separate visit, even if the same bee returned.",
        "A marking study counted 50 individual bees in May and 30 in June.",
        "Marks on the bees' bodies allowed researchers to recognize returning individuals.",
        "Each bee averaged four visits during the observation hours in May and ten in June.",
        "Both studies observed the same garden during the same hours in each month.",
      ],
      key: "Each bee made enough additional visits in June to outweigh the smaller number of individual bees, allowing the total visit count to rise.",
      contrast: "The camera survey counted more bee visits in June than in May, while the marking study counted fewer individual bees over the same months.",
      method: "Marks on the bees' bodies allowed researchers to recognize returning individuals, while cameras counted each arrival even if the same bee returned.",
      detail: "Both studies observed the same garden during the same hours, allowing their records to cover the same periods even though they counted different things.",
      why: "The key connects visit frequency per bee with the smaller bee population. A comparison of arrival counting and body marking alone does not explain the increase in total visits.",
      allow: ["enough","additional","outweigh","smaller","total","rise","survey","fewer","cover","periods","things"],
    },
    {
      scene: "eoi-rec-response-times",
      notes: [
        "A library's average response time increased after a catalog update.",
        "Staff calculated the average by adding response times and dividing by the number of requests.",
        "An auditor found that the middle time in the ordered list of response times decreased.",
        "After the update, 60 percent of requests took less than a day, compared with 40 percent before it.",
        "Two requests took a month after the update; none had taken more than a week before it.",
        "Both reports covered the same 100 requests in each period.",
      ],
      key: "A few unusually long delays raised the average while a larger share of requests took less than a day and the middle response time fell.",
      contrast: "The library's average response time increased after the update, while the auditor found a decrease in the middle response time for those requests.",
      method: "Staff averaged response times by adding them and dividing by the number of requests; the auditor located the middle ordered value.",
      detail: "Both reports used the same requests, so their difference did not arise from using separate sets of requests before and after the catalog update.",
      why: "The key identifies how the distribution changed: a long tail moves the average upward even as the middle falls. It explains the discrepancy rather than just defining the measures.",
      allow: ["few","unusually","long","delays","raised","became","faster","allowed","locate","value","arise","separate","sets","larger","share","fell"],
    },
    {
      scene: "eoi-rec-noise-measures",
      notes: [
        "A station's highest noise level rose after a timetable change.",
        "The operator measured the loudest train passage each day.",
        "Residents reported that total daily sound exposure fell after the change.",
        "Their instruments accumulated exposure over the whole day.",
        "Train passages fell from twenty to ten a day, while exposure from each passage increased by 50 percent.",
        "Both reports used calibrated instruments at the same distance from the tracks to avoid differences caused by instrument placement.",
      ],
      key: "Fewer passages more than offset the extra exposure from louder trains, so daily sound exposure fell even though the highest level rose.",
      contrast: "The station's highest noise level rose after the timetable change, while residents reported a decline in its total daily sound exposure.",
      method: "The operator recorded the loudest passage to measure the highest level, while residents accumulated exposure to measure the whole day's sound.",
      detail: "Placing calibrated instruments at the same distance from the tracks prevented instrument placement from explaining the difference between the two reports.",
      why: "The key balances fewer events against louder individual events. A statement that one instrument measured peaks and another accumulated exposure leaves the opposing trends unexplained.",
      allow: ["Fewer","offset","extra","louder","decline","recorded","Placing","prevented","explaining"],
    },
    {
      scene: "eoi-arg-shade-coffee",
      notes: [
        "Adding shade increased coffee sweetness in trials on the warm Sollano plateau.",
        "Both research teams used the same coffee variety and sweetness instrument to make their trials comparable.",
        "Adding shade decreased sweetness in separate trials on the cold Keld plateau.",
        "Coffee beans develop more sugar while ripening, but development stops when they are picked.",
        "Shade extended ripening by three weeks on both plateaus; only Keld's extended period crossed the first frost date.",
        "Keld growers had to pick berries at the first frost whether ripe or not.",
      ],
      key: "Slower ripening allowed sugar to develop in warm Sollano but delayed Keld's berries past the frost, making the same shade treatment have opposite effects.",
      contrast: "Adding shade increased sweetness in the Sollano trials, while it decreased sweetness in the Keld trials conducted with the same coffee variety.",
      method: "Using the same coffee variety and sweetness instrument made the teams' measurements comparable despite their trials taking place on different plateaus.",
      detail: "Sugar development stopped when berries were picked, so Keld's rule requiring harvest at the first frost limited the time available for ripening.",
      why: "The key links the shared mechanism to different starting conditions. It explains the direction of each result, instead of merely contrasting them or pointing to comparable methods.",
      allow: ["Slower","allowed","delayed","past","treatment","opposite","effects","conducted","measurements","despite","taking","place","stopped","rule","requiring","harvest","limited","time","available"],
    },
  ];

  /* =================================================================== */
  /* Rhetorical Synthesis machinery                                       */
  /* =================================================================== */

  const NOTES_INTRO = "While researching a topic, a student has taken the following notes:";
  const SYNTHESIS_QUESTION = "Which choice most effectively uses relevant information from the notes to accomplish this goal?";

  const has = (text, marker) => lc(text).includes(lc(marker));
  const lacksOne = (text, markers) => markers.some((marker) => !has(text, marker));
  const numbers = (text) => String(text).match(/\d+(?:[.,]\d+)*/g) || [];
  const NUMBER_WORDS = /\b(two|three|four|five|six|seven|eight|nine|ten|twice|thirty)\b/gi;

  // This lexical guard catches unfamiliar numbers and words. It cannot prove
  // semantic grounding: authors must also check attribution, quantities,
  // scope, and relationships in every choice against the notes.
  function grounded(topic, choices) {
    const source = topic.notes.join(" ");
    return choices.every((choice) => numbers(choice).every((value) => source.includes(value)) &&
      ungroundedWords(source, choice, topic.allow).length === 0);
  }

  function notesStimulus(notes) {
    return { type: "notes", content: `${NOTES_INTRO}\n\n${notes.map((note) => `• ${note}`).join("\n")}` };
  }

  // One Rhetorical Synthesis template. `spec.choices(topic, variant)`
  // returns { key, wrong: [[text, reason], ...] }; `spec.check(topic,
  // choices, variant)` is the miswiring test verify() runs on top of the
  // shared checks. A template whose goal varies over one fixed set of
  // choices lists `spec.variants`; each draw picks one, and the goal, the
  // choices and the check all read it, so the same four sentences can have
  // different keys.
  function synthesisFamily(spec) {
    return {
      id: spec.id,
      sectionKey: SECTION,
      domain: DOMAIN,
      skill: "Rhetorical Synthesis",
      subskill: spec.subskill,
      difficulty: spec.difficulty,
      title: spec.title,
      recognize: spec.recognize,
      rubric: spec.rubric,
      tricks: spec.tricks,
      // The topic bank, for tooling that audits grounding scene by scene.
      topics: spec.topics,
      build(t) {
        const topic = t.pick(spec.topics);
        const variant = spec.variants ? t.pick(spec.variants(topic)) : undefined;
        const choices = spec.choices(topic, variant);
        const instance = {
          responseType: "multiple-choice",
          scene: topic.scene,
          stimulus: notesStimulus(topic.notes),
          stem: `The student wants to ${spec.goal(topic, variant)}. ${SYNTHESIS_QUESTION}`,
          correct: choices.key,
          wrong: choices.wrong,
          explanation: spec.explain(topic, variant),
          steps: spec.steps,
          principles: spec.principles,
          trap: spec.trap,
          hint: spec.hint,
          estimatedSeconds: spec.seconds,
        };
        // Checks what is actually offered, so a key swapped with a
        // distractor (in the data or here) fails.
        instance.verify = () => {
          const offered = { key: instance.correct, wrong: instance.wrong };
          const all = [offered.key, ...offered.wrong.map(([text]) => text)];
          return (
            spec.topics.includes(topic) &&
            topic.scene.startsWith("eoi-") &&
            offered.wrong.length === 3 &&
            new Set(all).size === 4 &&
            grounded(topic, all) &&
            spec.check(topic, offered, variant)
          );
        };
        return instance;
      },
    };
  }

  // The facts a goal needs appear in the notes and in the key, and every
  // distractor lacks at least one of them.
  function needCheck(topic, choices) {
    return (
      topic.need.every((marker) => has(topic.notes.join(" "), marker)) &&
      topic.need.every((marker) => has(choices.key, marker)) &&
      choices.wrong.every(([text]) => lacksOne(text, topic.need))
    );
  }

  const SYNTHESIS_PRINCIPLES = [
    "A choice must be accurate to the notes and accomplish the stated goal; an accurate detail alone may miss that goal.",
    "Read the goal first, list what it requires, and test each choice against that list.",
  ];

  /* =================================================================== */
  /* Rhetorical Synthesis templates                                       */
  /* =================================================================== */

  const similarityNotes = synthesisFamily({
    id: "notes-shared-feature",
    subskill: "student notes",
    difficulty: "Easy",
    title: "Notes goal: a feature two subjects share",
    recognize: "A similarity has to name both subjects and the one feature the notes give to each; a sentence about one subject, or about how they differ, misses the goal.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["off-goal"],
    seconds: 60,
    topics: SIMILARITY_TOPICS,
    goal: (topic) => `emphasize a similarity between ${topic.pair}`,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.firstOnly, `Accurate, but it describes only ${topic.a}, so it cannot show what the two have in common.`],
        [topic.secondOnly, `Accurate, but it describes only ${topic.b}, so it cannot show what the two have in common.`],
        [topic.difference, `Accurate, but it points out how ${topic.a} and ${topic.b} differ, the opposite of the goal.`],
      ],
    }),
    check: needCheck,
    explain: (topic) =>
      `A similarity must mention both ${topic.a} and ${topic.b} and the feature the notes give to each. Only this choice does; the others describe one subject or a difference.`,
    steps: [
      "Identify the goal: a similarity between two subjects.",
      "Find the feature the notes attribute to both subjects.",
      "Choose the sentence that names both subjects and that shared feature.",
    ],
    principles: SYNTHESIS_PRINCIPLES,
    trap: "Choosing an accurate, detailed sentence about only one of the two subjects.",
    hint: "Which choice mentions both subjects and something true of each?",
  });

  const differenceNotes = synthesisFamily({
    id: "notes-contrast-two-subjects",
    subskill: "student notes",
    difficulty: "Easy",
    title: "Notes goal: how two subjects differ",
    recognize: "A difference has to name both subjects and set their contrasting features side by side; a shared feature or a fact about one subject misses the goal.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["off-goal"],
    seconds: 60,
    topics: DIFFERENCE_TOPICS,
    goal: (topic) => `emphasize a difference between ${topic.pair}`,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.firstOnly, `Accurate, but it describes only ${topic.a}, so there is nothing to contrast it with.`],
        [topic.secondOnly, `Accurate, but it describes only ${topic.b}, so there is nothing to contrast it with.`],
        [topic.similarity, `Accurate, but it states something ${topic.a} and ${topic.b} share, the opposite of the goal.`],
      ],
    }),
    check: needCheck,
    explain: (topic) =>
      `A difference must name both ${topic.a} and ${topic.b} and the contrasting features the notes give them. Only this choice does; the others describe one subject or what the two share.`,
    steps: [
      "Identify the goal: a difference between two subjects.",
      "Find the feature on which the notes describe the subjects differently.",
      "Choose the sentence that names both subjects and contrasts that feature.",
    ],
    principles: SYNTHESIS_PRINCIPLES,
    trap: "Choosing the sentence about what the two subjects share because it mentions both of them.",
    hint: "Which choice sets the two subjects against each other?",
  });

  const dateLocationNotes = synthesisFamily({
    id: "notes-date-and-place",
    subskill: "student notes",
    difficulty: "Easy",
    title: "Notes goal: when and where something happened",
    recognize: "The goal names two facts, a date and a location; only a choice with both accomplishes it.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["off-goal"],
    seconds: 55,
    topics: DATE_LOCATION_TOPICS,
    goal: (topic) => `specify the date and location of ${topic.event}`,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.dateOnly, "Accurate, but it gives only the date; the location is missing."],
        [topic.placeOnly, "Accurate, but it gives only the location; the date is missing."],
        [topic.neither, "Accurate, but it gives neither the date nor the location."],
      ],
    }),
    check: needCheck,
    explain: () =>
      "The goal asks for two facts, the date and the location. Only this choice includes both; each of the others leaves out one or both.",
    steps: [
      "Identify the two facts the goal requires: a date and a location.",
      "Check each choice for both facts.",
      "Choose the only one that includes both.",
    ],
    principles: SYNTHESIS_PRINCIPLES,
    trap: "Choosing a choice with a date (or a place) and several other details, which feels complete but lacks the other required fact.",
    hint: "Does the choice say both when and where?",
  });

  const audienceNotes = synthesisFamily({
    id: "notes-introduce-to-newcomers",
    subskill: "rhetorical goal",
    difficulty: "Medium",
    title: "Notes goal: introducing a subject to an unfamiliar audience",
    recognize: "An audience that does not know the subject must be told what it is; a choice that names it as if already known fails, however accurate.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 75,
    topics: AUDIENCE_TOPICS,
    goal: (topic) => `introduce ${topic.subject} to an audience unfamiliar with ${topic.plural ? "them" : "it"}`,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.assumes, `Accurate, but it mentions ${topic.short} as though the audience already knew what ${topic.plural ? "they are" : "it is"} and who is behind ${topic.plural ? "them" : "it"}.`],
        [topic.person, `Accurate, but it introduces ${topic.creator} rather than ${topic.short}.`],
        [topic.detail, `Accurate, but it offers a detail about ${topic.short} without saying what ${topic.plural ? "they are" : "it is"}.`],
      ],
    }),
    check: needCheck,
    explain: (topic) =>
      `An unfamiliar audience first needs to know what ${topic.short} ${topic.plural ? "are" : "is"}. Only this choice names ${topic.plural ? "them" : "it"} and says what ${topic.plural ? "they are" : "it is"}; the others assume the reader already knows or introduce ${topic.creator} instead.`,
    steps: [
      "Note the audience: readers who have never heard of the subject.",
      "Find the note that says what the subject is.",
      "Choose the sentence that names the subject and includes that identifying information.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("Writing for newcomers means identifying a subject before adding details about it."),
    trap: "Choosing an interesting detail that mentions the subject by name but never says what it is.",
    hint: "Would a reader who has never heard of the subject know what it is after reading the choice?",
  });

  const advantageNotes = synthesisFamily({
    id: "notes-explain-benefit",
    subskill: "rhetorical goal",
    difficulty: "Medium",
    title: "Notes goal: the benefit of a method or material",
    recognize: "An advantage is what the subject does better; a description of it, a drawback, or background about the alternative is accurate but off the goal.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 75,
    topics: ADVANTAGE_TOPICS,
    goal: (topic) => `explain an advantage of ${topic.method}`,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.describe, `Accurate, but it only describes ${topic.short}; it never states an advantage.`],
        [topic.drawback, `Accurate, but it states a drawback of ${topic.short}, which works against the goal.`],
        [topic.other, `Accurate, but it gives a related fact without explaining any advantage of ${topic.short}.`],
      ],
    }),
    check: needCheck,
    explain: (topic) =>
      `Only this choice states a benefit of ${topic.short}. The others describe the subject, state a drawback, or report a related fact, none of which is an advantage.`,
    steps: [
      "Identify the goal: an advantage of the subject.",
      "Find the note that states a benefit rather than a description or a cost.",
      "Choose the sentence built on that benefit.",
    ],
    principles: SYNTHESIS_PRINCIPLES,
    trap: "Choosing a vivid description of how the method works, which sounds positive but states no advantage.",
    hint: "Which choice says what the subject does better, not just what it is?",
  });

  const generalizationNotes = synthesisFamily({
    id: "notes-generalize-category",
    subskill: "student notes",
    difficulty: "Easy",
    title: "Notes goal: a claim about a whole category",
    recognize: "A generalization is about the category as a whole; each named example, however accurate, is a single case.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 1, synthesis: 0, trap: 0 },
    tricks: ["off-goal", "too-narrow"],
    seconds: 65,
    topics: GENERALIZATION_TOPICS,
    goal: (topic) => `make a generalization about ${topic.category}`,
    choices: (topic) => ({
      key: topic.key,
      wrong: topic.wrong.map((text) => {
        const example = topic.examples.find((name) => has(text, name));
        return [text, `Accurate, but it describes a single case (${example}), not ${topic.category} in general.`];
      }),
    }),
    check: (topic, choices) =>
      topic.need.every((marker) => has(topic.notes.join(" "), marker) && has(choices.key, marker)) &&
      topic.examples.every((name) => has(topic.notes.join(" "), name) && !has(choices.key, name)) &&
      choices.wrong.every(([text]) => topic.examples.some((name) => has(text, name))),
    explain: (topic) =>
      `A generalization states what is true of ${topic.category} broadly. Only this choice does so without narrowing to one named example.`,
    steps: [
      "Identify the goal: a statement about a whole category.",
      "Separate the notes that describe the category from those that describe single examples.",
      "Choose the sentence built on the general note, with no single example named.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A specific example supports a generalization but is not one."),
    trap: "Choosing a specific, vivid example because it is accurate and detailed.",
    hint: "Which choice would still be true if you removed every named example from the notes?",
  });

  const significanceNotes = synthesisFamily({
    id: "notes-finding-and-significance",
    subskill: "rhetorical goal",
    difficulty: "Medium",
    title: "Notes goal: a result paired with why it matters",
    recognize: "The goal has two parts, the finding and its significance; a choice with a detailed finding but no significance fails as surely as one with neither.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "too-narrow"],
    seconds: 85,
    topics: SIGNIFICANCE_TOPICS,
    goal: () => "present the study's finding and explain its significance",
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.findingMethod, "Accurate, but it reports the finding and how it was reached without saying why it matters."],
        [topic.aimMethod, "Accurate, but it describes what the researcher set out to do and how, not what was found."],
        [topic.context, "Accurate, but it gives context for the study rather than presenting what the study found."],
      ],
    }),
    check: needCheck,
    explain: () =>
      "The goal needs both the finding and its significance. This choice states the result and then what it suggests; the most tempting alternative reports the finding thoroughly but stops before its significance.",
    steps: [
      "Split the goal into its two parts: the finding and its significance.",
      "Label each note: aim, method, finding, significance, or background.",
      "Eliminate any choice missing either the finding or the significance.",
      "Choose the one choice that states both.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A goal with two parts is met only by a choice that addresses both."),
    trap: "Choosing the choice that reports the finding in the most detail, which omits why it matters.",
    hint: "Does the choice say both what was found and why it matters?",
  });

  // The four concession sentences of a topic, built from its clauses.
  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  function concessionSentence(topic, subordinate, main) {
    return topic.mainFirst
      ? `${capitalize(main)}, ${topic.conj.toLowerCase()} ${subordinate}.`
      : `${topic.conj} ${subordinate}, ${main}.`;
  }
  function concessionSentences(topic) {
    const { diff, sim, sim2, diff2 } = topic.clauses;
    return {
      a: concessionSentence(topic, diff, sim),
      b: concessionSentence(topic, sim2, diff2),
      c: concessionSentence(topic, sim2, sim),
      e: concessionSentence(topic, diff, diff2),
    };
  }
  const CONCESSION_GOALS = {
    similarity: (topic) => `emphasize a similarity between ${topic.pair} while acknowledging a difference between them`,
    difference: (topic) => `emphasize a difference between ${topic.pair} while acknowledging a similarity between them`,
  };
  const CONCESSION_REASONS = {
    similarity: {
      b: "It holds a similarity and a difference, but it concedes the similarity in its subordinate clause and stresses the difference in its main clause, the reverse of the goal.",
      c: "Both of its clauses state similarities, so it never acknowledges how the two differ.",
      e: "Both of its clauses state differences, so nothing in it stresses what the two share.",
    },
    difference: {
      a: "It holds a similarity and a difference, but it stresses the similarity in its main clause and concedes the difference in its subordinate clause, the reverse of the goal.",
      c: "Both of its clauses state similarities, so nothing in it stresses how the two differ.",
      e: "Both of its clauses state differences, so it never acknowledges what the two share.",
    },
  };

  // Recalibrated to Medium after the 2026-10-03 sampled review: the goal
  // explicitly names both clause roles, so the task applies a fixed rhetorical
  // distinction rather than discovering a relationship among competing claims.
  const concessionSimilarityNotes = synthesisFamily({
    id: "notes-similarity-despite-difference",
    subskill: "rhetorical goal",
    difficulty: "Medium",
    title: "Notes goal: stress a likeness or a difference, concede the other",
    recognize: "Every choice names both subjects and pairs a conceded clause (\u201calthough,\u201d \u201cwhile,\u201d \u201cthough\u201d) with a main clause, and the goal asks for one kind of point in each. Label every clause as a similarity or a difference and find the choice whose main clause carries what the goal stresses and whose conceded clause carries what it acknowledges.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "opposite-stance"],
    seconds: 105,
    topics: CONCESSION_SIMILARITY_TOPICS,
    variants: () => ["similarity", "difference"],
    goal: (topic, variant) => CONCESSION_GOALS[variant](topic),
    choices: (topic, variant) => {
      const sentences = concessionSentences(topic);
      const keyName = variant === "similarity" ? "a" : "b";
      return {
        key: sentences[keyName],
        wrong: Object.keys(CONCESSION_REASONS[variant]).map((name) => [sentences[name], CONCESSION_REASONS[variant][name]]),
      };
    },
    // Each clause holds the markers of its own point and none of the
    // others', and the key is the sentence the goal calls for; checked on
    // the clauses, not on the order the choices were written in.
    check: (topic, choices, variant) => {
      const notes = topic.notes.join(" ");
      const { diff, sim, sim2, diff2 } = topic.clauses;
      const all = (text, markers) => markers.every((marker) => has(text, marker));
      const none = (text, markers) => markers.every((marker) => !has(text, marker));
      const others = { diff: [topic.sim, topic.sim2, ...topic.diff2], sim: [topic.sim2, ...topic.diff, ...topic.diff2],
        sim2: [topic.sim, ...topic.diff, ...topic.diff2], diff2: [topic.sim, topic.sim2, ...topic.diff] };
      const sentences = concessionSentences(topic);
      const expected = variant === "similarity" ? sentences.a : sentences.b;
      const wrongNames = variant === "similarity" ? ["b", "c", "e"] : ["a", "c", "e"];
      return (
        [topic.sim, topic.sim2, ...topic.diff, ...topic.diff2].every((marker) => has(notes, marker)) &&
        topic.notes.length >= 6 &&
        all(diff, topic.diff) && none(diff, others.diff) &&
        all(sim, [topic.sim]) && none(sim, others.sim) &&
        all(sim2, [topic.sim2]) && none(sim2, others.sim2) &&
        all(diff2, topic.diff2) && none(diff2, others.diff2) &&
        choices.key === expected &&
        choices.wrong.map(([text]) => text).join("|") === wrongNames.map((name) => sentences[name]).join("|")
      );
    },
    explain: (topic, variant) => (variant === "similarity"
      ? "The goal stresses a similarity and acknowledges a difference, so the difference belongs in the subordinate clause, where it is conceded, and the similarity in the main clause, where it is stressed. One distractor reverses the two; one concedes a second similarity instead of a difference; one pairs two differences."
      : "The goal stresses a difference and acknowledges a similarity, so the similarity belongs in the subordinate clause, where it is conceded, and the difference in the main clause, where it is stressed. One distractor reverses the two; one pairs two similarities; one concedes a difference instead of a similarity."),
    steps: [
      "Split the goal: which kind of point is stressed, and which is only acknowledged?",
      "In each choice, find the subordinate clause (after \u201calthough,\u201d \u201cwhile,\u201d or \u201cthough\u201d) and the main clause, wherever each sits in the sentence.",
      "Label each clause as a similarity or a difference.",
      "Keep only the choice whose main clause holds what the goal stresses and whose subordinate clause holds what it acknowledges.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A subordinate clause (\u201calthough ...\u201d) concedes; the main clause carries the emphasis, whether it comes first or last."),
    trap: "Choosing a sentence with the right shape, or with the right kind of point in the main clause, without checking that the conceded clause holds the other kind of point.",
    hint: "In each choice, which clause is conceded and which is stressed, and is each a similarity or a difference?",
  });

  const STRESS_ROLES = { fm: ["finding", "method"], mf: ["method", "finding"], fs: ["finding", "meaning"], sf: ["meaning", "finding"] };
  const STRESS_NAMES = { finding: "the finding", method: "how the study was conducted", meaning: "what the finding suggests" };
  const STRESS_GOALS = {
    fm: "emphasize the study's finding while indicating how the study was conducted",
    mf: "emphasize how the study was conducted while indicating the study's finding",
    fs: "emphasize the study's finding while indicating what the finding suggests",
    sf: "emphasize what the study's finding suggests while indicating the finding itself",
  };
  // Why sentence `wrong` misses the goal whose key is sentence `key`.
  function stressReason(wrong, key) {
    const [wrongStress, wrongNote] = STRESS_ROLES[wrong];
    const [keyStress, keyNote] = STRESS_ROLES[key];
    const name = (role) => STRESS_NAMES[role];
    if (wrongStress === keyStress) {
      return `Its main clause stresses ${name(wrongStress)}, as the goal asks, but what it adds is ${name(wrongNote)}, not ${name(keyNote)}.`;
    }
    if (wrongStress === keyNote && wrongNote === keyStress) {
      return `It contains both ${name(keyStress)} and ${name(keyNote)}, but its main clause stresses ${name(wrongStress)} and only mentions ${name(wrongNote)}, the reverse of the goal.`;
    }
    if (wrongNote === keyNote) {
      return `It mentions ${name(wrongNote)}, as the goal asks, but its main clause stresses ${name(wrongStress)} rather than ${name(keyStress)}.`;
    }
    return `Its main clause stresses ${name(wrongStress)} rather than ${name(keyStress)}, and what it adds is ${name(wrongNote)} rather than ${name(keyNote)}.`;
  }
  const STRESS_ORDER = ["fm", "mf", "fs", "sf"];

  // Recalibrated to Medium on 2026-10-03: identifying the two stated roles
  // and their clause emphasis is meaningful practice, but a repeatable grid.
  const stressNotes = synthesisFamily({
    id: "notes-stress-while-noting",
    subskill: "rhetorical goal",
    difficulty: "Medium",
    title: "Notes goal: stress one part of a study while noting another",
    recognize: "All four choices report the same finding, and each pairs it with the method or with what it suggests; they differ in which part the main clause stresses and which a subordinate clause or phrase only mentions. The goal names both, so check the main clause and the added part of every choice.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 105,
    topics: STRESS_TOPICS,
    variants: () => STRESS_ORDER,
    goal: (topic, variant) => STRESS_GOALS[variant],
    choices: (topic, variant) => ({
      key: topic.sentences[variant],
      wrong: STRESS_ORDER.filter((name) => name !== variant).map((name) => [topic.sentences[name], stressReason(name, variant)]),
    }),
    // Every sentence holds the finding; the two that pair it with the
    // method hold the method and not the suggestion, and the reverse for the
    // other two; the key is the sentence the goal names.
    check: (topic, choices, variant) => {
      const notes = topic.notes.join(" ");
      const { method, finding, meaning } = topic.markers;
      const s = topic.sentences;
      const withMethod = (text) => has(text, finding) && has(text, method) && !has(text, meaning);
      const withMeaning = (text) => has(text, finding) && has(text, meaning) && !has(text, method);
      return (
        [method, finding, meaning].every((marker) => has(notes, marker)) &&
        topic.notes.length >= 6 &&
        withMethod(s.fm) && withMethod(s.mf) && withMeaning(s.fs) && withMeaning(s.sf) &&
        choices.key === s[variant] &&
        choices.wrong.map(([text]) => text).join("|") === STRESS_ORDER.filter((name) => name !== variant).map((name) => s[name]).join("|")
      );
    },
    explain: (topic, variant) => {
      const [stress, note] = STRESS_ROLES[variant];
      return `The goal stresses ${STRESS_NAMES[stress]} and only indicates ${STRESS_NAMES[note]}, so ${STRESS_NAMES[stress]} belongs in the main clause and ${STRESS_NAMES[note]} in a subordinate clause or phrase. Only this choice is built that way; each of the others stresses the wrong part, adds the wrong part, or does both.`;
    },
    steps: [
      "Split the goal: what is to be emphasized, and what is only to be indicated?",
      "In each choice, find the main clause and name the part of the study it states: the method, the finding, or what the finding suggests.",
      "Name the part carried by the subordinate clause or phrase.",
      "Keep the choice whose main clause carries what the goal emphasizes and whose subordinate part carries what it indicates.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A main clause carries a sentence's emphasis; an opening phrase (\u201cAfter ...,\u201d \u201cHaving ...\u201d) or a trailing clause (\u201c..., which suggests\u201d) only adds."),
    trap: "Choosing the sentence that contains both parts the goal names without checking which one its main clause stresses.",
    hint: "In each choice, which part of the study does the main clause state, and which part is tucked into a phrase?",
  });

  const expectationNotes = synthesisFamily({
    id: "notes-result-versus-expectation",
    subskill: "rhetorical goal",
    difficulty: "Medium",
    title: "Notes goal: a result that overturned a prediction",
    recognize: "To show how a result differed from an expectation, a choice must state both and set them against each other. A choice can say \u201cexpected\u201d without the result, or set the result against some other detail with \u201calthough\u201d or \u201cwhile\u201d; neither shows the contrast the goal asks for.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "too-narrow"],
    seconds: 85,
    topics: EXPECTATION_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.resultMethod, "Accurate, but it gives only the result; without the expectation, nothing shows that the result was a surprise."],
        [topic.expectationMethod, "Accurate, but it states the expectation without the result that contradicted it."],
        [topic.resultOther, "Accurate, but it pairs the result with another detail from the notes, not with the expectation the result contradicted, so it cannot show how the result differed from that expectation."],
      ],
    }),
    check: needCheck,
    explain: () =>
      "Showing that a result differed from an expectation requires stating both and contrasting them. Only this choice does; the others give the result or the expectation alone, or set the result against a different detail.",
    steps: [
      "Identify the two things the goal compares: the expectation and the result.",
      "Find the note that states the expectation and the note that states the result.",
      "Eliminate choices that include only one of them, even if they contain a contrast word.",
      "Choose the choice that sets the result against the expectation.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A contrast needs both of its sides stated; a contrast word joined to the wrong pair of facts does not meet the goal."),
    trap: "Choosing a choice that has the result and a contrast word (\u201calthough,\u201d \u201cwhile\u201d) but sets the result against a detail other than the expectation.",
    hint: "Does the choice say both what was expected and what was found, and set one against the other?",
  });

  const namedFeatureNotes = synthesisFamily({
    id: "notes-difference-on-named-feature",
    subskill: "rhetorical goal",
    // Medium (relabelled from Hard, 2026-09-26): a cold review found that
    // matching the goal's feature to both subjects finds the key; the work
    // is one careful check, not deciding what kind of problem this is.
    difficulty: "Medium",
    title: "Notes goal: a difference in the one feature the goal names",
    recognize: "Every choice names both subjects, and most set them against each other. Only one contrasts them on the feature the goal names, and only if it gives that feature for both subjects.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 85,
    topics: NAMED_FEATURE_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.otherFeature, "Accurate, and it contrasts the two subjects, but on a different feature from the one the goal names."],
        [topic.mixed, "Accurate, but it gives the feature the goal names for only one subject and sets it against an unrelated fact about the other, so it compares nothing."],
        [topic.shared, "Accurate, but it states something the two subjects share rather than how they differ."],
      ],
    }),
    // The key holds the named feature for both subjects; the other contrast
    // holds it for neither; the mixed choice for one; the shared choice for
    // neither, and says what both have.
    check: (topic, choices) => {
      const notes = topic.notes.join(" ");
      const count = (text) => [topic.featureA, topic.featureB].filter((markers) => markers.some((marker) => has(text, marker))).length;
      const [otherFeature, mixed, shared] = choices.wrong.map(([text]) => text);
      return (
        [...topic.featureA, ...topic.featureB].every((marker) => has(notes, marker)) &&
        topic.notes.length >= 6 &&
        count(choices.key) === 2 && count(otherFeature) === 0 && count(mixed) === 1 &&
        count(shared) === 0 && /\bboth\b/i.test(shared)
      );
    },
    explain: () =>
      "The goal names one feature, so the answer must set the two subjects against each other on that feature. One distractor contrasts them on a different feature, one gives the named feature for only one subject, and one states what they share.",
    steps: [
      "Find the feature the goal names and the note that gives it for each subject.",
      "Set aside any choice that states a similarity.",
      "Of the contrasts, keep only the one that gives the named feature for both subjects.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A contrast meets a goal only when both sides describe the same feature."),
    trap: "Choosing a sentence that contrasts the two subjects clearly, but on a feature other than the one the goal names.",
    hint: "Which feature does the goal name? Does the choice give that feature for both subjects?",
  });

  const differenceSizeNotes = synthesisFamily({
    id: "notes-size-of-difference",
    subskill: "rhetorical goal",
    // Medium (relabelled from Hard, 2026-09-26): a cold review found that
    // "the choice with both figures and a ratio" found the key; ratios now
    // appear in other-measure choices too and some keys give none.
    difficulty: "Medium",
    title: "Notes goal: how large a difference is",
    recognize: "Every choice names both subjects. To show how large a difference is, a choice must give the named measure for both subjects; saying which is greater, or giving the size of a different difference, does not.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 85,
    topics: DIFFERENCE_SIZE_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.direction, "Accurate, and it says which is greater, but it gives no figures, so it does not show how large the difference is."],
        [topic.otherSize, "Accurate, and it gives figures for both subjects, but for a different measure from the one the goal names."],
        [topic.oneValue, "Accurate, but it gives the named measure for only one subject, so there is nothing to compare it with."],
      ],
    }),
    // The key holds both of the named measure's values; the direction choice
    // holds none and no numbers for the measure; the other-size choice holds
    // none of them but figures of its own; the one-value choice holds one.
    check: (topic, choices) => {
      const notes = topic.notes.join(" ");
      const count = (text) => topic.values.filter((value) => text.includes(value)).length;
      const [direction, otherSize, oneValue] = choices.wrong.map(([text]) => text);
      return (
        topic.values.every((value) => notes.includes(value)) &&
        topic.notes.length >= 6 &&
        count(choices.key) === topic.values.length && count(direction) === 0 &&
        count(otherSize) === 0 && numbers(otherSize).length + (otherSize.match(NUMBER_WORDS) || []).length >= 2 &&
        count(oneValue) === 1
      );
    },
    explain: () =>
      "Showing how large a difference is takes the named measure for both subjects. One distractor says only which is greater; one gives figures for a different measure; one gives the named measure for only one subject.",
    steps: [
      "Find the measure the goal names and its value for each subject in the notes.",
      "Set aside any choice that says only which is greater.",
      "Of the choices with figures, keep the one that gives the named measure for both subjects.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("To show the size of a difference, give both amounts (or how many times one is the other), not just which is larger."),
    trap: "Choosing a sentence with figures for both subjects without checking that the figures measure what the goal names.",
    hint: "Does the choice give the named measure for both subjects?",
  });

  // Recalibrated to Medium on 2026-10-03: most scenes ask for a direct
  // offset or denominator distinction, and alternatives repeat either the
  // reports or their methods. The conditional coffee scene is more demanding,
  // but cannot establish a Hard tier for the entire scene pool.
  const reconciliationNotes = synthesisFamily({
    id: "notes-reconcile-findings",
    subskill: "rhetorical goal",
    difficulty: "Medium",
    title: "Notes goal: reconcile apparently conflicting findings",
    recognize: "Identify what each finding actually measures, then use the notes to explain how the different measures, conditions, or time windows allow both findings to hold. A sentence that merely repeats the contrast or names the methods leaves the discrepancy unexplained.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 105,
    topics: RECONCILIATION_TOPICS,
    goal: () => "explain why the apparently conflicting findings can both hold by connecting their difference to the relevant condition in the notes",
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.contrast, "This accurately states the opposing findings but leaves the difference unexplained; it does not connect them to the condition that reconciles them."],
        [topic.method, "This explains a reporting method or comparison, but it does not connect the relevant condition to the opposing directions of the findings."],
        [topic.detail, "These details are accurate, but the sentence does not connect the relevant condition to both findings to resolve their apparent conflict."],
      ],
    }),
    check: (topic, choices) => choices.key === topic.key &&
      choices.wrong.map(([text]) => text).join("|") === [topic.contrast, topic.method, topic.detail].join("|"),
    explain: (topic) => topic.why,
    steps: [
      "Identify what each finding says and the quantity, group, period, or condition it concerns.",
      "Combine the relevant notes about rates, counts, groups, or conditions to explain how the findings can differ while both remain true.",
      "Select the sentence that connects those facts to both findings, rather than merely listing the findings or their methods.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("Before treating two findings as contradictory, check whether they concern the same measure under the same conditions."),
    trap: "Choosing a polished comparison that restates the discrepancy without explaining it.",
    hint: "Which notes must be combined to explain how one quantity or outcome can move differently from the other?",
  });

  // An indirect measure can support a bounded interpretation without
  // establishing a stronger claim about motive, mechanism, or outcome.
  // Every alternative is factual; each omits a different part of that link.
  const QUALIFIED_MEASURE_TOPICS = [
    {
      "scene": "eoi-qmeasure-essay-references",
      "notes": [
        "Historian Lena Iven indexed references to an essay about shared grazing fields in farming journals.",
        "Reference entries rose from eighteen in the early decade to fifty-four in the later decade; the journals containing them increased from six to eighteen.",
        "The index gave an entry whenever an article named the essay and recorded its title and page.",
        "One later article printed a passage under the heading 'Why this proposal would fail'; another presented a passage as a model for reform.",
        "The index assigned both passages the same entry type.",
        "Private letters were not indexed, and no entries recorded changes in farming practices.",
        "The journals were forums for public debate about farming."
      ],
      "goal": "explain the essay's growing role in public debate while evaluating a claim that it was persuading more readers",
      "key": "References spread across more journals, showing wider engagement; indexing both attacks and models for reform gives no count of converts.",
      "coverage": "References spread across more journals, though omitted letters leave the essay's circulation in private exchanges outside the historian's count.",
      "method": "The index treats an attack and a model for reform alike, tracing discussion without sorting the references into support and criticism.",
      "adjacent": "The later journals offered both an attack and a model for reform, but neither the index nor its rising count records changed farming practices.",
      "why": "The increased number of journals establishes a widening place in public debate. To interpret that growth, the student must apply the indexing rule to the two example passages: an attack and a favorable model produce the same kind of entry. The count therefore measures engagement across journals without identifying persuasion. The other choices address private reach, the coding rule alone, or practical adoption without combining the change over time with that distinction.",
      "allow": [
        "spread",
        "across",
        "wider",
        "engagement",
        "attacks",
        "count",
        "converts",
        "omitted",
        "leave",
        "circulation",
        "exchanges",
        "outside",
        "treats",
        "attack",
        "tracing",
        "discussion",
        "without",
        "sorting",
        "support",
        "criticism",
        "offered",
        "neither"
      ]
    },
    {
      "scene": "eoi-qmeasure-mended-pottery",
      "notes": [
        "At the invented settlement of Veyra, archaeologists found staple holes joining broken sections of forty cooking pots.",
        "Soot lay over the joined sections, indicating that the pots returned to cooking fires after mending.",
        "A surviving receipt priced a new cooking pot at eight coins and a staple repair at one coin.",
        "A will requested that one repaired pot be kept 'in remembrance of my mother.'",
        "That pot's staple holes matched the repairs on pots not named in the will.",
        "The excavated houses belonged to one neighborhood; discarded pots elsewhere were not examined."
      ],
      "goal": "explain what the repaired pots reveal about owners' willingness to retain them while assessing an interpretation that all were family heirlooms",
      "key": "Repairs show investment in continued use; cheaper mending and a bequeathed pot leave that investment open to economic or personal explanations.",
      "coverage": "Repairs show investment in continued use, but pots from a single neighborhood cannot establish how widespread mending was across Veyra.",
      "method": "The receipt makes mending an economical option, while the will names one pot; neither record assigns a motive to every repaired vessel.",
      "adjacent": "The bequeathed pot links cookware to family remembrance, but its staple holes match those on pots absent from the household's written request.",
      "why": "Repair followed by further use shows an investment in retaining the pots. The price comparison supplies an economic explanation, while the will supplies a personal one; matching marks cannot separate these motivations for the remaining pots. The key draws that bounded inference from the artifacts. The other choices qualify the geographic sample or discuss the documents without integrating the physical evidence and the competing explanations.",
      "allow": [
        "investment",
        "continued",
        "cheaper",
        "bequeathed",
        "leave",
        "open",
        "economic",
        "personal",
        "explanations",
        "single",
        "cannot",
        "establish",
        "widespread",
        "across",
        "economical",
        "option",
        "neither",
        "record",
        "assigns",
        "motive",
        "vessel",
        "links",
        "cookware",
        "family",
        "absent",
        "household's",
        "written"
      ]
    },
    {
      "scene": "eoi-qmeasure-flower-dye",
      "notes": [
        "At the fictional Merrow field station, researchers coated pollen with fluorescent dye; both adhered to visiting insects.",
        "During one afternoon, dye appeared on other flowers' stigmas, the structures where researchers placed pollen in a separate seed-production trial.",
        "In that trial, researchers transferred fresh pollen by hand to one group of stigmas and month-old stored pollen to another group.",
        "Seeds formed in the fresh-pollen group but not in the stored-pollen group; dye traces remained on both groups of stigmas.",
        "The insect study did not count seeds or determine how long the pollen had been stored.",
        "The same amount of dye was placed on every marked flower."
      ],
      "goal": "use the tracer observations to explain what the insects' visits contribute to the reproductive process without overstating their outcome",
      "key": "Dye links insect visits to a route available to pollen, but traces survived a seedless trial, so they cannot establish reproductive success.",
      "coverage": "Dye links insects to movement between flowers, but one afternoon of observations cannot establish how often they follow that route in a season.",
      "method": "Hand transfers left dye on stigmas with both fresh and stored pollen, although seeds formed only in the fresh-pollen treatment of the trial.",
      "adjacent": "Seeds formed after fresh pollen was placed by hand; the insect study instead traced journeys between flowers without counting the resulting seeds.",
      "why": "Dye and pollen share an insect carrier, and the observed endpoint is the structure used in the seed-production trial. That establishes a relevant transport route. However, the trial's stored-pollen group retained the same signal without seeds, so the signal cannot establish the biological outcome. The key transfers this calibration limit to the insect observations instead of merely reporting a trial or questioning seasonal coverage.",
      "allow": [
        "links",
        "route",
        "survived",
        "available",
        "seedless",
        "cannot",
        "establish",
        "reproductive",
        "success",
        "movement",
        "observations",
        "often",
        "follow",
        "season",
        "transfers",
        "left",
        "treatment",
        "journeys",
        "without",
        "resulting"
      ]
    },
    {
      "scene": "eoi-qmeasure-leaf-packs",
      "notes": [
        "Researchers placed packs of untreated and sterilized leaves in the invented Orlan stream; untreated packs lost thirty percent of their dry mass in a month.",
        "Microscopy found microbial colonies on untreated leaves and none on sterilized leaves.",
        "Sterilized leaves lost mass in flowing stream water but retained their mass in still-water tanks.",
        "Traps below both kinds of stream packs caught leaf fragments that had passed through the mesh.",
        "Researchers weighed the leaves only before placement and after a month, drying them first to exclude retained water.",
        "They did not weigh the trapped fragments or measure the amount consumed by microbes."
      ],
      "goal": "interpret the reported mass change as evidence about leaf decay while evaluating whether it measures the contribution of microbes",
      "key": "Less leaf material remained, but sterile controls also lost mass and released fragments, so the decrease cannot be assigned wholly to microbes.",
      "coverage": "Stream mass loss records leaf breakdown during one month, but weighing only at its beginning and end cannot locate the fastest period of loss.",
      "method": "Sterile leaves lost mass in flow but retained it in still water, linking their loss to flow even though neither treatment had microbial colonies.",
      "adjacent": "Colonies occurred only on untreated leaves, but fragments appeared below both pack types, indicating that fragment loss did not require colonies.",
      "why": "The reported loss is a measure of leaf material disappearing. The student must combine the sterile controls with the material caught below the packs to recognize an exit route that does not depend on microbes. Total disappearance therefore cannot isolate the microbial contribution. The other interpretations describe the time resolution or controls without applying that limit to the reported untreated-pack result.",
      "allow": [
        "less",
        "material",
        "remained",
        "sterile",
        "controls",
        "released",
        "decrease",
        "cannot",
        "assigned",
        "wholly",
        "loss",
        "records",
        "breakdown",
        "beginning",
        "end",
        "locate",
        "fastest",
        "period",
        "linking",
        "neither",
        "treatment",
        "occurred",
        "appeared",
        "types",
        "indicating",
        "require"
      ]
    },
    {
      "scene": "eoi-qmeasure-tree-rings",
      "notes": [
        "In the invented Dalen basin, an ecologist found unusually wide rings from one decade in preserved fir trunks.",
        "Ring width records the amount of wood added by a fir in a year.",
        "In nursery trials, warming one group while holding its water supply constant produced wider rings than in an unwarmed group.",
        "A different trial held temperature constant and supplied one group with more water; that group also produced wider rings.",
        "Neither rainfall nor temperature records survive for the decade represented by the preserved trunks.",
        "Only trunks preserved in a peat bed could be sampled; firs elsewhere in the basin were not represented."
      ],
      "goal": "summarize what the ring record contributes to a reconstruction of that decade's climate",
      "key": "The firs added extra wood during the decade; nursery experiments make both wetter and warmer conditions compatible with that growth pattern.",
      "coverage": "The wide rings mark stronger growth in preserved firs, but a peat-bed sample cannot establish whether unsampled trees across the basin grew likewise.",
      "method": "The nursery trials held water constant during warming and temperature constant during watering, separating two ways to alter the trees' growth.",
      "adjacent": "Neither rainfall nor temperature records survive for the decade, so the ecologist cannot compare its conditions directly with those in the nursery.",
      "why": "The ring measurement first translates into growth. The two controlled nursery contrasts then show that distinct environmental changes can produce the same observed signal, preventing a unique climate explanation for the preserved rings. The key connects those findings. Sampling limitations and absent climate records are relevant cautions but do not interpret the proxy's response to different conditions.",
      "allow": [
        "extra",
        "experiments",
        "wetter",
        "warmer",
        "conditions",
        "compatible",
        "growth",
        "pattern",
        "mark",
        "stronger",
        "cannot",
        "establish",
        "whether",
        "unsampled",
        "trees",
        "across",
        "grew",
        "likewise",
        "separating",
        "ways",
        "alter",
        "directly"
      ]
    },
    {
      "scene": "eoi-qmeasure-gallery-pauses",
      "notes": [
        "The invented Talven gallery wants visitors to understand why a weaving sequence produces even tension.",
        "An existing diagram showed the steps with explanatory captions.",
        "The gallery added a moving illustration; visitors could replay its motions with one button and open the unchanged captions with a separate control.",
        "The captions explained why each step affected tension and remained closed until selected.",
        "Camera records showed a median pause of two minutes after the change, compared with one minute before it.",
        "The records combined first and repeat visits and did not identify which controls visitors used or record their explanations of the technique."
      ],
      "goal": "write a qualified assessment of whether the revised display advanced the gallery's teaching aim",
      "key": "Longer viewing supports increased attention; untracked access to the reasons behind the steps leaves deeper understanding unestablished.",
      "coverage": "Longer pauses suggest the display held attention, but the records combine first and repeat visits, so they cannot isolate newcomers' viewing.",
      "method": "The revision left the captions unchanged and made motion repeatable, letting visitors replay steps while leaving the reasons for them behind another control.",
      "adjacent": "Opening the captions would expose reasons for the steps, but visitors' time at the display does not record what explanations they could give.",
      "why": "The longer pauses support increased attention. The student must distinguish the gallery's aim of explaining why the sequence works from watching its motions: the two kinds of content are accessed through separate controls, and duration records identify neither control use nor explanations. The key uses that design to bound the favorable interpretation. The other choices discuss newcomers, describe the interface alone, or identify a missing outcome without interpreting the change in attention.",
      "allow": [
        "longer",
        "viewing",
        "supports",
        "increased",
        "attention",
        "untracked",
        "access",
        "reasons",
        "behind",
        "leaves",
        "deeper",
        "unestablished",
        "display",
        "held",
        "cannot",
        "isolate",
        "newcomers",
        "revision",
        "left",
        "repeatable",
        "letting",
        "leaving",
        "expose",
        "time"
      ]
    },
    {
      "scene": "eoi-qmeasure-stone-thresholds",
      "notes": [
        "At the invented town of Sorel, a historian measured a deep worn hollow in a workshop's stone threshold.",
        "Laboratory tests showed that repeated foot crossings gradually remove this stone's surface.",
        "The doorway connected a clay-mixing room with the workshop's only kiln room; batches of pots passed through it between mixing and firing.",
        "A notebook recorded the same initials beside work at both stations on successive days.",
        "No complete worker or visitor lists survived, and the threshold's installation date was unknown.",
        "Wear was deepest at the doorway's center and shallower at its edges."
      ],
      "goal": "introduce the threshold as evidence of workshop activity while assessing a claim that its wear establishes a large clientele",
      "key": "The hollow attests to recurrent activity, yet tasks on opposite sides could wear the stone through returns by a small continuing workforce.",
      "coverage": "Doorway wear records repeated movement, but the unknown installation date prevents converting its depth into an annual rate of workshop traffic.",
      "method": "The rooms shared a doorway, and repeated initials in the notebook link work at both stations to some of the same people across successive days.",
      "adjacent": "The deepest wear lay at the doorway's center, but incomplete worker and visitor lists prevent identifying everyone who may have crossed it.",
      "why": "The material tests connect wear to repeated movement. The room arrangement and recurring initials then support a workflow in which the same workers repeatedly traverse the doorway, without supplying a head count. The key combines those observations to preserve evidence of activity while limiting the clientele claim. The other choices qualify annual rates or discuss surviving records without making this connection.",
      "allow": [
        "attests",
        "recurrent",
        "activity",
        "tasks",
        "opposite",
        "sides",
        "returns",
        "small",
        "continuing",
        "workforce",
        "movement",
        "prevents",
        "converting",
        "depth",
        "annual",
        "rate",
        "traffic",
        "shared",
        "link",
        "people",
        "across",
        "lay",
        "incomplete",
        "prevent",
        "identifying",
        "everyone",
        "crossed"
      ]
    },
    {
      "scene": "eoi-qmeasure-nest-deliveries",
      "notes": [
        "Cameras in the fictional Pelden marsh recorded adult reed birds arriving at nests with prey during daylight.",
        "Researchers counted each arrival once; the hourly count rose from eight in the first week to twelve in the final week.",
        "Some visible loads held one moth; others held several small beetles.",
        "A feeding trial found that one of these moths supplied more energy than three of these beetles.",
        "Most loads were partly hidden, so the camera study did not estimate prey mass or identify the contents of every load.",
        "The camera study did not measure nestling growth, and the cameras did not operate after dark."
      ],
      "goal": "evaluate what the rising camera count reveals about the energy supplied to nestlings during the recorded daylight hours",
      "key": "The rising count shows more frequent provisioning, but hidden loads and unequal prey values prevent it from establishing an increase in energy.",
      "coverage": "The rising count shows more daytime arrivals with prey, but the cameras did not operate after dark and cannot describe feeding over a full day.",
      "method": "The researchers counted each arrival once, even when it carried several beetles; partly hidden loads prevented a full record of prey contents.",
      "adjacent": "Energy from one moth exceeded that from three beetles in the trial, but the camera study did not record prey masses or nestling growth.",
      "why": "Arrivals with prey became more frequent. To infer increased energy, however, the student must combine the unequal energy in the moth and beetles with the hidden, variable loads: the count weights arrivals equally when their contents need not supply equal energy. Daylight coverage and missing growth measurements are valid cautions, but they do not explain this limit on interpreting the rising count.",
      "allow": [
        "frequent",
        "provisioning",
        "unequal",
        "values",
        "prevent",
        "establishing",
        "increase",
        "daytime",
        "cannot",
        "full",
        "day",
        "carried",
        "prevented",
        "exceeded"
      ]
    },
    {
      "scene": "eoi-qmeasure-route-recognition",
      "notes": [
        "Posters for a new bus route in fictional Renwick repeatedly described its badge as 'two overlapping rings.'",
        "The adopted badge had narrow lines and a gap at the top; other proposed badges also had two rings but differed in line width and gap position.",
        "Before and after the campaign, residents selected the adopted badge from four drawings; correct selections rose from thirty to seventy percent.",
        "The earlier survey offered the adopted badge with three other overlapping-ring proposals.",
        "The later survey offered it with three angular proposals that had no rings.",
        "Both surveys had one correct answer and four unlabelled choices, giving random guesses the same chance of being correct.",
        "The surveys used separate random samples from the same neighborhoods; no resident took both tests."
      ],
      "goal": "use the survey increase to assess the campaign's success at making the adopted badge recognizable",
      "key": "The later result supports recognition of the promoted ring motif; changed alternatives leave improved knowledge of the exact badge unestablished.",
      "coverage": "A larger share chose the adopted badge later, but separate samples prevent tracing any individual's change in answers across the campaign.",
      "method": "The later test separates rings from angular designs; the earlier test separates gaps and line widths among four overlapping-ring designs.",
      "adjacent": "The four-option format preserves the guessing baseline, while the rise records more correct identifications of the badge in the later survey.",
      "why": "The later test can be answered from the campaign's broad ring motif, whereas the earlier test required distinguishing among similar ring designs. The student must apply that change in the alternatives to the reported increase: later success supports motif recognition but cannot isolate improved knowledge of the adopted design. The equal chance of guessing is a strong rival consideration, but it does not make the tasks equivalent. Separate respondents limit individual tracking, a different issue from the changed task.",
      "allow": [
        "result",
        "supports",
        "recognition",
        "promoted",
        "motif",
        "changed",
        "alternatives",
        "leave",
        "improved",
        "knowledge",
        "exact",
        "unestablished",
        "larger",
        "share",
        "chose",
        "prevent",
        "tracing",
        "individual's",
        "change",
        "across",
        "designs",
        "option",
        "format",
        "preserves",
        "baseline",
        "records",
        "identifications"
      ]
    },
    {
      "scene": "eoi-qmeasure-archive-downloads",
      "notes": [
        "The invented Arven archive's log recorded two hundred monthly downloads before a website update and five hundred afterward.",
        "The log counted each completed ledger-file transfer, using the same rule in both periods.",
        "A ledger set contained four files, one for each season; before the update each file required a separate request.",
        "The update added a button that transferred the whole set in one request, entering each completed file separately in the log.",
        "The log retained filenames but no user identities and recorded neither reading nor later use of the files.",
        "A press release described the increase as evidence of a growing audience."
      ],
      "goal": "assess the press release's interpretation while acknowledging what the changed download count does show",
      "key": "More files left the archive, but the new bundled request could generate four counts, so increased distribution need not mean a larger audience.",
      "coverage": "More files left the archive, but the log records neither reading nor later use, so download growth cannot establish that the ledgers were studied.",
      "method": "The log counted completed transfers before and after the update, while the new button let one request deliver all four files belonging to a set.",
      "adjacent": "The bundled request made all four files available together, but the log lacked user identities and could not identify the recipients of each set.",
      "why": "The logging rule preserves a real increase in complete files distributed. Yet the new interface changes how many entries a single request can produce, and the log has no user identities. The student must connect the unit counted with the bundled operation to see why more distribution need not mean more people. Whether recipients read the files is a different question, and describing the button alone does not interpret the observed increase.",
      "allow": [
        "left",
        "new",
        "bundled",
        "generate",
        "distribution",
        "need",
        "mean",
        "larger",
        "growth",
        "cannot",
        "establish",
        "let",
        "deliver",
        "belonging",
        "available",
        "together",
        "lacked",
        "identify",
        "recipients"
      ]
    }
  ];

  const qualifiedMeasureNotes = synthesisFamily({
    id: "notes-qualify-measure",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: interpret an indirect measure",
    recognize: "Separate the observation from the construct it indicates and from the stronger claim it cannot establish. An accurate caution about coverage or procedure may leave the requested inferential boundary unexplained.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 110,
    topics: QUALIFIED_MEASURE_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.coverage, "This accurately qualifies a result, but its caution does not explain the distinction between what the measure indicates and the stronger interpretation named in the goal."],
        [topic.method, "This accurately interprets a procedure, comparison, or source, but does not connect the observed result to both the bounded interpretation and its relevant limit."],
        [topic.adjacent, "This draws a supported conclusion from related evidence, but does not use the measured result to state and qualify the requested interpretation."],
      ],
    }),
    check: (topic, choices) => choices.key === topic.key &&
      choices.wrong.map(([text]) => text).join("|") === [topic.coverage, topic.method, topic.adjacent].join("|"),
    explain: (topic) => topic.why,
    steps: [
      "Identify what was directly recorded and the connection that makes it relevant to the student's intended claim.",
      "Find the alternative motive, mechanism, unit, or missing requirement that prevents the measure from establishing the stronger claim.",
      "Choose the sentence that uses the result to state the defensible interpretation and explains that specific limit; a true statement about sampling or a proposed additional measurement is not enough.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("An indirect measure can support a claim without measuring every part of it; qualify the inference at the point where the evidence stops."),
    trap: "Treating an accurate methodological caution as if it explained the particular inferential limit the student's goal requires.",
    hint: "What does the observation establish, and what separate condition would have to hold for the stronger claim?",
  });

  // Original selection/omission scenes: the governing question is what a
  // particular audience needs the material to do, not which material has
  // the greatest general appeal. All offered factual statements are true.
  const EDITORIAL_CHOICE_TOPICS = [
    {
      "scene": "eoi-editorial-loom-samples",
      "notes": [
        "The Orrin Textile Room is planning a display about how cloth was made, for visitors unfamiliar with weaving.",
        "Only two methods were used in the workshop: separate strands knotted off at each row, or a continuous strand carried from one row into the next.",
        "Either method can produce the same regular front pattern when the row colors are the same.",
        "A prize cloth has that front pattern and a hem that covers its entire edge.",
        "An unfinished strip has the same front pattern; at its exposed edge, strands turn from one row into the next without cut ends at those points.",
        "Both pieces came from one workshop, but no surviving record names the method used for either.",
        "The curator selected the unfinished strip rather than the prize cloth for the display."
      ],
      "goal": "justify selecting the unfinished strip rather than the prize cloth for the display about how cloth was made",
      "key": "The strip's uncut turns reveal the continuous method; the hemmed cloth hides the edge evidence needed to distinguish two methods with the same front pattern.",
      "wrong": [
        [
          "Both methods can give the front pattern seen on the prize cloth, while the strip leaves its row connections exposed for visitors unfamiliar with weaving.",
          "This describes the shared appearance and exposed connections but does not interpret those connections as evidence distinguishing the construction methods."
        ],
        [
          "The continuous method avoids knotting a new strand for each row, reducing the number of knots while still producing the regular pattern seen on the prize cloth.",
          "This gives a reason a weaver might favor one method, not a reason the curator needs this object to establish which method was used."
        ],
        [
          "The hem gives the prize cloth a finished border by covering its edge, whereas the strip lets visitors examine its connections before a hem is added.",
          "This explains the hem's finishing function and the strip's accessibility, but not why the exposed edge can establish a method that the visible front pattern cannot."
        ]
      ],
      "why": "The finished front does not uniquely identify a method because either method can produce it. The strip's turns connect adjacent rows without cutting off the strand, matching the continuous method rather than separately knotted rows. Its exposed edge therefore supplies evidence that the prize cloth conceals. An advantage of continuous weaving answers why a maker might choose it, not why this object lets a curator establish its use.",
      "allow": ["uncut", "reveal", "hemmed", "hides", "evidence", "needed", "distinguish", "seen", "leaves", "connections", "avoids", "knotting", "new", "reducing", "number", "knots", "still", "producing", "finished", "border", "covering", "lets", "examine", "added"]
    },
    {
      "scene": "eoi-editorial-canal-card",
      "notes": [
        "A club publishes a pocket card for self-guided walkers visiting a bridge along its canal route.",
        "Walkers can enter at the dock or the lane. At the arches junction, dock walkers arrive from the west and lane walkers from the east.",
        "A sketch sequence for groups starting at the dock gives left-turn arrows at the arches but labels no fixed landmarks.",
        "A full map places the bridge north of the arches and the canal south, showing paths from both entrances.",
        "Both formats are readable at card size; the sketches have larger arrows.",
        "The editor selected the map for the pocket card, keeping the sketches for escorted groups that always begin at the dock."
      ],
      "goal": "justify selecting the full map for self-guided walkers despite the sketches' larger turn arrows",
      "key": "The same left turn sends opposite arrivals different ways; fixed landmarks on the map let self-guided walkers orient the route from either entrance.",
      "wrong": [
        [
          "The sketches' larger arrows make dock groups' turns easy to follow, while the map's readable labels identify the bridge and canal for other walkers.",
          "This explains the readability of both formats but does not account for the different meanings a relative turn instruction has for walkers arriving from opposite sides."
        ],
        [
          "The map puts the bridge north of the arches and the canal south, while the sketches tell escorted groups which turn follows their walk from the dock.",
          "This accurately locates landmarks and describes the sketches, but does not explain why two possible approaches make fixed orientation useful on the self-guided card."
        ],
        [
          "Using one sketch sequence keeps escorted groups on the same route from the dock, whereas the map includes both entrances used by self-guided walkers.",
          "This explains consistency for escorted groups and notes both entrances, but leaves out why a left-turn cue cannot work identically from those entrances."
        ]
      ],
      "why": "A dock walker approaches from the west and faces east, so left leads north toward the bridge. A lane walker approaches from the east and faces west, so the same left turn leads south toward the canal. The map's fixed landmarks let both locate the bridge; larger relative-turn arrows do not solve that orientation problem.",
      "allow": ["sends","opposite","arrivals","ways","let","orient","either","easy","follow","identify","puts","tell","follows","walk"]
    },
    {
      "scene": "eoi-editorial-interview-pauses",
      "notes": [
        "The Tavin Archive is preparing a classroom edition of an interview with a potter.",
        "The interviewer asks, 'Did your apprenticeship begin in 1972?' The potter answers, 'That sounds right ... no, it was 1974.'",
        "A workshop ledger records the apprenticeship as beginning in 1974.",
        "The original audio includes a pause between the potter's agreement and correction; a published summary gives only the 1974 date.",
        "The editor kept the question, pause, and full reply in the classroom audio and added a label giving the ledger's date.",
        "The summary presents a fluent chronology; the classroom students examine how an interview's questions shape the account that is recorded."
      ],
      "goal": "explain why retaining the full exchange better serves the classroom edition's purpose than giving only the verified date",
      "key": "Keeping the question reveals the first date's source; the ledger label gives the verified date without recasting prompted agreement as independent recall.",
      "wrong": [
        [
          "The full exchange ends with the date confirmed by the ledger, allowing students to see that the speaker's eventual correction agrees with the written record.",
          "This establishes the final answer's accuracy, but the lesson concerns how a question shaped the recorded account, not simply whether its corrected date was accurate."
        ],
        [
          "Keeping the pause lets students hear hesitation before the corrected date, while the summary gives readers that date without the intervening hesitation.",
          "This explains the difference between audible hesitation and fluent chronology, but does not identify the interviewer's role in supplying the initially accepted date."
        ],
        [
          "The summary and classroom label both give the ledger's date, making the chronology available even though the audio retains the potter's first agreement.",
          "This explains how the editor preserves access to the established chronology, but does not explain what retaining the question reveals about the source of the initial agreement."
        ]
      ],
      "why": "The potter initially agrees to a date supplied by the interviewer rather than first volunteering that date independently. Retaining the question preserves that distinction between a prompted agreement and an independent recollection. The ledger label establishes the event's date without rewriting the interaction students are studying.",
      "allow": ["Keeping","reveals","source","verified","without","recasting","prompted","independent","recall","exchange","ends","confirmed","allowing","see","speaker","eventual","agrees","written","lets","hear","hesitation","corrected","readers","intervening","available","retains"]
    },
    {
      "scene": "eoi-editorial-poetry-notes",
      "notes": [
        "Editor Sena Vale is preparing poems for readers who use everyday pronunciations rather than the poems' coastal dialect.",
        "Facing-page notes support reading each poem aloud; only one short note fits beside a poem, but an appendix can hold longer background.",
        "The first three lines of one poem have six syllables in either pronunciation; with everyday pronunciation, the final line also has six.",
        "Coastal pronunciation gives each of two words in the final line an extra syllable.",
        "A career account identifies the poem's speaker as a role the poet played onstage, providing context for interpreting its voice.",
        "Vale placed a pronunciation note beside the poem and the career account in the appendix."
      ],
      "goal": "justify giving pronunciation priority beside this poem while preserving the career account elsewhere",
      "key": "The dialect lengthens the last line beyond the earlier pattern, so the page note reveals an audible change while the appendix retains career context.",
      "wrong": [
        [
          "The career account identifies the speaker as a stage role, giving readers context for interpreting the voice that pronunciation information alone cannot supply.",
          "This explains the career account's genuine interpretive value, but not why pronunciation deserves the limited space directly beside the poem for reading it aloud."
        ],
        [
          "The dialect adds two syllables to the final line, while the career account identifies the stage role behind its speaker for readers consulting the appendix.",
          "This accurately combines information from both notes, but does not relate the added syllables to the earlier lines or explain the priority given to an audible formal change."
        ],
        [
          "Putting the career account in the appendix preserves theatrical background and lets the page hold a short note about the dialect pronunciations.",
          "This describes a useful allocation of space but does not explain what everyday pronunciation would conceal, which is the reason to prioritize the other note."
        ]
      ],
      "why": "Everyday pronunciation makes all four lines equally long. The two additional coastal syllables make the final line depart from that established pattern. Readers need the pronunciation note at the moment of reading aloud to realize that formal change. The career account still matters to interpreting the speaker and remains available in the appendix.",
      "allow": ["lengthens","last","beyond","earlier","pattern","reveals","audible","change","retains","stage","information","alone","cannot","supply","adds","behind","consulting","Putting","preserves","theatrical","lets"]
    },
    {
      "scene": "eoi-editorial-shell-replica",
      "notes": [
        "The Pell Nature Center is preparing a shell model for visitors studying an individual shell's growth by touch.",
        "A photograph taken before casting shows curved growth ridges and a small angled ridge interrupting them, but no straight ridge from lip to tip.",
        "The mold has two halves whose join runs from lip to tip; joining mold halves leaves a raised seam along the join on a cast.",
        "The cast has both the angled irregularity visible in the photograph and a long straight ridge following that join.",
        "The designer removed the straight ridge but retained the angled one in the touch model.",
        "The original photograph also appears in a guide so readers can inspect shell features before casting."
      ],
      "goal": "explain why the designer removed the long ridge but retained the smaller irregularity rather than making the touch model uniformly smooth",
      "key": "The long ridge follows the mold join, but the angled one appears on the original; selective smoothing keeps shell evidence while removing a casting artifact.",
      "wrong": [
        [
          "Removing the long ridge makes the cast smoother, while the retained angled ridge lets visitors feel an irregular feature visible in the original photograph.",
          "This explains the surface effects of the two choices, but not why the different origins of the ridges make selective smoothing appropriate for studying the shell."
        ],
        [
          "The photograph records growth ridges before casting, allowing readers to inspect details that the designer later presented by touch in the shell model.",
          "This explains how the photograph and model provide two forms of access to features, but does not distinguish a fabrication mark from evidence about the shell itself."
        ],
        [
          "Two mold halves leave a raised join line on the cast, explaining why its surface differs from the original even though its angled ridge matches the photograph.",
          "This explains the source of the additional line, but does not connect removing only that line to preserving evidence for the model's intended use."
        ]
      ],
      "why": "The photograph establishes that the angled irregularity was on the shell before casting. The straight ridge is absent there and follows the mold join, which produces a raised seam. A uniformly smooth model would erase original evidence; an untouched cast would introduce manufacturing evidence into a display about shell growth. Selective smoothing separates those sources.",
      "allow": ["selective","smoothing","keeps","evidence","artifact","smoother","lets","feel","irregular","records","allowing","details","later","presented","line","explaining","why","surface","matches"]
    },
    {
      scene: "eoi-editorial-factory-facsimile",
      notes: [
        "A local-history editor is preparing a page about how factory workers used a notice board.",
        "The page examines what a worker could learn by looking at the board before a shift.",
        "A photograph of the board in use shows a wage notice partly covered by a large festival poster; only the wage notice's heading remains visible.",
        "A clean transcription makes every surviving word readable but prints each notice separately in the same type size.",
        "Space permits one main illustration; the editor selected the photograph and supplied a small transcription of the visible wage heading.",
        "The complete transcription remains in an online archive for readers interested in the notices' wording.",
      ],
      goal: "justify using the photograph to show what workers could learn at the notice board",
      key: "The photograph shows what workers could see; printing both notices in full would give today's readers information hidden from the board's original audience.",
      wrong: [
        ["The archive's complete transcription makes surviving words readable, helping readers interested in more than the wage heading supplied on the illustrated page.", "This explains access to all the surviving wording, which is useful to modern readers but does not reproduce the information available to a worker at the board."],
        ["The small transcription makes the photographed wage heading readable, and readers can consult the online archive for the surviving words of both notices.", "This explains the supplementary transcription and access to fuller wording, without explaining why a view that preserves concealment suits the page's historical question."],
        ["The selected photograph shows a festival poster partly covering a wage notice; the archive's transcription prints each separately in the same type size.", "This describes both representations but does not connect their difference to what the original audience could learn, as opposed to what survives for today's readers."],
      ],
      why: "The photograph preserves an information limit faced by workers: the poster concealed the wage notice except for its heading. A complete transcription makes surviving words available to present readers but cannot, by itself, show that earlier restriction. The editor selects evidence of what the original audience could encounter rather than simply the fullest record of the texts.",
      allow: ["see", "full", "today's", "information", "hidden", "original", "audience", "illustrated", "consult"],
    },
    {
      scene: "eoi-editorial-dance-rehearsal",
      notes: [
        "A dance company is making a lesson for students learning how partners respond to an unexpected change of pace.",
        "A continuous rehearsal shot shows one dancer slowing and the other adjusting a step immediately afterward.",
        "A polished stage montage combines footage by cutting from a slowdown in one performance to the same step performed cleanly in another.",
        "Close-ups in the montage emphasize facial expression; the rehearsal shot keeps both dancers' feet visible throughout.",
        "The editor selected the rehearsal shot for the lesson and the montage for publicity about the company's expressive style.",
        "Both recordings show the company's dancers performing the same piece.",
      ],
      goal: "explain why the rehearsal shot better establishes a dancer's adjustment as a response to a partner's change of pace",
      key: "The unbroken view of both dancers links the adjustment to a partner's changed pace; footage from different performances cannot establish that response.",
      wrong: [
        ["Cleanly performed steps and expressive close-ups suit the company's publicity, although the montage combines footage from different performances.", "This explains why the montage suits publicity, not why the rehearsal shot provides evidence of one partner responding to another."],
        ["The rehearsal shows one dancer slowing before the other adjusts; the polished stage montage shows the same step cleanly and emphasizes facial expression.", "This compares visible details but does not explain why a continuous view establishes the adjustment as a response, the lesson's central concern."],
        ["Keeping both dancers' feet visible shows students the step's adjustment, while expressive close-ups show the company's style in its publicity montage.", "This explains the framing and the publicity use, but does not connect continuity to the ability to trace a partner's response to a particular change."],
      ],
      why: "The lesson needs the link between a change of pace and the partner's adjustment. The rehearsal preserves that sequence within one performance. The montage cuts between those moments from different performances, so their on-screen sequence cannot establish the partner's response.",
      allow: ["view", "adjustment", "links", "cannot", "Keeping", "response", "unbroken", "establish", "suit"],
    },
    {
      "scene": "eoi-editorial-mural-restoration",
      "notes": [
        "The Solven Museum is preparing a guide for visitors unfamiliar with how its mural was reconstructed.",
        "Only two painted fragments survive. An old photograph gives their positions but is too blurred to resolve patterns in the missing areas.",
        "Two complete reconstructions reproduce every surviving mark in those positions but fill the missing regions with different patterns.",
        "One reconstruction is familiar from museum posters; the other has rarely been displayed.",
        "The opening page instead uses a drawing that places the two fragments and leaves the remaining area blank; its caption names both reconstructions.",
        "Later pages show both complete images labeled as proposals. The guide distinguishes what survives from what restorers supply."
      ],
      "goal": "justify opening with the fragment drawing instead of the familiar complete reconstruction",
      "key": "Both reconstructions fit the surviving marks, so the drawing separates known fragments from a completion the evidence does not uniquely establish.",
      "wrong": [
        [
          "The familiar reconstruction lets visitors picture a complete mural, while the drawing locates the two fragments that survive in their recorded positions.",
          "This explains the complete image's appeal and describes the fragment drawing, but does not explain why the evidence permits competing completions."
        ],
        [
          "Labeling the full images as proposals lets visitors compare alternative layouts, while the opening drawing locates the fragments that both layouts reproduce.",
          "This explains the later labels and a use for the drawing, but does not connect the shared surviving evidence to the decision to leave the rest unfilled at the opening."
        ],
        [
          "Keeping both proposals later in the guide preserves the less familiar layout alongside the familiar one, giving visitors more than a single complete image.",
          "This explains why the guide retains both proposals, but not why its opening avoids presenting either as the completed mural."
        ]
      ],
      "why": "The preserved marks and positions do not distinguish between the two different completions. Opening with one completed image could therefore blur the difference between surviving evidence and a restorer's proposal. The fragment drawing shows what is fixed by evidence while leaving the underdetermined areas open; the proposals remain available later.",
      "allow": ["fit","separates","completion","evidence","does","uniquely","establish","lets","picture","locates","recorded","full","alternative","layouts","Keeping","preserves","less","layout","alongside","single"]
    },
    {
      scene: "eoi-editorial-seed-saving",
      notes: [
        "The Brindle Seed Library is preparing a guide for first-time savers of vessa vine seeds.",
        "Collectors visit once each week; seeds in green, closed pods will not sprout if collected at that stage.",
        "Brown pods with open seams contain mature seeds, but those seeds may spill before the next visit.",
        "A clear close-up shows one open pod's seam and seeds but none of the other pods on its stem.",
        "An uncropped photograph shows green closed pods beside open brown ones; small circles mark just the open brown pods.",
        "The editor selected the uncropped photograph for the collection page and the close-up for a page identifying a pod's parts.",
      ],
      goal: "justify the editor's selection of the uncropped photograph over the clear close-up for the collection page",
      key: "The circled pods may lose seeds before the next visit, while closed pods need more time; showing both guides beginners to collect selectively from a stem.",
      wrong: [
        ["The close-up makes an open seam easy to recognize, while circles on the stem photograph identify pods whose mature seeds may spill before the next visit.", "This explains how both pictures identify an open pod, but not why showing closed pods beside open ones better guides a collection decision."],
        ["The stem photograph shows green pods beside open brown ones; the clear close-up isolates an open pod so beginners can examine its seam and mature seeds.", "This describes what both photographs show and explains the close-up's clarity, but does not connect the stem image to different collection decisions for its neighboring pods."],
        ["Seeds collected from green, closed pods will not sprout, so collection advice matters even when a close-up makes each part of the pod easy to see.", "This explains the need for collection advice in general, without explaining why the uncropped photograph serves that purpose better than the close-up."],
      ],
      why: "The student must combine the cost of taking closed pods too early with the risk of losing mature seeds before a weekly return, then notice that both kinds occur on the pictured stem. The marked whole-stem view models collecting some pods while leaving others; the close-up identifies a mature pod but cannot show that selective decision.",
      allow: ["circled", "lose", "need", "time", "beginners", "selectively", "easy", "recognize", "isolates", "examine", "advice", "matters", "see"],
    },
    {
      scene: "eoi-editorial-composer-draft",
      notes: [
        "The Renwick Music House is preparing an exhibit about composer Tera Venn's revision of a passage, for visitors unfamiliar with musical notation.",
        "Her working score gives the ensemble notes in all eight bars, but crosses out its notes in the last four and substitutes rests, which indicate silence.",
        "The final published score has the ensemble play only in the first four bars.",
        "A 1998 recording has the ensemble in the first four bars and soloist alone afterward; a 2012 recording has the ensemble throughout.",
        "Both recordings use the same solo melody across all eight bars.",
        "The curator selected these excerpts, playing 2012 before 1998 and labeling each with its recording date and the score version it follows.",
      ],
      goal: "explain why the curator's chosen order traces Venn's revision even though it reverses the recordings' dates",
      key: "The 2012 excerpt matches the crossed-out scoring, while the 1998 excerpt matches the final score; that order follows revision despite reversing recording dates.",
      wrong: [
        ["The 1998 excerpt exposes the solo for four bars, while 2012 keeps the ensemble throughout; starting with 2012 makes that contrast audible to visitors.", "This explains the audible contrast in the chosen sequence but does not connect either recording to the earlier and later versions documented by the scores."],
        ["Matching the passage gives listeners a common solo line across both excerpts, while the date labels keep the two recorded performances distinct.", "This explains a useful comparison and the date labels, but it would hold in either order and does not explain why this order follows the composer's revision."],
        ["Labeling 2012 before 1998 makes the reversal in recording dates visible, so visitors can distinguish performances even though both play the same passage.", "This explains how labels disclose the reverse chronology of the recordings, but not why that chronology differs from the order of the score versions they perform."],
      ],
      why: "The working score's cancellation removes the ensemble from the last four bars. The 2012 performance includes the material before that cancellation, whereas 1998 performs the resulting final version. Ordering the excerpts by those matched features therefore traces the composer's revision even though the recording dates run backward. Recording chronology and the chronology of the music recorded are different here.",
      allow: ["matches", "scoring", "order", "despite", "reversing", "exposes", "keeps", "starting", "contrast", "audible", "Matching", "listeners", "common", "line", "distinct", "before", "reversal", "visible", "distinguish", "performances"],
    },
  ];

  const editorialChoiceNotes = synthesisFamily({
    id: "notes-explain-editorial-choice",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: explain a selection through its intended use",
    recognize: "A choice can accurately describe the selected material or explain another useful editorial decision without explaining this one. Connect the material's particular features to what its intended audience must do, including any constraint or clarification that makes the selection work.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 105,
    topics: EDITORIAL_CHOICE_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({ key: topic.key, wrong: topic.wrong }),
    // This guard checks authored wiring and grounding, not whether the
    // choice genuinely explains the decision; that requires editorial review.
    check: (topic, choices) => topic.notes.length >= 5 &&
      choices.key === topic.key &&
      choices.wrong.length === topic.wrong.length &&
      choices.wrong.every(([text, reason], index) => text === topic.wrong[index][0] && reason === topic.wrong[index][1]),
    explain: (topic) => topic.why,
    steps: [
      "Identify the selection or omission the student must explain and what the intended audience needs to do.",
      "Find the material's relevant features, the constraints on its use, and any clarification that the editor supplies.",
      "Choose the sentence that connects those details to the decision; descriptions and good reasons for a different decision are insufficient.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A selection is justified by fitness for its particular audience and purpose; material omitted there may still be useful for another purpose."),
    trap: "Mistaking an accurate description, an attractive feature, or a justification for a related decision for an explanation of the decision the goal names.",
    hint: "What must this audience be able to do with the selected material, and how do the relevant features make that possible?",
  });

  // Original scenes for revising an explanation while retaining its supported scope.
  // Insert the bank and specification inside rhetorical-synthesis.js's factory;
  // append revisedExplanationNotes to that factory's returned family array.
  const REVISED_EXPLANATION_TOPICS = [
    {
      scene: "eoi-rev-gully-seeds",
      subject: "seed dispersal in the Orven hills",
      notes: [
        "Seedlings in the Orven hills appeared mainly east of their parent shrubs, matching the prevailing wind direction.",
        "Botanists initially attributed the seedlings' distribution to wind carrying seeds.",
        "Later, cameras recorded birds depositing seeds in sheltered gullies where wind could not carry them.",
        "Mesh that excluded birds reduced seed arrivals in the gullies but not on open slopes.",
        "On open slopes, seed arrivals continued to increase with wind speed.",
      ],
      need: ["open slopes", "birds", "gullies"],
      key: "Wind still explains seed arrivals on open slopes, but birds carrying seeds to sheltered gullies require an additional dispersal mechanism.",
      old: "Seedlings appeared east of parent shrubs, matching the wind direction; seed arrivals increased with wind speed, supporting the initial wind explanation.",
      later: "Birds deposited seeds in sheltered gullies, and mesh excluding birds reduced arrivals there, providing evidence that birds contributed to seed dispersal.",
      method: "Cameras recorded birds depositing seeds, while mesh excluded birds from some areas, allowing botanists to compare seed arrivals with and without birds.",
      why: "The wind evidence remains useful on open slopes, but cannot account for the sheltered gullies. The key retains wind's supported role and uses the bird evidence to expand the explanation beyond a single dispersal mechanism.",
      allow: ["explains", "require", "additional", "dispersal", "mechanism", "supporting", "explanation", "providing", "evidence", "contributed", "areas", "allowing", "without"],
    },
    {
      scene: "eoi-rev-kiln-stripes",
      subject: "striped colors on Kelmar pottery",
      notes: [
        "Kelmar pottery has alternating dark and pale stripes; early investigators proposed that uneven firing temperatures produced the colors.",
        "In laboratory firings, hotter areas of uncoated clay became darker than cooler areas.",
        "Later chemical maps of striped vessels revealed different mineral coatings along the stripes.",
        "At a uniform firing temperature, coated replicas developed stripes matching the original vessels.",
        "The uncoated clay's color still varied with firing temperature.",
      ],
      need: ["uncoated clay", "mineral coatings", "striped vessels"],
      key: "Temperature affects uncoated clay, but mineral coatings produced stripes at uniform heat, so the striped vessels need not reflect uneven heating.",
      old: "Hotter areas of clay became darker during laboratory firings, supporting the investigators' early account of how firing temperatures affected the colors.",
      later: "Different coatings followed the stripes on the vessels, and uniformly fired replicas developed matching stripes, linking the colors to mineral coatings.",
      method: "Chemical maps identified mineral coatings on the original vessels; replicas fired at uniform temperature tested the effects of those coatings on color.",
      why: "Temperature really does affect the uncoated clay, so the original mechanism is not fictitious. The coated replicas show that the vessels' stripes do not require uneven heating. The key limits the old explanation without denying its demonstrated effect.",
      allow: ["affects", "heat", "need", "reflect", "heating", "supporting", "account", "affected", "followed", "linking", "identified", "tested", "effects"],
    },
    {
      scene: "eoi-rev-poem-variants",
      subject: "differences among copies of the poem The River Gate",
      notes: [
        "Scholars attributed all differences among surviving handwritten copies of The River Gate to errors made while those copies were produced.",
        "The earliest surviving copy dates to 1928; the copies follow two stanza orders, and repeated lines vary from copy to copy.",
        "Later, recordings of the poet at readings in 1921 and 1924 were found.",
        "The poet used one of the manuscript stanza orders throughout the 1921 reading and the other in 1924.",
        "Both recordings contain every line once; the repeated lines in manuscripts are absent from the recordings.",
      ],
      need: ["stanza orders", "repeated lines", "readings"],
      key: "Both stanza orders predate the copies; copying errors cannot originate those orders but remain a possible source of repeated lines absent from the readings.",
      old: "Some copies repeat lines never repeated in the readings, preserving evidence for copying errors even though the poet used two stanza sequences.",
      later: "The two stanza orders in the copies match readings recorded before the earliest surviving copy, placing those arrangements in the poet's performances.",
      method: "Dated recordings let scholars compare the poem as performed with later handwritten copies, using stanza order and line repetition to trace differences.",
      why: "Both stanza orders were already present in the poet's performances before any surviving copy was made, so errors introduced while making those copies cannot account for their origin. The readings contain no repeated lines, leaving that manuscript-only feature compatible with copying errors. The key uses chronology to narrow the proposed source of variation rather than treating every difference as an error.",
      allow: ["predate", "cannot", "originate", "remain", "possible", "source", "never", "preserving", "evidence", "sequences", "match", "placing", "arrangements", "performances", "recorded", "performed", "let", "poem", "repetition", "trace"],
    },
    {
      scene: "eoi-rev-pond-blooms",
      subject: "algal blooms in Sennor ponds",
      notes: [
        "Algal blooms in Sennor ponds usually followed warm spells, leading investigators to propose that rising temperature initiated the blooms.",
        "Later monitoring detected nutrient pulses from runoff before blooms in both warm and cool weather.",
        "Experimental ponds receiving nutrients developed blooms at either temperature; ponds without added nutrients did not.",
        "Among ponds receiving equal nutrient additions, algae grew faster in warmer water.",
        "Monitoring measured nutrients and temperature daily.",
      ],
      need: ["nutrient", "warmer water", "temperature"],
      key: "Nutrient additions explain bloom initiation, while faster growth in warmer water preserves a role for temperature in a bloom's subsequent development.",
      old: "Algae grew faster in warmer ponds with equal nutrients, supporting the link between warm water and blooms suggested by earlier field observations.",
      later: "Nutrient pulses preceded blooms in warm and cool weather, and ponds without added nutrients developed no blooms, linking bloom initiation to nutrients.",
      method: "Daily monitoring tracked nutrients and temperature, while experimental ponds tested nutrient additions, pairing field observations with controlled comparisons.",
      why: "The later evidence separates starting a bloom from its subsequent growth rate. Nutrients initiate the experimental blooms at either temperature; warmth accelerates growth once nutrients are available. The key changes the explanatory role of warmth instead of discarding it.",
      allow: ["explain", "initiation", "growth", "preserves", "role", "subsequent", "development", "supporting", "link", "earlier", "field", "observations", "preceded", "linking", "tracked", "tested", "pairing", "controlled", "comparisons"],
    },
    {
      scene: "eoi-rev-gallery-echo",
      subject: "lingering echoes in the Delven gallery",
      notes: [
        "The long Delven gallery had lingering echoes, which its designer attributed to the distance between its end walls.",
        "In models with identical bare surfaces, longer galleries had longer-lasting echoes.",
        "Later, fabric panels were installed in Delven without moving any walls; echoes became much shorter.",
        "The panels absorbed sound that the bare surfaces had reflected.",
        "Models fitted with the same panels still showed longer echoes as gallery length increased.",
      ],
      need: ["length", "panels", "walls"],
      key: "Length affects echoes in comparable models; Delven's panels absorbed sound and shortened echoes without moving walls, adding surfaces to the explanation.",
      old: "Longer models had longer echoes both before and after panels were fitted, supporting the designer's explanation based on the distance between walls.",
      later: "Panels absorbed sound from Delven's bare surfaces, and echoes became shorter after the panels were installed, despite the walls remaining in place.",
      method: "Models compared different lengths under matching surface conditions; Delven's installation compared echoes in the gallery before and after the panels.",
      why: "Length continues to matter in models with comparable surfaces. The change in Delven, where length remained fixed, requires absorption to join the explanation. The key states both the retained relationship and the additional causal factor.",
      allow: ["affects", "comparable", "shortened", "adding", "explanation", "supporting", "based", "despite", "remaining", "place", "matching", "conditions", "installation"],
    },
    {
      scene: "eoi-rev-clock-spring",
      subject: "slowing in an old Lerrow workshop clock",
      notes: [
        "A Lerrow workshop clock lost time; repairers initially attributed its slowing to dust in the gears.",
        "Later tests compared the old spring and a new spring with the same gears, first dusty and then cleaned.",
        "Just after winding, the clock kept time with either spring, whether the gears were dusty or clean.",
        "Near the end of a winding cycle, only the old spring with dusty gears lost time; the other combinations kept time.",
        "Separate measurements of spring force showed a much sharper fall during unwinding for the old spring than for the new one.",
      ],
      need: ["dusty gears", "spring force", "lost time"],
      key: "Dust alone cannot explain the slowing: only dusty gears with the weakening old spring lost time, indicating that dust's effect depended on spring force.",
      old: "Cleaning let the old spring keep time throughout a winding cycle, preserving support for a dust-related explanation despite its sharper fall in force.",
      later: "The new spring kept time with dusty gears even late in the cycle, showing that replacing the spring could solve the slowing without removing dust.",
      method: "The same gears were tested with both springs before and after cleaning, allowing accuracy to be compared across spring condition, dust, and winding stage.",
      why: "Dusty gears kept time with the new spring and with the freshly wound old spring, so dust alone was insufficient to produce slowing. The old spring also kept time when the gears were clean. Combining these comparisons with the force measurements supports a conditional effect: dust mattered when the old spring's force had fallen. The key revises a single-cause account into an interaction rather than simply adding two independent causes.",
      allow: ["alone", "cannot", "explain", "weakening", "indicating", "effect", "depended", "let", "throughout", "preserving", "support", "related", "explanation", "despite", "late", "replacing", "solve", "without", "removing", "allowing", "accuracy", "across", "condition", "stage", "springs"],
    },
    {
      scene: "eoi-rev-stair-wear",
      subject: "unequal wear on the Corven library's staircases",
      notes: [
        "The Corven library's east staircase was more worn than its west staircase; historians initially attributed the difference to heavier traffic on the east stairs.",
        "Later, renovation records revealed that the east stairs used softer stone than the west stairs.",
        "Laboratory tests with equal traffic produced more wear on the softer stone.",
        "Within each staircase, the steps with the most recorded traffic were also the most worn.",
        "Both staircases had been installed in the same year.",
      ],
      need: ["within", "stone", "traffic"],
      key: "Traffic explains wear within each staircase; different stone means the greater wear between staircases cannot alone establish heavier traffic on one.",
      old: "The east stairs were more worn, and the most used steps on each staircase had the most wear, supporting the earlier emphasis on traffic.",
      later: "Softer stone wore more under equal traffic in tests, and the east stairs used softer stone, providing another explanation for their greater wear.",
      method: "Tests compared stone under equal traffic, while records showed different stones but identical installation years, separating stone from age in the comparison.",
      why: "The new evidence undermines the inference from greater wear to heavier traffic when different stones are compared. It does not erase the traffic-wear relationship within a staircase. The key explicitly preserves that relationship while limiting the older comparison.",
      allow: ["explains", "means", "greater", "cannot", "alone", "establish", "supporting", "earlier", "emphasis", "wore", "providing", "explanation", "identical", "installation", "separating", "age", "comparison"],
    },
    {
      scene: "eoi-rev-play-silence",
      subject: "long silences in performances of the play The Empty Pier",
      notes: [
        "A critic attributed the length of silences at two turning points in The Empty Pier to the playwright's dramatic pacing.",
        "At both turning points, the script gives the direction 'Silence' before the next spoken line.",
        "In the first production, a revolving platform moved during both silences; stage logs show that the next line waited until the platform stopped.",
        "A later production used the same script with fixed scenery; recordings show silences at the same lines, but both were shorter.",
        "Pauses elsewhere in the dialogue had the same durations in the two recordings.",
      ],
      need: ["same lines", "shorter", "platform"],
      key: "The script explains silence placement, while shorter pauses at the same lines without platform movement limit its role in explaining their original length.",
      old: "Silences remained at the same lines despite fixed scenery in the later production, supporting the critic's link between the script and the pauses.",
      later: "Only the silences formerly used for platform movements grew shorter, linking their original length to moving scenery rather than a change in all pauses.",
      method: "The two productions used the same script but different scenery, and recordings allowed pause lengths at turning points to be compared with those elsewhere.",
      why: "The same script still locates the silences, but only the pauses once occupied by platform movements shorten on the fixed stage. Other pauses remain unchanged, so the finding is not simply a faster performance overall. Together with the stage logs, this limits the playwright-based account of duration while preserving the script's role in placement.",
      allow: ["explains", "placement", "without", "movement", "limit", "role", "explaining", "original", "remained", "despite", "supporting", "link", "formerly", "grew", "linking", "change", "allowed"],
    },
    {
      scene: "eoi-rev-canal-town",
      subject: "the growth of the town of Velridge",
      notes: [
        "A historian attributed Velridge's growth to the opening of a canal that brought freight through the town.",
        "Warehouse construction rose sharply after the canal opened.",
        "Later-discovered tax rolls showed that workshops and housing had already been expanding for a decade before the opening.",
        "Letters from that earlier decade linked the workshop expansion to demand from nearby farms.",
        "After the opening, warehouse owners consistently identified canal freight as the source of their business.",
      ],
      need: ["warehouse", "earlier", "farms"],
      key: "The canal explains warehouse expansion, but workshops serving farms grew earlier, making canal freight a later contributor rather than the origin of growth.",
      old: "Warehouses expanded after the canal opened, and owners cited freight as a source of business, supporting the historian's connection between canal and growth.",
      later: "Tax rolls and letters show workshops serving nearby farms before the canal opened, documenting a source of growth before freight arrived through the town.",
      method: "Tax rolls recorded workshops and housing before the canal opened; warehouse owners described later business, giving evidence from both periods of growth.",
      why: "The new chronology rules out the canal as the beginning of growth, while the warehouse evidence still ties a later phase to canal freight. The key recasts the canal from origin to contributor and identifies the earlier source of expansion.",
      allow: ["explains", "serving", "grew", "contributor", "origin", "cited", "supporting", "connection", "documenting", "arrived", "recorded", "evidence", "periods"],
    },
    {
      scene: "eoi-rev-tide-instrument",
      subject: "a daily shift in readings from the Marset tide gauge",
      notes: [
        "Marset's tide gauge recorded a daily afternoon rise; researchers initially attributed the pattern entirely to rising water.",
        "A second gauge using a different mechanism later recorded a smaller afternoon rise at the same site.",
        "Laboratory tests showed that warming the original gauge shifted its readings upward even when water level stayed fixed.",
        "The second gauge was unaffected by that warming, and its readings agreed with direct water-level measurements.",
        "The original gauge's casing warmed each afternoon; both gauges were mounted at the same height.",
      ],
      need: ["smaller", "rise", "original gauge"],
      key: "Direct measurements confirm a smaller actual rise; the original gauge's temperature response explains the excess, limiting the account of water movement.",
      old: "The second gauge agreed with direct readings despite the original gauge's heat response, preserving evidence for a daily rise at the measurement site.",
      later: "The original gauge warmed each afternoon, and warming raised its readings at fixed water level in tests, linking part of the field signal to heat.",
      method: "Researchers checked the original gauge against direct readings and a second gauge unaffected by warming, connecting laboratory tests with field comparisons.",
      why: "Direct measurements corroborate part of the original signal; the temperature test explains its excess. The key preserves the physical rise while withdrawing the claim that physical water movement accounts for the entire recorded rise.",
      allow: ["confirm", "actual", "temperature", "response", "explains", "excess", "limiting", "account", "movement", "heat", "preserving", "evidence", "despite", "measurement", "raised", "linking", "part", "field", "signal", "checked", "against", "connecting", "comparisons"],
    },
  ];

  const revisedExplanationNotes = synthesisFamily({
    id: "notes-revise-explanation",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: revise an explanation without discarding its supported role",
    recognize: "Separate the earlier explanation's supported role from the broader claim that later evidence changes. Connect the new causal distinction to the old explanation's surviving scope.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "too-narrow"],
    seconds: 110,
    topics: REVISED_EXPLANATION_TOPICS,
    goal: (topic) => `explain how later evidence modifies the earlier explanation of ${topic.subject}`,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.old, "This accurately supports a role for the earlier explanation, but does not say how the later evidence changes that explanation's scope."],
        [topic.later, "This accurately presents the later evidence, but does not connect the resulting revision to the role the earlier explanation still retains."],
        [topic.method, "This accurately describes the investigation or evidence sources, but does not state both the revised explanation and the earlier explanation's surviving role."],
      ],
    }),
    check: (topic, choices) => needCheck(topic, choices) &&
      choices.wrong.map(([text]) => text).join("|") === [topic.old, topic.later, topic.method].join("|"),
    explain: (topic) => topic.why,
    steps: [
      "Identify the earlier explanation and the observations it originally accounted for.",
      "Determine which part of that account the later evidence changes: its cause, attribution, timing, magnitude, or range of application.",
      "Find the evidence that still supports a narrower role for the earlier explanation.",
      "Choose the sentence that connects the needed revision with that surviving role, rather than only defending the old explanation, reporting the new evidence, or describing methods.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("Later evidence can limit or extend an explanation without making every part of it false; express the revised relationship between causes and observations."),
    trap: "Treating a strong account of the new evidence as a complete revision when it leaves the old explanation's still-supported role unstated.",
    hint: "Which part of the earlier account remains supported, and which part must change?",
  });

  // The comparisons are all accurate. The writer must choose the one that
  // illustrates the requested explanation using a relevant, comparable pair.
  // `need` identifies that pair; the shared lexical guard checks every option.
  const DIAGNOSTIC_COMPARISON_TOPICS = [
  {
    "scene": "eoi-diagnostic-archive-catalogs",
    "allow": [
      "lead",
      "passed",
      "changed",
      "hands",
      "throughout",
      "testing",
      "already",
      "whether",
      "led"
    ],
    "goal": "illustrate why the archivist associates faster routine searches with catalog arrangement rather than a team's prior experience",
    "notes": [
      "Two archive teams searched equivalent sets of entries in two rounds. East had more archive experience than West.",
      "Cedar grouped entries geographically; Alder ordered them alphabetically. Both catalogs covered the same collection and had photographs.",
      "In the first round, East used Cedar and finished routine searches before West, which used Alder.",
      "The teams swapped catalogs for the second round: West finished routine searches before East.",
      "Both teams completed their second round faster than their first. East was faster at finding rare entries in both rounds."
    ],
    "evidence": [
      "East",
      "West",
      "Cedar"
    ],
    "key": "The lead in routine searches passed from East to West when Cedar changed hands, though East had more archive experience throughout the two rounds.",
    "joint": "East's first routine searches with Cedar were faster than West's with Alder, and East also found rare entries faster in both rounds of testing.",
    "other": "Both teams finished routine searches faster in their second round, after each had already searched one set of entries with one of the catalogs.",
    "baseline": "East found rare entries faster in both rounds, whether it used Cedar or Alder, while West led routine searches only in the second round.",
    "reasons": [
      "The first-round comparison combines the catalog with the experience advantage. East's consistent lead on rare entries does not separate those explanations for routine searches.",
      "A general second-round improvement can reflect practice. It does not show that the team using Cedar led in each round, despite the change of team.",
      "East's stable advantage on rare entries concerns a different search task. The requested explanation concerns the routine-search lead, which changed teams with Cedar."
    ],
    "why": "Combine the two rounds: the routine-search lead followed Cedar from East to West, while the experience advantage remained with East. That pattern supports the arrangement explanation more directly than either the first-round lead or general improvement with practice. It does not establish that arrangement was the only influence."
  },
  {
    "scene": "eoi-diagnostic-seed-cards",
    "allow": [
      "gaining",
      "finished",
      "contained",
      "fell",
      "remained"
    ],
    "goal": "illustrate why the instructor sees evidence that diagrams helped the initially less accurate group, despite that group remaining behind on the final planting",
    "notes": [
      "Two groups of beginners, Indigo and Mallow, planted two equivalent sets of seeds. All instructions used the same technical wording.",
      "Both groups used text-only cards for the first planting. Indigo made many more depth errors than Mallow.",
      "Indigo received diagrams with its text for the second planting; Mallow continued with text alone. Both groups received the same feedback between plantings.",
      "On the second planting, both groups made fewer depth errors. Indigo now made only slightly more errors than Mallow.",
      "Mallow also planted faster than Indigo on both occasions. Indigo's second planting was faster than its first."
    ],
    "evidence": [
      "Indigo",
      "Mallow",
      "diagrams"
    ],
    "key": "Indigo made many more errors than Mallow at first but only slightly more after gaining diagrams; Mallow used text alone on both plantings.",
    "joint": "Indigo made fewer errors and finished faster on its second planting with diagrams than on its first planting, when the card contained text alone.",
    "other": "Mallow made fewer errors and planted faster than Indigo on the second planting, although Mallow's card used text alone and Indigo's included diagrams.",
    "baseline": "Mallow's errors fell between plantings while its card remained text-only, and its second planting still had fewer errors than Indigo's first planting.",
    "reasons": [
      "Indigo's own improvement also follows feedback and another planting attempt. Without Mallow's change as a reference, the comparison cannot distinguish the added diagrams from general improvement.",
      "This compares final performance without the initial gap. Mallow was already more accurate, so retaining a small lead does not show which group improved more.",
      "Mallow's improvement describes the reference group's change, but comparing its second planting with Indigo's first mixes occasions and does not show how the gap changed."
    ],
    "why": "Indigo began with many more errors and ended with only slightly more, while Mallow improved too. The narrowing gap indicates a larger improvement for the group receiving diagrams. That comparison is relevant to the instructor's explanation, whereas a final ranking or Indigo's change alone overlooks the initial gap or shared feedback."
  },
  {
    "scene": "eoi-diagnostic-theater-rehearsals",
    "allow": [
      "trailed",
      "led",
      "ended",
      "lost",
      "initial",
      "exceeded",
      "since",
      "without"
    ],
    "goal": "illustrate why the director associates spreading rehearsal across days with less loss of unaided recall over the following week, rather than an advantage already present when rehearsal ended",
    "notes": [
      "Lark and Rook learned the same unfamiliar lines with equal total rehearsal time and the same written feedback; Lark rehearsed across days, Rook in one session.",
      "Immediately after rehearsal and a week later, both groups took identical recall tests: unaided first, then with the same prompts.",
      "On the immediate unaided test, Rook recalled more lines than Lark; on the prompted test, they recalled equally many.",
      "A week later, Lark recalled more lines than Rook unaided, while prompted recall was again equal.",
      "Both groups' unaided counts fell between tests. Neither group rehearsed or studied the lines between the tests.",
      "On the later test, either group's prompted count exceeded both groups' unaided counts."
    ],
    "evidence": [
      "Lark",
      "Rook",
      "unaided",
      "week"
    ],
    "key": "Lark trailed Rook in unaided recall when rehearsals ended but led on unaided recall a week later, after both groups had lost some initial recall.",
    "joint": "Lark recalled more lines with prompts a week later than Rook recalled without them then, though the groups had equal rehearsal time and feedback.",
    "other": "A week after rehearsal, Lark recalled more lines without prompts than Rook, although both groups had lost some unaided recall since rehearsals ended.",
    "baseline": "Lark's unaided recall at the end of rehearsal exceeded Rook's a week later, though both groups rehearsed the same lines for the same total time.",
    "reasons": [
      "The later prompted count for Lark exceeds Rook's unaided count, but changing the assistance makes this an unsuitable comparison of recall loss. It also omits each group's immediate unaided baseline.",
      "This final ranking could, by itself, reflect an advantage already present immediately after rehearsal. Saying that both groups lost some recall does not compare their losses; the initial ranking is needed.",
      "This compares Lark's immediate count with Rook's later count. An earlier-to-later difference mixes groups with retention intervals and does not show which group lost more relative to its own baseline."
    ],
    "why": "Rook led on immediate unaided recall, but Lark led on the identical week-later test. Because both counts fell without further rehearsal, that reversal implies a larger loss for Rook. The key combines the two rankings and their common decline, distinguishing less loss from an initial head start. The other sentences omit the initial ranking or compare different assistance or test occasions."
  },
  {
    "scene": "eoi-diagnostic-water-models",
    "allow": [
      "barely",
      "paired",
      "declines",
      "left"
    ],
    "goal": "illustrate why the designer links the change in sediment escape to the barriers' trapping action rather than to weaker incoming flow",
    "notes": [
      "A designer added interior barriers to a model tank. Its outgoing sediment contained coarse and fine particles.",
      "The barriers could trap coarse particles, but their openings were too wide to trap fine particles.",
      "A separate flow test showed that weaker incoming flow reduced escape of both particle sizes by similar shares.",
      "After barriers were added, coarse-particle escape fell sharply while fine-particle escape changed very little. Incoming flow was not measured during that test.",
      "Fine particles remained more numerous than coarse particles in the outgoing water. Total sediment escape also fell after the barriers were added."
    ],
    "evidence": [
      "fine",
      "coarse",
      "flow"
    ],
    "key": "Coarse-particle escape fell sharply while fine-particle escape barely changed after barriers were added, unlike the paired declines in the weaker-flow test.",
    "joint": "Total sediment escape fell after barriers were added, as it also fell in the separate weaker-flow test, which reduced escape of both particle sizes.",
    "other": "Fine particles remained more numerous than coarse particles after barriers were added, though the barriers could trap coarse particles but not fine ones.",
    "baseline": "The weaker-flow test reduced escape of both particle sizes by similar shares, although more fine than coarse particles left the tank after barriers were added.",
    "reasons": [
      "A total decline is compatible with both proposed explanations. It omits the different responses of the particle sizes that distinguish trapping from weaker flow.",
      "The final abundance of fine particles is not their change from the earlier test. Without comparing the changes, the sentence does not distinguish the explanations.",
      "The sentence compares a response to weaker flow with a final abundance ranking after barriers. Those are different baselines, so it does not compare the two response patterns."
    ],
    "why": "Trapping and weaker flow both allow a total decline, so that result alone cannot distinguish them. The key compares the two particle-size responses: only coarse escape fell sharply after barriers, whereas weaker flow reduced both sizes similarly. That selective pattern fits the stated trapping mechanism; it is not a direct measurement proving that flow stayed constant."
  },
  {
    "scene": "eoi-diagnostic-poem-translations",
    "allow": [
      "contained",
      "exactly"
    ],
    "goal": "illustrate the editor's view that retaining line breaks aids recognition of repeated images across levels of prior familiarity",
    "notes": [
      "Plum retained a poem's line breaks; Willow presented the same words as prose. An editor tested recognition of repeated images.",
      "Some readers already knew the poem, and others were encountering it for the first time. Most Willow readers already knew it; most Plum readers did not.",
      "Among readers new to the poem, Plum readers recognized more images than Willow readers.",
      "Among readers who already knew the poem, Plum readers also recognized more images than Willow readers.",
      "Across all readers pooled together, Willow readers recognized more images. With either version, familiar readers recognized more images than new readers."
    ],
    "evidence": [
      "Plum",
      "Willow",
      "new"
    ],
    "key": "Plum readers recognized more images than Willow readers both among those new to the poem and among those who already knew it before the test.",
    "joint": "Plum readers familiar with the poem recognized more images than Willow readers new to it, although both versions contained exactly the same words.",
    "other": "Readers familiar with the poem recognized more images than new readers with either version, although Plum retained line breaks and Willow used prose.",
    "baseline": "Most Willow readers knew the poem already, while most Plum readers were new to it, and familiar readers recognized more images with either version.",
    "reasons": [
      "This compares familiar Plum readers with new Willow readers, combining layout with the familiarity advantage. It does not show the layout association at either matching familiarity level.",
      "This establishes a familiarity advantage within each layout, reversing the comparison the writer needs: the layout advantage within each familiarity level.",
      "The sentence describes reader composition and familiarity's association with recognition. It does not compare Plum with Willow among readers at either matching familiarity level."
    ],
    "why": "Compare the layouts separately among new readers and familiar readers. Plum leads within both groups, which illustrates a layout advantage across familiarity levels. The pooled ranking mixes those comparisons with different group proportions."
  },
  {
    "scene": "eoi-diagnostic-roof-tiles",
    "allow": [
      "thicknesses",
      "equally",
      "surfaces",
      "equal"
    ],
    "goal": "illustrate why the manufacturer associates texture with faster drying across tile thicknesses rather than crediting the overall ranking of batches",
    "notes": [
      "A manufacturer compared textured Elm tiles with smooth Pine tiles. Each batch included thick and thin tiles, all soaked and dried under one procedure.",
      "Most Elm tiles were thick; most Pine tiles were thin. Thin tiles generally dried faster than thick tiles.",
      "Among thick tiles, Elm dried faster than Pine. Among thin tiles, Elm also dried faster than Pine.",
      "When all tiles in each batch were pooled, Pine's average drying time was shorter than Elm's.",
      "Within each batch, thin tiles dried faster than thick tiles. The batches contained the same total number of tiles."
    ],
    "evidence": [
      "Elm",
      "Pine",
      "thick",
      "thin"
    ],
    "key": "Elm dried faster than Pine within the thick tiles and within the thin tiles, though pooling the thicknesses gave Pine the shorter average drying time.",
    "joint": "Thin Elm tiles dried faster than thick Pine tiles after both were soaked and dried by one procedure, and the batches contained equally many tiles.",
    "other": "Thin tiles dried faster than thick tiles within Elm and within Pine, though the two batches had different surfaces and equal total numbers of tiles.",
    "baseline": "Most tiles in Elm were thick and most in Pine were thin; thin tiles dried faster than thick tiles within each of the two batches.",
    "reasons": [
      "Thin Elm is compared with thick Pine, so the result combines the surface and thickness advantages. Equal batch sizes and the shared procedure do not remove that confound.",
      "This compares thicknesses within surfaces. The goal requires the other direction: compare surfaces at each thickness to assess whether the texture association spans thicknesses.",
      "The sentence explains why composition matters to pooled results but supplies neither of the within-thickness surface comparisons needed for the writer's explanation."
    ],
    "why": "The relevant comparison crosses Elm and Pine at each thickness, rather than comparing thick and thin tiles inside each batch. Elm dries faster in both within-thickness comparisons, supporting the texture association across thicknesses. Equal batch sizes do not make their different thickness proportions comparable."
  },
  {
    "scene": "eoi-diagnostic-return-stations",
    "allow": [
      "shifted",
      "moved",
      "despite",
      "customary",
      "lead",
      "trying",
      "stayed",
      "fixed",
      "changed"
    ],
    "goal": "illustrate why the manager associates a higher cup-return share with station location rather than one cafe's customary advantage",
    "notes": [
      "Copper and Slate cafes tested return stations during two weeks, measuring the share of borrowed cups returned by closing.",
      "Copper ordinarily had a higher return share than Slate. In the first week, Copper placed stations beside exits and Slate placed them beside counters.",
      "Copper had the higher return share that week.",
      "For the second week, the cafes exchanged station locations but kept their signs and cup policies. Slate then had the higher return share.",
      "Each cafe's return share was higher in the second week than in the first. Copper lent more cups than Slate in both weeks."
    ],
    "evidence": [
      "Copper",
      "Slate",
      "exit"
    ],
    "key": "The higher return share shifted from Copper to Slate when exit stations moved to Slate, despite Copper's customary lead before the two-week test.",
    "joint": "Copper had a higher return share than Slate in the first week with exit stations, and it also lent more cups than Slate in both weeks.",
    "other": "Both cafes had higher return shares in the second week after trying one station location for a week, though their signs and cup policies stayed fixed.",
    "baseline": "Copper lent more cups than Slate in each week, although Slate had the higher return share in the second week after the station locations changed.",
    "reasons": [
      "The first week combines Copper's customary advantage with the exit location. The number of cups lent is another measure and does not separate those explanations.",
      "An improvement at both cafes in the later week does not identify the location associated with their relative lead. General practice or a week effect could also fit it.",
      "Lending more cups measures activity rather than the share returned. This sentence does not combine the two return-share comparisons that show the lead moving with the exit stations."
    ],
    "why": "The lead in return share moves from Copper to Slate when the exit location moves, even though Copper ordinarily leads. Reading both weeks together makes the location association more persuasive than a first-week comparison or a general second-week improvement. The pattern supports the association without proving that no other week-to-week influence mattered."
  },
  {
    "scene": "eoi-diagnostic-bird-recordings",
    "allow": [
      "better",
      "cases",
      "presented"
    ],
    "goal": "illustrate why the archivist associates better call identification with filtering rather than simply hearing a recording again",
    "notes": [
      "An archivist made raw and filtered copies of the same bird-call recording from each of two microphones, an older one and a newer one.",
      "In an earlier test using raw copies alone, listeners identified more calls on a second hearing than on a first hearing.",
      "For the older microphone's recording, listeners heard the filtered copy first and the raw copy second. They identified more calls in the first copy.",
      "For the newer microphone's recording, other listeners heard the raw copy first and the filtered copy second. They identified more calls in the second copy.",
      "Both copies from the newer microphone yielded more identifications than either copy from the older one. All copies were played at the same volume."
    ],
    "evidence": [
      "older",
      "newer",
      "filtered"
    ],
    "key": "The better-identified copy was heard first with the older microphone and second with the newer one; in both cases it was the filtered copy.",
    "joint": "Listeners identified more calls in the newer microphone's filtered copy on a second hearing than in its raw copy on the first hearing.",
    "other": "Both copies from the newer microphone yielded more identifications than either older-microphone copy, although all copies were played at the same volume.",
    "baseline": "Listeners identified more calls on a second hearing in the earlier raw-copy test and in the newer-microphone test, which presented the raw copy first.",
    "reasons": [
      "In this half of the test, filtering and a second hearing occur together. The comparison fits both the filtering explanation and the practice benefit already seen with raw copies.",
      "This comparison concerns microphones, not which copy led as listening order reversed. It can be true without distinguishing filtering from repeated exposure.",
      "Both comparisons describe a second-hearing advantage. They omit the older-microphone result, where the filtered copy led despite being heard first."
    ],
    "why": "Follow the filtered copy across the reversed orders: it leads when first for the older microphone and when second for the newer one. A general advantage from hearing a recording again cannot alone account for that pair of observations. The second-hearing result by itself combines filtering with practice, and cross-microphone totals answer a different question."
  },
  {
    "scene": "eoi-diagnostic-bread-resting",
    "allow": [
      "began",
      "firmed",
      "reversing",
      "order",
      "despite",
      "initial",
      "softness",
      "advantage",
      "stored",
      "shorter"
    ],
    "goal": "illustrate why the baker associates a longer dough rest with slower firming during storage rather than with a softer loaf at the start",
    "notes": [
      "Maple and Rowan loaves used the same flour blend and baking procedure. Maple had a short dough rest and Rowan a long rest.",
      "After complete cooling, Maple was softer than Rowan. The loaves then spent the same interval in identical storage.",
      "At the end, both batches were firmer than at the start, but Rowan was now softer than Maple.",
      "A third batch, Hazel, used a different flour blend and a long rest; it was softer than both Maple and Rowan before and after storage.",
      "All batches had the same loaf size and storage interval. No loaves were tasted warm."
    ],
    "evidence": [
      "Rowan",
      "Maple",
      "firmer",
      "softer"
    ],
    "key": "Rowan began firmer than Maple but ended softer after both firmed in storage, reversing the starting order despite Maple's initial softness advantage.",
    "joint": "After storage, long-rest Hazel was softer than short-rest Maple, and both had been stored for the same interval after complete cooling.",
    "other": "Maple was softer than Rowan after cooling and before storage, although Maple's dough rest was shorter and both used the same flour blend.",
    "baseline": "Both Rowan and Maple were firmer after storage than before, although their dough rests differed and all loaves were tasted only after complete cooling.",
    "reasons": [
      "Hazel differs from Maple in flour and begins softer. Its softer final state does not show that it firmed less relative to its own starting point.",
      "This is the initial ranking. It omits the later reversal that makes a claim about firming during storage possible.",
      "Both batches firmed, but that common direction does not compare how much they changed. The reversal of their ranking is the informative contrast."
    ],
    "why": "Rowan starts firmer yet finishes softer while both batches firm. That reversal means Maple firmed more over the shared interval; the result cannot be explained by Rowan having started softer. The chosen sentence therefore illustrates slower firming associated with the long rest without relying on a different flour blend or a final softness ranking alone."
  },
  {
    "scene": "eoi-diagnostic-history-audio",
    "allow": [
      "listening",
      "time",
      "matched",
      "either",
      "reduced",
      "relative"
    ],
    "goal": "illustrate why the producer thinks date cues help listeners reconstruct an interrupted sequence rather than merely providing more listening time",
    "notes": [
      "A producer made brief and extended recordings of two unfamiliar historical accounts: one narrated events chronologically, and one interrupted its chronology with flashbacks.",
      "One extended version added spoken dates; another added pauses of equal total duration without dates. All listeners later ordered events without other materials.",
      "For the chronological account, both extended versions produced equally few ordering errors, fewer than the brief version.",
      "For the interrupted account, the date version produced fewer errors than the pause version; both improved on the brief version.",
      "The chronological account produced fewer errors than the interrupted account with every version. Listeners heard each account once."
    ],
    "evidence": [
      "Dates",
      "pauses",
      "interrupted",
      "chronological"
    ],
    "key": "Dates improved on pauses for the interrupted account but not the chronological one, although the added listening time matched in both extended versions.",
    "joint": "The date version produced fewer errors than the brief version for both accounts; the chronological account still had fewer errors than the interrupted one.",
    "other": "The chronological account had fewer errors than the interrupted one with either extended version, although both accounts were unfamiliar to the listeners.",
    "baseline": "Adding pauses reduced errors relative to the brief version for both accounts, though the interrupted account still had more errors than the chronological one.",
    "reasons": [
      "Dates and additional time are combined in the comparison with the brief versions. It does not use the pause versions to separate those explanations.",
      "This compares the accounts' overall difficulty. It does not compare what dates add beyond pauses within each account.",
      "The pause benefit shows that additional time helps, but the writer needs the extra benefit associated specifically with dates in the interrupted account."
    ],
    "why": "Compare dates with equally long pauses within each account, then compare those differences. Only the interrupted account gains from dates beyond the pause benefit. That pattern specifically supports the explanation about reconstructing chronology, whereas improvement over a brief version combines dates with extra listening time."
  }
];

  const diagnosticComparisonNotes = synthesisFamily({
    id: "notes-select-diagnostic-comparison",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: choose an informative comparison for an explanation",
    recognize: "All four sentences report accurate comparisons, but their baselines answer different questions. Connect results across rounds, starting points, groups, or conditions to identify the comparison that distinguishes the requested explanation from its rival; an overall ranking or improvement alone may fit both.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 110,
    topics: DIAGNOSTIC_COMPARISON_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({
      key: topic.key,
      wrong: [topic.joint, topic.other, topic.baseline].map((text, index) => [text, topic.reasons[index]]),
    }),
    check: (topic, choices) => topic.notes.length >= 5 && topic.reasons.length === 3 &&
      topic.evidence.every((marker) => has(topic.notes.join(" "), marker) && has(choices.key, marker)) &&
      choices.key === topic.key &&
      choices.wrong.map(([text]) => text).join("|") === [topic.joint, topic.other, topic.baseline].join("|"),
    explain: (topic) => topic.why,
    steps: [
      "Identify the explanatory purpose and which rival interpretation the selected comparison must address.",
      "Trace each result back to its starting point, group, occasion, or condition; distinguish a final ranking from a change and an overall result from comparisons within groups.",
      "Combine the relevant comparisons and ask which pattern the rival explanation could also produce; choose the sentence presenting the informative pattern instead.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("An accurate comparison serves an explanatory purpose only if its relevant differences concern the explanation and its baseline is comparable."),
    trap: "Treating the best final result, an overall ranking, or improvement over time as an informative comparison without checking what happened relative to a relevant baseline.",
    hint: "Does the sentence compare the relevant changes, groups, or occasions, or only report a final ranking that could fit more than one explanation?",
  });

  const DISAGREEMENT_TOPICS = [
    {
      "scene": "eoi-disagreement-harbor-hours",
      "goal": "identify the precise disagreement about what the late ledger establishes about the ordinance's effect after the freeze",
      "notes": [
        "Historians Mira Sen and Tomas Vale study the invented port of Orven, where a bell ordinance shortened unloading hours.",
        "Both accept that shortened hours reduced unloadings before the harbor froze.",
        "After the freeze, the ledger lists refused at the bell beside handwritten arrival times, but also beside voyages canceled because of ice.",
        "Sen counts the refusal entries as ships turned away after arriving late; she reads the handwritten times as actual arrivals.",
        "Vale matches those times to a printed schedule and treats them as planned arrivals; he notes that canceled ships never reached the bell.",
        "Both accept the late decline in unloading and the ice cancellations; neither claims the ordinance was withdrawn."
      ],
      "anchors": [
        "Sen",
        "Vale",
        "ordinance",
        "ice"
      ],
      "key": "Sen counts the entries as evidence of a continued ordinance effect; Vale finds that planned arrivals cannot separate that effect from ice cancellations.",
      "wrong": [
        [
          "Sen and Vale accept both an early ordinance effect and later ice cancellations, although Sen counts refusal entries and Vale consults the printed schedule.",
          "This accurately pairs shared historical conclusions with different procedures, but it does not say whether the late entries establish an additional ordinance effect."
        ],
        [
          "Sen reads the handwritten times as actual arrivals, whereas Vale matches those times to planned arrivals; both accept that some voyages were canceled.",
          "This identifies the records' disputed meaning. It stops before explaining why that meaning matters for attributing the late unloading decline to the ordinance."
        ],
        [
          "Sen attributes the early decline to shortened hours, whereas Vale accepts that canceled ships never reached the bell; neither calls the ordinance withdrawn.",
          "The claims concern an earlier effect and later cancellations, and are compatible. They do not state the disputed evidentiary value of the late refusal entries."
        ]
      ],
      "why": "A record of a ship actually arriving and being refused could show a continuing bell restriction. A scheduled arrival copied beside an ice-canceled voyage cannot do that. Sen treats the entries as the former; Vale's schedule comparison makes them compatible with the latter. The disagreement concerns what the ledger establishes, not whether the ordinance remained in force or ice reduced unloading.",
      "allow": [
        "evidence",
        "continued",
        "effect",
        "separate",
        "early",
        "later",
        "consults",
        "attributes",
        "cannot"
      ]
    },
    {
      "scene": "eoi-disagreement-novel-departure",
      "goal": "identify the precise disagreement about whether the light correction independently supports the narrator's firsthand account",
      "notes": [
        "Critics Dena Orr and Malik Venn discuss notebooks in the invented novel The Glass Ferry.",
        "A later copy contains a changed departure date in the main text and a marginal correction of the order of harbor lights.",
        "Both critics accept the corrected light order; it can be reconstructed from a harbor diagram and the boat's route.",
        "The diagram appeared after the original notebook and a letter mentioning a change beside the departure, but before the surviving copy.",
        "Orr reads the letter as referring to the light correction; Venn reads it as referring to the changed date.",
        "Venn matches the margin's ink to the copyist's additions; Orr considers the copyist to have reproduced an earlier annotation.",
        "The marginal note speaks in the narrator's first person; the copyist used that voice in other additions."
      ],
      "anchors": [
        "Orr",
        "Venn",
        "correction",
        "diagram",
        "voice"
      ],
      "key": "Orr's reading places the light correction before the diagram; Venn's allows its reconstruction in the narrator's voice without establishing firsthand memory.",
      "wrong": [
        [
          "Orr links the letter to the light correction, whereas Venn links it to the changed date; both date the letter before the diagram.",
          "This accurately contrasts the letter's disputed reference, but does not connect that reference to the diagram's availability or the limits of a firsthand inference."
        ],
        [
          "Orr reads the margin as an earlier annotation recopied, whereas Venn matches its ink to later additions; both accept the correct light order.",
          "This accurately compares readings of the annotation's origin and physical ink. It stops before explaining their different implications for an account independent of the diagram."
        ],
        [
          "Both Orr and Venn date the copy after the diagram and accept that its corrected light order can be reconstructed from that diagram and route.",
          "These are shared facts about the surviving copy and a possible reconstruction. They do not resolve whether the correction's content already existed before the diagram, which is the disputed source of independent support."
        ]
      ],
      "why": "The date of the physical copy does not by itself date the correction's content. Orr links the earlier letter to the light correction, giving that content a source before the diagram. Venn instead links the letter to a different correction and associates the margin with later additions. Since the diagram and route reproduce the view and the copyist also uses the narrator's voice, Venn's reading permits reconstruction without establishing firsthand memory. Neither reading proves whether the narrator personally experienced the departure.",
      "allow": [
        "reading",
        "places",
        "allows",
        "reconstruction",
        "without",
        "establishing",
        "firsthand",
        "memory",
        "links",
        "recopied",
        "correct"
      ]
    },
    {
      scene: "eoi-disagreement-pottery-stamps",
      goal: "identify how the archaeologists differ about what the outlying stamp establishes about its source",
      notes: [
        "Archaeologists Irena Pell and Oren Dast study stamped bowls from the invented Lerran valley.",
        "Both accept that central apprentices used a stamp before a kiln tax later required independent potters to stamp bowls.",
        "Both regard an outlying stamp made before the tax as evidence of apprenticeship; after the tax, independent compliance is equally possible.",
        "An outlying bowl contains a clay seal dated before the tax but appears in an assembly record dated after it.",
        "Pell takes the seal's date as the bowl's date; Dast accepts that the seal is old but regards it as reused in a later bowl.",
        "Both agree that the tax prescribed no particular stamp shape.",
      ],
      anchors: ["Pell", "Dast", "stamp", "apprenticeship", "tax"],
      key: "Pell treats the outlying stamp as apprenticeship evidence; Dast considers tax compliance equally possible because the assembled bowl is later.",
      wrong: [
        ["Pell and Dast accept central apprenticeship before the tax, but Pell dates the bowl by its seal and Dast by its assembly record.", "This accurately contrasts dating evidence but does not apply the agreed before-tax and after-tax standards for interpreting the stamp's source."],
        ["Pell dates the clay seal before the tax, whereas Dast dates the assembled bowl afterward; neither disputes that old seal's date.", "These dates concern different objects and are compatible. The sentence does not identify what their conflicting bowl dates imply about the source of its stamp."],
        ["Pell and Dast consider apprenticeship possible before the tax and independent compliance possible afterward, while the tax prescribed no stamp shape.", "This describes their shared interpretive possibilities, leaving unstated which possibility each dating makes available for this particular bowl."],
      ],
      why: "The seal's date and the assembled bowl's date are different quantities. Pell's reading puts the stamp before the tax, where both scholars accept it as apprenticeship evidence. Dast's reused-seal reading puts it afterward, leaving independent tax compliance equally possible. The key preserves that uncertainty rather than declaring compliance proved.",
      allow: ["treats", "considers", "assembled", "neither", "afterward", "disputes"],
    },
    {
      scene: "eoi-disagreement-marsh-channels",
      goal: "identify what the ecologists' readings imply about whether new sediment was necessary for the reed expansion",
      notes: [
        "Ecologists Lila Chen and Eren Sol study the invented Darel marsh, where channels lowered salinity and reed cover expanded.",
        "Both accept that lower salinity alone permits expansion without new sediment on firm mud, whereas soft mud also needs new sediment for roots to establish.",
        "A survey classifies sheltered plots as firm and exposed plots as soft.",
        "The reed records use plot numbers but do not name sheltered or exposed plots.",
        "Chen applies the original numbering key, which places those numbers in sheltered plots; Sol applies a later numbering table, which places them in exposed plots.",
        "Both accept the survey's mud classifications and the salinity measurements.",
      ],
      anchors: ["Chen", "Sol", "salinity", "sediment"],
      key: "Chen's plot reading permits the reed expansion from lower salinity without new sediment, whereas Sol's plot reading makes new sediment necessary for roots.",
      wrong: [
        ["Both Chen and Sol accept that salinity fell and reed cover expanded, although Chen uses the original numbering key and Sol uses the later numbering table.", "This accurately contrasts their mapping sources and reports the measured change. It does not connect the resulting plot classifications to sediment's necessity."],
        ["Chen places the reed numbers in sheltered plots, whereas Sol accepts that soft mud needs new sediment for roots; both accept the mud classifications.", "This compares one ecologist's plot reading with a condition both accept, without applying the condition to Sol's exposed plots or stating their different conclusions."],
        ["Chen accepts expansion without new sediment on firm mud, whereas Sol accepts a need for new sediment on soft mud; both use these same conditions.", "The conditions describe different types of mud and are compatible. The choice does not determine which condition each ecologist applies to the actual reed expansion."],
      ],
      why: "The plot numbers must first be mapped to sheltered or exposed locations, then those locations to firm or soft mud. Only then does the shared growth condition settle sediment's necessity. Chen's mapping reaches the firm-mud case; Sol's reaches the soft-mud case. The key preserves new sediment, since neither interpretation says roots can establish without any sediment at all.",
      allow: ["reading", "necessary", "fell", "need", "conditions"],
    },
    {
      "scene": "eoi-disagreement-mural-pigment",
      "goal": "identify the precise disagreement about whether the border belonged to the mural's original design",
      "notes": [
        "Conservators Nara Bell and Soren Ives examine the invented West Hall mural's blue border and central panel.",
        "Both date the visible border paint to a restoration long after the original panel; stored pigment was available in both periods.",
        "Beneath the later paint, shallow grooves repeat motifs found beneath the original panel.",
        "Bell aligns broken grooves across the panel-border joint into an uninterrupted layout; she calls the restoration repainting an existing border.",
        "Ives traces the repeated motifs to a movable workshop template also used on later objects; he accepts the match but questions whether it establishes one original design.",
        "Both accept the paint's later date and the workshop's use of templates."
      ],
      "anchors": [
        "Bell",
        "Ives",
        "grooves",
        "original",
        "template"
      ],
      "key": "Bell treats matching grooves as evidence of an original border; Ives treats template reuse as a reason the match need not establish an original design.",
      "wrong": [
        [
          "Bell and Ives date the visible border paint after the original panel, although Bell aligns the underlying grooves and Ives traces their motifs to a template.",
          "This compares the current paint's date and the investigative methods. It does not distinguish agreement about surviving paint from disagreement about the earlier design."
        ],
        [
          "Bell identifies motifs beneath the original panel, whereas Ives dates the visible border paint to a later restoration; both accept that pigment was stored.",
          "These accurate claims concern different layers and can coexist. They do not locate the disagreement about whether the later paint restores an earlier border."
        ],
        [
          "Bell calls the restoration repainting an existing border, while Ives accepts that the matching motifs appear beneath paint in both the border and panel.",
          "This gives Bell's interpretation and evidence Ives also accepts, but omits why Ives finds that match insufficient to establish a single original design."
        ]
      ],
      "why": "The age of the visible paint is agreed, so it cannot be the disagreement. Bell reads the aligned grooves as an earlier continuous layout that the restoration repainted. Ives's movable-template comparison supplies another source for matching motifs, leaving an original border unestablished. Ives questions the inference rather than proving that no original border existed.",
      "allow": [
        "treats",
        "matching",
        "evidence",
        "reuse",
        "reason",
        "underlying",
        "identifies",
        "appear",
        "need"
      ]
    },
    {
      scene: "eoi-disagreement-river-map",
      goal: "identify what the historians' source attributions imply about why the lower river is drawn straight",
      notes: [
        "Map historians Talia Rusk and Emil Noor study an invented traveler's map of the Halen River, whose lower reach is drawn straight beside dense harbor labels.",
        "Both accept the traveler's rule: unvisited reaches were drawn straight; visited bends could be straightened to make room for labels.",
        "Both treat the surviving papers as a complete record of the traveler's visits.",
        "Only an unbound sheet records a visit to the lower reach and measurements of its bends.",
        "Rusk attributes that sheet to a later editor who visited the reach; Noor attributes it to the traveler.",
        "Both accept that the sheet's author personally made the recorded visit and measurements.",
      ],
      anchors: ["Rusk", "Noor", "lower", "visited", "labels"],
      key: "Rusk's attribution makes the lower reach unvisited by the traveler, whereas Noor's allows straight drawing for labels despite a recorded visit.",
      wrong: [
        ["Rusk and Noor accept straight lines for unvisited reaches, although Rusk assigns the sheet to an editor and Noor assigns it to the traveler.", "This gives a shared drawing rule and the attribution dispute but stops before applying the complete-record premise to explain this particular straight reach."],
        ["Rusk assigns the measurements to an editor who visited the lower reach, whereas Noor accepts that visited bends could be straightened for harbor labels.", "Both claims are accurate, but one identifies the editor's activity and the other a shared drafting possibility. It does not infer the traveler's knowledge under both attributions."],
        ["Both historians treat the papers as a complete record of the traveler's visits and accept that the sheet's author visited the lower reach.", "These shared premises are relevant, but their different consequences depend on who authored the sheet. The sentence does not supply those consequences."],
      ],
      why: "The only recorded lower-river visit belongs to the sheet's author. Since both regard the papers as complete, Rusk's editor attribution leaves the traveler without such a visit, invoking the unvisited-reach convention. Noor's traveler attribution instead permits deliberate straightening for labels. The key states that permitted explanation without claiming the notes prove the mapmaker's intention.",
      allow: ["attribution", "allows", "drawing", "despite", "assigns", "lines"],
    },
    {
      "scene": "eoi-disagreement-seed-dormancy",
      "goal": "identify the disagreement about whether the observations before cooling establish that dormancy had ended",
      "notes": [
        "Botanists Hana Rey and Olan Moss study the invented talin plant using images and a water tracer.",
        "Before cooling, images show water pockets beside the embryo and embryo tissue appears stained; visible coat cracks appear only after cooling.",
        "Both use water absorption by the living embryo to establish dormancy's end and accept that cracks alone cannot establish absorption.",
        "Rey locates the early pockets outside an intact membrane and attributes the staining to dye released during sectioning, a preparation artifact.",
        "Moss reads the staining as absorbed water and says sectioning displaced the membrane, making the pockets' apparent location misleading.",
        "Both accept that the later tracer reached the embryo after cooling."
      ],
      "anchors": [
        "Rey",
        "Moss",
        "absorption",
        "staining",
        "dormancy"
      ],
      "key": "Rey finds early absorption by the living embryo unestablished; Moss reads the staining before cooling as evidence that dormancy had already ended.",
      "wrong": [
        [
          "Rey locates the early pockets outside the membrane, whereas Moss attributes their apparent location to sectioning; both accept the later tracer result.",
          "This identifies the imaging dispute but does not combine it with the competing readings of staining to say whether the early observations establish the end of dormancy."
        ],
        [
          "Rey attributes staining to sectioning, whereas Moss accepts that cracks do not establish absorption; both agree on the later tracer reaching the embryo.",
          "This compares Rey's account of an early signal with a shared limitation on a later signal. It leaves the competing interpretations of the early staining unstated."
        ],
        [
          "Both Rey and Moss accept that the later tracer reached the embryo, although they explain the early staining and the pockets' apparent locations differently.",
          "This accurately reports later agreement and earlier interpretive differences, but does not state their implications for evidence of dormancy's end before cooling."
        ]
      ],
      "why": "The raw observations are shared, but neither water near the embryo nor visible cracks directly establishes absorption by the living embryo. Rey explains both early signals without absorption: external pockets and staining introduced during preparation. Moss reads the staining as absorption and the apparent external location as a preparation distortion. Thus they disagree about the evidence for an earlier end of dormancy, without contradicting the accepted observations or claiming that cold caused the change.",
      "allow": [
        "readings",
        "leave",
        "unestablished",
        "evidence",
        "already",
        "ended",
        "result",
        "agree",
        "explain",
        "differently"
      ]
    },
    {
      "scene": "eoi-disagreement-street-festival",
      "goal": "identify the precise disagreement about whether merchant approval changed the neighborhood groups' independence",
      "notes": [
        "Historians Anja Sorel and Dev Marr study the invented city of Belden's Lantern Walk, once run by neighborhood groups.",
        "A later charter required merchant approval of every route; the surviving requests were all approved without changes.",
        "Neighborhood groups still chose routes and made lanterns in the citywide event, while merchants funded it.",
        "Sorel compares old and new minutes showing the same groups making all recorded choices; she treats the approval entries as records of decisions already taken.",
        "Marr accepts that no recorded route changed, but reads the charter as retaining a merchant right to refuse any route, even when all requests were granted.",
        "Both accept the charter and the recorded approvals; the merchants never waived their right of refusal."
      ],
      "anchors": [
        "Sorel",
        "Marr",
        "choices",
        "merchant",
        "approval"
      ],
      "key": "Sorel treats unchanged choices as independence in practice; Marr treats the unused merchant right to refuse as making those choices dependent on approval.",
      "wrong": [
        [
          "Sorel finds the same groups making the recorded choices, whereas Marr accepts that merchants approved every recorded route; both accept the charter.",
          "Both statements concern what happened in practice and are compatible. They do not distinguish continued decision-making from the new power to refuse those decisions."
        ],
        [
          "Sorel compares choices in old and new minutes, whereas Marr reads the charter's right of refusal; both accept that the approvals left recorded routes unchanged.",
          "This accurately compares sources and an outcome. It does not state why the unused power matters differently to their assessments of independence."
        ],
        [
          "Both Sorel and Marr accept that groups chose the routes while merchants funded the citywide event, and that every recorded request received approval.",
          "This accurately describes the division of work and the approval record. It does not decide whether unchanged outcomes preserve independence when permission is required."
        ]
      ],
      "why": "The dispute is not over who proposed the routes or whether merchants changed them. Sorel reads the approval record through unchanged exercised choices; Marr reads it through a retained power to refuse. A power can remain unused while still making a choice conditional, so identical recorded routes do not settle the disputed independence.",
      "allow": [
        "unchanged",
        "independence",
        "unused",
        "dependent",
        "received",
        "left",
        "practice"
      ]
    },
    {
      scene: "eoi-disagreement-translation-refrain",
      goal: "identify what the scholars' readings imply about whether the translation preserves the refrain's relation to the images",
      notes: [
        "Literary scholars Alia Kest and Bram Eno discuss an invented translation of the poem Stone Window.",
        "Both judge preservation by whether the translation keeps the relation between images and refrain, rather than every original word.",
        "The original has changing images and a refrain with fixed words; the translation varies the refrain's words.",
        "Kest reads the original repetition as a renewal moving with the images; Eno reads it as a pause interrupting their movement.",
        "Both read the translated refrain as moving with the images, without a pause.",
        "Both identify the same word variations and agree that the images themselves are unchanged in translation.",
      ],
      anchors: ["Kest", "Eno", "refrain", "images", "relation"],
      key: "Kest's reading makes the varied refrain preserve its relation to the images, whereas Eno's makes the same change remove a contrast with their movement.",
      wrong: [
        ["Kest reads renewal in the original repetition, whereas Eno reads a pause in it; both read the translated refrain as moving with the changing images.", "This states the different readings and a shared reading of the translation, but does not apply the preservation criterion to compare the relations each scholar perceives."],
        ["Kest accepts changing images in the original, whereas Eno accepts word variations in the translated refrain; both agree the images remain unchanged.", "These observations concern different components and are compatible. They do not state whether the translation preserves the relation between those components."],
        ["Both Kest and Eno judge preservation by the relation of images to refrain, while agreeing that the translation changes the refrain's words without a pause.", "This states the criterion and the translated form but does not compare that form with each scholar's reading of the original refrain's function."],
      ],
      why: "The translation moves with the images under both readings. Kest also reads the original refrain as moving with them, so the relation is preserved. Eno reads the original as interrupting them, so the same translation removes a contrast. The answer follows from comparing relations, not from counting changed words or merely reporting the two readings.",
      allow: ["reading", "varied", "makes", "remove", "contrast", "accepts", "remain", "preserve", "agreeing"],
    },
    {
      "scene": "eoi-disagreement-market-roof",
      "goal": "locate the precise disagreement in the historians' assessments of the carpenter's contribution to the roof's innovation",
      "notes": [
        "Historians Niko Ames and Rina Holt study the invented Verin market's coastal-style roof, built with local timber.",
        "Drawings made before a carpenter's visit specify its exterior profile but leave the internal joints unspecified.",
        "The carpenter's letter describes teaching builders joints that could support the intended profile with local timber; the finished roof preserves that profile.",
        "Ames objects to calling the earlier outline a completed construction plan: the visit supplied what the drawings left unresolved.",
        "Holt accepts that instruction made the intended form buildable, but distinguishes realizing that form from originating the form itself.",
        "Both accept the drawings' earlier date and the carpenter's later instruction; neither claims the visitor changed the exterior profile."
      ],
      "anchors": [
        "Ames",
        "Holt",
        "construction",
        "form",
        "instruction"
      ],
      "key": "Ames counts the missing construction method as part of the innovation; Holt credits the instruction with realizing a form whose origin lay in earlier drawings.",
      "wrong": [
        [
          "Ames sees the instruction as supplying unresolved joints, whereas Holt accepts that it made the intended form buildable; neither claims the exterior changed.",
          "These accurately attributed claims establish their agreement about practical instruction. They do not identify the different scope each gives to credit for the innovation."
        ],
        [
          "Ames distinguishes an earlier outline from a completed construction plan, whereas Holt accepts the earlier date of the drawings and the later instruction.",
          "This pairs Ames's criticism with chronology both accept. It leaves unstated Holt's distinction between originating a form and realizing it."
        ],
        [
          "Both Ames and Holt accept that the roof kept its profile, although Ames emphasizes unspecified joints and Holt emphasizes the intended form's origin.",
          "This contrasts emphases and states a shared result, but does not connect those emphases to the different kinds of contribution each treats as introducing the innovation."
        ]
      ],
      "why": "They agree that the visitor taught joints needed to realize an already drawn profile. Their assessments differ in scope: Ames includes a workable construction method in what had to be introduced, while Holt reserves origination of the form for the earlier drawings and credits the visitor with realizing it. The key separates this disagreement over credit from the agreed chronology and practical contribution.",
      "allow": [
        "counts",
        "missing",
        "method",
        "part",
        "innovation",
        "credits",
        "origin",
        "lay",
        "sees",
        "supplying",
        "kept",
        "emphasizes"
      ]
    },
  ];

  const disagreementNotes = synthesisFamily({
    id: "notes-locate-disagreement",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: locate the precise disagreement within shared ground",
    recognize: "Distinguish shared observations from what each scholar says they establish. Reconstruct the relevant source, scope, or evidential link before comparing the conclusions requested by the goal; repeating the evidence or pairing claims about different scopes leaves that consequence unstated.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "true-but-irrelevant"],
    seconds: 110,
    topics: DISAGREEMENT_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({ key: topic.key, wrong: topic.wrong }),
    check: (topic, choices) => topic.notes.length >= 5 &&
      topic.anchors.every((anchor) => has(topic.notes.join(" "), anchor) && has(choices.key, anchor)) &&
      choices.key === topic.key &&
      choices.wrong.map(([text]) => text).join("|") === topic.wrong.map(([text]) => text).join("|"),
    explain: (topic) => topic.why,
    steps: [
      "Identify the observations and interpretations that both scholars accept.",
      "Track whose claim each note reports and the stage, group, or aspect that claim concerns.",
      "Connect each scholar's reading to the relevant source, causal, or interpretive claim; keep evidence for a possibility distinct from proof.",
      "Choose the synthesis that states the resulting disagreement about the goal's issue; evidence contrasts or claims about different scopes are insufficient.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("To locate a disagreement, compare attributed claims about the same issue; compatible claims can sound opposed when placed on either side of a contrast word."),
    trap: "Choosing an accurate comparison of the scholars' evidence, or of their claims about different issues, instead of identifying the proposition on which they disagree.",
    hint: "Which claim would one scholar accept and the other reject, once their shared facts and the scope of each statement are clear?",
  });

  // A case appears to violate a rule until the reader resolves a category,
  // an exception's eligibility, or a condition's scope across separate notes.
  // The neighboring-rule choices remain true; they do not explain this case.
  const APPARENT_EXCEPTION_TOPICS = [
    {
      scene: "eoi-exception-atlas-consultation",
      notes: [
        "Meren archive permits original consultation when no surrogate is usable for the inquiry; otherwise it withholds originals.",
        "Fragile atlases may be viewed closed but never opened.",
        "An atlas has two surrogates: scans of all page markings but no edges, and an edge tracing from 1950.",
        "Tracings record edge alignment at their dates; only one from the current binding is usable for current alignment.",
        "Rebinding detaches leaves and sews them into a new cover, potentially changing edge alignment.",
        "In 1974, conservators detached the atlas's leaves and sewed them into its present cover.",
        "A reader asked how fragments painted on the page edges now join; all are visible with the atlas closed.",
        "The archive permitted viewing of the fragile original despite both surrogates.",
      ],
      goal: "explain why permitting the reader to view the fragile atlas followed the archive's rules despite the two surrogates",
      key: "The rebinding disqualified the old tracing for current alignment, and scans omit the edges; a closed view of the original obeyed the handling rule.",
      wrong: [
        ["The tracing can establish how the edges aligned in 1950, despite the rebinding that limits its value for the reader's inquiry about present alignment.", "This explains a valid use for the tracing and why its date matters, but it does not resolve the other surrogate or the separate restriction on handling fragile atlases."],
        ["The new binding disqualified the older tracing for current alignment, while the scans remained suitable for studying marks on individual pages.", "This accurately distinguishes the surrogates' uses, but it does not establish that the original can be examined without violating the fragile-atlas restriction."],
        ["The scans suffice for reading page markings, whereas viewing the page edges on this fragile original requires keeping the atlas closed.", "This accurately connects the inquiry's subject to the two viewing methods, but it leaves the edge tracing's usability unresolved; an adequate tracing would still prevent original consultation."],
      ],
      why: "The 1974 work meets the definition of rebinding, so the 1950 tracing cannot establish the present edge arrangement. The digital facsimile omits the edges entirely. Neither surrogate can answer the reader's inquiry, yet all requested fragments can be viewed without opening the atlas, so both the access rule and the separate handling restriction are satisfied.",
      allow: ["left", "unsuited", "design", "scans", "omit", "respected", "handling", "restriction", "preserves", "received", "individual", "replace", "inquiries", "predates", "rule", "prohibited", "disqualified", "absent", "satisfied", "establish", "despite", "limits", "value", "older", "remained", "suitable", "studying", "suffice", "reading", "requires", "keeping", "aligned", "marks", "old", "obeyed"],
    },
    {
      scene: "eoi-exception-seed-dormancy",
      notes: [
        "In a trial, a week of warmth with continuous moisture ends dormancy in velin seeds.",
        "Once dormancy ends, the seeds can germinate at cooler temperatures if moisture continues.",
        "Cold storage restores dormancy only when the seeds also dry out.",
        "Batch L spent a week in warm, moist soil before being moved into cold storage.",
        "Batch L remained moist throughout storage and was planted in cool, wet soil.",
        "Batch L germinated despite having just left cold storage.",
      ],
      goal: "explain why Batch L's germination after cold storage was consistent with the dormancy conditions",
      key: "Warm, moist soil had ended Batch L's dormancy; remaining moist in storage prevented its return, allowing germination in cool soil.",
      wrong: [
        ["A week of warmth with continuous moisture ends dormancy, yet Batch L germinated in cool soil after leaving cold storage.", "This restates the apparent exception using the conditions that end dormancy without deciding whether Batch L was still dormant."],
        ["Cold storage restores dormancy only when seeds dry out, and Batch L moved from warm, moist soil into cold storage before planting.", "This gives the correct reset rule and chronology but omits the continuous moisture that kept the reset from occurring."],
        ["Moisture continued during Batch L's storage and planting, allowing germination at cooler temperatures once a seed's dormancy ends.", "This supplies the later moisture condition but never connects the earlier warm, moist week to the ending of dormancy."],
      ],
      why: "The initial warm, moist week ended dormancy. Cold storage would restore it only with drying, which never occurred, so the continuing moisture allowed germination in cool soil. A rule about dormant seeds does not govern the final stage of this batch.",
      allow: ["ended", "remaining", "prevented", "return", "allowing", "warmth", "leaving", "planting", "required", "germination", "need"],
    },
    {
      scene: "eoi-exception-festival-premiere",
      notes: [
        "At Orven, a version qualifies as a premiere unless its complete scene sequence has already been presented publicly, live or in an authorized recording.",
        "Changing cast, venue, or medium does not create a new version; changing the scene sequence does.",
        "The interactive Glass Orchard opened with Gate and ended with Home; between them each audience chose either Orchard or Storm, never both.",
        "Both routes were performed before public audiences.",
        "An authorized public recording preserves a Gate-Orchard-Home run followed by a Gate-Storm-Home run, with both endings and openings intact.",
        "The proposed stage version runs Gate, Orchard, Storm, Home, without restarting at Gate between the two middle scenes.",
        "The festival accepted the stage version as a premiere.",
      ],
      goal: "explain why the festival accepted the stage version of Glass Orchard as a premiere despite the earlier live performances and public recording",
      key: "No live run joined Orchard to Storm, and the recording kept them in separate runs; the stage's joined sequence thus qualified as a new version.",
      wrong: [
        ["Every scene in the stage version had already reached a public audience; acceptance therefore did not make any individual scene a premiere.", "This accurately explains what acceptance does not imply about the component scenes, but eligibility belongs to their complete sequence. Prior exposure to every component does not establish a prior presentation of this version."],
        ["The recording made both earlier routes publicly available in a fixed medium, although a change of medium alone cannot create a new version.", "This correctly explains why recording the earlier routes did not itself create new versions. It does not determine whether the stage version merely changes medium or instead changes the complete sequence."],
        ["Regardless of its medium, the stage version reuses all four publicly performed scenes, and the recording includes all four in its two runs.", "This compares the inventories accurately but treats the availability of every scene as the relevant unit. It leaves unresolved whether any prior complete run had the new order without the intervening ending and restart."],
      ],
      why: "Each live route contained only one of the two middle scenes. The recording contains both, but as parts of separate complete runs: Home and then a new Gate intervene. The stage version joins Orchard directly to Storm within one run, so it changes the complete sequence rather than merely the medium. Public presentation of every component scene therefore does not defeat this version's premiere eligibility.",
      allow: ["heard", "joined", "therefore", "reached", "acceptance", "individual", "earlier", "available", "fixed", "alone", "cannot", "reuses", "includes", "kept", "separate", "thus", "regardless"],
    },
    {
      scene: "eoi-exception-sample-routing",
      notes: [
        "At the Daro laboratory, an arriving sample goes to quarantine if its seal is broken or its documented temperature limit was exceeded.",
        "A temperature reading counts as documented once the logger's calibration is confirmed; until then it does not.",
        "When calibration fails, a continuous backup record replaces the logger's readings; a broken seal still requires quarantine.",
        "Sample R had an intact seal and a high main-logger reading, above the temperature limit.",
        "That logger failed calibration; R's continuous backup record stayed within the limit.",
        "Sample R went directly to analysis rather than quarantine.",
      ],
      goal: "explain why sending Sample R directly to analysis complied with the quarantine rule despite its high logger reading",
      key: "R's failed logger was replaced by a backup record within the limit, and its intact seal supplied no separate reason for quarantine.",
      wrong: [
        ["Even a backup record within the temperature limit cannot prevent quarantine when a seal is broken; R's backup record stayed within the limit.", "This accurately explains the independent seal trigger but does not state that R's intact seal avoided it or explain the high logger reading."],
        ["A confirmed logger's high reading requires quarantine even with an intact seal, and R arrived with an intact seal and a high reading.", "This describes the rule for a calibrated logger but omits the failed calibration that prevents that rule from applying to R."],
        ["The laboratory uses continuous backup records when calibration fails, and Sample R reached analysis with its original seal still intact.", "This combines the replacement procedure and final outcome without establishing that the replacement record was within the limit."],
      ],
      why: "The high logger reading never became a documented violation because calibration failed and the qualifying backup replaced it. That backup showed no temperature violation, and the intact seal avoided the independent quarantine trigger. Both routes to quarantine must be evaluated.",
      allow: ["replaced", "supplied", "separate", "reason", "prevent", "requires", "arrived", "reached", "original", "cannot"],
    },
    {
      scene: "eoi-exception-nesting-shore",
      notes: [
        "At Varo reserve, a shore path closes when an active nest lies within its buffer zone.",
        "A nest is active from the first egg until the final chick leaves, unless the adults abandon it.",
        "Adult absence counts as abandonment only after two consecutive surveys without an adult or newly delivered food.",
        "A nest beside the path, within its buffer zone, held chicks during two surveys; neither survey recorded an adult.",
        "Freshly delivered food appeared at the nest during the second survey.",
        "The reserve kept the path closed despite the two surveys without adults.",
      ],
      goal: "explain why keeping the path closed followed the nesting rule despite the adults' recorded absence",
      key: "New food prevented the two surveys from establishing abandonment, so the chicks' nest remained active and the nearby path stayed closed.",
      wrong: [
        ["Adult absence establishes abandonment only after two surveys without new food, and neither survey beside the path recorded an adult.", "This gives the abandonment rule but omits the food evidence that prevents those particular surveys from satisfying it."],
        ["A nest remains active until its final chick leaves unless it is abandoned; the surveys recorded chicks at the nest beside the path.", "This checks the normal end of nesting but leaves the apparent abandonment exception unresolved."],
        ["The second survey recorded fresh food at the nest, while both surveys found chicks and no adults in the path's buffer zone.", "This accurately combines the observations but does not explain why food keeps the absence from establishing abandonment."],
      ],
      why: "Two adult-free surveys are insufficient: they must also lack new food. The food therefore prevents the abandonment exception from applying. With chicks still present, the nest remains active and its position within the buffer requires closure.",
      allow: ["prevented", "establishing", "nearby", "stayed", "establish", "fresh", "remained", "remains"],
    },
    {
      scene: "eoi-exception-transit-transfer",
      notes: [
        "A Leston transfer ticket remains valid for a second journey begun within sixty counted minutes of the first journey's start.",
        "Time aboard every ferry covered by the ticket is excluded from counted minutes; time aboard other ferries is counted.",
        "A ferry is covered if and only if it carries a blue symbol and all its stops are inside the local zone.",
        "Nara began her first journey at noon and took a blue-symbol ferry from 12:20 to 12:50; it stopped only at Kess and Olo.",
        "Her second journey began at 1:10, and the transfer ticket was accepted.",
        "Kess and Olo are inside the local zone; a scenic ferry with only a gold symbol also left the same dock that day.",
      ],
      goal: "explain why Nara's transfer ticket was accepted even though her second journey began more than an hour after noon",
      key: "Both local stops and a blue symbol qualified Nara's ferry for the time exclusion, leaving forty counted minutes before her second journey.",
      wrong: [
        ["Time on a gold-symbol scenic ferry does not extend a transfer, even though scenic ferries and covered ferries can leave the same dock.", "This accurately explains the neighboring fare rule, but Nara used a blue-symbol ferry, so the scenic route does not govern her transfer."],
        ["The second journey began seventy minutes after noon; the transfer rule counts time from the first journey's start rather than its end.", "This correctly identifies the clock's starting point but leaves out the covered-ferry interval that changes the counted time."],
        ["Nara spent thirty minutes on a ferry before her second journey, and only time aboard a ferry covered by the ticket is excluded.", "This gives the interval and the conditional exclusion but does not establish that both the blue symbol and all its stops qualified Nara's ferry as covered."],
      ],
      why: "The blue symbol and both stops being inside the local zone together make this ferry covered, activating the time exclusion. Subtracting its thirty minutes from the seventy elapsed minutes leaves forty counted minutes, within the transfer limit. A ferry journey alone would not establish the exclusion.",
      allow: ["excluding", "leaving", "forty", "seventy", "extend", "end", "spent", "thirty", "rule", "qualified", "exclusion"],
    },
    {
      scene: "eoi-exception-observatory-queue",
      notes: [
        "At the Peren observatory, the highest-priority eligible project receives the next observing slot.",
        "Only projects with visible targets are eligible; these qualify exactly when their sequences fit the slot or may be divided.",
        "Division between slots is permitted for sequences using one filter throughout, but not for sequences with a filter change.",
        "High-priority Project A had a visible target and required a sequence longer than the next slot, with a filter change midway.",
        "Lower-priority Project B had a visible target and a sequence that fit the slot.",
        "The observatory assigned the slot to B.",
      ],
      goal: "explain why assigning the slot to Project B respected the priority rule even though Project A had higher priority and a visible target",
      key: "A's filter change barred dividing its overlong sequence, making it ineligible for the slot that could accommodate B's sequence.",
      wrong: [
        ["Priority decides between A and B when both are eligible, and both projects had visible targets during the available slot.", "This checks target visibility but leaves unresolved the sequence-length condition that distinguishes the projects' eligibility."],
        ["A sequence using the same filter can be divided between slots, although the highest-priority eligible project receives the next slot.", "This accurately describes the splitting option but does not connect A's filter change to its inability to use that option."],
        ["B's visible target and shorter sequence made it eligible for the slot, while A also had a visible target and ranked above B.", "This establishes B's eligibility but does not explain why the higher-ranked A was ineligible, which the priority rule requires."],
      ],
      why: "A's visible target satisfies only one eligibility condition. Its sequence does not fit, and its changing filters disqualify it from the splitting provision. B can therefore receive the slot without overruling the priority rule, because A is outside the eligible group.",
      allow: ["barred", "overlong", "ineligible", "accommodate", "favors", "available", "shorter", "ranked", "above", "rule", "higher", "divided", "decides"],
    },
    {
      scene: "eoi-exception-puppet-classification",
      notes: [
        "Harel ordinarily classifies a puppet as historical exactly when its frame and working controller predate 1900.",
        "The replica exception admits a modern controller if all its movements are documented before 1900 and installation removes no frame material; otherwise it fails.",
        "Disassembly alone preserves historical status only if the original controller will be reinstalled.",
        "The River Dancer kept its 1882 frame; its old controller will remain in storage for study, not be reinstalled.",
        "Its 1882 diagrams show both arms rising, the waist bending, and the head turning.",
        "The new controller permits only a head turn, a waist bend, and an arm lift, in a new order; both arms move together.",
        "Installation only clipped attachments around existing frame pins; the puppet retained its historical status.",
      ],
      goal: "explain why retaining the River Dancer's historical status after installing its new controller was consistent with the collection's rules",
      key: "Clips spared the old frame, and reordering the documented movements added none, qualifying the new controller for the replica exception.",
      wrong: [
        ["Disassembly preserves historical status only when reinstallation is planned, and the River Dancer's old controller remains preserved for study.", "This accurate conditional tempts the temporary-disassembly route, but preservation for study is not a plan to reinstall the old controller; the final installation needs another rule."],
        ["A new order need not violate the replica rule's movement condition, and the River Dancer's 1882 frame satisfies the ordinary date cutoff.", "This resolves movement order versus movement repertoire and the frame's date but leaves the exception's separate installation condition unchecked."],
        ["Clipping attachments around existing pins preserves frame material, but the ordinary age rule still excludes the newly made controller.", "This applies the installation condition and ordinary age rule accurately, but it does not determine whether the repertoire qualifies the modern controller for the replica exception."],
      ],
      why: "Each permitted movement matches one in the 1882 diagrams; changing their order adds no movement. Attaching clips around existing pins also removes no frame material. The modern controller therefore satisfies both replica conditions while the original frame still meets the date cutoff. Storage of the old controller cannot invoke the separate disassembly exception because reinstallation is not planned.",
      allow: ["recombined", "retained", "reinstallation", "planned", "remains", "orders", "gestures", "differently", "part", "cannot", "satisfies", "date", "requirement", "clips", "spared", "reordering", "added", "none", "qualifying", "planned", "preserved", "need", "violate", "rule", "condition", "ordinary", "cutoff", "age", "excludes", "newly", "made", "movement"],
    },
    {
      scene: "eoi-exception-message-delivery",
      notes: [
        "The Tovan sensor network removes a queued message only after receiving an acknowledgment from every required receiver.",
        "Required receivers are exactly those with active subscriptions when a message was created; later cancellations do not remove that requirement.",
        "A sleeping receiver's subscription remains active until its scheduled renewal is missed.",
        "Message Q was created while receiver Elm was asleep but before Elm's renewal time.",
        "All other receivers acknowledged Q; Elm missed its renewal and canceled before waking, without acknowledging Q.",
        "The network retained Q in its queue after Elm's cancellation.",
      ],
      goal: "explain why retaining Message Q after Elm canceled its subscription complied with the network's removal rule",
      key: "Elm's subscription was active when Q was created, making its acknowledgment necessary despite the later cancellation.",
      wrong: [
        ["Sleeping receivers remain subscribed until they miss renewal, and Elm missed renewal before waking or acknowledging Message Q.", "This establishes when Elm's subscription ended but does not connect its earlier status at message creation to Q's fixed requirements."],
        ["A receiver that cancels before a message is created is not required to acknowledge it, and Elm canceled before waking from sleep.", "This accurately describes an exemption for earlier cancellation, but waking is not the event that determines Q's required receivers."],
        ["Every required receiver must acknowledge a message before its removal; all receivers other than the sleeping Elm had acknowledged Q.", "This identifies the missing acknowledgment without explaining why Elm remained required after its cancellation."],
      ],
      why: "Sleep did not immediately end Elm's subscription. Since creation preceded the missed renewal, Elm was required when Q's receiver list was fixed. Later cancellation cannot remove that requirement, so the absent acknowledgment keeps Q queued.",
      allow: ["missing", "necessary", "remain", "subscribed", "removal", "despite", "must", "subscription"],
    },
    {
      scene: "eoi-exception-soil-treatment",
      notes: [
        "In Nelan greenhouse trials, mineral treatment increases leaf growth only if the mineral is absorbed before budding begins.",
        "On the first warm day, plants begin budding unless they have already absorbed mineral; those plants delay budding.",
        "Once budding begins, later changes in soil conditions cannot reverse it.",
        "A rinse makes root coatings permeable but acidifies the soil, preventing mineral absorption until drainage lowers the acidity.",
        "K had absorbed no mineral before being rinsed and dosed on day one; its first warm day was day two, and drainage resumed on day three.",
        "On day three, K's coatings were permeable, its acidity was low, and its roots absorbed mineral, but leaf growth did not increase.",
      ],
      goal: "explain why Bed K's lack of increased leaf growth followed the treatment rule even though its roots eventually absorbed the mineral",
      key: "K could not absorb mineral before the warm day, so budding began before drainage enabled uptake, closing the window for increased leaf growth.",
      wrong: [
        ["Plants that absorb mineral before their first warm day delay budding; K received its dose before that day, while drainage resumed afterward.", "This accurately describes the delay rule and application date but invites the reader to substitute receiving a dose for absorbing it. K could not absorb that dose before drainage resumed."],
        ["By day three, drainage had lowered K's acidity and its coatings were permeable, allowing mineral absorption despite the earlier soil conditions.", "This explains the later uptake, but correcting soil conditions cannot reopen the growth opportunity once budding has begun."],
        ["The rinse made K's coatings permeable while temporarily preventing mineral absorption; drainage later removed that barrier to uptake.", "This explains the temporary uptake barrier and its removal but does not connect its timing to the warm-day trigger and irreversible budding."],
      ],
      why: "Receiving mineral on day one did not mean absorbing it: the acidic soil prevented absorption until day three. K therefore lacked absorbed mineral at the first warm day and began budding. Drainage later made uptake possible, but it could not reverse budding, so that uptake came too late to meet the necessary condition for increased leaf growth.",
      allow: ["enabled", "uptake", "closing", "window", "eventually", "afterward", "lowered", "earlier", "temporarily", "removed", "barrier", "allowing", "despite", "dose", "received"],
    },
  ];

  const apparentExceptionNotes = synthesisFamily({
    id: "notes-explain-apparent-exception",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: explain an apparent exception to a conditional rule",
    recognize: "An apparent exception can follow the rule once its scope is resolved. Connect the case to every relevant eligibility condition, definition, and exception; a correct neighboring rule or one satisfied condition may leave the outcome unexplained.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["off-goal", "neighbouring-rule", "context-constraint"],
    seconds: 115,
    topics: APPARENT_EXCEPTION_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({ key: topic.key, wrong: topic.wrong }),
    check: (topic, choices) => topic.notes.length >= 5 &&
      [choices.key, ...choices.wrong.map(([text]) => text)].every((text) => text.length <= 160) &&
      choices.key === topic.key &&
      choices.wrong.map(([text]) => text).join("|") === topic.wrong.map(([text]) => text).join("|"),
    explain: (topic) => topic.why,
    steps: [
      "Identify the apparent exception and the exact outcome the student wants to explain.",
      "Resolve which category or stage the case belongs to using the definitions and facts in separate notes.",
      "Apply all necessary conditions, including any exception or independent trigger, to that case.",
      "Choose the explanation that connects this reasoning to the outcome; a true neighboring rule or partial eligibility check is insufficient.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A conditional rule governs only cases meeting its conditions; a category label, one satisfied criterion, or a later change may not settle whether it applies."),
    trap: "Applying the nearest familiar rule before checking whether the case qualifies for it, or explaining one condition while leaving the apparent exception unresolved.",
    hint: "Which definitions and conditions determine whether the apparently conflicting rule actually applies to this case?",
  });

  return [
    similarityNotes,
    differenceNotes,
    dateLocationNotes,
    audienceNotes,
    advantageNotes,
    generalizationNotes,
    significanceNotes,
    concessionSimilarityNotes,
    stressNotes,
    expectationNotes,
    namedFeatureNotes,
    differenceSizeNotes,
    reconciliationNotes,
    qualifiedMeasureNotes,
    editorialChoiceNotes,
    revisedExplanationNotes,
    diagnosticComparisonNotes,
    disagreementNotes,
    apparentExceptionNotes,
  ];
});
