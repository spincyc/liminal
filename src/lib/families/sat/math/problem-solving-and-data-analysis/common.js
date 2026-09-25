(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/math/problem-solving-and-data-analysis"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers used by two or more Problem-Solving and Data Analysis skill files.

  const { MINUS, num } = S;

  const DATA = "Problem-Solving and Data Analysis";

  /* ------------------------------------------------------------ arithmetic */

  // Removes binary noise so exact decimal results compare equal.
  const tidy = (value) => Math.round(value * 1e9) / 1e9;

  // Finite, with at most `places` decimal places.
  function isClean(value, places) {
    if (!Number.isFinite(value)) return false;
    const scaled = value * 10 ** places;
    return Math.abs(scaled - Math.round(scaled)) < 1e-6;
  }

  // A student-produced key: terminating, at most five characters.
  const fitsGrid = (value) => isClean(value, 3) && S.formatNumber(tidy(Math.abs(value))).length <= 5;

  // Thousands separators, as the test prints them: 12500 -> "12,500".
  function fmt(value) {
    const v = tidy(value);
    const [whole, part] = S.formatNumber(Math.abs(v)).split(".");
    const grouped = whole.length > 3 ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : whole;
    return `${v < 0 ? MINUS : ""}${grouped}${part ? `.${part}` : ""}`;
  }

  // A positive wrong value as choice text, or null when a test would not
  // print it (not positive, or more than `places` decimals).
  const shown = (value, places = 2) =>
    (Number.isFinite(value) && value > 0 && isClean(value, places) ? fmt(value) : null);

  const sum = (list) => list.reduce((total, value) => total + value, 0);

  const range = (low, high) => Array.from({ length: high - low + 1 }, (_, index) => low + index);

  // Draws parameters until every constraint holds. Deterministic, because
  // the tools are seeded.
  function retry(attempt) {
    for (let tries = 0; tries < 20000; tries += 1) {
      const result = attempt();
      if (result) return result;
    }
    throw new Error("no parameters met the constraints");
  }

  // Wrong answers whose text differs from the key and from each other, in
  // the order given (strongest trap first); null texts are skipped.
  function offer(keyText, candidates) {
    const seen = new Set([keyText]);
    return candidates.filter(([text]) => {
      if (typeof text !== "string" || !text || S.BAD_TEXT.test(text) || seen.has(text)) return false;
      seen.add(text);
      return true;
    });
  }

  // Finishes an item, or returns null (so `retry` draws again) when multiple
  // choice has fewer than three distinct wrong answers or a numeric key does
  // not fit the answer grid. With `strict`, a modelled mistake that prints as
  // the key also redraws, instead of being dropped silently.
  function pack(numeric, keyValue, keyText, candidates, fields, strict = false) {
    if (strict && candidates.some(([text]) => text === keyText)) return null;
    const wrong = offer(keyText, candidates);
    if (!numeric && wrong.length < 3) return null;
    if (numeric && !fitsGrid(keyValue)) return null;
    return {
      responseType: numeric ? "numeric" : "multiple-choice",
      correct: numeric ? keyValue : keyText,
      wrong,
      ...fields,
    };
  }

  // Parses a pipe table back into cells, so verify() reads what the student reads.
  const parseTable = (content) => content.split("\n").map((row) => row.split(" | ").map((cell) => cell.trim()));

  const parseNumber = (text) => Number(String(text).replace(/,/g, "").replace(MINUS, "-"));

  // "3/8" or "−5/2" or "4" back to a number.
  function fractionValue(text) {
    const [top, bottom] = String(text).replace(MINUS, "-").split("/");
    return Number(top) / (bottom === undefined ? 1 : Number(bottom));
  }

  const close = (a, b, tolerance = 1e-6) =>
    Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));

  /* --------------------------------------------------------- figure extras */

  const r1 = (value) => Math.round(value * 10) / 10;

  function seg(p, q, width = 2, dashed = false) {
    return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round"${dashed ? ' stroke-dasharray="6 5"' : ""}/>`;
  }

  /* ------------------------------------------------------------ chart kit */

  function chartText(x, y, content, anchor = "middle", size = 13, rotate = 0) {
    const turn = rotate ? ` transform="rotate(${rotate} ${r1(x)} ${r1(y)})"` : "";
    return `<text x="${r1(x)}" y="${r1(y)}" fill="currentColor" font-size="${size}" font-family="sans-serif" text-anchor="${anchor}" dominant-baseline="middle"${turn}>${S.escapeXml(content)}</text>`;
  }

  const dataDot = (x, y, radius) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${radius}" fill="currentColor"/>`;

  const DOMAIN = "Problem-Solving and Data Analysis";

  // "14.5", or "about 14.33" when the decimal does not terminate early.
  const about = (value) => (isClean(value, 2) ? num(tidy(value)) : `about ${num(Math.round(value * 100) / 100)}`);

  // Distractors whose displayed text differs from the key and from each
  // other, in the order given (strongest trap first).
  function offerHard(keyText, candidates) {
    const seen = new Set([keyText]);
    return candidates.filter(([text]) => {
      if (typeof text !== "string" || seen.has(text)) return false;
      seen.add(text);
      return true;
    });
  }

  const finish = (numeric, fields) => ({ responseType: numeric ? "numeric" : "multiple-choice", ...fields });


  /* ------------------------------------------------------------ key rank */

  // Chooses three wrong answers so that the key's rank among four numeric
  // choices is spread over smallest to largest. When every wrong answer is a
  // near miss on one side, the key sits in the middle and a blind "pick an
  // inner value" strategy beats chance. `candidates` are [value, reason]
  // pairs in trap order (strongest first); `show` turns a value into choice
  // text (null drops it); the first `keep` candidates are always offered.
  // Returns [text, reason] pairs, or null (so `retry` draws again) when a
  // modelled mistake lands on the key or no rank can be filled.
  // With `balance`, the key is an end (smallest or largest) in half the
  // items where both ends and a middle rank can be filled, and slightly less
  // often where only one end can (so no single end dominates), instead of
  // the uniform choice among feasible ranks, which under-weights the ends:
  // they need three wrong answers on one side, so they are feasible less often.
  function spreadRank(t, key, candidates, { keep = 0, show = (value) => value, balance = false } = {}) {
    const keyText = String(show(key));
    const pool = [];
    const seen = new Set();
    for (const [index, [value, reason]] of candidates.entries()) {
      const text = Number.isFinite(value) ? show(value) : null;
      if (text === null || text === undefined) {
        if (index < keep) return null;
        continue;
      }
      if (String(text) === keyText) return null;
      if (seen.has(String(text))) continue;
      seen.add(String(text));
      pool.push({ value, reason, text, kept: index < keep });
    }
    const below = pool.filter((entry) => entry.value < key);
    const above = pool.filter((entry) => entry.value > key);
    const keptBelow = below.filter((entry) => entry.kept).length;
    const keptAbove = above.filter((entry) => entry.kept).length;
    const ranks = [0, 1, 2, 3].filter((rank) =>
      rank >= keptBelow && 3 - rank >= keptAbove && below.length >= rank && above.length >= 3 - rank);
    if (!ranks.length) return null;
    const ends = ranks.filter((rank) => rank === 0 || rank === 3);
    const middles = ranks.filter((rank) => rank === 1 || rank === 2);
    const rank = balance && ends.length && middles.length
      ? t.pick(t.chance(ends.length === 2 ? 0.5 : 0.45) ? ends : middles)
      : t.pick(ranks);
    const take = (side, count) => side.filter((entry) => entry.kept)
      .concat(side.filter((entry) => !entry.kept)).slice(0, count);
    const chosen = new Set([...take(below, rank), ...take(above, 3 - rank)]);
    return pool.filter((entry) => chosen.has(entry)).map((entry) => [entry.text, entry.reason]);
  }

  // Finishes an item whose wrong answers are numeric mistakes, each a
  // [value, reason] pair; values a test would not print (not positive, or
  // more than `places` decimals) drop out. Multiple choice spreads the key's
  // rank (spreadRank); a student-produced response keeps the candidates only
  // as a guard. Either way a modelled mistake that lands on the key returns
  // null, so `retry` draws again instead of silently losing that trap.
  function packRanked(t, numeric, key, candidates, fields, { show = fmt, keep = 0, places = 2, positive = true } = {}) {
    const printable = (value) => Number.isFinite(value) && (!positive || value > 0) && isClean(value, places);
    const keyText = show(key);
    const cleaned = candidates.map(([value, reason]) => [printable(value) ? value : NaN, reason]);
    if (cleaned.some(([value]) => Number.isFinite(value) && show(value) === keyText)) return null;
    if (numeric) return pack(true, key, keyText, [], fields);
    const wrong = spreadRank(t, key, cleaned, { keep, show, balance: true });
    return wrong ? pack(false, key, keyText, wrong, fields) : null;
  }

  // Statements about two things (a statistic, a group) and two outcomes,
  // offered as the full 2 x 2 grid: each choice shares one half with two
  // others, so no choice is the "hub" the others vary around. `grid(i, j)`
  // gives [text, reason, isTrue] for row i and column j; exactly one cell
  // must be true. Returns { correct, wrong } or null when that fails.
  function statementGrid(grid) {
    const cells = [0, 1].flatMap((i) => [0, 1].map((j) => grid(i, j)));
    const truths = cells.filter((cell) => cell[2]);
    if (truths.length !== 1) return null;
    return { correct: truths[0][0], wrong: cells.filter((cell) => !cell[2]).map(([text, reason]) => [text, reason]) };
  }

  /* ---------------------------------------------------------- data figures */
  //
  // Dot plots, box plots, and histograms for one-variable data. Each drawing
  // has a reader that recovers the data from the SVG itself (tick labels fix
  // the scale), so verify() checks what the student sees.

  const DOT_RADIUS = 6.5;

  // Dot plot: one column of dots above each value on a number line.
  function dotPlot(values, freqs, title, alt) {
    const left = 60;
    const right = 340;
    const gap = (right - left) / (values.length - 1);
    const height = 96 + Math.max(...freqs) * 17;
    const axisY = height - 52;
    const xs = values.map((_, index) => left + index * gap);
    const parts = [seg([left - 30, axisY], [right + 30, axisY], 1.5)];
    values.forEach((value, index) => {
      parts.push(seg([xs[index], axisY], [xs[index], axisY + 6], 1.5));
      parts.push(chartText(xs[index], axisY + 19, num(value), "middle", 14));
      for (let row = 0; row < freqs[index]; row += 1) {
        parts.push(dataDot(xs[index], axisY - 13 - row * 17, DOT_RADIUS));
      }
    });
    parts.push(chartText(200, height - 14, title, "middle", 14));
    return { figure: { svg: S.svg(400, height, parts, alt), alt, notToScale: false }, xs };
  }

  // Reads a dot plot back into counts per column, from the SVG itself.
  function readDotPlot(svg, xs) {
    const counts = xs.map(() => 0);
    const pattern = new RegExp(`<circle cx="([\\d.]+)" cy="([\\d.]+)" r="${DOT_RADIUS}"`, "g");
    let match;
    while ((match = pattern.exec(svg))) {
      const cx = Number(match[1]);
      const index = xs.findIndex((x) => Math.abs(x - cx) < 0.2);
      if (index < 0) return null;
      counts[index] += 1;
    }
    return counts;
  }

  // Several dot plots stacked over one shared scale, each row named at the
  // left: rows = [{ name, freqs }]. Returns the figure and each row's
  // baseline, so a reader can sort dots into rows.
  function stackedDotPlots(values, rows, title, alt) {
    const left = 110;
    const right = 370;
    const gap = (right - left) / (values.length - 1);
    const xs = values.map((_, index) => left + index * gap);
    const parts = [];
    const baselines = [];
    let y = 14;
    rows.forEach((row) => {
      const tall = Math.max(1, ...row.freqs) * 15 + 16;
      const axisY = y + tall;
      baselines.push(axisY);
      parts.push(seg([left - 20, axisY], [right + 20, axisY], 1.5));
      parts.push(chartText(14, axisY - 10, row.name, "start", 13));
      values.forEach((value, index) => {
        parts.push(seg([xs[index], axisY], [xs[index], axisY + 5], 1.5));
        parts.push(chartText(xs[index], axisY + 17, num(value), "middle", 12));
        for (let dot = 0; dot < row.freqs[index]; dot += 1) {
          parts.push(dataDot(xs[index], axisY - 10 - dot * 15, 5.5));
        }
      });
      y = axisY + 34;
    });
    parts.push(chartText((left + right) / 2, y + 2, title, "middle", 13));
    return { figure: { svg: S.svg(400, y + 16, parts, alt), alt, notToScale: false }, xs, baselines };
  }

  function readStackedDotPlots(svg, xs, baselines) {
    const counts = baselines.map(() => xs.map(() => 0));
    for (const match of svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="5.5"/g)) {
      const cx = Number(match[1]);
      const cy = Number(match[2]);
      const column = xs.findIndex((x) => Math.abs(x - cx) < 0.2);
      // A dot belongs to the nearest number line below it.
      const row = baselines.reduce((best, base, index) =>
        (base > cy && (best < 0 || base < baselines[best]) ? index : best), -1);
      if (column < 0 || row < 0) return null;
      counts[row][column] += 1;
    }
    return counts;
  }

  const BOX = { left: 40, right: 360, top: 40, bottom: 76, whisker: 58, axis: 110 };

  function boxPlot(values, ticks, title, alt) {
    const at = (value) => BOX.left + ((value - ticks[0]) / (ticks[ticks.length - 1] - ticks[0])) * (BOX.right - BOX.left);
    const [low, q1, med, q3, high] = values.map(at);
    const parts = [seg([BOX.left - 15, BOX.axis], [BOX.right + 15, BOX.axis], 1.5)];
    ticks.forEach((tick) => {
      parts.push(seg([at(tick), BOX.axis], [at(tick), BOX.axis + 6], 1.5));
      parts.push(chartText(at(tick), BOX.axis + 20, num(tick), "middle", 12));
    });
    parts.push(
      `<rect x="${r1(q1)}" y="${BOX.top}" width="${r1(q3 - q1)}" height="${BOX.bottom - BOX.top}" fill="none" stroke="currentColor" stroke-width="2"/>`,
      seg([med, BOX.top], [med, BOX.bottom], 2.5),
      seg([low, BOX.whisker], [q1, BOX.whisker], 2),
      seg([q3, BOX.whisker], [high, BOX.whisker], 2),
      seg([low, BOX.whisker - 10], [low, BOX.whisker + 10], 2),
      seg([high, BOX.whisker - 10], [high, BOX.whisker + 10], 2),
      chartText(200, BOX.axis + 48, title, "middle", 13),
    );
    return { svg: S.svg(400, BOX.axis + 62, parts, alt), alt, notToScale: false };
  }

  // Reads the five-number summary back from the drawing: the tick labels fix
  // the scale, the box gives the quartiles, and the upright strokes above the
  // axis are the whisker ends and the median.
  function readBoxPlot(svg) {
    const labels = [...svg.matchAll(/<text x="([\d.]+)"[^>]*>([^<]+)<\/text>/g)]
      .filter((match) => /^\d+(\.\d+)?$/.test(match[2]))
      .map((match) => [Number(match[1]), Number(match[2])]);
    const [[x0, v0], [x1, v1]] = [labels[0], labels[labels.length - 1]];
    // Drawn positions are rounded to a tenth of a pixel; every value sits on a whole number.
    const value = (x) => Math.round(v0 + ((x - x0) * (v1 - v0)) / (x1 - x0));
    const box = svg.match(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/);
    const uprights = [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)]
      .filter((match) => match[1] === match[3] && Number(match[4]) < BOX.axis)
      .map((match) => Number(match[1]));
    const xs = [...new Set(uprights)].sort((p, q) => p - q);
    if (!box || xs.length !== 3) return null;
    return [value(xs[0]), value(Number(box[1])), value(xs[1]), value(Number(box[1]) + Number(box[2])), value(xs[2])];
  }

  // Box plots of several groups over one shared scale: rows = [{ name, five }].
  function stackedBoxPlots(rows, ticks, title, alt) {
    const left = 110;
    const right = 380;
    const at = (value) => left + ((value - ticks[0]) / (ticks[ticks.length - 1] - ticks[0])) * (right - left);
    const parts = [];
    rows.forEach((row, index) => {
      const top = 16 + index * 62;
      const mid = top + 18;
      const [low, q1, med, q3, high] = row.five.map(at);
      parts.push(
        chartText(14, mid, row.name, "start", 13),
        `<rect x="${r1(q1)}" y="${top}" width="${r1(q3 - q1)}" height="36" fill="none" stroke="currentColor" stroke-width="2"/>`,
        seg([med, top], [med, top + 36], 2.5),
        seg([low, mid], [q1, mid], 2),
        seg([q3, mid], [high, mid], 2),
        seg([low, mid - 9], [low, mid + 9], 2),
        seg([high, mid - 9], [high, mid + 9], 2),
      );
    });
    const axis = 16 + rows.length * 62;
    parts.push(seg([left - 10, axis], [right + 10, axis], 1.5));
    ticks.forEach((tick) => {
      parts.push(seg([at(tick), axis], [at(tick), axis + 6], 1.5));
      parts.push(chartText(at(tick), axis + 19, num(tick), "middle", 12));
    });
    parts.push(chartText((left + right) / 2, axis + 44, title, "middle", 13));
    return { svg: S.svg(400, axis + 58, parts, alt), alt, notToScale: false };
  }

  // Five-number summaries back from stacked box plots, row by row (top first).
  function readStackedBoxPlots(svg, count) {
    const labels = [...svg.matchAll(/<text x="([\d.]+)"[^>]*text-anchor="middle"[^>]*>([^<]+)<\/text>/g)]
      .filter((match) => /^\d+(\.\d+)?$/.test(match[2]))
      .map((match) => [Number(match[1]), Number(match[2])]);
    if (labels.length < 2) return null;
    const [[x0, v0], [x1, v1]] = [labels[0], labels[labels.length - 1]];
    const value = (x) => Math.round(v0 + ((x - x0) * (v1 - v0)) / (x1 - x0));
    const boxes = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)]
      .map((match) => match.slice(1).map(Number));
    const lines = [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)]
      .map((match) => match.slice(1).map(Number));
    if (boxes.length !== count) return null;
    return boxes.map(([x, y, width, height]) => {
      const uprights = [...new Set(lines
        .filter(([ax, ay, bx, by]) => ax === bx && Math.min(ay, by) >= y - 0.1 && Math.max(ay, by) <= y + height + 0.1)
        .map(([ax]) => ax))].sort((p, q) => p - q);
      if (uprights.length !== 3) return null;
      return [value(uprights[0]), value(x), value(uprights[1]), value(x + width), value(uprights[2])];
    });
  }

  // Histogram of equal-width classes: `edges` are the class boundaries
  // (k + 1 numbers) and `counts` the k frequencies. Bars are shaded
  // rectangles over a frequency scale with light gridlines.
  function histogram(edges, counts, xTitle, alt) {
    const left = 64;
    const right = 392;
    const top = 16;
    const bottom = 214;
    const peak = Math.max(...counts);
    const step = peak <= 8 ? 1 : peak <= 16 ? 2 : peak <= 40 ? 5 : 10;
    const yMax = Math.ceil((peak + 0.5) / step) * step;
    const width = (right - left) / counts.length;
    const yAt = (value) => bottom - (value / yMax) * (bottom - top);
    // Gridlines at every whole frequency up to 20, so every bar top can be
    // read exactly; larger scales grid at the label step.
    const grid = yMax <= 20 ? 1 : step;
    const parts = [];
    for (let level = grid; level <= yMax; level += grid) {
      parts.push(`<line x1="${left}" y1="${r1(yAt(level))}" x2="${right}" y2="${r1(yAt(level))}" stroke="currentColor" stroke-width="1" stroke-opacity="0.25"/>`);
    }
    for (let level = 0; level <= yMax; level += step) {
      parts.push(chartText(left - 8, yAt(level), num(level), "end", 12));
    }
    counts.forEach((count, index) => {
      if (!count) return;
      parts.push(`<rect x="${r1(left + index * width)}" y="${r1(yAt(count))}" width="${r1(width)}" height="${r1(bottom - yAt(count))}" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>`);
    });
    parts.push(seg([left, bottom], [right, bottom], 1.5), seg([left, top - 4], [left, bottom], 1.5));
    edges.forEach((edge, index) => {
      const x = left + index * width;
      parts.push(seg([x, bottom], [x, bottom + 5], 1.5));
      parts.push(chartText(x, bottom + 18, num(edge), "middle", 12));
    });
    parts.push(chartText((left + right) / 2, bottom + 42, xTitle, "middle", 13));
    parts.push(chartText(18, (top + bottom) / 2, "Frequency", "middle", 13, -90));
    return { svg: S.svg(420, bottom + 58, parts, alt), alt, notToScale: false };
  }

  // Frequencies back from a histogram: the frequency labels fix the scale and
  // each bar's position and height give its class and count.
  function readHistogram(svg, classes) {
    const yLabels = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*text-anchor="end"[^>]*>([^<]+)<\/text>/g)]
      .map((match) => [Number(match[2]), Number(match[3])]);
    const xLabels = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*text-anchor="middle"[^>]*>([^<]+)<\/text>/g)]
      .filter((match) => /^\d+(\.\d+)?$/.test(match[3]))
      .map((match) => Number(match[1]));
    if (yLabels.length < 2 || xLabels.length !== classes + 1) return null;
    const [[y0, v0], [y1, v1]] = [yLabels[0], yLabels[yLabels.length - 1]];
    const perPixel = (v1 - v0) / (y0 - y1);
    const counts = Array(classes).fill(0);
    for (const match of svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)) {
      const [x, , width, height] = match.slice(1).map(Number);
      const index = xLabels.findIndex((edge) => Math.abs(edge - x) < 0.6);
      if (index < 0 || Math.abs(xLabels[index + 1] - (x + width)) > 0.6) return null;
      counts[index] = Math.round(height * perPixel);
    }
    return counts;
  }

  return {
    DATA, tidy, isClean, fitsGrid, fmt, shown, sum, range, retry, pack, parseTable, parseNumber,
    fractionValue, close, r1, seg, chartText, dataDot, DOMAIN, about, offerHard, finish, spreadRank,
    packRanked, statementGrid, DOT_RADIUS, dotPlot, readDotPlot, stackedDotPlots, readStackedDotPlots,
    BOX, boxPlot, readBoxPlot, stackedBoxPlots, readStackedBoxPlots, histogram, readHistogram,
  };
});
