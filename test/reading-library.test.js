"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const L = require("../src/lib/reading-library");
const RL = require("../tools/build-reading-library");
const B = require("../tools/build-daily-reading");
const { locate, parseMap, remapExcerpt } = require("../tools/reading-library");

const blocks = [
  { type: "heading", level: 1, text: "CHAPTER I" },
  { type: "paragraph", text: "The Mole had been working very hard all the morning." },
  { type: "stanza", text: "Ducks' tails, drakes' tails,\n  Yellow feet a-quiver," },
  { type: "paragraph", text: "It was so very clear. And then it ended." },
];
function scratch(t) {
  const parent = path.resolve(__dirname, "../.scratch/reading_library_tests"); fs.mkdirSync(parent, { recursive: true });
  const directory = fs.mkdtempSync(path.join(parent, "test-")); t.after(() => fs.rmSync(directory, { recursive: true, force: true })); return directory;
}
function work(id, text) {
  return { schemaVersion: 1, id, author: "Test Author", title: "Test Work " + id, translator: null, edition: "Synthetic fixture.", publicationYear: 1908, translationYear: null,
    url: "https://example.org/" + id, textUrl: "https://example.org/" + id + "/text",
    rights: { jurisdiction: "US", status: "public-domain", basis: "Synthetic.", verifiedDate: "2026-01-01", evidenceUrl: "https://example.org/rights" },
    acquisition: { retrieved: "2026-01-01", downloadUrl: "https://example.org/" + id + ".txt", downloadSha256: "a".repeat(64), method: "Synthetic." },
    scope: { complete: true, note: null }, text: { blocks: L.parseText(text).length, sha256: RL.sha256(Buffer.from(text)) } };
}
function writeWork(directory, id, list = blocks) {
  const text = L.serializeText(list), folder = path.join(directory, id); fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "text.jsonl"), text); fs.writeFileSync(path.join(folder, "work.json"), JSON.stringify(work(id, text), null, 2));
}

