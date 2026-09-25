(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/reading-writing/expression-of-ideas"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Transitions templates (Expression of Ideas). Every template is one
  // question design paired with its own bank of topic records (scenes).
  // Transition topics carry the logical relation the blank needs, so
  // verify() can confirm that the keyed phrase expresses that relation and
  // no distractor does. Each template's scenes need at least two different
  // relations, so a phrase is sometimes the key and sometimes a distractor.

  const { DOMAIN, SECTION, lc } = C;

  /* =================================================================== */
  /* Transitions topic banks                                              */
  /* =================================================================== */

  // Each passage has one blank at the start of a sentence ("______, ") and
  // records the relation the blank needs; `why` explains that relation for
  // this passage. Every phrase in the relation's pool fits, and every
  // distractor relation the template offers does not.
  const RESULT_TOPICS = [
    {
      scene: "eoi-res-otters-kelp",
      relation: "result",
      text: "Sea otters in Kelp Bay eat large numbers of sea urchins, which in turn graze on kelp. When a disease sharply reduced the bay's otter population in the 1990s, urchin numbers grew unchecked. ______, much of the bay's kelp forest was stripped away within a decade.",
      why: "The loss of kelp is a consequence of the unchecked growth in kelp-grazing urchins described in the previous sentence.",
    },
    {
      scene: "eoi-res-coated-glass",
      relation: "result",
      text: "The chemist Ines Halloran coated ordinary window glass with a thin layer of titanium dioxide, a compound that breaks down grime when exposed to sunlight. ______, the coated panes on her laboratory's sunny south wall stayed noticeably cleaner than uncoated panes during a six-month trial.",
      why: "The coated panes stayed cleaner because the coating breaks down grime in sunlight, so the final sentence states a consequence of the coating.",
    },
    {
      scene: "eoi-res-bus-cards",
      relation: "result",
      text: "In 2016, the city of Marlow replaced its paper bus tickets with a tap-to-pay card that riders could reload online. Boarding a bus no longer required counting out exact change or waiting for a driver to make change. ______, the average time buses spent at each stop fell by nearly twenty seconds.",
      why: "Faster boarding, described in the previous sentence, is what shortened the stops, so the final sentence states a consequence.",
    },
    {
      scene: "eoi-res-market-road",
      relation: "result",
      text: "The economist Tarek Nasser studied a farming region where a new paved road cut the trip to the nearest market from five hours to one. With the shorter trip, farmers could bring fresh vegetables to market before they spoiled. ______, many farmers in the region began growing vegetables in fields once planted with grain.",
      why: "Farmers switched to vegetables because they could now sell them before they spoiled, so the switch is a consequence of the shorter trip.",
    },
    {
      scene: "eoi-res-river-ice",
      relation: "result",
      text: "During the winter of 1811, thick ice closed the Sorne River for nearly three months. The river was the only route by which grain reached the isolated mountain town of Kell. ______, bread prices in Kell nearly tripled before the spring thaw.",
      why: "With its only grain route frozen, Kell ran short of grain, so the rise in bread prices is a consequence of the ice.",
    },
    {
      scene: "eoi-res-free-library",
      relation: "result",
      text: "When the first free lending library opened in the mill town of Dunmore in 1851, workers could borrow books without paying the private subscription fee, which had cost nearly a day's wages. ______, the number of Dunmore residents who borrowed books rose from a few dozen to several hundred within a year.",
      why: "Removing the costly fee made borrowing affordable, so the jump in borrowers is a consequence of the free library.",
    },
    {
      scene: "eoi-res-egg-tempera",
      relation: "result",
      text: "The painter Lucia Moreno binds her pigments with egg yolk rather than oil, producing a paint that dries within minutes of touching the panel. ______, she must work in small sections, finishing each area before the paint sets.",
      why: "Because the egg-based paint dries so quickly, Moreno is forced to work in small sections, a consequence of her medium.",
    },
    {
      scene: "eoi-res-concert-panels",
      relation: "result",
      text: "In the concert hall designed by the architect Oren Pask, curved wooden panels line the walls and ceiling, scattering sound evenly throughout the room. ______, listeners in the back rows hear the orchestra almost as clearly as those seated near the stage.",
      why: "Sound reaches the back rows clearly because the panels spread it evenly, so the final sentence states a consequence of the design.",
    },
    {
      scene: "eoi-res-night-shift-novel",
      relation: "result",
      text: "The novelist Adaeze Okonjo wrote her first book while working night shifts at a hospital, which left her only an hour or so each morning to write before she slept. ______, the novel took her nearly nine years to finish.",
      why: "Having so little time each day to write is why the novel took nine years, so the final sentence states a consequence.",
    },
    {
      scene: "eoi-res-ballad-village",
      relation: "result",
      text: "Growing up in a fishing village with no bookstore, the poet Emil Sandvik read almost nothing but the few books in his school's library, most of them collections of old sea ballads. ______, the rhythms of those ballads run through nearly every poem in his first collection.",
      why: "The ballads shaped his poems because they were nearly all he read, so the final sentence states a consequence of his early reading.",
    },
  ];
  const CONTRAST_TOPICS = [
    {
      scene: "eoi-con-desert-reptiles",
      relation: "contrast",
      text: "The ecologist Rafael Duarte tracked two kinds of reptiles through a summer in the Mojave Desert. The tortoises he followed spent most of the hottest weeks sealed in deep burrows. ______, the zebra-tailed lizards he followed stayed active on the surface all summer, dashing across open sand even on the hottest days.",
      why: "The lizards' constant activity on the surface is the opposite of the tortoises' retreat underground, so the final sentence contrasts the two.",
    },
    {
      scene: "eoi-con-comet-orbits",
      relation: "contrast",
      text: "Long-period comets follow stretched orbits that carry them far beyond the outermost planets, so they return to the inner solar system only after hundreds or even thousands of years. ______, short-period comets complete an orbit in under two hundred years, and some reappear every few years.",
      why: "Short-period comets return far more often than long-period comets, so the final sentence contrasts the two groups.",
    },
    {
      scene: "eoi-con-village-news",
      relation: "contrast",
      text: "In a survey conducted by the sociologist Mireille Dufresne, residents of the village of Saint-Aubin said they learned about local events mainly from conversations with neighbors. ______, residents of the nearby city of Lorvay said they learned about such events almost entirely from websites and social media.",
      why: "Lorvay residents rely on online sources while Saint-Aubin residents rely on neighbors, so the final sentence contrasts the two communities.",
    },
    {
      scene: "eoi-con-cafe-prices",
      relation: "contrast",
      text: "When the Harbor Street Café raised the price of its coffee by a third, coffee sales barely changed, since most customers bought a cup every morning out of habit. ______, sales of the café's pastries, which customers treated as an occasional indulgence, fell by nearly half after a similar price increase.",
      why: "Pastry sales dropped sharply while coffee sales held steady, so the final sentence contrasts how the two products responded to higher prices.",
    },
    {
      scene: "eoi-con-kingdom-roads",
      relation: "contrast",
      text: "The eastern trade road of the kingdom of Aldor was paved with fitted stone and remained passable in every season. ______, the kingdom's western road was little more than a dirt track, and each spring it turned to mud that halted wagons for weeks.",
      why: "The western road was often impassable while the eastern road never was, so the final sentence contrasts the two roads.",
    },
    {
      scene: "eoi-con-lighthouse-keepers",
      relation: "contrast",
      text: "The first keepers of the lighthouse at Cape Lorne, appointed in 1820, were required to live beside the tower and tend its oil lamps through every night. ______, the keepers who served there after 1932 lived in town, since the new electric lamp switched on by itself at dusk.",
      why: "The later keepers lived away from the tower while the first keepers had to live beside it, so the final sentence contrasts the two groups.",
    },
    {
      scene: "eoi-con-two-composers",
      relation: "contrast",
      text: "The composer Ilse Vogel wrote slowly, often revising a single movement of a symphony for years before she allowed it to be performed. ______, her contemporary Paul Arden composed at great speed, sometimes completing an entire symphony in a few weeks.",
      why: "Arden's speed is the opposite of Vogel's slow, careful revision, so the final sentence contrasts the two composers.",
    },
    {
      scene: "eoi-con-mural-canvas",
      relation: "contrast",
      text: "The muralist Diego Salcedo painted his works on the outside walls of public buildings, where anyone passing by could see them. ______, the painter Greta Lind showed her small, detailed canvases only in private homes, to a handful of invited guests.",
      why: "Lind's private showings are the opposite of Salcedo's fully public murals, so the final sentence contrasts the two artists.",
    },
    {
      scene: "eoi-con-two-sisters",
      relation: "contrast",
      text: "In Mina Toller's novel Westward, the older sister, Agnes, plans every detail of the family's journey west and worries constantly about what might go wrong. ______, her younger sister, Nell, packs nothing but a sketchbook and treats each day on the road as an adventure.",
      why: "Nell's carefree attitude is the opposite of Agnes's anxious planning, so the final sentence contrasts the two sisters.",
    },
    {
      scene: "eoi-con-inventor-notebooks",
      relation: "contrast",
      text: "The inventor Samuel Okafor kept meticulous notebooks, recording every experiment, measurement, and failure in neat columns. ______, his business partner, Jonas Bell, rarely wrote anything down and relied on memory when he needed to reconstruct an earlier test.",
      why: "Bell's habit of keeping no records is the opposite of Okafor's careful notebooks, so the final sentence contrasts the two partners.",
    },
  ];
  const EXAMPLE_TOPICS = [
    {
      scene: "eoi-exm-wild-tobacco",
      relation: "example",
      text: "Some plants defend themselves by producing chemicals that make their leaves harmful to the insects that eat them. ______, the leaves of wild tobacco contain nicotine, which is toxic to many leaf-eating insects. When caterpillars begin feeding on the plant, it can even raise the amount of nicotine in its leaves.",
      why: "Wild tobacco is one specific plant that defends itself chemically, so the sentence gives an instance of the general claim before it.",
    },
    {
      scene: "eoi-exm-fluorite-glow",
      relation: "example",
      text: "Certain minerals glow in vivid colors when they are placed under ultraviolet light. ______, some samples of fluorite shine a bright blue or violet under an ultraviolet lamp. The word “fluorescence” itself comes from the mineral's name.",
      why: "Fluorite is one particular mineral that glows under ultraviolet light, so the sentence gives an instance of the general claim.",
    },
    {
      scene: "eoi-exm-storefront-workspace",
      relation: "example",
      text: "Many small towns have found new uses for the empty storefronts along their main streets. ______, the town of Dorrance Creek turned a closed hardware store into a shared workspace where residents can rent a desk by the day. Within two years, the space had more than forty regular members.",
      why: "Dorrance Creek's converted hardware store is one specific case of a town reusing an empty storefront.",
    },
    {
      scene: "eoi-exm-juice-price",
      relation: "example",
      text: "Research has shown that people often judge a product's quality by its price. ______, in a study by the psychologist Arun Patel, participants rated a juice as tastier when told it cost eight dollars than when told it cost two. Participants did not know that both cups had been poured from the same carton.",
      why: "Patel's juice study is a specific case of people judging quality by price.",
    },
    {
      scene: "eoi-exm-binding-scraps",
      relation: "example",
      text: "In the 1500s, many European printers cut costs by reusing old materials. ______, the printer Aldo Ferrant strengthened the spines of his books with strips cut from discarded handwritten manuscripts. Today, historians study those strips to recover texts that otherwise did not survive.",
      why: "Ferrant's reuse of manuscript scraps is one instance of printers reusing old materials to save money.",
    },
    {
      scene: "eoi-exm-equinox-chapel",
      relation: "example",
      text: "Some medieval builders designed churches to help mark the calendar. ______, the chapel at Saint-Varenne has a small window placed so that a beam of sunlight strikes the altar only in the days around the equinoxes. Monks there used the event to set the dates of certain festivals.",
      why: "The chapel at Saint-Varenne is one specific church built to help mark the calendar.",
    },
    {
      scene: "eoi-exm-harvest-dance",
      relation: "example",
      text: "Many choreographers build their dances from the movements of everyday work. ______, in her dance Harvest, the choreographer Leila Amari created an entire sequence from the gestures of farmworkers sorting grain. The dancers repeat the motions of lifting, sifting, and pouring until the gestures become a rhythm.",
      why: "Amari's Harvest is one specific dance built from the movements of everyday work.",
    },
    {
      scene: "eoi-exm-salvaged-brick",
      relation: "example",
      text: "Some architects incorporate materials from demolished buildings into their new projects. ______, the architect Mateo Reyes covered the walls of a public library with bricks salvaged from a closed factory nearby. On some of the bricks, visitors can still see faded paint from the factory's old signs.",
      why: "Reyes's library is one specific project that reuses material from a demolished building.",
    },
    {
      scene: "eoi-exm-household-poems",
      relation: "example",
      text: "The poet Nora Quill often finds her subjects in ordinary household objects. ______, her poem “Colander” describes a kitchen strainer as a small metal sky full of stars. Other poems in the same collection turn to a teapot, a clothespin, and a worn doormat.",
      why: "“Colander” is one specific poem in which Quill takes a household object as her subject.",
    },
    {
      scene: "eoi-exm-straw-bridge",
      relation: "example",
      text: "The engineer Grace Oduya was known for testing her designs with simple, inexpensive materials. ______, before building her first bridge, she made a model of it from drinking straws and string to see where it would bend. The model revealed a weak joint that she corrected in the final design.",
      why: "The straw-and-string model is one specific case of Oduya testing a design with cheap materials.",
    },
  ];
  const ADDITION_TOPICS = [
    {
      scene: "eoi-add-edna-surveys",
      relation: "addition",
      text: "Biologists increasingly survey rivers and ponds using environmental DNA, or eDNA: traces of genetic material that animals shed into the water. Collecting eDNA requires only a few liters of water, so a survey can be completed without trapping or disturbing a single animal. ______, one water sample can reveal dozens of species at once, including fish too rare to catch reliably in nets.",
      why: "Detecting many species from one sample is a second, separate benefit of eDNA surveys, added to the first benefit of not disturbing animals.",
    },
    {
      scene: "eoi-add-sorghum-variety",
      relation: "addition",
      text: "Agronomists at the Kordel Research Station have been testing a new variety of sorghum for farms in dry regions. In field trials, the variety needed about a third less water than the corn most farmers in those regions now grow. ______, its grain contained more protein than corn, making it a more nutritious feed for livestock.",
      why: "Higher protein is a second, independent advantage of the new sorghum, added to its lower water needs.",
    },
    {
      scene: "eoi-add-swim-program",
      relation: "addition",
      text: "The public health researcher Dana Whitcomb evaluated a free swimming program that the city of Brookvale offers to children each summer. She found that children who completed the lessons were far less likely than other children to be involved in water accidents over the next five years. ______, the program cost the city less per child than any of its other summer recreation programs.",
      why: "The program's low cost is a second, separate point in its favor, added to its safety benefit.",
    },
    {
      scene: "eoi-add-bilingual-signs",
      relation: "addition",
      text: "The linguist Ana Sorell has studied the effects of bilingual street signs in the border town of Veyra. She found that the signs help visitors who speak only one of the town's two languages find their way. ______, residents who speak the town's minority language told her that the signs made them feel their language was publicly valued.",
      why: "Residents feeling that their language is valued is a second, separate benefit of the signs, added to their usefulness for visitors.",
    },
    {
      scene: "eoi-add-market-hall",
      relation: "addition",
      text: "In 1612, the town of Oszkar built a covered market hall in its central square. The hall's tile roof let merchants keep selling grain and cloth in heavy rain, when the open-air stalls had always closed. ______, its upper floor gave the town council a permanent meeting room after years of gathering in a rented room above a tavern.",
      why: "Giving the council a meeting room is a second, independent benefit of the market hall, added to the shelter it gave merchants.",
    },
    {
      scene: "eoi-add-seawall-promenade",
      relation: "addition",
      text: "In the 1870s, the town of Brisk Harbor built a stone seawall along its waterfront. The wall protected the town's warehouses from the storm surges that had flooded them nearly every winter. ______, its broad, flat top gave residents a promenade where they could stroll along the water on summer evenings.",
      why: "Serving as a promenade is a second, separate benefit of the seawall, added to its protection of the warehouses.",
    },
    {
      scene: "eoi-add-garage-theater",
      relation: "addition",
      text: "The Ilford Street Theater, a small company in the city of Belling, stages all of its plays in a converted bus garage. The garage's high ceiling allows the company to build towering sets that would never fit in a conventional theater. ______, the building stands beside a busy transit hub, so audiences from across the city can reach it easily.",
      why: "The convenient location is a second, independent advantage of the garage, added to its high ceiling.",
    },
    {
      scene: "eoi-add-barn-wood",
      relation: "addition",
      text: "The sculptor Mei Tanaka works almost entirely with wood salvaged from old barns, which she collects from farms across the region shortly before the buildings are torn down. The weathered boards give her sculptures colors and textures that new lumber cannot match. ______, the wood carries a sense of local history, since many of the barns once stood on farms in her own county.",
      why: "The sense of local history is a second, separate quality the salvaged wood brings to her work, added to its colors and textures.",
    },
    {
      scene: "eoi-add-grafting-grandmother",
      relation: "addition",
      text: "In Maren Grey's novel The Grafting Season, the narrator's grandmother, Vera, is the only person in the village who knows how to graft apple trees. Each spring she teaches the craft to her neighbors' children, patiently guiding their hands along the bark. ______, she keeps a ledger of every tree she has grafted, recording its year and variety in careful script.",
      why: "Keeping a ledger is a further, separate detail showing Vera's devotion to her craft, added to her teaching.",
    },
    {
      scene: "eoi-add-star-catalog",
      relation: "addition",
      text: "The astronomer Lotte Aasen cataloged more than three thousand variable stars during her forty years at the Skarvik Observatory. Her catalog remains a standard reference for researchers who study how such stars brighten and dim. ______, she designed a small, inexpensive telescope mount that amateur astronomers across Scandinavia used for decades.",
      why: "Designing the telescope mount is a second, independent contribution, added to her influential star catalog.",
    },
  ];
  const SIMILARITY_TRANSITION_TOPICS = [
    {
      scene: "eoi-sim-cold-dormancy",
      relation: "similarity",
      text: "Arctic ground squirrels survive the long northern winter by letting their body temperature fall to just below freezing and remaining nearly motionless for months, which drastically reduces the energy they need. ______, the common poorwill, a bird of North American deserts, can lower its body temperature and stay dormant for weeks when insects to eat are scarce.",
      why: "The poorwill, a bird rather than a squirrel, saves energy through the same kind of dormancy, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-self-cleaning",
      relation: "similarity",
      text: "The leaves of the lotus plant are covered with microscopic bumps coated in wax, so water forms beads that roll off, carrying dirt with them and keeping the leaves clean even in muddy ponds. ______, the wings of many cicadas are covered with tiny waxy structures that repel water and keep the wings clean.",
      why: "Cicada wings, which are not plants at all, stay clean through the same water-repelling structure as lotus leaves, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-park-neighbors",
      relation: "similarity",
      text: "In a study of the city of Norhaven, the urban planner Lise Aalto found that residents living within a five-minute walk of a park visited their neighbors more often than residents who lived farther from green space. ______, in a separate study of rural villages, the sociologist Omar Bekele found that families living near the village square socialized more often than families on the outskirts.",
      why: "Bekele's villages show the same pattern Aalto found in Norhaven, with nearness to a shared space going with more socializing, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-fruit-placement",
      relation: "similarity",
      text: "When the Hartwell grocery chain placed fresh fruit beside its checkout counters instead of candy, fruit sales at those counters rose by 40 percent. ______, the cafeteria at Birch Falls High School saw students choose apples far more often after it moved them from a back shelf to the front of the lunch line.",
      why: "The school cafeteria saw the same effect of placement that the grocery chain did, so the final sentence draws a parallel between two separate cases.",
    },
    {
      scene: "eoi-sim-split-records",
      relation: "similarity",
      text: "Merchants in the city-state of Orvena recorded debts on wooden tally sticks, notching the amount owed and then splitting each stick lengthwise so that lender and borrower each kept a matching half. ______, traders in the distant port of Salmere pressed a single wax seal across the edges of two copies of each contract, so that the halves of the impression could later be matched.",
      why: "Salmere's traders used the same matching-halves safeguard as Orvena's merchants, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-locking-stones",
      relation: "similarity",
      text: "Nineteenth-century builders of the lighthouse on the island of Keld set the tower on a base of granite blocks that interlock like puzzle pieces, so that waves could not pry them loose. ______, the builders of the medieval breakwater at Kessock shaped its stones to lock together, allowing the wall to withstand centuries of storms.",
      why: "The Kessock breakwater used the same interlocking-stone technique as the Keld lighthouse, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-absence-as-material",
      relation: "similarity",
      text: "The painter Joan Ferrer leaves parts of her canvases bare, letting the untreated fabric serve as the pale sky and water in her landscapes rather than covering it with paint. ______, the composer Ravi Menon writes long silences into his piano pieces, treating the pauses between notes as part of the music itself.",
      why: "Menon uses silence the way Ferrer uses bare canvas, treating an absence as part of the work, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-narrow-entrances",
      relation: "similarity",
      text: "The architect Hiroshi Kaneda designed the Mirelle Museum so that visitors pass through a narrow, dim corridor before emerging into a bright, open gallery, which feels even more spacious by comparison. ______, the novelist Anna Kessler opens her books with short chapters confined to a single cramped room before the story expands across an entire continent.",
      why: "Kessler moves readers from confinement to openness just as Kaneda's museum moves visitors, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-grief-handwork",
      relation: "similarity",
      text: "In Elspeth Rowe's novel Slack Tide, set in a small harbor town, the heroine, Maud, never speaks of her grief but mends every torn garment in the house, stitching late into the night. ______, her father, a retired sailor, copes with his loss by tying and retying knots in an old length of rope.",
      why: "Maud's father handles grief through the same kind of repetitive handwork that Maud does, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-learning-by-ear",
      relation: "similarity",
      text: "The marine biologist Teodora Vik learned to identify dozens of whale species by their calls alone, having spent her childhood listening to recordings her father made at sea. ______, the ornithologist Kwame Asante, who grew up beside a nature reserve, could name nearly every bird in the region by its song before he learned to read.",
      why: "Asante, like Vik, learned in childhood to identify animals by sound, so the final sentence draws a parallel between the two scientists.",
    },
  ];
  const SEQUENCE_TOPICS = [
    {
      scene: "eoi-seq-riverbank-grasses",
      relation: "sequence",
      text: "In 2014, the ecologist Priya Anand planted native grasses along a strip of bare, eroding land beside the Selby River. ______, once the grasses had grown deep roots, she returned to measure how much soil they were holding in place. Her measurements showed that erosion along the strip had fallen by more than half.",
      why: "Anand could measure the soil the grasses held only after planting them and letting their roots grow, so this event comes later.",
    },
    {
      scene: "eoi-seq-bark-pigment",
      relation: "sequence",
      text: "The chemist Leon Marchetti extracted a yellow pigment from the bark of the kellan shrub by soaking the bark in alcohol and letting the liquid evaporate. ______, he applied the purified pigment to strips of cotton and wool to see which fabric would hold its color. Wool, he found, kept its yellow through dozens of washings.",
      why: "Marchetti could test the pigment on fabric only after he had extracted it, so this step comes later.",
    },
    {
      scene: "eoi-seq-mill-interviews",
      relation: "sequence",
      text: "The sociologist Imani Clarke spent a year interviewing workers who had lost their jobs when the Brenton textile mill closed. ______, she drew on those interviews to write a report recommending job-training programs matched to the workers' existing skills. Two nearby towns adopted her recommendations within a year of the report's release.",
      why: "The report draws on interviews that had to be completed first, so writing it came later.",
    },
    {
      scene: "eoi-seq-crossing-map",
      relation: "sequence",
      text: "Members of the Oakridge Neighborhood Association surveyed more than five hundred residents about which intersections felt unsafe for pedestrians to cross. ______, they used the survey responses to draw a map marking the ten most dangerous crossings. The city council relied on that map when deciding where to install new traffic signals.",
      why: "The map was drawn from the survey responses, so it must have been made after the survey.",
    },
    {
      scene: "eoi-seq-mining-railway",
      relation: "sequence",
      text: "In 1869, workers on the Varden Railway laid the final stretch of track connecting the mining town of Estin to the coast. ______, ore from Estin's mines began arriving at the port by train rather than by mule. The port's harbor was soon enlarged, with two new piers built to handle the growing traffic.",
      why: "Ore could arrive by train only once the line was complete, so this event follows the laying of the final track.",
    },
    {
      scene: "eoi-seq-scribe-copy",
      relation: "sequence",
      text: "Through the winter of 1142, the scribe Brother Anselm copied a damaged treatise on astronomy onto fresh parchment, word by word. ______, he bound the finished copy between oak boards and sent it to a monastery library in the south. That copy is the only version of the treatise known to survive today.",
      why: "Anselm could bind and send the copy only after he had finished writing it, so this event comes later.",
    },
    {
      scene: "eoi-seq-mats-to-tapestries",
      relation: "sequence",
      text: "The textile artist Amara Nwosu began her career weaving small patterned mats on a hand loom in her grandmother's courtyard. ______, she adapted those same patterns into room-sized tapestries for galleries in Lagos and London, some of them more than twenty feet wide. Critics praised the tapestries for preserving the mats' bold geometry at a monumental scale.",
      why: "The tapestries adapt patterns Nwosu had already developed in her mats, so they came later in her career.",
    },
    {
      scene: "eoi-seq-play-revision",
      relation: "sequence",
      text: "The playwright Owen Marsh wrote the first draft of Lowtide in a single month, working from notes he had taken while living in a fishing village. ______, he revised the script during rehearsals, cutting scenes that the actors found difficult to stage. The final version ran nearly an hour shorter than the draft.",
      why: "Marsh could revise the script in rehearsal only after the first draft existed, so the revision came later.",
    },
    {
      scene: "eoi-seq-clock-apprentice",
      relation: "sequence",
      text: "In the novel The Clockmaker's Year, the apprentice Joost spends his first months cleaning and oiling the gears of broken clocks brought to his master's shop. ______, he is trusted to assemble a complete clock movement on his own, a task that occupies him for most of the winter. By spring, the clock he built hangs in the village church.",
      why: "Joost is trusted with a whole movement only after his months of cleaning gears, so this stage comes later in the novel.",
    },
    {
      scene: "eoi-seq-darkroom-studio",
      relation: "sequence",
      text: "The photographer Esther Nkemelu taught herself to develop film in a closet she had converted into a darkroom. ______, she moved her equipment out of the closet and into a rented storefront on Mercer Street, where she photographed nearly every wedding in the neighborhood for two decades. The city's historical society now holds her archive of those images.",
      why: "Moving her equipment out of the closet darkroom presupposes that she had already set it up there, so this event comes later.",
    },
    {
      scene: "eoi-seq-orchard-grafts",
      relation: "sequence",
      text: "In the spring of 2016, the orchard keeper Nils Aberg grafted cuttings from a two-hundred-year-old apple tree onto young rootstock in his nursery. ______, once the grafts had grown into saplings, he planted them along the road where the old tree had stood before a storm felled it.",
      why: "Aberg could plant the saplings only after the grafts had grown, so this event comes later.",
    },
  ];
  const CONCESSION_TOPICS = [
    {
      scene: "eoi-cnc-hemp-paper",
      relation: "concession",
      text: "Paper made from hemp fiber resists yellowing and can remain flexible for centuries, far longer than most paper made from wood pulp. Hemp is costly to harvest and process, however, and most commercial mills turned to cheaper wood pulp during the nineteenth century. ______, the conservation studio at the Arlen Library commissions small batches of hemp paper for repairing old manuscripts, a task in which durability matters more than price.",
      why: "The studio keeps using hemp paper despite the high cost described in the previous sentence, so the final sentence states something that holds in spite of that drawback.",
    },
    {
      scene: "eoi-cnc-radiocarbon-textile",
      relation: "concession",
      text: "Radiocarbon dating allows researchers to estimate the age of organic materials such as wood, bone, and cloth with considerable precision. Yet the method destroys a portion of every sample it measures, an unwelcome cost when the sample comes from a rare artifact. ______, curators at the Havel Museum approved radiocarbon testing of a fragile seventh-century textile, judging that a secure date was worth the loss of a thread-sized sample.",
      why: "The curators approved the test even though it destroys part of a rare artifact, so the final sentence states a decision made in spite of that drawback.",
    },
    {
      scene: "eoi-cnc-phone-surveys",
      relation: "concession",
      text: "Telephone surveys reach respondents quickly and allow interviewers to clarify confusing questions on the spot. But response rates have fallen sharply as more people ignore calls from unfamiliar numbers, and some researchers worry that those who still answer are not typical of the population. ______, the sociologist Farah Idris continues to rely on telephone surveys in her research on rural households, many of which lack reliable internet access.",
      why: "Idris keeps using telephone surveys despite the falling response rates and the worry about unrepresentative samples, so the final sentence holds in spite of that drawback.",
    },
    {
      scene: "eoi-cnc-congestion-fee",
      relation: "concession",
      text: "Many transportation economists argue that congestion pricing, which charges drivers a fee to enter a crowded downtown at peak hours, reduces traffic and shortens commutes. Such fees tend to be unpopular with voters, and proposals in several cities have been abandoned after public opposition. ______, the city council of Portmere adopted a congestion fee in 2021, and within a year average downtown travel times had fallen by 15 percent.",
      why: "Portmere adopted the fee despite the unpopularity and abandoned proposals described in the previous sentence, so the final sentence holds in spite of that obstacle.",
    },
    {
      scene: "eoi-cnc-clay-tablets",
      relation: "concession",
      text: "Clay tablets, the chief writing surface of ancient Mesopotamia, could survive flood and burial for thousands of years, and fires that destroyed ancient archives often baked the tablets harder. They were heavy and bulky, however, so a long text might fill dozens of tablets that were awkward to store and difficult to transport. ______, Mesopotamian scribes wrote on clay for roughly three thousand years, recording everything from grain sales to epic poems.",
      why: "Scribes kept using clay for millennia despite its weight and bulk, so the final sentence states something that held in spite of that drawback.",
    },
    {
      scene: "eoi-cnc-semaphore-line",
      relation: "concession",
      text: "The Hollis semaphore line, completed in 1794, could relay a short message across two hundred miles of signal towers in under an hour, a speed no mounted courier could approach. The system worked only in daylight and clear weather, and fog along the coast often halted it for days at a time. ______, the government kept the line in service for nearly fifty years, using it for urgent military dispatches whenever conditions allowed.",
      why: "The line stayed in service despite being halted by darkness and fog, so the final sentence holds in spite of that limitation.",
    },
    {
      scene: "eoi-cnc-true-fresco",
      relation: "concession",
      text: "In true fresco, pigment is brushed onto wet lime plaster, and as the plaster dries the color becomes part of the wall itself, often remaining vivid for centuries. The technique is unforgiving, however: the plaster sets within hours, and a mistake can be corrected only by chiseling away the section and starting again. ______, the muralist Elena Vargas chose true fresco for her 2019 commission at the Tolan Public Library, wanting the work to outlast the building's other decorations.",
      why: "Vargas chose true fresco despite how unforgiving it is, so the final sentence states a choice made in spite of that drawback.",
    },
    {
      scene: "eoi-cnc-analog-tape",
      relation: "concession",
      text: "Many recording engineers argue that analog tape gives music a warmth that digital recording cannot fully reproduce, particularly in drums and voices. But tape is expensive, and because a single reel holds only a limited amount of music, a long session can consume many costly reels. ______, the band Hollow Pines recorded its latest album entirely on tape, having decided that the sound was worth the price.",
      why: "The band used tape despite its cost, so the final sentence states a choice made in spite of that drawback.",
    },
    {
      scene: "eoi-cnc-shy-clerk",
      relation: "concession",
      text: "In Ines Carvalho's novel The Lighthouse Accounts, the young clerk Afonso is admired by his employer for his flawless handwriting and his memory for figures. He is painfully shy, however, and when merchants question his sums, he can barely bring himself to answer. ______, by the novel's end Afonso is running the firm's busiest office, his accuracy having earned the trust that his manner could not.",
      why: "Afonso rises to run the busiest office despite his crippling shyness, so the final sentence holds in spite of that weakness.",
    },
    {
      scene: "eoi-cnc-slow-surveyor",
      relation: "concession",
      text: "The geologist Hanna Ruud was known for mapping rock formations with extraordinary precision, recording faults, folds, and mineral veins that other surveyors overlooked. Her expeditions were notoriously slow: she often spent an entire week on a single ridge that her colleagues crossed in a day. ______, her maps of the Tovra Range became the standard reference for the region within a decade of their publication.",
      why: "Her maps became the standard reference despite her slow pace, so the final sentence holds in spite of that drawback.",
    },
  ];
  const ADMISSION_TOPICS = [
    {
      scene: "eoi-adm-beaver-wetlands",
      relation: "admission",
      text: "The ecologist Selma Ruiz argues that reintroducing beavers to the upper Kestrel Valley is the most effective way to restore the valley's lost wetlands. ______, beaver dams can flood nearby fields and block the culverts beneath roads, creating costly problems for landowners. Still, Ruiz points out that such conflicts can be managed with simple flow devices, and that the ponds beavers create would store water through the valley's increasingly dry summers.",
      why: "The sentence grants a real drawback of Ruiz's proposal before the final sentence defends it, so it concedes a point against her claim.",
    },
    {
      scene: "eoi-adm-radio-array",
      relation: "admission",
      text: "Many astronomers regard the planned Halden Array, a network of radio dishes spread across three continents, as the best available tool for imaging the edges of distant black holes. ______, the array would cost more than any radio telescope yet built, and its dishes would have to be synchronized with a precision never achieved over such distances. Even so, its supporters argue that no smaller instrument could produce images sharp enough to test current theories.",
      why: "The sentence acknowledges the array's cost and technical difficulty before the supporters' reply, so it concedes a point against the astronomers' view.",
    },
    {
      scene: "eoi-adm-four-day-week",
      relation: "admission",
      text: "The economist Joaquín Ferro contends that a four-day workweek, with no reduction in pay, would raise productivity at most office-based companies. ______, the trials he cites involved mostly small firms whose employees had volunteered to take part, and results at larger companies, with more rigid schedules, might differ. But Ferro notes that output held steady or rose in nearly every trial, even as employees reported less stress.",
      why: "The sentence grants a limitation of Ferro's evidence before the final sentence defends his claim, so it concedes a point against him.",
    },
    {
      scene: "eoi-adm-library-tax-help",
      relation: "admission",
      text: "Researchers at the Linden Institute argue that public libraries are among the best places to offer free help with filing taxes. ______, library staff are not tax professionals, and volunteers with the right training must be recruited anew each year. Still, the researchers found that residents were far more likely to seek help at a library than at a government office, where many said they felt unwelcome.",
      why: "The sentence acknowledges a weakness of libraries as tax-help sites before the researchers' finding in their favor, so it concedes a point against their claim.",
    },
    {
      scene: "eoi-adm-wool-port",
      relation: "admission",
      text: "The historian Margit Olsson argues that the port of Vessa, not the larger city of Brakmouth, was the true center of the region's medieval wool trade. ______, Vessa's surviving customs records are fragmentary, covering only about a third of the years in question. Even so, those records show more wool passing through Vessa in a single season than Brakmouth's far more complete records show for any year.",
      why: "The sentence grants a gap in Olsson's evidence before the final sentence shows why her claim still holds, so it concedes a point against her.",
    },
    {
      scene: "eoi-adm-soldiers-letters",
      relation: "admission",
      text: "According to the historian Kofi Mensah, the letters of ordinary soldiers give a more reliable picture of the 1841 Aldermoor campaign than the official reports of its commanders. ______, the soldiers often wrote in haste and repeated rumors, and many of their letters contain obvious errors about distances and dates. But Mensah observes that, unlike the commanders, the soldiers had no reason to exaggerate victories or conceal losses.",
      why: "The sentence admits flaws in the soldiers' letters before Mensah's reply, so it concedes a point against his claim that the letters are more reliable.",
    },
    {
      scene: "eoi-adm-late-landscapes",
      relation: "admission",
      text: "The critic Laila Haddad argues that the painter Otto Sarkis's late landscapes, painted in the final five years of his life, are the most important works of his career. ______, the paintings look hurried: the brushwork is loose, and large areas of canvas are left bare. Still, Haddad contends that this openness was deliberate, pointing to letters in which Sarkis describes leaving room for the viewer's imagination.",
      why: "The sentence grants that the paintings seem hurried, a point against Haddad's high estimate of them, before she defends her view.",
    },
    {
      scene: "eoi-adm-new-music",
      relation: "admission",
      text: "The conductor Lian Zhou believes that orchestras should perform a work by a living composer at nearly every concert, even if the piece is a short one. ______, programs featuring unfamiliar music often sell fewer tickets, a real risk for orchestras that depend on ticket sales. But Zhou argues that listeners who hear new works regularly come to seek them out, citing her own orchestra's steadily growing attendance over the past decade.",
      why: "The sentence concedes a financial risk of Zhou's approach before she answers it, so it grants a point against her position.",
    },
    {
      scene: "eoi-adm-no-outline",
      relation: "admission",
      text: "The novelist Stellan Ekberg has long maintained that writing without an outline produces livelier fiction than careful advance planning. ______, the approach has its costs: by his own account, he discarded nearly four hundred pages of his latest novel after realizing that the story had taken a wrong turn. Even so, Ekberg insists that a plot planned in advance loses its power to surprise, both for him and for his readers.",
      why: "The sentence grants the cost of Ekberg's method before he reaffirms it, so it concedes a point against his position.",
    },
    {
      scene: "eoi-adm-chestnut-fungus",
      relation: "admission",
      text: "In her biography of the botanist Clara Voss, the historian Nadia Quist argues that Voss, not her better-known colleague Henrik Lund, first identified the fungus that devastated the region's chestnut trees. ______, Voss never published her findings, and the claim rests largely on entries in her private field notebook. Still, Quist shows that the notebook's dated sketches of the fungus precede Lund's first report by more than a year.",
      why: "The sentence grants a weakness in the evidence for Quist's claim before she shows why it still holds, so it concedes a point against her.",
    },
  ];
  const RESTATEMENT_TOPICS = [
    {
      scene: "eoi-rst-river-discharge",
      relation: "restatement",
      text: "The hydrologist Rana Aziz has monitored the Tolley River at a single gauging station since 2012, a period of steadily declining snowfall in the mountains that feed it. Her data show that the river's mean annual discharge at the station fell by roughly 50 percent between 2012 and 2022. ______, in a typical year the river now carries only about half as much water past the station as it did a decade earlier.",
      why: "The final sentence says in plain words what a 50 percent drop in mean annual discharge means, adding nothing new, so it restates the previous sentence.",
    },
    {
      scene: "eoi-rst-nocturnal-frog",
      relation: "restatement",
      text: "The zoologist Ama Boateng spent three years studying the Serran tree frog, which lives in misty cloud forests across four countries. Her observations at more than sixty sites, made with infrared cameras that recorded around the clock, indicate that the species is strictly nocturnal throughout its range. ______, wherever the frog is found, it is active only at night and never during the day.",
      why: "Being active only at night is exactly what “strictly nocturnal” means, so the final sentence restates Boateng's finding in plain terms.",
    },
    {
      scene: "eoi-rst-residential-mobility",
      relation: "restatement",
      text: "The sociologist Lin Harada compared census records for twelve towns in the Mirren Valley, examining how often residents changed addresses over a single decade. She found that Ostby had the lowest rate of residential mobility of any town in the valley during that period. ______, of all twelve towns, Ostby was the one whose residents were least likely to move from one home to another.",
      why: "The final sentence explains in everyday words what having the lowest rate of residential mobility means, so it restates Harada's finding.",
    },
    {
      scene: "eoi-rst-dialect-vowel",
      relation: "restatement",
      text: "The linguist Marta Ilves recorded residents of three generations in the fishing town of Kaarla to study how the local dialect is changing. She found that a distinctive vowel in words such as “boat” and “road” appears in 90 percent of recordings of speakers over 60 but in fewer than 10 percent of recordings of speakers under 30. ______, older residents nearly always pronounce such words the traditional way, whereas younger residents almost never do.",
      why: "The final sentence puts Ilves's percentages into plain words without adding anything, so it restates her finding.",
    },
    {
      scene: "eoi-rst-fort-bones",
      relation: "restatement",
      text: "Excavations at the hill fort of Brenmoor uncovered thousands of animal bones from the site's earliest period of occupation. When the zooarchaeologist Ada Kemp identified them by species, she found that sheep and goats accounted for roughly 75 percent of the identifiable remains, with cattle and pigs making up the rest. ______, about three of every four bones that could be identified came from sheep or goats.",
      why: "“Three of every four” is simply another way of saying 75 percent, so the final sentence restates Kemp's result.",
    },
    {
      scene: "eoi-rst-tea-growth",
      relation: "restatement",
      text: "The historian Paul Iwu used customs ledgers to trace the tea trade at the busy port of Callis between 1760 and 1790. He found that the volume of tea unloaded at Callis grew at a compound annual rate of about 6 percent throughout that period. ______, in a typical year the port received roughly 6 percent more tea than it had received the year before.",
      why: "Growth at a compound annual rate of 6 percent means each year's volume is about 6 percent above the previous year's, so the final sentence restates Iwu's finding.",
    },
    {
      scene: "eoi-rst-monochrome-canvases",
      relation: "restatement",
      text: "The painter Marit Eide spent the last decade of her life working in a remote studio on the island of Holm, and the canvases she produced there have long puzzled critics. In the catalog for Eide's first retrospective, the curator Samir Qureshi characterizes those late canvases as strictly monochromatic. ______, each of the late paintings is made from a single color, varied only in lightness and intensity.",
      why: "Being made from a single color is what “monochromatic” means, so the final sentence restates Qureshi's description.",
    },
    {
      scene: "eoi-rst-triple-meter",
      relation: "restatement",
      text: "The musicologist Elena Sorokina transcribed more than two hundred folk songs collected in the valley of Orsk during the 1920s. Many of the recordings, made on wax cylinders by traveling collectors, had never before been written down. Her analysis showed that roughly 80 percent of the songs are in triple meter. ______, in about four of every five songs, the beats fall into repeating groups of three.",
      why: "Beats grouped in threes is what triple meter means, and four of every five is 80 percent, so the final sentence restates Sorokina's result.",
    },
    {
      scene: "eoi-rst-reverse-chronology",
      relation: "restatement",
      text: "Samuel Venn's novel Forty Harvests follows one family from the day they buy a failing apple orchard to the day, four decades later, when they sell it. As the critic Ruth Obi observes, Venn arranges the novel's chapters in reverse chronological order. ______, Venn tells the family's story backward, beginning with its final events and ending with its first.",
      why: "Telling the story backward is what arranging chapters in reverse chronological order means, so the final sentence restates Obi's observation.",
    },
    {
      scene: "eoi-rst-self-taught-engineer",
      relation: "restatement",
      text: "The engineer Hana Sato designed three of the longest suspension bridges in Ardel during the 1950s, including the Harrow Strait Bridge, which still carries traffic today. Drawing on her letters and workshop notebooks, her biographer, Leon Park, describes her as essentially autodidactic in matters of structural engineering. ______, Sato taught herself most of what she knew about designing structures rather than learning it from instructors.",
      why: "Teaching herself rather than learning from instructors is what “autodidactic” means, so the final sentence restates Park's description.",
    },
  ];

  // Second key relations, so every template's phrases are sometimes the key
  // and sometimes a distractor within the template (a phrase that is always
  // the key in a drill is learned as a pattern, not a relation).

  // Contrast passages for the consequence template.
  const CONTRAST_ALT_TOPICS = [
    {
      scene: "eoi-con-two-bakeries",
      relation: "contrast",
      text: "The Linden Street bakery bakes all of its bread overnight so that every loaf is ready when the doors open at six in the morning. ______, the Mercer Avenue bakery bakes in small batches throughout the day, so its shelves are rarely full at any one time.",
      why: "The Mercer Avenue bakery bakes throughout the day, the opposite of the Linden Street bakery's single overnight bake, so the final sentence contrasts the two bakeries.",
    },
    {
      scene: "eoi-con-two-rivers",
      relation: "contrast",
      text: "The Aldo River, which is fed mostly by melting snow, runs highest in late spring, when the mountain snowpack thaws. ______, the nearby Serra River, which is fed mainly by autumn rains, runs highest in November.",
      why: "The Serra River peaks in November while the Aldo River peaks in spring, so the final sentence contrasts the two rivers.",
    },
    {
      scene: "eoi-con-two-loan-periods",
      relation: "contrast",
      text: "The Harbor Street Library lets its members borrow most books for three weeks at a time and charges a small fee for each day a book is late. ______, the university library across town lets students keep books for an entire semester without any fee.",
      why: "The university library's semester-long, fee-free loans are the opposite of the Harbor Street Library's short loans with late fees, so the final sentence contrasts the two libraries.",
    },
    {
      scene: "eoi-con-two-owls",
      relation: "contrast",
      text: "The barn owls of the Kessel Valley hunt almost entirely at night, locating mice in the dark by sound alone. ______, the valley's short-eared owls often hunt in daylight, gliding low over open fields in the late afternoon.",
      why: "The short-eared owls hunt in daylight while the barn owls hunt at night, so the final sentence contrasts the two kinds of owl.",
    },
    {
      scene: "eoi-con-two-poets-forms",
      relation: "contrast",
      text: "The poet Maren Vik wrote all of her poems in strict rhyming stanzas, counting the syllables of every line. ______, her friend Tomas Lind wrote in free verse, letting the length of each line follow the rhythm of ordinary speech.",
      why: "Lind's free verse is the opposite of Vik's strict rhyming stanzas, so the final sentence contrasts the two poets.",
    },
    {
      scene: "eoi-con-two-markets-goods",
      relation: "contrast",
      text: "At the Saturday market in the town of Ostby, most vendors sell fresh vegetables, eggs, and cut flowers from nearby farms. ______, the Thursday market in neighboring Varne is known mainly for secondhand books, tools, and furniture.",
      why: "The Varne market sells secondhand goods while the Ostby market sells farm produce, so the final sentence contrasts the two markets.",
    },
    {
      scene: "eoi-con-two-glaciers",
      relation: "contrast",
      text: "The Holm Glacier has retreated nearly two kilometers since 1900, leaving a lake where its tongue once lay. ______, the neighboring Brenn Glacier, shaded by a high ridge, has barely moved in the same period.",
      why: "The Brenn Glacier has barely moved while the Holm Glacier retreated far, so the final sentence contrasts the two glaciers.",
    },
    {
      scene: "eoi-con-two-rowing-clubs",
      relation: "contrast",
      text: "The Ostby rowing club trains at dawn, before the harbor fills with fishing boats and ferries. ______, the Varne club across the bay trains in the evening, after the ferries have stopped running for the day.",
      why: "The Varne club trains in the evening while the Ostby club trains at dawn, so the final sentence contrasts the two clubs.",
    },
    {
      scene: "eoi-con-two-sculptors",
      relation: "contrast",
      text: "The sculptor Ines Morel carves each of her figures from a single block of marble over many months. ______, her former student Pavel Ruud assembles his sculptures in a few days from scraps of sheet metal that he welds together.",
      why: "Ruud's quick welded metal work is the opposite of Morel's slow marble carving, so the final sentence contrasts the two sculptors.",
    },
  ];

  // Similarity passages for the contrast template.
  const SIMILARITY_ALT_TOPICS = [
    {
      scene: "eoi-sim-plastic-decks",
      relation: "similarity",
      text: "The engineer Oda Brenn designed the Kessler Footbridge with a deck of recycled plastic planks, which never need painting. ______, the new pier at Holm Harbor was built with a recycled plastic deck, chosen so that the town would not have to repaint it every few years.",
      why: "The Holm Harbor pier uses the same paint-free recycled plastic deck as the Kessler Footbridge, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-whale-migrations",
      relation: "similarity",
      text: "Gray whales migrate thousands of kilometers each year between feeding waters in the Arctic and warm breeding lagoons off the coast of Mexico. ______, humpback whales in the North Pacific travel between cold feeding grounds near Alaska and warm breeding waters near Hawaii.",
      why: "Humpback whales make the same kind of journey between cold feeding waters and warm breeding waters as gray whales, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-handwritten-drafts",
      relation: "similarity",
      text: "The novelist Ida Rask wrote every draft of her novels by hand and typed a clean copy only when a book was finished. ______, the poet Leo Marsh drafted each of his poems in pencil and typed it only after he had stopped revising.",
      why: "Marsh, like Rask, drafted by hand and typed only the finished work, so the final sentence draws a parallel between the two writers.",
    },
    {
      scene: "eoi-sim-late-libraries",
      relation: "similarity",
      text: "In the town of Brisk, the public library stays open until ten o'clock on weeknights so that students with daytime jobs can study after work. ______, the library in nearby Kell keeps its reading room open late on weeknights for students who work during the day.",
      why: "Kell's library keeps late hours for working students just as Brisk's does, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-natal-homing",
      relation: "similarity",
      text: "Sea turtles that hatch on a beach often return years later to the same stretch of coast to lay their own eggs. ______, many salmon return from the ocean to the very stream where they hatched in order to spawn.",
      why: "Salmon, like sea turtles, return to their birthplace to reproduce, so the final sentence draws a parallel between the two animals.",
    },
    {
      scene: "eoi-sim-free-student-seats",
      relation: "similarity",
      text: "The Harlow Theater offers free tickets to high school students for every Sunday afternoon performance. ______, the Varden Symphony sets aside free seats for students at each of its weekend concerts.",
      why: "The Varden Symphony offers students free seats just as the Harlow Theater does, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-shared-workshops",
      relation: "similarity",
      text: "In the village of Arden, weavers share a single workshop and split the income from every rug they sell. ______, the potters of nearby Kell work in one shared studio and divide the money from their sales equally.",
      why: "Kell's potters share a workspace and their income just as Arden's weavers do, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-cocoon-frogs",
      relation: "similarity",
      text: "The water-holding frog of Australia survives long droughts by burrowing underground inside a cocoon made of its own shed skin. ______, the African bullfrog can wait out a dry season buried in the soil, wrapped in a cocoon of shed skin.",
      why: "The African bullfrog survives dry periods the same way the water-holding frog does, so the final sentence draws a parallel.",
    },
    {
      scene: "eoi-sim-free-bicycles",
      relation: "similarity",
      text: "The city of Ostby lets residents borrow bicycles free of charge from racks at every tram stop. ______, the town of Kell lends bicycles at no cost from stands outside its train station and its library.",
      why: "Kell lends free bicycles just as Ostby does, so the final sentence draws a parallel.",
    },
  ];

  // Separate-point passages for the instance template.
  const ADDITION_ALT_TOPICS = [
    {
      scene: "eoi-add-touch-pool",
      relation: "addition",
      text: "The Varden Aquarium's new touch pool lets children handle sea stars and hermit crabs while a guide explains how each animal feeds. ______, the aquarium now stays open until nine o'clock on Fridays, so that families who work during the day can visit together.",
      why: "The late Friday hours are a second, separate improvement, not an instance of the touch pool, so the final sentence adds a new point.",
    },
    {
      scene: "eoi-add-cargo-bikes",
      relation: "addition",
      text: "The baker Lena Ruud replaced her delivery van with two electric cargo bikes, which can use bike lanes to avoid the traffic on Harbor Road. ______, the bikes cost far less to maintain than the van did, saving her about a thousand dollars a year.",
      why: "The lower maintenance cost is a second, independent advantage of the bikes, added to their use of bike lanes.",
    },
    {
      scene: "eoi-add-school-rooftop",
      relation: "addition",
      text: "The rooftop garden on the Holm Street school supplies fresh vegetables for the lunches served in the school's cafeteria. ______, the garden gives science classes a place to study soil, insects, and plant growth firsthand.",
      why: "Serving science classes is a second, separate benefit of the garden, added to supplying the cafeteria.",
    },
    {
      scene: "eoi-add-own-audiobook",
      relation: "addition",
      text: "Narrating her own audiobook allowed the author Priya Das to read each line with the rhythm she had heard in her head while writing it. ______, the recording sessions revealed a few clumsy sentences, which she fixed before the print edition went to press.",
      why: "Catching clumsy sentences is a second, separate benefit of narrating the audiobook, added to reading with the intended rhythm.",
    },
    {
      scene: "eoi-add-night-train",
      relation: "addition",
      text: "The new night train between Ostby and Kell lets travelers sleep through the six-hour trip instead of losing a day to it. ______, a ticket for the train costs less than a single night in most of Kell's hotels.",
      why: "The low fare is a second, independent advantage of the night train, added to letting travelers sleep through the trip.",
    },
    {
      scene: "eoi-add-wool-insulation",
      relation: "addition",
      text: "The sheep's wool insulation that the builder Ada Moreno uses in her houses absorbs moisture from the air without losing its ability to hold in heat. ______, the wool comes from local farms that would otherwise have trouble selling it.",
      why: "The local source of the wool is a second, separate point in its favor, added to how it handles moisture.",
    },
    {
      scene: "eoi-add-heat-pump",
      relation: "addition",
      text: "The heat pump installed in the Varden Library keeps its reading rooms warm in winter while using far less electricity than the old heaters did. ______, the same unit cools the building in summer, so the library no longer needs separate air conditioners.",
      why: "Cooling the building in summer is a second, separate benefit of the heat pump, added to heating it efficiently.",
    },
    {
      scene: "eoi-add-tide-app",
      relation: "addition",
      text: "The tide app that the harbor master of Holm designed shows fishers the height of the water at every dock, updated each hour. ______, it warns users when storms are approaching the coast, sending an alert up to a day in advance.",
      why: "Storm warnings are a second, separate feature of the app, added to its tide readings.",
    },
    {
      scene: "eoi-add-clay-plaster",
      relation: "addition",
      text: "Clay plaster, which the builder Tomas Ferro applies to interior walls, can be repaired simply by wetting a damaged patch and smoothing it over. ______, it absorbs odors from cooking, keeping kitchens fresher than painted walls do.",
      why: "Absorbing odors is a second, separate advantage of clay plaster, added to how easily it is repaired.",
    },
  ];

  // Concession passages for the further-point template: an advantage, then
  // something that happened in spite of it.
  const CONCESSION_ALT_TOPICS = [
    {
      scene: "eoi-cnc-sorghum-adoption",
      relation: "concession",
      text: "In field trials at the Kordel Research Station, a new variety of sorghum needed about a third less water than the corn most farmers in the region grow. ______, few farmers planted the new variety the following year, preferring a crop they already knew how to sell.",
      why: "Few farmers planted the sorghum even though it saved water, so the final sentence states something that happened in spite of the advantage just described.",
    },
    {
      scene: "eoi-cnc-free-lessons",
      relation: "concession",
      text: "The city of Brookvale offers free swimming lessons to every child between the ages of six and twelve each summer. ______, fewer than a third of the eligible children signed up last year, and the program's organizers are now visiting schools to promote it.",
      why: "Few children signed up although the lessons are free, so the final sentence states something that held in spite of that advantage.",
    },
    {
      scene: "eoi-cnc-quiet-trains",
      relation: "concession",
      text: "The electric trains that the Ostby line introduced in 2021 are far quieter than the diesel trains they replaced. ______, residents living beside the tracks filed dozens of noise complaints, most of them about the squeal of brakes at the Mercer Street station.",
      why: "Residents kept complaining about noise although the new trains are quieter, so the final sentence states something that holds in spite of the previous sentence.",
    },
    {
      scene: "eoi-cnc-white-streetlights",
      relation: "concession",
      text: "The new streetlights on Harbor Road use only a third as much electricity as the old ones and are expected to last four times as long. ______, many residents have asked the town council to replace them, complaining that the harsh white light keeps them awake at night.",
      why: "Residents want the lights replaced even though they are cheaper to run and longer-lasting, so the final sentence states something that holds in spite of those advantages.",
    },
    {
      scene: "eoi-cnc-acclaimed-debut",
      relation: "concession",
      text: "The novelist Karin Ost's first book won two national prizes and was praised by nearly every major reviewer. ______, it sold fewer than two thousand copies in its first year, and her publisher declined to print a second edition.",
      why: "The book sold poorly although critics praised it, so the final sentence states something that held in spite of that success.",
    },
    {
      scene: "eoi-cnc-safe-crossing",
      relation: "concession",
      text: "A traffic study found that the new crosswalk on Mercer Street, with its raised surface and flashing lights, had cut the speed of passing cars in half. ______, many parents continued to drive their children across the street to the park rather than let them walk.",
      why: "Parents kept driving their children although the crossing had become safer, so the final sentence states something that held in spite of the improvement.",
    },
    {
      scene: "eoi-cnc-bus-arrival-app",
      relation: "concession",
      text: "The Harlow transit agency's new app shows exactly when the next bus will arrive at every stop in the city. ______, most riders continue to rely on the printed schedules posted at the stops, according to a survey the agency conducted last spring.",
      why: "Riders keep using printed schedules even though the app is more exact, so the final sentence states something that holds in spite of the app's advantage.",
    },
    {
      scene: "eoi-cnc-free-admission",
      relation: "concession",
      text: "Since 2018, admission to the Varden Museum has been free for every visitor. ______, attendance has fallen slightly each year, a decline the museum's director blames on a lack of new exhibitions.",
      why: "Attendance fell even though admission became free, so the final sentence states something that happened in spite of that advantage.",
    },
  ];

  // Instance passages for the parallel-case template.
  const EXAMPLE_ALT_TOPICS = [
    {
      scene: "eoi-exm-guild-marks",
      relation: "example",
      text: "Many medieval craft guilds required their members to stamp every finished piece of work with a personal mark. ______, silversmiths in the city of Varne punched a small symbol into each cup and spoon they made, so that faulty pieces could be traced to their maker.",
      why: "Varne's silversmiths were guild members who marked their work, so the sentence gives an instance of the general claim rather than a separate, parallel case.",
    },
    {
      scene: "eoi-exm-dormant-seeds",
      relation: "example",
      text: "Some desert plants survive long droughts as seeds that wait in the soil for rain. ______, the seeds of the desert sand verbena can lie dormant for years until a heavy storm triggers them to sprout.",
      why: "The sand verbena is one of the desert plants that waits out droughts as seeds, so the sentence gives an instance of the general claim.",
    },
    {
      scene: "eoi-exm-quiet-cars",
      relation: "example",
      text: "Several commuter rail lines have created quiet cars, in which passengers are asked not to talk on the phone or play music aloud. ______, the Ostby line reserves the last car of every morning train for passengers who want silence.",
      why: "The Ostby line is one of the rail lines that has a quiet car, so the sentence gives an instance of the general claim.",
    },
    {
      scene: "eoi-exm-seasonal-coats",
      relation: "example",
      text: "A number of animals that live where snow covers the ground in winter change color with the seasons to match their surroundings. ______, the snowshoe hare's brown summer coat turns white as winter approaches.",
      why: "The snowshoe hare is one of the animals that changes color with the seasons, so the sentence gives an instance of the general claim.",
    },
    {
      scene: "eoi-exm-reused-sets",
      relation: "example",
      text: "Some small theater companies now build their sets largely from pieces saved from earlier productions. ______, the Brisk Street Players built the castle for their spring show from platforms and doors kept from three previous plays.",
      why: "The Brisk Street Players are one company that reuses old set pieces, so the sentence gives an instance of the general claim.",
    },
    {
      scene: "eoi-exm-seed-caches",
      relation: "example",
      text: "Certain birds can remember where they hid thousands of seeds months earlier. ______, a Clark's nutcracker buries seeds in thousands of small caches each autumn and finds many of them again the following spring, sometimes beneath snow.",
      why: "The Clark's nutcracker is one of the birds that remembers its hidden seeds, so the sentence gives an instance of the general claim.",
    },
    {
      scene: "eoi-exm-ant-guards",
      relation: "example",
      text: "Several kinds of plants defend themselves by sheltering ants that attack any animal trying to eat their leaves. ______, certain acacia trees in Central America house ants in their hollow thorns, and the ants sting insects and mammals that feed on the tree.",
      why: "These acacias are one of the plants that shelter defending ants, so the sentence gives an instance of the general claim.",
    },
    {
      scene: "eoi-exm-object-lending",
      relation: "example",
      text: "A growing number of public libraries lend objects that people need only occasionally. ______, the library in the town of Brisk lends cake pans, telescopes, and sewing machines, each for up to two weeks.",
      why: "Brisk's library is one of the libraries that lend such objects, so the sentence gives an instance of the general claim.",
    },
  ];

  // Flashback passages for the sequence template: the sentence after the
  // blank describes what came before the event just described.
  const PRIOR_TOPICS = [
    {
      scene: "eoi-pri-lisbon-kitchens",
      relation: "prior",
      text: "In 2015, the chef Ana Ruiz opened Salt & Ember, a small restaurant known for its vegetables roasted over a wood fire. ______, she had spent ten years cooking in the kitchens of three hotels in Lisbon, where she learned to cook over open flames.",
      why: "Ruiz's years in Lisbon's hotel kitchens came before she opened her restaurant, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-cave-map",
      relation: "prior",
      text: "In 1904, the surveyor Jonas Holm published the first complete map of the cave system beneath the Tarn Valley. ______, he had explored the caves for eleven summers, measuring each passage with a knotted rope.",
      why: "Holm's eleven summers of exploring came before he published the map, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-food-bank-mayor",
      relation: "prior",
      text: "Mira Castell was elected mayor of Harlow in 2016 and went on to serve two terms. ______, she had run the city's largest food bank for nearly a decade, a job that brought her into nearly every neighborhood.",
      why: "Castell ran the food bank before she became mayor, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-violin-scales",
      relation: "prior",
      text: "The violinist Theo Brandt made his concert debut with the Varden Symphony at the age of twenty-four. ______, he had studied for six years with a teacher who allowed him to play nothing but scales during his first year of lessons.",
      why: "Brandt's years of study came before his debut, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-customs-house",
      relation: "prior",
      text: "The stone building on Mercer Street has housed the city's history museum since 1972. ______, it served as a customs house, where officials inspected the cargo of ships arriving at the harbor.",
      why: "The building was a customs house before it became the museum, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-ferry-crossing",
      relation: "prior",
      text: "Engineers opened the steel Varne Bridge to traffic in 1931, and trucks soon carried grain across it from the farms on the river's eastern bank. ______, the farmers had shipped their grain on a flat-bottomed ferry that could carry only four wagons at a time.",
      why: "The ferry crossings came before the bridge opened, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-court-reporter",
      relation: "prior",
      text: "The novelist Grace Obi published her first book, a collection of short stories, when she was forty-two. ______, she had worked for twenty years as a court reporter, a job that trained her to listen closely to how people speak.",
      why: "Obi's years as a court reporter came before her first book, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-island-ferry-school",
      relation: "prior",
      text: "Since 2008, children on the island of Keld have attended a school in the island's only village. ______, they took a ferry to the mainland every morning, a crossing that was often canceled during winter storms.",
      why: "The ferry trips to school came before the island's school opened in 2008, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-diesel-station",
      relation: "prior",
      text: "The research station on the Tarn Glacier has run on solar and wind power since 2019. ______, it relied on diesel generators, and fuel had to be flown in by helicopter every few weeks.",
      why: "The station's diesel years came before it switched to solar and wind power, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-lighthouse-keepers",
      relation: "prior",
      text: "Since 1990, the old lighthouse on Keld Point has been a museum of the island's shipwrecks. ______, three generations of the Holm family had kept its lamp burning, climbing the tower's 140 steps every evening.",
      why: "The Holm family's years as keepers came before the lighthouse became a museum, so the sentence reaches back to an earlier time.",
    },
    {
      scene: "eoi-pri-potato-field",
      relation: "prior",
      text: "The Varne Stadium opened in 1965 on the eastern edge of the city. ______, the site had been a potato field, farmed by the same family for nearly a century.",
      why: "The site was a potato field before the stadium opened, so the sentence reaches back to an earlier time.",
    },
  ];

  // Consequence passages for the despite-drawback template: an advantage, a
  // drawback, then a consequence of the drawback that does not reject the
  // advantage.
  const RESULT_DRAWBACK_TOPICS = [
    {
      scene: "eoi-res-copper-roofs",
      relation: "result",
      text: "Copper roofs can last for more than a century and weather to an attractive green. Copper is expensive, however, and its price nearly doubled in the decade after 2005. ______, many owners of older copper roofs now patch damaged sections rather than replacing the whole roof.",
      why: "Owners patch rather than replace because of the high price described in the sentence just before, so the final sentence states a consequence of that drawback.",
    },
    {
      scene: "eoi-res-silk-maps",
      relation: "result",
      text: "Maps printed on silk are light, fold without tearing, and survive being soaked in water. Silk is costly to produce, however, and a silk map cost several times as much as a paper one. ______, mapmakers began printing cheaper maps on thin, tough paper made from mulberry fibers.",
      why: "Mapmakers looked for a cheaper material because silk was so costly, as the sentence before the blank says, so the final sentence states a consequence of that drawback.",
    },
    {
      scene: "eoi-res-large-format",
      relation: "result",
      text: "Large-format film cameras record extraordinary detail, allowing prints several meters wide with no visible grain. The cameras are heavy and slow to set up, however, often taking ten minutes to prepare for a single photograph. ______, photographers rarely use them for sports or street scenes, where the moment worth capturing passes in seconds.",
      why: "Photographers avoid the cameras for fast subjects because they are slow to set up, as the sentence before the blank says, so the final sentence states a consequence of that drawback.",
    },
    {
      scene: "eoi-res-rammed-earth",
      relation: "result",
      text: "Rammed-earth walls, built by packing damp soil between wooden forms, keep buildings cool in summer and warm in winter. Building them is slow, however, since each layer must be packed by hand before the next can be added. ______, rammed-earth houses in the Tarn Valley are rarely built by large developers, who depend on finishing projects quickly.",
      why: "Large developers avoid rammed earth because building it is slow, as the sentence before the blank says, so the final sentence states a consequence of that drawback.",
    },
    {
      scene: "eoi-res-wax-cylinders",
      relation: "result",
      text: "Wax cylinders, an early recording format, captured voices clearly enough that listeners could recognize individual singers. Each cylinder held only about two minutes of sound, however. ______, folk-song collectors who used them often recorded just the first few verses of long ballads.",
      why: "Collectors recorded only a few verses because each cylinder held so little sound, as the sentence before the blank says, so the final sentence states a consequence of that limit.",
    },
    {
      scene: "eoi-res-dark-sky-tours",
      relation: "result",
      text: "The Keld Plateau has some of the darkest night skies in the country, which makes it an excellent place to observe faint galaxies. The plateau is remote, however, and the nearest paved road ends forty kilometers away. ______, few amateur astronomers make the trip, and most of the plateau's visitors are researchers with their own vehicles.",
      why: "Few amateurs visit because the plateau is so remote, as the sentence before the blank says, so the final sentence states a consequence of that drawback.",
    },
    {
      scene: "eoi-res-hail-netting",
      relation: "result",
      text: "Glass greenhouses let in more sunlight than any plastic covering, and a well-built one can last for decades. Glass is fragile, however, and a single hailstorm can shatter dozens of panes. ______, glass greenhouses in the hail-prone Ober Valley are usually covered with wire netting during the summer.",
      why: "The netting is there because hail can shatter glass, as the sentence before the blank says, so the final sentence states a consequence of that drawback.",
    },
    {
      scene: "eoi-res-acid-free-paper",
      relation: "result",
      text: "Books printed on acid-free paper can last for centuries without yellowing. Acid-free paper costs more to make, however, than ordinary paper made from wood pulp. ______, many inexpensive paperbacks are printed on ordinary paper that begins to yellow within a few decades.",
      why: "Inexpensive books use ordinary paper because acid-free paper costs more, as the sentence before the blank says, so the final sentence states a consequence of that drawback.",
    },
    {
      scene: "eoi-res-sail-cargo",
      relation: "result",
      text: "Cargo ships powered by sail burn almost no fuel, and their crossings produce very little pollution. They are slow, however, taking nearly twice as long as diesel ships to cross the Atlantic. ______, they rarely carry fresh fruit or other goods that would spoil during the long crossing.",
      why: "Sailing ships avoid perishable cargo because their crossings are slow, as the sentence before the blank says, so the final sentence states a consequence of that drawback.",
    },
  ];

  // Reinforcement passages for the concede-then-return template: a cited
  // person's claim, then a stronger statement or evidence confirming it.
  const EMPHASIS_TOPICS = [
    {
      scene: "eoi-emp-school-gardens",
      relation: "emphasis",
      text: "The education researcher Tomas Weller argues that school gardens change how students feel about vegetables. ______, he found that students who tended a garden for a full year were twice as likely as their classmates to choose a vegetable side dish at lunch.",
      why: "The finding confirms and strengthens Weller's claim, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-bridge-cracks",
      relation: "emphasis",
      text: "According to the engineer Rosa Kim, many of the county's older bridges need repairs sooner than their inspection schedules suggest. ______, her survey found cracks in the supports of eleven of the fourteen bridges built before 1950.",
      why: "The survey results confirm and strengthen Kim's claim, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-city-birdsong",
      relation: "emphasis",
      text: "The ornithologist Kwesi Adu contends that city noise is changing how songbirds sing. ______, his recordings show that great tits in the center of Ostby sing at a higher pitch than great tits in the quieter forests outside the city.",
      why: "The recordings confirm and strengthen Adu's claim, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-family-letters",
      relation: "emphasis",
      text: "The critic Hanna Moll believes that the novelist Karin Ost drew heavily on her own family's history. ______, nearly every major character in Ost's novels shares a name, a trade, and a hometown with a relative mentioned in the family's surviving letters.",
      why: "Characters that match real relatives in name, trade, and hometown strengthen Moll's claim, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-shorter-weeks",
      relation: "emphasis",
      text: "The economist Ines Bauer argues that a shorter workweek need not reduce a company's output. ______, in the trials she studied, output rose at more than half of the companies that moved to a four-day week.",
      why: "Output actually rising at most companies goes beyond Bauer's claim that it need not fall, so the sentence reinforces her point with a stronger one.",
    },
    {
      scene: "eoi-emp-evening-hours",
      relation: "emphasis",
      text: "The librarian Omar Sy maintains that evening hours are essential if public libraries are to reach adults who work during the day. ______, after the Harlow library began staying open until nine o'clock, borrowing by adults rose by 40 percent in a single year.",
      why: "The jump in adult borrowing confirms Sy's claim, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-heat-corals",
      relation: "emphasis",
      text: "The marine biologist Leila Farah argues that some corals can adapt to warmer water. ______, she has found colonies on the shallow reef flat off Keld Island that survived a heat wave that killed most of the corals in deeper, cooler water nearby.",
      why: "Colonies surviving a deadly heat wave confirm Farah's claim, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-reading-aloud",
      relation: "emphasis",
      text: "The teacher Paul Ekberg believes that older students gain as much from hearing books read aloud as young children do. ______, his eleventh graders, to whom he reads a chapter at the start of every class, have raised their reading scores each year since he began the practice.",
      why: "His older students' rising scores confirm Ekberg's belief, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-old-charts",
      relation: "emphasis",
      text: "The historian Anja Holt argues that old sea charts are more reliable guides to past coastlines than written descriptions are. ______, seventeenth-century charts mark three harbors at the very spots where their ruins were later found, while written accounts of the period placed them several kilometers away.",
      why: "Charts that placed the harbors correctly where written accounts misplaced them confirm Holt's claim, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-protected-lanes",
      relation: "emphasis",
      text: "The transportation researcher Nadia Koh argues that protected bike lanes make streets safer for everyone, not only for cyclists. ______, in the twelve cities she studied, injuries to pedestrians fell on nearly every street where such lanes were built.",
      why: "Pedestrian injuries falling confirms Koh's claim that the lanes help more than cyclists, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
    {
      scene: "eoi-emp-word-lists",
      relation: "emphasis",
      text: "The psychologist Leon Varga contends that almost anyone can learn to memorize long lists quickly. ______, in his experiments, volunteers with no special training recalled lists of forty words in order after just six weeks of practice.",
      why: "Untrained volunteers memorizing long lists confirms Varga's claim, so the sentence reinforces the point before it rather than conceding anything against it.",
    },
  ];

  // Consequence passages for the restatement template: a technical finding,
  // then something that follows from it (new information, not a rewording).
  const RESULT_FINDING_TOPICS = [
    {
      scene: "eoi-res-thin-snowpack",
      relation: "result",
      text: "The hydrologist Mara Lind found that the average spring snowpack in the Tarn Mountains has shrunk by about a third since 1980. ______, the reservoirs that depend on snowmelt now reach their lowest levels several weeks earlier in the summer than they once did.",
      why: "The reservoirs run low earlier because there is less snow to melt, so the final sentence states a consequence of Lind's finding rather than restating it.",
    },
    {
      scene: "eoi-res-corroded-deck",
      relation: "result",
      text: "Inspectors found that the steel bars inside the Varne Bridge's concrete deck had corroded badly, mainly because road salt had seeped through cracks in the surface. ______, the city closed two of the bridge's four lanes while crews replaced the damaged sections.",
      why: "The lane closures followed from the corrosion the inspectors found, so the final sentence states a consequence rather than restating the finding.",
    },
    {
      scene: "eoi-res-wild-bees",
      relation: "result",
      text: "The ecologist Kofi Asare showed that the number of wild bees visiting orchards in the Ober Valley had fallen by nearly half over twenty years. ______, many orchard owners now rent honeybee hives each spring to make sure their trees are pollinated.",
      why: "Owners rent hives because fewer wild bees visit, so the final sentence states a consequence of Asare's finding rather than restating it.",
    },
    {
      scene: "eoi-res-last-speakers",
      relation: "result",
      text: "The linguist Sara Holm found that by 2010 every remaining fluent speaker of the Vessa dialect was more than eighty years old. ______, she began recording their conversations so that the dialect would not be lost when they died.",
      why: "Holm began recording because the last speakers were so old, so the final sentence states a consequence of her finding rather than restating it.",
    },
    {
      scene: "eoi-res-railway-trade",
      relation: "result",
      text: "Customs records show that the port of Harwick lost most of its trade after a new railway reached the rival port of Skarn in 1866. ______, dozens of Harwick's warehouses stood empty within a decade.",
      why: "The warehouses emptied because the trade had moved to Skarn, so the final sentence states a consequence rather than restating the records.",
    },
    {
      scene: "eoi-res-stream-fungus",
      relation: "result",
      text: "Surveys by the zoologist Ama Boateng showed that a fungal disease deadly to frogs had reached every stream in the Serra Hills by 2015. ______, the park closed the streams to hikers, who could otherwise carry the fungus on their boots to unaffected valleys elsewhere.",
      why: "The park closed the streams because the fungus had reached them, so the final sentence states a consequence of Boateng's finding rather than restating it.",
    },
    {
      scene: "eoi-res-blocked-salmon",
      relation: "result",
      text: "Biologists found that salmon could not swim past the Harlow Dam to reach their spawning streams farther upriver. ______, the dam's owners built a series of stepped pools beside it, allowing the fish to climb around the barrier.",
      why: "The owners built the pools because the salmon could not pass the dam, so the final sentence states a consequence of the biologists' finding rather than restating it.",
    },
    {
      scene: "eoi-res-unreinforced-buildings",
      relation: "result",
      text: "Engineers studying the 1998 earthquake in the city of Varne found that nearly every building that collapsed had been built before 1960, when the city's building code required no steel reinforcement. ______, the city now requires owners of older buildings to add reinforcement or close them.",
      why: "The new requirement followed from what the engineers found, so the final sentence states a consequence rather than restating the finding.",
    },
    {
      scene: "eoi-res-noisy-classrooms",
      relation: "result",
      text: "Acoustic measurements showed that background noise in the Holm Street school's classrooms averaged 55 decibels, well above the level at which students can easily follow speech. ______, the school installed sound-absorbing panels on the ceiling of every classroom.",
      why: "The school installed the panels because the classrooms were too noisy, so the final sentence states a consequence of the measurements rather than restating them.",
    },
  ];

  // Hard: continuation passages whose four choices all carry the passage
  // forward. `example` gives one case of a general claim; `specification`
  // says exactly what a general statement referred to (every item a stated
  // number calls for, or the one thing named); `restatement` says the same
  // thing in plainer, less precise words; `addition` adds a separate point.
  const ELABORATION_TOPICS = [
    {
      scene: "eoi-elb-rail-walkways",
      relation: "example",
      text: "Several cities have turned abandoned railroad bridges into walkways for pedestrians and cyclists. ______, the city of Ostby converted a freight bridge over the Varne River into a park lined with benches and flower beds.",
      why: "Ostby is one of the several cities; the sentence gives one case of the general claim, not the whole of what it referred to, a rewording of it, or a separate point.",
    },
    {
      scene: "eoi-elb-seed-libraries",
      relation: "example",
      text: "Some public libraries now lend seeds as well as books, asking borrowers to return seeds saved from their own harvests. ______, the library in the town of Kell keeps more than two hundred varieties of vegetable seeds in a converted card catalog.",
      why: "Kell's library is one of the libraries that lend seeds; the sentence gives one case of the general claim.",
    },
    {
      scene: "eoi-elb-night-flowers",
      relation: "example",
      text: "Many flowers are pollinated at night by moths rather than by bees. ______, the evening primrose opens its pale yellow petals at dusk, when hawk moths begin to feed.",
      why: "The evening primrose is one of the many night-pollinated flowers; the sentence gives one case of the general claim.",
    },
    {
      scene: "eoi-elb-two-changes",
      relation: "specification",
      text: "After a year of study, the transit committee recommended two changes to the Ostby bus system. ______, it proposed adding late-night service on weekends and running express buses between the train station and the hospital at rush hour.",
      why: "The sentence names both of the two changes, saying exactly what the committee recommended; it is not one case among others, a rewording, or a separate point.",
    },
    {
      scene: "eoi-elb-single-flaw",
      relation: "specification",
      text: "When engineers inspected the Harlow Dam in 2018, they found only one flaw that needed immediate repair. ______, a gate valve near the base of the dam no longer closed completely, allowing a steady leak.",
      why: "The sentence identifies the one flaw exactly, so it states precisely what the previous sentence referred to.",
    },
    {
      scene: "eoi-elb-three-rules",
      relation: "specification",
      text: "The chef Mateus Lobo trains every new cook in his kitchen according to three rules. ______, cooks must taste every sauce before it leaves the kitchen, keep their knives sharp, and clean their stations before each service.",
      why: "The sentence lists all three rules, saying exactly what the previous sentence referred to.",
    },
    {
      scene: "eoi-elb-eelgrass-density",
      relation: "restatement",
      text: "A survey of the Holm Estuary found that the density of eelgrass declined from 812 shoots per square meter in 2005 to 398 shoots per square meter in 2020. ______, the estuary's eelgrass beds are now only about half as thick as they were fifteen years earlier.",
      why: "“About half as thick” rounds off the survey's figures and adds nothing new, so the sentence restates the finding in plainer, less precise words.",
    },
    {
      scene: "eoi-elb-bus-survey",
      relation: "restatement",
      text: "In a survey of 1,200 residents of Harlow, 71 percent said they would ride a bus to work if one stopped within a ten-minute walk of their homes. ______, most residents would use buses if a stop were close enough to reach on foot.",
      why: "The sentence says the same thing as the survey result in plainer, less precise words and adds nothing new.",
    },
    {
      scene: "eoi-elb-dry-nights",
      relation: "restatement",
      text: "Measurements at the Varden Observatory show that, from October through March, the median relative humidity at the site after midnight is below 15 percent. ______, the air above the observatory is usually very dry on winter nights.",
      why: "The sentence says the same thing as the measurements in plainer, less precise words and adds nothing new.",
    },
    {
      scene: "eoi-elb-orchard-flowers",
      relation: "addition",
      text: "Planting rows of wildflowers between orchard trees gives pollinating insects food after the fruit trees have finished blooming. ______, the wildflowers' roots hold the soil in place during heavy spring rains.",
      why: "Holding the soil in place is a second, separate benefit of the wildflowers, not a case, a precise account, or a rewording of the first.",
    },
    {
      scene: "eoi-elb-wind-tram",
      relation: "addition",
      text: "Ostby's new tram line has cut the trip from the harbor to the university from forty minutes to fifteen. ______, the trams run on electricity from the city's wind farm, so the line produces almost no local air pollution.",
      why: "Running on wind power is a second, separate point in the line's favor, added to the shorter trip.",
    },
    {
      scene: "eoi-elb-digital-archive",
      relation: "addition",
      text: "Digitizing the town's newspaper archive has let researchers anywhere search a century of local news in seconds. ______, it has protected the fragile original pages, which no longer need to be handled every time someone looks up an article.",
      why: "Protecting the original pages is a second, separate benefit of digitizing, added to faster searching.",
    },
  ];

  // Hard: adversative passages whose choices include three words that each
  // turn against what came before. `replacement` gives what was done in
  // place of something the previous sentence rules out; `concession` states
  // what holds despite an obstacle; `contrast` sets a second subject against
  // the first.
  const ADVERSATIVE_TOPICS = [
    {
      scene: "eoi-adv-unused-guides",
      relation: "replacement",
      text: "The Tarn Museum expected its visitors to rely on the touch-screen guides it installed in 2022, but few visitors used them. ______, most people moved through the galleries reading the printed labels and talking with one another.",
      why: "Reading labels and talking is what visitors did in place of using the guides, which the previous sentence rules out; nothing holds despite an obstacle, and no second subject is compared.",
    },
    {
      scene: "eoi-adv-ground-pigments",
      relation: "replacement",
      text: "The painter Odile Brask does not buy tubes of prepared paint. ______, she grinds her own pigments from minerals she collects on hikes near her studio.",
      why: "Grinding her own pigments is what Brask does in place of buying prepared paint, which the previous sentence rules out.",
    },
    {
      scene: "eoi-adv-walking-composer",
      relation: "replacement",
      text: "The composer Lise Aro does not write her music at a piano. ______, she composes while walking, singing melodies into a small recorder and transcribing them each evening.",
      why: "Composing while walking is what Aro does in place of writing at a piano, which the previous sentence rules out.",
    },
    {
      scene: "eoi-adv-reinforced-bridge",
      relation: "replacement",
      text: "After a long debate, the city's engineers decided not to replace the corroded Varne Footbridge. ______, they reinforced its original iron frame with steel cables, preserving the bridge's nineteenth-century design.",
      why: "Reinforcing the old frame is what the engineers did in place of replacing the bridge, which the previous sentence rules out.",
    },
    {
      scene: "eoi-adv-foggy-regatta",
      relation: "concession",
      text: "Thick fog covered the harbor on the morning of the Holm regatta, hiding the course markers from the sailors' view. ______, all twenty-two boats finished the race, and three crews set new course records.",
      why: "The boats finished, and some set records, despite the fog described in the previous sentence; nothing was ruled out and replaced, and no second subject is compared.",
    },
    {
      scene: "eoi-adv-budget-season",
      relation: "concession",
      text: "The Harlow Theater's budget was cut by a third in 2020, forcing the company to reduce its staff. ______, the theater staged six new plays that season, more than in any earlier year.",
      why: "The theater staged a record number of plays despite the budget cut, so the sentence states what held in spite of an obstacle.",
    },
    {
      scene: "eoi-adv-ankle-final",
      relation: "concession",
      text: "The sprinter Lena Ruud injured her ankle three weeks before the national championships and could barely train for ten days. ______, she won the 200-meter final in the fastest time of her career.",
      why: "Ruud won despite her injury, so the sentence states what held in spite of an obstacle.",
    },
    {
      scene: "eoi-adv-plateau-barley",
      relation: "concession",
      text: "The soil on the Keld Plateau is thin, rocky, and low in nutrients. ______, farmers there have grown barley successfully for more than eight hundred years.",
      why: "Farmers have grown barley for centuries despite the poor soil, so the sentence states what holds in spite of an obstacle.",
    },
    {
      scene: "eoi-adv-desert-rainfall",
      relation: "contrast",
      text: "Parts of the Atacama Desert in Chile receive less than a millimeter of rain in a typical year. ______, the wettest parts of the Sonoran Desert in North America receive around 400 millimeters a year, enough to support forests of tall saguaro cacti.",
      why: "The sentence sets a second desert against the first on the same measure, rainfall; it does not describe something done in place of something ruled out or something that holds despite an obstacle.",
    },
    {
      scene: "eoi-adv-bridge-spans",
      relation: "contrast",
      text: "The main span of the Ostby Bridge stretches 900 meters between its two towers. ______, the older Varne Bridge upstream crosses the river on a series of short stone arches, none longer than 60 meters.",
      why: "The sentence sets a second bridge against the first on the same measure, the length of its spans.",
    },
    {
      scene: "eoi-adv-violin-strings",
      relation: "contrast",
      text: "Most violin strings made today have a core of steel or of synthetic fibers such as nylon. ______, the strings used by eighteenth-century violinists were made of sheep gut, which gives a softer, warmer tone.",
      why: "The sentence sets the strings of a second period against today's on the same feature, what the strings are made of.",
    },
    {
      scene: "eoi-adv-cicada-cycles",
      relation: "contrast",
      text: "Many species of cicada in North America produce a new generation of adults every summer. ______, periodical cicadas spend thirteen or seventeen years underground and then emerge together by the millions.",
      why: "The sentence sets a second group of cicadas against the first on the same feature, how often adults appear.",
    },
  ];

  /* =================================================================== */
  /* Transitions machinery                                                */
  /* =================================================================== */

  const TRANSITION_QUESTION = "Which choice completes the text with the most logical transition?";
  const BLANK = "______";

  const opening = (text) => lc((String(text).match(/^\S+/) || [""])[0]);

  // Transitional phrases by logical relation. Each phrase belongs to exactly
  // one relation, which is what verify() checks the key and distractors by.
  const LEXICON = {
    result: ["As a result", "Consequently", "Therefore", "Thus"],
    contrast: ["In contrast", "By contrast", "However", "On the other hand"],
    concession: ["Nevertheless", "Even so", "Still", "Nonetheless"],
    example: ["For example", "For instance"],
    addition: ["Moreover", "In addition", "Furthermore", "Additionally"],
    similarity: ["Similarly", "Likewise"],
    sequence: ["Later", "Afterward", "Subsequently"],
    prior: ["Previously", "Earlier", "Before that"],
    restatement: ["In other words", "That is"],
    // "To be sure" is left out: it can also mean "certainly", which would
    // make it defensible where a sentence confirms a claim.
    admission: ["Admittedly", "Granted"],
    emphasis: ["In fact", "Indeed"],
    specification: ["Specifically"],
    replacement: ["Instead", "Rather"],
  };
  const RELATION_OF = new Map();
  Object.entries(LEXICON).forEach(([relation, phrases]) =>
    phrases.forEach((phrase) => RELATION_OF.set(phrase, relation)),
  );

  // What the key signals (explanations).
  const SIGNALS = {
    result: "introduces a consequence of what came before",
    contrast: "sets a second subject against the first",
    concession: "introduces a point that holds despite what came before",
    example: "introduces a specific instance of a general claim",
    addition: "adds a further point in the same direction",
    similarity: "introduces a parallel case",
    sequence: "places an event after the one before it",
    prior: "places an event before the one just described",
    restatement: "restates the previous point in other words",
    admission: "grants a point against the claim being discussed before the passage returns to it",
    emphasis: "reinforces the previous statement with a stronger one",
    specification: "states exactly what the previous sentence referred to",
    replacement: "introduces what was done in place of something the previous sentence rules out",
  };
  // What a wrong phrase would claim, and what the sentence actually does;
  // a distractor's reason pairs the two.
  const WOULD = {
    result: "present the sentence as a consequence of the one before it",
    contrast: "set the sentence against the previous one as a contrasting case",
    concession: "present the sentence as something that holds despite the previous one",
    example: "present the sentence as one instance of a general claim before it",
    addition: "add the sentence as a separate point in the same direction",
    similarity: "present the sentence as a separate, parallel case",
    sequence: "place this event after the one just described",
    prior: "place this event before the one just described",
    restatement: "present the sentence as the previous point restated",
    admission: "present the sentence as a point granted against the claim",
    emphasis: "present the sentence as reinforcing the claim before it",
    specification: "present the sentence as exactly what the previous one referred to",
    replacement: "present the sentence as what was done in place of something ruled out",
  };
  const DOES = {
    result: "states a consequence of the sentence before it",
    contrast: "describes a second subject that differs from the first",
    concession: "states something that holds in spite of the sentence before it",
    example: "gives one instance of the general claim before it",
    addition: "adds a separate point in the same direction",
    similarity: "describes a separate case that is like the first",
    sequence: "describes an event that came after the one before it",
    prior: "describes something that came before the event just described",
    restatement: "says the same thing as the sentence before it in plainer, less precise words",
    admission: "grants a point against the claim before the passage returns to it",
    emphasis: "confirms the claim before it with a stronger statement or evidence",
    specification: "says exactly what the sentence before it referred to",
    replacement: "describes what was done in place of something the sentence before it rules out",
  };
  const reasonFor = (phrase, relation, keyRelation) =>
    `"${phrase}" would ${WOULD[relation]}, but the sentence ${DOES[keyRelation]}.`;

  // Relations a student could treat as synonyms; offering both as wrong
  // answers lets a student discard the pair unread, so a set never holds
  // both unless the template is about telling them apart.
  const NEAR = [["contrast", "concession"]];

  // Picks one phrase for the near-neighbour relation and one for each of two
  // other relations, rejecting sets where two choices open with the same word
  // (so no choice stands out by its first word). `plan.pools` narrows a
  // relation's phrases where one of them could be defended with this key.
  function pickDistractors(t, plan, keyPhrase, allowNear) {
    const pool = (relation) => (plan.pools && plan.pools[relation]) || LEXICON[relation];
    let phrases = [];
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const relations = [plan.neighbour, ...t.sample(plan.others, 2)];
      if (!allowNear && NEAR.some(([a, b]) => relations.includes(a) && relations.includes(b))) continue;
      phrases = relations.map((relation) => t.pick(pool(relation)));
      if (new Set([keyPhrase, ...phrases].map(opening)).size === 4) return phrases;
    }
    return phrases;
  }

  // One Transitions template. Its scenes need two or more relations (listed
  // in `spec.plans`, one plan per key relation), so each relation's phrases
  // are sometimes the key and sometimes a distractor within the template.
  function transitionFamily(spec) {
    return {
      id: spec.id,
      sectionKey: SECTION,
      domain: DOMAIN,
      skill: "Transitions",
      subskill: spec.subskill,
      difficulty: spec.difficulty,
      title: spec.title,
      recognize: spec.recognize,
      rubric: spec.rubric,
      tricks: spec.tricks,
      build(t) {
        const topic = t.pick(spec.topics);
        const plan = spec.plans[topic.relation];
        // A phrase already used in the passage ("still commissions") is not
        // offered as the key.
        const keyPhrase = t.pick((plan.keyPool || LEXICON[topic.relation])
          .filter((phrase) => !lc(topic.text).includes(` ${lc(phrase)} `)));
        const phrases = pickDistractors(t, plan, keyPhrase, spec.allowNear);
        const extra = (spec.reasons && spec.reasons[topic.relation]) || {};
        const instance = {
          responseType: "multiple-choice",
          scene: topic.scene,
          stimulus: { type: "passage", content: topic.text },
          stem: TRANSITION_QUESTION,
          correct: keyPhrase,
          wrong: phrases.map((phrase) => {
            const relation = RELATION_OF.get(phrase);
            return [phrase, extra[relation] ? extra[relation](phrase) : reasonFor(phrase, relation, topic.relation)];
          }),
          explanation: `${topic.why} "${keyPhrase}" ${SIGNALS[topic.relation]}, so it is the most logical transition.`,
          steps: [
            "Read the sentence before the blank and the sentence the blank begins.",
            ...(spec.extraStep ? [spec.extraStep] : []),
            `Decide how they relate: the second ${DOES[topic.relation]}.`,
            `Choose the transition that ${SIGNALS[topic.relation]}.`,
          ],
          principles: spec.principles,
          trap: spec.traps[topic.relation],
          hint: spec.hint,
          estimatedSeconds: spec.seconds,
        };
        // The offered key must express the relation recorded for the passage,
        // the near neighbour must be offered, and every distractor must
        // express a different relation the plan allows.
        instance.verify = () => {
          const blanks = topic.text.split(BLANK).length - 1;
          const keyRelation = RELATION_OF.get(instance.correct);
          const wrongRelations = instance.wrong.map(([phrase]) => RELATION_OF.get(phrase));
          return (
            spec.topics.includes(topic) &&
            topic.scene.startsWith("eoi-") &&
            blanks === 1 &&
            topic.text.includes(`${BLANK}, `) &&
            Boolean(plan) &&
            keyRelation === topic.relation &&
            (!plan.keyPool || plan.keyPool.includes(instance.correct)) &&
            wrongRelations.includes(plan.neighbour) &&
            wrongRelations.every((relation) =>
              relation && relation !== keyRelation && (relation === plan.neighbour || plan.others.includes(relation))) &&
            new Set(wrongRelations).size === 3 &&
            // A key phrase may not also appear in the passage right after
            // the blank ("Still, ... still commissions").
            !lc(topic.text).includes(` ${lc(instance.correct)} `)
          );
        };
        return instance;
      },
    };
  }

  const TRANSITION_PRINCIPLES = [
    "A transition names the logical relationship between two sentences; read both before choosing.",
    "Every choice is grammatical, so decide the relationship first and then find the word that signals it.",
  ];

  /* =================================================================== */
  /* Transitions templates                                                */
  /* =================================================================== */

  const resultTransition = transitionFamily({
    id: "transition-consequence",
    subskill: "logical transition",
    difficulty: "Easy",
    title: "Transition into a consequence or a contrast",
    recognize: "The final sentence either reports what happened because of the situation before it or describes a second subject that differs from the first; the transition must signal which.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["grammatical-but-illogical"],
    seconds: 45,
    topics: RESULT_TOPICS.concat(CONTRAST_ALT_TOPICS),
    plans: {
      result: { neighbour: "contrast", others: ["example", "similarity"] },
      contrast: { neighbour: "result", others: ["example", "similarity"] },
    },
    principles: TRANSITION_PRINCIPLES,
    traps: {
      result: "Reaching for a contrast word because the outcome is notable, although nothing in it opposes the previous sentence.",
      contrast: "Reaching for a cause-and-effect word because the two sentences sit side by side, although the second subject's behavior does not follow from the first's.",
    },
    hint: "Is the final sentence caused by the one before it, or about a different subject that behaves differently?",
  });

  const contrastTransition = transitionFamily({
    id: "transition-contrast-two-subjects",
    subskill: "logical transition",
    difficulty: "Easy",
    title: "Transition between two subjects, alike or unlike",
    recognize: "The passage describes one subject and then a second; decide whether the second is described the opposite way (contrast) or the same way (a parallel case).",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical"],
    seconds: 45,
    topics: CONTRAST_TOPICS.concat(SIMILARITY_ALT_TOPICS),
    plans: {
      contrast: { neighbour: "similarity", others: ["result", "example", "addition"] },
      similarity: { neighbour: "contrast", others: ["result", "example"] },
    },
    principles: TRANSITION_PRINCIPLES,
    traps: {
      contrast: "Choosing a similarity word because two subjects are being compared, without checking whether they agree or differ.",
      similarity: "Choosing a contrast word because the subject changes, although what is said about it is the same.",
    },
    hint: "Do the two sentences describe their subjects the same way or in opposite ways?",
  });

  const exampleTransition = transitionFamily({
    id: "transition-instance-mid-passage",
    subskill: "sentence connection",
    difficulty: "Easy",
    title: "Transition to an instance or to a further point",
    recognize: "The sentence after the blank either gives one specific case of the general claim before it or adds a separate point; the transition must signal which.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["grammatical-but-illogical"],
    seconds: 50,
    topics: EXAMPLE_TOPICS.concat(ADDITION_ALT_TOPICS),
    plans: {
      example: { neighbour: "addition", others: ["similarity", "contrast", "concession", "result"] },
      addition: { neighbour: "example", others: ["result", "contrast", "concession"] },
    },
    principles: TRANSITION_PRINCIPLES,
    traps: {
      example: "Choosing an addition word, treating the instance as a new point rather than a case of the claim just made.",
      addition: "Choosing an example word, treating a second, separate point as an instance of the first.",
    },
    hint: "Is the sentence after the blank a case of the claim before it, or a separate point?",
  });

  const additionTransition = transitionFamily({
    id: "transition-further-point",
    subskill: "logical transition",
    difficulty: "Medium",
    title: "Transition into a further point or a point that holds despite it",
    recognize: "The final sentence either adds a new point in the same direction as the previous one or states something that happened in spite of it; the transition must signal which.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 60,
    topics: ADDITION_TOPICS.concat(CONCESSION_ALT_TOPICS),
    plans: {
      addition: { neighbour: "concession", others: ["result", "example"] },
      concession: { neighbour: "addition", others: ["result", "example", "similarity"] },
    },
    principles: TRANSITION_PRINCIPLES,
    traps: {
      addition: "Choosing a concession word because the second point is surprising, although it runs in the same direction as the first.",
      concession: "Choosing an addition word because both sentences are about the same subject, although the second runs against the first.",
    },
    hint: "Does the final sentence push further in the same direction as the one before it, or against it?",
  });

  const similarityTransition = transitionFamily({
    id: "transition-parallel-case",
    subskill: "logical transition",
    difficulty: "Medium",
    title: "Transition into a parallel case or an instance",
    recognize: "The sentence after the blank either describes a separate subject that behaves like the first (a parallel case) or one member of the category the first sentence describes (an instance).",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "opposite-stance"],
    seconds: 60,
    topics: SIMILARITY_TRANSITION_TOPICS.concat(EXAMPLE_ALT_TOPICS),
    plans: {
      similarity: { neighbour: "example", others: ["contrast", "result", "concession"] },
      example: { neighbour: "similarity", others: ["contrast", "concession", "result"] },
    },
    principles: TRANSITION_PRINCIPLES,
    traps: {
      similarity: "Choosing an example word, treating a separate case as a member of the first subject's category.",
      example: "Choosing a similarity word, treating a member of the category just described as a separate case.",
    },
    hint: "Is the second subject a member of the group the first sentence describes, or a different subject that behaves the same way?",
  });

  const sequenceTransition = transitionFamily({
    id: "transition-later-step",
    subskill: "sentence connection",
    difficulty: "Easy",
    title: "Transition forward or back in time",
    recognize: "The sentence after the blank describes an event that either builds on the one before it (later) or came before it (earlier); what each event depends on fixes the order.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["reversed-condition"],
    seconds: 50,
    topics: SEQUENCE_TOPICS.concat(PRIOR_TOPICS),
    plans: {
      sequence: { neighbour: "prior", others: ["example", "similarity", "restatement"] },
      prior: { neighbour: "sequence", others: ["example", "similarity", "restatement"] },
    },
    principles: TRANSITION_PRINCIPLES.concat("In a narrative, what an event depends on, and the tense of its verb, fix its order even when no date is given."),
    traps: {
      sequence: "Choosing a word that points back in time, which reverses the order the content requires.",
      prior: "Choosing a word that points forward in time, although the sentence describes what came before the event just mentioned.",
    },
    hint: "Did the event after the blank happen before or after the one before it?",
  });

  const concessionTransition = transitionFamily({
    id: "transition-despite-drawback",
    subskill: "logical transition",
    difficulty: "Medium",
    title: "Transition after a drawback: despite it, or because of it",
    recognize: "The sentence just before the blank states a drawback; the final sentence either holds in spite of it or follows from it. Relate the final sentence to the drawback, not to the advantage that opened the passage.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "opposite-stance"],
    seconds: 70,
    topics: CONCESSION_TOPICS.concat(RESULT_DRAWBACK_TOPICS),
    plans: {
      concession: { neighbour: "result", others: ["example", "addition", "restatement"] },
      result: { neighbour: "concession", others: ["example", "addition", "restatement"] },
    },
    extraStep: "Identify what the sentence immediately before the blank says: a drawback or limitation.",
    principles: TRANSITION_PRINCIPLES.concat("A transition relates its sentence to the one immediately before it."),
    traps: {
      concession: "Choosing a cause-and-effect word because the final sentence follows from the passage's first sentence, skipping the drawback in between.",
      result: "Choosing a concession word by relating the final sentence to the advantage that opened the passage instead of to the drawback just before it.",
    },
    hint: "What does the sentence right before the blank say, and does the final sentence push against it or follow from it?",
  });

  const admissionTransition = transitionFamily({
    id: "transition-concede-then-return",
    subskill: "sentence connection",
    difficulty: "Medium",
    title: "Transition that concedes a weakness or reinforces a claim",
    recognize: "After a cited person's claim, the next sentence either grants a point against it (and the passage then returns to the claim) or confirms the claim with stronger evidence; the transition must signal which.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "opposite-stance"],
    seconds: 70,
    topics: ADMISSION_TOPICS.concat(EMPHASIS_TOPICS),
    // "In fact" can also correct a statement, which a conceded point could be
    // read as doing; "Indeed" only reinforces, so it alone stands for
    // emphasis here, as key and as distractor.
    plans: {
      admission: { neighbour: "emphasis", others: ["result", "example", "similarity"], pools: { emphasis: ["Indeed"] } },
      emphasis: { neighbour: "admission", others: ["result", "contrast", "similarity"], keyPool: ["Indeed"] },
    },
    principles: TRANSITION_PRINCIPLES.concat("Writers often grant a limitation before returning to a claim; words such as \"admittedly\" mark that move, and words such as \"indeed\" mark a confirmation."),
    traps: {
      admission: "Choosing an emphasis word, reading the conceded point as more support for the claim.",
      emphasis: "Choosing a concession word because the sentence follows a claim, although it confirms the claim rather than granting a point against it.",
    },
    hint: "Does the sentence after the blank strengthen the claim, or grant something against it?",
  });

  const restatementTransition = transitionFamily({
    id: "transition-plain-restatement",
    subskill: "logical transition",
    difficulty: "Medium",
    title: "Transition into a restatement or a consequence",
    recognize: "After a technical finding, the final sentence either says the same thing in plainer words (a restatement adds nothing new) or reports something that follows from it (new information).",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 70,
    topics: RESTATEMENT_TOPICS.concat(RESULT_FINDING_TOPICS),
    // "Thus" and "Therefore" can mark an inference, which a restatement can
    // be read as; "As a result" and "Consequently" only mark an effect.
    plans: {
      restatement: { neighbour: "result", others: ["contrast", "similarity", "concession"], pools: { result: ["As a result", "Consequently"] } },
      result: { neighbour: "restatement", others: ["contrast", "similarity", "concession"] },
    },
    principles: TRANSITION_PRINCIPLES.concat("A restatement adds no new information; a consequence does."),
    traps: {
      restatement: "Choosing a cause-and-effect word because the plain version seems to follow from the technical one.",
      result: "Choosing a restatement word because the final sentence is about the same finding, although it reports something new that follows from it.",
    },
    hint: "Does the final sentence tell you anything the previous sentence did not?",
  });

  const elaborationTransition = transitionFamily({
    id: "transition-elaboration-kind",
    subskill: "sentence connection",
    difficulty: "Hard",
    title: "Transition that elaborates: instance, precise account, rewording, or new point",
    recognize: "Every choice carries the passage forward, so polarity decides nothing. Ask how the sentence after the blank relates: one case of a general claim, the exact thing a general statement referred to, the same point in plainer words, or a separate point.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 90,
    topics: ELABORATION_TOPICS,
    // The four relations are always offered together; "That is" is left out
    // because it can also introduce an exact account.
    plans: {
      example: { neighbour: "specification", others: ["restatement", "addition"], pools: { restatement: ["In other words"] } },
      specification: { neighbour: "example", others: ["restatement", "addition"], pools: { restatement: ["In other words"] } },
      restatement: { neighbour: "specification", others: ["example", "addition"], keyPool: ["In other words"] },
      addition: { neighbour: "example", others: ["specification", "restatement"], pools: { restatement: ["In other words"] } },
    },
    principles: TRANSITION_PRINCIPLES.concat(
      "“For example” gives one case among others; “specifically” gives exactly what was meant, all of it; “in other words” says the same thing in plainer terms and adds nothing; “moreover” adds a separate point.",
    ),
    traps: {
      example: "Choosing “specifically” because the sentence is more specific than the claim, although it names only one of the many cases the claim covers.",
      specification: "Choosing “for example” because the sentence gives details, although it gives every item the previous sentence counted, not one case among others.",
      restatement: "Choosing “specifically” because the sentence mentions the same finding, although it is less precise than the one before it, not more.",
      addition: "Choosing an elaborating word because the sentence is about the same subject, although it makes a separate point rather than explaining the first.",
    },
    hint: "Does the sentence give one case, the exact thing meant, the same point again, or a new point?",
  });

  const adversativeTransition = transitionFamily({
    id: "transition-instead-or-despite",
    subskill: "logical transition",
    difficulty: "Hard",
    title: "Transition that turns: replacement, concession, or contrast",
    recognize: "Three choices each turn against the previous sentence, so polarity decides nothing. Ask what kind of turn: something done in place of what was ruled out, something that holds despite an obstacle, or a second subject set against the first.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 90,
    topics: ADVERSATIVE_TOPICS,
    allowNear: true,
    // "However" and "On the other hand" can mark more than one kind of turn,
    // so they are left out; "Still" can be read as "even now".
    plans: {
      replacement: {
        neighbour: "concession", others: ["contrast", "similarity"],
        pools: { concession: ["Nevertheless", "Even so", "Nonetheless"], contrast: ["By contrast", "In contrast"] },
      },
      concession: {
        neighbour: "replacement", others: ["contrast", "similarity"],
        keyPool: ["Nevertheless", "Even so", "Nonetheless"], pools: { contrast: ["By contrast", "In contrast"] },
      },
      contrast: {
        neighbour: "replacement", others: ["concession", "similarity"],
        keyPool: ["By contrast", "In contrast"], pools: { concession: ["Nevertheless", "Even so", "Nonetheless"] },
      },
    },
    principles: TRANSITION_PRINCIPLES.concat(
      "“Instead” and “rather” need something the previous sentence rules out; “nevertheless” needs an obstacle that the sentence overcomes; “by contrast” needs a second subject compared on the same feature.",
    ),
    traps: {
      replacement: "Choosing a concession or contrast word because the sentence turns away from the one before it, although it gives what was done in place of what was ruled out.",
      concession: "Choosing “instead” because the sentence turns against the obstacle, although nothing was ruled out and replaced.",
      contrast: "Choosing “instead” because the second subject behaves differently, although it does not act in place of anything the first sentence rules out.",
    },
    hint: "Did the previous sentence rule something out, raise an obstacle, or describe a first subject?",
  });

  return [
    resultTransition,
    contrastTransition,
    exampleTransition,
    additionTransition,
    similarityTransition,
    sequenceTransition,
    concessionTransition,
    admissionTransition,
    restatementTransition,
    elaborationTransition,
    adversativeTransition,
  ];
});
