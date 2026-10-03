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
      text: "The ecologist Rafael Duarte tracked two kinds of reptiles through a summer in the Keld Desert. The tortoises he followed spent most of the hottest weeks sealed in deep burrows. ______, the zebra-tailed lizards he followed stayed active on the surface all summer, dashing across open sand even on the hottest days.",
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
      why: "Bell kept few written records and relied on memory, whereas Okafor recorded every test carefully; the final sentence contrasts the two partners' approaches.",
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
      text: "The astronomer Lotte Aasen cataloged more than three thousand variable stars during her forty years at the Skarvik Observatory. Her catalog remains a standard reference for researchers who study how such stars brighten and dim. ______, she designed a small, inexpensive telescope mount that amateur astronomers across Ardel used for decades.",
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
      text: "The Ostby rowing club trains only in sheltered coves, where the water remains calm even on windy days. ______, the Varne club across the bay trains beyond the breakwater, where its rowers must contend with large waves.",
      why: "The clubs train in opposite water conditions: Ostby chooses calm, sheltered water, while Varne practices among large waves. The shared activity of rowing does not make those conditions parallel.",
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

  // Medium: distinguish a paraphrase, an implication, an illustration, and
  // independent evidence while preserving the claim's scope. Each scene
  // contains a tempting nearby detail or competing interpretation.
  const ELABORATION_TOPICS = [
    {
      scene: "eoi-elb-rail-walkways",
      relation: "example",
      text: "Preserving a structure's form need not preserve the activity it was built for. Transport historian Ada Kell distinguishes that kind of reuse from restoration, in which both form and activity survive. An intact railway bridge can therefore belong to either category; its appearance alone will not decide the matter. ______, Ostby's former freight bridge retains its original rails and girders but now carries only pedestrians through a linear park.",
      why: "Ostby's bridge illustrates the opening distinction: its form survives while its activity changes. The preceding sentence only says that appearance cannot settle the classification; it does not cause the conversion, and the example adds information rather than rewording it.",
    },
    {
      scene: "eoi-elb-seed-libraries",
      relation: "example",
      text: "A loan normally ends with the return of the object borrowed. Some lending programs instead preserve a resource by requiring the return of an equivalent that did not exist when the loan began. This arrangement depends on borrowers producing replacements, not merely keeping the original objects undamaged. ______, Kell's seed library gives gardeners seeds to plant and accepts seeds from the resulting plants at the end of the season.",
      why: "The seed library is a concrete case of returning newly produced equivalents. It illustrates the general arrangement across the earlier sentences; it is neither a consequence of that description nor a paraphrase of it.",
    },
    {
      scene: "eoi-elb-night-flowers",
      relation: "example",
      text: "Biologist Mara Lune cautions that the time when a flower opens does not, by itself, identify the animal that pollinates it. A visitor may take nectar without touching the parts that transfer pollen, whereas a less conspicuous visitor may do most of the pollination. ______, one flower in Lune's study opened at dusk and attracted many moths, yet exclusion experiments showed that bees arriving the following morning transferred nearly all its pollen.",
      why: "The experiment gives a case in which opening time and conspicuous visits misidentify the pollinator. That illustrates the opening caution and the distinction developed after it; the general caution did not cause the experimental result.",
    },
    {
      scene: "eoi-elb-catalog-entries",
      relation: "result",
      text: "The number of entries in the Varne printing catalog doubled between its first and second editions. Historian Ines Moll initially treated that increase as evidence that more titles had been published. The first edition, however, assigned one entry to each title, while the second assigned a separate entry to every reprinting of a title. ______, the increase cannot establish growth in the number of distinct titles without a count that treats reprintings consistently.",
      why: "The final sentence draws a new methodological conclusion from the two different counting rules. It does not merely restate the doubled count or give one example of a reprinting.",
    },
    {
      scene: "eoi-elb-reservoir-gates",
      relation: "result",
      text: "The gate schedule at the Holm reservoir was designed to keep the downstream river above a specified level. Operators used measurements from a gauge beside the dam to decide when to release water. A new survey showed that a diversion between that gauge and the farms removed a substantial share of the released water. ______, meeting the target at the dam did not guarantee that the target was met beside the farms.",
      why: "The conclusion combines the gauge's location with the intervening diversion. It adds an implication about what the measurements can establish, rather than restating the survey or adding an unrelated point.",
    },
    {
      scene: "eoi-elb-archive-silence",
      relation: "result",
      text: "Historian Omar Venn found no letters opposing the new harbor tax in a council archive and initially described the tax as uncontroversial. He then learned that clerks had filed supportive letters with the council minutes but forwarded objections to a separate appeals office. That office's records no longer survive. ______, the council archive's silence about opposition offers little basis for judging how widely the tax was accepted.",
      why: "The conclusion follows from the selective filing rule together with the loss of the other records. It goes beyond either fact alone; it is neither a restatement of the missing records nor an example of an objection.",
    },
    {
      scene: "eoi-elb-eelgrass-density",
      relation: "restatement",
      text: "The average density of eelgrass in the Holm Estuary fell from 812 shoots per square meter in 2005 to 398 in 2020. Ecologists warned that thinner growth offers young fish less protection from predators, so the change could affect fish survival even without a loss of habitat area. Mapping conducted alongside the density survey found no change in the total area occupied by eelgrass. ______, the plants still covered as much ground as before, but within that ground their shoots were only about half as closely packed.",
      why: "The final sentence combines the unchanged area from the mapping with the earlier decline in density. It restates those measurements, rather than reporting the possible effect on fish survival discussed between them.",
    },
    {
      scene: "eoi-elb-bus-survey",
      relation: "result",
      keyPool: ["Therefore", "Thus"],
      text: "In a survey of 1,200 Harlow residents, 71 percent said they would commute by bus if the proposed new stops were within a ten-minute walk of home. Supporters of the expansion described all of these willing respondents as potential additions to current ridership. A separate question found that 63 percent of the same respondents already commuted by bus, but the published report did not match individuals' responses to the two questions. ______, some willing respondents must already be bus commuters, so counting all willing respondents as additional riders would overstate the expansion's potential gain.",
      why: "The willing group and the current-rider group together exceed 100 percent of the same respondents, so they must overlap even without matched responses. That inference limits the claim about additional riders; it adds a conclusion rather than restating either percentage.",
    },
    {
      scene: "eoi-elb-bicycle-households",
      relation: "restatement",
      text: "Ostby's travel survey counted a household as having bicycle access if a member could use either a household bicycle or one borrowed regularly. Of 1,500 households surveyed, 1,140 owned bicycles. A retailers' association proposed using the survey's access figures to describe the ownership market. Yet a further 210 households had access through borrowing without owning any bicycle themselves. ______, the access category combined owners with borrowers, whereas the ownership category included only the former.",
      why: "The final sentence restates the two categories by combining the survey's definition with the two groups reported separately. It resists the retailers' intervening interpretation instead of deriving a market prediction from it.",
    },
    {
      scene: "eoi-elb-orchard-flowers",
      relation: "addition",
      text: "Orchard researchers separated two possible benefits of planting wildflowers: attracting pollinators and preventing soil loss. Orchards with more flowers received more bee visits and produced more fruit, a result the researchers linked to pollination. ______, plots protected by mesh that excluded all visiting insects lost less soil when planted with wildflowers than when left bare, supporting a benefit that did not depend on bee visits.",
      why: "The mesh trial supplies evidence for the second proposed benefit. Its exclusion of insects rules out treating the soil result as a consequence, example, or rewording of increased pollination.",
    },
    {
      scene: "eoi-elb-digital-archive",
      relation: "addition",
      text: "Digitizing the Varne newspaper allowed readers to search its text remotely, so requests to handle the original volumes fell sharply. That reduced handling, in turn, slowed damage to the brittle pages. ______, the archive's catalog now permits searches across alternate spellings of names, a feature that would assist researchers even if they still consulted the originals afterward.",
      why: "The final sentence returns to a separate benefit of the digital catalog. Spelling searches are not caused by the reduction in physical damage, and they neither exemplify nor restate that preservation benefit.",
    },
    {
      scene: "eoi-elb-library-laptops",
      relation: "addition",
      text: "The Varden Library lends laptops and offers evening computer classes. An evaluation found that borrowers completed more online applications after receiving a laptop; it attributed the gain to reliable access at home. ______, class participants who already owned computers became more successful at detecting fraudulent messages, indicating a gain that the lending program's explanation did not account for.",
      why: "The evaluation reports another benefit, this time of instruction among people who already had access. It does not present the skill gain as a result of borrowing a laptop or as the access finding restated.",
    },
  ];

  // Medium: adversative passages whose choices include three words that each
  // turn against what came before, plus a word for a parallel case.
  // `replacement` gives what was done in place of something the previous
  // sentence rules out; `concession` states what holds despite an obstacle;
  // `contrast` sets a second subject against the first; `similarity` gives a
  // second subject that behaves like the first. A negation in the sentence
  // before the blank ("not", "no", "few") appears under every relation, so it
  // never signals "Instead", and some replacements rule their first option
  // out without one ("voted down", "dropped", "called off"). Most passages
  // open with a sentence of context, so the relation must be found inside a
  // short argument rather than between two bare sentences.
  const ADVERSATIVE_TOPICS = [
    {
      scene: "eoi-adv-unused-guides",
      relation: "replacement",
      text: "Many museums have added digital guides in the hope of holding visitors' attention for longer. The Tarn Museum expected its visitors to rely on the touch-screen guides it installed in 2022, but few visitors used them. ______, most people moved through the galleries reading the printed labels and talking with one another.",
      why: "Reading labels and talking is what visitors did in place of using the guides, which the previous sentence rules out; nothing holds despite an obstacle, and no second subject is compared.",
    },
    {
      scene: "eoi-adv-library-garage",
      relation: "replacement",
      text: "Residents had asked the Harlow city council for a parking garage beside the new public library, and an architect drew up plans for one. In March the council voted the proposal down, citing its cost. ______, the council extended two bus routes so that both now stop at the library's front entrance.",
      why: "Extending the bus routes is what the council did in place of the garage it voted down; nothing holds despite an obstacle, and no second subject is compared or likened to the first.",
    },
    {
      scene: "eoi-adv-market-roof",
      relation: "replacement",
      text: "The architects of the Kell market hall first planned a roof of glass panels that would let daylight reach every stall. Engineers warned that the panels would crack under the region's heavy snow, and the design was dropped. ______, the hall was given a steep timber roof pierced by a row of narrow skylights.",
      why: "The timber roof is what the hall received in place of the glass roof that was dropped; nothing holds in spite of the engineers' warning, and no second building is compared.",
    },
    {
      scene: "eoi-adv-glacier-detour",
      relation: "replacement",
      text: "The survey team had planned to cross the Sorn Glacier on foot to reach the ridge beyond it, but a week of warm weather opened crevasses across the glacier's entire width. The crossing was called off. ______, the team hiked the long way around the glacier's snout, a detour that added three days to the expedition.",
      why: "The detour is the route the team took in place of the crossing that was called off; calling off the crossing made a detour expected, not something that happened despite it, and no second team is compared.",
    },
    {
      scene: "eoi-adv-ground-pigments",
      relation: "replacement",
      text: "Most painters today work with paints that manufacturers have already mixed, ground, and packed into tubes. The painter Odile Brask does not buy tubes of prepared paint. ______, she grinds her own pigments from minerals she collects on hikes near her studio.",
      why: "Grinding her own pigments is what Brask does in place of buying prepared paint, which the previous sentence rules out.",
    },
    {
      scene: "eoi-adv-walking-composer",
      relation: "replacement",
      text: "Most composers of orchestral music work out their scores at a keyboard, testing each chord as they write. The composer Lise Aro does not write her music at a piano. ______, she composes while walking, singing melodies into a small recorder and transcribing them each evening.",
      why: "Composing while walking is what Aro does in place of writing at a piano, which the previous sentence rules out.",
    },
    {
      scene: "eoi-adv-reinforced-bridge",
      relation: "replacement",
      text: "The Varne Footbridge, completed in 1889, is one of the last iron bridges of its kind in the region that are open to the public. After a long debate, the city's engineers decided not to replace the corroded bridge. ______, they reinforced its original iron frame with steel cables, preserving the bridge's nineteenth-century design.",
      why: "Reinforcing the old frame is what the engineers did in place of replacing the bridge, which the previous sentence rules out.",
    },
    {
      scene: "eoi-adv-foggy-regatta",
      relation: "concession",
      text: "The Holm regatta, held each June since 1904, sends boats around a course marked by buoys set nearly a kilometer apart. Thick fog covered the harbor on the morning of the 2019 race, hiding the course markers from the sailors' view. ______, all twenty-two boats finished the race, and three crews set new course records.",
      why: "The boats finished, and some set records, despite the fog described in the previous sentence; nothing was ruled out and replaced, and no second subject is compared.",
    },
    {
      scene: "eoi-adv-budget-season",
      relation: "concession",
      text: "The Harlow Theater has staged new work by local playwrights since it opened in 1962. Its budget was cut by a third in 2020, forcing the company to reduce its staff. ______, the theater staged six new plays that season, more than in any earlier year.",
      why: "The theater staged a record number of plays despite the budget cut, so the sentence states what held in spite of an obstacle.",
    },
    {
      scene: "eoi-adv-ankle-final",
      relation: "concession",
      text: "Lena Ruud had been favored to win the 200 meters since setting a national junior record two years earlier. Three weeks before the national championships, she injured her ankle and could barely train for ten days. ______, she won the 200-meter final in the fastest time of her career.",
      why: "Ruud won despite her injury, so the sentence states what held in spite of an obstacle.",
    },
    {
      scene: "eoi-adv-plateau-barley",
      relation: "concession",
      text: "The Keld Plateau rises nearly a thousand meters above the surrounding lowlands. Its soil is thin, rocky, and low in nutrients. ______, farmers there have grown barley successfully for more than eight hundred years.",
      why: "Farmers have grown barley for centuries despite the poor soil, so the sentence states what holds in spite of an obstacle.",
    },
    {
      scene: "eoi-adv-unheated-hall",
      relation: "concession",
      text: "The choir of Senna, founded in 1880, had never missed a spring concert. Varne Hall, the only building in Senna large enough for a choir, had no heating, and in January the air inside rarely rose above 5°C. ______, the village choir rehearsed there every Tuesday evening that winter and gave its spring concert on schedule.",
      why: "The choir kept rehearsing despite the cold hall; the \"no heating\" before the blank rules nothing out that the rehearsals replace, and no second subject is compared.",
    },
    {
      scene: "eoi-adv-unpaved-road",
      relation: "concession",
      text: "Asker's dairies depended on markets in the valley towns, a day's journey below the village. As late as 1925, the road to the mountain village of Asker was not paved, and the spring rains turned it to deep mud for weeks at a time. ______, cheese from Asker's dairies reached the markets in the valley every week of the year.",
      why: "The cheese reached market despite the muddy road, so the sentence states what held in spite of an obstacle; the \"not\" names the obstacle, not something replaced.",
    },
    {
      scene: "eoi-adv-new-symphony",
      relation: "concession",
      text: "The Ostby orchestra is known chiefly for its performances of eighteenth-century music. Few of its players had ever performed music written after 1950, and the parts for Ada Lenz's new symphony arrived only nine days before its premiere. ______, the orchestra's performance drew praise from critics and from Lenz herself.",
      why: "The performance succeeded despite the players' inexperience and the short preparation, so the sentence states what held in spite of those obstacles.",
    },
    {
      scene: "eoi-adv-desert-rainfall",
      relation: "contrast",
      text: "Deserts are defined by how little rain they receive, but that amount varies enormously from one desert to another. Parts of the Atacama Desert in Chile receive less than a millimeter of rain in a typical year. ______, the wettest parts of the Sonoran Desert in North America receive around 400 millimeters a year, enough to support forests of tall saguaro cacti.",
      why: "The sentence sets a second desert against the first on the same measure, rainfall; it does not describe something done in place of something ruled out or something that holds despite an obstacle.",
    },
    {
      scene: "eoi-adv-bridge-spans",
      relation: "contrast",
      text: "Two road bridges, built nearly eighty years apart, cross the Varne River less than a kilometer from each other. The main span of the Ostby Bridge stretches 900 meters between its two towers. ______, the older Varne Bridge upstream crosses the river on a series of short stone arches, none longer than 60 meters.",
      why: "The sentence sets a second bridge against the first on the same measure, the length of its spans.",
    },
    {
      scene: "eoi-adv-violin-strings",
      relation: "contrast",
      text: "The material of a violin's strings shapes its tone as much as the wood of its body does. Most violin strings made today have a core of steel or of synthetic fibers such as nylon. ______, the strings used by eighteenth-century violinists were made of sheep gut, which gives a softer, warmer tone.",
      why: "The sentence sets the strings of a second period against today's on the same feature, what the strings are made of.",
    },
    {
      scene: "eoi-adv-cicada-cycles",
      relation: "contrast",
      text: "Cicadas spend most of their lives underground as nymphs, feeding on sap from tree roots before they emerge to breed. Many species of cicada in North America produce a new generation of adults every summer. ______, periodical cicadas spend thirteen or seventeen years underground and then emerge together by the millions.",
      why: "The sentence sets a second group of cicadas against the first on the same feature, how often adults appear.",
    },
    {
      scene: "eoi-adv-two-archives",
      relation: "contrast",
      text: "The Harlow city archive has scanned nearly all of its nineteenth-century records, and researchers anywhere in the world can search them online at no charge. ______, the archive in neighboring Kell has scanned almost nothing, and anyone who wants to consult its records must travel there and read them in person.",
      why: "The sentence sets a second archive against the first on the same feature, how its records can be consulted; the Kell archive does nothing in place of something ruled out.",
    },
    {
      scene: "eoi-adv-hand-bound-books",
      relation: "similarity",
      text: "The bookbinder Ottilie Marsh does not use glue in her work; she sews the pages of every book by hand with waxed linen thread. ______, the binders at the monastery of Saint Kell, whose workshop dates to the 1400s, stitch each volume by hand and use no adhesive of any kind.",
      why: "The monastery's binders work the same way Marsh does, so the sentence gives a parallel case; the \"not\" before the blank belongs to Marsh, and the monks do nothing in place of anything she avoids.",
    },
    {
      scene: "eoi-adv-quiet-trains",
      relation: "similarity",
      text: "In Ostby, no train may sound its horn inside the city after ten at night, a rule adopted after years of complaints from people living near the tracks. ______, the neighboring city of Harlow bars trains from sounding their horns anywhere within its limits between ten at night and six in the morning.",
      why: "Harlow has the same kind of rule as Ostby, so the sentence gives a parallel case rather than a contrast, a replacement, or something that holds despite an obstacle.",
    },
    {
      scene: "eoi-adv-late-bees",
      relation: "similarity",
      text: "Orchard owners in the Tarn Valley depend on bees to pollinate their apple blossoms, which open in early April. Few bumblebees visit the valley's orchards before the middle of April, when nights there finally stay above freezing. ______, honeybees kept in the valley rarely leave their hives before mid-April, waiting for the same warmer nights.",
      why: "The honeybees behave just as the bumblebees do, so the sentence gives a parallel case; \"few\" describes the bumblebees, not something the honeybees replace.",
    },
    {
      scene: "eoi-adv-woodcut-seals",
      relation: "similarity",
      text: "The printmaker Jun Ito never writes his name on his woodcuts; he signs each one by pressing a small red seal into its lower corner. ______, members of the print studio he founded mark their work with seals of their own, each carved with the artist's initials.",
      why: "The studio's members sign their prints the same way Ito does, so the sentence gives a parallel case; \"never\" belongs to Ito's own practice, and nothing the members do replaces it.",
    },
    {
      scene: "eoi-adv-map-room",
      relation: "similarity",
      text: "The Varden Library's collections include some of the oldest surviving charts of the northern coast. Visitors to its main reading room may not speak above a whisper, and phones must be switched off at the door. ______, the library's map room requires silence and bans phones, so that researchers can study its fragile charts undisturbed.",
      why: "The map room follows the same rules as the reading room, so the sentence gives a parallel case rather than a contrast or a replacement.",
    },
  ];

  // Hard: track competing interpretations, limited claims, and causal
  // chains across the passage. The nearest sentence alone can suggest the
  // wrong link. keyPool restricts words to the relation the scene supports.
  const ARGUMENT_TOPICS = [
    {
      scene: "eoi-arg-orne-platforms",
      relation: "result",
      text: "Orne's council rejected a flood barrier after engineers estimated that it would redirect water toward unprotected houses. A later report found that raising the houses themselves would avoid that problem, but only if neighboring houses were raised together; isolated platforms would still divert water onto lower plots. ______, the council's revised proposal funds groups of adjoining houses, rather than individual owners applying separately.",
      why: "The grouped funding responds to the condition in the later report. Reading only the initial rejection could suggest a concession, but the proposal follows from the distinction between coordinated and isolated raising.",
      keyPool: ["Accordingly"],
    },
    {
      scene: "eoi-arg-wolves-willows",
      relation: "result",
      text: "After wolves returned to the Harrow Valley, elk avoided exposed riverbanks and willows grew taller there. Ecologists initially linked the return of beavers directly to the wolves. Later observations showed that beavers returned only to streams where the recovering willows supplied enough building material, including streams the wolves rarely visited. ______, the willows' recovery, itself aided by changed elk behavior, enabled the beavers to rebuild their dams.",
      why: "The final sentence locates the next effect in the supported chain: elk behavior permits willow recovery, which enables dam building. The intermediate evidence limits a direct wolf explanation; it does not oppose the willow explanation.",
      keyPool: ["In turn", "Consequently"],
    },
    {
      scene: "eoi-arg-shade-coffee",
      relation: "contrast",
      text: "On the Sollano plateau, extra shade slowed the ripening of coffee berries, allowing their beans to develop more sugars. Agronomists studying those trials therefore recommended shade planting to Sollano's growers. ______, in separate trials on the colder Keld plateau, where ripening was already slow, extra shade reduced sweetness by delaying ripening until after the first frost, when growers had to pick the berries regardless of maturity.",
      why: "The final sentence contrasts the adverse result in Keld with the favorable result underlying the Sollano recommendation. Sollano's recommendation did not cause the outcome of the separate Keld trials; the two starting climates explain why the same intervention had opposing effects.",
      keyPool: ["By contrast", "In contrast"],
    },
    {
      scene: "eoi-arg-glass-secrets",
      relation: "contrast",
      text: "Vell's glassmakers published recipes that listed every ingredient, but omitted the heating schedules that made those ingredients usable. Their apparent openness therefore left outsiders unable to reproduce the glass. ______, Asker's potters, despite keeping their recipes private, allowed visitors to observe every stage of firing, so outsiders could reproduce their glazes without a written formula.",
      why: "The final sentence contrasts reproducibility in Asker with the failure in Vell. Publishing recipes concealed Vell's process, while keeping recipes private did not conceal Asker's; the apparent openness of each group would suggest the reverse comparison.",
      keyPool: ["By contrast", "In contrast"],
    },
    {
      scene: "eoi-arg-bay-bridge",
      relation: "concession",
      text: "The Holm bridge shortened the trip to the city and brought more weekend shoppers to the harbor towns. A report praising those gains counted spending at harbor shops but excluded businesses beside the old ferry terminals. Losses near the terminals mean the report cannot establish a gain for the area as a whole. ______, its figures still establish a gain for the harbor shops it counted, even though that narrower finding cannot settle the wider question.",
      why: "The final sentence retains the narrower finding despite the limitation on the area-wide claim. It concedes the report's restricted scope without discarding the evidence it actually contains; the missing businesses do not cause the measured gains.",
      keyPool: ["That said"],
    },
    {
      scene: "eoi-arg-rejected-novel",
      relation: "concession",
      text: "Eleven publishers rejected Tomas Vey's novel because they expected a story narrated by a lighthouse to attract few readers. When a small press published it, the first printing sold out in a month. That printing contained only two hundred copies, a detail Vey's biographer cautions against overlooking. ______, even this limited response was enough to persuade the press to commission a second novel, an opportunity the earlier rejections had denied him.",
      why: "The sentence preserves a meaningful success despite the caution about the tiny printing. It turns against the limitation's force without denying it; it neither restates the small number nor contrasts a different novelist.",
      keyPool: ["Even so", "Nonetheless"],
    },
    {
      scene: "eoi-arg-sleeper-trains",
      relation: "admission",
      text: "Planner Ada Lune argues that a sleeper route can compete with flights when travelers compare the cost of the entire journey. Her comparison includes airport transfers and a hotel night, expenses omitted from an advertised airfare. ______, the train ticket itself costs more than that airfare. Once the omitted expenses are restored, however, Lune's example makes the train the less costly journey.",
      why: "The ticket comparison grants a point that appears to count against Lune before the final sentence restores her full-cost argument. It does not extend her favorable evidence or follow as a result of adding the omitted costs.",
      keyPool: ["Granted", "Admittedly"],
    },
    {
      scene: "eoi-arg-strike-interviews",
      relation: "admission",
      text: "Historian Ines Lott relies on interviews to explain why workers joined the Varne strike, while using payroll records to establish when they stopped work. Her critics regard any disagreement with the payrolls as fatal to her whole account. ______, some interviewees give dates that contradict those records, making their memories unreliable as a calendar. Lott's account of motives, however, rests on shared descriptions of working conditions rather than on the disputed dates.",
      why: "The sentence grants the critics' limited objection before the passage distinguishes that objection from Lott's use of the interviews. It is an admission within the argument, not additional support for treating the interviews as a calendar.",
      keyPool: ["Granted", "Admittedly"],
    },
    {
      scene: "eoi-arg-planted-roofs",
      relation: "addition",
      text: "The Ostby roof trial found that planted roofs kept rooms cooler, reducing use of air conditioners. Lower electricity demand then reduced the heat released by those machines into the street. ______, planted roofs in unoccupied buildings also delayed storm runoff, showing that the plants offered a benefit even where neither cooling demand nor air-conditioner exhaust could have changed.",
      why: "The runoff finding adds an independent benefit after a chain of cooling effects. The unoccupied buildings make it untenable to treat that benefit as the next effect of reduced air-conditioner use.",
      keyPool: ["Furthermore", "Moreover", "In addition"],
    },
    {
      scene: "eoi-arg-ring-scars",
      relation: "addition",
      text: "Tree-ring widths helped researchers reconstruct droughts in the Tarn Valley, and those drought dates explained why harvest records showed several years of low yields. ______, scars within the same rings dated fires that occurred during wet years as well as dry ones, allowing the team to identify another source of losses that the drought reconstruction alone would miss.",
      why: "The scars contribute a separate kind of evidence, including losses outside drought years. Their dates neither follow from the width-based reconstruction nor reverse it; they extend what the combined record can explain.",
      keyPool: ["Furthermore", "Moreover", "In addition"],
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
  // Less common words, offered only where a template names them in its
  // pools, so templates that draw on LEXICON never meet them. "Accordingly"
  // introduces an action taken in light of what came before, "In turn" the
  // next link in a chain of effects, "Conversely" the reverse case, and
  // "That said" a reservation about what was just said.
  const WIDER = {
    result: ["Accordingly", "In turn"],
    contrast: ["Conversely"],
    concession: ["That said"],
  };
  const RELATION_OF = new Map();
  [LEXICON, WIDER].forEach((lexicon) => Object.entries(lexicon).forEach(([relation, phrases]) =>
    phrases.forEach((phrase) => RELATION_OF.set(phrase, relation)),
  ));

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
    result: "present the sentence as a consequence of earlier information",
    contrast: "set the sentence against the previous one as a contrasting case",
    concession: "present the sentence as something that holds despite an earlier point",
    example: "present the sentence as one instance of a general claim before it",
    addition: "add the sentence as a separate point in the same direction",
    similarity: "present the sentence as a separate, parallel case",
    sequence: "place this event after the one just described",
    prior: "place this event before the one just described",
    restatement: "present the sentence as earlier information restated",
    admission: "present the sentence as a point granted against the claim",
    emphasis: "present the sentence as reinforcing the claim before it",
    specification: "present the sentence as exactly what the previous one referred to",
    replacement: "present the sentence as what was done in place of something ruled out",
  };
  const DOES = {
    result: "states a consequence of relevant earlier information",
    contrast: "describes a second subject that differs from the first",
    concession: "states something that holds in spite of a relevant earlier point",
    example: "gives one instance of the general claim before it",
    addition: "adds a separate point in the same direction",
    similarity: "describes a separate case that is like the first",
    sequence: "describes an event that came after the one before it",
    prior: "describes something that came before the event just described",
    restatement: "restates the relevant earlier information in plainer words",
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
        // A topic may narrow the key to the words that suit its passage
        // ("In turn" only where the sentence before is itself an effect).
        const keyPool = topic.keyPool || plan.keyPool;
        // A phrase already used in the passage ("still commissions") is not
        // offered as the key.
        const keyPhrase = t.pick((keyPool || LEXICON[topic.relation])
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
            `Identify the relevant link in the passage: this sentence ${DOES[topic.relation]}.`,
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
            (!keyPool || keyPool.includes(instance.correct)) &&
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
    principles: TRANSITION_PRINCIPLES.concat("Here, the immediately preceding drawback supplies the relevant link; do not skip it for the opening advantage."),
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
    // emphasis here, as key and as distractor. Beside the short key
    // "Indeed", every emphasis set offers a word at least as short ("Thus"
    // or "Still"), so the key is never picked out as the shortest choice.
    plans: {
      admission: { neighbour: "emphasis", others: ["result", "example", "similarity"], pools: { emphasis: ["Indeed"] } },
      emphasis: {
        neighbour: "admission", others: ["result", "concession", "similarity"], keyPool: ["Indeed"],
        pools: { result: ["Thus"], concession: ["Still"] },
      },
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

  // Recalibrated to Medium on 2026-10-03: six example/addition scenes can
  // be solved from their adjacent sentences. The stronger inference and
  // restatement scenes do not establish Hard demand throughout this pool.
  const elaborationTransition = transitionFamily({
    id: "transition-elaboration-kind",
    subskill: "sentence connection",
    difficulty: "Medium",
    title: "Transition that preserves scope across an explanation",
    recognize: "Track the claim, its scope, and any intervening qualification. Decide whether the final sentence illustrates that claim, preserves it in a paraphrase, derives a new implication, or adds evidence for a different claim.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 100,
    topics: ELABORATION_TOPICS,
    // Specifically can also introduce an example. Do not make those two
    // words compete on a false rule that specificity requires an exhaustive list.
    plans: {
      example: { neighbour: "result", others: ["restatement", "addition"], pools: { restatement: ["In other words"] } },
      result: { neighbour: "restatement", others: ["example", "addition"], pools: { restatement: ["In other words"] } },
      // Inferential summaries can also follow "Thus" or "Therefore"; only
      // effect phrases make a defensible competing result category here.
      restatement: { neighbour: "result", others: ["example", "addition"], keyPool: ["In other words"], pools: { result: ["As a result", "Consequently"] } },
      addition: { neighbour: "result", others: ["example", "restatement"], pools: { restatement: ["In other words"] } },
    },
    extraStep: "Trace the claim through the whole passage, preserving its population, conditions, and measured quantity; an intervening detail may not be the final sentence's target.",
    principles: TRANSITION_PRINCIPLES.concat(
      "A paraphrase preserves a claim's scope; an implication adds something that follows from it; an example illustrates it; an additional point makes a separate claim.",
      "A shared subject does not establish cause and effect, and a statement about survey respondents is not automatically a statement about an entire population.",
    ),
    traps: {
      example: "Treating a concrete illustration as a consequence of the abstract claim it illustrates.",
      result: "Calling a conclusion a restatement even though it combines separate facts to establish something new.",
      restatement: "Mistaking a careful paraphrase for a new consequence, or overlooking the population and conditions it preserves.",
      addition: "Extending the preceding causal chain to a separate finding that the stated conditions distinguish from it.",
    },
    hint: "Which earlier claim is the last sentence working with, and does it illustrate, rephrase, extend, or draw an implication from that claim?",
  });

  const adversativeTransition = transitionFamily({
    id: "transition-instead-or-despite",
    subskill: "logical transition",
    difficulty: "Medium",
    title: "Transition after a turn or a negation: replacement, concession, contrast, or parallel",
    recognize: "Every set offers a replacement word, a concession word, a contrast word, and a word for a parallel case, and a negation before the blank can belong to any of them. Ask what the sentence does: gives what was done in place of what was ruled out, states what holds despite an obstacle, sets a second subject against the first, or shows a second subject behaving like the first.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 90,
    topics: ADVERSATIVE_TOPICS,
    allowNear: true,
    // "However" and "On the other hand" can mark more than one kind of turn,
    // so they are left out; "Still" can be read as "even now". Every set
    // holds one word from each of the four relations.
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
      similarity: {
        neighbour: "replacement", others: ["concession", "contrast"],
        pools: { concession: ["Nevertheless", "Even so", "Nonetheless"], contrast: ["By contrast", "In contrast"] },
      },
    },
    principles: TRANSITION_PRINCIPLES.concat(
      "“Instead” and “rather” need something the previous sentence rules out; “nevertheless” needs an obstacle that the sentence overcomes; “by contrast” needs a second subject compared on the same feature; “likewise” needs a second subject that behaves like the first.",
      "A negation (“not,” “no,” “few”) before the blank does not by itself call for “instead”: ask whose negation it is and what the next sentence does with it.",
    ),
    traps: {
      replacement: "Choosing a concession or contrast word because the sentence turns away from the one before it, although it gives what was done in place of what was ruled out.",
      concession: "Choosing “instead” because the sentence before the blank contains a negation or an obstacle, although nothing was ruled out and replaced.",
      contrast: "Choosing “instead” because the second subject behaves differently, although it does not act in place of anything the first sentence rules out.",
      similarity: "Choosing “instead” because the first sentence says what one subject does not do, although the second subject avoids the same thing rather than replacing it.",
    },
    hint: "Did the previous sentence rule something out, raise an obstacle, or describe a first subject, and does the new sentence act in place of it, despite it, against it, or like it?",
  });

  // Every relation's distractors come from the same wider pools, so each of
  // the less common words is sometimes the key and sometimes wrong.
  const ARGUMENT_POOLS = {
    result: ["Accordingly", "In turn", "Consequently"],
    contrast: ["By contrast", "In contrast"],
    concession: ["That said", "Nonetheless", "Even so"],
    admission: ["Granted", "Admittedly"],
    addition: ["Furthermore", "Moreover", "In addition"],
  };

  const argumentTransition = transitionFamily({
    id: "transition-across-sentences",
    subskill: "logical transition",
    difficulty: "Hard",
    title: "Transition that places a sentence in a multi-sentence argument",
    recognize: "The blank's relation is to the argument built over two or three sentences, and the choices include words for consequences, comparisons, qualifications, concessions, and additions. Decide what the sentence does in that argument, then find the word that says exactly that.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 95,
    topics: ARGUMENT_TOPICS,
    allowNear: true,
    extraStep: "Separate the author's conclusion from an objection or an intermediate effect, then identify which part the new sentence answers.",
    // A concession word and an admission word are never offered together,
    // since "That said" could introduce a granted point; each set is fixed by
    // the key's relation, and only the words within it vary.
    plans: {
      result: { neighbour: "concession", others: ["contrast", "addition"], pools: ARGUMENT_POOLS },
      contrast: { neighbour: "concession", others: ["result", "addition"], pools: ARGUMENT_POOLS },
      concession: { neighbour: "contrast", others: ["result", "addition"], pools: ARGUMENT_POOLS },
      admission: { neighbour: "addition", others: ["result", "contrast"], keyPool: ARGUMENT_POOLS.admission, pools: ARGUMENT_POOLS },
      addition: { neighbour: "result", others: ["contrast", "admission"], keyPool: ARGUMENT_POOLS.addition, pools: ARGUMENT_POOLS },
    },
    principles: TRANSITION_PRINCIPLES.concat(
      "“Accordingly” introduces an action taken in light of what came before; “in turn,” the next link in a chain of effects; “conversely,” the reverse case; “that said,” a reservation about what was just said; “granted,” a point conceded before the argument resumes.",
      "When a passage builds an argument over several sentences, relate the blank to that argument, not only to the words just before it.",
    ),
    traps: {
      result: "Choosing a word for a turn, a concession or a contrast, although the new sentence follows from what came before: it is a consequence or a response, not something that holds despite it.",
      contrast: "Choosing a concession word because the sentence turns to an opposite case, although nothing in it holds despite an obstacle.",
      concession: "Choosing a contrast word because the sentence turns against what came before, although it qualifies the same subject rather than setting a second subject against it.",
      admission: "Choosing an addition word, reading the granted weakness as more support for the claim, although the passage turns back to answer it.",
      addition: "Choosing a cause-and-effect word because the new benefit sits next to the previous one, although it does not follow from it.",
    },
    hint: "Summarize the argument so far in a few words. Does the new sentence respond to it, reverse it, qualify it, grant something against it, or extend it?",
  });

  // Hard: compare cases on the population, interval, or criterion the writer
  // actually selected. Quoted verdicts concern another scope and can point
  // in the opposite direction. These are comparisons between independent
  // cases, not a general claim followed by an example or a causal sequence.
  const REFERENCE_SCOPE_TOPICS = [
    {
      scene: "eoi-scope-choir-returners",
      relation: "similarity",
      text: "Mara Pell evaluated the Leston youth choir's mentoring program by whether singers eligible for another year chose to return. Every such singer reenrolled, although the departure of an unusually large graduating class lowered total membership and prompted a newspaper to call the program a failure. ______, with respect to Pell's measure, the only names removed from the Varo choir's previous membership list belonged to singers who had reached its age limit, a fact obscured by praise focused on its large intake of beginners.",
      why: "Pell's criterion is retention among eligible returning singers. Neither choir lost anyone in that group, although the membership headlines point in opposite directions because they include graduates or beginners. Varo is a separate parallel case, not an instance of a claim about Leston or an effect of Leston's mentoring.",
    },
    {
      scene: "eoi-scope-greenhouse-nights",
      relation: "similarity",
      text: "In comparing two greenhouse covers, researcher Anja Voss considered only whether seedlings remained above freezing between sunset and sunrise. Under the clear cover, they spent two hours below freezing each night, although hot afternoons led the supplier to advertise a warming effect. ______, during Voss's chosen interval, seedlings under the tinted cover dropped below freezing two hours before sunrise and stayed there until the sun rose, despite publicity describing its lower daytime average as a cooling effect.",
      why: "The covers have the same outcome during the nighttime interval Voss selected: neither prevents two hours below freezing. The advertised warming and cooling effects concern daytime temperatures and therefore do not reverse that comparison. The independently tested tinted cover is neither a consequence nor a particular instance of the clear cover's performance.",
    },
    {
      scene: "eoi-scope-map-transfers",
      relation: "similarity",
      text: "Designer Ivo Sen assessed transit diagrams by whether a rider could identify every available transfer without inventing a connection. His own diagram preserved which lines met at each station, though a critic dismissed its geographically displaced stations as distorted. ______, on the matter Sen was assessing, riders using Rella's diagram could transfer at every depicted meeting of lines, and no actual interchange lacked a symbol, even though praise of that map's accuracy focused on its faithful street outlines.",
      why: "Sen tests connectivity, not geographic position. Both diagrams preserve all and only the real transfers, so their different geographic reputations do not make their performance on that test opposite. Rella's independently made diagram supplies a parallel case; it does not result from Sen's diagram or exemplify a generalization made about a class of diagrams.",
    },
    {
      scene: "eoi-scope-press-operating-cost",
      relation: "similarity",
      text: "A printer compared two presses using electricity consumed per completed sheet once each machine had reached its operating temperature. The Kest press reduced that amount, although prolonged heating before short runs raised its total bill and earned it the label of energy setback. ______, under the operating conditions the printer selected, the Neral press produced more sheets from a fixed amount of electricity than its predecessor; praise of its lower total bill, however, emphasized the savings from a shorter warm-up cycle.",
      why: "Both replacements improve the selected measure during uninterrupted operation. The opposite total-bill judgments include warm-up electricity, which the printer's comparison excludes. Neral's separate replacement is a parallel outcome, not an effect of the Kest change or a specific member of the single Kest case.",
    },
    {
      scene: "eoi-scope-orchard-mature-trees",
      relation: "similarity",
      text: "Forester Lena Ard tested a watering schedule on established fruit trees, defining that group as trees planted before the current season. At the Bell orchard, none of those trees died, though a rise in deaths among new seedlings produced a headline about mounting losses. ______, for the population Ard was studying, the Daven orchard reported that its living trees included its entire inventory from the previous season, a detail overshadowed by a headline celebrating fewer deaths among this year's new plantings.",
      why: "Both orchards had complete survival among the established trees Ard studied. The reported rise or fall in total deaths belongs to newly planted seedlings, outside that population. Daven is an independent case with the same scoped outcome, not a result or an example of a claim applying only to Bell.",
    },
    {
      scene: "eoi-scope-translation-voice",
      relation: "similarity",
      text: "Critic Sera Dall compared translations of a novel by asking whether readers could distinguish the narrator's formal speech from the servants' casual speech. Ren's version preserved that difference, although a reviewer called its updated spelling a modernization. ______, in the feature Dall examined, Tobin's translation confined colloquial expressions to the servants' dialogue and elevated diction to the narrator, beneath obsolete spellings advertised as deliberately old-fashioned.",
      why: "Dall compares the contrast between speakers' registers, which both translations preserve. The modernization and old-fashioned labels concern spelling and do not establish opposite outcomes on her criterion. Tobin's translation is another parallel case, not a consequence of Ren's choices or a specific instance of Ren's single translation.",
    },
    {
      scene: "eoi-scope-library-borrowers",
      relation: "contrast",
      text: "To assess whether a library's delivery service reached people who had previously lacked access, analyst Mira Sol counted only borrowers unable to visit a branch. Arven's reported growth in borrowing came entirely from this group, even though borrowing by branch visitors fell. A newspaper described the service as a success. ______, with respect to Sol's target population, all of Belden's delivery users were people who could visit a branch; its service earned the same accolade because these existing borrowers began requesting more books.",
      why: "Sol's population is residents unable to visit a branch. Arven reached that population and Belden did not, despite identical success labels based on total growth. The separate outcomes therefore contrast; Arven's borrowing cannot cause Belden's finding, and Belden is not an example of the single Arven result.",
    },
    {
      scene: "eoi-scope-reservoir-dry-season",
      relation: "contrast",
      text: "Engineer Tomas Rel compared reservoir schedules by the water left for farms during the final month of the dry season, when the farms had no other supply. At Mere Reservoir, shifting releases from the rainy months increased that late-season supply without increasing the annual total. Officials called the schedule unchanged because the yearly volume stayed constant. ______, during the period Rel selected, Hadden left farms with less water, having moved releases into the rainy months while preserving the yearly volume that earned its schedule the same description.",
      why: "The same annual-total label conceals opposite changes during the selected dry-season month: Mere provides more and Hadden less. The final sentence contrasts the schedules at the relevant time. The independent Hadden schedule is neither caused by Mere's schedule nor an example of a claim about Mere alone.",
    },
    {
      scene: "eoi-scope-hearing-accounts",
      relation: "contrast",
      text: "Historian Nira Vale compared hearing transcripts for their ability to reveal disagreements before a council reached a decision. The Ulven transcripts recorded every adopted motion but omitted statements by speakers whose proposals lost. Their clerk described them as complete, using that word for a record of decisions. ______, for Vale's purpose, the Corren transcripts retained rejected proposals and the exchanges surrounding them, material included in the similarly described complete record because its clerks preserved the proceedings, not just their outcome.",
      why: "Vale needs evidence of disagreement, which the Ulven record omits and the Corren record preserves. The matching word complete uses a narrower scope in the first clerk's description and cannot establish similarity on Vale's criterion. Corren is a contrasting independent archive, not a consequence or an example of Ulven's omissions.",
    },
    {
      scene: "eoi-scope-workshop-unprompted",
      relation: "contrast",
      text: "Educator Vera Oss judged repair workshops by whether participants could identify faults without an instructor's prompts. Elmford's final session produced more repaired radios than its first, but instructors supplied each diagnosis before participants made the repairs. The organizers reported an improvement. ______, on the ability Oss assessed, Norlen's final-session participants diagnosed unfamiliar faults unaided, although its identically worded report showed no rise in the number of radios they finished repairing.",
      why: "The selected outcome is independent diagnosis. Elmford's extra completed repairs do not demonstrate it because instructors supplied the diagnoses; Norlen's participants actually perform it. The reports thus differ on Oss's criterion despite their matching improvement labels. Norlen's separate training is not caused by, or an example of, Elmford's assisted repairs.",
    },
    {
      scene: "eoi-scope-path-continuity",
      relation: "contrast",
      text: "Planner Oren Taal assessed a walking network by whether every residential district had a continuous route to the market. Darsa added several kilometers of path, all within districts already linked to the market, leaving two isolated districts untouched. The council celebrated the expansion. ______, on Taal's criterion, Kelven's one short bridge joined its last isolated district to the existing paths, even though the two councils used the same expansion label for additions of very different lengths.",
      why: "Taal's criterion is connection of every district, not the amount of path added. Darsa's long additions leave gaps in that coverage; Kelven's short bridge completes it. Those are contrasting results despite the shared expansion label. Kelven is not an effect of Darsa's work or an example belonging to that particular network.",
    },
    {
      scene: "eoi-scope-insect-survey-reach",
      relation: "contrast",
      text: "Ecologist Rina Mell evaluated insect surveys by how well they represented species active only after dark. The Teren team doubled its observations by extending visits around noon, describing its larger daytime sample as greater coverage. ______, in the coverage Mell evaluated, the Sovan team replaced half its noon visits with visits after sunset and recorded species that emerged only at night, using the same greater coverage description even though its total number of observations had not changed.",
      why: "The criterion concerns nocturnal species, not the number of observations. Teren's larger daytime sample provides no new coverage of that population, whereas Sovan's unchanged sample reaches it by changing the sampling times. The separate studies contrast on Mell's criterion; one does not cause or constitute a specific example of the other.",
    },
  ];

  const referenceScopeTransition = transitionFamily({
    id: "transition-reference-scope",
    subskill: "sentence connection",
    difficulty: "Hard",
    title: "Transition comparing outcomes within a defined scope",
    recognize: "Recover the population, time interval, or criterion selected for a comparison, separate that scope from a quoted verdict about another measure, and determine whether an independent second case matches or reverses the first on the selected measure.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "wrong-quantity", "misattributed-view"],
    seconds: 100,
    topics: REFERENCE_SCOPE_TOPICS,
    // Both comparison relations are keys in half the scenes. "However"
    // could instead qualify a quoted local verdict, so use comparison-only
    // contrast phrases. "Thus" supplies a short foil and the example pool
    // a long one without making either key relation the length outlier.
    plans: {
      similarity: {
        neighbour: "contrast", others: ["result", "example"],
        pools: { contrast: ["By contrast", "In contrast"], result: ["Thus"] },
      },
      contrast: {
        neighbour: "similarity", others: ["result", "example"],
        keyPool: ["By contrast", "In contrast"], pools: { result: ["Thus"] },
      },
    },
    extraStep: "Name the comparison's population, time interval, or criterion; then decide what each case shows within that scope before comparing their quoted labels.",
    principles: TRANSITION_PRINCIPLES.concat(
      "A comparison keeps its criterion fixed: opposite overall labels can conceal the same scoped outcome, and matching labels can conceal opposite outcomes.",
      "A quoted verdict belongs to the measure used by its speaker; it does not automatically supply the writer's measure of comparison.",
      "Two independent cases are not a causal chain, and a statement about one particular case does not make another case its example.",
    ),
    reasons: {
      similarity: {
        contrast: (phrase) => `"${phrase}" would make the selected outcomes differ. Their quoted labels concern another scope; within the population, interval, or criterion actually being compared, the cases match.`,
        result: (phrase) => `"${phrase}" would derive the second case from the first, but the passage reports two independent cases rather than an effect or inference established by the first alone.`,
        example: (phrase) => `"${phrase}" would make the second case an instance of an earlier general claim. The earlier finding concerns one particular case, and the final sentence compares a separate one.`,
      },
      contrast: {
        similarity: (phrase) => `"${phrase}" would equate the cases by their surface labels or overall measurements. Within the population, interval, or criterion selected for comparison, their outcomes differ.`,
        result: (phrase) => `"${phrase}" would derive the second case from the first, but the passage reports independent cases with different scoped outcomes.`,
        example: (phrase) => `"${phrase}" would make the second case an instance of an earlier general claim. The first finding concerns one particular case, and the next case differs on the criterion being assessed.`,
      },
    },
    traps: {
      similarity: "Comparing opposite headlines or totals while overlooking the matching outcomes in the population, interval, or criterion the writer selected.",
      contrast: "Treating matching labels or totals as parallel outcomes even though the cases differ within the scope of the writer's comparison.",
    },
    hint: "What exactly is being compared, and do the quoted judgments use that same measure?",
  });

  const EVIDENCE_REVISION_TOPICS = [
    {
      scene: "eoi-evr-vessel-finish",
      relation: "result",
      text: "A curator attributed the red surfaces of vessels from the Neral workshop to minerals in the clay, arguing that the potters had applied no colored finish. That explanation predicts red material throughout each vessel's wall. Broken edges instead reveal pale clay beneath a thin red layer bearing brush marks, and the same layer covers repairs made after firing. ______, the conservation team rejects the curator's explanation of how the vessels acquired their color.",
      why: "The original explanation predicts color within the clay, whereas both the cross sections and the repaired areas place the red material outside it. The team's rejection of the curator's explanation follows from those observations; it does not hold despite them or merely add another observation.",
    },
    {
      scene: "eoi-evr-proof-corrections",
      relation: "result",
      text: "An editor ascribed changes in Mira Seln's printed essay to a compositor who supposedly shortened sentences while setting the type. A newly recovered manuscript contains the same changes in Seln's handwriting. The printer's dated receipt establishes that this manuscript arrived before typesetting began. ______, the editor withdraws the original attribution of responsibility for the changes.",
      why: "The handwriting identifies Seln as the reviser, and the receipt places the changes before the compositor could have made them. Together those facts warrant revising the attribution; the conclusion opposes the quoted theory but follows the evidence the author has just supplied.",
    },
    {
      scene: "eoi-evr-call-threshold",
      relation: "result",
      text: "A report interpreted fewer recorded calls at the Fenwick marsh as evidence that its bird population had declined. An equipment log shows that the recorder began rejecting quieter sounds during the period in question. When analysts apply that same threshold to the older recordings, the apparent decline disappears; visual counts made under an unchanged procedure show no decrease either. ______, the analysts recommend withdrawing the report's conclusion about the bird population.",
      why: "The threshold comparison reproduces the apparent decline without a population change, and the independent visual counts agree. Withdrawing the report's population conclusion follows from that combined evidence, even though it rejects the first report's interpretation.",
    },
    {
      scene: "eoi-evr-mill-wheel",
      relation: "result",
      text: "The owner of the Edrin mill credited a new wheel with increasing flour output. The mill's engineer proposed that the unusually high river had supplied the extra power. Maintenance records show that output rose before the wheel was replaced, and matched tests at equal water levels show no output difference between the two wheels. ______, the engineer retains her own account of the increase and rejects the owner's.",
      why: "The timing prevents the new wheel from explaining the initial increase, and the matched tests show no independent wheel effect. These findings explain the engineer's rejection of the owner's account while leaving her river proposal viable; they do not prove that the river was the cause or rule out other causes. Her stated decision follows the evidence, so retaining a proposal here does not require a concession.",
    },
    {
      scene: "eoi-evr-workshop-molds",
      relation: "concession",
      text: "An early catalog claimed that no glass ornaments had ever been made in Vardel. Excavators later found a local furnace containing unfinished ornaments fused to their molds, direct evidence of manufacture there. Most of the furnace site was destroyed before excavation, preventing any estimate of how much the workshop supplied. ______, the catalog's account remains untenable: the surviving molds establish local manufacture even without a production total.",
      why: "The destruction limits estimates of quantity but cannot undo the direct evidence that some ornaments were made locally. The last sentence preserves that disproof despite the loss of evidence; the loss itself did not cause or establish local manufacture.",
    },
    {
      scene: "eoi-evr-daytime-pollinator",
      relation: "concession",
      text: "A field guide describes the Pellin vine as pollinated exclusively at night. A continuous daytime recording shows a bee transferring pollen between its flowers; a tagged flower in that recording later forms a fruit. A camera failure erased most other recordings, leaving the frequency of daytime pollination unknown. ______, the observation that survives rules out the guide's claim of exclusively nocturnal pollination, regardless of how uncommon daytime visits prove to be.",
      why: "One documented daytime pollination is enough to contradict an exclusive night-only claim. The missing recordings prevent a frequency estimate but do not erase that counterexample, so the final sentence retains a conclusion despite the evidential limitation.",
    },
    {
      scene: "eoi-evr-signed-ballots",
      relation: "concession",
      text: "A historian claimed that the charter of Lessen prevented any woman from voting in its guild elections. A surviving signed ballot and the corresponding register show that a woman cast a vote that officials counted. The archive lacks most election registers, so researchers cannot establish how widely women participated. ______, the historian's claim of complete exclusion cannot stand, although the surviving documents cannot establish whether this voter's experience was typical.",
      why: "The counted ballot contradicts complete exclusion, whereas the missing registers limit only what can be said about the extent of participation. The final sentence preserves the counterexample's force despite the archive's gaps; it does not infer the counted vote from those gaps.",
    },
    {
      scene: "eoi-evr-tunnel-echoes",
      relation: "concession",
      text: "A model of the Orven tunnel predicts that a single clap can produce no more than two distinct echoes. One intact recording contains three echoes, each traced to that clap by its matching sound pattern. Interference makes most other recordings unusable, preventing a reliable description of the tunnel's usual response. ______, the intact recording is sufficient to reject the model's absolute limit, even though it cannot establish how often a third echo occurs.",
      why: "The interference blocks a general account of typical responses, but a verified third echo already violates the model's maximum of two. The last sentence maintains that rejection despite the incomplete record, rather than treating interference as the cause of the rejection.",
    },
    {
      scene: "eoi-evr-shared-itinerary",
      relation: "addition",
      text: "A critic explained matching passages in two travelogues by proposing that one traveler copied the other's manuscript. The manuscripts' dates and the travelers' separate locations rule out access in either direction. Both texts reproduce a peculiar error from an older itinerary, pointing to that itinerary as a common source. ______, the travelers' separate expense books each record the purchase of a copy of the itinerary before their journeys.",
      why: "The shared error points to a common source, and the purchase entries independently establish access to that source. The expense books add support for the author's replacement explanation; their contents are not a consequence or a restatement of the textual error.",
    },
    {
      scene: "eoi-evr-trading-tokens",
      relation: "addition",
      text: "A museum label described the tokens of the Aven market as ceremonial objects that never circulated in trade. A study found wear on the tokens' raised edges matching wear on objects repeatedly passed from hand to hand. This pattern favors a trading function over the label's account of display and storage. ______, a merchant's account book lists prices in tokens and records settling purchases with them, providing evidence of actual transactions.",
      why: "The wear supports a trading interpretation, and the account book supplies a separate documentary reason to accept it. The transactions do not follow from the wear analysis, contradict it, or simply restate a physical observation.",
    },
    {
      scene: "eoi-evr-bridge-design",
      relation: "addition",
      text: "An architectural history attributed the unequal arches of the Rellan bridge to a builder's taste for irregular forms. Surveyors found that each arch's width matches the channel beneath it, allowing the supports to rest on exposed rock. The pattern indicates adaptation to the riverbed rather than a purely decorative choice. ______, the builder's working notes identify firm footing as the reason for placing each support, without referring to visual irregularity.",
      why: "The measured fit to the riverbed supports a structural explanation, and the working notes independently document that purpose. The notes add evidence for the author's interpretation after the cited history's interpretation has been displaced; they are not an effect of the survey.",
    },
    {
      scene: "eoi-evr-soil-seedbank",
      relation: "addition",
      text: "A report attributed seedlings on an isolated quarry floor to seeds recently blown in from nearby fields. Investigators instead found the quarry species growing from sealed samples of soil collected there before the quarry opened. Those samples establish a buried seed supply that predates the supposed arrivals. ______, barriers that intercepted incoming seeds left seedling emergence unchanged throughout the period when the nearby fields were releasing seeds.",
      why: "The old soil samples establish a preexisting seed supply, while the barriers separately test whether newly arriving seeds account for emergence. The barrier result adds evidence against the cited report's explanation; it is not caused by, or equivalent to, the older soil result.",
    },
  ];

  const EVIDENCE_REVISION_POOLS = {
    result: ["Therefore", "Thus", "As a result"],
    concession: ["Nevertheless", "Even so", "Nonetheless"],
    addition: ["Moreover", "In addition", "Furthermore"],
    restatement: ["In other words", "That is"],
  };

  const evidenceRevisionTransition = transitionFamily({
    id: "transition-evidence-revision",
    subskill: "sentence connection",
    difficulty: "Hard",
    title: "Transition that evaluates evidence for an explanation",
    recognize: "Separate a cited explanation from the author's assessment of diagnostic evidence. Decide whether the final sentence draws the resulting inference, preserves a disproof despite an evidential gap, or supplies an independent premise for the revised explanation.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "misattributed-view", "neighbouring-rule"],
    seconds: 105,
    topics: EVIDENCE_REVISION_TOPICS,
    // These are contextual best-answer distinctions, not exclusive word
    // definitions. A result phrase can summarize the earlier counterexample,
    // but concession links the retained finding to the intervening gap in
    // evidence more precisely. The custom rationale explains that scope.
    // No contrast/concession pair depends on a disputed synonym boundary.
    plans: {
      result: {
        neighbour: "concession", others: ["addition", "restatement"],
        keyPool: EVIDENCE_REVISION_POOLS.result, pools: EVIDENCE_REVISION_POOLS,
      },
      concession: {
        neighbour: "result", others: ["addition", "restatement"],
        keyPool: EVIDENCE_REVISION_POOLS.concession,
        pools: { ...EVIDENCE_REVISION_POOLS, result: ["As a result"] },
      },
      addition: {
        neighbour: "result", others: ["concession", "restatement"],
        keyPool: EVIDENCE_REVISION_POOLS.addition, pools: EVIDENCE_REVISION_POOLS,
      },
    },
    reasons: {
      concession: {
        result: (phrase) => `"${phrase}" could introduce a conclusion drawn from the earlier counterexample, but it skips the intervening limit on the evidence. A concession more precisely marks why the conclusion still holds despite that limit.`,
      },
    },
    extraStep: "Identify whose explanation is being tested, what the observations establish, and what any missing evidence prevents the author from claiming.",
    principles: TRANSITION_PRINCIPLES.concat(
      "A conclusion can reject a quoted explanation while following logically from the author's evidence; disagreement with the quoted source does not by itself require a concession.",
      "A single established counterexample can refute an absolute claim even when missing evidence prevents estimating how common such counterexamples are.",
      "An independent observation can support the same explanation as an earlier observation without being a consequence or a restatement of it.",
    ),
    traps: {
      result: "Choosing a concession because the conclusion rejects the first speaker's explanation, overlooking that it follows from the evidence the author has supplied.",
      concession: "Reading only the earlier counterexample and overlooking the intervening limit on frequency or quantity; the conclusion retains its force despite that limit.",
      addition: "Attaching the new evidence to the cited explanation the author has already displaced, or calling one independent source of support a consequence of another.",
    },
    hint: "Whose explanation is under discussion now, and what does the final sentence do with the evidence rather than merely say about the same subject?",
  });

  const GOVERNING_CONDITION_TOPICS = [
    {
      scene: "eoi-condition-editorial-referral",
      relation: "similarity",
      text: "A literary press requires a second reading whenever an author contests a change or the first editor reports unresolved passages; either circumstance is sufficient. The press is assessing two manuscripts simultaneously. Mara Elt has accepted every change, but her editor's report identifies several unresolved passages. ______, Kalen Roh's manuscript requires a second reading at that same assessment time: Roh has contested a change, though his editor's report identifies no unresolved passages.",
      why: "Elt's editor activates one sufficient reason for a second reading; Roh's objection activates the other. Both manuscripts require the procedure, even though the editors' reports differ. The final sentence supplies a parallel case in the same review, not a later event or a rewording of the facts about Elt.",
    },
    {
      scene: "eoi-condition-record-access",
      relation: "similarity",
      text: "An oral-history archive releases a recording if its speaker consents, or if the recording is anonymized and a separate privacy review clears it. The archive is assessing two recordings simultaneously. Recording L is anonymized and carries privacy clearance. Its speaker's consent form is unsigned. ______, Recording M is authorized for release at that same assessment time on its speaker's signed consent, with the speaker's name retained and no separate privacy review.",
      why: "The archive provides two independent routes to release. Recording L satisfies both parts of the route without consent; Recording M satisfies the consent route. The missing consent does not bar L, so the final authorization parallels L's required treatment despite the opposite consent decisions.",
    },
    {
      scene: "eoi-condition-relay-pulses",
      relation: "similarity",
      text: "A charged supply is mandatory for a demonstration circuit's relay to emit a pulse. With that supply charged, either a closed contact or an engaged bypass produces a pulse. At a simultaneous measurement of two relays, Relay A has a charged supply and an engaged bypass. Its contact remains open. ______, Relay B emits a pulse at that measurement instant with its contact closed and its bypass disengaged, drawing on its charged supply.",
      why: "The charged supply is required in both cases, but a closed contact and an engaged bypass are alternative routes. A's bypass permits a pulse without a closed contact; B uses the contact route. Their pulse behavior matches even though their contact positions, the immediately adjacent details, differ.",
    },
    {
      scene: "eoi-condition-repair-fund",
      relation: "similarity",
      text: "A town repair fund approves an eligible building when its owners provide matching funds; a district emergency declaration waives that requirement, while structural eligibility remains mandatory. Two buildings are under simultaneous assessment. Nera is structurally eligible and lies in a declared district, but its owners have no matching funds. ______, the structurally eligible Pavo building qualifies for approval at that same instant, using its owners' matching funds without an emergency declaration.",
      why: "Nera meets the structural requirement, and the declaration removes its need for matching funds. Pavo meets the structural requirement and supplies the funds directly. Both qualify for approval. Reading only Nera's lack of funds would conceal the waiver and make the two approvals seem different.",
    },
    {
      scene: "eoi-condition-audition-waiver",
      relation: "similarity",
      text: "A youth orchestra waives an audition for a prior competition winner or for an applicant who has completed its training course and passed its listening assessment. Sora's and Ben's audition requirements are being determined simultaneously. Sora has completed the course and passed the assessment. She has never entered the competition. ______, Ben's audition is waived at that same instant because he has won the competition, although he has taken neither the course nor the assessment.",
      why: "Sora satisfies the two-part training route, and Ben satisfies the separate competition route. The audition is waived for each. Entering or winning the competition is not necessary for Sora once the alternative conditions are met; the different competition histories conceal matching treatment.",
    },
    {
      scene: "eoi-condition-ventilation-closure",
      relation: "similarity",
      text: "The vents in a model greenhouse close during rain or whenever the interior is cold and its heater is off; cold alone does not close them. During simultaneous observations, Model A's interior is cold and its heater is off. Its rain sensor reports dry conditions. ______, Model B's vents are closed at the same observation time under simulated rain, with a warm interior and a running heater.",
      why: "A meets the joint cold-and-no-heat condition, while B meets the independently sufficient rain condition. Both sets of vents close. The dry-versus-rainy comparison next to the blank would obscure the alternative closure route given at the start.",
    },
    {
      scene: "eoi-condition-ferry-dispatch",
      relation: "contrast",
      text: "A model ferry can be dispatched only when its channel is deep enough and either the current is below the test limit or a reserve motor is attached. In a simultaneous dispatch test, Ferry A's channel is too shallow and its current exceeds the limit. Its attached reserve motor removes the need for a weaker current. ______, Ferry B receives dispatch authorization at that instant with an attached reserve motor and an equally strong current, in a channel of adequate depth.",
      why: "The reserve motor substitutes for a weaker current, not for adequate depth. A fails the depth prerequisite and cannot be dispatched; B satisfies it and uses the reserve-motor route. Their matching motors and currents therefore conceal opposite dispatch outcomes.",
    },
    {
      scene: "eoi-condition-image-license",
      relation: "contrast",
      text: "An image library requires documented copyright clearance and payment of a licensing fee for download authorization; registered nonprofit projects are exempt from the fee but require the same clearance. Two projects are under simultaneous assessment. Project H has no copyright clearance. Its verified nonprofit registration leaves it with no fee to pay. ______, Project J receives download authorization at that same instant with documented clearance and a fee waiver based on its nonprofit registration.",
      why: "A fee waiver removes only the payment requirement. H's missing copyright clearance still blocks authorization, whereas J has the clearance as well as the waiver. The final decision contrasts with H's required treatment despite the projects' matching nonprofit status.",
    },
    {
      scene: "eoi-condition-bursary-stages",
      relation: "contrast",
      text: "Confirmed enrollment is required for a shortlisted applicant to receive a training bursary. A supervisor's nomination guarantees a place on the shortlist but does not establish enrollment. At the instant the panel determines two applicants' awards, Tavi's enrollment remains unconfirmed. His nomination places him on the shortlist without further review. ______, Nela is awarded the bursary at that same instant: her nomination has secured a shortlist place, and her enrollment is confirmed.",
      why: "The nomination guarantees only an intermediate status. Tavi has reached that status but lacks the further condition needed for an award; Nela has both. Comparing only their nominations or shortlist places would suggest similarity, while the governing award condition makes their treatment differ.",
    },
    {
      scene: "eoi-condition-scan-preservation",
      relation: "contrast",
      text: "A preservation service requires both a successful visual check of every page and a match with a stored digital checksum to accept a scan; direct comparison with the original can replace the checksum test only while that original is available. Two scans are assessed simultaneously. Scan R has a mismatched checksum and its original is missing. No page has failed its visual check. ______, Scan S is accepted at that same instant, having passed its visual check and comparison with an available original despite a mismatched checksum.",
      why: "A successful visual check is not sufficient by itself. R cannot use the alternative to its failed checksum test because its original is missing; S can and has passed that alternative check. The scans share a failed checksum test but differ in access to the permitted replacement, so their acceptance outcomes differ.",
    },
    {
      scene: "eoi-condition-manuscript-entry",
      relation: "contrast",
      text: "An essay contest admits a signed entry within its word limit; entrants under sixteen may exceed the limit, but the signature requirement applies at every age. Judges are assessing two essays simultaneously. Lio's unsigned essay is well over the limit. He is fifteen, so the length restriction has been waived. ______, Mera's signed essay is admitted at that same assessment time under the length waiver for entrants under sixteen, although it also exceeds the standard limit.",
      why: "Lio's age removes the length restriction, not the signature requirement, so his unsigned essay remains inadmissible. Mera uses the same length waiver but supplies the required signature. Their matching age-based exemption hides a difference in whether they satisfy the full admission rule.",
    },
    {
      scene: "eoi-condition-exhibit-loans",
      relation: "contrast",
      text: "A museum requires confirmed insurance and either climate control or a sealed display case to release an exhibit loan. A curator's consent permits review but does not waive either requirement. Two requests are under simultaneous assessment. The curator has consented to Request V, for which insurance remains unconfirmed. Inspectors have approved its sealed case. ______, Request W is cleared for release at that same instant on confirmed insurance and an approved sealed case, without climate control.",
      why: "The curator's consent starts review but does not authorize release, and the sealed case substitutes only for climate control. V therefore lacks the mandatory insurance confirmation. W meets that requirement and the display-condition alternative, so its clearance contrasts with V's required disposition.",
    },
  ];

  const governingConditionTransition = transitionFamily({
    id: "transition-governing-condition",
    subskill: "sentence connection",
    difficulty: "Hard",
    title: "Transition comparing consequences of nested conditions",
    recognize: "Reconstruct a rule with an alternative route, a limited waiver, or a preliminary permission. Infer the first case's unstated outcome, then compare it with the simultaneous second case without mistaking one shared or different prerequisite for the complete rule.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "reversed-condition", "intermediate-value"],
    seconds: 105,
    topics: GOVERNING_CONDITION_TOPICS,
    // A comparison-only contrast phrase avoids a second defensible reading
    // that concedes an adverse detail. Results and examples are excluded:
    // the governing rule could support a loose inference or illustration.
    // Concurrent decisions rule out chronology; the new case cannot be a
    // paraphrase of the first case's independently specified conditions.
    // Using "By contrast" avoids a first-word collision with "In other
    // words" that would skew the allowed phrase frequencies.
    plans: {
      similarity: {
        neighbour: "contrast", others: ["restatement", "sequence"],
        pools: { contrast: ["By contrast"] },
      },
      contrast: {
        neighbour: "similarity", others: ["restatement", "sequence"],
        keyPool: ["By contrast"],
      },
    },
    extraStep: "Separate mandatory conditions from alternative routes, waivers, and permissions to begin a process. Derive the first case's outcome before comparing it with the final sentence's outcome.",
    principles: TRANSITION_PRINCIPLES.concat(
      "Meeting one requirement does not establish that every requirement is met; a waiver can remove one condition while leaving another mandatory.",
      "Alternative sufficient routes can produce the same outcome from different details, while a shared intermediate status can conceal different final outcomes.",
      "A comparison may require deriving an unstated first outcome from the complete rule rather than comparing only the details beside the blank.",
    ),
    reasons: {
      similarity: {
        contrast: (phrase) => `"${phrase}" would contrast the required outcomes. The cases differ in an immediately visible condition, but each satisfies a complete authorized route to the same outcome.`,
        restatement: (phrase) => `"${phrase}" would reword the first case. The final sentence introduces a different case with its own conditions and outcome, so it supplies a comparison rather than an equivalent formulation.`,
        sequence: (phrase) => `"${phrase}" would put the second case after the first. The passage explicitly places both at a simultaneous assessment or observation, so the final sentence compares outcomes at the same time.`,
      },
      contrast: {
        similarity: (phrase) => `"${phrase}" would equate the outcomes because the cases share a qualifying detail. That detail does not replace the missing mandatory condition in the first case, so the full rule gives different outcomes.`,
        restatement: (phrase) => `"${phrase}" would restate the first case, but the final sentence describes a different case satisfying a condition the first lacks. It cannot be an equivalent version of the first case.`,
        sequence: (phrase) => `"${phrase}" would establish a later event. The passage makes the decisions or observations simultaneous; the different conditions produce contrasting outcomes at the same time.`,
      },
    },
    traps: {
      similarity: "Treating different prerequisites as different outcomes without checking whether each set of prerequisites completes an alternative sufficient route.",
      contrast: "Treating a shared waiver, preliminary permission, or satisfied prerequisite as if it established the complete outcome while overlooking an unmet mandatory condition.",
    },
    hint: "What would the full rule require for the first case, even though that outcome is not stated? Compare outcomes only after deciding what each condition does.",
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
    argumentTransition,
    referenceScopeTransition,
    evidenceRevisionTransition,
    governingConditionTransition,
  ];
});