test("text serialises one canonical block per line and refuses anything else", () => {
  const text = L.serializeText(blocks);
  assert.equal(text.split("\n").length, blocks.length + 1);
  assert.deepEqual(L.parseText(text), blocks);
  assert.throws(() => L.parseText(text.slice(0, -1)), /newline/);
  assert.throws(() => L.parseText('{"text":"x","type":"paragraph"}\n'), /canonical/);
  assert.throws(() => L.parseText('{"type":"heading","level":4,"text":"x"}\n'), /level/);
  assert.throws(() => L.parseText('{"type":"note","text":"x"}\n'), /type/);
  assert.throws(() => L.parseText('{"type":"paragraph","text":"x","extra":1}\n'), /fields/);
  assert.throws(() => L.parseText('{"type":"heading","level":2,"text":"FOOTNOTES:"}\n'), /notes label/);
  assert.throws(() => L.parseText('{"type":"paragraph","text":"[Illustration: A cab]"}\n'), /illustration/);
  assert.throws(() => L.parseText('{"type":"paragraph","text":"long words like EncyclopÃ¦dia"}\n'), /decoded as Latin-1/);
  assert.throws(() => L.parseText('{"type":"paragraph","text":"itâ€™s"}\n'), /decoded as Latin-1/);
  assert.equal(L.parseText('{"type":"paragraph","text":"NIL PEJUS EST CAELIBE VITÂ"}\n').length, 1);
  assert.throws(() => L.parseText('{"type":"paragraph","text":"the second mate 19Eliza (talk) 02:12, 3 December 2023 (UTC) said"}\n'), /signature/);
  assert.equal(L.parseText('{"type":"paragraph","text":"histori (talk); vosse (you)"}\n').length, 1);
  assert.throws(() => L.parseText('{"type":"paragraph","text":"13&frac12; inches"}\n'), /HTML entity/);
  assert.throws(() => L.parseText('{"type":"paragraph","text":"caf&#233;"}\n'), /HTML entity/);
  assert.equal(L.parseText('{"type":"paragraph","text":"Smith & Sons; R&D"}\n').length, 1);
  assert.throws(() => L.parseText('{"type":"paragraph","text":"Fare {footnote A shilling.}"}\n'), /illustration/);
  assert.deepEqual(L.parseText('{"type":"heading","level":1,"text":"NOTES"}\n{"type":"paragraph","text":"FOOTNOTES:"}\n{"type":"paragraph","text":"[Footnote 1: Tweed.]"}\n').length, 3);
});
test("ranges resolve whole blocks and partial first and last blocks", () => {
  assert.deepEqual(L.resolveRange(blocks, { blocks: [1, 2] }), [{ type: "paragraph", text: blocks[1].text }, { type: "stanza", text: blocks[2].text }]);
  assert.deepEqual(L.resolveRange(blocks, { blocks: [3, 3], startChar: 22, endChar: null }), [{ type: "paragraph", text: "And then it ended." }]);
  assert.deepEqual(L.resolveRange(blocks, { blocks: [3, 3], startChar: null, endChar: 21 }), [{ type: "paragraph", text: "It was so very clear." }]);
  assert.deepEqual(L.resolveRange(blocks, { blocks: [0, 0] }), [{ type: "heading", text: "CHAPTER I" }]);
  assert.throws(() => L.resolveRange(blocks, { blocks: [2, 4] }), /outside/);
  assert.throws(() => L.resolveRange(blocks, { blocks: [3, 3], startChar: 10, endChar: 5 }), /endChar/);
});
test("overlap compares exact positions, including inside one block", () => {
  const span = (excerpt) => L.span(L.rangeOf(excerpt), blocks);
  assert.equal(L.overlaps(span({ blocks: [3, 3], endChar: 21 }), span({ blocks: [3, 3], startChar: 22 })), false);
  assert.equal(L.overlaps(span({ blocks: [3, 3], endChar: 23 }), span({ blocks: [3, 3], startChar: 22 })), true);
  assert.equal(L.overlaps(span({ blocks: [1, 2] }), span({ blocks: [2, 3] })), true);
});
test("locating a night finds its unique range and refuses ambiguity", () => {
  assert.deepEqual(locate([{ type: "paragraph", text: "And then it ended." }], blocks).range, { first: 3, last: 3, startChar: 22, endChar: null });
  assert.deepEqual(locate([{ type: "paragraph", text: "working very hard all the morning." }, { type: "stanza", text: "Ducks' tails, drakes' tails," }], blocks).range,
    { first: 1, last: 2, startChar: 18, endChar: 28 });
  assert.match(locate([{ type: "paragraph", text: "very" }], blocks).reason, /ambiguous/);
  assert.match(locate([{ type: "stanza", text: "It was so very clear." }], blocks).reason, /not found/);
});
test("the library refuses unsealed text, stray files and incomplete records", t => {
  const directory = scratch(t); writeWork(directory, "test-work-1908");
  assert.equal(RL.loadLibrary({ directory }).get("test-work-1908").blocks.length, 4);
  fs.appendFileSync(path.join(directory, "test-work-1908", "text.jsonl"), '{"type":"paragraph","text":"Added."}\n');
  assert.throws(() => RL.loadLibrary({ directory }), /does not match/);
  writeWork(directory, "test-work-1908"); fs.writeFileSync(path.join(directory, "test-work-1908", "notes.txt"), "x");
  assert.throws(() => RL.loadLibrary({ directory }), /exactly/);
  fs.rmSync(path.join(directory, "test-work-1908", "notes.txt"));
  const file = path.join(directory, "test-work-1908", "work.json"), record = JSON.parse(fs.readFileSync(file));
  delete record.acquisition; fs.writeFileSync(file, JSON.stringify(record));
  assert.throws(() => RL.loadLibrary({ directory }), /fields/);
});
test("a night citing a range resolves to the same text and hash as inline text", () => {
  const library = new Map([["test-work-1908", { work: work("test-work-1908", L.serializeText(blocks)), blocks }]]);
  const inline = { id: "x", sourceId: "test-work-1908", blocks: [{ type: "paragraph", text: "It was so very clear." }], excerpt: {} };
  const cited = { id: "x", sourceId: "test-work-1908", excerpt: { blocks: [3, 3], startChar: null, endChar: 21 } };
  assert.equal(B.textHash(B.resolveReading(cited, library, "x")), B.textHash(inline));
  assert.throws(() => B.resolveReading({ ...cited, blocks: inline.blocks }, library, "x"), /not both/);
  assert.throws(() => B.resolveReading({ ...cited, sourceId: "missing-work" }, library, "x"), /missing from the library/);
});
test("the browser library index lists works with the readings drawn from them", t => {
  const directory = scratch(t); writeWork(directory, "test-work-1908");
  const library = RL.loadLibrary({ directory });
  const uses = new Map([["test-work-1908", [
    { id: "reading-6-w02-d1", grade: 6, title: "Inline", genre: "fiction", blocks: null, startChar: null, endChar: null },
    { id: "reading-5-w01-d1", grade: 5, title: "One", genre: "fiction", blocks: [1, 1], startChar: null, endChar: null }]]]);
  RL.buildLibrary({ library, uses, output: directory });
  const index = JSON.parse(fs.readFileSync(path.join(directory, "content/reading-library/index.json")));
  assert.deepEqual(index.works[0].levels, [5, 6]);
  const meta = JSON.parse(fs.readFileSync(path.join(directory, RL.libraryFile("test-work-1908"))));
  assert.equal(meta.contents[0].text, "CHAPTER I"); assert.deepEqual(meta.uses.map(use => use.id), ["reading-5-w01-d1", "reading-6-w02-d1"]);
  const chunk = JSON.parse(fs.readFileSync(path.join(directory, meta.chunks[0].file)));
  assert.equal(chunk.blocks.length, 4);
});
test("a reading with its own text still covers the passage it reads", () => {
  const work = [
    { type: "heading", text: "CHAPTER I" },
    { type: "paragraph", text: "The Mole had been working very hard all the morning, spring-cleaning.[1]" },
    { type: "stanza", text: "Ducks' tails, drakes' tails,\nYellow feet a-quiver,\nYellow bills all out of sight" },
    { type: "paragraph", text: "[Footnote 1: A note the night leaves out of its copy.]" },
    { type: "stanza", text: "Ducks' tails, drakes' tails,\nYellow feet a-quiver,\nYellow bills all out of sight" },
  ];
  // The night drops the anchor and splits the refrain stanza into lines.
  const night = { blocks: [{ type: "paragraph", text: "The Mole had been working very hard all the morning, spring-cleaning." },
    { type: "stanza", text: "Ducks' tails, drakes' tails," }, { type: "stanza", text: "Yellow feet a-quiver," }] };
  assert.deepEqual(B.coveredBlocks(night, "w", work, new Map()), [1]);
  const exact = { blocks: [work[1], { type: "paragraph", text: "  " + work[3].text }] };
  // Spacing aside, both blocks occur once in the work and are covered.
  assert.deepEqual(B.coveredBlocks(exact, "w", work, new Map()), [1, 3]);
  // A block repeated in the work (a refrain) never marks coverage.
  assert.deepEqual(B.coveredBlocks({ blocks: [work[2]] }, "w", work, new Map()), []);
});

