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
        "The Lucero Array is a network of 48 radio antennas in northern Chile.",
        "Astronomer Tomás Irigoyen designed the array.",
        "Irigoyen has studied radio signals from distant galaxies for thirty years.",
        "The array began collecting data in 2019.",
        "It detects faint signals from clouds of cold hydrogen gas.",
        "The antennas are spread across a high, dry plateau.",
      ],
      need: ["Lucero Array", "network of 48 radio antennas"],
      key: "The Lucero Array, a network of 48 radio antennas in northern Chile, detects faint signals from clouds of cold hydrogen gas.",
      assumes: "Irigoyen's Lucero Array, which began collecting data in 2019, detects faint signals from clouds of cold hydrogen gas.",
      person: "Tomás Irigoyen, an astronomer who has studied radio signals from distant galaxies for thirty years, designed the array in northern Chile.",
      detail: "Since the Lucero Array began collecting data in 2019, it has detected faint signals from clouds of cold hydrogen gas.",
    },
    {
      scene: "eoi-aud-tidewatch",
      allow: ["taken", "gathered"],
      subject: "the Tidewatch Project",
      short: "the Tidewatch Project",
      creator: "Ruth Abernathy",
      notes: [
        "The Tidewatch Project is a citizen-science program that tracks sea-level rise along the Maine coast.",
        "It was founded in 2016 by marine geologist Ruth Abernathy.",
        "Abernathy previously spent a decade mapping underwater landslides.",
        "Volunteers photograph high tides at 130 marked sites, and the photos have helped towns plan where to raise roads.",
      ],
      need: ["Tidewatch Project", "citizen-science program"],
      key: "The Tidewatch Project is a citizen-science program in which volunteers photograph high tides along the Maine coast.",
      assumes: "Abernathy's Tidewatch Project has gathered photos of high tides at 130 sites, helping towns plan where to raise roads.",
      person: "Ruth Abernathy, a marine geologist who spent a decade mapping underwater landslides, founded the program in 2016.",
      detail: "Photos taken for the Tidewatch Project since 2016 have helped towns on the Maine coast plan where to raise roads.",
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
        "Serrano grew up in a three-generation household in Tucson.",
        "The study follows 640 families in Arizona and New Mexico.",
        "Early results suggest that children in these homes hear a wider range of vocabulary.",
        "Researchers visit each family in the study twice a year.",
        "Serrano has written two books about family life in the Southwest.",
      ],
      need: ["Hearth Study", "12-year study"],
      key: "The Hearth Study is a 12-year study of 640 families that examines how live-in grandparents affect children's language learning.",
      assumes: "Early results of Serrano's Hearth Study suggest that children in three-generation homes hear a wider range of vocabulary.",
      person: "Dalia Serrano, a sociologist who grew up in a three-generation household in Tucson, leads a study of 640 families.",
      detail: "The Hearth Study, which Serrano leads, follows 640 families living in Arizona and New Mexico.",
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
        "The Emery Ledgers are account books kept by a general store in Vermont from 1841 to 1879.",
        "Historian Owen Tsai rediscovered them in a barn in 2009.",
        "Tsai specializes in the economic history of rural New England.",
        "The ledgers record more than 30,000 purchases.",
        "They show that many customers paid in eggs, wool, or labor rather than cash.",
        "The store also served as the town's post office.",
      ],
      need: ["Emery Ledgers", "account books kept by a general store"],
      key: "The Emery Ledgers, account books kept by a general store in Vermont from 1841 to 1879, record more than 30,000 purchases.",
      assumes: "The Emery Ledgers that Tsai rediscovered show that many customers paid in eggs, wool, or labor rather than in cash.",
      person: "Owen Tsai, a historian who specializes in the economic history of rural New England, rediscovered the ledgers in a barn in 2009.",
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
        "He sent laser pulses through 30 kilometers of buried cable in Iceland and measured tiny changes in the returning light.",
        "The cable detected small earthquakes that the region's seismometers also recorded.",
        "Because such cables already run under many cities, they could provide low-cost earthquake monitoring.",
        "Traditional seismometers can cost tens of thousands of dollars each.",
        "Iceland has frequent small earthquakes.",
        "Engstrom's team worked with a national telephone company.",
      ],
      need: ["detected small earthquakes", "low-cost earthquake monitoring"],
      key: "Engstrom's buried cable detected small earthquakes, so existing fiber-optic cables could provide low-cost earthquake monitoring.",
      findingMethod: "By measuring changes in laser pulses sent through buried cable, Engstrom detected small earthquakes that seismometers also recorded.",
      aimMethod: "To test whether internet cables can detect earthquakes, Engstrom sent laser pulses through 30 kilometers of buried cable in Iceland.",
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
        "Historian Greta Solvik wanted to determine when the timber roof of Hallberg Church in Norway was built.",
        "She compared the growth rings in the roof beams with a record of tree rings from the region.",
        "The trees used for the beams were cut down in the winter of 1181.",
        "The date places the roof among the oldest surviving timber roofs in northern Europe.",
        "The church's stone walls were rebuilt in the 1600s.",
        "Hallberg Church is still used for services.",
      ],
      need: ["1181", "oldest surviving timber roofs"],
      key: "Hallberg Church's roof beams came from trees cut in 1181, which places the roof among the oldest surviving timber roofs in northern Europe.",
      findingMethod: "By comparing growth rings in the roof beams with regional tree-ring records, Solvik found that the trees were cut down in 1181.",
      aimMethod: "Solvik compared the growth rings in the roof beams of Hallberg Church with regional records to learn when the roof was built.",
      context: "Hallberg Church in Norway, whose stone walls were rebuilt in the 1600s, has a timber roof that the historian Solvik studied.",
    },
    {
      scene: "eoi-sig-baltic-jars",
      allow: ["now"],
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
      allow: ["now", "wrote", "hidden"],
      notes: [
        "Art historian Colette Marchand examined Rue Verte, an 1889 painting by Émile Dorval, using X-ray imaging.",
        "Beneath the street scene, she discovered a nearly finished portrait of a woman.",
        "Dorval's letters mention that he could not afford new canvases that year.",
        "The finding supports the view that poverty shaped Dorval's working methods more than scholars had recognized.",
        "Rue Verte hangs in a museum in Lyon.",
        "Dorval painted mostly street scenes of Lyon and Paris.",
        "X-ray imaging can reveal layers of paint beneath a picture's surface.",
      ],
      need: ["portrait", "poverty shaped"],
      key: "The portrait Marchand found beneath Rue Verte suggests that poverty shaped Dorval's methods more than scholars had recognized.",
      findingMethod: "Using X-ray imaging, Marchand discovered a nearly finished portrait of a woman hidden beneath the street scene in Dorval's Rue Verte.",
      aimMethod: "Marchand used X-ray imaging to examine Rue Verte, a street scene that Émile Dorval painted in 1889 and that hangs in Lyon.",
      context: "Dorval, whose painting Rue Verte now hangs in Lyon, wrote in letters that he could not afford new canvases in 1889.",
    },
    {
      scene: "eoi-sig-albion-tickets",
      allow: ["likely", "drew", "operated", "later", "day's", "1790s"],
      notes: [
        "Theater historian Evan Pryce studied ticket records from London's Albion Theatre, which burned down in 1841, for the years 1790 to 1820.",
        "He compared the prices of the cheapest seats with the daily wages of laborers.",
        "The cheapest seats cost less than a tenth of a laborer's daily wage.",
        "This suggests that the theater's audiences were more working-class than scholars have assumed.",
      ],
      need: ["less than a tenth", "more working-class"],
      key: "Since its cheapest seats cost less than a tenth of a laborer's daily wage, the Albion likely drew more working-class audiences than assumed.",
      findingMethod: "Comparing ticket prices with laborers' wages, Pryce found that the cheapest seats at London's Albion Theatre cost less than a tenth of a day's wage.",
      aimMethod: "Pryce compared the prices of the cheapest seats at the Albion Theatre from 1790 to 1820 with the daily wages of laborers.",
      context: "Pryce studied ticket records from London's Albion Theatre, which operated in the 1790s and later burned down in 1841.",
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
        "Pembrook's notebooks are held by a library in Boston.",
        "Pembrook's first typewriter had 40 keys.",
      ],
      need: ["1859", "developed the machine slowly"],
      key: "Pembrook sketched his first typewriter in 1859, suggesting that he developed the machine slowly rather than in one sudden burst.",
      findingMethod: "By dating all 300 sketches through the paper's watermarks, Castell found that Pembrook's first typewriter sketch was made in 1859.",
      aimMethod: "Castell dated each of the 300 sketches in inventor Josiah Pembrook's notebooks by using the watermarks on the paper.",
      context: "Josiah Pembrook, whose notebooks are held by a library in Boston, patented an early typewriter in 1868 after years of work.",
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
        diff2: "one usually painted scenes under 30 centimeters wide, the other one over 4 meters",
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
        "Archaeologists excavated a 4,000-year-old settlement at Cairn Ridge in Scotland.",
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
        "Historian Lena Hollister studied the account books of four taverns in 1760s Philadelphia, which list more than 2,000 customers by name.",
        "Hollister expected the customers to be almost entirely men.",
        "About 30 percent of the named customers were women.",
        "Many of the women bought food and drink to take home rather than to consume at the tavern.",
      ],
      need: ["almost entirely men", "30 percent"],
      key: "Hollister expected the taverns' customers to be almost entirely men, but about 30 percent were women.",
      resultMethod: "Of the more than 2,000 customers named in the account books of four 1760s Philadelphia taverns, about 30 percent were women.",
      expectationMethod: "Studying the account books of four 1760s Philadelphia taverns, Hollister expected the customers to be almost entirely men.",
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

  // Hard: stress one element of a study while noting another. Each topic's
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
        fm: "Having compared return records from before and after Dorran's libraries stopped charging fines, Varga found that late returns rose by only 2 percent.",
        mf: "Varga compared return records from before and after Dorran's libraries stopped charging fines, records in which late returns rose by only 2 percent.",
        fs: "Late returns rose by only 2 percent after Dorran's libraries ended fines, which suggests that fines do little to make borrowers return books on time.",
        sf: "Fines may do little to make borrowers return books on time, since late returns rose by only 2 percent after Dorran's libraries stopped charging them.",
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

  /* =================================================================== */
  /* Rhetorical Synthesis machinery                                       */
  /* =================================================================== */

  const NOTES_INTRO = "While researching a topic, a student has taken the following notes:";
  const SYNTHESIS_QUESTION = "Which choice most effectively uses relevant information from the notes to accomplish this goal?";

  const has = (text, marker) => lc(text).includes(lc(marker));
  const lacksOne = (text, markers) => markers.some((marker) => !has(text, marker));
  const numbers = (text) => String(text).match(/\d+(?:[.,]\d+)*/g) || [];
  const NUMBER_WORDS = /\b(two|three|four|five|six|seven|eight|nine|ten|twice|thirty)\b/gi;

  // Every number and every content word in every choice appears in the notes
  // (common.js's ungroundedWords, plus the topic's `allow` list of words that
  // only reword a note), so no choice, however off-goal, invents a fact.
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

  const concessionSimilarityNotes = synthesisFamily({
    id: "notes-similarity-despite-difference",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: stress a likeness or a difference, concede the other",
    recognize: "Every choice names both subjects and pairs a conceded clause (\u201calthough,\u201d \u201cwhile,\u201d \u201cthough\u201d) with a main clause, and the goal asks for one kind of point in each. Label every clause as a similarity or a difference and find the choice whose main clause carries what the goal stresses and whose conceded clause carries what it acknowledges.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
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

  const stressNotes = synthesisFamily({
    id: "notes-stress-while-noting",
    subskill: "rhetorical goal",
    difficulty: "Hard",
    title: "Notes goal: stress one part of a study while noting another",
    recognize: "All four choices report the same finding, and each pairs it with the method or with what it suggests; they differ in which part the main clause stresses and which a subordinate clause or phrase only mentions. The goal names both, so check the main clause and the added part of every choice.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
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
  ];
});
