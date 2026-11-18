/* The reading library: complete public-domain works that nightly readings
   cite by range. Pure functions, loadable in Node and the browser.

   A work's text is stored one block per line (JSON Lines) so a diff shows
   the paragraph that changed. docs/reading-library.md is the contract. */
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  // Browsing helpers use the daily library's grades and routes
  // (lib/daily-reading.js loads first in the page).
  const api = factory(node ? require("./daily-reading") : root.LiminalDailyReading);
  if (node) module.exports = api;
  else root.LiminalReadingLibrary = api;
})(typeof window === "object" ? window : globalThis, function (D) {
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
    // docs/reading-library.md "Notes and illustrations": one form for notes,
    // no digitiser markers, and a notes label is never a contents heading.
    if (block.type === "heading" && NOTES_LABEL.test(block.text)) throw new Error(where + ": a notes label is a paragraph, not a heading");
    if (/\[Illustration|\{footnote|\[Transcriber/i.test(block.text)) throw new Error(where + ": illustration markers, ad hoc note forms and transcriber notes stay out of the text");
    if (MOJIBAKE.test(block.text)) throw new Error(where + ": UTF-8 text decoded as Latin-1 or Windows-1252 (such as Ã¦ for æ) or a replacement character; convert from the downloaded bytes again");
  }
  const NOTES_LABEL = /^\s*foot-?notes?\s*[:.]?\s*$/i;
// UTF-8 read as a single-byte encoding: Ã or Â before a Latin-1 symbol, â€
// before punctuation, or U+FFFD. A lone Â (VITÂ, a circumflexed vowel) is text.
const MOJIBAKE = /Ã[\u0080-\u00BF]|Â[\u00A0-\u00BF]|â€|\uFFFD/;

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

  // ---- Browsing the library (library.html; build output from
  // tools/build-reading-library.js) ----
  // Routes: #<work-id> opens a work at its start, #<work-id>/<reading-id>
  // at a nightly passage, #<work-id>/b<block> at a block (a contents
  // heading). Anything else is the index.
  function route(id, at = null) {
    if (!validWorkId(id)) return "";
    if (typeof at === "number" && Number.isInteger(at) && at >= 0) return "#" + id + "/b" + at;
    return "#" + id + (typeof at === "string" && /^reading-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(at) ? "/" + at : "");
  }
  function href(id, at = null) { const hash = route(id, at); return hash ? "library.html" + hash : ""; }
  function parseRoute(hash) {
    const parts = String(hash || "").replace(/^#/, "").split("/");
    if (!parts[0] || !validWorkId(parts[0]) || parts.length > 2) return { view: "index", invalid: !!parts[0] };
    if (parts.length === 1) return { view: "work", id: parts[0], reading: null, block: null, invalid: false };
    if (/^b(?:0|[1-9][0-9]{0,6})$/.test(parts[1])) return { view: "work", id: parts[0], reading: null, block: Number(parts[1].slice(1)), invalid: false };
    if (/^reading-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parts[1])) return { view: "work", id: parts[0], reading: parts[1], block: null, invalid: false };
    return { view: "work", id: parts[0], reading: null, block: null, invalid: true };
  }
  function metaFile(id) { return validWorkId(id) ? "content/reading-library/" + id + "/meta.json" : ""; }
  const INDEX_FILE = "content/reading-library/index.json";
  // Publication periods, for filtering by when a text was written.
  const PERIODS = Object.freeze([
    { id: "before-1600", label: "Before 1600", to: 1599 }, { id: "1600s", label: "1600s", from: 1600, to: 1699 },
    { id: "1700s", label: "1700s", from: 1700, to: 1799 }, { id: "1800-1849", label: "1800–1849", from: 1800, to: 1849 },
    { id: "1850-1899", label: "1850–1899", from: 1850, to: 1899 }, { id: "1900-later", label: "1900 and later", from: 1900 },
  ]);
  function period(year) { return Number.isInteger(year) ? PERIODS.find(item => (item.from === undefined || year >= item.from) && (item.to === undefined || year <= item.to)).id : null; }
  function searchable(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘]/g, "'").toLowerCase(); }
  function families(work) { return [...new Set((work.genres || []).map(D.genreFamily))]; }
  // Every query word must appear in the title, author or translator.
  function filterWorks(works, { query = "", level = null, family = "", author = "", period: when = "" } = {}) {
    const words = searchable(query).split(/\s+/).filter(Boolean);
    return (works || []).filter(work => {
      if (level !== null && level !== "" && !(work.levels || []).includes(Number(level))) return false;
      if (family && !families(work).includes(family)) return false;
      if (author && work.author !== author) return false;
      if (when && period(work.year) !== when) return false;
      const haystack = searchable([work.title, work.author, work.translator].join(" "));
      return words.every(word => haystack.includes(word));
    });
  }
  // Filter choices offered by an index, so empty choices never appear.
  function choices(works) {
    const list = works || [];
    return { levels: [...new Set(list.flatMap(work => work.levels || []))].sort((a, b) => a - b),
      families: D.GENRE_FAMILIES.filter(family => list.some(work => families(work).includes(family))),
      authors: [...new Set(list.map(work => work.author))].sort((a, b) => a.localeCompare(b)),
      periods: PERIODS.filter(item => list.some(work => period(work.year) === item.id)) };
  }
  // A nightly reading drawn from a work: its label and where it opens.
  function useLabel(use) { return D.gradeLabel(use.grade) + " · " + (use.week ? D.nightLabel(use.week, use.day) : "Calendar reading"); }
  function useHref(use) {
    const hash = use.week ? D.route(use.grade, use.week, use.day) : D.readingRoute(use.grade, use.id);
    return hash ? "daily-reading.html" + hash : "";
  }
  function useSpan(use) { return { first: use.blocks[0], last: use.blocks[1], startChar: use.startChar == null ? null : use.startChar, endChar: use.endChar == null ? null : use.endChar }; }
  // The other readings from the same work (any level), in work order; those
  // that keep their own text (no range, blocks: null) come last.
  function related(meta, readingId) { return ((meta && meta.uses) || []).filter(use => use.id !== readingId); }
  // "Read it in the full work": the reading's passage when it cites a range of
  // the work, otherwise the work itself (a reading that keeps its own text,
  // excerpt.inlineReason, cites the work but marks nothing in it).
  function fullWorkHref(workId, reading) {
    const ranged = reading && reading.excerpt && Array.isArray(reading.excerpt.blocks) && !reading.excerpt.inlineReason;
    return href(workId, ranged ? reading.id : null);
  }
  // A use that marks a passage in the online text.
  function hasRange(use) { return !!use && Array.isArray(use.blocks); }
  // A note printed in the edition, in the library's one form:
  // "[Footnote 1: text]" (docs/reading-library.md "Notes and illustrations").
  function isFootnote(text) { return /^\s*\[Footnote [^\]:\s][^\]:]*:[\s\S]*\]\s*$/.test(String(text || "")); }
  // Which chunk of the online text holds a block.
  function chunkAt(meta, block) { return ((meta && meta.chunks) || []).findIndex(chunk => chunk.first <= block && block <= chunk.last); }
  // The blocks of one chunk, each split into pieces marked by the nightly
  // readings that cover them. A reading may begin or end inside a block
  // (startChar/endChar), so a block can hold unmarked and marked pieces.
  // `starts` lists the readings whose passage begins in the block.
  function markedBlocks(chunk, uses) {
    const ranged = (uses || []).filter(use => Array.isArray(use.blocks)).map(use => ({ use, ...useSpan(use) }));
    return chunk.blocks.map((block, offset) => {
      const index = chunk.first + offset, text = block.text, cuts = new Set([0, text.length]), covering = [];
      for (const item of ranged) {
        if (index < item.first || index > item.last) continue;
        const from = index === item.first && item.startChar !== null ? Math.min(item.startChar, text.length) : 0;
        const to = index === item.last && item.endChar !== null ? Math.min(item.endChar, text.length) : text.length;
        if (to <= from) continue;
        covering.push({ use: item.use, from, to }); cuts.add(from); cuts.add(to);
      }
      const points = [...cuts].sort((a, b) => a - b), pieces = [];
      for (let i = 0; i + 1 < points.length; i++) {
        const from = points[i], to = points[i + 1], uses = covering.filter(item => item.from <= from && to <= item.to).map(item => item.use);
        pieces.push({ text: text.slice(from, to), uses });
      }
      return { index, type: block.type, level: block.level || null, pieces,
        starts: ranged.filter(item => item.first === index).map(item => item.use) };
    });
  }
  return { WORK_ID, TYPES, validWorkId, serializeText, parseText, checkBlock, rangeOf, checkRange, resolveRange, span, overlaps, contents, chunks, slug,
    route, href, parseRoute, metaFile, INDEX_FILE, PERIODS, period, families, filterWorks, choices, useLabel, useHref, related, fullWorkHref, hasRange, isFootnote, chunkAt, markedBlocks };
});
