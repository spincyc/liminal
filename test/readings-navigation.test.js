"use strict";
// The Readings area's routes, Tonight card, date calendar browsing, library
// browsing and cross-references: the pure decisions in src/lib.
const test = require("node:test"), assert = require("node:assert/strict");
const D = require("../src/lib/daily-reading"), Cal = require("../src/lib/reading-calendar"), Lib = require("../src/lib/reading-library"), LL = require("../src/lib/reading-level");

const index = { grades: [{ grade: 0, calendar: true }, { grade: 3, calendar: false }, { grade: 5, calendar: true }] };

test("routes cover the year, nights, dates, months, readings and the day print", () => {
  const opts = { grade: 5, today: "2026-11-17" };
  assert.deepEqual(D.view(index, "", opts), { view: "browse", course: index.grades[2], grade: 5, week: null, home: true, invalid: false });
  assert.equal(D.view(index, "#browse/5/12", opts).week, 12);
  for (const hash of ["#browse/5/37", "#browse/5/x", "#browse/9", "#browse/5/12/1"]) assert.equal(D.view(index, hash, opts).invalid, true, hash);
  assert.deepEqual(D.view(index, "#5/date/2028-02-29", opts), { view: "date", course: index.grades[2], grade: 5, date: "2028-02-29", invalid: false });
  assert.deepEqual(D.view(index, "#5/date/2027-02-29", opts), { view: "date", course: index.grades[2], grade: 5, date: "2026-11-17", invalid: true });
  assert.equal(D.view(index, "#5/date", opts).date, "2026-11-17");
  assert.deepEqual(D.view(index, "#k/month/2026-13", opts), { view: "month", course: index.grades[0], grade: 0, month: "2026-11", invalid: true });
  assert.equal(D.view(index, "#5/reading/reading-5-nesbit-railway-children-1906-03", opts).view, "reading");
  // A reading id must belong to the grade; anything else falls back like a bad night.
  assert.equal(D.view(index, "#5/reading/reading-3-x-01", opts).view, "read");
  assert.equal(D.view(index, "#5/reading/../../x", opts).view, "read");
  assert.deepEqual(D.view(index, "#print/night/3/2/k,5", opts), { view: "print", course: null, grade: null, date: null, until: null, week: 3, day: 2, grades: [0, 5], invalid: false });
  assert.deepEqual(D.view(index, "#print/date/2026-12-25/5,k,5", opts).grades, [0, 5]);
  assert.equal(D.view(index, "#print/date/2026-12-25/9", opts).invalid, true);
  assert.equal(D.view(index, "#print", opts).date, "2026-11-17");
  assert.equal(D.view(index, "#5/3/2", opts).view, "read");
});

