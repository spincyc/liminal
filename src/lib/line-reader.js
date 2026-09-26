// The line reader: a band of whole lines of a passage left clear while the
// rest of the passage is dimmed, as the digital test's Line Reader does.
// The test screen measures the passage's line boxes (top and bottom of each
// piece of text, in the passage's own coordinates); this module groups them
// into lines and places, moves, and sizes the band. No DOM access. Loads in
// Node and as a plain browser script (window.LiminalLineReader).
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalLineReader = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const MIN_LINES = 1;
  const MAX_LINES = 6;
  const DEFAULT_LINES = 3;

  function finite(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  // Boxes to lines: boxes that share most of their height (the words of one
  // line, the cells of one table row, an inline badge) are one line.
  // `rects`: [{ top, bottom }] in any order. Returns sorted [{ top, bottom }].
  function groupLines(rects) {
    const boxes = (Array.isArray(rects) ? rects : [])
      .map((rect) => ({ top: finite(rect && rect.top), bottom: finite(rect && rect.bottom) }))
      .filter((rect) => rect.top !== null && rect.bottom !== null && rect.bottom > rect.top)
      .sort((a, b) => a.top - b.top || a.bottom - b.bottom);
    const lines = [];
    boxes.forEach((box) => {
      const line = lines[lines.length - 1];
      if (line) {
        const overlap = Math.min(line.bottom, box.bottom) - Math.max(line.top, box.top);
        const smaller = Math.min(line.bottom - line.top, box.bottom - box.top);
        if (overlap >= smaller / 2) {
          line.top = Math.min(line.top, box.top);
          line.bottom = Math.max(line.bottom, box.bottom);
          return;
        }
      }
      lines.push({ top: box.top, bottom: box.bottom });
    });
    return lines;
  }

  function clampSize(size) {
    const number = finite(size);
    if (number === null) return DEFAULT_LINES;
    return Math.max(MIN_LINES, Math.min(MAX_LINES, Math.round(number)));
  }

  // The first line of the band, kept so the band holds `size` lines when
  // the passage has that many.
  function clampIndex(index, lineCount, size) {
    const count = Math.max(0, Math.trunc(finite(lineCount) || 0));
    const shown = Math.min(clampSize(size), count);
    const number = Math.trunc(finite(index) || 0);
    return Math.max(0, Math.min(number, count - shown));
  }

  // The band's box: { index, size, first, last, top, bottom }, or null when
  // there are no lines. Text boxes hug the letters, so `pad` widens the
  // band by up to that much above and below, never past half the gap to
  // the next line, which stays dimmed.
  function band(lines, index, size, pad) {
    const list = Array.isArray(lines) ? lines : [];
    if (!list.length) return null;
    const first = clampIndex(index, list.length, size);
    const last = Math.min(list.length - 1, first + clampSize(size) - 1);
    const padding = Math.max(0, finite(pad) || 0);
    const above = first > 0 ? Math.max(0, list[first].top - list[first - 1].bottom) / 2 : padding;
    const below = last < list.length - 1 ? Math.max(0, list[last + 1].top - list[last].bottom) / 2 : padding;
    return {
      index: first,
      size: clampSize(size),
      first,
      last,
      top: list[first].top - Math.min(padding, above),
      bottom: list[last].bottom + Math.min(padding, below),
    };
  }

  // The line at a height: the one that contains y, else the nearest.
  function lineAt(lines, y) {
    const list = Array.isArray(lines) ? lines : [];
    const at = finite(y);
    if (!list.length || at === null) return 0;
    let best = 0;
    let bestDistance = Infinity;
    list.forEach((line, index) => {
      if (at >= line.top && at < line.bottom) {
        best = index;
        bestDistance = -1;
        return;
      }
      if (bestDistance < 0) return;
      const distance = Math.min(Math.abs(at - line.top), Math.abs(at - line.bottom));
      if (distance < bestDistance) {
        best = index;
        bestDistance = distance;
      }
    });
    return best;
  }

  function move(index, delta, lineCount, size) {
    return clampIndex(Math.trunc(finite(index) || 0) + Math.trunc(finite(delta) || 0), lineCount, size);
  }

  // Keeps the band on screen while the passage scrolls: a band wholly above
  // the visible part [viewTop, viewBottom) moves to the first line that
  // starts in it, a band wholly below moves up to the last lines that end
  // in it, and a band that shows at all stays where it is.
  function fitInView(lines, index, size, viewTop, viewBottom) {
    const list = Array.isArray(lines) ? lines : [];
    const current = band(list, index, size);
    const top = finite(viewTop);
    const bottom = finite(viewBottom);
    if (!current || top === null || bottom === null || bottom <= top) return current ? current.index : 0;
    if (current.bottom > top && current.top < bottom) return current.index;
    if (current.bottom <= top) {
      const first = list.findIndex((line) => line.top >= top);
      return clampIndex(first < 0 ? list.length - 1 : first, list.length, size);
    }
    let last = -1;
    list.forEach((line, lineIndex) => {
      if (line.bottom <= bottom) last = lineIndex;
    });
    return clampIndex(Math.max(0, last) - clampSize(size) + 1, list.length, size);
  }

  // The line reader's settings as the test screen saves them.
  function restorePrefs(raw) {
    const settings = raw && typeof raw === "object" ? raw : {};
    return { on: settings.on === true, lines: clampSize(settings.lines) };
  }

  return {
    MIN_LINES,
    MAX_LINES,
    DEFAULT_LINES,
    groupLines,
    clampSize,
    clampIndex,
    band,
    lineAt,
    move,
    fitInView,
    restorePrefs,
  };
});
