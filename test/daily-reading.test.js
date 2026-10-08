"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const D = require("../src/lib/daily-reading"), R = require("../src/app/daily-reading-render");
const B = require("../tools/build-daily-reading"), { inspect } = require("../tools/check-daily-reading");
function fixture(grade = 0) {
  const key = D.gradeKey(grade), total = D.minuteRange(grade)[0];
  const sources = Array.from({ length: 10 }, (_, i) => ({ id: "source-" + i, author: "Test Author " + i, title: "Fixture source " + i, translator: null,
    edition: "Synthetic test fixture, not corpus content.", publicationYear: 1900, translationYear: null,
    url: "https://example.org/source/" + i, textUrl: "https://example.org/text/" + i,
    rights: { jurisdiction: "US", status: "public-domain", basis: "Synthetic rights declaration for structural testing.", verifiedDate: "2026-01-01", evidenceUrl: "https://example.org/rights/" + i } }));
  const days = Array.from({ length: 180 }, (_, i) => {
    const week = Math.floor(i / 5) + 1, day = i % 5 + 1, id = "reading-" + key + "-w" + String(week).padStart(2, "0") + "-d" + day;
    const record = { id, week, day, title: "Fixture night " + (i + 1), sourceId: sources[i % 10].id, genre: "poetry", readingMode: grade < 2 ? "adult-read-aloud" : "independent",
      time: { readingMinutes: total - 4, discussionMinutes: 4, totalMinutes: total }, challenge: "Listen for repeated sounds.", focus: "Use the selection to explain an idea.", context: "A fixture for grade " + key + ".", contentNote: null,
      excerpt: { locator: "Test selection " + i, isCompleteWork: true, continuesFrom: null, continuesTo: null, textHash: "" },
      blocks: [{ type: "stanza", text: "Fixture grade " + key + ", night " + (i + 1) + ".\nA second line to read." }, { type: "paragraph", text: "A closing paragraph." }],
      questions: Array.from({ length: 3 }, (_, q) => ({ id: id + "-q" + (q + 1), prompt: "Question " + (q + 1) + " about fixture " + i + ".",
        facilitatorNotes: ["FACILITATOR_SECRET " + q], evidence: ["A second line to read."] })) };
    record.excerpt.textHash = B.textHash(record); return record;
  });
  return { schemaVersion: 1, grade, title: "Test grade " + key, overview: "A synthetic grade for validation tests.", progression: [{ weeks: [1, 18], focus: "Observe.", rationale: "Begin with details." }, { weeks: [19, 36], focus: "Interpret.", rationale: "Connect the details." }], sources, days };
}
function scratch(t) {
  const parent = path.resolve(__dirname, "../.scratch/daily_reading_platform"); fs.mkdirSync(parent, { recursive: true });
  const directory = fs.mkdtempSync(path.join(parent, "test-")); t.after(() => fs.rmSync(directory, { recursive: true, force: true })); return directory;
}
test("grade admission requires 180 ordered nights and consistent hashes, references and time", () => {
  assert.equal(B.validateGrade(fixture()).days.length, 180);
  const cases = [
    [course => course.days.pop(), /180/],
    [course => course.days[1].day = 1, /identity/],
    [course => course.days[0].sourceId = "missing", /unresolved source/],
    [course => course.days[0].blocks[0].text += "changed", /hash mismatch/],
    [course => course.days[0].time.totalMinutes++, /time budget/],
    [course => course.days[0].time.readingMinutes = 0, /minutes/],
    [course => course.days[0].questions.pop(), /too few/],
    [course => course.days[0].questions[0].evidence = ["Not in the text"], /evidence/],
    [course => course.days[0].contentNote = "<img src=x>", /non-plain/],
    [course => course.progression[1].weeks[0] = 20, /progression/],
    [course => course.sources[0].translator = "Translator", /publication year/],
    [course => course.sources[0].rights.evidenceUrl = "javascript:alert(1)", /unsafe/],
    [course => course.sources[0].rights.verifiedDate = "2026-02-30", /date/],
  ];
  for (const [mutate, error] of cases) { const course = fixture(); mutate(course); assert.throws(() => B.validateGrade(course), error); }
});
test("continuations are reciprocal adjacent selections from the same source", () => {
  const course = fixture(), first = course.days[0], next = course.days[1];
  next.sourceId = first.sourceId; first.excerpt.isCompleteWork = next.excerpt.isCompleteWork = false;
  first.excerpt.continuesTo = next.id; next.excerpt.continuesFrom = first.id;
  assert.equal(B.validateGrade(course), course);
  next.excerpt.continuesFrom = null; assert.throws(() => B.validateGrade(course), /continuation/);
});
test("source IDs and review records cannot inflate a single bibliography entry into ten sources", () => {
  const course = fixture();
  course.sources = course.sources.map(source => ({ ...structuredClone(course.sources[0]), id: source.id,
    url: source.url, textUrl: source.textUrl, rights: { ...source.rights, basis: "Different review prose for " + source.id } }));
  assert.throws(() => B.validateGrade(course), /bibliographic sources/);
});
test("optional selection credits must be nonempty plain text without changing source counts", () => {
  const course = fixture(); course.days[0].author = "Individual Poet"; course.days[0].workTitle = "The Night Song";
  assert.equal(B.validateGrade(course).sources.length, 10);
  for (const field of ["author", "workTitle"]) for (const invalid of [null, " ", 7, "<em>Not plain text</em>"]) {
    const changed = structuredClone(course); changed.days[0][field] = invalid;
    assert.throws(() => B.validateGrade(changed), /missing text|non-plain text/);
  }
});
test("whole-text identities catch repeats despite whitespace changes, inside and across grades", () => {
  const first = fixture(), second = fixture(1);
  second.days[0].blocks = structuredClone(first.days[0].blocks); second.days[0].blocks[0].text = second.days[0].blocks[0].text.replace(/ /g, "  ");
  second.days[0].excerpt.textHash = B.textHash(second.days[0]);
  assert.throws(() => B.validateCorpus([first, second]), /duplicate reading across/);
  first.days[1].blocks = structuredClone(first.days[0].blocks); first.days[1].excerpt.textHash = B.textHash(first.days[1]);
  assert.throws(() => B.validateGrade(first), /duplicate reading/);
});
test("hashing uses exact joined block text with NFC, without trimming", () => {
  const day = fixture().days[0]; day.blocks = [{ type: "paragraph", text: " cafe\u0301 " }, { type: "stanza", text: "one\ntwo" }];
  assert.equal(B.blockText(day), " café \n\none\ntwo");
  const original = B.textHash(day); day.blocks[0].text = " café "; assert.equal(B.textHash(day), original);
  day.blocks[0].text = "café"; assert.notEqual(B.textHash(day), original);
});
test("a complete corpus has all 13 grades and 2340 nights", () => {
  assert.throws(() => B.validateCorpus([fixture()], { complete: true }), /13 grades/);
  const courses = Array.from({ length: 13 }, (_, grade) => fixture(grade));
  assert.equal(B.validateCorpus(courses, { complete: true }).flatMap(course => course.days).length, 2340);
});
test("advanced levels 1–4 are grades 13–16 with their own keys, labels, budgets and completeness", t => {
  assert.deepEqual([13, 14, 15, 16].map(D.gradeKey), ["a1", "a2", "a3", "a4"]);
  assert.deepEqual([13, 16].map(D.gradeLabel), ["Advanced 1", "Advanced 4"]);
  assert.deepEqual(["a1", "a4", "a5", "a0", "13"].map(D.gradeFromKey), [13, 16, null, null, null]);
  assert.deepEqual([12, 13, 14, 15, 16].map(D.minuteRange), [[25, 30], [30, 35], [30, 40], [35, 45], [35, 45]]);
  assert.equal(D.isAdvanced(12), false); assert.equal(D.isAdvanced(13), true); assert.equal(D.validGrade(17), false);
  assert.equal(D.route(13, 36, 5), "#a1/36/5");
  assert.deepEqual(D.resolve({ grades: [{ grade: 13 }] }, "#a1/2/3"), { course: { grade: 13 }, grade: 13, week: 2, day: 3, invalid: false });
  assert.equal(B.validateGrade(fixture(16)).days[0].id, "reading-a4-w01-d1");
  const k12 = Array.from({ length: 13 }, (_, grade) => fixture(grade)), advanced = [13, 14, 15, 16].map(fixture);
  assert.equal(B.validateCorpus([...k12, ...advanced.slice(0, 2)], { complete: true }).length, 15);
  assert.throws(() => B.validateCorpus([...k12, ...advanced.slice(0, 2)], { completeAdvanced: true }), /Advanced 1–4/);
  assert.equal(B.validateCorpus(advanced, { completeAdvanced: true }).length, 4);
  const directory = scratch(t); fs.writeFileSync(path.join(directory, "a2.json"), JSON.stringify(fixture(14)));
  assert.equal(B.loadDailyReading({ directory }).index.grades[0].file, "content/reading-daily/a2.json");
  fs.writeFileSync(path.join(directory, "a5.json"), "{}"); assert.throws(() => B.loadDailyReading({ directory }), /unexpected/);
});
test("lazy build writes only available complete grades and a small text-free index", t => {
  const directory = scratch(t), input = path.join(directory, "input"), output = path.join(directory, "output"); fs.mkdirSync(input);
  const course = fixture(12); fs.writeFileSync(path.join(input, "12.json"), JSON.stringify(course));
  const index = B.build({ directory: input, output });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(output, "content/reading-daily/12.json"))), course);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(output, "content/reading-daily/index.json"))), index);
  assert.doesNotMatch(JSON.stringify(index), /FACILITATOR_SECRET|blocks|questions/);
  assert.equal(index.grades[0].nights, 180); assert.equal(index.grades[0].file, "content/reading-daily/12.json");
  assert.deepEqual(inspect({ directory: input }), { grades: 1, nights: 180, sources: 10, questions: 540, missing: D.GRADES.filter(grade => grade !== 12) });
  course.days.pop(); fs.writeFileSync(path.join(input, "12.json"), JSON.stringify(course));
  assert.throws(() => B.build({ directory: input, output }), /180/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(output, "content/reading-daily/12.json"))).days.length, 180);
  assert.equal(B.loadDailyReading({ directory: path.join(directory, "absent") }).index.grades.length, 0);
});
test("grade filename mismatch and unexpected files fail admission", t => {
  const directory = scratch(t); fs.writeFileSync(path.join(directory, "1.json"), JSON.stringify(fixture(2)));
  assert.throws(() => B.loadDailyReading({ directory }), /path mismatch/);
  fs.rmSync(path.join(directory, "1.json")); fs.writeFileSync(path.join(directory, "notes.txt"), "wrong directory");
  assert.throws(() => B.loadDailyReading({ directory }), /unexpected/);
});
test("routing and navigation preserve all 180 nights across week boundaries", () => {
  const index = { grades: [{ grade: 0 }, { grade: 12 }] };
  assert.deepEqual(D.resolve(index, "#12/36/5"), { course: index.grades[1], grade: 12, week: 36, day: 5, invalid: false });
  for (const hash of ["#12/01/1", "#12/37/1", "#12/1/6", "#k/1/1/trailing", "#bogus/1/1", "#%6b/1/1"]) assert.equal(D.resolve(index, hash).invalid, true, hash);
  assert.equal(D.resolve(index, "#12/0/1").grade, 12); assert.equal(D.resolve(index, "#12/0/1").week, 1);
  assert.equal(D.navigation({ grade: 0, week: 1, day: 1 }).previous, null);
  assert.equal(D.navigation({ grade: 12, week: 36, day: 5 }).next, null);
  assert.equal(D.navigation({ grade: 12, week: 1, day: 5 }).next.href, "#12/2/1");
  assert.equal(D.navigation({ grade: 12, week: 2, day: 1 }).previous.href, "#12/1/5");
  assert.equal(D.resolve({ grades: [] }, "#k/1/1").course, null); assert.equal(D.route(17), "");
});
test("student projection withholds notes, evidence and all unknown fields", () => {
  const course = fixture(), day = course.days[0]; course.private = "COURSE_SECRET"; day.private = "DAY_SECRET";
  day.questions[0].private = "QUESTION_SECRET"; day.blocks[0].private = "BLOCK_SECRET";
  course.sources[0].private = "SOURCE_SECRET"; course.sources[0].rights.private = "RIGHTS_SECRET";
  const packet = D.studentReading(course, 1, 1), serialized = JSON.stringify(packet);
  assert.doesNotMatch(serialized, /SECRET|facilitatorNotes|"evidence"/); assert.equal(packet.day.blocks.length, 2);
  assert.equal(packet.source.rights.status, "public-domain"); assert.equal(D.studentReading(course, 37, 1), null);
});
test("compact source notes preserve full credits and safe source links without editorial records", () => {
  const source = fixture().sources[0];
  source.translator = "A Translator"; source.translationYear = 1910;
  source.url = "https://www.example.org/book/1?edition=1900#text";
  const note = D.sourceNote(source);
  assert.equal(note.credit, "Test Author 0, Fixture source 0 (1900); translated by A Translator (1910)");
  assert.equal(note.rights, "Public domain in the United States.");
  assert.equal(note.url, source.url); assert.equal(note.linkText, "example.org/book/1?edition=1900#text");
  assert.doesNotMatch(JSON.stringify(note), /Synthetic|verifiedDate|edition"|basis"/);
  source.url = "javascript:alert(1)";
  assert.equal(D.sourceNote(source).url, source.textUrl);
  source.textUrl = "data:text/html,unsafe";
  assert.equal(D.sourceNote(source).url, null); assert.equal(D.sourceNote(source).linkText, null);
});
function documentFixture() {
  const escape = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  class Text { constructor(value) { this.nodeType = 3; this.value = value; } get outerHTML() { return escape(this.value); } }
  class Element {
    constructor(tag) { this.tagName = tag; this.childNodes = []; this.attributes = {}; this.events = {}; }
    append(...nodes) { this.childNodes.push(...nodes); }
    set textContent(value) { this.childNodes = [new Text(value)]; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    addEventListener(name, action) { this.events[name] = action; }
    get outerHTML() { const attrs = { ...this.attributes }; for (const key of ["id", "className", "href", "lang"]) if (this[key]) attrs[key === "className" ? "class" : key] = this[key]; return "<" + this.tagName + Object.entries(attrs).map(([key, value]) => " " + key + '="' + escape(value) + '"').join("") + ">" + this.childNodes.map(node => node.outerHTML).join("") + "</" + this.tagName + ">"; }
  }
  const doc = { createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag), createTextNode: value => new Text(value), implementation: { createHTMLDocument: documentFixture } };
  doc.documentElement = doc.createElement("html"); doc.head = doc.createElement("head"); doc.body = doc.createElement("body"); doc.documentElement.append(doc.head, doc.body); return doc;
}
function withDOM(fn) { const previous = global.document; global.document = documentFixture(); try { fn(); } finally { global.document = previous; } }
test("reader preserves stanzas, escapes markup and only adds notes when opened", () => withDOM(() => {
  const course = fixture(); course.days[0].blocks[0].text += " <img src=x onerror=alert(1)>";
  const article = R.reading(D.studentReading(course, 1, 1), { notes: course.days[0].questions });
  assert.match(article.outerHTML, /daily-stanza/); assert.match(article.outerHTML, /night 1\.\nA second line/);
  assert.match(article.outerHTML, /&lt;img/); assert.doesNotMatch(article.outerHTML, /<img|FACILITATOR_SECRET/);
  function find(node, name) { if (node.className === name) return node; return (node.childNodes || []).map(child => find(child, name)).find(Boolean); }
  const notes = find(article, "daily-facilitator"); notes.open = true; notes.events.toggle(); notes.events.toggle();
  assert.equal(article.outerHTML.match(/FACILITATOR_SECRET 0/g).length, 1);
  assert.match(article.outerHTML, /Source and public-domain record/); assert.match(article.outerHTML, /Public domain in the United States/);
}));
test("offline student document keeps provenance and questions without scripts or facilitator material", () => withDOM(() => {
  const course = fixture(), packet = D.studentReading(course, 1, 1);
  const html = R.exportDocument(packet, ".offline-marker{display:block}", "https://example.org/daily-reading.html#k/1/1", "Font copyright and license").documentElement.outerHTML;
  assert.match(html, /offline-marker|Fixture night/); assert.match(html, /Test Author 0/); assert.match(html, /Public domain in the United States/);
  assert.match(html, /name="font-license" content="Font copyright and license"/);
  assert.ok(html.indexOf('charset="utf-8"') < html.indexOf('name="font-license"'), "declare UTF-8 before the full font license");
  assert.match(html, /<footer class="daily-print-footer">Kindergarten · Week 1 · Day 1 · Liminal<\/footer>/);
  assert.match(html, /class="daily-print-heading">Reading<\/h3>/);
  assert.match(html, /class="daily-print-label">Questions<\/span>/);
  assert.match(html, /class="daily-attribution"><h3>Source<\/h3>/);
  assert.doesNotMatch(html, /daily-export-brand|brand-symbol|<svg/);
  assert.match(html, /Question 3/); assert.match(html, /no affiliation/); assert.match(html, /Return to this reading/);
  assert.match(html, /class="daily-budget">About 10 min · read 6 \+ discuss 4/);
  assert.doesNotMatch(html, /FACILITATOR_SECRET|daily-facilitator|<script|<iframe|application\/json/);
  course.sources[0].textUrl = "javascript:alert(1)"; assert.equal(D.studentReading(course, 1, 1).source.textUrl, null);
}));
test("printed source notes stay brief while downloads retain complete source records", () => withDOM(() => {
  const course = fixture(), source = course.sources[0];
  source.edition = "EDITION_RECORD ".repeat(100);
  source.rights.basis = "RIGHTS_RECORD ".repeat(100);
  course.days[0].excerpt.locator = "EXCERPT_LOCATOR ".repeat(100);
  const packet = D.studentReading(course, 1, 1);
  for (const html of [R.reading(packet).outerHTML, R.exportDocument(packet).documentElement.outerHTML]) {
    const note = html.match(/<footer class="daily-attribution">([\s\S]*?)<\/footer>/)[1];
    assert.match(note, /Test Author 0, Fixture source 0 \(1900\)/);
    assert.match(note, /href="https:\/\/example.org\/source\/0"/);
    assert.doesNotMatch(note, /EDITION_RECORD|RIGHTS_RECORD|EXCERPT_LOCATOR/);
    for (const detail of [source.edition, source.rights.basis, packet.day.excerpt.locator]) assert.ok(html.includes(detail), "complete digital record retained");
  }
}));
test("anthology selections credit the piece author in reader and student export while retaining the source bibliography", () => withDOM(() => {
  const course = fixture(), day = course.days[0], source = course.sources[0];
  source.author = "Various authors; Collected by Test Editor"; source.title = "A Test Anthology";
  day.title = "Listen to the night"; day.author = "Individual Poet"; day.workTitle = "The Night Song";
  const packet = D.studentReading(course, 1, 1);
  assert.equal(packet.day.author, "Individual Poet"); assert.equal(packet.day.workTitle, "The Night Song");
  assert.equal(packet.source.author, source.author); assert.equal(packet.source.title, source.title);
  for (const html of [R.reading(packet).outerHTML, R.exportDocument(packet).documentElement.outerHTML]) {
    assert.match(html, /class="daily-author">By Individual Poet/); assert.match(html, /class="daily-work-title">The Night Song/);
    assert.match(html, /Various authors; Collected by Test Editor, A Test Anthology \(1900\)/);
    assert.doesNotMatch(html, /By Various authors|FACILITATOR_SECRET/);
  }
}));
test("single-author selections retain the source fallback and repeated work titles stay unobtrusive", () => withDOM(() => {
  const course = fixture();
  for (const workTitle of [undefined, course.days[0].title, course.sources[0].title]) {
    if (workTitle !== undefined) course.days[0].workTitle = workTitle;
    const packet = D.studentReading(course, 1, 1), html = R.exportDocument(packet).documentElement.outerHTML;
    assert.equal(Object.hasOwn(packet.day, "author"), false);
    assert.match(html, /class="daily-author">By Test Author 0/); assert.doesNotMatch(html, /class="daily-work-title"/);
  }
}));
test("browse files are a text-free allowlist that keeps credits, runs and lazy per-grade paths", t => {
  const course = fixture(5), day = course.days[0];
  course.days[0].excerpt.isCompleteWork = false; course.days[1].excerpt.isCompleteWork = false; course.days[2].excerpt.isCompleteWork = false;
  course.days[0].excerpt.continuesTo = course.days[1].id; course.days[1].excerpt.continuesFrom = day.id;
  course.days[1].excerpt.continuesTo = course.days[2].id; course.days[2].excerpt.continuesFrom = course.days[1].id;
  course.days[1].sourceId = course.days[2].sourceId = day.sourceId;
  day.author = "Individual Poet"; day.private = "DAY_SECRET"; course.sources[0].title = "Fixture night";
  const browse = D.browseIndex(course), serialized = JSON.stringify(browse);
  assert.doesNotMatch(serialized, /FACILITATOR_SECRET|DAY_SECRET|second line to read|Question 1|textHash|locator/);
  assert.equal(browse.nights.length, 180); assert.equal(browse.progression[0].rationale, undefined);
  assert.deepEqual(browse.nights[0], { week: 1, day: 1, title: "Fixture night 1", author: "Individual Poet", work: "Fixture night", minutes: 15, mode: "independent", genre: "poetry", continuesFrom: false, continuesTo: true });
  assert.equal(D.workLabel(browse.nights[0]), null); assert.equal(D.workLabel(browse.nights[3]), "Fixture source 3");
  assert.deepEqual(D.runs(browse.nights).slice(0, 4), [{ part: 1, of: 3 }, { part: 2, of: 3 }, { part: 3, of: 3 }, null]);
  assert.equal(D.browseFile(5), "content/reading-daily/browse/5.json"); assert.equal(D.browseFile(14), "content/reading-daily/browse/a2.json"); assert.equal(D.browseFile(17), "");
  const directory = scratch(t), input = path.join(directory, "input"), output = path.join(directory, "output"); fs.mkdirSync(input);
  fs.writeFileSync(path.join(input, "5.json"), JSON.stringify(fixture(5))); B.build({ directory: input, output });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(output, D.browseFile(5)))), D.browseIndex(fixture(5)));
});
test("browse routes, search and filters are pure and forgiving", () => {
  const index = { grades: [{ grade: 0 }, { grade: 5 }, { grade: 13 }] };
  assert.deepEqual(D.view(index, ""), { view: "browse", course: index.grades[0], grade: 0, invalid: false });
  assert.equal(D.view(index, "#browse/5").grade, 5); assert.equal(D.view(index, "#browse/a1").grade, 13);
  assert.equal(D.view(index, "#browse/zz").invalid, true); assert.equal(D.view(index, "#browse/zz").grade, 0);
  assert.equal(D.view(index, "#5/2/3").view, "read"); assert.equal(D.view(index, "#5/2/3").week, 2);
  assert.equal(D.browseRoute(13), "#browse/a1");
  const nights = [
    { week: 1, day: 1, title: "Pied Beauty", author: "Gerard Manley Hopkins", work: "Poems", minutes: 25, mode: "independent", genre: "poetry" },
    { week: 1, day: 2, title: "Le Morte d’Arthur", author: "Thomas Malory", work: "Le Morte Darthur", minutes: 30, mode: "shared", genre: "literary-prose" },
    { week: 1, day: 3, title: "The Café", author: "Anon", work: "Tales", minutes: 28, mode: "independent", genre: "short-story" },
  ];
  assert.deepEqual(D.filterNights(nights, { query: "hopkins poetry" }).map(n => n.day), [1]);
  assert.deepEqual(D.filterNights(nights, { query: "d'arthur" }).map(n => n.day), [2]);
  assert.deepEqual(D.filterNights(nights, { query: "cafe" }).map(n => n.day), [3]);
  assert.deepEqual(D.filterNights(nights, { query: "literary prose" }).map(n => n.day), [2]);
  assert.deepEqual(D.filterNights(nights, { mode: "independent" }).map(n => n.day), [1, 3]);
  assert.deepEqual(D.filterNights(nights, { genre: "poetry", query: "malory" }), []);
  assert.deepEqual(D.genres(nights), ["literary-prose", "poetry", "short-story"]);
  assert.deepEqual(D.modes(nights), ["shared", "independent"]); assert.deepEqual(D.minutesSpan(nights), [25, 30]);
});