test("a print takes a range of up to a month of dates, level by level in date order", () => {
  const opts = { grade: 5, today: "2026-11-17" };
  assert.deepEqual(D.view(index, "#print/dates/2026-12-21/2026-12-27/5,k", opts),
    { view: "print", course: null, grade: null, date: "2026-12-21", until: "2026-12-27", week: null, day: null, grades: [0, 5], invalid: false });
  assert.equal(D.view(index, "#print/dates/2026-12-21/2026-12-21/5", opts).until, null, "a range of one date is that date");
  // An unusable range is flagged and falls back to its first date.
  for (const hash of ["#print/dates/2026-12-27/2026-12-21/5", "#print/dates/2026-12-01/2027-01-01/5", "#print/dates/2026-12-21/5", "#print/dates/2026-02-30/2026-03-02/5"]) {
    const view = D.view(index, hash, opts);
    assert.equal(view.invalid, true, hash); assert.equal(view.until, null, hash);
  }
  assert.equal(D.view(index, "#print/dates/2026-12-27/2026-12-21/5", opts).date, "2026-12-27");
  assert.equal(D.printRoute({ date: "2026-12-21", until: "2026-12-27", grades: [0, 5] }), "#print/dates/2026-12-21/2026-12-27/k,5");
  assert.equal(D.printRoute({ date: "2026-12-21", until: "2026-12-21", grades: [5] }), "#print/date/2026-12-21/5");
  assert.equal(D.printFilename({ date: "2026-12-21", until: "2026-12-27", grades: [0, 5] }), "liminal-readings-2026-12-21-to-2026-12-27-k-5.pdf");
  assert.deepEqual(D.printDates("2028-02-27", "2028-03-01"), ["2028-02-27", "2028-02-28", "2028-02-29", "2028-03-01"]);
  assert.deepEqual(D.printDates("2026-12-31", "2027-01-01"), ["2026-12-31", "2027-01-01"]);
  assert.equal(D.printDates("2026-01-01", "2026-01-31").length, D.MAX_PRINT_DAYS);
  assert.deepEqual(D.printDates("2026-01-01", "2026-02-01"), []); assert.deepEqual(D.printDates("2026-01-02", "2026-01-01"), []);
  assert.deepEqual(D.printDates("9999-12-30", "9999-12-31"), ["9999-12-30", "9999-12-31"]); assert.deepEqual(D.printDates("2026-11-17"), ["2026-11-17"]);
  assert.equal(D.printRangeProblem("2026-12-21", "2026-12-27"), null); assert.equal(D.printRangeProblem("2026-12-21"), null);
  assert.match(D.printRangeProblem("2026-12-27", "2026-12-21"), /comes before the first/);
  assert.match(D.printRangeProblem("2026-12-01", "2027-01-01"), /at most 31 days/);
  const plan = D.printPlan(index, { date: "2026-12-24", until: "2026-12-26", grades: [0, 3, 5] });
  assert.deepEqual(plan.map(item => [item.grade, item.available]), [[0, true], [3, false], [5, true]]);
  assert.deepEqual(plan[2].nights, [{ date: "2026-12-24", footer: "Grade 5 · Thursday 24 December 2026" },
    { date: "2026-12-25", footer: "Grade 5 · Friday 25 December 2026" }, { date: "2026-12-26", footer: "Grade 5 · Saturday 26 December 2026" }]);
  assert.match(D.printPlan(index, { date: "2026-12-26", until: "2026-12-24", grades: [5] })[0].reason, /comes before the first/);
});

test("route and file builders accept only valid grades, dates and ids", () => {
  assert.equal(D.browseRoute(5, 12), "#browse/5/12"); assert.equal(D.browseRoute(5, 40), "#browse/5");
  assert.equal(D.dateRoute(13, "2026-01-31"), "#a1/date/2026-01-31"); assert.equal(D.dateRoute(5, "2026-02-30"), "");
  assert.equal(D.monthRoute(0, "2026-02"), "#k/month/2026-02"); assert.equal(D.monthRoute(0, "2026-2"), "");
  assert.equal(D.readingRoute(5, "reading-5-a-b-01"), "#5/reading/reading-5-a-b-01"); assert.equal(D.readingRoute(5, "reading-4-a-01"), "");
  assert.equal(D.readingFile(5, "reading-5-a-01"), "content/reading-daily/readings/5/reading-5-a-01.json"); assert.equal(D.readingFile(5, "reading-5-A"), "");
  assert.equal(D.calendarFile(0), "content/reading-daily/calendar/k.json"); assert.equal(D.calendarFile(17), "");
  assert.equal(D.printRoute({ date: "2026-11-17", grades: [0, 5] }), "#print/date/2026-11-17/k,5");
  assert.equal(D.printRoute({ week: 3, day: 2, grades: [12] }), "#print/night/3/2/12");
  assert.equal(D.printFilename({ week: 3, day: 2, grades: [0, 13] }), "liminal-readings-w3d2-k-a1.pdf");
  assert.equal(D.hasCalendar(index, 3), false); assert.equal(D.hasCalendar(index, 5), true);
  assert.equal(D.nightLabel(3, 2), "Week 3, Day 2"); assert.equal(D.documentTitle(["A", null, "Grade 5"]), "A · Grade 5 — Liminal");
});

