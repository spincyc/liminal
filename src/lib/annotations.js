// Highlights and notes on a passage: the digital test's Annotate tool.
//
// A highlight is { start, end, note }: character offsets into the passage's
// rendered text (its text nodes in document order, which is the element's
// textContent), never DOM nodes, so it survives re-rendering, moving between
// questions, and resuming after a reload. A passage's highlights never
// overlap and stay sorted, so a highlight's start identifies it. Selecting
// over existing highlights merges them into one and keeps their notes.
//
// The store is session scratch carried in the test screen's snapshot:
// { [passageKey]: highlights }. It is never written to the progress record.
// Loads in Node and as a plain browser script (window.LiminalAnnotations).
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalAnnotations = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const MAX_NOTE_LENGTH = 1000;
  const MAX_PER_PASSAGE = 200;
  // A passage key names the first question of the set that shows the
  // passage: p0, p3.
  const KEY = /^p\d{1,4}$/;

  function whole(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? Math.trunc(number) : null;
  }

  // A range as { start, end } with start < end, inside [0, length] when a
  // length is given; null when empty or unreadable.
  function normalizeRange(start, end, length) {
    let from = whole(start);
    let to = whole(end);
    if (from === null || to === null) return null;
    if (from > to) [from, to] = [to, from];
    const limit = whole(length);
    from = Math.max(0, from);
    if (limit !== null) to = Math.min(limit, to);
    return from < to ? { start: from, end: to } : null;
  }

  // A selection shrunk to its text: leading and trailing white space is
  // dropped (a double-click often takes the space after a word). Null when
  // nothing but white space is left.
  function trimRange(text, start, end) {
    const source = String(text === null || text === undefined ? "" : text);
    const range = normalizeRange(start, end, source.length);
    if (!range) return null;
    let from = range.start;
    let to = range.end;
    while (from < to && /\s/.test(source[from])) from += 1;
    while (to > from && /\s/.test(source[to - 1])) to -= 1;
    return from < to ? { start: from, end: to } : null;
  }

  function cleanNote(note) {
    return String(note === null || note === undefined ? "" : note).slice(0, MAX_NOTE_LENGTH);
  }

  function hasNote(highlight) {
    return Boolean(highlight) && cleanNote(highlight.note).trim() !== "";
  }

  // Notes of merged highlights, in passage order, each kept once.
  function joinNotes(notes) {
    const kept = [];
    notes.forEach((note) => {
      const text = cleanNote(note).trim();
      if (text && !kept.includes(text)) kept.push(text);
    });
    return cleanNote(kept.join("\n"));
  }

  function copy(highlight) {
    return { start: highlight.start, end: highlight.end, note: cleanNote(highlight.note) };
  }

  // Any list to a clean one: valid ranges only, sorted, overlaps merged,
  // at most MAX_PER_PASSAGE.
  function normalizeList(list) {
    const valid = (Array.isArray(list) ? list : [])
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const range = normalizeRange(item.start, item.end);
        return range ? { start: range.start, end: range.end, note: cleanNote(item.note) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start || a.end - b.end);
    const merged = [];
    valid.forEach((item) => {
      const last = merged[merged.length - 1];
      if (last && item.start < last.end) {
        last.end = Math.max(last.end, item.end);
        last.note = joinNotes([last.note, item.note]);
      } else {
        merged.push(item);
      }
    });
    return merged.slice(0, MAX_PER_PASSAGE);
  }

  // Adds a highlight. Highlights it overlaps join it (touching ones stay
  // apart), and so do their notes; a range already inside one highlight
  // returns that highlight unchanged. Returns { list, highlight }, or the
  // list unchanged and highlight null when the range is empty or the
  // passage is full.
  function addHighlight(list, range, note) {
    const current = normalizeList(list);
    const span = range ? normalizeRange(range.start, range.end) : null;
    if (!span) return { list: current, highlight: null };
    const inside = current.find((item) => item.start <= span.start && span.end <= item.end);
    if (inside && !cleanNote(note).trim()) return { list: current, highlight: copy(inside) };
    const overlapping = current.filter((item) => item.start < span.end && span.start < item.end);
    if (!overlapping.length && current.length >= MAX_PER_PASSAGE) {
      return { list: current, highlight: null };
    }
    const highlight = {
      start: Math.min(span.start, ...overlapping.map((item) => item.start)),
      end: Math.max(span.end, ...overlapping.map((item) => item.end)),
      note: joinNotes(overlapping.map((item) => item.note).concat(note)),
    };
    const next = current.filter((item) => !overlapping.includes(item)).concat(highlight)
      .sort((a, b) => a.start - b.start);
    return { list: next, highlight: copy(highlight) };
  }

  function removeHighlight(list, start) {
    const at = whole(start);
    return normalizeList(list).filter((item) => item.start !== at);
  }

  function setNote(list, start, note) {
    const at = whole(start);
    return normalizeList(list).map((item) => (item.start === at
      ? { start: item.start, end: item.end, note: cleanNote(note) }
      : item));
  }

  function findHighlight(list, start) {
    const at = whole(start);
    const found = normalizeList(list).find((item) => item.start === at);
    return found ? copy(found) : null;
  }

  // The highlight covering one character offset, or null.
  function highlightAt(list, offset) {
    const at = whole(offset);
    const found = normalizeList(list).find((item) => item.start <= at && at < item.end);
    return found ? copy(found) : null;
  }

  // Highlights that fit a text of `length` characters: those past its end
  // go, and one running over is cut at the end.
  function clampToLength(list, length) {
    const limit = Math.max(0, whole(length) || 0);
    return normalizeList(list)
      .filter((item) => item.start < limit)
      .map((item) => Object.assign(item, { end: Math.min(item.end, limit) }));
  }

  // Splits [start, end), one text node's span of the passage, into the
  // pieces the renderer wraps: { start, end, highlight } where highlight is
  // an index into the (normalized) list, or null for plain text.
  function pieces(start, end, list) {
    const from = whole(start);
    const to = whole(end);
    if (from === null || to === null || from >= to) return [];
    const highlights = normalizeList(list);
    const out = [];
    let at = from;
    highlights.forEach((item, index) => {
      if (item.end <= at || item.start >= to) return;
      if (item.start > at) out.push({ start: at, end: item.start, highlight: null });
      const pieceEnd = Math.min(item.end, to);
      out.push({ start: Math.max(item.start, at), end: pieceEnd, highlight: index });
      at = pieceEnd;
    });
    if (at < to) out.push({ start: at, end: to, highlight: null });
    return out;
  }

  // A whole text split into plain and highlighted runs, for tests and for
  // renderers that hold the text as one string.
  function segments(text, list) {
    const source = String(text === null || text === undefined ? "" : text);
    const highlights = clampToLength(list, source.length);
    return pieces(0, source.length, highlights).map((piece) => ({
      text: source.slice(piece.start, piece.end),
      start: piece.start,
      end: piece.end,
      highlight: piece.highlight === null ? null : copy(highlights[piece.highlight]),
    }));
  }

  /* ---------------------------------------------------------- passages */

  // One key per question: the key of the first question in the set that
  // shows the same passage text, so the questions of a shared passage share
  // its highlights; null for a question without a passage. `contents` holds
  // each question's passage text or null.
  function passageKeys(contents) {
    const first = new Map();
    return (Array.isArray(contents) ? contents : []).map((content, index) => {
      if (typeof content !== "string" || content === "") return null;
      if (!first.has(content)) first.set(content, `p${index}`);
      return first.get(content);
    });
  }

  /* -------------------------------------------------------------- store */

  function restore(raw) {
    const store = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return store;
    Object.keys(raw).forEach((key) => {
      if (!KEY.test(key)) return;
      const list = normalizeList(raw[key]);
      if (list.length) store[key] = list;
    });
    return store;
  }

  // The JSON a snapshot carries: passages with highlights only.
  function serialize(store) {
    return restore(store);
  }

  function listFor(store, key) {
    return store && KEY.test(String(key)) ? normalizeList(store[key]) : [];
  }

  function withList(store, key, list) {
    const next = restore(store);
    if (!KEY.test(String(key))) return next;
    if (list.length) next[key] = list;
    else delete next[key];
    return next;
  }

  // Returns { store, highlight }.
  function add(store, key, range, note) {
    const result = addHighlight(listFor(store, key), range, note);
    return { store: withList(store, key, result.list), highlight: result.highlight };
  }

  function remove(store, key, start) {
    return withList(store, key, removeHighlight(listFor(store, key), start));
  }

  function note(store, key, start, text) {
    return withList(store, key, setNote(listFor(store, key), start, text));
  }

  // Keeps only the passages a set shows.
  function prune(store, keys) {
    const allowed = new Set((keys || []).filter(Boolean));
    const next = restore(store);
    Object.keys(next).forEach((key) => {
      if (!allowed.has(key)) delete next[key];
    });
    return next;
  }

  return {
    MAX_NOTE_LENGTH,
    MAX_PER_PASSAGE,
    // One passage's list
    normalizeRange,
    trimRange,
    normalizeList,
    addHighlight,
    removeHighlight,
    setNote,
    findHighlight,
    highlightAt,
    clampToLength,
    pieces,
    segments,
    hasNote,
    // Passages and the store
    passageKeys,
    restore,
    serialize,
    list: listFor,
    add,
    remove,
    note,
    prune,
  };
});
