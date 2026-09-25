(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/reading-writing/standard-english-conventions"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Form, Structure, and Sense templates (Standard English Conventions).
  // Each family is one question design paired with its own bank of topics;
  // every topic is one scene, written for that family alone. A passage shows
  // "______" where the choice goes, and each choice carries the words next to
  // the blank, as the real test does.
  //
  // verify() never trusts the key it was handed: each topic records the
  // structure that decides the answer (a subject's head noun, the passage's
  // time frame), and verify re-derives the answer from that record and from
  // the rendered choice strings.

  const { STEM, BLANK, DOMAIN } = C;

  const FORM = "Form, Structure, and Sense";
  const SECONDS = { Easy: 50, Medium: 65, Hard: 85 };

  /* --------------------------------------------------------------- helpers */

  const hasOneBlank = (text) => text.split(BLANK).length === 2;
  const beforeBlank = (text) => text.slice(0, text.indexOf(BLANK));
  const afterBlank = (text) => text.slice(text.indexOf(BLANK) + BLANK.length);
  const wordsOf = (text) => String(text).match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]*/g) || [];
  const lastWordOf = (text) => wordsOf(text).slice(-1)[0] || "";
  const firstWordOf = (text) => wordsOf(text)[0] || "";
  const lower = (text) => String(text).toLowerCase();
  // The sentence the blank sits in, up to the blank.
  const blankSentence = (text) => beforeBlank(text).split(/[.?!]["”]?\s+/).pop();
  const q = (text) => `“${text}”`;

  function item(topic, family, fields) {
    return {
      responseType: "multiple-choice",
      scene: topic.scene,
      stimulus: { type: "text", content: topic.text },
      stem: STEM,
      estimatedSeconds: SECONDS[family.difficulty],
      ...fields,
    };
  }

  // Grammatical number read off the words themselves, so verify does not
  // depend on a label someone typed next to the topic.
  const IRREGULAR_PLURALS = ["children", "people", "men", "women", "feet", "teeth", "mice", "algae"];
  const SINGULAR_WORDS = ["each", "one", "number", "every", "either", "neither"];
  function nounNumber(noun) {
    const word = lower(lastWordOf(noun));
    if (IRREGULAR_PLURALS.includes(word)) return "plural";
    if (SINGULAR_WORDS.includes(word)) return "singular";
    return /[^su]s$/.test(word) ? "plural" : "singular";
  }
  const SINGULAR_AUX = ["is", "was", "has", "does"];
  const PLURAL_AUX = ["are", "were", "have", "do"];
  function verbNumber(form) {
    const first = lower(firstWordOf(form));
    if (SINGULAR_AUX.includes(first)) return "singular";
    if (PLURAL_AUX.includes(first)) return "plural";
    return /[^s]s$/.test(first) ? "singular" : "plural";
  }
  const other = (number) => (number === "singular" ? "plural" : "singular");

  // Why a verb of the wrong number fails, phrased for the form offered.
  function numberReason(form, subject, subjectNumber, lure) {
    const first = lower(firstWordOf(form));
    const number = other(subjectNumber);
    if (form.includes(" ") && [...SINGULAR_AUX, ...PLURAL_AUX].includes(first)) {
      return `${q(form)} uses the ${number} helping verb ${q(first)}, but the subject, ${q(subject)}, is ${subjectNumber}.`;
    }
    return `${q(form)} is ${number}; it agrees with ${q(lure)} rather than with the ${subjectNumber} subject, ${q(subject)}.`;
  }

  /* ------------------------------------ subject-verb agreement: compound */

  // The subject is two nouns joined by "and"; the noun right before the verb
  // is singular, so the singular verb sounds tempting.
  const COMPOUND_TOPICS = [
    {
      scene: "sec-gamelan-tempo",
      text: "A Balinese gamelan can include more than two dozen bronze instruments, and its players rarely use written scores. Instead, the lead drummer and the first metallophone player ______ every change in tempo, and the rest of the ensemble follows their cues.",
      subject: "the lead drummer and the first metallophone player",
      lure: "player",
      plural: "signal",
      singular: ["signals", "has signaled", "is signaling"],
    },
    {
      scene: "sec-lichen-partnership",
      text: "A lichen looks like a single plant, but it is actually a partnership between two very different organisms. In most lichens, a fungus and a photosynthetic alga ______ together as one body: the alga makes sugar from sunlight, and the fungus supplies shelter and water.",
      subject: "a fungus and a photosynthetic alga",
      lure: "alga",
      plural: "live",
      singular: ["lives", "has lived", "is living"],
    },
    {
      scene: "sec-rosetta-scripts",
      text: "The Rosetta Stone, carved in 196 BCE, records a single decree in three scripts. Its Greek passage and its demotic passage ______ the same text as the hieroglyphs above them, which is why the stone became the key to deciphering Egyptian hieroglyphs in the 1820s.",
      subject: "Its Greek passage and its demotic passage",
      lure: "passage",
      plural: "convey",
      singular: ["conveys", "has conveyed", "is conveying"],
    },
    {
      scene: "sec-mangrove-carbon",
      text: "Mangrove forests grow along tropical coastlines where rivers meet the sea. The trees' tangled roots and the waterlogged mud around them ______ carbon far more efficiently than most inland forests do, so coastal planners increasingly treat mangroves as protection against climate change.",
      subject: "The trees' tangled roots and the waterlogged mud around them",
      lure: "mud",
      plural: "store",
      singular: ["stores", "has stored", "is storing"],
    },
    {
      scene: "sec-lowery-quilt",
      text: "In Mattie Lowery's quilts, the pattern follows the fabric rather than a plan drawn in advance. A worn pair of denim work pants and a faded cotton feed sack ______ side by side in her best-known piece, their blues and tans set against each other in bold, uneven blocks.",
      subject: "A worn pair of denim work pants and a faded cotton feed sack",
      lure: "sack",
      plural: "sit",
      singular: ["sits", "has sat", "is sitting"],
    },
    {
      scene: "sec-tides-sun-moon",
      text: "Ocean tides are not caused by the Moon alone. The Moon's gravity and the Sun's gravity ______ on Earth's oceans at the same time, and when the two bodies line up, their combined pull produces especially high spring tides.",
      subject: "The Moon's gravity and the Sun's gravity",
      lure: "gravity",
      plural: "act",
      singular: ["acts", "has acted", "is acting"],
    },
    {
      scene: "sec-bebop-melody",
      text: "Bebop, which emerged in New York in the 1940s, sped up jazz and made its harmonies more complex. In a typical bebop performance, the saxophone and the trumpet ______ the melody together before each musician improvises a solo over the chord changes.",
      subject: "the saxophone and the trumpet",
      lure: "trumpet",
      plural: "play",
      singular: ["plays", "has played", "is playing"],
    },
    {
      scene: "sec-branch-libraries",
      text: "Sociologist Irene Vasquez spent two years observing how people use branch libraries in Chicago. At most of the branches she studied, the children's section and the computer lab ______ the most visitors on weekday afternoons, while the quiet reading room stays nearly empty.",
      subject: "the children's section and the computer lab",
      lure: "lab",
      plural: "draw",
      singular: ["draws", "has drawn", "is drawing"],
    },
    {
      scene: "sec-sourdough-starter",
      text: "Sourdough bread rises without commercial yeast. Instead, the wild yeast and lactic acid bacteria in the starter ______ the sugars in the flour, releasing the carbon dioxide that lifts the dough and the acids that give the bread its sour taste.",
      subject: "the wild yeast and lactic acid bacteria in the starter",
      lure: "starter",
      plural: "ferment",
      singular: ["ferments", "has fermented", "is fermenting"],
    },
    {
      scene: "sec-kelp-predators",
      text: "Along the Pacific coast of North America, kelp forests depend on predators. The sea otter and the sunflower sea star ______ sea urchins, which would otherwise graze the kelp down to bare rock; where both predators have declined, urchins have taken over.",
      subject: "The sea otter and the sunflower sea star",
      lure: "star",
      plural: "eat",
      singular: ["eats", "has eaten", "is eating"],
    },
    {
      scene: "sec-gutenberg-ink",
      text: "By about 1455, Johannes Gutenberg had printed roughly 180 copies of the Bible in Mainz, Germany. His movable metal type and his oil-based ink ______ both essential to the project, since the water-based inks used by scribes would not stick evenly to metal letters.",
      subject: "His movable metal type and his oil-based ink",
      lure: "ink",
      plural: "were",
      singular: ["was", "has been", "is"],
    },
    {
      scene: "sec-maya-calendar-round",
      text: "The ancient Maya tracked time with several interlocking calendars. A 260-day ritual count and a 365-day solar year ______ to form a cycle that returns to the same starting date only once every 52 years, a period now called the Calendar Round.",
      subject: "A 260-day ritual count and a 365-day solar year",
      lure: "year",
      plural: "combine",
      singular: ["combines", "has combined", "is combining"],
    },
    {
      scene: "sec-nicaraguan-sign",
      text: "Nicaraguan Sign Language emerged in the late 1970s and 1980s among deaf children attending new schools in Managua. As in other signed languages, the shape of the hands and the expression on the signer's face ______ grammatical information, such as whether a sentence is a question.",
      subject: "the shape of the hands and the expression on the signer's face",
      lure: "face",
      plural: "carry",
      singular: ["carries", "has carried", "is carrying"],
    },
  ];

  const compoundSubject = {
    id: "sec-sva-compound-subject",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "subject-verb agreement",
    difficulty: "Easy",
    title: "Verb after two subjects joined by and",
    recognize: "Two nouns joined by “and” make one plural subject, even when the noun right before the verb is singular.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["agreement-attractor"],
    build(t) {
      const topic = t.pick(COMPOUND_TOPICS);
      const key = topic.plural;
      return item(topic, this, {
        correct: key,
        wrong: topic.singular.map((form) => [form, numberReason(form, topic.subject, "plural", topic.lure)]),
        explanation: `The verb's subject is ${q(topic.subject)}: two things joined by “and,” which together make a plural subject. Only the plural verb ${q(key)} agrees with it; the other choices are singular.`,
        steps: [
          "Find the verb's subject by asking who or what performs the action.",
          `Notice that the subject joins two nouns with “and,” so it is plural even though ${q(topic.lure)} is singular.`,
          "Choose the only plural verb form.",
        ],
        principles: ["A subject made of two nouns joined by “and” is plural and takes a plural verb."],
        trap: `Matching the verb to ${q(topic.lure)}, the singular noun right before the blank, instead of to the whole compound subject.`,
        hint: "Before choosing a verb, find every noun that is doing the action.",
        verify: () => {
          const lead = lower(beforeBlank(topic.text)).trimEnd();
          return hasOneBlank(topic.text) &&
            lead.endsWith(lower(topic.subject)) &&
            / and /.test(topic.subject) &&
            wordsOf(topic.subject).includes(topic.lure) &&
            nounNumber(topic.lure) === "singular" &&
            verbNumber(key) === "plural" &&
            topic.singular.length === 3 &&
            topic.singular.every((form) => verbNumber(form) === "singular");
        },
      });
    },
  };

  /* ------------------------------------------- pronoun: their / they're */

  // The pronoun's number is plain (a plural noun nearby); the question is
  // form: possessive, contraction, or the word "there."
  const THEIR_TOPICS = [
    {
      scene: "sec-hummingbird-torpor",
      text: "Hummingbirds burn energy faster than almost any other animals. On cold nights, many species enter a sleeplike state called torpor, letting ______ body temperature drop sharply and slowing the heartbeat to save fuel until morning.",
      role: "possessive",
      next: "body temperature",
    },
    {
      scene: "sec-quipu-cords",
      text: "The Inca kept records without a written alphabet. Officials called quipucamayocs tied knots in long cords, and the position, type, and color of each knot recorded numbers such as census counts and harvest totals. Scholars still debate whether ______ cords also recorded words.",
      role: "possessive",
      next: "cords",
    },
    {
      scene: "sec-mexican-muralists",
      text: "After the Mexican Revolution, painters such as Diego Rivera, José Clemente Orozco, and David Alfaro Siqueiros covered the walls of public buildings with scenes from the nation's history, hoping that ______ murals would reach people who never visited museums.",
      role: "possessive",
      next: "murals",
    },
    {
      scene: "sec-beaver-lodges",
      text: "Beavers reshape whole valleys. By damming streams with branches and mud, the animals flood the land around ______ lodges, creating ponds that also shelter frogs, fish, and nesting birds.",
      role: "possessive",
      next: "lodges",
    },
    {
      scene: "sec-bartok-kodaly-songs",
      text: "In the early 1900s, the Hungarian composers Béla Bartók and Zoltán Kodály traveled through rural villages with phonographs, recording thousands of folk songs. Melodies and rhythms from those recordings later shaped much of ______ own concert music.",
      role: "possessive",
      next: "own concert music",
    },
    {
      scene: "sec-urban-coyotes",
      text: "Coyotes now live in nearly every large city in the United States, yet most residents rarely see them. Biologists who track the animals with radio collars report that ______ mostly active at night, when streets and parks are quiet.",
      role: "contraction",
      next: "mostly active",
    },
    {
      scene: "sec-ginkgo-streets",
      text: "Ginkgo trees have changed little in more than 200 million years, and city planners value them for another reason as well: ______ remarkably tolerant of air pollution, which is one reason so many ginkgoes line urban streets.",
      role: "contraction",
      next: "remarkably tolerant",
    },
    {
      scene: "sec-honeyguide-calls",
      text: "In parts of Africa, birds called honeyguides lead people to the nests of wild bees and then feed on the wax the people leave behind. Researchers in Mozambique found that ______ far more likely to lead honey hunters who make a special trilling call.",
      role: "contraction",
      next: "far more likely",
    },
    {
      scene: "sec-glass-frogs",
      text: "Glass frogs, which live in the rainforests of Central and South America, have see-through skin on their bellies. When the frogs sleep, ______ even harder to spot, because they move most of their red blood cells out of circulation and pack them into the liver.",
      role: "contraction",
      next: "even harder",
    },
    {
      scene: "sec-subglacial-lakes",
      text: "Antarctica's ice sheet is more than four kilometers thick in places. Beneath it, ______ are hundreds of lakes of liquid water, kept from freezing by the pressure of the ice above and by heat rising from the rock below.",
      role: "place",
      next: "are",
    },
    {
      scene: "sec-first-folio-copies",
      text: "About 750 copies of Shakespeare's First Folio were printed in 1623, seven years after the playwright's death. Today ______ are about 235 known surviving copies, most of them held in libraries and universities.",
      role: "place",
      next: "are",
    },
    {
      scene: "sec-medieval-guilds",
      text: "In many medieval European towns, ______ were guilds for nearly every trade, from bakers to goldsmiths, and each guild set rules for training apprentices, judging the quality of goods, and fixing prices.",
      role: "place",
      next: "were",
    },
    {
      scene: "sec-jupiter-moons",
      text: "Galileo Galilei discovered Jupiter's four largest moons in January 1610 using a telescope he had built himself. Since then, astronomers have found many more, and ______ are now more than ninety known moons orbiting the planet.",
      role: "place",
      next: "are",
    },
  ];

  const THEIR_FORMS = {
    possessive: "their",
    contraction: "they're",
    place: "there",
    placeContraction: "there's",
  };
  const THEIR_MEANINGS = {
    possessive: "a possessive (belonging to them)",
    contraction: "a contraction of “they are”",
    place: "the word that introduces what exists (“there are”)",
    placeContraction: "a contraction of “there is”",
  };
  const BE_VERBS = ["is", "are", "was", "were"];
  // What the words after the blank call for: a be-verb follows "there"; an
  // adverb or adjective follows "they're"; a noun (or "own") follows "their".
  const PREDICATE_STARTS = ["essential", "even", "far", "more", "less", "not", "still", "also", "now", "likely", "able", "unable"];
  function roleAfter(next) {
    const word = lower(firstWordOf(next));
    if (BE_VERBS.includes(word)) return "place";
    if (/ly$/.test(word) || PREDICATE_STARTS.includes(word)) return "contraction";
    return "possessive";
  }

  const theirForms = {
    id: "sec-their-theyre-there",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "pronoun agreement",
    difficulty: "Easy",
    title: "Their, they're, or there",
    recognize: "The four choices sound alike; decide whether the blank needs a possessive before a noun, “they are,” or the “there” that introduces what exists.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form"],
    build(t) {
      const topic = t.pick(THEIR_TOPICS);
      const key = THEIR_FORMS[topic.role];
      const needs = {
        possessive: `a possessive before ${q(topic.next)}`,
        contraction: `${q("they are")} before ${q(topic.next)}`,
        place: `the ${q("there")} that introduces ${q(`there ${topic.next}`)}`,
      }[topic.role];
      return item(topic, this, {
        correct: key,
        wrong: Object.entries(THEIR_FORMS)
          .filter(([role]) => role !== topic.role)
          .map(([role, form]) => [form, `${q(form)} is ${THEIR_MEANINGS[role]}, but the sentence needs ${needs}.`]),
        explanation: `The sentence needs ${needs}, which is ${q(key)}. Read aloud, the four choices sound nearly alike, so test each by its meaning.`,
        steps: [
          "Read the words right after the blank.",
          "Test each choice by expanding it: “they are,” “there is,” or “belonging to them.”",
          `Only ${q(key)} makes sense before ${q(topic.next)}.`,
        ],
        principles: ["“Their” shows possession, “they're” means “they are,” and “there” introduces what exists (“there are”) or names a place."],
        trap: "Choosing by sound, since all four choices are pronounced almost the same way.",
        hint: "Replace the blank with “they are” and see whether the sentence still makes sense.",
        verify: () => {
          const role = roleAfter(afterBlank(topic.text));
          return hasOneBlank(topic.text) &&
            afterBlank(topic.text).trimStart().startsWith(topic.next) &&
            role === topic.role &&
            THEIR_FORMS[role] === key &&
            Object.values(THEIR_FORMS).filter((form) => form === key).length === 1;
        },
      });
    },
  };

  /* ------------------------------------------- verb form: past participle */

  const IRREGULAR_VERBS = {
    lie: { past: "lay", participle: "lain", third: "lies", lure: "laid" },
    swim: { past: "swam", participle: "swum", third: "swims" },
    grow: { past: "grew", participle: "grown", third: "grows" },
    ring: { past: "rang", participle: "rung", third: "rings" },
    sing: { past: "sang", participle: "sung", third: "sings" },
    shrink: { past: "shrank", participle: "shrunk", third: "shrinks" },
    weave: { past: "wove", participle: "woven", third: "weaves" },
    steal: { past: "stole", participle: "stolen", third: "steals" },
    sink: { past: "sank", participle: "sunk", third: "sinks" },
    fly: { past: "flew", participle: "flown", third: "flies" },
    speak: { past: "spoke", participle: "spoken", third: "speaks" },
    break: { past: "broke", participle: "broken", third: "breaks" },
    write: { past: "wrote", participle: "written", third: "writes" },
  };
  const PARTICIPLE_AUX = ["had", "has", "have", "was", "were", "be", "been", "is", "are"];

  const PARTICIPLE_TOPICS = [
    {
      scene: "sec-mary-rose-wreck",
      text: "The Mary Rose, a warship built for King Henry VIII, sank off the southern coast of England in 1545. By the time divers raised the wreck in 1982, it had ______ on the floor of the Solent for 437 years, partly protected by layers of silt.",
      verb: "lie",
    },
    {
      scene: "sec-ederle-channel",
      text: "In August 1926, the American swimmer Gertrude Ederle crossed the English Channel from France to England in about fourteen and a half hours. Before her, only five people, all of them men, had ever ______ across it.",
      verb: "swim",
    },
    {
      scene: "sec-hyperion-redwood",
      text: "In 2006, two naturalists exploring a remote valley in California's Redwood National Park measured a coast redwood they named Hyperion. The tree had ______ to more than 115 meters, making it the tallest known living tree in the world.",
      verb: "grow",
    },
    {
      scene: "sec-santa-clara-bell",
      text: "When workers restored the old bell tower in the village of Santa Clara in 2019, they found records showing that its largest bell had ______ every hour for nearly two centuries without once being recast.",
      verb: "ring",
    },
    {
      scene: "sec-fisk-jubilee-singers",
      text: "In 1871, a student choir from Fisk University in Nashville set out on a tour to raise money for the struggling school. Within a few years, the Fisk Jubilee Singers had ______ spirituals for audiences across the United States and Europe, including Queen Victoria.",
      verb: "sing",
    },
    {
      scene: "sec-rockies-glacier",
      text: "Comparing survey photographs taken in 1913 with drone images taken in 2023, glaciologists found that a small glacier in the northern Rocky Mountains had ______ to less than a third of its former area.",
      verb: "shrink",
    },
    {
      scene: "sec-bayeux-embroidery",
      text: "Despite its name, the Bayeux Tapestry is not actually a tapestry. Its scenes of the Norman conquest of England were not ______ into the cloth on a loom; they were stitched onto strips of linen with colored wool yarn.",
      verb: "weave",
    },
    {
      scene: "sec-mona-lisa-theft",
      text: "In August 1911, the Mona Lisa was ______ from the Louvre by Vincenzo Peruggia, a handyman who had worked at the museum. He kept the painting hidden in his Paris apartment for more than two years before trying to sell it in Florence.",
      verb: "steal",
    },
    {
      scene: "sec-lyuba-mammoth",
      text: "In 2007, a reindeer herder in Siberia found Lyuba, a month-old woolly mammoth calf that still had skin, organs, and milk in her stomach. About 42,000 years earlier, her body had ______ into riverbank mud that later froze solid, preserving it almost perfectly.",
      verb: "sink",
    },
    {
      scene: "sec-earhart-records",
      text: "By the time she disappeared over the Pacific Ocean in 1937, Amelia Earhart had ______ solo across the Atlantic and set several records for altitude and distance, making her one of the most famous pilots in the world.",
      verb: "fly",
    },
    {
      scene: "sec-latin-speakers",
      text: "Latin is often called a dead language because no community has ______ it as a first language for well over a thousand years. Yet it survives in scientific names, legal phrases, and the vocabulary of the Romance languages.",
      verb: "speak",
    },
    {
      scene: "sec-bannister-mile",
      text: "In the early 1950s, many runners and coaches believed that the four-minute barrier for the mile could never be ______. On May 6, 1954, at a track in Oxford, England, Roger Bannister finished in 3 minutes 59.4 seconds.",
      verb: "break",
    },
    {
      scene: "sec-bach-brandenburg",
      text: "By the time Johann Sebastian Bach became music director at St. Thomas Church in Leipzig in 1723, he had already ______ the six Brandenburg Concertos, which he had presented two years earlier to a German nobleman.",
      verb: "write",
    },
  ];

  const pastParticiple = {
    id: "sec-irregular-past-participle",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "verb form",
    difficulty: "Easy",
    title: "Past participle after a helping verb",
    recognize: "A helping verb such as “had,” “has,” or “was” comes right before the blank, so the verb must be the past participle, not the simple past.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule"],
    build(t) {
      const topic = t.pick(PARTICIPLE_TOPICS);
      const forms = IRREGULAR_VERBS[topic.verb];
      const aux = wordsOf(beforeBlank(topic.text)).slice(-2).find((word) => PARTICIPLE_AUX.includes(lower(word)));
      const key = forms.participle;
      const wrong = [
        [forms.past, `${q(forms.past)} is the simple past of ${q(topic.verb)}; after ${q(aux)}, the verb needs the past participle.`],
        forms.lure
          ? [forms.lure, `${q(forms.lure)} is a form of ${q("lay")} (to put something down), which needs an object; the wreck itself ${q("lay")}, so the participle is ${q(key)}.`]
          : [topic.verb, `${q(topic.verb)} is the base form; it cannot follow ${q(aux)}.`],
        [forms.third, `${q(forms.third)} is a present-tense form and cannot follow the helping verb ${q(aux)}.`],
      ];
      return item(topic, this, {
        correct: key,
        wrong,
        explanation: `The helping verb ${q(aux)} must be followed by a past participle. The past participle of ${q(topic.verb)} is ${q(key)}; ${q(forms.past)} is the simple past, which stands alone without a helping verb.`,
        steps: [
          `Notice the helping verb ${q(aux)} right before the blank.`,
          "A helping verb such as “had,” “has,” “was,” or “be” takes the past participle.",
          `The past participle of ${q(topic.verb)} is ${q(key)}.`,
        ],
        principles: [
          "Perfect tenses and passive verbs use the past participle; for irregular verbs it often differs from the simple past (swam / had swum, broke / was broken).",
        ],
        trap: `Choosing the simple past, ${q(forms.past)}, which sounds natural in casual speech after ${q(aux)}.`,
        hint: "Look at the word just before the blank.",
        verify: () => hasOneBlank(topic.text) &&
          Boolean(aux) &&
          key !== forms.past &&
          key !== topic.verb &&
          // These irregular participles end in -n or carry the u of
          // swim/swam/swum; their simple pasts do neither.
          /n$|u/.test(key) && !/n$|u/.test(forms.past) &&
          wordsOf(afterBlank(topic.text)).length > 0 &&
          wrong.every(([form]) => form !== key && [forms.past, forms.third, forms.lure, topic.verb].includes(form)),
      });
    },
  };

  /* ------------------------------------------ parallel structure: series */

  // A series of three: the first two items share a form, the blank is the
  // third. Each choice records its form; to-, -ing-, and pronoun-led forms
  // are also read off the words.
  const SERIES_TOPICS = [
    {
      scene: "sec-chapel-frescoes",
      text: "Over one summer, a team of conservators working in a small Italian chapel spent months cleaning soot from the frescoes, filling cracks in the plaster, and ______.",
      form: "gerund",
      given: ["cleaning soot from the frescoes", "filling cracks in the plaster"],
      choices: [
        ["retouching spots where the paint had flaked away", "gerund"],
        ["to retouch spots where the paint had flaked away", "infinitive"],
        ["they retouched spots where the paint had flaked away", "clause"],
        ["the retouching of spots where the paint had flaked away", "noun"],
      ],
    },
    {
      scene: "sec-jefferson-instructions",
      text: "In 1803, President Thomas Jefferson instructed Meriwether Lewis to explore the Missouri River, to look for a water route to the Pacific Ocean, and ______ along the way.",
      form: "infinitive",
      given: ["to explore the Missouri River", "to look for a water route to the Pacific Ocean"],
      choices: [
        ["to establish relations with the Native nations", "infinitive"],
        ["establishing relations with the Native nations", "gerund"],
        ["he should establish relations with the Native nations", "clause"],
        ["the establishment of relations with the Native nations", "noun"],
      ],
    },
    {
      scene: "sec-hurston-career",
      text: "Few writers moved as easily between scholarship and fiction as Zora Neale Hurston. She studied anthropology at Barnard College, collected folklore across the American South, and ______ the novel Their Eyes Were Watching God in 1937.",
      form: "past",
      given: ["studied anthropology at Barnard College", "collected folklore across the American South"],
      choices: [["published", "past"], ["publishing", "gerund"], ["to publish", "infinitive"], ["she published", "clause"]],
    },
    {
      scene: "sec-bauhaus-workshops",
      text: "The Bauhaus, a German school of art and design founded in Weimar in 1919, trained students in workshops devoted to a wide range of materials, including wood, metal, and ______.",
      form: "noun",
      given: ["wood", "metal"],
      choices: [["glass", "noun"], ["working with glass", "gerund"], ["to use glass", "infinitive"], ["they used glass", "clause"]],
    },
    {
      scene: "sec-dust-bowl-storms",
      text: "During the Dust Bowl of the 1930s, windstorms stripped topsoil from farms across the southern Great Plains, buried fences under drifts of dirt, and ______ thousands of families to leave the region.",
      form: "past",
      given: ["stripped topsoil from farms", "buried fences under drifts of dirt"],
      choices: [["drove", "past"], ["driving", "gerund"], ["to drive", "infinitive"], ["they drove", "clause"]],
    },
    {
      scene: "sec-coral-nursery",
      text: "Volunteers at coral nurseries in the Florida Keys learn to snip fragments from healthy staghorn coral, to hang them on underwater frames made of plastic pipe, and ______ once they have grown.",
      form: "infinitive",
      given: ["to snip fragments from healthy staghorn coral", "to hang them on underwater frames"],
      choices: [
        ["to replant the fragments on damaged reefs", "infinitive"],
        ["replanting the fragments on damaged reefs", "gerund"],
        ["the fragments are replanted on damaged reefs", "clause"],
        ["the replanting of the fragments on damaged reefs", "noun"],
      ],
    },
    {
      scene: "sec-monk-piano",
      text: "Critics have described Thelonious Monk's piano playing as spare, angular, and ______, full of sudden silences and of notes that seem to land in the wrong place on purpose.",
      form: "adjective",
      given: ["spare", "angular"],
      choices: [
        ["unpredictable", "adjective"],
        ["unpredictability", "noun"],
        ["unpredictably", "adverb"],
        ["it was unpredictable", "clause"],
      ],
    },
    {
      scene: "sec-ocean-acidification",
      text: "As seawater absorbs carbon dioxide from the air, it becomes more acidic, a change that weakens the shells of oysters, slows the growth of corals, and ______ the delicate shells of some tiny drifting snails.",
      form: "present",
      given: ["weakens the shells of oysters", "slows the growth of corals"],
      choices: [["dissolves", "present"], ["dissolving", "gerund"], ["to dissolve", "infinitive"], ["it dissolves", "clause"]],
    },
    {
      scene: "sec-oral-historians",
      text: "Oral historians who record the memories of older residents must do more than ask good questions. Their work involves earning the trust of the people they interview, transcribing hours of recordings, and ______.",
      form: "gerund",
      given: ["earning the trust of the people they interview", "transcribing hours of recordings"],
      choices: [
        ["securing permission to archive each interview", "gerund"],
        ["to secure permission to archive each interview", "infinitive"],
        ["they secure permission to archive each interview", "clause"],
        ["permission is secured to archive each interview", "clause"],
      ],
    },
    {
      scene: "sec-maya-lin-competition",
      text: "In 1981, Maya Lin, then a 21-year-old architecture student at Yale University, entered a national design competition, submitted a plan for a memorial of two black granite walls, and ______ over more than 1,400 other entries.",
      form: "past",
      given: ["entered a national design competition", "submitted a plan for a memorial"],
      choices: [["won", "past"], ["winning", "gerund"], ["to win", "infinitive"], ["she won", "clause"]],
    },
    {
      scene: "sec-monsoon-effects",
      text: "About three-quarters of India's yearly rainfall arrives during the summer monsoon. As a result, the monsoon's timing shapes the planting of rice, the level of water in reservoirs, and ______ in local markets.",
      form: "noun",
      given: ["the planting of rice", "the level of water in reservoirs"],
      choices: [
        ["the prices of many foods", "noun"],
        ["many foods cost more", "clause"],
        ["to set the price of foods", "infinitive"],
        ["pricing many kinds of food", "gerund"],
      ],
    },
    {
      scene: "sec-glassblowing-vase",
      text: "To make a simple glass vase, an artisan must gather molten glass on the end of a hollow pipe, blow air into the pipe to form a bubble, and ______ with metal tools while the glass is still soft.",
      form: "base",
      given: ["gather molten glass on the end of a hollow pipe", "blow air into the pipe"],
      choices: [["shape the bubble", "base"], ["shaping the bubble", "gerund"], ["to shape the bubble", "infinitive"], ["the bubble is shaped", "clause"]],
    },
  ];

  const FORM_NAMES = {
    gerund: "an -ing phrase",
    infinitive: "a “to” phrase",
    past: "a past-tense verb phrase",
    present: "a present-tense verb phrase",
    base: "a plain verb phrase",
    noun: "a noun phrase",
    adjective: "an adjective",
    adverb: "an adverb",
    clause: "a complete clause with its own subject",
    preposition: "a prepositional phrase",
  };
  const FORM_PLURALS = {
    gerund: "-ing phrases",
    infinitive: "“to” phrases",
    past: "past-tense verb phrases",
    present: "present-tense verb phrases",
    base: "plain verb phrases",
    noun: "noun phrases",
    adjective: "adjectives",
  };
  const PRONOUN_STARTS = ["she", "he", "it", "they", "we"];
  // The form a phrase shows on its surface, when its first word settles it.
  function formByWords(phrase) {
    const first = lower(firstWordOf(phrase));
    if (first === "to") return "infinitive";
    if (PRONOUN_STARTS.includes(first)) return "clause";
    if (/ing$/.test(first) && first !== "during") return "gerund";
    return null;
  }
  const formsAgree = (phrase, form) => {
    const seen = formByWords(phrase);
    return seen === null || seen === form;
  };

  const parallelSeries = {
    id: "sec-parallel-series",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "parallel structure",
    difficulty: "Easy",
    title: "Last item in a series",
    recognize: "The first two items of the series share one grammatical form; the third item must take the same form.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["equivalent-form"],
    build(t) {
      const topic = t.pick(SERIES_TOPICS);
      const [key] = topic.choices.find(([, form]) => form === topic.form);
      const wrong = topic.choices
        .filter(([, form]) => form !== topic.form)
        .map(([choice, form]) => [choice, `This is ${FORM_NAMES[form]}, but the other items in the series are ${FORM_PLURALS[topic.form]}, so the series is no longer parallel.`]);
      return item(topic, this, {
        correct: key,
        wrong,
        explanation: `The series already has two items in the same form, ${q(topic.given[0])} and ${q(topic.given[1])}, each ${FORM_NAMES[topic.form]}. The third item must match, and only ${q(key)} does.`,
        steps: [
          "Find the other items in the series.",
          `Both are ${FORM_PLURALS[topic.form]}.`,
          "Choose the only option in that same form.",
        ],
        principles: ["Items joined in a series must share the same grammatical form."],
        trap: "Choosing a phrase that makes sense on its own without checking that it matches the other items.",
        hint: "Line up the three items of the series one under another.",
        verify: () => {
          const lead = beforeBlank(topic.text);
          return hasOneBlank(topic.text) &&
            /,?\s(and|or)\s$/.test(lead) &&
            topic.given.every((phrase) => lead.includes(phrase) && formsAgree(phrase, topic.form)) &&
            topic.choices.every(([choice, form]) => formsAgree(choice, form)) &&
            topic.choices.filter(([, form]) => form === topic.form).length === 1 &&
            formsAgree(key, topic.form) &&
            topic.given.every((phrase) => formByWords(phrase) === formByWords(key));
        },
      });
    },
  };

  /* ------------------------------------ subject-verb agreement: attractor */

  // A long phrase separates the subject's head noun from the verb and ends in
  // a noun of the other number. forms[number][0] is the form the passage's
  // tense calls for; the key is the head noun's number, the distractors the
  // attractor's.
  const ATTRACTOR_TOPICS = [
    {
      scene: "sec-tree-ring-width",
      text: "Dendrochronologists read the history of past climates in wood. In the dry American Southwest, the width of the growth rings in the oldest Douglas firs ______ how much rain fell in each year of the trees' long lives, a record that can stretch back centuries.",
      head: "width",
      attractor: "firs",
      forms: { singular: ["reveals", "has revealed", "is revealing"], plural: ["reveal", "have revealed", "are revealing"] },
    },
    {
      scene: "sec-riverside-poets-letters",
      text: "Historians of the Riverside Poets, a circle of writers active in Cincinnati in the 1930s, have long known that its members read and criticized one another's drafts. An archive of more than three hundred letters from the poet Delia Hart to her fellow writers ______ just how closely they worked together on revisions.",
      head: "archive",
      attractor: "writers",
      forms: { singular: ["shows", "has shown", "is showing"], plural: ["show", "have shown", "are showing"] },
    },
    {
      scene: "sec-tanager-molt",
      text: "Each autumn, the male scarlet tanager trades its breeding colors for camouflage. The brilliant red feathers on the back and breast of the male ______ replaced by olive-green ones before the bird migrates to South America for the winter.",
      head: "feathers",
      attractor: "male",
      forms: { plural: ["are", "have been", "were"], singular: ["is", "has been", "was"] },
    },
    {
      scene: "sec-ferreira-murals",
      text: "In 1938, the painter Luis Ferreira covered the walls of a small post office in New Mexico with scenes of local life. Each of the twelve panels, which show farmers, miners, and railroad workers, ______ painted directly onto the wall's wet plaster.",
      head: "Each",
      attractor: "workers",
      forms: { singular: ["was", "has been", "is"], plural: ["were", "have been", "are"] },
    },
    {
      scene: "sec-almond-hives",
      text: "Almond growers in California's Central Valley rent honeybees every February to pollinate their trees. The number of hives trucked into the valley's orchards ______ along with the almond harvest, and it now exceeds two million each year.",
      head: "number",
      attractor: "orchards",
      forms: { singular: ["has grown", "grows", "was growing"], plural: ["have grown", "grow", "were growing"] },
    },
    {
      scene: "sec-dome-tiles",
      text: "Byzantine mosaic makers rarely set their glass tiles perfectly flat. The small gold tiles covering the dome of the church ______ tilted at slightly different angles, so they catch and scatter the light of the candles below.",
      head: "tiles",
      attractor: "church",
      forms: { plural: ["are", "have been", "were"], singular: ["is", "has been", "was"] },
    },
    {
      scene: "sec-cristofori-piano",
      text: "Bartolomeo Cristofori built the first pianos in Florence around 1700, and only three of the instruments he made are known to survive. One of his three surviving instruments ______ on display at the Metropolitan Museum of Art in New York.",
      head: "One",
      attractor: "instruments",
      forms: { singular: ["is", "has been", "was"], plural: ["are", "have been", "were"] },
    },
    {
      scene: "sec-morpho-scales",
      text: "The blue morpho butterfly of Central and South American rainforests is one of the most brilliantly colored insects on Earth. Yet the microscopic scales covering each wing of the butterfly ______ no blue pigment at all; the color comes from the way tiny ridges on each scale reflect light.",
      head: "scales",
      attractor: "butterfly",
      forms: { plural: ["contain", "have contained", "are containing"], singular: ["contains", "has contained", "is containing"] },
    },
    {
      scene: "sec-reservoir-trackway",
      text: "When a drought lowered a reservoir in northern Spain, it exposed dinosaur tracks usually hidden beneath the water. A single trail of sixty-one footprints ______ nearly 120 meters across the exposed rock, suggesting that one animal walked the whole distance at a steady pace.",
      head: "trail",
      attractor: "footprints",
      forms: { singular: ["stretches", "has stretched", "is stretching"], plural: ["stretch", "have stretched", "are stretching"] },
    },
    {
      scene: "sec-harbor-panel",
      text: "Should the city's harbor be dredged so that larger cargo ships can enter? After a year of study, a panel of eleven marine biologists and engineers ______ to recommend against the project, citing the likely damage to the harbor's oyster beds.",
      head: "panel",
      attractor: "engineers",
      forms: { singular: ["has voted", "votes", "was voting"], plural: ["have voted", "vote", "were voting"] },
    },
    {
      scene: "sec-ocracoke-recordings",
      text: "Since the 1990s, linguists have documented the distinctive English spoken on Ocracoke Island, off the coast of North Carolina. A collection of recordings made with the island's oldest residents ______ features of speech, such as pronouncing “high tide” as “hoi toide,” that younger islanders rarely use.",
      head: "collection",
      attractor: "residents",
      forms: { singular: ["preserves", "has preserved", "is preserving"], plural: ["preserve", "have preserved", "are preserving"] },
    },
    {
      scene: "sec-ge-ware-crackle",
      text: "Potters in China during the Song dynasty prized a stoneware known as Ge ware for its glaze. The fine cracks running through the glaze of a Ge ware vase ______ not signs of damage; potters produced them deliberately with a glaze that shrinks more than the clay beneath it as the vessel cools.",
      head: "cracks",
      attractor: "vase",
      forms: { plural: ["are", "have been", "were"], singular: ["is", "has been", "was"] },
    },
  ];

  const attractorAgreement = {
    id: "sec-sva-attractor",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "subject-verb agreement",
    difficulty: "Medium",
    title: "Verb separated from its subject by a phrase",
    recognize: "The noun right before the blank belongs to a phrase describing the subject; the verb agrees with the subject's head noun, several words earlier.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["agreement-attractor", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(ATTRACTOR_TOPICS);
      const number = nounNumber(topic.head);
      const key = topic.forms[number][0];
      const distractors = topic.forms[other(number)];
      const head = topic.head === "Each" || topic.head === "One" ? lower(topic.head) : topic.head;
      return item(topic, this, {
        correct: key,
        wrong: distractors.map((form) => [form, numberReason(form, head, number, topic.attractor)]),
        explanation: `The verb's subject is ${q(head)}, which is ${number}; ${q(topic.attractor)} belongs to the phrase that describes it. The ${number} verb ${q(key)} agrees with ${q(head)} and fits the passage's tense.`,
        steps: [
          "Find the verb's subject by stripping away the phrases that describe it.",
          `The head noun is ${q(head)}, which is ${number}; ${q(topic.attractor)} is part of a modifying phrase.`,
          `Choose the ${number} verb that fits the passage's time frame.`,
        ],
        principles: [
          "A verb agrees with the head of its subject, not with a noun inside a phrase that describes the subject.",
          ...(head === "each" || head === "one" || head === "number"
            ? [`${q(head === "number" ? "The number of" : `${head[0].toUpperCase()}${head.slice(1)} of`)} takes a singular verb, whatever noun follows “of.”`]
            : []),
        ],
        trap: `Making the verb agree with ${q(topic.attractor)}, the ${other(number)} noun right before the blank.`,
        hint: "Cross out the phrase between the subject and the verb, then read the sentence again.",
        verify: () => {
          const sentence = blankSentence(topic.text);
          return hasOneBlank(topic.text) &&
            lastWordOf(beforeBlank(topic.text)) === topic.attractor &&
            wordsOf(sentence).includes(topic.head) &&
            wordsOf(sentence).indexOf(topic.head) < wordsOf(sentence).lastIndexOf(topic.attractor) &&
            nounNumber(topic.attractor) === other(number) &&
            verbNumber(key) === number &&
            distractors.length === 3 &&
            distractors.every((form) => verbNumber(form) === other(number));
        },
      });
    },
  };

  /* ------------------------------------- subject-verb agreement: inverted */

  // A fronted phrase (or "there") puts the verb before its subject. The
  // noun in the fronted phrase has the other number.
  const INVERTED_TOPICS = [
    {
      scene: "sec-whale-hall",
      text: "Visitors entering the natural history museum's central hall tend to stop and look up. Hanging from the ceiling of the hall ______ the skeletons of a blue whale and a humpback whale, each assembled from bones recovered on the same stretch of coast.",
      subjectHead: "skeletons",
      lure: "hall",
      forms: { plural: ["are", "have been", "were"], singular: ["is", "has been", "was"] },
    },
    {
      scene: "sec-trappist-planets",
      text: "The dim red star TRAPPIST-1 lies about forty light-years from Earth. Around this single small star there ______ seven rocky planets, at least three of which orbit at distances where liquid water could exist on their surfaces.",
      subjectHead: "planets",
      lure: "star",
      forms: { plural: ["are", "have been", "were"], singular: ["is", "has been", "was"] },
    },
    {
      scene: "sec-canyon-petroglyphs",
      text: "The desert canyon holds a record of the people who passed through it over thousands of years. Carved into the dark sandstone of its northern wall ______ hundreds of petroglyphs, some showing bighorn sheep and others showing spirals and human figures.",
      subjectHead: "hundreds",
      lure: "wall",
      forms: { plural: ["are", "have been", "were"], singular: ["is", "has been", "was"] },
    },
    {
      scene: "sec-goby-burrow",
      text: "On sandy stretches of coral reef, some burrows have two residents. Among the reef's many burrowing animals ______ a small goby that shares a home with a nearly blind shrimp: the shrimp digs and maintains the burrow, while the goby keeps watch for predators.",
      subjectHead: "goby",
      lure: "animals",
      forms: { singular: ["is", "has been", "was"], plural: ["are", "have been", "were"] },
    },
    {
      scene: "sec-monastery-herbal",
      text: "The monastery's library has survived fires, floods, and two wars. Within its vast collection of medieval manuscripts ______ a thirteenth-century herbal whose hand-painted illustrations of medicinal plants remain surprisingly bright.",
      subjectHead: "herbal",
      lure: "manuscripts",
      forms: { singular: ["is", "has been", "was"], plural: ["are", "have been", "were"] },
    },
    {
      scene: "sec-chicxulub-crater",
      text: "The asteroid impact that ended the age of the dinosaurs left a scar that geologists can still trace. Beneath the Yucatán Peninsula's limestone plains and coastal towns there ______ a buried crater more than 180 kilometers wide, its rim marked at the surface by a ring of sinkholes.",
      subjectHead: "crater",
      lure: "towns",
      forms: { singular: ["is", "has been", "was"], plural: ["are", "have been", "were"] },
    },
    {
      scene: "sec-chauvet-panel",
      text: "France's Chauvet Cave was sealed by a rockfall for thousands of years, which preserved its interior. Deep inside the cave, past chambers scattered with the bones of cave bears, ______ a panel of charcoal drawings of horses, rhinoceroses, and lions made more than 30,000 years ago.",
      subjectHead: "panel",
      lure: "bears",
      forms: { singular: ["is", "has been", "was"], plural: ["are", "have been", "were"] },
    },
    {
      scene: "sec-orchestra-woodwinds",
      text: "A symphony orchestra's seating plan reflects both tradition and acoustics. Behind the rows of string players in most orchestras ______ the woodwind section, with flutes and oboes in front and clarinets and bassoons behind them.",
      subjectHead: "section",
      lure: "players",
      forms: { singular: ["sits", "has sat", "is sitting"], plural: ["sit", "have sat", "are sitting"] },
    },
    {
      scene: "sec-prairie-erratics",
      text: "Thousands of years ago, an ice sheet covered much of what is now central Canada. Scattered across the otherwise flat prairie ______ granite boulders the size of cars, carried hundreds of kilometers south by the ice and left behind when it melted.",
      subjectHead: "boulders",
      lure: "prairie",
      forms: { plural: ["lie", "have lain", "are lying"], singular: ["lies", "has lain", "is lying"] },
    },
    {
      scene: "sec-attic-trunk-letters",
      text: "When the old farmhouse was sold in 2019, its new owners began clearing out the attic. Inside a cedar trunk pushed against the chimney ______ dozens of letters that a Union soldier had written to his family during the Civil War.",
      subjectHead: "dozens",
      lure: "chimney",
      forms: { plural: ["were", "have been", "are"], singular: ["was", "has been", "is"] },
    },
    {
      scene: "sec-logbook-violet",
      text: "Historian Marisol Duarte expected the captain's papers to contain only weather reports and positions. Tucked between the pages of his three logbooks, however, ______ a single pressed violet, the only object in the collection that hints at his life outside the navy.",
      subjectHead: "violet",
      lure: "logbooks",
      forms: { singular: ["was", "has been", "is"], plural: ["were", "have been", "are"] },
    },
    {
      scene: "sec-seneca-falls-signers",
      text: "About three hundred people attended the women's rights convention held in Seneca Falls, New York, in July 1848. Among the one hundred signers of its Declaration of Sentiments ______ Frederick Douglass, the only African American known to have attended.",
      subjectHead: "Douglass",
      lure: "signers",
      forms: { singular: ["was", "has been", "is"], plural: ["were", "have been", "are"] },
    },
    {
      scene: "sec-alma-antennas",
      text: "Astronomers chose the site for the ALMA observatory because the air there is extremely thin and dry. On the Chajnantor plateau in Chile's Atacama Desert, about 5,000 meters above sea level, ______ the observatory's sixty-six radio antennas.",
      subjectHead: "antennas",
      lure: "plateau",
      forms: { plural: ["stand", "have stood", "are standing"], singular: ["stands", "has stood", "is standing"] },
    },
  ];

  const invertedAgreement = {
    id: "sec-sva-inverted",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "subject-verb agreement",
    difficulty: "Medium",
    title: "Verb that comes before its subject",
    recognize: "The sentence opens with a phrase (or “there”), so the subject follows the verb; the verb agrees with that later noun, not with the noun in the opening phrase.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["agreement-attractor", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(INVERTED_TOPICS);
      const number = nounNumber(topic.subjectHead);
      const key = topic.forms[number][0];
      const distractors = topic.forms[other(number)];
      return item(topic, this, {
        correct: key,
        wrong: distractors.map((form) => [form, numberReason(form, topic.subjectHead, number, topic.lure)]),
        explanation: `The sentence is inverted: the opening phrase tells where, and the subject comes after the verb. That subject is headed by ${q(topic.subjectHead)}, which is ${number}, so the verb must be the ${number} ${q(key)}.`,
        steps: [
          "Notice that the sentence opens with a phrase of place or with “there,” so the verb comes before its subject.",
          `Find the subject after the blank: its head noun is ${q(topic.subjectHead)}, which is ${number}.`,
          `Choose the ${number} verb that fits the passage's tense.`,
        ],
        principles: ["When a sentence opens with a phrase or with “there,” the verb agrees with the subject that follows it."],
        trap: `Making the verb agree with ${q(topic.lure)}, a noun in the opening phrase, as if it were the subject.`,
        hint: "Turn the sentence around so that it starts with its subject, then choose the verb.",
        verify: () => {
          const opening = wordsOf(afterBlank(topic.text)).slice(0, 6);
          return hasOneBlank(topic.text) &&
            opening.includes(topic.subjectHead) &&
            wordsOf(blankSentence(topic.text)).includes(topic.lure) &&
            nounNumber(topic.lure) === other(number) &&
            verbNumber(key) === number &&
            distractors.length === 3 &&
            distractors.every((form) => verbNumber(form) === other(number));
        },
      });
    },
  };

  /* ----------------------------- parallel structure: paired constructions */

  // Correlative pairs (not only / but also, both / and, either / or,
  // neither / nor) and comparisons (than, as ... as): the element after the
  // second half must match the element after the first.
  const PAIRED_TOPICS = [
    {
      scene: "sec-cochineal-dye",
      text: "Cochineal, a crimson dye made from crushed insects that feed on prickly pear cacti, not only colored the robes of European royalty but also ______ one of colonial Mexico's most valuable exports, second only to silver.",
      pair: ["not only", "but also"],
      first: "colored",
      form: "past",
      choices: [["became", "past"], ["becoming", "gerund"], ["it became", "clause"], ["to become", "infinitive"]],
    },
    {
      scene: "sec-mckay-sonnets",
      text: "Claude McKay, a leading writer of the Harlem Renaissance, published both sonnets in a strict traditional form and ______ about working-class life in Harlem and in the French port of Marseille.",
      pair: ["both", "and"],
      first: "sonnets",
      form: "noun",
      choices: [["novels", "noun"], ["he wrote novels", "clause"], ["writing novels", "gerund"], ["to write novels", "infinitive"]],
    },
    {
      scene: "sec-lungfish-cocoon",
      text: "When the pools of the African floodplains dry up each year, a lungfish must either find deeper water or ______ into the mud, where it seals itself inside a cocoon of mucus until the rains return.",
      pair: ["either", "or"],
      first: "find",
      form: "base",
      choices: [["burrow", "base"], ["burrowing", "gerund"], ["to burrow", "infinitive"], ["it burrows", "clause"]],
    },
    {
      scene: "sec-antikythera-gears",
      text: "The Antikythera mechanism, a bronze device recovered in 1901 from an ancient shipwreck off a Greek island, was neither a clock nor ______; researchers have shown that its gears modeled the motions of the Sun and Moon and predicted eclipses.",
      pair: ["neither", "nor"],
      first: "a clock",
      form: "noun",
      choices: [["a navigation tool", "noun"], ["used for navigation", "participle"], ["did it aid navigation", "clause"], ["to aid navigation", "infinitive"]],
    },
    {
      scene: "sec-borneo-gibbons",
      text: "In the dense forests of Borneo, where the canopy blocks the view from the ground, researchers find that identifying gibbons by their loud morning songs is far easier than ______ the apes through the leaves.",
      pair: ["identifying", "than"],
      first: "identifying",
      form: "gerund",
      choices: [["spotting", "gerund"], ["to spot", "infinitive"], ["they spot", "clause"], ["for spotting", "preposition"]],
    },
    {
      scene: "sec-flamingo-pigment",
      text: "Flamingos are not born pink; their chicks are gray. The pigments that eventually color an adult flamingo's feathers come not from the bird's own body but ______.",
      pair: ["not", "but"],
      first: "from the bird's own body",
      form: "preposition",
      choices: [
        ["from the algae and brine shrimp that it eats", "preposition"],
        ["the algae and brine shrimp that it eats", "noun"],
        ["it gets them from the algae and shrimp it eats", "clause"],
        ["eating algae and brine shrimp", "gerund"],
      ],
    },
    {
      scene: "sec-tsunami-warnings",
      text: "The Indian Ocean tsunami of December 2004, which struck coastlines from Indonesia to East Africa, both reshaped entire shorelines and ______ how scientists warn coastal communities of approaching waves.",
      pair: ["both", "and"],
      first: "reshaped",
      form: "past",
      choices: [["changed", "past"], ["changing", "gerund"], ["it changed", "clause"], ["to change", "infinitive"]],
    },
    {
      scene: "sec-warbler-songs",
      text: "In spring, many North American warblers sing constantly from high in the treetops, where they are hard to see. For experienced birders, identifying a warbler by its song is often as quick as ______ it by its plumage.",
      pair: ["identifying", "as quick as"],
      first: "identifying",
      form: "gerund",
      choices: [["identifying", "gerund"], ["to identify", "infinitive"], ["they identify", "clause"], ["for identifying", "preposition"]],
    },
    {
      scene: "sec-alexandria-library",
      text: "The Library of Alexandria, founded in Egypt in the third century BCE, held not only copies of Greek plays and poems but also ______ on mathematics, astronomy, geography, and medicine.",
      pair: ["not only", "but also"],
      first: "copies",
      form: "noun",
      choices: [["treatises", "noun"], ["writing treatises", "gerund"], ["it held treatises", "clause"], ["to collect treatises", "infinitive"]],
    },
    {
      scene: "sec-backcountry-permits",
      text: "Under a national park's new rules, hikers who want to camp in the backcountry must either travel with a licensed guide or ______ a permit and attend a safety briefing before setting out.",
      pair: ["either", "or"],
      first: "travel",
      form: "base",
      choices: [["obtain", "base"], ["obtaining", "gerund"], ["to obtain", "infinitive"], ["they obtain", "clause"]],
    },
    {
      scene: "sec-inca-llamas",
      text: "The Inca built no wheeled vehicles for carrying goods. On the steep roads that connected their empire, it was easier to move cargo with caravans of llamas than ______ it on carts.",
      pair: ["to move", "than"],
      first: "to move",
      form: "infinitive",
      choices: [["to haul", "infinitive"], ["hauling", "gerund"], ["they hauled", "clause"], ["for hauling", "preposition"]],
    },
    {
      scene: "sec-pony-express",
      text: "The Pony Express, which carried mail between Missouri and California in about ten days, neither made a profit nor ______ long: it shut down in October 1861, two days after the transcontinental telegraph line was completed.",
      pair: ["neither", "nor"],
      first: "made",
      form: "past",
      choices: [["lasted", "past"], ["lasting", "gerund"], ["it lasted", "clause"], ["to last", "infinitive"]],
    },
    {
      scene: "sec-hagia-sophia",
      text: "Completed in 537, the Hagia Sophia in Istanbul was for centuries the largest church in the Christian world. Since then, the building has served not only as a Christian cathedral but also ______, and for much of the twentieth century it was a museum.",
      pair: ["not only", "but also"],
      first: "as a Christian cathedral",
      form: "preposition",
      choices: [
        ["as an imperial mosque", "preposition"],
        ["an imperial mosque", "noun"],
        ["it became an imperial mosque", "clause"],
        ["serving as an imperial mosque", "gerund"],
      ],
    },
  ];

  const parallelPaired = {
    id: "sec-parallel-paired",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "parallel structure",
    difficulty: "Medium",
    title: "Second half of a paired construction",
    recognize: "A pair such as “not only … but also,” “either … or,” or a comparison with “than” joins two elements; the element after the second half must match the form of the element after the first.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(PAIRED_TOPICS);
      const [key] = topic.choices.find(([, form]) => form === topic.form);
      const [opener, closer] = topic.pair;
      const wrong = topic.choices
        .filter(([, form]) => form !== topic.form)
        .map(([choice, form]) => [choice, `This is ${FORM_NAMES[form] || "a participial phrase"}, which does not match ${q(topic.first)}, ${FORM_NAMES[topic.form]}, on the other side of ${q(closer)}.`]);
      return item(topic, this, {
        correct: key,
        wrong,
        explanation: `The construction pairs ${q(topic.first)}, which follows ${q(opener)}, with whatever follows ${q(closer)}. Because ${q(topic.first)} is ${FORM_NAMES[topic.form]}, the second element must be one too, and only ${q(key)} is.`,
        steps: [
          `Find the first half of the pair, ${q(opener)}, and the element that follows it, ${q(topic.first)}.`,
          `Identify its form: ${FORM_NAMES[topic.form]}.`,
          `Choose the option after ${q(closer)} that has the same form.`,
        ],
        principles: [
          "The two elements joined by a paired construction (not only / but also, either / or, neither / nor, both / and) or compared with “than” or “as” must be parallel in form.",
        ],
        trap: `Choosing an option that reads smoothly right after ${q(closer)} without matching it to ${q(topic.first)}.`,
        hint: `What comes right after ${q(opener)}? Make the words after ${q(closer)} match it.`,
        verify: () => {
          const lead = beforeBlank(topic.text);
          const openAt = lead.indexOf(opener);
          const firstAt = lead.indexOf(topic.first, openAt);
          return hasOneBlank(topic.text) &&
            openAt >= 0 &&
            firstAt >= openAt &&
            lead.trimEnd().endsWith(closer) &&
            formsAgree(topic.first, topic.form) &&
            formByWords(topic.first) === formByWords(key) &&
            topic.choices.every(([choice, form]) => formsAgree(choice, form)) &&
            topic.choices.filter(([, form]) => form === topic.form).length === 1;
        },
      });
    },
  };

  /* ------------------------------------------ pronoun: distant antecedent */

  // A possessive whose antecedent is several words (often a sentence) back,
  // with nouns of the other number in between that cannot sensibly own the
  // thing named after the blank.
  const DISTANT_PRONOUN_TOPICS = [
    {
      scene: "sec-seed-vault-chambers",
      text: "The Svalbard Global Seed Vault, built into a mountainside on a remote Norwegian island, stores backup copies of seeds sent from around the world. Because ______ storage chambers sit deep inside permafrost, the samples would stay frozen even if the power failed.",
      antecedent: "Vault",
      competitors: ["copies", "seeds"],
      noun: "storage chambers",
    },
    {
      scene: "sec-emperor-penguin-eggs",
      text: "Emperor penguins are the only birds that breed during the Antarctic winter. After laying a single egg, a female returns to the sea to feed, leaving the males behind. For about two months, through the darkness and wind of the polar winter, each egg rests on ______ feet beneath a warm fold of skin.",
      antecedent: "males",
      competitors: ["egg", "winter"],
      noun: "feet",
    },
    {
      scene: "sec-cuttlefish-color",
      text: "The common cuttlefish can change color in less than a second. The speed comes from chromatophores, millions of small elastic sacs of pigment, each ringed by tiny muscles. Because the sacs lie just beneath ______ skin, even a slight contraction of the muscles changes how the animal looks.",
      antecedent: "cuttlefish",
      competitors: ["chromatophores", "sacs", "muscles"],
      noun: "skin",
    },
    {
      scene: "sec-hubble-mirror",
      text: "Launched in 1990, the Hubble Space Telescope orbits about 540 kilometers above Earth. Astronauts on five space shuttle missions repaired and upgraded the observatory between 1993 and 2009, and the first of those missions installed corrective optics to compensate for a flaw in ______ primary mirror.",
      antecedent: "observatory",
      competitors: ["missions", "optics"],
      noun: "primary mirror",
    },
    {
      scene: "sec-coral-polyp-bleaching",
      text: "A reef-building coral polyp gets most of its food from partners: single-celled algae that live inside the polyp's tissue and make sugar from sunlight. When the water grows too warm, however, the polyp expels the algae, and ______ white skeleton shows through the now-transparent tissue.",
      antecedent: "polyp",
      competitors: ["algae"],
      noun: "white skeleton",
    },
    {
      scene: "sec-sagrada-familia-spires",
      text: "Antoni Gaudí took charge of Barcelona's Sagrada Família basilica in 1883 and devoted the last years of his life to it. Construction has continued in the century since his death, paid for largely by the millions of visitors who tour the site each year, and when complete, ______ eighteen spires will rise higher than those of any other church.",
      antecedent: "basilica",
      competitors: ["visitors"],
      noun: "eighteen spires",
    },
    {
      scene: "sec-mantis-shrimp-strike",
      text: "The peacock mantis shrimp eats snails and crabs, cracking their shells open before eating them. Filming with high-speed cameras, biologists found that ______ club-shaped forelimbs strike with an acceleration comparable to that of a bullet leaving a gun.",
      antecedent: "shrimp",
      competitors: ["crabs", "cameras", "biologists"],
      noun: "club-shaped forelimbs",
    },
    {
      scene: "sec-terracotta-paint",
      text: "The roughly 8,000 life-size clay soldiers buried near the tomb of China's first emperor, Qin Shi Huang, were once brightly painted. When excavation began in 1974, exposure to the dry air caused much of ______ original color to flake off within minutes.",
      antecedent: "soldiers",
      competitors: ["tomb", "emperor", "excavation", "air"],
      noun: "original color",
    },
    {
      scene: "sec-tardigrade-glass",
      text: "The tardigrade, an animal less than a millimeter long, can survive for years without water. As its surroundings dry out, the animal curls into a dormant ball called a tun, and special proteins turn into a glasslike solid inside ______ cells, holding delicate molecules in place until water returns.",
      antecedent: "animal",
      competitors: ["proteins"],
      noun: "cells",
    },
    {
      scene: "sec-flytrap-hairs",
      text: "The Venus flytrap, which grows wild only in the wetlands of North and South Carolina, catches insects without any muscles. The trap snaps shut when crawling insects touch the sensitive hairs on ______ leaves twice within about twenty seconds, a rule that keeps raindrops from setting it off.",
      antecedent: "trap",
      competitors: ["insects", "hairs"],
      noun: "leaves",
    },
    {
      scene: "sec-eiffel-tower-paint",
      text: "Gustave Eiffel's company assembled the Eiffel Tower in 1889 from more than 18,000 iron pieces held together by about 2.5 million rivets. Every seven years, painters spend months applying some sixty tonnes of paint to protect ______ iron framework from rust.",
      antecedent: "Tower",
      competitors: ["pieces", "rivets", "painters"],
      noun: "iron framework",
    },
    {
      scene: "sec-voyager-instruments",
      text: "NASA launched the twin Voyager spacecraft in 1977 to study the outer planets. Both probes eventually crossed the heliopause, the edge of the bubble of charged particles that the Sun blows around itself, and to conserve power, engineers have gradually switched off many of ______ instruments.",
      antecedent: "probes",
      competitors: ["heliopause", "bubble", "Sun"],
      noun: "instruments",
    },
    {
      scene: "sec-bossou-chimpanzees",
      text: "Chimpanzees in the Bossou forest of Guinea crack open oil-palm nuts with a pair of stones: a flat anvil and a heavy hammer. Mastering the technique takes years, and young chimpanzees watch adults for a long time before attempting to crack ______ first nut.",
      antecedent: "chimpanzees",
      competitors: ["technique", "anvil", "hammer"],
      noun: "first nut",
    },
    {
      scene: "sec-bronte-little-books",
      text: "As children in the 1820s and 1830s, Charlotte, Emily, Anne, and Branwell Brontë invented imaginary kingdoms and wrote about them in tiny handmade books. Many of these books, which are smaller than a playing card, survive today, and scholars often need a magnifying glass to read ______ cramped handwriting.",
      antecedent: "children",
      competitors: ["card", "glass"],
      noun: "cramped handwriting",
    },
  ];

  const POSSESSIVES = { singular: "its", plural: "their" };
  const CONTRACTIONS = { singular: "it's", plural: "they're" };

  const distantPronoun = {
    id: "sec-pronoun-distant-antecedent",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "pronoun agreement",
    difficulty: "Hard",
    title: "Possessive pronoun with a distant antecedent",
    recognize: "The owner of the thing after the blank is named far back; the nouns in between have the other number and cannot sensibly own it.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["agreement-attractor", "grammatical-but-illogical"],
    build(t) {
      const topic = t.pick(DISTANT_PRONOUN_TOPICS);
      const number = nounNumber(topic.antecedent);
      const key = POSSESSIVES[number];
      const wrongPossessive = POSSESSIVES[other(number)];
      const lead = beforeBlank(topic.text);
      const near = topic.competitors.reduce((best, noun) => (lead.lastIndexOf(noun) > lead.lastIndexOf(best) ? noun : best));
      const [owned, belongs] = nounNumber(topic.noun) === "plural" ? ["they", "belong"] : ["it", "belongs"];
      return item(topic, this, {
        correct: key,
        wrong: [
          [wrongPossessive, `${q(wrongPossessive)} is ${other(number)}, so it would point to a noun such as ${q(near)}, which cannot own the ${topic.noun}; ${owned} ${belongs} to the ${number} ${q(topic.antecedent)}.`],
          [CONTRACTIONS[number], `${q(CONTRACTIONS[number])} means ${q(number === "singular" ? "it is" : "they are")}; the blank needs a possessive before ${q(topic.noun)}.`],
          [CONTRACTIONS[other(number)], `${q(CONTRACTIONS[other(number)])} is a contraction, not a possessive, and it is also ${other(number)}.`],
        ],
        explanation: `The ${topic.noun} ${belongs} to the ${q(topic.antecedent)}, which is ${number}, so the possessive must be ${q(key)}. The nearer ${other(number)} nouns (${topic.competitors.map(q).join(", ")}) cannot own the ${topic.noun}.`,
        steps: [
          `Ask whose ${topic.noun} the sentence means.`,
          `Trace that owner back to ${q(topic.antecedent)}, which is ${number}, past the ${other(number)} nouns in between.`,
          `Choose the ${number} possessive, ${q(key)}; a contraction cannot come before a noun this way.`,
        ],
        principles: [
          "A pronoun agrees in number with the noun it refers to, even when other nouns come between them.",
          "“Its” and “their” are possessives; “it's” and “they're” are contractions of “it is” and “they are.”",
        ],
        trap: `Choosing ${q(wrongPossessive)} to match ${q(near)}, a nearer ${other(number)} noun that cannot own the ${topic.noun}.`,
        hint: `Whose ${topic.noun} are these? Find that owner in the passage and check its number.`,
        verify: () => {
          const lead = wordsOf(beforeBlank(topic.text)).map(lower);
          return hasOneBlank(topic.text) &&
            afterBlank(topic.text).trimStart().startsWith(topic.noun) &&
            lead.includes(lower(topic.antecedent)) &&
            topic.competitors.every((noun) => lead.includes(lower(noun)) && nounNumber(noun) === other(number)) &&
            key === (nounNumber(topic.antecedent) === "singular" ? "its" : "their") &&
            ![wrongPossessive, CONTRACTIONS.singular, CONTRACTIONS.plural].includes(key);
        },
      });
    },
  };

  /* ------------------------------------------------- verb tense: frame */

  // All four choices agree with the subject; only the passage's time frame
  // decides. frame "past": a narrative with a stated past date; "earlier":
  // an action finished before another past moment ("by the time", "by
  // then"); "habitual": a present-tense account of what happens each year.
  const TENSE_TOPICS = [
    {
      scene: "sec-fleming-mold",
      text: "In September 1928, Alexander Fleming returned to his London laboratory after a vacation and noticed that a mold growing on one of his culture plates had killed the bacteria around it. Curious, he ______ the mold in a flask of broth and found that it belonged to the genus Penicillium.",
      frame: "past",
      cue: "In September 1928",
      forms: { present: "grows", past: "grew", presentPerfect: "has grown", pastPerfect: "had grown" },
    },
    {
      scene: "sec-anning-ichthyosaur",
      text: "In 1811, Mary Anning's brother Joseph found the skull of an ichthyosaur in the crumbling cliffs near Lyme Regis, England. About a year later, twelve-year-old Mary ______ the rest of the skeleton, digging it carefully out of the rock.",
      frame: "past",
      cue: "About a year later",
      forms: { present: "uncovers", past: "uncovered", presentPerfect: "has uncovered", pastPerfect: "had uncovered" },
    },
    {
      scene: "sec-curie-elements",
      text: "In 1898, Marie and Pierre Curie were studying pitchblende, a uranium ore that was far more radioactive than its uranium content alone could explain. Later that year, the couple ______ two new elements, polonium and radium, which accounted for the extra radioactivity.",
      frame: "past",
      cue: "Later that year",
      forms: { present: "announce", past: "announced", presentPerfect: "have announced", pastPerfect: "had announced" },
    },
    {
      scene: "sec-coleman-le-crotoy",
      text: "Because no flight school in the United States would admit a Black woman, Bessie Coleman learned French and sailed to France in November 1920. There she ______ for seven months at an aviation school in Le Crotoy, learning to fly in a fragile biplane.",
      frame: "past",
      cue: "November 1920",
      forms: { present: "trains", past: "trained", presentPerfect: "has trained", pastPerfect: "had trained" },
    },
    {
      scene: "sec-erie-canal-freight",
      text: "The Erie Canal, completed in 1825, connected the Hudson River to Lake Erie across 584 kilometers of upstate New York. After the canal opened, the cost of shipping a ton of goods from Buffalo to New York City ______ by roughly 90 percent.",
      frame: "past",
      cue: "After the canal opened",
      forms: { present: "falls", past: "fell", presentPerfect: "has fallen", pastPerfect: "had fallen" },
    },
    {
      scene: "sec-elephant-island-rescue",
      text: "In April 1916, twenty-two men from Ernest Shackleton's expedition were stranded on Elephant Island while Shackleton sailed for help. By the time the Chilean tug Yelcho finally reached the island on August 30, the men ______ there for more than four months, surviving mostly on penguins and seals.",
      frame: "earlier",
      cue: "By the time",
      forms: { present: "live", past: "lived", presentPerfect: "have lived", pastPerfect: "had lived" },
    },
    {
      scene: "sec-pompeii-burial",
      text: "Mount Vesuvius erupted in A.D. 79, sending a column of ash and pumice high into the air above the Bay of Naples. By the time the eruption ended the next day, falling ash and stone ______ the nearby town of Pompeii under several meters of debris.",
      frame: "earlier",
      cue: "By the time",
      forms: { present: "bury", past: "buried", presentPerfect: "have buried", pastPerfect: "had buried" },
    },
    {
      scene: "sec-magellan-voyage",
      text: "Of the roughly 270 men who sailed from Spain with Ferdinand Magellan in 1519, only 18 were aboard the ship Victoria when it returned in September 1522. By then, Magellan himself ______ in a battle in the Philippines, more than a year before the voyage ended.",
      frame: "earlier",
      cue: "By then",
      forms: { present: "dies", past: "died", presentPerfect: "has died", pastPerfect: "had died" },
    },
    {
      scene: "sec-darwin-wallace-letter",
      text: "In June 1858, Charles Darwin received a letter from the naturalist Alfred Russel Wallace outlining a theory of evolution by natural selection. Darwin was stunned: by that time, he ______ on the same idea for nearly twenty years without publishing it.",
      frame: "earlier",
      cue: "by that time",
      forms: { present: "works", past: "worked", presentPerfect: "has worked", pastPerfect: "had worked" },
    },
    {
      scene: "sec-everest-1953",
      text: "Edmund Hillary and Tenzing Norgay reached the summit of Mount Everest on May 29, 1953, as members of a British expedition. By the time they stood on top, several earlier expeditions ______ to climb the mountain and failed, some of them within a few hundred meters of the summit.",
      frame: "earlier",
      cue: "By the time",
      forms: { present: "try", past: "tried", presentPerfect: "have tried", pastPerfect: "had tried" },
    },
    {
      scene: "sec-spotted-salamanders",
      text: "Spotted salamanders spend most of the year underground in the forests of eastern North America. On the first warm, rainy nights of spring, the adults ______ to the same shallow ponds where they hatched, sometimes crossing roads in large numbers.",
      frame: "habitual",
      cue: "spend most of the year",
      forms: { present: "migrate", past: "migrated", presentPerfect: "have migrated", pastPerfect: "had migrated" },
    },
    {
      scene: "sec-periodical-cicadas",
      text: "Periodical cicadas in the eastern United States spend thirteen or seventeen years underground, feeding on sap from tree roots. In the spring of their final year, once the soil about twenty centimeters down warms to roughly 18°C, the nymphs ______ to the surface by the millions.",
      frame: "habitual",
      cue: "spend thirteen or seventeen years",
      forms: { present: "emerge", past: "emerged", presentPerfect: "have emerged", pastPerfect: "had emerged" },
    },
    {
      scene: "sec-old-faithful-timing",
      text: "Yellowstone's Old Faithful is not the park's largest geyser, but it is among the most predictable. Rangers forecast each eruption by timing the one before it: when an eruption lasts longer than about two and a half minutes, the geyser usually ______ again roughly 90 minutes later.",
      frame: "habitual",
      cue: "Rangers forecast each eruption",
      forms: { present: "erupts", past: "erupted", presentPerfect: "has erupted", pastPerfect: "had erupted" },
    },
  ];

  const FRAME_TENSE = { past: "past", earlier: "pastPerfect", habitual: "present" };
  const TENSE_NAMES = {
    present: "simple present",
    past: "simple past",
    presentPerfect: "present perfect",
    pastPerfect: "past perfect",
  };
  const TENSE_REASONS = {
    past: {
      present: "shifts into the present tense in the middle of a narrative set in the past.",
      presentPerfect: "uses the present perfect, which cannot describe an action tied to a finished past time.",
      pastPerfect: "uses the past perfect, which would place this action before the events already described, though it came after them.",
    },
    earlier: {
      present: "shifts into the present tense, though the passage describes a past event.",
      past: "uses the simple past, which does not show that this action was already complete before the past moment the sentence names.",
      presentPerfect: "uses the present perfect, which connects the action to the present rather than to an earlier past moment.",
    },
    habitual: {
      past: "shifts into the past tense, though the passage describes what happens every year in the present tense.",
      presentPerfect: "uses the present perfect, which does not fit a present-tense account of what regularly happens.",
      pastPerfect: "uses the past perfect, which needs a past moment to refer back to; the passage describes a recurring present event.",
    },
  };
  const FRAME_WORDS = {
    past: "a finished past event, told in the simple past",
    earlier: "an action already complete before another past moment",
    habitual: "something that happens regularly, told in the present tense",
  };

  function tenseOf(form, forms) {
    if (/^had\s/.test(form)) return "pastPerfect";
    if (/^(has|have)\s/.test(form)) return "presentPerfect";
    if (form === forms.past) return "past";
    if (form === forms.present) return "present";
    return null;
  }

  const tenseFrame = {
    id: "sec-verb-tense-frame",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "verb form",
    difficulty: "Hard",
    title: "Verb tense set by the passage's time frame",
    recognize: "Every choice agrees with its subject and is grammatical alone; the passage's other verbs and time words decide which tense fits.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(TENSE_TOPICS);
      const needed = FRAME_TENSE[topic.frame];
      const key = topic.forms[needed];
      const wrong = Object.keys(TENSE_NAMES)
        .filter((tense) => tense !== needed)
        .map((tense) => [topic.forms[tense], `${q(topic.forms[tense])} ${TENSE_REASONS[topic.frame][tense]}`]);
      return item(topic, this, {
        correct: key,
        wrong,
        explanation: `The sentence describes ${FRAME_WORDS[topic.frame]} (note ${q(topic.cue)}), so the verb must be the ${TENSE_NAMES[needed]} ${q(key)}.`,
        steps: [
          "Confirm that every choice agrees with the subject, so tense alone decides.",
          `Find the time frame: ${q(topic.cue)} marks ${FRAME_WORDS[topic.frame]}.`,
          `Choose the ${TENSE_NAMES[needed]}, ${q(key)}.`,
        ],
        principles: [
          "A verb's tense must fit the time frame the passage has already set.",
          "The past perfect (“had” plus a past participle) marks an action completed before another past moment.",
        ],
        trap: "Choosing a tense that sounds fine in the sentence alone without checking when the passage says the action happened.",
        hint: "Look for the words that say when this happened, and compare it with the passage's other events.",
        verify: () => {
          const participle = topic.forms.pastPerfect.replace(/^had\s+/, "");
          const tenses = [key, ...wrong.map(([form]) => form)].map((form) => tenseOf(form, topic.forms));
          return hasOneBlank(topic.text) &&
            beforeBlank(topic.text).includes(topic.cue) &&
            new RegExp(`^(has|have) ${participle}$`).test(topic.forms.presentPerfect) &&
            topic.forms.past !== topic.forms.present &&
            tenseOf(key, topic.forms) === needed &&
            new Set(tenses).size === 4 &&
            !tenses.includes(null) &&
            (topic.frame !== "earlier" || /\bby (the time|then|that time)\b/i.test(topic.cue)) &&
            // A narrative frame names its year; a habitual one names none.
            (topic.frame !== "past" || /\b\d{4}\b/.test(beforeBlank(topic.text))) &&
            (topic.frame !== "habitual" || !/\b1\d{3}\b|\b20\d{2}\b/.test(beforeBlank(topic.text)));
        },
      });
    },
  };

  /* ---------------------------------------- verb form: finite or not */

  // Either the sentence still lacks its main verb (a long subject with a
  // nonessential element hides the gap), or it already has one and the
  // blank opens a modifier. mainVerb records the finite verb that follows
  // the blank's element when there is one; each choice is [text, finite].
  const FINITE_TOPICS = [
    {
      scene: "sec-noether-gottingen",
      text: "The German mathematician Emmy Noether, whose 1918 theorem links each symmetry in physics to a quantity that is conserved, such as energy, ______ at the University of Göttingen for years without a salary because women were barred from regular faculty positions.",
      subject: "Emmy Noether",
      mainVerb: null,
      choices: [["taught", true], ["teaching", false], ["having taught", false], ["to teach", false]],
    },
    {
      scene: "sec-zitkala-sa-opera",
      text: "Zitkála-Šá, a Yankton Dakota writer who published essays and stories drawn from her childhood on the Yankton reservation, ______ the libretto for The Sun Dance Opera with the composer William F. Hanson in 1913.",
      subject: "Zitkála-Šá",
      mainVerb: null,
      choices: [["co-wrote", true], ["co-writing", false], ["having co-written", false], ["to co-write", false]],
    },
    {
      scene: "sec-raisin-in-the-sun",
      text: "Lorraine Hansberry's A Raisin in the Sun, which follows a Black family in Chicago as they decide whether to buy a house in a white neighborhood, ______ the first play by a Black woman to be produced on Broadway when it opened in 1959.",
      subject: "A Raisin in the Sun",
      mainVerb: null,
      choices: [["was", true], ["being", false], ["having been", false], ["to be", false]],
    },
    {
      scene: "sec-humboldt-current",
      text: "The Humboldt Current, which carries cold water north from the Southern Ocean along the western coast of South America, ______ nutrients up from the deep ocean, supporting one of the most productive fisheries on Earth.",
      subject: "The Humboldt Current",
      mainVerb: null,
      choices: [["draws", true], ["drawing", false], ["having drawn", false], ["to draw", false]],
    },
    {
      scene: "sec-rubin-galaxies",
      text: "The astronomer Vera Rubin, whose measurements of how fast stars orbit the centers of spiral galaxies puzzled many of her colleagues in the 1970s, ______ some of the strongest early evidence that most of the matter in the universe cannot be seen.",
      subject: "Vera Rubin",
      mainVerb: null,
      choices: [["provided", true], ["providing", false], ["having provided", false], ["to provide", false]],
    },
    {
      scene: "sec-niger-farm-trees",
      text: "A survey led by the agronomist Idrissa Maman, who interviewed farmers in southern Niger about the tree seedlings that sprout naturally in their fields, ______ that farms where those trees were protected rather than cleared produced more grain in dry years.",
      subject: "Idrissa Maman",
      mainVerb: null,
      choices: [["found", true], ["finding", false], ["having found", false], ["to find", false]],
    },
    {
      scene: "sec-kente-strips",
      text: "Kente cloth, which weavers in Ghana produce on narrow looms in strips only about ten centimeters wide, ______ its bold, checkered patterns from the way those strips are sewn together edge to edge.",
      subject: "Kente cloth",
      mainVerb: null,
      choices: [["gets", true], ["getting", false], ["having gotten", false], ["to get", false]],
    },
    {
      scene: "sec-petra-sandstone",
      text: "The city of Petra, ______ into rose-colored sandstone cliffs by the Nabataeans more than two thousand years ago, drew traders carrying incense and spices across the deserts of Arabia.",
      subject: "Petra",
      mainVerb: "drew",
      choices: [["carved", false], ["was carved", true], ["is carved", true], ["has been carved", true]],
    },
    {
      scene: "sec-grand-canal",
      text: "The Grand Canal of China, ______ in stages over more than a thousand years to link Beijing with Hangzhou, is the longest artificial waterway in the world, stretching roughly 1,800 kilometers.",
      subject: "The Grand Canal of China",
      mainVerb: "is",
      choices: [["built", false], ["was built", true], ["is built", true], ["had been built", true]],
    },
    {
      scene: "sec-satin-bowerbird",
      text: "The male satin bowerbird of eastern Australia, ______ blue objects such as feathers, berries, and bottle caps, decorates a structure of sticks called a bower to attract females.",
      subject: "bowerbird",
      mainVerb: "decorates",
      choices: [["collecting", false], ["collects", true], ["it collects", true], ["has collected", true]],
    },
    {
      scene: "sec-jemison-physician",
      text: "Mae Jemison, ______ as a physician and as a Peace Corps medical officer in West Africa before joining NASA, became the first African American woman to travel into space in 1992.",
      subject: "Mae Jemison",
      mainVerb: "became",
      choices: [["having worked", false], ["had worked", true], ["she worked", true], ["works", true]],
    },
    {
      scene: "sec-coelacanth-rediscovery",
      text: "The coelacanth, ______ by scientists to have died out around the time of the dinosaurs, was found alive in a fishing boat's catch off the coast of South Africa in 1938.",
      subject: "coelacanth",
      mainVerb: "was",
      choices: [["thought", false], ["was thought", true], ["is thought", true], ["had been thought", true]],
    },
  ];

  const FINITE_STARTS = ["was", "is", "has", "had", "were", "are", "have", "she", "he", "it", "they"];
  // Morphology settles some forms outright; bare past forms stay as recorded.
  function finiteByForm(choice) {
    const first = lower(firstWordOf(choice));
    if (first === "to" || first === "having" || /ing$/.test(first)) return false;
    if (FINITE_STARTS.includes(first)) return true;
    return null;
  }

  const finiteVerb = {
    id: "sec-finite-or-nonfinite",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "verb form",
    difficulty: "Hard",
    title: "Main verb or modifier",
    recognize: "Decide whether the sentence already has its main verb. If it does, the blank opens a modifier and needs a nonfinite form; if it does not, the blank must supply the main verb.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(FINITE_TOPICS);
      const needsFinite = !topic.mainVerb;
      const [key] = topic.choices.find(([, finite]) => finite === needsFinite);
      const wrong = topic.choices
        .filter(([, finite]) => finite !== needsFinite)
        .map(([form]) => [form, needsFinite
          ? `${q(form)} is not a main verb, so the sentence would have a subject, ${q(topic.subject)}, and no verb to go with it.`
          : `${q(form)} is a main verb, but the sentence already has one, ${q(topic.mainVerb)}; adding another between commas leaves the sentence ungrammatical.`]);
      return item(topic, this, {
        correct: key,
        wrong,
        explanation: needsFinite
          ? `The words between the commas describe ${q(topic.subject)} but do not give it a verb, so the blank must supply the main verb. Only ${q(key)} is a finite verb that can do that.`
          : `The sentence's main verb is ${q(topic.mainVerb)}, after the second comma, so the blank begins a modifier describing ${q(topic.subject)}. Only ${q(key)} works as a modifier; the other choices are main verbs.`,
        steps: [
          "Find the sentence's subject, and set aside anything enclosed in commas.",
          needsFinite
            ? `Check what ${q(topic.subject)} does: no verb outside the commas says, so the blank must be the main verb.`
            : `Check what ${q(topic.subject)} does: ${q(topic.mainVerb)} already serves as the main verb.`,
          needsFinite ? "Choose the one finite verb." : "Choose the one form that can open a modifier.",
        ],
        principles: [
          "Every sentence needs a finite main verb for its subject; words like “teaching,” “having taught,” and “to teach” cannot serve as one.",
          "A phrase set off by commas can describe the subject, but it cannot contain a second main verb for that subject.",
        ],
        trap: needsFinite
          ? "Treating the verb inside the descriptive clause as the sentence's main verb and choosing a modifier form."
          : "Choosing a complete verb because the blank looks like the start of a new statement about the subject.",
        hint: "Read the sentence without the part between the commas. What is its main verb?",
        verify: () => {
          const tail = afterBlank(topic.text);
          const hasMainVerb = Boolean(topic.mainVerb) && new RegExp(`, ${topic.mainVerb} `).test(tail);
          const byForm = topic.choices.map(([form]) => finiteByForm(form));
          return hasOneBlank(topic.text) &&
            beforeBlank(topic.text).includes(topic.subject) &&
            /, $/.test(beforeBlank(topic.text)) &&
            hasMainVerb === Boolean(topic.mainVerb) &&
            topic.choices.filter(([, finite]) => finite === !hasMainVerb).length === 1 &&
            topic.choices.every(([, finite], index) => byForm[index] === null || byForm[index] === finite) &&
            byForm.filter((value) => value !== null).length >= 2;
        },
      });
    },
  };

  /* -------------------------------------------------- dangling modifier */

  // The passage ends with an opening modifier and a blank for the main
  // clause. Each choice records its grammatical subject; only the key's is
  // the person or animal the modifier describes.
  const MODIFIER_TOPICS = [
    {
      scene: "sec-carson-silent-spring",
      text: "Rachel Carson spent four years gathering research for Silent Spring, her 1962 book about the dangers of synthetic pesticides. Trained as a marine biologist and skilled at explaining science to general readers, ______.",
      agent: "Carson",
      describes: "trained as a marine biologist",
      key: "Carson showed how DDT moved through food chains and harmed birds",
      wrong: [
        ["Carson's book showed how DDT moved through food chains and harmed birds", "Carson's book"],
        ["the way DDT moved through food chains and harmed birds was shown by Carson", "the way"],
        ["readers learned from Carson how DDT moved through food chains and harmed birds", "readers"],
      ],
    },
    {
      scene: "sec-wu-parity",
      text: "In 1956, the physicists Tsung-Dao Lee and Chen-Ning Yang proposed that a basic symmetry of nature, called parity, might not hold for the weak nuclear force, and they asked their Columbia University colleague Chien-Shiung Wu whether an experiment could settle the question. Known to colleagues for her meticulous experimental technique, ______.",
      agent: "Wu",
      describes: "known for her meticulous technique",
      key: "Wu tested the idea using radioactive cobalt cooled to near absolute zero",
      wrong: [
        ["Wu's experiment tested the idea using radioactive cobalt cooled to near absolute zero", "Wu's experiment"],
        ["the idea was tested by Wu using radioactive cobalt cooled to near absolute zero", "the idea"],
        ["radioactive cobalt cooled to near absolute zero allowed Wu to test the idea", "radioactive cobalt"],
      ],
    },
    {
      scene: "sec-kahlo-mirror",
      text: "After a bus accident in 1925 left her bedridden for months, Frida Kahlo taught herself to paint. Confined to her bed and working with a mirror mounted above her, ______.",
      agent: "Kahlo",
      describes: "confined to her bed",
      key: "Kahlo began the self-portraits for which she is now best known",
      wrong: [
        ["Kahlo's first self-portraits, for which she is now best known, took shape", "Kahlo's first self-portraits"],
        ["the self-portraits for which Kahlo is now best known were begun", "the self-portraits"],
        ["her mother supplied the easel on which Kahlo began her famous self-portraits", "her mother"],
      ],
    },
    {
      scene: "sec-chisholm-campaign",
      text: "Shirley Chisholm served seven terms in the U.S. House of Representatives, representing a district in Brooklyn, New York. Campaigning in 1968 under the slogan “Unbought and Unbossed,” ______.",
      agent: "Chisholm",
      describes: "campaigning under that slogan",
      key: "Chisholm became the first Black woman elected to Congress",
      wrong: [
        ["Chisholm's victory made her the first Black woman elected to Congress", "Chisholm's victory"],
        ["a seat in Congress was won by Chisholm, the first Black woman to hold one", "a seat"],
        ["voters in Brooklyn made Chisholm the first Black woman elected to Congress", "voters"],
      ],
    },
    {
      scene: "sec-cataglyphis-ants",
      text: "Desert ants of the genus Cataglyphis forage alone across the Sahara's sand, often traveling hundreds of meters from their nests. Unable to follow scent trails, which evaporate quickly in the heat, ______.",
      agent: "the ants",
      describes: "unable to follow scent trails",
      key: "the ants count their steps and track the sun's position to find their way home",
      wrong: [
        ["the ants' route home depends on counting steps and tracking the sun's position", "the ants' route"],
        ["their way home is found by counting steps and tracking the sun's position", "their way home"],
        ["counting steps and tracking the sun's position guide the ants back to their nests", "counting steps"],
      ],
    },
    {
      scene: "sec-ibn-battuta-travels",
      text: "Ibn Battuta left his home in Tangier, Morocco, in 1325 to make the pilgrimage to Mecca, but he did not return for decades. Traveling across Africa, the Middle East, and Asia for nearly thirty years, ______.",
      agent: "Ibn Battuta",
      describes: "traveling for nearly thirty years",
      key: "Ibn Battuta covered more ground than any other known traveler of his era",
      wrong: [
        ["Ibn Battuta's route covered more ground than that of any other known traveler of his era", "Ibn Battuta's route"],
        ["more ground was covered by Ibn Battuta than by any other known traveler of his era", "more ground"],
        ["historians credit Ibn Battuta with covering more ground than any other traveler of his era", "historians"],
      ],
    },
    {
      scene: "sec-mendel-garden",
      text: "Between 1856 and 1863, Gregor Mendel, a friar at an abbey in Brno, bred thousands of pea plants and tracked traits such as seed color. Working alone in the abbey garden and recording every plant's traits by hand, ______.",
      agent: "Mendel",
      describes: "working alone in the abbey garden",
      key: "Mendel found that the traits passed from parents to offspring in predictable ratios",
      wrong: [
        ["Mendel's experiments showed that the traits passed from parents to offspring in predictable ratios", "Mendel's experiments"],
        ["the traits were found by Mendel to pass from parents to offspring in predictable ratios", "the traits"],
        ["the abbey's pea plants revealed that traits passed from parents to offspring in predictable ratios", "the abbey's pea plants"],
      ],
    },
    {
      scene: "sec-tubman-journeys",
      text: "Before the Civil War, Harriet Tubman escaped slavery in Maryland and then returned about thirteen times to lead others north. Guiding small groups mostly at night and during the long nights of winter, ______.",
      agent: "Tubman",
      describes: "guiding small groups",
      key: "Tubman brought about seventy people to freedom on those journeys",
      wrong: [
        ["Tubman's journeys brought about seventy people to freedom", "Tubman's journeys"],
        ["about seventy people were brought to freedom by Tubman on those journeys", "about seventy people"],
        ["the Underground Railroad helped Tubman bring about seventy people to freedom", "the Underground Railroad"],
      ],
    },
    {
      scene: "sec-humpback-song",
      text: "Male humpback whales sing complex songs that can last for hours, and all the males in a population sing nearly the same song. Listening closely to one another and copying each new variation, ______.",
      agent: "the males",
      describes: "listening to one another and copying variations",
      key: "the males gradually transform the song until, after several years, it is entirely new",
      wrong: [
        ["the males' song gradually transforms until, after several years, it is entirely new", "the males' song"],
        ["the song is gradually transformed until, after several years, it is entirely new", "the song"],
        ["a new song gradually replaces the old one, becoming entirely new after several years", "a new song"],
      ],
    },
    {
      scene: "sec-hadid-aquatics",
      text: "Zaha Hadid, the first woman to win the Pritzker Architecture Prize, was known for buildings that seem to flow rather than stand. Trained as a mathematician in Beirut before studying architecture in London, ______.",
      agent: "Hadid",
      describes: "trained as a mathematician",
      key: "Hadid designed the London Aquatics Centre with a roof that curves like a wave",
      wrong: [
        ["Hadid's London Aquatics Centre has a roof that curves like a wave", "Hadid's London Aquatics Centre"],
        ["the London Aquatics Centre was designed by Hadid with a roof that curves like a wave", "the London Aquatics Centre"],
        ["a roof that curves like a wave tops the London Aquatics Centre that Hadid designed", "a roof"],
      ],
    },
    {
      scene: "sec-morrison-mornings",
      text: "Before publishing her first novel, Toni Morrison worked for years as an editor at Random House while raising two sons. Writing in the early mornings before going to the office, ______.",
      agent: "Morrison",
      describes: "writing in the early mornings",
      key: "Morrison completed The Bluest Eye, which appeared in 1970",
      wrong: [
        ["Morrison's first novel, The Bluest Eye, was completed and appeared in 1970", "Morrison's first novel"],
        ["The Bluest Eye was completed by Morrison and appeared in 1970", "The Bluest Eye"],
        ["her first novel, The Bluest Eye, reached readers in 1970", "her first novel"],
      ],
    },
    {
      scene: "sec-farouk-migration",
      text: "Sociologist Nadia Farouk interviewed more than two hundred families who had moved from villages in southern Egypt to Cairo during the 1990s. Having grown up in a village near Aswan herself, ______.",
      agent: "Farouk",
      describes: "having grown up near Aswan",
      key: "Farouk understood why so many newcomers settled near relatives from home",
      wrong: [
        ["Farouk's study explained why so many newcomers settled near relatives from home", "Farouk's study"],
        ["the reasons so many newcomers settled near relatives were understood by Farouk", "the reasons"],
        ["the families told Farouk why so many newcomers settled near relatives from home", "the families"],
      ],
    },
    {
      scene: "sec-caledonian-crows",
      text: "New Caledonian crows are among the few animals known to make tools, and they shape them from the stiff, barbed leaves of the pandanus tree. Working with only their beaks, ______.",
      agent: "the crows",
      describes: "working with only their beaks",
      key: "the crows cut narrow strips from the leaves to pull insects out of crevices",
      wrong: [
        ["the crows' narrow strips of leaf pull insects out of crevices", "the crows' narrow strips"],
        ["narrow strips of leaf are cut by the crows to pull insects out of crevices", "narrow strips"],
        ["the pandanus tree provides strips of leaf that the crows use to pull insects out of crevices", "the pandanus tree"],
      ],
    },
  ];

  const danglingModifier = {
    id: "sec-dangling-modifier",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "modifier placement",
    difficulty: "Hard",
    title: "Subject named by an opening modifier",
    recognize: "An opening modifier describes whatever noun comes right after its comma, so the main clause must begin with the one person or animal the modifier describes.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["dangling-modifier", "grammatical-but-illogical"],
    build(t) {
      const topic = t.pick(MODIFIER_TOPICS);
      const modifier = blankSentence(topic.text).replace(/,\s*$/, "");
      return item(topic, this, {
        correct: topic.key,
        wrong: topic.wrong.map(([choice, subject]) => [choice,
          `This makes ${q(subject)} the subject, so the opening phrase would describe ${q(subject)}; only ${topic.agent.replace(/^the /, "the ")} could be ${topic.describes}.`]),
        explanation: `The opening phrase, ${q(modifier)}, describes ${topic.agent}, so ${topic.agent} must be the subject that comes right after the comma. Every other choice is grammatical but makes the phrase describe something else.`,
        steps: [
          "Ask who or what the opening phrase describes.",
          `Only ${topic.agent} could be ${topic.describes}.`,
          `Choose the clause whose subject, right after the comma, is ${topic.agent}.`,
        ],
        principles: [
          "An introductory modifier describes the subject of the main clause that follows it.",
          "A possessive such as “Carson's book” makes the book, not the person, the subject.",
        ],
        trap: "Picking a clause that mentions the right person somewhere, or in a possessive, rather than one that makes that person the subject.",
        hint: "Who is doing what the opening phrase describes? That noun has to come right after the comma.",
        verify: () => hasOneBlank(topic.text) &&
          /,["”]? ______\.$/.test(topic.text) &&
          lower(topic.key).startsWith(lower(topic.agent)) &&
          !/^['’]/.test(topic.key.slice(topic.agent.length)) &&
          beforeBlank(topic.text).includes(topic.agent.replace(/^the /, "")) &&
          topic.wrong.every(([choice, subject]) =>
            lower(choice).startsWith(lower(subject)) &&
            lower(subject) !== lower(topic.agent) &&
            (!lower(subject).startsWith(lower(topic.agent)) || /^['’]s?\s/.test(subject.slice(topic.agent.length)))),
      });
    },
  };

  return [
    compoundSubject,
    theirForms,
    pastParticiple,
    parallelSeries,
    attractorAgreement,
    invertedAgreement,
    parallelPaired,
    distantPronoun,
    tenseFrame,
    finiteVerb,
    danglingModifier,
  ];
});
