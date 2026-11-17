"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const L = require("../src/lib/reading-library");
const B = require("../tools/build-daily-reading");
const { buildReadings } = require("../tools/build-extra-readings");

const blocks = [
  { type: "heading", level: 2, text: "CHAPTER I." },
  { type: "paragraph", text: "The first place that I can well remember was a large pleasant meadow." },
  { type: "paragraph", text: "There were six young colts in the meadow beside me. We used to gallop all together." },
  { type: "heading", level: 2, text: "CHAPTER II." },
  { type: "heading", level: 3, text: "The Hunt." },
  { type: "paragraph", text: "Before I was two years old, a circumstance happened. It was early in the spring." },
  { type: "paragraph", text: "And soon the dogs were all tearing down the field of young wheat next to ours." },
];
const questions = quote => [1, 2, 3].map(n => ["Question " + n + "?", ["Note " + n + "."], [quote]]);
const night = (at, extra = {}) => Object.assign({ at, title: "Night", where: "Chapter", time: [8, 9], challenge: "C.", focus: "F.", context: "X.", q: questions("meadow") }, extra);
const spec = readings => ({ grade: 5, work: "sewell-black-beauty-1877", defaults: { genre: "fiction", readingMode: "shared" }, readings });

test("builds IDs, question IDs, locators and the hash of the resolved text", () => {
  const { file, problems } = buildReadings(spec([night([1, 2]), night([5, 6], { cont: true, q: questions("young wheat") })]), blocks);
  assert.deepEqual(problems, []);
  assert.equal(file.grade, 5);
  assert.deepEqual(file.readings.map(r => r.id), ["reading-5-sewell-black-beauty-1877-01", "reading-5-sewell-black-beauty-1877-02"]);
  assert.equal(file.readings[1].questions[2].id, "reading-5-sewell-black-beauty-1877-02-q3");
  const [first] = file.readings;
  assert.equal(first.excerpt.textHash, B.textHash({ blocks: L.resolveRange(blocks, first.excerpt) }));
  assert.match(first.excerpt.locator, /^Chapter; opens “The first place.*”; closes “.*gallop all together\.”\.$/);
  assert.deepEqual(first.time, { readingMinutes: 8, discussionMinutes: 9, totalMinutes: 17 });
  assert.equal(first.contentNote, null);
});

test("links continued readings both ways; only headings may lie between them", () => {
  const { file, problems } = buildReadings(spec([night([1, 2]), night([5, 5], { cont: true, q: questions("early in the spring") })]), blocks);
  assert.deepEqual(problems, []);
  assert.equal(file.readings[0].excerpt.continuesTo, file.readings[1].id);
  assert.equal(file.readings[1].excerpt.continuesFrom, file.readings[0].id);
  // A skipped paragraph breaks the run.
  const gap = buildReadings(spec([night([1, 1]), night([5, 5], { cont: true, q: questions("early in the spring") })]), blocks);
  assert.match(gap.problems.join("\n"), /does not start where it ends/);
});

test("splits inside a block with start and end anchors", () => {
  const { file, problems } = buildReadings(spec([
    night([5, 5], { end: "circumstance happened.", q: questions("two years old") }),
    night([5, 6], { start: "It was early", cont: true, q: questions("young wheat") }),
  ]), blocks);
  assert.deepEqual(problems, []);
  assert.equal(file.readings[0].excerpt.endChar, blocks[5].text.indexOf(" It was"));
  assert.equal(file.readings[1].excerpt.startChar, blocks[5].text.indexOf("It was"));
  assert.equal(L.resolveRange(blocks, file.readings[1].excerpt)[0].text, "It was early in the spring.");
});

test("refuses evidence outside the cited text and fewer than three questions", () => {
  const { problems } = buildReadings(spec([night([1, 1], { q: questions("six young colts").slice(0, 2) })]), blocks);
  assert.match(problems.join("\n"), /-01-q1: evidence not in the cited text: six young colts/);
  assert.match(problems.join("\n"), /fewer than three questions/);
});

test("refuses overlapping ranges", () => {
  const { problems } = buildReadings(spec([night([1, 2]), night([2, 2], { start: "We used", q: questions("gallop") })]), blocks);
  assert.match(problems.join("\n"), /-02: overlaps reading-5-sewell-black-beauty-1877-01/);
});