test("Before you read lists time, mode, challenge, focus and a content note, skipping what is absent", () => {
  const day = { time: { readingMinutes: 12, discussionMinutes: 6, totalMinutes: 18 }, readingMode: "shared", challenge: "Track the speaker.", focus: "Imagery.", contentNote: null };
  assert.deepEqual(D.beforeYouRead(day).map(item => item.label), ["Time", "Reading", "Challenge", "Discussion focus"]);
  assert.equal(D.beforeYouRead(day)[0].text, "About 18 min: read 12, discuss 6");
  assert.deepEqual(D.beforeYouRead({ ...day, challenge: undefined, contentNote: "A storm." }).map(item => item.label), ["Time", "Reading", "Discussion focus", "Content note"]);
  assert.deepEqual(D.beforeYouRead(null), []);
});

test("continued school nights link their neighbouring parts across a week boundary", () => {
  const nights = [{ week: 2, day: 4 }, { week: 2, day: 5, continuesTo: true }, { week: 3, day: 1, continuesFrom: true, continuesTo: true }, { week: 3, day: 2, continuesFrom: true }];
  assert.deepEqual(D.continuation(5, nights, 3, 1), { part: 2, of: 3, from: { label: "Week 2, Day 5", href: "#5/2/5" }, to: { label: "Week 3, Day 2", href: "#5/3/2" } });
  assert.equal(D.continuation(5, nights, 2, 4), null); assert.equal(D.continuation(5, null, 3, 1), null);
});

test("the calendar reading projection carries no school week and withholds discussion help", () => {
  const source = { author: "A", title: "T", translator: null, edition: "E", publicationYear: 1900, translationYear: null, url: "https://example.org/a", textUrl: "javascript:x",
    rights: { jurisdiction: "US", status: "public-domain", basis: "B", verifiedDate: "2026-01-01", evidenceUrl: "https://example.org/r" } };
  const reading = { id: "reading-5-t-01", title: "One", genre: "poetry", readingMode: "independent", time: { readingMinutes: 10, discussionMinutes: 5, totalMinutes: 15 },
    context: "C", contentNote: null, focus: "F", challenge: "SECRET_CHALLENGE", excerpt: { locator: "L", isCompleteWork: true, continuesFrom: null, continuesTo: null, blocks: [1, 2] },
    blocks: [{ type: "paragraph", text: "Text." }], questions: [{ id: "q1", prompt: "P", facilitatorNotes: ["SECRET"], evidence: ["Text."] }] };
  const packet = D.studentPacket(5, reading, source);
  assert.equal(Object.hasOwn(packet.day, "week"), false); assert.equal(packet.source.textUrl, null);
  assert.doesNotMatch(JSON.stringify(packet), /SECRET/);
  assert.equal(D.studentPacket(17, reading, source), null);
  // Its PDF has a dated footer and a part, with no school week, and no discussion help.
  const T = require("../src/lib/reading-tex");
  const tex = T.nightTeX({ day: { ...reading, excerpt: { ...reading.excerpt, continuesFrom: "reading-5-t-00" } }, source, meta: D.printMeta(5, { date: "2026-11-17" }), run: { part: 2, of: 3 } }).tex;
  assert.ok(tex.includes("\\renewcommand{\\papermeta}{Grade 5 \\textperiodcentered{} Tuesday 17 November 2026}")); assert.match(tex, /Part 2 of 3/);
  assert.doesNotMatch(tex, /Week /); assert.equal(tex.match(/SECRET/g).length, 1, "only the challenge, never the notes");
});

test("remembered places are parsed as untrusted data and updated by the views", () => {
  assert.equal(D.parseRemembered("not json"), null); assert.equal(D.parseRemembered(JSON.stringify({ version: 2, grade: 5 })), null);
  assert.deepEqual(D.parseRemembered(JSON.stringify({ version: 1, grade: 5, night: { grade: 5, week: 40, day: 1 }, date: { grade: 5, date: "2026-11-17" }, extra: "<x>" })),
    { version: 1, grade: 5, night: null, date: { grade: 5, date: "2026-11-17" } });
  let state = D.remember(null, { view: "read", grade: 5, week: 3, day: 2 });
  state = D.remember(state, { view: "browse", grade: 0 });
  assert.deepEqual(state, { version: 1, grade: 0, night: { grade: 5, week: 3, day: 2 }, date: null });
  state = D.remember(state, { view: "date", grade: 0, date: "2026-11-18" });
  assert.deepEqual(D.parseRemembered(JSON.stringify(state)), state);
  assert.equal(D.remember(state, { view: "print", grade: null }), state);
});

