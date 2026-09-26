"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const notes = require("../src/lib/annotations");

const TEXT = "The river rose. Farmers moved their herds to the hills before dawn.";

function plain(list) {
  return list.map(({ start, end, note }) => ({ start, end, note }));
}

test("a selection is ordered, clamped to the text, and trimmed of white space", () => {
  assert.deepEqual(notes.normalizeRange(9, 4), { start: 4, end: 9 });
  assert.deepEqual(notes.normalizeRange(-3, 500, TEXT.length), { start: 0, end: TEXT.length });
  assert.equal(notes.normalizeRange(5, 5), null);
  assert.equal(notes.normalizeRange("x", 5), null);
  assert.equal(notes.normalizeRange(null, 5), null);
  // " river " with the spaces on both sides becomes "river".
  assert.deepEqual(notes.trimRange(TEXT, 3, 10), { start: 4, end: 9 });
  assert.equal(TEXT.slice(4, 9), "river");
  assert.equal(notes.trimRange(TEXT, 15, 16), null);
  assert.equal(notes.trimRange("", 0, 3), null);
});

test("overlapping highlights merge with their notes; touching ones stay apart", () => {
  let list = [];
  let result = notes.addHighlight(list, { start: 4, end: 9 }, "flood");
  list = result.list;
  assert.deepEqual(result.highlight, { start: 4, end: 9, note: "flood" });
  result = notes.addHighlight(list, { start: 9, end: 14 });
  list = result.list;
  assert.deepEqual(plain(list), [
    { start: 4, end: 9, note: "flood" },
    { start: 9, end: 14, note: "" },
  ]);
  result = notes.addHighlight(list, { start: 16, end: 23 }, "who acts");
  list = result.list;
  // One selection across all three joins them, notes in passage order.
  result = notes.addHighlight(list, { start: 6, end: 20 });
  assert.deepEqual(result.highlight, { start: 4, end: 23, note: "flood\nwho acts" });
  assert.deepEqual(plain(result.list), [{ start: 4, end: 23, note: "flood\nwho acts" }]);
});

test("a selection inside a highlight opens that highlight unchanged", () => {
  const list = notes.addHighlight([], { start: 16, end: 40 }, "cause").list;
  const result = notes.addHighlight(list, { start: 20, end: 25 });
  assert.deepEqual(result.highlight, { start: 16, end: 40, note: "cause" });
  assert.deepEqual(plain(result.list), plain(list));
  assert.equal(notes.addHighlight(list, null).highlight, null);
});

test("notes are set and highlights removed by their start", () => {
  let list = notes.addHighlight([], { start: 0, end: 3 }).list;
  list = notes.addHighlight(list, { start: 16, end: 23 }).list;
  list = notes.setNote(list, 16, "subject");
  assert.equal(notes.findHighlight(list, 16).note, "subject");
  assert.equal(notes.hasNote(notes.findHighlight(list, 16)), true);
  assert.equal(notes.hasNote(notes.findHighlight(list, 0)), false);
  assert.equal(notes.hasNote({ start: 0, end: 1, note: "  \n " }), false);
  assert.deepEqual(notes.highlightAt(list, 20), { start: 16, end: 23, note: "subject" });
  assert.equal(notes.highlightAt(list, 23), null);
  list = notes.removeHighlight(list, 0);
  assert.deepEqual(plain(list), [{ start: 16, end: 23, note: "subject" }]);
  assert.equal(notes.findHighlight(list, 0), null);
  const long = notes.setNote(list, 16, "x".repeat(notes.MAX_NOTE_LENGTH + 50));
  assert.equal(long[0].note.length, notes.MAX_NOTE_LENGTH);
});

