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
  // Choice sets are 2x2 squares: the four choices cross two grammatical
  // features (number and tense, finiteness and punctuation, ...), each with
  // two values, and `features` declares them. Every choice then shares each
  // feature with exactly one other choice, so no feature singles out the key
  // (the old sets made the key the only plural verb, which a student could
  // spot without finding the subject), and the key's corner varies with the
  // scene. verify() re-derives the key from what each topic records about
  // the sentence (a subject's head noun, the passage's time frame, whether a
  // main verb follows) and checks that the choices form a square.

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
  const cap = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
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

  // Four [text, features, reason] rows, the key's reason being null, become
  // the instance's correct / wrong / features fields.
  function square(rows) {
    const keyRow = rows.find((row) => row[2] === null);
    const wrongRows = rows.filter((row) => row !== keyRow);
    return {
      correct: keyRow[0],
      wrong: wrongRows.map(([text, , reason]) => [text, reason]),
      features: { correct: keyRow[1], wrong: wrongRows.map(([, features]) => features) },
    };
  }

  // True when four feature records form a 2x2 square: two features with two
  // values each and every combination present once, so no declared feature
  // leaves the key alone.
  function isSquare(features) {
    const records = [features.correct, ...features.wrong];
    if (records.length !== 4 || records.some((record) => !record)) return false;
    const names = Object.keys(records[0]);
    const sameNames = records.every((record) => Object.keys(record).length === 2 && names.every((name) => name in record));
    const combos = new Set(records.map((record) => names.map((name) => record[name]).join("|")));
    return names.length === 2 && sameNames && combos.size === 4 &&
      names.every((name) => new Set(records.map((record) => record[name])).size === 2);
  }

  // Grammatical number read off the words themselves, so verify does not
  // depend on a label someone typed next to the topic.
  const IRREGULAR_PLURALS = ["children", "people", "men", "women", "feet", "teeth", "mice", "algae", "dozens", "hundreds"];
  const SINGULAR_WORDS = ["each", "one", "number", "every", "either", "neither"];
  function nounNumber(noun) {
    const word = lower(lastWordOf(noun));
    if (IRREGULAR_PLURALS.includes(word)) return "plural";
    if (SINGULAR_WORDS.includes(word)) return "singular";
    return /[^su]s$/.test(word) ? "plural" : "singular";
  }
  const other = (number) => (number === "singular" ? "plural" : "singular");
  const otherTense = (tense) => (tense === "present" ? "past" : "present");

  // "be" by number and tense: the one verb whose past forms still show
  // number, so number and tense can cross in a square.
  const BE = { singular: { present: "is", past: "was" }, plural: { present: "are", past: "were" } };
  const beForm = (number, tense, rest) => `${BE[number][tense]}${rest ? ` ${rest}` : ""}`;
  function beNumber(form) {
    const first = lower(firstWordOf(form));
    return first === "is" || first === "was" ? "singular" : first === "are" || first === "were" ? "plural" : null;
  }
  const beTense = (form) => (/^(is|are)\b/.test(lower(form)) ? "present" : /^(was|were)\b/.test(lower(form)) ? "past" : null);

  // A topic's time frame is recorded as `tense` with the words that set it
  // (`cue`); a past cue names a date or a finished time, a present cue a
  // habitual or current one.
  const CUE_PATTERNS = {
    past: /\b1\d{3}\b|\b20[0-2]\d\b|\bago\b|\bancient\b|\bcentur(y|ies)\b|\bwas\b|\bwere\b|\bhad\b|\b\w+ed\b/i,
    present: /\b(today|now|each|every|usually|often|still|is|are|has|have|can|tend|most)\b|\b\w+s\b/i,
  };
  const cueFits = (topic) => topic.text.includes(topic.cue) && CUE_PATTERNS[topic.tense].test(topic.cue);

  // Agreement square: number x tense of "be". `subject` is the whole
  // subject as the passage gives it, `head` its head noun, `lure` the word
  // that tempts the wrong number, `why` (optional) why the head decides.
  function agreementRows(topic, number, why, subjectText) {
    const subject = subjectText || `the subject, headed by ${q(topic.head)},`;
    const rows = [];
    ["singular", "plural"].forEach((n) => ["present", "past"].forEach((tense) => {
      const form = beForm(n, tense, topic.rest);
      let reason = null;
      if (n !== number && tense !== topic.tense) {
        reason = `${q(form)} is ${n} and ${tense} tense; ${subject} is ${number}, and the passage is set in the ${topic.tense} (${q(topic.cue)}).`;
      } else if (n !== number) {
        reason = `${q(form)} is ${n}, but ${subject} is ${number}; ${why}`;
      } else if (tense !== topic.tense) {
        reason = `${q(form)} agrees with the ${number} subject, but it is ${tense} tense; the passage is set in the ${topic.tense} (${q(topic.cue)}).`;
      }
      rows.push([form, { number: n, tense }, reason]);
    }));
    return rows;
  }

  function agreementVerify(topic, number, instance) {
    const key = instance.correct;
    const offered = [key, ...instance.wrong.map(([form]) => form)];
    return hasOneBlank(topic.text) && cueFits(topic) &&
      wordsOf(blankSentence(topic.text)).concat(wordsOf(afterBlank(topic.text))).includes(topic.head) &&
      beNumber(key) === number && beTense(key) === topic.tense &&
      offered.every((form) => beNumber(form) && beTense(form)) &&
      isSquare(instance.features);
  }

  /* ------------------------------------ subject-verb agreement: compound */

  // Two nouns joined by "and" make a plural subject; a noun attached with
  // "along with", "together with", or "as well as" does not join the
  // subject, which stays singular. `join` records which kind the subject is.
  const COMPOUND_TOPICS = [
    {
      scene: "sec-gamelan-tempo",
      text: "A Balinese gamelan can include more than two dozen bronze instruments, and its players rarely use written scores. Instead, the lead drummer and the first metallophone player ______ responsible for signaling every change in tempo, and the rest of the ensemble follows their cues.",
      subject: "the lead drummer and the first metallophone player", head: "player", join: "and", lure: "player",
      tense: "present", cue: "follows",
    },
    {
      scene: "sec-lichen-partnership",
      text: "A lichen looks like a single plant, but it is actually a partnership between two very different organisms. In most lichens, a fungus and a photosynthetic alga ______ bound together as one body: the alga makes sugar from sunlight, and the fungus supplies shelter and water.",
      subject: "a fungus and a photosynthetic alga", head: "alga", join: "and", lure: "alga",
      tense: "present", cue: "makes sugar",
    },
    {
      scene: "sec-mangrove-carbon",
      text: "Mangrove forests grow along tropical coastlines where rivers meet the sea. The trees' tangled roots and the waterlogged mud around them ______ able to store carbon far more efficiently than most inland forests do, so coastal planners increasingly treat mangroves as protection against climate change.",
      subject: "The trees' tangled roots and the waterlogged mud around them", head: "mud", join: "and", lure: "mud",
      tense: "present", cue: "Mangrove forests grow",
    },
    {
      scene: "sec-nicaraguan-sign",
      text: "Nicaraguan Sign Language, which emerged among deaf schoolchildren in Managua in the 1980s, is now used by thousands of people. In it, as in other signed languages, the shape of the hands and the expression on the signer's face ______ both used to carry grammatical information, such as whether a sentence is a question.",
      subject: "the shape of the hands and the expression on the signer's face", head: "expression", join: "and", lure: "face",
      tense: "present", cue: "is now used",
    },
    {
      scene: "sec-kelp-predators",
      text: "Along the Pacific coast of North America, kelp forests depend on predators. The sea otter and the sunflower sea star ______ the main hunters of sea urchins, which would otherwise graze the kelp down to bare rock; where both predators have declined, urchins have taken over.",
      subject: "The sea otter and the sunflower sea star", head: "star", join: "and", lure: "star",
      tense: "present", cue: "depend on predators",
    },
    {
      scene: "sec-sourdough-starter",
      text: "Sourdough bread rises without commercial yeast. Instead, the wild yeast and the lactic acid bacteria in the starter ______ at work on the sugars in the flour, releasing the carbon dioxide that lifts the dough and the acids that give the bread its sour taste.",
      subject: "the wild yeast and the lactic acid bacteria in the starter", head: "bacteria", join: "and", lure: "starter",
      tense: "present", cue: "rises",
    },
    {
      scene: "sec-gutenberg-ink",
      text: "By about 1455, Johannes Gutenberg had printed roughly 180 copies of the Bible in Mainz, Germany. His movable metal type and his oil-based ink ______ both essential to the project, since the water-based inks used by scribes would not stick evenly to metal letters.",
      subject: "His movable metal type and his oil-based ink", head: "ink", join: "and", lure: "ink",
      tense: "past", cue: "By about 1455",
    },
    {
      scene: "sec-maya-calendar-round",
      text: "The ancient Maya tracked time with several interlocking calendars. A 260-day ritual count and a 365-day solar year ______ combined to form a cycle that returned to the same starting date only once every 52 years, a period now called the Calendar Round.",
      subject: "A 260-day ritual count and a 365-day solar year", head: "year", join: "and", lure: "year",
      tense: "past", cue: "returned",
    },
    {
      scene: "sec-bebop-minton",
      text: "Bebop, which emerged in New York in the 1940s, sped up jazz and made its harmonies more complex. At Minton's Playhouse in Harlem, where much of the style took shape, the saxophone and the trumpet ______ often heard stating a melody together before each musician improvised a solo.",
      subject: "the saxophone and the trumpet", head: "trumpet", join: "and", lure: "trumpet",
      tense: "past", cue: "improvised",
    },
    {
      scene: "sec-ashby-library-desk",
      text: "The first public library in the mill town of Ashby opened in 1889 in two rented rooms above a bakery. Its reading room and its lending desk ______ staffed entirely by volunteers during the library's first decade, until the town agreed to pay a librarian.",
      subject: "Its reading room and its lending desk", head: "desk", join: "and", lure: "desk",
      tense: "past", cue: "opened in 1889",
    },
    {
      scene: "sec-tides-sun-moon",
      text: "Ocean tides are not caused by the Moon alone. The Moon's gravity, along with the weaker pull of the Sun, ______ responsible for the daily rise and fall of the sea, and when the two bodies line up, their combined pull produces especially high spring tides.",
      subject: "The Moon's gravity", head: "gravity", join: "along with", lure: "along with the weaker pull of the Sun",
      tense: "present", cue: "produces",
    },
    {
      scene: "sec-varden-globe",
      text: "The map room of the Varden Museum is open to visitors every afternoon. The museum's oldest globe, together with the brass stand and the compass that came with it, ______ displayed in a sealed glass case that protects it from humidity.",
      subject: "The museum's oldest globe", head: "globe", join: "together with", lure: "together with the brass stand and the compass",
      tense: "present", cue: "is open to visitors every afternoon",
    },
    {
      scene: "sec-harlow-bridge-parade",
      text: "When the Harlow Bridge opened in 1907, the town celebrated with a parade. The mayor, along with the three engineers who had designed the bridge, ______ the first to walk across it, followed by a brass band and most of the town.",
      subject: "The mayor", head: "mayor", join: "along with", lure: "along with the three engineers",
      tense: "past", cue: "opened in 1907",
    },
    {
      scene: "sec-okafor-bakery",
      text: "The Okafor family's bakery opened on Carver Street in 1962. Its founder, Grace Okafor, as well as her two eldest sons, ______ awake by three o'clock every morning that first year to have bread ready for the breakfast crowd.",
      subject: "Its founder, Grace Okafor,", head: "founder", join: "as well as", lure: "as well as her two eldest sons",
      tense: "past", cue: "opened on Carver Street in 1962",
    },
  ];

  const compoundSubject = {
    id: "sec-sva-compound-subject",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "subject-verb agreement",
    difficulty: "Easy",
    title: "Verb after a subject of two nouns",
    recognize: "Two nouns joined by “and” make a plural subject; a noun attached with “along with” or “as well as” does not join the subject. The passage's other verbs set the tense.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["agreement-attractor"],
    build(t) {
      const topic = t.pick(COMPOUND_TOPICS);
      const compound = topic.join === "and";
      const number = compound ? "plural" : "singular";
      const why = compound
        ? `two nouns joined by “and” make a plural subject, even though ${q(topic.lure)} is singular.`
        : `the phrase beginning ${q(topic.lure)} is attached to the subject, not joined to it the way “and” would join it.`;
      const subjectText = compound ? `the subject, ${q(topic.subject)},` : `the subject, ${q(topic.subject.replace(/,$/, ""))},`;
      const choices = square(agreementRows(topic, number, why, subjectText));
      const instance = item(topic, this, {
        ...choices,
        explanation: compound
          ? `The subject, ${q(topic.subject)}, names two things joined by “and,” so it is plural. The passage is set in the ${topic.tense} (${q(topic.cue)}), so the verb is the plural ${topic.tense}-tense ${q(choices.correct)}.`
          : `The subject is ${q(topic.subject.replace(/,$/, ""))}; the phrase ${q(topic.lure)} adds information but does not make the subject plural the way “and” would. The passage is set in the ${topic.tense} (${q(topic.cue)}), so the verb is the singular ${topic.tense}-tense ${q(choices.correct)}.`,
        steps: [
          "Find the verb's subject by asking who or what the verb describes.",
          compound
            ? "The subject joins two nouns with “and,” so it is plural."
            : `The words ${q(topic.lure)} are attached to the subject, not joined to it, so the subject is singular.`,
          `Check the passage's time frame (${q(topic.cue)}) and choose the ${number} verb in that tense.`,
        ],
        principles: [
          "A subject made of two nouns joined by “and” is plural.",
          "A phrase beginning “along with,” “together with,” or “as well as” does not change the number of the subject it follows.",
          "A verb's tense must fit the time frame the passage has set.",
        ],
        trap: compound
          ? `Matching the verb to ${q(topic.lure)}, the singular noun right before the blank, instead of to the whole compound subject.`
          : `Treating ${q(topic.lure)} as if it joined the subject with “and,” which makes a plural verb sound right.`,
        hint: "Find everything that is doing the action, then check when the passage says it happens.",
      });
      instance.verify = () => {
        const joined = compound ? / and /.test(topic.subject) : !/ and /.test(topic.subject) && topic.text.includes(topic.lure);
        const derived = compound ? "plural" : nounNumber(topic.head);
        return joined && derived === number && lower(topic.text).includes(lower(topic.subject)) &&
          agreementVerify(topic, derived, instance);
      };
      return instance;
    },
  };

  /* ------------------------------------------- pronoun: their / they're */

  // The pronoun's number is plain (a plural noun nearby); the question is
  // form: possessive, contraction, or the word "there." The four choices
  // cross two features, spelling family (their/there) and contraction.
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
    possessive: { form: "their", features: { spelling: "their", contraction: "no" } },
    contraction: { form: "they're", features: { spelling: "their", contraction: "yes" } },
    place: { form: "there", features: { spelling: "there", contraction: "no" } },
    placeContraction: { form: "there's", features: { spelling: "there", contraction: "yes" } },
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
    recognize: "Decide whether the blank needs a possessive before a noun, “they are,” or the “there” that introduces what exists.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form"],
    build(t) {
      const topic = t.pick(THEIR_TOPICS);
      const needs = {
        possessive: `a possessive before ${q(topic.next)}`,
        contraction: `${q("they are")} before ${q(topic.next)}`,
        place: `the ${q("there")} that introduces ${q(`there ${topic.next}`)}`,
      }[topic.role];
      const choices = square(Object.entries(THEIR_FORMS).map(([role, { form, features }]) =>
        [form, features, role === topic.role ? null : `${q(form)} is ${THEIR_MEANINGS[role]}, but the sentence needs ${needs}.`]));
      const instance = item(topic, this, {
        ...choices,
        explanation: `The sentence needs ${needs}, which is ${q(choices.correct)}. “Their,” “they're,” and “there” sound alike, so test each choice by its meaning.`,
        steps: [
          "Read the words right after the blank.",
          "Test each choice by expanding it: “they are,” “there is,” or “belonging to them.”",
          `Only ${q(choices.correct)} makes sense before ${q(topic.next)}.`,
        ],
        principles: ["“Their” shows possession, “they're” means “they are,” and “there” introduces what exists (“there are”) or names a place."],
        trap: "Choosing by sound, since “their,” “they're,” and “there” are pronounced the same way.",
        hint: "Replace the blank with “they are” and see whether the sentence still makes sense.",
      });
      instance.verify = () => {
        const role = roleAfter(afterBlank(topic.text));
        return hasOneBlank(topic.text) &&
          afterBlank(topic.text).trimStart().startsWith(topic.next) &&
          role === topic.role &&
          THEIR_FORMS[role].form === instance.correct &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------------- verb form: past participle */

  // The choices cross the helping verb's tense (has/have versus had, or
  // is versus was) with the verb form (past participle versus simple past).
  // The passage's time words decide the helping verb; the helping verb
  // demands the participle.
  const IRREGULAR_VERBS = {
    lie: { past: "lay", participle: "lain" },
    swim: { past: "swam", participle: "swum" },
    grow: { past: "grew", participle: "grown" },
    ring: { past: "rang", participle: "rung" },
    sing: { past: "sang", participle: "sung" },
    shrink: { past: "shrank", participle: "shrunk" },
    steal: { past: "stole", participle: "stolen" },
    sink: { past: "sank", participle: "sunk" },
    fly: { past: "flew", participle: "flown" },
    speak: { past: "spoke", participle: "spoken" },
    break: { past: "broke", participle: "broken" },
    write: { past: "wrote", participle: "written" },
    run: { past: "ran", participle: "run" },
    begin: { past: "began", participle: "begun" },
  };
  // [present helping verb, past helping verb] pairs by subject number or voice.
  const AUX_PAIRS = { singular: ["has", "had"], plural: ["have", "had"], passive: ["is", "was"] };

  // `aux` names the pair (AUX_PAIRS); `tense` which member the frame needs.
  const PARTICIPLE_TOPICS = [
    {
      scene: "sec-mary-rose-wreck",
      text: "The Mary Rose, a warship built for King Henry VIII, sank off the southern coast of England in 1545. By the time divers raised the wreck in 1982, it ______ on the floor of the Solent for 437 years, partly protected by layers of silt.",
      verb: "lie", aux: "singular", tense: "past", cue: "By the time divers raised the wreck in 1982",
    },
    {
      scene: "sec-ederle-channel",
      text: "In August 1926, the American swimmer Gertrude Ederle crossed the English Channel from France to England in about fourteen and a half hours. Before her, only five people, all of them men, ______ across it.",
      verb: "swim", aux: "plural", tense: "past", cue: "Before her",
    },
    {
      scene: "sec-hyperion-redwood",
      text: "In 2006, two naturalists exploring a remote valley in California's Redwood National Park found a coast redwood they named Hyperion. When they measured it that year, the tree ______ to more than 115 meters, making it the tallest known living tree in the world.",
      verb: "grow", aux: "singular", tense: "past", cue: "When they measured it that year",
    },
    {
      scene: "sec-santa-clara-bell",
      text: "When workers restored the old bell tower in the village of Santa Clara in 2019, they found records showing that its largest bell ______ every hour for nearly two centuries before a crack silenced it in 1998.",
      verb: "ring", aux: "singular", tense: "past", cue: "before a crack silenced it in 1998",
    },
    {
      scene: "sec-fisk-jubilee-singers",
      text: "In 1871, a student choir from Fisk University in Nashville set out on a tour to raise money for the struggling school. Within a few years, the Fisk Jubilee Singers ______ spirituals for audiences across the United States and Europe, including Queen Victoria.",
      verb: "sing", aux: "plural", tense: "past", cue: "In 1871",
    },
    {
      scene: "sec-rockies-glacier",
      text: "Glaciologists first surveyed a small glacier in the northern Rocky Mountains in 1913. Since then, the glacier ______ to less than a third of its former area, and drone images show that it is still retreating.",
      verb: "shrink", aux: "singular", tense: "present", cue: "Since then",
    },
    {
      scene: "sec-mona-lisa-theft",
      text: "In August 1911, the Mona Lisa ______ from the Louvre by Vincenzo Peruggia, a handyman who had worked at the museum. He kept the painting hidden in his Paris apartment for more than two years before trying to sell it in Florence.",
      verb: "steal", aux: "passive", tense: "past", cue: "In August 1911",
    },
    {
      scene: "sec-lyuba-mammoth",
      text: "In 2007, a reindeer herder in Siberia found Lyuba, a month-old woolly mammoth calf that still had skin, organs, and milk in her stomach. About 42,000 years earlier, her body ______ into riverbank mud that later froze solid, preserving it almost perfectly.",
      verb: "sink", aux: "singular", tense: "past", cue: "About 42,000 years earlier",
    },
    {
      scene: "sec-earhart-records",
      text: "By the time she disappeared over the Pacific Ocean in 1937, Amelia Earhart ______ solo across the Atlantic and set several records for altitude and distance, making her one of the most famous pilots in the world.",
      verb: "fly", aux: "singular", tense: "past", cue: "By the time she disappeared over the Pacific Ocean in 1937",
    },
    {
      scene: "sec-latin-speakers",
      text: "Latin is often called a dead language because no community ______ it as a first language for well over a thousand years. Yet it survives in scientific names, legal phrases, and the vocabulary of the Romance languages.",
      verb: "speak", aux: "singular", tense: "present", cue: "is often called",
    },
    {
      scene: "sec-bannister-mile",
      text: "In the early 1950s, many runners and coaches doubted that anyone could run a mile in under four minutes. On May 6, 1954, Roger Bannister finished a mile in Oxford, England, in 3 minutes 59.4 seconds, and within three years several other runners ______ the barrier as well.",
      verb: "break", aux: "plural", tense: "past", cue: "within three years",
    },
    {
      scene: "sec-bach-brandenburg",
      text: "By the time Johann Sebastian Bach became music director at St. Thomas Church in Leipzig in 1723, he ______ the six Brandenburg Concertos, which he had presented two years earlier to a German nobleman.",
      verb: "write", aux: "singular", tense: "past", cue: "By the time Johann Sebastian Bach became music director",
    },
    {
      scene: "sec-harlow-marathon",
      text: "The first Harlow Marathon, held in 1981, drew only 312 runners. Since that first race, more than 90,000 runners ______ its course, which crosses all six of the city's bridges, and entries now sell out within hours.",
      verb: "run", aux: "plural", tense: "present", cue: "Since that first race",
    },
    {
      scene: "sec-dunmore-harvest-festival",
      text: "The town of Dunmore has held a harvest festival every October since 1990. Every year since then, the festival ______ with a parade of antique tractors down Main Street, and it now draws visitors from across the state.",
      verb: "begin", aux: "singular", tense: "present", cue: "Every year since then",
    },
  ];

  const pastParticiple = {
    id: "sec-irregular-past-participle",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "verb form",
    difficulty: "Easy",
    title: "Helping verb and past participle",
    recognize: "A helping verb such as “had,” “has,” or “was” takes the past participle, not the simple past; the passage's time words decide which helping verb fits.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule"],
    build(t) {
      const topic = t.pick(PARTICIPLE_TOPICS);
      const forms = IRREGULAR_VERBS[topic.verb];
      const [presentAux, pastAux] = AUX_PAIRS[topic.aux];
      const auxOf = { present: presentAux, past: pastAux };
      const perfectWord = topic.aux === "passive" ? "passive" : topic.tense === "past" ? "past perfect" : "present perfect";
      const rows = [];
      ["present", "past"].forEach((tense) => ["participle", "simple past"].forEach((form) => {
        const text = `${auxOf[tense]} ${form === "participle" ? forms.participle : forms.past}`;
        let reason = null;
        const wrongForm = form !== "participle";
        const wrongTense = tense !== topic.tense;
        if (wrongForm && wrongTense) {
          reason = `${q(text)} pairs the wrong helping verb with ${q(forms.past)}, the simple past of ${q(topic.verb)}; the time frame (${q(topic.cue)}) calls for ${q(auxOf[topic.tense])}, and a helping verb takes the participle ${q(forms.participle)}.`;
        } else if (wrongForm) {
          reason = `${q(forms.past)} is the simple past of ${q(topic.verb)}; after the helping verb ${q(auxOf[tense])}, the verb must be the past participle, ${q(forms.participle)}.`;
        } else if (wrongTense) {
          reason = `${q(forms.participle)} is the right form, but ${q(auxOf[tense])} does not fit the time frame; ${q(topic.cue)} calls for ${q(auxOf[topic.tense])}.`;
        }
        rows.push([text, { tense, form }, reason]);
      }));
      const choices = square(rows);
      const instance = item(topic, this, {
        ...choices,
        explanation: `${q(topic.cue)} sets the time frame, so the helping verb is ${q(auxOf[topic.tense])} (${perfectWord}). A helping verb takes the past participle, and the past participle of ${q(topic.verb)} is ${q(forms.participle)}, not the simple past ${q(forms.past)}: ${q(choices.correct)}.`,
        steps: [
          `Find the words that set the time frame: ${q(topic.cue)}.`,
          `Choose the helping verb that fits that frame: ${q(auxOf[topic.tense])}.`,
          `After a helping verb, use the past participle: ${q(forms.participle)}.`,
        ],
        principles: [
          "Perfect tenses and passive verbs use the past participle; for irregular verbs it often differs from the simple past (swam / had swum, broke / was broken).",
          "“Has” or “have” links a past action to the present; “had” places it before another past moment.",
        ],
        trap: `Choosing the simple past, ${q(forms.past)}, which sounds natural in casual speech after a helping verb.`,
        hint: "Look at the helping verb in each choice, then check when the passage says this happened.",
      });
      instance.verify = () => {
        const offered = [instance.correct, ...instance.wrong.map(([text]) => text)];
        return hasOneBlank(topic.text) && topic.text.includes(topic.cue) &&
          forms.participle !== forms.past &&
          instance.correct === `${auxOf[topic.tense]} ${forms.participle}` &&
          // A present-perfect frame names a span reaching now ("since"); a
          // past one a moment in the past; a passive frame a date.
          (topic.tense === "present" ? /\b(since|is)\b/i.test(topic.cue) : !/\bsince\b/i.test(topic.cue)) &&
          offered.every((text) => text.split(" ")[1] === forms.participle || text.split(" ")[1] === forms.past) &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ subject-verb agreement: attractor */

  // A long phrase separates the subject's head noun from the verb and ends in
  // a noun of the other number (`lure`). The verb is a form of "be", so the
  // choices cross number with tense and the passage sets the tense.
  const ATTRACTOR_TOPICS = [
    {
      scene: "sec-tree-ring-width",
      text: "Dendrochronologists read the history of past climates in wood. In the dry American Southwest, the width of the growth rings in the oldest Douglas firs ______ a reliable guide to how much rain fell in each year of the trees' long lives, a record that can stretch back centuries.",
      head: "width", lure: "firs", tense: "present", cue: "Dendrochronologists read",
    },
    {
      scene: "sec-riverside-poets-letters",
      text: "Historians of the Riverside Poets, a circle of writers active in Cincinnati in the 1930s, have long known that its members read one another's drafts. Today, an archive of more than three hundred letters from the poet Delia Hart to her fellow writers ______ held by the city's public library, where scholars can see how closely the poets worked together.",
      head: "archive", lure: "writers", tense: "present", cue: "Today",
    },
    {
      scene: "sec-tanager-molt",
      text: "Each autumn, the male scarlet tanager trades its breeding colors for camouflage. The brilliant red feathers on the back and breast of the male ______ replaced by olive-green ones before the bird migrates to South America for the winter.",
      head: "feathers", lure: "male", tense: "present", cue: "Each autumn",
    },
    {
      scene: "sec-ferreira-murals",
      text: "In 1938, the painter Luis Ferreira covered the walls of a small post office in New Mexico with scenes of local life. Each of the twelve panels, which show farmers, miners, and railroad workers, ______ painted directly onto the wall's wet plaster that year.",
      head: "Each", lure: "workers", tense: "past", cue: "In 1938",
      why: "“Each of” takes a singular verb, whatever noun follows it.",
    },
    {
      scene: "sec-almond-hives",
      text: "Almond growers in California's Central Valley rent honeybees every February to pollinate their trees. The number of hives trucked into the valley's orchards ______ now greater than two million, and it has doubled since the 1990s.",
      head: "number", lure: "orchards", tense: "present", cue: "now greater than two million",
      why: "“The number of” takes a singular verb, whatever noun follows it.",
    },
    {
      scene: "sec-dome-tiles",
      text: "Byzantine mosaic makers rarely set their glass tiles perfectly flat. The small gold tiles covering the dome of the church ______ tilted at slightly different angles, so they catch and scatter the light of the candles below.",
      head: "tiles", lure: "church", tense: "present", cue: "Byzantine mosaic makers rarely set",
    },
    {
      scene: "sec-cristofori-piano",
      text: "Bartolomeo Cristofori built the first pianos in Florence around 1700, and only three of the instruments he made are known to survive. One of his three surviving instruments ______ on display today at the Metropolitan Museum of Art in New York.",
      head: "One", lure: "instruments", tense: "present", cue: "today",
      why: "“One of” takes a singular verb, whatever noun follows it.",
    },
    {
      scene: "sec-morpho-scales",
      text: "The blue morpho butterfly of Central and South American rainforests is one of the most brilliantly colored insects on Earth. Yet the microscopic scales covering each wing of the butterfly ______ free of any blue pigment; the color comes from the way tiny ridges on each scale reflect light.",
      head: "scales", lure: "butterfly", tense: "present", cue: "the color comes",
    },
    {
      scene: "sec-reservoir-trackway",
      text: "When a drought lowered a reservoir in northern Spain, it exposed dinosaur tracks usually hidden beneath the water. For several months, a single trail of sixty-one footprints ______ visible across nearly 120 meters of the dry rock, until autumn rains refilled the reservoir.",
      head: "trail", lure: "footprints", tense: "past", cue: "until autumn rains refilled",
    },
    {
      scene: "sec-harbor-panel",
      text: "Should the city's harbor be dredged so that larger cargo ships can enter? In 2019, after a year of study, a panel of eleven marine biologists and engineers ______ unanimous in recommending against the project, citing the likely damage to the harbor's oyster beds.",
      head: "panel", lure: "engineers", tense: "past", cue: "In 2019",
    },
    {
      scene: "sec-ocracoke-recordings",
      text: "Since the 1990s, linguists have documented the distinctive English spoken on Ocracoke Island, off the coast of North Carolina. A collection of recordings made with the island's oldest residents ______ now the best source for features of speech, such as pronouncing “high tide” as “hoi toide,” that younger islanders rarely use.",
      head: "collection", lure: "residents", tense: "present", cue: "now the best source",
    },
    {
      scene: "sec-ge-ware-crackle",
      text: "Potters in China during the Song dynasty prized a stoneware known as Ge ware for its glaze. The fine cracks running through the glaze of a surviving Ge ware vase ______ not signs of damage or age; they are a deliberate effect of a glaze that shrinks more than the clay beneath it as the vessel cools.",
      head: "cracks", lure: "vase", tense: "present", cue: "they are a deliberate effect",
    },
    {
      scene: "sec-trading-post-coins",
      text: "In 1998, archaeologists excavating a ninth-century trading post on the coast of Norway found a surprising cargo. The silver coins buried beneath the floor of the storehouse ______ minted in Baghdad, more than 4,000 kilometers away.",
      head: "coins", lure: "storehouse", tense: "past", cue: "In 1998",
    },
    {
      scene: "sec-marlow-glassworks",
      text: "The Marlow Glassworks closed in 1931 after nearly a century of production. The furnaces at the heart of the factory's main hall ______ dismantled within a year, and the empty building became a warehouse for a grain merchant.",
      head: "furnaces", lure: "hall", tense: "past", cue: "closed in 1931",
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
    recognize: "The noun right before the blank belongs to a phrase describing the subject; the verb agrees with the subject's head noun, several words earlier, and its tense follows the passage.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["agreement-attractor", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(ATTRACTOR_TOPICS);
      const number = nounNumber(topic.head);
      const head = topic.head === "Each" || topic.head === "One" ? lower(topic.head) : topic.head;
      const why = topic.why || `${q(topic.lure)} belongs to the phrase that describes the subject.`;
      const choices = square(agreementRows({ ...topic, head }, number, why));
      const instance = item(topic, this, {
        ...choices,
        explanation: `The verb's subject is headed by ${q(head)}, which is ${number}; ${q(topic.lure)} belongs to the phrase that describes it. The passage is set in the ${topic.tense} (${q(topic.cue)}), so the verb is the ${number} ${topic.tense}-tense ${q(choices.correct)}.`,
        steps: [
          "Find the verb's subject by stripping away the phrases that describe it.",
          `The head noun is ${q(head)}, which is ${number}; ${q(topic.lure)} is part of a modifying phrase.`,
          `The passage is set in the ${topic.tense} (${q(topic.cue)}); choose the ${number} verb in that tense.`,
        ],
        principles: [
          "A verb agrees with the head of its subject, not with a noun inside a phrase that describes the subject.",
          ...(topic.why ? [topic.why] : []),
          "A verb's tense must fit the time frame the passage has set.",
        ],
        trap: `Making the verb agree with ${q(topic.lure)}, the ${other(number)} noun right before the blank.`,
        hint: "Cross out the phrase between the subject and the verb, then read the sentence again.",
      });
      instance.verify = () => {
        const sentence = blankSentence(topic.text);
        const words = wordsOf(sentence);
        return lastWordOf(beforeBlank(topic.text)) === topic.lure &&
          words.indexOf(topic.head) >= 0 && words.indexOf(topic.head) < words.lastIndexOf(topic.lure) &&
          nounNumber(topic.lure) === other(number) &&
          agreementVerify(topic, number, instance);
      };
      return instance;
    },
  };

  /* ------------------------------------- subject-verb agreement: inverted */

  // A fronted phrase (or "there") puts the verb before its subject. The
  // noun in the fronted phrase (`lure`) has the other number.
  const INVERTED_TOPICS = [
    {
      scene: "sec-whale-hall",
      text: "Visitors entering the natural history museum's central hall tend to stop and look up. Hanging from the ceiling of the hall ______ the skeletons of a blue whale and a humpback whale, each assembled from bones recovered on the same stretch of coast.",
      head: "skeletons", lure: "hall", tense: "present", cue: "tend to stop",
    },
    {
      scene: "sec-trappist-planets",
      text: "The dim red star TRAPPIST-1 lies about forty light-years from Earth. Around this single small star there ______ seven rocky planets, at least three of which orbit at distances where liquid water could exist on their surfaces.",
      head: "planets", lure: "star", tense: "present", cue: "lies about forty light-years",
    },
    {
      scene: "sec-canyon-petroglyphs",
      text: "The desert canyon holds a record of the people who passed through it over thousands of years. Carved into the dark sandstone of its northern wall ______ hundreds of petroglyphs, some showing bighorn sheep and others showing spirals and human figures.",
      head: "hundreds", lure: "wall", tense: "present", cue: "holds a record",
    },
    {
      scene: "sec-goby-burrow",
      text: "On sandy stretches of coral reef, some burrows have two residents. Among the reef's many burrowing animals ______ a small goby that shares a home with a nearly blind shrimp: the shrimp digs and maintains the burrow, while the goby keeps watch for predators.",
      head: "goby", lure: "animals", tense: "present", cue: "some burrows have two residents",
    },
    {
      scene: "sec-monastery-herbal",
      text: "The monastery's library has survived fires, floods, and two wars. Within its vast collection of medieval manuscripts ______ a thirteenth-century herbal whose hand-painted illustrations of medicinal plants remain surprisingly bright.",
      head: "herbal", lure: "manuscripts", tense: "present", cue: "has survived fires",
    },
    {
      scene: "sec-chicxulub-crater",
      text: "The asteroid impact that ended the age of the dinosaurs left a scar that geologists can still trace. Beneath the Yucatán Peninsula's limestone plains and coastal towns there ______ a buried crater more than 180 kilometers wide, its rim marked at the surface by a ring of sinkholes.",
      head: "crater", lure: "towns", tense: "present", cue: "can still trace",
    },
    {
      scene: "sec-chauvet-panel",
      text: "France's Chauvet Cave was sealed by a rockfall for thousands of years, which preserved its interior. Today, deep inside the cave, past chambers scattered with the bones of cave bears, ______ a panel of charcoal drawings of horses, rhinoceroses, and lions made more than 30,000 years ago.",
      head: "panel", lure: "bears", tense: "present", cue: "Today",
    },
    {
      scene: "sec-orchestra-woodwinds",
      text: "A symphony orchestra's seating plan reflects both tradition and acoustics. Behind the rows of string players in most orchestras ______ the woodwind section, with flutes and oboes in front and clarinets and bassoons behind them.",
      head: "section", lure: "orchestras", tense: "present", cue: "reflects both tradition and acoustics",
    },
    {
      scene: "sec-prairie-erratics",
      text: "Thousands of years ago, an ice sheet covered much of what is now central Canada. Scattered across the otherwise flat prairie today ______ granite boulders the size of cars, carried hundreds of kilometers south by the ice and left behind when it melted.",
      head: "boulders", lure: "prairie", tense: "present", cue: "today",
    },
    {
      scene: "sec-attic-trunk-letters",
      text: "When the old farmhouse was sold in 2019, its new owners began clearing out the attic. Inside a cedar trunk pushed against the chimney ______ dozens of letters that a Union soldier had written to his family during the Civil War.",
      head: "dozens", lure: "chimney", tense: "past", cue: "was sold in 2019",
    },
    {
      scene: "sec-logbook-violet",
      text: "Historian Marisol Duarte expected the captain's papers to contain only weather reports and positions. When she opened them in 2016, however, she found that tucked between the pages of his three logbooks ______ a single pressed violet, the only object in the collection that hinted at his life outside the navy.",
      head: "violet", lure: "logbooks", tense: "past", cue: "When she opened them in 2016",
    },
    {
      scene: "sec-seneca-falls-signers",
      text: "About three hundred people attended the women's rights convention held in Seneca Falls, New York, in July 1848. Among the one hundred signers of its Declaration of Sentiments ______ Frederick Douglass, the only African American known to have attended.",
      head: "Douglass", lure: "signers", tense: "past", cue: "in July 1848",
    },
    {
      scene: "sec-alma-antennas",
      text: "Astronomers chose the site for the ALMA observatory because the air there is extremely thin and dry. On the Chajnantor plateau in Chile's Atacama Desert, about 5,000 meters above sea level, ______ the observatory's sixty-six radio antennas.",
      head: "antennas", lure: "plateau", tense: "present", cue: "the air there is extremely thin",
    },
    {
      scene: "sec-antikythera-cargo",
      text: "In 1900, sponge divers working off the Greek island of Antikythera found the wreck of a ship that sank in the first century BCE. Among the objects that divers raised from the wreck over the next year ______ bronze and marble statues, glassware, and a corroded lump of bronze gears.",
      head: "statues", lure: "wreck", tense: "past", cue: "In 1900",
      why: "the subject, “bronze and marble statues, glassware, and a corroded lump of bronze gears,” names several things joined by “and.”",
    },
    {
      scene: "sec-brannock-log",
      text: "The log kept by the keeper of the Brannock lighthouse was destroyed in a fire in 1950, but a historian who read it in the 1930s left detailed notes. According to those notes, among the entries for the stormy winter of 1872 ______ several accounts of ships that ran aground on the rocks below the tower.",
      head: "accounts", lure: "winter", tense: "past", cue: "was destroyed in a fire in 1950",
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
    recognize: "The sentence opens with a phrase (or “there”), so the subject follows the verb; the verb agrees with that later noun, not with the noun in the opening phrase, and its tense follows the passage.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["agreement-attractor", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(INVERTED_TOPICS);
      const number = nounNumber(topic.head);
      const why = topic.why || `${q(topic.lure)} belongs to the opening phrase, and the subject comes after the verb.`;
      const choices = square(agreementRows(topic, number, why));
      const instance = item(topic, this, {
        ...choices,
        explanation: `The sentence is inverted: the opening phrase tells where, and the subject comes after the verb. That subject is headed by ${q(topic.head)}, which is ${number}. The passage is set in the ${topic.tense} (${q(topic.cue)}), so the verb is the ${number} ${topic.tense}-tense ${q(choices.correct)}.`,
        steps: [
          "Notice that the sentence opens with a phrase of place or with “there,” so the verb comes before its subject.",
          `Find the subject after the blank: its head noun is ${q(topic.head)}, which is ${number}.`,
          `The passage is set in the ${topic.tense} (${q(topic.cue)}); choose the ${number} verb in that tense.`,
        ],
        principles: [
          "When a sentence opens with a phrase or with “there,” the verb agrees with the subject that follows it.",
          "A verb's tense must fit the time frame the passage has set.",
        ],
        trap: `Making the verb agree with ${q(topic.lure)}, a noun in the opening phrase, as if it were the subject.`,
        hint: "Turn the sentence around so that it starts with its subject, then choose the verb.",
      });
      instance.verify = () => wordsOf(afterBlank(topic.text)).slice(0, 7).includes(topic.head) &&
        wordsOf(blankSentence(topic.text)).includes(topic.lure) &&
        nounNumber(topic.lure) === other(number) &&
        agreementVerify(topic, number, instance);
      return instance;
    },
  };

  /* --------------------- subject-verb agreement: across a long subject */

  // Hard: the head noun sits in front of an appositive, a relative clause,
  // or a chain of prepositional phrases full of nouns of the other number
  // (or the sentence is inverted behind such a chain), and the tense is set
  // in a different sentence. `lure` is the last noun before the blank.
  const LONG_SUBJECT_TOPICS = [
    {
      scene: "sec-harwell-fire-engine",
      text: "In 1851, the town of Harwell hired its first professional fire brigade. The brigade's first engine, a hand-pumped wagon built in Boston for crews of eight to ten volunteers and pulled through the streets by teams of horses, ______ sold for scrap when the town bought a steam pumper in 1879.",
      head: "engine", lure: "horses", tense: "past", cue: "In 1851",
    },
    {
      scene: "sec-ngalu-recordings",
      text: "Linguists who study endangered languages often work with only a handful of fluent speakers. The recordings that the linguist Amara Oduya made with the last three speakers of Ngalu, a language once spoken in a dozen villages along the northern coast, ______ now the only complete record of its grammar.",
      head: "recordings", lure: "coast", tense: "present", cue: "now the only complete record",
    },
    {
      scene: "sec-kessel-summit-box",
      text: "Hikers who reach the summit of Mount Kessel are often surprised by what they find there. At the very top of the mountain, beside a cairn of stones piled up over the decades by generations of climbers, ______ a small iron box containing a logbook that visitors sign.",
      head: "box", lure: "climbers", tense: "present", cue: "are often surprised",
      why: "the sentence is inverted, so the subject, “a small iron box,” follows the verb.",
    },
    {
      scene: "sec-arden-drowned-village",
      text: "During the drought of 1976, water levels in the Selby Reservoir fell lower than at any time since it was built. The stone walls of Arden, a farming village that had been flooded when the dam was completed in 1934, ______ visible above the water for the first time in more than forty years.",
      head: "walls", lure: "1934", tense: "past", cue: "During the drought of 1976",
      lureWord: "dam",
    },
    {
      scene: "sec-hollis-orchid-house",
      text: "The Hollis Botanical Garden is best known for its cactus collection. Its newest exhibit, a greenhouse filled with rare orchids from the cloud forests of Ecuador and Peru, ______ open to visitors every day except Monday, when gardeners mist and repot the plants.",
      head: "exhibit", lure: "Peru", tense: "present", cue: "every day except Monday",
      lureWord: "orchids",
    },
    {
      scene: "sec-night-migrant-calls",
      text: "Many songbirds migrate at night, when they are hard to see. The calls that thrushes, warblers, and sparrows make while flying over a city in the dark ______ loud enough to be recorded by microphones on rooftops, so researchers can count migrants they never see.",
      head: "calls", lure: "dark", tense: "present", cue: "Many songbirds migrate at night",
    },
    {
      scene: "sec-varga-bindery-press",
      text: "In 1923, the Varga family opened a bookbindery in a narrow building on Castle Street. The shop's only machine, a cast-iron press that had been shipped in pieces from Leipzig along with dozens of spare parts, ______ still in use when the business closed in 1990.",
      head: "machine", lure: "parts", tense: "past", cue: "In 1923",
    },
    {
      scene: "sec-college-dormitory-rules",
      text: "The first women's college in the region opened in 1871 with forty students. The rules of conduct posted in the entrance hall of its only dormitory, a converted farmhouse, ______ strict: students could not leave the grounds without permission or receive visitors after dark.",
      head: "rules", lure: "farmhouse", tense: "past", cue: "opened in 1871",
    },
    {
      scene: "sec-dunmore-tool-library",
      text: "Many public libraries now lend more than books. At the Dunmore Library, a collection of more than two hundred tools, from ladders and power drills to sewing machines, ______ available to any cardholder for up to a week at a time.",
      head: "collection", lure: "machines", tense: "present", cue: "now lend more than books",
    },
    {
      scene: "sec-orrin-ice-sensors",
      text: "Scientists at the Orrin Lake research station study how the lake changes under its winter ice. The sensors that record the temperature of the water at twelve different depths beneath the ice ______ checked by a technician every morning from December to March.",
      head: "sensors", lure: "ice", tense: "present", cue: "every morning from December to March",
    },
    {
      scene: "sec-brisk-harbor-proposal",
      text: "In 1872, the town of Brisk Harbor held a vote on whether to build a seawall. The proposal, drawn up by a committee of merchants, fishermen, and shipbuilders after two winters of damaging storms, ______ approved by a wide margin, and construction began that summer.",
      head: "proposal", lure: "storms", tense: "past", cue: "In 1872",
    },
    {
      scene: "sec-tarn-glacier-photographs",
      text: "The first expedition to map the Tarn Glacier set out from the port of Skarn in 1911. The photographs that its surveyor, a former ship's officer named Karl Brenner, took from the edge of the ice ______ the first images of the glacier ever published.",
      head: "photographs", lure: "ice", tense: "past", cue: "in 1911",
    },
  ];

  const longSubjectAgreement = {
    id: "sec-sva-long-subject",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "subject-verb agreement",
    difficulty: "Hard",
    title: "Verb after a long subject with its own nouns",
    recognize: "The subject's head noun comes before an appositive, a relative clause, or a chain of phrases whose nouns have the other number; find the head, then take the tense from the rest of the passage.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 1, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["agreement-attractor", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(LONG_SUBJECT_TOPICS);
      const number = nounNumber(topic.head);
      const lure = topic.lureWord || topic.lure;
      const why = topic.why || `the nouns between the head and the verb, such as ${q(lure)}, belong to phrases that describe the subject.`;
      const choices = square(agreementRows(topic, number, why));
      const instance = item(topic, this, {
        ...choices,
        explanation: `Strip away everything that describes the subject and its head noun is ${q(topic.head)}, which is ${number}; ${q(lure)} and the other nouns in between belong to the descriptive phrases. The passage is set in the ${topic.tense} (${q(topic.cue)}), so the verb is the ${number} ${topic.tense}-tense ${q(choices.correct)}.`,
        steps: [
          "Find where the subject begins and set aside every phrase, clause, or appositive that describes it.",
          `The head noun is ${q(topic.head)}, which is ${number}.`,
          `Read the rest of the passage for its time frame: ${q(topic.cue)} sets the ${topic.tense}.`,
          `Choose the ${number} ${topic.tense}-tense verb.`,
        ],
        principles: [
          "A verb agrees with the head of its subject, however many words separate them.",
          "A verb's tense must fit the time frame the passage has set, even when that frame is set in another sentence.",
        ],
        trap: `Making the verb agree with ${q(lure)} or another nearby noun of the other number, or taking the tense from the nearest verb instead of from the passage's frame.`,
        hint: "Which single noun is the verb about? And when does the passage say this is true?",
      });
      instance.verify = () => {
        const words = wordsOf(blankSentence(topic.text)).concat(wordsOf(afterBlank(topic.text)).slice(0, 6));
        return words.includes(topic.head) && words.includes(lure) &&
          (topic.lureNumber || nounNumber(lure)) === other(number) &&
          agreementVerify(topic, number, instance);
      };
      return instance;
    },
  };

  /* ------------------------------------------ pronoun: distant antecedent */

  // A pronoun whose antecedent is several words (often a sentence) back, with
  // nouns of the other number in between that cannot sensibly be meant. The
  // choices cross number (its/their) with form: a possessive before a noun,
  // or a contraction ("it is", "they are") before a predicate.
  const DISTANT_PRONOUN_TOPICS = [
    {
      scene: "sec-seed-vault-chambers",
      text: "The Svalbard Global Seed Vault is built into a mountainside on a remote Norwegian island, far from the region's few towns. Because ______ storage chambers sit deep inside permafrost, the seeds kept there would stay frozen even if the power failed.",
      antecedent: "Vault", competitors: ["towns"], role: "possessive", next: "storage chambers",
    },
    {
      scene: "sec-emperor-penguin-eggs",
      text: "Emperor penguins are the only birds that breed during the Antarctic winter. After laying a single egg, a female returns to the sea to feed, leaving the males behind. For about two months, through the darkness and wind of the polar winter, each egg rests on ______ feet beneath a warm fold of skin.",
      antecedent: "males", competitors: ["egg", "winter"], role: "possessive", next: "feet",
    },
    {
      scene: "sec-cuttlefish-color",
      text: "The common cuttlefish can change color in less than a second. The speed comes from chromatophores, millions of small elastic sacs of pigment, each ringed by tiny muscles. Because the sacs lie just beneath ______ skin, even a slight contraction of the muscles changes how the animal looks.",
      antecedent: "cuttlefish", competitors: ["chromatophores", "sacs", "muscles"], role: "possessive", next: "skin",
    },
    {
      scene: "sec-hubble-mirror",
      text: "Launched in 1990, the Hubble Space Telescope orbits about 540 kilometers above Earth. Astronauts on five space shuttle missions repaired and upgraded the observatory between 1993 and 2009, and the first of those missions installed corrective optics to compensate for a flaw in ______ primary mirror.",
      antecedent: "observatory", competitors: ["missions", "optics"], role: "possessive", next: "primary mirror",
    },
    {
      scene: "sec-coral-polyp-bleaching",
      text: "A reef-building coral polyp gets most of its food from partners: single-celled algae that live inside the polyp's tissue and make sugar from sunlight. When the water grows too warm, however, the polyp expels the algae, and ______ white skeleton shows through the now-transparent tissue.",
      antecedent: "polyp", competitors: ["algae"], role: "possessive", next: "white skeleton",
    },
    {
      scene: "sec-sagrada-familia-tower",
      text: "Antoni Gaudí took charge of Barcelona's Sagrada Família basilica in 1883 and devoted the last years of his life to it. Construction has continued in the century since his death, paid for largely by the millions of visitors who tour the site each year, and when complete, ______ tallest tower will make it the tallest church building in the world.",
      antecedent: "basilica", competitors: ["visitors"], role: "possessive", next: "tallest tower",
    },
    {
      scene: "sec-terracotta-paint",
      text: "The roughly 8,000 life-size clay soldiers buried near the tomb of China's first emperor, Qin Shi Huang, were once brightly painted. When excavation began in 1974, exposure to the dry air caused much of ______ original color to flake off within minutes.",
      antecedent: "soldiers", competitors: ["tomb", "emperor", "excavation", "air"], role: "possessive", next: "original color",
    },
    {
      scene: "sec-tardigrade-glass",
      text: "The tardigrade, an animal less than a millimeter long, can survive for years without water. As its surroundings dry out, the animal curls into a dormant ball called a tun, and special proteins turn into a glasslike solid inside ______ cells, holding delicate molecules in place until water returns.",
      antecedent: "animal", competitors: ["proteins"], role: "possessive", next: "cells",
    },
    {
      scene: "sec-voyager-instruments",
      text: "NASA launched the twin Voyager spacecraft in 1977 to study the outer planets. Both probes eventually crossed the heliopause, the edge of the bubble of charged particles that the Sun blows around itself, and to conserve power, engineers have gradually switched off many of ______ instruments.",
      antecedent: "probes", competitors: ["heliopause", "bubble", "Sun"], role: "possessive", next: "instruments",
    },
    {
      scene: "sec-bossou-chimpanzees",
      text: "Chimpanzees in the Bossou forest of Guinea crack open oil-palm nuts with a pair of stones: a flat anvil and a heavy hammer. Mastering the technique takes years, and young chimpanzees watch adults for a long time before attempting to crack ______ first nut.",
      antecedent: "chimpanzees", competitors: ["technique", "anvil", "hammer"], role: "possessive", next: "first nut",
    },
    {
      scene: "sec-bronte-little-books",
      text: "As children in the 1820s and 1830s, Charlotte, Emily, Anne, and Branwell Brontë invented imaginary kingdoms and wrote about them in tiny handmade books, some smaller than a playing card. Scholars who study the books today often need a magnifying glass to read ______ cramped handwriting.",
      antecedent: "children", competitors: ["card", "glass"], role: "possessive", next: "cramped handwriting",
    },
    {
      scene: "sec-brood-frames",
      text: "Honeybee colonies can lose half of their workers in a hard winter. Beekeepers who open their hives in early spring look first at the brood frames, the wooden frames where the queen lays eggs; if ______ packed with eggs and larvae, the colony is likely to recover.",
      antecedent: "frames", competitors: ["winter", "queen"], role: "contraction", next: "packed",
    },
    {
      scene: "sec-atacama-bloom",
      text: "Chile's Atacama Desert is so dry that some of its weather stations have never recorded rain at all. Yet when a rare storm does soak the desert, ______ transformed within weeks, as dormant seeds sprout and cover the sand with flowers.",
      antecedent: "desert", competitors: ["stations"], role: "contraction", next: "transformed",
    },
    {
      scene: "sec-monarch-diapause",
      text: "Most monarch butterflies live only a few weeks as adults. Those that emerge in late summer are different: instead of breeding right away, ______ programmed to fly south, sometimes thousands of kilometers, to spend the winter in the mountains of central Mexico.",
      antecedent: "butterflies", competitors: ["summer"], role: "contraction", next: "programmed",
    },
    {
      scene: "sec-saguaro-storm",
      text: "A mature saguaro cactus, native to the Sonoran Desert, can go for months without rain. After a heavy storm, ______ able to take up hundreds of liters of water within days, its pleated stem visibly swelling as the folds spread apart.",
      antecedent: "cactus", competitors: ["months"], role: "contraction", next: "able",
    },
  ];

  const PRONOUN_FORMS = {
    singular: { possessive: "its", contraction: "it's" },
    plural: { possessive: "their", contraction: "they're" },
  };
  const EXPANSIONS = { "it's": "it is", "they're": "they are" };
  // A contraction supplies "is"/"are" before a participle or adjective; a
  // possessive comes before a noun.
  // (an explicit list: "cramped handwriting" is a noun phrase even though
  // "cramped" ends in -ed).
  const PREDICATE_WORDS = ["able", "unable", "likely", "ready", "packed", "programmed", "transformed", "still", "now"];
  const roleOf = (next) => (PREDICATE_WORDS.includes(lower(firstWordOf(next))) ? "contraction" : "possessive");

  const distantPronoun = {
    id: "sec-pronoun-distant-antecedent",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "pronoun agreement",
    difficulty: "Medium",
    title: "Pronoun with a distant antecedent",
    recognize: "The pronoun refers to a noun named well before the blank; nouns of the other number in between cannot sensibly be meant. Then decide whether the blank needs a possessive or “it is”/“they are.”",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["agreement-attractor", "grammatical-but-illogical"],
    build(t) {
      const topic = t.pick(DISTANT_PRONOUN_TOPICS);
      const number = topic.number || nounNumber(topic.antecedent);
      const lead = beforeBlank(topic.text);
      const near = topic.competitors.reduce((best, noun) => (lead.lastIndexOf(noun) > lead.lastIndexOf(best) ? noun : best));
      const needs = topic.role === "possessive"
        ? `a possessive before ${q(topic.next)}`
        : `${q(number === "singular" ? "it is" : "they are")} before ${q(topic.next)}`;
      const rows = [];
      ["singular", "plural"].forEach((n) => ["possessive", "contraction"].forEach((role) => {
        const form = PRONOUN_FORMS[n][role];
        const meaning = role === "possessive" ? "a possessive" : `a contraction of ${q(EXPANSIONS[form])}`;
        let reason = null;
        if (n !== number && role !== topic.role) {
          reason = `${q(form)} is ${n} and ${meaning}; the pronoun refers to the ${number} ${q(topic.antecedent)}, and the sentence needs ${needs}.`;
        } else if (n !== number) {
          reason = `${q(form)} is ${n}, so it would point to a noun such as ${q(near)}, which cannot be what the sentence means; the pronoun refers to the ${number} ${q(topic.antecedent)}.`;
        } else if (role !== topic.role) {
          reason = `${q(form)} is ${meaning}, but the sentence needs ${needs}.`;
        }
        rows.push([form, { number: n, form: role }, reason]);
      }));
      const choices = square(rows);
      const instance = item(topic, this, {
        ...choices,
        explanation: `The pronoun refers to ${q(topic.antecedent)}, which is ${number}; the nearer ${other(number)} nouns (${topic.competitors.map(q).join(", ")}) cannot sensibly be meant. The sentence needs ${needs}, so the answer is ${q(choices.correct)}.`,
        steps: [
          topic.role === "possessive" ? `Ask whose ${topic.next} the sentence means.` : `Ask what the sentence says is ${topic.next}.`,
          `Trace that noun back to ${q(topic.antecedent)}, which is ${number}, past the ${other(number)} nouns in between.`,
          topic.role === "possessive"
            ? "A noun follows the blank, so choose the possessive, not a contraction."
            : `${q(topic.next)} needs a verb, so choose the contraction that means ${q(EXPANSIONS[choices.correct])}.`,
        ],
        principles: [
          "A pronoun agrees in number with the noun it refers to, even when other nouns come between them.",
          "“Its” and “their” are possessives; “it's” and “they're” are contractions of “it is” and “they are.”",
        ],
        trap: `Choosing a ${other(number)} pronoun to match ${q(near)}, a nearer noun that cannot be what the sentence means.`,
        hint: "What is the sentence talking about? Find that noun in the passage, check its number, and then read the word after the blank.",
      });
      instance.verify = () => {
        const words = wordsOf(lead).map(lower);
        const derived = topic.number ||
          (nounNumber(topic.antecedent) === "singular" ? "singular" : "plural");
        return hasOneBlank(topic.text) &&
          afterBlank(topic.text).trimStart().startsWith(topic.next) &&
          words.includes(lower(topic.antecedent)) &&
          topic.competitors.every((noun) => words.includes(lower(noun)) && nounNumber(noun) === other(derived)) &&
          roleOf(topic.next) === topic.role &&
          instance.correct === PRONOUN_FORMS[derived][roleOf(topic.next)] &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* -------------------------------------- plural and possessive nouns */

  // One noun in four forms: singular or plural, possessive or not. A noun
  // after the blank calls for a possessive; the words around the blank
  // ("both", "a single", the verb's number, a later pronoun) set the number.
  // Where a possessive is the key, a word such as "own", "first", or an
  // adjective stands between the blank and the owned noun, so the plain noun
  // cannot be defended as a noun used like an adjective ("farm yields").
  const NOUN_FORM_TOPICS = [
    {
      scene: "sec-arvel-moons",
      text: "The twin moons of the planet Arvel were discovered in 2019 by astronomers using the Keld Observatory's largest telescope. Both ______ elliptical orbits are tilted sharply compared with the planet's equator, which suggests that the moons were captured rather than formed in place.",
      forms: { singular: "moon", plural: "moons" }, number: "plural", possessive: true, next: "elliptical orbits",
      numberCue: "Both", why: "“Both” refers to the two moons",
    },
    {
      scene: "sec-ellisfort-station-window",
      text: "In 2006, the town of Ellisfort held a festival to celebrate the hundredth birthday of its railway station. The ______ original ticket window, restored for the occasion, reopened for one weekend to sell souvenir tickets.",
      forms: { singular: "station", plural: "stations" }, number: "singular", possessive: true, next: "original ticket window",
      numberCue: "its railway station", why: "the town has one railway station",
    },
    {
      scene: "sec-valley-beekeepers",
      text: "Beekeepers in the Ober Valley reported unusually large honey harvests last summer. Several ______ attributed the increase to a wet spring that kept wildflowers blooming for weeks longer than usual.",
      forms: { singular: "beekeeper", plural: "beekeepers" }, number: "plural", possessive: false, next: "attributed",
      numberCue: "Several", why: "“Several” calls for a plural noun",
    },
    {
      scene: "sec-dunmore-poster-artist",
      text: "Each spring, the Dunmore Library invites one local artist to design its summer reading poster. This year's ______, a printmaker named Hana Reyes, carved her design into a block of linoleum and printed it by hand.",
      forms: { singular: "artist", plural: "artists" }, number: "singular", possessive: false, next: "a printmaker",
      numberCue: "one local artist", why: "the library invites one artist, identified as “a printmaker”",
    },
    {
      scene: "sec-harlow-start-times",
      text: "The Harlow school district surveyed parents about moving the start of the school day later. Most ______ written responses favored the change, even though it would mean later pickups in the afternoon.",
      forms: { singular: "parent", plural: "parents" }, number: "plural", possessive: true, next: "written responses",
      numberCue: "Most", why: "the responses came from most of the parents surveyed",
    },
    {
      scene: "sec-humpback-tag",
      text: "Marine biologists fitted a satellite tag to a single humpback whale off Hawaii in 2021. Over the next seven weeks, the tag tracked the ______ own route north to Alaska, more than 4,000 kilometers across open ocean.",
      forms: { singular: "whale", plural: "whales" }, number: "singular", possessive: true, next: "own route", owned: "route",
      numberCue: "a single humpback whale", why: "the tag was on a single whale",
    },
    {
      scene: "sec-museum-tapestries",
      text: "In 1998, the Varden Museum bought eleven medieval wall hangings at auction. Only three of the ______ are on display at any time; the rest are rolled and kept in storage to protect them from light.",
      forms: { singular: "tapestry", plural: "tapestries" }, number: "plural", possessive: false, next: "are",
      numberCue: "three of the", why: "“three of the” calls for a plural noun",
    },
    {
      scene: "sec-harrow-cliff",
      text: "Ecologists counted 400 nesting pairs of puffins on Harrow Island in 1990 but only 120 in 2021. The steepest decline came after the island's highest ______ collapsed into the sea during a storm in 2009, taking hundreds of burrows with it.",
      forms: { singular: "cliff", plural: "cliffs" }, number: "singular", possessive: false, next: "collapsed",
      numberCue: "with it", why: "the pronoun “it” later in the sentence refers to one cliff",
    },
    {
      scene: "sec-two-farms-yields",
      text: "Two neighboring farms in the Ober Valley, one owned by the Reyes family and one by the Okafor family, switched to organic methods in 2015. The two ______ combined yields dropped slightly for three years before recovering to their earlier levels.",
      forms: { singular: "farm", plural: "farms" }, number: "plural", possessive: true, next: "combined yields",
      numberCue: "The two", why: "“the two” refers to both farms",
    },
    {
      scene: "sec-lund-diary",
      text: "Margit Lund, who founded the Varden Observatory, kept a single diary from 1864 until her death in 1901. The ______ first entry, dated March 3, 1864, describes the night she first saw the rings of Saturn through a telescope.",
      forms: { singular: "diary", plural: "diaries" }, number: "singular", possessive: true, next: "first entry",
      numberCue: "a single diary", why: "Lund kept a single diary",
    },
    {
      scene: "sec-harlow-bus-route",
      text: "In 2022, the Harlow bus company tested a new route linking the train station to the hospital. After six months, the company reported that the ______ had carried more than 40,000 riders, far more than planners had expected.",
      forms: { singular: "route", plural: "routes" }, number: "singular", possessive: false, next: "had carried",
      numberCue: "a new route", why: "the company tested one new route",
    },
    {
      scene: "sec-storm-roofs",
      text: "The lighthouse keeper's log for 1872 describes the worst storm he ever witnessed. The wind was so strong that the ______ of three houses in the village below were torn away, and waves broke over the lamp room forty meters above the sea.",
      forms: { singular: "roof", plural: "roofs" }, number: "plural", possessive: false, next: "of three houses",
      numberCue: "were torn away", why: "the verb “were” calls for a plural subject",
    },
  ];

  const possessiveOrPlural = {
    id: "sec-possessive-or-plural",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "possessives and plurals",
    difficulty: "Medium",
    title: "Plural or possessive noun",
    recognize: "Two questions: does the noun own the word that follows it (possessive), and is it one or more than one (the words around it decide)?",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["equivalent-form", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(NOUN_FORM_TOPICS);
      const { singular, plural } = topic.forms;
      const spell = (number, possessive) => {
        const base = number === "singular" ? singular : plural;
        if (!possessive) return base;
        return number === "plural" && base.endsWith("s") ? `${base}'` : `${base}'s`;
      };
      const needsPossessive = topic.possessive;
      const owned = topic.owned || topic.next;
      const rows = [];
      ["singular", "plural"].forEach((number) => [true, false].forEach((possessive) => {
        const form = spell(number, possessive);
        let reason = null;
        const wrongNumber = number !== topic.number;
        const wrongCase = possessive !== needsPossessive;
        const caseWord = needsPossessive
          ? `the noun owns ${q(owned)}, so it must be possessive`
          : `the noun does not own what follows it (${q(topic.next)}), so it takes no apostrophe`;
        if (wrongNumber && wrongCase) {
          reason = `${q(form)} is ${number}${possessive ? " and possessive" : ""}; ${topic.why}, and ${caseWord}.`;
        } else if (wrongNumber) {
          reason = `${q(form)} is ${number}, but ${topic.why}.`;
        } else if (wrongCase) {
          reason = possessive
            ? `${q(form)} is possessive, but ${caseWord}.`
            : `${q(form)} has the right number but no apostrophe; ${caseWord}.`;
        }
        rows.push([form, { number, possessive: possessive ? "yes" : "no" }, reason]);
      }));
      const choices = square(rows);
      const instance = item(topic, this, {
        ...choices,
        explanation: `${cap(topic.why)}, so the noun is ${topic.number}. ${needsPossessive
          ? `It owns ${q(owned)}, so it takes the ${topic.number} possessive: ${q(choices.correct)}.`
          : `Nothing follows it that it owns, so it takes no apostrophe: ${q(choices.correct)}.`}`,
        steps: [
          `Read the word after the blank (${q(topic.next)}): does the noun own it?`,
          `Find the words that set the noun's number: ${q(topic.numberCue)}.`,
          `Choose the ${topic.number}${needsPossessive ? " possessive" : " form without an apostrophe"}.`,
        ],
        principles: [
          "A possessive noun comes before the thing it owns; a plural noun without an apostrophe owns nothing.",
          "A singular possessive adds 's (station's); a plural ending in s adds only an apostrophe (moons').",
        ],
        trap: needsPossessive
          ? "Choosing the plural without an apostrophe because the noun sounds plural, though it owns the word after it."
          : "Adding an apostrophe to a plural that owns nothing.",
        hint: "Ask two questions: one or more than one? Does it own the next word?",
      });
      instance.verify = () => {
        const offered = [instance.correct, ...instance.wrong.map(([form]) => form)];
        const nextIsNounPhrase = !/^(are|were|is|was|had|have|has|attributed|collapsed|of|a)\b/.test(topic.next);
        return hasOneBlank(topic.text) && topic.text.includes(topic.numberCue) &&
          afterBlank(topic.text).replace(/^[\s,]+/, "").startsWith(topic.next) &&
          nextIsNounPhrase === needsPossessive &&
          nounNumber(topic.number === "plural" ? plural : singular) === topic.number &&
          offered.filter((form) => /'/.test(form)).length === 2 &&
          instance.correct === spell(topic.number, needsPossessive) &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------------------- verb tense: frame */

  // All four choices agree with the subject; the passage's time frame alone
  // decides. The choices cross time (present or past) with aspect (simple or
  // perfect): "past" is a narrative with a stated past date; "earlier" an
  // action finished before another past moment ("by the time", "by then");
  // "habitual" a present-tense account of what happens each year; "span" an
  // action that runs from a past point up to now ("since", "over the past").
  const TENSE_TOPICS = [
    {
      scene: "sec-fleming-mold",
      text: "In September 1928, Alexander Fleming returned to his London laboratory after a vacation and noticed that a mold growing on one of his culture plates had killed the bacteria around it. Curious, he ______ the mold in a flask of broth and found that it belonged to the genus Penicillium.",
      frame: "past", cue: "In September 1928",
      forms: { present: "grows", past: "grew", presentPerfect: "has grown", pastPerfect: "had grown" },
    },
    {
      scene: "sec-anning-ichthyosaur",
      text: "In 1811, Mary Anning's brother Joseph found the skull of an ichthyosaur in the crumbling cliffs near Lyme Regis, England. About a year later, twelve-year-old Mary ______ the rest of the skeleton, digging it carefully out of the rock.",
      frame: "past", cue: "About a year later",
      forms: { present: "uncovers", past: "uncovered", presentPerfect: "has uncovered", pastPerfect: "had uncovered" },
    },
    {
      scene: "sec-curie-elements",
      text: "In 1898, Marie and Pierre Curie were studying pitchblende, a uranium ore that was far more radioactive than its uranium content alone could explain. Later that year, the couple ______ two new elements, polonium and radium, which accounted for the extra radioactivity.",
      frame: "past", cue: "Later that year",
      forms: { present: "announce", past: "announced", presentPerfect: "have announced", pastPerfect: "had announced" },
    },
    {
      scene: "sec-coleman-le-crotoy",
      text: "Because no flight school in the United States would admit a Black woman, Bessie Coleman learned French and sailed to France in November 1920. There she ______ for seven months at an aviation school in Le Crotoy, learning to fly in a fragile biplane.",
      frame: "past", cue: "November 1920",
      forms: { present: "trains", past: "trained", presentPerfect: "has trained", pastPerfect: "had trained" },
    },
    {
      scene: "sec-erie-canal-freight",
      text: "The Erie Canal, completed in 1825, connected the Hudson River to Lake Erie across 584 kilometers of upstate New York. In the years after the canal opened, the cost of shipping a ton of goods from Buffalo to New York City ______ by roughly 90 percent.",
      frame: "past", cue: "In the years after the canal opened",
      forms: { present: "falls", past: "fell", presentPerfect: "has fallen", pastPerfect: "had fallen" },
    },
    {
      scene: "sec-elephant-island-rescue",
      text: "In April 1916, twenty-two men from Ernest Shackleton's expedition were stranded on Elephant Island while Shackleton sailed for help. By the time the Chilean tug Yelcho finally reached the island on August 30, the men ______ there for more than four months, surviving mostly on penguins and seals.",
      frame: "earlier", cue: "By the time",
      forms: { present: "live", past: "lived", presentPerfect: "have lived", pastPerfect: "had lived" },
    },
    {
      scene: "sec-pompeii-burial",
      text: "Mount Vesuvius erupted in A.D. 79, sending a column of ash and pumice high into the air above the Bay of Naples. By the time the eruption ended the next day, falling ash and stone ______ the nearby town of Pompeii under several meters of debris.",
      frame: "earlier", cue: "By the time",
      forms: { present: "bury", past: "buried", presentPerfect: "have buried", pastPerfect: "had buried" },
    },
    {
      scene: "sec-magellan-voyage",
      text: "Of the roughly 270 men who sailed from Spain with Ferdinand Magellan in 1519, only 18 were aboard the ship Victoria when it returned in September 1522. By then, Magellan himself ______ in a battle in the Philippines, more than a year before the voyage ended.",
      frame: "earlier", cue: "By then",
      forms: { present: "dies", past: "died", presentPerfect: "has died", pastPerfect: "had died" },
    },
    {
      scene: "sec-darwin-wallace-letter",
      text: "In June 1858, Charles Darwin received a letter from the naturalist Alfred Russel Wallace outlining a theory of evolution by natural selection. Darwin was stunned: by that time, he ______ on the same idea for nearly twenty years without publishing it.",
      frame: "earlier", cue: "by that time",
      forms: { present: "works", past: "worked", presentPerfect: "has worked", pastPerfect: "had worked" },
    },
    {
      scene: "sec-everest-1953",
      text: "Edmund Hillary and Tenzing Norgay reached the summit of Mount Everest on May 29, 1953, as members of a British expedition. By the time they stood on top, several earlier expeditions ______ to climb the mountain and failed, some of them within a few hundred meters of the summit.",
      frame: "earlier", cue: "By the time",
      forms: { present: "try", past: "tried", presentPerfect: "have tried", pastPerfect: "had tried" },
    },
    {
      scene: "sec-spotted-salamanders",
      text: "Spotted salamanders spend most of the year underground in the forests of eastern North America. On the first warm, rainy nights of spring, the adults ______ to the same shallow ponds where they hatched, sometimes crossing roads in large numbers.",
      frame: "habitual", cue: "spend most of the year",
      forms: { present: "migrate", past: "migrated", presentPerfect: "have migrated", pastPerfect: "had migrated" },
    },
    {
      scene: "sec-periodical-cicadas",
      text: "Periodical cicadas in the eastern United States spend thirteen or seventeen years underground, feeding on sap from tree roots. In the spring of their final year, once the soil about twenty centimeters down warms to roughly 18°C, the nymphs ______ to the surface by the millions.",
      frame: "habitual", cue: "spend thirteen or seventeen years",
      forms: { present: "emerge", past: "emerged", presentPerfect: "have emerged", pastPerfect: "had emerged" },
    },
    {
      scene: "sec-old-faithful-timing",
      text: "Yellowstone's Old Faithful is not the park's largest geyser, but it is among the most predictable. Rangers forecast each eruption by timing the one before it: when an eruption lasts longer than about two and a half minutes, the geyser usually ______ again roughly 90 minutes later.",
      frame: "habitual", cue: "Rangers forecast each eruption",
      forms: { present: "erupts", past: "erupted", presentPerfect: "has erupted", pastPerfect: "had erupted" },
    },
    {
      scene: "sec-harwick-square-cafes",
      text: "In 2012, the city of Harwick banned cars from its central square and replaced the parking spaces with benches and trees. Since the ban took effect, the number of cafés facing the square ______ from four to nineteen, and the city is now considering closing two nearby streets as well.",
      frame: "span", cue: "Since the ban took effect",
      forms: { present: "grows", past: "grew", presentPerfect: "has grown", pastPerfect: "had grown" },
    },
    {
      scene: "sec-leatherback-tagging",
      text: "The marine biologist Keiko Tan began tagging leatherback turtles on the beaches of northern Trinidad in 2009. Over the past fifteen years, her team ______ more than 2,000 turtles, and the data now show where the animals feed between nesting seasons.",
      frame: "span", cue: "Over the past fifteen years",
      forms: { present: "tags", past: "tagged", presentPerfect: "has tagged", pastPerfect: "had tagged" },
    },
    {
      scene: "sec-orrin-lake-level",
      text: "Hydrologists have measured the depth of Lake Orrin every spring since 1975, and the long record lets them spot unusual years quickly. So far this decade, the lake's spring level ______ below its long-term average in every year but one, a pattern the hydrologists link to thinner winter snowpack.",
      frame: "span", cue: "So far this decade",
      forms: { present: "falls", past: "fell", presentPerfect: "has fallen", pastPerfect: "had fallen" },
    },
    {
      scene: "sec-dunmore-orchestra",
      text: "The Dunmore Community Orchestra was founded in 1998 by a retired music teacher and eleven of her former students. Ever since its founding, the orchestra ______ a free concert in the town park every July, and the concert now draws more than a thousand listeners.",
      frame: "span", cue: "Ever since its founding",
      forms: { present: "gives", past: "gave", presentPerfect: "has given", pastPerfect: "had given" },
    },
  ];

  const FRAME_TENSE = { past: "past", earlier: "pastPerfect", habitual: "present", span: "presentPerfect" };
  const TENSE_FEATURES = {
    present: { time: "present", perfect: "no" },
    past: { time: "past", perfect: "no" },
    presentPerfect: { time: "present", perfect: "yes" },
    pastPerfect: { time: "past", perfect: "yes" },
  };
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
    span: {
      present: "uses the simple present, which cannot describe a change or a series of actions running from a past point up to now.",
      past: "uses the simple past, which treats the action as finished; the sentence describes a span that runs up to the present.",
      pastPerfect: "uses the past perfect, which would end the action before another past moment; this span runs up to now.",
    },
  };
  const FRAME_WORDS = {
    past: "a finished past event, told in the simple past",
    earlier: "an action already complete before another past moment",
    habitual: "something that happens regularly, told in the present tense",
    span: "an action that runs from a past point up to the present",
  };
  // Words that set each frame, checked against every topic's cue.
  const FRAME_CUES = {
    past: /\b(in|later|about|after)\b|\b\d{4}\b/i,
    earlier: /\bby (the time|then|that time)\b/i,
    habitual: /\b(spend|forecast|each|every)\b/i,
    span: /\b(since|over the past|so far)\b/i,
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
    difficulty: "Medium",
    title: "Verb tense set by the passage's time frame",
    recognize: "Every choice agrees with its subject and is grammatical alone; the passage's other verbs and time words decide both the time (present or past) and whether the perfect is needed.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(TENSE_TOPICS);
      const needed = FRAME_TENSE[topic.frame];
      const choices = square(Object.keys(TENSE_NAMES).map((tense) => [
        topic.forms[tense],
        TENSE_FEATURES[tense],
        tense === needed ? null : `${q(topic.forms[tense])} ${TENSE_REASONS[topic.frame][tense]}`,
      ]));
      const instance = item(topic, this, {
        ...choices,
        explanation: `The sentence describes ${FRAME_WORDS[topic.frame]} (note ${q(topic.cue)}), so the verb must be the ${TENSE_NAMES[needed]}, ${q(choices.correct)}.`,
        steps: [
          "Confirm that every choice agrees with the subject, so tense alone decides.",
          `Find the time frame: ${q(topic.cue)} marks ${FRAME_WORDS[topic.frame]}.`,
          `Choose the ${TENSE_NAMES[needed]}, ${q(choices.correct)}.`,
        ],
        principles: [
          "A verb's tense must fit the time frame the passage has already set.",
          "The past perfect (“had” plus a past participle) marks an action completed before another past moment; the present perfect (“has” or “have” plus a past participle) marks one that runs up to now.",
        ],
        trap: "Choosing a tense that sounds fine in the sentence alone without checking when the passage says the action happened.",
        hint: "Look for the words that say when this happened, and compare it with the passage's other events.",
      });
      instance.verify = () => {
        const participle = topic.forms.pastPerfect.replace(/^had\s+/, "");
        const offered = [instance.correct, ...instance.wrong.map(([form]) => form)];
        const tenses = offered.map((form) => tenseOf(form, topic.forms));
        return hasOneBlank(topic.text) &&
          beforeBlank(topic.text).includes(topic.cue) &&
          FRAME_CUES[topic.frame].test(topic.cue) &&
          new RegExp(`^(has|have) ${participle}$`).test(topic.forms.presentPerfect) &&
          topic.forms.past !== topic.forms.present &&
          tenseOf(instance.correct, topic.forms) === needed &&
          new Set(tenses).size === 4 && !tenses.includes(null) &&
          // A narrative frame names its year; a habitual one names none.
          (topic.frame !== "past" || /\b\d{4}\b/.test(beforeBlank(topic.text))) &&
          (topic.frame !== "habitual" || !/\b1\d{3}\b|\b20\d{2}\b/.test(beforeBlank(topic.text))) &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------------ verb form: conditional sentences */

  // Hard: sentences that imagine what is not or was not so. The choices cross
  // "would" (yes or no) with the perfect (yes or no): "would have saved",
  // "would save", "had saved", "saved". Which clause holds the blank (the
  // "if" clause or the result) decides "would"; whether the imagined time is
  // past or present decides the perfect. `clause` is "condition" or
  // "result"; `time` is "past" or "present".
  const CONDITIONAL_TOPICS = [
    {
      scene: "sec-harwell-timber-bridge",
      text: "The Harwell Bridge, built of timber in 1880, collapsed during the great flood of 1927. Engineers who studied the wreckage later concluded that if the bridge had been built of steel, it ______ the flood with little damage.",
      clause: "result", time: "past", cue: "if the bridge had been built of steel",
      forms: { base: "survive", past: "survived", participle: "survived" },
    },
    {
      scene: "sec-ardel-mapmaker",
      text: "The mapmaker Jonas Ardel sailed with the 1788 expedition to the Keld Islands but fell ill and was left ashore before its final voyage. Had he stayed with the ship, historians believe, the expedition ______ the islands' southern coast before the winter storms began.",
      clause: "result", time: "past", cue: "Had he stayed with the ship",
      forms: { base: "reach", past: "reached", participle: "reached" },
    },
    {
      scene: "sec-rejected-rail-line",
      text: "In 1972, voters in Marlow County rejected a proposed commuter rail line by fewer than two hundred votes. If the line had been built, planners later estimated, suburban commuters ______ nearly an hour each day during the decades that followed.",
      clause: "result", time: "past", cue: "If the line had been built",
      forms: { base: "save", past: "saved", participle: "saved" },
    },
    {
      scene: "sec-glass-negatives-cellar",
      text: "The Varden Museum's collection of glass negatives survived the fire of 1954 only because a curator had moved the boxes to the cellar the week before. If the negatives ______ in the upstairs archive, all of them would have been destroyed.",
      clause: "condition", time: "past", cue: "would have been destroyed",
      forms: { base: "remain", past: "remained", participle: "remained" },
    },
    {
      scene: "sec-marrow-notebooks",
      text: "The poet Ines Marrow published only one book in her lifetime and burned most of her drafts shortly before she died in 1961. Scholars often wish that she ______ her notebooks, which might have shown how her poems took shape.",
      clause: "condition", time: "past", cue: "might have shown",
      forms: { base: "keep", past: "kept", participle: "kept" },
    },
    {
      scene: "sec-ashby-levees",
      text: "The Tolliver River flooded the town of Ashby in 1998, damaging more than three hundred homes. According to a report issued the following year, if the town ______ its levees after a smaller flood in 1991, most of that damage could have been avoided.",
      clause: "condition", time: "past", cue: "could have been avoided",
      forms: { base: "raise", past: "raised", participle: "raised" },
    },
    {
      scene: "sec-keld-reservoir",
      text: "The island of Keld gets almost all of its fresh water from a single reservoir, which has run low in each of the last five summers. If the reservoir were twice as large, residents ______ water during dry spells, and the island could support more farms.",
      clause: "result", time: "present", cue: "If the reservoir were twice as large",
      forms: { base: "ration", past: "rationed", participle: "rationed" }, negative: true,
    },
    {
      scene: "sec-marlow-museum-storage",
      text: "Most of the Marlow Museum's collection sits in storage, because its galleries can display only about a tenth of the objects it owns. If the museum's galleries were larger, visitors ______ far more of its textiles and ceramics on an ordinary afternoon.",
      clause: "result", time: "present", cue: "If the museum's galleries were larger",
      forms: { base: "see", past: "saw", participle: "seen" },
    },
    {
      scene: "sec-killdeer-nest",
      text: "The killdeer, a North American shorebird, lays its eggs in a shallow scrape on open gravel, where foxes and snakes can easily find them. If the bird nested in trees instead, its eggs ______ far less exposed to predators, though the chicks, which leave the nest within hours of hatching, would face a long drop.",
      clause: "result", time: "present", cue: "If the bird nested in trees instead",
      forms: { base: "be", past: "were", participle: "been" },
    },
    {
      scene: "sec-hourly-bus-route",
      text: "Today, the only bus route in the town of Ellisfort runs once an hour, and many residents without cars rely on neighbors for rides to work. If the route ______ every fifteen minutes, far more of those residents would take the bus.",
      clause: "condition", time: "present", cue: "would take the bus",
      forms: { base: "run", past: "ran", participle: "run" },
    },
    {
      scene: "sec-observatory-sky-glow",
      text: "The Varden Observatory's largest telescope sits at the edge of a growing city whose lights now brighten the night sky. If the skies above the observatory ______ as dark today as they were a century ago, astronomers could still use the telescope to study faint galaxies.",
      clause: "condition", time: "present", cue: "could still use the telescope",
      forms: { base: "be", past: "were", participle: "been" },
    },
    {
      scene: "sec-sonar-unit-weight",
      text: "The research team's sonar unit weighs nearly two hundred kilograms, so it must be lowered from a crane on a large ship. If the unit ______ light enough for two divers to carry, the team could survey the shallow reefs that large ships cannot reach.",
      clause: "condition", time: "present", cue: "could survey the shallow reefs",
      forms: { base: "be", past: "were", participle: "been" },
    },
  ];

  // The four forms of a conditional square, by "would" and perfect.
  function conditionalForms(topic) {
    const not = topic.negative ? " not" : "";
    return {
      "yes|yes": `would${not} have ${topic.forms.participle}`,
      "yes|no": `would${not} ${topic.forms.base}`,
      "no|yes": topic.negative ? `had not ${topic.forms.participle}` : `had ${topic.forms.participle}`,
      "no|no": topic.negative ? `did not ${topic.forms.base}` : topic.forms.past,
    };
  }

  const conditionalVerb = {
    id: "sec-conditional-verb-forms",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "verb form",
    difficulty: "Hard",
    title: "Verb forms in sentences about what did not happen",
    recognize: "The sentence imagines something contrary to fact. Decide which part holds the blank (the “if” part never takes “would”; the result does) and whether the imagined time is past (“had,” “would have”) or present (“were,” “would”).",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "grammatical-but-illogical"],
    build(t) {
      const topic = t.pick(CONDITIONAL_TOPICS);
      const forms = conditionalForms(topic);
      const needWould = topic.clause === "result" ? "yes" : "no";
      const needPerfect = topic.time === "past" ? "yes" : "no";
      const partName = topic.clause === "result" ? "the result of the imagined condition" : "the imagined condition itself";
      const rows = Object.entries(forms).map(([corner, form]) => {
        const [would, perfect] = corner.split("|");
        const problems = [];
        if (would !== needWould) {
          problems.push(would === "yes"
            ? `“would” does not belong in the condition of a contrary-to-fact sentence; the blank is ${partName}`
            : `the blank is ${partName}, which needs “would”`);
        }
        if (perfect !== needPerfect) {
          problems.push(perfect === "yes"
            ? `the perfect places the imagined event in the past, but the sentence imagines the present (${q(topic.cue)})`
            : `without the perfect, the form imagines the present, but the sentence imagines the past (${q(topic.cue)})`);
        }
        return [form, { modal: would, perfect }, problems.length ? `In ${q(form)}, ${problems.join("; and ")}.` : null];
      });
      const choices = square(rows);
      const instance = item(topic, this, {
        ...choices,
        explanation: `The sentence imagines something that ${topic.time === "past" ? "did not happen in the past" : "is not so now"}, and the blank is ${partName}. ${topic.clause === "result"
          ? `The result takes “would”${topic.time === "past" ? " plus the perfect (“would have”)" : " plus the base verb"}`
          : `The condition takes no “would”; it uses ${topic.time === "past" ? "the past perfect (“had”)" : "the simple past form (“were” for “be”)"}`}, so the answer is ${q(choices.correct)}.`,
        steps: [
          "Decide whether the blank is in the imagined condition (the “if” or “wish” part) or in its result.",
          `Decide when the imagined situation is set: ${topic.time === "past" ? "the past" : "the present"} (${q(topic.cue)}).`,
          `Condition: “had” + participle for the past, simple past for the present. Result: “would have” + participle for the past, “would” + base verb for the present. Here: ${q(choices.correct)}.`,
        ],
        principles: [
          "In a sentence about what is not or was not so, “would” goes in the result clause, never in the “if” clause.",
          "An imagined past uses “had” (condition) and “would have” (result); an imagined present uses the simple past, or “were” for “be” (condition), and “would” (result).",
        ],
        trap: topic.clause === "condition"
          ? "Putting “would” into the condition because the sentence is hypothetical."
          : "Choosing the form without “would” (or the wrong time) because it sounds natural next to the “if” clause.",
        hint: "Is the blank in the “if” part or in what would follow from it? And is the imagined time past or present?",
      });
      instance.verify = () => {
        const text = topic.text;
        const blankAt = text.indexOf(BLANK);
        const cueAt = text.indexOf(topic.cue);
        // A result follows its condition's cue ("if ... had", "Had he ...",
        // "If ... were"); a condition's cue is the result after the blank.
        const conditionCue = /^(if|had)\b/i.test(topic.cue);
        const resultCue = /\b(would|could|might)\b/.test(topic.cue);
        const cueTime = /\bhad\b|\bhave (been|shown)\b/i.test(topic.cue) ? "past" : "present";
        return hasOneBlank(text) && cueAt >= 0 &&
          (topic.clause === "result" ? conditionCue && cueAt < blankAt : resultCue && cueAt > blankAt) &&
          cueTime === topic.time &&
          instance.correct === forms[`${needWould}|${needPerfect}`] &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ---------------------------------------- verb form: finite or not */

  // Either the sentence still lacks its main verb (a long subject with a
  // nonessential element hides the gap), or it already has one (`mainVerb`)
  // and the blank opens a modifier. The choices cross finiteness with a
  // second feature (`second`): tense for a missing main verb (the passage's
  // time frame decides), voice for a participle (the subject is acted on),
  // or the perfect (an action complete before the main one).
  const FINITE_TOPICS = [
    {
      scene: "sec-noether-gottingen",
      text: "The German mathematician Emmy Noether, whose 1918 theorem links each symmetry in physics to a quantity that is conserved, such as energy, ______ at the University of Göttingen for years without a salary because women were barred from regular faculty positions.",
      subject: "Emmy Noether", mainVerb: null, second: "tense", cue: "were barred",
      choices: { "yes|past": "lectured", "yes|present": "lectures", "no|past": "having lectured", "no|present": "lecturing" },
      key: "yes|past",
    },
    {
      scene: "sec-zitkala-sa-opera",
      text: "Zitkála-Šá, a Yankton Dakota writer who published essays and stories drawn from her childhood on the Yankton reservation, ______ the libretto for The Sun Dance Opera with the composer William F. Hanson in 1913.",
      subject: "Zitkála-Šá", mainVerb: null, second: "tense", cue: "in 1913",
      choices: { "yes|past": "co-wrote", "yes|present": "co-writes", "no|past": "having co-written", "no|present": "co-writing" },
      key: "yes|past",
    },
    {
      scene: "sec-raisin-in-the-sun",
      text: "Lorraine Hansberry's A Raisin in the Sun, which follows a Black family in Chicago as they decide whether to buy a house in a white neighborhood, ______ the first play by a Black woman to be produced on Broadway when it opened in 1959.",
      subject: "A Raisin in the Sun", mainVerb: null, second: "tense", cue: "when it opened in 1959",
      choices: { "yes|past": "was", "yes|present": "is", "no|past": "having been", "no|present": "being" },
      key: "yes|past",
    },
    {
      scene: "sec-humboldt-current",
      text: "The Humboldt Current, which carries cold water north from the Southern Ocean along the western coast of South America, ______ nutrients up from the deep ocean, supporting one of the most productive fisheries on Earth.",
      subject: "The Humboldt Current", mainVerb: null, second: "tense", cue: "which carries cold water",
      choices: { "yes|past": "drew", "yes|present": "draws", "no|past": "having drawn", "no|present": "drawing" },
      key: "yes|present",
    },
    {
      scene: "sec-rubin-galaxies",
      text: "In the 1970s, the astronomer Vera Rubin, whose measurements of how fast stars orbit the centers of spiral galaxies puzzled many of her colleagues, ______ some of the strongest early evidence that most of the matter in the universe cannot be seen.",
      subject: "Vera Rubin", mainVerb: null, second: "tense", cue: "In the 1970s",
      choices: { "yes|past": "provided", "yes|present": "provides", "no|past": "having provided", "no|present": "providing" },
      key: "yes|past",
    },
    {
      scene: "sec-leavitt-cepheids",
      text: "The astronomer Henrietta Swan Leavitt, who worked at the Harvard College Observatory measuring the brightness of stars on thousands of photographic plates, ______ in 1912 that the brightest Cepheid variable stars pulse the most slowly.",
      subject: "Henrietta Swan Leavitt", mainVerb: null, second: "tense", cue: "in 1912",
      choices: { "yes|past": "reported", "yes|present": "reports", "no|past": "having reported", "no|present": "reporting" },
      key: "yes|past",
    },
    {
      scene: "sec-kente-strips",
      text: "Kente cloth, which weavers in Ghana produce on narrow looms in strips only about ten centimeters wide, ______ its bold, checkered patterns from the way those strips are sewn together edge to edge.",
      subject: "Kente cloth", mainVerb: null, second: "tense", cue: "which weavers in Ghana produce",
      choices: { "yes|past": "got", "yes|present": "gets", "no|past": "having gotten", "no|present": "getting" },
      key: "yes|present",
    },
    {
      scene: "sec-petra-sandstone",
      text: "The city of Petra, ______ into rose-colored sandstone cliffs by the Nabataeans more than two thousand years ago, drew traders carrying incense and spices across the deserts of Arabia.",
      subject: "Petra", mainVerb: "drew", second: "voice", cue: "by the Nabataeans",
      choices: { "no|passive": "carved", "no|active": "carving", "yes|passive": "was carved", "yes|active": "carves" },
      key: "no|passive",
    },
    {
      scene: "sec-grand-canal",
      text: "The Grand Canal of China, ______ in stages over more than a thousand years to link Beijing with Hangzhou, is the longest artificial waterway in the world, stretching roughly 1,800 kilometers.",
      subject: "The Grand Canal of China", mainVerb: "is", second: "voice", cue: "in stages",
      choices: { "no|passive": "built", "no|active": "building", "yes|passive": "was built", "yes|active": "builds" },
      key: "no|passive",
    },
    {
      scene: "sec-coelacanth-rediscovery",
      text: "The coelacanth, ______ by scientists to have died out around the time of the dinosaurs, was found alive in a fishing boat's catch off the coast of South Africa in 1938.",
      subject: "coelacanth", mainVerb: "was", second: "voice", cue: "by scientists",
      choices: { "no|passive": "thought", "no|active": "thinking", "yes|passive": "was thought", "yes|active": "thinks" },
      key: "no|passive",
    },
    {
      scene: "sec-terracotta-discovery",
      text: "The Terracotta Army, ______ in 1974 by farmers digging a well near the city of Xi'an, includes roughly 8,000 life-size clay soldiers, each with its own facial features.",
      subject: "The Terracotta Army", mainVerb: "includes", second: "voice", cue: "by farmers",
      choices: { "no|passive": "discovered", "no|active": "discovering", "yes|passive": "was discovered", "yes|active": "discovers" },
      key: "no|passive",
    },
    {
      scene: "sec-dead-sea-scrolls",
      text: "The Dead Sea Scrolls, ______ in caves near the northwestern shore of the Dead Sea between 1947 and 1956, include the oldest known manuscripts of the Hebrew Bible.",
      subject: "The Dead Sea Scrolls", mainVerb: "include", second: "voice", cue: "between 1947 and 1956",
      choices: { "no|passive": "found", "no|active": "finding", "yes|passive": "were found", "yes|active": "find" },
      key: "no|passive",
    },
    {
      scene: "sec-jemison-physician",
      text: "Mae Jemison, ______ as a physician and as a Peace Corps medical officer in West Africa before joining NASA, became the first African American woman to travel into space in 1992.",
      subject: "Mae Jemison", mainVerb: "became", second: "perfect", cue: "before joining NASA",
      choices: { "no|yes": "having worked", "no|no": "to work", "yes|yes": "had worked", "yes|no": "works" },
      key: "no|yes",
    },
  ];

  const SECOND_REASONS = {
    tense: (form, value, topic) => `${q(form)} is ${value} tense, which does not fit the passage's time frame (${q(topic.cue)})`,
    voice: (form, value, topic) => `${q(form)} is ${value}, but ${topic.subject.replace(/^The /, "the ")} is acted on (${q(topic.cue)}), so the form must be passive`,
    perfect: (form, value) => (value === "yes"
      ? `${q(form)} marks an action completed earlier`
      : `${q(form)} does not show that this action came before the main one`),
  };

  const finiteVerb = {
    id: "sec-finite-or-nonfinite",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "verb form",
    difficulty: "Hard",
    title: "Main verb or modifier",
    recognize: "Decide whether the sentence already has its main verb. If it does, the blank opens a modifier and needs a nonfinite form; if it does not, the blank must supply the main verb in the passage's tense.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(FINITE_TOPICS);
      const needsFinite = !topic.mainVerb;
      const [, keySecond] = topic.key.split("|");
      const rows = Object.entries(topic.choices).map(([corner, form]) => {
        const [finite, second] = corner.split("|");
        if (corner === topic.key) return [form, { finite, [topic.second]: second }, null];
        const problems = [];
        if ((finite === "yes") !== needsFinite) {
          problems.push(needsFinite
            ? `${q(form)} is not a main verb, so the sentence would have a subject, ${q(topic.subject)}, and no verb to go with it`
            : `${q(form)} is a main verb, but the sentence already has one, ${q(topic.mainVerb)}; a second one between the commas leaves the sentence ungrammatical`);
        }
        // A participle has no tense of its own, so a wrong-tense note is
        // given only for finite forms.
        if (second !== keySecond && !(topic.second === "tense" && finite === "no")) {
          const reason = SECOND_REASONS[topic.second](form, second, topic);
          problems.push(topic.second === "perfect" && !problems.length
            ? `${reason}, but ${topic.subject}'s work came before the event the sentence reports`
            : reason);
        }
        return [form, { finite, [topic.second]: second }, `${problems.join("; also, ")}.`];
      });
      const choices = square(rows);
      const instance = item(topic, this, {
        ...choices,
        explanation: needsFinite
          ? `The words between the commas describe ${q(topic.subject)} but give it no verb, so the blank must supply the main verb, and the passage's time frame (${q(topic.cue)}) sets its tense: ${q(choices.correct)}.`
          : `The sentence's main verb is ${q(topic.mainVerb)}, after the second comma, so the blank begins a modifier describing ${q(topic.subject)}. ${topic.second === "voice"
            ? `${cap(topic.subject.replace(/^The /, "the "))} is acted on (${q(topic.cue)}), so the modifier uses the past participle`
            : "The work came before the event the main verb reports, so the modifier uses the perfect participle"}: ${q(choices.correct)}.`,
        steps: [
          "Find the sentence's subject, and set aside anything enclosed in commas.",
          needsFinite
            ? `Check what ${q(topic.subject)} does: no verb outside the commas says, so the blank must be the main verb.`
            : `Check what ${q(topic.subject)} does: ${q(topic.mainVerb)} already serves as the main verb, so the blank opens a modifier.`,
          needsFinite
            ? `Choose the main verb in the passage's tense (${q(topic.cue)}).`
            : `Choose the modifier form that fits the meaning (${q(topic.cue)}).`,
        ],
        principles: [
          "Every sentence needs a finite main verb for its subject; words like “lecturing,” “having lectured,” and “to lecture” cannot serve as one.",
          "A phrase set off by commas can describe the subject, but it cannot contain a second main verb for that subject.",
        ],
        trap: needsFinite
          ? "Treating the verb inside the descriptive clause as the sentence's main verb and choosing a modifier form."
          : "Choosing a complete verb because the blank looks like the start of a new statement about the subject.",
        hint: "Read the sentence without the part between the commas. What is its main verb?",
      });
      instance.verify = () => {
        const tail = afterBlank(topic.text);
        const hasMainVerb = Boolean(topic.mainVerb) && new RegExp(`, ${topic.mainVerb} `).test(tail);
        // Morphology settles finiteness: -ing, "having", and "to" forms never
        // head a clause; forms with "was"/"were"/"had" or a present -s do.
        const finiteByForm = (form) => (/^(having|to)\b|ing$/.test(form) ? "no" : /^(was|were|had|is)\b|s$/.test(form) ? "yes" : null);
        const agrees = Object.entries(topic.choices).every(([corner, form]) =>
          finiteByForm(form) === null || finiteByForm(form) === corner.split("|")[0]);
        return hasOneBlank(topic.text) && topic.text.includes(topic.cue) &&
          beforeBlank(topic.text).includes(topic.subject) &&
          /, $/.test(beforeBlank(topic.text)) &&
          hasMainVerb === !needsFinite &&
          topic.key.split("|")[0] === (hasMainVerb ? "no" : "yes") &&
          instance.correct === topic.choices[topic.key] && agrees &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* --------------------------- verb form and punctuation: main verb or supplement */

  // Hard: the blank decides two things at once, whether a comma sets off
  // what follows and whether the verb is finite. `shape` records the
  // sentence: "supplement" (a main verb comes after a closing comma, so the
  // blank opens a nonessential phrase: comma + participle), "main" (no main
  // verb follows, so the blank supplies it: no comma + finite verb), or
  // "restrictive" (a main verb follows with no closing comma, and the phrase
  // picks out which one is meant: no comma + participle).
  const SUPPLEMENT_TOPICS = [
    {
      scene: "sec-tarnside-wheel",
      text: "The Tarnside mill, founded in 1790, stood on the east bank of the Tarn River. The mill's great ______ by the river's current through a stone channel, drove more than two hundred looms until the owners switched to steam in 1920.",
      w1: "wheel", participle: "turned", finite: "was turned", shape: "supplement", mainVerb: "drove",
    },
    {
      scene: "sec-kessel-meltwater",
      text: "The Kessel Glacier has retreated nearly two kilometers since 1900. Its ______ in a lake at the glacier's foot that did not exist a century ago, now supplies drinking water to three villages in the valley below.",
      w1: "meltwater", participle: "collected", finite: "is collected", shape: "supplement", mainVerb: "now supplies",
    },
    {
      scene: "sec-holm-journal",
      text: "The fur trader Anders Holm spent twenty winters in a cabin on the shore of Lake Varn. His ______ in a tin box beneath the cabin's floor, surfaced in 1962 when the building was torn down.",
      w1: "journal", participle: "hidden", finite: "was hidden", shape: "supplement", mainVerb: "surfaced",
    },
    {
      scene: "sec-lowell-street-span",
      text: "The Lowell Street Bridge replaced a ferry that had carried wagons across the river for decades. Its central ______ from steel beams salvaged from a demolished rail yard, has carried traffic since 1934.",
      w1: "span", participle: "built", finite: "was built", shape: "supplement", mainVerb: "has carried",
    },
    {
      scene: "sec-brandt-first-collection",
      text: "The poet Lucia Brandt could not find a publisher for her early work. Her first ______ at her own expense in an edition of only 300 copies, sold out within a month and brought her an offer from a major press.",
      w1: "collection", participle: "printed", finite: "was printed", shape: "supplement", mainVerb: "sold out",
    },
    {
      scene: "sec-tarnside-cooperative",
      text: "The Tarnside mill closed in 1958, but its brick building still stands on the east bank of the Tarn River. Today the ______ by a cooperative of weavers who rent studio space on its upper floors.",
      w1: "building", participle: "owned", finite: "is owned", shape: "main",
    },
    {
      scene: "sec-brisk-harbor-water",
      text: "For most of the nineteenth century, the town of Brisk Harbor had no public water supply. Its drinking ______ from rain barrels and a handful of private wells until a reservoir was completed in 1889.",
      w1: "water", participle: "drawn", finite: "was drawn", shape: "main",
    },
    {
      scene: "sec-varden-first-telescope",
      text: "The Varden Observatory's first telescope was a gift from a local merchant who had made his fortune in shipping. The ______ in London in 1864 and shipped across the Atlantic in eleven wooden crates.",
      w1: "instrument", participle: "made", finite: "was made", shape: "main",
    },
    {
      scene: "sec-holm-english-letter",
      text: "Nearly all of the letters in the Holm archive are in Swedish, the language Anders Holm spoke at home. The only ______ in English to a publisher in Boston, who had asked Holm for an account of his winters on Lake Varn.",
      w1: "exception", participle: "written", finite: "was written", shape: "main",
    },
    {
      scene: "sec-tarn-last-water-mill",
      text: "Dozens of mills once lined the Tarn River, and most of them switched from water to steam power during the 1860s. The only ______ by water until the 1920s was the Tarnside mill, whose owners distrusted steam engines.",
      w1: "one", participle: "powered", finite: "was powered", shape: "restrictive", mainVerb: "was",
    },
    {
      scene: "sec-iron-gall-letters",
      text: "Most of the letters in the collection have faded, but some are in far worse condition than others. The ______ in iron gall ink have fared worst, because that ink slowly eats through the paper it was applied to.",
      w1: "letters", participle: "written", finite: "were written", shape: "restrictive", mainVerb: "have fared",
    },
    {
      scene: "sec-varden-two-telescopes",
      text: "Visitors to the Varden Observatory can look through either of its two telescopes on public nights. The ______ in London in 1864 has a brass tube and a wooden stand, while the newer one is controlled by a computer.",
      w1: "telescope", participle: "made", finite: "was made", shape: "restrictive", mainVerb: "has",
    },
  ];

  const SHAPE_KEYS = { supplement: "yes|no", main: "no|yes", restrictive: "no|no" };

  const supplementOrMainVerb = {
    id: "sec-supplement-or-main-verb",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "verb form",
    difficulty: "Hard",
    title: "Main verb or set-off phrase, with its punctuation",
    recognize: "Find out whether the sentence gets its main verb later. If it does and a comma closes the phrase, the blank opens a set-off phrase (comma + participle); if it does and no comma follows, the phrase identifies (no comma); if it does not, the blank is the main verb (no comma).",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 1 },
    tricks: ["neighbouring-rule", "equivalent-form"],
    build(t) {
      const topic = t.pick(SUPPLEMENT_TOPICS);
      const key = SHAPE_KEYS[topic.shape];
      const render = (comma, finite) => `${topic.w1}${comma === "yes" ? "," : ""} ${finite === "yes" ? topic.finite : topic.participle}`;
      const rows = [];
      ["yes", "no"].forEach((comma) => ["yes", "no"].forEach((finite) => {
        const form = render(comma, finite);
        const problems = [];
        if (`${comma}|${finite}` !== key) {
          if (finite === "yes" && topic.shape !== "main") {
            problems.push(`${q(topic.finite)} would give the sentence a second main verb, since it already has ${q(topic.mainVerb)}`);
          }
          if (finite === "no" && topic.shape === "main") {
            problems.push(`${q(topic.participle)} cannot serve as the main verb, and no other verb follows, so the sentence would be a fragment`);
          }
          if (comma === "yes" && topic.shape !== "supplement") {
            problems.push(topic.shape === "main"
              ? `a comma cannot separate the subject, ${q(`the ${topic.w1}`)}, from its verb`
              : "the comma opens a set-off phrase that no second comma closes, and the phrase is needed to say which one is meant");
          }
          if (comma === "no" && topic.shape === "supplement") {
            problems.push("the phrase is closed by a comma later in the sentence, so it must also open with one");
          }
        }
        rows.push([form, { comma, finite }, problems.length ? `${cap(problems.join("; and "))}.` : null]);
      }));
      const choices = square(rows);
      const why = {
        supplement: `The sentence's main verb is ${q(topic.mainVerb)}, and a comma already closes the phrase before it, so the blank opens a set-off phrase: a comma and the participle ${q(topic.participle)}.`,
        main: `No main verb follows the blank, so the blank must supply it: ${q(topic.finite)}, with no comma between the subject and its verb.`,
        restrictive: `The sentence's main verb is ${q(topic.mainVerb)}, and no comma closes the phrase, which identifies which ${topic.w1} the sentence means; so the phrase takes no comma and uses the participle ${q(topic.participle)}.`,
      }[topic.shape];
      const instance = item(topic, this, {
        ...choices,
        explanation: `${why} The answer is ${q(choices.correct)}.`,
        steps: [
          "Look past the blank for the sentence's main verb.",
          topic.shape === "main"
            ? "There is none, so the blank must be the main verb, and nothing may separate it from its subject."
            : `The main verb is ${q(topic.mainVerb)}, so the blank opens a phrase with a participle.`,
          topic.shape === "main"
            ? "Choose the finite verb with no comma."
            : topic.shape === "supplement"
              ? "A comma closes the phrase later, so a comma must open it."
              : "No comma closes the phrase, and it identifies which one is meant, so it takes no comma.",
        ],
        principles: [
          "Every sentence needs one finite main verb for its subject; a participle cannot be that verb.",
          "A set-off (nonessential) phrase takes a comma on both sides; a phrase that identifies which one is meant takes none; no comma separates a subject from its verb.",
        ],
        trap: topic.shape === "main"
          ? "Choosing the participle because the sentence is long and seems to be building toward a verb that never comes."
          : "Choosing the finite verb because the blank looks like the start of a statement about the subject.",
        hint: "Does the sentence already have its main verb somewhere after the blank? Is there a comma that closes a phrase?",
      });
      instance.verify = () => {
        const tail = afterBlank(topic.text);
        const beforeMain = topic.mainVerb ? tail.slice(0, tail.indexOf(` ${topic.mainVerb} `)) : tail;
        const closed = topic.mainVerb ? /,\s*$/.test(beforeMain) : false;
        const shape = !topic.mainVerb || tail.indexOf(` ${topic.mainVerb} `) < 0 ? "main" : closed ? "supplement" : "restrictive";
        return hasOneBlank(topic.text) && lastWordOf(beforeBlank(topic.text)) !== topic.w1 &&
          new RegExp(`\\b${topic.w1}\\b`, "i").test(topic.w1) &&
          shape === topic.shape &&
          instance.correct === render(...SHAPE_KEYS[shape].split("|")) &&
          topic.finite.endsWith(topic.participle) &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* -------------------------------------------------- dangling modifier */

  // The passage ends with an opening modifier and a blank for the main
  // clause. The choices cross the clause's subject (the person or animal the
  // modifier describes, or `other`, something of theirs that the modifier
  // cannot describe) with finiteness (a finite verb or an -ing form that
  // leaves the sentence without one). `agent` is written longer than `other`
  // so the key is never simply the shortest choice.
  const MODIFIER_TOPICS = [
    {
      scene: "sec-carson-silent-spring",
      text: "Rachel Carson spent four years gathering research for Silent Spring, her 1962 book about the dangers of synthetic pesticides. Trained as a marine biologist and skilled at explaining science to general readers, ______.",
      agent: "Rachel Carson", other: "her book", gist: "who was trained as a marine biologist",
      finite: "showed how DDT moved through food chains and harmed birds",
      nonfinite: "showing how DDT moved through food chains and harmed birds",
    },
    {
      scene: "sec-wu-parity",
      text: "In 1956, the physicists Tsung-Dao Lee and Chen-Ning Yang proposed that a basic symmetry of nature, called parity, might not hold for the weak nuclear force. Lee consulted his Columbia University colleague, the experimental physicist Chien-Shiung Wu, about how to test the idea. Known to colleagues for her meticulous technique, ______.",
      agent: "Chien-Shiung Wu", other: "her team", gist: "who was known for her meticulous technique",
      finite: "tested the idea using radioactive cobalt cooled to near absolute zero",
      nonfinite: "testing the idea using radioactive cobalt cooled to near absolute zero",
    },
    {
      scene: "sec-kahlo-mirror",
      text: "After a bus accident in 1925 left her bedridden for months, Frida Kahlo taught herself to paint. Confined to her bed and working with a mirror mounted above her, ______.",
      agent: "Frida Kahlo", other: "her art", gist: "who was confined to her bed",
      finite: "turned to the self-portraits for which she is now best known",
      nonfinite: "turning to the self-portraits for which she is now best known",
    },
    {
      scene: "sec-chisholm-campaign",
      text: "Shirley Chisholm served seven terms in the U.S. House of Representatives, representing a district in Brooklyn, New York. Campaigning in 1968 under the slogan “Unbought and Unbossed,” ______.",
      agent: "Shirley Chisholm", other: "her message", gist: "who was campaigning under that slogan",
      finite: "appealed to voters tired of party bosses and machine politics",
      nonfinite: "appealing to voters tired of party bosses and machine politics",
    },
    {
      scene: "sec-cataglyphis-ants",
      text: "Desert ants of the genus Cataglyphis forage alone across the Sahara's sand, often traveling hundreds of meters from their nests. Unable to follow scent trails, which evaporate quickly in the heat, ______.",
      agent: "these desert ants", other: "their brains", gist: "that cannot follow scent trails",
      finite: "keep track of their steps and the sun's position to find their way home",
      nonfinite: "keeping track of their steps and the sun's position to find their way home",
    },
    {
      scene: "sec-ibn-battuta-travels",
      text: "Ibn Battuta left his home in Tangier, Morocco, in 1325 to make the pilgrimage to Mecca, but he did not return for decades. Traveling across Africa, the Middle East, and Asia for nearly thirty years, ______.",
      agent: "Ibn Battuta", other: "his route", gist: "who was traveling for nearly thirty years",
      finite: "covered more ground than any other known traveler of his era",
      nonfinite: "covering more ground than any other known traveler of his era",
    },
    {
      scene: "sec-mendel-garden",
      text: "Between 1856 and 1863, Gregor Mendel, a friar at an abbey in Brno, bred thousands of pea plants and tracked traits such as seed color. Working alone in the abbey garden and recording every plant's traits by hand, ______.",
      agent: "Gregor Mendel", other: "his work", gist: "who was working alone in the abbey garden",
      finite: "showed that the traits passed from parents to offspring in predictable ratios",
      nonfinite: "showing that the traits passed from parents to offspring in predictable ratios",
    },
    {
      scene: "sec-tubman-journeys",
      text: "Before the Civil War, Harriet Tubman escaped slavery in Maryland and then returned about thirteen times to lead others north. Guiding small groups mostly at night and during the long nights of winter, ______.",
      agent: "Harriet Tubman", other: "her trips", gist: "who guided the small groups",
      finite: "brought about seventy people to freedom",
      nonfinite: "bringing about seventy people to freedom",
    },
    {
      scene: "sec-humpback-song",
      text: "Male humpback whales sing complex songs that can last for hours, and all the males in a population sing nearly the same song. Listening closely to one another and copying each new variation, ______.",
      agent: "the male whales", other: "their calls", gist: "who listen to one another and copy each variation",
      finite: "gradually transform the song until, after several years, it is entirely new",
      nonfinite: "gradually transforming the song until, after several years, it is entirely new",
    },
    {
      scene: "sec-hadid-aquatics",
      text: "Zaha Hadid, the first woman to win the Pritzker Architecture Prize, was known for buildings that seem to flow rather than stand. Trained as a mathematician in Beirut before studying architecture in London, ______.",
      agent: "Zaha Hadid", other: "her firm", gist: "who was trained as a mathematician",
      finite: "designed the London Aquatics Centre with a roof that curves like a wave",
      nonfinite: "designing the London Aquatics Centre with a roof that curves like a wave",
    },
    {
      scene: "sec-merian-suriname",
      text: "In 1699, the naturalist and artist Maria Sibylla Merian sailed from Amsterdam to Suriname to study its insects. Raising caterpillars in her own studio and sketching every stage of their growth, ______.",
      agent: "Maria Sibylla Merian", other: "her paintings", gist: "who raised the caterpillars and sketched them",
      finite: "depicted each insect on the plant that its caterpillars fed on",
      nonfinite: "depicting each insect on the plant that its caterpillars fed on",
    },
    {
      scene: "sec-farouk-migration",
      text: "Sociologist Nadia Farouk interviewed more than two hundred families who had moved from villages in southern Egypt to Cairo during the 1990s. Having grown up in a village near Aswan herself, ______.",
      agent: "Nadia Farouk", other: "her study", gist: "who grew up in a village near Aswan",
      finite: "paid close attention to why so many newcomers settled near relatives from home",
      nonfinite: "paying close attention to why so many newcomers settled near relatives from home",
    },
    {
      scene: "sec-caledonian-crows",
      text: "New Caledonian crows are among the few animals known to make tools, and they shape them from the stiff, barbed leaves of the pandanus tree. Working with only their beaks, ______.",
      agent: "New Caledonian crows", other: "their tools", gist: "that work with only their beaks",
      finite: "pull insects out of crevices with narrow strips cut from the leaves",
      nonfinite: "pulling insects out of crevices with narrow strips cut from the leaves",
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
    recognize: "An opening modifier describes whatever noun comes right after its comma, so the main clause must begin with the one the modifier describes and still needs a finite verb of its own.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["dangling-modifier", "grammatical-but-illogical"],
    build(t) {
      const topic = t.pick(MODIFIER_TOPICS);
      const modifier = blankSentence(topic.text).replace(/,\s*$/, "");
      const name = topic.agent.replace(/^(the|these) /, "");
      const rows = [];
      [["agent", topic.agent], ["other", topic.other]].forEach(([role, subject]) => ["yes", "no"].forEach((finite) => {
        const text = `${subject} ${finite === "yes" ? topic.finite : topic.nonfinite}`;
        const problems = [];
        if (role === "other") problems.push(`it makes ${q(subject)} the subject, so the opening phrase would describe ${q(subject)}; the phrase describes the one ${topic.gist}, ${name}`);
        if (finite === "no") problems.push(`${q(topic.nonfinite.split(" ")[0])} is not a finite verb, so the sentence would have no main verb`);
        rows.push([text, { subject: role, finite }, problems.length ? `${cap(problems.join("; and "))}.` : null]);
      }));
      const choices = square(rows);
      const instance = item(topic, this, {
        ...choices,
        explanation: `The opening phrase, ${q(modifier)}, describes ${name}, so ${topic.agent} must be the subject that comes right after the comma, and the clause needs a finite verb (${q(topic.finite.split(" ")[0])}). ${cap(topic.other)} is not what the opening phrase describes.`,
        steps: [
          "Ask who or what the opening phrase describes.",
          `Only ${name} fits: the one ${topic.gist}.`,
          `Choose the clause whose subject, right after the comma, is ${topic.agent}, and whose verb is finite.`,
        ],
        principles: [
          "An introductory modifier describes the subject of the main clause that follows it.",
          "A possessive such as “her book” makes the book, not the person, the subject; the clause also needs a finite verb.",
        ],
        trap: `Picking a clause that mentions ${name} only through ${q(topic.other)}, or one whose -ing verb leaves the sentence without a main verb.`,
        hint: "Who is doing what the opening phrase describes? That noun has to come right after the comma, followed by a real verb.",
      });
      instance.verify = () => hasOneBlank(topic.text) &&
        /,["”]? ______\.$/.test(topic.text) &&
        lower(beforeBlank(topic.text)).includes(lower(lastWordOf(topic.agent))) &&
        instance.correct === `${topic.agent} ${topic.finite}` &&
        topic.agent.length > topic.other.length &&
        topic.nonfinite.split(" ").some((word) => /ing$/.test(word)) &&
        !/^(her|his|their|its)\b/.test(topic.agent) && /^(her|his|their|its)\b/.test(topic.other) &&
        isSquare(instance.features);
      return instance;
    },
  };

  return [
    compoundSubject,
    theirForms,
    pastParticiple,
    attractorAgreement,
    invertedAgreement,
    longSubjectAgreement,
    distantPronoun,
    possessiveOrPlural,
    tenseFrame,
    conditionalVerb,
    finiteVerb,
    supplementOrMainVerb,
    danglingModifier,
  ];
});