test("Tonight offers the plan's night, the next school night and today's date reading, or the start of the year", () => {
  const state = { version: 1, grade: 5, night: { grade: 5, week: 3, day: 5 }, date: null };
  const nights = [{ week: 3, day: 5, title: "Five" }, { week: 4, day: 1, title: "Six" }];
  const entries = D.tonight({ index, state, planNight: { level: 0, week: 10, day: 1, date: "2026-11-17" }, today: "2026-11-17", nights });
  assert.deepEqual(entries.map(entry => entry.kind), ["plan", "continue", "date"]);
  assert.equal(entries[0].label, "Tonight in your plan: Kindergarten, Week 10, Day 1"); assert.equal(entries[0].href, "#k/10/1");
  assert.equal(entries[1].title, "Five"); assert.deepEqual(entries[1].next, { label: "Next: Week 4, Day 1", href: "#5/4/1", title: "Six" });
  assert.equal(entries[2].href, "#5/date/2026-11-17");
  // Without a calendar, the date entry is left out; a first visit starts the school year.
  assert.deepEqual(D.tonight({ index, state: { ...state, grade: 3 }, today: "2026-11-17" }).map(entry => entry.kind), ["continue"]);
  assert.deepEqual(D.tonight({ index: { grades: [{ grade: 3, calendar: false }] }, today: "2026-11-17" }),
    [{ kind: "start", grade: 3, label: "Start the Grade 3 school year: Week 1, Day 1", href: "#3/1/1" }]);
  assert.equal(D.tonight({ index, today: "2026-11-17", planNight: { level: 9, week: 1, day: 1 } })[0].kind, "date");
  assert.equal(D.tonight({ index, state: { ...state, night: { grade: 5, week: 36, day: 5 } }, today: "2026-11-17" })[0].next, null);
});

test("the day print says what each level prints, or why it cannot", () => {
  const plan = D.printPlan(index, { date: "2026-11-17", grades: [0, 3, 9], formatDate: () => "Tue, Nov 17" });
  assert.deepEqual(plan.map(item => [item.grade, item.available]), [[0, true], [3, false]]);
  assert.equal(plan[0].nights[0].footer, "Kindergarten · Tue, Nov 17"); assert.equal(plan[0].nights.length, 1); assert.match(plan[1].reason, /Grade 3 is not available yet/);
  assert.deepEqual(D.printPlan(index, { week: 3, day: 2, grades: [3] })[0].nights, [{ week: 3, day: 2, footer: "Grade 3 · Week 3 · Day 2" }]);
  assert.equal(D.printPlan(index, { grades: [3] })[0].available, false);
  assert.equal(D.printPlan(index, { date: "2026-11-17", grades: [5] })[0].nights[0].footer, "Grade 5 · Tuesday 17 November 2026");
  assert.equal(D.printMeta(0, { date: "2028-02-29" }), "Kindergarten · Tuesday 29 February 2028");
  assert.equal(D.printMeta(5, { week: 3, day: 2 }), "Grade 5 · Week 3 · Day 2");
  assert.equal(D.printMeta(5), "Grade 5 · Calendar reading"); assert.equal(D.printMeta(5, { date: "2026-02-30" }), "Grade 5 · Calendar reading"); assert.equal(D.printMeta(99), null);
});

test("free-text genres fall into a few families, in a fixed order", () => {
  const cases = { "poetry": "Poetry", "prose poetry": "Poetry", "nonsense verse": "Poetry", "science fiction": "Stories", "novel excerpt": "Stories", "literary-prose": "Stories",
    "realistic animal story": "Stories", "myth retelling": "Myth and legend", "folktale": "Myth and legend", "fable": "Myth and legend", "nature essay": "Nonfiction",
    "historical narrative": "Nonfiction", "philosophical-dialogue": "Nonfiction", "memoir": "Nonfiction", "drama": "Drama", "": "Other", "zzz": "Other" };
  for (const [genre, family] of Object.entries(cases)) assert.equal(D.genreFamily(genre), family, genre);
  assert.deepEqual(D.genreFamilies([{ genre: "drama" }, { genre: "poetry" }, { genre: "essay" }]), ["Poetry", "Nonfiction", "Drama"]);
  const nights = [{ title: "A", genre: "fable", mode: "shared" }, { title: "B", genre: "poetry", mode: "shared" }];
  assert.deepEqual(D.filterNights(nights, { family: "Myth and legend" }).map(night => night.title), ["A"]);
  assert.deepEqual(D.filterNights(nights, { query: "myth" }).map(night => night.title), ["A"]);
});

