"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const L = require("../src/lib/reading-library");
const RL = require("../tools/build-reading-library");
const B = require("../tools/build-daily-reading");
const { locate } = require("../tools/reading-library");

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
  const uses = new Map([["test-work-1908", [{ id: "reading-5-w01-d1", grade: 5, title: "One", genre: "fiction", blocks: [1, 1], startChar: null, endChar: null }]]]);
  RL.buildLibrary({ library, uses, output: directory });
  const index = JSON.parse(fs.readFileSync(path.join(directory, "content/reading-library/index.json")));
  assert.deepEqual(index.works[0].levels, [5]);
  const meta = JSON.parse(fs.readFileSync(path.join(directory, RL.libraryFile("test-work-1908"))));
  assert.equal(meta.contents[0].text, "CHAPTER I"); assert.equal(meta.uses[0].id, "reading-5-w01-d1");
  const chunk = JSON.parse(fs.readFileSync(path.join(directory, meta.chunks[0].file)));
  assert.equal(chunk.blocks.length, 4);
});