test("remap maps every old block once, shifts citations and refuses ones it cannot carry", () => {
  // 50 old blocks: 30–31 removed (apparatus), 41 split in two, the rest shifted.
  const table = parseMap("0-29=0, 30-31=-, 32-40=30, 41=39..40, 42-=41", 50, 49);
  assert.deepEqual([table.get(29), table.get(30), table.get(32), table.get(49)],
    [{ first: 29, last: 29, split: false }, null, { first: 30, last: 30, split: false }, { first: 48, last: 48, split: false }]);
  const whole = { blocks: [32, 41], startChar: 4, endChar: null };
  assert.equal(remapExcerpt(whole, table), null);
  assert.deepEqual(whole.blocks, [30, 40]);
  assert.match(remapExcerpt({ blocks: [29, 30] }, table), /removed block 30/);
  assert.match(remapExcerpt({ blocks: [35, 41], startChar: null, endChar: 12 }, table), /ends inside split block 41/);
  assert.match(remapExcerpt({ blocks: [41, 45], startChar: 3, endChar: null }, table), /starts inside split block 41/);
  // Gaps, overlaps, a short map or a count that disagrees with the new text are refused.
  assert.throws(() => parseMap("0-29=0, 31-=30", 50), /continue at old block 30/);
  assert.throws(() => parseMap("0-29=0", 50), /stops at old block 30/);
  assert.throws(() => parseMap("0-29=0, 30-=31", 50), /follow on at 30/);
  assert.throws(() => parseMap("0-=0", 50, 49), /new text has 49/);
  assert.throws(() => parseMap("0-1=0..3, 2-=4", 50), /one old block/);
  // A restored passage: three new blocks after old 9. A reading across the gap grows only on request.
  const restored = parseMap("0-9=0, +3, 10-=13", 20, 23);
  assert.deepEqual([...restored.inserted], [10, 11, 12]);
  assert.match(remapExcerpt({ blocks: [8, 11] }, restored), /inserted blocks 10–12/);
  const grows = { blocks: [8, 11] };
  assert.equal(remapExcerpt(grows, restored, { grow: true }), null);
  assert.deepEqual(grows.blocks, [8, 14]);
  const after = { blocks: [10, 11] }, before = { blocks: [2, 9] };
  assert.equal(remapExcerpt(after, restored), null); assert.equal(remapExcerpt(before, restored), null);
  assert.deepEqual([before.blocks, after.blocks], [[2, 9], [13, 14]]);
  // One printed paragraph that the transcription split in two: old 5–6 become new 5.
  const joinedUp = parseMap("0-4=0, 5~6=5, 7-=6", 20, 19);
  const across = { blocks: [3, 6], startChar: null, endChar: null };
  assert.equal(remapExcerpt(across, joinedUp), null);
  assert.deepEqual(across.blocks, [3, 5]);
  assert.match(remapExcerpt({ blocks: [6, 9] }, joinedUp), /starts partway through joined blocks 5–6/);
  assert.match(remapExcerpt({ blocks: [2, 5] }, joinedUp), /ends partway through joined blocks 5–6/);
  assert.match(remapExcerpt({ blocks: [2, 6], endChar: 4 }, joinedUp), /ends partway/);
  assert.throws(() => parseMap("0-4=0, 5~5=5, 6-=6", 20), /two or more old blocks/);
});