test("a week's summary lists its works once, in order, with its minutes", () => {
  const nights = [{ week: 1, title: "x", work: "Alpha", minutes: 10 }, { week: 1, title: "y", work: "Alpha", minutes: 12 }, { week: 1, title: "Gamma", work: null, minutes: 11 }, { week: 2, work: "B", minutes: 9 }];
  assert.deepEqual(D.weekSummary(nights, 1), { works: ["Alpha", "Gamma"], minutes: 33, span: [10, 12] });
  assert.deepEqual(D.weekSummary(nights, 5), { works: [], minutes: 0, span: null });
});

// A small calendar of built entries: one set, with a three-day run on
// November 15-17, 2026.
function calendar() {
  const entry = id => ({ id, continuesFrom: false, continuesTo: false });
  const set = { sequence: Array.from({ length: Cal.REGULAR }, (_, i) => entry("r-" + i)), anchors: Object.fromEntries(Cal.HOLIDAY_KEYS.map(key => [key, entry("r-" + key)])), leap: entry("r-leap") };
  const at = Cal.place("2026-11-15").position;
  set.sequence[at].continuesTo = true; set.sequence[at + 1].continuesFrom = set.sequence[at + 1].continuesTo = true; set.sequence[at + 2].continuesFrom = true;
  set.sequence[at + 1].week = 4; set.sequence[at + 1].day = 2;
  return { schemaVersion: 2, grade: 5, sets: [set] };
}

test("calendar browsing: runs, next dates and month grids", () => {
  const cal = calendar(), at = Cal.place("2026-11-15").position;
  assert.deepEqual(Cal.runOn(cal, "2026-11-16"), { part: 2, of: 3, first: "2026-11-15", last: "2026-11-17", previous: "2026-11-15", next: "2026-11-17" });
  assert.equal(Cal.runOn(cal, "2026-11-18"), null);
  assert.equal(Cal.nextDateOf(cal, "r-" + (at + 2), "2026-11-18"), Cal.dateAt(2027, at + 2));
  assert.equal(Cal.nextDateOf(cal, "r-" + (at + 2), "2026-11-16"), "2026-11-17");
  assert.equal(Cal.nextDateOf(cal, "r-thanksgiving", "2026-11-27"), "2027-11-25");
  assert.equal(Cal.nextDateOf(cal, "r-leap", "2026-01-01"), "2028-02-29");
  assert.equal(Cal.nextDateOf(cal, "missing", "2026-01-01"), null);
  const spans = { schemaVersion: 2, sets: [[at, 3, Cal.REGULAR - at - 3]] };
  const grid = Cal.monthGrid(cal, spans, "2026-11");
  assert.equal(grid.label, "November 2026"); assert.equal(grid.set, 1);
  assert.equal(grid.weeks[0].findIndex(Boolean), 0); // November 1, 2026 is a Sunday.
  const cells = grid.weeks.flat().filter(Boolean);
  assert.equal(cells.length, 30);
  assert.deepEqual(cells.slice(13, 18).map(cell => cell.run), ["single", "start", "middle", "end", "single"]);
  assert.deepEqual(cells.filter(cell => cell.spanStart).map(cell => cell.day), [15, 18]);
  assert.deepEqual(cells.filter(cell => cell.holiday).map(cell => [cell.day, cell.holiday.name, cell.entry.id]), [[11, "Veterans Day", "r-veterans-day"], [26, "Thanksgiving", "r-thanksgiving"]]);
  assert.equal(Cal.monthGrid(cal, spans, "2027-02").weeks.flat().filter(Boolean).length, 28);
  assert.equal(Cal.monthGrid(cal, spans, "2026-13"), null);
  assert.equal(Cal.addMonths("2026-12", 1), "2027-01"); assert.equal(Cal.addMonths("2026-01", -1), "2025-12");
});

