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

  const { MINUS, num } = S;
  const {
    DATA, tidy, isClean, fitsGrid, fmt, shown, retry, pack, close, DOMAIN, offerHard, finish,
  } = C;

  // "$96" or "$76.80".
  function money(value) {
    const v = tidy(value);
    if (Number.isInteger(v)) return `$${fmt(v)}`;
    const [whole, cents] = v.toFixed(2).split(".");
    return `$${fmt(Number(whole))}.${cents}`;
  }

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

  const PRICE_SCENES = [
    { up: false, stem: (P, p, numeric) => `A jacket that regularly costs ${money(P)} is on sale for ${p}% off the regular price. What is the sale price of the jacket${numeric ? ", in dollars" : ""}?`, change: "discount" },
    { up: false, stem: (P, p, numeric) => `The regular price of a lamp is ${money(P)}. During a sale, the price is reduced by ${p}%. What is the sale price of the lamp${numeric ? ", in dollars" : ""}?`, change: "discount" },
    { up: true, stem: (P, p, numeric) => `The price of a bicycle is ${money(P)} before tax. A sales tax of ${p}% is added to this price. What is the total cost of the bicycle, including tax${numeric ? ", in dollars" : ""}?`, change: "tax" },
    { up: true, stem: (P, p, numeric) => `The bill for a group's dinner is ${money(P)}. The group adds a ${p}% tip to the bill. What is the total amount the group pays${numeric ? ", in dollars" : ""}?`, change: "tip" },
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
      const wrong = offerHard(show(start), candidates);
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
      const wrong = offerHard(num(key), candidates);
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
      const wrong = offerHard(num(key), candidates);
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
          const p = t.pick([5, 8, 10, 15, 20, 25, 30, 35, 40]);
          const Pr = t.pick([20, 24, 40, 48, 60, 75, 80, 90, 120, 150, 180, 240, 300, 360]);
          const change = tidy((Pr * p) / 100);
          if (!isClean(change, 2)) return null;
          const key = tidy(scene.up ? Pr + change : Pr - change);
          const other = tidy(scene.up ? Pr - change : Pr + change);
          const show = numeric ? fmt : money;
          const candidates = [
            [show(change), `Gives the amount of the ${scene.change}, ${p}% of ${money(Pr)}, instead of the ${scene.up ? "total" : "sale price"}.`],
            [show(other), scene.up ? `Subtracts the ${p}% ${scene.change} instead of adding it.` : `Adds ${p}% to the price instead of subtracting it.`],
            [Pr > p ? show(scene.up ? Pr + p : Pr - p) : null, `${scene.up ? "Adds" : "Subtracts"} ${p} dollars instead of ${p}% of the price.`],
          ];
          const word = scene.up ? "increases" : "decreases";
          return pack(numeric, key, show(key), candidates, {
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
          });
        });
      }
      const scene = t.pick(COUNT_SCENES);
      return retry(() => {
        const p = t.pick(PERCENTS);
        const N = wholeFor(t, p, 40, 1600);
        if (!N || N === 100) return null;
        const k = (N * p) / 100;
        if (form === "part") {
          return pack(numeric, k, fmt(k), [
            [shown(N - k, 0), `Gives the number of ${scene.no}, the other ${100 - p}%.`],
            [shown(N + k, 0), `Increases ${fmt(N)} by ${p}% instead of finding ${p}% of ${fmt(N)}.`],
            [isClean(k / 10, 1) ? shown(k / 10, 1) : shown(k * 10, 0), `Misplaces the decimal point in writing ${p}% as a decimal.`],
            [shown(N - p, 0), `Subtracts ${p} from ${fmt(N)}, treating the percent as a count.`],
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
          });
        }
        if (form === "percent") {
          const keyText = numeric ? fmt(p) : `${p}%`;
          const reversed = (100 * N) / k;
          return pack(numeric, p, keyText, [
            [`${100 - p}%`, `Gives the percent of ${scene.no}.`],
            [isClean(k / N, 3) ? `${num(tidy(k / N))}%` : null, `Gives the fraction ${fmt(k)}/${fmt(N)} as a decimal, without multiplying by 100 to make a percent.`],
            [isClean(reversed, 2) ? `${fmt(reversed)}%` : null, `Divides ${fmt(N)} by ${fmt(k)}; the percent compares the part with the whole, not the whole with the part.`],
            [k !== p && k < 100 ? `${fmt(k)}%` : null, `Gives the count, ${fmt(k)}, as if it were the percent.`],
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
          });
        }
        const complementWhole = (100 * k) / (100 - p);
        return pack(numeric, N, fmt(N), [
          [shown((k * p) / 100, 2), `Takes ${p}% of ${fmt(k)}; ${fmt(k)} is already the part, and the whole is unknown.`],
          [shown(N - k, 0), `Gives the number of ${scene.no}, the rest of the whole.`],
          [shown((k * (100 + p)) / 100, 2), `Increases ${fmt(k)} by ${p}%, but ${fmt(k)} is ${p}% of the whole, not 100%.`],
          [shown(complementWhole, 0), `Treats ${fmt(k)} as the other ${100 - p}% of the whole.`],
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
        });
      });
    },
  };

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
        const candidates = [
          [isClean(baseNew, 2) ? pct(baseNew) : null, `Divides the change, ${show(diff)}, by the new amount, ${show(b)}, instead of by the original amount, ${show(a)}.`],
          [pct(up ? 100 + size : 100 - size), `Gives the new amount as a percent of the original amount, not the percent change.`],
          [`${num(size / 100)}%`, `Finds the change as the decimal ${num(size / 100)} and writes it as a percent without multiplying by 100.`],
          [diff < 100 && diff !== size ? pct(diff) : null, `Gives the change itself, ${show(diff)}, as if it were the percent.`],
          ...others.map((other) => [other.size !== size ? pct(other.size) : null, "Reads the values from a different row of the table."]),
        ];
        const stem = numeric
          ? `${lead} If ${subject} ${verb}d by p%${span}, what is the value of p?`
          : `${lead} By what percent did ${subject} ${verb}${span}?`;
        return pack(numeric, size, pct(size), candidates, {
          stimulus,
          figure: null,
          stem,
          explanation:
            `The change is ${show(b)} ${MINUS} ${show(a)} = ${up ? "" : MINUS}${show(diff)}. As a fraction of the original amount, ` +
            `${show(diff)} ÷ ${show(a)} = ${num(size / 100)}, which is a ${num(size)}% ${verb}.`,
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
        });
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
          return pack(numeric, key, fmt(key), candidates, {
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
          return pack(numeric, share, pct(share), candidates, {
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
        return pack(numeric, N, fmt(N), candidates, {
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
      story: (p) => `A restaurant bill came to t dollars after a ${p}% tip was added to the cost of the meal.`,
      ask: "Which expression represents the cost, in dollars, of the meal before the tip?",
    },
    {
      v: "h", sign: -1, sizes: [2, 3, 4, 5, 6, 8],
      story: (p) => `After a wool sweater was washed, its length decreased by ${p}% to h inches.`,
      ask: "Which expression represents the length, in inches, of the sweater before it was washed?",
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
      const undo = t.chance(0.45);
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
          const candidates = [
            [`${num(opposite)}${v}`, `Undoes the ${p}% ${ctx.sign > 0 ? "increase" : "decrease"} with a ${p}% ${ctx.sign > 0 ? "decrease" : "increase"}, but that ${p}% would be a percent of the later amount, not the original.`],
            [`${num(m)}${v}`, `Applies the ${p}% ${ctx.sign > 0 ? "increase" : "decrease"} again instead of undoing it.`],
            [`${v} ${ctx.sign > 0 ? MINUS : "+"} ${num(p / 100)}`, `${ctx.sign > 0 ? "Subtracts" : "Adds"} ${num(p / 100)} as a number instead of changing ${v} by a percent.`],
          ];
          const check = () => {
            const original = 400;
            const later = original + (original * ctx.sign * p) / 100;
            return close(evalExpression(keyText, v, later), original) &&
              candidates.every(([text]) => !close(evalExpression(text, v, later), original));
          };
          if (!check()) return null;
          return pack(false, null, keyText, candidates, {
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
        const partial = [form(partOnly, m2), `Uses ${num(partOnly)}, the ${p}% that ${s1 > 0 ? "is added" : "is taken off"}, instead of ${num(m1)}, the multiplier for the whole amount after the change.`];
        const candidates = [
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
        return pack(numeric, k, keyText, candidates, {
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
    title: "Mixtures in which one part stays fixed",
    recognize:
      "Only one component is added or removed, so the other component's amount does not change: find that amount from " +
      "the original percent, then find the total that makes it the right percent afterward.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["percent-base", "intermediate-value", "wrong-quantity"],
    build(t) {
      const ctx = t.pick(MIXTURES);
      const askTotal = t.chance(0.5);
      const numeric = t.chance(0.35);
      const namedFixed = ctx.kind === "dilute" || ctx.kind === "boil";
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
          [shown(asked(points)), `Takes the ${gap}-percentage-point change as ${gap}% of the original ${fmt(V)} ${ctx.unit}, but the ${ctx.fixed} amount is what stays fixed.`],
          [shown(askTotal ? delta : T), askTotal
            ? `Gives the amount of ${ctx.changed} ${adding ? "added" : "removed"}, not the amount of ${ctx.mix} afterward.`
            : `Gives the amount of ${ctx.mix} afterward, not the amount of ${ctx.changed} ${adding ? "added" : "removed"}.`],
        ];
        if (ctx.kind === "dilute") {
          const relative = tidy((V * gap) / p);
          candidates.push([shown(asked(relative)), `Changes the amount by ${gap}/${p} of ${fmt(V)}, the fraction by which the percent falls, instead of keeping the ${ctx.fixed} fixed.`]);
        }
        if (ctx.kind === "dry") {
          const misread = tidy((I * 100) / q);
          if (misread < V) candidates.push([shown(askTotal ? misread : tidy(V - misread)), `Treats ${q}% as the share of the ${ctx.fixed} afterward, but ${q}% is the share of water.`]);
        }
        if (ctx.kind === "enrich") {
          candidates.push([shown(asked(tidy((V * q) / 100))), `Adds ${q}% of the original ${fmt(V)} ${ctx.unit} as ${ctx.changed}.`]);
        }
        candidates.push([shown(gap, 0) && gap !== key ? shown(asked(gap)) : null, `Treats the ${gap}-percentage-point change as ${gap} ${ctx.unit}.`]);
        candidates.push([shown(I), `Stops at the amount of ${ctx.fixed}, ${num(I)} ${ctx.unit}, which is the quantity that stays fixed.`]);
        const wrong = offerHard(num(key), candidates);
        if (!numeric && wrong.length < 3) return null;
        return finish(numeric, {
          stimulus: null,
          stem: ctx.text(V, p, q, askTotal),
          correct: numeric ? key : num(key),
          wrong,
          explanation:
            `Only ${ctx.changed} is ${adding ? "added" : "removed"}, so the amount of ${ctx.fixed} stays at ${fixedShare}% of ${fmt(V)} = ${num(I)} ${ctx.unit}. ` +
            `Afterward that ${num(I)} ${ctx.unit} is ${fixedShareAfter}% of the ${ctx.mix}, so there are ${num(I)} ÷ ${num(fixedShareAfter / 100)} = ${num(T)} ${ctx.unit} of ${ctx.mix}, ` +
            `and ${num(delta)} ${ctx.unit} of ${ctx.changed} ${adding ? "was added" : "was removed"}.`,
          steps: [
            `The amount of ${ctx.fixed} does not change: ${fixedShare}% of ${fmt(V)} = ${num(I)} ${ctx.unit}.`,
            `Afterward it is ${fixedShareAfter}% of the ${ctx.mix}: ${num(I)} ÷ ${num(fixedShareAfter / 100)} = ${num(T)} ${ctx.unit}.`,
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
        });
      });
    },
  };

  return [percentQuantity, percentChangeValues, percentSubgroup, percentExpression, successivePercent, percentMixture];
});