test("a text node's span splits into plain and highlighted pieces", () => {
  const list = [{ start: 4, end: 9, note: "" }, { start: 20, end: 30, note: "n" }];
  // A node covering characters 0–12 holds the whole first highlight.
  assert.deepEqual(notes.pieces(0, 12, list), [
    { start: 0, end: 4, highlight: null },
    { start: 4, end: 9, highlight: 0 },
    { start: 9, end: 12, highlight: null },
  ]);
  // A node starting inside the second highlight begins highlighted.
  assert.deepEqual(notes.pieces(25, 40, list), [
    { start: 25, end: 30, highlight: 1 },
    { start: 30, end: 40, highlight: null },
  ]);
  assert.deepEqual(notes.pieces(10, 20, list), [{ start: 10, end: 20, highlight: null }]);
  assert.deepEqual(notes.pieces(5, 5, list), []);
  const runs = notes.segments(TEXT, list);
  assert.equal(runs.map((run) => run.text).join(""), TEXT);
  assert.deepEqual(runs.filter((run) => run.highlight).map((run) => run.text), ["river", "ers moved "]);
  assert.equal(runs[3].highlight.note, "n");
});

test("highlights past a shorter text are cut or dropped", () => {
  const list = [{ start: 2, end: 8, note: "" }, { start: 12, end: 15, note: "" }];
  assert.deepEqual(plain(notes.clampToLength(list, 10)), [{ start: 2, end: 8, note: "" }]);
  assert.deepEqual(plain(notes.clampToLength(list, 6)), [{ start: 2, end: 6, note: "" }]);
  assert.deepEqual(notes.clampToLength(list, 0), []);
});

test("questions that show the same passage share its key", () => {
  assert.deepEqual(
    notes.passageKeys(["A long passage.", null, "A long passage.", "Another one.", "", "Another one."]),
    ["p0", null, "p0", "p3", null, "p3"],
  );
  assert.deepEqual(notes.passageKeys(undefined), []);
});

test("the store round-trips through a snapshot and drops what it cannot trust", () => {
  let store = notes.restore(null);
  let result = notes.add(store, "p0", { start: 4, end: 9 }, "flood");
  store = result.store;
  store = notes.add(store, "p0", { start: 30, end: 36 }).store;
  store = notes.add(store, "p3", { start: 0, end: 5 }, "Text 2 claim").store;
  store = notes.note(store, "p0", 30, "herds");
  const snapshot = JSON.parse(JSON.stringify({ annotations: notes.serialize(store) }));
  const back = notes.restore(snapshot.annotations);
  assert.deepEqual(back, {
    p0: [{ start: 4, end: 9, note: "flood" }, { start: 30, end: 36, note: "herds" }],
    p3: [{ start: 0, end: 5, note: "Text 2 claim" }],
  });
  assert.deepEqual(notes.list(back, "p0"), back.p0);
  assert.deepEqual(notes.list(back, "nope"), []);
  // Removing the last highlight of a passage drops the passage.
  assert.deepEqual(Object.keys(notes.remove(back, "p3", 0)), ["p0"]);
  // Hostile or stale input: bad keys, bad ranges, overlaps, and junk.
  const cleaned = notes.restore({
    p1: [{ start: 5, end: 2 }, { start: 3, end: 9, note: 7 }, "x", null, { start: "a", end: 4 }],
    __proto__: [{ start: 0, end: 1 }],
    q2: [{ start: 0, end: 1 }],
    p9: "not a list",
    p10: [],
  });
  assert.deepEqual(cleaned, { p1: [{ start: 2, end: 9, note: "7" }] });
  assert.deepEqual(notes.restore([1, 2]), {});
  assert.deepEqual(notes.restore("text"), {});
  // Only passages the set shows are kept.
  assert.deepEqual(Object.keys(notes.prune(back, ["p0", null])), ["p0"]);
});

test("a passage holds a bounded number of highlights", () => {
  let list = [];
  for (let index = 0; index < notes.MAX_PER_PASSAGE + 5; index += 1) {
    list = notes.addHighlight(list, { start: index * 2, end: index * 2 + 1 }).list;
  }
  assert.equal(list.length, notes.MAX_PER_PASSAGE);
  const many = Array.from({ length: notes.MAX_PER_PASSAGE + 20 }, (_, index) => ({ start: index * 3, end: index * 3 + 1 }));
  assert.equal(notes.restore({ p0: many }).p0.length, notes.MAX_PER_PASSAGE);
});
