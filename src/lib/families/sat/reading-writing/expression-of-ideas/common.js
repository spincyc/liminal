(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/reading-writing/expression-of-ideas"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers shared by the Expression of Ideas skill files (Rhetorical
  // Synthesis and Transitions).

  const DOMAIN = "Expression of Ideas";
  const SECTION = "sat-reading-writing";

  const lc = (text) => String(text).toLowerCase();

  /* ---------------------------------------------- grounding in the notes */

  // A notes question promises that every choice is drawn from the notes, so
  // a distractor may be off-goal but never invent a fact. ungroundedWords()
  // lists the content words of a choice that the notes do not contain: each
  // word is reduced to a crude stem, irregular forms are mapped to a base
  // form, and function words, connectives, and reporting verbs (the words
  // any paraphrase needs) are allowed everywhere. A topic may allow a few
  // more words (`allow`) that only reword a note, never add to it.
  const IRREGULAR = {
    grew: "grow", grown: "grow", found: "find", built: "build", made: "make", wrote: "write", written: "write",
    came: "come", took: "take", taken: "take", drew: "draw", drawn: "draw", held: "hold", kept: "keep",
    heard: "hear", began: "begin", begun: "begin", brought: "bring", left: "leave", won: "win", sold: "sell",
    ran: "run", sang: "sing", sung: "sing", led: "lead", spent: "spend", went: "go", gone: "go", fell: "fall",
    fallen: "fall", paid: "pay", said: "say", thought: "think", taught: "teach", caught: "catch", chose: "choose",
    chosen: "choose", flew: "fly", flown: "fly", froze: "freeze", frozen: "freeze", rose: "rise", risen: "rise",
    gave: "give", given: "give", got: "get", saw: "see", seen: "see", knew: "know", known: "know", shown: "show",
    hid: "hide", hidden: "hide", used: "use", using: "use", lives: "life", women: "woman", men: "man", children: "child", feet: "foot",
  };
  function stem(word) {
    let w = lc(word).replace(/[’']s?$/, "").replace(/[^a-z0-9]/g, "");
    w = IRREGULAR[w] || w;
    w = w.replace(/(ies|ied)$/, "y");
    if (/(ss|us|is)$/.test(w)) w = w.replace(/es$/, "");
    const suffix = ["ing", "ed", "es", "ly", "s", "e"].find((end) => w.endsWith(end) && w.length - end.length >= 3 &&
      !(end === "s" && /(ss|us|is)$/.test(w)));
    return suffix ? w.slice(0, -suffix.length) : w;
  }
  const ALWAYS = [
    // function words
    "a an the and or but nor of in on at to for from by with as is are was were be been being that which who whom",
    "whose this these those it its their they them he she his her him than then so such not no only also both each",
    "every most many more much while whereas although though because since after before when where into over under",
    "about during until among between through can could would should may might will has have had do does did there",
    "here what how all any some other another own same just very even still yet however instead rather",
    // reporting and connecting words that any paraphrase needs
    "find show suggest study research researcher expect expectation use include help make give get like unlike",
    "alike differ different difference similar compare known call named describe report according",
    // number words
    "one two three four five six seven eight nine ten first second third half twice percent number year",
  ].join(" ").split(" ");
  const ALLOWED = new Set(ALWAYS.map(stem));

  function ungroundedWords(notes, choice, allow) {
    const source = new Set(String(notes).split(/[\s—–-]+/).map(stem));
    const extra = new Set((allow || []).map(stem));
    return String(choice).split(/[\s—–-]+/)
      .filter((word) => {
        const base = stem(word);
        return base && !/^\d/.test(base) && !ALLOWED.has(base) && !source.has(base) && !extra.has(base);
      });
  }

  return { DOMAIN, SECTION, lc, stem, ungroundedWords };
});
