(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/problem-solving-and-data-analysis"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // One-variable data templates (Problem-Solving and Data Analysis), ordered Easy, Medium, Hard.

  const { MINUS, num, table } = S;
  const {
    DATA, tidy, isClean, fmt, shown, sum, range, retry, pack, parseTable, parseNumber, close, seg,
    chartText, dataDot, DOMAIN, about, offerHard, finish,
  } = C;

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

  /* ========================================= data-display-center (Medium) */

  const DISPLAY_SCENES = [
    { axis: "Number of books read", head: "Books read", lo: [0, 1], about: (n) => `the numbers of books that ${n} students read over the summer` },
    { axis: "Number of pets", head: "Number of pets", lo: [0, 0], about: (n) => `the numbers of pets in ${n} households` },
    { axis: "Goals scored", head: "Goals scored", lo: [0, 0], about: (n) => `the numbers of goals a soccer team scored in each of its ${n} games last season` },
    { axis: "Age (years)", head: "Age (years)", lo: [11, 14], about: (n) => `the ages, in years, of the ${n} members of a youth orchestra` },
    { axis: "Hours of sleep", head: "Hours of sleep", lo: [4, 6], about: (n) => `the numbers of hours of sleep that ${n} students reported getting last night` },
    { axis: "People in household", head: "People in household", lo: [1, 2], about: (n) => `the numbers of people living in each of ${n} households on a street` },
    { axis: "Quiz score", head: "Quiz score", lo: [3, 4], about: (n) => `the scores of ${n} students on a 10-point quiz` },
  ];

  function medianOf(list) {
    const sorted = list.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  const expand = (values, counts) => values.flatMap((value, index) => Array(counts[index]).fill(value));

  const plural = (count, one, many = `${one}s`) => `${fmt(count)} ${count === 1 ? one : many}`;

  const mean = (list) => sum(list) / list.length;

  function median(list) {
    const sorted = list.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  const spread = (list) => Math.max(...list) - Math.min(...list);

  function stdev(list, sample) {
    const center = mean(list);
    const squares = sum(list.map((value) => (value - center) ** 2));
    return Math.sqrt(squares / (list.length - (sample ? 1 : 0)));
  }

  const direction = (before, after) => {
    const change = tidy(after - before);
    return change > 0 ? 1 : change < 0 ? -1 : 0;
  };

  // `size` numbers whose mean is exactly `center` (symmetric offsets).
  function valuesWithMean(size, center) {
    const values = [];
    for (let index = 0; index + 1 < size; index += 2) {
      const offset = ((index / 2) % 3) + 1;
      values.push(center - offset, center + offset);
    }
    if (size % 2) values.push(center);
    return values;
  }

  /* ================================================ weighted-mean-groups */

  const GROUPS = [
    {
      members: "employees", measure: "commute time", unit: "minutes",
      g: ["at the north office", "at the south office"], both: "at the two offices",
      header: "Office", names: ["North", "South", "East"], noun: "offices", low: 18, high: 70,
    },
    {
      members: "seedlings", measure: "height", unit: "centimeters",
      g: ["in tray A", "in tray B"], both: "in the two trays",
      header: "Tray", names: ["A", "B", "C"], noun: "trays", low: 10, high: 45,
    },
    {
      members: "students", measure: "score on a final exam", unit: "points",
      g: ["in the morning class", "in the evening class"], both: "in the two classes",
      header: "Class", names: ["Morning", "Afternoon", "Evening"], noun: "classes", low: 55, high: 96,
    },
    {
      members: "packages", measure: "mass", unit: "kilograms",
      g: ["in the first shipment", "in the second shipment"], both: "in the two shipments",
      header: "Shipment", names: ["First", "Second", "Third"], noun: "shipments", low: 12, high: 48,
    },
    {
      members: "runners", measure: "finishing time", unit: "minutes",
      g: ["in the junior division", "in the senior division"], both: "in the two divisions",
      header: "Division", names: ["Junior", "Open", "Senior"], noun: "divisions", low: 22, high: 64,
    },
  ];

  const MEAN_PRINCIPLES = [
    "A group's total is its mean times its size; combined means come from combined totals.",
    "The mean of a combined group is weighted toward the larger group, so it is not the average of the group means unless the groups are the same size.",
  ];

  const MEAN_HINT = "Think in totals: what does each mean say about the sum of that group's values?";

  function meanMissingSize(t, numeric) {
    const ctx = t.pick(GROUPS);
    return retry(() => {
      const d1 = t.int(2, 12);
      const d2 = t.int(2, 12);
      if (d1 === d2) return null;
      const n1 = t.int(6, 40);
      const n2 = (n1 * d1) / d2;
      if (!Number.isInteger(n2) || n2 < 4 || n2 > 90) return null;
      const reversed = (n1 * d2) / d1;
      if (!numeric && !Number.isInteger(reversed)) return null;
      const above = t.chance(0.5);
      const M = t.int(ctx.low + 12, ctx.high - 12);
      const m1 = above ? M + d1 : M - d1;
      const m2 = above ? M - d2 : M + d2;
      const side = above ? "above" : "below";
      const wrong = offerHard(num(n2), [
        [num(reversed), `Pairs each group with the other group's distance from ${M}; the group farther from the combined mean must be the smaller one.`],
        [num(n1 + n2), `Gives the number of ${ctx.members} in both groups together, not the number ${ctx.g[1]}.`],
        [num(n1 * d1), `Stops at ${n1} × ${d1} = ${n1 * d1}, the total amount the ${ctx.members} ${ctx.g[0]} are ${side} the combined mean.`],
      ]);
      if (!numeric && wrong.length < 3) return null;
      return finish(numeric, {
        stimulus: null,
        stem:
          `The ${n1} ${ctx.members} ${ctx.g[0]} have a mean ${ctx.measure} of ${m1} ${ctx.unit}, and the ${ctx.members} ${ctx.g[1]} ` +
          `have a mean ${ctx.measure} of ${m2} ${ctx.unit}. All the ${ctx.members} ${ctx.both} together have a mean ${ctx.measure} ` +
          `of ${M} ${ctx.unit}. How many ${ctx.members} are ${ctx.g[1]}?`,
        correct: n2,
        wrong,
        explanation:
          `Let n be the number ${ctx.g[1]}. The combined total equals the sum of the group totals: ${n1}(${m1}) + ${m2}n = ${M}(${n1} + n). ` +
          `So ${n1}(${m1} ${MINUS} ${M}) = n(${M} ${MINUS} ${m2}), which gives ${num(n1 * (m1 - M))} = ${num(M - m2)}n and n = ${n2}.`,
        steps: [
          `Write the combined total two ways: ${n1}(${m1}) + ${m2}n = ${M}(${n1} + n).`,
          `Collect terms: ${n1}(${m1} ${MINUS} ${M}) = n(${M} ${MINUS} ${m2}).`,
          `Simplify: ${num(n1 * (m1 - M))} = ${num(M - m2)}n.`,
          `Solve: n = ${n2}.`,
        ],
        principles: MEAN_PRINCIPLES,
        trap: `The ${ctx.members} ${ctx.g[0]} are ${d1} from the combined mean and the others are ${d2} from it; the sizes are in the inverse ratio, and flipping it gives ${num(reversed)}.`,
        hint: MEAN_HINT,
        verify: () => {
          const first = valuesWithMean(n1, m1);
          const second = valuesWithMean(n2, m2);
          return S.approx(mean(first.concat(second)), M) && first.length === n1;
        },
      });
    });
  }

  function meanMissingMean(t, numeric) {
    const ctx = t.pick(GROUPS);
    const variant = t.int(0, 2);
    return retry(() => {
      if (variant === 0) {
        // Group sizes known; the combined mean is given.
        const n1 = t.int(8, 30);
        const n2 = t.int(8, 30);
        if (n1 === n2) return null;
        const m1 = t.int(ctx.low, ctx.high);
        const m2 = t.int(ctx.low, ctx.high);
        if (Math.abs(m1 - m2) < 5) return null;
        const N = n1 + n2;
        const M = tidy((n1 * m1 + n2 * m2) / N);
        if (!isClean(M, 1)) return null;
        const unweighted = tidy(2 * M - m1);
        const perAll = tidy((n2 * m2) / N);
        const candidates = [[num(unweighted), `Treats ${num(M)} as the average of the two group means, which ignores that the groups differ in size.`]];
        if (isClean(perAll, 2)) candidates.push([num(perAll), `Divides the second group's total, ${num(n2 * m2)}, by all ${N} ${ctx.members} instead of by ${n2}.`]);
        candidates.push([num(n2 * m2), `Stops at the second group's total, ${num(n2 * m2)} ${ctx.unit}, without dividing by its size.`]);
        const wrong = offerHard(num(m2), candidates);
        if (!numeric && wrong.length < 3) return null;
        return finish(numeric, {
          stimulus: null,
          stem:
            `A total of ${N} ${ctx.members} are ${ctx.both}. The ${n1} ${ctx.members} ${ctx.g[0]} have a mean ${ctx.measure} of ` +
            `${m1} ${ctx.unit}, and all ${N} have a mean ${ctx.measure} of ${num(M)} ${ctx.unit}. What is the mean ${ctx.measure}, in ` +
            `${ctx.unit}, of the ${ctx.members} ${ctx.g[1]}?`,
          correct: m2,
          wrong,
          explanation:
            `All ${N} ${ctx.members} total ${N} × ${num(M)} = ${num(N * M)}, and the ${n1} ${ctx.g[0]} total ${n1} × ${m1} = ${num(n1 * m1)}. ` +
            `The remaining ${n2} total ${num(n2 * m2)}, so their mean is ${num(n2 * m2)} ÷ ${n2} = ${m2}.`,
          steps: [
            `Combined total: ${N} × ${num(M)} = ${num(N * M)}.`,
            `First group's total: ${n1} × ${m1} = ${num(n1 * m1)}.`,
            `Second group: ${N} ${MINUS} ${n1} = ${n2} ${ctx.members} with total ${num(N * M)} ${MINUS} ${num(n1 * m1)} = ${num(n2 * m2)}.`,
            `Mean: ${num(n2 * m2)} ÷ ${n2} = ${m2}.`,
          ],
          principles: MEAN_PRINCIPLES,
          trap: `Averaging the group means would require equal group sizes; with ${n1} and ${n2}, it gives ${num(unweighted)}.`,
          hint: MEAN_HINT,
          verify: () => {
            const all = valuesWithMean(n1, m1).concat(valuesWithMean(n2, m2));
            return all.length === N && S.approx(mean(all), M);
          },
        });
      }
      if (variant === 1) {
        // Only the share of the first group is known.
        const p = t.pick([20, 25, 30, 40, 60, 70, 75, 80]);
        const m1 = t.int(ctx.low, ctx.high);
        const m2 = t.int(ctx.low, ctx.high);
        if (Math.abs(m1 - m2) < 5) return null;
        const M = tidy((p * m1 + (100 - p) * m2) / 100);
        if (!isClean(M, 1)) return null;
        const unweighted = tidy(2 * M - m1);
        const swapped = tidy((100 * M - (100 - p) * m1) / p);
        const partial = tidy(M - (p * m1) / 100);
        const candidates = [[num(unweighted), `Treats ${num(M)} as the average of the two group means, ignoring that the groups are ${p}% and ${100 - p}% of the total.`]];
        if (isClean(swapped, 2) && swapped > 0) candidates.push([num(swapped), `Gives the ${p}% weight to the second group instead of the first.`]);
        if (isClean(partial, 2)) candidates.push([num(partial), `Stops at ${num(M)} ${MINUS} ${num(p / 100)}(${m1}) = ${num(partial)}, the second group's share of the overall mean, before dividing by ${num((100 - p) / 100)}.`]);
        const wrong = offerHard(num(m2), candidates);
        if (!numeric && wrong.length < 3) return null;
        const w1 = num(p / 100);
        const w2 = num((100 - p) / 100);
        return finish(numeric, {
          stimulus: null,
          stem:
            `Of the ${ctx.members} ${ctx.both}, ${p}% are ${ctx.g[0]} and the rest are ${ctx.g[1]}. The ${ctx.members} ${ctx.g[0]} ` +
            `have a mean ${ctx.measure} of ${m1} ${ctx.unit}, and all the ${ctx.members} ${ctx.both} have a mean ${ctx.measure} of ` +
            `${num(M)} ${ctx.unit}. What is the mean ${ctx.measure}, in ${ctx.unit}, of the ${ctx.members} ${ctx.g[1]}?`,
          correct: m2,
          wrong,
          explanation:
            `The overall mean weights each group by its share: ${num(M)} = ${w1}(${m1}) + ${w2}x. So ${w2}x = ${num(M)} ${MINUS} ` +
            `${num((p * m1) / 100)} = ${num(partial)}, and x = ${num(partial)} ÷ ${w2} = ${m2}.`,
          steps: [
            `Weight each group mean by its share: ${num(M)} = ${w1}(${m1}) + ${w2}x.`,
            `Compute the known part: ${w1} × ${m1} = ${num((p * m1) / 100)}.`,
            `Subtract: ${w2}x = ${num(partial)}.`,
            `Divide: x = ${m2}.`,
          ],
          principles: MEAN_PRINCIPLES,
          trap: `The groups are ${p}% and ${100 - p}% of the total, so the overall mean is not halfway between the group means; assuming it is gives ${num(unweighted)}.`,
          hint: "The overall mean is a weighted average. What weight does each group carry?",
          verify: () => {
            const unit = 100 / S.gcd(p, 100);
            const size1 = (p * unit) / 100;
            const size2 = unit - size1;
            const all = valuesWithMean(size1, m1).concat(valuesWithMean(size2, m2));
            return S.approx(mean(all), M);
          },
        });
      }
      // Three groups in a table; one mean is x.
      const sizes = [t.int(5, 30), t.int(5, 30), t.int(5, 30)];
      const means = [t.int(ctx.low, ctx.high), t.int(ctx.low, ctx.high), t.int(ctx.low, ctx.high)];
      const hidden = t.int(0, 2);
      const N = sum(sizes);
      const M = tidy(sum(sizes.map((size, index) => size * means[index])) / N);
      if (!Number.isInteger(M)) return null;
      if (new Set(means).size < 3 || new Set(sizes).size < 3) return null;
      const others = [0, 1, 2].filter((index) => index !== hidden);
      const x = means[hidden];
      const name = ctx.header === "Tray" ? `tray ${ctx.names[hidden]}` : `the ${ctx.names[hidden].toLowerCase()} ${ctx.header.toLowerCase()}`;
      const unweighted = 3 * M - means[others[0]] - means[others[1]];
      const hiddenTotal = sizes[hidden] * x;
      const perAll = tidy(hiddenTotal / N);
      const candidates = [[num(unweighted), `Treats ${M} as the plain average of the three group means, ignoring the group sizes.`]];
      if (isClean(perAll, 2)) candidates.push([num(perAll), `Divides the total for ${name} by all ${N} ${ctx.members} instead of by ${sizes[hidden]}.`]);
      candidates.push([num(hiddenTotal), `Stops at the total for ${name}, ${num(hiddenTotal)}, without dividing by its size.`]);
      const wrong = offerHard(num(x), candidates);
      if (!numeric && wrong.length < 3) return null;
      const rows = [0, 1, 2].map((index) => [ctx.names[index], sizes[index], index === hidden ? "x" : means[index]]);
      const knownTotal = sum(others.map((index) => sizes[index] * means[index]));
      return finish(numeric, {
        stimulus: { type: "table", content: table([ctx.header, `Number of ${ctx.members}`, `Mean ${ctx.measure} (${ctx.unit})`], rows) },
        stem:
          `The table shows the number of ${ctx.members} and the mean ${ctx.measure} for each of three ${ctx.noun}. The mean ` +
          `${ctx.measure} of all ${N} ${ctx.members} is ${M} ${ctx.unit}. What is the value of x?`,
        correct: x,
        wrong,
        explanation:
          `All ${N} ${ctx.members} total ${N} × ${M} = ${num(N * M)}. The two known ${ctx.noun} total ${num(knownTotal)}, so the ` +
          `total for ${name} is ${num(N * M - knownTotal)}, and x = ${num(N * M - knownTotal)} ÷ ${sizes[hidden]} = ${x}.`,
        steps: [
          `Combined total: ${N} × ${M} = ${num(N * M)}.`,
          `Known totals: ${others.map((index) => `${sizes[index]} × ${means[index]}`).join(" + ")} = ${num(knownTotal)}.`,
          `Remaining total: ${num(N * M)} ${MINUS} ${num(knownTotal)} = ${num(hiddenTotal)}.`,
          `Divide by the group size: x = ${num(hiddenTotal)} ÷ ${sizes[hidden]} = ${x}.`,
        ],
        principles: MEAN_PRINCIPLES,
        trap: `The combined mean weights each ${ctx.header.toLowerCase()} by its size; treating it as the average of the three means gives ${num(unweighted)}.`,
        hint: MEAN_HINT,
        verify: () => {
          const cells = parseTable(table([ctx.header, "n", "mean"], rows)).slice(1);
          let total = 0;
          let count = 0;
          cells.forEach(([, size, value]) => {
            total += parseNumber(size) * (value === "x" ? x : parseNumber(value));
            count += parseNumber(size);
          });
          return count === N && S.approx(total / count, M);
        },
      });
    });
  }

  function meanShift(t, numeric) {
    const ctx = t.pick(GROUPS);
    const adding = t.chance(0.5);
    return retry(() => {
      const n = t.int(10, 40);
      const k = t.int(2, 12);
      if (!adding && k >= n - 2) return null;
      // Equal-sized groups would make averaging the means correct.
      if (adding ? k === n : 2 * k === n) return null;
      const m = t.int(ctx.low, ctx.high);
      const x = t.int(ctx.low, ctx.high);
      if (Math.abs(x - m) < 4) return null;
      const newCount = adding ? n + k : n - k;
      const after = tidy(adding ? (n * m + k * x) / (n + k) : (n * m - k * x) / (n - k));
      if (!Number.isInteger(after) || after === m || after < ctx.low || after > ctx.high) return null;
      const unweighted = adding ? 2 * after - m : 2 * m - after;
      const oldCount = adding ? (n * after - n * m) / k : (n * m - n * after) / k;
      const candidates = [
        [num(unweighted), adding
          ? `Treats ${after} as the average of ${m} and the added group's mean, as if the two groups were the same size.`
          : `Treats ${m} as the average of ${after} and the removed group's mean, as if the two groups were the same size.`],
      ];
      if (isClean(oldCount, 2) && oldCount > 0) {
        candidates.push([num(tidy(oldCount)), adding
          ? `Multiplies the new mean by the old count, ${n}, instead of ${n + k}.`
          : `Multiplies the new mean by the old count, ${n}, instead of ${n - k}.`]);
      }
      candidates.push([num(k * x), `Stops at the total of the ${k} ${adding ? "added" : "removed"} ${ctx.members}, ${num(k * x)}, without dividing by ${k}.`]);
      const wrong = offerHard(num(x), candidates);
      if (!numeric && wrong.length < 3) return null;
      const oldTotal = n * m;
      const newTotal = newCount * after;
      const stem = adding
        ? `The ${n} ${ctx.members} ${ctx.g[0]} have a mean ${ctx.measure} of ${m} ${ctx.unit}. After data for ${k} more ` +
          `${ctx.members} are included, the mean ${ctx.measure} of all ${n + k} is ${after} ${ctx.unit}. What is the mean ` +
          `${ctx.measure}, in ${ctx.unit}, of the ${k} ${ctx.members} whose data were added?`
        : `The ${n} ${ctx.members} ${ctx.g[0]} have a mean ${ctx.measure} of ${m} ${ctx.unit}. After the data for ${k} of these ` +
          `${ctx.members} are removed, the mean ${ctx.measure} of the remaining ${n - k} is ${after} ${ctx.unit}. What is the mean ` +
          `${ctx.measure}, in ${ctx.unit}, of the ${k} ${ctx.members} whose data were removed?`;
      return finish(numeric, {
        stimulus: null,
        stem,
        correct: x,
        wrong,
        explanation: adding
          ? `The original total is ${n} × ${m} = ${num(oldTotal)} and the new total is ${n + k} × ${after} = ${num(newTotal)}. ` +
            `The ${k} added ${ctx.members} account for ${num(newTotal)} ${MINUS} ${num(oldTotal)} = ${num(k * x)}, a mean of ${x}.`
          : `The original total is ${n} × ${m} = ${num(oldTotal)} and the remaining total is ${n - k} × ${after} = ${num(newTotal)}. ` +
            `The ${k} removed ${ctx.members} accounted for ${num(oldTotal)} ${MINUS} ${num(newTotal)} = ${num(k * x)}, a mean of ${x}.`,
        steps: [
          `Original total: ${n} × ${m} = ${num(oldTotal)}.`,
          `Total after the change: ${newCount} × ${after} = ${num(newTotal)}.`,
          `Difference: ${num(Math.abs(newTotal - oldTotal))} for the ${k} ${adding ? "added" : "removed"} ${ctx.members}.`,
          `Mean: ${num(k * x)} ÷ ${k} = ${x}.`,
        ],
        principles: MEAN_PRINCIPLES,
        trap: `The ${k} ${adding ? "added" : "removed"} ${ctx.members} and the other ${adding ? n : n - k} are different-sized groups, so the means cannot be averaged directly; doing so gives ${num(unweighted)}.`,
        hint: MEAN_HINT,
        verify: () => {
          const base = adding ? valuesWithMean(n, m) : valuesWithMean(n - k, after);
          const moved = valuesWithMean(k, x);
          const all = base.concat(moved);
          return adding ? S.approx(mean(all), after) : S.approx(mean(all), m) && all.length === n;
        },
      });
    });
  }

  /* ============================================== data-change-statistics */

  const FREQ_TABLES = [
    {
      header: "Number of books", noun: "students", values: range(0, 6),
      subject: "the numbers of books that the students in a class read over the summer",
      who: (v) => `who read ${plural(v, "book")}`,
    },
    {
      header: "Goals scored", noun: "games", values: range(0, 5),
      subject: "the numbers of goals a soccer team scored in the games it played last season",
      who: (v) => `in which the team scored ${plural(v, "goal")}`,
    },
    {
      header: "Number of siblings", noun: "people", values: range(0, 5),
      subject: "the numbers of siblings reported by the people in a survey",
      who: (v) => `who reported ${plural(v, "sibling")}`,
    },
    {
      header: "Rating", noun: "customers", values: range(1, 5),
      subject: "the ratings, from 1 to 5, that customers gave a restaurant",
      who: (v) => `who gave a rating of ${v}`,
    },
    {
      header: "People in household", noun: "households", values: range(1, 6),
      subject: "the numbers of people living in the households on a street",
      who: (v) => `with ${plural(v, "person", "people")}`,
    },
  ];

  // Median from a frequency table by locating the middle position(s).
  function medianFromCounts(values, counts) {
    const total = sum(counts);
    const valueAt = (position) => {
      let seen = 0;
      for (let index = 0; index < values.length; index += 1) {
        seen += counts[index];
        if (position <= seen) return values[index];
      }
      return NaN;
    };
    return total % 2 ? valueAt((total + 1) / 2) : (valueAt(total / 2) + valueAt(total / 2 + 1)) / 2;
  }

  function statsNewMedian(t, numeric) {
    const ctx = t.pick(FREQ_TABLES);
    const values = ctx.values;
    return retry(() => {
      const before = values.map(() => t.int(1, 9));
      const total = sum(before);
      if (total < 15 || total > 40) return null;
      const after = before.slice();
      const kind = t.int(0, 2);
      let event;
      if (kind === 0) {
        const v = t.chance(0.5) ? values[0] : values[values.length - 1];
        const k = t.int(3, 9);
        after[values.indexOf(v)] += k;
        event = `Data for ${k} more ${ctx.noun} ${ctx.who(v)} were then added.`;
      } else if (kind === 1) {
        const index = t.int(0, values.length - 1);
        if (before[index] < 3) return null;
        const k = t.int(2, before[index]);
        after[index] -= k;
        event = `The data for ${k} of the ${ctx.noun} ${ctx.who(values[index])} were then removed.`;
      } else {
        const from = t.int(0, values.length - 1);
        const to = t.int(0, values.length - 1);
        if (Math.abs(from - to) < 2 || before[from] < 2) return null;
        const k = t.int(2, before[from]);
        after[from] -= k;
        after[to] += k;
        event = `It was then found that ${k} of the values recorded as ${values[from]} should have been recorded as ${values[to]}.`;
      }
      const oldMedian = medianFromCounts(values, before);
      const key = medianFromCounts(values, after);
      if (key === oldMedian) return null;
      const valuesMedian = median(values);
      const countsMedian = median(after);
      const newMean = tidy(sum(values.map((v, index) => v * after[index])) / sum(after));
      if ([valuesMedian, countsMedian].includes(key)) return null;
      const candidates = [
        [num(oldMedian), `Keeps the median of the original data, ${num(oldMedian)}; the change moves the middle position.`],
        [num(countsMedian), "Takes the median of the frequency column, treating the counts as if they were the data values."],
        [num(valuesMedian), "Takes the middle of the listed values, ignoring how many times each value occurs."],
      ];
      if (isClean(newMean, 2)) candidates.push([num(newMean), "Gives the mean of the revised data instead of its median."]);
      const wrong = offerHard(num(key), candidates);
      if (!numeric && wrong.length < 3) return null;
      const n = sum(after);
      const middle = n % 2 ? `position ${(n + 1) / 2}` : `positions ${n / 2} and ${n / 2 + 1}`;
      return finish(numeric, {
        stimulus: { type: "table", content: table([ctx.header, "Frequency"], values.map((v, index) => [v, before[index]])) },
        stem: `The frequency table summarizes ${ctx.subject}. ${event} What is the median of the data after this change?`,
        correct: key,
        wrong,
        explanation:
          `After the change the frequencies are ${after.join(", ")}, for ${n} values in all. The median is at ${middle} in ` +
          `order; counting up the frequencies from ${values[0]}, that is ${num(key)}.`,
        steps: [
          `Update the frequencies: ${values.map((v, index) => `${v}: ${after[index]}`).join(", ")}.`,
          `Count the values: ${after.join(" + ")} = ${n}.`,
          `Locate the middle: ${middle}.`,
          `Accumulate frequencies from the smallest value to reach that position: the median is ${num(key)}.`,
        ],
        principles: [
          "In a frequency table, each frequency says how many times its value occurs; the data are the values, repeated.",
          "The median depends on the position of the middle value, so adding or removing values can move it even when no value near the middle changes.",
        ],
        trap: `The frequency column is not the data; its median (${num(countsMedian)}) and the middle listed value (${num(valuesMedian)}) both ignore how the values repeat.`,
        hint: "How many values are there after the change, and which position in order is the middle one?",
        verify: () => {
          const rows = parseTable(table([ctx.header, "Frequency"], values.map((v, index) => [v, before[index]]))).slice(1);
          const data = [];
          rows.forEach(([v, count], index) => {
            for (let copy = 0; copy < parseNumber(count) + (after[index] - before[index]); copy += 1) data.push(parseNumber(v));
          });
          return median(data) === key && data.length === n;
        },
      });
    });
  }

  const LISTS = [
    { intro: (n) => `The list gives the ages, in years, of the ${n} members of a book club.`, low: 19, high: 70 },
    { intro: (n) => `The list gives the daily high temperatures, in degrees Fahrenheit, in a town on ${n} days.`, low: 41, high: 86 },
    { intro: (n) => `The list gives the numbers of minutes that ${n} students spent on homework one evening.`, low: 10, high: 90 },
    { intro: (n) => `The list gives the numbers of points a basketball player scored in ${n} games.`, low: 4, high: 36 },
  ];

  // Statements about how a statistic moved: "The mean increased."
  const STAT_NAMES = { mean: "mean", median: "median", range: "range", sd: "standard deviation" };

  const moved = (stat, dir) => `The ${STAT_NAMES[stat]} ${dir > 0 ? "increased" : dir < 0 ? "decreased" : "did not change"}.`;

  function statDirections(before, after) {
    return {
      mean: direction(mean(before), mean(after)),
      median: direction(median(before), median(after)),
      range: direction(spread(before), spread(after)),
      sd: direction(stdev(before, false), stdev(after, false)),
      sdSample: direction(stdev(before, true), stdev(after, true)),
    };
  }

  // Applies a described change to a list; verify() re-applies it to the parsed list.
  function applyEvent(list, event) {
    if (event.kind === "raise-max") {
      const copy = list.slice();
      copy[copy.indexOf(Math.max(...copy))] = event.to;
      return copy;
    }
    if (event.kind === "add-mean") return list.concat([mean(list)]);
    if (event.kind === "drop-max") {
      const copy = list.slice();
      copy.splice(copy.indexOf(Math.max(...copy)), 1);
      return copy;
    }
    return list.map((value) => value + event.shift);
  }

  function statsWhichTrue(t) {
    const ctx = t.pick(LISTS);
    const kind = t.pick(["raise-max", "add-mean", "drop-max", "shift"]);
    return retry(() => {
      const n = t.pick([7, 8, 9, 10, 11]);
      const cap = kind === "drop-max" ? Math.round((ctx.low + ctx.high) / 2) + 6 : ctx.high;
      const pool = t.sample(range(ctx.low, cap), n - (kind === "drop-max" ? 1 : 0));
      if (kind === "drop-max") pool.push(Math.max(...pool) + t.int(15, 30));
      const list = pool;
      let event;
      let text;
      if (kind === "raise-max") {
        const top = Math.max(...list);
        const to = top + t.int(8, 30);
        event = { kind, to };
        text = `The greatest value in the list, ${top}, was recorded incorrectly; the correct value is ${to}.`;
      } else if (kind === "add-mean") {
        if (!Number.isInteger(mean(list)) || mean(list) === median(list)) return null;
        event = { kind };
        text = `One more value, equal to the mean of the ${n} values, is added to the list.`;
      } else if (kind === "drop-max") {
        event = { kind };
        text = `The greatest value in the list, ${Math.max(...list)}, was entered by mistake and is removed.`;
      } else {
        const shift = t.int(2, 9);
        event = { kind, shift };
        text = `Each value in the list is increased by ${shift}.`;
      }
      const after = applyEvent(list, event);
      const dirs = statDirections(list, after);
      if (dirs.sd !== dirs.sdSample) return null;
      const say = (stat, dir) => moved(stat, dir);
      let key;
      let falses;
      if (kind === "raise-max") {
        key = say("median", 0);
        falses = [
          [say("sd", 0), "Assumes correcting one value leaves the spread alone; moving the greatest value farther out increases it.", true],
          [say("median", 1), "Treats the median like the mean; the corrected value stays the greatest, so the middle value is unchanged.", true],
          [say("mean", 0), "Treats the mean as resistant like the median; the mean uses every value, so it increases."],
          [say("range", 0), "Overlooks that the greatest value sets the range, so the range increases."],
        ];
      } else if (kind === "add-mean") {
        key = say("sd", -1);
        falses = [
          [say("sd", 0), "Assumes a value with no deviation leaves the spread alone; the same squared deviations are now shared by one more value.", true],
          [say("median", 0), `Assumes a central value leaves the middle alone; the mean (${num(mean(list))}) is not the median (${num(median(list))}), so the middle shifts.`, true],
          [say("range", -1), "Assumes a central value narrows the range; the least and greatest values are unchanged."],
          [say("sd", 1), "Assumes more values always means more spread."],
        ];
      } else if (kind === "drop-max") {
        key = say("median", -1);
        falses = [
          [say("median", 0), "Relies on the median resisting outliers; removing a value still shifts the middle position down.", true],
          [say("mean", 0), "Assumes one value among many has no effect on the mean; removing the largest value lowers it.", true],
          [say("sd", 1), "Assumes fewer values means more variability; the value farthest from the mean is gone."],
          [say("range", 0), "Overlooks that the removed value set the range."],
        ];
      } else {
        key = say("range", 0);
        falses = [
          [say("sd", 1), "Treats adding a constant like multiplying; every value moves the same amount, so distances from the mean are unchanged.", true],
          [say("range", 1), "Assumes larger values give a larger range; the greatest and least values rise by the same amount."],
          [say("median", 0), "Assumes only the mean responds; the middle value also rises by the constant.", true],
          [say("mean", 0), "Overlooks that every value, and therefore the mean, rises by the constant."],
        ];
      }
      const truth = (statement) => ["mean", "median", "range", "sd"].some((stat) => statement === say(stat, dirs[stat]));
      if (!truth(key) || falses.some(([statement]) => truth(statement))) return null;
      const forced = falses.filter((entry) => entry[2]);
      const optional = t.shuffle(falses.filter((entry) => !entry[2])).slice(0, 3 - forced.length);
      const wrong = forced.concat(optional).map(([statement, reason]) => [statement, reason]);
      const shown = t.chance(0.5) ? list.slice().sort((a, b) => a - b) : t.shuffle(list);
      const content = shown.join(", ");
      return finish(false, {
        stimulus: { type: "text", content },
        stem: `${ctx.intro(n)} ${text} Which of the following statements about the data after this change is true?`,
        correct: key,
        wrong,
        explanation:
          `Before: mean ${about(mean(list))}, median ${num(median(list))}, range ${spread(list)}. After: mean ` +
          `${about(mean(after))}, median ${num(median(after))}, range ${num(spread(after))}. The standard deviation ` +
          `${dirs.sd > 0 ? "increased" : dirs.sd < 0 ? "decreased" : "did not change"}. Only "${key}" is true.`,
        steps: [
          "Sort the values and find the original median, mean, and range.",
          "Apply the change and recompute each statistic.",
          "Judge the spread by how far the values sit from the mean after the change.",
          `Compare each statement with the results: "${key}" is the true one.`,
        ],
        principles: [
          "The median depends only on the middle position; the mean depends on every value.",
          "The standard deviation measures typical distance from the mean: adding a constant leaves it unchanged, and adding a value at the mean lowers it.",
        ],
        trap: "Each statistic responds differently; answering with the rule for its neighbour (mean for median, range for standard deviation) picks a false statement.",
        hint: "Recompute each statistic after the change, or reason about what each one depends on.",
        verify: () => {
          const parsed = content.split(", ").map(parseNumber);
          const redone = applyEvent(parsed, event);
          const check = statDirections(parsed, redone);
          const holds = (statement) => ["mean", "median", "range", "sd"].some((stat) => statement === say(stat, check[stat]));
          return holds(key) && wrong.every(([statement]) => !holds(statement));
        },
      });
    });
  }

  const SPREAD_PAIRS = [
    { header: "Hours of sleep", names: ["Class A", "Class B"], subject: "the numbers of hours of sleep reported by the students in two classes", start: [5, 6], step: [1] },
    { header: "Quiz score", names: ["Section 1", "Section 2"], subject: "the quiz scores of the students in two sections of a course", start: [5, 6], step: [1] },
    { header: "Length (cm)", names: ["Pond A", "Pond B"], subject: "the lengths of the fish caught in two ponds", start: [18, 20, 22, 24], step: [2, 3, 4] },
    { header: "Wait (minutes)", names: ["Clinic P", "Clinic Q"], subject: "the wait times of the patients at two clinics one morning", start: [5, 10], step: [5] },
  ];

  function statsCompareSpread(t) {
    const ctx = t.pick(SPREAD_PAIRS);
    const [A, B] = ctx.names;
    return retry(() => {
      const shape = () => {
        const outer = t.int(1, 8);
        const inner = t.int(1, 8);
        const center = t.int(1, 12);
        return [outer, inner, center, inner, outer];
      };
      const first = shape();
      const second = shape();
      if (sum(first) !== sum(second) || first.join() === second.join()) return null;
      const start = t.pick(ctx.start);
      const step = t.pick(ctx.step);
      const values = range(0, 4).map((index) => start + index * step);
      const sdFirst = stdev(expand(values, first), false);
      const sdSecond = stdev(expand(values, second), false);
      if (Math.abs(sdFirst - sdSecond) < 0.15 * Math.max(sdFirst, sdSecond)) return null;
      const freqFirst = stdev(first, false);
      const freqSecond = stdev(second, false);
      if ((sdFirst > sdSecond) === (freqFirst > freqSecond) || Math.abs(freqFirst - freqSecond) < 0.5) return null;
      const bigger = sdFirst > sdSecond ? A : B;
      const smaller = bigger === A ? B : A;
      const key = `The standard deviation for ${bigger} is greater.`;
      const wrong = [
        [`The standard deviation for ${smaller} is greater.`, `Compares the frequency columns as if they were the data: the counts for ${smaller} vary more, but the counts are not the values.`],
        ["The two standard deviations are equal.", "Assumes the same values, mean, and range force the same spread; the standard deviation depends on how many values sit far from the mean."],
        ["There is not enough information to compare them.", "Assumes an exact calculation is needed; the table shows which data set has more of its values far from the shared center."],
      ];
      const rows = values.map((value, index) => [value, first[index], second[index]]);
      const edge = bigger === A ? first : second;
      return finish(false, {
        stimulus: { type: "table", content: table([ctx.header, `${A} frequency`, `${B} frequency`], rows) },
        stem: `The table summarizes ${ctx.subject}. Which statement correctly compares the standard deviations of the two data sets?`,
        correct: key,
        wrong,
        explanation:
          `Both data sets have ${sum(first)} values, are symmetric about ${values[2]}, and so share the same mean and median. ` +
          `${bigger} has ${edge[0] + edge[4]} values at the extremes (${values[0]} and ${values[4]}) and only ${edge[2]} at the ` +
          `center, so its values sit farther from the mean on average: its standard deviation is greater.`,
        steps: [
          `Note that both distributions are symmetric about ${values[2]}, so both means are ${values[2]}.`,
          "Compare how many values sit far from the center in each set.",
          `${bigger} puts more of its values at the extremes and fewer at the center.`,
          `So ${bigger} has the greater standard deviation.`,
        ],
        principles: [
          "The standard deviation measures how far the values typically are from the mean.",
          "In a frequency table the frequencies count the values; their own spread says nothing about the spread of the data.",
        ],
        trap: "Reading the frequency column as data reverses the comparison: a column with very uneven counts can describe data bunched tightly at the center.",
        hint: "Where are most of each data set's values: near the center or near the ends?",
        verify: () => {
          const cells = parseTable(table([ctx.header, "a", "b"], rows)).slice(1);
          const dataFirst = [];
          const dataSecond = [];
          cells.forEach(([value, countA, countB]) => {
            for (let copy = 0; copy < parseNumber(countA); copy += 1) dataFirst.push(parseNumber(value));
            for (let copy = 0; copy < parseNumber(countB); copy += 1) dataSecond.push(parseNumber(value));
          });
          const firstBigger = stdev(dataFirst, true) > stdev(dataSecond, true);
          return (firstBigger ? A : B) === bigger && S.approx(mean(dataFirst), mean(dataSecond));
        },
      });
    });
  }

  // Random data sets of n different positive integers, including skewed ones,
  // for checking what must (and what merely could) happen.
  function randomSets(seed, n) {
    const t = S.tools(S.rng(seed));
    const sets = [];
    for (let index = 0; index < 400; index += 1) {
      const top = t.pick([n + 2, 20, 50, 200]);
      const set = t.sample(range(1, Math.max(top, n + 2)), n);
      if (index % 4 === 0) set[0] = Math.max(...set) + t.int(1, 400);
      if (index % 4 === 1) set[0] = 1;
      if (new Set(set).size === n) sets.push(set);
    }
    return sets;
  }

  function statsMustBeTrue(t) {
    const n = t.int(5, 15);
    const scenario = t.int(0, 2);
    const d = t.int(4, 30);
    let event;
    let apply;
    let key;
    let could;
    let falses;
    if (scenario === 0) {
      event = `The greatest value in the data set is increased by ${d}.`;
      apply = (set) => set.map((value) => (value === Math.max(...set) ? value + d : value));
      key = ["The median does not change.", (b, a) => median(a) === median(b)];
      could = ["The mean becomes greater than the median.", (b, a) => mean(a) > median(a) && !(mean(b) > median(b)),
        `This can happen, but when the mean starts far enough below the median, an increase of ${d}/${n} does not lift it past the median.`];
      falses = [
        [`The mean increases by ${d}.`, (b, a) => S.approx(mean(a) - mean(b), d), `The sum increases by ${d}, so the mean increases by ${d}/${n}, not ${d}.`],
        ["The standard deviation does not change.", (b, a) => S.approx(stdev(a), stdev(b)), "Moving the greatest value farther from the others always increases the spread."],
        ["The range does not change.", (b, a) => spread(a) === spread(b), `The greatest value sets the range, so the range increases by ${d}.`],
      ];
    } else if (scenario === 1) {
      event = "One more value, equal to the mean of the original values, is added to the data set.";
      apply = (set) => set.concat([mean(set)]);
      key = ["The mean does not change.", (b, a) => S.approx(mean(a), mean(b))];
      could = ["The median does not change.", (b, a) => S.approx(median(a), median(b)),
        "True only for some data sets, such as when the mean equals the median; otherwise the middle shifts toward the mean."];
      falses = [
        ["The standard deviation does not change.", (b, a) => S.approx(stdev(a), stdev(b)), "The new value adds no deviation, but the squared deviations are now shared by one more value, so the standard deviation decreases."],
        ["The sum of the values does not change.", (b, a) => S.approx(sum(a), sum(b)), "Confuses the sum with the mean: the average is unchanged, but the sum grows by the added value."],
      ];
    } else {
      event = "The least value in the data set is removed.";
      apply = (set) => set.filter((value) => value !== Math.min(...set));
      key = ["The mean increases.", (b, a) => mean(a) > mean(b) + 1e-9];
      could = ["The standard deviation decreases.", (b, a) => stdev(a) < stdev(b) - 1e-9,
        "Usually true, but not always: if a far outlier remains at the top, removing the least value can increase the spread."];
      falses = [
        ["The median does not change.", (b, a) => S.approx(median(a), median(b)), "The median resists extreme values, but removing any value shifts the middle position up."],
        ["The range does not change.", (b, a) => spread(a) === spread(b), "The least value sets the range; without it the range shrinks."],
      ];
    }
    const chosen = t.shuffle(falses).slice(0, 2);
    const wrong = [[could[0], could[2]], ...chosen.map(([statement, , reason]) => [statement, reason])];
    return finish(false, {
      stimulus: null,
      stem: `A data set consists of ${n} different positive integers. ${event} Which of the following statements must be true about the new data set?`,
      correct: key[0],
      wrong,
      explanation: scenario === 0
        ? `The greatest value stays the greatest, so the order of the other values, and the middle one, are unchanged: the median does not change. ` +
          `The mean rises by only ${d}/${n}, and whether it passes the median depends on the data.`
        : scenario === 1
          ? "Adding a value equal to the mean adds exactly the mean to the sum and 1 to the count, so the mean is unchanged. " +
            "The median stays the same only for some data sets."
          : "The removed value is below the mean (it is the least of different values), so removing it raises the mean. " +
            "The standard deviation usually falls, but not always.",
      steps: [
        "Decide what each statistic depends on: every value (mean, sum, standard deviation), the middle position (median), or the extremes (range).",
        "Test each statement against the change for every possible data set, not one convenient example.",
        "A statement that fails for even one allowed data set does not have to be true.",
        `Only "${key[0]}" holds for every data set.`,
      ],
      principles: [
        "\"Must be true\" requires the statement to hold for every data set that fits the description.",
        "The mean changes whenever the sum changes relative to the count; the median changes only when the middle position's value changes.",
      ],
      trap: `"${could[0]}" can be true, which makes it tempting, but a single counterexample rules it out.`,
      hint: "For each statement, try to build a data set that fits the description but makes the statement false.",
      verify: () => {
        const sets = randomSets(`${scenario}|${n}|${d}`, n);
        // Witnesses on both sides of the "could" statement, whatever n is.
        const low = Math.floor(n / 2);
        sets.push(range(1, n));
        sets.push(range(1, n - 1).concat([1000]));
        sets.push(range(1, low).concat(range(1000, 1000 + n - low - 1)));
        sets.push([1, 2, 3, 4, 400].concat(range(401, 400 + n - 5)));
        const pairs = sets.filter((set) => set.length === n && new Set(set).size === n).map((set) => [set, apply(set)]);
        const always = pairs.every(([b, a]) => key[1](b, a));
        const couldYes = pairs.some(([b, a]) => could[1](b, a));
        const couldNo = pairs.some(([b, a]) => !could[1](b, a));
        const neverAlways = chosen.every(([, test]) => pairs.some(([b, a]) => !test(b, a)));
        return always && couldYes && couldNo && neverAlways;
      },
    });
  }

  const displayCenter = {
    id: "data-display-center",
    domain: DATA,
    skill: "One-variable data",
    subskill: "mean and median",
    difficulty: "Medium",
    title: "Mean or median from a dot plot or frequency table",
    recognize:
      "Each dot or frequency is a count of data values, so the data are the values repeated by their counts: find how many " +
      "values there are first, then locate the middle one (median) or divide the weighted total by that count (mean).",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["unweighted-average", "neighbouring-rule", "intermediate-value"],
    build(t) {
      const scene = t.pick(DISPLAY_SCENES);
      const asPlot = t.chance(0.55);
      const askMean = t.chance(0.5);
      const numeric = t.chance(0.3);
      return retry(() => {
        const width = t.int(5, 7);
        const lo = t.int(scene.lo[0], scene.lo[1]);
        const values = range(lo, lo + width - 1);
        if (scene.axis === "Quiz score" && values[values.length - 1] > 10) return null;
        const freqs = values.map(() => t.int(0, 6));
        freqs[0] = Math.max(1, freqs[0]);
        freqs[width - 1] = Math.max(1, freqs[width - 1]);
        const n = sum(freqs);
        if (n < 11 || n > 26) return null;
        // Cumulative counts locate the middle value(s).
        const valueAt = (position) => {
          let seen = 0;
          for (let index = 0; index < width; index += 1) {
            seen += freqs[index];
            if (position <= seen) return values[index];
          }
          return null;
        };
        const median = n % 2 ? valueAt((n + 1) / 2) : (valueAt(n / 2) + valueAt(n / 2 + 1)) / 2;
        const total = sum(values.map((value, index) => value * freqs[index]));
        const mean = total / n;
        const listedMiddle = (values[0] + values[width - 1]) / 2;
        const unweighted = sum(values) / width;
        const top = Math.max(...freqs);
        const mode = freqs.filter((f) => f === top).length === 1 ? values[freqs.indexOf(top)] : null;
        const lowerMiddle = n % 2 ? null : valueAt(n / 2);
        const key = askMean ? mean : median;
        if (askMean ? (!isClean(mean, 2) || close(mean, unweighted)) : close(median, listedMiddle)) return null;
        const stat = askMean ? "mean" : "median";
        const candidates = askMean
          ? [
            [shown(unweighted), `Averages the ${width} listed values without weighting each by how often it occurs.`],
            [shown(total / width), `Divides the total, ${total}, by the ${width} different values instead of by the ${n} data values.`],
            [shown(median, 1), "Gives the median instead of the mean."],
            [shown(n / width), "Averages the frequencies instead of the data values."],
            [shown(total, 0), `Stops at the total, ${total}, without dividing by the number of values.`],
          ]
          : [
            [shown(listedMiddle, 1), "Takes the middle of the listed values, ignoring how many times each occurs."],
            [mode === null ? null : shown(mode, 0), "Gives the value that occurs most often (the mode), not the middle value."],
            [isClean(mean, 2) ? shown(mean) : null, "Gives the mean instead of the median."],
            [lowerMiddle === null ? null : shown(lowerMiddle, 0), `Takes value number ${n / 2} alone; with ${n} values the median is the average of values ${n / 2} and ${n / 2 + 1}.`],
            [asPlot ? null : shown(medianOf(freqs), 1), "Finds the median of the frequency column instead of the data."],
          ];
        const title = asPlot ? "dot plot" : "frequency table";
        const alt =
          `Dot plot of ${scene.axis.toLowerCase()} with values from ${values[0]} to ${values[width - 1]}. Number of dots above each value: ` +
          `${values.map((value, index) => `${value}: ${freqs[index]}`).join("; ")}.`;
        const plot = asPlot ? dotPlot(values, freqs, scene.axis, alt) : null;
        const stimulus = asPlot
          ? null
          : { type: "table", content: table([scene.head, "Frequency"], values.map((value, index) => [value, freqs[index]])) };
        const middleText = n % 2
          ? `the median is value number ${(n + 1) / 2}, which is ${num(median)}`
          : `the median is the average of values ${n / 2} and ${n / 2 + 1}, which is ${num(median)}`;
        const weighted = values.map((value, index) => `${value}(${freqs[index]})`).join(" + ");
        return pack(numeric, key, fmt(tidy(key)), candidates, {
          stimulus,
          figure: plot ? plot.figure : null,
          stem: `The ${title} ${asPlot ? "shows" : "summarizes"} ${scene.about(n)}. What is the ${stat} of the data?`,
          explanation: askMean
            ? `There are ${n} data values, and their total is ${weighted} = ${total}. The mean is ${total} ÷ ${n} = ${num(tidy(mean))}.`
            : `There are ${fmt(n)} data values. Counting up from the lowest value, ${middleText}.`,
          steps: askMean
            ? [
              `Count the data values: ${freqs.join(" + ")} = ${n}.`,
              `Total them, each value times its frequency: ${total}.`,
              `Divide: ${total} ÷ ${n} = ${num(tidy(mean))}.`,
            ]
            : [
              `Count the data values: ${freqs.join(" + ")} = ${n}.`,
              n % 2 ? `The middle value is number ${(n + 1) / 2}.` : `The middle values are numbers ${n / 2} and ${n / 2 + 1}.`,
              `Counting up from ${values[0]}, ${middleText}.`,
            ],
          principles: [
            `In a ${title}, each value appears as many times as its ${asPlot ? "dots" : "frequency"} show; those repeated values are the data.`,
            "The median is the middle of the ordered data; the mean is the total of the data divided by how many values there are.",
          ],
          trap: askMean
            ? `Averaging the ${width} listed values (${num(tidy(unweighted))}) ignores how often each occurs.`
            : `The middle of the listed values (${num(listedMiddle)}) is not the middle of the data, because the values occur different numbers of times.`,
          hint: `How many data values are there in all?`,
          estimatedSeconds: 95,
          verify: () => {
            const counts = plot ? readDotPlot(plot.figure.svg, plot.xs) : parseTable(stimulus.content).slice(1).map((row) => parseNumber(row[1]));
            if (!counts) return false;
            const data = expand(values, counts);
            const value = askMean ? sum(data) / data.length : medianOf(data);
            return data.length === n && close(value, key);
          },
        });
      });
    },
  };

  const weightedMeanGroups = {
    id: "weighted-mean-groups",
    domain: DOMAIN,
    skill: "One-variable data",
    subskill: "mean and median",
    title: "Combined groups with different sizes and means",
    recognize:
      "Means of different-sized groups cannot be averaged; convert each mean to a total (mean × size), work with totals, " +
      "and convert back only at the end.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["unweighted-average", "intermediate-value", "wrong-quantity", "reversed-condition"],
    build(t) {
      const form = t.int(0, 2);
      const numeric = t.chance(0.45);
      const instance = [meanMissingSize, meanMissingMean, meanShift][form](t, numeric);
      return { estimatedSeconds: 105, ...instance };
    },
  };

  const dataChangeStatistics = {
    id: "data-change-statistics",
    domain: DOMAIN,
    skill: "One-variable data",
    subskill: "distributions",
    title: "How a data change moves each statistic",
    recognize:
      "Each statistic depends on something different: the mean and standard deviation on every value, the median on the " +
      "middle position, the range on the extremes, and a frequency table's data on its values repeated by their counts.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["must-vs-could", "part-vs-whole", "neighbouring-rule", "wrong-quantity"],
    build(t) {
      const form = t.int(0, 3);
      if (form === 0) return { estimatedSeconds: 110, ...statsNewMedian(t, t.chance(0.6)) };
      if (form === 1) return { estimatedSeconds: 110, ...statsWhichTrue(t) };
      if (form === 2) return { estimatedSeconds: 95, ...statsCompareSpread(t) };
      return { estimatedSeconds: 100, ...statsMustBeTrue(t) };
    },
  };

  /* ======================================= list-mean-or-median (Easy) */

  const SHORT_LISTS = [
    { intro: (n) => `The list gives the numbers of books checked out of a small library on each of ${n} days.`, low: 12, high: 64 },
    { intro: (n) => `The list gives the heights, in centimeters, of ${n} sunflower plants in a garden.`, low: 95, high: 210 },
    { intro: (n) => `The list gives the numbers of minutes that ${n} commuters spent in traffic one morning.`, low: 8, high: 55 },
    { intro: (n) => `The list gives the prices, in dollars, of ${n} used bicycles for sale at a bike shop.`, low: 45, high: 260 },
    { intro: (n) => `The list gives the masses, in grams, of ${n} eggs from a farm.`, low: 48, high: 74 },
    { intro: (n) => `The list gives the numbers of push-ups that ${n} students completed in one minute.`, low: 9, high: 52 },
  ];

  const SHORT_TABLES = [
    {
      head: ["Day", "Kayaks rented"], rows: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      intro: (n) => `The table shows the number of kayaks a rental shop rented on each of ${n} days.`, low: 4, high: 48,
    },
    {
      head: ["Game", "Points scored"], rows: ["1", "2", "3", "4", "5", "6", "7", "8"],
      intro: (n) => `The table shows the numbers of points a basketball team scored in each of its first ${n} games.`, low: 48, high: 104,
    },
    {
      head: ["Month", "Rainfall (millimeters)"], rows: ["January", "February", "March", "April", "May", "June", "July", "August"],
      intro: (n) => `The table shows the rainfall, in millimeters, in a city during each of ${n} months.`, low: 18, high: 140,
    },
    {
      head: ["Student", "Hours volunteered"], rows: ["Ana", "Ben", "Chloe", "Dmitri", "Esi", "Farid", "Grace", "Hiro"],
      intro: (n) => `The table shows the number of hours each of ${n} students volunteered last month.`, low: 2, high: 30,
    },
  ];

  // The values a list or table stimulus shows, read back from its text.
  function valuesShown(stimulus) {
    if (stimulus.type === "table") return parseTable(stimulus.content).slice(1).map((cells) => cells[1]);
    return stimulus.content.split(", ");
  }

  // Median by trimming the least and greatest values in pairs.
  function trimmedMiddle(list) {
    const rest = list.slice();
    while (rest.length > 2) {
      rest.splice(rest.indexOf(Math.min(...rest)), 1);
      rest.splice(rest.indexOf(Math.max(...rest)), 1);
    }
    return rest.length === 1 ? rest[0] : (rest[0] + rest[1]) / 2;
  }

  const listCenter = {
    id: "list-mean-or-median",
    domain: DATA,
    skill: "One-variable data",
    subskill: "mean and median",
    difficulty: "Easy",
    title: "Mean or median of a short data set",
    recognize:
      "The median is the middle of the values once they are in order (the average of the two middle values when there is " +
      "an even number); the mean is the sum of the values divided by how many there are.",
    rubric: { steps: 0, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "intermediate-value"],
    build(t) {
      const inTable = t.chance(0.4);
      const askMedian = t.chance(0.55);
      const numeric = t.chance(0.3);
      const ctx = inTable ? t.pick(SHORT_TABLES) : t.pick(SHORT_LISTS);
      return retry(() => {
        const n = inTable ? t.int(5, Math.min(8, ctx.rows.length)) : t.int(5, 9);
        const values = t.sample(range(ctx.low, ctx.high), n);
        const sorted = values.slice().sort((p, q) => p - q);
        const med = median(values);
        const avg = tidy(mean(values));
        const total = sum(values);
        const mid = (sorted[0] + sorted[n - 1]) / 2;
        const listed = n % 2 ? values[(n - 1) / 2] : (values[n / 2 - 1] + values[n / 2]) / 2;
        const key = askMedian ? med : avg;
        if ((!askMedian && !isClean(avg, 1)) || close(avg, med)) return null;
        if (askMedian && listed === med) return null;
        const stimulus = inTable
          ? { type: "table", content: table(ctx.head, values.map((value, index) => [ctx.rows[index], value])) }
          : { type: "text", content: values.join(", ") };
        const middleText = n % 2
          ? `the middle value is value number ${(n + 1) / 2}, ${num(med)}`
          : `the two middle values are ${sorted[n / 2 - 1]} and ${sorted[n / 2]}, whose average is ${num(med)}`;
        const candidates = askMedian
          ? [
            [shown(listed, 1), `Takes the middle of the values in the order ${inTable ? "the table lists them" : "they are listed"}, without first putting them in order.`],
            [shown(avg), "Gives the mean of the data instead of the median."],
            n % 2 ? null : [shown(sorted[n / 2 - 1], 0), `Uses only one of the two middle values, ${sorted[n / 2 - 1]}, instead of their average.`],
            [shown(mid, 1), "Averages the least and greatest values instead of finding the middle value."],
            n % 2 ? null : [shown(sorted[n / 2], 0), `Uses only one of the two middle values, ${sorted[n / 2]}, instead of their average.`],
          ].filter(Boolean)
          : [
            [shown(total, 0), `Stops at the sum of the values, ${fmt(total)}, without dividing by ${n}.`],
            [shown(med, 1), "Gives the median of the data instead of the mean."],
            [shown(tidy(total / (n - 1))), `Divides the sum by ${n - 1} instead of by the ${n} values.`],
            [shown(mid, 1), "Averages only the least and greatest values."],
          ];
        return pack(numeric, key, fmt(key), candidates, {
          stimulus,
          figure: null,
          stem: `${ctx.intro(n)} What is the ${askMedian ? "median" : "mean"} of the data?`,
          explanation: askMedian
            ? `In order, the values are ${sorted.join(", ")}. With ${n} values, ${middleText}, so the median is ${num(med)}.`
            : `The sum of the ${n} values is ${fmt(total)}, so the mean is ${fmt(total)} ÷ ${n} = ${num(avg)}.`,
          steps: askMedian
            ? [
              `Put the values in order: ${sorted.join(", ")}.`,
              n % 2 ? `With ${n} values, the median is value number ${(n + 1) / 2}.` : `With ${n} values, the median is the average of values ${n / 2} and ${n / 2 + 1}.`,
              `The median is ${num(med)}.`,
            ]
            : [
              `Add the values: ${values.join(" + ")} = ${fmt(total)}.`,
              `Divide by the number of values: ${fmt(total)} ÷ ${n} = ${num(avg)}.`,
            ],
          principles: [
            "The median is the middle value of the data in order, or the average of the two middle values when the count is even.",
            "The mean is the sum of the values divided by the number of values.",
          ],
          trap: askMedian
            ? `The values are not listed in order; the middle of the list as written, ${num(listed)}, is not the median.`
            : `The sum, ${fmt(total)}, is a step on the way; the mean divides it by ${n}.`,
          hint: askMedian ? "Are the values in order?" : "How many values are there?",
          estimatedSeconds: 55,
          verify: () => {
            const parsed = valuesShown(stimulus).map(parseNumber);
            if (parsed.length !== n) return false;
            return askMedian
              ? close(trimmedMiddle(parsed), key)
              : close(sum(parsed.map((value) => value - key)), 0);
          },
        });
      });
    },
  };

  /* ========================================== box-plot-summary (Easy) */

  const BOX_SCENES = [
    { title: "Height (inches)", about: "the heights, in inches, of the players on a basketball team", starts: [62, 64, 66], steps: [1], max: 90 },
    { title: "Wait time (minutes)", about: "the wait times, in minutes, of the customers at a bank one morning", starts: [0], steps: [2, 5], max: 60 },
    { title: "Test score", about: "the scores of the students in a class on a 100-point test", starts: [40, 45], steps: [5], max: 100 },
    { title: "Age (years)", about: "the ages, in years, of the people at a family reunion", starts: [0], steps: [5, 8], max: 100 },
    { title: "High temperature (°F)", about: "the daily high temperatures, in degrees Fahrenheit, in a city during one month", starts: [40, 50, 60], steps: [2], max: 100 },
    { title: "Commute distance (miles)", about: "the distances, in miles, that the employees of a company commute to work", starts: [0], steps: [2, 3], max: 40 },
  ];

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
      `<rect x="${C.r1(q1)}" y="${BOX.top}" width="${C.r1(q3 - q1)}" height="${BOX.bottom - BOX.top}" fill="none" stroke="currentColor" stroke-width="2"/>`,
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

  const boxPlotSummary = {
    id: "box-plot-summary",
    domain: DATA,
    skill: "One-variable data",
    subskill: "spread",
    difficulty: "Easy",
    title: "Reading a box plot",
    recognize:
      "A box plot marks five values: the whisker ends are the least and greatest values, the box's edges are the first and " +
      "third quartiles, and the line inside the box is the median. The range spans the whiskers; the interquartile range spans the box.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "wrong-quantity"],
    build(t) {
      const ctx = t.pick(BOX_SCENES);
      const ask = t.pick(["median", "iqr", "range"]);
      const numeric = t.chance(0.3);
      return retry(() => {
        const start = t.pick(ctx.starts);
        const step = t.pick(ctx.steps);
        const count = t.int(11, 13);
        const ticks = range(0, count - 1).map((index) => start + index * step);
        if (ticks[count - 1] > ctx.max) return null;
        const i0 = t.int(0, 2);
        const i4 = t.int(count - 3, count - 1);
        const inner = t.sample(range(i0 + 1, i4 - 1), 3).sort((p, q) => p - q);
        const [i1, i2, i3] = inner;
        if (i2 - i1 === i3 - i2 || i3 - i1 < 2) return null;
        const five = [i0, i1, i2, i3, i4].map((index) => ticks[index]);
        const [low, q1, med, q3, high] = five;
        const iqr = q3 - q1;
        const spreadAll = high - low;
        const key = ask === "median" ? med : ask === "iqr" ? iqr : spreadAll;
        const candidates = ask === "median"
          ? [
            [shown(q1, 0), "Reads the left edge of the box, the first quartile, instead of the line inside the box."],
            [shown(q3, 0), "Reads the right edge of the box, the third quartile, instead of the line inside the box."],
            [shown((q1 + q3) / 2, 1), "Takes the center of the box; the median is marked by the line inside the box, which need not be centered."],
            [shown((low + high) / 2, 1), "Takes the value halfway between the least and greatest values."],
          ]
          : ask === "iqr"
            ? [
              [shown(spreadAll, 0), "Gives the range, from the least to the greatest value, instead of the width of the box."],
              [shown(q3 - med, 0), "Measures only from the median to the third quartile, half of the box."],
              [shown(med - q1, 0), "Measures only from the first quartile to the median, half of the box."],
              [shown(q3, 0), "Gives the third quartile itself instead of the distance across the box."],
            ]
            : [
              [shown(iqr, 0), "Gives the interquartile range, the width of the box, instead of the distance between the whisker ends."],
              [shown(high, 0), "Gives the greatest value instead of the difference between the greatest and least values."],
              [shown(high - med, 0), "Measures from the median to the greatest value instead of from the least value."],
              [shown(high - q1, 0), "Measures from the left edge of the box instead of from the least value."],
            ];
        const alt =
          `Box plot titled ${ctx.title} on a number line from ${ticks[0]} to ${ticks[count - 1]} marked every ${step}. ` +
          `The left whisker starts at ${low}, the box runs from ${q1} to ${q3} with a line at ${med}, and the right whisker ends at ${high}.`;
        const figure = boxPlot(five, ticks, ctx.title, alt);
        const statName = ask === "median" ? "median" : ask === "iqr" ? "interquartile range" : "range";
        return pack(numeric, key, fmt(key), candidates, {
          stimulus: null,
          figure,
          stem: `The box plot summarizes ${ctx.about}. What is the ${statName} of the data?`,
          explanation: ask === "median"
            ? `The line inside the box marks the median, ${med}.`
            : ask === "iqr"
              ? `The box runs from the first quartile, ${q1}, to the third quartile, ${q3}, so the interquartile range is ${q3} ${MINUS} ${q1} = ${iqr}.`
              : `The whiskers run from the least value, ${low}, to the greatest value, ${high}, so the range is ${high} ${MINUS} ${low} = ${spreadAll}.`,
          steps: [
            `Read the five values: least ${low}, first quartile ${q1}, median ${med}, third quartile ${q3}, greatest ${high}.`,
            ask === "median"
              ? `The median is the line inside the box: ${med}.`
              : ask === "iqr"
                ? `Interquartile range: ${q3} ${MINUS} ${q1} = ${iqr}.`
                : `Range: ${high} ${MINUS} ${low} = ${spreadAll}.`,
          ],
          principles: [
            "In a box plot the whisker ends are the least and greatest values, the box spans the first to third quartiles, and the line in the box is the median.",
            "Range = greatest − least; interquartile range = third quartile − first quartile.",
          ],
          trap: ask === "median"
            ? "The median line is not always in the center of the box."
            : ask === "iqr"
              ? "The interquartile range is the width of the box only; the whiskers belong to the range."
              : "The range runs between the whisker ends; the box alone gives the interquartile range.",
          hint: ask === "median" ? "Which mark on the box plot shows the middle of the data?" : "Which two marks on the box plot bound the spread the question asks about?",
          estimatedSeconds: 50,
          verify: () => {
            const read = readBoxPlot(figure.svg);
            if (!read) return false;
            const [a, b, c, d, e] = read;
            const again = ask === "median" ? c : ask === "iqr" ? d - b : e - a;
            return close(again, key) && a < b && b < c && c < d && d < e;
          },
        });
      });
    },
  };

  /* ======================================== mean-missing-value (Medium) */

  const MISSING_LISTS = [
    {
      one: (n) => `The list shows the masses, in grams, of ${n} apples, where x represents the mass of one of the apples.`,
      two: (n) => `The list shows the masses, in grams, of ${n} apples, where x represents the mass of each of two of the apples.`,
      mean: (n, M) => `The mean mass of the ${n} apples is ${M} grams.`, low: 120, high: 210,
    },
    {
      one: (n) => `The list shows Leo's scores on ${n} quizzes, where x represents his score on one of the quizzes.`,
      two: (n) => `The list shows Leo's scores on ${n} quizzes, where x represents each of his scores on the last two quizzes.`,
      mean: (n, M) => `Leo's mean score on the ${n} quizzes is ${M}.`, low: 58, high: 100,
    },
    {
      one: (n) => `The list shows the monthly rainfall, in millimeters, in a town for ${n} months, where x represents the rainfall in one of the months.`,
      two: (n) => `The list shows the monthly rainfall, in millimeters, in a town for ${n} months, where x represents the rainfall in each of two of the months.`,
      mean: (n, M) => `The mean monthly rainfall for the ${n} months is ${M} millimeters.`, low: 20, high: 150,
    },
    {
      one: (n) => `The list shows the numbers of minutes Rosa spent commuting on ${n} days, where x represents the number of minutes on one of the days.`,
      two: (n) => `The list shows the numbers of minutes Rosa spent commuting on ${n} days, where x represents the number of minutes on each of two of the days.`,
      mean: (n, M) => `Rosa's mean commuting time for the ${n} days is ${M} minutes.`, low: 18, high: 65,
    },
  ];

  const MISSING_TABLES = [
    {
      head: ["Day", "Kayaks rented"], rows: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], low: 6, high: 40,
      intro: (n, row) => `The table shows the number of kayaks a rental shop rented on each of ${n} days. The number rented on ${row} is represented by k.`,
      mean: (n, M) => `The mean number of kayaks rented per day for the ${n} days was ${M}.`,
    },
    {
      head: ["Week", "Hours volunteered"], rows: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"], low: 3, high: 20,
      intro: (n, row) => `The table shows the numbers of hours that Mei volunteered at an animal shelter in each of ${n} weeks. The number of hours for ${row} is represented by k.`,
      mean: (n, M) => `Mei volunteered a mean of ${M} hours per week for the ${n} weeks.`,
    },
    {
      head: ["Month", "Electricity used (kilowatt-hours)"], rows: ["January", "February", "March", "April", "May", "June"], low: 420, high: 980,
      intro: (n, row) => `The table shows the amounts of electricity a household used in each of ${n} months. The amount for ${row} is represented by k.`,
      mean: (n, M) => `The household's mean monthly electricity use for the ${n} months was ${fmt(M)} kilowatt-hours.`,
    },
  ];

  const meanMissing = {
    id: "mean-missing-value",
    domain: DATA,
    skill: "One-variable data",
    subskill: "mean and median",
    difficulty: "Medium",
    title: "A missing value from the mean",
    recognize:
      "The mean fixes the sum: the values must add up to the mean times the number of values, so the unknown is that total " +
      "minus the known values (divided by how many times the unknown appears).",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity"],
    build(t) {
      const inTable = t.chance(0.35);
      const twice = !inTable && t.chance(0.4);
      const numeric = t.chance(0.35);
      const ctx = inTable ? t.pick(MISSING_TABLES) : t.pick(MISSING_LISTS);
      const letter = inTable ? "k" : "x";
      return retry(() => {
        const n = inTable ? t.int(5, ctx.rows.length) : t.int(5, 8);
        const copies = twice ? 2 : 1;
        const known = range(1, n - copies).map(() => t.int(ctx.low, ctx.high));
        const x = t.int(ctx.low, ctx.high);
        const knownSum = sum(known);
        const total = knownSum + copies * x;
        if (total % n) return null;
        const M = total / n;
        if (M === x) return null;
        const knownMean = tidy(knownSum / known.length);
        const short = (n - 1) * M - knownSum;
        const candidates = twice
          ? [
            [shown(2 * x, 0), `Stops at ${fmt(total)} ${MINUS} ${fmt(knownSum)} = ${fmt(2 * x)}, the sum of the two values equal to x.`],
            [shown(total, 0), `Stops at the total of all ${n} values, ${n} × ${M} = ${fmt(total)}.`],
            [shown(M, 0), `Assumes x equals the mean, ${M}.`],
            [shown(knownMean), `Gives the mean of the ${n - 2} known values.`],
          ]
          : [
            [shown(total, 0), `Stops at the total of all ${n} values, ${n} × ${fmt(M)} = ${fmt(total)}.`],
            [short > 0 ? shown(short, 0) : null, `Multiplies the mean by ${n - 1}, the number of known values, instead of by ${n}.`],
            [shown(M, 0), `Assumes the missing value equals the mean, ${fmt(M)}.`],
            [shown(knownMean), `Gives the mean of the ${n - 1} known values.`],
          ];
        let stimulus;
        let lead;
        if (inTable) {
          const hidden = t.int(0, n - 1);
          let next = 0;
          const rows = ctx.rows.slice(0, n).map((name, index) => [name, index === hidden ? letter : fmt(known[next++])]);
          stimulus = { type: "table", content: table(ctx.head, rows) };
          lead = ctx.intro(n, ctx.rows[hidden]);
        } else {
          const slots = t.shuffle(range(0, n - 1)).slice(0, copies);
          let next = 0;
          const shownList = range(0, n - 1).map((index) => (slots.includes(index) ? letter : String(known[next++])));
          stimulus = { type: "text", content: shownList.join(", ") };
          lead = twice ? ctx.two(n) : ctx.one(n);
        }
        return pack(numeric, x, fmt(x), candidates, {
          stimulus,
          figure: null,
          stem: `${lead} ${ctx.mean(n, M)} What is the value of ${letter}?`,
          explanation:
            `A mean of ${fmt(M)} for ${n} values means the values add up to ${n} × ${fmt(M)} = ${fmt(total)}. The known values add up to ` +
            `${fmt(knownSum)}, so ${twice ? `2${letter}` : letter} = ${fmt(total)} ${MINUS} ${fmt(knownSum)} = ${fmt(copies * x)}${twice ? `, and ${letter} = ${fmt(x)}` : ""}.`,
          steps: [
            `Total of all ${n} values: ${n} × ${fmt(M)} = ${fmt(total)}.`,
            `Sum of the known values: ${fmt(knownSum)}.`,
            twice
              ? `The two unknown values: 2${letter} = ${fmt(total)} ${MINUS} ${fmt(knownSum)} = ${fmt(2 * x)}, so ${letter} = ${fmt(x)}.`
              : `The missing value: ${letter} = ${fmt(total)} ${MINUS} ${fmt(knownSum)} = ${fmt(x)}.`,
          ],
          principles: [
            "Sum of the values = mean × number of values.",
            "A missing value is the required total minus the values already known.",
          ],
          trap: twice
            ? `${fmt(total)} ${MINUS} ${fmt(knownSum)} = ${fmt(2 * x)} is the sum of the two values equal to ${letter}, not ${letter} itself.`
            : `${fmt(total)} is the total all ${n} values must reach; the missing value is what is left after the known values.`,
          hint: "What must all the values add up to?",
          estimatedSeconds: 85,
          verify: () => {
            const entries = valuesShown(stimulus);
            const filled = entries.map((entry) => (entry === letter ? x : parseNumber(entry)));
            return entries.filter((entry) => entry === letter).length === copies && close(mean(filled), M);
          },
        });
      });
    },
  };

  return [listCenter, boxPlotSummary, displayCenter, meanMissing, weightedMeanGroups, dataChangeStatistics];
});
