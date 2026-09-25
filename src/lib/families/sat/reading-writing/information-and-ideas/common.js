(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/reading-writing/information-and-ideas"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers shared by the Information and Ideas skill files. Each template
  // is one question design (a reading task, a passage structure, a reasoning
  // move) paired with its own bank of topic records. Every topic is a scene
  // with its own passage and its own four choices, so a run that takes one
  // question per template and one per scene never shows the same design or
  // the same topic twice. Scene ids start with "ii-" so they never collide
  // with other files.

  const RW = { sectionKey: "sat-reading-writing", domain: "Information and Ideas" };
  const SECONDS = { Easy: 55, Medium: 75, Hard: 95 };

  const passage = (content) => ({ type: "passage", content });

  // True when each fragment occurs in the text, each after the one before.
  function inOrder(text, fragments) {
    let from = 0;
    for (const fragment of fragments) {
      const at = text.indexOf(fragment, from);
      if (at < 0) return false;
      from = at + fragment.length;
    }
    return true;
  }

  // The key and the distractors are four different strings.
  const allDistinct = (key, wrong) =>
    new Set([key, ...wrong.map(([text]) => text)]).size === wrong.length + 1;

  // Shared fields of every multiple-choice record.
  function mc(difficulty, topic, fields) {
    return {
      responseType: "multiple-choice",
      scene: topic.scene,
      estimatedSeconds: SECONDS[difficulty],
      ...fields,
    };
  }

  /* ---------------------------------------------------------------- charts */
  //
  // Bar and line graphs for quantitative Command of Evidence. They are SVG
  // strings built only from what src/app/render.js keeps (rect, line,
  // polyline, polygon, circle, text) and drawn in currentColor, so they follow
  // the light and dark themes. Series differ by fill strength (bars) or dash
  // pattern and marker shape (lines), never by color alone. Values sit on the
  // labelled grid (multiples of `yStep`) so a student can read them exactly,
  // and the alt text states every plotted value, so a screen-reader user can
  // answer from it. Every coordinate is rounded to one decimal.

  const r1 = (value) => Math.round(value * 10) / 10;
  const FONT = 'font-family="sans-serif"';

  // Plain number for axis labels and alt text: 1200 -> "1,200", 2.5 -> "2.5".
  function chartNumber(value) {
    const rounded = Math.round(value * 1000) / 1000;
    const [whole, part] = String(Math.abs(rounded)).split(".");
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${rounded < 0 ? "−" : ""}${grouped}${part ? `.${part}` : ""}`;
  }

  function chartText(x, y, content, extra = "") {
    return `<text x="${r1(x)}" y="${r1(y)}" fill="currentColor" font-size="12" ${FONT}${extra}>${S.escapeXml(content)}</text>`;
  }

  // Axes, horizontal grid lines, y tick labels, and both axis titles.
  function chartFrame(box, spec) {
    const { x0, x1, y0, y1, height } = box;
    const parts = [];
    const ticks = Math.round((spec.yMax - spec.yMin) / spec.yStep);
    for (let index = 0; index <= ticks; index += 1) {
      const value = spec.yMin + index * spec.yStep;
      const y = box.scale(value);
      if (index > 0) {
        parts.push(`<line x1="${r1(x0)}" y1="${r1(y)}" x2="${r1(x1)}" y2="${r1(y)}" stroke="currentColor" stroke-width="1" stroke-opacity="0.2"/>`);
      }
      parts.push(chartText(x0 - 6, y, chartNumber(value), ' text-anchor="end" dominant-baseline="middle"'));
    }
    parts.push(`<line x1="${r1(x0)}" y1="${r1(y1)}" x2="${r1(x0)}" y2="${r1(y0)}" stroke="currentColor" stroke-width="1.5"/>`);
    parts.push(`<line x1="${r1(x0)}" y1="${r1(y0)}" x2="${r1(x1)}" y2="${r1(y0)}" stroke="currentColor" stroke-width="1.5"/>`);
    const midY = (y0 + y1) / 2;
    parts.push(chartText(16, midY, spec.yLabel, ` text-anchor="middle" dominant-baseline="middle" transform="rotate(-90 16 ${r1(midY)})"`));
    parts.push(chartText((x0 + x1) / 2, height - 10, spec.xLabel, ' text-anchor="middle"'));
    return parts;
  }

  function chartBox(spec, width, height, seriesCount) {
    const left = 70;
    const right = 16;
    const top = seriesCount > 1 ? 40 : 18;
    const bottom = 54;
    const x0 = left;
    const x1 = width - right;
    const y0 = height - bottom;
    const y1 = top;
    const scale = (value) => y0 - ((value - spec.yMin) / (spec.yMax - spec.yMin)) * (y0 - y1);
    return { x0, x1, y0, y1, width, height, scale };
  }

  function chartAlt(kind, spec) {
    const range = `The vertical axis shows ${spec.yLabel}, from ${chartNumber(spec.yMin)} to ${chartNumber(spec.yMax)}.`;
    const values = spec.series
      .map((series) => {
        const listed = spec.categories.map((category, index) => `${category}, ${chartNumber(series.values[index])}`).join("; ");
        return spec.series.length > 1 ? `${series.name}: ${listed}.` : `Values: ${listed}.`;
      })
      .join(" ");
    return `${kind}: ${spec.title}. The horizontal axis shows ${spec.xLabel}. ${range} ${values}`;
  }

  // Every value must be finite, inside the axis range, and on the grid.
  function chartValuesOk(spec) {
    return spec.series.every((series) =>
      series.values.length === spec.categories.length &&
      series.values.every((value) => Number.isFinite(value) && value >= spec.yMin && value <= spec.yMax &&
        Math.abs((value - spec.yMin) / spec.yStep - Math.round((value - spec.yMin) / spec.yStep)) < 1e-9));
  }

  const BAR_FILL = ['fill="currentColor" fill-opacity="0.85"', 'fill="currentColor" fill-opacity="0.3"', 'fill="none"'];

  // spec: { title, xLabel, yLabel, yMin, yMax, yStep, categories: [..],
  //         series: [{ name, values: [..] }] } (1-3 series, grouped bars)
  function barChart(spec) {
    if (!chartValuesOk(spec)) throw new Error(`barChart: values off the grid in "${spec.title}"`);
    const count = spec.series.length;
    const width = Math.max(420, 110 + spec.categories.length * (count * 26 + 34));
    const height = 300;
    const box = chartBox(spec, width, height, count);
    const parts = chartFrame(box, spec);
    const slot = (box.x1 - box.x0) / spec.categories.length;
    const barWidth = Math.min(34, (slot - 18) / count);
    spec.categories.forEach((category, index) => {
      const left = box.x0 + slot * index + (slot - barWidth * count) / 2;
      spec.series.forEach((series, which) => {
        const top = box.scale(series.values[index]);
        parts.push(`<rect x="${r1(left + which * barWidth)}" y="${r1(top)}" width="${r1(barWidth)}" height="${r1(box.y0 - top)}" ${BAR_FILL[which]} stroke="currentColor" stroke-width="1"/>`);
      });
      parts.push(chartText(box.x0 + slot * (index + 0.5), box.y0 + 16, category, ' text-anchor="middle"'));
    });
    if (count > 1) {
      let x = box.x0;
      spec.series.forEach((series, which) => {
        parts.push(`<rect x="${r1(x)}" y="10" width="12" height="12" ${BAR_FILL[which]} stroke="currentColor" stroke-width="1"/>`);
        parts.push(chartText(x + 18, 16, series.name, ' dominant-baseline="middle"'));
        x += 36 + series.name.length * 7;
      });
    }
    const alt = chartAlt("Bar graph", spec);
    return { svg: S.svg(width, height, parts, alt), alt, notToScale: false };
  }

  const LINE_DASH = ["", ' stroke-dasharray="7 4"', ' stroke-dasharray="2 3"'];

  function lineMarker(which, x, y) {
    if (which === 0) return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4" fill="currentColor"/>`;
    if (which === 1) return `<rect x="${r1(x - 4)}" y="${r1(y - 4)}" width="8" height="8" fill="currentColor"/>`;
    return `<polygon points="${r1(x)},${r1(y - 5)} ${r1(x + 5)},${r1(y + 4)} ${r1(x - 5)},${r1(y + 4)}" fill="currentColor"/>`;
  }

  // spec: { title, xLabel, yLabel, yMin, yMax, yStep, categories: [..]
  //         (evenly spaced, e.g. years), series: [{ name, values: [..] }] }
  function lineChart(spec) {
    if (!chartValuesOk(spec)) throw new Error(`lineChart: values off the grid in "${spec.title}"`);
    const count = spec.series.length;
    const width = Math.max(440, 130 + spec.categories.length * 62);
    const height = 300;
    const box = chartBox(spec, width, height, count);
    const parts = chartFrame(box, spec);
    const slot = (box.x1 - box.x0) / spec.categories.length;
    const xAt = (index) => box.x0 + slot * (index + 0.5);
    spec.categories.forEach((category, index) => {
      parts.push(`<line x1="${r1(xAt(index))}" y1="${r1(box.y0)}" x2="${r1(xAt(index))}" y2="${r1(box.y0 + 5)}" stroke="currentColor" stroke-width="1.5"/>`);
      parts.push(chartText(xAt(index), box.y0 + 18, category, ' text-anchor="middle"'));
    });
    spec.series.forEach((series, which) => {
      const points = series.values.map((value, index) => `${r1(xAt(index))},${r1(box.scale(value))}`).join(" ");
      parts.push(`<polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2"${LINE_DASH[which]}/>`);
      series.values.forEach((value, index) => parts.push(lineMarker(which, xAt(index), box.scale(value))));
    });
    if (count > 1) {
      let x = box.x0;
      spec.series.forEach((series, which) => {
        parts.push(`<line x1="${r1(x)}" y1="16" x2="${r1(x + 28)}" y2="16" stroke="currentColor" stroke-width="2"${LINE_DASH[which]}/>`);
        parts.push(lineMarker(which, x + 14, 16));
        parts.push(chartText(x + 34, 16, series.name, ' dominant-baseline="middle"'));
        x += 52 + series.name.length * 7;
      });
    }
    const alt = chartAlt("Line graph", spec);
    return { svg: S.svg(width, height, parts, alt), alt, notToScale: false };
  }

  // Reads the plotted values back out of a chart's alt text: { series name
  // (or "Values") -> { category -> value } }. Templates verify their keys
  // from this rendered text rather than from the numbers build() drew.
  function readChartAlt(alt) {
    const out = {};
    const range = /The vertical axis shows .*? from −?[\d,]+(?:\.\d+)? to −?[\d,]+(?:\.\d+)?\.\s/.exec(alt);
    const body = range ? alt.slice(range.index + range[0].length) : "";
    body.split(/\.\s(?=[^;]*:)/).forEach((chunk) => {
      const colon = chunk.indexOf(":");
      if (colon < 0) return;
      const name = chunk.slice(0, colon).trim();
      const values = {};
      chunk.slice(colon + 1).replace(/\.$/, "").split(";").forEach((pair) => {
        const comma = pair.lastIndexOf(",");
        if (comma < 0) return;
        const label = pair.slice(0, comma).trim();
        values[label] = Number(pair.slice(comma + 1).trim().replace(/,/g, "").replace("−", "-"));
      });
      out[name] = values;
    });
    return out;
  }

  return { RW, passage, inOrder, allDistinct, mc, barChart, lineChart, readChartAlt, chartNumber };
});
