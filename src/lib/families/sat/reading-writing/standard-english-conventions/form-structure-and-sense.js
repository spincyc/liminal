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
    present: /\b(today|now|present|each|every|usually|often|still|is|are|has|have|can|tend|most)\b|\b\w+s\b/i,
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
      text: "A Balinese gamelan can include more than two dozen bronze instruments, and its players rarely use written scores. Instead, the lead drummer and the first metallophone player ______ at present responsible for signaling every change in tempo, and the rest of the ensemble follows their cues.",
      subject: "the lead drummer and the first metallophone player", head: "player", join: "and", lure: "player",
      tense: "present", cue: "at present",
    },
    {
      scene: "sec-lichen-partnership",
      text: "A lichen looks like a single plant, but it is actually a partnership between two very different organisms. In most lichens, a fungus and a photosynthetic alga ______ at present bound together as one body: the alga makes sugar from sunlight, and the fungus supplies shelter and water.",
      subject: "a fungus and a photosynthetic alga", head: "alga", join: "and", lure: "alga",
      tense: "present", cue: "at present",
    },
    {
      scene: "sec-mangrove-carbon",
      text: "Mangrove forests grow along tropical coastlines where rivers meet the sea. The trees' tangled roots and the waterlogged mud around them ______ at present able to store carbon far more efficiently than most inland forests do, so coastal planners increasingly treat mangroves as protection against climate change.",
      subject: "The trees' tangled roots and the waterlogged mud around them", head: "mud", join: "and", lure: "mud",
      tense: "present", cue: "at present",
    },
    {
      scene: "sec-nicaraguan-sign",
      text: "Nicaraguan Sign Language, which emerged among deaf schoolchildren in Managua in the 1980s, is now used by thousands of people. In it, as in other signed languages, the shape of the hands and the expression on the signer's face ______ at present both used to carry grammatical information, such as whether a sentence is a question.",
      subject: "the shape of the hands and the expression on the signer's face", head: "expression", join: "and", lure: "face",
      tense: "present", cue: "at present",
    },
    {
      scene: "sec-kelp-predators",
      text: "Along the Pacific coast of North America, kelp forests depend on predators. The sea otter and the sunflower sea star ______ at present the main hunters of sea urchins, which would otherwise graze the kelp down to bare rock; where both predators have declined, urchins have taken over.",
      subject: "The sea otter and the sunflower sea star", head: "star", join: "and", lure: "star",
      tense: "present", cue: "at present",
    },
    {
      scene: "sec-sourdough-starter",
      text: "Sourdough bread rises without commercial yeast. Instead, the wild yeast and the lactic acid bacteria in the starter ______ at present at work on the sugars in the flour, releasing the carbon dioxide that lifts the dough and the acids that give the bread its sour taste.",
      subject: "the wild yeast and the lactic acid bacteria in the starter", head: "bacteria", join: "and", lure: "starter",
      tense: "present", cue: "at present",
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
      text: "Ocean tides are not caused by the Moon alone. The Moon's gravity, along with the weaker pull of the Sun, ______ at present responsible for the daily rise and fall of the sea, and when the two bodies line up, their combined pull produces especially high spring tides.",
      subject: "The Moon's gravity", head: "gravity", join: "along with", lure: "along with the weaker pull of the Sun",
      tense: "present", cue: "at present",
    },
    {
      scene: "sec-varden-globe",
      text: "The map room of the Varden Museum is open to visitors every afternoon. The museum's oldest globe, together with the brass stand and the compass that came with it, ______ at present displayed in a sealed glass case that protects it from humidity.",
      subject: "The museum's oldest globe", head: "globe", join: "together with", lure: "together with the brass stand and the compass",
      tense: "present", cue: "at present",
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
      scene: "sec-mary-rose-raised",
      text: "The Mary Rose, a warship built for King Henry VIII, sank off the southern coast of England in 1545. By the time divers raised the wreck in 1982, it ______ on the floor of the Solent continuously since 1545, partly protected by layers of silt.",
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
    recognize: "Perfect “had” and “has” and passive “was” take a past participle, not the simple past; the passage's time words decide which helping verb fits.",
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
          reason = `${q(text)} pairs the wrong helping verb with ${q(forms.past)}, the simple past of ${q(topic.verb)}; the time frame (${q(topic.cue)}) calls for ${q(auxOf[topic.tense])}, and this perfect or passive construction takes the participle ${q(forms.participle)}.`;
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
        explanation: `${q(topic.cue)} sets the time frame, so the helping verb is ${q(auxOf[topic.tense])} (${perfectWord}). This perfect or passive construction takes the past participle, and the past participle of ${q(topic.verb)} is ${q(forms.participle)}, not the simple past ${q(forms.past)}: ${q(choices.correct)}.`,
        steps: [
          `Find the words that set the time frame: ${q(topic.cue)}.`,
          `Choose the helping verb that fits that frame: ${q(auxOf[topic.tense])}.`,
          `For this perfect or passive construction, use the past participle: ${q(forms.participle)}.`,
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
      text: "Dendrochronologists read the history of past climates in wood. In the dry American Southwest, the width of the growth rings in the oldest Douglas firs ______ at present a reliable guide to how much rain fell in each year of the trees' long lives, a record that can stretch back centuries.",
      head: "width", lure: "firs", tense: "present", cue: "at present",
    },
    {
      scene: "sec-riverside-poets-letters",
      text: "Historians of the Riverside Poets, a circle of writers active in the river port of Alder Bay in the 1930s, have long known that its members read one another's drafts. Today, an archive of more than three hundred letters from the poet Delia Hart to her fellow writers ______ at present held by the city's public library, where scholars can see how closely the poets worked together.",
      head: "archive", lure: "writers", tense: "present", cue: "at present",
    },
    {
      scene: "sec-tanager-molt",
      text: "Each autumn, the male scarlet tanager trades its breeding colors for camouflage. The brilliant red feathers on the back and breast of the male ______ at present replaced by olive-green ones before the bird migrates to South America for the winter.",
      head: "feathers", lure: "male", tense: "present", cue: "at present",
    },
    {
      scene: "sec-ferreira-murals",
      text: "In 1938, the painter Luis Ferreira covered the walls of a small post office in the desert town of Tolan with scenes of local life. Each of the twelve panels, which show farmers, miners, and railroad workers, ______ painted directly onto the wall's wet plaster that year.",
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
      text: "Byzantine mosaic makers rarely set their glass tiles perfectly flat. The small gold tiles covering the dome of the church ______ at present tilted at slightly different angles, so they catch and scatter the light of the candles below.",
      head: "tiles", lure: "church", tense: "present", cue: "at present",
    },
    {
      scene: "sec-cristofori-piano",
      text: "Bartolomeo Cristofori built the first pianos in Florence around 1700, and only three of the instruments he made are known to survive. One of his three surviving instruments ______ on display today at the Metropolitan Museum of Art in New York.",
      head: "One", lure: "instruments", tense: "present", cue: "today",
      why: "“One of” takes a singular verb, whatever noun follows it.",
    },
    {
      scene: "sec-morpho-scales",
      text: "The blue morpho butterfly of Central and South American rainforests is one of the most brilliantly colored insects on Earth. Yet the microscopic scales covering each wing of the butterfly ______ at present free of any blue pigment; the color comes from the way tiny ridges on each scale reflect light.",
      head: "scales", lure: "butterfly", tense: "present", cue: "at present",
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
      text: "Potters in China during the Song dynasty prized a stoneware known as Ge ware for its glaze. The fine cracks running through the glaze of a surviving Ge ware vase ______ at present not signs of damage or age; they are a deliberate effect of a glaze that shrinks more than the clay beneath it as the vessel cools.",
      head: "cracks", lure: "vase", tense: "present", cue: "at present",
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
      text: "Visitors entering the natural history museum's central hall tend to stop and look up. Hanging from the ceiling of the hall ______ at present the skeletons of a blue whale and a humpback whale, each assembled from bones recovered on the same stretch of coast.",
      head: "skeletons", lure: "hall", tense: "present", cue: "at present",
    },
    {
      scene: "sec-trappist-planets",
      text: "The dim red star TRAPPIST-1 lies about forty light-years from Earth. Around this single small star there ______ at present seven rocky planets, at least three of which orbit at distances where liquid water could exist on their surfaces.",
      head: "planets", lure: "star", tense: "present", cue: "at present",
    },
    {
      scene: "sec-canyon-petroglyphs",
      text: "The desert canyon holds a record of the people who passed through it over thousands of years. Carved into the dark sandstone of its northern wall ______ at present hundreds of petroglyphs, some showing bighorn sheep and others showing spirals and human figures.",
      head: "hundreds", lure: "wall", tense: "present", cue: "at present",
    },
    {
      scene: "sec-goby-burrow",
      text: "On sandy stretches of coral reef, some burrows have two residents. Among the reef's many burrowing animals ______ at present a small goby that shares a home with a nearly blind shrimp: the shrimp digs and maintains the burrow, while the goby keeps watch for predators.",
      head: "goby", lure: "animals", tense: "present", cue: "at present",
    },
    {
      scene: "sec-monastery-herbal",
      text: "The monastery's library has survived fires, floods, and two wars. Within its vast collection of medieval manuscripts ______ at present a thirteenth-century herbal whose hand-painted illustrations of medicinal plants remain surprisingly bright.",
      head: "herbal", lure: "manuscripts", tense: "present", cue: "at present",
    },
    {
      scene: "sec-chicxulub-crater",
      text: "The asteroid impact that ended the age of the dinosaurs left a scar that geologists can still trace. Beneath the Yucatán Peninsula's limestone plains and coastal towns there ______ at present a buried crater more than 180 kilometers wide, its rim marked at the surface by a ring of sinkholes.",
      head: "crater", lure: "towns", tense: "present", cue: "at present",
    },
    {
      scene: "sec-chauvet-panel",
      text: "France's Chauvet Cave was sealed by a rockfall for thousands of years, which preserved its interior. Today, deep inside the cave, past chambers scattered with the bones of cave bears, ______ at present a panel of charcoal drawings of horses, rhinoceroses, and lions made more than 30,000 years ago.",
      head: "panel", lure: "bears", tense: "present", cue: "at present",
    },
    {
      scene: "sec-orchestra-woodwinds",
      text: "A symphony orchestra's seating plan reflects both tradition and acoustics. Behind the rows of string players in most orchestras ______ at present the woodwind section, with flutes and oboes in front and clarinets and bassoons behind them.",
      head: "section", lure: "orchestras", tense: "present", cue: "at present",
    },
    {
      scene: "sec-prairie-erratics",
      text: "Thousands of years ago, an ice sheet covered much of what is now central Canada. Scattered across the otherwise flat prairie today ______ at present granite boulders the size of cars, carried hundreds of kilometers south by the ice and left behind when it melted.",
      head: "boulders", lure: "prairie", tense: "present", cue: "at present",
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
      text: "Astronomers chose the site for the ALMA observatory because the air there is extremely thin and dry. On the Chajnantor plateau in Chile's Atacama Desert, about 5,000 meters above sea level, ______ at present the observatory's sixty-six radio antennas.",
      head: "antennas", lure: "plateau", tense: "present", cue: "at present",
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
  // by a time the passage names while a verb of the other tense sits nearer
  // or earlier (a "today" or "still" in a past story, a past date in a
  // present one), so both decisions need the passage read as a whole.
  // `lure` is the last noun before the blank.
  const LONG_SUBJECT_TOPICS = [
  {
      "scene": "sec-archive-label-dispute",
      "text": "A catalog assembled in 1924 described the maps as recent copies, but a conservator has challenged that description. The claim that the maps, despite the dates added by a later owner, ______ at present regarded as originals from the previous century is now supported by an analysis of their paper.",
      "head": "maps",
      "lure": "claim",
      "tense": "present",
      "cue": "at present",
      "why": "The blank belongs to the embedded claim about the maps; “is now supported” is the main verb of “claim.”"
  },
  {
      "scene": "sec-dam-report-scope",
      "text": "Engineers reviewing the 1968 flood agree that the reservoir filled unusually quickly. The report that the inspector, who was responsible for the gauges on both banks, ______ preparing at the time of the flood remained unfinished after the station lost power.",
      "head": "inspector",
      "lure": "banks",
      "tense": "past",
      "cue": "1968 flood",
      "why": "The report is the object of “preparing”; the embedded subject is “inspector,” while “remained” is the main verb of “report.”"
  },
  {
      "scene": "sec-lab-replicas-scope",
      "text": "A laboratory displays replicas beside the fragments used to make them. The replicas that the curator, unlike several visitors interviewed for the exhibition guide, describes as indistinguishable from the originals ______ at present stored separately from the actual fragments.",
      "head": "replicas",
      "lure": "curator",
      "tense": "present",
      "cue": "at present",
      "why": "The embedded clause already has “describes”; the blank supplies the main verb for “replicas.”"
  },
  {
      "scene": "sec-library-awning-scope",
      "text": "Photographs taken before the library fire show the entrance clearly. The wooden awning that the architects, whose later buildings used steel extensively, ______ planning to replace when the fire broke out in 1975 was the only part of the entrance that survived.",
      "head": "architects",
      "lure": "awning",
      "tense": "past",
      "cue": "in 1975",
      "why": "The architects were planning; the awning was what they planned to replace. “Was the only part” is the awning’s main predicate."
  },
  {
      "scene": "sec-field-notebook-scope",
      "text": "The museum has digitized both the field notebooks and their first published summaries. The notebook that the summaries, although printed decades later, quote most frequently ______ at present displayed beside a screen showing the corresponding passages.",
      "head": "notebook",
      "lure": "summaries",
      "tense": "present",
      "cue": "at present",
      "why": "“Summaries quote” completes the relative clause; the verb at the blank belongs to the singular notebook."
  },
  {
      "scene": "sec-seedlings-scope",
      "text": "The station still preserves photographs of its first greenhouse experiment. The seedlings that the technician, who had watered each tray on a different schedule, recorded in the final photograph ______ already dead when the experiment ended in 1954.",
      "head": "seedlings",
      "lure": "technician",
      "tense": "past",
      "cue": "ended in 1954",
      "why": "The technician “recorded” the seedlings; after that relative clause, the blank returns to the plural subject “seedlings.”"
  },
  {
      "scene": "sec-sonata-edition-scope",
      "text": "The orchestra is preparing a new edition of a sonata whose surviving manuscripts disagree. The editor notes that the passage the musicians, after comparing both versions, ______ at present rehearsing occurs only in the later manuscript.",
      "head": "musicians",
      "lure": "passage",
      "tense": "present",
      "cue": "at present",
      "why": "Inside the passage’s relative clause, the musicians are rehearsing the passage; “occurs” belongs to “passage.”"
  },
  {
      "scene": "sec-harbor-letter-scope",
      "text": "A merchant’s letter provides the clearest account of the harbor’s closure. The letter that the officials, despite repeated requests from the shipping companies, ______ unwilling to release during the inquiry in 1886 finally appeared in a newspaper the following year.",
      "head": "officials",
      "lure": "letter",
      "tense": "past",
      "cue": "in 1886",
      "why": "The officials were unwilling; “appeared” is the letter’s main verb. The relative clause treats the letter as the object of “release.”"
  },
  {
      "scene": "sec-census-copy-scope",
      "text": "Two census books disagree about the number of residents on one street. The pages that the copyist, whose signature appears on both books, ______ at present believed to have omitted list several households that occur in no other surviving record.",
      "head": "copyist",
      "lure": "pages",
      "tense": "present",
      "cue": "at present",
      "why": "The copyist is believed to have omitted the pages; “list” is the main verb for the pages."
  },
  {
      "scene": "sec-painting-crates-scope",
      "text": "The archive contains photographs of the gallery’s evacuation as well as later inventories. The crates that the registrar, unlike the workers who packed them, never saw being loaded ______ missing when the first inventory was taken in 1941.",
      "head": "crates",
      "lure": "registrar",
      "tense": "past",
      "cue": "in 1941",
      "why": "“Registrar never saw” completes the relative clause; the crates were missing."
  },
  {
      "scene": "sec-bridge-model-scope",
      "text": "A new museum display compares a bridge with the model used to obtain funding for it. The model that the engineers, despite the changes made during construction, regard as their most accurate preliminary design ______ at present the display’s centerpiece.",
      "head": "model",
      "lure": "engineers",
      "tense": "present",
      "cue": "at present",
      "why": "The relative clause has its own verb, “regard”; the singular model is the subject of the blank."
  },
  {
      "scene": "sec-diary-translator-scope",
      "text": "The diary was first published in an abridged translation. The entry that the translator, whose assistants had urged her to retain all references to the journey, ______ reluctant to include when the edition appeared in 1926 describes an encounter omitted from every other account.",
      "head": "translator",
      "lure": "assistants",
      "tense": "past",
      "cue": "in 1926",
      "why": "The translator was reluctant; “describes” is the main verb of “entry.”"
  }
];

  const longSubjectAgreement = {
    id: "sec-sva-long-subject",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "subject-verb agreement",
    difficulty: "Medium",
    title: "Agreement across competing main and embedded clauses",
    recognize: "Map the verbs to their clauses before choosing a subject: a noun before a relative clause may be its object, while another verb later belongs to the main clause. Use the time anchor inside the target assertion.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["agreement-attractor", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(LONG_SUBJECT_TOPICS);
      const number = nounNumber(topic.head);
      const lure = topic.lureWord || topic.lure;
      const why = topic.why || `the nouns between the head and the verb, such as ${q(lure)}, belong to phrases that describe the subject.`;
      const choices = square(agreementRows(topic, number, why));
      const instance = item(topic, this, {
        ...choices,
        explanation: `${topic.why} The subject of the blank is ${q(topic.head)}, which is ${number}. Its own time anchor, ${q(topic.cue)}, requires the ${topic.tense} tense: ${q(choices.correct)}.`,
        steps: [
          "Locate each existing verb and match it to its subject; then identify the clause whose verb is missing.",
          `${topic.why} The target subject is ${q(topic.head)}, which is ${number}.`,
          `Read the rest of the passage for its time frame: ${q(topic.cue)} sets the ${topic.tense}.`,
          `Choose the ${number} ${topic.tense}-tense verb.`,
        ],
        principles: [
          "A verb agrees with the head of its subject, however many words separate them.",
          "A verb's tense must fit the time frame the passage has set, even when that frame is set in another sentence.",
        ],
        trap: `Making the verb agree with ${q(lure)} or another nearby noun of the other number, or taking the tense from the nearest verb instead of from the passage's frame.`,
        hint: "Which clause still needs a verb, and which noun is that clause about?",
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
      // Exterior height completed 2026-02-20: https://blog.sagradafamilia.org/en/phases-construction-jesus-tower/
      scene: "sec-sagrada-familia-tower",
      text: "Antoni Gaudí took charge of Barcelona's Sagrada Família basilica in 1883 and devoted the last years of his life to it. Construction has continued in the century since his death, paid for largely by the millions of visitors who tour the site each year, and in February 2026, ______ tallest tower reached its planned height of 172.5 meters.",
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
    {
      scene: "sec-great-barrier-reef-size",
      text: "The Great Barrier Reef stretches for more than 2,300 kilometers along the coast of Queensland, Australia. Although it is built by billions of tiny coral polyps, ______ large enough to be seen by astronauts in orbit.",
      antecedent: "Reef", competitors: ["kilometers", "polyps"], role: "contraction", next: "large",
    },
    {
      scene: "sec-general-sherman-sequoia",
      text: "The giant sequoia known as General Sherman grows in California's Sierra Nevada, surrounded by thousands of other enormous trees. Measured by the volume of wood in its trunk, ______ larger than any other living tree on Earth.",
      antecedent: "sequoia", competitors: ["trees"], role: "contraction", next: "larger",
    },
    {
      scene: "sec-okavango-inland-delta",
      text: "The Okavango River rises in the highlands of Angola and flows southeast into Botswana, but it never reaches the sea. After spreading into a vast inland delta at the edge of the Kalahari Desert, ______ slowly lost to evaporation and to the thirsty plants along its channels.",
      antecedent: "River", competitors: ["highlands"], role: "contraction", next: "slowly",
    },
    {
      scene: "sec-swiftlet-nest-harvest",
      text: "Edible-nest swiftlets of Southeast Asia build their nests almost entirely from strands of their own hardened saliva. Because the nests are prized for making a costly soup, ______ harvested from cave walls and from specially built nesting houses, sometimes several times a year.",
      antecedent: "nests", competitors: ["soup"], role: "contraction", next: "harvested",
    },
    {
      scene: "sec-shipworm-boring",
      text: "Shipworms are not worms at all but clams with long, soft bodies and a small pair of shells at one end. Using the ridged edge of that pair of shells to scrape away wood, ______ capable of eating through a ship's hull or a wooden pier.",
      antecedent: "Shipworms", competitors: ["end", "edge", "pair", "wood"], role: "contraction", next: "capable",
    },
    {
      scene: "sec-leafcutter-fungus",
      text: "Leafcutter ants carry pieces of leaves back to their underground nest, but they do not eat the leaves themselves. Instead, ______ careful to feed each piece to a fungus that grows in the nest's chambers, and the ants then eat the fungus.",
      antecedent: "ants", competitors: ["nest"], role: "contraction", next: "careful",
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
  const PREDICATE_WORDS = ["able", "unable", "likely", "ready", "packed", "programmed", "transformed", "still", "now", "large", "larger", "slowly", "harvested", "capable", "careful"];
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
      text: "The Harlow school district surveyed parents about moving the start of the school day later. Most ______ own written responses favored the change, even though it would mean later pickups in the afternoon.",
      forms: { singular: "parent", plural: "parents" }, number: "plural", possessive: true, next: "own written responses", owned: "written responses",
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
  // "scheduled" an advance announcement of a future event in the simple present; "span" an
  // action that runs from a past point up to now ("since", "over the past").
  const TENSE_TOPICS = [
    {
      scene: "sec-fleming-mold",
      text: "In September 1928, Alexander Fleming returned to his London laboratory after a vacation and noticed that a mold growing on one of his culture plates had killed the bacteria around it. He first isolated a sample; then he ______ the mold in a flask of broth and found that it belonged to the genus Penicillium.",
      frame: "past", cue: "In September 1928",
      forms: { present: "grows", past: "grew", presentPerfect: "has grown", pastPerfect: "had grown" },
    },
    {
      scene: "sec-anning-ichthyosaur",
      text: "In 1811, Mary Anning's brother Joseph found the skull of an ichthyosaur in the crumbling cliffs near Lyme Regis, England. About a year later, twelve-year-old Mary began excavating the same cliff and then ______ the rest of the skeleton, digging it carefully out of the rock.",
      frame: "past", cue: "About a year later",
      forms: { present: "uncovers", past: "uncovered", presentPerfect: "has uncovered", pastPerfect: "had uncovered" },
    },
    {
      scene: "sec-curie-elements",
      text: "In 1898, Marie and Pierre Curie were studying pitchblende, a uranium ore that was far more radioactive than its uranium content alone could explain. Later that year, the couple completed their tests and then ______ two new elements, polonium and radium, which accounted for the extra radioactivity.",
      frame: "past", cue: "Later that year",
      forms: { present: "announce", past: "announced", presentPerfect: "have announced", pastPerfect: "had announced" },
    },
    {
      scene: "sec-coleman-le-crotoy",
      text: "Because no flight school in the United States would admit a Black woman, Bessie Coleman learned French and sailed to France in November 1920. She then enrolled at an aviation school in Le Crotoy and ______ there for seven months, learning to fly in a fragile biplane.",
      frame: "past", cue: "November 1920",
      forms: { present: "trains", past: "trained", presentPerfect: "has trained", pastPerfect: "had trained" },
    },
    {
      scene: "sec-erie-canal-freight",
      text: "The Erie Canal, completed in 1825, connected the Hudson River to Lake Erie across 584 kilometers of upstate New York. After the canal opened, merchants began using the new route, and the cost of shipping a ton of goods from Buffalo to New York City then ______ by roughly 90 percent.",
      frame: "past", cue: "After the canal opened",
      forms: { present: "falls", past: "fell", presentPerfect: "has fallen", pastPerfect: "had fallen" },
    },
    {
      scene: "sec-elephant-island-rescue",
      text: "In April 1916, twenty-two men from Ernest Shackleton's expedition were stranded on Elephant Island while Shackleton sailed for help. By the time the Chilean tug Yelcho finally reached the island on August 30, the men ______ there continuously since April, surviving mostly on penguins and seals.",
      frame: "earlier", cue: "By the time",
      forms: { present: "live", past: "lived", presentPerfect: "have lived", pastPerfect: "had lived" },
    },
    {
      scene: "sec-pompeii-burial",
      text: "Mount Vesuvius erupted in A.D. 79, sending a column of ash and pumice high into the air above the Bay of Naples. By the time the eruption ended the next day, falling ash and stone ______ the nearby town of Pompeii layer by layer since the eruption began, leaving several meters of debris.",
      frame: "earlier", cue: "By the time",
      forms: { present: "bury", past: "buried", presentPerfect: "have buried", pastPerfect: "had buried" },
    },
    {
      scene: "sec-magellan-voyage",
      text: "Of the roughly 270 men who sailed from Spain with Ferdinand Magellan in 1519, only 18 were aboard the ship Victoria when it returned in September 1522. By then, the surviving officers ______ about Magellan’s death in the Philippines since April 1521, more than a year before the voyage ended.",
      frame: "earlier", cue: "By then",
      forms: { present: "know", past: "knew", presentPerfect: "have known", pastPerfect: "had known" },
    },
    {
      scene: "sec-darwin-wallace-letter",
      text: "In June 1858, Charles Darwin received a letter from the naturalist Alfred Russel Wallace outlining a theory of evolution by natural selection. Darwin was stunned: by that time, he ______ on the same idea continuously since 1838 without publishing it.",
      frame: "earlier", cue: "by that time",
      forms: { present: "works", past: "worked", presentPerfect: "has worked", pastPerfect: "had worked" },
    },
    {
      scene: "sec-everest-1953",
      text: "Edmund Hillary and Tenzing Norgay reached the summit of Mount Everest on May 29, 1953, as members of a British expedition. By the time they stood on top, several earlier expeditions ______ repeatedly to climb the mountain since 1921, sometimes reaching within a few hundred meters of the summit.",
      frame: "earlier", cue: "By the time",
      forms: { present: "try", past: "tried", presentPerfect: "have tried", pastPerfect: "had tried" },
    },
    {
      scene: "sec-spotted-salamanders",
      text: "A nature center is planning guided walks for the coming spring migration of spotted salamanders. Its newly issued schedule reads, “Next April, the first walk ______ from the south gate at sunset, before visitors follow the marked path to the breeding ponds.”",
      frame: "scheduled", cue: "Next April",
      forms: { present: "departs", past: "departed", presentPerfect: "has departed", pastPerfect: "had departed" },
    },
    {
      scene: "sec-periodical-cicadas",
      text: "A museum is preparing an exhibit about periodical cicadas before the next local emergence. Its announcement reads, “Our new exhibit ______ next May, one week before the first school groups arrive.”",
      frame: "scheduled", cue: "Its announcement reads",
      forms: { present: "opens", past: "opened", presentPerfect: "has opened", pastPerfect: "had opened" },
    },
    {
      scene: "sec-old-faithful-timing",
      text: "A visitor center is preparing a new program about the timing of Old Faithful’s eruptions. The schedule, released before registration begins, states, “Next Monday, the first ranger talk ______ at nine in the morning.”",
      frame: "scheduled", cue: "Next Monday",
      forms: { present: "begins", past: "began", presentPerfect: "has begun", pastPerfect: "had begun" },
    },
    {
      scene: "sec-harwick-square-cafes",
      text: "In 2012, the city of Harwick banned cars from its central square and replaced the parking spaces with benches and trees. Since the ban took effect, the number of cafés facing the square ______ from four to nineteen, and the city is now considering closing two nearby streets as well.",
      frame: "span", cue: "Since the ban took effect",
      forms: { present: "grows", past: "grew", presentPerfect: "has grown", pastPerfect: "had grown" },
    },
    {
      scene: "sec-leatherback-tagging",
      text: "The marine biologist Keiko Tan began tagging leatherback turtles on the beaches of the island of Keld in 2009. Over the past fifteen years, her team ______ more than 2,000 turtles, and the data now show where the animals feed between nesting seasons.",
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

  const FRAME_TENSE = { past: "past", earlier: "pastPerfect", scheduled: "present", span: "presentPerfect" };
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
      past: "uses the simple past with a since-phrase; the action extends from that starting point up to the stated past reference time, which requires the past perfect.",
      presentPerfect: "uses the present perfect, which connects the action to the present rather than to an earlier past moment.",
    },
    scheduled: {
      past: "places the event in the past, but the quoted schedule announces an event still in the future when it is issued.",
      presentPerfect: "would describe something already completed by the time of speaking, but the quoted schedule announces a future event.",
      pastPerfect: "would place the event before a past reference point; the quoted schedule instead announces a future event.",
    },
    span: {
      present: "uses the simple present, which cannot describe a change or a series of actions running from a past point up to now.",
      past: "uses the simple past, which treats the action as finished; the sentence describes a span that runs up to the present.",
      pastPerfect: "uses the past perfect, which would end the action before another past moment; this span runs up to now.",
    },
  };
  const FRAME_WORDS = {
    past: "a finished past event, told in the simple past",
    earlier: "an action extending from the stated starting point up to a past reference time",
    scheduled: "a future event in a quoted schedule, for which the simple present is used",
    span: "an action that runs from a past point up to the present",
  };
  // Words that set each frame, checked against every topic's cue.
  const FRAME_CUES = {
    past: /\b(in|later|about|after)\b|\b\d{4}\b/i,
    earlier: /\bby (the time|then|that time)\b/i,
    scheduled: /\b(next|announcement)\b/i,
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
        tense === needed ? null : `${q(topic.forms[tense])} ${TENSE_REASONS[topic.frame][tense].replace("{recurs}", topic.recurs)}`,
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
          "The past perfect (“had” plus a past participle) evaluates an action from a later past reference point, whether it was completed or continuing then; the present perfect (“has” or “have” plus a past participle) connects a past action or state to now.",
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
          // A narrative frame names its year; the scheduled scenes quote an advance announcement.
          (topic.frame !== "past" || /\b\d{4}\b/.test(beforeBlank(topic.text))) &&
          (topic.frame !== "scheduled" || /next (April|May|Monday)/i.test(topic.text)) &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ------------------------------ verb tense: two time points in the passage */

  // Re-scoped on 2026-09-26 from conditional mood ("were" / "would
  // have"), which is not one of the official Form, Structure, and Sense
  // points, to tense and aspect in a stated time frame; the id is kept so
  // its registry bit carries on. Each passage names two times: the one that
  // governs the blank (`anchor`) and another that lures toward a neighbouring
  // tense (`lure`), usually nearer the blank or in a verb the student reads
  // first. The choices cross time (present or past) with the perfect, as in
  // sec-verb-tense-frame, but no signal phrase such as "by the time" or
  // "since" sits next to the blank. Frames: "before" (complete before a past
  // moment: past perfect), "finished" (at a finished past time: simple
  // past), "span" (from a past point up to now: present perfect), and
  // "scheduled" (a future timetable stated in the simple present).
  const TWO_TIME_TOPICS = [
    {
      scene: "sec-mary-rose-raised",
      text: "The Mary Rose, a warship built for King Henry VIII, now stands in a museum in Portsmouth, England, where visitors can walk past its timbers. When divers finally raised the wreck in 1982, it ______ on the floor of the Solent continuously since 1545, partly protected by layers of silt.",
      frame: "before", anchor: "When divers finally raised the wreck in 1982", lure: "now stands",
      forms: { present: "rests", past: "rested", presentPerfect: "has rested", pastPerfect: "had rested" },
    },
    {
      scene: "sec-tarn-glacier-return",
      text: "Karl Brenner photographed the Tarn Glacier for the expedition of 1911, and scientists still use his pictures to measure how far the ice has retreated. When Brenner returned to the glacier in 1936, its front ______ steadily since the earlier expedition, moving nearly a kilometer up the valley.",
      frame: "before", anchor: "When Brenner returned to the glacier in 1936", lure: "how far the ice has retreated",
      forms: { present: "retreats", past: "retreated", presentPerfect: "has retreated", pastPerfect: "had retreated" },
    },
    {
      scene: "sec-voyager-interstellar",
      text: "NASA launched Voyager 1 in 1977, and the probe still sends faint signals home today. When it crossed into interstellar space in August 2012, Voyager 1 ______ away from the Sun continuously since its launch.",
      frame: "before", anchor: "When it crossed into interstellar space in August 2012", lure: "still sends faint signals home today",
      forms: { present: "travels", past: "traveled", presentPerfect: "has traveled", pastPerfect: "had traveled" },
    },
    {
      scene: "sec-champollion-1822",
      text: "Scholars have studied the Rosetta Stone ever since French soldiers uncovered it in 1799. In 1822, the French linguist Jean-François Champollion tested a new interpretation and then ______ that its hieroglyphs recorded sounds as well as ideas, the insight that let him begin to read them.",
      frame: "finished", anchor: "In 1822", lure: "Scholars have studied the Rosetta Stone ever since",
      forms: { present: "announces", past: "announced", presentPerfect: "has announced", pastPerfect: "had announced" },
    },
    {
      scene: "sec-lowell-bridge-opening",
      text: "The Lowell Street Bridge has carried traffic across the river for nearly a century, and engineers have repaired its deck many times. Workers finished the deck, and the bridge then ______ to traffic on a cold morning in March 1934, when the mayor walked across it at the head of a small parade.",
      frame: "finished", anchor: "on a cold morning in March 1934", lure: "has carried traffic across the river for nearly a century",
      forms: { present: "opens", past: "opened", presentPerfect: "has opened", pastPerfect: "had opened" },
    },
    {
      scene: "sec-hollis-library-doors",
      text: "The Hollis Public Library has welcomed readers for more than ninety years, and its reading room is still lit entirely by skylights. The founders first collected four thousand donated books, and the library then ______ its doors in 1931.",
      frame: "finished", anchor: "in 1931", lure: "has welcomed readers for more than ninety years",
      forms: { present: "opens", past: "opened", presentPerfect: "has opened", pastPerfect: "had opened" },
    },
    {
      scene: "sec-harlow-marathon-growth",
      text: "Only 312 runners entered the first Harlow Marathon in 1981, and most of them lived in the city itself. The number of entrants ______ more than tenfold since then, and registration now fills within hours of opening each January.",
      frame: "span", anchor: "since then", lure: "entered the first Harlow Marathon in 1981",
      forms: { present: "grows", past: "grew", presentPerfect: "has grown", pastPerfect: "had grown" },
    },
    {
      scene: "sec-selby-river-otters",
      text: "River otters disappeared from the Selby River in the 1950s, when factories upstream dumped their waste into the water. Wildlife officers ______ otters at more than twenty places along the river since the last factory closed, and several families of otters now raise their young near the town.",
      frame: "span", anchor: "since the last factory closed", lure: "disappeared from the Selby River in the 1950s, when factories upstream dumped",
      forms: { present: "spot", past: "spotted", presentPerfect: "have spotted", pastPerfect: "had spotted" },
    },
    {
      scene: "sec-varden-telescope-service",
      text: "The brass telescope at the Varden Observatory arrived from London in 1864, a gift from a local merchant. Over the more than 150 years since then, it ______ thousands of visitors on public nights, and it remains in use today.",
      frame: "span", anchor: "Over the more than 150 years since then", lure: "arrived from London in 1864",
      forms: { present: "serves", past: "served", presentPerfect: "has served", pastPerfect: "had served" },
    },
    {
      scene: "sec-dome-c-ice-bubbles",
      text: "An Antarctic research institute completed its first drilling campaign in 2004. Its newly published plan for the next expedition states, “Next January, our icebreaker ______ from Cape Town with the drilling team and its equipment.”",
      frame: "scheduled", anchor: "Next January", lure: "completed its first drilling campaign in 2004",
      forms: { present: "sails", past: "sailed", presentPerfect: "has sailed", pastPerfect: "had sailed" },
    },
    {
      scene: "sec-monarch-march-departure",
      text: "A conservation group began offering tours of a monarch butterfly reserve in 1986. Before the next season begins, its new brochure announces, “Next November, the first tour ______ at the reserve’s northern entrance.”",
      frame: "scheduled", anchor: "Next November", lure: "began offering tours of a monarch butterfly reserve in 1986",
      forms: { present: "starts", past: "started", presentPerfect: "has started", pastPerfect: "had started" },
    },
    {
      scene: "sec-brisk-harbor-tide-pools",
      text: "Marine biologist Hana Kekumu began counting animals in the tide pools near Brisk Harbor in 2012. A schedule issued before her next field course states, “Next June, the course ______ with a morning survey of the western pools.”",
      frame: "scheduled", anchor: "Next June", lure: "began counting animals in the tide pools near Brisk Harbor in 2012",
      forms: { present: "begins", past: "began", presentPerfect: "has begun", pastPerfect: "had begun" },
    },
  ];

  const TWO_TIME_KEYS = { before: "pastPerfect", finished: "past", span: "presentPerfect", scheduled: "present" };
  // Why each wrong tense fails, by frame; {anchor} and {lure} are the
  // topic's phrases.
  const TWO_TIME_REASONS = {
    before: {
      present: "is present tense, though the action is evaluated up to a past reference point: {anchor}.",
      past: "uses the simple past with a since-phrase for an action extending up to a past reference point ({anchor}); that relationship calls for the past perfect.",
      presentPerfect: "ties the action to the present, perhaps because of {lure}; but the action is evaluated up to a past reference point ({anchor}), which calls for the past perfect.",
    },
    finished: {
      present: "is present tense, though the action happened at a finished past time ({anchor}).",
      presentPerfect: "cannot go with a finished past time such as {anchor}; the present perfect in {lure} describes a different span, one that runs up to now.",
      pastPerfect: "would move backward from a past reference point, but the passage explicitly narrates this action as the next event in its sequence ({anchor}).",
    },
    span: {
      present: "cannot describe a change or a series of actions over a span of years ({anchor}).",
      past: "treats the action as finished in the past, perhaps because of {lure}; but the span ({anchor}) runs up to the present.",
      pastPerfect: "would end the action before another past moment, perhaps because of {lure}; but the span ({anchor}) runs up to the present.",
    },
    scheduled: {
      past: "places the event in the past, perhaps because of {lure}; the quoted schedule explicitly announces a future event ({anchor}).",
      presentPerfect: "would describe an event completed by the time of the announcement, but {anchor} names a future scheduled event.",
      pastPerfect: "places the event before a past reference point, but {anchor} is future relative to the announcement.",
    },
  };
  const TWO_TIME_WORDS = {
    before: "an action that was already complete, or had been going on for a long time, at a past moment",
    finished: "an action at a finished past time",
    span: "an action that runs from a past point up to the present",
    scheduled: "a future event in a quoted schedule, expressed with the simple present",
  };
  // Words that set each frame, checked against every topic's anchor.
  const TWO_TIME_CUES = {
    before: /\bwhen\b.*\b\d{4}\b/i,
    finished: /\b\d{4}\b/,
    span: /\bsince\b/i,
    scheduled: /\bnext\b/i,
  };

  const twoTimeTense = {
    id: "sec-conditional-verb-forms",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "verb form",
    difficulty: "Medium",
    title: "Verb tense when a passage names two times",
    recognize: "The passage names two times, and the one nearest the blank is often not the one that governs it. Find the time the blank's own sentence is about, then decide whether the action is finished at that time, ongoing up to now, or part of an announced future schedule.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(TWO_TIME_TOPICS);
      const needed = TWO_TIME_KEYS[topic.frame];
      const fill = (text) => text.replace("{anchor}", q(topic.anchor)).replace("{lure}", q(topic.lure));
      const choices = square(Object.keys(TENSE_NAMES).map((tense) => [
        topic.forms[tense],
        TENSE_FEATURES[tense],
        tense === needed ? null : `${q(topic.forms[tense])} ${fill(TWO_TIME_REASONS[topic.frame][tense])}`,
      ]));
      const instance = item(topic, this, {
        ...choices,
        explanation: `The passage names two times, and the blank's sentence is governed by ${q(topic.anchor)}, not by ${q(topic.lure)}. That time marks ${TWO_TIME_WORDS[topic.frame]}, so the verb is the ${TENSE_NAMES[needed]}, ${q(choices.correct)}.`,
        steps: [
          "Confirm that every choice agrees with the subject, so tense alone decides.",
          `Find the times the passage names: ${q(topic.lure)} and ${q(topic.anchor)}.`,
          `The blank's sentence is governed by ${q(topic.anchor)}: ${TWO_TIME_WORDS[topic.frame]}.`,
          `Choose the ${TENSE_NAMES[needed]}, ${q(choices.correct)}.`,
        ],
        principles: [
          "A verb's tense follows the time its own sentence is about, not the nearest verb or date elsewhere in the passage.",
          "The past perfect marks an action complete (or long under way) at a past moment; the present perfect, one that runs up to now; the simple past, one at a finished past time; the simple present, a general fact or a scheduled future event.",
        ],
        trap: `Taking the tense from ${q(topic.lure)}, the other time the passage mentions, instead of from ${q(topic.anchor)}.`,
        hint: "The passage mentions two times. Which one is the blank's sentence about, and is the action finished then, still going on, or repeated?",
      });
      instance.verify = () => {
        const offered = [instance.correct, ...instance.wrong.map(([form]) => form)];
        const tenses = offered.map((form) => tenseOf(form, topic.forms));
        const participle = topic.forms.pastPerfect.replace(/^had\s+/, "");
        return hasOneBlank(topic.text) && topic.text.includes(topic.anchor) && topic.text.includes(topic.lure) &&
          TWO_TIME_CUES[topic.frame].test(topic.anchor) &&
          new RegExp(`^(has|have) ${participle}$`).test(topic.forms.presentPerfect) &&
          topic.forms.past !== topic.forms.present &&
          // The lure is a different time from the anchor, and no signal
          // phrase such as "by the time" sits right before the blank.
          topic.lure !== topic.anchor && !/\bby (the time|then)\b/i.test(blankSentence(topic.text)) &&
          tenseOf(instance.correct, topic.forms) === needed &&
          new Set(tenses).size === 4 && !tenses.includes(null) &&
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
      text: "Currently, the Humboldt Current, which carries cold water north from the Southern Ocean along the western coast of South America, ______ nutrients up from the deep ocean, supporting one of the most productive fisheries on Earth.",
      subject: "the Humboldt Current", mainVerb: null, second: "tense", cue: "Currently",
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
      scene: "sec-coast-redwood-fog",
      text: "Currently, coast redwoods, which grow only in a narrow strip of foggy land along the Pacific coast of California and southern Oregon, ______ as much as a third of their water from fog that condenses on their needles and drips to the ground.",
      subject: "coast redwoods", mainVerb: null, second: "tense", cue: "Currently",
      choices: { "yes|past": "gathered", "yes|present": "gather", "no|past": "having gathered", "no|present": "gathering" },
      key: "yes|present",
    },
    {
      scene: "sec-leavitt-plates",
      text: "The astronomer Henrietta Swan Leavitt, ______ the brightness of stars on thousands of photographic plates at the Harvard College Observatory, reported in 1912 that the brightest Cepheid variable stars pulse the most slowly.",
      subject: "Henrietta Swan Leavitt", mainVerb: "reported", second: "voice", cue: "the brightness of stars",
      choices: { "no|passive": "measured", "no|active": "measuring", "yes|passive": "was measured", "yes|active": "measures" },
      key: "no|active",
    },
    {
      scene: "sec-gulf-stream-winters",
      text: "The Gulf Stream, ______ warm water from the Gulf of Mexico north along the coast of North America and then across the Atlantic, helps keep winters in western Europe milder than winters at the same latitudes in Canada.",
      subject: "The Gulf Stream", mainVerb: "helps", second: "voice", cue: "warm water",
      choices: { "no|passive": "carried", "no|active": "carrying", "yes|passive": "is carried", "yes|active": "carries" },
      key: "no|active",
    },
    {
      scene: "sec-red-mangrove-roots",
      text: "Red mangroves, ______ their arching prop roots deep into the mud of tropical shorelines, shelter young fish from predators and soften the force of storm waves.",
      subject: "Red mangroves", mainVerb: "shelter", second: "voice", cue: "their arching prop roots",
      choices: { "no|passive": "sunk", "no|active": "sinking", "yes|passive": "are sunk", "yes|active": "sink" },
      key: "no|active",
    },
    {
      scene: "sec-kente-strips",
      text: "Currently, kente cloth, which weavers in Ghana produce on narrow looms in strips only about ten centimeters wide, ______ its bold, checkered patterns from the way those strips are sewn together edge to edge.",
      subject: "kente cloth", mainVerb: null, second: "tense", cue: "Currently",
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
      text: "Currently, the Dead Sea Scrolls, found in caves near the northwestern shore of the Dead Sea between 1947 and 1956, ______ the oldest known manuscripts of the Hebrew Bible and are still being pieced together by scholars today.",
      subject: "the Dead Sea Scrolls", mainVerb: null, second: "tense", cue: "Currently",
      choices: { "yes|past": "included", "yes|present": "include", "no|past": "having included", "no|present": "including" },
      key: "yes|present",
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
    voice: (form, value, topic) => (value === "active"
      ? `${q(form)} is active, but ${topic.subject.replace(/^The /, "the ")} ${nounNumber(topic.subject) === "plural" ? "are" : "is"} acted on (${q(topic.cue)}), so the form must be passive`
      : /^(was|were|is|are) /.test(form)
        ? `${q(form)} is a finite passive form, but the subject performs the action (${q(topic.cue)}), so the voice is wrong`
        : `${q(form)} cannot serve as the required active modifier: as a past participle it would describe the subject as receiving the action, whereas ${topic.subject.replace(/^The /, "the ")} performs it (${q(topic.cue)}); if the same spelling is read as a finite past verb, the commas do not properly join that extra predicate to the main verb`),
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
    difficulty: "Medium",
    title: "Main verb or modifier",
    recognize: "Decide whether the sentence already has its main verb. If it does, the blank opens a modifier and needs a nonfinite form; if it does not, the blank must supply the main verb in the passage's tense.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 2 },
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
          ? `The words between the commas describe ${q(topic.subject)} but give the subject no verb, so the blank must supply the main verb, and the passage's time frame (${q(topic.cue)}) sets its tense: ${q(choices.correct)}.`
          : `The sentence's main verb is ${q(topic.mainVerb)}, after the second comma, so the blank begins a modifier describing ${q(topic.subject)}. ${topic.second === "voice"
            ? keySecond === "passive"
              ? `${cap(topic.subject.replace(/^The /, "the "))} ${nounNumber(topic.subject) === "plural" ? "are" : "is"} acted on (${q(topic.cue)}), so the modifier uses the past participle`
              : `${cap(topic.subject.replace(/^The /, "the "))} ${nounNumber(topic.subject) === "plural" ? "act" : "acts"} on something (${q(topic.cue)}), so the modifier uses the present participle`
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

  // The blank decides two things at once, whether a comma sets off
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
    difficulty: "Medium",
    title: "Main verb or set-off phrase, with its punctuation",
    recognize: "Find out whether the sentence gets its main verb later. If it does and a comma closes the phrase, the blank opens a set-off phrase (comma + participle); if it does and no comma follows, the phrase identifies (no comma); if it does not, the blank is the main verb (no comma).",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 2 },
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
  // clause. The choices cross the clause's subject (`described`, the one
  // the modifier describes, or `other`, a noun it cannot describe) with
  // finiteness (a finite verb, or a form that leaves the sentence without
  // one: an -ing word, a who/which clause, or a bare participle). The
  // described one is a person in some scenes and a thing or a group in
  // others, and the key is active in some and passive in others, so no
  // subject or voice is a habit. The other subject is a possessive ("Frida
  // Kahlo's art"), the person or group who acted on the described thing
  // (so the key's subject is not the name), or a passive whose "by" phrase
  // holds the right noun. Each topic writes its four choices out.
  const MODIFIER_TOPICS = [
  {
    "scene": "sec-voss-and-chen",
    "text": "When curator Mara Voss sent conservator Lina Chen the damaged portrait, Voss enclosed a request for advice about its frame. Chen replied that her workshop could repair the canvas but lacked the tools for the frame. Responding to Voss’s request for work her workshop could not perform, ______.",
    "described": "Lina Chen",
    "other": "Mara Voss",
    "gist": "Chen, whose workshop lacked the tools for that work",
    "choices": {
      "described|yes": "Lina Chen recommended a specialist in carved wood",
      "described|no": "Lina Chen, who recommended a specialist in carved wood",
      "other|yes": "Mara Voss recommended a specialist in carved wood",
      "other|no": "Mara Voss, who recommended a specialist in carved wood"
    }
  },
  {
    "scene": "sec-ferry-survey-proposal",
    "text": "Engineer Rina Shah designed a survey that planner Dora Vance declined to fund. After a winter of ferry delays, Vance asked Shah to submit the same proposal again; Shah had meanwhile accepted a job abroad. Having reversed her earlier decision about funding Shah’s survey, ______.",
    "described": "Dora Vance",
    "other": "Rina Shah",
    "gist": "Vance, whose decision changed from refusing funds to requesting the proposal",
    "choices": {
      "described|yes": "Dora Vance arranged for another engineer to carry out the survey",
      "described|no": "Dora Vance, who arranged for another engineer to carry out the survey",
      "other|yes": "Rina Shah arranged for another engineer to carry out the survey",
      "other|no": "Rina Shah, who arranged for another engineer to carry out the survey"
    }
  },
  {
    "scene": "sec-poem-returned-proof",
    "text": "Poet Nora Bell sent printer Iris Cole a corrected proof. Cole had already replaced the old type, but Bell then noticed that her own correction had introduced a new error. Having introduced a new error in the correction she sent to Cole, ______.",
    "described": "Nora Bell",
    "other": "Iris Cole",
    "gist": "Bell, who introduced the new error in her correction",
    "choices": {
      "described|yes": "Nora Bell paid the cost of setting the line a second time",
      "described|no": "Nora Bell, who paid the cost of setting the line a second time",
      "other|yes": "Iris Cole paid the cost of setting the line a second time",
      "other|no": "Iris Cole, who paid the cost of setting the line a second time"
    }
  },
  {
    "scene": "sec-sampler-review",
    "text": "Biologist Alma Reed asked technician Vera Holt to test a sampler Reed had designed. Holt reported a fault in its timer; Reed initially doubted the report but reproduced the fault on a second instrument. Having changed her mind after reproducing the fault Holt reported, ______.",
    "described": "Alma Reed",
    "other": "Vera Holt",
    "gist": "Reed, who initially doubted Holt and then reproduced the fault",
    "choices": {
      "described|yes": "Alma Reed withdrew the sampler until the timer could be replaced",
      "described|no": "Alma Reed, who withdrew the sampler until the timer could be replaced",
      "other|yes": "Vera Holt withdrew the sampler until the timer could be replaced",
      "other|no": "Vera Holt, who withdrew the sampler until the timer could be replaced"
    }
  },
  {
    "scene": "sec-translator-rights",
    "text": "Translator Maya Orr wanted permission to publish several letters that historian Lila Park had located. Park could supply copies, but the writer’s estate controlled publication rights. Having located the letters but lacking authority to grant Orr’s requested publication rights, ______.",
    "described": "Lila Park",
    "other": "Maya Orr",
    "gist": "Park, who located the letters but did not control publication rights",
    "choices": {
      "described|yes": "Lila Park referred the request to the writer’s estate",
      "described|no": "Lila Park, who referred the request to the writer’s estate",
      "other|yes": "Maya Orr referred the request to the writer’s estate",
      "other|no": "Maya Orr, who referred the request to the writer’s estate"
    }
  },
  {
    "scene": "sec-pianist-short-program",
    "text": "Pianist Eva Lane agreed to perform a piece by composer Ruth Dale. Dale asked for a longer rehearsal than the festival allowed; Lane offered her own practice session, and Dale accepted. Accepting Lane’s offer of additional time to hear the piece rehearsed, ______.",
    "described": "Ruth Dale",
    "other": "Eva Lane",
    "gist": "Dale, who requested more rehearsal time and accepted Lane’s offer",
    "choices": {
      "described|yes": "Ruth Dale sent a note of thanks after the festival",
      "described|no": "Ruth Dale, who sent a note of thanks after the festival",
      "other|yes": "Eva Lane sent a note of thanks after the festival",
      "other|no": "Eva Lane, who sent a note of thanks after the festival"
    }
  },
  {
    "scene": "sec-chart-surviving-copy",
    "text": "Archivist Hana Bell compared an original coastal chart with a photographic copy made before the chart was trimmed. The copy preserves several place names now missing from the original, although its scale is less precise. Retaining information lost when the edges were cut away, ______.",
    "described": "the photographic copy",
    "other": "the original chart",
    "gist": "the copy, made before trimming removed names from the original",
    "choices": {
      "described|yes": "the photographic copy provides the fuller record of the coastal place names",
      "described|no": "the photographic copy, which provides the fuller record of the coastal place names",
      "other|yes": "the original chart provides the fuller record of the coastal place names",
      "other|no": "the original chart, which provides the fuller record of the coastal place names"
    }
  },
  {
    "scene": "sec-violin-replacement-neck",
    "text": "A maker fitted a replacement neck to a violin built two centuries earlier and kept the removed neck for study. The new piece matches the old one’s outline but is made from a denser wood. Still bearing the marks of the instrument’s first maker, ______.",
    "described": "the removed neck",
    "other": "the replacement neck",
    "gist": "the old neck, which came from the original instrument",
    "choices": {
      "described|yes": "the removed neck offers evidence about how the violin was first constructed",
      "described|no": "the removed neck, which offers evidence about how the violin was first constructed",
      "other|yes": "the replacement neck offers evidence about how the violin was first constructed",
      "other|no": "the replacement neck, which offers evidence about how the violin was first constructed"
    }
  },
  {
    "scene": "sec-inscription-cast",
    "text": "A museum owns a stone inscription and a plaster cast taken before rain eroded the stone’s final line. The cast is less valuable as an object, yet scholars consult it whenever a reading of that line is disputed. Preserving the lettering that weather has since erased, ______.",
    "described": "the plaster cast",
    "other": "the stone inscription",
    "gist": "the cast, which records the lettering before the original stone eroded",
    "choices": {
      "described|yes": "the plaster cast serves as the clearer witness to the final line",
      "described|no": "the plaster cast, which serves as the clearer witness to the final line",
      "other|yes": "the stone inscription serves as the clearer witness to the final line",
      "other|no": "the stone inscription, which serves as the clearer witness to the final line"
    }
  },
  {
    "scene": "sec-adams-sponsor",
    "text": "Director Lena Adams sought funding from patron Rosa Field for a theater tour. Field declined until Adams reduced the itinerary; Field then covered the travel costs without asking for a share of ticket sales. Receiving the support only after shortening the route, ______.",
    "described": "Lena Adams",
    "other": "Rosa Field",
    "gist": "Adams, who requested funding and shortened her itinerary to obtain it",
    "choices": {
      "described|yes": "Lena Adams scheduled performances in six towns instead of nine",
      "described|no": "Lena Adams, who scheduled performances in six towns instead of nine",
      "other|yes": "Rosa Field scheduled performances in six towns instead of nine",
      "other|no": "Rosa Field, who scheduled performances in six towns instead of nine"
    }
  },
  {
    "scene": "sec-grant-embargo",
    "text": "Historian Iris Grant loaned researcher Nora Vale a private diary on condition that Vale not quote it before the archive opened. Grant could publish her own writing at any time, but Vale had accepted the condition. Having accepted Grant’s restriction on quotation as a condition of access, ______.",
    "described": "Nora Vale",
    "other": "Iris Grant",
    "gist": "Vale, who borrowed the diary under Grant’s stated condition",
    "choices": {
      "described|yes": "Nora Vale delayed submitting an article that relied on the diary",
      "described|no": "Nora Vale, who delayed submitting an article that relied on the diary",
      "other|yes": "Iris Grant delayed submitting an article that relied on the diary",
      "other|no": "Iris Grant, who delayed submitting an article that relied on the diary"
    }
  },
  {
    "scene": "sec-two-pottery-firings",
    "text": "A potter fired two bowls from the same batch of clay. The first cooled slowly in the kiln; the second was removed while hot and plunged into cold water, which produced fine cracks in its glaze. Subjected to the sudden change in temperature, ______.",
    "described": "the second bowl",
    "other": "the first bowl",
    "gist": "the second bowl, which was plunged into cold water while hot",
    "choices": {
      "described|yes": "the second bowl developed the crackled surface the potter hoped to reproduce",
      "described|no": "the second bowl, which developed the crackled surface the potter hoped to reproduce",
      "other|yes": "the first bowl developed the crackled surface the potter hoped to reproduce",
      "other|no": "the first bowl, which developed the crackled surface the potter hoped to reproduce"
    }
  }
];

  // What follows a choice's subject when the choice has no finite main
  // verb: a comma and a who/which clause, participle, or appositive, or an
  // -ing word (after an optional adverb). Finite choices never do either.
  const leavesNoVerb = (rest) => /^,\s[a-z]/.test(rest) || /^\s(gradually\s)?\w+ing\b/.test(rest);

  const danglingModifier = {
    id: "sec-dangling-modifier",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: FORM,
    subskill: "modifier placement",
    difficulty: "Medium",
    title: "Modifier attachment resolved by the preceding account",
    recognize: "An opening modifier without a subject of its own describes the main-clause subject right after its comma, so the main clause must begin with the one the modifier describes (which may be a thing, not the person the passage is about) and still needs a finite verb of its own.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["dangling-modifier", "grammatical-but-illogical"],
    build(t) {
      const topic = t.pick(MODIFIER_TOPICS);
      const modifier = blankSentence(topic.text).replace(/,\s*$/, "");
      const rows = Object.entries(topic.choices).map(([corner, text]) => {
        const [role, finite] = corner.split("|");
        const subject = role === "described" ? topic.described : topic.other;
        const problems = [];
        if (role === "other") problems.push(`it makes ${q(subject)} the subject, so the opening phrase would describe ${q(subject)}; the phrase describes ${topic.gist}`);
        if (finite === "no") problems.push(`it gives ${q(subject)} no finite verb (an -ing word, a who or which clause, or a bare participle cannot be one), so the sentence would have no main verb`);
        return [text, { subject: role, finite }, problems.length ? `${cap(problems.join("; and "))}.` : null];
      });
      const choices = square(rows);
      const instance = item(topic, this, {
        ...choices,
        explanation: `The opening phrase, ${q(modifier)}, describes ${topic.gist}, so ${q(topic.described)} must be the subject that comes right after the comma, and the clause needs a finite verb. The opening phrase does not describe ${q(topic.other)}. The answer is ${q(choices.correct)}.`,
        steps: [
          "Trace the roles in the preceding account: who requested or received something, or which object retained the relevant property?",
          `Only ${q(topic.described)} fits: ${topic.gist}.`,
          `Choose the clause whose subject, right after the comma, is ${q(topic.described)}, and whose verb is finite.`,
        ],
        principles: [
          "An introductory modifier without a subject of its own describes the subject of the main clause that follows it, whether that subject is a person or a thing.",
          "When two candidates could grammatically fit a modifier, the preceding account must decide which one the modifier actually describes.",
          "The main clause also needs a finite verb; an -ing word, a who or which clause, or a bare participle cannot be one.",
        ],
        trap: `Picking the clause that begins with ${q(topic.other)}, which sounds right because it names someone or something from the passage, though the opening phrase does not describe it; or picking a clause with no finite verb.`,
        hint: "Who or what is doing, or undergoing, what the opening phrase describes? That noun has to come right after the comma, followed by a real verb.",
      });
      instance.verify = () => {
        const offered = Object.entries(topic.choices);
        return hasOneBlank(topic.text) &&
          /,["”]? ______\.$/.test(topic.text) &&
          lower(beforeBlank(topic.text)).includes(lower(lastWordOf(topic.described))) &&
          instance.correct === topic.choices["described|yes"] &&
          offered.every(([corner, text]) => {
            const subject = corner.startsWith("described") ? topic.described : topic.other;
            return text.startsWith(subject) && leavesNoVerb(text.slice(subject.length)) === corner.endsWith("|no");
          }) &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  // Context determines both levels of a possessive chain. All four forms
  // are grammatical by themselves; the passage fixes whose records these are.
  const NESTED_GENITIVE_TOPICS = [
  {
    "scene": "sec-painter-assistant-notes",
    "text": "The archive contains the working papers of one painter. Although several people helped prepare exhibitions, only one assistant kept a daily account of the painter’s studio work. The curator used the ______ notes to date a series of unfinished canvases.",
    "outer": "painter",
    "inner": "assistant",
    "owners": 1,
    "dependents": 1,
    "why": "The archive concerns one painter, and only one assistant kept the relevant account."
  },
  {
    "scene": "sec-author-editors-comments",
    "text": "An author hired two editors to review a novel: one checked its historical setting, while the other checked its structure. Their separate recommendations were gathered into a single file. A researcher compared the ______ comments with the changes in the published novel.",
    "outer": "author",
    "inner": "editor",
    "owners": 1,
    "dependents": 2,
    "why": "There is one author, but the combined file includes comments from both editors."
  },
  {
    "scene": "sec-botanists-illustrator-drawings",
    "text": "Two botanists prepared a field guide together. To keep its illustrations consistent, they jointly employed one illustrator, who drew every specimen rather than dividing the work with a colleague. The publisher scanned the ______ drawings before returning the originals.",
    "outer": "botanist",
    "inner": "illustrator",
    "owners": 2,
    "dependents": 1,
    "why": "Both botanists jointly employed the same single illustrator."
  },
  {
    "scene": "sec-potters-apprentices-ledgers",
    "text": "Two potters worked in adjacent workshops. Each trained one apprentice, and each apprentice kept a separate ledger of firing temperatures. A historian combined the ______ records to compare the two workshops’ techniques over the same winter.",
    "outer": "potter",
    "inner": "apprentice",
    "owners": 2,
    "dependents": 2,
    "why": "Two potters each had an apprentice, so the combined records came from two apprentices."
  },
  {
    "scene": "sec-director-interpreter-recording",
    "text": "The only director of an oral-history project worked with one interpreter throughout the interviews. Several camera operators rotated through the project, but none translated the interviews. An archivist checked the ______ recordings against the written translations.",
    "outer": "director",
    "inner": "interpreter",
    "owners": 1,
    "dependents": 1,
    "why": "One director worked with one interpreter; the camera operators do not add interpreters."
  },
  {
    "scene": "sec-photographer-assistants-logs",
    "text": "One photographer sent two assistants to document a festival from opposite ends of the town. Each assistant kept a log recording the time and location of every exposure. The photographer combined the ______ logs to put the photographs in order.",
    "outer": "photographer",
    "inner": "assistant",
    "owners": 1,
    "dependents": 2,
    "why": "One photographer supervised two assistants, and both logs were combined."
  },
  {
    "scene": "sec-curators-conservator-analysis",
    "text": "Two curators arranged a joint exhibition of damaged manuscripts. They agreed to hire a single conservator to examine both collections rather than commission separate assessments. Before selecting the works, the museum reviewed the ______ analysis of the condition of the paper.",
    "outer": "curator",
    "inner": "conservator",
    "owners": 2,
    "dependents": 1,
    "why": "Two curators commissioned one shared conservator, who wrote the analysis."
  },
  {
    "scene": "sec-explorers-guides-journals",
    "text": "Two explorers crossed the plateau by different routes, each accompanied by one guide. Both guides kept journals, and the archive later acquired both of those journals. A scholar compared the ______ descriptions of the weather with the explorers’ published accounts.",
    "outer": "explorer",
    "inner": "guide",
    "owners": 2,
    "dependents": 2,
    "why": "Each of two explorers had a guide; the comparison uses both guides’ journals."
  },
  {
    "scene": "sec-violinist-manager-correspondence",
    "text": "During her first overseas tour, one violinist handled all bookings through a single manager. A local agent arranged the opening concert but had no role in the remaining performances. The archive preserves the ______ correspondence covering the entire tour.",
    "outer": "violinist",
    "inner": "manager",
    "owners": 1,
    "dependents": 1,
    "why": "The tour involved one violinist and one manager; the local agent was not another manager."
  },
  {
    "scene": "sec-historian-translators-drafts",
    "text": "One historian hired two translators for a bilingual edition of a diary. Each translator worked on a different language, and both submitted drafts to the same publisher. Comparing the ______ drafts revealed several passages that the two translators had understood differently.",
    "outer": "historian",
    "inner": "translator",
    "owners": 1,
    "dependents": 2,
    "why": "One historian commissioned two translators, and both drafts are being compared."
  },
  {
    "scene": "sec-architects-surveyor-map",
    "text": "Two architects were preparing competing plans for a park. For a fair comparison, the town assigned them one surveyor, whose single map provided the measurements for both plans. The review panel consulted the ______ map whenever the plans gave different dimensions.",
    "outer": "architect",
    "inner": "surveyor",
    "owners": 2,
    "dependents": 1,
    "why": "The two architects shared one surveyor and used that surveyor’s single map."
  },
  {
    "scene": "sec-composers-copyists-errors",
    "text": "Two composers prepared scores for the same festival. Each employed one copyist, and the festival librarian checked the work of both copyists. The librarian listed the ______ errors in a report that kept the two scores separate.",
    "outer": "composer",
    "inner": "copyist",
    "owners": 2,
    "dependents": 2,
    "why": "Two composers employed one copyist each, so the report covers two copyists."
  }
];
  const nestedGenitives = {
    id: "sec-nested-genitive-ownership", sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: FORM, subskill: "possessives and plurals", difficulty: "Medium",
    title: "Number at both levels of an ownership chain",
    recognize: "Reconstruct the ownership chain from the passage. A shared assistant is one assistant even when there are several employers; one assistant for each employer may mean several assistants.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["grammatical-but-illogical", "part-vs-whole"],
    build(t) {
      const topic = t.pick(NESTED_GENITIVE_TOPICS);
      const possessive = (noun, count) => noun + (count === 1 ? "'s" : "s'");
      const rows = [];
      [1, 2].forEach((outer) => [1, 2].forEach((inner) => {
        const text = possessive(topic.outer, outer) + " " + possessive(topic.inner, inner);
        const errors = [];
        if (outer !== topic.owners) errors.push("it refers to " + (outer === 1 ? "one" : "multiple") + " " + topic.outer + (outer === 1 ? "" : "s") + ", whereas the account requires " + topic.owners);
        if (inner !== topic.dependents) errors.push("it refers to " + (inner === 1 ? "one" : "multiple") + " " + topic.inner + (inner === 1 ? "" : "s") + ", whereas the records belong to " + topic.dependents);
        rows.push([text, { outerNumber: outer === 1 ? "singular" : "plural", innerNumber: inner === 1 ? "singular" : "plural" }, errors.length ? "This possessive chain is grammatical, but " + errors.join("; also, ") + "." : null]);
      }));
      const choices = square(rows);
      const instance = item(topic, this, {
        ...choices,
        explanation: topic.why + " Each noun is possessive: the first identifies whose associate is meant, and the second identifies whose records are meant. Therefore use “" + choices.correct + ".”",
        steps: ["Identify the outer owner or owners without counting other people mentioned nearby.", "Determine whether they share one associate or have separate associates: " + topic.why, "Mark a singular owner with 's and a regular plural owner with s' at each level."],
        principles: ["In a possessive chain, each apostrophe belongs to its own noun.", "The number of employers does not by itself determine the number of employees: the passage must establish whether someone is shared."],
        trap: "Copying the number of the first owner onto the second, or counting every person mentioned as an owner.",
        hint: "How many people occupy each of the two roles? Is the second role shared?",
      });
      instance.verify = () => hasOneBlank(topic.text) && [1, 2].includes(topic.owners) && [1, 2].includes(topic.dependents) &&
        instance.correct.split(" ").every((word) => /(?:'s|s')$/.test(word)) &&
        instance.correct === possessive(topic.outer, topic.owners) + " " + possessive(topic.inner, topic.dependents) && isSquare(instance.features);
      return instance;
    },
  };

  // A background phrase can have a subject of its own. In contrast, a
  // clause introduced by while/because/although needs its own finite verb.
  const ABSOLUTE_CLAUSE_TOPICS = [
  {
    "scene": "sec-archive-roof-absolute",
    "text": "The archive remained open during repairs, and the builders worked above the reading room. The roof’s damaged beams having been replaced, the crew moved on to the tiles; the reading room’s furniture ______ under dust sheets, researchers continued using the adjacent catalog room.",
    "choices": {
      "no|passive": "covered",
      "no|active": "covering",
      "yes|passive": "was covered",
      "yes|active": "was covering"
    },
    "finite": "no",
    "voice": "passive",
    "subject": "furniture",
    "why": "The furniture receives the covering; it does not cover anything. Its own subject and participle form a background phrase, while “researchers continued” is the main clause."
  },
  {
    "scene": "sec-surveyors-absolute",
    "text": "The expedition’s maps had to be finished before the river froze. Its supplies packed and its instruments checked, the party set out at dawn, the surveyors ______ the safest route through the marsh as the rest of the party followed.",
    "choices": {
      "no|passive": "shown",
      "no|active": "showing",
      "yes|passive": "were shown",
      "yes|active": "were showing"
    },
    "finite": "no",
    "voice": "active",
    "subject": "surveyors",
    "why": "The surveyors show the route to the following party. “The party set out” already supplies the main clause; the final phrase supplies its own subject and a participle."
  },
  {
    "scene": "sec-sculpture-crates-absolute",
    "text": "Museum staff prepared the sculpture for a long journey. With its fragile projections protected by foam, it could be moved safely; the crates ______ in a climate-controlled truck, the couriers began checking the route for delays.",
    "choices": {
      "no|passive": "loaded",
      "no|active": "loading",
      "yes|passive": "were loaded",
      "yes|active": "were loading"
    },
    "finite": "no",
    "voice": "passive",
    "subject": "crates",
    "why": "The crates receive the loading. The couriers’ checking is the main action, and the phrase with “crates” supplies background circumstances."
  },
  {
    "scene": "sec-choir-rehearsal-absolute",
    "text": "The conductor divided the rehearsal between two rooms so that neither section would overpower the other. The tenors worked on the melody in the hall, the pianist ______ the altos through a difficult passage in a smaller room while an assistant marked changes in their scores.",
    "choices": {
      "no|passive": "taken",
      "no|active": "taking",
      "yes|passive": "was taken",
      "yes|active": "was taking"
    },
    "finite": "no",
    "voice": "active",
    "subject": "pianist",
    "why": "The pianist takes the altos through the passage. “The tenors worked” is the main clause; the pianist has a separate subject inside a background participial phrase."
  },
  {
    "scene": "sec-orchard-nets-absolute",
    "text": "The orchard’s workers planned the harvest around a forecast of strong wind. The ladders secured and the empty baskets stacked beside the shed, they moved to the eastern rows, the oldest trees ______ by netting until their fruit could be picked.",
    "choices": {
      "no|passive": "protected",
      "no|active": "protecting",
      "yes|passive": "were protected",
      "yes|active": "were protecting"
    },
    "finite": "no",
    "voice": "passive",
    "subject": "trees",
    "why": "The trees receive protection from the netting. The workers’ move is the main clause; the phrase about the trees has its own subject and participle."
  },
  {
    "scene": "sec-film-score-absolute",
    "text": "The film could be screened only after the damaged reel had been repaired. The projectionist checked the repaired section once more, the composer ______ the final musical cues at the piano while the audience waited outside the theater.",
    "choices": {
      "no|passive": "written",
      "no|active": "writing",
      "yes|passive": "was written",
      "yes|active": "was writing"
    },
    "finite": "no",
    "voice": "active",
    "subject": "composer",
    "why": "The composer writes the cues. “The projectionist checked” is the complete main clause; the composer’s action belongs to a background phrase with its own subject."
  },
  {
    "scene": "sec-laboratory-samples-clause",
    "text": "The samples remained sealed during transport, their labels protected by clear sleeves. Although the technician, after checking the numbers against the field notebook, ______ them to a refrigerated cabinet when the power failed, none warmed enough to spoil.",
    "choices": {
      "no|passive": "taken",
      "no|active": "taking",
      "yes|passive": "was taken",
      "yes|active": "was taking"
    },
    "finite": "yes",
    "voice": "active",
    "subject": "technician",
    "why": "Inside “Although,” the technician needs a finite verb and is the person taking the samples to the cabinet; the later “none warmed” is a separate main clause."
  },
  {
    "scene": "sec-gallery-windows-clause",
    "text": "The gallery reopened in stages, the western rooms ready before the eastern rooms. While the windows in the eastern rooms, unlike those beside the main entrance, ______ by workers using a new protective film, visitors entered through the courtyard.",
    "choices": {
      "no|passive": "covered",
      "no|active": "covering",
      "yes|passive": "were covered",
      "yes|active": "were covering"
    },
    "finite": "yes",
    "voice": "passive",
    "subject": "windows",
    "why": "The “While” clause needs a finite verb for “windows,” which receive the covering; “visitors entered” supplies the main clause."
  },
  {
    "scene": "sec-railway-engine-clause",
    "text": "The railway kept its oldest locomotive for special trips, the newer engines handling daily service. Because its boiler, after several small cracks had appeared near the joints, ______ by a specialist team during the summer of 1982, the old engine missed that year’s festival.",
    "choices": {
      "no|passive": "examined",
      "no|active": "examining",
      "yes|passive": "was examined",
      "yes|active": "was examining"
    },
    "finite": "yes",
    "voice": "passive",
    "subject": "boiler",
    "why": "The “Because” clause needs a finite verb for “boiler,” which is examined by the team; “the old engine missed” is the main clause."
  },
  {
    "scene": "sec-dancers-stage-clause",
    "text": "The company’s principal dancers arrived early, their costumes still packed for travel. While the stage manager, whose crew had finished testing the lights, ______ the final set pieces across the stage by ropes, the dancers warmed up in the corridor.",
    "choices": {
      "no|passive": "drawn",
      "no|active": "drawing",
      "yes|passive": "was drawn",
      "yes|active": "was drawing"
    },
    "finite": "yes",
    "voice": "active",
    "subject": "stage manager",
    "why": "The “While” clause needs a finite verb for the stage manager, who draws the set pieces across the stage; the dancers have a different main-clause verb."
  },
  {
    "scene": "sec-library-books-clause",
    "text": "The reading room was ready for visitors, its tables polished and its lamps tested. Although the rare books, each wrapped separately after the previous exhibition closed, ______ from public view in a secure storeroom during the renovation, the catalog remained available online.",
    "choices": {
      "no|passive": "hidden",
      "no|active": "hiding",
      "yes|passive": "were hidden",
      "yes|active": "were hiding"
    },
    "finite": "yes",
    "voice": "passive",
    "subject": "books",
    "why": "The “Although” clause needs a finite verb for the books, which are hidden from public view; “the catalog remained” is the main clause."
  },
  {
    "scene": "sec-birdwatchers-count-clause",
    "text": "The birds began arriving before sunrise, their calls audible from the far end of the marsh. While the observers, their equipment sheltered under a canvas awning, ______ notes on the incoming flocks during the 2019 survey, a second team checked the numbered leg bands.",
    "choices": {
      "no|passive": "taken",
      "no|active": "taking",
      "yes|passive": "were taken",
      "yes|active": "were taking"
    },
    "finite": "yes",
    "voice": "active",
    "subject": "observers",
    "why": "The “While” clause needs a finite verb for the observers, who take the notes; the second team’s checking is the main clause."
  }
];
  const absoluteOrFinite = {
    id: "sec-absolute-or-finite-clause", sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: FORM, subskill: "verb form", difficulty: "Medium",
    title: "Background phrase or subordinate clause",
    recognize: "Find the complete main clause and then identify the structure around the blank. A background phrase may name its own subject without a finite verb; a clause introduced by while, because, or although needs a finite verb. Check who performs or receives the action.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["neighbouring-rule", "dangling-modifier"],
    build(t) {
      const topic = t.pick(ABSOLUTE_CLAUSE_TOPICS);
      const key = topic.finite + "|" + topic.voice;
      const choices = square(Object.entries(topic.choices).map(([corner, text]) => {
        const [finite, voice] = corner.split("|");
        const errors = [];
        if (finite !== topic.finite) errors.push(topic.finite === "yes" ? "the subordinate clause would lack its finite verb" : "a finite verb would turn the background phrase into an independent clause joined to the main clause by only a comma");
        if (voice !== topic.voice) errors.push(topic.voice === "active" ? "the subject performs this action and needs an active form" : "the subject receives this action and needs a passive form");
        return [text, { finite, voice }, errors.length ? cap(errors.join("; also, ")) + "." : null];
      }));
      const instance = item(topic, this, {
        ...choices,
        explanation: topic.why + " The required form is “" + choices.correct + ".”",
        steps: ["Locate the main clause and identify its subject and finite verb.", "Determine whether the words around the blank form another clause introduced by a subordinator or a background phrase with its own subject.", topic.why],
        principles: ["A background phrase such as 'the doors closed' or 'the workers waiting' may name its own subject; it does not need to share the main clause's subject.", "A dependent clause introduced by while, because, or although still needs a finite verb.", "An active participle describes a subject performing the action; a passive participle describes one receiving it."],
        trap: "Applying the main-clause subject to every participle, or supplying a finite verb to every group of words that contains a noun.",
        hint: "Which words already make a complete main clause? Does a conjunction introduce the group containing the blank?",
      });
      instance.verify = () => hasOneBlank(topic.text) && instance.correct === topic.choices[key] &&
        Object.entries(topic.choices).every(([corner, form]) => /^(was|were) /.test(form) === corner.startsWith("yes|")) &&
        isSquare(instance.features);
      return instance;
    },
  };

  // Local agreement: the demonstrative and head noun are immediately before
  // the blank. Explicit time words cross number with tense without adding an
  // intervening noun, a compound subject, or an additional agreement relation.
  const DEMONSTRATIVE_AGREEMENT_TOPICS = [
    {
      scene: "sec-demonstrative-pottery-bowl",
      text: "A pottery student is arranging an exhibition of her work. She places a blue bowl on a stand near the entrance. This bowl ______ at present the centerpiece of her display, and visitors can walk around it to examine the glaze.",
      subject: "This bowl", cue: "at present", tense: "present",
    },
    {
      scene: "sec-demonstrative-garden-guide",
      text: "Volunteers at a community garden give visitors a folded guide showing the accessible paths. This guide ______ currently available at the entrance, where a volunteer can also explain how to reach the shaded seating area.",
      subject: "This guide", cue: "currently", tense: "present",
    },
    {
      scene: "sec-demonstrative-workshop-lever",
      text: "A workshop instructor is demonstrating a small hand press. She points to a red lever beside the handle. This lever ______ right now in the locked position, so the class must wait for her to release it before trying the press.",
      subject: "This lever", cue: "right now", tense: "present",
    },
    {
      scene: "sec-demonstrative-mural-children",
      text: "A neighborhood art room offers a mural workshop for young residents. The instructor has given the youngest participants a large sheet of paper. These children ______ currently busy drawing the pattern that the older group will paint on the wall.",
      subject: "These children", cue: "currently", tense: "present",
    },
    {
      scene: "sec-demonstrative-puppet-mice",
      text: "A puppet maker is testing two tiny mouse puppets for a new play. Each puppet has a separate wire that moves its tail. These mice ______ at present part of a rehearsal kit, and the maker plans to add cloth costumes after the test.",
      subject: "These mice", cue: "at present", tense: "present",
    },
    {
      scene: "sec-demonstrative-courtyard-benches",
      text: "A school is reopening its courtyard after repainting the seating. A caretaker checks the wooden benches before unlocking the gate. These benches ______ right now dry enough to use, so students can bring their lunches outside.",
      subject: "These benches", cue: "right now", tense: "present",
    },
    {
      scene: "sec-demonstrative-rehearsal-curtain",
      text: "A theater crew tried a new curtain before the evening performance. This curtain ______ too long during yesterday's rehearsal, so the crew folded its lower edge and stitched it in place before the audience arrived.",
      subject: "This curtain", cue: "yesterday's rehearsal", tense: "past",
    },
    {
      scene: "sec-demonstrative-attic-ladder",
      text: "A volunteer borrowed a ladder to reach a box in the club's attic. This ladder ______ too short during yesterday's cleanup, so she left the box in place and asked the caretaker to bring taller equipment the next day.",
      subject: "This ladder", cue: "yesterday's cleanup", tense: "past",
    },
    {
      scene: "sec-demonstrative-recital-microphone",
      text: "A student tested a microphone before the library's poetry recital. This microphone ______ silent during last night's sound check, so the organizer replaced its cable and tested it again before letting the readers onto the stage.",
      subject: "This microphone", cue: "last night's sound check", tense: "past",
    },
    {
      scene: "sec-demonstrative-monster-teeth",
      text: "A prop maker carved wooden teeth for a friendly monster in a school play. These teeth ______ too wide during last week's fitting, so she trimmed each one before attaching them permanently to the monster's foam jaw.",
      subject: "These teeth", cue: "last week's fitting", tense: "past",
    },
    {
      scene: "sec-demonstrative-paper-geese",
      text: "For a display about migration, a class folded paper geese and suspended them from the ceiling. These geese ______ still on the floor during yesterday's classroom visit, so the visiting teacher helped the students hang them.",
      subject: "These geese", cue: "yesterday's classroom visit", tense: "past",
    },
    {
      scene: "sec-demonstrative-cart-wheels",
      text: "A repair club built a small cart to carry tools between worktables. These wheels ______ uneven during last Saturday's trial, so the club removed them and adjusted the axle before loading the cart for another test.",
      subject: "These wheels", cue: "last Saturday's trial", tense: "past",
    },
  ];

  const DEMONSTRATIVE_BE_FORMS = {
    singular: { present: "is", past: "was" },
    plural: { present: "are", past: "were" },
  };

  const demonstrativeAgreement = {
    id: "sec-demonstrative-agreement",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: "Form, Structure, and Sense",
    subskill: "subject-verb agreement",
    difficulty: "Easy",
    title: "Verb after a demonstrative and a nearby noun",
    recognize: "Read the demonstrative and noun immediately before the blank. This introduces a singular noun; these introduces a plural noun. Choose the form of be that matches that number and the explicit time words.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["context-constraint"],
    build(t) {
      const topic = t.pick(DEMONSTRATIVE_AGREEMENT_TOPICS);
      const number = topic.subject.startsWith("These ") ? "plural" : "singular";
      const rows = [];
      ["singular", "plural"].forEach((verbNumber) => ["present", "past"].forEach((tense) => {
        const form = DEMONSTRATIVE_BE_FORMS[verbNumber][tense];
        const errors = [];
        if (verbNumber !== number) errors.push("“" + form + "” is " + verbNumber + ", but the subject “" + topic.subject + "” is " + number);
        if (tense !== topic.tense) errors.push("“" + topic.cue + "” places this statement in the " + topic.tense + ", while “" + form + "” is " + tense + " tense");
        rows.push([form, { number: verbNumber, tense }, errors.length ? errors.join("; also, ") + "." : null]);
      }));
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "text", content: topic.text },
        stem: STEM,
        ...choices,
        explanation: "The subject “" + topic.subject + "” is " + number + ". The words “" + topic.cue + "” put the statement in the " + topic.tense + ", so the matching form of be is “" + choices.correct + ".”",
        steps: [
          "Read the subject immediately before the blank: “" + topic.subject + "” is " + number + ".",
          "Use the time cue “" + topic.cue + "” to select the " + topic.tense + " form: “" + choices.correct + ".”",
        ],
        principles: [
          "This introduces a singular noun, and these introduces a plural noun; the verb agrees with that noun.",
          "The forms of be are is and was for a singular subject, and are and were for a plural subject; the time frame determines present or past.",
        ],
        trap: "Choosing a verb that matches the subject's number while overlooking the explicit time cue, or using a singular verb for a plural subject.",
        hint: "Look at the pointing word and noun just before the blank, then locate the words that say when the statement applies.",
        estimatedSeconds: 50,
      };
      // This checks the local subject, time-cue classification, inflection,
      // and choice square. It does not independently certify prose meaning.
      instance.verify = () => {
        const local = topic.text.match(/\b(This|These) ([a-z]+) ______/);
        if (!local || local[0] !== topic.subject + " " + BLANK) return false;
        const derivedNumber = local[1] === "This" ? "singular" : "plural";
        const derivedTense = /^(at present|currently|right now)$/.test(topic.cue) ? "present"
          : /^(yesterday's|last night's|last week's|last Saturday's) /.test(topic.cue) ? "past" : null;
        const expected = derivedTense === "present" ? (derivedNumber === "singular" ? "is" : "are")
          : derivedTense === "past" ? (derivedNumber === "singular" ? "was" : "were") : null;
        return topic.text.split(BLANK).length === 2 && topic.text.includes(topic.cue) &&
          topic.text.length >= 150 && topic.text.length <= 900 && instance.correct === expected &&
          topic.tense === derivedTense && isSquare(instance.features);
      };
      return instance;
    },
  };

  const REFLEXIVE_NUMBER_TOPICS = [
    {
      scene: "sec-demo-robot-righting",
      text: "A demonstration robot was built to operate without assistance. Whenever it tipped sideways, the robot righted ______ automatically, then moved forward again as smoothly as before.",
      antecedent: "robot", subject: "the robot", verb: "righted",
    },
    {
      scene: "sec-pop-up-shelter-unfolding",
      text: "A pop-up shelter was compressed until it was almost flat. Once released, the shelter unfolded ______ completely in less than a minute, remaining upright without any help.",
      antecedent: "shelter", subject: "the shelter", verb: "unfolded",
    },
    {
      scene: "sec-restless-fox-scratching",
      text: "During an afternoon observation, a fox grew increasingly restless. The fox scratched ______ vigorously for several minutes, then relaxed and lay perfectly still until evening.",
      antecedent: "fox", subject: "the fox", verb: "scratched",
    },
    {
      scene: "sec-wet-ducks-preening",
      text: "After swimming, the ducks were thoroughly wet and unusually quiet. The ducks dried ______ by preening for several minutes, then settled down and remained motionless until dusk.",
      antecedent: "ducks", subject: "the ducks", verb: "dried",
    },
    {
      scene: "sec-demo-programs-updating",
      text: "The demonstration programs were designed to remain current without human intervention. Each evening, the programs updated ______ automatically and restarted before anyone arrived the next morning.",
      antecedent: "programs", subject: "the programs", verb: "updated",
    },
    {
      scene: "sec-weighted-figures-steadying",
      text: "The weighted toy figures rocked vigorously when nudged but never fell over. The figures steadied ______ within seconds, even when nudged again immediately afterward, and remained standing.",
      antecedent: "figures", subject: "the figures", verb: "steadied",
    },
    {
      scene: "sec-blue-vase-polishing",
      text: "A blue vase had become dull and difficult to display attractively. The curator said that she would polish ______ carefully until it shone again, working slowly to avoid scratching it.",
      antecedent: "vase", subject: "she", verb: "would polish",
    },
    {
      scene: "sec-velvet-cloak-shortening",
      text: "A velvet cloak was beautifully made but too long to wear comfortably. The costume designer said that she could shorten ______ easily, and she carefully trimmed and resewed it before trying it on again.",
      antecedent: "cloak", subject: "she", verb: "could shorten",
    },
    {
      scene: "sec-decorative-loaf-slicing",
      text: "A baker displayed a single decorative loaf that had cooled completely overnight. Before serving anyone, he sliced ______ slowly and carefully, pausing frequently to ensure that he was not pressing too hard.",
      antecedent: "loaf", subject: "he", verb: "sliced",
    },
    {
      scene: "sec-curled-stamps-flattening",
      text: "Several unused stamps were curled and sticky after becoming damp. An archivist decided to preserve all of the stamps, so she flattened ______ gently and left them undisturbed until they were dry again.",
      antecedent: "stamps", subject: "she", verb: "flattened",
    },
    {
      scene: "sec-crowded-seedlings-separating",
      text: "The seedlings were healthy but growing too close together. A gardener explained that she would separate ______ gently while they were still small, taking care to keep each one intact.",
      antecedent: "seedlings", subject: "she", verb: "would separate",
    },
    {
      scene: "sec-fogged-goggles-rinsing",
      text: "A swimmer found that her goggles were badly fogged and nearly impossible to see through. Before swimming any farther, she rinsed ______ thoroughly, then checked that she could see clearly again.",
      antecedent: "goggles", subject: "she", verb: "rinsed",
    },
  ];

  const REFLEXIVE_NUMBER_FORMS = {
    singular: { reflexive: "itself", ordinary: "it" },
    plural: { reflexive: "themselves", ordinary: "them" },
  };

  const reflexivePronounNumber = {
    id: "sec-reflexive-pronoun-number", sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: "Form, Structure, and Sense", subskill: "pronoun agreement", difficulty: "Easy",
    title: "Reflexive pronouns and number",
    recognize: "Identify the nearby noun receiving the action. Match its number and use a reflexive pronoun only when it refers to the subject performing that action.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule"],
    build(t) {
      const topic = t.pick(REFLEXIVE_NUMBER_TOPICS);
      const number = /s$/.test(topic.antecedent) ? "plural" : "singular";
      const reference = topic.subject === "the " + topic.antecedent ? "reflexive" : "ordinary";
      const relation = reference === "reflexive"
        ? "The subject and the object of this action refer to the same " + (number === "singular" ? "thing or animal" : "things or animals") + ", so a reflexive pronoun is required."
        : "The subject “" + topic.subject + "” names the person performing the action; the object refers to “" + topic.antecedent + ",” so an ordinary object pronoun is required.";
      const rows = [];
      ["singular", "plural"].forEach((n) => ["reflexive", "ordinary"].forEach((r) => {
        const errors = [];
        if (n !== number) errors.push("“" + topic.antecedent + "” is " + number + ", but this pronoun is " + n);
        if (r !== reference) errors.push(reference === "reflexive"
          ? "an ordinary object pronoun cannot refer back to the subject performing this same action"
          : "a reflexive form requires its object to refer back to its own subject, but “" + topic.antecedent + "” and “" + topic.subject + "” are different referents");
        rows.push([REFLEXIVE_NUMBER_FORMS[n][r], { number: n, reference: r }, errors.length ? errors.join("; also, ") + "." : null]);
      }));
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice", scene: topic.scene,
        stimulus: { type: "text", content: topic.text }, stem: STEM,
        ...choices,
        explanation: "The pronoun refers to “" + topic.antecedent + ",” which is " + number + ". " + relation + " The correct form is “" + choices.correct + ".”",
        steps: [
          "Find the noun receiving the action: “" + topic.antecedent + "” is " + number + ".",
          relation + " Choose “" + choices.correct + ".”",
        ],
        principles: [
          "A pronoun must agree in number with its antecedent.",
          "When a verb's subject and direct object refer to the same entity, use a reflexive pronoun; otherwise, use the appropriate ordinary object pronoun.",
        ],
        trap: "Matching the noun's number but confusing an ordinary object pronoun with a reflexive pronoun.",
        hint: "Who or what performs the action, and who or what receives it? Are they the same?",
        estimatedSeconds: 45,
      };
      // Checks the encoded local clause and pronoun grid, not the prose's
      // semantic exclusion of other referents; that requires editorial review.
      instance.verify = () => {
        const lead = topic.text.split(BLANK)[0].toLowerCase();
        const form = String(instance.correct);
        const derivedNumber = form === "it" || form === "itself" ? "singular" : "plural";
        const derivedReference = /self$|selves$/.test(form) ? "reflexive" : "ordinary";
        return topic.text.split(BLANK).length === 2 &&
          topic.text.length >= 150 && topic.text.length <= 900 &&
          lead.includes(topic.antecedent) &&
          lead.endsWith(topic.subject + " " + topic.verb + " ") &&
          derivedNumber === number && derivedReference === reference &&
          new Set([instance.correct, ...instance.wrong.map((entry) => entry[0])]).size === 4 &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  // Shared role nouns do not by themselves establish how many referents
  // the subject has. Authored context fixes identity and the target time.
  const SVA_SHARED_ROLES_TOPICS = [
    {
      scene: "sec-shared-roles-radio-credits",
      text: "The radio serial credits its writer as L. Vale, although its cast list names the narrator Lina Voss. A recently opened contract identifies L. Vale as Voss's pen name; the studio still follows that contract for its weekly broadcasts. Under the continuing arrangement, the writer and narrator ______ responsible for approving changes to the closing speech.",
      subject: "the writer and narrator", roleRefs: ["Lina Voss", "Lina Voss"], tense: "present",
      identityCues: ["its writer as L. Vale", "the narrator Lina Voss", "L. Vale as Voss's pen name"],
      timeCue: "the studio still follows that contract",
      identityWhy: "L. Vale is Lina Voss's pen name, so the writing credit and the narration credit identify the same person.",
      timeWhy: "The studio still follows the contract, and the target describes responsibility under that continuing arrangement.",
    },
    {
      scene: "sec-shared-roles-lighthouse-roster",
      text: "When the Beacon Reach lighthouse became a museum, its charter assigned curation of the displays to whoever held the resident keeper's post. Nara Dol currently holds that appointment. The museum's separate maintenance register also names Dol as caretaker. Under the charter, which remains in force, the curator and caretaker ______ entitled to occupy the cottage beside the tower.",
      subject: "the curator and caretaker", roleRefs: ["Nara Dol", "Nara Dol"], tense: "present",
      identityCues: ["assigned curation of the displays to whoever held the resident keeper's post", "Nara Dol currently holds that appointment", "names Dol as caretaker"],
      timeCue: "which remains in force",
      identityWhy: "The keeper's appointment carries the curator's role; Dol holds that appointment and is also the named caretaker.",
      timeWhy: "Although the charter was written when the museum opened, it remains in force and determines the current entitlement.",
    },
    {
      scene: "sec-shared-roles-book-imprints",
      text: "Old shipping records list Cedar Lamp Press and Rook Route Distribution as independent businesses. After a merger, Rook Route ceased to exist as a company; Cedar Lamp retained that name as a label for its own distribution work. The current edition still prints the old names in its publication and delivery credits. The publisher and distributor ______ now registered at Cedar Lamp's new address.",
      subject: "The publisher and distributor", roleRefs: ["Cedar Lamp Press", "Cedar Lamp Press"], tense: "present",
      identityCues: ["Rook Route ceased to exist as a company", "Cedar Lamp retained that name as a label for its own distribution work", "its publication and delivery credits"],
      timeCue: "The current edition",
      identityWhy: "The old distribution company no longer exists; Cedar Lamp now performs the distribution work under the retained label as well as publishing the books.",
      timeWhy: "The target concerns the current edition and explicitly places the registration at the new address in the present with 'now'.",
    },
    {
      scene: "sec-shared-roles-dance-replacement",
      text: "The archive now displays the program for the 1978 premiere of Glass Harbor. Inez Tal had choreographed the work, but its scheduled soloist withdrew during the final rehearsal. A stage manager's report records that Tal performed the vacant solo at the premiere while the printed cast list went uncorrected. During that performance, the choreographer and soloist ______ visible onstage throughout the final movement.",
      subject: "the choreographer and soloist", roleRefs: ["Inez Tal", "Inez Tal"], tense: "past",
      identityCues: ["Inez Tal had choreographed the work", "its scheduled soloist withdrew", "Tal performed the vacant solo at the premiere"],
      timeCue: "During that performance",
      identityWhy: "Tal choreographed the work and replaced the withdrawn soloist for the premiere, so the target roles both refer to Tal.",
      timeWhy: "The archive displays the program now, but the target describes the completed 1978 performance.",
    },
    {
      scene: "sec-shared-roles-pavilion-gift",
      text: "A museum's new catalog describes the pavilion that architect Sela Marr built on her own land in 1946. Marr retained the property until she gave it to the town in 1962; the town commissioned no changes to her design. The dedication record concerns the transfer ceremony, not the later museum opening. At that ceremony, the architect and donor ______ seated beside the mayor beneath the pavilion's roof.",
      subject: "the architect and donor", roleRefs: ["Sela Marr", "Sela Marr"], tense: "past",
      identityCues: ["architect Sela Marr built", "Marr retained the property until she gave it to the town in 1962"],
      timeCue: "At that ceremony",
      identityWhy: "Marr designed the pavilion and subsequently gave the property to the town, making Marr both its architect and its donor.",
      timeWhy: "The catalog is new, but the seating described belongs to the completed transfer ceremony in 1962.",
    },
    {
      scene: "sec-shared-roles-cave-survey",
      text: "The current exhibition includes images from a cave survey completed in 1953. The expedition assigned scientific observations to naturalist Enid Sorn and photography to an assistant. Before the party entered the caves, the assistant left because of illness, and Sorn took over the camera work without handing off the observations. Inside the caves, the naturalist and photographer ______ working from the narrow ledge above the stream.",
      subject: "the naturalist and photographer", roleRefs: ["Enid Sorn", "Enid Sorn"], tense: "past",
      identityCues: ["scientific observations to naturalist Enid Sorn", "the assistant left because of illness", "Sorn took over the camera work without handing off the observations"],
      timeCue: "a cave survey completed in 1953",
      identityWhy: "Sorn continued the naturalist's observations after taking over photography from the departing assistant, so the cave work involved Sorn in both roles.",
      timeWhy: "The exhibition exists in the present, but the work inside the caves occurred during the completed 1953 survey.",
    },
    {
      scene: "sec-shared-roles-garden-tours",
      text: "Esme Pell designed Lantern House's tactile garden and continues to revise its paths. During the trial opening, Pell also led the tours. Under the permanent program, that assignment passed to Oren Mael, who still leads visitors through the garden while Pell works on its design. The designer and guide ______ required to attend the accessibility committee's monthly meetings under the current program.",
      subject: "The designer and guide", roleRefs: ["Esme Pell", "Oren Mael"], tense: "present",
      identityCues: ["Esme Pell designed", "that assignment passed to Oren Mael", "while Pell works on its design"],
      timeCue: "under the current program",
      identityWhy: "Pell remains the designer, but Mael now leads the tours; Pell's earlier service as guide does not describe the current division of duties.",
      timeWhy: "The target states a requirement of the current permanent program, rather than the earlier trial opening.",
    },
    {
      scene: "sec-shared-roles-festival-sisters",
      text: "The Bell Orchard festival's early programs credit Mara Sen with composing its ceremonial music and directing the musicians. Mara still revises the score, but she no longer appears at the podium. Her sister Elin has assumed the conducting appointment and leads every performance this season. The composer and conductor ______ consulted whenever the festival committee proposes a change to the ceremony.",
      subject: "The composer and conductor", roleRefs: ["Mara Sen", "Elin Sen"], tense: "present",
      identityCues: ["Mara Sen with composing", "Mara still revises the score", "Her sister Elin has assumed the conducting appointment"],
      timeCue: "every performance this season",
      identityWhy: "Mara continues the composer's work, whereas her sister Elin now holds the conducting appointment; the early programs describe a superseded arrangement.",
      timeWhy: "The consultation procedure belongs to the current season established by 'still' and 'this season'.",
    },
    {
      scene: "sec-shared-roles-gallery-loan",
      text: "The Larkspur gallery's exhibition catalog identifies its curator as O. Brell. A conservation report on the displayed screens is signed Olwen Brell, a name visitors sometimes assume expands that initial. The staff directory instead identifies the curator as Olwen's brother Orin and lists Olwen as the screens' restorer. The curator and restorer ______ available for questions at the gallery's current weekly discussion sessions.",
      subject: "The curator and restorer", roleRefs: ["Orin Brell", "Olwen Brell"], tense: "present",
      identityCues: ["its curator as O. Brell", "the curator as Olwen's brother Orin", "lists Olwen as the screens' restorer"],
      timeCue: "current weekly discussion sessions",
      identityWhy: "The directory resolves the initial as Orin, Olwen's brother, so the curator and the restorer are different people despite the similar credits.",
      timeWhy: "The target describes availability at the gallery's current discussion sessions.",
    },
    {
      scene: "sec-shared-roles-society-election",
      text: "The Fenwick survey society's website now reproduces its minutes from 1911. Before that year's election, Ada Lorn kept the accounts and recorded the minutes. The election retained Lorn as treasurer but transferred the secretary's duties to Silas Wren. At the first meeting after the election, the treasurer and secretary ______ seated near the door so that late arrivals could submit dues and correct the attendance record.",
      subject: "the treasurer and secretary", roleRefs: ["Ada Lorn", "Silas Wren"], tense: "past",
      identityCues: ["Ada Lorn kept the accounts and recorded the minutes", "retained Lorn as treasurer", "transferred the secretary's duties to Silas Wren"],
      timeCue: "At the first meeting after the election",
      identityWhy: "After the election Lorn remained treasurer, but Wren became secretary; the target concerns the meeting after those duties were separated.",
      timeWhy: "The website is current, but the seating arrangement belongs to the society's first meeting after the 1911 election.",
    },
    {
      scene: "sec-shared-roles-novel-correspondence",
      text: "The newly digitized letters about the 1932 edition of The Salt Window use the surname Dehn without initials. The publisher's ledger identifies the editor as Petra Dehn; a surviving translation contract names Petra's husband, Levan, as translator. During the edition's preparation, the editor and translator ______ corresponding regularly with the publisher about passages that would need explanatory notes.",
      subject: "the editor and translator", roleRefs: ["Petra Dehn", "Levan Dehn"], tense: "past",
      identityCues: ["the editor as Petra Dehn", "Petra's husband, Levan, as translator"],
      timeCue: "During the edition's preparation",
      identityWhy: "The ledger and contract assign editing to Petra and translation to Petra's husband Levan; the shared surname in the letters does not identify a shared officeholder.",
      timeWhy: "Digitization is recent, but the correspondence occurred while the 1932 edition was being prepared.",
    },
    {
      scene: "sec-shared-roles-rowing-trip",
      text: "A display about the Reedmere rowing club includes the travel log for its 1984 championship trip. Coach Tavin Moss usually drove the club's bus, but a broken wrist kept Moss from driving that week. The club hired bus driver Noa Kett for the trip, while Moss continued to coach the crew. At the championship venue, the coach and driver ______ waiting beside the boathouse when the equipment truck arrived.",
      subject: "the coach and driver", roleRefs: ["Tavin Moss", "Noa Kett"], tense: "past",
      identityCues: ["Coach Tavin Moss usually drove", "hired bus driver Noa Kett for the trip", "Moss continued to coach the crew"],
      timeCue: "its 1984 championship trip",
      identityWhy: "Moss remained coach but Kett drove for this trip; Moss's usual driving duties do not determine who was driver at the championship.",
      timeWhy: "The display is available now, but the waiting occurred during the completed 1984 trip.",
    },
  ];

  const svaSharedRoles = {
    id: "sec-sva-shared-roles", sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: "Form, Structure, and Sense", subskill: "subject-verb agreement", difficulty: "Hard",
    title: "Agreement when coordinated roles share a referent",
    recognize: "Trace each role to the person or business holding it at the relevant time. Coordinated role nouns can identify the same referent or different referents; then choose a verb in the target assertion's time frame.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["context-constraint", "grammatical-but-illogical", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(SVA_SHARED_ROLES_TOPICS);
      const number = new Set(topic.roleRefs).size === 1 ? "singular" : "plural";
      const forms = { singular: { present: "is", past: "was" }, plural: { present: "are", past: "were" } };
      const rows = [];
      ["singular", "plural"].forEach((candidateNumber) => ["present", "past"].forEach((tense) => {
        const errors = [];
        if (candidateNumber !== number) errors.push("the " + candidateNumber + " verb treats the role labels as naming " + (candidateNumber === "singular" ? "the same referent" : "different referents") + "; " + topic.identityWhy);
        if (tense !== topic.tense) errors.push("the " + tense + " tense does not fit the target event or arrangement; " + topic.timeWhy);
        rows.push([forms[candidateNumber][tense], { number: candidateNumber, tense }, errors.length ? "This choice fails because " + errors.join(" Also, ") : null]);
      }));
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice", scene: topic.scene,
        stimulus: { type: "text", content: topic.text }, stem: STEM,
        ...choices,
        explanation: topic.identityWhy + " Thus, “" + topic.subject + "” takes a " + number + " verb. " + topic.timeWhy + " The required form is “" + choices.correct + ".”",
        steps: [
          "Identify who or what holds each role at the time described, distinguishing current assignments from older ones and full identities from labels.",
          topic.identityWhy + " Choose " + number + " agreement.",
          topic.timeWhy + " Choose “" + choices.correct + ".”",
        ],
        principles: [
          "When coordinated role nouns identify the same person or entity, they take a singular verb; when they identify different people or entities, they take a plural verb.",
          "A shared determiner does not by itself prove that coordinated role nouns identify the same referent; the context must establish their identities.",
          "The verb's tense follows the time of its own assertion, which may differ from the time at which a record is being displayed or discussed.",
        ],
        trap: "Counting role labels as separate people automatically, assuming that a shared determiner guarantees a shared person, or using an earlier staffing arrangement to interpret a later one.",
        hint: "Trace the role labels back through the passage. Do the names, appointments, and dates describe the same arrangement throughout?",
        estimatedSeconds: 90,
      };
      // This checks the encoded referent identities, exact cue presence,
      // morphology, and square. It does not prove prose meaning or difficulty.
      instance.verify = () => {
        const offered = [instance.correct, ...instance.wrong.map(([text]) => text)];
        const expected = topic.roleRefs[0] === topic.roleRefs[1]
          ? (topic.tense === "present" ? "is" : "was")
          : (topic.tense === "present" ? "are" : "were");
        return topic.text.split(BLANK).length === 2 && topic.text.length >= 150 && topic.text.length <= 900 &&
          topic.roleRefs.length === 2 && topic.roleRefs.every((ref) => typeof ref === "string" && ref.length > 0) &&
          ["present", "past"].includes(topic.tense) && topic.text.includes(topic.subject) &&
          topic.subject.includes(" and ") && topic.identityCues.every((cue) => topic.text.includes(cue)) &&
          topic.text.includes(topic.timeCue) && instance.correct === expected &&
          new Set(offered).size === 4 && offered.every((form) => ["is", "are", "was", "were"].includes(form)) &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  /* -------------------------- two events at a reconstructed past moment */

  // These are bounded, one-time activities, not habits. Each passage gives
  // separate evidence for whether each activity was complete at the shared
  // reference event. Aspect varies independently in the two finite clauses;
  // tense, voice, agreement, wording, and punctuation remain fixed.
  const RELATIVE_EVENT_TIME_TOPICS = [
    {
      scene: "sec-relative-cargo-surge",
      text: "All the supply crates reached the island before sunset, but the cargo log describes an earlier surge. A photograph taken during that surge shows the last support rope in a tight knot, with its rigger away from the railing; porters hold other crates between the vessel and the dock while several remain on deck. At the moment captured in the photograph, the rigger ______.",
      first: { perfect: "had fastened the last support rope", progressive: "was fastening the last support rope", needed: "perfect", evidence: "the last support rope in a tight knot, with its rigger away from the railing", why: "The final rope is already knotted and its rigger has moved away, so fastening that rope precedes the photograph." },
      second: { subject: "the porters", perfect: "had carried all the crates ashore", progressive: "were carrying all the crates ashore", needed: "progressive", evidence: "porters hold other crates between the vessel and the dock while several remain on deck", why: "The porters are still transferring the load; crates remain aboard at the photographed moment, although all arrive before sunset." },
      reference: "the moment captured in the photograph",
    },
    {
      scene: "sec-relative-pottery-tour",
      text: "The visitors eventually admired a blue ring around the entire rim of a vase. Their guide's sketch of their arrival shows a different stage: every kiln tray rests on the unloading cart, which the potter has rolled away from the kiln, and the decorator's brush touches the point where the blue arc meets bare clay. When the visitors first entered, the potter ______.",
      first: { perfect: "had unloaded all the kiln trays", progressive: "was unloading all the kiln trays", needed: "perfect", evidence: "every kiln tray rests on the unloading cart, which the potter has rolled away from the kiln", why: "All the trays are out and their cart is away from the kiln, placing unloading before the visitors' arrival." },
      second: { subject: "the decorator", perfect: "had painted the ring around the rim", progressive: "was painting the ring around the rim", needed: "progressive", evidence: "the decorator's brush touches the point where the blue arc meets bare clay", why: "The brush is extending a partial arc when the visitors arrive; the complete ring belongs to their later visit." },
      reference: "When the visitors first entered",
    },
    {
      scene: "sec-relative-archive-upload",
      text: "An archive's final catalog lists every recording with a searchable description. To reconstruct the supervisor's visit earlier that day, an archivist checks a screen capture: all the audio files appear in the server's verified download folder, but the final description contains only its opening phrase, and the cataloger is typing its next word. During the visit, the transfer technician ______.",
      first: { perfect: "had uploaded the entire audio collection", progressive: "was uploading the entire audio collection", needed: "perfect", evidence: "all the audio files appear in the server's verified download folder", why: "Every file is already available in the verified folder, so uploading the collection precedes the visit." },
      second: { subject: "the cataloger", perfect: "had entered the final description", progressive: "was entering the final description", needed: "progressive", evidence: "the final description contains only its opening phrase, and the cataloger is typing its next word", why: "The cataloger is adding words to a description containing only its opening phrase at the visit; the final catalog reflects a later stage." },
      reference: "During the visit",
    },
    {
      scene: "sec-relative-costume-rehearsal",
      text: "A theater's program credits both the wardrobe team and the lighting crew with preparing the opening rehearsal. The stage manager's notes place the final lighting test before the cast assembled. In a photograph taken as the cast assembled, however, a tailor draws a needle through a sleeve whose lower seam still gapes open; the closed seam appears only in a later photograph. As the cast assembled, the tailor ______.",
      first: { perfect: "had stitched the final sleeve seam", progressive: "was stitching the final sleeve seam", needed: "progressive", evidence: "a tailor draws a needle through a sleeve whose lower seam still gapes open", why: "The tailor is working on the still-open seam as the cast assembles; the later closed seam cannot be moved back to that moment." },
      second: { subject: "the lighting technicians", perfect: "had tested the final lighting cue", progressive: "were testing the final lighting cue", needed: "perfect", evidence: "The stage manager's notes place the final lighting test before the cast assembled", why: "The notes locate the final lighting test before the cast's assembly, although the program credits both teams together." },
      reference: "As the cast assembled",
    },
    {
      scene: "sec-relative-canal-model",
      text: "A school newsletter shows a canal model with its water tank empty and a green stripe around the whole base. The demonstration occurred earlier: in the teacher's video, the drain hose is coiled beside a dry tank while an artist moves a brush along the base, leaving a short stretch of bare wood ahead of it. At the start of that demonstration, the artist ______.",
      first: { perfect: "had painted the entire stripe", progressive: "was painting the entire stripe", needed: "progressive", evidence: "an artist moves a brush along the base, leaving a short stretch of bare wood ahead of it", why: "The stripe is being extended across bare wood at the demonstration, whereas the newsletter shows the later complete stripe." },
      second: { subject: "the students", perfect: "had drained the model's water tank", progressive: "were draining the model's water tank", needed: "perfect", evidence: "the drain hose is coiled beside a dry tank", why: "The tank is dry and the hose put aside, so draining the tank precedes the filmed demonstration." },
      reference: "At the start of that demonstration",
    },
    {
      scene: "sec-relative-bakery-collection",
      text: "Every pastry order was boxed for the morning deliveries. A customer's receipt, however, records a collection midway through that preparation. At collection, the bakery's sole printer sat unplugged beside a stack containing every delivery label, while the assistant lowered pastries into the last box, which still had several empty compartments. The labels were printed only once. When the customer collected the order, the assistant ______.",
      first: { perfect: "had filled the last pastry box", progressive: "was filling the last pastry box", needed: "progressive", evidence: "the assistant lowered pastries into the last box, which still had several empty compartments", why: "The assistant is placing pastries into a box that still has empty compartments at collection; the fully boxed orders belong to the later account." },
      second: { subject: "the printer", perfect: "had produced all the delivery labels", progressive: "was producing all the delivery labels", needed: "perfect", evidence: "the bakery's sole printer sat unplugged beside a stack containing every delivery label", why: "Every label is already printed and the only printer is unplugged, so label production precedes collection." },
      reference: "When the customer collected the order",
    },
    {
      scene: "sec-relative-rescue-signal",
      text: "The search team eventually sent a complete route map and a recorded explanation to its base. Those final files do not show the team's progress when a helicopter first appeared. At that instant, a pencil was tracing the remaining gap in the route, and the recorder captured the helicopter's sound halfway through the medic's explanation, followed by the rest of her words. When the helicopter appeared, the navigator ______.",
      first: { perfect: "had drawn the entire route", progressive: "was drawing the entire route", needed: "progressive", evidence: "a pencil was tracing the remaining gap in the route", why: "The navigator is tracing a remaining gap at the helicopter's appearance, so the complete map belongs to a later moment." },
      second: { subject: "the medic", perfect: "had recorded the complete explanation", progressive: "was recording the complete explanation", needed: "progressive", evidence: "the recorder captured the helicopter's sound halfway through the medic's explanation, followed by the rest of her words", why: "The explanation straddles the helicopter's arrival: part is recorded before that sound and part afterward." },
      reference: "When the helicopter appeared",
    },
    {
      scene: "sec-relative-excavation-inspection",
      text: "An excavation report includes a surveyed grid and a number for every shard from one tray. The inspector's earlier photograph contains the clues to their timing: the surveyor sights along the last grid line while its far marker is still moving, and the registrar writes on a shard beside several unnumbered shards from that tray. Those markers and labels were assigned only once. At the inspection, the surveyor ______.",
      first: { perfect: "had fixed the final grid line", progressive: "was fixing the final grid line", needed: "progressive", evidence: "the surveyor sights along the last grid line while its far marker is still moving", why: "The final line is still being established while its far marker moves; the completed survey in the report is later." },
      second: { subject: "the registrar", perfect: "had numbered all the tray's shards", progressive: "was numbering all the tray's shards", needed: "progressive", evidence: "the registrar writes on a shard beside several unnumbered shards from that tray", why: "The registrar is applying numbers and several shards remain unnumbered, so numbering the whole tray is not yet complete." },
      reference: "At the inspection",
    },
    {
      scene: "sec-relative-poetry-proof",
      text: "A poetry cooperative's exhibit contains the revised final stanza and a bound copy of the collection. The editor's audio diary recalls an earlier visit: the translator was dictating replacements for the stanza's last two lines, while the binder folded a sheet beside the collection's remaining flat sheets. The diary then records the approved lines and the final fold after the editor left. During that visit, the translator ______.",
      first: { perfect: "had revised the final stanza", progressive: "was revising the final stanza", needed: "progressive", evidence: "the translator was dictating replacements for the stanza's last two lines", why: "The translator is still supplying replacement lines during the visit; their approval comes after the editor leaves." },
      second: { subject: "the binder", perfect: "had folded every sheet for the collection", progressive: "was folding every sheet for the collection", needed: "progressive", evidence: "the binder folded a sheet beside the collection's remaining flat sheets", why: "The binder is folding sheets during the visit, with flat sheets remaining and the final fold recorded afterward." },
      reference: "During that visit",
    },
    {
      scene: "sec-relative-ferry-bell",
      text: "A ferry's log lists passenger boarding and fueling under its departure entry, which could suggest that both occurred as the ferry left. A harbor photograph taken when the departure bell sounded shows an empty waiting pen behind a locked boarding gate, every ticket holder on deck, and the fuel hose disconnected beside the full tank. When that bell sounded, the passengers ______.",
      first: { perfect: "had boarded the ferry", progressive: "were boarding the ferry", needed: "perfect", evidence: "an empty waiting pen behind a locked boarding gate, every ticket holder on deck", why: "Every ticket holder is aboard and the gate is locked when the bell sounds, placing boarding before that reference event." },
      second: { subject: "the mechanic", perfect: "had filled the fuel tank", progressive: "was filling the fuel tank", needed: "perfect", evidence: "the fuel hose disconnected beside the full tank", why: "The tank is full and its hose disconnected at the bell, so the mechanic's filling is already complete." },
      reference: "When that bell sounded",
    },
    {
      scene: "sec-relative-observatory-shutter",
      text: "An observatory's activity chart groups mirror polishing and file backup with the evening's first observation. A technician's notebook clarifies the sequence: when the roof shutter opened, the polishers were in their cases and the mirror lay under a fresh protective cover; the backup display showed every file verified and the external drive safely ejected. At the opening of the shutter, the technician ______.",
      first: { perfect: "had polished the telescope's mirror", progressive: "was polishing the telescope's mirror", needed: "perfect", evidence: "the polishers were in their cases and the mirror lay under a fresh protective cover", why: "The polishing tools are put away and the protected mirror is no longer being worked on when the shutter opens." },
      second: { subject: "the computer", perfect: "had copied the complete observation archive", progressive: "was copying the complete observation archive", needed: "perfect", evidence: "the backup display showed every file verified and the external drive safely ejected", why: "Every copied file is verified and the drive ejected before observation, so the copy operation has already ended." },
      reference: "At the opening of the shutter",
    },
    {
      scene: "sec-relative-weaving-loom",
      text: "A weaving cooperative describes dyeing and bobbin winding as parts of one loom demonstration. The demonstration's first frame can clarify that description: the whole batch of colored yarn hangs dry above an empty dye bath, and every bobbin needed for the pattern sits full in a rack beside an idle winding wheel. Neither task was repeated during the demonstration. When the demonstrator first started the loom, the dyer ______.",
      first: { perfect: "had dyed the entire batch of yarn", progressive: "was dyeing the entire batch of yarn", needed: "perfect", evidence: "the whole batch of colored yarn hangs dry above an empty dye bath", why: "The entire batch is colored and dry, and the bath is empty, placing dyeing before the loom starts." },
      second: { subject: "the assistant", perfect: "had wound every bobbin for the pattern", progressive: "was winding every bobbin for the pattern", needed: "perfect", evidence: "every bobbin needed for the pattern sits full in a rack beside an idle winding wheel", why: "All needed bobbins are full and the winding wheel idle at the loom's start, so winding precedes that moment." },
      reference: "When the demonstrator first started the loom",
    },
  ];

  const relativeEventTime = {
    id: "sec-relative-event-time",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: "Form, Structure, and Sense",
    subskill: "verb form",
    difficulty: "Hard",
    title: "Reconstructing two events at a past reference point",
    recognize: "Distinguish a later summary from the evidence at a particular past moment, then decide independently whether each bounded activity preceded or overlapped that moment.",
    rubric: { steps: 2, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["grammatical-but-illogical", "neighbouring-rule"],
    build(t) {
      const topic = t.pick(RELATIVE_EVENT_TIME_TOPICS);
      const aspects = ["perfect", "progressive"];
      const rows = [];
      aspects.forEach((firstAspect) => aspects.forEach((secondAspect) => {
        const text = `${topic.first[firstAspect]}, and ${topic.second.subject} ${topic.second[secondAspect]}`;
        const errors = [];
        if (firstAspect !== topic.first.needed) errors.push(`${firstAspect === "perfect" ? "The past perfect wrongly presents the first bounded activity as already complete" : "The past progressive wrongly presents the first bounded activity as still under way"}. ${topic.first.why}`);
        if (secondAspect !== topic.second.needed) errors.push(`${secondAspect === "perfect" ? "The past perfect wrongly presents the second bounded activity as already complete" : "The past progressive wrongly presents the second bounded activity as still under way"}. ${topic.second.why}`);
        rows.push([text, { firstEventAspect: firstAspect, secondEventAspect: secondAspect }, errors.length ? errors.join(" ") : null]);
      }));
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "text", content: topic.text },
        stem: STEM,
        ...choices,
        explanation: `Both clauses must describe the situation at the reference event (“${topic.reference}”), rather than merely copy the time perspective of the general account. ${topic.first.why} ${topic.second.why} Therefore, the completion is “${choices.correct}.”`,
        steps: [
          `Locate the reference event in the final sentence: “${topic.reference}.”`,
          `Use the evidence for the first activity: “${topic.first.evidence}.” ${topic.first.why}`,
          `Independently use the evidence for the second activity: “${topic.second.evidence}.” ${topic.second.why}`,
          "Use the past perfect for a bounded action completed before the reference event and the past progressive for one under way at that event.",
          `Preserve both temporal relationships: “${choices.correct}.”`,
        ],
        principles: [
          "Past perfect can locate a completed, bounded action before another past event; past progressive places an activity in progress at a past reference point.",
          "Coordinated clauses share a sentence but need not share an aspect: each verb must express its own action's relationship to the reference event.",
        ],
        trap: "Treating a later summary as a snapshot of the earlier moment, or making both coordinated verbs use the same aspect without checking each activity's evidence.",
        hint: "For each activity, what do the records show at the exact moment named in the final sentence?",
        estimatedSeconds: 90,
      };
      instance.verify = () => {
        const offered = [instance.correct, ...instance.wrong.map(([text]) => text)];
        // These checks protect the authored structures and evidence links.
        // They do not independently prove the passage's temporal meaning.
        return topic.text.split(BLANK).length === 2 && topic.text.length >= 150 && topic.text.length <= 900 &&
          topic.text.includes(topic.reference) && [topic.first, topic.second].every((event) =>
            topic.text.includes(event.evidence) && aspects.includes(event.needed) &&
            /^had\s/.test(event.perfect) && /^(was|were)\s/.test(event.progressive)) &&
          offered.length === 4 && new Set(offered).size === 4 &&
          instance.correct === `${topic.first[topic.first.needed]}, and ${topic.second.subject} ${topic.second[topic.second.needed]}` &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  // These scenes distinguish a modifier's implicit agent/patient from the
  // person identified by the main predicate. Every choice is a complete,
  // grammatical sentence after insertion; two modifier-subject pairings
  // describe real but different events in the account.
  const MODIFIER_IMPLIED_AGENT_TOPICS = [
    {
      scene: "sec-modifier-candidate-followup",
      text: "Mara Keene wrote the committee's interview questions, which Lina Sorel put to the finalist. The questioning then changed direction: the finalist asked Keene about the committee's selection process, while Sorel listened. ______ expanded the question list she had originally written to address a concern the finalist had raised.",
      people: ["Mara Keene", "Lina Sorel"],
      participle: "questioned", object: "the finalist", mainSubject: 0,
      agentSubject: 1,
      roleWhy: "Sorel questioned the finalist; the finalist, in turn, questioned Keene about the selection process.",
      mainWhy: "Keene wrote the committee's question list, so she is the person who can expand the list she originally wrote.",
      cue: "Mara Keene wrote the committee's interview questions",
    },
    {
      scene: "sec-modifier-boatwork-instruction",
      text: "Nora Dace taught the boatyard apprentices how to cut a sail. Iris Vale had brought a navigation notebook but knew little about knots, so the apprentices showed Vale the knots they used at sea. Their written account called both sessions lessons. ______ added the apprentices' knot diagrams to the navigation notebook she had brought aboard.",
      people: ["Nora Dace", "Iris Vale"],
      participle: "instructed", object: "the apprentices", mainSubject: 1,
      agentSubject: 0,
      roleWhy: "Dace instructed the apprentices in sail cutting; they instructed Vale in knot tying.",
      mainWhy: "Vale brought the navigation notebook and received the knot lesson, so the final action belongs to her.",
      cue: "Iris Vale had brought a navigation notebook",
    },
    {
      scene: "sec-modifier-witness-deposition",
      text: "Tessa Venn's report describes two meetings with an archivist. At the first, Cora Ames asked the archivist about a missing ledger for an oral-history transcript Ames was compiling. At the second, the archivist asked Venn to explain a signature. ______ appended the archivist's answers to the oral-history transcript she was compiling.",
      people: ["Cora Ames", "Tessa Venn"],
      participle: "interviewed", object: "the archivist", mainSubject: 0,
      agentSubject: 0,
      roleWhy: "Ames elicited answers from the archivist, whereas Venn supplied answers to the archivist.",
      mainWhy: "The report belongs to Venn, but the oral-history transcript belongs to Ames; the final clause concerns that transcript.",
      cue: "an oral-history transcript Ames was compiling",
    },
    {
      scene: "sec-modifier-costume-sitting",
      text: "Elin Ward modeled a cloak while a costume designer checked its fit. Later, the designer tried on a safety harness cut from Nadia Pell's pattern, and Pell adjusted the straps around the designer. Ward's notes describe both fittings without naming who did the adjusting. ______ revised the safety-harness pattern she had drafted.",
      people: ["Elin Ward", "Nadia Pell"],
      participle: "fitted", object: "the costume designer", mainSubject: 1,
      agentSubject: 1,
      roleWhy: "The designer fitted Ward with a cloak; Pell fitted the designer with a harness.",
      mainWhy: "The harness pattern is Pell's, while Ward supplied the notes and modeled the cloak.",
      cue: "a safety harness cut from Nadia Pell's pattern",
    },
    {
      scene: "sec-modifier-screening-advice",
      text: "Dara Linn helped the film students choose outdoor locations. Their report credits Linn as an adviser but also records advice traveling the other way: the students warned Vera Moss that the captions Moss had prepared would disappear against a pale background. ______ withdrew the caption file she had submitted and prepared a darker version.",
      people: ["Vera Moss", "Dara Linn"],
      participle: "advised", object: "the film students", mainSubject: 0,
      agentSubject: 1,
      roleWhy: "Linn advised the film students about locations; the students advised Moss about captions.",
      mainWhy: "Moss prepared and submitted the captions, so withdrawing her own caption file describes Moss.",
      cue: "the captions Moss had prepared",
    },
    {
      scene: "sec-modifier-choir-critiques",
      text: "Ada Rowan wrote the festival review, including an assessment of a visiting singer's performance. The review also quotes the singer's criticism of a solo composed by Mila Stone. Stone had performed that solo herself. ______ revised the solo she had both composed and performed, preserving its melody while simplifying the accompaniment.",
      people: ["Ada Rowan", "Mila Stone"],
      participle: "critiqued", object: "the visiting singer", mainSubject: 1,
      agentSubject: 0,
      roleWhy: "Rowan critiqued the visiting singer; the singer critiqued Stone's work.",
      mainWhy: "Rowan wrote the review, but Stone composed and performed the solo named in the final clause.",
      cue: "a solo composed by Mila Stone",
    },
    {
      scene: "sec-modifier-exhibit-photography",
      text: "A sculptor invited Leah Finch and Rosa Crane to exchange studio portraits. Finch took a series of the sculptor at work; the sculptor then turned the camera on Crane, who posed beside her own tools. Crane organized the resulting exhibition. ______ wrote captions for the portrait series she had taken of the sculptor at work.",
      people: ["Leah Finch", "Rosa Crane"],
      participle: "photographed", object: "the sculptor", mainSubject: 0,
      agentSubject: 0,
      roleWhy: "Finch photographed the sculptor, while Crane was photographed by the sculptor.",
      mainWhy: "Crane organized the exhibition, but Finch took the series for which the final clause supplies captions.",
      cue: "Finch took a series of the sculptor at work",
    },
    {
      scene: "sec-modifier-village-tour",
      text: "Sana Hale arranged a visiting historian's day in the village. In the morning, the historian led Hale through the archive's unfamiliar storerooms. In the afternoon, Nina Orr used a leaflet she had prepared to lead the historian past the old washhouses. ______ redrew a confusing section of the route in the leaflet she had prepared.",
      people: ["Sana Hale", "Nina Orr"],
      participle: "guided", object: "the visiting historian", mainSubject: 1,
      agentSubject: 1,
      roleWhy: "The historian guided Hale through the archive; Orr guided the historian through the village.",
      mainWhy: "Hale arranged the day, but Orr prepared and used the walking-tour leaflet mentioned in the final clause.",
      cue: "Nina Orr used a leaflet she had prepared",
    },
    {
      scene: "sec-modifier-dance-pair",
      text: "Alma Fenn's rehearsal notes say that she helped the guest dancer time an entrance. They also describe a lesson in the reverse direction: the guest dancer helped Mira Dane master a turn in the solo assigned to Dane. ______ replaced the difficult turn in her assigned solo with a movement better suited to the narrow stage.",
      people: ["Mira Dane", "Alma Fenn"],
      participle: "coached", object: "the guest dancer", mainSubject: 0,
      agentSubject: 1,
      roleWhy: "Fenn coached the guest dancer on the entrance; the guest dancer coached Dane on the turn.",
      mainWhy: "Fenn kept the notes, but the solo containing the difficult turn was assigned to Dane.",
      cue: "the solo assigned to Dane",
    },
    {
      scene: "sec-modifier-shared-translation",
      text: "Lena Hart opened a bilingual reading by presenting the interpreter to the audience. The interpreter then presented Iona Wren, the poet whose newly written work would close the event. Hart's program notes describe both introductions. ______ began reading the poem she had written for the occasion.",
      people: ["Lena Hart", "Iona Wren"],
      participle: "introduced", object: "the interpreter", mainSubject: 1,
      agentSubject: 0,
      roleWhy: "Hart introduced the interpreter; the interpreter introduced Wren.",
      mainWhy: "Hart supplied the program notes, but Wren is the poet who reads her own new work after the second introduction.",
      cue: "Iona Wren, the poet whose newly written work would close the event",
    },
    {
      scene: "sec-modifier-peer-assessment",
      text: "Tara Bell organized a workshop in which experienced instructors and a trainee evaluated one another. Etta Cole evaluated the trainee teaching a short lesson; later, the trainee evaluated Bell's laboratory demonstration. Bell collected the paperwork. ______ signed the assessor's box on the form for the trainee's teaching lesson.",
      people: ["Etta Cole", "Tara Bell"],
      participle: "assessed", object: "the trainee", mainSubject: 0,
      agentSubject: 0,
      roleWhy: "Cole assessed the trainee's lesson, whereas the trainee assessed Bell's demonstration.",
      mainWhy: "Bell collected the paperwork, but Cole was the assessor for the trainee's teaching lesson.",
      cue: "Etta Cole evaluated the trainee teaching a short lesson",
    },
    {
      scene: "sec-modifier-lantern-portrait",
      text: "Rina Shaw kept a journal of a portrait sitting. The portraitist drew Shaw's face by lantern light while Maya Dove, an art student, made a study of the portraitist's hands. Shaw later described the two drawings in her journal. ______ filed her study of the artist's hands with her other observational drawings.",
      people: ["Rina Shaw", "Maya Dove"],
      participle: "sketched", object: "the portraitist", mainSubject: 1,
      agentSubject: 1,
      roleWhy: "The portraitist sketched Shaw; Dove sketched the portraitist's hands.",
      mainWhy: "Shaw wrote the journal, but Dove made the study of the artist's hands and can file that study with her other drawings.",
      cue: "Maya Dove, an art student, made a study of the portraitist's hands",
    },
  ];

  const modifierImpliedAgent = {
    id: "sec-modifier-implied-agent", sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: "Form, Structure, and Sense", subskill: "modifier placement", difficulty: "Hard",
    title: "Implicit agents and patients in an opening modifier",
    recognize: "Bind the opening participle to the subject after its comma. Use the account to determine both that subject's role in the earlier exchange and whether the main action belongs to that person.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["grammatical-but-illogical", "context-constraint"],
    build(t) {
      const topic = t.pick(MODIFIER_IMPLIED_AGENT_TOPICS);
      const render = (voice, subject) => `Having ${voice === "passive" ? `been ${topic.participle} by` : topic.participle} ${topic.object}, ${topic.people[subject]}`;
      const rows = [];
      ["active", "passive"].forEach((voice) => [0, 1].forEach((subject) => {
        const actualVoice = subject === topic.agentSubject ? "active" : "passive";
        const errors = [];
        if (voice !== actualVoice) {
          errors.push(`the opening modifier makes ${topic.people[subject]} ${voice === "active" ? "the performer" : "the recipient"} of the action involving ${topic.object}, reversing the account: ${topic.roleWhy}`);
        }
        if (subject !== topic.mainSubject) errors.push(`the main clause attributes its action to ${topic.people[subject]}. ${topic.mainWhy}`);
        rows.push([render(voice, subject), { modifierVoice: voice, subject: subject === 0 ? "first-named" : "second-named" }, errors.length ? `The sentence is grammatical, but ${errors.join(" Also, ")}` : null]);
      }));
      const choices = square(rows);
      const keyVoice = topic.mainSubject === topic.agentSubject ? "active" : "passive";
      const instance = {
        responseType: "multiple-choice", scene: topic.scene,
        stimulus: { type: "text", content: topic.text }, stem: STEM,
        ...choices,
        explanation: `${topic.mainWhy} ${topic.roleWhy} The modifier must therefore describe ${topic.people[topic.mainSubject]} as the ${keyVoice === "active" ? "performer" : "recipient"} of that earlier action: “${choices.correct}.”`,
        steps: [
          "Separate the earlier exchanges: identify who acted on whom, rather than treating the author of an account as the actor in every event.",
          topic.roleWhy,
          `Identify the person required by the main clause. ${topic.mainWhy}`,
          `Place that person after the modifier's comma and use ${keyVoice} voice for the earlier action.`,
        ],
        principles: [
          "An introductory participial modifier without its own subject describes the subject of the main clause that follows it.",
          "An active participle makes that subject the performer of an action; a passive participle makes the subject its recipient.",
          "A grammatical modifier-subject pairing may describe a real event yet attach it to a main action that belongs to someone else.",
        ],
        trap: "Following the writer, organizer, or conventional expert through both exchanges, even when the account assigns different roles to different people.",
        hint: "Trace each exchange in both directions. Which participant also fits the action after the blank?",
        estimatedSeconds: 85,
      };
      // This checks the authored role map and the generated syntax. It does
      // not establish the truth or uniqueness of the prose interpretation.
      instance.verify = () => {
        const [opening, subject] = instance.correct.split(", ");
        const subjectIndex = topic.people.indexOf(subject);
        const passive = opening.startsWith("Having been ");
        const earlierActor = passive ? 1 - subjectIndex : subjectIndex;
        const all = [instance.correct, ...instance.wrong.map(([text]) => text)];
        return topic.text.split(BLANK).length === 2 && topic.text.includes(topic.cue) &&
          topic.text.length >= 150 && topic.text.length <= 900 &&
          topic.people.length === 2 && new Set(topic.people).size === 2 &&
          [0, 1].includes(topic.mainSubject) && [0, 1].includes(topic.agentSubject) &&
          subjectIndex === topic.mainSubject && earlierActor === topic.agentSubject &&
          all.every((text) => text.startsWith("Having ") && text.split(", ").length === 2) &&
          new Set(all).size === 4 && isSquare(instance.features);
      };
      return instance;
    },
  };

  // Number depends on the contextual sense of the same written noun.
  // Both senses are salient, and evidence on both sides of the target
  // distinguishes a discipline from results, sound properties, or objects.
  const SVA_MEANING_NUMBER_TOPICS = [
    {
      scene: "sec-meaning-number-growers-workshop",
      text: "The Merewood growers once hired analysts to supply tables of predicted harvests. This season they have kept those tables but replaced the analysts' service with a workshop on designing samples and testing claims. In the new arrangement, statistics ______ central to the growers' training. Participants leave with no revised predictions; their assessment concerns the reasoning behind a valid inference, regardless of which crop a sample represents.",
      noun: "statistics", sense: "discipline", tense: "present",
      meaningEvidence: ["designing samples and testing claims", "the reasoning behind a valid inference"],
      timeEvidence: ["once hired", "This season they have kept"],
      meaningWhy: "The retained tables make the numerical-results meaning plausible, but the workshop and its assessment concern how inference works. The target names statistics as a field of study, which is singular.",
      timeWhy: "The analysts' service belongs to the former arrangement. The blank describes the replacement training that the growers have this season, so it takes the present tense.",
      alternative: "the numerical predictions in the retained tables",
    },
    {
      scene: "sec-meaning-number-journal-charter",
      text: "The journal Pattern now publishes regional population totals, but its editor has recovered a different plan in its founding charter of 1911. That charter assigned contributors questions about sampling, uncertainty, and the limits of inference. Under the original plan, statistics ______ central to the journal's identity. Like the commissioned pieces on algebra, the proposed articles would develop general methods; the editor rejected submissions consisting only of counts from particular towns.",
      noun: "statistics", sense: "discipline", tense: "past",
      meaningEvidence: ["sampling, uncertainty, and the limits of inference", "develop general methods"],
      timeEvidence: ["now publishes", "founding charter of 1911"],
      meaningWhy: "The population totals describe the present journal, while the charter groups general methods of inference with algebra. In the charter's plan, statistics names the singular discipline, not a collection of population figures.",
      timeWhy: "The target describes the original plan in the 1911 charter, even though the opening sentence describes what the journal publishes now. The original plan requires the past tense.",
      alternative: "the population totals published by the journal today",
    },
    {
      scene: "sec-meaning-number-bus-display",
      text: "A transit museum's first display explained how samples could reveal travel habits. During last winter's redesign, the museum moved that lesson into a separate booklet and selected the totals for three bus routes from a passenger survey. Statistics ______ prominent in the replacement display. A visitor can compare weekday and weekend numbers beside each route map, but must open the booklet to learn how the estimates were produced.",
      noun: "statistics", sense: "results", tense: "present",
      meaningEvidence: ["selected the totals for three bus routes", "compare weekday and weekend numbers"],
      timeEvidence: ["During last winter's redesign", "A visitor can compare"],
      meaningWhy: "The explanation of sampling has moved to a booklet. What remains on display consists of numerical results for individual routes, so statistics is plural here.",
      timeWhy: "The redesign happened last winter, but the blank describes the replacement display that a visitor can use now. That current state takes the present tense.",
      alternative: "the discipline explained in the separate booklet",
    },
    {
      scene: "sec-meaning-number-water-vote",
      text: "An institute now teaches the sampling methods used in an old water survey. Its archive also preserves the council's report from 1984, when officials voted on a reservoir. The report reproduced household-use averages and peak-demand figures but omitted the survey's theoretical discussion. Statistics ______ decisive in that vote. Council members quoted individual entries from the report to justify their decisions, although later counts revealed errors in several entries.",
      noun: "statistics", sense: "results", tense: "past",
      meaningEvidence: ["household-use averages and peak-demand figures", "quoted individual entries"],
      timeEvidence: ["now teaches", "report from 1984"],
      meaningWhy: "The present institute teaches a discipline, but the council relied on particular averages and demand figures. Those numerical results are plural statistics.",
      timeWhy: "The blank concerns the council's 1984 vote, before the later discovery of errors. The present teaching program does not change that past time frame.",
      alternative: "the field of sampling methods taught by the institute",
    },
    {
      scene: "sec-meaning-number-sound-handbook",
      text: "An old handbook ranked concert rooms by the clarity of speech heard in them. For the edition now in preparation, the publisher has moved those rankings to an appendix and commissioned chapters explaining how sound travels through air, water, and solid materials. Acoustics ______ the organizing concern of the revised main text. Its chapters develop principles that readers can apply to instruments and machines as well as buildings; room-by-room judgments remain in the appendix.",
      noun: "acoustics", sense: "discipline", tense: "present",
      meaningEvidence: ["how sound travels through air, water, and solid materials", "principles that readers can apply to instruments and machines"],
      timeEvidence: ["An old handbook ranked", "the edition now in preparation"],
      meaningWhy: "The appendix evaluates the sound properties of particular rooms. The main text instead develops the science of sound across several settings, so its organizing concern is the singular discipline acoustics.",
      timeWhy: "The old handbook supplies the earlier comparison. The blank describes the edition now being prepared, requiring the present tense.",
      alternative: "the sound properties rated in the room-by-room appendix",
    },
    {
      scene: "sec-meaning-number-apprentice-sound",
      text: "A renovated assembly hall at Bellmere Works now attracts praise for the way voices carry. A company historian, however, is reconstructing the training offered before the hall existed. In the apprenticeship program of 1936, students used strings, tubes, and tuning forks to investigate the behavior of sound. Acoustics ______ integral to that program. The final examination asked trainees to explain unfamiliar sound experiments, not to assess the performance of a particular room.",
      noun: "acoustics", sense: "discipline", tense: "past",
      meaningEvidence: ["investigate the behavior of sound", "explain unfamiliar sound experiments"],
      timeEvidence: ["now attracts praise", "apprenticeship program of 1936"],
      meaningWhy: "The hall's current sound properties establish the competing plural sense. The earlier apprentices studied general behavior and explained new experiments, making acoustics the singular science they studied.",
      timeWhy: "The blank concerns the apprenticeship program of 1936, before the hall existed. The hall's present reputation is a separate time frame, so the target needs the past tense.",
      alternative: "the sound properties of the renovated assembly hall",
    },
    {
      scene: "sec-meaning-number-restored-theater",
      text: "The architect who restored the Dovetail Theater had studied the science of sound and reused the building's original seating plan. The wooden wall panels, however, had to be replaced with soft coverings. Despite the familiar layout, acoustics ______ different from what the returning actors remember. Their voices no longer linger after a line, and speech from the wings reaches fewer seats; the architect's underlying account of sound has not changed.",
      noun: "acoustics", sense: "properties", tense: "present",
      meaningEvidence: ["wooden wall panels, however, had to be replaced", "Their voices no longer linger after a line"],
      timeEvidence: ["had studied", "the returning actors remember"],
      meaningWhy: "The architect's science is explicitly unchanged. What has changed is how voices behave inside the theater after the surface replacement; these sound properties are plural acoustics.",
      timeWhy: "The restoration and the architect's studies precede the actors' return. The blank describes the sound conditions the actors encounter now, so it needs the present tense.",
      alternative: "the science of sound studied by the architect",
    },
    {
      scene: "sec-meaning-number-radio-warehouse",
      text: "The Orrel radio collective now runs workshops on the science of sound. Before it found a permanent studio, the group tested an empty warehouse in 2008. Its engineers agreed on the theory but disagreed about whether curtains could control the room's long echoes. Acoustics ______ the decisive obstacle to using that site. Even after the curtains went up, recorded words overlapped so badly that the group abandoned the warehouse and rented another building.",
      noun: "acoustics", sense: "properties", tense: "past",
      meaningEvidence: ["the room's long echoes", "recorded words overlapped so badly"],
      timeEvidence: ["now runs workshops", "tested an empty warehouse in 2008"],
      meaningWhy: "The engineers did not dispute the science. The obstacle was the warehouse's echoing sound conditions, demonstrated by the failed recordings, so acoustics is plural.",
      timeWhy: "The blank explains why the collective rejected the warehouse after its 2008 tests. The workshops occur now, but that site decision belongs to the completed past.",
      alternative: "the science taught in the collective's current workshops",
    },
    {
      scene: "sec-meaning-number-clay-grants",
      text: "The Fenwick arts fund once bought finished vases and bowls for public buildings. This year it has redirected the same budget toward time in workshops, including experiments with shaping and firing clay. Ceramics ______ eligible for support under the revised rules. Applicants describe a practice they want to develop and the instruction they need; the fund no longer accepts proposals to purchase completed objects.",
      noun: "ceramics", sense: "discipline", tense: "present",
      meaningEvidence: ["experiments with shaping and firing clay", "a practice they want to develop"],
      timeEvidence: ["once bought", "This year it has redirected"],
      meaningWhy: "The older fund bought ceramic objects, but the revised rules support learning a creative practice and exclude object purchases. Ceramics therefore names the singular discipline.",
      timeWhy: "The purchases belong to the former policy. Eligibility under the revised policy is current this year, so the blank takes the present tense.",
      alternative: "the finished vases and bowls bought under the former rules",
    },
    {
      scene: "sec-meaning-number-clay-apprentices",
      text: "A cabinet at the Westfold design school now holds bowls made by its earliest students. Those students entered in 1923 under a plan intended to give future furniture designers experience with several materials. Ceramics ______ a substantial part of that plan. The timetable reserved a weekly session for forming and firing clay, although the school kept none of the resulting pieces until a later donation filled the cabinet.",
      noun: "ceramics", sense: "discipline", tense: "past",
      meaningEvidence: ["experience with several materials", "a weekly session for forming and firing clay"],
      timeEvidence: ["now holds bowls", "entered in 1923"],
      meaningWhy: "The cabinet contains plural ceramic objects, but the original plan concerned weekly instruction in working with clay. Ceramics names the singular subject included in the students' training.",
      timeWhy: "The original training plan belongs to the students who entered in 1923. The later donation and the present cabinet do not make that past plan current.",
      alternative: "the bowls now kept in the school's cabinet",
    },
    {
      scene: "sec-meaning-number-vessel-ownership",
      text: "For years, two local museums disagreed about how pottery making should be taught. That debate ended when they adopted a shared program. Their new disagreement concerns vessels lent by a collector who left conflicting instructions about their eventual home. Ceramics ______ at the center of the current dispute. The proposed settlement assigns particular bowls and jars to each museum, using the marks on their bases to distinguish the pieces.",
      noun: "ceramics", sense: "objects", tense: "present",
      meaningEvidence: ["vessels lent by a collector", "assigns particular bowls and jars"],
      timeEvidence: ["That debate ended", "the current dispute"],
      meaningWhy: "The teaching dispute has ended. The current dispute concerns ownership of individual vessels, with each bowl or jar identified separately, so ceramics means plural objects.",
      timeWhy: "The old debate concerned teaching. The blank describes the new ownership dispute that is current now, requiring the present tense.",
      alternative: "the discipline addressed by the museums' shared teaching program",
    },
    {
      scene: "sec-meaning-number-flooded-exhibition",
      text: "A museum's current lecture series examines pottery making as an artistic practice. Its building manager recalls a different concern during the flood of 1997: water was rising toward crates of glazed plates in the basement, while tools and clay remained dry upstairs. Ceramics ______ the first priority in the rescue. Volunteers carried each numbered plate to a high shelf and left the upstairs teaching equipment where it was.",
      noun: "ceramics", sense: "objects", tense: "past",
      meaningEvidence: ["crates of glazed plates", "carried each numbered plate"],
      timeEvidence: ["current lecture series", "during the flood of 1997"],
      meaningWhy: "The present lectures concern an artistic practice, but the rescue concerned the individual plates threatened by water. In that account, ceramics means plural objects.",
      timeWhy: "The rescue took place during the 1997 flood. The current lecture series is a separate event, so the target takes the past tense.",
      alternative: "the artistic practice examined in the current lectures",
    },
  ];

  const SVA_MEANING_NUMBER_FORMS = {
    singular: { present: "is", past: "was" },
    plural: { present: "are", past: "were" },
  };
  const SVA_MEANING_NUMBER_SENSES = {
    statistics: { discipline: "singular", results: "plural" },
    acoustics: { discipline: "singular", properties: "plural" },
    ceramics: { discipline: "singular", objects: "plural" },
  };

  const svaMeaningNumber = {
    id: "sec-sva-meaning-number",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: "Form, Structure, and Sense",
    subskill: "subject-verb agreement",
    difficulty: "Hard",
    title: "Agreement selected by a noun's contextual meaning",
    recognize: "Determine whether statistics, acoustics, or ceramics names one discipline or plural results, properties, or objects. Reconcile the surrounding clues before selecting agreement, then locate the target assertion within the passage's changing time frame.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["common-meaning", "grammatical-but-illogical"],
    build(t) {
      const topic = t.pick(SVA_MEANING_NUMBER_TOPICS);
      const number = SVA_MEANING_NUMBER_SENSES[topic.noun][topic.sense];
      const rows = [];
      ["singular", "plural"].forEach((n) => ["present", "past"].forEach((tense) => {
        const text = SVA_MEANING_NUMBER_FORMS[n][tense];
        const errors = [];
        if (n !== number) {
          errors.push(`The ${n} verb would fit a reference to ${topic.alternative}. ${topic.meaningWhy}`);
        }
        if (tense !== topic.tense) {
          errors.push(`The ${tense}-tense verb uses the wrong time frame. ${topic.timeWhy}`);
        }
        rows.push([text, { number: n, tense }, errors.length ? errors.join(" ") : null]);
      }));
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "text", content: topic.text },
        stem: STEM,
        ...choices,
        explanation: `${topic.meaningWhy} ${topic.timeWhy} The required ${number} ${topic.tense}-tense verb is “${choices.correct}.”`,
        steps: [
          `Compare the contextual clues “${topic.meaningEvidence[0]}” and “${topic.meaningEvidence[1]}” to decide what “${topic.noun}” names.`,
          topic.meaningWhy,
          topic.timeWhy,
          `Combine ${number} agreement with ${topic.tense} tense: “${choices.correct}.”`,
        ],
        principles: [
          "Statistics, acoustics, and ceramics take singular agreement when naming disciplines; they take plural agreement when naming numerical results, sound properties, and ceramic objects, respectively.",
          "The same written noun can require different agreement in different senses. Use its meaning in this assertion, not its spelling or a meaning used elsewhere in the passage.",
          "A passage can describe both past and present circumstances; the verb must match the time of the assertion containing it.",
        ],
        trap: `Carrying the meaning suggested by ${topic.alternative} into the target assertion, or carrying the time of the other event into it.`,
        hint: "What exactly is the target sentence referring to, and which stage of the account does it describe?",
        estimatedSeconds: 85,
      };
      // Checks authored evidence and grammatical structure, not an automatic
      // proof that the prose establishes its intended sense or chronology.
      instance.verify = () => {
        const blankAt = topic.text.indexOf(BLANK);
        const expectedNumber = SVA_MEANING_NUMBER_SENSES[topic.noun][topic.sense];
        const allForms = [instance.correct, ...instance.wrong.map(([text]) => text)];
        return topic.text.split(BLANK).length === 2 &&
          topic.text.length >= 150 && topic.text.length <= 900 &&
          new RegExp(`\\b${topic.noun} ${BLANK}`).test(topic.text.toLowerCase()) &&
          topic.meaningEvidence.length === 2 &&
          topic.text.indexOf(topic.meaningEvidence[0]) >= 0 &&
          topic.text.indexOf(topic.meaningEvidence[0]) < blankAt &&
          topic.text.indexOf(topic.meaningEvidence[1]) > blankAt &&
          topic.timeEvidence.length === 2 && topic.timeEvidence.every((cue) => topic.text.includes(cue)) &&
          ["present", "past"].includes(topic.tense) &&
          new Set(allForms).size === 4 &&
          allForms.every((form) => /^(is|are|was|were)$/.test(form)) &&
          instance.correct === SVA_MEANING_NUMBER_FORMS[expectedNumber][topic.tense] &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  // Two possessives track the actual source and recipient after a proposed
  // transfer changes. The evidence identifies each owner before number applies.
  const PRONOUN_RECIPROCAL_TOPICS = [
    {
      scene: "sec-transfer-stencil-chest",
      text: "Restorers first planned to copy designs from carved tiles onto two cabinet doors. Tests showed that the tiles were recent replacements, whereas a wooden stencil preserved the workshop's original pattern. The doors were left untouched when funding fell; only a damaged chest received the reconstructed ornament. The conservation report therefore traces ______.",
      bridge: " new ornament to ", tail: " surviving design",
      first: { owner: "damaged chest", number: "singular", cue: "only a damaged chest received", why: "The damaged chest received the ornament; the cabinet doors were left untouched." },
      second: { owner: "wooden stencil", number: "singular", cue: "a wooden stencil preserved", why: "The wooden stencil preserved the original pattern; the carved tiles were rejected as recent replacements." },
    },
    {
      scene: "sec-transfer-recording-score",
      text: "An editor assumed that a brass score had supplied the melody for several rehearsal recordings. Dates in the recording log reversed that account: the score was a later transcription. Only a rehearsal recording marked FINAL captured the composer's approved phrasing. The editor used that take to correct the score, leaving the separate flute parts unchanged. The revision carried ______.",
      bridge: " approved phrasing into ", tail: " corrected melody",
      first: { owner: "rehearsal recording", number: "singular", cue: "Only a rehearsal recording marked FINAL", why: "One rehearsal recording, the take marked FINAL, supplied the approved phrasing; the other recordings were not used." },
      second: { owner: "brass score", number: "singular", cue: "used that take to correct the score", why: "The brass score received the correction; the separate flute parts remained unchanged." },
    },
    {
      scene: "sec-transfer-console-terminal",
      text: "After a power failure, technicians expected the backup drives to restore the control console and the diagnostic units. The drives proved unreadable, but a portable terminal still held a working profile saved before the failure. The diagnostic units recovered without intervention; the console alone required a settings transfer. The technicians restored ______.",
      bridge: " operating settings from ", tail: " stored profile",
      first: { owner: "control console", number: "singular", cue: "the console alone required", why: "The control console required the transfer; the diagnostic units recovered without receiving it." },
      second: { owner: "portable terminal", number: "singular", cue: "a portable terminal still held a working profile", why: "The portable terminal retained the usable profile; the backup drives could not be read." },
    },
    {
      scene: "sec-transfer-sampler-banners",
      text: "A weaver began by proposing a new curtain patterned after several mosaic sheets. On examining the commission, she found that the requested angular motif survived only on a narrow sampler; the mosaics showed a later variation. The client then canceled the curtain and ordered replacement borders for the hall's banners instead. The weaver repeated ______.",
      bridge: " angular motif along ", tail: " replacement borders",
      first: { owner: "narrow sampler", number: "singular", cue: "survived only on a narrow sampler", why: "The narrow sampler supplied the requested motif; the mosaic sheets showed a different version." },
      second: { owner: "banners", number: "plural", cue: "canceled the curtain and ordered replacement borders", why: "The banners received the new borders after the curtain was canceled." },
    },
    {
      scene: "sec-transfer-map-diaries",
      text: "A cartographer initially treated a printed itinerary as the source for both a route map and several harbor charts. Cross-checking dates revealed that the itinerary had copied the charts, not documented the journey. Two field diaries supplied the missing firsthand evidence. The charts were already accurate, so only the map was redrawn. The cartographer derived ______.",
      bridge: " new route markings from ", tail: " dated entries",
      first: { owner: "route map", number: "singular", cue: "only the map was redrawn", why: "The route map received the new markings; the harbor charts needed no changes." },
      second: { owner: "field diaries", number: "plural", cue: "Two field diaries supplied", why: "The two field diaries supplied firsthand entries; the printed itinerary was only a derivative source." },
    },
    {
      scene: "sec-transfer-cast-shards",
      text: "A workshop displayed a damaged wax cast beside several plaster replicas. At first, the replicas seemed to offer a guide for reconstructing the missing outline. A seam examination showed that all had been copied from the already damaged cast. Newly recovered pottery shards provided independent evidence instead. The replicas remained unchanged while the cast was reshaped. The conservator reconstructed ______.",
      bridge: " missing outline from ", tail: " surviving edges",
      first: { owner: "wax cast", number: "singular", cue: "the cast was reshaped", why: "The wax cast received the reconstruction; the plaster replicas remained as they were." },
      second: { owner: "pottery shards", number: "plural", cue: "pottery shards provided independent evidence", why: "The pottery shards supplied the surviving edges; the plaster replicas had merely copied the cast." },
    },
    {
      scene: "sec-transfer-recordings-animation",
      text: "For a film workshop, a student planned to synchronize several puppet sequences with a composed soundtrack. Reviewing the material changed the plan: the soundtrack had itself been timed to an abandoned edit. Unaltered field recordings supplied the rhythms needed for the new cut. The puppet sequences were set aside, and a single animation was recut to follow the recorded sounds. The completed film preserved ______.",
      bridge: " original rhythms in ", tail: " revised movements",
      first: { owner: "field recordings", number: "plural", cue: "Unaltered field recordings supplied", why: "The field recordings supplied the original rhythms; the composed soundtrack followed an abandoned edit." },
      second: { owner: "animation", number: "singular", cue: "a single animation was recut", why: "One animation received the timing changes; the puppet sequences were set aside." },
    },
    {
      scene: "sec-transfer-proofs-manuscript",
      text: "An editor consulted two production notebooks to repair the numbering in a display copy and several proof copies. The notebooks repeated an error introduced during typesetting. A rediscovered manuscript preserved the author's original sequence. The display copy was retained as a record of the error, while all the proofs were corrected. Before printing, the editor aligned ______.",
      bridge: " corrected numbering with ", tail: " original sequence",
      first: { owner: "proof copies", number: "plural", cue: "all the proofs were corrected", why: "The proof copies received corrected numbering; the display copy deliberately retained the error." },
      second: { owner: "manuscript", number: "singular", cue: "A rediscovered manuscript preserved", why: "The manuscript preserved the author's sequence; the production notebooks repeated the typesetting error." },
    },
    {
      scene: "sec-transfer-panels-model",
      text: "A designer intended to copy the colors in a watercolor sketch into filters for several display lanterns. The sketch turned out to record an earlier, unsuccessful lighting trial. The intended warm tones could still be seen in the surviving glass panels. The lantern project was canceled, but a lighting model was fitted with new filters for a demonstration. The designer reproduced ______.",
      bridge: " warm tones in ", tail: " replacement filters",
      first: { owner: "glass panels", number: "plural", cue: "seen in the surviving glass panels", why: "The glass panels supplied the intended tones; the watercolor sketch documented a rejected trial." },
      second: { owner: "lighting model", number: "singular", cue: "a lighting model was fitted with new filters", why: "The lighting model received the filters; the display lantern project was canceled." },
    },
    {
      scene: "sec-transfer-casts-molds",
      text: "A technician planned to stamp a museum bust with an emblem taken from a metal seal. Examination showed that the seal was a modern imitation; two older molds retained the authentic recessed symbols. The bust was kept unmarked. Instead, several teaching casts were remade using impressions from both molds, without the seal. The technician derived ______.",
      bridge: " new surface markings from ", tail: " recessed symbols",
      first: { owner: "teaching casts", number: "plural", cue: "teaching casts were remade", why: "The teaching casts received the markings; the museum bust was kept unmarked." },
      second: { owner: "molds", number: "plural", cue: "two older molds retained", why: "Both older molds supplied authentic symbols; the metal seal was rejected as an imitation." },
    },
    {
      scene: "sec-transfer-carts-trolleys",
      text: "A workshop inventory listed a handcart as a source of replacement parts for a delivery wagon. The handcart's fittings did not match, however, and the wagon was eventually reserved for a static display. Two retired trolleys had compatible fittings for the prototype carts still used outside. After dismantling the trolleys, the mechanics repaired the prototypes, replacing ______.",
      bridge: " worn wheel brackets with ", tail: " salvaged fittings",
      first: { owner: "prototype carts", number: "plural", cue: "mechanics repaired the prototypes", why: "The prototype carts received repairs; the delivery wagon became a static display." },
      second: { owner: "trolleys", number: "plural", cue: "After dismantling the trolleys", why: "The retired trolleys supplied the salvaged fittings; the handcart's fittings were incompatible." },
    },
    {
      scene: "sec-transfer-folders-reports",
      text: "An archivist expected a card index to supply location codes for a finding register and several research reports. A shelf check showed that the index described an obsolete arrangement. The current codes were written on the storage folders. The register was preserved unchanged to document the former system, but the reports were updated for visiting researchers. The archivist transferred ______.",
      bridge: " current location codes into ", tail: " revised footnotes",
      first: { owner: "storage folders", number: "plural", cue: "current codes were written on the storage folders", why: "The storage folders supplied the current codes; the card index described an obsolete arrangement." },
      second: { owner: "research reports", number: "plural", cue: "the reports were updated", why: "The research reports received the updated references; the finding register remained unchanged." },
    },
  ];

  const pronounReciprocalReference = {
    id: "sec-pronoun-reciprocal-reference",
    sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: "Form, Structure, and Sense", subskill: "pronoun agreement",
    difficulty: "Hard",
    title: "Pronoun reference through a changed transfer",
    recognize: "Identify the actual source and recipient after the passage revises a proposed transfer. Each possessive must agree with the particular owner it represents, even when both pronouns have the same form.",
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["grammatical-but-illogical", "context-constraint"],
    build(t) {
      const topic = t.pick(PRONOUN_RECIPROCAL_TOPICS);
      const possessive = { singular: "its", plural: "their" };
      const rows = [];
      ["singular", "plural"].forEach((firstNumber) => ["singular", "plural"].forEach((secondNumber) => {
        const text = possessive[firstNumber] + topic.bridge + possessive[secondNumber] + topic.tail;
        const errors = [];
        if (firstNumber !== topic.first.number) errors.push(`The first possessive is ${firstNumber}, but it refers to the ${topic.first.number} ${topic.first.owner}. ${topic.first.why}`);
        if (secondNumber !== topic.second.number) errors.push(`The second possessive is ${secondNumber}, but it refers to the ${topic.second.number} ${topic.second.owner}. ${topic.second.why}`);
        rows.push([text, { firstOwnerNumber: firstNumber, secondOwnerNumber: secondNumber }, errors.length ? errors.join(" ") : null]);
      }));
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice", scene: topic.scene,
        stimulus: { type: "text", content: topic.text }, stem: STEM,
        ...choices,
        explanation: `${topic.first.why} ${topic.second.why} The first possessive therefore refers to the ${topic.first.number} ${topic.first.owner} and is “${possessive[topic.first.number]}”; the second refers to the ${topic.second.number} ${topic.second.owner} and is “${possessive[topic.second.number]}.” The completed phrase is “${choices.correct}.”`,
        steps: [
          "Separate the initial proposal from the transfer that actually occurred.",
          topic.first.why,
          topic.second.why,
          "Match each possessive to its own antecedent: its for a singular nonhuman owner and their for plural owners.",
        ],
        principles: [
          "A possessive pronoun agrees with its antecedent, not with the thing possessed or the nearest noun.",
          "Two possessives in one phrase may refer to different antecedents; the relationship described in the passage determines each reference.",
        ],
        trap: "Keeping the source or recipient from the abandoned plan, or assuming that both possessives refer to the same owner.",
        hint: "What actually supplied the transferred material, and what actually received it? Read the final phrase with those two names in place of the pronouns.",
        estimatedSeconds: 90,
      };
      instance.verify = () => {
        // These checks establish the two-slot form and declared agreement.
        // They do not prove which transfer occurred; that is editorial evidence.
        const owners = [topic.first, topic.second];
        const numberOf = (owner) => /s$/.test(owner) ? "plural" : "singular";
        const keyPronouns = choices.correct.match(/\b(?:its|their)\b/g) || [];
        const offered = [instance.correct, ...instance.wrong.map(([text]) => text)];
        return topic.text.split(BLANK).length === 2 && topic.text.length >= 150 && topic.text.length <= 900 &&
          owners.every((owner) => topic.text.toLowerCase().includes(owner.owner) && topic.text.includes(owner.cue) && numberOf(owner.owner) === owner.number) &&
          topic.first.owner !== topic.second.owner && keyPronouns.length === 2 &&
          keyPronouns[0] === possessive[numberOf(topic.first.owner)] && keyPronouns[1] === possessive[numberOf(topic.second.owner)] &&
          offered.every((text) => (text.match(/\b(?:its|their)\b/g) || []).length === 2) &&
          new Set(offered).size === 4 && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* ---------------- reported expectations and observations: reference and aspect */

  // Each scene distinguishes an advance expectation from a later observation.
  // A timeline describes only the source governing the blank: report, checkpoint,
  // start, and finish are ordered positions, not displayed dates. Verification
  // checks this authored structure and the forms, not the truth of the prose.
  const REPORTED_FORECAST_TOPICS = [
    {
      scene: "sec-forecast-archive-inspection",
      text: "An archive's assistants were still indexing the final box when an inspector arrived. This delay contradicted a note the archivist had written before sorting began. In that note, the last entry preceded the inspection, leaving the assistants free to guide the visitor. The archivist had predicted that the assistants ______ the entire collection when the inspector entered the reading room.",
      participle: "indexed", progressive: "indexing",
      timeline: { report: 0, start: 1, finish: 2, checkpoint: 3 },
      sourceCue: "In that note", checkpointCue: "when the inspector entered the reading room",
      completionCue: "the last entry preceded the inspection",
      sourceReason: "The blank gives the archivist's advance prediction, not the later observation of unfinished indexing. The inspection was still ahead when the note was written.",
      aspectReason: "The note placed the last entry before the inspection, so the indexing was expected to be complete at that checkpoint.",
      lure: "The opening observation makes ongoing work plausible, but the blank reports the earlier prediction.",
    },
    {
      scene: "sec-forecast-kiln-delivery",
      text: "A pottery workshop's firing plan reserved the empty kiln room for a buyer's visit. Before the firing, the manager assured the buyer that the potters ______ all the bowls when she arrived: the plan assigned removal to the preceding shift and inspection to the next. A cooling problem later kept several bowls inside the kiln throughout the visit.",
      participle: "removed", progressive: "removing",
      timeline: { report: 0, start: 1, finish: 2, checkpoint: 3 },
      sourceCue: "Before the firing", checkpointCue: "when she arrived",
      completionCue: "removal to the preceding shift",
      sourceReason: "The assurance was given before the firing and concerned the buyer's later visit. The subsequent cooling problem does not change the assurance's time frame.",
      aspectReason: "Removal belonged to the shift before the visit, leaving an empty kiln room, so the assurance presents removal as complete by the buyer's arrival.",
      lure: "The bowls actually remained in the kiln, but the sentence reports what the manager had assured the buyer would happen.",
    },
    {
      scene: "sec-forecast-caption-preview",
      text: "At a film cooperative, reviewers could open a caption file only after the technicians exported its final version. The producer scheduled a preview and, before transcription began, forecast that the technicians ______ the captions when the reviewers signed in. Her schedule placed export before sign-in. The preview actually began with technicians still working on the closing dialogue.",
      participle: "transcribed", progressive: "transcribing",
      timeline: { report: 0, start: 1, finish: 2, checkpoint: 3 },
      sourceCue: "before transcription began", checkpointCue: "when the reviewers signed in",
      completionCue: "export before sign-in",
      sourceReason: "The forecast preceded transcription and looked ahead to the reviewers' sign-in. The final sentence reports a different, later outcome.",
      aspectReason: "The forecast put export before sign-in, and export required a final caption file. Transcription was therefore expected to be complete at sign-in.",
      lure: "The technicians' actual work continued into the preview, whereas the blank concerns the producer's advance forecast.",
    },
    {
      scene: "sec-forecast-costume-fitting",
      text: "A costume supervisor wanted visiting apprentices to watch a seam take shape rather than examine finished clothing. Before work started, she placed their visit after work on the sleeves began but before their seams were closed. She expected that the tailors ______ the sleeves when the apprentices entered. In fact, that visit was canceled, and the apprentices arrived only after the costumes were complete.",
      participle: "sewn", progressive: "sewing",
      timeline: { report: 0, start: 1, checkpoint: 2, finish: 3 },
      sourceCue: "Before work started", checkpointCue: "when the apprentices entered",
      completionCue: "after work on the sleeves began but before their seams were closed",
      sourceReason: "The supervisor's expectation was formed before work started and concerned the apprentices' later entrance, not their rescheduled actual visit.",
      aspectReason: "The planned visit fell after work on the sleeves began but before their seams were closed, so the tailors were expected to be in the middle of sewing them then.",
      lure: "The finished costumes describe the eventual visit, not the earlier expectation that governs the blank.",
    },
    {
      scene: "sec-forecast-marsh-transect",
      text: "A field-course leader prepared a sampling plan before students entered a marsh. She placed a visitor's arrival halfway through the route, so the visitor could observe the collection procedure at several remaining stations. The plan projected that the students ______ the transect when the visitor joined them. A shortened route later allowed the students to finish before the visitor arrived.",
      participle: "surveyed", progressive: "surveying",
      timeline: { report: 0, start: 1, checkpoint: 2, finish: 3 },
      sourceCue: "before students entered a marsh", checkpointCue: "when the visitor joined them",
      completionCue: "halfway through the route",
      sourceReason: "The blank reports the sampling plan prepared before the fieldwork, looking ahead to the visitor's arrival. It does not report the shortened route's actual outcome.",
      aspectReason: "The visitor was to join halfway through the route with sampling stations still ahead, so the survey was expected to be underway at that point.",
      lure: "Finishing before the actual arrival conflicts with the earlier plan, whose projected midway arrival is the relevant checkpoint.",
    },
    {
      scene: "sec-forecast-quartet-session",
      text: "A composer wanted to watch a quartet's studio session. The coordinator's advance letter placed her entrance after recording began, with the score's final movement scheduled for later in the session. The coordinator anticipated that the musicians ______ the complete score when the composer came in. An unusually smooth session actually let the musicians finish before her arrival.",
      participle: "recorded", progressive: "recording",
      timeline: { report: 0, start: 1, checkpoint: 2, finish: 3 },
      sourceCue: "advance letter", checkpointCue: "when the composer came in",
      completionCue: "the score's final movement scheduled for later in the session",
      sourceReason: "The anticipation appears in an advance letter and looks forward to the composer's entrance. The unusually smooth actual session is a separate outcome.",
      aspectReason: "The letter placed the entrance after recording began but before the final movement was recorded, so work on the complete score was expected to be ongoing.",
      lure: "The musicians eventually finished early, but that result cannot be substituted for the coordinator's earlier anticipation.",
    },
    {
      scene: "sec-forecast-market-tents",
      text: "A market plan allowed dismantling to overlap with the evening concert, but the crews finished sooner. Photographs showed empty tent sites before the first musician stepped onstage; no packing remained at that point. In a report written after the concert, the organizer confirmed that the crews ______ the tents when the performance began.",
      participle: "packed", progressive: "packing",
      timeline: { start: 0, finish: 1, checkpoint: 2, report: 3 },
      sourceCue: "a report written after the concert", checkpointCue: "when the performance began",
      completionCue: "no packing remained at that point",
      sourceReason: "The blank reports the organizer's confirmation after the concert, looking back at an observed result rather than ahead from the earlier market plan.",
      aspectReason: "The photographs showed that all packing was over before the performance began, so the action was already complete at that past checkpoint.",
      lure: "The earlier plan allowed ongoing dismantling during the concert, but the later report confirms that the crews had finished sooner.",
    },
    {
      scene: "sec-forecast-ferry-cargo",
      text: "A ferry's original loading plan assigned some cargo checks to the crossing. On this voyage, however, the dock crew secured every crate before the ramp rose, and the crew did no further fastening at departure. The captain's account, dictated after docking at the destination, recorded that the loaders ______ the crates when the ferry left the pier.",
      participle: "fastened", progressive: "fastening",
      timeline: { start: 0, finish: 1, checkpoint: 2, report: 3 },
      sourceCue: "after docking at the destination", checkpointCue: "when the ferry left the pier",
      completionCue: "no further fastening at departure",
      sourceReason: "The captain dictated the account after the crossing and recorded what had happened at departure, rather than predicting the original plan's work during the crossing.",
      aspectReason: "Every crate was secured before the ramp rose and fastening had ceased at departure, so the fastening was complete before the past departure checkpoint.",
      lure: "The plan assigned checks to the crossing, but the captain's later account concerns fastening that was already complete at departure.",
    },
    {
      scene: "sec-forecast-net-demonstration",
      text: "A harbor workshop advertised a net-mending demonstration for visiting students. The repair crew unexpectedly finished early, so the students saw repaired nets laid out on a table instead of watching repairs. After the students left, the instructor filed a report stating that the volunteers ______ every tear in the nets when the group reached the workshop.",
      participle: "mended", progressive: "mending",
      timeline: { start: 0, finish: 1, checkpoint: 2, report: 3 },
      sourceCue: "After the students left", checkpointCue: "when the group reached the workshop",
      completionCue: "instead of watching repairs",
      sourceReason: "The instructor's report was filed after the visit and describes the actual state at the group's earlier arrival, not the advertised demonstration.",
      aspectReason: "The students saw repaired nets instead of work in progress because the volunteers finished early, so every tear was mended before the arrival checkpoint.",
      lure: "The advertisement suggests a repair in progress, but the report records why no live repair was available to watch.",
    },
    {
      scene: "sec-forecast-loom-recording",
      text: "A weaving studio had promised to clear its looms before a delegation arrived. The visit's recording instead showed the weavers adding rows to unfinished panels, with many rows still required after the greeting. In a summary prepared after watching the recording, the studio director acknowledged that the weavers ______ the panels when the delegates entered.",
      participle: "woven", progressive: "weaving",
      timeline: { start: 0, checkpoint: 1, finish: 2, report: 3 },
      sourceCue: "after watching the recording", checkpointCue: "when the delegates entered",
      completionCue: "many rows still required after the greeting",
      sourceReason: "The director's summary looks back on the recorded visit. It acknowledges the observed work, not the earlier promise about a future visit.",
      aspectReason: "The weavers were adding rows when the delegates entered and still had rows to add, so weaving was underway at that past checkpoint.",
      lure: "The promise suggests completed panels, but the later acknowledgment describes the unfinished work visible in the recording.",
    },
    {
      scene: "sec-forecast-cavern-map",
      text: "An expedition's prospectus promised a finished cavern map for a sponsor's tour. During the tour, the sponsor found the surveyors taking measurements in one chamber and learned that another chamber remained unmeasured. In a letter sent home after leaving the cavern, the sponsor reported that the surveyors ______ the interior when she encountered them.",
      participle: "mapped", progressive: "mapping",
      timeline: { start: 0, checkpoint: 1, finish: 2, report: 3 },
      sourceCue: "after leaving the cavern", checkpointCue: "when she encountered them",
      completionCue: "another chamber remained unmeasured",
      sourceReason: "The sponsor's letter was sent after the encounter and reports her observation, rather than the prospectus's advance promise.",
      aspectReason: "The surveyors were taking measurements and had an unmeasured chamber ahead of them, so mapping was in progress at the encounter.",
      lure: "The promised finished map belongs to the prospectus; the sponsor's later letter reports what she actually observed.",
    },
    {
      scene: "sec-forecast-inscription-copy",
      text: "A curator had scheduled photography after the last inscription was copied. An equipment change brought the photographer in early: she saw the copyists writing out a long inscription, with several untouched tablets beside them. Her log, completed after the session, noted that the copyists ______ the inscriptions when she set up the camera.",
      participle: "copied", progressive: "copying",
      timeline: { start: 0, checkpoint: 1, finish: 2, report: 3 },
      sourceCue: "completed after the session", checkpointCue: "when she set up the camera",
      completionCue: "several untouched tablets beside them",
      sourceReason: "The photographer completed the log after the session and described the actual earlier setup, not the curator's original schedule.",
      aspectReason: "The copyists were writing an inscription and still had untouched tablets, so copying was ongoing when the camera was set up.",
      lure: "The curator's schedule would place copying before photography, but the photographer's retrospective log concerns the early arrival that disrupted it.",
    },
  ];

  function reportedForecastForm(topic, reference, aspect) {
    if (reference === "later-than-report") {
      return aspect === "complete" ? `would have ${topic.participle}` : `would be ${topic.progressive}`;
    }
    return aspect === "complete" ? `had ${topic.participle}` : `were ${topic.progressive}`;
  }

  const reportedForecastAspect = {
    id: "sec-reported-forecast-aspect",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: "Form, Structure, and Sense",
    subskill: "verb form",
    difficulty: "Hard",
    title: "A reported expectation or observation at its own checkpoint",
    recognize: "Identify which account the blank reports, then relate that account to its checkpoint and distinguish completed work from work in progress. An expectation and the actual outcome can have different timelines.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["grammatical-but-illogical", "context-constraint"],
    build(t) {
      const topic = t.pick(REPORTED_FORECAST_TOPICS);
      const neededReference = topic.timeline.checkpoint > topic.timeline.report ? "later-than-report" : "earlier-than-report";
      const neededAspect = topic.timeline.finish < topic.timeline.checkpoint ? "complete" : "ongoing";
      const rows = [];
      ["earlier-than-report", "later-than-report"].forEach((reference) => ["complete", "ongoing"].forEach((aspect) => {
        const form = reportedForecastForm(topic, reference, aspect);
        const errors = [];
        if (reference !== neededReference) errors.push(neededReference === "later-than-report"
          ? "This form looks backward from a past report, but the governing report anticipates a checkpoint still ahead of it. " + topic.sourceReason
          : "This form presents a future expectation from a past viewpoint, but the governing account records an earlier observed event. " + topic.sourceReason);
        if (aspect !== neededAspect) errors.push(neededAspect === "complete"
          ? "The progressive presents the action as underway at the checkpoint. " + topic.aspectReason
          : "The perfect presents this bounded task as already complete at the checkpoint. " + topic.aspectReason);
        rows.push([form, { reference, aspect }, errors.length ? errors.join(" ") : null]);
      }));
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "text", content: topic.text },
        stem: STEM,
        ...choices,
        explanation: `${topic.sourceReason} ${topic.aspectReason} The matching form is “${choices.correct}.”`,
        steps: [
          `Identify the account governing the blank: “${topic.sourceCue}.” ${topic.sourceReason}`,
          `Locate its checkpoint: “${topic.checkpointCue}.” It is ${neededReference === "later-than-report" ? "later than the report, so the form must look forward from that past viewpoint" : "earlier than the report, so the form must describe an earlier past event"}.`,
          `Compare the action with that checkpoint: “${topic.completionCue}.” ${topic.aspectReason}`,
          `Combine the time relation and aspect: “${choices.correct}.”`,
        ],
        principles: [
          "A past account can look forward to a later event with would or look back at an earlier observation with a past-tense form. The time of the account and the time it describes must be distinguished.",
          "For a bounded task, a perfect form can present completion before a checkpoint, while a progressive form presents the task as underway at that checkpoint. The surrounding context determines which meaning fits.",
          "A reported prediction retains its original content even if the actual outcome differs; a retrospective observation follows the observed outcome instead of an abandoned plan.",
        ],
        trap: topic.lure,
        hint: "Which account supplies the blank: the advance plan or the later observation? Follow that account to the moment it describes.",
        estimatedSeconds: 95,
      };
      instance.verify = () => {
        const offered = [instance.correct, ...instance.wrong.map(([form]) => form)];
        const decoded = offered.map((form) => ({
          reference: /^would /.test(form) ? "later-than-report" : /^(had|were) /.test(form) ? "earlier-than-report" : null,
          aspect: /^(would have|had) /.test(form) ? "complete" : /^(would be|were) /.test(form) ? "ongoing" : null,
        }));
        const key = decoded[0];
        const { report, checkpoint, start, finish } = topic.timeline;
        return topic.text.split(BLANK).length === 2 && topic.text.length >= 150 && topic.text.length <= 900 &&
          [topic.sourceCue, topic.checkpointCue, topic.completionCue].every((cue) => topic.text.includes(cue)) &&
          new Set(offered).size === 4 && decoded.every((entry) => entry.reference && entry.aspect) &&
          start < finish && start < checkpoint && report !== checkpoint && finish !== checkpoint &&
          (key.reference === "later-than-report" ? report < checkpoint : checkpoint < report) &&
          (key.aspect === "complete" ? finish < checkpoint : start < checkpoint && checkpoint < finish) &&
          isSquare(instance.features);
      };
      return instance;
    },
  };

  // Reported actions cross relative aspect (completed / still underway)
  // with voice. Both voices keep the same adverbial complement: no object
  // or agent preposition outside the blank mechanically selects the key.
  // Reported actions cross relative aspect (completed / still underway)
  // with voice. Both voices keep the same adverbial complement: no object
  // or agent preposition outside the blank mechanically selects the key.
  // Completed scenes state present knowledge of ended historical events;
  // they do not describe actions visible in an old photograph or film.
  const INFINITIVE_TIME_VOICE_TOPICS = [
    {
      scene: "sec-infinitive-reunion-film",
      text: "A reunion's surviving contracts assign Alder to camera work and Birch to appearances on screen. The reunion ended decades ago, and both crews disbanded; the courtyard used for production has since been demolished. Newly matched payment receipts have settled a dispute about the crews' assignments. The Alder crew is now known ______ in that courtyard.",
      base: "film", participle: "filmed", progressive: "filming", aspect: "perfect", voice: "active",
      timeCue: "the courtyard used for production has since been demolished", roleCue: "assign Alder to camera work",
      timeReason: "The sentence states what is known now about a reunion that ended decades ago. The crews disbanded and the courtyard was demolished, so it cannot report filming currently underway there.",
      voiceReason: "Alder operated the cameras; Birch supplied the subjects. The Alder crew performed the filming rather than receiving it.",
    },
    {
      scene: "sec-infinitive-retired-rider",
      text: "The academy's last winter program divided its riders into instructors and learners. Mara's initials occur only in the instructor column, beside a group of novices; none of the lesson sheets lists her among the learners. The academy subsequently closed, and Mara retired. With those records finally authenticated, Mara is now known ______ at the academy during its final program.",
      base: "coach", participle: "coached", progressive: "coaching", aspect: "perfect", voice: "active",
      timeCue: "The academy subsequently closed, and Mara retired", roleCue: "only in the instructor column",
      timeReason: "The sentence states present knowledge about the academy's final program, which ended before the academy closed and Mara retired. It does not describe a lesson in progress now.",
      voiceReason: "The sheets assign Mara to the instructors and expressly exclude her from the learners, so she did the coaching.",
    },
    {
      scene: "sec-infinitive-selection-panel",
      text: "A theater's archived selection notes identify the people who asked questions by initials and the applicants who answered them by full names. Every member of the temporary selection panel appears only in the first group. Although the theater now uses public auditions, the former panel, which dissolved after submitting its recommendations, is now known ______ behind closed doors.",
      base: "interview", participle: "interviewed", progressive: "interviewing", aspect: "perfect", voice: "active",
      timeCue: "dissolved after submitting its recommendations", roleCue: "Every member of the temporary selection panel appears only in the first group",
      timeReason: "The sentence states what is known now about the former panel's completed selection process. That panel dissolved after making its recommendations and cannot be conducting interviews now.",
      voiceReason: "The first group asked the questions, and the applicants answered. The panel therefore conducted the interviews rather than undergoing them.",
    },
    {
      scene: "sec-infinitive-quartet-tape",
      text: "A radio transcript labels the Rowan Quartet as guests and a journalist as host. The quartet's remarks answer the host's questions about touring; none of the quartet's members asks a question. The quartet broke up shortly after that broadcast, and the hall was demolished. Following the transcript's recent authentication, the quartet is now known ______ in the old hall.",
      base: "interview", participle: "interviewed", progressive: "interviewing", aspect: "perfect", voice: "passive",
      timeCue: "The quartet broke up shortly after that broadcast, and the hall was demolished", roleCue: "none of the quartet's members asks a question",
      timeReason: "The report states present knowledge of an ended broadcast. The quartet subsequently broke up and the old hall was demolished, excluding an interview currently underway there.",
      voiceReason: "The host asked the questions, and the quartet supplied the answers, so the quartet underwent the interview.",
    },
    {
      scene: "sec-infinitive-cooperative-audit",
      text: "A cooperative of accountants now examines other organizations' finances, but its authenticated founding records establish a different arrangement forty years earlier. The cooperative supplied its own ledgers to an independent examiner, whose signed findings were filed before the cooperative accepted its first client. The cooperative is now known ______ in its first year of operation.",
      base: "audit", participle: "audited", progressive: "auditing", aspect: "perfect", voice: "passive",
      timeCue: "findings were filed before the cooperative accepted its first client", roleCue: "supplied its own ledgers to an independent examiner",
      timeReason: "The present report concerns the cooperative's first year, forty years earlier. The examiner's findings were filed before client work began, so this is a completed audit rather than one underway now.",
      voiceReason: "The cooperative's own finances were examined by an independent examiner, making the cooperative the recipient of the audit.",
    },
    {
      scene: "sec-infinitive-guide-portrait",
      text: "A museum guide usually takes pictures for the visitor newsletter. A newly authenticated invoice for a completed portrait instead lists the guide as the sitter and a visiting artist as the photographer. The session took place in the museum's former building, which was dismantled after the collection moved. The guide is now known ______ on that building's upper landing.",
      base: "photograph", participle: "photographed", progressive: "photographing", aspect: "perfect", voice: "passive",
      timeCue: "which was dismantled after the collection moved", roleCue: "lists the guide as the sitter",
      timeReason: "The sentence states present knowledge of a completed portrait session in a building that has since been dismantled. It does not describe a session visible in an old image or photography happening now.",
      voiceReason: "For this particular portrait, the guide sat for the visiting artist; the guide's usual role as a photographer does not apply.",
    },
    {
      scene: "sec-infinitive-library-tutors",
      text: "At a library exchange, adult volunteers normally help teenagers with homework. Today's pilot reverses those roles: the teenagers explain a new catalog app while the adults practice using it. A live observer joins midway through the pilot's first lesson, before any group has finished, and describes what is happening: the teenagers appear ______ at the long table.",
      base: "tutor", participle: "tutored", progressive: "tutoring", aspect: "progressive", voice: "active",
      timeCue: "midway through the pilot's first lesson, before any group has finished", roleCue: "the teenagers explain a new catalog app while the adults practice",
      timeReason: "The observer explicitly describes the first lesson while it is underway, before any group has finished it.",
      voiceReason: "Today's arrangement makes the teenagers the instructors and the adults the learners, reversing the usual arrangement.",
    },
    {
      scene: "sec-infinitive-cliff-documentary",
      text: "For the opening shot of a cliff documentary, the camera club has lent its members to the production crew; local actors supply everyone visible in the shot. A visitor reaches the set while the first continuous take is underway. The monitor shows the actors crossing a bridge as the club members keep the cameras moving. In this take, the club appears ______ from the ridge.",
      base: "film", participle: "filmed", progressive: "filming", aspect: "progressive", voice: "active",
      timeCue: "while the first continuous take is underway", roleCue: "the club members keep the cameras moving",
      timeReason: "The visitor's observation describes the first continuous take as it unfolds, not a completed take viewed afterward.",
      voiceReason: "The club members move the cameras, while actors supply the people in the shot. The club performs the filming.",
    },
    {
      scene: "sec-infinitive-archive-live-interview",
      text: "An oral-history archive is testing a live link with its field team. The link opens in the middle of the team's first conversation of the day: the archivist is asking prepared questions, and a visitor is giving answers. The producer's note describes the conversation as it unfolds, with the final questions still to come: the archivist seems ______ in the station waiting room.",
      base: "interview", participle: "interviewed", progressive: "interviewing", aspect: "progressive", voice: "active",
      timeCue: "describes the conversation as it unfolds, with the final questions still to come", roleCue: "the archivist is asking prepared questions",
      timeReason: "The producer reports the first conversation while it is unfolding, before its final questions have been asked.",
      voiceReason: "The archivist asks the questions and the visitor supplies answers, so the archivist conducts the interview.",
    },
    {
      scene: "sec-infinitive-coaches-first-lesson",
      text: "The senior coaches usually lead every exercise at a sports center. During a trial of unfamiliar equipment, they have handed the instruction cards to visiting specialists and joined the learners instead. An observer enters halfway through the first lesson and reports on the unfinished exercise: the senior coaches appear ______ in the smaller gym.",
      base: "coach", participle: "coached", progressive: "coaching", aspect: "progressive", voice: "passive",
      timeCue: "enters halfway through the first lesson and reports on the unfinished exercise", roleCue: "joined the learners instead",
      timeReason: "The observation concerns an exercise still underway in the first lesson, not coaching completed before the observation.",
      voiceReason: "Despite their ordinary role, the senior coaches have become learners receiving instruction from the visiting specialists.",
    },
    {
      scene: "sec-infinitive-choir-safety-briefing",
      text: "Before a choir's first performance in a converted warehouse, a safety officer explains how the exits work. The singers, who have never visited the building before, listen and mark the routes on their maps. A producer sees the meeting halfway through the officer's opening demonstration. Describing that unfinished meeting, the producer writes that the choir appears ______ in the main room.",
      base: "brief", participle: "briefed", progressive: "briefing", aspect: "progressive", voice: "passive",
      timeCue: "halfway through the officer's opening demonstration", roleCue: "The singers, who have never visited the building before, listen",
      timeReason: "The producer describes a meeting midway through its opening demonstration, before the briefing has concluded.",
      voiceReason: "The officer provides the information, and the singers listen to it. The choir receives the briefing.",
    },
    {
      scene: "sec-infinitive-fountain-exposure",
      text: "Members of a photography club have volunteered to pose for an artist's first group portrait. The artist works beneath the camera cloth while the members hold their positions around a fountain. A long exposure is still running, and no portrait from the session has yet been completed. Watching this arrangement, a passerby concludes that the club seems ______ beside the fountain.",
      base: "photograph", participle: "photographed", progressive: "photographing", aspect: "progressive", voice: "passive",
      timeCue: "A long exposure is still running, and no portrait from the session has yet been completed", roleCue: "the members hold their positions around a fountain",
      timeReason: "The first portrait's exposure is still running, so the observation concerns photography in progress rather than a finished portrait.",
      voiceReason: "Although the members belong to a photography club, they are posing while the artist operates the camera. They receive the action.",
    },
  ];

  const infinitiveTimeAndVoice = {
    id: "sec-infinitive-time-and-voice", sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: "Form, Structure, and Sense", subskill: "verb form", difficulty: "Medium",
    title: "Time and voice inside a reported judgment",
    recognize: "Separate the time of a judgment from the time of the action it describes, then determine whether the reported subject performs or receives that action. A report of a completed earlier action takes a perfect infinitive; an action explicitly reported as underway takes a progressive infinitive.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["grammatical-but-illogical", "context-constraint"],
    build(t) {
      const topic = t.pick(INFINITIVE_TIME_VOICE_TOPICS);
      const forms = {
        "perfect|active": "to have " + topic.participle,
        "perfect|passive": "to have been " + topic.participle,
        "progressive|active": "to be " + topic.progressive,
        "progressive|passive": "to be being " + topic.participle,
      };
      const rows = Object.entries(forms).map(([corner, form]) => {
        const [aspect, voice] = corner.split("|");
        const errors = [];
        if (aspect !== topic.aspect) errors.push(topic.timeReason);
        if (voice !== topic.voice) errors.push(topic.voiceReason);
        return [form, { aspect, voice }, errors.length
          ? "This " + aspect + ", " + voice + " infinitive is grammatical, but it misstates the reported situation. " + errors.join(" ")
          : null];
      });
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice", scene: topic.scene,
        stimulus: { type: "text", content: topic.text }, stem: STEM,
        ...choices,
        explanation: topic.timeReason + " " + topic.voiceReason + " The required " + topic.aspect + ", " + topic.voice + " infinitive is “" + choices.correct + ".”",
        steps: [
          "Identify the action the judgment reports, distinguishing it from the act of reviewing or observing.",
          topic.timeReason,
          topic.voiceReason,
          "Combine the required aspect and voice: “" + choices.correct + ".”",
        ],
        principles: [
          "A present factual report such as is now known takes a perfect infinitive for an ended earlier action. A progressive infinitive describes an action underway at the time of the reported observation. Describing what an old image depicts is a different frame from stating present knowledge of an ended event.",
          "Active voice makes the reported subject the performer of an action; passive voice makes that subject its recipient. A group's customary role need not be its role in the event described.",
        ],
        trap: "Matching the infinitive to the present reporting verb, or assigning the subject its customary role without checking this particular event.",
        hint: "Which event is the observer describing, when does it occur relative to the observation, and what part does the subject play?",
        estimatedSeconds: 75,
      };
      // These checks validate the authored grid and the presence of its
      // evidence. They cannot establish the semantic reading of the prose.
      instance.verify = () => {
        const offered = [instance.correct, ...instance.wrong.map(([form]) => form)];
        const deriveAspect = (form) => /^to have /.test(form) ? "perfect" : /^to be /.test(form) ? "progressive" : null;
        const deriveVoice = (form) => /^to (?:have been|be being) /.test(form) ? "passive" : "active";
        return topic.text.split(BLANK).length === 2 && topic.text.length >= 150 && topic.text.length <= 900 &&
          topic.text.includes(topic.timeCue) && topic.text.includes(topic.roleCue) &&
          offered.length === 4 && new Set(offered).size === 4 &&
          deriveAspect(instance.correct) === topic.aspect && deriveVoice(instance.correct) === topic.voice &&
          offered.every((form) => deriveAspect(form) && /^to /.test(form)) && isSquare(instance.features);
      };
      return instance;
    },
  };

  const JOINT_SEPARATE_POSSESSION_TOPICS = [
    {
      scene: "sec-joint-possession-mural-panels",
      text: "Orin drew a continuous harbor scene across detachable panels, and Lila painted the figures and water throughout his design. The panels were taken apart for transport, then fitted together so that the shoreline ran without a break from end to end. An exhibition label credits the finished work to the artists together. The catalog reproduces ______ as a whole, preserving the continuous shoreline.",
      first: "Orin", second: "Lila", noun: "mural", plural: "murals", ownership: "joint", number: "singular",
      ownershipCue: "credits the finished work to the artists together",
      numberCue: "the shoreline ran without a break from end to end",
      ownershipWhy: "Orin supplied the design and Lila painted throughout it; the label credits that finished work to them together.",
      numberWhy: "The detachable panels reassemble into a continuous mural. Transport sections do not become independently finished murals.",
    },
    {
      scene: "sec-joint-possession-instrument-components",
      text: "For a sound exhibition, Veda carved a resonating chamber and Tomas devised the strings and tuning mechanism that fit inside it. The chamber cannot produce the intended tones without that mechanism. Although the parts arrived in different crates, the assembled object bears a maker's mark combining their names. The exhibition opens with a demonstration of ______ after the parts have been fitted together.",
      first: "Veda", second: "Tomas", noun: "instrument", plural: "instruments", ownership: "joint", number: "singular",
      ownershipCue: "a maker's mark combining their names",
      numberCue: "the assembled object",
      ownershipWhy: "The components made by Veda and Tomas belong to a finished instrument credited to them together.",
      numberWhy: "The chamber and tuning mechanism function as components of the assembled instrument, not as independently playable instruments.",
    },
    {
      scene: "sec-joint-possession-atlas-binding",
      text: "Dalia plotted the walking routes for a local atlas, while Chen supplied elevation profiles facing the route maps. A route and its profile continue across the folded sheets; page references connect the entire sequence. The binder enclosed the sequence between matching covers, and the title page credits Dalia and Chen as collaborators. The library has digitized ______ without separating the maps from their profiles.",
      first: "Dalia", second: "Chen", noun: "atlas", plural: "atlases", ownership: "joint", number: "singular",
      ownershipCue: "credits Dalia and Chen as collaborators",
      numberCue: "enclosed the sequence between matching covers",
      ownershipWhy: "Dalia's routes and Chen's profiles are complementary contributions to the atlas credited to them as collaborators.",
      numberWhy: "The connected sequence was bound into an atlas; the folded sheets are parts of that volume.",
    },
    {
      scene: "sec-joint-possession-rehearsal-films",
      text: "For a theater documentary, Mira supplied the pictures and Eli supplied the sound. Their editor paired the picture and sound files from the rehearsal, then repeated the process with footage from the opening night. The resulting films retain different titles and their own closing credits, which list Mira and Eli together. The film club screens this complete set of finished works, comprising ______, to trace changes in the performance.",
      first: "Mira", second: "Eli", noun: "film", plural: "films", ownership: "joint", number: "plural",
      ownershipCue: "closing credits, which list Mira and Eli together",
      numberCue: "retain different titles and their own closing credits",
      ownershipWhy: "Mira's pictures and Eli's sound contribute to the finished films, whose credits name the collaborators together.",
      numberWhy: "The rehearsal and opening-night material became separately titled films; the club compares those finished works.",
    },
    {
      scene: "sec-joint-possession-botanical-prints",
      text: "Ari engraved the outlines of a marsh plant, and Noa prepared the color layer for the same image. They followed that process again for a woodland plant. In the gallery, the marsh image and the woodland image hang in separate frames, with the combined studio signature beneath every image. The exhibition presents the resulting body of work in full, displaying ______ to show how line and color interact across the subjects.",
      first: "Ari", second: "Noa", noun: "print", plural: "prints", ownership: "joint", number: "plural",
      ownershipCue: "the combined studio signature beneath every image",
      numberCue: "the marsh image and the woodland image hang in separate frames",
      ownershipWhy: "Ari and Noa supplied complementary layers of every image, and the images bear their combined studio signature.",
      numberWhy: "The marsh image and woodland image are separately framed finished prints, not layers of the same print.",
    },
    {
      scene: "sec-joint-possession-tidal-models",
      text: "Suri shaped a model of a tidal gate, and Owen installed its working hinges. After testing it, they built a model of a spillway with the same division of labor. Neither model was dismantled to supply the other, and the workshop register lists the collaborators together as the makers of every surviving assembly. The panel's inspection covered the complete set of surviving assemblies, consisting of ______.",
      first: "Suri", second: "Owen", noun: "model", plural: "models", ownership: "joint", number: "plural",
      ownershipCue: "lists the collaborators together as the makers of every surviving assembly",
      numberCue: "Neither model was dismantled to supply the other",
      ownershipWhy: "Suri and Owen contributed to every assembly, and the register credits the completed models to them together.",
      numberWhy: "The gate and spillway remain distinct completed models available for comparison.",
    },
    {
      scene: "sec-separate-possession-competing-plans",
      text: "Tessa sent Kiran a tracing of her pier measurements, which he checked against his hillside notes. Tessa then expanded her sketch into a complete plan for a waterfront theater; Kiran developed his sketch into a complete plan for a hilltop theater. Their signatures certify responsibility only for their respective designs. The jury compared ______ before choosing where to build the theater.",
      first: "Tessa", second: "Kiran", noun: "plan", plural: "plans", ownership: "separate", number: "singular",
      ownershipCue: "responsibility only for their respective designs",
      numberCue: "Tessa then expanded her sketch into a complete plan",
      ownershipWhy: "Exchanging measurements did not combine the projects: Tessa is responsible for the waterfront design and Kiran for the hilltop design.",
      numberWhy: "Each sketch developed into a complete plan for its proposed site, so the comparison needs a singular plan after each designer's name.",
    },
    {
      scene: "sec-separate-possession-voyage-diaries",
      text: "During a voyage, Imani borrowed Pavel's pencil whenever hers broke. Otherwise, their writing routines differed: she recorded events in a clothbound notebook, while he filled a leatherbound notebook. Each continued in the same volume until the ship returned, and neither wrote in the other's pages. An archivist compared ______ to investigate their conflicting descriptions of the final storm.",
      first: "Imani", second: "Pavel", noun: "diary", plural: "diaries", ownership: "separate", number: "singular",
      ownershipCue: "neither wrote in the other's pages",
      numberCue: "Each continued in the same volume until the ship returned",
      ownershipWhy: "The travelers shared a pencil, but they maintained separate written accounts in their own notebooks.",
      numberWhy: "Imani continued in her clothbound volume and Pavel in his leatherbound volume throughout the voyage; neither account extends to additional diaries.",
    },
    {
      scene: "sec-separate-possession-woven-panels",
      text: "Hana and Joel used the same loom on alternate days. Hana kept extending a river pattern until it filled her hanging, while Joel kept extending a mountain pattern until it filled his. After they cut the finished hangings from their warps, they attached separate maker labels. The museum displayed ______ together, explaining that shared equipment can yield works with different visual rhythms.",
      first: "Hana", second: "Joel", noun: "tapestry", plural: "tapestries", ownership: "separate", number: "singular",
      ownershipCue: "they attached separate maker labels",
      numberCue: "until it filled her hanging",
      ownershipWhy: "Using the same loom did not make the finished works joint creations: Hana wove the river hanging and Joel the mountain hanging.",
      numberWhy: "The extended river pattern forms Hana's tapestry, and the extended mountain pattern forms Joel's tapestry; each pattern belongs to a continuous hanging.",
    },
    {
      scene: "sec-separate-possession-ceramic-dishes",
      text: "Lio and Mara shared a kiln but kept their clay and maker stamps apart. Lio shaped a shallow bowl and a serving platter, pressing a circle into the base of each. Mara made a star-stamped bowl and later a platter with the same star mark. The exhibition brought together ______, displaying the entire output of tableware from that firing and identifying the makers through their marks.",
      first: "Lio", second: "Mara", noun: "dish", plural: "dishes", ownership: "separate", number: "plural",
      ownershipCue: "kept their clay and maker stamps apart",
      numberCue: "Mara made a star-stamped bowl and later a platter",
      ownershipWhy: "The circle-stamped dishes are Lio's creations, and the star-stamped dishes are Mara's; sharing a firing did not combine authorship.",
      numberWhy: "Lio made a bowl and platter, and Mara also made a bowl and platter, so a plural noun is required for each maker's output.",
    },
    {
      scene: "sec-separate-possession-seasonal-posters",
      text: "Rina and Dev rented the same print shop for unrelated commissions. Rina designed a spring poster for a garden fair, then a summer poster for its next gathering. Dev produced a winter poster for a skating club and returned in autumn to design its next advertisement. Each signed only the designs for that artist's own client. The complete output of these commissions, consisting of ______, is preserved in folders labeled by client.",
      first: "Rina", second: "Dev", noun: "poster", plural: "posters", ownership: "separate", number: "plural",
      ownershipCue: "Each signed only the designs for that artist's own client",
      numberCue: "Rina designed a spring poster for a garden fair, then a summer poster",
      ownershipWhy: "Rina's garden-fair commission and Dev's skating-club commission produced work signed independently, despite the shared print shop.",
      numberWhy: "Rina produced spring and summer posters, while Dev produced winter and autumn posters, so each artist's folder contains posters in the plural.",
    },
    {
      scene: "sec-separate-possession-set-sketches",
      text: "For different productions at the same theater, Anya designed a forest set and later a courtyard set; Bruno designed a kitchen set and later a rooftop set. They exchanged advice about lighting, but each drew and signed the sketch for every set that artist had designed. The retrospective presents the complete record of those set designs in the form of ______, allowing visitors to follow each designer's changing use of space.",
      first: "Anya", second: "Bruno", noun: "sketch", plural: "sketches", ownership: "separate", number: "plural",
      ownershipCue: "each drew and signed the sketch for every set that artist had designed",
      numberCue: "Anya designed a forest set and later a courtyard set",
      ownershipWhy: "The sketches were drawn and signed by their respective designers; exchanging lighting advice did not make them jointly authored works.",
      numberWhy: "Anya sketched the forest and courtyard sets, while Bruno sketched the kitchen and rooftop sets, so each designer is represented by sketches in the plural.",
    },
  ];

  const jointSeparatePossession = {
    id: "sec-joint-separate-possession",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: "Form, Structure, and Sense",
    subskill: "possessives and plurals",
    difficulty: "Medium",
    title: "Joint work and separately attributed work",
    recognize: "Reconstruct how the contributions belong to finished works, then decide whether the shared work, or each maker's independent output, requires a singular or plural noun.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["grammatical-but-illogical", "part-vs-whole", "context-constraint"],
    build(t) {
      const topic = t.pick(JOINT_SEPARATE_POSSESSION_TOPICS);
      const rows = [];
      ["joint", "separate"].forEach((ownership) => ["singular", "plural"].forEach((number) => {
        const noun = number === "singular" ? topic.noun : topic.plural;
        const text = ownership === "joint"
          ? `${topic.first} and ${topic.second}'s jointly created ${noun}`
          : `${topic.first}'s ${noun} and ${topic.second}'s separate ${noun}`;
        const errors = [];
        if (ownership !== topic.ownership) errors.push(topic.ownershipWhy);
        if (number !== topic.number) errors.push(topic.numberWhy);
        rows.push([text, { ownership, ownedNumber: number }, errors.length
          ? `This wording is grammatical, but it does not describe the works in the passage. ${errors.join(" ")}`
          : null]);
      }));
      const choices = square(rows);
      const ownershipRule = topic.ownership === "joint"
        ? `Treat ${topic.first} and ${topic.second} as a coordinated owner of the shared work, with the possessive ending on the final name.`
        : `Give each maker a separate possessive phrase and its own head noun.`;
      const instance = {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "text", content: topic.text },
        stem: STEM,
        ...choices,
        explanation: `${topic.ownershipWhy} ${topic.numberWhy} ${ownershipRule} The wording is therefore “${choices.correct}.”`,
        steps: [
          `Trace the contributions to the completed works: ${topic.ownershipWhy}`,
          `Count completed works within the shared project or within each maker's output: ${topic.numberWhy}`,
          `${ownershipRule} Use the ${topic.number} form “${topic.number === "singular" ? topic.noun : topic.plural}.”`,
        ],
        principles: [
          "A coordinated possessive such as “A and B's jointly created work” groups the named people as joint creators. Separate possessive phrases can attribute independent works to their respective creators.",
          "The head noun counts finished works, not creators, parts, tools, or contributions. With repeated separate possessive phrases, determine the number within each creator's output.",
        ],
        trap: "Treating separate contributions or components as separate completed works, or assuming that shared equipment or advice makes independently credited works joint creations.",
        hint: "Which pieces became completed works, and whose contribution is credited on each finished work?",
        estimatedSeconds: 85,
      };
      // Structural and authored-evidence checks only: these cannot establish
      // whether a passage's ownership inference is uniquely defensible.
      instance.verify = () => {
        const all = [instance.correct, ...instance.wrong.map(([text]) => text)];
        const noun = topic.number === "singular" ? topic.noun : topic.plural;
        const expected = topic.ownership === "joint"
          ? `${topic.first} and ${topic.second}'s jointly created ${noun}`
          : `${topic.first}'s ${noun} and ${topic.second}'s separate ${noun}`;
        return topic.text.split(BLANK).length === 2 && topic.text.length >= 150 && topic.text.length <= 900 &&
          topic.text.includes(topic.first) && topic.text.includes(topic.second) &&
          topic.text.includes(topic.ownershipCue) && topic.text.includes(topic.numberCue) &&
          ["joint", "separate"].includes(topic.ownership) && ["singular", "plural"].includes(topic.number) &&
          new Set(all).size === 4 && all.every((text) => text.split(/\s+/).length === 6) &&
          instance.correct === expected && isSquare(instance.features);
      };
      return instance;
    },
  };

  /* -------------------- aspect and voice from reconstructed events */

  // These original scenes hold tense constant (past). The two decisions
  // are perfect versus progressive aspect and active versus passive voice.
  // Each exchange is unique in its scene: a completed earlier event cannot
  // be supplied from an imagined second encounter. The timeline and actor
  // annotations record an editorial reading, not machine-proved semantics.
  /* -------------------- aspect and voice from reconstructed events */

  // These original scenes hold tense constant (past). The two decisions
  // are perfect versus progressive aspect and active versus passive voice.
  // Each exchange is unique in its scene: a completed earlier event cannot
  // be supplied from an imagined second encounter. The timeline and actor
  // annotations record an editorial reading, not machine-proved semantics.
  const ASPECT_RECONSTRUCTION_TOPICS = [
    {
      scene: "sec-reconstruction-projectionist-audio",
      text: "An archive listed a film director and a retired projectionist as interview participants without identifying their roles. The audio opens with the director asking the first question. At a power cut, the projectionist's response breaks off after the word 'because'; the restored track resumes with the rest of that sentence and then moves through five further topics. At the instant the power failed, the director ______ on all six topics listed for their sole interview.",
      subject: "the director", other: "the projectionist", participle: "interviewed", progressive: "interviewing", be: "was",
      actor: "subject", timeline: { start: 0, reference: 1, end: 2 },
      roleEvidence: ["the director asking the first question", "the projectionist's response"],
      timeEvidence: ["breaks off after the word 'because'", "resumes with the rest of that sentence"],
      roleWhy: "The director asks and the projectionist answers, so the director conducts the interview rather than receives it.",
      timeWhy: "The break divides the first answer, and the other five topics follow its continuation. The sole six-topic interview is underway at the cut; the director cannot yet have interviewed the projectionist on all six topics.",
      lure: "Treating the recovered interview as a completed past event instead of locating the power cut inside it, or treating both listed participants as interviewees.",
    },
    {
      scene: "sec-reconstruction-gesture-contact-sheet",
      text: "Both a theater director and a visiting actor wore microphones at a workshop. A numbered contact sheet shows the actor demonstrating three gestures and the director imitating each one. The audio has the director requesting instruction and the actor correcting the director's hand positions. The last frame shows the director performing all three unaided; the next strip shows the actor boarding a tram. A street recording places the rehearsal bell during that tram's journey away from the theater. When the bell rang, the director ______ in the workshop's only lesson on those gestures.",
      subject: "the director", other: "the visiting actor", participle: "coached", progressive: "coaching", be: "was",
      actor: "other", timeline: { start: 0, reference: 3, end: 2 },
      roleEvidence: ["the director requesting instruction", "the actor correcting the director's hand positions"],
      timeEvidence: ["the actor boarding a tram", "during that tram's journey away from the theater"],
      roleWhy: "The director requests instruction, and the actor responds with corrections to the director's hand positions. Those directed corrections establish the actor as coach and the director as learner; imitation alone would not establish those roles.",
      timeWhy: "The lesson's demonstration and independent performance precede the actor's departure; the bell sounds during the subsequent tram journey. The lesson is over at the bell.",
      lure: "Assuming a director must coach an actor, or attaching the bell to the workshop because both appear in the reconstructed account.",
    },
    {
      scene: "sec-reconstruction-depot-route",
      text: "A depot's silent security film seemed to show a porter following a visiting engineer through a service passage. The film had been digitized backward: a falling glove rises into a hand. Played forward, it shows the porter pointing out each turn and the engineer following to the exit. The engineer's taxi then clears the gate as a wall clock changes to noon. The evacuation alarm sounded at noon. When it sounded, the porter ______ through the passage on their only trip together.",
      subject: "the porter", other: "the engineer", participle: "guided", progressive: "guiding", be: "was",
      actor: "subject", timeline: { start: 0, reference: 3, end: 2 },
      roleEvidence: ["the porter pointing out each turn", "the engineer following to the exit"],
      timeEvidence: ["The film had been digitized backward", "The engineer's taxi then clears the gate"],
      roleWhy: "Correcting the film's direction shows the porter indicating each turn and the engineer following those directions. The porter supplies the guidance through the passage.",
      timeWhy: "In the corrected sequence, the pair reach the exit and the engineer leaves in a taxi. The alarm coincides with the later departure through the gate, so the shared trip is earlier and complete.",
      lure: "Trusting the apparent roles in the reversed film, or treating the alarm as an interruption of a journey that ended earlier in the corrected sequence.",
    },
    {
      scene: "sec-reconstruction-captain-route-exercise",
      text: "For a navigation exercise, a harbor captain and a new apprentice exchanged their usual responsibilities. The apprentice kept the route card; the captain could see only the apprentice's hand signals through a narrow visor. A jammed gate stopped the pair at marker four. Their next logged position was marker five, reached after the same gate reopened; the route ended at marker eight. At the stoppage, the captain ______ through the entire eight-marker route for the first time.",
      subject: "the captain", other: "the apprentice", participle: "guided", progressive: "guiding", be: "was",
      actor: "other", timeline: { start: 0, reference: 1, end: 2 },
      roleEvidence: ["The apprentice kept the route card", "only the apprentice's hand signals"],
      timeEvidence: ["stopped the pair at marker four", "the route ended at marker eight"],
      roleWhy: "The apprentice has the directions and gives the signals; the captain depends on those signals and therefore receives the guidance.",
      timeWhy: "The stoppage occurs at marker four, with the same journey continuing through marker five toward marker eight. The first journey is incomplete at the gate.",
      lure: "Giving the captain the guiding role by rank, or reading the pause as the end of a trip that actually resumes farther along the same route.",
    },
    {
      scene: "sec-reconstruction-illustrator-assessment",
      text: "A novelist and an illustrator met once for a fellowship assessment. The surviving folder contains the illustrator's portfolio and the novelist's signed judgments of its strengths and weaknesses, each supporting a score. A courier scanned the sealed folder at the office, then carried it to the selection hall. The hall's clock began striking during the courier's walk. The rules required all scoring to be inside the sealed folder. When the clock struck, the novelist ______ for the fellowship.",
      subject: "the novelist", other: "the illustrator", participle: "evaluated", progressive: "evaluating", be: "was",
      actor: "subject", timeline: { start: 0, reference: 3, end: 2 },
      roleEvidence: ["the illustrator's portfolio", "the novelist's signed judgments of its strengths and weaknesses"],
      timeEvidence: ["scanned the sealed folder at the office", "during the courier's walk"],
      roleWhy: "The portfolio is the illustrator's work, and the judgments of its strengths and weaknesses are signed as the novelist's. The novelist therefore evaluates the illustrator, rather than merely recording someone else's scores.",
      timeWhy: "All scoring must precede sealing. The sealed folder is scanned before the courier walks to the hall, and the clock strikes during that walk, placing the completed assessment earlier.",
      lure: "Assigning the evaluator's role from the names on the folder without reading what each contributed, or treating the striking clock as part of the scoring session.",
    },
    {
      scene: "sec-reconstruction-restorer-portrait",
      text: "A restorer and a studio assistant arranged one portrait exposure on a large camera. The camera belonged to the restorer, but a mirror in the setup shows the assistant pressing its shutter release and the restorer posing against the backdrop. The shutter log records 'open,' a light failure, and then 'close'; there is no second opening. The portrait required the whole exposure. When the light failed, the restorer ______ for that portrait.",
      subject: "the restorer", other: "the assistant", participle: "photographed", progressive: "photographing", be: "was",
      actor: "other", timeline: { start: 0, reference: 1, end: 2 },
      roleEvidence: ["the assistant pressing its shutter release", "the restorer posing against the backdrop"],
      timeEvidence: ["'open,' a light failure, and then 'close'", "The portrait required the whole exposure"],
      roleWhy: "The assistant operates the shutter and the restorer poses. Camera ownership does not make the restorer the photographer.",
      timeWhy: "The single exposure begins before the light failure and closes afterward. Since that entire exposure makes the portrait, the photographing is in progress at the failure.",
      lure: "Confusing ownership of the camera with operation of it, or treating an opened shutter as a completed portrait exposure.",
    },
    {
      scene: "sec-reconstruction-conductor-cue-card",
      text: "After a rehearsal, a conductor and a stagehand held one briefing on unfamiliar emergency cues. The conductor asked the stagehand for an explanation of each signal, then repeated the stagehand's instructions back to check understanding. A recorder caught their closing exchange, followed by the stagehand leaving for a lighting booth. The stagehand triggered the test siren from that booth. At the siren's first note, the conductor ______ about the emergency cues.",
      subject: "the conductor", other: "the stagehand", participle: "briefed", progressive: "briefing", be: "was",
      actor: "other", timeline: { start: 0, reference: 3, end: 2 },
      roleEvidence: ["asked the stagehand for an explanation", "repeated the stagehand's instructions back to check understanding"],
      timeEvidence: ["their closing exchange", "triggered the test siren from that booth"],
      roleWhy: "The conductor requests explanations and repeats the stagehand's instructions to check understanding. The stagehand supplies the information the conductor is learning, so the conductor receives the briefing.",
      timeWhy: "The exchange closes, the stagehand leaves for the booth, and only there triggers the siren. The briefing precedes the siren rather than continuing through it.",
      lure: "Assuming the conductor instructs everyone involved in a rehearsal, or taking the siren test as evidence that the earlier spoken briefing is in progress.",
    },
    {
      scene: "sec-reconstruction-workshop-lathe",
      text: "A supervisor and a recently hired machinist held one lathe session covering a checklist of procedures. The supervisor's notes request help with each setting; the machinist's recorded replies give directions and corrections for the supervisor to follow. A tripped breaker split the third demonstration between two video files. The second file begins with the machinist's hand in exactly the position shown at the end of the first, and the checklist's final demonstrations follow. When the breaker tripped, the machinist ______ on every procedure in the checklist.",
      subject: "the machinist", other: "the supervisor", participle: "trained", progressive: "training", be: "was",
      actor: "subject", timeline: { start: 0, reference: 1, end: 2 },
      roleEvidence: ["The supervisor's notes request help with each setting", "the machinist's recorded replies give directions and corrections for the supervisor to follow"],
      timeEvidence: ["split the third demonstration between two video files", "the checklist's final demonstrations follow"],
      roleWhy: "The supervisor requests help, and the machinist responds with directions and corrections that the supervisor is to follow. The machinist provides the instruction; this is not merely a record of a trainee demonstrating a skill.",
      timeWhy: "The two files continue one interrupted demonstration, with the checklist's later demonstrations to follow. Training on every procedure therefore remains in progress at the breaker trip.",
      lure: "Taking supervisory rank as evidence of who provides training, or interpreting separate video files as separate, completed sessions.",
    },
    {
      scene: "sec-reconstruction-guide-film-canister",
      text: "A walking-tour guide and a visiting student made one film of the route. The student appears at the landmarks and reads their names toward the lens; reflections show the guide operating the camera and adjusting its focus. A lab receipt shows that the film canister entered processing before a storm warning interrupted the lab's radio. The camera had held only that canister, which could not be removed during filming. When the warning began, the guide ______ along the route.",
      subject: "the guide", other: "the visiting student", participle: "filmed", progressive: "filming", be: "was",
      actor: "subject", timeline: { start: 0, reference: 3, end: 2 },
      roleEvidence: ["reads their names toward the lens", "the guide operating the camera and adjusting its focus"],
      timeEvidence: ["the film canister entered processing", "could not be removed during filming"],
      roleWhy: "The student performs in front of the lens, while the guide operates and focuses the camera. These actions establish the guide as the person filming the student, not merely someone standing near the equipment.",
      timeWhy: "The sole canister must leave the camera after filming and reach the lab before processing. Its processing precedes the warning, so filming is over when the warning interrupts the radio.",
      lure: "Assuming the guide is the person on camera, or transferring the radio's interruption to filming that the physical canister's location places earlier.",
    },
    {
      scene: "sec-reconstruction-programmer-accessibility",
      text: "A programmer and a librarian took part in a library's first catalog-interface trial. The librarian read prompts from a concealed sheet and marked the programmer's responses against an answer key; the programmer entered the requested searches without seeing it. A network failure left the fifth task's result blank. The restored session opened on that same task, with five more tasks in the trial untouched. At the failure, the programmer ______ on all ten search tasks in the trial.",
      subject: "the programmer", other: "the librarian", participle: "tested", progressive: "testing", be: "was",
      actor: "other", timeline: { start: 0, reference: 1, end: 2 },
      roleEvidence: ["The librarian read prompts from a concealed sheet", "marked the programmer's responses against an answer key"],
      timeEvidence: ["left the fifth task's result blank", "five more tasks in the trial untouched"],
      roleWhy: "The librarian supplies the prompts and checks the programmer's responses against the key. The programmer answers those prompts, establishing that the librarian administers the test to the programmer.",
      timeWhy: "The restored session resumes the interrupted fifth task, with half of the first trial still unattempted. Testing on all ten tasks is underway, not complete, at the network failure.",
      lure: "Assuming the programmer must be testing the librarian, or treating the interruption as if the whole first trial were complete.",
    },
    {
      scene: "sec-reconstruction-mediator-transcript",
      text: "A mediator and a council scribe met once to clarify a disputed meeting record. Their transcript labels the scribe's lines with question numbers and the mediator's lines with matching answer numbers. Its final page carries both signatures. The signed pages went into a locked display case, which a fallen ceiling tile later shattered. At the crash, the mediator ______ about the disputed record in that meeting.",
      subject: "the mediator", other: "the scribe", participle: "questioned", progressive: "questioning", be: "was",
      actor: "other", timeline: { start: 0, reference: 3, end: 2 },
      roleEvidence: ["the scribe's lines with question numbers", "the mediator's lines with matching answer numbers"],
      timeEvidence: ["Its final page carries both signatures", "went into a locked display case"],
      roleWhy: "The scribe's numbered questions pair with the mediator's answers, so the mediator receives the questioning.",
      timeWhy: "The encounter reaches its signed final transcript, which is then locked in a case. The later crash damages that stored record; it does not interrupt the questioning itself.",
      lure: "Giving the mediator the questioning role by title, or confusing damage to the preserved transcript with an interruption of the encounter it records.",
    },
    {
      scene: "sec-reconstruction-librarian-broadcast",
      text: "A broadcast log lists a poet and a librarian as speakers but gives no running order. On the sole opening announcement, the voice identifies its owner as the librarian and begins the poet's biography. A transmitter reset divides the last sentence between two files. The poet's first words, thanking the librarian for the introduction, follow the continuation in the second file. At the reset, the librarian ______ to the audience with the complete prepared biography.",
      subject: "the librarian", other: "the poet", participle: "introduced", progressive: "introducing", be: "was",
      actor: "subject", timeline: { start: 0, reference: 1, end: 2 },
      roleEvidence: ["identifies its owner as the librarian", "thanking the librarian for the introduction"],
      timeEvidence: ["divides the last sentence between two files", "follow the continuation in the second file"],
      roleWhy: "The librarian speaks the biography, and the poet subsequently thanks the librarian. The librarian introduces the poet.",
      timeWhy: "The reset splits the only opening announcement's final sentence. The complete prepared biography is not delivered until the sentence continues in the second file; the introduction with that full biography is in progress at the reset.",
      lure: "Treating the first file as a complete introduction, or assuming the poet speaks first because the log lists the poet first.",
    },
  ];

  function aspectReconstructionForms(topic) {
    return {
      "perfect|active": `had ${topic.participle} ${topic.other}`,
      "perfect|passive": `had been ${topic.participle} by ${topic.other}`,
      "progressive|active": `${topic.be} ${topic.progressive} ${topic.other}`,
      "progressive|passive": `${topic.be} being ${topic.participle} by ${topic.other}`,
    };
  }

  const aspectEventReconstruction = {
    id: "sec-aspect-event-reconstruction",
    sectionKey: "sat-reading-writing",
    domain: DOMAIN,
    skill: "Form, Structure, and Sense",
    subskill: "verb form",
    difficulty: "Hard",
    title: "Verb aspect and voice in reconstructed events",
    recognize: "Reconstruct the event's relation to the reference moment and identify which participant acts on the other. An interruption in a record need not interrupt the event the record describes.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["grammatical-but-illogical", "context-constraint"],
    build(t) {
      const topic = t.pick(ASPECT_RECONSTRUCTION_TOPICS);
      const aspect = topic.timeline.end < topic.timeline.reference ? "perfect" : "progressive";
      const voice = topic.actor === "subject" ? "active" : "passive";
      const forms = aspectReconstructionForms(topic);
      const choices = square(Object.entries(forms).map(([corner, form]) => {
        const [candidateAspect, candidateVoice] = corner.split("|");
        const errors = [];
        if (candidateAspect !== aspect) {
          errors.push(candidateAspect === "perfect"
            ? `The past perfect treats this particular exchange as anterior to the reference point, but the passage locates the reference point within the unfinished exchange. ${topic.timeWhy}`
            : `The progressive places the exchange in progress at the reference point. ${topic.timeWhy}`);
        }
        if (candidateVoice !== voice) {
          errors.push(candidateVoice === "passive"
            ? `The passive makes ${topic.subject} the recipient of the action. ${topic.roleWhy}`
            : `The active makes ${topic.subject} the performer of the action. ${topic.roleWhy}`);
        }
        return [form, { aspect: candidateAspect, voice: candidateVoice }, errors.length ? errors.join(" ") : null];
      }));
      const instance = {
        responseType: "multiple-choice",
        scene: topic.scene,
        stimulus: { type: "text", content: topic.text },
        stem: STEM,
        ...choices,
        explanation: `${topic.timeWhy} ${topic.roleWhy} The ${aspect === "perfect" ? "past perfect" : "past progressive"} ${voice} form is “${choices.correct}.”`,
        steps: [
          `Use the sequence of evidence to locate the exchange relative to the reference moment. ${topic.timeWhy}`,
          `Identify the actor from the participants' contributions, not their titles. ${topic.roleWhy}`,
          `Combine ${aspect === "perfect" ? "past perfect aspect for the earlier completed event" : "past progressive aspect for the event underway at that moment"} with ${voice} voice: “${choices.correct}.”`,
        ],
        principles: [
          "The past progressive presents an event as underway at a past reference moment. The past perfect looks back from that moment to an earlier event; in these single-event contexts, the evidence establishes whether the event is complete.",
          "Active voice makes the subject the actor; passive voice makes the subject the recipient. Both can be grammatical, but the passage must support the assigned roles.",
          "A recording's sequence, a participant's title, and an interruption mentioned elsewhere do not by themselves establish an event's chronology or its participants' roles.",
        ],
        trap: topic.lure,
        hint: "Locate the interruption or reference moment within the reconstructed sequence. Then ask whose actions show who is doing what to whom.",
        estimatedSeconds: 95,
      };
      instance.verify = () => {
        const event = topic.timeline;
        const annotationsFit = event.start < event.end &&
          (event.end < event.reference || (event.start < event.reference && event.reference < event.end));
        const derivedCorner = `${event.end < event.reference ? "perfect" : "progressive"}|${topic.actor === "subject" ? "active" : "passive"}`;
        const offered = [instance.correct, ...instance.wrong.map(([form]) => form)];
        // Structural and annotation checks only: editorial review must
        // establish that the quoted evidence warrants these annotations.
        return annotationsFit && ["subject", "other"].includes(topic.actor) &&
          topic.text.split(BLANK).length === 2 && topic.text.length >= 150 && topic.text.length <= 900 &&
          [...topic.roleEvidence, ...topic.timeEvidence].every((evidence) => topic.text.includes(evidence)) &&
          instance.correct === forms[derivedCorner] && new Set(offered).size === 4 &&
          offered.every((form) => Object.values(forms).includes(form)) &&
          Object.entries(forms).every(([corner, form]) =>
            /^had /.test(form) === corner.startsWith("perfect|") &&
            / by /.test(form) === corner.endsWith("|passive")) && isSquare(instance.features);
      };
      return instance;
    },
  };

  const PRONOUN_COMPARISON_TOPICS = [
  {
    "scene": "sec-comparison-boxed-edition-postage",
    "text": "A small press once charged one promotional delivery fee for every order. After the promotion ended, it priced each parcel separately. The press now sells a travel volume, a history volume, and a boxed edition containing both, sent as one parcel. Using the boxed edition as the current benchmark, an editor found that the delivery charges for the separate volumes were each lower than ______.",
    "holder": "the boxed edition",
    "construction": "attribute",
    "number": "singular",
    "referent": "the current delivery charge for the one boxed edition",
    "why": "The comparison uses the boxed edition's current charge, not the explicitly mentioned promotional fee from the past. Each separate volume's charge is compared with the one charge for the box.",
    "numberError": "The current benchmark is the one delivery charge for a boxed edition shipped as one parcel; a plural form cannot denote that single charge.",
    "constructionError": "A direct pronoun could point to the old promotional fee, but the text selects the boxed edition's current delivery charge instead. That corresponding charge must be supplied through the comparison."
  },
  {
    "scene": "sec-comparison-blower-rating",
    "text": "A laboratory specified a minimum capacity rating for admission to a blower trial. That threshold merely screened the machines; the final report evaluated improvements over the original prototype. The prototype's two rotors always operated together as one unit. On the report's comparison chart, the capacity ratings of two newer blowers were placed above ______.",
    "holder": "the prototype",
    "construction": "attribute",
    "number": "singular",
    "referent": "the prototype's single capacity rating",
    "why": "The minimum rating is only an admission threshold. The final chart uses the prototype's rating, and its two coupled rotors form one tested unit rather than two independently rated machines.",
    "numberError": "The prototype is tested as one unit, so its one capacity rating requires a singular comparison term, despite the presence of two rotors.",
    "constructionError": "A direct pronoun could recover the admission threshold, but the report expressly compares improvements over the prototype. The second term must supply the prototype's corresponding rating."
  },
  {
    "scene": "sec-comparison-stage-chime-timing",
    "text": "A stage manager initially proposed two unequal pause durations for a scene change. The director set both suggestions aside and asked that every pause last exactly as long as a recorded chime. Its several notes were played as one uninterrupted cue. After rehearsal, the durations of two silences elsewhere in the play both equaled ______.",
    "holder": "the recorded chime",
    "construction": "attribute",
    "number": "singular",
    "referent": "the duration of the entire recorded chime",
    "why": "The director replaces the two proposed durations with the chime as the timing standard. The several notes make one cue with one duration, so both silence durations are compared with that single duration.",
    "numberError": "The selected chime is one uninterrupted cue with one duration; a plural form cannot denote that single benchmark.",
    "constructionError": "A direct pronoun could return to the two proposed pause durations, but those suggestions were set aside. The comparison must instead supply the duration of the chosen chime."
  },
  {
    "scene": "sec-comparison-cargo-rental-fees",
    "text": "A delivery cooperative advertised a standard daily rental fee before adding a cargo bicycle and two handcarts to its fleet. The new vehicles were priced individually, so the advertised figure no longer applied to them. The compact handcart was cheaper to hire than the oversized one; they were rented separately, never as a pair. A customer choosing among these vehicles found that the bicycle's daily rental fee was lower than ______, whichever handcart was considered.",
    "holder": "the two handcarts",
    "construction": "attribute",
    "number": "plural",
    "referent": "the separate daily rental fees for the two handcarts",
    "why": "The old advertised fee does not apply. The bicycle's one fee is compared with a separate fee for each independently rented handcart, not with a combined rental for the pair.",
    "numberError": "The intended benchmarks are two separate fees for independently rented handcarts that differ in price; they require a plural comparison term.",
    "constructionError": "A direct pronoun could refer to the old advertised fee, but the customer is comparing the new vehicles' individual fees. The comparison must supply the handcarts' corresponding fees."
  },
  {
    "scene": "sec-comparison-screen-slit-lengths",
    "text": "A paper artist marked one target length on a sketch before cutting three slits into a screen. During cutting, the design changed: the outer slits became unequal, and the center slit was made longer than either of them. Checking the finished openings against one another rather than against the sketch, the artist found that the center slit's length exceeded ______ by different amounts.",
    "holder": "the outer slits",
    "construction": "attribute",
    "number": "plural",
    "referent": "the separate lengths of the two outer slits",
    "why": "The final check compares the openings with one another, so the sketch's target length is no longer the benchmark. The two unequal outer slits supply two different lengths for comparison with the center length.",
    "numberError": "The intended benchmarks are the two unequal outer lengths considered separately; they require a plural comparison term.",
    "constructionError": "A direct pronoun could refer to the target length on the sketch, but the final check explicitly concerns the finished openings. Their corresponding lengths must be supplied instead."
  },
  {
    "scene": "sec-comparison-paint-drying-times",
    "text": "A painter used a fixed drying time when planning a demonstration. In a later trial, however, the goal was to compare a mixed paint with its ingredients, not to test the schedule. Samples of the two ingredients dried at different speeds in separate dishes. The trial showed that the mixture's drying time was shorter than ______.",
    "holder": "the two ingredients",
    "construction": "attribute",
    "number": "plural",
    "referent": "the two individual drying times of the ingredients",
    "why": "The trial compares the mixture with the ingredients, while the fixed planning time belongs to a different question. Because the ingredients dry at different speeds in separate dishes, the second term consists of two individual drying times.",
    "numberError": "The two independently tested ingredients dry at different speeds and supply two separate times, so the comparison requires a plural term.",
    "constructionError": "A direct pronoun could refer to the fixed planning time, but the passage says the trial concerns the ingredients instead of the schedule. Their corresponding drying times must be recovered."
  },
  {
    "scene": "sec-comparison-clock-props",
    "text": "A touring theater approved one maximum height for freestanding props. A clock built for the company's permanent stage exceeded this limit and therefore could not travel with the production. When two smaller replacement clocks were made for the tour, their heights both exactly matched ______, allowing the crew to load them without tilting them.",
    "holder": "the permanent-stage clock",
    "construction": "direct",
    "number": "singular",
    "referent": "the single approved maximum height for touring props",
    "why": "The replacements must meet the touring limit. The permanent-stage clock exceeds that limit, so copying its height would not solve the transport problem. The already stated maximum height is singular and is recovered with it.",
    "numberError": "The intended benchmark is one approved maximum height, even though two replacement clocks must meet it; it requires a singular pronoun.",
    "constructionError": "The elliptical construction would recover the height or heights of the permanent-stage clock. That clock exceeds the limit, so its height is the wrong benchmark for the replacements."
  },
  {
    "scene": "sec-comparison-notebook-replicas",
    "text": "Before a notebook was treated, a conservator recorded its cover's original color in a single reference swatch. The treatment darkened the notebook, but the museum wanted replicas to show its earlier appearance. The two replicas' cover colors were therefore adjusted to match ______, with the treated notebook used only to check the binding.",
    "holder": "the treated notebook",
    "construction": "direct",
    "number": "singular",
    "referent": "the one original cover color recorded before treatment",
    "why": "The replicas are meant to show the earlier appearance, whose color has already been named. The treated notebook now has a darker color and is consulted only for its binding. It recovers the single original color rather than introducing the treated notebook's color.",
    "numberError": "The preserved benchmark is one original cover color; it requires a singular pronoun even though the two replicas have separate covers.",
    "constructionError": "The elliptical construction would supply the treated notebook's cover color or colors. Those would represent the darker appearance that the replicas are specifically not meant to reproduce."
  },
  {
    "scene": "sec-comparison-assembled-counterweight",
    "text": "A workshop specified one required mass for a set of identical test baskets. Its assembled counterweight had once embodied that specification, but a repair added extra metal and made the counterweight too heavy. In the next inspection, the baskets' masses were compared with the written specification; both masses equaled ______.",
    "holder": "the assembled counterweight",
    "construction": "direct",
    "number": "singular",
    "referent": "the one required mass in the written specification",
    "why": "The repaired counterweight is too heavy, so it no longer embodies the requirement. The comparison uses the required mass already named in the written specification, which is one value even though two baskets are tested.",
    "numberError": "The written specification gives one required mass for the identical baskets; that one benchmark requires a singular pronoun.",
    "constructionError": "The elliptical construction would recover the counterweight's mass or masses. The repaired counterweight is too heavy, so its mass cannot be the value the baskets are said to meet."
  },
  {
    "scene": "sec-comparison-pamphlet-translation",
    "text": "A publisher set two page-count limits for an anthology, one for each printing format. Three later pamphlets were exempt from both limits and became much longer. An editor checked a newly translated anthology against the two format rules and found that its page count exceeded ______, requiring cuts regardless of which format was chosen.",
    "holder": "the later pamphlets",
    "construction": "direct",
    "number": "plural",
    "referent": "the two page-count limits for the anthology formats",
    "why": "The editor checks the two format rules, not the exempt pamphlets. One anthology's page count is compared with both already named limits, so them recovers the two relevant benchmarks.",
    "numberError": "The check covers both format limits and requires cuts under either rule, so the intended second term is plural.",
    "constructionError": "The elliptical construction would supply the page count or page counts of the later pamphlets. Those publications are exempt from the limits and are not the standards used to require cuts."
  },
  {
    "scene": "sec-comparison-tapestry-flags",
    "text": "A weaver saved two contrasting colors in a small sample before dyeing a pair of ceremonial flags. The flags faded unevenly during an outdoor exhibition. For a new tapestry, the designer requested the original contrast rather than the faded appearance; on inspection, the tapestry's two main colors closely resembled ______.",
    "holder": "the exhibited flags",
    "construction": "direct",
    "number": "plural",
    "referent": "the two original contrasting colors preserved in the sample",
    "why": "The tapestry is meant to recover the original contrast, so its colors are compared with the two colors already preserved in the sample. The exhibited flags have faded and no longer provide the requested appearance.",
    "numberError": "The requested contrast involves two original colors preserved in the sample, so the intended second term is plural.",
    "constructionError": "The elliptical construction would recover colors of the exhibited flags. Those colors have faded, whereas the designer explicitly requests the original pair."
  },
  {
    "scene": "sec-comparison-clay-hull-models",
    "text": "A model maker recorded two maximum drafts for boats assigned to different shallow channels. Two older hulls were too deep for either channel and served only as examples of shapes to avoid. Checking a new hull against the navigation limits, the model maker found that its draft was below ______, qualifying the design for both channels.",
    "holder": "the older hulls",
    "construction": "direct",
    "number": "plural",
    "referent": "the two maximum drafts allowed by the channels",
    "why": "The qualifying comparison uses both channel limits already stated, not the drafts of the unsuitable older hulls. The new draft is one value, but them recovers the two standards it must satisfy.",
    "numberError": "The conclusion concerns compliance with both channel limits, so the intended second term is plural even though the new hull has one draft.",
    "constructionError": "The elliptical construction would recover the drafts of the older hulls. Merely being shallower than those unsuitable hulls would not establish compliance with either channel's limit."
  }
];

  const pronounComparisonReferent = {
    id: "sec-pronoun-comparison-referent", sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: "Form, Structure, and Sense", subskill: "pronoun agreement", difficulty: "Hard",
    title: "Recover the second term of a comparison",
    recognize: "Determine whether the comparison concerns a corresponding attribute or an explicitly named earlier benchmark. Then reconstruct whether its second term is one benchmark or several; it need not have the same number as the first term.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["grammatical-but-illogical", "part-vs-whole", "agreement-attractor"],
    build(t) {
      const topic = t.pick(PRONOUN_COMPARISON_TOPICS);
      const forms = {
        "attribute|singular": "that of " + topic.holder,
        "attribute|plural": "those of " + topic.holder,
        "direct|singular": "it",
        "direct|plural": "them",
      };
      const choices = square(Object.entries(forms).map(([corner, text]) => {
        const [referenceConstruction, number] = corner.split("|");
        const errors = [];
        if (referenceConstruction !== topic.construction) errors.push(topic.construction === "attribute"
          ? `A direct pronoun refers back to a stated antecedent; this comparison instead requires ${topic.referent}, recovered as the corresponding attribute of ${topic.holder}. ${topic.why}`
          : topic.constructionError);
        if (number !== topic.number) errors.push(topic.numberError);
        return [text, { referenceConstruction, number }, errors.length ? errors.join(" ") : null];
      }));
      const instance = {
        responseType: "multiple-choice", scene: topic.scene,
        stimulus: { type: "text", content: topic.text }, stem: STEM,
        ...choices,
        explanation: topic.why + " The second term is " + topic.referent + ", so use “" + choices.correct + ".”",
        steps: [
          "Identify the intended comparison standard from the passage, including any earlier proposal or later object that the passage excludes.",
          "Recover the exact second term from the context: " + topic.referent + ".",
          "Use that/those of for the corresponding attribute, or it/them for an explicitly named benchmark; choose number from that second term, not automatically from the first term. " + topic.why,
        ],
        principles: [
          "A comparison must recover the intended benchmark: a named earlier measurement and the corresponding measurement of a later object may be different values.",
          "In comparative ellipsis, that or those can replace an understood noun such as charge or charges. Their number reflects the recovered comparison term.",
          "A personal pronoun can recover an already named measurement or quality. Its number depends on that antecedent, not on the other term in the comparison.",
        ],
        trap: "Copying the number of the first term, or choosing a grammatical comparison with a benchmark that the passage has replaced or excluded.",
        hint: "Spell out the second half of the comparison without pronouns. How many benchmarks does the passage actually establish?",
        estimatedSeconds: 90,
      };
      // This guard checks structure and authored data consistency; it does
      // not independently establish the comparison's intended meaning.
      instance.verify = () => topic.text.split(BLANK).length === 2 &&
        topic.text.length >= 150 && topic.text.length <= 900 &&
        ["attribute", "direct"].includes(topic.construction) && ["singular", "plural"].includes(topic.number) &&
        instance.correct === forms[topic.construction + "|" + topic.number] &&
        new Set(Object.values(forms)).size === 4 && isSquare(instance.features) &&
        Object.entries(forms).every(([corner, form]) => corner.startsWith("attribute|") ?
          form.endsWith(" of " + topic.holder) : ["it", "them"].includes(form));
      return instance;
    },
  };

  // Number agreement is a real decision, alongside reference to the subject
  // of the finite reported clause rather than the salient report writer.
  const REFLEXIVE_COUNTERPART_TOPICS = [
    {
      scene: "sec-counterpart-pottery-return",
      text: "A pottery cooperative sent unfired batches to independent studios for a kiln trial. The trial labels named the studios operating the kilns, and a draft exhibition list treated those names as design credits. The shapes, however, appeared in the cooperative's drawings dated before any studio joined the project. After checking the drawings, the studios reported that the cooperative credited ______ with developing the shapes.",
      subject: "the cooperative", subjectEntity: "cooperative", target: "the cooperative", targetEntity: "cooperative", number: "singular",
      why: "The dated drawings establish that the cooperative developed the shapes before the studios became involved. The studio names identify kiln operators, not designers.",
      numberWhy: "The credited designer is the cooperative, one institution; the several studios and batches do not make that antecedent plural.",
    },
    {
      scene: "sec-counterpart-publishers-imprints",
      text: "A small press licensed an anthology to regional distributors. Their imprints replaced the press's name on the covers, leading an early catalog to assign them the editing credit. A production office also claimed that its printing schedule amounted to editorial supervision. Dated manuscripts showed that editing had ended at the press before either arrangement began. The distributors' corrected statement reported that the press credited ______ with editing the anthology.",
      subject: "the press", subjectEntity: "press", target: "the press", targetEntity: "press", number: "singular",
      why: "Editing ended at the original press before the distributors or production office became involved. The later imprints and printing schedule do not transfer editorial credit.",
      numberWhy: "The editing credit belongs to the press, a singular institution, not to the plural distributors whose names appear on the covers.",
    },
    {
      scene: "sec-counterpart-theaters-restoration",
      text: "A touring theater sent a puppet production to several host theaters. The hosts collected ticket revenue and offered to fund repairs when the set was damaged. The touring theater's insurer rejected that arrangement, reimbursed the touring theater instead, and required it to settle the restoration invoice. An early festival report had still listed the hosts as payers. Correcting that report, the hosts stated that the touring theater credited ______ with paying the restoration invoice.",
      subject: "the touring theater", subjectEntity: "touring-theater", target: "the touring theater", targetEntity: "touring-theater", number: "singular",
      why: "The hosts offered to pay, but that arrangement was rejected. The insurer supplied the funds, but the touring theater settled the invoice; the stated credit is for paying that invoice.",
      numberWhy: "The credited payer is the one touring theater, not the separate host theaters or the insurer.",
    },
    {
      scene: "sec-counterpart-museum-replacement-casts",
      text: "A museum lent plaster casts to an exhibition whose conservation workshops prepared replacement mountings. A transport office delivered the casts, and its labels later led the exhibition catalog to identify that office as the lender. Loan agreements, however, listed the museum as the source of every cast; the workshops had supplied only the new mountings. After the catalog was corrected, the museum reported that the workshops credited ______ with lending the casts.",
      subject: "the workshops", subjectEntity: "workshops", target: "the museum", targetEntity: "museum", number: "singular",
      why: "The loan agreements make the museum the lender. The transport office delivered the casts, while the workshops made mountings; neither activity made those participants the source of the loan.",
      numberWhy: "The lender is the museum, one institution. The plural casts and workshops do not change the number of that antecedent.",
    },
    {
      scene: "sec-counterpart-sound-archives",
      text: "A sound archive sent duplicates of recordings made by its field team to restoration departments at several colleges. The departments supplied new cases after removing background noise. Their case labels were initially read as recording credits, although the field logs placed the original recording sessions before the restoration project began. A university office merely coordinated shipping. Returning to the field logs, the archive reported that the departments credited ______ with making the original recordings.",
      subject: "the departments", subjectEntity: "departments", target: "the archive", targetEntity: "archive", number: "singular",
      why: "The archive made the field recordings before restoration began. The departments restored them, and the university office handled shipping, so neither receives the original recording credit.",
      numberWhy: "The field-recording credit belongs to one archive, even though several departments restored several recordings.",
    },
    {
      scene: "sec-counterpart-seed-societies",
      text: "A seed society sent a trial line to agricultural stations for demonstration plantings. A central bureau published the trial results under its logo. The stations' cultivation logs documented their growing methods, whereas selection notebooks deposited before the trial documented the society's development of the line. An award distinguished development from cultivation and publication. In its award report, the society stated that the stations credited ______ with developing the seed line.",
      subject: "the stations", subjectEntity: "stations", target: "the society", targetEntity: "society", number: "singular",
      why: "The selection notebooks document development by the society before the trial. The stations cultivated the seeds and the bureau published results; those later roles do not make either the developer.",
      numberWhy: "The developer is the seed society, a singular institution, not the plural trial stations.",
    },
    {
      scene: "sec-counterpart-workshop-presses",
      text: "Independent workshops each built a hand press for a demonstration at a printing studio. A coordinating committee arranged the loans but contributed no designs or fabrication. Exhibition cards named the studio because it operated the presses there, causing a draft report to credit the studio with their manufacture. Production drawings bearing the workshops' stamps corrected that error. The committee's final report stated that the studio credited ______ with building the presses.",
      subject: "the studio", subjectEntity: "studio", target: "the workshops", targetEntity: "workshops", number: "plural",
      why: "The workshops built the presses, as the production drawings show. The committee arranged loans and the studio later operated the presses, so neither singular institution was the manufacturer.",
      numberWhy: "The manufacturing credit goes to the independently contributing workshops, not to the single coordinating committee or studio.",
    },
    {
      scene: "sec-counterpart-galleries-labels",
      text: "Regional galleries built display cabinets and lent them to a museum for an exhibition. The museum wrote the interpretive panels, while an exhibition council managed the budget. When the cabinets returned to the galleries, the panels remained at the museum. A summary mistakenly treated the panels as evidence that the museum had built the cabinets. Workshop records disproved that inference. The council reported that the museum credited ______ with constructing the cabinets.",
      subject: "the museum", subjectEntity: "museum", target: "the galleries", targetEntity: "galleries", number: "plural",
      why: "The galleries constructed the cabinets before lending them. The museum's later interpretive panels and the council's budget management concern different contributions.",
      numberWhy: "The credited builders are the regional galleries acting separately, so the antecedent is plural rather than the singular museum or council.",
    },
    {
      scene: "sec-counterpart-festivals-films",
      text: "Regional film festivals commissioned silent shorts and lent them to a cinema for a retrospective. A distribution office handled the loans, and the cinema commissioned new music for the screenings. Because the music contracts carried the cinema's name, a publicity draft also called the cinema the commissioner of the films. The original film contracts instead bore the festivals' names. The office's correction stated that the cinema credited ______ with commissioning the shorts.",
      subject: "the cinema", subjectEntity: "cinema", target: "the festivals", targetEntity: "festivals", number: "plural",
      why: "The festivals commissioned the shorts before the retrospective. The cinema commissioned the later music, and the office distributed the films, so those singular institutions had different roles.",
      numberWhy: "The film commissions came from the regional festivals, a plural group of institutions, not from the single cinema or distribution office.",
    },
    {
      scene: "sec-counterpart-map-societies",
      text: "Map societies deposited harbor maps at an archive. Archive staff marked suspected errors on tracing paper and returned the notes to the mapmakers. The societies checked those notes against their surveys and sent redrawn sheets to replace the deposited maps. An exhibition office initially treated the archive's checking work as authorship of the replacements. The production records contradicted that attribution. The archive reported that the societies credited ______ with drawing the final sheets.",
      subject: "the societies", subjectEntity: "societies", target: "the societies", targetEntity: "societies", number: "plural",
      why: "The societies checked the returned notes against their surveys and drew the replacement sheets. The archive found possible errors, and the exhibition office summarized the project; neither drew the final sheets.",
      numberWhy: "The makers are the map societies, multiple institutions, not the singular archive or exhibition office.",
    },
    {
      scene: "sec-counterpart-libraries-facsimiles",
      text: "A university press commissioned facsimiles of manuscripts held by regional libraries. It planned to borrow the manuscripts for photography and printing, but fragile bindings prevented the loans. The libraries photographed the manuscripts, and a later equipment problem led those libraries to complete the printing as well. A central production office retained only the shipping arrangements. In its final account, the press reported that the libraries credited ______ with printing the facsimiles.",
      subject: "the libraries", subjectEntity: "libraries", target: "the libraries", targetEntity: "libraries", number: "plural",
      why: "The first plan put printing at the university press, but the later equipment problem kept it at the regional libraries. The production office handled shipping, not printing.",
      numberWhy: "Printing took place at the separate regional libraries, so the credited antecedent is plural rather than the singular press or production office.",
    },
    {
      scene: "sec-counterpart-model-clubs",
      text: "Model clubs lent boats they had built to an association organizing a harbor display. The association proposed replacing the rigging, and a supply office prepared an order for parts. The lenders rejected that plan, made complete replacement rigs in their workshops, and sent them to the display. The association installed the rigs without alteration, but an early label credited it with making them. The corrected account stated that the clubs credited ______ with making the rigs.",
      subject: "the clubs", subjectEntity: "clubs", target: "the clubs", targetEntity: "clubs", number: "plural",
      why: "The clubs made complete rigs after rejecting the association's proposal. The association installed the finished rigs and the supply office's order belonged to the abandoned plan; neither made the displayed rigs.",
      numberWhy: "The makers are the model clubs, a plural group, not the singular display association or supply office.",
    },
  ];

  const reflexiveReciprocalScope = {
    id: "sec-reflexive-counterpart-reference", sectionKey: "sat-reading-writing", domain: DOMAIN,
    skill: "Form, Structure, and Sense", subskill: "pronoun agreement", difficulty: "Medium",
    title: "Pronoun number and binding in reported credits",
    recognize: "Reconstruct which institution or institutions earned the credit, distinguish that antecedent from the subject of the finite reported clause, and choose both the antecedent's number and the appropriate ordinary or reflexive object form.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 1 },
    tricks: ["grammatical-but-illogical", "agreement-attractor"],
    build(t) {
      const topic = t.pick(REFLEXIVE_COUNTERPART_TOPICS);
      const forms = {
        "singular|ordinary": "it", "singular|reflexive": "itself",
        "plural|ordinary": "them", "plural|reflexive": "themselves",
      };
      const reference = topic.subjectEntity === topic.targetEntity ? "reflexive" : "ordinary";
      const bindingWhy = reference === "reflexive"
        ? "The subject of the finite clause awarding the credit is “" + topic.subject + ".” That is also the credited institution or group, so the object must be reflexive; the writer or possessor of the report does not govern that reflexive."
        : "The subject of the finite clause awarding the credit is “" + topic.subject + ",” but the credited antecedent is “" + topic.target + ".” They are different participants, so use an ordinary object pronoun rather than a reflexive bound to the local subject.";
      const rows = [];
      ["singular", "plural"].forEach((number) => ["ordinary", "reflexive"].forEach((objectReference) => {
        const errors = [];
        if (number !== topic.number) errors.push("This form has the wrong number for the credited antecedent. " + topic.numberWhy);
        if (objectReference !== reference) errors.push(bindingWhy);
        rows.push([forms[number + "|" + objectReference], { number, objectReference }, errors.length ? errors.join(" ") : null]);
      }));
      const choices = square(rows);
      const instance = {
        responseType: "multiple-choice", scene: topic.scene,
        stimulus: { type: "text", content: topic.text }, stem: STEM, ...choices,
        explanation: topic.why + " " + topic.numberWhy + " " + bindingWhy + " Therefore, use “" + choices.correct + ".”",
        steps: [
          "Separate the original contribution from the later handling, revised plan, or misleading credit. " + topic.why,
          "Resolve the number of the credited antecedent. " + topic.numberWhy,
          "Locate the subject after that, inside the finite reported clause. " + bindingWhy,
          "Combine those decisions: " + topic.number + " number and " + reference + " reference require “" + choices.correct + ".”",
        ],
        principles: [
          "A pronoun agrees in number with its intended antecedent, not automatically with the report writer, a nearby noun, or the objects mentioned in the credit.",
          "In these finite clauses, a reflexive object refers to its local subject. Use an ordinary object pronoun when the credited participant is different from that subject.",
        ],
        trap: "Using the report writer as the reflexive's governing subject, or assigning the creator's credit to a later handler and matching the pronoun to that handler's number.",
        hint: "Who actually earned this credit, and who is the subject of the clause awarding it? Then check whether the credited antecedent is singular or plural.",
        estimatedSeconds: 95,
      };
      // The referent map and prose credit require editorial judgment; this
      // guard checks the mapped number and the local finite-clause structure.
      instance.verify = () => {
        const pluralHeads = /\b(?:studios|distributors|hosts|workshops|departments|stations|galleries|festivals|societies|libraries|clubs)$/;
        const targetNumber = pluralHeads.test(topic.target) ? "plural" : "singular";
        const localNumber = pluralHeads.test(topic.subject) ? "plural" : "singular";
        const key = choices.correct;
        const keyNumber = /^(?:them|themselves)$/.test(key) ? "plural" : "singular";
        const keyReference = /self$|selves$/.test(key) ? "reflexive" : "ordinary";
        return topic.text.split(BLANK).length === 2 && topic.text.length >= 150 && topic.text.length <= 900 &&
          topic.text.includes("that " + topic.subject + " credited " + BLANK + " with ") &&
          topic.text.includes(topic.target) && targetNumber === topic.number && keyNumber === targetNumber &&
          keyReference === (topic.subjectEntity === topic.targetEntity ? "reflexive" : "ordinary") &&
          (keyReference !== "reflexive" || keyNumber === localNumber) &&
          new Set(rows.map(([text]) => text)).size === 4 && isSquare(instance.features);
      };
      return instance;
    },
  };

  return [
    reflexiveReciprocalScope,
    pronounComparisonReferent,
    aspectEventReconstruction,
    jointSeparatePossession,
    infinitiveTimeAndVoice,
    reportedForecastAspect,
    pronounReciprocalReference,
    svaMeaningNumber,
    modifierImpliedAgent,
    relativeEventTime,
    svaSharedRoles,
    reflexivePronounNumber,
    demonstrativeAgreement,
    nestedGenitives,
    absoluteOrFinite,
    compoundSubject,
    theirForms,
    pastParticiple,
    attractorAgreement,
    invertedAgreement,
    longSubjectAgreement,
    distantPronoun,
    possessiveOrPlural,
    tenseFrame,
    twoTimeTense,
    finiteVerb,
    supplementOrMainVerb,
    danglingModifier,
  ];
});