test("library routes, filters and choices", () => {
  assert.equal(Lib.route("a-work-1900"), "#a-work-1900"); assert.equal(Lib.route("a-work-1900", 12), "#a-work-1900/b12");
  assert.equal(Lib.href("a-work-1900", "reading-5-a-01"), "library.html#a-work-1900/reading-5-a-01"); assert.equal(Lib.route("Bad Id"), "");
  assert.deepEqual(Lib.parseRoute("#a-work-1900/b7"), { view: "work", id: "a-work-1900", reading: null, block: 7, invalid: false });
  assert.deepEqual(Lib.parseRoute("#a-work-1900/reading-5-a-01").reading, "reading-5-a-01");
  assert.equal(Lib.parseRoute("#a-work-1900/zz").invalid, true); assert.equal(Lib.parseRoute("").view, "index"); assert.equal(Lib.parseRoute("#BAD").invalid, true);
  assert.equal(Lib.period(1599), "before-1600"); assert.equal(Lib.period(1850), "1850-1899"); assert.equal(Lib.period(1925), "1900-later"); assert.equal(Lib.period(null), null);
  const works = [
    { id: "a", title: "Café Songs", author: "Ann", translator: null, year: 1850, levels: [0, 5], genres: ["poetry"] },
    { id: "b", title: "Myths", author: "Bo", translator: "Cy Tran", year: 1700, levels: [12], genres: ["myth", "essay"] },
  ];
  assert.deepEqual(Lib.filterWorks(works, { query: "cafe" }).map(work => work.id), ["a"]);
  assert.deepEqual(Lib.filterWorks(works, { query: "tran" }).map(work => work.id), ["b"]);
  assert.deepEqual(Lib.filterWorks(works, { level: 5 }).map(work => work.id), ["a"]);
  assert.deepEqual(Lib.filterWorks(works, { family: "Nonfiction" }).map(work => work.id), ["b"]);
  assert.deepEqual(Lib.filterWorks(works, { author: "Bo", period: "1700s" }).map(work => work.id), ["b"]);
  assert.deepEqual(Lib.filterWorks(works, { period: "1600s" }), []);
  const choices = Lib.choices(works);
  assert.deepEqual(choices.levels, [0, 5, 12]); assert.deepEqual(choices.families, ["Poetry", "Myth and legend", "Nonfiction"]);
  assert.deepEqual(choices.authors, ["Ann", "Bo"]); assert.deepEqual(choices.periods.map(item => item.id), ["1700s", "1850-1899"]);
});

