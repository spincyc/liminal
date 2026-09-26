(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/problem-solving-and-data-analysis"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Percentages templates (Problem-Solving and Data Analysis), ordered Easy, Medium, Hard.

  const { MINUS, money, article, plural } = S;
  // Every printed number is grouped by thousands ("1,750 milliliters").
  const num = S.grouped;
  const {
    DATA, tidy, isClean, fitsGrid, fmt, shown, retry, pack, close, DOMAIN, offerHard, finish, packRanked,
  } = C;

  // Every modelled mistake that prints as the key redraws the item.
  const packStrict = (numeric, keyValue, keyText, candidates, fields) => pack(numeric, keyValue, keyText, candidates, fields, true);

  // "a 12% increase", "an 18% tip": the article agrees with the number as it is read.
  const aPercent = (value) => `${article(value)} ${num(value)}%`;

  /* ======================================== percent-of-a-quantity (Easy) */

  const COUNT_SCENES = [
    {
      part: (N, p) => `Of the ${fmt(N)} students at a high school, ${p}% walk to school. How many of the students walk to school?`,
      percent: (N, k) => `Of the ${fmt(N)} students at a high school, ${fmt(k)} walk to school. What percent of the students walk to school?`,
      whole: (k, p) => `At a high school, ${fmt(k)} students walk to school, which is ${p}% of the students at the school. How many students are at the school?`,
      no: "students who do not walk to school",
    },
    {
      part: (N, p) => `Of the ${fmt(N)} trees in an orchard, ${p}% are apple trees. How many apple trees are in the orchard?`,
      percent: (N, k) => `Of the ${fmt(N)} trees in an orchard, ${fmt(k)} are apple trees. What percent of the trees in the orchard are apple trees?`,
      whole: (k, p) => `An orchard has ${fmt(k)} apple trees, which is ${p}% of the trees in the orchard. How many trees are in the orchard?`,
      no: "trees that are not apple trees",
    },
    {
      part: (N, p) => `A theater has ${fmt(N)} seats, and ${p}% of them are in the balcony. How many seats are in the balcony?`,
      percent: (N, k) => `A theater has ${fmt(N)} seats, and ${fmt(k)} of them are in the balcony. What percent of the seats are in the balcony?`,
      whole: (k, p) => `A theater has ${fmt(k)} seats in its balcony, which is ${p}% of all the seats in the theater. How many seats does the theater have?`,
      no: "seats that are not in the balcony",
    },
    {
      part: (N, p) => `In a survey of ${fmt(N)} residents of a town, ${p}% said they support building a new park. How many of the residents surveyed said they support the park?`,
      percent: (N, k) => `In a survey of ${fmt(N)} residents of a town, ${fmt(k)} said they support building a new park. What percent of the residents surveyed said they support the park?`,
      whole: (k, p) => `In a survey, ${fmt(k)} residents of a town said they support building a new park, which was ${p}% of the residents surveyed. How many residents were surveyed?`,
      no: "residents who did not say they support the park",
    },
    {
      part: (N, p) => `On Monday, a company received ${fmt(N)} emails, and ${p}% of them were requests for refunds. How many of the emails were requests for refunds?`,
      percent: (N, k) => `On Monday, a company received ${fmt(N)} emails, and ${fmt(k)} of them were requests for refunds. What percent of the emails were requests for refunds?`,
      whole: (k, p) => `On Monday, a company received ${fmt(k)} emails requesting refunds, which was ${p}% of all the emails it received that day. How many emails did the company receive on Monday?`,
      no: "emails that were not refund requests",
    },
  ];

  // Each scene's percents are ones the setting really uses: sales tax stays
  // under 10%, tips run 15-25%, discounts up to half off.
  const PRICE_SCENES = [
    { up: false, percents: [10, 15, 20, 25, 30, 35, 40, 50], stem: (P, p, numeric) => `A jacket that regularly costs ${money(P)} is on sale for ${p}% off the regular price. What is the sale price of the jacket${numeric ? ", in dollars" : ""}?`, change: "discount" },
    { up: false, percents: [5, 10, 15, 20, 25, 30, 40], stem: (P, p, numeric) => `The regular price of a lamp is ${money(P)}. During a sale, the price is reduced by ${p}%. What is the sale price of the lamp${numeric ? ", in dollars" : ""}?`, change: "discount" },
    { up: true, percents: [4, 5, 6, 7, 8, 9], stem: (P, p, numeric) => `The price of a bicycle is ${money(P)} before tax. A sales tax of ${p}% is added to this price. What is the total cost of the bicycle, including tax${numeric ? ", in dollars" : ""}?`, change: "tax" },
    { up: true, percents: [15, 18, 20, 22, 25], stem: (P, p, numeric) => `The bill for a group's dinner is ${money(P)}. The group adds ${aPercent(p)} tip to the bill. What is the total amount the group pays${numeric ? ", in dollars" : ""}?`, change: "tip" },
  ];

  const PERCENTS = [5, 8, 12, 15, 20, 25, 30, 35, 40, 45, 55, 60, 65, 70, 75, 85];

  // N between low and high for which p% of N is a whole number.
  function wholeFor(t, p, low, high) {
    const step = 100 / S.gcd(p, 100);
    const first = Math.ceil(low / step);
    const last = Math.floor(high / step);
    return last >= first ? t.int(first, last) * step : null;
  }

  const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  /* ================================================== successive-percent */

  const PERCENT_SIZES = [10, 20, 25, 30, 40, 50, 60, 75];

  // A signed percent change from the setting's own sizes (all sizes by
  // default); decreases stop at 60%, and `upOnly` settings only rise.
  function drawChange(t, sizes = PERCENT_SIZES, upOnly = false) {
    const size = t.pick(sizes);
    return upOnly || size > 60 || t.chance(0.5) ? size : -size;
  }

  const changed = (c) => `${c > 0 ? "increased" : "decreased"} by ${Math.abs(c)}%`;

  const verbOf = (c) => (c > 0 ? "increased" : "decreased");

  const nounOf = (c) => (c > 0 ? "increase" : "decrease");

  const multiplier = (c) => num((100 + c) / 100);

  const TIMELINES = [
    {
      money: false, low: 800, high: 20000, step: 20, sizes: [10, 20, 25, 30, 40, 50],
      story: (c1, c2) => `The number of visitors to a science museum ${changed(c1)} from 2021 to 2022 and then ${changed(c2)} from 2022 to 2023.`,
      final: (v) => `The museum had ${fmt(v)} visitors in 2023.`,
      ask: "How many visitors did the museum have in 2021?",
      restore: (verb) => `From 2023 to 2024, the number of visitors ${verb} by p%, which made it equal to the number in 2021. What is the value of p?`,
      unknown: (c1, verb) => `The number of visitors to a science museum ${changed(c1)} from 2021 to 2022 and then ${verb} by p% from 2022 to 2023.`,
      net: (text) => `The number of visitors in 2023 was ${text} than the number in 2021.`,
      start: "2021 number", mid: "2022 number", end: "2023 number",
    },
    {
      money: false, low: 2000, high: 60000, step: 100, sizes: [4, 5, 6, 8, 10, 12, 15, 20, 25],
      story: (c1, c2) => `The population of Millbrook ${changed(c1)} from 2010 to 2015 and then ${changed(c2)} from 2015 to 2020.`,
      final: (v) => `In 2020, the population of Millbrook was ${fmt(v)}.`,
      ask: "What was the population of Millbrook in 2010?",
      restore: (verb) => `From 2020 to 2025, the population ${verb} by p%, which returned it to its 2010 value. What is the value of p?`,
      unknown: (c1, verb) => `The population of Millbrook ${changed(c1)} from 2010 to 2015 and then ${verb} by p% from 2015 to 2020.`,
      net: (text) => `The population in 2020 was ${text} than the population in 2010.`,
      start: "2010 population", mid: "2015 population", end: "2020 population",
    },
    {
      money: true, low: 40, high: 900, step: 4, sizes: [10, 20, 25, 30, 40, 50],
      story: (c1, c2) => `A store ${verbOf(c1)} the price of a coat by ${Math.abs(c1)}%. A month later, the store ${verbOf(c2)} the new price by ${Math.abs(c2)}%.`,
      final: (v) => `After both changes, the price of the coat was ${money(v)}.`,
      ask: "What was the price of the coat, in dollars, before either change?",
      restore: (verb) => `The store then ${verb} the price by p%, which returned it to the price before either change. What is the value of p?`,
      unknown: (c1, verb) => `A store ${verbOf(c1)} the price of a coat by ${Math.abs(c1)}%. A month later, the store ${verb} the new price by p%.`,
      net: (text) => `After both changes, the price of the coat was ${text} than the price before either change.`,
      start: "original price", mid: "price after the first change", end: "final price",
    },
    {
      money: true, low: 600, high: 4000, step: 20, sizes: [2, 3, 4, 5, 6, 8, 10, 12], upOnly: true,
      story: (c1, c2) => `When a lease was renewed in 2023, the monthly rent for an apartment ${changed(c1)}. When the lease was renewed in 2024, the monthly rent ${changed(c2)}.`,
      final: (v) => `After the 2024 renewal, the monthly rent was ${money(v)}.`,
      ask: "What was the monthly rent, in dollars, before the 2023 renewal?",
      restore: (verb) => `At the 2025 renewal, the monthly rent ${verb} by p%, which returned it to its amount before the 2023 renewal. What is the value of p?`,
      unknown: (c1, verb) => `When a lease was renewed in 2023, the monthly rent ${changed(c1)}. When the lease was renewed in 2024, the monthly rent ${verb} by p%.`,
      net: (text) => `After the 2024 renewal, the monthly rent was ${text} than it was before the 2023 renewal.`,
      start: "rent before 2023", mid: "rent after the 2023 renewal", end: "rent after the 2024 renewal",
    },
    {
      money: false, low: 400, high: 30000, step: 20, sizes: [10, 20, 25, 40, 50, 60, 75],
      story: (c1, c2) => `The number of subscribers to a podcast ${changed(c1)} from March to April and then ${changed(c2)} from April to May.`,
      final: (v) => `The podcast had ${fmt(v)} subscribers in May.`,
      ask: "How many subscribers did the podcast have in March?",
      restore: (verb) => `From May to June, the number of subscribers ${verb} by p%, which made it equal to the number in March. What is the value of p?`,
      unknown: (c1, verb) => `The number of subscribers to a podcast ${changed(c1)} from March to April and then ${verb} by p% from April to May.`,
      net: (text) => `The podcast had ${text.replace(/less$/, "fewer").replace(/greater$/, "more")} subscribers in May than in March.`,
      start: "March number", mid: "April number", end: "May number",
    },
    {
      money: false, low: 1000, high: 24000, step: 50, sizes: [4, 5, 6, 8, 10, 12, 15, 20],
      story: (c1, c2) => `Enrollment at a community college ${changed(c1)} from fall 2020 to fall 2021 and then ${changed(c2)} from fall 2021 to fall 2022.`,
      final: (v) => `In fall 2022, the college enrolled ${fmt(v)} students.`,
      ask: "How many students did the college enroll in fall 2020?",
      restore: (verb) => `From fall 2022 to fall 2023, enrollment ${verb} by p%, which returned it to its fall 2020 level. What is the value of p?`,
      unknown: (c1, verb) => `Enrollment at a community college ${changed(c1)} from fall 2020 to fall 2021 and then ${verb} by p% from fall 2021 to fall 2022.`,
      net: (text) => `Enrollment in fall 2022 was ${text} than enrollment in fall 2020.`,
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
      const c1 = drawChange(t, ctx.sizes, ctx.upOnly);
      const c2 = drawChange(t, ctx.sizes, ctx.upOnly);
      const start = t.int(Math.ceil(ctx.low / ctx.step), Math.floor(ctx.high / ctx.step)) * ctx.step;
      const mid = tidy((start * (100 + c1)) / 100);
      const end = tidy((mid * (100 + c2)) / 100);
      if (!Number.isInteger(mid) || !Number.isInteger(end)) return null;
      const product = tidy(((100 + c1) * (100 + c2)) / 10000);
      const combined = c1 + c2;
      const summed = tidy((end * 100) / (100 + combined));
      // Multiple choice always offers the add-the-percents reflex.
      if (!numeric && !(100 + combined > 0 && isClean(summed, places))) return null;
      const flipped = tidy((end * (100 - c2) * (100 - c1)) / 10000);
      const forward = tidy(end * product);
      const firstOnly = tidy((end * 100) / (100 + c1));
      // Every modelled slip must print as a real amount, so the key's rank
      // among them can land anywhere, not only where the few clean ones sit.
      if (!numeric && [summed, flipped, mid, forward, firstOnly].some((value) => !(value > 0 && isClean(value, places)))) return null;
      const both = `${multiplier(c1)} × ${multiplier(c2)} = ${num(product)}`;
      return packRanked(t, numeric, start, [
        [summed, combined === 0
          ? `Assumes the ${Math.abs(c1)}% ${nounOf(c1)} and the ${Math.abs(c2)}% ${nounOf(c2)} cancel, but they are percents of different amounts.`
          : `Adds the percents into one change of ${combined > 0 ? "" : MINUS}${Math.abs(combined)}% and undoes it, but the ${Math.abs(c2)}% is a percent of the ${ctx.mid}.`],
        [flipped, `Undoes each change with the opposite percent of the later amount (${aPercent(Math.abs(c2))} ${nounOf(-c2)}, then ${aPercent(Math.abs(c1))} ${nounOf(-c1)}), so each percent has the wrong base.`],
        [mid, `Undoes only the ${Math.abs(c2)}% ${nounOf(c2)}, which gives the ${ctx.mid}, not the ${ctx.start}.`],
        [forward, "Applies both changes to the final amount again instead of undoing them."],
        [firstOnly, `Undoes only the ${Math.abs(c1)}% ${nounOf(c1)}, as if the ${Math.abs(c2)}% ${nounOf(c2)} had not happened.`],
      ], {
        stimulus: null,
        stem: `${ctx.story(c1, c2)} ${ctx.final(end)} ${ctx.ask}`,
        explanation:
          `${cap(aPercent(Math.abs(c1)))} ${nounOf(c1)} multiplies an amount by ${multiplier(c1)}, and ${aPercent(Math.abs(c2))} ${nounOf(c2)} multiplies ` +
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
      }, { show: numeric ? fmt : show, places });
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

  const CHAIN_SIZES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 80];

  function percentChain(t, numeric) {
    const ctx = t.pick(TRIADS);
    const [X, Y, Z] = ctx.names;
    return retry(() => {
      const a = drawChange(t, CHAIN_SIZES);
      const b = drawChange(t, CHAIN_SIZES);
      const ratio = tidy(((100 + a) * (100 + b)) / 100);
      if (ratio === 100) return null;
      const askOf = t.chance(0.5);
      const complement = t.chance(0.35);
      const gap = tidy(Math.abs(ratio - 100));
      const key = askOf ? ratio : gap;
      if (!fitsGrid(key) || !isClean(key, 2)) return null;
      const word = ratio > 100 ? ctx.up : ctx.down;
      const summed = 100 + a + b;
      const baseFirst = tidy((100 * (100 + b)) / (100 - a));
      const baseSecond = tidy((100 * (100 + a)) / (100 - b));
      const reverse = tidy(10000 / ratio);
      const candidates = [];
      if (askOf) {
        candidates.push([summed, `Adds the percents, 100 + (${num(a)}) + (${num(b)}), though they are percents of different amounts.`]);
        // The difference and the ratio add to 100, a look-alike pair; offered
        // in about a third of the items so the pair does not mark the key.
        if (complement) candidates.push([gap, `Gives the percent by which ${ctx.of(X)} differs from ${ctx.of(Z)}, not ${ctx.of(X)} as a percent of ${ctx.of(Z)}.`]);
        candidates.push([baseFirst, `Takes the ${Math.abs(a)}% of ${ctx.of(X)} instead of ${ctx.of(Y)}, the amount it is compared with.`]);
        candidates.push([baseSecond, `Takes the ${Math.abs(b)}% of ${ctx.of(Y)} instead of ${ctx.of(Z)}, the amount it is compared with.`]);
        candidates.push([reverse, `Finds ${ctx.of(Z)} as a percent of ${ctx.of(X)}, the reverse comparison.`]);
        candidates.push([100 + a, `Applies only the first comparison, between ${ctx.of(X)} and ${ctx.of(Y)}.`]);
        candidates.push([100 + b, `Applies only the second comparison, between ${ctx.of(Y)} and ${ctx.of(Z)}.`]);
      } else {
        const summedGap = Math.abs(a + b);
        if (summedGap > 0 && Math.sign(a + b) === Math.sign(ratio - 100)) {
          candidates.push([summedGap, `Combines the two percents, ${num(a)} and ${num(b)}, as if both were percents of the same amount.`]);
        }
        if (complement) candidates.push([ratio, `Gives ${ctx.of(X)} as a percent of ${ctx.of(Z)} instead of the percent by which they differ.`]);
        candidates.push([tidy(Math.abs(baseFirst - 100)), `Takes the ${Math.abs(a)}% of ${ctx.of(X)} instead of ${ctx.of(Y)}, the amount it is compared with.`]);
        candidates.push([tidy(Math.abs(baseSecond - 100)), `Takes the ${Math.abs(b)}% of ${ctx.of(Y)} instead of ${ctx.of(Z)}, the amount it is compared with.`]);
        candidates.push([tidy(Math.abs(reverse - 100)), `Measures the difference as a percent of ${ctx.of(X)} instead of ${ctx.of(Z)}.`]);
      }
      const yValue = 100 + b;
      const text = `${ctx.link(X, a, Y)}, and ${ctx.link(Y, b, Z)}`;
      return packRanked(t, numeric, key, candidates, {
        stimulus: null,
        stem: `${ctx.intro(text)} ${askOf ? ctx.askOf : ctx.askDiff(word)}`,
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
      }, { show: num });
    });
  }

  // The key of a percent asked for exactly or as "closest to". `top/bottom`
  // is the exact percent. A student-produced answer is the exact value: a
  // terminating decimal, or a lowest-terms fraction that fits the grid
  // ("100/3"). Multiple choice is exact when the percent terminates, and
  // otherwise asks "closest to" with every choice a whole percent; a wrong
  // choice that sits nearer than twice the key's rounding gap is dropped,
  // so the key is always clearly the nearest choice. Returns null (redraw)
  // when the numeric key cannot be entered.
  function percentKey(top, bottom, numeric, allowFraction = true) {
    const value = top / bottom;
    const terminating = isClean(value, 2) && fitsGrid(tidy(value));
    const fraction = S.frac(top, bottom);
    if (numeric) {
      if (terminating) return { value, exact: true, text: fmt(tidy(value)), numericKey: tidy(value) };
      return allowFraction && fraction.length <= 5 ? { value, exact: true, text: fraction, numericKey: fraction } : null;
    }
    if (terminating) return { value, exact: true, text: num(tidy(value)), shown: tidy(value) };
    const shown = Math.round(value);
    return { value, exact: false, text: num(shown), shown, gap: Math.abs(shown - value) };
  }

  // Wrong values for a percent key: rounded like the key, and, for a
  // "closest to" item, kept only when at least twice as far from the exact
  // value as the key.
  function percentWrong(key, candidates) {
    return candidates
      .map(([value, reason]) => [Number.isFinite(value) ? (key.exact ? tidy(value) : Math.round(value)) : NaN, reason])
      .filter(([value]) => !Number.isFinite(value) || key.exact || Math.abs(value - key.value) >= 2 * key.gap + 1e-9);
  }

  // Finishes a percent item from percentKey: numeric keys go in as given
  // (a fraction string stays exact), multiple choice spreads the key's rank.
  // With `sign`, choices print as percents ("37.5%"), which read as
  // hundredths, so `approximates` is given in the same units.
  function finishPercent(t, numeric, key, candidates, fields, sign = false) {
    if (numeric) return finish(true, { correct: key.numericKey, wrong: [], ...fields });
    const approximate = key.exact ? {} : { approximates: sign ? key.value / 100 : key.value };
    const show = sign ? (value) => `${num(value)}%` : num;
    return packRanked(t, false, key.shown, percentWrong(key, candidates), { ...fields, ...approximate }, { show });
  }

  const aboutText = (key) => (key.exact ? key.text : `about ${key.text}`);

  // The key as a percent in prose: "12.5%", "about 39%", or, for a
  // fraction key, "25/6 percent (about 4.17%)".
  const percentPhrase = (key) => (String(key.text).includes("/")
    ? `${key.text} percent (about ${num(Math.round(key.value * 100) / 100)}%)`
    : `${aboutText(key)}%`);

  function percentRestore(t, numeric) {
    // Most restoring changes do not terminate; a student-produced answer is
    // then an exact fraction in some items and redrawn to a terminating
    // percent in the rest, so fraction keys stay a minority.
    const fractionOK = t.chance(0.3);
    return retry(() => {
      const ctx = t.pick(TIMELINES);
      const c1 = drawChange(t, ctx.sizes, ctx.upOnly);
      const c2 = drawChange(t, ctx.sizes, ctx.upOnly);
      const product = (100 + c1) * (100 + c2);
      if (product === 10000) return null;
      const need = (1000000 - 100 * product) / product;
      // The restoring change is 100 × |10,000 − product| / product percent.
      const key = percentKey(100 * Math.abs(10000 - product), product, numeric, fractionOK);
      // Below 4% a "closest to" choice among whole percents is a coin toss.
      if (!key || key.value < 4) return null;
      const verb = need > 0 ? "increased" : "decreased";
      const net = tidy(Math.abs(product - 10000) / 100);
      const lastOnly = Math.abs((100 * c2) / (100 + c2));
      const firstOnly = Math.abs((100 * c1) / (100 + c1));
      const candidates = [
        [net, `Reuses the net change, ${num(net)}%, which is a percent of the ${ctx.start}, as a percent of the ${ctx.end}.`],
        [c1 + c2 !== 0 && Math.sign(-(c1 + c2)) === Math.sign(need) ? Math.abs(c1 + c2) : NaN,
          `Reverses the sum of the two changes, ${num(c1)}% and ${num(c2)}%, as if they were percents of one amount.`],
        [lastOnly, `Undoes only the second change, which returns to the ${ctx.mid}, not the ${ctx.start}.`],
        [firstOnly, `Undoes only the first change, as if the second had not happened.`],
      ];
      const combined = tidy(product / 10000);
      const inverse = 10000 / product;
      const invText = isClean(inverse, 4) ? num(tidy(inverse)) : `about ${num(Math.round(inverse * 10000) / 10000)}`;
      const direction = need > 0 ? "an increase" : "a decrease";
      const stem = `${ctx.story(c1, c2)} ${ctx.restore(verb)}`;
      return finishPercent(t, numeric, key, candidates, {
        stimulus: null,
        stem: key.exact ? stem : stem.replace("What is the value of p?", "Which of the following is closest to the value of p?"),
        explanation:
          `The two changes multiply the ${ctx.start} by ${multiplier(c1)} × ${multiplier(c2)} = ${num(combined)}. To return to it, the ` +
          `${ctx.end} must be multiplied by 1 ÷ ${num(combined)}, ${invText}, which is ${direction} of ${percentPhrase(key)}.`,
        steps: [
          `Write the changes as multipliers: ${multiplier(c1)} and ${multiplier(c2)}.`,
          `Combine them: the ${ctx.end} is ${num(combined)} times the ${ctx.start}.`,
          `The multiplier that undoes this is 1 ÷ ${num(combined)}, ${invText}.`,
          `That multiplier is ${direction} of ${percentPhrase(key)}, so p is ${aboutText(key)}.`,
        ],
        principles: PERCENT_PRINCIPLES,
        trap: `The net change is ${num(net)}% of the ${ctx.start}, but the change back is a percent of the ${ctx.end}, a different base, so it is ${percentPhrase(key)}, not ${num(net)}%.`,
        hint: "The change back is a percent of the latest amount. How does the latest amount compare with the original?",
        verify: () => {
          // Follow an amount through both changes, then measure the gap back
          // to where it started as a percent of the latest amount.
          let amount = 1000;
          amount += (amount * c1) / 100;
          amount += (amount * c2) / 100;
          const back = (100 * Math.abs(1000 - amount)) / amount;
          const keyValue = numeric ? C.fractionValue(String(key.numericKey).replace(/,/g, "")) : key.shown;
          return (amount < 1000) === (need > 0) && (key.exact ? close(back, keyValue) : Math.abs(back - keyValue) <= 0.5);
        },
      });
    });
  }

  // Two changes, the second unknown, and the net change over both: the
  // second change is a percent of the amount after the first, so it is
  // found by dividing multipliers, never by subtracting percents.
  function percentNet(t, numeric) {
    const fractionOK = t.chance(0.3);
    const offerLater = t.chance(0.4);
    return retry(() => {
      const ctx = t.pick(TIMELINES);
      const c1 = drawChange(t, ctx.sizes, ctx.upOnly);
      const net = drawChange(t, [5, 10, 12, 15, 20, 25, 30, 40, 50], ctx.upOnly);
      if (net === c1 || net === 0) return null;
      // (100 + c1)(100 + c2) = 100(100 + net), so c2 = 100(net − c1)/(100 + c1).
      const up = net > c1;
      if (ctx.upOnly && !up) return null;
      const key = percentKey(100 * Math.abs(net - c1), 100 + c1, numeric, fractionOK);
      if (!key || key.value < 4) return null;
      const verb = up ? "increased" : "decreased";
      const c2 = up ? key.value : -key.value;
      const later = tidy((100 * (100 + net)) / (100 + c1));
      const candidates = [
        [Math.abs(net - c1), `Subtracts the percents, ${num(net)} ${MINUS} (${num(c1)}), as if both changes were percents of the ${ctx.start}.`],
        [(100 * Math.abs(net - c1)) / (100 + net), `Measures the second change against the ${ctx.end} instead of the ${ctx.mid}, the amount it changed.`],
        [Math.abs(net), `Gives the net change, ${num(Math.abs(net))}%, which compares the ${ctx.end} with the ${ctx.start}, not with the ${ctx.mid}.`],
        // The later amount as a percent of the middle one complements a
        // decrease to 100 (a look-alike pair with the key), so it is offered
        // in fewer than half the items.
        [offerLater ? later : NaN, `Gives the ${ctx.end} as a percent of the ${ctx.mid}, not the percent by which it changed.`],
        [Math.abs(c1), `Reuses the first change, ${num(Math.abs(c1))}%.`],
      ];
      const netText = `${Math.abs(net)}% ${net > 0 ? "greater" : "less"}`;
      const stem = `${ctx.unknown(c1, verb)} ${ctx.net(netText)} ${key.exact ? "What is the value of p?" : "Which of the following is closest to the value of p?"}`;
      const m2 = tidy((100 + net) / (100 + c1));
      const m2Text = isClean(m2, 4) ? num(m2) : `about ${num(Math.round(m2 * 10000) / 10000)}`;
      return finishPercent(t, numeric, key, candidates, {
        stimulus: null,
        stem,
        explanation:
          `The first change multiplies the ${ctx.start} by ${multiplier(c1)}, and both changes together multiply it by ${multiplier(net)}. ` +
          `So the second change multiplies the ${ctx.mid} by ${multiplier(net)} ÷ ${multiplier(c1)}, ${m2Text}, which is ${up ? "an increase" : "a decrease"} of ${percentPhrase(key)}.`,
        steps: [
          `Write the known changes as multipliers: ${multiplier(c1)} for the first change and ${multiplier(net)} for both together.`,
          `The second multiplier is ${multiplier(net)} ÷ ${multiplier(c1)}, ${m2Text}.`,
          `That multiplier is ${up ? "an increase" : "a decrease"} of ${percentPhrase(key)}, so p is ${aboutText(key)}.`,
          `Check: ${multiplier(c1)} × ${m2Text.replace("about ", "")} ≈ ${multiplier(net)}.`,
        ],
        principles: PERCENT_PRINCIPLES,
        trap: `Subtracting the percents gives ${num(Math.abs(net - c1))}, but the second change is a percent of the ${ctx.mid}, not of the ${ctx.start}.`,
        hint: "Write each change, and the change over both, as what it multiplies an amount by.",
        verify: () => {
          // Run an amount through the first change and the stated net
          // change, and measure the second change against the middle amount.
          const start = 1000;
          const mid = start + (start * c1) / 100;
          const target = start + (start * net) / 100;
          const second = (100 * (target - mid)) / mid;
          const keyValue = numeric ? C.fractionValue(String(key.numericKey).replace(/,/g, "")) : key.shown;
          return (second > 0) === up && close(second, c2) &&
            (key.exact ? close(Math.abs(second), keyValue) : Math.abs(Math.abs(second) - keyValue) <= 0.5);
        },
      });
    });
  }

  const percentQuantity = {
    id: "percent-of-a-quantity",
    domain: DATA,
    skill: "Percentages",
    subskill: "percent applications",
    difficulty: "Easy",
    title: "Part, percent, and whole",
    recognize:
      "Name the three quantities, part = (percent/100) × whole, and decide which one is missing; a percent is always a " +
      "percent of the whole, and a discount or tax changes the price by that percent of the price.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["percent-base", "wrong-quantity"],
    build(t) {
      const form = t.pick(["part", "percent", "whole", "price"]);
      const numeric = t.chance(0.35);
      const principles = [
        "part = (percent ÷ 100) × whole; the whole is the amount the percent is taken of.",
        "A p% decrease leaves (100 − p)% of the original amount; a p% increase gives (100 + p)%.",
      ];
      if (form === "price") {
        const scene = t.pick(PRICE_SCENES);
        return retry(() => {
          const p = t.pick(scene.percents);
          const Pr = t.pick([20, 24, 40, 48, 60, 75, 80, 90, 120, 150, 180, 240, 300, 360]);
          const change = tidy((Pr * p) / 100);
          if (!isClean(change, 2)) return null;
          const key = tidy(scene.up ? Pr + change : Pr - change);
          const other = tidy(scene.up ? Pr - change : Pr + change);
          const show = numeric ? fmt : money;
          const tenfold = tidy(scene.up ? Pr + 10 * change : Pr - 10 * change);
          const candidates = [
            [change, `Gives the amount of the ${scene.change}, ${p}% of ${money(Pr)}, instead of the ${scene.up ? "total" : "sale price"}.`],
            [other, scene.up ? `Subtracts the ${p}% ${scene.change} instead of adding it.` : `Adds ${p}% to the price instead of subtracting it.`],
            [scene.up ? Pr + p : Pr - p, `${scene.up ? "Adds" : "Subtracts"} ${p} dollars instead of ${p}% of the price.`],
            [tenfold, `Writes ${p}% as ${num(p / 10)} instead of ${num(p / 100)}, so the ${scene.change} comes out ten times too large.`],
            [Pr, `Gives the ${scene.up ? "price before the " + scene.change : "regular price"}, leaving out the ${scene.change}.`],
          ];
          const word = scene.up ? "increases" : "decreases";
          return packRanked(t, numeric, key, candidates, {
            stimulus: null,
            figure: null,
            stem: scene.stem(Pr, p, numeric),
            explanation:
              `The ${scene.change} is ${p}% of ${money(Pr)}: 0.${String(p).padStart(2, "0")} × ${fmt(Pr)} = ${num(change)}. ` +
              `It ${word} the price to ${fmt(Pr)} ${scene.up ? "+" : MINUS} ${num(change)} = ${num(key)} dollars.`,
            steps: [
              `Find ${p}% of the price: ${p}/100 × ${fmt(Pr)} = ${num(change)}.`,
              `${scene.up ? "Add it to" : "Subtract it from"} the price: ${fmt(Pr)} ${scene.up ? "+" : MINUS} ${num(change)} = ${num(key)}.`,
              `Check: ${num(key)} is ${scene.up ? 100 + p : 100 - p}% of ${fmt(Pr)}.`,
            ],
            principles,
            trap: `${num(change)} is the ${scene.change} itself, not the price the question asks for.`,
            hint: `How many dollars is the ${scene.change}, and what happens to the price because of it?`,
            estimatedSeconds: 60,
            verify: () => close((scene.up ? key - Pr : Pr - key) * 100, Pr * p),
          }, { show });
        });
      }
      const scene = t.pick(COUNT_SCENES);
      return retry(() => {
        const p = t.pick(PERCENTS);
        const N = wholeFor(t, p, 40, 1600);
        if (!N || N === 100) return null;
        const k = (N * p) / 100;
        if (form === "part") {
          return packRanked(t, numeric, k, [
            [N - k, `Gives the number of ${scene.no}, the other ${100 - p}%.`],
            [N + k, `Increases ${fmt(N)} by ${p}% instead of finding ${p}% of ${fmt(N)}.`],
            // One decimal slip at most, so the key is not the middle of a tenfold ladder.
            ...t.sample([
              [k / 10, `Writes ${p}% as ${num(p / 1000)} instead of ${num(p / 100)}, misplacing the decimal point.`],
              [k * 10, `Writes ${p}% as ${num(p / 10)} instead of ${num(p / 100)}, misplacing the decimal point.`],
            ], 1),
            [N - p, `Subtracts ${p} from ${fmt(N)}, treating the percent as a count.`],
            [p, `Gives the percent, ${p}, as if it were the number of ${scene.no.replace(/ (who|that) (do not|are not|did not).*$/, "")}.`],
          ], {
            stimulus: null,
            figure: null,
            stem: scene.part(N, p),
            explanation: `${p}% of ${fmt(N)} is ${p}/100 × ${fmt(N)} = ${fmt(k)}.`,
            steps: [
              `Write the percent as a decimal: ${p}% = ${num(p / 100)}.`,
              `Multiply by the whole: ${num(p / 100)} × ${fmt(N)} = ${fmt(k)}.`,
              `Check: ${fmt(k)} ÷ ${fmt(N)} = ${num(p / 100)}, which is ${p}%.`,
            ],
            principles,
            trap: `${fmt(N - k)} counts the ${scene.no}; the question asks for the other group.`,
            hint: `Which number is the whole that the ${p}% is taken of?`,
            estimatedSeconds: 55,
            verify: () => k * 100 === N * p,
          }, { places: 0 });
        }
        if (form === "percent") {
          const reversed = (100 * N) / k;
          return packRanked(t, numeric, p, [
            [100 - p, `Gives the percent of ${scene.no}.`],
            [tidy(k / N), `Gives the fraction ${fmt(k)}/${fmt(N)} as a decimal, without multiplying by 100 to make a percent.`],
            [reversed, `Divides ${fmt(N)} by ${fmt(k)}; the percent compares the part with the whole, not the whole with the part.`],
            [k < 100 ? k : NaN, `Gives the count, ${fmt(k)}, as if it were the percent.`],
            [tidy((100 * k) / (N - k)), `Compares the part with the rest, ${fmt(N - k)}, instead of with the whole.`],
            [tidy(p / 10), `Multiplies ${fmt(k)}/${fmt(N)} = ${num(tidy(k / N))} by 10 instead of 100 to write it as a percent.`],
          ], {
            stimulus: null,
            figure: null,
            stem: scene.percent(N, k),
            explanation: `${fmt(k)} out of ${fmt(N)} is ${fmt(k)}/${fmt(N)} = ${num(p / 100)}, which is ${p}%.`,
            steps: [
              `Divide the part by the whole: ${fmt(k)} ÷ ${fmt(N)} = ${num(p / 100)}.`,
              `Multiply by 100 to write it as a percent: ${num(p / 100)} × 100 = ${p}.`,
              `Check: ${p}% of ${fmt(N)} is ${fmt(k)}.`,
            ],
            principles,
            trap: `${fmt(k)}/${fmt(N)} = ${num(p / 100)} is a fraction of the whole; as a percent it is ${p}.`,
            hint: "Which number is the part, and which is the whole?",
            estimatedSeconds: 60,
            verify: () => p * N === 100 * k,
          }, { show: (value) => (numeric ? fmt(value) : `${num(value)}%`), places: 3 });
        }
        const complementWhole = (100 * k) / (100 - p);
        return packRanked(t, numeric, N, [
          [(k * p) / 100, `Takes ${p}% of ${fmt(k)}; ${fmt(k)} is already the part, and the whole is unknown.`],
          [N - k, `Gives the number of ${scene.no}, the rest of the whole.`],
          [(k * (100 + p)) / 100, `Increases ${fmt(k)} by ${p}%, but ${fmt(k)} is ${p}% of the whole, not 100%.`],
          [Number.isInteger(complementWhole) ? complementWhole : NaN, `Treats ${fmt(k)} as the other ${100 - p}% of the whole.`],
          [10 * N, `Writes ${p}% as ${num(p / 1000)} instead of ${num(p / 100)} before dividing, which makes the whole ten times too large.`],
        ], {
          stimulus: null,
          figure: null,
          stem: scene.whole(k, p),
          explanation: `${fmt(k)} is ${p}% of the whole, so the whole is ${fmt(k)} ÷ ${num(p / 100)} = ${fmt(N)}.`,
          steps: [
            `Write the relationship: ${num(p / 100)} × whole = ${fmt(k)}.`,
            `Divide: whole = ${fmt(k)} ÷ ${num(p / 100)} = ${fmt(N)}.`,
            `Check: ${p}% of ${fmt(N)} is ${fmt(k)}.`,
          ],
          principles,
          trap: `${fmt(k)} is the part; taking ${p}% of it finds a smaller part, not the whole.`,
          hint: `${fmt(k)} is ${p}% of what number?`,
          estimatedSeconds: 60,
          verify: () => N * p === 100 * k,
        }, { places: 0 });
      });
    },
  };

  const successivePercent = {
    id: "successive-percent",
    domain: DOMAIN,
    skill: "Percentages",
    subskill: "percent change",
    difficulty: "Hard",
    title: "The change that restores an amount or completes a net change",
    recognize:
      "Every percent is a percent of the amount just before it, so changes combine by multiplying their multipliers; a " +
      "missing change (the one that restores the start, or the second of two with a known net change) is a percent of " +
      "an amount the stem never names, so it is found by dividing multipliers, never by adding or subtracting percents.",
    // Hard: no amount is given, the unknown change is a percent of a base
    // the stem never names, and subtracting or reversing the given percents
    // produces offered answers. The chained comparison (A is p% more than B,
    // which is q% less than C) is one multiplication and lives in the Medium
    // percent-comparison-chain.
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["percent-base", "neighbouring-rule", "intermediate-value", "wrong-quantity"],
    build(t) {
      const numeric = t.chance(0.45);
      const instance = t.chance(0.5) ? percentNet(t, numeric) : percentRestore(t, numeric);
      return { estimatedSeconds: 110, ...instance };
    },
  };

  const percentComparisonChain = {
    id: "percent-comparison-chain",
    domain: DOMAIN,
    skill: "Percentages",
    subskill: "percent change",
    difficulty: "Medium",
    title: "Chained percent comparisons",
    recognize:
      '"A is p% more than B" multiplies B by (1 + p/100). Two comparisons in a chain multiply: give the last amount a ' +
      "convenient value such as 100 and work back through each comparison.",
    // Medium: one idea (comparisons multiply) applied twice, with the
    // add-the-percents reflex offered.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["percent-base", "neighbouring-rule", "wrong-quantity"],
    build(t) {
      return { estimatedSeconds: 90, ...percentChain(t, t.chance(0.4)) };
    },
  };

  const successivePercentUndo = {
    id: "successive-percent-undo",
    domain: DATA,
    skill: "Percentages",
    subskill: "percent change",
    difficulty: "Medium",
    title: "The amount before two percent changes",
    recognize:
      "Each change multiplies the amount just before it, so the two multipliers combine by multiplying; the original is " +
      "the final amount divided by that product, not the result of adding or reversing the percents.",
    // Medium: the amounts are concrete and the question names what is
    // wanted; the work is two multipliers and one division.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["percent-base", "intermediate-value"],
    build(t) {
      return { estimatedSeconds: 95, ...percentReverse(t, t.chance(0.4)) };
    },
  };

  /* ========================== percent-change-between-values (Easy) */

  // One quantity measured twice. `say` states both values; `subject` is the
  // quantity as a noun phrase for "By what percent did <subject> ...?".
  const CHANGE_STORIES = [
    {
      money: true, low: 40, high: 400, step: 4, up: true, down: true,
      say: (a, b) => `The price of a monthly bus pass ${b > a ? "increased" : "decreased"} from ${money(a)} to ${money(b)}.`,
      subject: "the price of the bus pass",
    },
    {
      money: false, low: 20, high: 400, step: 4, up: true, down: true,
      say: (a, b) => `The number of beehives on a farm ${b > a ? "increased" : "decreased"} from ${fmt(a)} in 2022 to ${fmt(b)} in 2023.`,
      subject: "the number of beehives",
    },
    {
      money: false, low: 400, high: 1600, step: 20, up: true, down: true,
      say: (a, b) => `A family's monthly electricity use ${b > a ? "increased" : "decreased"} from ${fmt(a)} kilowatt-hours in May to ${fmt(b)} kilowatt-hours in August.`,
      subject: "the family's monthly electricity use",
    },
    {
      money: false, low: 1000, high: 20000, step: 200, up: true, down: true,
      say: (a, b) => `Attendance at a town's summer festival ${b > a ? "increased" : "decreased"} from ${fmt(a)} people one year to ${fmt(b)} people the next year.`,
      subject: "attendance at the festival",
    },
    {
      money: false, low: 40, high: 600, step: 4, up: true, down: false,
      say: (a, b) => `Over two years, the number of public charging stations for electric vehicles in a county increased from ${fmt(a)} to ${fmt(b)}.`,
      subject: "the number of charging stations",
    },
    {
      money: false, low: 400, high: 4000, step: 20, up: false, down: true,
      say: (a, b) => `After new faucets were installed, a school's water use decreased from ${fmt(a)} gallons per day to ${fmt(b)} gallons per day.`,
      subject: "the school's daily water use",
    },
  ];

  const CHANGE_TABLES = [
    {
      head: ["Club", "2023", "2024"], rows: ["Chess", "Drama", "Robotics", "Hiking"], low: 20, high: 120, step: 4,
      intro: "The table shows the numbers of members of four school clubs in 2023 and in 2024.",
      subject: (row) => `the number of members of the ${row.toLowerCase()} club`, span: "from 2023 to 2024",
    },
    {
      head: ["State park", "June", "July"], rows: ["Cedar Falls", "Pine Ridge", "Lake Ames"], low: 1000, high: 12000, step: 100,
      intro: "The table shows the numbers of visitors to three state parks in June and in July.",
      subject: (row) => `the number of visitors to ${row}`, span: "from June to July",
    },
    {
      head: ["Store", "Last year", "This year"], rows: ["Downtown", "Eastside", "Harbor"], low: 200, high: 2400, step: 20,
      intro: "The table shows the numbers of bicycles sold at three stores of a bicycle company last year and this year.",
      subject: (row) => `the number of bicycles sold at the ${row} store`, span: "from last year to this year",
    },
  ];

  const CHANGE_SIZES = [5, 10, 12.5, 15, 20, 25, 30, 35, 37.5, 40, 45, 50, 60, 62.5, 75, 80];

  // Draws an original amount and a signed percent change with a clean result.
  function drawPair(t, ctx, up) {
    const size = t.pick(CHANGE_SIZES.filter((p) => up || p <= 60));
    const a = t.int(Math.ceil(ctx.low / ctx.step), Math.floor(ctx.high / ctx.step)) * ctx.step;
    const b = tidy((a * (up ? 100 + size : 100 - size)) / 100);
    return isClean(b, ctx.money ? 2 : 0) && b > 0 ? { a, b, size } : null;
  }

  const percentChangeValues = {
    id: "percent-change-between-values",
    domain: DATA,
    skill: "Percentages",
    subskill: "percent change",
    difficulty: "Easy",
    title: "Percent change from an old value to a new one",
    recognize:
      "A percent change compares the change with the original amount, the value before the change: divide the change by " +
      "the old value, then write the result as a percent.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["percent-base", "wrong-quantity"],
    build(t) {
      const inTable = t.chance(0.4);
      const numeric = t.chance(0.3);
      const ctx = inTable ? t.pick(CHANGE_TABLES) : t.pick(CHANGE_STORIES);
      return retry(() => {
        const up = inTable ? t.chance(0.5) : ctx.up && (!ctx.down || t.chance(0.55));
        const pair = drawPair(t, ctx, up);
        if (!pair) return null;
        const { a, b, size } = pair;
        const show = ctx.money ? money : fmt;
        const verb = up ? "increase" : "decrease";
        const diff = tidy(Math.abs(b - a));
        let stimulus = null;
        let lead;
        let subject;
        let span = "";
        const others = [];
        let rows = null;
        let target = 0;
        if (inTable) {
          target = t.int(0, ctx.rows.length - 1);
          rows = ctx.rows.map((name, index) => {
            if (index === target) return [name, fmt(a), fmt(b)];
            const other = drawPair(t, ctx, t.chance(0.5));
            if (!other) return null;
            others.push(other);
            return [name, fmt(other.a), fmt(other.b)];
          });
          if (rows.some((row) => !row)) return null;
          stimulus = { type: "table", content: S.table(ctx.head, rows) };
          lead = ctx.intro;
          subject = ctx.subject(ctx.rows[target]);
          span = ` ${ctx.span}`;
        } else {
          lead = ctx.say(a, b);
          subject = ctx.subject;
        }
        const pct = (value) => (numeric ? fmt(value) : `${num(value)}%`);
        const baseNew = tidy((diff * 100) / b);
        // Process slips first; at most one slip that is a plain transform of
        // the key (the decimal point, or new as a percent of old), so the key
        // is not the one value every other choice is built from.
        const transform = t.pick([
          [up ? 100 + size : 100 - size, `Gives the new amount as a percent of the original amount, not the percent change.`],
          [tidy(size / 100), `Finds the change as the decimal ${num(size / 100)} and writes it as a percent without multiplying by 100.`],
          [tidy(size / 10), `Multiplies ${num(size / 100)} by 10 instead of 100 to write it as a percent.`],
        ]);
        const candidates = [
          [baseNew, `Divides the change, ${show(diff)}, by the new amount, ${show(b)}, instead of by the original amount, ${show(a)}.`],
          [tidy(10000 / size), `Divides the original amount by the change, ${show(a)} ÷ ${show(diff)}, instead of the change by the original amount.`],
          [tidy((200 * diff) / (a + b)), `Divides the change by the average of the two amounts, ${show(tidy((a + b) / 2))}, instead of by the original amount.`],
          [diff < 100 ? diff : NaN, `Gives the change itself, ${show(diff)}, as if it were the percent.`],
          [tidy(diff / 100), `Divides the change by 100 instead of by the original amount, ${show(a)}.`],
          [tidy((100 * a) / b), `Divides the original amount by the new amount, ${show(a)} ÷ ${show(b)}, and writes that as a percent.`],
          ...others.map((other) => [other.size, "Reads the values from a different row of the table."]),
          transform,
        ];
        const stem = numeric
          ? `${lead} If ${subject} ${verb}d by p%${span}, what is the value of p?`
          : `${lead} By what percent did ${subject} ${verb}${span}?`;
        return packRanked(t, numeric, size, candidates, {
          stimulus,
          figure: null,
          stem,
          explanation:
            `The change is ${show(b)} ${MINUS} ${show(a)} = ${up ? "" : MINUS}${show(diff)}. As a fraction of the original amount, ` +
            `${show(diff)} ÷ ${show(a)} = ${num(size / 100)}, which is ${aPercent(size)} ${verb}.`,
          steps: [
            `Find the change: ${show(diff)}.`,
            `Divide by the original amount, ${show(a)}: ${num(size / 100)}.`,
            `Write it as a percent: ${num(size)}%.`,
          ],
          principles: [
            "Percent change = (new value − original value) ÷ original value × 100.",
            "The base of a percent change is the value before the change.",
          ],
          trap: `Dividing by the new value, ${show(b)}, measures the change against the wrong base.`,
          hint: "Which of the two values is the change being compared with?",
          estimatedSeconds: 60,
          verify: () => {
            let old = a;
            let now = b;
            if (rows) {
              const cells = C.parseTable(stimulus.content)[target + 1];
              old = C.parseNumber(cells[1]);
              now = C.parseNumber(cells[2]);
            }
            return close(old + (old * (up ? size : -size)) / 100, now);
          },
        }, { show: pct, places: 3 });
      });
    },
  };

  /* =================================== percent-of-a-subgroup (Medium) */

  // A whole, a first percent picking out a subgroup, and a second percent of
  // that subgroup. `pct` finishes "What percent ...?".
  const NESTED = [
    {
      a: [30, 70], b: [30, 75], N: [200, 5000],
      open: (N, a) => `In a survey of ${fmt(N)} adults, ${a}% said they own a pet.`,
      openNoN: (a) => `In a survey of adults, ${a}% said they own a pet.`,
      second: (b) => `Of the adults who own a pet, ${b}% said they own a dog.`,
      sub: "adults who own a pet", rest: "pet owners who do not own a dog",
      count: "How many of the adults surveyed own a dog?",
      pct: "of the adults surveyed own a dog",
      whole: (x) => `A total of ${fmt(x)} of the adults surveyed own a dog. How many adults were surveyed?`,
    },
    {
      a: [20, 80], b: [25, 75], N: [400, 4000],
      open: (N, a) => `Of the ${fmt(N)} students at a high school, ${a}% take a world language class.`,
      openNoN: (a) => `At a high school, ${a}% of the students take a world language class.`,
      second: (b) => `Of the students who take a world language class, ${b}% take Spanish.`,
      sub: "students who take a world language class", rest: "language students who do not take Spanish",
      count: "How many students at the school take Spanish?",
      pct: "of the students at the school take Spanish",
      whole: (x) => `If ${fmt(x)} students at the school take Spanish, how many students attend the school?`,
    },
    {
      a: [10, 60], b: [10, 40], N: [400, 6000],
      open: (N, a) => `Of the ${fmt(N)} flights that departed from an airport last week, ${a}% were international flights.`,
      openNoN: (a) => `Last week, ${a}% of the flights that departed from an airport were international flights.`,
      second: (b) => `Of the international flights, ${b}% departed late.`,
      sub: "international flights", rest: "international flights that departed on time",
      count: "How many international flights departed late last week?",
      pct: "of all the flights that departed last week were international flights that departed late",
      whole: (x) => `If ${fmt(x)} international flights departed late, how many flights departed from the airport last week?`,
    },
    {
      a: [10, 50], b: [2, 15], N: [1000, 20000],
      open: (N, a) => `A factory produced ${fmt(N)} phone cases, and inspectors tested ${a}% of them.`,
      openNoN: (a) => `Inspectors at a factory tested ${a}% of the phone cases the factory produced.`,
      second: (b) => `Of the cases tested, ${b}% were found to have a defect.`,
      sub: "cases tested", rest: "tested cases with no defect found",
      count: "How many of the tested cases were found to have a defect?",
      pct: "of all the cases produced were tested and found to have a defect",
      whole: (x) => `If ${fmt(x)} of the tested cases were found to have a defect, how many phone cases did the factory produce?`,
    },
    {
      a: [20, 70], b: [35, 75], N: [2000, 20000],
      open: (N, a) => `Of the ${fmt(N)} registered voters in a town, ${a}% voted in a local election.`,
      openNoN: (a) => `In a town, ${a}% of the registered voters voted in a local election.`,
      second: (b) => `Of the registered voters who voted, ${b}% voted in favor of a library bond.`,
      sub: "registered voters who voted", rest: "voters who voted against the bond",
      count: "How many of the town's registered voters voted in favor of the library bond?",
      pct: "of the town's registered voters voted in favor of the library bond",
      whole: (x) => `If ${fmt(x)} registered voters voted in favor of the bond, how many registered voters are in the town?`,
    },
    {
      a: [10, 60], b: [10, 50], N: [400, 6000],
      open: (N, a) => `On Saturday, ${fmt(N)} people visited a museum, and ${a}% of them bought a ticket to a special exhibit.`,
      openNoN: (a) => `On Saturday, ${a}% of the people who visited a museum bought a ticket to a special exhibit.`,
      second: (b) => `Of the people who bought an exhibit ticket, ${b}% also rented an audio guide.`,
      sub: "people who bought an exhibit ticket", rest: "exhibit visitors who did not rent an audio guide",
      count: "How many of Saturday's visitors bought an exhibit ticket and rented an audio guide?",
      pct: "of Saturday's visitors bought an exhibit ticket and rented an audio guide",
      whole: (x) => `If ${fmt(x)} visitors bought an exhibit ticket and rented an audio guide, how many people visited the museum on Saturday?`,
    },
  ];

  // The first percent read from a table row instead of a sentence.
  const NESTED_TABLES = [
    {
      head: ["Membership type", "Percent of members"], rows: ["Student", "Adult", "Senior"],
      b: [15, 70], N: [400, 8000],
      open: (N) => `A gym has ${fmt(N)} members, and the table shows the percent of members of each membership type.`,
      second: (row, b) => `Of the ${row.toLowerCase()} members, ${b}% attend a fitness class at least once a week.`,
      sub: (row) => `${row.toLowerCase()} members`,
      rest: (row) => `${row.toLowerCase()} members who do not attend a class weekly`,
      count: (row) => `How many of the gym's members are ${row.toLowerCase()} members who attend a fitness class at least once a week?`,
      pct: (row) => `of all the gym's members are ${row.toLowerCase()} members who attend a fitness class at least once a week`,
    },
    {
      head: ["Crop", "Percent of farmland"], rows: ["Corn", "Soybeans", "Wheat"],
      b: [20, 80], N: [200, 5000],
      open: (N) => `A farm has ${fmt(N)} acres of farmland, and the table shows the percent of the farmland planted with each crop.`,
      second: (row, b) => `Of the land planted with ${row.toLowerCase()}, ${b}% is irrigated.`,
      sub: (row) => `acres planted with ${row.toLowerCase()}`,
      rest: (row) => `acres of ${row.toLowerCase()} that are not irrigated`,
      count: (row) => `How many acres of the farm's land are planted with ${row.toLowerCase()} and irrigated?`,
      pct: (row) => `of the farm's land is planted with ${row.toLowerCase()} and irrigated`,
    },
    {
      head: ["Class year", "Percent of students"], rows: ["First-year", "Second-year", "Third-year", "Fourth-year"],
      b: [15, 80], N: [2000, 20000],
      open: (N) => `A college has ${fmt(N)} students, and the table shows the percent of students in each class year.`,
      second: (row, b) => `Of the ${row.toLowerCase()} students, ${b}% live on campus.`,
      sub: (row) => `${row.toLowerCase()} students`,
      rest: (row) => `${row.toLowerCase()} students who live off campus`,
      count: (row) => `How many of the college's students are ${row.toLowerCase()} students who live on campus?`,
      pct: (row) => `of all the college's students are ${row.toLowerCase()} students who live on campus`,
    },
  ];

  const SHARE_PERCENTS = [2, 4, 5, 6, 8, 10, 12, 15, 20, 24, 25, 30, 35, 40, 45, 48, 50, 55, 60, 64, 65, 70, 75, 80];

  const within = (list, [low, high]) => list.filter((value) => value >= low && value <= high);

  // Splits 100 into `count` multiples of 5, each at least 10.
  function tableShares(t, count) {
    for (;;) {
      const cuts = t.sample(range5(count), count - 1).sort((p, q) => p - q);
      const edges = [0, ...cuts, 100];
      const shares = edges.slice(1).map((edge, index) => edge - edges[index]);
      if (shares.every((share) => share >= 10)) return shares;
    }
  }

  const range5 = () => Array.from({ length: 19 }, (_, index) => 5 * (index + 1));

  const percentSubgroup = {
    id: "percent-of-a-subgroup",
    domain: DATA,
    skill: "Percentages",
    subskill: "percent applications",
    difficulty: "Medium",
    title: "A percent of a percent",
    recognize:
      "The second percent is a percent of the subgroup, not of the whole: find the subgroup first (or multiply the two " +
      "percents as decimals) before taking the second percent.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["percent-base", "intermediate-value"],
    build(t) {
      const inTable = t.chance(0.35);
      const numeric = t.chance(0.35);
      const form = inTable ? t.pick(["count", "percent"]) : t.pick(["count", "count", "percent", "whole"]);
      const ctx = inTable ? t.pick(NESTED_TABLES) : t.pick(NESTED);
      return retry(() => {
        let a;
        let row = null;
        let stimulus = null;
        let otherShares = [];
        if (inTable) {
          const shares = tableShares(t, ctx.rows.length);
          const index = t.int(0, ctx.rows.length - 1);
          row = ctx.rows[index];
          a = shares[index];
          otherShares = shares.filter((share, k) => k !== index && share !== a);
          stimulus = { type: "table", content: S.table(ctx.head, ctx.rows.map((name, k) => [name, `${shares[k]}%`])) };
        } else {
          a = t.pick(within(SHARE_PERCENTS, ctx.a));
        }
        const b = t.pick(within(SHARE_PERCENTS, ctx.b));
        if (a === b) return null;
        // The whole must make both the subgroup and the final count whole numbers.
        const u1 = 100 / S.gcd(a, 100);
        const u2 = 10000 / S.gcd(a * b, 10000);
        const step = (u1 * u2) / S.gcd(u1, u2);
        if (Math.ceil(ctx.N[0] / step) > Math.floor(ctx.N[1] / step)) return null;
        const N = step * t.int(Math.ceil(ctx.N[0] / step), Math.floor(ctx.N[1] / step));
        const sub = (N * a) / 100;
        const key = (N * a * b) / 10000;
        if (!Number.isInteger(sub) || !Number.isInteger(key)) return null;
        const share = tidy((a * b) / 100);
        const subName = inTable ? ctx.sub(row) : ctx.sub;
        const restName = inTable ? ctx.rest(row) : ctx.rest;
        const lead = inTable ? `${ctx.open(N)} ${ctx.second(row, b)}` : `${ctx.open(N, a)} ${ctx.second(b)}`;
        const principles = [
          "A percent of a percent of a whole is the product of the two percents (as decimals) times the whole.",
          "Each percent is taken of the group named right after \"of\"; the second percent's group is the subgroup, not the whole.",
        ];
        const hint = "The second percent is a percent of which group?";
        const subStep = `The ${subName}: ${a}% of ${fmt(N)} = ${fmt(sub)}.`;
        if (form === "count") {
          const candidates = [
            [shown(sub, 0), `Stops at the number of ${subName}, ${a}% of ${fmt(N)}.`],
            [shown((N * b) / 100, 0), `Takes ${b}% of all ${fmt(N)} instead of ${b}% of the ${fmt(sub)} ${subName}.`],
            [shown(sub - key, 0), `Gives the number of ${restName}, the other ${100 - b}% of the subgroup.`],
            [shown((N * Math.abs(a - b)) / 100, 0), `Combines the percents by subtracting, ${Math.max(a, b)}% ${MINUS} ${Math.min(a, b)}%, and takes that of ${fmt(N)}.`],
            ...otherShares.map((other) => [shown((N * other * b) / 10000, 0), "Reads the percent from a different row of the table."]),
          ];
          return packStrict(numeric, key, fmt(key), candidates, {
            stimulus,
            figure: null,
            stem: `${lead} ${inTable ? ctx.count(row) : ctx.count}`,
            explanation: `${subStep} Then ${b}% of those is ${num(b / 100)} × ${fmt(sub)} = ${fmt(key)}.`,
            steps: [
              subStep,
              `${b}% of that subgroup: ${num(b / 100)} × ${fmt(sub)} = ${fmt(key)}.`,
              `Check: ${num(a / 100)} × ${num(b / 100)} = ${num(share / 100)}, and ${num(share / 100)} × ${fmt(N)} = ${fmt(key)}.`,
            ],
            principles,
            trap: `${fmt(sub)} is the subgroup, a step on the way; and ${b}% of all ${fmt(N)} uses the wrong base.`,
            hint,
            estimatedSeconds: 85,
            verify: () => {
              const first = inTable
                ? C.parseNumber(C.parseTable(stimulus.content).find((cells) => cells[0] === row)[1].replace("%", ""))
                : a;
              return close(((N * first) / 100) * (b / 100), key);
            },
          });
        }
        if (form === "percent") {
          if (!isClean(share, 2)) return null;
          const pct = (value) => (numeric ? fmt(value) : `${num(value)}%`);
          const candidates = [
            [pct(b), `Gives ${b}%, which is a percent of the ${subName}, not of the whole.`],
            [isClean((a * (100 - b)) / 100, 2) ? pct(tidy((a * (100 - b)) / 100)) : null, `Gives the percent of the whole that are ${restName}.`],
            [pct(a), `Gives the percent that are ${subName}, the first group only.`],
            [pct(Math.abs(a - b)), `Subtracts the percents instead of taking one as a percent of the other.`],
            ...otherShares.map((other) => [isClean((other * b) / 100, 2) ? pct(tidy((other * b) / 100)) : null, "Reads the percent from a different row of the table."]),
          ];
          const phrase = inTable ? ctx.pct(row) : ctx.pct;
          return packStrict(numeric, share, pct(share), candidates, {
            stimulus,
            figure: null,
            stem: numeric ? `${lead} If p% ${phrase}, what is the value of p?` : `${lead} What percent ${phrase}?`,
            explanation:
              `${b}% of a group that is ${a}% of the whole is ${num(b / 100)} × ${num(a / 100)} = ${num(share / 100)} of the whole, ` +
              `which is ${num(share)}%. (For example, ${subStep.charAt(0).toLowerCase() + subStep.slice(1, -1)}, and ${b}% of those is ${fmt(key)}, which is ${num(share)}% of ${fmt(N)}.)`,
            steps: [
              `Write each percent as a decimal: ${num(a / 100)} and ${num(b / 100)}.`,
              `Multiply, since the second is a part of the first: ${num(a / 100)} × ${num(b / 100)} = ${num(share / 100)}.`,
              `As a percent: ${num(share)}%.`,
            ],
            principles,
            trap: `${b}% describes the ${subName}; as a share of the whole it shrinks to ${num(share)}%.`,
            hint,
            estimatedSeconds: 85,
            verify: () => close(((key / N) * 100), share),
          });
        }
        const x = key;
        const candidates = [
          [shown((x * 100) / b, 0), `Stops at the number of ${subName}, ${fmt(x)} ÷ ${num(b / 100)}.`],
          [shown((x * 100) / a, 0), `Divides by ${num(a / 100)} only, treating ${fmt(x)} as the ${subName}.`],
          [shown((x * 100) / (a + b), 0), `Adds the percents, ${a}% + ${b}%, and divides by that.`],
          [shown((x * a * b) / 10000, 2), `Applies both percents to ${fmt(x)} instead of undoing them.`],
          [shown((x * 100) / Math.abs(a - b), 0), `Subtracts the percents and divides by ${Math.abs(a - b)}%.`],
        ];
        return packStrict(numeric, N, fmt(N), candidates, {
          stimulus: null,
          figure: null,
          stem: `${ctx.openNoN(a)} ${ctx.second(b)} ${ctx.whole(x)}`,
          explanation:
            `The ${fmt(x)} are ${b}% of the ${subName}, so there are ${fmt(x)} ÷ ${num(b / 100)} = ${fmt(sub)} ${subName}. ` +
            `Those are ${a}% of the whole, so the whole is ${fmt(sub)} ÷ ${num(a / 100)} = ${fmt(N)}.`,
          steps: [
            `Undo the second percent: ${fmt(x)} ÷ ${num(b / 100)} = ${fmt(sub)}.`,
            `Undo the first percent: ${fmt(sub)} ÷ ${num(a / 100)} = ${fmt(N)}.`,
            `Check: ${a}% of ${fmt(N)} is ${fmt(sub)}, and ${b}% of ${fmt(sub)} is ${fmt(x)}.`,
          ],
          principles,
          trap: `${fmt(sub)} is the subgroup, not the whole; it is only ${a}% of the whole.`,
          hint: `${fmt(x)} is a percent of which group, and that group is a percent of what?`,
          estimatedSeconds: 90,
          verify: () => close(N * (a / 100) * (b / 100), x) && N * a * b === x * 10000,
        });
      });
    },
  };

  /* ================================ percent-change-expression (Medium) */

  // Two successive changes to a variable amount. `sign` is +1 for an increase.
  const TWO_CHANGES = [
    {
      v: "x", first: [-1, [10, 15, 20, 25, 30, 35, 40]], second: [1, [5, 6, 7, 8, 9]],
      story: (p, q) => `A jacket's regular price is x dollars. During a sale, the price is reduced by ${p}%, and a sales tax of ${q}% is then applied to the reduced price.`,
      ask: "Which expression represents the total cost, in dollars, of the jacket during the sale?",
      askK: "The total cost, in dollars, of the jacket during the sale can be written as kx, where k is a constant. What is the value of k?",
      what: "the total cost",
    },
    {
      v: "n", first: [1, [10, 15, 20, 25, 30, 40]], second: [-1, [5, 10, 15, 20, 25, 30]],
      story: (p, q) => `A running club had n members at the start of the year. The number of members increased by ${p}% during the first half of the year and then decreased by ${q}% during the second half.`,
      ask: "Which expression represents the number of members at the end of the year?",
      askK: "The number of members at the end of the year can be written as kn, where k is a constant. What is the value of k?",
      what: "the number of members at the end of the year",
    },
    {
      v: "c", first: [1, [20, 25, 30, 40, 50, 60]], second: [-1, [10, 15, 20, 25, 30]],
      story: (p, q) => `A store buys a lamp for c dollars and sets the lamp's price ${p}% above that cost. Later, the store reduces the lamp's price by ${q}%.`,
      ask: "Which expression represents the reduced price, in dollars, of the lamp?",
      askK: "The reduced price, in dollars, of the lamp can be written as kc, where k is a constant. What is the value of k?",
      what: "the reduced price",
    },
    {
      v: "b", first: [1, [2, 3, 4, 5, 6]], second: [1, [2, 3, 4, 5, 6]],
      story: (p, q) => `The balance of a savings account was b dollars. The balance increased by ${p}% during the first year and then by ${q}% of the new balance during the second year.`,
      ask: "Which expression represents the balance, in dollars, at the end of the second year?",
      askK: "The balance, in dollars, at the end of the second year can be written as kb, where k is a constant. What is the value of k?",
      what: "the balance at the end of the second year",
    },
    {
      v: "L", first: [-1, [10, 15, 20, 25, 30, 40]], second: [-1, [5, 10, 15, 20, 25]],
      story: (p, q) => `A laptop's list price is L dollars. A store takes ${p}% off the list price, and a coupon then takes ${q}% off the discounted price.`,
      ask: "Which expression represents the price, in dollars, of the laptop after the discount and the coupon?",
      askK: "The price, in dollars, of the laptop after the discount and the coupon can be written as kL, where k is a constant. What is the value of k?",
      what: "the final price",
    },
    {
      v: "m", first: [1, [5, 10, 15, 20, 25, 30, 40, 50]], second: [1, [5, 10, 15, 20, 25, 30]],
      story: (p, q) => `A website had m visitors in January. The number of visitors increased by ${p}% from January to February and then increased by ${q}% from February to March.`,
      ask: "Which expression represents the number of visitors to the website in March?",
      askK: "The number of visitors to the website in March can be written as km, where k is a constant. What is the value of k?",
      what: "the number of visitors in March",
    },
    {
      v: "p", first: [-1, [5, 10, 15, 20, 25, 30]], second: [1, [5, 10, 15, 20, 25]],
      story: (a, b) => `The number of trout in a lake was p at the start of a year. The number decreased by ${a}% during the year, and then a stocking program increased the new number by ${b}%.`,
      ask: "Which expression represents the number of trout after the stocking program?",
      askK: "The number of trout after the stocking program can be written as kp, where k is a constant. What is the value of k?",
      what: "the number of trout after stocking",
    },
    {
      v: "s", first: [1, [2, 3, 4, 5, 6, 8, 10]], second: [1, [2, 3, 4, 5, 6, 8, 10]],
      story: (a, b) => `An employee's annual salary was s dollars. The salary increased by ${a}% after one year and then by ${b}% of the new salary after the second year.`,
      ask: "Which expression represents the employee's annual salary, in dollars, after the two increases?",
      askK: "The employee's annual salary, in dollars, after the two increases can be written as ks, where k is a constant. What is the value of k?",
      what: "the salary after two increases",
    },
    {
      v: "w", first: [-1, [10, 20, 25, 30, 40, 50]], second: [-1, [10, 20, 25, 30, 40]],
      story: (a, b) => `A block of ice had a mass of w kilograms. In the first hour, ${a}% of its mass melted, and in the second hour, ${b}% of the remaining mass melted.`,
      ask: "Which expression represents the mass, in kilograms, of the ice after the second hour?",
      askK: "The mass, in kilograms, of the ice after the second hour can be written as kw, where k is a constant. What is the value of k?",
      what: "the mass after two hours",
    },
    {
      v: "q", first: [1, [10, 20, 25, 30, 40, 50, 60]], second: [-1, [10, 15, 20, 25, 30, 40]],
      story: (a, b) => `A factory produced q units in its first month. Production increased by ${a}% in the second month and then fell by ${b}% in the third month compared with the second month.`,
      ask: "Which expression represents the number of units produced in the third month?",
      askK: "The number of units produced in the third month can be written as kq, where k is a constant. What is the value of k?",
      what: "the third month's production",
    },
  ];

  // One change already applied; the amount before it is wanted.
  const UNDO_CHANGES = [
    {
      v: "s", sign: -1, sizes: [10, 15, 20, 25, 30, 35, 40, 50],
      story: (p) => `After a ${p}% discount, the sale price of a coat is s dollars.`,
      ask: "Which expression represents the price, in dollars, of the coat before the discount?",
    },
    {
      v: "P", sign: 1, sizes: [4, 5, 6, 8, 10, 12, 15, 20, 25, 30],
      story: (p) => `The population of a town increased by ${p}% from 2015 to 2025. The population in 2025 was P.`,
      ask: "Which expression represents the population of the town in 2015?",
    },
    {
      v: "x", sign: 1, sizes: [10, 20, 25, 30, 40, 50, 60],
      story: (p) => `The positive number x is ${p}% greater than the positive number y.`,
      ask: "Which expression represents y in terms of x?",
    },
    {
      v: "w", sign: -1, sizes: [5, 10, 12, 15, 20, 25],
      story: (p) => `After a training program, Ana's time to swim 100 meters decreased by ${p}% to w seconds.`,
      ask: "Which expression represents Ana's time, in seconds, to swim 100 meters before the program?",
    },
    {
      v: "t", sign: 1, sizes: [15, 18, 20, 22, 25],
      story: (p) => `A restaurant bill came to t dollars after ${aPercent(p)} tip was added to the cost of the meal.`,
      ask: "Which expression represents the cost, in dollars, of the meal before the tip?",
    },
    {
      v: "h", sign: -1, sizes: [2, 3, 4, 5, 6, 8],
      story: (p) => `After a wool sweater was washed, its length decreased by ${p}% to h inches.`,
      ask: "Which expression represents the length, in inches, of the sweater before it was washed?",
    },
    {
      v: "c", sign: -1, sizes: [10, 15, 20, 25, 30, 40, 50, 60],
      story: (p) => `A used textbook sells for c dollars, which is ${p}% less than the price of the book when new.`,
      ask: "Which expression represents the price, in dollars, of the book when new?",
    },
    {
      v: "m", sign: 1, sizes: [3, 4, 5, 6, 8, 10, 12, 15, 20],
      story: (p) => `After ${aPercent(p)} raise, Jada's monthly salary is m dollars.`,
      ask: "Which expression represents Jada's monthly salary, in dollars, before the raise?",
    },
    {
      v: "k", sign: -1, sizes: [5, 8, 10, 12, 15, 20, 25],
      story: (p) => `Over one year, the value of a car decreased by ${p}% to k dollars.`,
      ask: "Which expression represents the value, in dollars, of the car at the start of the year?",
    },
    {
      v: "n", sign: 1, sizes: [10, 20, 25, 30, 40, 50, 60, 75],
      story: (p) => `A school's robotics club has n members this year, which is ${p}% more than the number of members last year.`,
      ask: "Which expression represents the number of members the club had last year?",
    },
    {
      v: "d", sign: -1, sizes: [10, 15, 20, 25, 30, 35, 40],
      story: (p) => `A hiker's average speed on a steep trail was ${p}% less than her average speed on flat ground. Her average speed on the steep trail was d kilometers per hour.`,
      ask: "Which expression represents her average speed, in kilometers per hour, on flat ground?",
    },
    {
      v: "A", sign: 1, sizes: [5, 10, 15, 20, 25, 40, 50],
      story: (p) => `The area of a town's park was increased by ${p}%. The area of the park after the increase is A acres.`,
      ask: "Which expression represents the area, in acres, of the park before the increase?",
    },
  ];

  // Evaluates the expression forms these items print, for verify().
  function evalExpression(text, v, value) {
    const s = text.replace(MINUS, "-");
    const esc = v.replace(/[^A-Za-z]/g, "");
    const patterns = [
      [new RegExp(`^${esc}$`), () => value],
      [new RegExp(`^([\\d.]+)\\(([\\d.]+)\\)${esc}$`), (m) => Number(m[1]) * Number(m[2]) * value],
      [new RegExp(`^([\\d.]+)${esc}$`), (m) => Number(m[1]) * value],
      [new RegExp(`^([\\d.]+)${esc} ([+-]) ([\\d.]+)$`), (m) => Number(m[1]) * value + (m[2] === "+" ? 1 : -1) * Number(m[3])],
      [new RegExp(`^${esc}/([\\d.]+)$`), (m) => value / Number(m[1])],
      [new RegExp(`^${esc} ([+-]) ([\\d.]+)$`), (m) => value + (m[1] === "+" ? 1 : -1) * Number(m[2])],
    ];
    for (const [pattern, evaluate] of patterns) {
      const match = s.match(pattern);
      if (match) return evaluate(match);
    }
    return NaN;
  }

  const percentExpression = {
    id: "percent-change-expression",
    domain: DATA,
    skill: "Percentages",
    subskill: "percent change",
    difficulty: "Medium",
    title: "Writing percent changes as an expression",
    recognize:
      "A p% increase multiplies by 1 + p/100 and a p% decrease by 1 − p/100; a second change multiplies the new amount, " +
      "and undoing a change divides by its multiplier rather than applying the opposite percent.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["percent-base", "equivalent-form", "neighbouring-rule"],
    build(t) {
      const undo = t.chance(0.3);
      // A constant that undoes a change rarely terminates, so only the
      // two-change form asks for one.
      const numeric = !undo && t.chance(0.35);
      return retry(() => {
        if (undo) {
          const ctx = t.pick(UNDO_CHANGES);
          const p = t.pick(ctx.sizes);
          const m = tidy(1 + (ctx.sign * p) / 100);
          const v = ctx.v;
          const opposite = tidy(1 - (ctx.sign * p) / 100);
          const keyText = `${v}/${num(m)}`;
          // The four choices cross two decisions, divide or multiply and by
          // which multiplier, so no choice is the one the others vary around.
          const candidates = [
            [`${v}/${num(opposite)}`, `Divides by ${num(opposite)}, the multiplier for ${aPercent(p)} ${ctx.sign > 0 ? "decrease" : "increase"}, instead of by ${num(m)}, the multiplier for the change that happened.`],
            [`${num(opposite)}${v}`, `Undoes the ${p}% ${ctx.sign > 0 ? "increase" : "decrease"} with ${aPercent(p)} ${ctx.sign > 0 ? "decrease" : "increase"}, but that ${p}% would be a percent of the later amount, not the original.`],
            [`${num(m)}${v}`, `Applies the ${p}% ${ctx.sign > 0 ? "increase" : "decrease"} again instead of undoing it.`],
          ];
          const check = () => {
            const original = 400;
            const later = original + (original * ctx.sign * p) / 100;
            return close(evalExpression(keyText, v, later), original) &&
              candidates.every(([text]) => !close(evalExpression(text, v, later), original));
          };
          if (!check()) return null;
          return packStrict(false, null, keyText, candidates, {
            stimulus: null,
            figure: null,
            stem: `${ctx.story(p)} ${ctx.ask}`,
            explanation:
              `A ${p}% ${ctx.sign > 0 ? "increase" : "decrease"} multiplies the earlier amount by ${num(m)}, so ${v} = ${num(m)} × (earlier amount). ` +
              `Dividing by ${num(m)} undoes it: the earlier amount is ${keyText}.`,
            steps: [
              `Write the change as a multiplier: ${num(m)}.`,
              `The later amount is ${num(m)} times the earlier amount: ${v} = ${num(m)} × earlier.`,
              `Solve for the earlier amount: earlier = ${keyText}.`,
            ],
            principles: [
              "A p% increase multiplies by (1 + p/100); a p% decrease multiplies by (1 − p/100).",
              "A change is undone by dividing by its multiplier; the opposite percent is a percent of a different amount.",
            ],
            trap: `${num(opposite)}${v} undoes the change with the opposite percent, but that percent would be taken of ${v}, not of the earlier amount.`,
            hint: `${v} is the amount after the change. What was it multiplied by?`,
            estimatedSeconds: 80,
            verify: check,
          });
        }
        const ctx = t.pick(TWO_CHANGES);
        const p = t.pick(ctx.first[1]);
        const q = t.pick(ctx.second[1]);
        const s1 = ctx.first[0];
        const s2 = ctx.second[0];
        const m1 = tidy(1 + (s1 * p) / 100);
        const m2 = tidy(1 + (s2 * q) / 100);
        const k = tidy(m1 * m2);
        if (k === 1 || (numeric && !fitsGrid(k))) return null;
        const v = ctx.v;
        const product = t.chance(0.5);
        const combined = tidy(1 + (s1 * p + s2 * q) / 100);
        const partOnly = tidy(p / 100);
        const flipped = tidy(1 - (s2 * q) / 100);
        // "1.2n" but "n" for a coefficient of 1.
        const times = (x) => (x === 1 ? v : `${num(x)}${v}`);
        const form = (x, y) => (product ? `${num(x)}(${num(y)})${v}` : times(tidy(x * y)));
        const keyText = form(m1, m2);
        const flipFirst = tidy(1 - (s1 * p) / 100);
        const partial = [form(partOnly, m2), `Uses ${num(partOnly)}, the ${p}% that ${s1 > 0 ? "is added" : "is taken off"}, instead of ${num(m1)}, the multiplier for the whole amount after the change.`];
        // In product form the choices cross the direction of each change
        // (a 2 x 2 grid), so no choice is the one the others vary around.
        const candidates = product
          ? [
            [form(flipFirst, m2), `Applies the ${p}% change in the wrong direction.`],
            [form(m1, flipped), `Applies the ${q}% change in the wrong direction.`],
            [form(flipFirst, flipped), "Applies both changes in the wrong direction."],
          ]
          : [
            [times(combined), s1 * p + s2 * q === 0
              ? `Assumes the ${p}% increase and the ${q}% decrease cancel, but the second percent is a percent of the changed amount.`
              : `Combines the ${p}% and ${q}% changes into one change of ${s1 * p + s2 * q > 0 ? "+" : MINUS}${Math.abs(s1 * p + s2 * q)}%, but the second percent is a percent of the changed amount.`],
            // Keeping the discount instead of the price after it is a real slip; keeping only an increase is not.
            ...(s1 < 0 ? [partial] : []),
            [`${num(m1)}${v} ${s2 > 0 ? "+" : MINUS} ${num(q / 100)}`, `${s2 > 0 ? "Adds" : "Subtracts"} ${num(q / 100)} as a number instead of changing the amount by ${q}%.`],
            [form(m1, flipped), `Applies the ${q}% change in the wrong direction.`],
            ...(s1 > 0 ? [partial] : []),
          ];
        const check = () => {
          const start = 500;
          const afterFirst = start + (start * s1 * p) / 100;
          const afterSecond = afterFirst + (afterFirst * s2 * q) / 100;
          const keyValue = numeric ? k * start : evalExpression(keyText, v, start);
          return close(keyValue, afterSecond) &&
            (numeric || candidates.every(([text]) => !close(evalExpression(text, v, start), afterSecond)));
        };
        if (!check()) return null;
        if ([keyText, ...candidates.map(([text]) => text)].some(C.looksCutOff)) return null;
        return packStrict(numeric, k, keyText, candidates, {
          stimulus: null,
          figure: null,
          stem: `${ctx.story(p, q)} ${numeric ? ctx.askK : ctx.ask}`,
          explanation:
            `The first change multiplies ${v} by ${num(m1)}, giving ${num(m1)}${v}. The second change is ${q}% of that new amount, so it ` +
            `multiplies by ${num(m2)}: ${num(m1)}(${num(m2)})${v} = ${num(k)}${v}.`,
          steps: [
            `First change as a multiplier: ${s1 > 0 ? "1 + " : "1 − "}${num(p / 100)} = ${num(m1)}.`,
            `Second change, applied to the new amount: ${s2 > 0 ? "1 + " : "1 − "}${num(q / 100)} = ${num(m2)}.`,
            `Multiply: ${num(m1)} × ${num(m2)} = ${num(k)}, so ${ctx.what} is ${num(k)}${v}.`,
          ],
          principles: [
            "A p% increase multiplies by (1 + p/100); a p% decrease multiplies by (1 − p/100).",
            "Successive percent changes multiply, because each one is a percent of the amount just before it.",
          ],
          trap: `Adding the percents to get ${times(combined)} treats both as percents of ${v}; the second is a percent of the changed amount.`,
          hint: "What single number does each change multiply the amount by?",
          estimatedSeconds: 80,
          verify: check,
        });
      });
    },
  };

  /* ============================== percent-mixture-fixed-part (Hard) */

  // A mixture whose named component is p% of it. One component is added or
  // removed until the named component is q%; the other stays fixed.
  //   dilute:  water added     (named component fixed)
  //   boil:    water removed   (named component fixed)
  //   enrich:  named added     (the rest fixed)
  //   dry:     named (water) removed (the rest fixed)
  const MIXTURES = [
    {
      kind: "dilute", unit: "liters", V: [6, 40, 1], p: [40, 70], q: [20, 60],
      text: (V, p, q, total) => `A mechanic has ${fmt(V)} liters of coolant that is ${p}% antifreeze and the rest water. ` +
        (total ? `Water is added until the coolant is ${q}% antifreeze. How many liters of coolant are there then?`
          : `How many liters of water must be added to make coolant that is ${q}% antifreeze?`),
      fixed: "antifreeze", changed: "water", mix: "coolant",
    },
    {
      kind: "dilute", unit: "milliliters", V: [100, 1000, 20], p: [8, 30], q: [4, 25],
      text: (V, p, q, total) => `A lab technician has ${fmt(V)} milliliters of a salt solution that is ${p}% salt. ` +
        (total ? `Distilled water is added until the solution is ${q}% salt. How many milliliters of solution are there then?`
          : `How many milliliters of distilled water must be added to make a solution that is ${q}% salt?`),
      fixed: "salt", changed: "water", mix: "solution",
    },
    {
      kind: "boil", unit: "liters", V: [4, 60, 1], p: [10, 40], q: [20, 80],
      text: (V, p, q, total) => `A candy maker heats ${fmt(V)} liters of a sugar syrup that is ${p}% sugar until enough water has evaporated that the syrup is ${q}% sugar. ` +
        (total ? "How many liters of syrup remain?" : "How many liters of water evaporated?"),
      fixed: "sugar", changed: "water", mix: "syrup",
    },
    {
      kind: "boil", unit: "kilograms", V: [20, 300, 5], p: [3, 8], q: [10, 25],
      text: (V, p, q, total) => `A shallow pan holds ${fmt(V)} kilograms of seawater that is ${p}% salt by mass. Water evaporates until the remaining brine is ${q}% salt by mass. ` +
        (total ? "What is the mass, in kilograms, of the remaining brine?" : "How many kilograms of water evaporated?"),
      fixed: "salt", changed: "water", mix: "brine",
    },
    {
      kind: "enrich", unit: "grams", V: [100, 900, 20], p: [10, 40], q: [20, 70],
      text: (V, p, q, total) => `A chef has ${fmt(V)} grams of a syrup that is ${p}% sugar by mass. ` +
        (total ? `The chef stirs in sugar until the syrup is ${q}% sugar by mass. What is the mass, in grams, of the syrup then?`
          : `How many grams of sugar must be added to make a syrup that is ${q}% sugar by mass?`),
      fixed: "water", changed: "sugar", mix: "syrup",
    },
    {
      kind: "enrich", unit: "grams", V: [40, 400, 10], p: [20, 60], q: [30, 80],
      text: (V, p, q, total) => `A jeweler has ${fmt(V)} grams of an alloy that is ${p}% silver by mass. ` +
        (total ? `The jeweler melts in pure silver until the alloy is ${q}% silver by mass. What is the mass, in grams, of the alloy then?`
          : `How many grams of pure silver must be melted in to make an alloy that is ${q}% silver by mass?`),
      fixed: "other metals", changed: "silver", mix: "alloy",
    },
    {
      kind: "dry", unit: "kilograms", V: [20, 500, 5], p: [75, 92], q: [10, 30],
      text: (V, p, q, total) => `Fresh apricots are ${p}% water by mass. A farm dries ${fmt(V)} kilograms of fresh apricots until they are ${q}% water by mass. ` +
        (total ? "What is the mass, in kilograms, of the dried apricots?" : "How many kilograms of water are removed?"),
      fixed: "fruit solids", changed: "water", mix: "dried apricots",
    },
    {
      kind: "dry", unit: "kilograms", V: [20, 400, 5], p: [76, 85], q: [10, 20],
      text: (V, p, q, total) => `Grapes are ${p}% water by mass, and the raisins made from them are ${q}% water by mass. ` +
        (total ? `What is the mass, in kilograms, of the raisins made from ${fmt(V)} kilograms of grapes?`
          : `How many kilograms of water are removed in making raisins from ${fmt(V)} kilograms of grapes?`),
      fixed: "grape solids", changed: "water", mix: "raisins",
    },
  ];

  const percentMixture = {
    id: "percent-mixture-fixed-part",
    domain: DOMAIN,
    skill: "Percentages",
    subskill: "percent applications",
    difficulty: "Medium",
    title: "Mixtures in which one part stays fixed",
    recognize:
      "Only one component is added or removed, so the other component's amount does not change: find that amount from " +
      "the original percent, then find the total that makes it the right percent afterward.",
    // Medium: once the unchanged component is spotted the rest is two
    // steps, and the stem says which component is added or removed.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["percent-base", "intermediate-value", "wrong-quantity"],
    build(t) {
      const ctx = t.pick(MIXTURES);
      const askTotal = t.chance(0.5);
      const numeric = t.chance(0.35);
      const namedFixed = ctx.kind === "dilute" || ctx.kind === "boil";
      const amount = (value) => plural(tidy(value), ctx.unit.slice(0, -1), ctx.unit);
      const adding = ctx.kind === "dilute" || ctx.kind === "enrich";
      return retry(() => {
        const V = t.int(Math.ceil(ctx.V[0] / ctx.V[2]), Math.floor(ctx.V[1] / ctx.V[2])) * ctx.V[2];
        const p = t.int(ctx.p[0], ctx.p[1]);
        const q = t.int(ctx.q[0], ctx.q[1]);
        const namedGoesUp = ctx.kind === "boil" || ctx.kind === "enrich";
        if (namedGoesUp ? q < p + 5 : q > p - 5) return null;
        if (p % 5 && t.chance(0.6)) return null;
        const fixedShare = namedFixed ? p : 100 - p;
        const fixedShareAfter = namedFixed ? q : 100 - q;
        const I = tidy((V * fixedShare) / 100);
        const T = tidy((V * fixedShare) / fixedShareAfter);
        const delta = tidy(Math.abs(T - V));
        if (!isClean(I, 2) || !isClean(T, 1) || !isClean(delta, 1) || delta === 0) return null;
        const key = askTotal ? T : delta;
        if (!fitsGrid(key)) return null;
        const gap = Math.abs(p - q);
        const points = tidy((V * gap) / 100);
        const signed = (d) => tidy(adding ? V + d : V - d);
        const asked = (d) => (askTotal ? signed(d) : d);
        const candidates = [
          [asked(points), `Takes the ${gap}-percentage-point change as ${gap}% of the original ${fmt(V)} ${ctx.unit}, but the ${ctx.fixed} amount is what stays fixed.`],
          [askTotal ? delta : T, askTotal
            ? `Gives the amount of ${ctx.changed} ${adding ? "added" : "removed"}, not the amount of ${ctx.mix} afterward.`
            : `Gives the amount of ${ctx.mix} afterward, not the amount of ${ctx.changed} ${adding ? "added" : "removed"}.`],
        ];
        if (ctx.kind === "dilute") {
          const relative = tidy((V * gap) / p);
          candidates.push([asked(relative), `Changes the amount by ${gap}/${p} of ${fmt(V)}, the fraction by which the percent falls, instead of keeping the ${ctx.fixed} fixed.`]);
        }
        if (ctx.kind === "dry") {
          const misread = tidy((I * 100) / q);
          if (misread < V) candidates.push([askTotal ? misread : tidy(V - misread), `Treats ${q}% as the share of the ${ctx.fixed} afterward, but ${q}% is the share of water.`]);
        }
        if (ctx.kind === "enrich") {
          candidates.push([asked(tidy((V * q) / 100)), `Adds ${q}% of the original ${fmt(V)} ${ctx.unit} as ${ctx.changed}.`]);
        }
        candidates.push([asked(gap), `Treats the ${gap}-percentage-point change as ${amount(gap)}.`]);
        candidates.push([I, `Stops at the amount of ${ctx.fixed}, ${amount(I)}, which is the quantity that stays fixed.`]);
        candidates.push([askTotal ? V : tidy(V * p / 100), askTotal
          ? `Keeps the original ${fmt(V)} ${ctx.unit}, as if changing the percent did not change the total.`
          : `Gives ${p}% of the original ${fmt(V)} ${ctx.unit} instead of the amount of ${ctx.changed} ${adding ? "added" : "removed"}.`]);
        return packRanked(t, numeric, key, candidates, {
          stimulus: null,
          stem: ctx.text(V, p, q, askTotal),
          explanation:
            `Only ${ctx.changed} is ${adding ? "added" : "removed"}, so the amount of ${ctx.fixed} stays at ${fixedShare}% of ${fmt(V)} = ${amount(I)}. ` +
            `Afterward that ${amount(I)} is ${fixedShareAfter}% of the ${ctx.mix}, so there are ${num(I)} ÷ ${num(fixedShareAfter / 100)} = ${amount(T)} of ${ctx.mix}, ` +
            `and ${amount(delta)} of ${ctx.changed} ${adding ? "was added" : "was removed"}.`,
          steps: [
            `The amount of ${ctx.fixed} does not change: ${fixedShare}% of ${fmt(V)} = ${amount(I)}.`,
            `Afterward it is ${fixedShareAfter}% of the ${ctx.mix}: ${num(I)} ÷ ${num(fixedShareAfter / 100)} = ${amount(T)}.`,
            `Change in ${ctx.changed}: ${adding ? `${num(T)} ${MINUS} ${fmt(V)}` : `${fmt(V)} ${MINUS} ${num(T)}`} = ${num(delta)}.`,
            `The question asks for ${askTotal ? `the ${ctx.mix} afterward` : `the ${ctx.changed} ${adding ? "added" : "removed"}`}: ${num(key)}.`,
          ],
          principles: [
            "When only one component is added or removed, the amount of the other component is unchanged; build the answer around it.",
            "A change in percentage points is not a percent of the original total.",
          ],
          trap: `The percent moves from ${p}% to ${q}%, but the total changes too; the ${ctx.fixed} amount is what stays fixed.`,
          hint: "Which ingredient's amount is the same before and after?",
          estimatedSeconds: 110,
          verify: () => {
            const d = askTotal ? Math.abs(key - V) : key;
            const total = adding ? V + d : V - d;
            const named = (V * p) / 100 + (namedFixed ? 0 : adding ? d : -d);
            return total > 0 && close((named / total) * 100, q);
          },
        }, { show: num, places: 2 });
      });
    },
  };

  /* ================================ percent-of-equals-percent-of (Hard) */

  // p% of one amount equals q% of another. The equation fixes the ratio of
  // the amounts, inversely: the amount taken at the smaller percent is the
  // larger amount.
  const EQUAL_SHARES = [
    {
      x: "x", y: "y",
      open: (p, q) => `For positive numbers x and y, ${p}% of x is equal to ${q}% of y.`,
      askShare: "What percent of x + y is x?",
      askTotal: (T) => `If x + y = ${fmt(T)}, what is the value of y?`,
      askLess: (word) => `The value of y is what percent ${word} than the value of x?`,
      yName: "y", xName: "x",
    },
    {
      x: "juniors", y: "seniors", counts: true,
      open: (p, q) => `At a high school, ${p}% of the juniors and ${q}% of the seniors are in the school choir, and the choir has the same number of juniors as seniors.`,
      askShare: "What percent of all the juniors and seniors at the school are juniors?",
      askTotal: (T) => `The school has ${fmt(T)} juniors and seniors in all. How many seniors does the school have?`,
      askLess: (word) => `The number of seniors at the school is what percent ${word} than the number of juniors?`,
      yName: "the number of seniors", xName: "the number of juniors",
    },
    {
      x: "road budget", y: "park budget",
      open: (p, q) => `A town spent ${p}% of its road budget and ${q}% of its park budget on repairs, and the two amounts spent on repairs were equal.`,
      askShare: "The road budget is what percent of the two budgets combined?",
      askTotal: (T) => `The two budgets total ${money(T)}. What is the park budget, in dollars?`,
      askLess: (word) => `The park budget is what percent ${word} than the road budget?`,
      yName: "the park budget", xName: "the road budget",
    },
    {
      x: "morning riders", y: "evening riders", counts: true,
      open: (p, q) => `On a bus route, ${p}% of the morning riders and ${q}% of the evening riders paid with a transit card, and the same number of riders paid with a transit card in the morning as in the evening.`,
      askShare: "The morning riders were what percent of all the morning and evening riders?",
      askTotal: (T) => `There were ${fmt(T)} morning and evening riders in all. How many evening riders were there?`,
      askLess: (word) => `The number of evening riders was what percent ${word} than the number of morning riders?`,
      yName: "the number of evening riders", xName: "the number of morning riders",
    },
  ];

  const EQUAL_PERCENTS = [10, 12, 15, 16, 20, 24, 25, 30, 32, 36, 40, 45, 48, 50, 60, 64, 75, 80];

  const percentEqualsPercent = {
    id: "percent-of-equals-percent-of",
    domain: DOMAIN,
    skill: "Percentages",
    subskill: "percent applications",
    difficulty: "Medium",
    title: "One percent of an amount equal to another percent of another",
    recognize:
      "p% of x = q% of y means px = qy, so x : y = q : p: the amount taken at the smaller percent is the larger amount. " +
      "Turn the equation into that ratio before asking what fraction or percent of the total each amount is.",
    // Medium (relabelled from Hard, 2026-09-26 review): one equation turned
    // into a ratio, then one share or difference of it. The inverse pairing
    // (the larger percent goes with the smaller amount) is the trap.
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["reversed-condition", "percent-base", "part-vs-whole"],
    build(t) {
      const ctx = t.pick(EQUAL_SHARES);
      const form = t.pick(["share", "total", "less"]);
      const numeric = form === "total" ? t.chance(0.55) : t.chance(0.25);
      return retry(() => {
        const [p, q] = t.sample(EQUAL_PERCENTS, 2);
        // p x = q y  =>  x : y = q : p.
        const g = S.gcd(p, q);
        const rx = q / g;
        const ry = p / g;
        if (rx + ry > 25) return null;
        const pct = (value) => (numeric ? fmt(value) : `${num(value)}%`);
        const ratioStep = `${p}x = ${q}y, so x : y = ${q} : ${p} = ${rx} : ${ry}.`;
        const named = ctx.x === "x" ? "" : `Let x be ${ctx.xName} and y be ${ctx.yName}. `;
        const principles = [
          "If p% of x equals q% of y, then px = qy, so x : y = q : p; the larger percent goes with the smaller amount.",
          "A part of a total uses the sum of the ratio's terms as the whole.",
        ];
        const hint = "Write the equal amounts as an equation. Which of the two amounts must be larger?";
        if (form === "share") {
          const key = tidy((100 * rx) / (rx + ry));
          if (!isClean(key, 2)) return null;
          return packRanked(t, numeric, key, [
            [tidy((100 * ry) / (rx + ry)), `Pairs the larger percent with the larger amount, so x : y = ${p} : ${q}; the amount taken at the larger percent is the smaller one.`],
            [tidy((100 * rx) / ry), `Gives x as a percent of y instead of as a percent of x + y.`],
            [tidy((100 * p) / (p + q)), `Uses the percents themselves as the shares, ${p} out of ${p} + ${q}, which pairs them with the wrong amounts.`],
            [50, "Assumes that because the two parts are equal, the two amounts are equal too."],
            [tidy((100 * ry) / rx), `Gives y as a percent of x.`],
          ], {
            stimulus: null,
            stem: `${ctx.open(p, q)} ${ctx.askShare}`,
            explanation:
              `${named}${ratioStep} So x is ${rx} of every ${rx + ry} parts of x + y: ${rx}/${rx + ry} = ${num(key / 100)}, or ${num(key)}%.`,
            steps: [
              `Set the amounts equal: ${num(p / 100)}x = ${num(q / 100)}y.`,
              `Solve for the ratio: x : y = ${q} : ${p} = ${rx} : ${ry}.`,
              `x is ${rx} of ${rx + ry} parts of the total: ${rx}/${rx + ry} = ${num(key)}%.`,
            ],
            principles,
            trap: `The percent attached to x is not x's share: x is taken at ${p}%, so x : y = ${q} : ${p}, and pairing ${p} with x reverses the ratio.`,
            hint,
            estimatedSeconds: 110,
            verify: () => {
              // Any x, y with p% of x = q% of y give the same share.
              const x = 1000;
              const y = (p * x) / q;
              return close((100 * x) / (x + y), key);
            },
          }, { show: pct });
        }
        if (form === "total") {
          const unit = t.int(4, 60) * (ctx.x === "road budget" ? 500 : 5);
          const T = unit * (rx + ry);
          const key = unit * ry;
          const show = numeric ? fmt : ctx.x === "road budget" ? money : fmt;
          return packRanked(t, numeric, key, [
            [unit * rx, `Splits the total in the ratio of the percents, ${p} : ${q}, which pairs the larger percent with the larger amount; this is x, not y.`],
            [tidy((T * q) / 100), `Takes ${q}% of the total instead of finding y's share of it.`],
            [tidy((T * p) / 100), `Takes ${p}% of the total instead of finding y's share of it.`],
            [T / 2, "Splits the total equally, as if equal parts meant equal amounts."],
            [unit, `Stops at the size of one share, ${fmt(T)} ÷ ${rx + ry} = ${fmt(unit)}.`],
          ], {
            stimulus: null,
            stem: `${ctx.open(p, q)} ${ctx.askTotal(T)}`,
            explanation:
              `${named}${ratioStep} The total is ${rx + ry} equal shares of ${fmt(T)} ÷ ${rx + ry} = ${fmt(unit)}, and y is ${ry} of them: ${ry} × ${fmt(unit)} = ${fmt(key)}.`,
            steps: [
              `Set the amounts equal: ${num(p / 100)}x = ${num(q / 100)}y, so x : y = ${rx} : ${ry}.`,
              `One share: ${fmt(T)} ÷ ${rx + ry} = ${fmt(unit)}.`,
              `y = ${ry} × ${fmt(unit)} = ${fmt(key)}.`,
            ],
            principles,
            trap: `Splitting ${fmt(T)} in the ratio ${p} : ${q} gives y the larger share, but y is taken at the ${q > p ? "larger" : "smaller"} percent, so it is the ${q > p ? "smaller" : "larger"} amount.`,
            hint,
            estimatedSeconds: 110,
            verify: () => {
              const x = T - key;
              return close((p / 100) * x, (q / 100) * key) && x > 0;
            },
          }, { show, places: ctx.counts ? 0 : 2 });
        }
        // y compared with x as a percent of x.
        if (rx === ry) return null;
        const less = ry < rx;
        const word = less ? "less" : "greater";
        const key = tidy((100 * Math.abs(rx - ry)) / rx);
        if (!isClean(key, 2)) return null;
        return packRanked(t, numeric, key, [
          [Math.abs(p - q), `Subtracts the percents, ${Math.max(p, q)} ${MINUS} ${Math.min(p, q)}, as if they measured y against x.`],
          [tidy((100 * Math.abs(rx - ry)) / ry), `Measures the difference as a percent of y instead of x, the amount after "than".`],
          [tidy((100 * ry) / rx), `Gives y as a percent of x instead of the percent by which they differ.`],
          [tidy((100 * Math.abs(p - q)) / Math.max(p, q)), `Compares the percents, ${Math.abs(p - q)} out of ${Math.max(p, q)}, instead of the amounts.`],
        ], {
          stimulus: null,
          stem: `${ctx.open(p, q)} ${ctx.askLess(word)}`,
          explanation:
            `${named}${ratioStep} So y is ${ry}/${rx} of x, which is ${num(tidy((100 * ry) / rx))}% of x: ${key}% ${word}.`,
          steps: [
            `Set the amounts equal: ${num(p / 100)}x = ${num(q / 100)}y, so y = (${p}/${q})x = (${ry}/${rx})x.`,
            `As a percent of x: ${ry}/${rx} = ${num(tidy((100 * ry) / rx))}%.`,
            `The difference from 100% is ${num(key)}%, so y is ${num(key)}% ${word} than x.`,
          ],
          principles: principles.concat(['"A is p% less than B" measures the difference as a percent of B, the amount after "than".']),
          trap: `The percents differ by ${Math.abs(p - q)} points, but a percent difference between the amounts is measured against x: ${num(key)}%.`,
          hint,
          estimatedSeconds: 110,
          verify: () => {
            const x = 1200;
            const y = (p * x) / q;
            return close((100 * Math.abs(x - y)) / x, key) && (y < x) === less;
          },
        }, { show: pct });
      });
    },
  };

  /* ===================================== percent-base-reversal (Hard) */

  // "A is p% more than B" read back the other way: the same difference is a
  // different percent of the other amount.
  const REVERSALS = [
    { a: "the price of a blender at store A", aRef: "the price at store A", b: "the price of the blender at store B", bRef: "the price at store B" },
    { a: "the height of the oak tree", b: "the height of the maple tree" },
    { a: "the population of Easton", b: "the population of Weston" },
    { a: "Kiran's monthly salary", b: "Lena's monthly salary" },
    { a: "this year's attendance at a festival", aRef: "this year's attendance", b: "last year's attendance" },
    { a: "the length of the red trail", b: "the length of the blue trail" },
    { a: "the mass of box P", b: "the mass of box Q" },
    { a: "the number of members of the chess club", b: "the number of members of the debate club" },
  ];

  const percentBaseReversal = {
    id: "percent-base-reversal",
    domain: DOMAIN,
    skill: "Percentages",
    subskill: "percent change",
    difficulty: "Medium",
    title: "A percent comparison read in the other direction",
    recognize:
      '"A is p% more than B" takes the percent of B. Read the other way, the same difference is a percent of A, so it is a ' +
      "different percent: give B a convenient value and compare directly.",
    // Medium (relabelled from Hard, 2026-09-26 review): one comparison read
    // back with a convenient base; the intuitive answer (the same percent)
    // is offered and wrong.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["percent-base", "reversed-condition"],
    build(t) {
      const pick = t.pick(REVERSALS);
      // Later mentions may shorten the phrases ("the price at store A").
      const ctx = { ...pick, a: pick.aRef || pick.a, b: pick.bRef || pick.b, first: pick.a, firstB: pick.b };
      const up = t.chance(0.5);
      const ask = t.pick(["reverse", "reverse", "ratio"]);
      const numeric = t.chance(0.25);
      return retry(() => {
        // up: A = B(1 + p/100); down: A = B(1 - p/100).
        const p = up ? t.int(1, 30) * 5 : t.int(1, 16) * 5;
        const value = up ? 100 + p : 100 - p;
        const reverse = tidy((100 * p) / value);
        const ratioBA = tidy((100 * 100) / value);
        // The exact percent is (100p)/value or 10,000/value. A "closest to"
        // item offers whole percents and keeps only wrong choices at least
        // twice as far from the exact value as the key (percentKey).
        const key = percentKey(ask === "reverse" ? 100 * p : 10000, value, numeric);
        if (!key) return null;
        const exact = key.exact;
        const shownKey = key.text;
        const about = exact ? "" : "about ";
        const compare = `${cap(ctx.first)} is ${p}% ${up ? "greater" : "less"} than ${ctx.firstB}.`;
        const stem = ask === "reverse"
          ? `${compare} ${exact ? "By what percent" : "By approximately what percent"} is ${ctx.b} ${up ? "less" : "greater"} than ${ctx.a}?`
          : `${compare} ${cap(ctx.b)} is ${exact ? "what" : "approximately what"} percent of ${ctx.a}?`;
        const mirror = 100 + (up ? -p : p);
        const candidates = ask === "reverse"
          ? [
            [p, `Uses the same ${p}%, but read the other way the difference is measured against ${ctx.a}, not ${ctx.b}.`],
            [ratioBA, `Gives ${ctx.b} as a percent of ${ctx.a} instead of the percent by which they differ.`],
            [value, `Gives ${ctx.a} as a percent of ${ctx.b}.`],
            [mirror > 0 ? (100 * p) / mirror : NaN, `Divides the difference, ${p}, by ${mirror}, the rule for the comparison in the other direction.`],
          ]
          : [
            [mirror, `Reverses the comparison by ${up ? "subtracting" : "adding"} the same ${p}%, but that ${p}% would be a percent of ${ctx.a}, not ${ctx.b}.`],
            [value, `Gives ${ctx.a} as a percent of ${ctx.b}, the comparison as stated.`],
            [reverse, `Gives the percent by which the two differ instead of ${ctx.b} as a percent of ${ctx.a}.`],
            [p, `Gives the percent in the comparison, ${p}%, instead of the ratio of the amounts.`],
          ];
        return finishPercent(t, numeric, key, candidates, {
          stimulus: null,
          stem,
          explanation:
            `Let ${ctx.b} be 100. Then ${ctx.a} is 100 ${up ? "+" : MINUS} ${p} = ${value}. ` +
            (ask === "reverse"
              ? `The difference, ${p}, as a fraction of ${ctx.a} is ${p}/${value}, which is ${percentPhrase(key)}.`
              : `${cap(ctx.b)} is 100/${value} of ${ctx.a}, which is ${percentPhrase(key)}.`),
          steps: [
            `Give ${ctx.b} a convenient value: 100.`,
            `Then ${ctx.a} is ${value}.`,
            ask === "reverse"
              ? `Compare the difference with ${ctx.a}, the amount after "than": ${p} ÷ ${value}.`
              : `Compare with ${ctx.a}: 100 ÷ ${value}.`,
            `As a percent: ${percentPhrase(key)}.`,
          ],
          principles: [
            '"A is p% more than B" means A = B(1 + p/100); the percent is taken of B, the amount after "than".',
            "Reversing a comparison changes the base, so the percent changes too.",
          ],
          trap: `Read backward, the difference is compared with ${ctx.a}, a different base, so the percent is not ${p}.`,
          hint: `Give ${ctx.b} a convenient value. What is ${ctx.a} then?`,
          estimatedSeconds: 95,
          verify: () => {
            const B = 2000;
            const A = B + (B * (up ? p : -p)) / 100;
            const actual = ask === "reverse" ? (100 * Math.abs(A - B)) / A : (100 * B) / A;
            const keyValue = numeric ? C.fractionValue(String(key.numericKey)) : key.shown;
            return exact ? close(actual, keyValue) : Math.abs(actual - keyValue) <= 0.5;
          },
        }, true);
      });
    },
  };

  /* ================================= percent-share-and-total (Hard) */

  // A part that is a share of a whole, where the whole and the share (or the
  // whole and the part) both change: part = share × whole, so the changes
  // multiply. `pctOf` names the share; `have` finishes "…% of the <short>".
  const SHARE_SCENES = [
    { whole: "households in Fairview", short: "households", part: "households with solar panels", pctOf: "the percent of households that had solar panels", have: "had solar panels", from: "2018", to: "2024" },
    { whole: "students at Ridge High School", short: "students", part: "students who bike to school", pctOf: "the percent of students who biked to school", have: "biked to school", from: "2021", to: "2025" },
    { whole: "employees of a software company", short: "employees", part: "employees who work remotely", pctOf: "the percent of employees who worked remotely", have: "worked remotely", from: "2022", to: "2025" },
    { whole: "items checked out from a city library", short: "items checked out", part: "checked-out items that were e-books", pctOf: "the percent of checked-out items that were e-books", have: "were e-books", from: "2019", to: "2024" },
    { whole: "registered voters in a county", short: "registered voters", part: "registered voters who voted in the county election", pctOf: "the percent of registered voters who voted in the county election", have: "voted in the county election", from: "2020", to: "2024" },
    { whole: "visitors to a state park", short: "visitors", part: "visitors who camped overnight", pctOf: "the percent of visitors who camped overnight", have: "camped overnight", from: "2021", to: "2024" },
  ];

  const SHARE_STARTS = [10, 12, 15, 16, 20, 24, 25, 30, 32, 35, 40, 45, 48, 50, 60];
  const WHOLE_CHANGES = [5, 10, 15, 20, 25, 40, 50];

  const percentShareAndTotal = {
    id: "percent-share-and-total",
    domain: DOMAIN,
    skill: "Percentages",
    subskill: "percent applications",
    difficulty: "Hard",
    title: "A share and its whole changing together",
    recognize:
      "The part is the share times the whole, so when both change, the part's multiplier is the product of theirs (or the " +
      "share's is the quotient). A change in a percent is not a percent change: 20% to 25% is 5 percentage points, a 25% rise.",
    // Hard: the structure (part = share × whole) must be seen before any
    // arithmetic; percentage points, the share's own change, and added
    // changes are all offered, and no count is ever given.
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["percent-base", "neighbouring-rule", "wrong-quantity"],
    build(t) {
      const scene = t.pick(SHARE_SCENES);
      const askPart = t.chance(0.5);
      const numeric = t.chance(0.45);
      const principles = [
        "part = share × whole, so if the whole is multiplied by a and the share by b, the part is multiplied by ab.",
        "A change from s₁% to s₂% is s₂ − s₁ percentage points; as a percent change it is (s₂ − s₁)/s₁ × 100%.",
      ];
      return retry(() => {
        const s1 = t.pick(SHARE_STARTS);
        const w = t.pick(WHOLE_CHANGES) * t.sign();
        const wholeLine = `From ${scene.from} to ${scene.to}, the number of ${scene.whole} ${changed(w)}`;
        const check = (share2, partChange) => {
          // A concrete whole, run forward: 10,000 at the start.
          const whole1 = 10000;
          const part1 = (whole1 * s1) / 100;
          const whole2 = whole1 + (whole1 * w) / 100;
          const part2 = share2 === null ? part1 + (part1 * partChange) / 100 : (whole2 * share2) / 100;
          return { partPercent: (100 * (part2 - part1)) / part1, sharePercent: (100 * part2) / whole2 };
        };
        if (askPart) {
          const s2 = t.pick(SHARE_STARTS.concat([18, 22, 28, 36, 42, 55]));
          if (s2 === s1 || Math.abs(s2 - s1) < 3) return null;
          // part multiplier = (s2/s1)(1 + w/100); percent change = |s2(100 + w) − 100 s1| / s1.
          const signed = s2 * (100 + w) - 100 * s1;
          if (signed === 0) return null;
          const up = signed > 0;
          const key = numeric ? percentKey(Math.abs(signed), s1, true) : percentKey(Math.abs(signed), s1, false);
          if (!key || !key.exact || key.value < 4 || key.value > 150) return null;
          const shareRel = (100 * (s2 - s1)) / s1;
          const word = up ? "increase" : "decrease";
          const candidates = [
            [Math.abs(s2 - s1), `Gives the change in the percent, ${s2} ${MINUS} ${s1} = ${Math.abs(s2 - s1)} percentage points, not the percent change in the number of ${scene.part}.`],
            [Math.abs(shareRel), `Finds the percent change in the share, ${num(tidy(Math.abs(shareRel)))}%, but the number of ${scene.short} changed too.`],
            [Math.abs(shareRel + w), `Adds the ${num(tidy(Math.abs(shareRel)))}% change in the share and the ${Math.abs(w)}% change in the number of ${scene.short}; changes of a product multiply.`],
            [Math.abs(w), `Gives the change in the number of ${scene.short} only.`],
            [Math.abs(s2 - s1 + w), `Adds the ${Math.abs(s2 - s1)}-point change in the percent to the ${Math.abs(w)}% change in the number of ${scene.short}.`],
          ];
          const partMult = tidy(((100 + w) * s2) / (100 * s1));
          const multText = isClean(partMult, 4) ? num(partMult) : `about ${num(Math.round(partMult * 10000) / 10000)}`;
          return finishPercent(t, numeric, key, candidates, {
            stimulus: null,
            stem: `${wholeLine}, and ${scene.pctOf} ${s2 > s1 ? "rose" : "fell"} from ${s1}% to ${s2}%. By what percent did the number of ${scene.part} ${word} from ${scene.from} to ${scene.to}?`,
            explanation:
              `The number of ${scene.part} is the percent times the number of ${scene.short}. The percent was multiplied by ${s2}/${s1} and the number of ` +
              `${scene.short} by ${multiplier(w)}, so the part was multiplied by (${s2}/${s1}) × ${multiplier(w)} = ${multText}: ${up ? "an increase" : "a decrease"} of ${percentPhrase(key)}.`,
            steps: [
              `Write the part as share × whole: ${num(s1 / 100)} × W in ${scene.from} and ${num(s2 / 100)} × ${multiplier(w)}W in ${scene.to}.`,
              `Divide: (${num(s2 / 100)} × ${multiplier(w)}) ÷ ${num(s1 / 100)} = ${multText}.`,
              `A multiplier of ${multText} is ${up ? "an increase" : "a decrease"} of ${percentPhrase(key)}.`,
            ],
            principles,
            trap: `The percent moved ${Math.abs(s2 - s1)} points, which is neither the percent change in the share nor in the number of ${scene.part}; the number of ${scene.short} changed as well.`,
            hint: `What is the number of ${scene.part}, written using the number of ${scene.short}?`,
            estimatedSeconds: 120,
            verify: () => {
              const { partPercent } = check(s2, 0);
              const keyValue = numeric ? C.fractionValue(String(key.numericKey)) : key.shown;
              return (partPercent > 0) === up && close(Math.abs(partPercent), keyValue);
            },
          }, true);
        }
        const r = t.pick([10, 20, 25, 30, 40, 50, 60, 75]) * t.sign();
        if (r === w) return null;
        // new share = s1 (100 + r)/(100 + w).
        const key = percentKey(s1 * (100 + r), 100 + w, numeric);
        if (!key || !key.exact || key.value >= 100 || close(key.value, s1)) return null;
        const candidates = [
          [(s1 * (100 + r)) / 100, `Applies the ${Math.abs(r)}% change to the percent itself, as if the number of ${scene.short} had not changed.`],
          [s1 + r - w, `Treats the two percent changes as percentage points: ${s1} ${r > 0 ? "+" : MINUS} ${Math.abs(r)} ${w > 0 ? MINUS : "+"} ${Math.abs(w)}.`],
          [(s1 * (100 + r) * (100 + w)) / 10000, `Multiplies by ${multiplier(w)}, the change in the number of ${scene.short}, instead of dividing by it.`],
          [(s1 * (100 + r - w)) / 100, `Combines the changes into one change of ${r - w > 0 ? "" : MINUS}${Math.abs(r - w)}% by subtracting them; they divide.`],
          [s1 + r, `Adds ${Math.abs(r)} percentage points for the ${Math.abs(r)}% change in the number of ${scene.part}.`],
        ].filter(([value]) => value > 0 && value < 100);
        const pctText = () => percentPhrase(key);
        return finishPercent(t, numeric, key, candidates.map(([value, reason]) => [value, reason]), {
          stimulus: null,
          stem: `${wholeLine}, and the number of ${scene.part} ${changed(r)}. In ${scene.from}, ${s1}% of the ${scene.short} ${scene.have}. ` +
            (numeric ? `In ${scene.to}, p% of the ${scene.short} ${scene.have}. What is the value of p?` : `What percent of the ${scene.short} ${scene.have} in ${scene.to}?`),
          explanation:
            `The share is the part divided by the whole. The part was multiplied by ${multiplier(r)} and the whole by ${multiplier(w)}, so the share was ` +
            `multiplied by ${multiplier(r)} ÷ ${multiplier(w)}: ${s1}% × ${multiplier(r)} ÷ ${multiplier(w)} = ${pctText(key.text)}.`,
          steps: [
            `Write the share as part ÷ whole: ${s1}% in ${scene.from}.`,
            `The part is multiplied by ${multiplier(r)} and the whole by ${multiplier(w)}.`,
            `New share: ${s1} × ${multiplier(r)} ÷ ${multiplier(w)} = ${key.text}, so ${pctText(key.text)}.`,
          ],
          principles,
          trap: `A ${Math.abs(r)}% change in the number of ${scene.part} is not ${Math.abs(r)} percentage points, and the whole changed too, so the share changes by the ratio of the two multipliers.`,
          hint: `The percent is one number divided by another. What happened to each of them?`,
          estimatedSeconds: 120,
          verify: () => {
            const { sharePercent } = check(null, r);
            const keyValue = numeric ? C.fractionValue(String(key.numericKey)) : key.shown;
            return close(sharePercent, keyValue);
          },
        }, true);
      });
    },
  };

  // Existing templates keep their order (a run code rebuilds its questions
  // in this order); new templates are appended.
  return [
    percentQuantity, percentChangeValues, percentSubgroup, percentExpression, successivePercentUndo, percentMixture,
    successivePercent, percentEqualsPercent, percentBaseReversal, percentComparisonChain, percentShareAndTotal,
  ];
});
