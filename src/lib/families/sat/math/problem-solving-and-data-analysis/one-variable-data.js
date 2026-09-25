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

  const { MINUS, table, plural } = S;
  // Every printed number is grouped by thousands ("1,188").
  const num = S.grouped;
  const {
    DATA, tidy, isClean, fmt, shown, sum, range, retry, pack, parseTable, parseNumber, close,
    DOMAIN, about, finish, packRanked, statementGrid, dotPlot, readDotPlot, boxPlot, readBoxPlot,
    stackedDotPlots, readStackedDotPlots, stackedBoxPlots, readStackedBoxPlots, histogram, readHistogram,
  } = C;

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
      return packRanked(t, numeric, n2, [
        [reversed, `Pairs each group with the other group's distance from ${M}; the group farther from the combined mean must be the smaller one.`],
        [n1 + n2, `Gives the number of ${ctx.members} in both groups together, not the number ${ctx.g[1]}.`],
        [n1 * d1, `Stops at ${n1} × ${d1} = ${n1 * d1}, the total amount the ${ctx.members} ${ctx.g[0]} are ${side} the combined mean.`],
        [n1, `Assumes the two groups are the same size, as if ${M} were the average of the two group means.`],
      ], {
        stimulus: null,
        stem:
          `The ${n1} ${ctx.members} ${ctx.g[0]} have a mean ${ctx.measure} of ${m1} ${ctx.unit}, and the ${ctx.members} ${ctx.g[1]} ` +
          `have a mean ${ctx.measure} of ${m2} ${ctx.unit}. All the ${ctx.members} ${ctx.both} together have a mean ${ctx.measure} ` +
          `of ${M} ${ctx.unit}. How many ${ctx.members} are ${ctx.g[1]}?`,
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
      }, { show: num, places: 0 });
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
        return packRanked(t, numeric, m2, [
          [unweighted, `Treats ${num(M)} as the average of the two group means, which ignores that the groups differ in size.`],
          [perAll, `Divides the second group's total, ${num(n2 * m2)}, by all ${N} ${ctx.members} instead of by ${n2}.`],
          [n2 * m2, `Stops at the second group's total, ${num(n2 * m2)} ${ctx.unit}, without dividing by its size.`],
          [M, `Gives the mean of all ${N} ${ctx.members}, not of the ${ctx.members} ${ctx.g[1]}.`],
          [tidy((N * M - n1 * m1) / n1), `Divides the second group's total by ${n1}, the size of the first group.`],
        ], {
          stimulus: null,
          stem:
            `A total of ${N} ${ctx.members} are ${ctx.both}. The ${n1} ${ctx.members} ${ctx.g[0]} have a mean ${ctx.measure} of ` +
            `${m1} ${ctx.unit}, and all ${N} have a mean ${ctx.measure} of ${num(M)} ${ctx.unit}. What is the mean ${ctx.measure}, in ` +
            `${ctx.unit}, of the ${ctx.members} ${ctx.g[1]}?`,
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
        }, { show: num });
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
        const w1 = num(p / 100);
        const w2 = num((100 - p) / 100);
        return packRanked(t, numeric, m2, [
          [unweighted, `Treats ${num(M)} as the average of the two group means, ignoring that the groups are ${p}% and ${100 - p}% of the total.`],
          [swapped, `Gives the ${p}% weight to the second group instead of the first.`],
          [partial, `Stops at ${num(M)} ${MINUS} ${num(p / 100)}(${m1}) = ${num(partial)}, the second group's share of the overall mean, before dividing by ${num((100 - p) / 100)}.`],
          [M, `Gives the mean of all the ${ctx.members}, not of the ${ctx.members} ${ctx.g[1]}.`],
        ], {
          stimulus: null,
          stem:
            `Of the ${ctx.members} ${ctx.both}, ${p}% are ${ctx.g[0]} and the rest are ${ctx.g[1]}. The ${ctx.members} ${ctx.g[0]} ` +
            `have a mean ${ctx.measure} of ${m1} ${ctx.unit}, and all the ${ctx.members} ${ctx.both} have a mean ${ctx.measure} of ` +
            `${num(M)} ${ctx.unit}. What is the mean ${ctx.measure}, in ${ctx.unit}, of the ${ctx.members} ${ctx.g[1]}?`,
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
        }, { show: num });
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
      const rows = [0, 1, 2].map((index) => [ctx.names[index], sizes[index], index === hidden ? "x" : means[index]]);
      const knownTotal = sum(others.map((index) => sizes[index] * means[index]));
      return packRanked(t, numeric, x, [
        [unweighted, `Treats ${M} as the plain average of the three group means, ignoring the group sizes.`],
        [perAll, `Divides the total for ${name} by all ${N} ${ctx.members} instead of by ${sizes[hidden]}.`],
        [hiddenTotal, `Stops at the total for ${name}, ${num(hiddenTotal)}, without dividing by its size.`],
        [M, `Gives the mean of all ${N} ${ctx.members}, not the mean for ${name}.`],
      ], {
        stimulus: { type: "table", content: table([ctx.header, `Number of ${ctx.members}`, `Mean ${ctx.measure} (${ctx.unit})`], rows) },
        stem:
          `The table shows the number of ${ctx.members} and the mean ${ctx.measure} for each of three ${ctx.noun}. The mean ` +
          `${ctx.measure} of all ${N} ${ctx.members} is ${M} ${ctx.unit}. What is the value of x?`,
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
      }, { show: num });
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
        [unweighted, adding
          ? `Treats ${after} as the average of ${m} and the added group's mean, as if the two groups were the same size.`
          : `Treats ${m} as the average of ${after} and the removed group's mean, as if the two groups were the same size.`],
        [tidy(oldCount), adding
          ? `Multiplies the new mean by the old count, ${n}, instead of ${n + k}.`
          : `Multiplies the new mean by the old count, ${n}, instead of ${n - k}.`],
        [k * x, `Stops at the total of the ${k} ${adding ? "added" : "removed"} ${ctx.members}, ${num(k * x)}, without dividing by ${k}.`],
        [after, `Gives the mean after the change, not the mean of the ${k} ${adding ? "added" : "removed"} ${ctx.members}.`],
      ];
      const oldTotal = n * m;
      const newTotal = newCount * after;
      const stem = adding
        ? `The ${n} ${ctx.members} ${ctx.g[0]} have a mean ${ctx.measure} of ${m} ${ctx.unit}. After data for ${k} more ` +
          `${ctx.members} are included, the mean ${ctx.measure} of all ${n + k} is ${after} ${ctx.unit}. What is the mean ` +
          `${ctx.measure}, in ${ctx.unit}, of the ${k} ${ctx.members} whose data were added?`
        : `The ${n} ${ctx.members} ${ctx.g[0]} have a mean ${ctx.measure} of ${m} ${ctx.unit}. After the data for ${k} of these ` +
          `${ctx.members} are removed, the mean ${ctx.measure} of the remaining ${n - k} is ${after} ${ctx.unit}. What is the mean ` +
          `${ctx.measure}, in ${ctx.unit}, of the ${k} ${ctx.members} whose data were removed?`;
      return packRanked(t, numeric, x, candidates, {
        stimulus: null,
        stem,
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
      }, { show: num });
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

  // The value at a 1-based position of the ordered data a frequency table describes.
  function valueAt(values, counts, position) {
    let seen = 0;
    for (let index = 0; index < values.length; index += 1) {
      seen += counts[index];
      if (position <= seen) return values[index];
    }
    return NaN;
  }

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
      const n = sum(after);
      const middle = n % 2 ? `position ${(n + 1) / 2}` : `positions ${n / 2} and ${n / 2 + 1}`;
      const candidates = [
        [oldMedian, `Keeps the median of the original data, ${num(oldMedian)}; the change moves the middle position.`],
        [countsMedian, "Takes the median of the frequency column, treating the counts as if they were the data values."],
        [valuesMedian, "Takes the middle of the listed values, ignoring how many times each value occurs."],
        [newMean, "Gives the mean of the revised data instead of its median."],
        [total % 2 ? valueAt(values, after, (total + 1) / 2) : NaN,
          `Counts to position ${(total + 1) / 2}, the middle of the original ${total} values, in the revised data; the middle moved when the count changed to ${n}.`],
      ];
      return packRanked(t, numeric, key, candidates, {
        stimulus: { type: "table", content: table([ctx.header, "Frequency"], values.map((v, index) => [v, before[index]])) },
        stem: `The frequency table summarizes ${ctx.subject}. ${event} What is the median of the data after this change?`,
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
      }, { show: num, positive: false });
    });
  }

  const LISTS = [
    { intro: (n) => `The list gives the ages, in years, of the ${n} members of a book club.`, low: 19, high: 70 },
    { intro: (n) => `The list gives the daily high temperatures, in degrees Fahrenheit, in a town on ${n} days.`, low: 41, high: 86 },
    { intro: (n) => `The list gives the numbers of minutes that ${n} students spent on homework one evening.`, low: 10, high: 90 },
    { intro: (n) => `The list gives the numbers of points a basketball player scored in ${n} games.`, low: 4, high: 36 },
  ];

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
    if (event.kind === "drop-min") {
      const copy = list.slice();
      copy.splice(copy.indexOf(Math.min(...copy)), 1);
      return copy;
    }
    return list.map((value) => value + event.shift);
  }

  // Statements about how a statistic moved, all of one shape so no wording
  // marks the key: "The median is greater than before." Each direction is
  // two words ("greater than", "less than", "unchanged from"), so no choice
  // shares more words with the others than its neighbours do.
  const STAT_NAMES = { mean: "mean", median: "median", range: "range", sd: "standard deviation" };

  const DIRECTION_WORDS = { 1: "greater than", "-1": "less than", 0: "unchanged from" };

  const moved = (stat, dir) => `The ${STAT_NAMES[stat]} is ${DIRECTION_WORDS[dir]} before.`;

  // Why each statistic moves as it does under each change, for the
  // rationale of a false statement about it.
  const WHY = {
    "raise-max": {
      mean: () => "the sum grows while the count stays the same, so the mean increases",
      median: () => "the corrected value is still the greatest, so the middle value does not move",
      range: () => "the greatest value sets the range, so the range increases",
      sd: () => "the greatest value moves farther from the others, so the spread increases",
    },
    "add-mean": {
      mean: () => "adding a value equal to the mean adds the mean to the sum and 1 to the count, so the mean is unchanged",
      median: (list) => `the mean (${about(mean(list))}) is not the median (${num(median(list))}), so the added value shifts the middle toward the mean`,
      range: () => "the least and greatest values do not change, so neither does the range",
      sd: () => "the new value has no deviation, but the same squared deviations are now shared by one more value, so the standard deviation decreases",
    },
    "drop-min": {
      mean: () => "removing the least value raises the mean",
      median: () => "removing a value below the middle shifts the middle position up",
      range: () => "the removed value set the range, so the range decreases",
      sd: () => "the value farthest from the mean is gone, so the spread decreases",
    },
    shift: {
      mean: () => "every value rises by the same amount, so the mean rises by that amount",
      median: () => "the middle value rises by the same amount as every other value",
      range: () => "the least and greatest values rise by the same amount, so their difference is unchanged",
      sd: () => "every distance from the mean is unchanged, so the standard deviation is unchanged",
    },
  };

  const KEY_STAT = { "raise-max": "median", "add-mean": "sd", "drop-min": "median", shift: "range" };

  const wordCount = (stat) => STAT_NAMES[stat].split(" ").length;

  function statsWhichTrue(t, kinds) {
    const ctx = t.pick(LISTS);
    const kind = t.pick(kinds);
    return retry(() => {
      const n = t.pick([7, 8, 9, 10, 11]);
      const floor = kind === "drop-min" ? Math.round((ctx.low + ctx.high) / 2) - 6 : ctx.low;
      const pool = t.sample(range(floor, ctx.high), n - (kind === "drop-min" ? 1 : 0));
      if (kind === "drop-min") {
        const low = Math.min(...pool) - t.int(15, 30);
        if (low < 1) return null;
        pool.push(low);
      }
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
      } else if (kind === "drop-min") {
        event = { kind };
        text = `The least value in the list, ${Math.min(...list)}, was entered by mistake and is removed.`;
      } else {
        const shift = t.int(2, 9);
        event = { kind, shift };
        text = `Each value in the list is increased by ${shift}.`;
      }
      const after = applyEvent(list, event);
      const dirs = statDirections(list, after);
      if (dirs.sd !== dirs.sdSample) return null;
      // The choices are a 2 x 2 grid: two statistics crossed with two
      // directions, exactly one cell true.
      // Usually the statistic the change is known for, sometimes another,
      // so no statement is always the key.
      const keyStat = t.chance(kind === "shift" ? 0.75 : 0.35)
        ? t.pick(["mean", "median", "range", "sd"].filter((stat) => stat !== KEY_STAT[kind]))
        : KEY_STAT[kind];
      const keyDir = dirs[keyStat];
      const others = ["mean", "median", "range", "sd"].filter((stat) => stat !== keyStat && dirs[stat] !== keyDir);
      if (!others.length) return null;
      const matched = others.filter((stat) => wordCount(stat) === wordCount(keyStat));
      const otherStat = t.pick(matched.length && t.chance(0.8) ? matched : others);
      const otherDir = [1, -1, 0].find((dir) => dir !== keyDir && dir !== dirs[otherStat]);
      const rows = t.shuffle([keyStat, otherStat]);
      const cols = t.shuffle([keyDir, otherDir]);
      const why = (stat) => WHY[kind][stat](list);
      const grid = statementGrid((i, j) => {
        const stat = rows[i];
        const dir = cols[j];
        const truth = dirs[stat] === dir;
        return [moved(stat, dir), `Claims the ${STAT_NAMES[stat]} is ${DIRECTION_WORDS[dir]} before, but ${why(stat)}.`, truth];
      });
      if (!grid) return null;
      const key = grid.correct;
      const wrong = grid.wrong;
      const shownList = t.chance(0.5) ? list.slice().sort((a, b) => a - b) : t.shuffle(list);
      const content = shownList.join(", ");
      return finish(false, {
        stimulus: { type: "text", content },
        stem: `${ctx.intro(n)} ${text} Which of the following statements about the data after this change is true?`,
        correct: key,
        wrong,
        explanation:
          `Before: mean ${about(mean(list))}, median ${num(median(list))}, range ${spread(list)}. After: mean ` +
          `${about(mean(after))}, median ${num(median(after))}, range ${num(spread(after))}. The standard deviation ` +
          `${dirs.sd > 0 ? "increased" : dirs.sd < 0 ? "decreased" : "did not change"}. Only "${key}" is true: ${why(keyStat)}.`,
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
          const holds = (statement) => ["mean", "median", "range", "sd"].some((stat) => [1, -1, 0].some((dir) =>
            statement === moved(stat, dir) && check[stat] === dir));
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
      // A 2 x 2 grid of claims, {standard deviation, mean value} x {A, B},
      // so the key is not the one choice the others vary around. The means
      // are equal (both sets are symmetric about the same value).
      const grid = statementGrid((i, j) => {
        const stat = ["standard deviation", "mean value"][i];
        const name = [A, B][j];
        if (i === 0) {
          return name === bigger
            ? [`The data for ${name} have the greater ${stat}.`, "", true]
            : [`The data for ${name} have the greater ${stat}.`, `Compares the frequency columns as if they were the data: the counts for ${smaller} vary more, but the counts are not the values.`, false];
        }
        return [`The data for ${name} have the greater ${stat}.`,
          `Both data sets are symmetric about ${values[2]}, so their means are equal; the difference between them is in spread, not center.`, false];
      });
      const key = grid.correct;
      const wrong = grid.wrong;
      const rows = values.map((value, index) => [value, first[index], second[index]]);
      const edge = bigger === A ? first : second;
      return finish(false, {
        stimulus: { type: "table", content: table([ctx.header, `${A} frequency`, `${B} frequency`], rows) },
        stem: `The table summarizes ${ctx.subject}. Which of the following statements about the two data sets is true?`,
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
    // Each scenario is a 2 x 2 grid {two statistics} x {two directions}:
    // one cell holds for every allowed data set, at least one other can hold
    // for some (the must-versus-could trap), and the rest never hold.
    const tests = {
      mean: (b, a) => direction(mean(b), mean(a)),
      median: (b, a) => direction(median(b), median(a)),
      sd: (b, a) => direction(stdev(b, false), stdev(a, false)),
    };
    let event;
    let apply;
    let rows;
    let cols;
    let why;
    if (scenario === 0) {
      event = "One more value, equal to the mean of the original values, is added to the data set.";
      apply = (set) => set.concat([mean(set)]);
      rows = ["mean", "median"];
      cols = [0, 1];
      why = {
        mean: "adding a value equal to the mean adds the mean to the sum and 1 to the count, so the mean never changes",
        median: "the median moves toward the mean unless the two are equal, so it can stay the same or move, depending on the data",
      };
    } else if (scenario === 1) {
      event = "The least value in the data set is removed.";
      apply = (set) => set.filter((value) => value !== Math.min(...set));
      rows = ["mean", "sd"];
      cols = [1, -1];
      why = {
        mean: "the removed value is below the mean (it is the least of different values), so the mean always increases",
        sd: "the spread usually shrinks, but if a far outlier remains at the top, removing the least value can widen it",
      };
    } else {
      event = "One more value, equal to the median of the original values, is added to the data set.";
      apply = (set) => set.concat([median(set)]);
      rows = ["median", "mean"];
      cols = [0, 1];
      why = {
        median: "a new value at the median keeps the middle of the data at that value, so the median never changes",
        mean: "the mean moves toward the median, up or down depending on which side of the median it starts",
      };
    }
    const mustRow = rows[0];
    const mustDir = scenario === 1 ? 1 : 0;
    const sets = randomSets(`${scenario}|${n}`, n);
    const low = Math.floor(n / 2);
    sets.push(range(1, n));
    sets.push(range(1, n - 1).concat([1000]));
    sets.push(range(1, low).concat(range(1000, 1000 + n - low - 1)));
    sets.push([1, 2, 3, 4, 400].concat(range(401, 400 + n - 5)));
    sets.push([1].concat(range(50, 48 + n - 1)).concat([5000]));
    const pairs = sets.filter((set) => set.length === n && new Set(set).size === n).map((set) => [set, apply(set)]);
    const status = (stat, dir) => {
      const hits = pairs.filter(([b, a]) => tests[stat](b, a) === dir).length;
      return hits === pairs.length ? "must" : hits ? "could" : "never";
    };
    const statement = (stat, dir) => moved(stat, dir).replace("before", "in the original data set");
    const grid = statementGrid((i, j) => {
      const stat = rows[i];
      const dir = cols[j];
      const kind = status(stat, dir);
      const reason = kind === "could"
        ? `This can happen for some data sets but not all: ${why[stat]}.`
        : `This never happens: ${why[stat]}.`;
      return [statement(stat, dir), reason, kind === "must"];
    });
    const key = statement(mustRow, mustDir);
    if (!grid || grid.correct !== key) throw new Error("must-be-true grid is not well formed");
    const couldText = grid.wrong.find(([, reason]) => reason.startsWith("This can happen"));
    return finish(false, {
      stimulus: null,
      stem: `A data set consists of ${n} different positive integers. ${event} Which of the following statements must be true about the new data set?`,
      correct: key,
      wrong: grid.wrong,
      explanation: `${cap1(why[mustRow])}. ${couldText ? `By contrast, "${couldText[0]}" holds only for some data sets.` : ""}`.trim(),
      steps: [
        "Decide what each statistic depends on: every value (mean, standard deviation) or the middle position (median).",
        "Test each statement against the change for every possible data set, not one convenient example.",
        "A statement that fails for even one allowed data set does not have to be true.",
        `Only "${key}" holds for every data set.`,
      ],
      principles: [
        "\"Must be true\" requires the statement to hold for every data set that fits the description.",
        "The mean changes whenever the sum changes relative to the count; the median changes only when the middle position's value changes.",
      ],
      trap: couldText
        ? `"${couldText[0]}" can be true, which makes it tempting, but a single counterexample rules it out.`
        : "A statement that holds for one example data set need not hold for all of them.",
      hint: "For each statement, try to build a data set that fits the description but makes the statement false.",
      verify: () => {
        // Fresh data sets, drawn independently of the build's.
        const fresh = randomSets(`verify|${scenario}|${n}`, n)
          .filter((set) => new Set(set).size === n).map((set) => [set, apply(set)]);
        const always = fresh.every(([b, a]) => tests[mustRow](b, a) === mustDir);
        const others = grid.wrong.map(([text]) => {
          const cell = rows.flatMap((stat) => cols.map((dir) => [stat, dir])).find(([stat, dir]) => statement(stat, dir) === text);
          return cell && pairs.some(([b, a]) => tests[cell[0]](b, a) !== cell[1]);
        });
        return always && others.every(Boolean);
      },
    });
  }

  const cap1 = (text) => text.charAt(0).toUpperCase() + text.slice(1);

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
        const upperMiddle = n % 2 ? null : valueAt(n / 2 + 1);
        const candidates = askMean
          ? [
            [tidy(unweighted), `Averages the ${width} listed values without weighting each by how often it occurs.`],
            [tidy(total / width), `Divides the total, ${total}, by the ${width} different values instead of by the ${n} data values.`],
            [median, "Gives the median instead of the mean."],
            [tidy(n / width), "Averages the frequencies instead of the data values."],
            [total, `Stops at the total, ${total}, without dividing by the number of values.`],
            [tidy(total / (n - 1)), `Divides the total by ${n - 1} instead of by the ${n} data values.`],
            [n, `Gives the number of data values, ${n}, instead of their mean.`],
            [tidy(total / (n + 1)), `Divides the total by ${n + 1} instead of by the ${n} data values.`],
            [mode === null ? NaN : mode, "Gives the value that occurs most often (the mode) instead of the mean."],
          ]
          : [
            [listedMiddle, "Takes the middle of the listed values, ignoring how many times each occurs."],
            [mode === null ? NaN : mode, "Gives the value that occurs most often (the mode), not the middle value."],
            [mean, "Gives the mean instead of the median."],
            [lowerMiddle === null ? NaN : lowerMiddle, `Takes value number ${n / 2} alone; with ${n} values the median is the average of values ${n / 2} and ${n / 2 + 1}.`],
            [upperMiddle === null ? NaN : upperMiddle, `Takes value number ${n / 2 + 1} alone; with ${n} values the median is the average of values ${n / 2} and ${n / 2 + 1}.`],
            [asPlot ? NaN : medianOf(freqs), "Finds the median of the frequency column instead of the data."],
            [n % 2 ? valueAt((n + 1) / 2 + 1) : NaN, `Counts to value number ${(n + 1) / 2 + 1}, one past the middle of the ${n} values.`],
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
        return packRanked(t, numeric, tidy(key), candidates, {
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
        }, { positive: false });
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
    difficulty: "Hard",
    title: "How a data change moves each statistic",
    recognize:
      "Each statistic depends on something different: the mean and standard deviation on every value, the median on the " +
      "middle position, the range on the extremes, and a frequency table's data on its values repeated by their counts.",
    // Hard: the student must decide, for a change described in words, which
    // statistic must move and which only could; no computation settles it.
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["must-vs-could", "part-vs-whole", "neighbouring-rule", "wrong-quantity"],
    build(t) {
      const form = t.int(0, 2);
      if (form === 0) return { estimatedSeconds: 110, ...statsWhichTrue(t, ["raise-max", "add-mean", "drop-min"]) };
      if (form === 1) return { estimatedSeconds: 95, ...statsCompareSpread(t) };
      return { estimatedSeconds: 100, ...statsMustBeTrue(t) };
    },
  };

  const dataChangeMedian = {
    id: "data-change-median",
    domain: DATA,
    skill: "One-variable data",
    subskill: "distributions",
    difficulty: "Medium",
    title: "The center and spread after a change to the data",
    recognize:
      "Rebuild the data after the change: a frequency table's data are its values repeated by their counts, so recount " +
      "and find the new middle position; adding a constant to every value moves the center but not the spread.",
    // Medium: the change is stated exactly and the new statistic can be
    // found directly; the trap is using the frequency column as the data.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["part-vs-whole", "neighbouring-rule"],
    build(t) {
      if (t.chance(0.65)) return { estimatedSeconds: 100, ...statsNewMedian(t, t.chance(0.5)) };
      return { estimatedSeconds: 90, ...statsWhichTrue(t, ["shift"]) };
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
        const middle = Math.floor(n / 2);
        const candidates = askMedian
          ? [
            [listed, `Takes the middle of the values in the order ${inTable ? "the table lists them" : "they are listed"}, without first putting them in order.`],
            [avg, "Gives the mean of the data instead of the median."],
            [n % 2 ? NaN : sorted[n / 2 - 1], `Uses only one of the two middle values, ${sorted[n / 2 - 1]}, instead of their average.`],
            [mid, "Averages the least and greatest values instead of finding the middle value."],
            [n % 2 ? NaN : sorted[n / 2], `Uses only one of the two middle values, ${sorted[n / 2]}, instead of their average.`],
            [n % 2 ? sorted[middle - 1] : NaN, `Counts to value number ${middle}, one short of the middle of ${n} values.`],
            [n % 2 ? sorted[middle + 1] : NaN, `Counts to value number ${middle + 2}, one past the middle of ${n} values.`],
          ]
          : [
            [total, `Stops at the sum of the values, ${fmt(total)}, without dividing by ${n}.`],
            [med, "Gives the median of the data instead of the mean."],
            [tidy(total / (n - 1)), `Divides the sum by ${n - 1} instead of by the ${n} values.`],
            [mid, "Averages only the least and greatest values."],
            [tidy(total / (n + 1)), `Divides the sum by ${n + 1} instead of by the ${n} values.`],
            [listed, `Takes the middle value of the ${inTable ? "table" : "list"} as written instead of computing the mean.`],
          ];
        return packRanked(t, numeric, key, candidates, {
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
        }, { places: 2 });
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
    { title: "Price (dollars)", about: "the prices, in dollars, of the backpacks sold at a store", starts: [10, 20], steps: [2, 4, 5], max: 90 },
    { title: "Time (seconds)", about: "the times, in seconds, that the runners on a track team took to run 400 meters", starts: [50, 55, 60], steps: [1, 2], max: 90 },
    { title: "Rainfall (millimeters)", about: "the monthly rainfall totals, in millimeters, for a city over several years", starts: [0, 10], steps: [5, 10], max: 160 },
    { title: "Mass (grams)", about: "the masses, in grams, of the apples picked from one tree", starts: [100, 120], steps: [5, 10], max: 260 },
  ];

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
            [q1, "Reads the left edge of the box, the first quartile, instead of the line inside the box."],
            [q3, "Reads the right edge of the box, the third quartile, instead of the line inside the box."],
            [tidy((q1 + q3) / 2), "Takes the center of the box; the median is marked by the line inside the box, which need not be centered."],
            [tidy((low + high) / 2), "Takes the value halfway between the least and greatest values."],
            [low, "Reads the end of the left whisker, the least value, instead of the line inside the box."],
            [high, "Reads the end of the right whisker, the greatest value, instead of the line inside the box."],
          ]
          : ask === "iqr"
            ? [
              [spreadAll, "Gives the range, from the least to the greatest value, instead of the width of the box."],
              [q3 - med, "Measures only from the median to the third quartile, half of the box."],
              [med - q1, "Measures only from the first quartile to the median, half of the box."],
              [q3, "Gives the third quartile itself instead of the distance across the box."],
              [high - q3, "Measures the right whisker instead of the box."],
              [q3 - low, "Measures from the least value to the third quartile instead of across the box."],
            ]
            : [
              [iqr, "Gives the interquartile range, the width of the box, instead of the distance between the whisker ends."],
              [high, "Gives the greatest value instead of the difference between the greatest and least values."],
              [high - med, "Measures from the median to the greatest value instead of from the least value."],
              [high - q1, "Measures from the left edge of the box instead of from the least value."],
              [high + low, "Adds the least and greatest values instead of subtracting."],
              [q3 - low, "Measures from the least value to the right edge of the box instead of to the greatest value."],
            ];
        const alt =
          `Box plot titled ${ctx.title} on a number line from ${ticks[0]} to ${ticks[count - 1]} marked every ${step}. ` +
          `The left whisker starts at ${low}, the box runs from ${q1} to ${q3} with a line at ${med}, and the right whisker ends at ${high}.`;
        const figure = boxPlot(five, ticks, ctx.title, alt);
        const statName = ask === "median" ? "median" : ask === "iqr" ? "interquartile range" : "range";
        return packRanked(t, numeric, key, candidates, {
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
        }, { places: 1 });
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
    difficulty: "Easy",
    title: "A missing value from the mean",
    recognize:
      "The mean fixes the sum: the values must add up to the mean times the number of values, so the unknown is that total " +
      "minus the known values (divided by how many times the unknown appears).",
    // Easy: one relation (sum = mean × count) applied once.
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
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
            [2 * x, `Stops at ${fmt(total)} ${MINUS} ${fmt(knownSum)} = ${fmt(2 * x)}, the sum of the two values equal to x.`],
            [total, `Stops at the total of all ${n} values, ${n} × ${M} = ${fmt(total)}.`],
            [M, `Assumes x equals the mean, ${M}.`],
            [knownMean, `Gives the mean of the ${n - 2} known values.`],
            [tidy((total - knownSum) / n), `Divides ${fmt(total)} ${MINUS} ${fmt(knownSum)} by ${n}, the number of values, instead of by 2.`],
          ]
          : [
            [total, `Stops at the total of all ${n} values, ${n} × ${fmt(M)} = ${fmt(total)}.`],
            [short, `Multiplies the mean by ${n - 1}, the number of known values, instead of by ${n}.`],
            [M, `Assumes the missing value equals the mean, ${fmt(M)}.`],
            [knownMean, `Gives the mean of the ${n - 1} known values.`],
            [tidy(2 * M - knownMean), `Balances x against the mean of the known values, ${num(knownMean)}, as if the known values were one value: 2(${fmt(M)}) ${MINUS} ${num(knownMean)}.`],
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
        return packRanked(t, numeric, x, candidates, {
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
        }, { places: 2 });
      });
    },
  };

  /* ============================================= could-be-median (Hard) */

  // A data set with one unknown value x. However large or small x is, it can
  // move the middle of the ordered data by at most one position, so the
  // median is trapped between two known values (or their half-way points).
  const UNKNOWN_LISTS = [
    { intro: (n) => `The list gives the numbers of emails a manager received on each of ${n} days, where x is the number received on one of the days.`, low: 8, high: 60, whole: true },
    { intro: (n) => `The list gives the ages, in years, of the ${n} members of a hiking club, where x is the age of one member.`, low: 18, high: 70, whole: true },
    { intro: (n) => `The list gives the numbers of points a team scored in each of ${n} games, where x is the number scored in one game.`, low: 40, high: 110, whole: true },
    { intro: (n) => `The list gives the numbers of pages in ${n} books on a shelf, where x is the number of pages in one book.`, low: 120, high: 480, whole: true },
    { intro: (n) => `The list gives the numbers of students in ${n} classes at a school, where x is the number of students in one class.`, low: 14, high: 34, whole: true },
  ];

  // Every median the data can have as x runs over whole numbers from lo to hi.
  function achievableMedians(known, lo, hi) {
    const found = new Set();
    for (let x = lo; x <= hi; x += 1) found.add(tidy(median(known.concat([x]))));
    return found;
  }

  const couldBeMedian = {
    id: "could-be-median",
    domain: DOMAIN,
    skill: "One-variable data",
    subskill: "mean and median",
    difficulty: "Hard",
    title: "Which medians an unknown value allows",
    recognize:
      "Order the known values and find which positions the middle can occupy: x can shift the middle by at most one place, " +
      "so the median lies between two neighbouring known values (or, for an even count, between their half-way points).",
    // Hard: nothing can be computed until the student sees that x can only
    // slide the middle between two neighbours; the median of the known
    // values alone, and values one place off, are offered.
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 2, synthesis: 0, trap: 1 },
    tricks: ["must-vs-could", "wrong-quantity", "intermediate-value"],
    build(t) {
      const ctx = t.pick(UNKNOWN_LISTS);
      const form = t.pick(["could", "could", "extreme", "which-x"]);
      const numeric = form === "extreme" && t.chance(0.7);
      return retry(() => {
        const total = t.int(7, 12);
        const known = t.sample(range(ctx.low, ctx.high), total - 1).sort((a, b) => a - b);
        // x is a whole number in the context's range, as the list implies.
        const lo = 1;
        const hi = ctx.high * 3;
        const medians = achievableMedians(known, lo, hi);
        const least = Math.min(...medians);
        const greatest = Math.max(...medians);
        if (greatest - least < 2) return null;
        const inside = [...medians].filter((value) => value > least && value < greatest);
        const k = (i) => known[i - 1];
        const odd = total % 2 === 1;
        const m = Math.floor(total / 2);
        const listText = t.shuffle(known.map(String).concat(["x"])).join(", ");
        const stimulus = { type: "text", content: listText };
        const bounds = odd
          ? `With ${total} values the median is value number ${m + 1} in order. Among the ${total - 1} known values, numbers ${m} and ${m + 1} are ${k(m)} and ${k(m + 1)}; if x is ${k(m)} or less the median is ${k(m)}, if x is ${k(m + 1)} or more it is ${k(m + 1)}, and in between it is x itself.`
          : `With ${total} values the median is the average of values ${m} and ${m + 1} in order. If x is ${k(m - 1)} or less the median is (${k(m - 1)} + ${k(m)})/2 = ${num(least)}; if x is ${k(m + 1)} or more it is (${k(m)} + ${k(m + 1)})/2 = ${num(greatest)}; in between it is (x + ${k(m)})/2.`;
        const principles = [
          "One value can move the middle of ordered data by at most one position, so it can move the median only between the neighbouring values.",
          "The median of an odd number of values is one of the values; of an even number, the average of the two middle values.",
        ];
        const hint = "Try x very small and x very large. What is the median in each case?";
        const outside = [
          [odd ? k(m - 1) : tidy((k(m - 1) + k(m - 2)) / 2), `Could be the median only if x moved the middle down two places; even with x as small as possible the median is ${num(least)}.`],
          [odd ? k(m + 2) : tidy((k(m + 1) + k(m + 2)) / 2), `Could be the median only if x moved the middle up two places; even with x as large as possible the median is ${num(greatest)}.`],
          [k(1), "Treats x as able to move the median anywhere; x shifts the middle by at most one position."],
          [k(total - 1), "Treats x as able to move the median anywhere; x shifts the middle by at most one position."],
          [odd && (k(m) + k(m + 1)) % 2 ? tidy((k(m) + k(m + 1)) / 2) : NaN,
            `Averages the two middle known values, as for an even count; with x there are ${total} values, so the median is one of the values, a whole number.`],
          [tidy(mean(known)), "Gives the mean of the known values, which need not be a possible median."],
        ].filter(([value]) => Number.isFinite(value) && !medians.has(tidy(value)));
        if (form === "could") {
          const key = t.pick(inside.length && t.chance(0.6) ? inside : [least, greatest]);
          return packRanked(t, false, key, outside, {
            stimulus,
            stem: `${ctx.intro(total)} Which of the following could be the median of the ${total} values?`,
            explanation: `${bounds} So the median can be any of the values from ${num(least)} to ${num(greatest)} that x allows, and ${num(key)} is one of them.`,
            steps: [
              "Put the known values in order.",
              `Find the middle position${odd ? "" : "s"} of all ${total} values.`,
              `Try x very small: the median is ${num(least)}. Try x very large: the median is ${num(greatest)}.`,
              `The median can only be between those: ${num(key)} is possible.`,
            ],
            principles,
            trap: `x cannot move the middle past its neighbours, so values beyond ${num(least)} to ${num(greatest)} are impossible, however extreme x is.`,
            hint,
            estimatedSeconds: 120,
            verify: () => {
              const again = achievableMedians(listText.split(", ").filter((v) => v !== "x").map(parseNumber), lo, hi);
              return again.has(tidy(key)) && outside.every(([value]) => !again.has(tidy(value)));
            },
          }, { show: num, places: 1 });
        }
        if (form === "extreme") {
          const askMost = t.chance(0.5);
          const key = askMost ? greatest : least;
          return packRanked(t, numeric, key, [
            [askMost ? least : greatest, `Gives the ${askMost ? "least" : "greatest"} possible median instead of the ${askMost ? "greatest" : "least"}.`],
            [tidy(median(known)), `Gives the median of the ${total - 1} known values, leaving x out.`],
            [askMost ? k(total - 1) : k(1), `Assumes an extreme x makes the ${askMost ? "greatest" : "least"} known value the median; x moves the middle by only one place.`],
            [askMost ? (odd ? k(m + 2) : tidy((k(m + 1) + k(m + 2)) / 2)) : (odd ? k(m - 1) : tidy((k(m - 1) + k(m - 2)) / 2)),
              `Moves the middle two places instead of one.`],
            [tidy(mean(known)), "Gives the mean of the known values."],
          ], {
            stimulus,
            stem: `${ctx.intro(total)} What is the ${askMost ? "greatest" : "least"} possible value of the median of the ${total} values?`,
            explanation: `${bounds} The ${askMost ? "greatest" : "least"} possible median is ${num(key)}.`,
            steps: [
              "Put the known values in order.",
              `Find the middle position${odd ? "" : "s"} of all ${total} values.`,
              `Make x as ${askMost ? "large" : "small"} as possible: it sits at the ${askMost ? "top" : "bottom"} of the list.`,
              `The median is then ${num(key)}.`,
            ],
            principles,
            trap: `x can push the middle only one place, so the ${askMost ? "greatest" : "least"} known value is not the answer.`,
            hint,
            estimatedSeconds: 110,
            verify: () => {
              const again = achievableMedians(listText.split(", ").filter((v) => v !== "x").map(parseNumber), lo, hi);
              return close((askMost ? Math.max : Math.min)(...again), key);
            },
          }, { show: num, places: 1 });
        }
        // Which x gives a stated median.
        const M = t.pick([least, greatest].concat(inside.filter((value) => Number.isInteger(value) || !odd)));
        const works = (x) => close(median(known.concat([x])), M);
        const options = range(Math.max(1, k(1) - 5), k(total - 1) + 5);
        const good = options.filter(works);
        const bad = options.filter((x) => !works(x));
        if (!good.length || bad.length < 3) return null;
        const key = t.pick(good);
        const nearBad = bad.filter((x) => Math.abs(x - key) <= Math.max(6, k(m + 1) - k(m)));
        const pool = t.shuffle(nearBad.length >= 3 ? nearBad : bad).slice(0, 8);
        const why = (x) => `If x = ${x}, the median of the ${total} values is ${num(tidy(median(known.concat([x]))))}, not ${num(M)}.`;
        return packRanked(t, false, key, pool.map((x) => [x, why(x)]), {
          stimulus,
          stem: `${ctx.intro(total)} The median of the ${total} values is ${num(M)}. Which of the following could be the value of x?`,
          explanation: `${bounds} A median of ${num(M)} ${good.length > 1 ? `needs x to be ${key <= M ? "at most" : "at least"} ${num(key <= M ? Math.max(...good) : Math.min(...good))}` : `needs x = ${num(key)}`}; of the choices, only ${num(key)} does that.`,
          steps: [
            "Put the known values in order and find the middle position.",
            `Work out what the median is when x is small, large, and in between.`,
            `A median of ${num(M)} happens only when ${good.length > 1 ? `x is ${key <= M ? "at most" : "at least"} ${num(key <= M ? Math.max(...good) : Math.min(...good))}` : `x = ${num(key)}`}.`,
            `Only ${num(key)} qualifies.`,
          ],
          principles,
          trap: `A value near ${num(M)} is not automatically a possible x; check where it lands in the ordered list.`,
          hint,
          estimatedSeconds: 120,
          verify: () => {
            const values = listText.split(", ").filter((v) => v !== "x").map(parseNumber);
            return close(median(values.concat([key])), M) && pool.every((x) => x === key || !close(median(values.concat([x])), M));
          },
        }, { show: num, places: 1 });
      });
    },
  };

  /* ===================================== histogram-class-intervals (Medium) */

  // A histogram of equal-width classes. The classes hold counts, not values,
  // so the median is located by counting up to the middle position, and "less
  // than" a boundary means every class entirely below it.
  // `atLeast(v)` and `under(v)` finish "How many of the <what> ...?".
  const HISTOGRAMS = [
    { title: "Time (minutes)", about: "the times, in minutes, that the runners in a race took to finish", starts: [20, 25, 30], widths: [5, 10], what: "runners",
      atLeast: (v) => `took at least ${v} minutes to finish`, under: (v) => `took less than ${v} minutes to finish` },
    { title: "Height (centimeters)", about: "the heights, in centimeters, of the plants in a garden plot", starts: [10, 20, 30], widths: [5, 10], what: "plants",
      atLeast: (v) => `were at least ${v} centimeters tall`, under: (v) => `were less than ${v} centimeters tall` },
    { title: "Score", about: "the scores of the students in a class on a 100-point exam", starts: [40, 50], widths: [10], what: "students",
      atLeast: (v) => `scored at least ${v} points`, under: (v) => `scored less than ${v} points` },
    { title: "Age (years)", about: "the ages, in years, of the people attending a concert", starts: [10, 15, 20], widths: [5, 10], what: "people",
      atLeast: (v) => `were at least ${v} years old`, under: (v) => `were younger than ${v} years old` },
    { title: "Rainfall (millimeters)", about: "the rainfall totals, in millimeters, recorded by the weather stations in a region one month", starts: [0], widths: [20, 25], what: "stations",
      atLeast: (v) => `recorded at least ${v} millimeters of rain`, under: (v) => `recorded less than ${v} millimeters of rain` },
    { title: "Price (dollars)", about: "the prices, in dollars, of the used cameras listed for sale on a website", starts: [0, 50], widths: [50, 100], what: "cameras",
      atLeast: (v) => `were priced at $${v} or more`, under: (v) => `were priced under $${v}` },
  ];

  const histogramIntervals = {
    id: "histogram-class-intervals",
    domain: DATA,
    skill: "One-variable data",
    subskill: "distributions",
    difficulty: "Medium",
    title: "Reading a histogram of class intervals",
    recognize:
      "Each bar counts the values in one class; add bar heights to count values below a boundary, and find the class that " +
      "holds the middle position (not the tallest bar or the middle class) for the median.",
    // Medium: counting through the bars to a position is a plan, and the
    // tallest bar and the middle class are both offered.
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "intermediate-value"],
    build(t) {
      const ctx = t.pick(HISTOGRAMS);
      const form = t.pick(["median", "median", "below", "percent"]);
      const numeric = form !== "median" && t.chance(0.5);
      return retry(() => {
        const width = t.pick(ctx.widths);
        const start = t.pick(ctx.starts);
        const classes = t.int(5, 6);
        const edges = range(0, classes).map((index) => start + index * width);
        const counts = edges.slice(1).map(() => t.int(1, 12));
        const total = sum(counts);
        if (total < 15 || total > 60) return null;
        const cumulative = counts.map((_, index) => sum(counts.slice(0, index + 1)));
        const classOf = (position) => cumulative.findIndex((reach) => position <= reach);
        const label = (index) => `${num(edges[index])} to ${num(edges[index + 1])}`;
        const alt =
          `Histogram titled ${ctx.title} with ${classes} bars over classes of width ${width} from ${edges[0]} to ${edges[classes]}. ` +
          `Bar heights, in order: ${counts.join(", ")}.`;
        const figure = histogram(edges, counts, ctx.title, alt);
        const readBack = () => readHistogram(figure.svg, classes);
        const intro = `The histogram summarizes ${ctx.about}. Each class includes its left endpoint but not its right endpoint.`;
        const principles = [
          "In a histogram each bar's height is the number of values in its class; the values themselves are not shown.",
          "The median is the value at the middle position of the ordered data, found by adding bar heights from the left.",
        ];
        if (form === "median") {
          // The two middle positions must fall in one class, so the class of
          // the median is certain.
          const low = classOf(Math.floor((total + 1) / 2));
          const high = classOf(Math.ceil((total + 1) / 2));
          if (low !== high) return null;
          const tallest = counts.indexOf(Math.max(...counts));
          const middleClass = Math.floor(classes / 2);
          if (counts.filter((count) => count === counts[tallest]).length > 1) return null;
          const inClass = (index) => edges[index] + t.int(1, width - 1);
          const key = inClass(low);
          const others = [
            [tallest, "Picks a value in the class with the tallest bar, which holds the most values (the mode class), not the middle one."],
            [middleClass, "Picks a value in the middle class of the histogram, ignoring how many values each class holds."],
            [classOf(Math.ceil(total / 4)), "Counts to a quarter of the way through the data instead of halfway."],
            [classOf(Math.ceil((3 * total) / 4)), "Counts to three-quarters of the way through the data instead of halfway."],
            [low > 0 ? low - 1 : low + 1, `Picks the class next to the one that holds position ${Math.ceil((total + 1) / 2)}.`],
            [low < classes - 1 ? low + 1 : low - 1, `Picks the class next to the one that holds position ${Math.ceil((total + 1) / 2)}.`],
          ].filter(([index]) => index !== low);
          // One value from each tempting class, then a second value from
          // every other class, so wrong values can lie on either side.
          const seen = new Set();
          const candidates = [];
          others.forEach(([index, reason]) => {
            if (seen.has(index)) return;
            seen.add(index);
            candidates.push([inClass(index), reason]);
          });
          range(0, classes - 1).filter((index) => index !== low).forEach((index) => {
            candidates.push([inClass(index), `Lies in the class from ${label(index)}, but the running count reaches the middle position in the class from ${label(low)}.`]);
          });
          return packRanked(t, false, key, candidates, {
            stimulus: null,
            figure,
            stem: `${intro} Which of the following could be the median of the data?`,
            explanation:
              `There are ${counts.join(" + ")} = ${total} values, so the median is value number ${total % 2 ? (total + 1) / 2 : `${total / 2} and ${total / 2 + 1}`} in order. ` +
              `Adding bar heights from the left, the running totals are ${cumulative.join(", ")}, so the median falls in the class from ${label(low)}. ` +
              `Only ${num(key)} is in that class.`,
            steps: [
              `Total count: ${counts.join(" + ")} = ${total}.`,
              `Middle position: ${total % 2 ? (total + 1) / 2 : `${total / 2} and ${total / 2 + 1}`}.`,
              `Running totals: ${cumulative.join(", ")}; the middle falls in the class ${label(low)}.`,
              `The only choice in that class is ${num(key)}.`,
            ],
            principles,
            trap: "The tallest bar and the middle class are both tempting, but the median sits where the running count reaches the middle position.",
            hint: "How many values are there, and which one is in the middle?",
            estimatedSeconds: 100,
            verify: () => {
              const read = readBack();
              if (!read) return false;
              // Rebuild one data set the histogram could describe and take its median's class.
              const data = read.flatMap((count, index) => Array(count).fill(edges[index] + width / 2));
              const cls = edges.findIndex((edge, index) => index < classes && median(data) >= edge && median(data) < edges[index + 1]);
              return cls === low && key >= edges[low] && key < edges[low + 1] &&
                candidates.every(([value]) => !(value >= edges[low] && value < edges[low + 1]));
            },
          }, { show: num, places: 0 });
        }
        const cut = t.int(1, classes - 1);
        const below = cumulative[cut - 1];
        if (form === "below") {
          const atLeast = t.chance(0.5);
          const key = atLeast ? total - below : below;
          return packRanked(t, numeric, key, [
            [counts[atLeast ? cut : cut - 1], `Counts only the class ${atLeast ? "starting at" : "just below"} ${num(edges[cut])}, not every class ${atLeast ? "at or above" : "below"} it.`],
            [atLeast ? below : total - below, `Counts the values ${atLeast ? "below" : "at or above"} ${num(edges[cut])} instead.`],
            [atLeast ? total - below + counts[cut - 1] : below + counts[cut], `Includes the class on the other side of ${num(edges[cut])} as well.`],
            [total, "Gives the total number of values."],
            [cut, `Counts the classes ${atLeast ? "at or above" : "below"} ${num(edges[cut])} instead of the values in them.`],
          ], {
            stimulus: null,
            figure,
            stem: `${intro} How many of the ${ctx.what} ${atLeast ? ctx.atLeast(num(edges[cut])) : ctx.under(num(edges[cut]))}?`,
            explanation:
              `The classes ${atLeast ? "at or above" : "below"} ${num(edges[cut])} hold ${(atLeast ? counts.slice(cut) : counts.slice(0, cut)).join(" + ")} = ${key} values.`,
            steps: [
              `Find the boundary ${num(edges[cut])} on the horizontal axis.`,
              `Add the heights of the bars ${atLeast ? "to its right" : "to its left"}: ${(atLeast ? counts.slice(cut) : counts.slice(0, cut)).join(" + ")} = ${key}.`,
            ],
            principles,
            trap: `Only whole classes lie ${atLeast ? "at or above" : "below"} ${num(edges[cut])}; stopping at one bar undercounts.`,
            hint: `Which bars are entirely ${atLeast ? "at or above" : "below"} ${num(edges[cut])}?`,
            estimatedSeconds: 80,
            verify: () => {
              const read = readBack();
              if (!read) return false;
              const count = sum(read.filter((_, index) => (atLeast ? edges[index] >= edges[cut] : edges[index + 1] <= edges[cut])));
              return count === key;
            },
          }, { show: num, places: 0 });
        }
        // Percent of the values below a boundary.
        const key = tidy((100 * below) / total);
        if (!isClean(key, 1)) return null;
        const pct = (value) => (numeric ? fmt(value) : `${num(value)}%`);
        return packRanked(t, numeric, key, [
          [below, `Gives the number of values, ${below}, instead of the percent.`],
          [tidy(100 - key), `Gives the percent at or above ${num(edges[cut])} instead.`],
          [tidy((100 * counts[cut - 1]) / total), `Uses only the class just below ${num(edges[cut])}.`],
          [tidy((100 * cut) / classes), `Uses the fraction of the classes, ${cut} of ${classes}, instead of the fraction of the values.`],
          [tidy((100 * (below + counts[cut])) / total), `Includes the class starting at ${num(edges[cut])}.`],
        ], {
          stimulus: null,
          figure,
          stem: numeric
            ? `${intro} If p% of the ${ctx.what} ${ctx.under(num(edges[cut]))}, what is the value of p?`
            : `${intro} What percent of the ${ctx.what} ${ctx.under(num(edges[cut]))}?`,
          explanation:
            `The classes below ${num(edges[cut])} hold ${counts.slice(0, cut).join(" + ")} = ${below} of the ${total} values, and ${below}/${total} = ${num(key / 100)}, or ${num(key)}%.`,
          steps: [
            `Count the values below ${num(edges[cut])}: ${counts.slice(0, cut).join(" + ")} = ${below}.`,
            `Count all the values: ${total}.`,
            `Percent: ${below} ÷ ${total} × 100 = ${num(key)}.`,
          ],
          principles,
          trap: "The percent is a share of the values, so count bar heights, not bars.",
          hint: `What fraction of all the values lie below ${num(edges[cut])}?`,
          estimatedSeconds: 90,
          verify: () => {
            const read = readBack();
            return Boolean(read) && close((100 * sum(read.slice(0, cut))) / sum(read), key);
          },
        }, { show: pct, places: 1 });
      });
    },
  };

  /* ======================================== compare-spread-plots (Medium) */

  // Two groups drawn over one scale. The choices cross two statistics with
  // the two groups (a 2 x 2 grid): one statistic differs and the other is
  // equal, so exactly one statement is true.
  // `about(a, b)` names the two groups' sizes, which the plots do not show.
  const BOX_PAIRS = [
    { title: "Points scored", names: ["Team A", "Team B"], about: (a, b) => `the numbers of points Team A scored in each of its ${a} games and Team B scored in each of its ${b} games last season`, start: [40, 50], step: [2, 5] },
    { title: "Commute time (minutes)", names: ["Town P", "Town Q"], about: (a, b) => `the commute times, in minutes, of ${a} workers surveyed in Town P and ${b} workers surveyed in Town Q`, start: [0, 5], step: [5] },
    { title: "Height (centimeters)", names: ["Plot 1", "Plot 2"], about: (a, b) => `the heights, in centimeters, of the ${a} sunflowers in Plot 1 and the ${b} sunflowers in Plot 2 of a garden`, start: [100, 120], step: [5, 10] },
    { title: "Test score", names: ["Class A", "Class B"], about: (a, b) => `the scores of the ${a} students in Class A and the ${b} students in Class B on the same test`, start: [40, 50], step: [5] },
  ];

  const DOT_PAIRS = [
    { title: "Number of books", names: ["Group A", "Group B"], about: (a, b) => `the numbers of books read over the summer by the ${a} students in Group A and the ${b} students in Group B`, values: [0, 6] },
    { title: "Hours of practice", names: ["Band", "Choir"], about: (a, b) => `the numbers of hours that the ${a} members of a band and the ${b} members of a choir practiced last week`, values: [1, 7] },
    { title: "Goals scored", names: ["Team X", "Team Y"], about: (a, b) => `the numbers of goals Team X scored in each of its ${a} games and Team Y scored in each of its ${b} games`, values: [0, 6] },
    { title: "Quiz score", names: ["Section 1", "Section 2"], about: (a, b) => `the scores of the ${a} students in Section 1 and the ${b} students in Section 2 of a course on a 10-point quiz`, values: [4, 10] },
  ];

  const BOX_STATS = {
    median: (five) => five[2],
    range: (five) => five[4] - five[0],
    iqr: (five) => five[3] - five[1],
  };

  const DOT_STATS = { median, range: spread, mean };

  const STAT_WORDS = { median: "median", range: "range", iqr: "interquartile range", mean: "mean" };

  const compareSpreadPlots = {
    id: "compare-spread-plots",
    domain: DATA,
    skill: "One-variable data",
    subskill: "spread",
    difficulty: "Medium",
    title: "Comparing two distributions from their plots",
    recognize:
      "Read each statistic from its own feature: the median from the line in the box (or the middle dot), the range from the " +
      "whisker ends (or the end dots), the interquartile range from the width of the box. A longer whisker is not a wider box.",
    // Medium: two displays must be read and compared, and a near miss (the
    // longer whiskers, the taller stack) points at the wrong statistic.
    rubric: { steps: 1, concept: 1, interpretation: 2, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "wrong-quantity"],
    build(t) {
      const boxes = t.chance(0.6);
      const ctx = boxes ? t.pick(BOX_PAIRS) : t.pick(DOT_PAIRS);
      // Half the items ask how much one statistic differs, with the
      // neighbouring statistics' differences offered.
      const howMuch = t.chance(0.5);
      const numeric = howMuch && t.chance(0.3);
      return retry(() => {
        let figure;
        let stats;
        let readBack;
        let names = ctx.names;
        let statKeys;
        let ends;
        let sizes;
        let quartileGaps = [];
        if (boxes) {
          const start = t.pick(ctx.start);
          const step = t.pick(ctx.step);
          const ticks = range(0, 12).map((index) => start + index * step);
          const five = () => t.sample(range(0, 12), 5).sort((a, b) => a - b).map((index) => ticks[index]);
          const A = five();
          const B = five();
          statKeys = ["median", "range", "iqr"];
          stats = statKeys.map((stat) => [BOX_STATS[stat](A), BOX_STATS[stat](B)]);
          const alt =
            `Two box plots titled ${ctx.title} on a shared number line from ${ticks[0]} to ${ticks[12]}. ` +
            `${names[0]}: least ${A[0]}, first quartile ${A[1]}, median ${A[2]}, third quartile ${A[3]}, greatest ${A[4]}. ` +
            `${names[1]}: least ${B[0]}, first quartile ${B[1]}, median ${B[2]}, third quartile ${B[3]}, greatest ${B[4]}.`;
          figure = stackedBoxPlots([{ name: names[0], five: A }, { name: names[1], five: B }], ticks, ctx.title, alt);
          ends = [[A[0], A[4]], [B[0], B[4]]];
          sizes = [t.int(12, 40), t.int(12, 40)];
          quartileGaps = [
            [Math.abs(A[1] - B[1]), "Compares only the first quartiles, the left edges of the boxes."],
            [Math.abs(A[3] - B[3]), "Compares only the third quartiles, the right edges of the boxes."],
          ];
          readBack = () => {
            const read = readStackedBoxPlots(figure.svg, 2);
            return read && read.every(Boolean) ? statKeys.map((stat) => [BOX_STATS[stat](read[0]), BOX_STATS[stat](read[1])]) : null;
          };
        } else {
          const values = range(ctx.values[0], ctx.values[1]);
          const draw = () => values.map(() => t.int(0, 4));
          const fa = draw();
          const fb = draw();
          if (sum(fa) < 6 || sum(fb) < 6 || sum(fa) > 16 || sum(fb) > 16) return null;
          const A = expand(values, fa);
          const B = expand(values, fb);
          statKeys = ["median", "range", "mean"];
          stats = statKeys.map((stat) => [tidy(DOT_STATS[stat](A)), tidy(DOT_STATS[stat](B))]);
          const alt =
            `Two dot plots titled ${ctx.title} over the values ${values[0]} to ${values[values.length - 1]}. ` +
            `${names[0]}, dots per value: ${values.map((v, i) => `${v}: ${fa[i]}`).join("; ")}. ` +
            `${names[1]}, dots per value: ${values.map((v, i) => `${v}: ${fb[i]}`).join("; ")}.`;
          const plot = stackedDotPlots(values, [{ name: names[0], freqs: fa }, { name: names[1], freqs: fb }], ctx.title, alt);
          figure = plot.figure;
          ends = [[Math.min(...A), Math.max(...A)], [Math.min(...B), Math.max(...B)]];
          sizes = [A.length, B.length];
          readBack = () => {
            const read = readStackedDotPlots(figure.svg, plot.xs, plot.baselines);
            if (!read) return null;
            const [dataA, dataB] = read.map((freqs) => expand(values, freqs));
            return statKeys.map((stat) => [tidy(DOT_STATS[stat](dataA)), tidy(DOT_STATS[stat](dataB))]);
          };
        }
        const differ = statKeys.filter((_, i) => stats[i][0] !== stats[i][1]);
        const at = (stat) => stats[statKeys.indexOf(stat)];
        const describe = (stat) => `${names[0]} ${num(at(stat)[0])}, ${names[1]} ${num(at(stat)[1])}`;
        const unit = ctx.title.includes("(") ? ctx.title.replace(/^.*\((.*)\)$/, "$1") : "";
        if (howMuch) {
          if (!differ.length) return null;
          const keyStat = t.pick(differ.filter((stat) => stat !== "mean").length ? differ.filter((stat) => stat !== "mean") : differ);
          const [a, b] = at(keyStat);
          const hi = a > b ? 0 : 1;
          const key = tidy(Math.abs(a - b));
          const candidates = statKeys.filter((stat) => stat !== keyStat).map((stat) => [tidy(Math.abs(at(stat)[0] - at(stat)[1])),
            `Gives the difference between the ${STAT_WORDS[stat]}s (${describe(stat)}), not the ${STAT_WORDS[keyStat]}s.`]);
          candidates.push(
            [at(keyStat)[hi], `Gives the ${STAT_WORDS[keyStat]} for ${names[hi]} alone instead of the difference.`],
            [at(keyStat)[1 - hi], `Gives the ${STAT_WORDS[keyStat]} for ${names[1 - hi]} alone instead of the difference.`],
            [Math.abs(ends[0][1] - ends[1][1]), "Compares only the greatest values of the two data sets."],
            [Math.abs(ends[0][0] - ends[1][0]), "Compares only the least values of the two data sets."],
            ...quartileGaps,
          );
          return packRanked(t, numeric, key, candidates, {
            stimulus: null,
            figure,
            stem: `The ${boxes ? "box plots" : "dot plots"} summarize ${ctx.about(...sizes)}. ` +
              `How much greater is the ${STAT_WORDS[keyStat]} of the data for ${names[hi]} than the ${STAT_WORDS[keyStat]} of the data for ${names[1 - hi]}${unit && boxes ? `, in ${unit}` : ""}?`,
            explanation: `${cap1(STAT_WORDS[keyStat])}s: ${describe(keyStat)}. The difference is ${num(at(keyStat)[hi])} ${MINUS} ${num(at(keyStat)[1 - hi])} = ${num(key)}.`,
            steps: [
              boxes
                ? "Read the five-number summary of each box plot: whisker ends, box edges, and the line in the box."
                : "Count the dots at each value for each group.",
              `Find each ${STAT_WORDS[keyStat]}: ${describe(keyStat)}.`,
              `Subtract: ${num(at(keyStat)[hi])} ${MINUS} ${num(at(keyStat)[1 - hi])} = ${num(key)}.`,
            ],
            principles: [
              "Range = greatest − least; interquartile range = third quartile − first quartile; the median is the middle value.",
              "Each statistic is read from its own feature of the plot.",
            ],
            trap: keyStat === "iqr"
              ? "The interquartile range is the width of the box alone; the whiskers belong to the range."
              : keyStat === "range"
                ? "The range runs from whisker end to whisker end (least to greatest), not across the box."
                : "Compare the statistic asked about; another feature of the plots may differ by a different amount.",
            hint: `Which feature of each plot shows the ${STAT_WORDS[keyStat]}?`,
            estimatedSeconds: 90,
            verify: () => {
              const read = readBack();
              if (!read) return false;
              const i = statKeys.indexOf(keyStat);
              return close(read[i][hi] - read[i][1 - hi], key);
            },
          }, { show: num, places: 2 });
        }
        // One statistic differs (the key's), another is equal.
        const equal = statKeys.filter((_, i) => stats[i][0] === stats[i][1]);
        if (!differ.length || !equal.length) return null;
        const keyStat = t.pick(differ);
        const otherStat = t.pick(equal);
        const bigger = at(keyStat)[0] > at(keyStat)[1] ? 0 : 1;
        const phrase = (stat, who) => `The data for ${names[who]} have the greater ${STAT_WORDS[stat]}.`;
        const reasonOther = (stat) => {
          if (stat === "iqr") return `The boxes have the same width, so the interquartile ranges are equal (${describe(stat)}).`;
          if (stat === "range") return `The two data sets span the same distance from least to greatest (${describe(stat)}).`;
          if (stat === "median") return `The medians are equal (${describe(stat)}).`;
          return `The means are equal (${describe(stat)}).`;
        };
        const rows = t.shuffle([keyStat, otherStat]);
        const grid = statementGrid((i, j) => {
          const stat = rows[i];
          if (stat === keyStat) {
            return j === bigger
              ? [phrase(stat, j), "", true]
              : [phrase(stat, j), `Reverses the comparison: ${describe(stat)}.`, false];
          }
          return [phrase(stat, j), reasonOther(stat), false];
        });
        if (!grid) return null;
        const trap = keyStat === "iqr"
          ? "A longer whisker is not a wider box: the interquartile range is the width of the box alone."
          : keyStat === "range"
            ? "The range runs from the least value to the greatest, whisker end to whisker end, not across the box."
            : "Compare the statistic the statement names; a difference in another feature does not settle it.";
        return finish(false, {
          stimulus: null,
          figure,
          stem: `The ${boxes ? "box plots" : "dot plots"} summarize ${ctx.about(...sizes)}. Which of the following statements is true?`,
          correct: grid.correct,
          wrong: grid.wrong,
          explanation:
            `${cap1(STAT_WORDS[keyStat])}: ${describe(keyStat)}, so "${grid.correct}" is true. ` +
            `${cap1(STAT_WORDS[otherStat])}: ${describe(otherStat)}, so neither statement about it is true.`,
          steps: [
            boxes
              ? "Read the five-number summary of each box plot: whisker ends, box edges, and the line in the box."
              : "Count the dots at each value for each group.",
            `Compare the ${STAT_WORDS[keyStat]}: ${describe(keyStat)}.`,
            `Compare the ${STAT_WORDS[otherStat]}: ${describe(otherStat)}.`,
            `Only "${grid.correct}" is true.`,
          ],
          principles: [
            "Range = greatest − least; interquartile range = third quartile − first quartile; the median is the middle value.",
            "Two data sets can differ in one statistic and agree in another; each statement must be checked against its own statistic.",
          ],
          trap,
          hint: "For each statement, which feature of the plots shows that statistic?",
          estimatedSeconds: 95,
          verify: () => {
            const read = readBack();
            if (!read) return false;
            const holds = (text) => statKeys.some((stat, i) => [0, 1].some((who) =>
              text === phrase(stat, who) && read[i][who] > read[i][1 - who]));
            return holds(grid.correct) && grid.wrong.every(([text]) => !holds(text));
          },
        });
      });
    },
  };

  return [
    listCenter, boxPlotSummary, meanMissing, displayCenter, dataChangeMedian, histogramIntervals,
    compareSpreadPlots, weightedMeanGroups, dataChangeStatistics, couldBeMedian,
  ];
});
