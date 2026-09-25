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
  // no distractor does.

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
  ];
  const CONCESSION_TOPICS = [
    {
      scene: "eoi-cnc-hemp-paper",
      relation: "concession",
      text: "Paper made from hemp fiber resists yellowing and can remain flexible for centuries, far longer than most paper made from wood pulp. Hemp is costly to harvest and process, however, and most commercial mills turned to cheaper wood pulp during the nineteenth century. ______, the conservation studio at the Arlen Library still commissions small batches of hemp paper for repairing old manuscripts, a task in which durability matters more than price.",
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
    admission: ["Admittedly", "Granted", "To be sure"],
    emphasis: ["In fact", "Indeed"],
  };
  const RELATION_OF = new Map();
  Object.entries(LEXICON).forEach(([relation, phrases]) =>
    phrases.forEach((phrase) => RELATION_OF.set(phrase, relation)),
  );

  const SIGNALS = {
    result: "introduces a consequence of what came before",
    contrast: "sets the next statement against the previous one",
    concession: "introduces a point that holds despite what came before",
    example: "introduces a specific instance of a general claim",
    addition: "adds a further point in the same direction",
    similarity: "introduces a parallel case",
    sequence: "places an event after the one before it",
    prior: "places an event before the one just described",
    restatement: "restates the previous point in other words",
    admission: "concedes a point that cuts against the writer's own claim",
    emphasis: "reinforces the previous statement with a stronger one",
  };

  // Picks one phrase for the near-neighbour relation and one for each of two
  // other relations, rejecting sets where two choices open with the same word
  // (so no choice stands out by its first word). `spec.pools` narrows a
  // relation's phrases where one of them could be defended in that template.
  function pickDistractors(t, spec, keyPhrase) {
    const pool = (relation) => (spec.pools && spec.pools[relation]) || LEXICON[relation];
    let phrases = [];
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const relations = [spec.neighbour, ...t.sample(spec.others, 2)];
      phrases = relations.map((relation) => t.pick(pool(relation)));
      if (new Set([keyPhrase, ...phrases].map(opening)).size === 4) return phrases;
    }
    return phrases;
  }

  // One Transitions template.
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
        const keyPhrase = t.pick(LEXICON[topic.relation]);
        const phrases = pickDistractors(t, spec, keyPhrase);
        const instance = {
          responseType: "multiple-choice",
          scene: topic.scene,
          stimulus: { type: "passage", content: topic.text },
          stem: TRANSITION_QUESTION,
          correct: keyPhrase,
          wrong: phrases.map((phrase) => [phrase, spec.reasons[RELATION_OF.get(phrase)](phrase)]),
          explanation: `${topic.why} "${keyPhrase}" ${SIGNALS[topic.relation]}, so it is the most logical transition.`,
          steps: spec.steps,
          principles: spec.principles,
          trap: spec.trap,
          hint: spec.hint,
          estimatedSeconds: spec.seconds,
        };
        // The offered key must express the relation recorded for the passage,
        // the near neighbour must be offered, and every distractor must
        // express a different relation the template allows.
        instance.verify = () => {
          const blanks = topic.text.split(BLANK).length - 1;
          const keyRelation = RELATION_OF.get(instance.correct);
          const wrongRelations = instance.wrong.map(([phrase]) => RELATION_OF.get(phrase));
          return (
            spec.topics.includes(topic) &&
            topic.scene.startsWith("eoi-") &&
            blanks === 1 &&
            topic.text.includes(`${BLANK}, `) &&
            topic.relation === spec.relation &&
            keyRelation === topic.relation &&
            wrongRelations.includes(spec.neighbour) &&
            wrongRelations.every((relation) =>
              relation && relation !== keyRelation && (relation === spec.neighbour || spec.others.includes(relation))) &&
            new Set(wrongRelations).size === 3
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
    relation: "result",
    neighbour: "concession",
    others: ["contrast", "example", "similarity"],
    title: "Transition into a consequence",
    recognize: "The final sentence reports what happened because of the situation before it, so the transition must signal cause and effect.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["grammatical-but-illogical"],
    seconds: 45,
    topics: RESULT_TOPICS,
    reasons: {
      concession: (p) => `"${p}" would mean the final sentence holds in spite of the previous one, but it follows directly from it.`,
      contrast: (p) => `"${p}" signals a contrast, but the final sentence follows from the previous one instead of opposing it.`,
      example: (p) => `"${p}" would make the final sentence an instance of the previous one, but it describes what happened because of it.`,
      similarity: (p) => `"${p}" would introduce a parallel case, but the final sentence describes an outcome of the same situation.`,
    },
    steps: [
      "Read the sentence before the blank and the sentence the blank begins.",
      "Decide how they relate: the second is an outcome of the first.",
      "Choose the transition that signals cause and effect.",
    ],
    principles: TRANSITION_PRINCIPLES,
    trap: "Reaching for a contrast word because the outcome is notable, although nothing in it opposes the previous sentence.",
    hint: "Is the final sentence caused by, opposed to, or an example of the one before it?",
  });

  const contrastTransition = transitionFamily({
    id: "transition-contrast-two-subjects",
    subskill: "logical transition",
    difficulty: "Easy",
    relation: "contrast",
    neighbour: "similarity",
    others: ["result", "example", "addition"],
    title: "Transition between opposing descriptions",
    recognize: "The passage describes one subject and then a second subject that behaves the opposite way, so the transition must signal contrast.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical"],
    seconds: 45,
    topics: CONTRAST_TOPICS,
    reasons: {
      similarity: (p) => `"${p}" would say the two subjects are alike, but the final sentence describes the opposite of what came before.`,
      result: (p) => `"${p}" would make the second subject's trait a consequence of the first's, but the passage simply sets them side by side.`,
      example: (p) => `"${p}" would present the final sentence as an instance of the previous one, but it is a counterpoint to it.`,
      addition: (p) => `"${p}" would add a point in the same direction, but the final sentence runs opposite to the previous one.`,
    },
    steps: [
      "Compare the subject of the sentence before the blank with the subject after it.",
      "Notice that the second is described in opposite terms.",
      "Choose the transition that signals contrast.",
    ],
    principles: TRANSITION_PRINCIPLES,
    trap: "Choosing a similarity word because two subjects are being compared, without checking whether they agree or differ.",
    hint: "Do the two sentences describe their subjects the same way or in opposite ways?",
  });

  const exampleTransition = transitionFamily({
    id: "transition-instance-mid-passage",
    subskill: "sentence connection",
    difficulty: "Easy",
    relation: "example",
    neighbour: "similarity",
    others: ["contrast", "concession", "result"],
    title: "Transition from a general claim to an instance",
    recognize: "The sentence after the blank gives one specific case of the general claim before it, so the transition must introduce an example.",
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["grammatical-but-illogical"],
    seconds: 50,
    topics: EXAMPLE_TOPICS,
    reasons: {
      similarity: (p) => `"${p}" would present a separate, parallel case, but the sentence gives an instance of the general claim itself.`,
      contrast: (p) => `"${p}" signals a contrast, but the instance agrees with the claim before it.`,
      concession: (p) => `"${p}" would suggest the instance holds despite the general claim, but it illustrates the claim.`,
      result: (p) => `"${p}" would make the instance a consequence of the general claim, but it is an illustration of it.`,
    },
    steps: [
      "Read the general claim before the blank.",
      "See that the sentence after the blank describes one specific case of that claim.",
      "Choose the transition that introduces an example.",
    ],
    principles: TRANSITION_PRINCIPLES,
    trap: "Choosing a similarity word, treating the instance as a separate case rather than a member of the category just described.",
    hint: "Is the sentence after the blank a case of the claim before it, or something else?",
  });

  const additionTransition = transitionFamily({
    id: "transition-further-point",
    subskill: "logical transition",
    difficulty: "Medium",
    relation: "addition",
    neighbour: "result",
    others: ["contrast", "concession", "example"],
    title: "Transition into a second, independent point",
    recognize: "The final sentence adds a new point in the same direction as the previous one; it is not caused by it, opposed to it, or an instance of it.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 60,
    topics: ADDITION_TOPICS,
    reasons: {
      result: (p) => `"${p}" would make the final point a consequence of the previous one, but it is a separate point.`,
      contrast: (p) => `"${p}" signals a contrast, but the final point runs in the same direction as the previous one.`,
      concession: (p) => `"${p}" would suggest the final point holds despite the previous one, but nothing is conceded.`,
      example: (p) => `"${p}" would make the final point an instance of the previous one, but it is a new point.`,
    },
    steps: [
      "Identify the point made in the sentence before the blank.",
      "Check whether the final sentence follows from it, opposes it, illustrates it, or simply adds to it.",
      "It adds a separate point in the same direction, so choose the transition that signals addition.",
    ],
    principles: TRANSITION_PRINCIPLES,
    trap: "Choosing a cause-and-effect word because both sentences favor the same conclusion, although neither causes the other.",
    hint: "Could the final sentence be true even if the previous one were not?",
  });

  const similarityTransition = transitionFamily({
    id: "transition-parallel-case",
    subskill: "logical transition",
    difficulty: "Medium",
    relation: "similarity",
    neighbour: "contrast",
    others: ["result", "example", "concession"],
    title: "Transition into a parallel case",
    recognize: "A different subject shows the same behavior as the first one, so the transition must signal similarity, not contrast or example.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "opposite-stance"],
    seconds: 60,
    topics: SIMILARITY_TRANSITION_TOPICS,
    reasons: {
      contrast: (p) => `"${p}" signals a difference, but the final sentence describes a subject behaving the same way.`,
      result: (p) => `"${p}" would make the second subject's behavior a consequence of the first's, but the two are independent.`,
      example: (p) => `"${p}" would present the second subject as an instance of the first, but it is a separate case.`,
      concession: (p) => `"${p}" would suggest the second case holds despite the first, but the two agree.`,
    },
    steps: [
      "Identify the behavior or feature described for the first subject.",
      "Notice that the final sentence gives a different subject the same behavior.",
      "Choose the transition that signals a parallel case.",
    ],
    principles: TRANSITION_PRINCIPLES,
    trap: "Choosing a contrast word because the subject changes, although what is said about it is the same.",
    hint: "Does the second subject behave like the first or unlike it?",
  });

  const sequenceTransition = transitionFamily({
    id: "transition-later-step",
    subskill: "sentence connection",
    difficulty: "Medium",
    relation: "sequence",
    neighbour: "prior",
    others: ["example", "similarity", "restatement"],
    title: "Transition into the next event of a sequence",
    recognize: "The sentence after the blank describes an event that builds on the one before it, so it must come later; its content, not a date, fixes the order.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "reversed-condition"],
    seconds: 60,
    topics: SEQUENCE_TOPICS,
    reasons: {
      prior: (p) => `"${p}" would place this event before the one just described, but it builds on that earlier event.`,
      example: (p) => `"${p}" would present this event as an instance of the previous one, but it is the next stage.`,
      similarity: (p) => `"${p}" would present a parallel case, but the sentence continues the same sequence of events.`,
      restatement: (p) => `"${p}" would restate the previous sentence, but this sentence describes a new event.`,
    },
    steps: [
      "Read the sentences on both sides of the blank.",
      "Work out the order of events from what each sentence depends on.",
      "The event after the blank builds on the one before it, so choose the transition that signals a later time.",
    ],
    principles: TRANSITION_PRINCIPLES.concat("In a narrative, what an event depends on fixes its order even when no date is given."),
    trap: "Choosing a word that points back in time, which reverses the order the content requires.",
    hint: "Could the event after the blank have happened before the one before it?",
  });

  const concessionTransition = transitionFamily({
    id: "transition-despite-drawback",
    subskill: "logical transition",
    difficulty: "Hard",
    relation: "concession",
    neighbour: "result",
    others: ["example", "addition", "restatement"],
    title: "Transition into a point that holds despite a drawback",
    recognize: "The sentence just before the blank states a drawback; the final sentence holds in spite of it. A cause-and-effect word would connect it to the earlier advantage, not to the sentence it follows.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "opposite-stance"],
    seconds: 80,
    topics: CONCESSION_TOPICS,
    reasons: {
      result: (p) => `"${p}" would make the final sentence a consequence of the drawback just described, but it holds despite that drawback.`,
      example: (p) => `"${p}" would present the final sentence as an instance of the drawback, but it runs against it.`,
      addition: (p) => `"${p}" would add another point in the drawback's direction, but the final sentence pushes back against it.`,
      restatement: (p) => `"${p}" would restate the drawback, but the final sentence says something that holds in spite of it.`,
    },
    steps: [
      "Identify what the sentence immediately before the blank says: a drawback or limitation.",
      "Ask how the final sentence relates to that sentence, not to the passage's opening.",
      "It holds in spite of the drawback, so choose the transition that signals concession.",
    ],
    principles: TRANSITION_PRINCIPLES.concat("A transition relates its sentence to the one immediately before it."),
    trap: "Choosing a cause-and-effect word because the final sentence follows from the passage's first sentence, skipping the drawback in between.",
    hint: "What does the sentence right before the blank say, and does the final sentence follow from it or push against it?",
  });

  const admissionTransition = transitionFamily({
    id: "transition-concede-then-return",
    subskill: "sentence connection",
    difficulty: "Hard",
    relation: "admission",
    neighbour: "emphasis",
    others: ["result", "example", "similarity"],
    // "In fact" can also correct a statement, which a conceded point could be
    // read as doing; "Indeed" only reinforces.
    pools: { emphasis: ["Indeed"] },
    title: "Transition that concedes a weakness mid-argument",
    recognize: "The sentence after the blank grants a point against the writer's claim, and the next sentence returns to the claim; the transition must signal that concession.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "opposite-stance"],
    seconds: 85,
    topics: ADMISSION_TOPICS,
    reasons: {
      emphasis: (p) => `"${p}" would present the sentence as reinforcing the claim before it, but it concedes a point against that claim.`,
      result: (p) => `"${p}" would make the conceded point a consequence of the claim, but it cuts against the claim.`,
      example: (p) => `"${p}" would present the sentence as an instance of the claim, but it is a limitation of it.`,
      similarity: (p) => `"${p}" would present a parallel case, but the sentence concedes a weakness in the claim.`,
    },
    steps: [
      "Identify the claim in the first sentence.",
      "Decide whether the sentence after the blank supports that claim or grants a point against it.",
      "Use the final sentence, which returns to the claim, to confirm that the middle sentence is a concession.",
      "Choose the transition that signals a concession.",
    ],
    principles: TRANSITION_PRINCIPLES.concat("Writers often grant a limitation before returning to their claim; words such as \"admittedly\" mark that move."),
    trap: "Choosing an emphasis word, reading the conceded point as more support for the claim.",
    hint: "Does the sentence after the blank strengthen the claim, or grant something against it before the passage turns back?",
  });

  const restatementTransition = transitionFamily({
    id: "transition-plain-restatement",
    subskill: "logical transition",
    difficulty: "Hard",
    relation: "restatement",
    neighbour: "result",
    others: ["contrast", "similarity", "concession"],
    // "Thus" and "Therefore" can mark an inference, which a restatement can
    // be read as; "As a result" and "Consequently" only mark an effect.
    pools: { result: ["As a result", "Consequently"] },
    title: "Transition into a plain-language restatement",
    recognize: "The final sentence says the same thing as the technical sentence before it in plainer terms; calling it a consequence would make it follow from itself.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    seconds: 80,
    topics: RESTATEMENT_TOPICS,
    reasons: {
      result: (p) => `"${p}" would present the final sentence as a consequence, but it says the same thing as the previous sentence in plainer terms.`,
      contrast: (p) => `"${p}" signals a contrast, but the final sentence agrees exactly with the previous one.`,
      similarity: (p) => `"${p}" would introduce a parallel case, but the final sentence is about the same finding.`,
      concession: (p) => `"${p}" would suggest the final sentence holds despite the previous one, but it simply restates it.`,
    },
    steps: [
      "Paraphrase the sentence before the blank in your own words.",
      "Compare that paraphrase with the final sentence: it adds nothing new.",
      "Since the final sentence restates rather than follows from the previous one, choose the transition that signals restatement.",
    ],
    principles: TRANSITION_PRINCIPLES.concat("A restatement adds no new information; a consequence does."),
    trap: "Choosing a cause-and-effect word because the plain version seems to follow from the technical one.",
    hint: "Does the final sentence tell you anything the previous sentence did not?",
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
  ];
});
