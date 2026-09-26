"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const reader = require("../src/lib/line-reader");

// Five lines 26px apart, with a paragraph gap after the second, as boxes
// the browser reports: several words per line, out of order, one badge a
// little taller than its line, and an empty box.
const BOXES = [
  { top: 32, bottom: 56 }, { top: 32, bottom: 56 },
  { top: 84, bottom: 108 }, { top: 58, bottom: 82 },
  { top: 120, bottom: 144 }, { top: 118, bottom: 146 },
  { top: 146, bottom: 170 }, { top: 172, bottom: 196 },
  { top: 200, bottom: 200 },
];

test("boxes that share a line become one line", () => {
  assert.deepEqual(reader.groupLines(BOXES), [
    { top: 32, bottom: 56 },
    { top: 58, bottom: 82 },
    { top: 84, bottom: 108 },
    { top: 118, bottom: 146 },
    { top: 146, bottom: 170 },
    { top: 172, bottom: 196 },
  ]);
  assert.deepEqual(reader.groupLines(null), []);
  assert.deepEqual(reader.groupLines([{ top: "x", bottom: 3 }]), []);
});

test("the band holds whole lines and stays inside the passage", () => {
  const lines = reader.groupLines(BOXES);
  assert.deepEqual(reader.band(lines, 1, 3), { index: 1, size: 3, first: 1, last: 3, top: 58, bottom: 146 });
  // Past the end it backs up so it still shows three lines.
  assert.equal(reader.band(lines, 9, 3).index, 3);
  assert.equal(reader.band(lines, -4, 3).index, 0);
  // A passage shorter than the band shows all of it.
  assert.deepEqual(reader.band(lines.slice(0, 2), 1, 4), { index: 0, size: 4, first: 0, last: 1, top: 32, bottom: 82 });
  assert.equal(reader.band([], 0, 3), null);
  // Padding reaches half way to the dimmed neighbours, and the full amount
  // at the ends of the passage.
  const padded = reader.band(lines, 1, 2, 6);
  assert.deepEqual([padded.top, padded.bottom], [57, 108 + 5]);
  const ends = reader.band(lines, 0, 6, 6);
  assert.deepEqual([ends.top, ends.bottom], [26, 202]);
});

test("the band moves a line at a time and sizes between the limits", () => {
  assert.equal(reader.move(0, 1, 6, 3), 1);
  assert.equal(reader.move(3, 1, 6, 3), 3);
  assert.equal(reader.move(1, -5, 6, 3), 0);
  assert.equal(reader.clampSize(0), reader.MIN_LINES);
  assert.equal(reader.clampSize(99), reader.MAX_LINES);
  assert.equal(reader.clampSize("2"), 2);
  assert.equal(reader.clampSize(undefined), reader.DEFAULT_LINES);
  assert.equal(reader.clampSize(null), reader.DEFAULT_LINES);
});

test("a height finds the line under it, or the nearest line", () => {
  const lines = reader.groupLines(BOXES);
  assert.equal(reader.lineAt(lines, 60), 1);
  assert.equal(reader.lineAt(lines, 113), 2);
  assert.equal(reader.lineAt(lines, 0), 0);
  assert.equal(reader.lineAt(lines, 999), 5);
  assert.equal(reader.lineAt([], 40), 0);
});

test("scrolling keeps the band on screen", () => {
  const lines = reader.groupLines(BOXES);
  // Still partly visible: stays.
  assert.equal(reader.fitInView(lines, 0, 2, 70, 200), 0);
  // Scrolled past: moves to the first line that starts in view.
  assert.equal(reader.fitInView(lines, 0, 2, 100, 300), 3);
  // Scrolled back above it: moves up to the last lines that end in view.
  assert.equal(reader.fitInView(lines, 4, 2, 0, 110), 1);
  assert.equal(reader.fitInView(lines, 4, 2, 0, 20), 0);
  assert.equal(reader.fitInView([], 4, 2, 0, 20), 0);
});

test("saved settings are read safely", () => {
  assert.deepEqual(reader.restorePrefs({ on: true, lines: 4 }), { on: true, lines: 4 });
  assert.deepEqual(reader.restorePrefs({ on: "yes", lines: 40 }), { on: false, lines: reader.MAX_LINES });
  assert.deepEqual(reader.restorePrefs(null), { on: false, lines: reader.DEFAULT_LINES });
});