test("a night's week file carries its five nights and only the sources they cite", t => {
  const course = fixture(3), slice = D.weekSlice(course, 2);
  assert.deepEqual(slice.days.map(day => day.id), course.days.slice(5, 10).map(day => day.id));
  assert.deepEqual(slice.sources.map(source => source.id), ["source-5", "source-6", "source-7", "source-8", "source-9"]);
  assert.equal(slice.week, 2); assert.equal(slice.overview, course.overview); assert.deepEqual(slice.progression, course.progression);
  assert.deepEqual(D.studentReading(slice, 2, 3), D.studentReading(course, 2, 3));
  assert.equal(D.weekFile(0, 36), "content/reading-daily/weeks/k/36.json"); assert.equal(D.weekFile(0, 37), ""); assert.equal(D.weekFile(17, 1), "");
  const directory = scratch(t), input = path.join(directory, "input"), output = path.join(directory, "output"); fs.mkdirSync(input);
  fs.writeFileSync(path.join(input, "3.json"), JSON.stringify(course)); B.build({ directory: input, output });
  for (let week = 1; week <= 36; week++) assert.deepEqual(JSON.parse(fs.readFileSync(path.join(output, D.weekFile(3, week)))), D.weekSlice(course, week));
});
test("paired underscores become emphasis segments; odd counts and plain text stay as written", () => {
  assert.deepEqual(D.emphasis("for they _are_ mine"), [{ text: "for they ", em: false }, { text: "are", em: true }, { text: " mine", em: false }]);
  assert.deepEqual(D.emphasis("_un_natural"), [{ text: "un", em: true }, { text: "natural", em: false }]);
  assert.deepEqual(D.emphasis("_Across\nlines._"), [{ text: "Across\nlines.", em: true }]);
  assert.deepEqual(D.emphasis("a lone _ mark"), [{ text: "a lone _ mark", em: false }]);
  assert.deepEqual(D.emphasis("plain"), [{ text: "plain", em: false }]);
});
test("tab-separated source tables split into rows with repeated headers, other text is not a table", () => {
  const rows = D.tableRows("Date\tNo.\tRemarks.\n1855\nDec. 13th\t1\tFine\n\" 14th\t75\tFog.\nDate.\tNo.\tRemarks");
  assert.deepEqual(rows.map(row => [row.cells.length, row.header]), [[3, true], [1, false], [3, false], [3, false], [3, true]]);
  assert.equal(rows[3].cells[0], "\" 14th"); assert.equal(D.tableRows("No tabs here."), null);
});
test("the reader renders emphasis and source tables as elements built from text", () => withDOM(() => {
  const course = fixture();
  course.days[0].blocks = [{ type: "paragraph", text: "They _are_ <b>mine</b>." }, { type: "paragraph", text: "Date\tCount\n1855\nDec. 13th\t1" }];
  const html = R.reading(D.studentReading(course, 1, 1)).outerHTML;
  assert.match(html, /They <em>are<\/em> &lt;b&gt;mine&lt;\/b&gt;\./); assert.doesNotMatch(html, /_are_/);
  assert.match(html, /<table class="daily-table"><tbody><tr><th scope="col">Date<\/th><th scope="col">Count<\/th><\/tr><tr class="daily-table-span"><td colspan="2">1855<\/td><\/tr><tr><td>Dec\. 13th<\/td><td>1<\/td><\/tr>/);
  assert.match(html, /role="region"/);
}));
