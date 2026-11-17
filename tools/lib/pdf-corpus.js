"use strict";
// The documents that define and prove Liminal's PDF runtime: the subset in
// tools/native-tex/runtime.json is derived from what the engines open while
// typesetting these (tools/native-tex.js derive), and tools/check-pdf.js
// typesets them again against the staged subset.
//
// Two synthetic nights put every character the generator accepts into every
// field of the packet (title, credits, abstract, headings, prose, verse,
// tables, questions, source note, footer), so the subset holds every font
// shape and size a real night can ask for. The rest are real readings.
const D = require("../../src/lib/daily-reading");
const T = require("../../src/lib/reading-tex");

// Courses as the build resolves them (tools/build-daily-reading.js), so the
// corpus follows any change in how readings are stored.
let loaded = null;
const all = () => loaded || (loaded = new Map(require("../build-daily-reading").loadDailyReading().courses.map(item => [D.gradeKey(item.grade), item])));
const course = key => all().get(key);
const publishedKeys = () => [...all().keys()];
function night(key, week, day) {
  const data = course(key), found = D.dayAt(data, week, day);
  if (!found) throw new Error("no night " + key + " w" + week + "d" + day);
  return found;
}
const schoolEntry = (key, item) => T.entry(course(key), item, T.schoolMeta(D.gradeFromKey(key), item));
const byId = id => {
  const match = /^reading-(k|\d+|a\d)-w(\d+)-d(\d)$/.exec(id);
  return schoolEntry(match[1], night(match[1], Number(match[2]), Number(match[3])));
};
// The night on a school date in every published grade (week 13, day 4 is 2026-11-19).
const dayEntries = (week, day, date) => publishedKeys().map(key => {
  const item = night(key, week, day);
  return T.entry(course(key), item, D.gradeLabel(D.gradeFromKey(key)) + " · " + date);
});

function coverageNight(script) {
  const sets = T.characters();
  const letters = sets.latin.filter(character => !/[\s_"]/.test(character)).join(" ") + ' "quoted" _emphasis_ ' + (script ? sets.script.join(" ") : "");
  const words = value => value + " " + letters;
  return {
    meta: words("Coverage"),
    run: { part: 2, of: 3 },
    source: { id: "s", author: words("Author"), title: words("Title"), translator: words("Translator"), translationYear: 1900,
      publicationYear: 1899, url: "https://example.org/a_b-c~d%25e#f", rights: {} },
    day: {
      id: "coverage-" + (script ? "xelatex" : "pdflatex"), week: 1, day: 1, title: words("Title"), workTitle: words("Work"),
      author: words("Author"), readingMode: "shared", sourceId: "s", focus: words("Focus"), challenge: words("Challenge"),
      context: words("Context"), contentNote: words("Note"), excerpt: { continuesFrom: "x", continuesTo: "y" },
      time: { readingMinutes: 10, discussionMinutes: 5, totalMinutes: 15 },
      blocks: [{ type: "heading", text: words("Heading") }, { type: "paragraph", text: words("Paragraph") },
        { type: "stanza", text: words("Verse") + "\n  " + words("Indented") }, { type: "heading", text: "_" + words("Emphasis") + "_" },
        { type: "paragraph", text: "Head\t" + words("Header") + "\nRow\t" + words("Cell") }],
      questions: [{ id: "q1", prompt: words("Question") }],
    },
  };
}

// [{ name, levels, document: { tex, engine, levels, nights } }]
function documents() {
  const keys = publishedKeys();
  const list = [
    ["coverage-pdflatex", [{ nights: [coverageNight(false)] }]],
    ["coverage-xelatex", [{ nights: [coverageNight(true)] }]],
    ["first-and-last-nights", keys.map(key => ({ nights: [schoolEntry(key, course(key).days[0]), schoolEntry(key, course(key).days[course(key).days.length - 1])] }))],
    ["reading-12-w13-d4", [{ nights: [byId("reading-12-w13-d4")] }]],
    ["reading-6-w34-d2", [{ nights: [byId("reading-6-w34-d2")] }]],
    ["reading-k-w01-d1", [{ nights: [byId("reading-k-w01-d1")] }]],
    ["day-2026-11-17", dayEntries(13, 2, "Tue, Nov 17, 2026").map(item => ({ nights: [item] }))],
    ["day-2026-11-19", dayEntries(13, 4, "Thu, Nov 19, 2026").map(item => ({ nights: [item] }))],
  ];
  return list.map(([name, levels]) => ({ name, levels: levels.length, document: T.documentTeX(levels) }));
}

module.exports = { documents, publishedKeys, course, coverageNight };
