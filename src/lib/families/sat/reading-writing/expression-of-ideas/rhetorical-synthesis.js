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

  const { DOMAIN, SECTION, lc } = C;

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
      ],
      need: ["Velo", "Carran", "leaves that hang over"],
      key: "The Velo tree frog and the Carran marsh frog both lay their eggs on leaves that hang over water.",
      firstOnly: "The Velo tree frog, which is about 3 centimeters long, lives in mountain cloud forests.",
      secondOnly: "The Carran marsh frog, which is about 7 centimeters long, lives in lowland wetlands.",
      difference: "The Velo tree frog lives in cloud forests, whereas the Carran marsh frog lives in lowland wetlands.",
    },
    {
      scene: "eoi-rsim-frozen-lakes",
      pair: "the two lakes",
      a: "Lake Orrin",
      b: "Lake Tessaly",
      notes: [
        "Lake Orrin is a high mountain lake with a surface area of 12 square kilometers.",
        "Each winter, Lake Orrin freezes from shore to shore.",
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
      pair: "the two cities' bike-share programs",
      a: "Tarrow's program",
      b: "Millbrook's program",
      notes: [
        "The city of Tarrow launched a bike-share program in 2016 with 300 bicycles.",
        "Tarrow's program lets riders use bicycles free for the first 30 minutes.",
        "The city of Millbrook launched a bike-share program in 2019 with 1,200 bicycles.",
        "Millbrook's program also lets riders use bicycles free for the first 30 minutes.",
        "Both cities pay for their programs partly by selling advertising at bike stations.",
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
      pair: "the two lighthouses",
      a: "the Brannock Light",
      b: "the Sele Point Light",
      notes: [
        "The Brannock Light was completed in 1851 on a rocky island.",
        "Its tower was built of granite quarried on the mainland.",
        "The Sele Point Light was completed in 1874 on a sandy cape.",
        "Its tower was also built of granite quarried on the mainland.",
        "The Sele Point Light was the taller of the two, at 38 meters.",
      ],
      need: ["Brannock", "Sele Point", "granite"],
      key: "The Brannock Light and the Sele Point Light both have towers built of granite from the mainland.",
      firstOnly: "The Brannock Light, which had a granite tower, was completed in 1851 on a rocky island.",
      secondOnly: "The Sele Point Light, which was 38 meters tall, was completed in 1874 on a sandy cape.",
      difference: "The Brannock Light was built on a rocky island, whereas the Sele Point Light was built on a sandy cape.",
    },
    {
      scene: "eoi-rsim-bilingual-newspapers",
      pair: "the two newspapers",
      a: "the Harbor Ledger",
      b: "the Valley Courier",
      notes: [
        "The Harbor Ledger was a newspaper founded in 1832 by a group of dockworkers.",
        "It was printed in both English and German.",
        "The Valley Courier was a newspaper founded in 1847 by a schoolteacher.",
        "It was also printed in both English and German.",
        "The Valley Courier ceased publication in 1901.",
      ],
      need: ["Harbor Ledger", "Valley Courier", "English and German"],
      key: "Both the Harbor Ledger and the Valley Courier were printed in English and German.",
      firstOnly: "In 1832, a group of dockworkers founded the newspaper known as the Harbor Ledger.",
      secondOnly: "The Valley Courier, founded in 1847 by a schoolteacher, ceased publication in 1901.",
      difference: "The Harbor Ledger was founded in 1832, fifteen years before the Valley Courier.",
    },
    {
      scene: "eoi-rsim-blue-gray-murals",
      pair: "the two murals",
      a: "Tide Chart",
      b: "Seed Year",
      notes: [
        "Rosa Iturbe painted the mural Tide Chart on a seawall in 2012.",
        "Tide Chart uses only shades of blue and gray.",
        "Daniel Achterberg painted the mural Seed Year on a grain elevator in 2018.",
        "Seed Year also uses only shades of blue and gray.",
        "Seed Year is more than twice as tall as Tide Chart.",
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
      pair: "the two poets",
      a: "Anneliese Kord",
      b: "Julian Osei",
      notes: [
        "Anneliese Kord published her first poetry collection in 1961 at age 19.",
        "Kord wrote only sonnets, a form with fourteen lines.",
        "Julian Osei published his first poetry collection in 1978 at age 41.",
        "Osei also wrote only sonnets.",
        "Kord's collections have been translated into eleven languages.",
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
        "Travel writer Samuel Okoro sailed the length of the Keswa River in 2003.",
        "He also wrote his book from notes he recorded each night by lantern.",
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
      ],
      need: ["Ashby", "Corran", "migrates about 4,000 kilometers south", "does not migrate"],
      key: "The Ashby warbler migrates about 4,000 kilometers south each autumn, but the Corran warbler does not migrate.",
      firstOnly: "Each autumn, the Ashby warbler migrates about 4,000 kilometers south from the Tellan Range.",
      secondOnly: "Instead of migrating, the Corran warbler survives the winter in its forests by eating seeds stored in tree bark.",
      similarity: "Both the Ashby warbler and the Corran warbler breed in pine forests and feed mainly on caterpillars.",
    },
    {
      scene: "eoi-rdif-hill-telescopes",
      pair: "the two telescopes",
      a: "the Halvard Telescope",
      b: "the Ines Telescope",
      notes: [
        "The Halvard Telescope and the Ines Telescope are both located in the Sorrel Hills.",
        "Both telescopes began operating in 2011.",
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
      pair: "the two towns' recycling programs",
      a: "Ferris",
      b: "Galloway",
      notes: [
        "The towns of Ferris and Galloway both started recycling programs in 2015.",
        "Both towns collect recycling from homes once every two weeks.",
        "In Ferris, residents must sort paper, glass, and plastic into separate bins.",
        "In Galloway, residents place all recyclables in a single bin.",
        "Galloway's program is run by a regional recycling cooperative.",
      ],
      need: ["Ferris", "Galloway", "separate bins", "a single bin"],
      key: "Ferris residents sort recyclables into separate bins, whereas Galloway residents use a single bin.",
      firstOnly: "In Ferris, residents must sort paper, glass, and plastic into separate bins for collection.",
      secondOnly: "Galloway's recycling program, which began in 2015, is run by a regional recycling cooperative.",
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
      ],
      need: ["Ardley", "Pellow", "14 kilometers", "96 kilometers"],
      key: "The Ardley Canal is 14 kilometers long, while the Pellow Canal is 96 kilometers long.",
      firstOnly: "Completed in the 1820s, the Ardley Canal is 14 kilometers long and was built to carry coal.",
      secondOnly: "The Pellow Canal, which is 96 kilometers long, required 41 locks to cross the Brenn Hills.",
      similarity: "Both the Ardley Canal and the Pellow Canal were built in the 1820s mainly to carry coal.",
    },
    {
      scene: "eoi-rdif-glacier-expeditions",
      pair: "the two expeditions",
      a: "the Carrow expedition",
      b: "the Hale expedition",
      notes: [
        "The Carrow expedition and the Hale expedition both set out from the port of Vesk.",
        "Both expeditions aimed to map the Ulma Glacier.",
        "The Carrow expedition traveled across the ice by dog sled.",
        "The Hale expedition surveyed the glacier from a small airplane.",
        "Photographs from the Hale expedition are now held in a university archive.",
      ],
      need: ["Carrow", "Hale", "dog sled", "small airplane"],
      key: "The Carrow expedition crossed the glacier by dog sled, whereas the Hale expedition used a small airplane.",
      firstOnly: "The Carrow expedition, which set out from Vesk, traveled across the Ulma Glacier by dog sled.",
      secondOnly: "The Hale expedition surveyed the Ulma Glacier from a small airplane, and its photographs are now archived.",
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
      ],
      need: ["Quiet Mill", "Lantern Street", "a farming village", "a crowded port city"],
      key: "Delacourt set The Quiet Mill in a farming village but set Lantern Street in a crowded port city.",
      firstOnly: "Iris Delacourt's novel The Quiet Mill, set in a farming village, follows one family for decades.",
      secondOnly: "Set in a crowded port city, Delacourt's Lantern Street was later adapted into a stage play.",
      similarity: "Iris Delacourt's novels The Quiet Mill and Lantern Street both follow one family over several decades.",
    },
    {
      scene: "eoi-rdif-farm-sisters",
      pair: "the two sisters' careers",
      a: "Nadia Ferrante",
      b: "Lucia Ferrante",
      notes: [
        "Nadia and Lucia Ferrante grew up on a dairy farm in the Ober Valley.",
        "Both sisters studied at the Ober Valley Agricultural College.",
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
      event: "the Wren Comet's discovery",
      notes: [
        "The Wren Comet was discovered by amateur astronomer Theo Wren.",
        "Wren spotted the comet in March 2004.",
        "He was observing from a hilltop farm near the village of Cadmoor.",
        "The comet's orbit brings it near the Sun once every 71 years.",
        "Wren used a telescope he had built himself.",
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
        "The jawbone is about 45 million years old.",
        "It is now displayed at a natural history museum.",
      ],
      need: ["June 1998", "Kessel Basin"],
      key: "In June 1998, Amara Diallo's team found “Old Tooth” while excavating a dry riverbed in the Kessel Basin.",
      dateOnly: "In June 1998, a team led by paleontologist Amara Diallo found the fossil jawbone nicknamed “Old Tooth.”",
      placeOnly: "The 45-million-year-old jawbone “Old Tooth” was found in a dry riverbed in the Kessel Basin.",
      neither: "“Old Tooth,” a fossil jawbone about 45 million years old, belongs to an early relative of modern horses.",
    },
    {
      scene: "eoi-rdl-library-conference",
      event: "the first national conference on community libraries",
      notes: [
        "The first national conference on community libraries brought together 400 librarians and volunteers.",
        "It took place in October 1972.",
        "The conference was held in a school gymnasium in the town of Wexley.",
        "Its organizers wanted to help small towns open lending libraries.",
        "A second conference was held three years later.",
      ],
      need: ["October 1972", "Wexley"],
      key: "The first national conference on community libraries was held in Wexley in October 1972.",
      dateOnly: "In October 1972, 400 librarians and volunteers gathered for a national conference on community libraries.",
      placeOnly: "Organizers hoping to help small towns open libraries held a conference in a school gymnasium in Wexley.",
      neither: "The first national conference on community libraries brought together 400 librarians and volunteers.",
    },
    {
      scene: "eoi-rdl-youth-parliament",
      event: "the first Youth Parliament session",
      notes: [
        "The first Youth Parliament session gathered 120 students aged 14 to 18.",
        "The students debated and voted on proposals about school transportation.",
        "The session was held in the council chamber of Brevard City Hall.",
        "It took place on May 9, 1995.",
        "Three of the students' proposals were later adopted by the city council.",
      ],
      need: ["May 9, 1995", "Brevard City Hall"],
      key: "The first Youth Parliament session was held on May 9, 1995, in the council chamber of Brevard City Hall.",
      dateOnly: "On May 9, 1995, 120 students aged 14 to 18 debated and voted on proposals about school transportation.",
      placeOnly: "Meeting in the council chamber of Brevard City Hall, the students debated school transportation proposals.",
      neither: "Three proposals from the first Youth Parliament session were later adopted by the city council.",
    },
    {
      scene: "eoi-rdl-silver-arrow",
      event: "the Silver Arrow locomotive's first run",
      notes: [
        "The Silver Arrow was a steam locomotive designed by engineer Hugo Brandvold.",
        "It made its first run on August 14, 1856.",
        "The run began at a station in the port town of Ellisfort.",
        "On that run, it pulled six passenger cars at a top speed of 48 kilometers per hour.",
        "The locomotive was retired in 1890.",
      ],
      need: ["August 14, 1856", "Ellisfort"],
      key: "The Silver Arrow made its first run on August 14, 1856, starting from a station in Ellisfort.",
      dateOnly: "On August 14, 1856, the Silver Arrow pulled six passenger cars at up to 48 kilometers per hour.",
      placeOnly: "Designed by Hugo Brandvold, the Silver Arrow began its first run at a station in Ellisfort.",
      neither: "The Silver Arrow, a steam locomotive designed by Hugo Brandvold, pulled six passenger cars.",
    },
    {
      scene: "eoi-rdl-seven-rivers-treaty",
      event: "the signing of the Treaty of Seven Rivers",
      notes: [
        "The Treaty of Seven Rivers ended a long dispute over fishing rights among three neighboring nations.",
        "It was signed in April 1763.",
        "The signing took place at a monastery in the mountain town of Orvell.",
        "Each nation sent two representatives to the signing.",
        "The treaty remained in force for more than a century.",
      ],
      need: ["April 1763", "Orvell"],
      key: "The Treaty of Seven Rivers was signed in April 1763 at a monastery in the town of Orvell.",
      dateOnly: "Signed in April 1763, the Treaty of Seven Rivers settled a dispute over fishing rights.",
      placeOnly: "Two representatives from each nation signed the Treaty of Seven Rivers at a monastery in Orvell.",
      neither: "The Treaty of Seven Rivers, which remained in force for over a century, settled a fishing dispute.",
    },
    {
      scene: "eoi-rdl-glass-orchard-premiere",
      event: "the premiere of Ada Morrow's play The Glass Orchard",
      notes: [
        "Ada Morrow wrote the play The Glass Orchard about a family of apple growers.",
        "The play premiered on November 3, 1937.",
        "Its first performance took place at the Palisade Theater in Carroway.",
        "Morrow herself played the role of the grandmother.",
        "The play ran for 212 performances.",
      ],
      need: ["November 3, 1937", "Carroway"],
      key: "Ada Morrow's The Glass Orchard premiered on November 3, 1937, at the Palisade Theater in Carroway.",
      dateOnly: "Ada Morrow's play The Glass Orchard, which premiered on November 3, 1937, ran for 212 performances.",
      placeOnly: "The Glass Orchard was first performed at Carroway's Palisade Theater, with Morrow as the grandmother.",
      neither: "In the first production of The Glass Orchard, Ada Morrow herself played the role of the grandmother.",
    },
    {
      scene: "eoi-rdl-window-glass-exhibition",
      event: "Tomas Rook's first exhibition",
      notes: [
        "Tomas Rook creates sculptures from recycled window glass.",
        "His first exhibition opened in September 2009.",
        "The exhibition was held in a former bus depot in Lindgate.",
        "It included 31 sculptures, the largest of which weighed 400 kilograms.",
        "More than 6,000 people visited during the exhibition's two-month run.",
      ],
      need: ["September 2009", "Lindgate"],
      key: "Tomas Rook's first exhibition opened in September 2009 in a former bus depot in Lindgate.",
      dateOnly: "Rook's first exhibition, which opened in September 2009, included 31 sculptures made from window glass.",
      placeOnly: "Held in a former bus depot in Lindgate, Rook's first exhibition drew more than 6,000 visitors.",
      neither: "Tomas Rook's first exhibition included 31 sculptures, the largest of which weighed 400 kilograms.",
    },
    {
      scene: "eoi-rdl-tern-first-issue",
      event: "the publication of the first issue of the literary magazine Tern",
      notes: [
        "Poets Wilhelmina Otte and Charles Imbe founded the literary magazine Tern.",
        "They published the first issue in January 1949.",
        "They printed it on a secondhand press in the back room of a bakery in Fallow Creek.",
        "The first issue included poems by 14 writers.",
        "Tern continued publishing for 23 years.",
      ],
      need: ["January 1949", "Fallow Creek"],
      key: "The first issue of Tern was published in January 1949 and printed in a bakery's back room in Fallow Creek.",
      dateOnly: "Featuring poems by 14 writers, the first issue of the magazine Tern was published in January 1949.",
      placeOnly: "Otte and Imbe printed Tern on a secondhand press in the back room of a bakery in Fallow Creek.",
      neither: "Founded by poets Wilhelmina Otte and Charles Imbe, the magazine Tern continued publishing for 23 years.",
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
      dateOnly: "In July 1966, Rafael Quiroga read the opening chapter of The Ferryman's Daughter to about 50 people.",
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
        "The Lucero Array is a network of 48 radio antennas in northern Chile.",
        "Astronomer Tomás Irigoyen designed the array.",
        "Irigoyen has studied radio signals from distant galaxies for thirty years.",
        "The array began collecting data in 2019.",
        "It detects faint signals from clouds of cold hydrogen gas.",
      ],
      need: ["Lucero Array", "network of 48 radio antennas"],
      key: "The Lucero Array, a network of 48 radio antennas in northern Chile, detects faint signals from clouds of cold hydrogen gas.",
      assumes: "Irigoyen's Lucero Array, which began collecting data in 2019, detects faint signals from clouds of cold hydrogen gas.",
      person: "Astronomer Tomás Irigoyen, who designed the array in northern Chile, has studied radio signals from distant galaxies for thirty years.",
      detail: "Since the Lucero Array began collecting data in 2019, it has detected faint signals from clouds of cold hydrogen gas.",
    },
    {
      scene: "eoi-aud-tidewatch",
      subject: "the Tidewatch Project",
      short: "the Tidewatch Project",
      creator: "Ruth Abernathy",
      notes: [
        "The Tidewatch Project is a citizen-science program that tracks sea-level rise along the Maine coast.",
        "It was founded in 2016 by marine geologist Ruth Abernathy.",
        "Abernathy previously spent a decade mapping underwater landslides.",
        "Volunteers photograph high tides at 130 marked sites.",
        "The photos have helped towns plan where to raise roads.",
      ],
      need: ["Tidewatch Project", "citizen-science program"],
      key: "The Tidewatch Project is a citizen-science program in which volunteers photograph high tides along the Maine coast.",
      assumes: "Abernathy's Tidewatch Project has gathered photos of high tides at 130 sites, helping towns plan where to raise roads.",
      person: "Before founding a program in 2016, marine geologist Ruth Abernathy spent a decade mapping underwater landslides.",
      detail: "Photos taken for the Tidewatch Project since 2016 have helped towns on the Maine coast plan where to raise roads.",
    },
    {
      scene: "eoi-aud-hearth-study",
      subject: "the Hearth Study",
      short: "the Hearth Study",
      creator: "Dalia Serrano",
      notes: [
        "The Hearth Study is a 12-year study of how grandparents who live with their grandchildren affect language learning.",
        "Sociologist Dalia Serrano leads the study.",
        "Serrano grew up in a three-generation household in Tucson.",
        "The study follows 640 families in Arizona and New Mexico.",
        "Early results suggest that children in these homes hear a wider range of vocabulary.",
      ],
      need: ["Hearth Study", "12-year study"],
      key: "The Hearth Study, a 12-year study of 640 families, examines how live-in grandparents affect children's language learning.",
      assumes: "Early results of Serrano's Hearth Study suggest that children in three-generation homes hear a wider range of vocabulary.",
      person: "Sociologist Dalia Serrano, who leads a study of 640 families, grew up in a three-generation household in Tucson.",
      detail: "The Hearth Study, which Serrano leads, follows 640 families in Arizona and New Mexico, most of them in small towns.",
    },
    {
      scene: "eoi-aud-open-streets",
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
      person: "Urban planner Nadia Febres, who created a program for the city in 2015, had studied street design in Bogotá and Copenhagen.",
      detail: "Shops along the route of Open Streets Kalamar report higher Sunday sales, when about 40,000 people walk or bike there.",
    },
    {
      scene: "eoi-aud-emery-ledgers",
      subject: "the Emery Ledgers",
      short: "the Emery Ledgers",
      creator: "Owen Tsai",
      notes: [
        "The Emery Ledgers are account books kept by a general store in Vermont from 1841 to 1879.",
        "Historian Owen Tsai rediscovered them in a barn in 2009.",
        "Tsai specializes in the economic history of rural New England.",
        "The ledgers record more than 30,000 purchases.",
        "They show that many customers paid in eggs, wool, or labor rather than cash.",
      ],
      need: ["Emery Ledgers", "account books kept by a general store"],
      key: "The Emery Ledgers, account books kept by a general store in Vermont from 1841 to 1879, record more than 30,000 purchases.",
      assumes: "The Emery Ledgers that Tsai rediscovered show that many customers paid in eggs, wool, or labor rather than in cash.",
      person: "Historian Owen Tsai, who specializes in the economic history of rural New England, rediscovered the ledgers in a barn in 2009.",
      detail: "Of the more than 30,000 purchases in the Emery Ledgers, many were paid for in eggs, wool, or labor instead of cash.",
    },
    {
      scene: "eoi-aud-serrat-aqueduct",
      subject: "the Serrat Aqueduct",
      short: "the Serrat Aqueduct",
      creator: "Lluís Pradell",
      notes: [
        "The Serrat Aqueduct is a stone channel that carried spring water 9 miles to the town of Aldena.",
        "Engineer Lluís Pradell designed it in the 1720s.",
        "Pradell had earlier built grain mills in the region.",
        "The aqueduct crosses a valley on 36 arches.",
        "It supplied the town until 1911.",
      ],
      need: ["Serrat Aqueduct", "stone channel"],
      key: "The Serrat Aqueduct, a stone channel designed in the 1720s, carried spring water 9 miles to the town of Aldena.",
      assumes: "Pradell's Serrat Aqueduct, which crosses a valley on 36 arches, supplied the town of Aldena with water until 1911.",
      person: "Before designing a water system for the town of Aldena in the 1720s, engineer Lluís Pradell built grain mills in the region.",
      detail: "The Serrat Aqueduct crosses a valley on 36 arches and supplied the town of Aldena with water until 1911.",
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
      ],
      need: ["Field Guide", "series of 24 woodcut prints"],
      key: "Field Guide, a series of 24 woodcut prints of desert plants, shows each plant at its actual size.",
      assumes: "In Field Guide, which is now owned by a museum in Tucson, Ortega shows each plant at its actual size.",
      person: "Before making prints of desert plants from 2011 to 2014, Nayeli Ortega trained as a botanical illustrator.",
      detail: "Field Guide, which Ortega made between 2011 and 2014, is now part of the collection of a museum in Tucson.",
    },
    {
      scene: "eoi-aud-estuary-cello",
      subject: "Estuary",
      short: "Estuary",
      creator: "Amara Oyelaran",
      notes: [
        "Estuary is a 40-minute composition for solo cello.",
        "It was written by composer Amara Oyelaran in 2012.",
        "Oyelaran grew up in Lagos and studied composition in London.",
        "The piece imitates the sound of wind over a salt marsh.",
        "Cellists have performed it more than 200 times.",
      ],
      need: ["Estuary", "composition for solo cello"],
      key: "Estuary, a 40-minute composition for solo cello, imitates the sound of wind blowing over a salt marsh.",
      assumes: "Oyelaran's Estuary, which imitates the sound of wind over a salt marsh, has been performed more than 200 times.",
      person: "Composer Amara Oyelaran, who wrote a piece for cellists in 2012, grew up in Lagos and studied composition in London.",
      detail: "Since it was written in 2012, Estuary has been performed more than 200 times by cellists around the world.",
    },
    {
      scene: "eoi-aud-weather-keepers",
      subject: "The Weather Keepers",
      short: "The Weather Keepers",
      creator: "Delia Grange",
      notes: [
        "The Weather Keepers is a novel about a family that runs a weather station on a remote island.",
        "It was written by Delia Grange and published in 2004.",
        "Grange worked as a meteorologist for twelve years before becoming a writer.",
        "The novel is narrated by the family's youngest daughter.",
        "It has been translated into 14 languages.",
      ],
      need: ["The Weather Keepers", "novel about a family that runs a weather station"],
      key: "The Weather Keepers, a 2004 novel about a family that runs a weather station on a remote island, is narrated by a daughter.",
      assumes: "Grange's The Weather Keepers, which is narrated by the family's youngest daughter, has been translated into 14 languages.",
      person: "Before publishing a novel in 2004, Delia Grange worked for twelve years as a meteorologist on the mainland and at sea.",
      detail: "Translated into 14 languages since its publication in 2004, The Weather Keepers is narrated by the family's youngest daughter.",
    },
    {
      scene: "eoi-aud-long-haul",
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
      person: "Director Marguerite Doucet spent two winters riding along with truck drivers who cross frozen lakes in northern Canada.",
      detail: "Released in 2020, The Long Haul was shot largely at night and went on to win an award at a festival in Toronto.",
    },
  ];

  // Explain an advantage of a method or material. The key states the benefit
  // (`need`); `describe` says what it is, `drawback` gives a cost, and
  // `other` gives a related fact, none of which is an advantage.
  const ADVANTAGE_TOPICS = [
    {
      scene: "eoi-adv-seabird-drones",
      method: "using drones to count nesting seabirds",
      short: "drone counts",
      notes: [
        "Biologists have traditionally counted nesting seabirds by walking through colonies.",
        "Walking through a colony can frighten adult birds away from their nests.",
        "Drones can photograph an entire colony from 50 meters overhead.",
        "Birds rarely react to drones flying at that height.",
        "A drone's battery lasts only about 25 minutes.",
      ],
      need: ["drone", "rarely react"],
      key: "Because birds rarely react to drones flying overhead, drone counts avoid frightening adults away from their nests.",
      describe: "Flying 50 meters overhead, a drone can photograph an entire colony of nesting seabirds in a single flight.",
      drawback: "A drone used to photograph an entire colony of nesting seabirds from overhead has a battery that lasts only about 25 minutes.",
      other: "Biologists have traditionally counted nesting seabirds by walking through the colonies where the birds nest.",
    },
    {
      scene: "eoi-adv-mycelium",
      method: "packaging made from mushroom mycelium",
      short: "mycelium packaging",
      notes: [
        "Polystyrene foam is widely used to protect goods during shipping.",
        "Polystyrene can persist in landfills for centuries.",
        "Mycelium packaging is grown from mushroom roots and farm waste in about a week.",
        "Mycelium packaging breaks down in soil within 45 days.",
        "It currently costs more to produce than polystyrene.",
      ],
      need: ["mycelium packaging", "within 45 days"],
      key: "Unlike polystyrene, which can persist in landfills for centuries, mycelium packaging breaks down in soil within 45 days.",
      describe: "Mycelium packaging is grown in about a week from a mixture of mushroom roots and farm waste.",
      drawback: "Mycelium packaging currently costs more to produce than the polystyrene foam that shippers now widely use to protect goods.",
      other: "Polystyrene foam is widely used by shippers to protect goods from damage while they are in transit.",
    },
    {
      scene: "eoi-adv-court-texts",
      method: "sending text-message reminders about court dates",
      short: "text-message reminders",
      notes: [
        "Courts in Harlow County used to notify defendants of court dates only by mailed letter.",
        "In 2021, the county began also sending text-message reminders three days before each date.",
        "The reminders include the courthouse address and the time of the hearing.",
        "Missed court dates fell by 26 percent in the first year.",
        "About 8 percent of defendants do not have a mobile phone.",
      ],
      need: ["text-message reminders", "26 percent"],
      key: "After Harlow County began sending text-message reminders, missed court dates fell by 26 percent in the first year.",
      describe: "Harlow County's text-message reminders, sent three days before each court date, include the address and time.",
      drawback: "About 8 percent of defendants in Harlow County cannot receive text-message reminders because they lack a mobile phone.",
      other: "Before 2021, Harlow County notified defendants of their court dates only by sending them a letter in the mail.",
    },
    {
      scene: "eoi-adv-online-council",
      method: "holding town council meetings online",
      short: "online meetings",
      notes: [
        "The town of Ashgrove held all council meetings in person until 2020.",
        "In-person meetings drew an average of 35 residents.",
        "Online meetings, which began in 2020, have drawn an average of 210 residents.",
        "Residents can join online meetings by computer or by phone.",
        "Some older residents have reported difficulty using the meeting software.",
      ],
      need: ["online", "210 residents"],
      key: "Ashgrove's online council meetings draw an average of 210 residents, compared with 35 for in-person meetings.",
      describe: "Residents of Ashgrove can join the town's online council meetings either by computer or by phone.",
      drawback: "Some older residents of Ashgrove have reported having difficulty using the software for the town's online council meetings.",
      other: "Until 2020, the town of Ashgrove held all of its council meetings in person at the town hall.",
    },
    {
      scene: "eoi-adv-copper-maps",
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
      ],
      need: ["tile", "do not catch fire"],
      key: "Unlike thatch, which caught fire easily, the clay tile roofs required in Brevil after 1433 do not catch fire from stray sparks.",
      describe: "After a fire in 1433 destroyed 200 homes, the town of Brevil began requiring houses to have clay tile roofs.",
      drawback: "Clay tile roofs were heavy, so houses in Brevil that had them required stronger walls than thatched houses.",
      other: "Until the 1400s, most houses in Brevil had thatched roofs, which could be made cheaply from local reeds.",
    },
    {
      scene: "eoi-adv-acrylic",
      method: "acrylic paint",
      short: "acrylic paint",
      notes: [
        "For centuries, most easel painters worked in oil paint.",
        "Oil paint can take weeks to dry completely.",
        "Acrylic paint, introduced in the 1950s, is made with a plastic-based binder.",
        "Acrylic paint dries in less than an hour.",
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
      method: "LED video walls in filmmaking",
      short: "LED video walls",
      notes: [
        "Many films place actors in front of a green screen, and scenery is added by computer later.",
        "Some productions now use LED video walls that display scenery during filming.",
        "With an LED wall, actors can see the scenery they are reacting to.",
        "An LED wall can cost several million dollars.",
        "The first large LED walls for film were built in the 2010s.",
      ],
      need: ["LED", "can see the scenery"],
      key: "Because an LED video wall displays scenery during filming, actors can see the scenery they are reacting to.",
      describe: "Some film productions now use LED video walls, which display the scenery while the actors are being filmed.",
      drawback: "An LED video wall of the kind that some film productions now use can cost several million dollars.",
      other: "In many films, actors perform in front of a green screen, and the scenery is added later by computer.",
    },
    {
      scene: "eoi-adv-installments",
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
      method: "recording an album in a single live take",
      short: "recording live",
      notes: [
        "Jazz pianist Teodor Varga recorded his 1974 album in a single afternoon with no retakes.",
        "Most albums of the time were assembled from many separate takes.",
        "Varga's band had played together for eleven years.",
        "Critics praised the album's spontaneity.",
        "The live approach also left several wrong notes on the finished record.",
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
      category: "fish that live in polar waters",
      notes: [
        "Many fish that live in polar waters produce antifreeze proteins.",
        "These proteins keep ice crystals from growing in the fish's blood.",
        "The Antarctic toothfish lives in water colder than the freezing point of fresh water.",
        "The Arctic cod can survive beneath sea ice.",
        "The winter flounder produces antifreeze proteins only in the colder months.",
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
      category: "tool use among birds",
      notes: [
        "Several bird species have been observed using tools to find food.",
        "New Caledonian crows shape twigs into hooks to pull insects from logs.",
        "Woodpecker finches use cactus spines to probe bark for larvae.",
        "Egyptian vultures drop stones on ostrich eggs to crack them.",
        "Researchers once thought tool use was limited to primates.",
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
      category: "whistled languages",
      notes: [
        "Whistled languages are forms of speech that people produce by whistling.",
        "They usually develop in mountainous or densely forested areas, where whistles carry farther than spoken words.",
        "Silbo Gomero is whistled on La Gomera in the Canary Islands.",
        "Villagers in Kuşköy, Turkey, whistle a form of Turkish.",
        "The Hmong of Southeast Asia use whistled speech during courtship.",
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
      category: "medieval town walls in Europe",
      notes: [
        "Many medieval towns in Europe were enclosed by stone walls.",
        "Besides providing defense, the walls let towns collect tolls on goods entering through the gates.",
        "The walls of Carcassonne, in southern France, were restored in the 1800s.",
        "York, in England, still has most of its medieval walls.",
        "In Dubrovnik, visitors can walk along the top of the old city walls.",
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
        "Company towns were communities built by a single employer to house its workers.",
        "The employer typically owned the houses, stores, and schools.",
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
      category: "instruments made from gourds",
      notes: [
        "Musicians in many cultures make instruments from dried gourds.",
        "A hollow gourd amplifies sound, acting as a natural resonator.",
        "The kora, a West African harp, has a body made from a large calabash gourd.",
        "The berimbau, played in Brazil, is a bow with a gourd attached near one end.",
        "The shekere is a gourd covered with a net of beads that rattle when shaken.",
      ],
      need: ["gourds"],
      examples: ["kora", "berimbau", "shekere"],
      key: "In many cultures, musicians make instruments from dried gourds, which amplify sound as natural resonators.",
      wrong: [
        "The kora, a harp played in West Africa, has a body made from a large, hollow calabash gourd.",
        "In Brazil, musicians play the berimbau, a bow with a gourd attached near one end of it.",
        "A dried gourd covered with a net of beads that rattle when it is shaken, the shekere is a percussion instrument.",
      ],
    },
    {
      scene: "eoi-gen-kinetic-sculpture",
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
      category: "epistolary novels",
      notes: [
        "Epistolary novels tell their stories through documents such as letters and diary entries.",
        "The form lets readers see events through several characters' eyes.",
        "Mary Shelley's Frankenstein (1818) is framed by letters from an explorer to his sister.",
        "Bram Stoker's Dracula (1897) combines letters, diary entries, and newspaper clippings.",
        "Alice Walker's The Color Purple (1982) is told mostly in letters written by its main character, Celie.",
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
      category: "women printers in colonial America",
      notes: [
        "In colonial America, several women ran printing businesses, often after taking over shops from husbands or brothers.",
        "Elizabeth Timothy published the South Carolina Gazette in Charleston after her husband died in 1738.",
        "Ann Franklin ran her late husband's print shop in Newport, Rhode Island.",
        "Mary Katherine Goddard printed an early copy of the Declaration of Independence in Baltimore in 1777.",
        "Printing shops of the period often also sold books and stationery.",
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
      notes: [
        "Plant biologist Rhea Adisa wanted to know whether tomato plants can warn nearby plants of insect attacks.",
        "She grew tomato plants in pairs and allowed caterpillars to feed on one plant in each pair.",
        "The undamaged plants began producing insect-repelling chemicals within 48 hours.",
        "The finding suggests that farmers could protect crops by deliberately exposing a few plants to pests.",
        "Earlier studies of plant warning signals focused mainly on trees.",
      ],
      need: ["within 48 hours", "protect crops"],
      key: "Adisa found that undamaged tomato plants made insect repellents within 48 hours, suggesting a new way for farmers to protect crops.",
      findingMethod: "When Adisa let caterpillars feed on one tomato plant in each pair, the undamaged plants began making repellents within 48 hours.",
      aimMethod: "To learn whether tomato plants can warn their neighbors of insect attacks, Adisa let caterpillars feed on one plant in each pair.",
      context: "Adisa's research on whether tomato plants warn their neighbors of attacks could point to ways for farmers to protect crops.",
    },
    {
      scene: "eoi-sig-fiber-quakes",
      notes: [
        "Seismologist Karl Engstrom tested whether ordinary fiber-optic internet cables can detect earthquakes.",
        "He sent laser pulses through 30 kilometers of buried cable in Iceland and measured tiny changes in the returning light.",
        "The cable detected small earthquakes that the region's seismometers also recorded.",
        "Because such cables already run under many cities, they could provide low-cost earthquake monitoring.",
        "Traditional seismometers can cost tens of thousands of dollars each.",
      ],
      need: ["detected small earthquakes", "low-cost earthquake monitoring"],
      key: "Engstrom's buried cable detected small earthquakes, so existing fiber-optic cables could provide low-cost earthquake monitoring.",
      findingMethod: "By measuring changes in laser pulses sent through buried cable, Engstrom detected small earthquakes that seismometers also recorded.",
      aimMethod: "To test whether internet cables can detect earthquakes, Engstrom sent laser pulses through 30 kilometers of buried cable in Iceland.",
      context: "Because fiber-optic cables already run under many cities, Engstrom tested whether ordinary internet cables can detect earthquakes.",
    },
    {
      scene: "eoi-sig-savings-photos",
      notes: [
        "Economist Lucía Ferreyra studied whether people save more when their savings goals are shown as pictures.",
        "She gave 900 bank customers an app that displayed a photo of each customer's goal, such as a new bicycle.",
        "Customers who saw photos saved 18 percent more over six months than customers who saw only numbers.",
        "The finding suggests that banks could encourage saving simply by changing how goals are displayed.",
        "Most savings apps show goals as dollar amounts.",
      ],
      need: ["18 percent more", "encourage saving"],
      key: "Customers who saw photos of their goals saved 18 percent more, suggesting that banks could encourage saving through displays.",
      findingMethod: "In Ferreyra's six-month study of 900 bank customers, those shown photos of their goals saved 18 percent more than the others.",
      aimMethod: "To see whether pictures affect saving, Ferreyra gave 900 bank customers an app that displayed a photo of each one's goal.",
      context: "Since most savings apps show goals only as dollar amounts, Ferreyra's research on pictures could help banks encourage saving.",
    },
    {
      scene: "eoi-sig-clinic-birdsong",
      notes: [
        "Psychologist Amir Haddadi wanted to know whether recorded nature sounds reduce stress in hospital waiting rooms.",
        "For eight weeks, he alternated between playing birdsong and playing no sound in a clinic's waiting room.",
        "Patients' self-reported stress was 20 percent lower on birdsong days.",
        "The finding suggests that clinics could ease patients' anxiety at almost no cost.",
        "The clinic serves about 300 patients a week.",
      ],
      need: ["20 percent lower", "almost no cost"],
      key: "Patients' stress was 20 percent lower on days Haddadi played birdsong, suggesting that clinics could ease anxiety at almost no cost.",
      findingMethod: "When Haddadi alternated birdsong and silence in a clinic's waiting room, patients' stress was 20 percent lower on birdsong days.",
      aimMethod: "To learn whether nature sounds reduce stress, Haddadi spent eight weeks alternating birdsong and silence in a clinic's waiting room.",
      context: "Haddadi's research, done in a clinic that serves about 300 patients a week, concerns easing patients' anxiety at almost no cost.",
    },
    {
      scene: "eoi-sig-church-roof",
      notes: [
        "Historian Greta Solvik wanted to determine when the timber roof of Hallberg Church in Norway was built.",
        "She compared the growth rings in the roof beams with a record of tree rings from the region.",
        "The trees used for the beams were cut down in the winter of 1181.",
        "The date places the roof among the oldest surviving timber roofs in northern Europe.",
        "The church's stone walls were rebuilt in the 1600s.",
      ],
      need: ["1181", "oldest surviving timber roofs"],
      key: "Hallberg Church's roof beams came from trees cut in 1181, which places the roof among the oldest surviving timber roofs in northern Europe.",
      findingMethod: "By comparing growth rings in the roof beams with regional tree-ring records, Solvik found that the trees were cut down in 1181.",
      aimMethod: "Solvik compared the growth rings in the roof beams of Hallberg Church with regional records to learn when the roof was built.",
      context: "Hallberg Church in Norway, whose stone walls were rebuilt in the 1600s, has a timber roof that the historian Solvik studied.",
    },
    {
      scene: "eoi-sig-baltic-jars",
      notes: [
        "Archaeologist Tomasz Wierzba studied the cargo of a 14th-century shipwreck found off the coast of Poland.",
        "He tested the chemical makeup of 40 ceramic jars from the wreck.",
        "The clay in the jars came from workshops in southern Spain.",
        "The finding shows that trade between Spain and the Baltic region was active a century earlier than written records indicate.",
        "The wreck lies in 20 meters of water.",
      ],
      need: ["southern Spain", "a century earlier"],
      key: "Clay from southern Spain in the wreck's jars shows that trade with the Baltic was active a century earlier than records indicate.",
      findingMethod: "Wierzba's chemical tests of 40 ceramic jars from a 14th-century shipwreck showed that their clay came from southern Spain.",
      aimMethod: "In studying the cargo of a 14th-century shipwreck off the coast of Poland, Wierzba tested the chemical makeup of 40 ceramic jars.",
      context: "A 14th-century shipwreck off the coast of Poland, whose cargo Wierzba studied, now lies in 20 meters of water.",
    },
    {
      scene: "eoi-sig-hidden-portrait",
      notes: [
        "Art historian Colette Marchand examined Rue Verte, an 1889 painting by Émile Dorval, using X-ray imaging.",
        "Beneath the street scene, she discovered a nearly finished portrait of a woman.",
        "Dorval's letters mention that he could not afford new canvases that year.",
        "The finding supports the view that poverty shaped Dorval's working methods more than scholars had recognized.",
        "Rue Verte hangs in a museum in Lyon.",
      ],
      need: ["portrait", "poverty shaped"],
      key: "The portrait Marchand found beneath Rue Verte suggests that poverty shaped Dorval's methods more than scholars had recognized.",
      findingMethod: "Using X-ray imaging, Marchand discovered a nearly finished portrait of a woman hidden beneath the street scene in Dorval's Rue Verte.",
      aimMethod: "Marchand used X-ray imaging to examine Rue Verte, a street scene that Émile Dorval painted in 1889 and that hangs in Lyon.",
      context: "Dorval, whose painting Rue Verte now hangs in Lyon, wrote in letters that he could not afford new canvases in 1889.",
    },
    {
      scene: "eoi-sig-albion-tickets",
      notes: [
        "Theater historian Evan Pryce studied ticket records from London's Albion Theatre between 1790 and 1820.",
        "He compared the prices of the cheapest seats with the daily wages of laborers.",
        "The cheapest seats cost less than a tenth of a laborer's daily wage.",
        "This suggests that the theater's audiences were more working-class than scholars have assumed.",
        "The Albion Theatre burned down in 1841.",
      ],
      need: ["less than a tenth", "more working-class"],
      key: "Since its cheapest seats cost less than a tenth of a laborer's daily wage, the Albion likely drew more working-class audiences than assumed.",
      findingMethod: "Comparing ticket prices with laborers' wages, Pryce found that the cheapest seats at London's Albion Theatre cost less than a tenth of a day's wage.",
      aimMethod: "Pryce compared the prices of the cheapest seats at the Albion Theatre from 1790 to 1820 with the daily wages of laborers.",
      context: "Pryce studied ticket records from London's Albion Theatre, which operated in the 1790s and later burned down in 1841.",
    },
    {
      scene: "eoi-sig-hesketh-drafts",
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
        "Pembrook's notebooks are held by a library in Boston.",
      ],
      need: ["1859", "developed the machine slowly"],
      key: "Pembrook sketched his first typewriter in 1859, suggesting that he developed the machine slowly rather than in one sudden burst.",
      findingMethod: "By dating 300 sketches through the paper's watermarks, Castell found that Pembrook's first typewriter sketch was made in 1859.",
      aimMethod: "Castell dated each of the 300 sketches in inventor Josiah Pembrook's notebooks by using the watermarks on the paper.",
      context: "Josiah Pembrook, whose notebooks are held by a library in Boston, patented an early typewriter in 1868 after years of work.",
    },
  ];

  // Emphasize a similarity while acknowledging a difference. The key puts the
  // difference in its subordinate clause and the similarity in its main
  // clause; `rev` reverses that emphasis with the same facts.
  const CONCESSION_SIMILARITY_TOPICS = [
    {
      scene: "eoi-csim-icy-moons",
      pair: "Europa and Enceladus",
      notes: [
        "Europa is a moon of Jupiter.",
        "Enceladus is a moon of Saturn.",
        "Both moons are thought to have oceans of liquid water beneath their icy surfaces.",
        "Europa is about 3,100 kilometers across.",
        "Enceladus is about 500 kilometers across.",
      ],
      sim: "oceans of liquid water",
      diff: ["Jupiter", "Saturn"],
      keySub: "Although Europa orbits Jupiter and Enceladus orbits Saturn",
      keyMain: "both moons are thought to have oceans of liquid water beneath their icy surfaces",
      revSub: "Although both moons are thought to have oceans of liquid water beneath their icy surfaces",
      revMain: "Europa orbits Jupiter and Enceladus orbits Saturn",
      similarityOnly: "Europa and Enceladus are both moons that are thought to have oceans of liquid water hidden beneath their icy surfaces.",
      differenceOnly: "Europa, a moon about 3,100 kilometers across, orbits Jupiter, while Enceladus, about 500 kilometers across, orbits Saturn.",
    },
    {
      scene: "eoi-csim-willow-meadowsweet",
      pair: "willow and meadowsweet",
      notes: [
        "Willow is a tree that grows along riverbanks.",
        "Meadowsweet is a flowering herb found in damp meadows.",
        "Both plants contain salicylic compounds, which reduce pain and fever.",
        "Ancient Egyptian texts mention willow as a remedy.",
        "Salicylic compounds from meadowsweet were used in developing aspirin in the 1890s.",
      ],
      sim: "salicylic compounds",
      diff: ["tree", "herb"],
      keySub: "Although willow is a riverbank tree and meadowsweet a meadow herb",
      keyMain: "both plants contain salicylic compounds",
      revSub: "Although willow and meadowsweet both contain salicylic compounds",
      revMain: "willow is a riverbank tree and meadowsweet a flowering herb",
      similarityOnly: "Willow and meadowsweet both contain salicylic compounds, substances that are known to reduce pain and fever.",
      differenceOnly: "Willow is a tree that grows along riverbanks, while meadowsweet is a flowering herb that is found in damp meadows.",
    },
    {
      scene: "eoi-csim-traffic-deaths",
      pair: "the two cities",
      notes: [
        "In 2016, the city of Marlton lowered its speed limits on residential streets.",
        "In 2017, the city of Fenwick added protected bike lanes and wider sidewalks.",
        "Over the next five years, traffic deaths fell by about a third in each city.",
        "Marlton has a population of 410,000.",
        "Fenwick has a population of 280,000.",
      ],
      sim: "fell by about a third",
      diff: ["speed limits", "bike lanes"],
      keySub: "Although Marlton lowered speed limits while Fenwick added bike lanes and wider sidewalks",
      keyMain: "traffic deaths fell by about a third in both cities",
      revSub: "Although traffic deaths fell by about a third in both cities",
      revMain: "Marlton lowered speed limits, whereas Fenwick added bike lanes and wider sidewalks",
      similarityOnly: "In the five years after Marlton and Fenwick changed their streets, traffic deaths fell by about a third in each city.",
      differenceOnly: "Marlton lowered its speed limits on residential streets in 2016, and Fenwick added protected bike lanes and wider sidewalks in 2017.",
    },
    {
      scene: "eoi-csim-reading-schools",
      pair: "the two schools",
      notes: [
        "Alder Primary School teaches reading mainly through phonics lessons.",
        "Crestview Primary School teaches reading mainly through shared storybook reading.",
        "At both schools, about 85 percent of students read at grade level by third grade.",
        "Alder Primary has 22 students per class on average.",
        "Crestview Primary has 26 students per class on average.",
      ],
      sim: "85 percent",
      diff: ["phonics", "storybook"],
      keySub: "Although Alder teaches reading through phonics and Crestview through storybooks",
      keyMain: "both see about 85 percent of students reading at grade level",
      revSub: "Although both schools see about 85 percent of students reading at grade level",
      revMain: "Alder teaches through phonics and Crestview through storybooks",
      similarityOnly: "At Alder Primary and at Crestview Primary alike, about 85 percent of students read at grade level by the end of third grade.",
      differenceOnly: "Alder Primary teaches reading mainly through phonics lessons, whereas Crestview Primary relies mainly on shared storybook reading.",
    },
    {
      scene: "eoi-csim-worker-parks",
      pair: "the two parks",
      notes: [
        "Rowan Park opened in 1858 on the site of a former brickworks.",
        "Ashcombe Commons opened in 1873 on the site of a former rail yard.",
        "Both parks were designed to give factory workers a place to rest outdoors.",
        "Rowan Park covers 30 hectares.",
        "Ashcombe Commons covers 12 hectares.",
      ],
      sim: "factory workers",
      diff: ["brickworks", "rail yard"],
      keySub: "Although Rowan Park replaced a brickworks and Ashcombe Commons a rail yard",
      keyMain: "both were designed to give factory workers a place to rest",
      revSub: "Although both parks were designed to give factory workers a place to rest",
      revMain: "Rowan Park replaced a brickworks and Ashcombe Commons a rail yard",
      similarityOnly: "Rowan Park, which covers 30 hectares, and Ashcombe Commons were both designed to give factory workers a place to rest outdoors.",
      differenceOnly: "Rowan Park opened in 1858 on the site of a former brickworks, and Ashcombe Commons opened in 1873 on the site of a former rail yard.",
    },
    {
      scene: "eoi-csim-scripts",
      pair: "Egyptian hieroglyphs and Maya script",
      notes: [
        "Egyptian hieroglyphs were used in northeastern Africa from about 3200 BCE.",
        "Maya script was used in Mesoamerica from about 300 BCE.",
        "Both writing systems combine signs for whole words with signs for sounds.",
        "Scholars deciphered Egyptian hieroglyphs in the 1820s.",
        "Much of Maya script was not deciphered until the late 1900s.",
      ],
      sim: "signs for whole words with signs for sounds",
      diff: ["northeastern Africa", "Mesoamerica"],
      keySub: "Although hieroglyphs arose in northeastern Africa and Maya script in Mesoamerica",
      keyMain: "both combine signs for whole words with signs for sounds",
      revSub: "Although both scripts combine signs for whole words with signs for sounds",
      revMain: "hieroglyphs arose in northeastern Africa and Maya script in Mesoamerica",
      similarityOnly: "Egyptian hieroglyphs and Maya script are alike in that both combine signs for whole words with signs for sounds.",
      differenceOnly: "Egyptian hieroglyphs were used in northeastern Africa from about 3200 BCE, and Maya script in Mesoamerica from about 300 BCE.",
    },
    {
      scene: "eoi-csim-river-painters",
      pair: "the two painters",
      notes: [
        "Painter Odile Marceau worked mainly in watercolor.",
        "Painter Hugo Brask worked mainly in oil.",
        "Both artists painted the Varne River repeatedly over several decades.",
        "Marceau's river scenes are usually smaller than 30 centimeters wide.",
        "Brask's largest river painting is over 4 meters wide.",
      ],
      sim: "Varne River",
      diff: ["watercolor", "in oil"],
      keySub: "Although Marceau worked mainly in watercolor and Brask mainly in oil",
      keyMain: "both artists painted the Varne River repeatedly over several decades",
      revSub: "Although Marceau and Brask both painted the Varne River repeatedly over several decades",
      revMain: "Marceau worked mainly in watercolor and Brask in oil",
      similarityOnly: "Both Marceau and Brask returned to the Varne River as a subject again and again over the course of several decades.",
      differenceOnly: "Marceau worked mainly in watercolor, while Brask, whose largest river painting is over 4 meters wide, worked mainly in oil.",
    },
    {
      scene: "eoi-csim-acoustic-albums",
      pair: "the two albums",
      notes: [
        "Folk duo Fenn & Dahl recorded their album Low Country in a professional studio in Nashville.",
        "Singer Mireille Tauber recorded her album Stillwater in a stone chapel in rural France.",
        "Both albums use only acoustic instruments.",
        "Low Country was released in 2019.",
        "Stillwater was released in 2021.",
      ],
      sim: "acoustic instruments",
      diff: ["studio", "chapel"],
      keySub: "Although Low Country was recorded in a Nashville studio and Stillwater in a French chapel",
      keyMain: "both albums use only acoustic instruments",
      revSub: "Although Low Country and Stillwater both use only acoustic instruments",
      revMain: "one was recorded in a studio and the other in a chapel",
      similarityOnly: "Low Country, by the duo Fenn & Dahl, and Stillwater, by singer Mireille Tauber, both use only acoustic instruments.",
      differenceOnly: "Fenn & Dahl recorded Low Country in a Nashville studio, while Tauber recorded Stillwater in a stone chapel in France.",
    },
    {
      scene: "eoi-csim-mining-memoirs",
      pair: "the two memoirs",
      notes: [
        "Writer Tomasz Wilk wrote his memoir Coal Dust in verse.",
        "Writer Grace Adeyemi wrote her memoir Pit Lane in prose.",
        "Both memoirs describe growing up in coal-mining towns.",
        "Coal Dust was published in 1988.",
        "Pit Lane was published in 2006.",
      ],
      sim: "coal-mining towns",
      diff: ["verse", "prose"],
      keySub: "Although Wilk wrote Coal Dust in verse and Adeyemi wrote Pit Lane in prose",
      keyMain: "both memoirs describe growing up in coal-mining towns",
      revSub: "Although Coal Dust and Pit Lane both describe growing up in coal-mining towns",
      revMain: "Wilk wrote in verse and Adeyemi in prose",
      similarityOnly: "Tomasz Wilk's Coal Dust and Grace Adeyemi's Pit Lane are both memoirs that describe growing up in coal-mining towns.",
      differenceOnly: "Tomasz Wilk wrote his 1988 memoir Coal Dust in verse, whereas Grace Adeyemi wrote her 2006 memoir Pit Lane in prose.",
    },
    {
      scene: "eoi-csim-mail-inventors",
      pair: "the two inventors",
      notes: [
        "Ada Lindgren trained as an engineer at a university in Stockholm.",
        "Pieter Van Aalst had no formal schooling and learned by repairing clocks.",
        "Both inventors designed early machines for sorting mail.",
        "Lindgren's machine was installed in a post office in 1931.",
        "Van Aalst's machine was patented in 1928.",
      ],
      sim: "sorting mail",
      diff: ["engineer", "repairing clocks"],
      keySub: "Although Lindgren trained as an engineer and Van Aalst learned by repairing clocks",
      keyMain: "both inventors designed early machines for sorting mail",
      revSub: "Although Lindgren and Van Aalst both designed early machines for sorting mail",
      revMain: "one trained as an engineer and the other learned by repairing clocks",
      similarityOnly: "Lindgren and Van Aalst, two inventors of the early twentieth century, both designed early machines for sorting mail.",
      differenceOnly: "Lindgren trained as an engineer in Stockholm, while Van Aalst had no formal schooling and learned by repairing clocks.",
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
      ],
      need: ["most nectar", "closest to their nests"],
      key: "Although the researchers expected the bees to favor flowers with the most nectar, the bees most often visited those closest to their nests.",
      resultMethod: "After tracking 150 marked bees over three summers, Ueda's team found that the bees most often visited the flowers that were closest to their nests.",
      expectationMethod: "Ueda's team, which tracked 150 marked bees over three summers, expected them to favor the flowers that produced the most nectar.",
      resultOther: "That bees most often visit flowers closest to their nests may help explain why some high-nectar flowers go largely unvisited.",
    },
    {
      scene: "eoi-exp-trout-frogs",
      goal: "emphasize how the study's results differed from what the researchers expected",
      notes: [
        "Researchers removed invasive trout from 12 mountain lakes to help native frogs recover.",
        "They predicted that frog populations would double within five years.",
        "They surveyed the lakes each summer for eight years.",
        "Frog populations grew only slightly, because a fungal disease was spreading among the frogs.",
        "Nearby lakes that still had trout were also surveyed.",
      ],
      need: ["double", "grew only slightly"],
      key: "The researchers predicted that frog populations would double after the trout were removed, but the populations grew only slightly.",
      resultMethod: "Surveys of the 12 lakes over eight years showed that frog populations grew only slightly after the invasive trout had been removed.",
      expectationMethod: "After removing invasive trout from 12 lakes, the researchers predicted that frog populations would double within five years.",
      resultOther: "Frog populations grew only slightly after the trout were removed because a fungal disease was spreading among the frogs.",
    },
    {
      scene: "eoi-exp-bag-charge",
      goal: "emphasize how the study's results differed from what the economists expected",
      notes: [
        "In 2019, the town of Dunfield began charging shoppers 10 cents for each plastic bag.",
        "Economists studying the policy expected bag use to fall by about 20 percent.",
        "They counted bags used at 15 grocery stores for a year before and a year after the charge began.",
        "Bag use fell by 74 percent.",
        "Many shoppers began bringing reusable bags.",
      ],
      need: ["20 percent", "74 percent"],
      key: "Economists expected Dunfield's 10-cent bag charge to reduce bag use by about 20 percent, but bag use fell by 74 percent.",
      resultMethod: "Counts at 15 grocery stores showed that bag use in Dunfield fell by 74 percent after the town's 10-cent charge began.",
      expectationMethod: "Economists who counted bags at 15 Dunfield grocery stores expected the 10-cent charge to cut bag use by about 20 percent.",
      resultOther: "After Dunfield began its 10-cent charge in 2019, bag use fell by 74 percent, and many shoppers brought reusable bags.",
    },
    {
      scene: "eoi-exp-loneliness",
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
      goal: "emphasize how the excavation's results differed from what the archaeologists expected",
      notes: [
        "Archaeologists excavated a 4,000-year-old settlement at Cairn Ridge in Scotland.",
        "Because the site is exposed to harsh winters, they expected it to have been a summer camp.",
        "Seeds and animal bones found at the site came from every season of the year.",
        "The team concluded that people lived at Cairn Ridge year-round.",
        "The excavation took place over four summers.",
      ],
      need: ["summer camp", "year-round"],
      key: "The archaeologists expected Cairn Ridge to have been a summer camp, but remains from every season show people lived there year-round.",
      resultMethod: "Seeds and animal bones from every season of the year showed the archaeologists that people had lived at the Cairn Ridge site year-round.",
      expectationMethod: "Because Cairn Ridge is exposed to harsh winters, the archaeologists who excavated it expected it to have been a summer camp.",
      resultOther: "People lived year-round at Cairn Ridge, a 4,000-year-old settlement in Scotland that was excavated over four summers.",
    },
    {
      scene: "eoi-exp-tavern-books",
      goal: "emphasize how Hollister's results differed from what she expected",
      notes: [
        "Historian Lena Hollister studied the account books of four taverns in 1760s Philadelphia.",
        "Hollister expected the customers to be almost entirely men.",
        "About 30 percent of the named customers were women.",
        "Many of the women bought food and drink to take home rather than to consume at the tavern.",
        "The account books list more than 2,000 customers by name.",
      ],
      need: ["almost entirely men", "30 percent"],
      key: "Hollister expected the customers of four 1760s Philadelphia taverns to be almost entirely men, but about 30 percent were women.",
      resultMethod: "Of the more than 2,000 customers named in the tavern account books that Hollister studied, about 30 percent were women.",
      expectationMethod: "Studying the account books of four 1760s Philadelphia taverns, Hollister expected the customers to be almost entirely men.",
      resultOther: "About 30 percent of the tavern customers Hollister identified were women, many of whom bought food and drink to take home.",
    },
    {
      scene: "eoi-exp-theater-acoustics",
      goal: "emphasize how the study's results differed from what the engineers expected",
      notes: [
        "Acoustic engineers studied why speech carries so well in the ancient theater at Leondari.",
        "They expected the theater's steep, bowl-like shape to be the main reason.",
        "Using computer models, they tested the effect of the shape and of the stone seats separately.",
        "The ridged stone seats did most of the work, muffling low-pitched background noise.",
        "The theater could seat about 12,000 people.",
      ],
      need: ["bowl-like shape", "ridged stone seats"],
      key: "The engineers expected the theater's bowl-like shape to explain its acoustics, but its ridged stone seats did most of the work.",
      resultMethod: "Computer models that tested the shape and the seats separately showed that Leondari's ridged stone seats muffle low-pitched noise.",
      expectationMethod: "The engineers, who tested the theater's shape and seats separately, expected its bowl-like shape to be the main reason speech carries.",
      resultOther: "By muffling low-pitched background noise, the ridged stone seats of the 12,000-seat theater at Leondari help speech carry.",
    },
    {
      scene: "eoi-exp-composer-quiz",
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
      resultOther: "Musicians and nonmusicians identified the composers with nearly the same accuracy, and both did best with Mozart.",
    },
    {
      scene: "eoi-exp-grunwald-letters",
      goal: "emphasize how Petrov's results differed from what he expected",
      notes: [
        "Scholar Ivan Petrov studied 1,400 letters that readers sent to novelist Elsa Grunwald in the 1880s.",
        "Because Grunwald's novels are set in cities, Petrov expected most letters to come from city readers.",
        "About two-thirds of the letters came from farms and small villages.",
        "Many rural writers said the novels showed them a world they had never seen.",
        "Grunwald answered nearly every letter herself.",
      ],
      need: ["city readers", "two-thirds"],
      key: "Petrov expected most of Grunwald's letters to come from city readers, but about two-thirds came from farms and small villages.",
      resultMethod: "Of the 1,400 letters that readers sent to Grunwald in the 1880s, about two-thirds came from farms and small villages.",
      expectationMethod: "Because Grunwald's novels are set in cities, Petrov expected most of her 1,400 letters to have come from city readers.",
      resultOther: "About two-thirds of Grunwald's letters came from farms and villages, and many of their writers said her novels showed them an unseen world.",
    },
    {
      scene: "eoi-exp-sand-notebooks",
      goal: "emphasize how Kimani's findings differed from what she expected",
      notes: [
        "Biographer Ruth Kimani studied the laboratory notebooks of chemist Henrik Sand, who won a major prize in 1921.",
        "Kimani expected the notebooks to show that Sand worked mostly alone.",
        "The notebooks credit 23 assistants and students by name.",
        "Several entries are written in handwriting other than Sand's.",
        "Sand kept the notebooks from 1904 to 1920.",
      ],
      need: ["worked mostly alone", "23 assistants"],
      key: "Kimani expected Sand's notebooks to show that he worked mostly alone, yet they credit 23 assistants and students by name.",
      resultMethod: "According to Kimani, the notebooks Sand kept from 1904 to 1920 credit 23 assistants and students by name.",
      expectationMethod: "Studying the notebooks of prize-winning chemist Henrik Sand, Kimani expected them to show that he worked mostly alone.",
      resultOther: "Sand's notebooks credit 23 assistants and students by name, and several entries are in handwriting other than his own.",
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

  // Every number in every choice appears in the notes, so no choice invents a
  // fact the notes do not contain.
  function grounded(notes, choices) {
    const source = notes.join(" ");
    return choices.every((choice) => numbers(choice).every((value) => source.includes(value)));
  }

  function notesStimulus(notes) {
    return { type: "notes", content: `${NOTES_INTRO}\n\n${notes.map((note) => `• ${note}`).join("\n")}` };
  }

  // One Rhetorical Synthesis template. `spec.choices(topic)` returns
  // { key, wrong: [[text, reason], ...] }; `spec.check(topic, choices)`
  // is the miswiring test verify() runs on top of the shared checks.
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
      build(t) {
        const topic = t.pick(spec.topics);
        const choices = spec.choices(topic);
        const instance = {
          responseType: "multiple-choice",
          scene: topic.scene,
          stimulus: notesStimulus(topic.notes),
          stem: `The student wants to ${spec.goal(topic)}. ${SYNTHESIS_QUESTION}`,
          correct: choices.key,
          wrong: choices.wrong,
          explanation: spec.explain(topic),
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
            grounded(topic.notes, all) &&
            spec.check(topic, offered)
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
    "Every choice in a notes question is accurate; the answer is the one that accomplishes the stated goal.",
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
    goal: (topic) => `introduce ${topic.subject} to an audience unfamiliar with it`,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.assumes, `Accurate, but it mentions ${topic.short} as though the audience already knew what it is and who is behind it.`],
        [topic.person, `Accurate, but it introduces ${topic.creator} rather than ${topic.short}.`],
        [topic.detail, `Accurate, but it offers a detail about ${topic.short} without saying what ${topic.short} is.`],
      ],
    }),
    check: needCheck,
    explain: (topic) =>
      `An unfamiliar audience first needs to know what ${topic.short} is. Only this choice names it and identifies it; the others assume the reader already knows it or introduce ${topic.creator} instead.`,
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
    difficulty: "Medium",
    title: "Notes goal: a claim about a whole category",
    recognize: "A generalization is about the category as a whole; each named example, however accurate, is a single case.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 2, synthesis: 0, trap: 0 },
    tricks: ["off-goal", "too-narrow"],
    seconds: 70,
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
    difficulty: "Hard",
    title: "Notes goal: a result paired with why it matters",
    recognize: "The goal has two parts, the finding and its significance; a choice with a detailed finding but no significance fails as surely as one with neither.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "too-narrow"],
    seconds: 95,
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

  const concessionSimilarityNotes = synthesisFamily({
    id: "notes-similarity-despite-difference",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: stress a likeness, concede a difference",
    recognize: "Emphasis goes to the main clause; a concession belongs in the subordinate clause. The choice that puts the difference in the main clause has the same facts but the opposite emphasis.",
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["off-goal", "opposite-stance"],
    seconds: 95,
    topics: CONCESSION_SIMILARITY_TOPICS,
    goal: (topic) => `emphasize a similarity between ${topic.pair} while acknowledging a difference between them`,
    choices: (topic) => ({
      key: `${topic.keySub}, ${topic.keyMain}.`,
      wrong: [
        [`${topic.revSub}, ${topic.revMain}.`,
          "It includes both points but places the similarity in the subordinate clause, so it emphasizes the difference instead."],
        [topic.similarityOnly, "It states the similarity but never acknowledges a difference."],
        [topic.differenceOnly, "It states only the difference; nothing shows what the two share."],
      ],
    }),
    check: (topic, choices) => {
      const notes = topic.notes.join(" ");
      const markers = [topic.sim, ...topic.diff];
      const [reversed, similarityOnly, differenceOnly] = choices.wrong.map(([text]) => text);
      return (
        markers.every((marker) => has(notes, marker)) &&
        choices.key === `${topic.keySub}, ${topic.keyMain}.` &&
        has(topic.keyMain, topic.sim) && !topic.diff.some((marker) => has(topic.keyMain, marker)) &&
        topic.diff.every((marker) => has(topic.keySub, marker)) && !has(topic.keySub, topic.sim) &&
        has(topic.revSub, topic.sim) && topic.diff.every((marker) => has(topic.revMain, marker)) &&
        !has(topic.revMain, topic.sim) &&
        reversed.startsWith(topic.revSub) &&
        has(similarityOnly, topic.sim) && !topic.diff.some((marker) => has(similarityOnly, marker)) &&
        topic.diff.every((marker) => has(differenceOnly, marker)) && !has(differenceOnly, topic.sim)
      );
    },
    explain: () =>
      "The similarity must be in the main clause, where it receives the emphasis, and the difference in the subordinate clause, where it is acknowledged. The reversed choice uses the same facts but emphasizes the difference.",
    steps: [
      "Split the goal: emphasize a similarity, acknowledge a difference.",
      "Eliminate choices that give only one of the two points.",
      "Of the two choices with both points, find which puts the similarity in the main clause.",
      "Choose that one; the other emphasizes the difference.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A subordinate clause (\"Although ...\") concedes; the main clause carries the emphasis."),
    trap: "Choosing the reversed sentence, which contains every required fact but emphasizes the difference.",
    hint: "In each choice with both points, which point sits in the \"Although\" clause?",
  });

  const expectationNotes = synthesisFamily({
    id: "notes-result-versus-expectation",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: a result that overturned a prediction",
    recognize: "To show how a result differed from an expectation, a choice must state both; a result alone, however detailed, does not show the contrast.",
    rubric: { steps: 2, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["off-goal", "too-narrow"],
    seconds: 95,
    topics: EXPECTATION_TOPICS,
    goal: (topic) => topic.goal,
    choices: (topic) => ({
      key: topic.key,
      wrong: [
        [topic.resultMethod, "Accurate, but it gives only the result; without the expectation, nothing shows that the result was a surprise."],
        [topic.expectationMethod, "Accurate, but it states the expectation without the result that contradicted it."],
        [topic.resultOther, "Accurate, but it pairs the result with other details rather than with the expectation it contradicted."],
      ],
    }),
    check: needCheck,
    explain: () =>
      "Showing that a result differed from an expectation requires stating both and contrasting them. Only this choice does; the others give the result or the expectation, not both.",
    steps: [
      "Identify the two things the goal compares: the expectation and the result.",
      "Find the note that states the expectation and the note that states the result.",
      "Eliminate choices that include only one of them.",
      "Choose the choice that sets the result against the expectation.",
    ],
    principles: SYNTHESIS_PRINCIPLES.concat("A contrast needs both of its sides stated."),
    trap: "Choosing the choice that reports the result with its method, which omits the expectation.",
    hint: "Does the choice say both what was expected and what was found?",
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
    expectationNotes,
  ];
});
