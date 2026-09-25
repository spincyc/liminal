(function (root, factory) {
  const shared = typeof module === "object" && module.exports
    ? require("./shared")
    : root.SAT_MATH_HARD_SHARED;
  const families = factory(shared);
  if (typeof module === "object" && module.exports) module.exports = families;
  else root.SAT_MATH_HARD_FAMILIES = (root.SAT_MATH_HARD_FAMILIES || []).concat(families);
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  const { MINUS, num, frac, table } = S;
  const DOMAIN = "Problem-Solving and Data Analysis";

  /* ------------------------------------------------------------- helpers */

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

  // "$96" or "$76.80".
  function money(value) {
    const v = tidy(value);
    if (Number.isInteger(v)) return `$${fmt(v)}`;
    const [whole, cents] = v.toFixed(2).split(".");
    return `$${fmt(Number(whole))}.${cents}`;
  }

  // "14.5", or "about 14.33" when the decimal does not terminate early.
  const about = (value) => (isClean(value, 2) ? num(tidy(value)) : `about ${num(Math.round(value * 100) / 100)}`);
  const plural = (count, one, many = `${one}s`) => `${fmt(count)} ${count === 1 ? one : many}`;
  const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
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

  // Distractors whose displayed text differs from the key and from each
  // other, in the order given (strongest trap first).
  function offer(keyText, candidates) {
    const seen = new Set([keyText]);
    return candidates.filter(([text]) => {
      if (typeof text !== "string" || seen.has(text)) return false;
      seen.add(text);
      return true;
    });
  }

  const finish = (numeric, fields) => ({ responseType: numeric ? "numeric" : "multiple-choice", ...fields });

  // Statistics, computed from the raw list.
  const sum = (list) => list.reduce((total, value) => total + value, 0);
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
  const expand = (values, counts) => values.flatMap((value, index) => Array(counts[index]).fill(value));
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

  // Parses a pipe table back into cells, so verify() reads what the student reads.
  const parseTable = (content) => content.split("\n").map((row) => row.split(" | ").map((cell) => cell.trim()));
  const parseNumber = (text) => Number(String(text).replace(/,/g, "").replace(MINUS, "-"));

  /* ================================================== successive-percent */

  const PERCENT_SIZES = [10, 20, 25, 30, 40, 50, 60, 75];

  // A signed percent change; decreases stop at 60%.
  function drawChange(t) {
    const size = t.pick(PERCENT_SIZES);
    return size > 60 || t.chance(0.5) ? size : -size;
  }

  const changed = (c) => `${c > 0 ? "increased" : "decreased"} by ${Math.abs(c)}%`;
  const verbOf = (c) => (c > 0 ? "increased" : "decreased");
  const nounOf = (c) => (c > 0 ? "increase" : "decrease");
  const multiplier = (c) => num((100 + c) / 100);

  const TIMELINES = [
    {
      money: false, low: 800, high: 20000, step: 20,
      story: (c1, c2) => `The number of visitors to a science museum ${changed(c1)} from 2021 to 2022 and then ${changed(c2)} from 2022 to 2023.`,
      final: (v) => `The museum had ${fmt(v)} visitors in 2023.`,
      ask: "How many visitors did the museum have in 2021?",
      restore: (verb) => `From 2023 to 2024, the number of visitors ${verb} by p%, which made it equal to the number in 2021. What is the value of p?`,
      start: "2021 number", mid: "2022 number", end: "2023 number",
    },
    {
      money: false, low: 2000, high: 60000, step: 100,
      story: (c1, c2) => `The population of Millbrook ${changed(c1)} from 2010 to 2015 and then ${changed(c2)} from 2015 to 2020.`,
      final: (v) => `In 2020, the population of Millbrook was ${fmt(v)}.`,
      ask: "What was the population of Millbrook in 2010?",
      restore: (verb) => `From 2020 to 2025, the population ${verb} by p%, which returned it to its 2010 value. What is the value of p?`,
      start: "2010 population", mid: "2015 population", end: "2020 population",
    },
    {
      money: true, low: 40, high: 900, step: 4,
      story: (c1, c2) => `A store ${verbOf(c1)} the price of a coat by ${Math.abs(c1)}%. A month later, the store ${verbOf(c2)} the new price by ${Math.abs(c2)}%.`,
      final: (v) => `After both changes, the price of the coat was ${money(v)}.`,
      ask: "What was the price of the coat, in dollars, before either change?",
      restore: (verb) => `The store then ${verb} the price by p%, which returned it to the price before either change. What is the value of p?`,
      start: "original price", mid: "price after the first change", end: "final price",
    },
    {
      money: true, low: 600, high: 4000, step: 20,
      story: (c1, c2) => `When a lease was renewed in 2023, the monthly rent for an apartment ${changed(c1)}. When the lease was renewed in 2024, the monthly rent ${changed(c2)}.`,
      final: (v) => `After the 2024 renewal, the monthly rent was ${money(v)}.`,
      ask: "What was the monthly rent, in dollars, before the 2023 renewal?",
      restore: (verb) => `At the 2025 renewal, the monthly rent ${verb} by p%, which returned it to its amount before the 2023 renewal. What is the value of p?`,
      start: "rent before 2023", mid: "rent after the 2023 renewal", end: "rent after the 2024 renewal",
    },
    {
      money: false, low: 400, high: 30000, step: 20,
      story: (c1, c2) => `The number of subscribers to a podcast ${changed(c1)} from March to April and then ${changed(c2)} from April to May.`,
      final: (v) => `The podcast had ${fmt(v)} subscribers in May.`,
      ask: "How many subscribers did the podcast have in March?",
      restore: (verb) => `From May to June, the number of subscribers ${verb} by p%, which made it equal to the number in March. What is the value of p?`,
      start: "March number", mid: "April number", end: "May number",
    },
    {
      money: false, low: 1000, high: 24000, step: 50,
      story: (c1, c2) => `Enrollment at a community college ${changed(c1)} from fall 2020 to fall 2021 and then ${changed(c2)} from fall 2021 to fall 2022.`,
      final: (v) => `In fall 2022, the college enrolled ${fmt(v)} students.`,
      ask: "How many students did the college enroll in fall 2020?",
      restore: (verb) => `From fall 2022 to fall 2023, enrollment ${verb} by p%, which returned it to its fall 2020 level. What is the value of p?`,
      start: "fall 2020 enrollment", mid: "fall 2021 enrollment", end: "fall 2022 enrollment",
    },
  ];

  const PERCENT_PRINCIPLES = [
    "A p% increase multiplies an amount by (1 + p/100), and a p% decrease multiplies it by (1 − p/100); successive changes multiply.",
    "Each percent is a percent of the amount just before that change, so percents from different steps cannot be added.",
  ];

  function percentReverse(t, numeric) {
    const ctx = t.pick(TIMELINES);
    const show = ctx.money ? money : fmt;
    const places = ctx.money ? 2 : 0;
    return retry(() => {
      const c1 = drawChange(t);
      const c2 = drawChange(t);
      const start = t.int(Math.ceil(ctx.low / ctx.step), Math.floor(ctx.high / ctx.step)) * ctx.step;
      const mid = tidy((start * (100 + c1)) / 100);
      const end = tidy((mid * (100 + c2)) / 100);
      if (!Number.isInteger(mid) || !Number.isInteger(end)) return null;
      const product = tidy(((100 + c1) * (100 + c2)) / 10000);
      const combined = c1 + c2;
      const candidates = [];
      const summed = tidy((end * 100) / (100 + combined));
      const summedClean = 100 + combined > 0 && isClean(summed, places);
      // Multiple choice always offers the add-the-percents reflex.
      if (!numeric && !summedClean) return null;
      if (summedClean) {
        candidates.push([show(summed), combined === 0
          ? `Assumes the ${Math.abs(c1)}% ${nounOf(c1)} and the ${Math.abs(c2)}% ${nounOf(c2)} cancel, but they are percents of different amounts.`
          : `Adds the percents into one change of ${combined > 0 ? "" : MINUS}${Math.abs(combined)}% and undoes it, but the ${Math.abs(c2)}% is a percent of the ${ctx.mid}.`]);
      }
      const flipped = tidy((end * (100 - c2) * (100 - c1)) / 10000);
      if (isClean(flipped, places) && flipped > 0) {
        candidates.push([show(flipped),
          `Undoes each change with the opposite percent of the later amount (a ${Math.abs(c2)}% ${nounOf(-c2)}, then a ${Math.abs(c1)}% ${nounOf(-c1)}), so each percent has the wrong base.`]);
      }
      candidates.push([show(mid), `Undoes only the ${Math.abs(c2)}% ${nounOf(c2)}, which gives the ${ctx.mid}, not the ${ctx.start}.`]);
      const forward = tidy(end * product);
      if (isClean(forward, places)) candidates.push([show(forward), "Applies both changes to the final amount again instead of undoing them."]);
      const wrong = offer(show(start), candidates);
      if (!numeric && wrong.length < 3) return null;
      const both = `${multiplier(c1)} × ${multiplier(c2)} = ${num(product)}`;
      return finish(numeric, {
        stimulus: null,
        stem: `${ctx.story(c1, c2)} ${ctx.final(end)} ${ctx.ask}`,
        correct: numeric ? start : show(start),
        wrong,
        explanation:
          `A ${Math.abs(c1)}% ${nounOf(c1)} multiplies an amount by ${multiplier(c1)}, and a ${Math.abs(c2)}% ${nounOf(c2)} multiplies ` +
          `the new amount by ${multiplier(c2)}. Together they multiply the ${ctx.start} by ${both}, so the ${ctx.start} was ` +
          `${show(end)} ÷ ${num(product)} = ${show(start)}.`,
        steps: [
          `Write each change as a multiplier: ${multiplier(c1)} for the first and ${multiplier(c2)} for the second.`,
          `Combine them: ${both}.`,
          `Undo the combined change by dividing: ${show(end)} ÷ ${num(product)} = ${show(start)}.`,
          `Check forward: ${show(start)} × ${multiplier(c1)} = ${show(mid)}, and ${show(mid)} × ${multiplier(c2)} = ${show(end)}.`,
        ],
        principles: PERCENT_PRINCIPLES,
        trap: `Adding the percents (${combined > 0 ? "+" : combined < 0 ? MINUS : ""}${Math.abs(combined)}%) or undoing each change with the opposite percent treats every percent as a percent of the same amount; they are not.`,
        hint: "Each percent is a percent of a different amount. Describe each change by what it multiplies the amount by.",
        verify: () => S.approx(start * (1 + c1 / 100) * (1 + c2 / 100), end) && start > 0,
      });
    });
  }

  const TRIADS = [
    {
      names: ["P", "Q", "R"], up: "more", down: "fewer",
      of: (x) => `the number store ${x} sold`,
      link: (x, c, y) => `store ${x} sold ${Math.abs(c)}% ${c > 0 ? "more" : "fewer"} bicycles than store ${y}`,
      intro: (text) => `Last month, ${text}.`,
      askOf: "The number of bicycles store P sold last month was k% of the number store R sold. What is the value of k?",
      askDiff: (word) => `Last month, store P sold p% ${word} bicycles than store R. What is the value of p?`,
    },
    {
      names: ["A", "B", "C"], up: "taller", down: "shorter",
      of: (x) => `tree ${x}'s height`,
      link: (x, c, y) => `tree ${x} is ${Math.abs(c)}% ${c > 0 ? "taller" : "shorter"} than tree ${y}`,
      intro: (text) => `${cap(text)}.`,
      askOf: "The height of tree A is k% of the height of tree C. What is the value of k?",
      askDiff: (word) => `Tree A is p% ${word} than tree C. What is the value of p?`,
    },
    {
      names: ["X", "Y", "Z"], up: "greater", down: "less",
      of: (x) => `town ${x}'s population`,
      link: (x, c, y) => `the population of town ${x} is ${Math.abs(c)}% ${c > 0 ? "greater" : "less"} than the population of town ${y}`,
      intro: (text) => `${cap(text)}.`,
      askOf: "The population of town X is k% of the population of town Z. What is the value of k?",
      askDiff: (word) => `The population of town X is p% ${word} than the population of town Z. What is the value of p?`,
    },
    {
      names: ["X", "Y", "Z"], up: "more", down: "less",
      of: (x) => `model ${x}'s price`,
      link: (x, c, y) => `model ${x} costs ${Math.abs(c)}% ${c > 0 ? "more" : "less"} than model ${y}`,
      intro: (text) => `A company sells three models of a laptop. ${cap(text)}.`,
      askOf: "The price of model X is k% of the price of model Z. What is the value of k?",
      askDiff: (word) => `Model X costs p% ${word} than model Z. What is the value of p?`,
    },
    {
      names: ["A", "B", "C"], up: "longer", down: "shorter",
      of: (x) => `trail ${x}'s length`,
      link: (x, c, y) => `trail ${x} is ${Math.abs(c)}% ${c > 0 ? "longer" : "shorter"} than trail ${y}`,
      intro: (text) => `In a state park, ${text}.`,
      askOf: "The length of trail A is k% of the length of trail C. What is the value of k?",
      askDiff: (word) => `Trail A is p% ${word} than trail C. What is the value of p?`,
    },
  ];

  function percentChain(t, numeric) {
    const ctx = t.pick(TRIADS);
    const [X, Y, Z] = ctx.names;
    return retry(() => {
      const a = drawChange(t);
      const b = drawChange(t);
      const ratio = tidy(((100 + a) * (100 + b)) / 100);
      if (ratio === 100) return null;
      const askOf = t.chance(0.5);
      const gap = tidy(Math.abs(ratio - 100));
      const key = askOf ? ratio : gap;
      if (!fitsGrid(key) || !isClean(key, 2)) return null;
      const word = ratio > 100 ? ctx.up : ctx.down;
      const summed = 100 + a + b;
      const baseFirst = tidy((100 * (100 + b)) / (100 - a));
      const baseSecond = tidy((100 * (100 + a)) / (100 - b));
      const reverse = tidy(10000 / ratio);
      const ok = (value) => value > 0 && isClean(value, 2);
      const candidates = [];
      if (askOf) {
        if (ok(summed)) candidates.push([num(summed), `Adds the percents, 100 + (${num(a)}) + (${num(b)}), though they are percents of different amounts.`]);
        candidates.push([num(gap), `Gives the percent by which ${ctx.of(X)} differs from ${ctx.of(Z)}, not ${ctx.of(X)} as a percent of ${ctx.of(Z)}.`]);
        if (ok(baseFirst)) candidates.push([num(baseFirst), `Takes the ${Math.abs(a)}% of ${ctx.of(X)} instead of ${ctx.of(Y)}, the amount it is compared with.`]);
        if (ok(baseSecond)) candidates.push([num(baseSecond), `Takes the ${Math.abs(b)}% of ${ctx.of(Y)} instead of ${ctx.of(Z)}, the amount it is compared with.`]);
        if (ok(reverse)) candidates.push([num(reverse), `Finds ${ctx.of(Z)} as a percent of ${ctx.of(X)}, the reverse comparison.`]);
      } else {
        const summedGap = Math.abs(a + b);
        if (summedGap > 0 && Math.sign(a + b) === Math.sign(ratio - 100)) {
          candidates.push([num(summedGap), `Combines the two percents, ${num(a)} and ${num(b)}, as if both were percents of the same amount.`]);
        }
        candidates.push([num(ratio), `Gives ${ctx.of(X)} as a percent of ${ctx.of(Z)} instead of the percent by which they differ.`]);
        if (ok(baseFirst) && baseFirst !== 100) candidates.push([num(tidy(Math.abs(baseFirst - 100))), `Takes the ${Math.abs(a)}% of ${ctx.of(X)} instead of ${ctx.of(Y)}, the amount it is compared with.`]);
        if (ok(baseSecond) && baseSecond !== 100) candidates.push([num(tidy(Math.abs(baseSecond - 100))), `Takes the ${Math.abs(b)}% of ${ctx.of(Y)} instead of ${ctx.of(Z)}, the amount it is compared with.`]);
        if (ok(reverse)) candidates.push([num(tidy(Math.abs(reverse - 100))), `Measures the difference as a percent of ${ctx.of(X)} instead of ${ctx.of(Z)}.`]);
      }
      const wrong = offer(num(key), candidates);
      if (!numeric && wrong.length < 3) return null;
      const yValue = 100 + b;
      const text = `${ctx.link(X, a, Y)}, and ${ctx.link(Y, b, Z)}`;
      return finish(numeric, {
        stimulus: null,
        stem: `${ctx.intro(text)} ${askOf ? ctx.askOf : ctx.askDiff(word)}`,
        correct: key,
        wrong,
        explanation:
          `Suppose ${ctx.of(Z)} is 100. Then ${ctx.of(Y)} is 100 × ${multiplier(b)} = ${num(yValue)}, and ${ctx.of(X)} is ` +
          `${num(yValue)} × ${multiplier(a)} = ${num(ratio)}. So ${ctx.of(X)} is ${num(ratio)}% of ${ctx.of(Z)}, which is ` +
          `${num(gap)}% ${word}${askOf ? "" : "; p = " + num(gap)}.`,
        steps: [
          `Pick a convenient value for the last amount in the chain: ${ctx.of(Z)} = 100.`,
          `Apply the second comparison to it: ${ctx.of(Y)} = 100 × ${multiplier(b)} = ${num(yValue)}.`,
          `Apply the first comparison to that result: ${ctx.of(X)} = ${num(yValue)} × ${multiplier(a)} = ${num(ratio)}.`,
          askOf
            ? `Compare with 100: ${ctx.of(X)} is ${num(ratio)}% of ${ctx.of(Z)}, so k = ${num(ratio)}.`
            : `Compare with 100: ${num(ratio)} is ${num(gap)} ${ratio > 100 ? "more" : "less"} than 100, so p = ${num(gap)}.`,
        ],
        principles: [
          '"A is p% more than B" means A = B × (1 + p/100): the percent is a percent of B, the amount after "than".',
          "Chained comparisons multiply; they do not add.",
        ],
        trap: `Adding ${num(a)}% and ${num(b)}% ignores that each percent is taken of a different amount.`,
        hint: "Give the amount at the end of the chain a convenient value and work back through each comparison.",
        verify: () => {
          const zValue = 2000;
          const yCheck = zValue + (zValue * b) / 100;
          const xCheck = yCheck + (yCheck * a) / 100;
          const percent = (xCheck / zValue) * 100;
          const expected = askOf ? percent : Math.abs(percent - 100);
          return S.approx(expected, key) && (askOf || (percent > 100) === (word === ctx.up));
        },
      });
    });
  }

  function percentRestore(t, numeric) {
    const ctx = t.pick(TIMELINES);
    return retry(() => {
      const c1 = drawChange(t);
      const c2 = drawChange(t);
      const product = (100 + c1) * (100 + c2);
      if (product === 10000) return null;
      const need = tidy((1000000 - 100 * product) / product);
      const key = Math.abs(need);
      if (!isClean(key, 2) || !fitsGrid(key)) return null;
      const verb = need > 0 ? "increased" : "decreased";
      const net = tidy(Math.abs(product - 10000) / 100);
      const lastOnly = tidy(Math.abs((100 * c2) / (100 + c2)));
      const candidates = [];
      candidates.push([num(net), `Reuses the net change, ${num(net)}%, which is a percent of the ${ctx.start}, as a percent of the ${ctx.end}.`]);
      if (c1 + c2 !== 0 && Math.sign(-(c1 + c2)) === Math.sign(need)) {
        candidates.push([num(Math.abs(c1 + c2)), `Reverses the sum of the two changes, ${num(c1)}% and ${num(c2)}%, as if they were percents of one amount.`]);
      }
      if (isClean(lastOnly, 2)) candidates.push([num(lastOnly), `Undoes only the second change, which returns to the ${ctx.mid}, not the ${ctx.start}.`]);
      const firstOnly = tidy(Math.abs((100 * c1) / (100 + c1)));
      if (isClean(firstOnly, 2)) candidates.push([num(firstOnly), `Undoes only the first change, as if the second had not happened.`]);
      const wrong = offer(num(key), candidates);
      if (!numeric && wrong.length < 3) return null;
      const combined = tidy(product / 10000);
      const inverse = tidy(10000 / product);
      return finish(numeric, {
        stimulus: null,
        stem: `${ctx.story(c1, c2)} ${ctx.restore(verb)}`,
        correct: key,
        wrong,
        explanation:
          `The two changes multiply the ${ctx.start} by ${multiplier(c1)} × ${multiplier(c2)} = ${num(combined)}. To return to it, the ` +
          `${ctx.end} must be multiplied by 1 ÷ ${num(combined)} = ${num(inverse)}, which is a ${num(key)}% ${need > 0 ? "increase" : "decrease"}.`,
        steps: [
          `Write the changes as multipliers: ${multiplier(c1)} and ${multiplier(c2)}.`,
          `Combine them: the ${ctx.end} is ${num(combined)} times the ${ctx.start}.`,
          `The multiplier that undoes this is 1 ÷ ${num(combined)} = ${num(inverse)}.`,
          `A multiplier of ${num(inverse)} is a change of ${need > 0 ? "+" : MINUS}${num(key)}%, so p = ${num(key)}.`,
        ],
        principles: PERCENT_PRINCIPLES,
        trap: `The net change is ${num(net)}% of the ${ctx.start}, but the change back is a percent of the ${ctx.end}, a different base, so it is ${num(key)}%, not ${num(net)}%.`,
        hint: "The change back is a percent of the latest amount. How does the latest amount compare with the original?",
        verify: () => {
          let amount = 1000;
          amount += (amount * c1) / 100;
          amount += (amount * c2) / 100;
          amount += (amount * (need > 0 ? key : -key)) / 100;
          return S.approx(amount, 1000);
        },
      });
    });
  }

  const successivePercent = {
    id: "successive-percent",
    domain: DOMAIN,
    skill: "Percentages",
    subskill: "percent change",
    title: "Successive and chained percent changes",
    recognize:
      "Every percent is a percent of the amount just before it, so changes and comparisons combine by multiplying their " +
      "multipliers; a change is undone by dividing, never by the opposite percent.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["percent-base", "neighbouring-rule", "intermediate-value", "wrong-quantity"],
    build(t) {
      const form = t.int(0, 2);
      const numeric = t.chance(0.45);
      const instance = [percentReverse, percentChain, percentRestore][form](t, numeric);
      return { estimatedSeconds: 100, ...instance };
    },
  };

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
      const wrong = offer(num(n2), [
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
        const wrong = offer(num(m2), candidates);
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
        const wrong = offer(num(m2), candidates);
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
      const wrong = offer(num(x), candidates);
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
      const wrong = offer(num(x), candidates);
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
      const wrong = offer(num(key), candidates);
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

  /* ================================================= conditional-two-way */

  const TWO_WAY = [
    {
      intro: "The table shows how the students surveyed at a high school usually get to school, by grade.",
      who: "students",
      rowHead: "Grade", rows: ["10th", "11th", "12th"], cols: ["Walk", "Bus", "Car"],
      rowCond: ["a student in 10th grade", "a student in 11th grade", "a student in 12th grade"],
      rowNot: ["a student not in 10th grade", "a student not in 11th grade", "a student not in 12th grade"],
      rowEvent: ["the student is in 10th grade", "the student is in 11th grade", "the student is in 12th grade"],
      colCond: ["a student who walks to school", "a student who takes the bus", "a student who rides in a car"],
      colNot: ["a student who does not walk to school", "a student who does not take the bus", "a student who does not ride in a car"],
      colEvent: ["the student walks to school", "the student takes the bus", "the student rides in a car"],
      rowAll: "Every student surveyed is in 10th, 11th, or 12th grade.",
      colAll: "Every student surveyed walks, takes the bus, or rides in a car.",
    },
    {
      intro: "The table shows the preferred news source of each adult in a survey, by age group.",
      who: "adults",
      rowHead: "Age group", rows: ["18 to 34", "35 to 54", "55 and older"], cols: ["Print", "Television", "Online"],
      rowCond: ["a respondent aged 18 to 34", "a respondent aged 35 to 54", "a respondent aged 55 or older"],
      rowNot: ["a respondent not aged 18 to 34", "a respondent not aged 35 to 54", "a respondent under 55"],
      rowEvent: ["the respondent is aged 18 to 34", "the respondent is aged 35 to 54", "the respondent is aged 55 or older"],
      colCond: ["a respondent who prefers print news", "a respondent who prefers television news", "a respondent who prefers online news"],
      colNot: ["a respondent who does not prefer print news", "a respondent who does not prefer television news", "a respondent who does not prefer online news"],
      colEvent: ["the respondent prefers print news", "the respondent prefers television news", "the respondent prefers online news"],
      rowAll: "Every respondent is in exactly one of the three age groups.",
      colAll: "Every respondent chose exactly one of print, television, or online news.",
    },
    {
      intro: "The table shows the results of a germination experiment that tested two fertilizers.",
      who: "seeds",
      rowHead: "Treatment", rows: ["Fertilizer A", "Fertilizer B", "None"], cols: ["Sprouted", "Did not sprout"],
      rowCond: ["a seed given fertilizer A", "a seed given fertilizer B", "a seed given no fertilizer"],
      rowNot: ["a seed not given fertilizer A", "a seed not given fertilizer B", "a seed given a fertilizer"],
      rowEvent: ["the seed was given fertilizer A", "the seed was given fertilizer B", "the seed was given no fertilizer"],
      colCond: ["a seed that sprouted", "a seed that did not sprout"],
      colNot: [],
      colEvent: ["the seed sprouted", "the seed did not sprout"],
      rowAll: "Every seed was given fertilizer A, fertilizer B, or no fertilizer.",
      colAll: "",
    },
    {
      intro: "The table shows the number of visitors to a museum last month, by ticket type and by whether they visited on a weekday or a weekend.",
      who: "visitors",
      rowHead: "Ticket", rows: ["Adult", "Student", "Senior"], cols: ["Weekday", "Weekend"],
      rowCond: ["a visitor with an adult ticket", "a visitor with a student ticket", "a visitor with a senior ticket"],
      rowNot: ["a visitor without an adult ticket", "a visitor without a student ticket", "a visitor without a senior ticket"],
      rowEvent: ["the visitor had an adult ticket", "the visitor had a student ticket", "the visitor had a senior ticket"],
      colCond: ["a visitor who came on a weekday", "a visitor who came on a weekend"],
      colNot: [],
      colEvent: ["the visitor came on a weekday", "the visitor came on a weekend"],
      rowAll: "Every visitor had an adult, student, or senior ticket.",
      colAll: "",
    },
    {
      intro: "The table shows the results of an inspection of the phones made at two plants last week.",
      who: "phones",
      rowHead: "Plant", rows: ["Plant X", "Plant Y"], cols: ["No defects", "Minor defects", "Major defects"],
      rowCond: ["a phone made at plant X", "a phone made at plant Y"],
      rowNot: [],
      rowEvent: ["the phone was made at plant X", "the phone was made at plant Y"],
      colCond: ["a phone with no defects", "a phone with minor defects", "a phone with major defects"],
      colNot: ["a phone with defects", "a phone without minor defects", "a phone without major defects"],
      colEvent: ["the phone had no defects", "the phone had minor defects", "the phone had major defects"],
      rowAll: "",
      colAll: "Each phone was classified as having no defects, minor defects, or major defects.",
    },
  ];

  const CONDITIONAL_PRINCIPLES = [
    "The probability of B given A is the number in both A and B divided by the number in A: the condition fixes the denominator.",
    "P(B given A) and P(A given B) share a numerator but have different denominators.",
  ];

  function conditionalTable(t, numeric) {
    const ctx = t.pick(TWO_WAY);
    return retry(() => {
      const R = ctx.rows.length;
      const C = ctx.cols.length;
      const counts = ctx.rows.map(() => ctx.cols.map(() => t.int(4, 45)));
      const rowTotals = counts.map(sum);
      const colTotals = ctx.cols.map((_, j) => sum(counts.map((row) => row[j])));
      const N = sum(rowTotals);
      const onRow = t.chance(0.5);
      const condSize = onRow ? R : C;
      const eventSize = onRow ? C : R;
      const ci = t.int(0, condSize - 1);
      const ei = t.int(0, eventSize - 1);
      const negate = condSize === 3 && t.chance(0.45);
      const at = (c, e) => (onRow ? counts[c][e] : counts[e][c]);
      const totalOf = (c) => (onRow ? rowTotals[c] : colTotals[c]);
      const condIdx = negate ? range(0, condSize - 1).filter((index) => index !== ci) : [ci];
      const joint = sum(condIdx.map((c) => at(c, ei)));
      const condTotal = sum(condIdx.map(totalOf));
      const eventTotal = onRow ? colTotals[ei] : rowTotals[ei];
      const key = frac(joint, condTotal);
      // Optionally leave out one category that the question depends on.
      const omitChoices = [];
      if (condSize === 3) condIdx.forEach((c) => omitChoices.push({ onRowDim: onRow, index: c }));
      if (eventSize === 3) omitChoices.push({ onRowDim: !onRow, index: ei });
      const omit = omitChoices.length && t.chance(0.5) ? t.pick(omitChoices) : null;
      const condLabels = onRow ? ctx.rows : ctx.cols;
      const eventLabels = onRow ? ctx.cols : ctx.rows;
      const candidates = [
        [frac(joint, eventTotal), `Divides by the ${eventTotal} in the ${eventLabels[ei]} ${onRow ? "column" : "row"}, which answers the reverse question.`],
        [frac(joint, N), `Divides by all ${N} ${ctx.who} instead of only those in the given group.`],
      ];
      if (negate) {
        const part = condIdx[0];
        candidates.push([frac(at(part, ei), totalOf(part)), `Uses only the ${condLabels[part]} ${onRow ? "row" : "column"} as the condition, leaving out ${condLabels[condIdx[1]]}.`]);
      }
      candidates.push([frac(condTotal - joint, condTotal), "Counts the members of the given group who do not have the stated outcome."]);
      const wrong = offer(key, candidates);
      if (wrong.length < 3) return null;
      const decimal = tidy(joint / condTotal);
      const asNumber = numeric && fitsGrid(decimal) && isClean(decimal, 3);
      // Build the displayed table.
      const shownRows = range(0, R - 1).filter((r) => !(omit && omit.onRowDim && omit.index === r));
      const shownCols = range(0, C - 1).filter((c) => !(omit && !omit.onRowDim && omit.index === c));
      const content = table(
        [ctx.rowHead, ...shownCols.map((c) => ctx.cols[c]), "Total"],
        [
          ...shownRows.map((r) => [ctx.rows[r], ...shownCols.map((c) => counts[r][c]), rowTotals[r]]),
          ["Total", ...shownCols.map((c) => colTotals[c]), N],
        ],
      );
      const note = omit ? ` ${omit.onRowDim ? ctx.rowAll : ctx.colAll}` : "";
      const cond = negate ? (onRow ? ctx.rowNot[ci] : ctx.colNot[ci]) : onRow ? ctx.rowCond[ci] : ctx.colCond[ci];
      const event = onRow ? ctx.colEvent[ei] : ctx.rowEvent[ei];
      const raw = `${joint}/${condTotal}`;
      const shownAnswer = asNumber ? `${raw} = ${num(decimal)}` : raw === key ? raw : `${raw} = ${key}`;
      const derived = omit
        ? `The ${(omit.onRowDim ? ctx.rows : ctx.cols)[omit.index]} ${omit.onRowDim ? "row" : "column"} is not shown, so find it from the totals. `
        : "";
      return finish(asNumber, {
        stimulus: { type: "table", content },
        stem: `${ctx.intro}${note} If ${cond} is selected at random, what is the probability that ${event}?`,
        correct: asNumber ? decimal : key,
        wrong,
        explanation:
          `${derived}The condition limits the choice to the ${condTotal} ${ctx.who} in the ${condIdx.map((c) => condLabels[c]).join(" or ")} ` +
          `${onRow ? "row" : "column"}${condIdx.length > 1 ? "s" : ""}. ` +
          `Of these, ${joint} also fit the outcome, so the probability is ${shownAnswer}.`,
        steps: [
          omit ? `Recover the missing ${omit.onRowDim ? "row" : "column"} by subtracting the shown entries from the totals.` : "Identify the group named in the condition; it is the only group that can be selected.",
          `Count that group: ${condIdx.length > 1 ? `${condIdx.map((c) => totalOf(c)).join(" + ")} = ` : ""}${condTotal}.`,
          `Count the members of that group with the outcome: ${condIdx.length > 1 ? `${condIdx.map((c) => at(c, ei)).join(" + ")} = ` : ""}${joint}.`,
          `Divide: ${shownAnswer}.`,
        ],
        principles: CONDITIONAL_PRINCIPLES,
        trap: `Dividing by the grand total (${N}) or by the outcome's total (${eventTotal}) answers a different question.`,
        hint: "After the condition is applied, which people are left to choose from?",
        verify: () => {
          // Rebuild the full table from what is displayed, then count.
          const cells = parseTable(content);
          const header = cells[0];
          const body = cells.slice(1, -1);
          const totalRow = cells[cells.length - 1];
          const grid = ctx.rows.map(() => ctx.cols.map(() => 0));
          const rowSum = ctx.rows.map(() => 0);
          const colSum = ctx.cols.map(() => 0);
          ctx.cols.forEach((label, c) => {
            const column = header.indexOf(label);
            if (column > 0) colSum[c] = parseNumber(totalRow[column]);
          });
          body.forEach((row) => {
            const r = ctx.rows.indexOf(row[0]);
            rowSum[r] = parseNumber(row[row.length - 1]);
            ctx.cols.forEach((label, c) => {
              const column = header.indexOf(label);
              if (column > 0) grid[r][c] = parseNumber(row[column]);
            });
          });
          const grand = parseNumber(totalRow[totalRow.length - 1]);
          const missingRow = ctx.rows.findIndex((label) => !body.some((row) => row[0] === label));
          const missingCol = ctx.cols.findIndex((label) => header.indexOf(label) < 0);
          if (missingCol >= 0) {
            colSum[missingCol] = grand - sum(colSum);
            ctx.rows.forEach((_, r) => {
              if (r !== missingRow) grid[r][missingCol] = rowSum[r] - sum(grid[r]);
            });
          }
          if (missingRow >= 0) {
            rowSum[missingRow] = grand - sum(rowSum);
            ctx.cols.forEach((_, c) => {
              grid[missingRow][c] = colSum[c] - sum(grid.map((row) => row[c]));
            });
          }
          const people = [];
          grid.forEach((row, r) => row.forEach((count, c) => {
            for (let copy = 0; copy < count; copy += 1) people.push([r, c]);
          }));
          const inCondition = people.filter(([r, c]) => condIdx.includes(onRow ? r : c));
          const hits = inCondition.filter(([r, c]) => (onRow ? c : r) === ei);
          return people.length === N && S.approx(hits.length / inCondition.length, joint / condTotal);
        },
      });
    });
  }

  const SOURCES = [
    {
      intro: (N, s1, r1, r2) =>
        `Last week, machine P made ${s1}% of the ${fmt(N)} parts produced at a factory, and machine Q made the rest. ` +
        `Of the parts made by machine P, ${r1}% were defective, and of the parts made by machine Q, ${r2}% were defective.`,
      groups: ["machine P", "machine Q"], things: "parts",
      cond: ["one of the defective parts", "one of the parts that were not defective"],
      end: ["it was made by machine P", "it was made by machine Q"],
      has: ["is defective", "is not defective"], from: ["made by machine P", "made by machine Q"],
    },
    {
      intro: (N, s1, r1, r2) =>
        `Of the ${fmt(N)} packages a courier delivered in March, ${s1}% were shipped by ground and the rest were shipped by air. ` +
        `Of the ground packages, ${r1}% arrived late, and of the air packages, ${r2}% arrived late.`,
      groups: ["ground", "air"], things: "packages",
      cond: ["one of the packages that arrived late", "one of the packages that arrived on time"],
      end: ["it was shipped by ground", "it was shipped by air"],
      has: ["arrived late", "arrived on time"], from: ["shipped by ground", "shipped by air"],
    },
    {
      intro: (N, s1, r1, r2) =>
        `In a survey of ${fmt(N)} adults who work in a city, ${s1}% live in the city and the rest live in the suburbs. ` +
        `Of those who live in the city, ${r1}% commute by bicycle, and of those who live in the suburbs, ${r2}% commute by bicycle.`,
      groups: ["the city", "the suburbs"], things: "respondents",
      cond: ["a respondent who commutes by bicycle", "a respondent who does not commute by bicycle"],
      end: ["the respondent lives in the city", "the respondent lives in the suburbs"],
      has: ["commutes by bicycle", "does not commute by bicycle"], from: ["who live in the city", "who live in the suburbs"],
    },
    {
      intro: (N, s1, r1, r2) =>
        `A nursery planted ${fmt(N)} seeds, ${s1}% from supplier A and the rest from supplier B. ` +
        `Of the seeds from supplier A, ${r1}% sprouted, and of the seeds from supplier B, ${r2}% sprouted.`,
      groups: ["supplier A", "supplier B"], things: "seeds",
      cond: ["one of the seeds that sprouted", "one of the seeds that did not sprout"],
      end: ["it came from supplier A", "it came from supplier B"],
      has: ["sprouted", "did not sprout"], from: ["from supplier A", "from supplier B"],
    },
  ];

  function conditionalWords(t, numeric) {
    const ctx = t.pick(SOURCES);
    return retry(() => {
      const N = t.int(4, 60) * 100;
      const s1 = t.pick([20, 25, 30, 35, 40, 45, 55, 60, 65, 70, 75, 80]);
      const r1 = t.int(2, 40);
      const r2 = t.int(2, 40);
      if (Math.abs(r1 - r2) < 3) return null;
      const g1 = (N * s1) / 100;
      const g2 = N - g1;
      const a1 = (g1 * r1) / 100;
      const a2 = (g2 * r2) / 100;
      if (!Number.isInteger(g1) || !Number.isInteger(a1) || !Number.isInteger(a2)) return null;
      const yes = t.chance(0.7);
      const gi = t.int(0, 1);
      const inGroup = yes ? [a1, a2] : [g1 - a1, g2 - a2];
      const condTotal = inGroup[0] + inGroup[1];
      const hit = inGroup[gi];
      const key = frac(hit, condTotal);
      const rate = gi === 0 ? r1 : r2;
      const share = gi === 0 ? s1 : 100 - s1;
      const wrong = offer(key, [
        [frac(yes ? rate : 100 - rate, 100), `Gives the probability that one of the ${ctx.things} ${ctx.from[gi]} ${ctx.has[yes ? 0 : 1]}: the reverse condition.`],
        [frac(hit, N), `Divides by all ${fmt(N)} ${ctx.things} instead of only the ${fmt(condTotal)} that meet the condition.`],
        [frac(share, 100), `Gives the share of all ${ctx.things} that were ${ctx.from[gi]}, ignoring the condition.`],
        [frac(inGroup[1 - gi], condTotal), `Finds the probability for the ${ctx.things} ${ctx.from[1 - gi]} instead.`],
      ]);
      if (wrong.length < 3) return null;
      const decimal = tidy(hit / condTotal);
      const asNumber = numeric && fitsGrid(decimal) && isClean(decimal, 3);
      return finish(asNumber, {
        stimulus: null,
        stem: `${ctx.intro(N, s1, r1, r2)} If ${ctx.cond[yes ? 0 : 1]} is selected at random, what is the probability that ${ctx.end[gi]}?`,
        correct: asNumber ? decimal : key,
        wrong,
        explanation:
          `Turn the percents into counts: ${fmt(g1)} from ${ctx.groups[0]} and ${fmt(g2)} from ${ctx.groups[1]}; of these, ` +
          `${fmt(inGroup[0])} and ${fmt(inGroup[1])} meet the condition. So the probability is ${fmt(hit)}/${fmt(condTotal)} = ${asNumber ? num(decimal) : key}.`,
        steps: [
          `Split the ${fmt(N)} ${ctx.things}: ${s1}% gives ${fmt(g1)} and ${fmt(g2)}.`,
          `Apply each group's own rate: ${fmt(inGroup[0])} and ${fmt(inGroup[1])} meet the condition.`,
          `The condition leaves ${fmt(condTotal)} ${ctx.things} to choose from.`,
          `Of those, ${fmt(hit)} are from ${ctx.groups[gi]}: ${fmt(hit)}/${fmt(condTotal)} = ${asNumber ? num(decimal) : key}.`,
        ],
        principles: CONDITIONAL_PRINCIPLES,
        trap: `The ${rate}% rate is a probability given the source; the question gives the outcome and asks for the source, the reverse.`,
        hint: "Imagine the actual counts. After the condition is applied, which items remain?",
        verify: () => {
          let hits = 0;
          let pool = 0;
          for (let item = 0; item < N; item += 1) {
            const group = item < g1 ? 0 : 1;
            const rank = group === 0 ? item : item - g1;
            const has = rank < (group === 0 ? a1 : a2);
            if (has === yes) {
              pool += 1;
              if (group === gi) hits += 1;
            }
          }
          return pool === condTotal && S.approx(hits / pool, hit / condTotal);
        },
      });
    });
  }

  const CELLS = [
    {
      intro: "The table shows the results of a survey of the residents of a town about a proposed dog park.",
      rowHead: "Housing", rows: ["Homeowner", "Renter"], cols: ["Support", "Oppose"],
      rowCond: ["a homeowner", "a renter"], rowEvent: ["the resident is a homeowner", "the resident is a renter"],
      colCond: ["a resident who supports the park", "a resident who opposes the park"],
      colEvent: ["the resident supports the park", "the resident opposes the park"],
      pick: "resident",
    },
    {
      intro: "The table shows the plants in a greenhouse, by where they were grown and whether they flowered.",
      rowHead: "Location", rows: ["Sun", "Shade"], cols: ["Flowered", "Did not flower"],
      rowCond: ["a plant grown in the sun", "a plant grown in the shade"], rowEvent: ["the plant was grown in the sun", "the plant was grown in the shade"],
      colCond: ["a plant that flowered", "a plant that did not flower"],
      colEvent: ["the plant flowered", "the plant did not flower"],
      pick: "plant",
    },
    {
      intro: "The table shows the tickets sold for a play, by showing and ticket type.",
      rowHead: "Showing", rows: ["Matinee", "Evening"], cols: ["Child", "Adult"],
      rowCond: ["a matinee ticket", "an evening ticket"], rowEvent: ["it is for a matinee", "it is for an evening showing"],
      colCond: ["a child ticket", "an adult ticket"], colEvent: ["it is a child ticket", "it is an adult ticket"],
      pick: "ticket",
    },
    {
      intro: "The table shows the results of a safety inspection of the vehicles in a company's fleet.",
      rowHead: "Type", rows: ["Sedan", "Van"], cols: ["Passed", "Failed"],
      rowCond: ["a sedan", "a van"], rowEvent: ["the vehicle is a sedan", "the vehicle is a van"],
      colCond: ["a vehicle that passed", "a vehicle that failed"], colEvent: ["the vehicle passed", "the vehicle failed"],
      pick: "vehicle",
    },
  ];

  function conditionalMissingCell(t, numeric) {
    const ctx = t.pick(CELLS);
    return retry(() => {
      const grid = [[t.int(6, 60), t.int(6, 60)], [t.int(6, 60), t.int(6, 60)]];
      const hr = t.int(0, 1);
      const hc = t.int(0, 1);
      const x = grid[hr][hc];
      const onRow = t.chance(0.5);
      // The condition is the line (row or column) that contains x.
      const line = onRow ? [grid[hr][0], grid[hr][1]] : [grid[0][hc], grid[1][hc]];
      const xPos = onRow ? hc : hr;
      const e = t.int(0, 1);
      const lineTotal = line[0] + line[1];
      const [p, q] = [line[e] / S.gcd(line[e], lineTotal), lineTotal / S.gcd(line[e], lineTotal)];
      if (q > 25 || q < 3) return null;
      const other = line[1 - xPos];
      const outside = sum(grid.flat()) - lineTotal;
      const f = p / q;
      const candidates = [];
      // The given probability assigned to the other category of the line.
      const swapped = e === xPos ? (other * (1 - f)) / f : (other * f) / (1 - f);
      if (Number.isInteger(tidy(swapped)) && swapped > 0) candidates.push([num(tidy(swapped)), "Assigns the given probability to the other category in the condition."]);
      // Everyone in the table as the denominator.
      const grand = e === xPos ? (f * (other + outside)) / (1 - f) : other / f - other - outside;
      if (Number.isInteger(tidy(grand)) && grand > 0) candidates.push([num(tidy(grand)), "Uses the whole table as the denominator instead of only the group in the condition."]);
      candidates.push([num(lineTotal), `Stops at the total of the condition's ${onRow ? "row" : "column"}, x + ${other}, instead of x.`]);
      // Reading p/q as a part-to-part ratio (the outcome to the rest of the line).
      const odds = e === xPos ? other * f : other / f;
      if (Number.isInteger(tidy(odds)) && odds > 0) candidates.push([num(tidy(odds)), `Treats ${p}/${q} as the ratio of the two cells in the ${onRow ? "row" : "column"} instead of a part of its total.`]);
      const wrong = offer(num(x), candidates);
      if (!numeric && wrong.length < 3) return null;
      const shown = grid.map((row, r) => row.map((value, c) => (r === hr && c === hc ? "x" : value)));
      const decimalOk = isClean(f, 2);
      const given = decimalOk && t.chance(0.4) ? num(f) : `${p}/${q}`;
      const cond = onRow ? ctx.rowCond[hr] : ctx.colCond[hc];
      const event = onRow ? ctx.colEvent[e] : ctx.rowEvent[e];
      const eq = e === xPos ? `x/(x + ${other}) = ${p}/${q}` : `${other}/(x + ${other}) = ${p}/${q}`;
      return finish(numeric, {
        stimulus: { type: "table", content: table([ctx.rowHead, ...ctx.cols], shown.map((row, r) => [ctx.rows[r], ...row])) },
        stem: `${ctx.intro} If ${cond} is selected at random, the probability that ${event} is ${given}. What is the value of x?`,
        correct: x,
        wrong,
        explanation:
          `Only the ${onRow ? "row" : "column"} containing x matters: it holds x + ${other} in all. The probability gives ` +
          `${eq}, and solving gives x = ${x}.`,
        steps: [
          `The condition restricts the choice to the ${onRow ? "row" : "column"} with x, whose total is x + ${other}.`,
          `The outcome's count in that ${onRow ? "row" : "column"} is ${e === xPos ? "x" : other}.`,
          `Set up the equation: ${eq}.`,
          `Solve: x = ${x}.`,
        ],
        principles: CONDITIONAL_PRINCIPLES,
        trap: "Using the whole table as the denominator, or giving the probability to the other category, produces a different x.",
        hint: "Which cells can be selected once the condition is applied?",
        verify: () => {
          const filled = shown.map((row) => row.map((value) => (value === "x" ? x : value)));
          const picks = onRow ? filled[hr] : [filled[0][hc], filled[1][hc]];
          return S.approx(picks[e] / (picks[0] + picks[1]), p / q);
        },
      });
    });
  }

  const conditionalTwoWay = {
    id: "conditional-two-way",
    domain: DOMAIN,
    skill: "Probability",
    subskill: "conditional probability",
    title: "Conditional probability from a two-way table",
    recognize:
      "The condition decides the denominator: count only the group named after \"given\" (or selected from), and read the " +
      "outcome inside that group; percents given for one direction must be turned into counts before the reverse question.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["percent-base", "reversed-condition", "wrong-quantity", "part-vs-whole"],
    build(t) {
      const form = t.int(0, 2);
      if (form === 0) return { estimatedSeconds: 110, ...conditionalTable(t, t.chance(0.4)) };
      if (form === 1) return { estimatedSeconds: 115, ...conditionalWords(t, t.chance(0.4)) };
      return { estimatedSeconds: 110, ...conditionalMissingCell(t, t.chance(0.55)) };
    },
  };

  /* ===================================================== multi-unit-rate */

  const UNIT_PRINCIPLES = [
    "Area conversion factors are squared and volume factors are cubed: 1 square yard = 9 square feet, 1 cubic yard = 27 cubic feet.",
    "When whole items must cover or hold an amount, round up: rounding down leaves part of the job undone.",
  ];

  const COVER_YARDS = [
    { region: "A rectangular lawn", noun: "lawn", item: "bag", items: "bags", coverage: "Each bag of fertilizer treats", verb: "treat" },
    { region: "A rectangular gym floor", noun: "floor", item: "can", items: "cans", coverage: "Each can of floor finish covers", verb: "cover" },
    { region: "A rectangular parking lot", noun: "lot", item: "drum", items: "drums", coverage: "Each drum of sealant covers", verb: "seal" },
    { region: "A rectangular field", noun: "field", item: "pallet", items: "pallets", coverage: "Each pallet of sod covers", verb: "cover" },
  ];

  const TILE_ROOMS = [
    { region: "A rectangular kitchen floor", tile: "tiles" },
    { region: "A rectangular patio", tile: "pavers" },
    { region: "A rectangular hallway floor", tile: "tiles" },
    { region: "A rectangular basement floor", tile: "tiles" },
  ];

  function unitsArea(t, numeric) {
    if (t.chance(0.5)) {
      const ctx = t.pick(COVER_YARDS);
      return retry(() => {
        const L = t.int(10, 80) * 3;
        const W = t.int(8, 50) * 3;
        const C = t.pick([40, 50, 60, 75, 80, 100, 120, 150, 200, 250]);
        const sqFt = L * W;
        const sqYd = sqFt / 9;
        const exact = sqYd / C;
        if (Number.isInteger(exact) || exact < 2 || exact > 90) return null;
        const key = Math.ceil(exact);
        const tail = t.shuffle([
          [num(Math.ceil(sqFt / C)), "Treats the area in square feet as if it were in square yards."],
          [num(sqYd), `Stops at the area in square yards, ${fmt(sqYd)}, without dividing by the coverage of one ${ctx.item}.`],
        ]);
        const wrong = offer(num(key), [
          [num(Math.ceil(sqFt / 3 / C)), "Divides square feet by 3, but a square yard is 3 × 3 = 9 square feet."],
          [num(Math.floor(exact)), `Rounds ${about(exact)} down, which would leave part of the ${ctx.noun} untreated.`],
          ...tail,
        ]);
        if (!numeric && wrong.length < 3) return null;
        return finish(numeric, {
          stimulus: null,
          stem:
            `${ctx.region} measures ${L} feet by ${W} feet. ${ctx.coverage} ${C} square yards. What is the least number of ` +
            `${ctx.items} needed to ${ctx.verb} the entire ${ctx.noun}? (1 yard = 3 feet)`,
          correct: key,
          wrong,
          explanation:
            `The ${ctx.noun} is ${L / 3} yards by ${W / 3} yards, so its area is ${fmt(sqYd)} square yards. ` +
            `${fmt(sqYd)} ÷ ${C} = ${about(exact)}, and a partial ${ctx.item} still has to be bought, so ${key} ${ctx.items} are needed.`,
          steps: [
            `Convert each side to yards: ${L} ÷ 3 = ${L / 3} and ${W} ÷ 3 = ${W / 3}.`,
            `Area: ${L / 3} × ${W / 3} = ${fmt(sqYd)} square yards (equivalently, ${fmt(sqFt)} ÷ 9).`,
            `${ctx.items.charAt(0).toUpperCase() + ctx.items.slice(1)}: ${fmt(sqYd)} ÷ ${C} = ${about(exact)}.`,
            `Round up to cover everything: ${key}.`,
          ],
          principles: UNIT_PRINCIPLES,
          trap: "Converting square feet with the linear factor 3, or rounding the quotient down, gives an offered but wrong count.",
          hint: "How many square feet are in one square yard?",
          verify: () => {
            const yards = (L / 3) * (W / 3);
            return (key - 1) * C < yards && yards <= key * C;
          },
        });
      });
    }
    const ctx = t.pick(TILE_ROOMS);
    return retry(() => {
      const s = t.pick([4, 6, 8, 9, 16, 18]);
      const L = t.int(6, 30);
      const W = t.int(5, 24);
      if ((12 * L) % s || (12 * W) % s) return null;
      const tiles = ((12 * L) / s) * ((12 * W) / s);
      const k = t.pick([10, 12, 15, 20, 24, 25, 30, 40]);
      if (tiles % k === 0) return null;
      const key = Math.ceil(tiles / k);
      if (key > 999) return null;
      const linear = Math.ceil((L * W * 12) / (s * s) / k);
      const wrong = offer(num(key), [
        [num(linear), "Converts square feet to square inches by multiplying by 12 instead of 12 × 12 = 144."],
        [num(Math.floor(tiles / k)), `Rounds ${about(tiles / k)} down, which leaves the floor short of ${ctx.tile}.`],
        [num(tiles), `Stops at the number of ${ctx.tile}, ${fmt(tiles)}, instead of the number of boxes.`],
      ]);
      if (!numeric && wrong.length < 3) return null;
      return finish(numeric, {
        stimulus: null,
        stem:
          `${ctx.region} measures ${L} feet by ${W} feet. It will be covered, with no gaps, overlaps, or cut pieces, by square ` +
          `${ctx.tile} that are ${s} inches on each side. The ${ctx.tile} are sold only in boxes of ${k}. What is the least ` +
          `number of boxes needed? (1 foot = 12 inches)`,
        correct: key,
        wrong,
        explanation:
          `In inches it measures ${12 * L} by ${12 * W}, so it takes ${(12 * L) / s} × ${(12 * W) / s} = ${fmt(tiles)} ${ctx.tile}. ` +
          `${fmt(tiles)} ÷ ${k} = ${about(tiles / k)}, and a partly used box must still be bought: ${key} boxes.`,
        steps: [
          `Convert the sides to inches: ${L} × 12 = ${12 * L} and ${W} × 12 = ${12 * W}.`,
          `Count ${ctx.tile} along each side: ${(12 * L) / s} and ${(12 * W) / s}.`,
          `Total ${ctx.tile}: ${fmt(tiles)}; boxes: ${fmt(tiles)} ÷ ${k} = ${about(tiles / k)}.`,
          `Round up: ${key} boxes.`,
        ],
        principles: UNIT_PRINCIPLES,
        trap: "Multiplying the area in square feet by 12 converts only one dimension; a square foot is 144 square inches.",
        hint: "How many square inches are in one square foot?",
        verify: () => {
          const areaInches = 144 * L * W;
          const count = areaInches / (s * s);
          return count === tiles && (key - 1) * k < count && count <= key * k;
        },
      });
    });
  }

  const SLABS = [
    { region: "A rectangular concrete patio", noun: "patio" },
    { region: "A rectangular concrete driveway", noun: "driveway" },
    { region: "A rectangular garage floor", noun: "floor" },
    { region: "A rectangular concrete basketball court", noun: "court" },
  ];

  function unitsVolume(t, numeric) {
    if (t.chance(0.5)) {
      const ctx = t.pick(SLABS);
      return retry(() => {
        const L = t.int(10, 60);
        const W = t.int(4, 30);
        const T = t.pick([3, 4, 5, 6, 8]);
        const cubicFeet = (L * W * T) / 12;
        const cubicYards = cubicFeet / 27;
        if (Number.isInteger(cubicYards) || cubicYards < 1.2 || cubicYards > 60) return null;
        const key = Math.ceil(cubicYards);
        const candidates = [
          [num(Math.ceil(cubicFeet / 9)), "Divides cubic feet by 9, the square-yard factor; a cubic yard is 3 × 3 × 3 = 27 cubic feet."],
          [num(Math.floor(cubicYards)), `Rounds ${about(cubicYards)} down, which would not be enough concrete.`],
          [num(Math.ceil((L * W * T) / 27)), `Uses the thickness, ${T} inches, as if it were ${T} feet.`],
        ];
        if (Number.isInteger(cubicFeet)) candidates.push([num(cubicFeet), "Stops at the volume in cubic feet."]);
        const wrong = offer(num(key), candidates);
        if (!numeric && wrong.length < 3) return null;
        return finish(numeric, {
          stimulus: null,
          stem:
            `${ctx.region} will be ${L} feet long, ${W} feet wide, and ${T} inches thick. Concrete is sold only in whole cubic ` +
            `yards. What is the least number of cubic yards of concrete that must be bought to pour the ${ctx.noun}? ` +
            `(1 yard = 3 feet and 1 foot = 12 inches)`,
          correct: key,
          wrong,
          explanation:
            `The thickness is ${T}/12 foot, so the volume is ${L} × ${W} × ${T}/12 = ${about(cubicFeet)} cubic feet. A cubic ` +
            `yard is 27 cubic feet, so that is ${about(cubicYards)} cubic yards; buying whole cubic yards means ${key}.`,
          steps: [
            `Convert the thickness: ${T} inches = ${frac(T, 12)} foot.`,
            `Volume: ${L} × ${W} × ${frac(T, 12)} = ${about(cubicFeet)} cubic feet.`,
            `Convert: ${about(cubicFeet)} ÷ 27 = ${about(cubicYards)} cubic yards.`,
            `Round up to whole cubic yards: ${key}.`,
          ],
          principles: UNIT_PRINCIPLES,
          trap: "A cubic yard is 27 cubic feet, not 9, and the thickness is in inches, not feet.",
          hint: "Put every length in the same unit before multiplying. How many cubic feet make a cubic yard?",
          verify: () => {
            const yards = (L / 3) * (W / 3) * (T / 36);
            return key - 1 < yards - 1e-9 && yards <= key + 1e-9;
          },
        });
      });
    }
    return retry(() => {
      const L = t.pick([60, 75, 80, 90, 100, 120]);
      const W = t.pick([30, 35, 40, 45, 50]);
      const H = t.pick([40, 45, 50, 60]);
      const g = t.pick([5, 8, 10, 12]);
      const c = t.pick([4, 5, 7.5, 8, 10, 12]);
      const depth = H - g;
      const liters = (L * W * depth) / 1000;
      const exact = liters / c;
      if (isClean(exact, 0) || exact < 3) return null;
      const key = Math.ceil(exact);
      const wrong = offer(num(key), [
        [num(Math.ceil((L * W * depth) / 100 / c)), "Divides cubic centimeters by 100 instead of 1,000 to get liters."],
        [num(Math.floor(exact)), `Rounds ${about(exact)} down, which leaves the water short of the level.`],
        [num(Math.ceil((L * W * H) / 1000 / c)), `Fills the aquarium to the top instead of to ${g} centimeters below it.`],
        [num(tidy(liters)), `Stops at the volume in liters, ${num(tidy(liters))}, instead of the number of fillings.`],
      ]);
      if (!numeric && wrong.length < 3) return null;
      return finish(numeric, {
        stimulus: null,
        stem:
          `The interior of a rectangular aquarium is ${L} centimeters long, ${W} centimeters wide, and ${H} centimeters tall. ` +
          `It will be filled with water to a level ${g} centimeters below the top, using a bucket that holds ${num(c)} liters. ` +
          `What is the least number of times the bucket must be filled? (1 liter = 1,000 cubic centimeters)`,
        correct: key,
        wrong,
        explanation:
          `The water is ${depth} centimeters deep, so its volume is ${L} × ${W} × ${depth} = ${fmt(L * W * depth)} cubic ` +
          `centimeters, or ${num(tidy(liters))} liters. ${num(tidy(liters))} ÷ ${num(c)} = ${about(exact)}, so the bucket must be filled ${key} times.`,
        steps: [
          `Water depth: ${H} ${MINUS} ${g} = ${depth} centimeters.`,
          `Volume: ${L} × ${W} × ${depth} = ${fmt(L * W * depth)} cubic centimeters = ${num(tidy(liters))} liters.`,
          `Fillings: ${num(tidy(liters))} ÷ ${num(c)} = ${about(exact)}.`,
          `Round up: ${key}.`,
        ],
        principles: UNIT_PRINCIPLES,
        trap: "A liter is a 10-centimeter cube, 1,000 cubic centimeters; and the water stops below the top.",
        hint: "Find the volume of the water, not of the tank, then change units.",
        verify: () => {
          const litersCheck = (L / 10) * (W / 10) * (depth / 10);
          return (key - 1) * c < litersCheck && litersCheck <= key * c;
        },
      });
    });
  }

  function unitsRain(t, numeric) {
    return retry(() => {
      const L = t.int(6, 20);
      const W = t.int(4, 15);
      const r = t.pick([2, 3, 4, 5, 6, 8, 10, 12]);
      const h = t.int(2, 6);
      const B = t.pick([150, 180, 200, 208, 220, 250]);
      const liters = L * W * r * h;
      const exact = liters / B;
      if (Number.isInteger(exact) || exact < 2 || exact > 99) return null;
      const key = Math.ceil(exact);
      const wrong = offer(num(key), [
        [num(Math.ceil((10 * liters) / B)), "Converts millimeters to meters by dividing by 100 instead of 1,000."],
        [num(Math.floor(exact)), `Rounds ${about(exact)} down, which leaves some water with nowhere to go.`],
        [num(Math.ceil((L * W * r) / B)), `Uses the rain from one hour only, ignoring the ${h}-hour duration.`],
        [num(liters), `Stops at the volume of rain in liters, ${fmt(liters)}.`],
      ]);
      if (!numeric && wrong.length < 3) return null;
      const depthMm = r * h;
      return finish(numeric, {
        stimulus: null,
        stem:
          `Rain fell at a constant rate of ${r} millimeters per hour for ${h} hours on a flat rectangular roof that measures ` +
          `${L} meters by ${W} meters. All of the rain that fell on the roof was collected in barrels that each hold ${B} ` +
          `liters. What is the least number of barrels needed to hold all of the collected rain? ` +
          `(1 meter = 1,000 millimeters and 1 cubic meter = 1,000 liters)`,
        correct: key,
        wrong,
        explanation:
          `In ${h} hours, ${r} × ${h} = ${depthMm} millimeters, or ${num(depthMm / 1000)} meter, of rain fell. The volume is ` +
          `${L} × ${W} × ${num(depthMm / 1000)} = ${num(tidy(liters / 1000))} cubic meters = ${fmt(liters)} liters, and ` +
          `${fmt(liters)} ÷ ${B} = ${about(exact)}, so ${key} barrels are needed.`,
        steps: [
          `Depth of rain: ${r} × ${h} = ${depthMm} millimeters = ${num(depthMm / 1000)} meter.`,
          `Volume: ${L} × ${W} × ${num(depthMm / 1000)} = ${num(tidy(liters / 1000))} cubic meters.`,
          `In liters: ${num(tidy(liters / 1000))} × 1,000 = ${fmt(liters)}; barrels: ${fmt(liters)} ÷ ${B} = ${about(exact)}.`,
          `Round up: ${key}.`,
        ],
        principles: UNIT_PRINCIPLES,
        trap: "Millimeters convert to meters by 1,000, the rate runs for several hours, and a partly filled barrel still counts.",
        hint: "What volume of water does the rain form over the whole roof?",
        verify: () => {
          const areaMm2 = L * 1000 * W * 1000;
          const cubicMm = areaMm2 * depthMm;
          const litersCheck = cubicMm / 1e6;
          return (key - 1) * B < litersCheck && litersCheck <= key * B;
        },
      });
    });
  }

  const multiUnitRate = {
    id: "multi-unit-rate",
    domain: DOMAIN,
    skill: "Ratios, rates, and units",
    subskill: "unit conversion",
    title: "Multi-step conversions with area and volume units",
    recognize:
      "Area and volume units convert by the square and the cube of the length factor, every quantity must be in one unit " +
      "system before combining, and a count of whole containers rounds up.",
    rubric: { steps: 2, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 2, trap: 2 },
    tricks: ["unit-mismatch", "rounding-direction", "intermediate-value", "wrong-quantity"],
    build(t) {
      const form = t.int(0, 2);
      const numeric = t.chance(0.45);
      const instance = [unitsArea, unitsVolume, unitsRain][form](t, numeric);
      return { estimatedSeconds: 110, ...instance };
    },
  };

  /* ==================================================== sample-inference */

  const POLLS = [
    { sampler: "A polling group", pop: "registered voters in a city", popShort: "registered voters in the city", attr: "support a proposed park tax", notAttr: "do not support the tax", step: 500, low: 16, high: 120 },
    { sampler: "The student government", pop: "students at a university", popShort: "students at the university", attr: "ride the campus shuttle at least once a week", notAttr: "do not ride the shuttle that often", step: 500, low: 10, high: 80 },
    { sampler: "A county agency", pop: "households in a county", popShort: "households in the county", attr: "grow some of their own vegetables", notAttr: "do not grow any of their own vegetables", step: 500, low: 12, high: 100 },
    { sampler: "A large company", pop: "employees of the company", popShort: "employees of the company", attr: "would join a carpool program", notAttr: "would not join the program", step: 250, low: 12, high: 60 },
    { sampler: "A bank", pop: "customers of the bank", popShort: "customers of the bank", attr: "deposit checks using a phone app", notAttr: "do not deposit checks that way", step: 500, low: 20, high: 120 },
  ];

  function inferenceRange(t, numeric) {
    const ctx = t.pick(POLLS);
    return retry(() => {
      const N = t.int(ctx.low, ctx.high) * ctx.step;
      const n = t.pick([200, 250, 300, 400, 500, 600, 800, 1000]);
      const p = t.int(12, 88);
      const m = t.int(2, 6);
      if ((n * p) % 100) return null;
      const lo = (N * (p - m)) / 100;
      const hi = (N * (p + m)) / 100;
      if (!Number.isInteger(lo) || !Number.isInteger(hi)) return null;
      const between = (a, b) => `Between ${fmt(a)} and ${fmt(b)}`;
      const key = between(lo, hi);
      const sampleLo = (n * (p - m)) / 100;
      const sampleHi = (n * (p + m)) / 100;
      const relLo = (N * p * (100 - m)) / 10000;
      const relHi = (N * p * (100 + m)) / 10000;
      const candidates = t.shuffle([
        Number.isInteger(sampleLo) && Number.isInteger(sampleHi)
          ? [between(sampleLo, sampleHi), `Applies the interval to the ${fmt(n)} people surveyed instead of all ${fmt(N)} ${ctx.popShort}.`] : null,
        Number.isInteger(relLo) && Number.isInteger(relHi)
          ? [between(relLo, relHi), `Treats the margin of error as ${m}% of the estimate instead of ${m} percentage points.`] : null,
        [between((N * (100 - p - m)) / 100, (N * (100 - p + m)) / 100), `Gives the plausible number who ${ctx.notAttr}, the opposite group.`],
      ].filter(Boolean));
      candidates.push([`Exactly ${fmt((N * p) / 100)}`, "Treats the sample estimate as the exact population value, ignoring the margin of error."]);
      const wrong = offer(key, candidates);
      if (!numeric && wrong.length < 3) return null;
      const greatest = t.chance(0.5);
      const ask = numeric
        ? `Based on these results, what is the ${greatest ? "greatest" : "least"} plausible number of ${ctx.popShort} who ${ctx.attr}?`
        : `Based on these results, which of the following ranges is most plausible for the number of ${ctx.popShort} who ${ctx.attr}?`;
      const answer = greatest ? hi : lo;
      return finish(numeric, {
        stimulus: null,
        stem:
          `${ctx.sampler} surveyed a random sample of ${fmt(n)} of the ${fmt(N)} ${ctx.pop}. Of those surveyed, ${p}% said they ` +
          `${ctx.attr}. The margin of error for this estimate is ${m} percentage points. ${ask}`,
        correct: numeric ? answer : key,
        wrong,
        explanation:
          `The plausible population percent is ${p}% ± ${m} percentage points, from ${p - m}% to ${p + m}%. Applied to all ` +
          `${fmt(N)} ${ctx.pop}, that is ${fmt(lo)} to ${fmt(hi)}.`,
        steps: [
          `Plausible percent for the whole population: ${p} ${MINUS} ${m} = ${p - m} to ${p} + ${m} = ${p + m}.`,
          `Apply the lower percent to the population: ${p - m}% of ${fmt(N)} = ${fmt(lo)}.`,
          `Apply the upper percent: ${p + m}% of ${fmt(N)} = ${fmt(hi)}.`,
          numeric ? `The ${greatest ? "greatest" : "least"} plausible number is ${fmt(answer)}.` : `The plausible range is ${fmt(lo)} to ${fmt(hi)}.`,
        ],
        principles: [
          "A margin of error in percentage points is added to and subtracted from the sample percent itself.",
          "A random sample's estimate describes the population it was drawn from, so apply it to the population's size, not the sample's.",
        ],
        trap: `The ${fmt(n)} people surveyed are only the sample; the estimate is about all ${fmt(N)} ${ctx.pop}.`,
        hint: "The estimate and its margin describe a percent of which group?",
        verify: () => {
          // The interval must be centred on the point estimate for the whole
          // population, with a half-width of m percentage points of N.
          const [a, b] = numeric ? [answer, greatest ? answer - (2 * N * m) / 100 : answer + (2 * N * m) / 100].sort((x, y) => x - y)
            : key.replace(/,/g, "").match(/\d+/g).map(Number);
          return S.approx((a + b) / 2, (N * p) / 100) && S.approx((b - a) / 2, (N * m) / 100) &&
            wrong.every(([text]) => text !== key);
        },
      });
    });
  }

  const SCOPES = [
    {
      intro: (n, p) => `A fitness club surveyed a random sample of ${n} of its members, and ${p}% of them said they would use a new pool.`,
      pop: "the club's members", wider: "all adults in the city", sampled: "the members surveyed", verb: "would use the pool",
    },
    {
      intro: (n, p) => `A school newspaper surveyed a random sample of ${n} of the school's students, and ${p}% of them said they eat breakfast daily.`,
      pop: "the school's students", wider: "all students in the state", sampled: "the students surveyed", verb: "eat breakfast daily",
    },
    {
      intro: (n, p) => `An online store surveyed a random sample of ${n} of its customers, and ${p}% of them said they want faster shipping.`,
      pop: "the store's customers", wider: "customers of all stores", sampled: "the customers surveyed", verb: "want faster shipping",
    },
    {
      intro: (n, p) => `A town surveyed a random sample of ${n} of its households, and ${p}% of them reported owning a pet.`,
      pop: "the town's households", wider: "all households in the state", sampled: "the households surveyed", verb: "own a pet",
    },
    {
      intro: (n, p) => `An airline surveyed a random sample of ${n} of its passengers, and ${p}% of them said they want window seats.`,
      pop: "the airline's passengers", wider: "passengers on all airlines", sampled: "the passengers surveyed", verb: "want window seats",
    },
  ];

  function inferenceConclusion(t) {
    const ctx = t.pick(SCOPES);
    const n = t.pick([150, 200, 250, 300, 400, 500]);
    const p = t.int(15, 85);
    const m = t.int(3, 7);
    const lo = p - m;
    const hi = p + m;
    const key = `It is plausible that between ${lo}% and ${hi}% of ${ctx.pop} ${ctx.verb}.`;
    const pool = t.shuffle([
      [`It is plausible that between ${lo}% and ${hi}% of ${ctx.wider} ${ctx.verb}.`, `Extends the result to ${ctx.wider}, but the sample was drawn only from ${ctx.pop}.`],
      [`It is guaranteed that between ${lo}% and ${hi}% of ${ctx.pop} ${ctx.verb}.`, "A margin of error gives plausible values, not a guarantee; the true percent could fall outside it."],
      [`The margin of error means that ${m}% of ${ctx.sampled} answered inaccurately.`, "Reads the margin of error as a share of wrong answers; it measures the uncertainty of estimating the population from a random sample."],
      [`Exactly ${p}% of ${ctx.pop} ${ctx.verb}.`, "Treats the sample percent as the exact population percent, ignoring the margin of error."],
    ]);
    const wrong = pool.slice(0, 3);
    return finish(false, {
      stimulus: null,
      stem: `${ctx.intro(n, p)} The margin of error for this estimate is ${m} percentage points. Which of the following is the most appropriate conclusion?`,
      correct: key,
      wrong,
      explanation:
        `A random sample of ${ctx.pop} supports conclusions about ${ctx.pop} only. The margin of error makes ${lo}% to ${hi}% the ` +
        "plausible range for that population, which is a statement of plausibility, not certainty.",
      steps: [
        `Identify the population sampled: ${ctx.pop}.`,
        `Build the interval: ${p}% ± ${m} gives ${lo}% to ${hi}%.`,
        "Recognize that the interval describes plausible values for the population, not a guarantee and not the sample itself.",
        "Choose the statement that matches both the population and the level of certainty.",
      ],
      principles: [
        "Results from a random sample generalize only to the population that was sampled.",
        "A margin of error gives a range of plausible values for the population; it does not make any value certain.",
      ],
      trap: "The most confident-sounding statements overreach: in scope (a wider population) or in certainty (\"guaranteed\", \"exactly\").",
      hint: "Who could have been chosen for the sample, and how sure can the survey make you?",
      verify: () => {
        // Re-read the survey from the stem, then judge every statement.
        const stem = `${ctx.intro(n, p)} The margin of error for this estimate is ${m} percentage points.`;
        const estimate = Number(stem.match(/(\d+)% of them/)[1]);
        const margin = Number(stem.match(/is (\d+) percentage points/)[1]);
        const supported = (text) => {
          const bounds = text.match(/plausible that between (\d+)% and (\d+)% of (.+?) (?:would|eat|want|own|prefer)/);
          return Boolean(bounds) && Number(bounds[1]) === estimate - margin && Number(bounds[2]) === estimate + margin &&
            bounds[3] === ctx.pop;
        };
        return supported(key) && wrong.every(([text]) => !supported(text));
      },
    });
  }

  const STUDIES = [
    {
      pop: "the company's employees", n: [60, 80, 100, 120],
      designs: {
        sampleAssign: (n) => `Researchers selected ${n} of a large company's employees at random. Half of them, chosen at random, used a sleep app for a month, and the other half did not.`,
        volunteerAssign: (n) => `Researchers asked a large company's employees for volunteers, and ${n} volunteered. Half of the volunteers, chosen at random, used a sleep app for a month, and the other half did not.`,
        sampleSelf: (n) => `Researchers selected ${n} of a large company's employees at random and asked each one whether they had used a sleep app in the past month.`,
        volunteerSelf: (n) => `Researchers asked a large company's employees for volunteers, and ${n} volunteered. Each volunteer reported whether they had used a sleep app in the past month.`,
      },
      assigned: (x) => `The group that used the app slept an average of ${x} minutes more per night than the group that did not.`,
      observed: (x) => `Those who had used the app slept an average of ${x} minutes more per night than those who had not.`,
      x: [18, 22, 25, 30, 35],
      claims: {
        causeAll: "using the app increases sleep for the company's employees in general",
        causePart: "using the app increased sleep for the participants in the study",
        assocAll: "among all the company's employees, those who use the app tend to sleep more",
      },
    },
    {
      pop: "the school's students", n: [80, 100, 120, 150],
      designs: {
        sampleAssign: (n) => `A teacher selected ${n} students at random from a large high school. Half of them, chosen at random, played a vocabulary game daily for a month, and the others did not.`,
        volunteerAssign: (n) => `A teacher asked for volunteers at a large high school, and ${n} students volunteered. Half of them, chosen at random, played a vocabulary game daily for a month, and the others did not.`,
        sampleSelf: (n) => `A teacher selected ${n} students at random from a large high school and asked each one whether they had played a vocabulary game daily in the past month.`,
        volunteerSelf: (n) => `A teacher asked for volunteers at a large high school, and ${n} students volunteered. Each reported whether they had played a vocabulary game daily in the past month.`,
      },
      assigned: (x) => `On a vocabulary quiz, the group that played the game scored an average of ${x} points higher than the group that did not.`,
      observed: (x) => `On a vocabulary quiz, those who had played the game scored an average of ${x} points higher than those who had not.`,
      x: [6, 8, 9, 11, 12],
      claims: {
        causeAll: "playing the game raises vocabulary scores for the school's students in general",
        causePart: "playing the game raised vocabulary scores for the participants in the study",
        assocAll: "among all the school's students, those who play the game tend to score higher",
      },
    },
    {
      pop: "the town's adults", n: [100, 150, 200, 240],
      designs: {
        sampleAssign: (n) => `Researchers selected ${n} adults at random from a town. Half of them, chosen at random, walked for 30 minutes a day for 8 weeks, and the other half did not.`,
        volunteerAssign: (n) => `Researchers asked for volunteers in a town, and ${n} adults volunteered. Half of them, chosen at random, walked for 30 minutes a day for 8 weeks, and the other half did not.`,
        sampleSelf: (n) => `Researchers selected ${n} adults at random from a town and asked each one whether they walk for 30 minutes on most days.`,
        volunteerSelf: (n) => `Researchers asked for volunteers in a town, and ${n} adults volunteered. Each reported whether they walk for 30 minutes on most days.`,
      },
      assigned: (x) => `The walking group's average resting heart rate was ${x} beats per minute lower than that of the other group.`,
      observed: (x) => `The average resting heart rate of those who walk was ${x} beats per minute lower than that of those who do not.`,
      x: [4, 5, 6, 7, 8],
      claims: {
        causeAll: "walking 30 minutes a day lowers resting heart rate for the town's adults in general",
        causePart: "walking 30 minutes a day lowered resting heart rate for the participants in the study",
        assocAll: "among all the town's adults, those who walk 30 minutes on most days tend to have lower resting heart rates",
      },
    },
  ];

  // Kept within two characters of one another so length never marks the key.
  const VERDICTS = {
    yesBoth: "Yes, because the participants were both randomly selected and assigned.",
    yesAssign: "Yes, because the participants were randomly assigned to the two groups.",
    yesSample: "Yes, because the participants were randomly chosen from the population.",
    noSample: "No, because the participants were only volunteers, not a random sample.",
    noAssign: "No, because the participants were not randomly assigned to the groups.",
    yesDiff: "Yes, because the difference between the two group averages was large.",
  };

  // [design, claim, key, [distractor, reason] x3]
  const DESIGN_CASES = [
    ["sampleAssign", "causeAll", "yesBoth", [
      ["noSample", "Misreads the design: the participants were chosen at random, not recruited as volunteers."],
      ["noAssign", "Misreads the design: a random half used the treatment, so the groups were randomly assigned."],
      ["yesDiff", "A large difference alone shows neither cause nor who the result applies to; the design must justify both."],
    ]],
    ["volunteerAssign", "causeAll", "noSample", [
      ["yesAssign", "Random assignment supports cause only for people like the volunteers, who were not a random sample of the population."],
      ["noAssign", "Misreads the design: a random half of the volunteers used the treatment."],
      ["yesDiff", "A large difference cannot make volunteers represent the whole population."],
    ]],
    ["volunteerAssign", "causePart", "yesAssign", [
      ["noSample", "Demands a random sample for a claim about the participants only; random assignment is what supports cause here."],
      ["noAssign", "Misreads the design: a random half of the volunteers used the treatment."],
      ["yesDiff", "The size of the difference is not what rules out other explanations; random assignment is."],
    ]],
    ["sampleSelf", "causeAll", "noAssign", [
      ["yesSample", "Random selection lets the result describe the population, but without random assignment it cannot show cause."],
      ["noSample", "Misreads the design: the participants were selected at random."],
      ["yesDiff", "People who chose the treatment may differ in other ways, however large the difference."],
    ]],
    ["sampleSelf", "assocAll", "yesSample", [
      ["noAssign", "Random assignment is needed to show cause, not to describe an association in a randomly sampled population."],
      ["noSample", "Misreads the design: the participants were selected at random."],
      ["yesDiff", "The size of a difference does not justify extending it beyond the people studied; random selection does."],
    ]],
    ["volunteerSelf", "assocAll", "noSample", [
      ["noAssign", "An association claim does not need random assignment; the problem is that volunteers may not represent the population."],
      ["yesSample", "Misreads the design: the participants were volunteers."],
      ["yesDiff", "A large difference among volunteers says nothing certain about everyone else."],
    ]],
    ["volunteerSelf", "causePart", "noAssign", [
      ["noSample", "The claim is about the participants only, so the lack of a random sample is not the problem; the lack of random assignment is."],
      ["yesAssign", "Misreads the design: each participant chose whether to use the treatment."],
      ["yesDiff", "Participants who chose the treatment may differ in other ways, however large the difference."],
    ]],
  ];

  function inferenceDesign(t) {
    const ctx = t.pick(STUDIES);
    const [design, claim, keyName, distractors] = t.pick(DESIGN_CASES);
    const n = t.pick(ctx.n);
    const x = t.pick(ctx.x);
    const assigned = design.endsWith("Assign");
    const randomSample = design.startsWith("sample");
    const causal = claim.startsWith("cause");
    const whole = claim.endsWith("All");
    return finish(false, {
      stimulus: null,
      stem:
        `${ctx.designs[design](n)} ${assigned ? ctx.assigned(x) : ctx.observed(x)} Based on the design of the study, is it ` +
        `appropriate to conclude that ${ctx.claims[claim]}?`,
      correct: VERDICTS[keyName],
      wrong: distractors.map(([name, reason]) => [VERDICTS[name], reason]),
      explanation:
        `The participants were ${randomSample ? "randomly selected" : "volunteers"} and ${assigned ? "were" : "were not"} randomly ` +
        `assigned. A causal claim needs random assignment; a claim about ${ctx.pop} in general needs random selection. ` +
        `This claim is ${causal ? "causal" : "about an association"} and concerns ${whole ? ctx.pop : "only the participants"}, so the answer is: ${VERDICTS[keyName]}`,
      steps: [
        `Classify the claim: ${causal ? "cause and effect" : "association only"}, about ${whole ? "the whole population" : "the participants only"}.`,
        `Check the selection: ${randomSample ? "random, so results can extend to the population" : "volunteers, so results apply only to people like them"}.`,
        `Check the assignment: ${assigned ? "random, so a cause can be inferred" : "self-chosen, so only an association can be inferred"}.`,
        `Match the claim to what the design supports: ${keyName.startsWith("yes") ? "it is supported" : "it is not supported"}.`,
      ],
      principles: [
        "Random assignment to treatments is what allows a cause-and-effect conclusion.",
        "Random selection from a population is what allows a conclusion to extend to that population.",
      ],
      trap: "A true fact about the design can be the wrong reason: random assignment does not justify generalizing, and random selection does not justify cause.",
      hint: "What does this claim need: evidence of cause, a representative sample, or both?",
      verify: () => {
        const needsAssign = causal;
        const needsSample = whole;
        const supported = (!needsAssign || assigned) && (!needsSample || randomSample);
        const keyTrue = keyName.startsWith("yes") === supported;
        // A verdict is right only when its fact is true of this design and its
        // conclusion follows for this claim for exactly that reason.
        const fact = { yesBoth: randomSample && assigned, yesAssign: assigned, yesSample: randomSample, noSample: !randomSample, noAssign: !assigned, yesDiff: true };
        const relevant = {
          yesBoth: supported,
          yesAssign: supported && !needsSample,
          yesSample: supported && !needsAssign,
          noSample: !supported && needsSample && (!needsAssign || assigned),
          noAssign: !supported && needsAssign && (!needsSample || randomSample),
          yesDiff: false,
        };
        const right = (name) => fact[name] && relevant[name];
        return keyTrue && right(keyName) && distractors.every(([name]) => !right(name));
      },
    });
  }

  const sampleInference = {
    id: "sample-inference",
    domain: DOMAIN,
    skill: "Statistical inference",
    subskill: "margin of error",
    title: "What a sample and its margin of error support",
    recognize:
      "A random sample supports plausible values for the population it came from, within the margin of error in percentage " +
      "points; cause needs random assignment, generalizing needs random selection, and nothing is certain.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["must-vs-could", "context-constraint", "reversed-condition", "percent-base"],
    build(t) {
      const form = t.int(0, 2);
      if (form === 0) return { estimatedSeconds: 100, ...inferenceRange(t, t.chance(0.45)) };
      if (form === 1) return { estimatedSeconds: 90, ...inferenceConclusion(t) };
      return { estimatedSeconds: 100, ...inferenceDesign(t) };
    },
  };

  return [successivePercent, weightedMeanGroups, dataChangeStatistics, conditionalTwoWay, multiUnitRate, sampleInference];
});
