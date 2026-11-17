/* The reading library: complete public-domain works that nightly readings
   cite by range. Pure functions, loadable in Node and the browser.

   A work's text is stored one block per line (JSON Lines) so a diff shows
   the paragraph that changed. docs/reading-library.md is the contract. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalReadingLibrary = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const WORK_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const TYPES = Object.freeze(["heading", "paragraph", "stanza"]);
  function validWorkId(value) { return typeof value === "string" && value.length <= 80 && WORK_ID.test(value); }

  // One block per line, keys in a fixed order, so the stored bytes (and
  // their hash) follow from the blocks alone.
  function blockLine(block) {
    const out = { type: block.type };
    if (block.type === "heading" && block.level !== undefined) out.level = block.level;
    out.text = block.text;
    return JSON.stringify(out);
  }
  function serializeText(blocks) { return blocks.map(blockLine).join("\n") + "\n"; }
  function parseText(source, where = "text") {
    const value = String(source);
    if (!value.endsWith("\n") || value.includes("\r")) throw new Error(where + ": text must use LF line ends and end with a newline");
    const lines = value.slice(0, -1).split("\n");
    return lines.map((line, index) => {
      let block;
      try { block = JSON.parse(line); } catch { throw new Error(where + ": line " + (index + 1) + " is not JSON"); }
      checkBlock(block, where + ": line " + (index + 1));
      if (blockLine(block) !== line) throw new Error(where + ": line " + (index + 1) + " is not in canonical form");
      return block;
    });
  }
  function checkBlock(block, where) {
    if (!block || typeof block !== "object" || Array.isArray(block)) throw new Error(where + ": expected a block object");
    const keys = Object.keys(block).sort().join(",");
    if (!TYPES.includes(block.type)) throw new Error(where + ": invalid block type");
    if (typeof block.text !== "string" || !block.text.trim()) throw new Error(where + ": empty block text");
    if (block.type === "heading") {
      if (!(keys === "text,type" || keys === "level,text,type")) throw new Error(where + ": unexpected heading fields");
      if (block.level !== undefined && ![1, 2, 3].includes(block.level)) throw new Error(where + ": heading level must be 1-3");
    } else if (keys !== "text,type") throw new Error(where + ": unexpected block fields");
  }

  // An excerpt cites blocks [first, last] of a work, optionally starting or
  // ending inside a block (JavaScript string offsets). The nightly reader
  // sees plain {type, text} blocks; heading levels stay in the library.
  function rangeOf(excerpt) {
    if (!excerpt || !Array.isArray(excerpt.blocks)) return null;
    const [first, last] = excerpt.blocks;
    return { first, last, startChar: excerpt.startChar == null ? null : excerpt.startChar, endChar: excerpt.endChar == null ? null : excerpt.endChar };
  }
  function checkRange(range, count, where) {
    const { first, last, startChar, endChar } = range;
    if (!Number.isInteger(first) || !Number.isInteger(last) || first < 0 || last < first || last >= count) throw new Error(where + ": block range outside the work");
    for (const [name, value] of [["startChar", startChar], ["endChar", endChar]]) {
      if (value !== null && (!Number.isInteger(value) || value < 0)) throw new Error(where + ": invalid " + name);
    }
  }
  function resolveRange(blocks, excerpt, where = "excerpt") {
    const range = rangeOf(excerpt);
    if (!range) throw new Error(where + ": no block range");
    checkRange(range, blocks.length, where);
    const out = blocks.slice(range.first, range.last + 1).map(block => ({ type: block.type, text: block.text }));
    const lastText = out[out.length - 1].text;
    if (range.endChar !== null) {
      if (range.endChar < 1 || range.endChar > lastText.length || (range.first === range.last && range.startChar !== null && range.endChar <= range.startChar)) throw new Error(where + ": endChar outside its block");
      out[out.length - 1].text = lastText.slice(0, range.endChar);
    }
    if (range.startChar !== null) {
      if (range.startChar >= out[0].text.length) throw new Error(where + ": startChar outside its block");
      out[0].text = out[0].text.slice(range.startChar);
    }
    if (out.some(block => !block.text.trim())) throw new Error(where + ": range begins or ends on whitespace only");
    return out;
  }
  // Positions as [block, offset] pairs, so two excerpts of one work can be
  // compared for overlap even when they share a block.
  function span(range, blocks) {
    const end = range.endChar === null ? blocks[range.last].text.length : range.endChar;
    return { start: [range.first, range.startChar === null ? 0 : range.startChar], end: [range.last, end] };
  }
  const before = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  function overlaps(a, b) { return before(a.start, b.end) && before(b.start, a.end); }

  // Headings make the table of contents of a work, and its online chunks
  // break before a heading once a chunk is large enough.
  function contents(blocks) {
    return blocks.flatMap((block, index) => block.type === "heading" ? [{ block: index, level: block.level || 1, text: block.text }] : []);
  }
  function chunks(blocks, target = 60000) {
    const out = [];
    let start = 0, size = 0;
    blocks.forEach((block, index) => {
      if (index > start && size >= target && block.type === "heading") { out.push([start, index - 1]); start = index; size = 0; }
      size += block.text.length;
    });
    if (blocks.length) out.push([start, blocks.length - 1]);
    return out;
  }
  function slug(value) {
    return String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[’'`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  return { WORK_ID, TYPES, validWorkId, serializeText, parseText, checkBlock, rangeOf, checkRange, resolveRange, span, overlaps, contents, chunks, slug };
});