test("library uses label and link their readings, and mark exact passages inside blocks", () => {
  const night = { id: "reading-5-w03-d2", grade: 5, title: "N", week: 3, day: 2, blocks: [1, 3], startChar: null, endChar: 4 };
  const calendarReading = { id: "reading-12-a-work-1900-02", grade: 12, title: "C", blocks: [3, 5], startChar: 6, endChar: null };
  assert.equal(Lib.useLabel(night), "Grade 5 · Week 3, Day 2"); assert.equal(Lib.useHref(night), "daily-reading.html#5/3/2");
  assert.equal(Lib.useLabel(calendarReading), "Grade 12 · Calendar reading"); assert.equal(Lib.useHref(calendarReading), "daily-reading.html#12/reading/reading-12-a-work-1900-02");
  const inline = { id: "reading-5-a-work-1900-03", grade: 5, title: "I", blocks: null, startChar: null, endChar: null };
  const meta = { uses: [night, calendarReading, inline], chunks: [{ first: 0, last: 2 }, { first: 3, last: 9 }] };
  // A reading that keeps its own text is listed with the others but marks nothing.
  assert.deepEqual(Lib.related(meta, night.id).map(use => use.id), [calendarReading.id, inline.id]);
  assert.equal(Lib.hasRange(inline), false); assert.equal(Lib.hasRange(night), true);
  assert.equal(Lib.chunkAt(meta, 3), 1); assert.equal(Lib.chunkAt(meta, 10), -1);
  const marked = Lib.markedBlocks({ first: 2, blocks: [{ type: "paragraph", text: "before" }, { type: "paragraph", text: "abcdefghij" }, { type: "heading", level: 2, text: "Next" }] }, meta.uses);
  assert.deepEqual(marked[0].pieces.map(piece => [piece.text, piece.uses.map(use => use.id)]), [["before", [night.id]]]);
  assert.deepEqual(marked[1].pieces.map(piece => [piece.text, piece.uses.length]), [["abcd", 1], ["ef", 0], ["ghij", 1]]);
  assert.deepEqual(marked[1].starts.map(use => use.id), [calendarReading.id]);
  assert.equal(marked[2].level, 2); assert.equal(marked[2].pieces[0].uses[0].id, calendarReading.id);
  assert.ok(marked.every(block => block.pieces.every(piece => !piece.uses.includes(inline)) && !block.starts.includes(inline)));
  // "Read it in the full work" opens the passage, or the work for a reading with its own text.
  assert.equal(Lib.fullWorkHref("a-work-1900", { id: "reading-5-a-work-1900-01", excerpt: { blocks: [3, 5] } }), "library.html#a-work-1900/reading-5-a-work-1900-01");
  assert.equal(Lib.fullWorkHref("a-work-1900", { id: "reading-5-a-work-1900-03", excerpt: { inlineReason: "Another translation." } }), "library.html#a-work-1900");
  assert.equal(Lib.fullWorkHref("a-work-1900", null), "library.html#a-work-1900");
});

test("library notes in the edition's one form are recognised as notes", () => {
  for (const text of ["[Footnote 1: See the preface.]", "[Footnote A: Two\nlines.]", "  [Footnote 12: x]  "]) assert.equal(Lib.isFootnote(text), true, text);
  for (const text of ["FOOTNOTES:", "See [1] above.", "[Footnote: no mark]", "[Footnote 1 no colon]", "[Footnote 1: open", "", null]) assert.equal(Lib.isFootnote(text), false, String(text));
});

test("a reading-level plan names tonight's night, or the next one", () => {
  const plan = { weeks: [{ nights: [{ date: "2026-11-16", level: 5, week: 3, day: 1, kind: "core" }, { date: "2026-11-18", level: 6, week: 1, day: 1, kind: "stretch" }] }] };
  assert.deepEqual(LL.nightOn(plan, "2026-11-16"), { level: 5, week: 3, day: 1, date: "2026-11-16", kind: "core" });
  assert.equal(LL.nightOn(plan, "2026-11-17").level, 6); assert.equal(LL.nightOn(plan, "2026-11-19"), null); assert.equal(LL.nightOn(plan, "x"), null);
  const real = LL.makePlan({ startDate: "2026-11-16", core: { level: 5, index: 10 }, stretch: null, libraryLevels: [5] });
  assert.deepEqual(LL.nightOn(real, "2026-11-17"), { level: 5, week: 3, day: 2, date: "2026-11-17", kind: "core" });
});

test("unrecognized routes fall back to the remembered grade, and school-night ids redirect only to real nights", () => {
  const opts = { grade: 5, today: "2026-11-17" };
  // Finding 10: an unknown grade keeps the remembered one and is marked invalid (so it is not remembered).
  for (const hash of ["#zz/3/2", "#a1/1/1", "#5/37/1", "#7/3/2"]) {
    const selected = D.view(index, hash, opts);
    assert.equal(selected.view, "read", hash); assert.equal(selected.grade, 5, hash); assert.equal(selected.invalid, true, hash);
  }
  assert.equal(D.view(index, "#zz/3/2", {}).grade, 0);
  // Finding 11: a night's id opens the night; one naming no real night is invalid, never an empty redirect.
  assert.deepEqual(D.view(index, "#5/reading/reading-5-w03-d2", opts), { view: "read", course: index.grades[2], grade: 5, week: 3, day: 2, redirect: true, invalid: false });
  for (const id of ["reading-5-w37-d1", "reading-5-w00-d1", "reading-5-w03-d6"]) {
    const selected = D.view(index, "#5/reading/" + id, opts);
    assert.equal(selected.view, "read", id); assert.equal(selected.redirect, false, id); assert.equal(selected.invalid, true, id);
    assert.notEqual(D.route(selected.grade, selected.week, selected.day), "", id);
  }
});

test("a print link without a day opens today's date only when a chosen level has a calendar", () => {
  const opts = { grade: 3, today: "2026-11-17" };
  assert.deepEqual(D.view(index, "#print", opts), { view: "print", course: null, grade: null, date: null, until: null, week: 1, day: 1, grades: [], invalid: false });
  assert.equal(D.view(index, "#print", { ...opts, grade: 5 }).date, "2026-11-17");
  assert.equal(D.view(index, "#print/3", opts).week, 1);
  assert.equal(D.view(index, "#print/3,5", opts).date, "2026-11-17");
  assert.equal(D.view(index, "#print/date/2026-12-25/3", opts).date, "2026-12-25");
});

test("dates run from 0001-01-01 to 9999-12-31 in both libraries, with no step past either end", () => {
  for (const value of ["0001-01-01", "0099-12-31", "0100-01-01", "2028-02-29", "9999-12-31"]) {
    assert.equal(D.validDate(value), true, value); assert.notEqual(Cal.parseDate(value), null, value);
  }
  for (const value of ["0000-01-01", "2027-02-29", "1900-02-29", "2026-13-01", "10000-01-01", "2026-1-01"]) {
    assert.equal(D.validDate(value), false, value); assert.equal(Cal.parseDate(value), null, value);
  }
  assert.equal(Cal.addDays("0100-01-01", -1), "0099-12-31"); assert.equal(Cal.addDays("0001-03-01", -1), "0001-02-28");
  assert.equal(Cal.addDays("9999-12-31", 1), null); assert.equal(Cal.addDays("0001-01-01", -1), null);
  assert.equal(Cal.longDate("0099-12-31"), "Thursday, December 31, 99");
  assert.equal(D.dateRoute(5, "0099-12-31"), "#5/date/0099-12-31"); assert.equal(D.dateRoute(5, null), "");
  assert.equal(Cal.addMonths("9999-12", 1), null); assert.equal(Cal.addMonths("0001-01", -1), null); assert.equal(Cal.addMonths("0001-01", 1), "0001-02");
  assert.equal(Cal.monthGrid({ sets: [] }, null, "0050-03").weeks.flat().filter(Boolean).length, 31);
});

test("a typed date opens only when complete and committed; the picker's choice opens at once", () => {
  assert.equal(D.dateCommit({ value: "2027-11-17", current: "2026-11-17" }), "2027-11-17");
  assert.equal(D.dateCommit({ value: "0202-11-17", current: "2026-11-17", typing: true }), null);
  assert.equal(D.dateCommit({ value: "2027-11-17", current: "2026-11-17", typing: true, explicit: true }), "2027-11-17");
  assert.equal(D.dateCommit({ value: "2026-11-17", current: "2026-11-17", explicit: true }), null);
  assert.equal(D.dateCommit({ value: "", current: "2026-11-17", explicit: true }), null);
  assert.equal(D.dateCommit({ value: "2027-02-29", explicit: true }), null);
});

test("a level with a calendar has a reading for every date of any year", () => {
  assert.equal(D.calendarHas(index, 5, "2026-11-18"), true); assert.equal(D.calendarHas(index, 5, "1066-10-14"), true);
  assert.equal(D.calendarHas(index, 5, "9999-12-31"), true); assert.equal(D.calendarHas(index, 3, "2026-11-18"), false);
  assert.equal(D.calendarHas(index, 5, "2027-02-29"), false); assert.equal(D.calendarHas(index, 13, "2026-11-18"), false);
  const plan = D.printPlan(index, { date: "1999-12-25", grades: [0, 3, 5] });
  assert.deepEqual(plan.map(item => [item.grade, item.available]), [[0, true], [3, false], [5, true]]);
  assert.equal(plan[2].nights[0].footer, "Grade 5 · Saturday 25 December 1999");
});

