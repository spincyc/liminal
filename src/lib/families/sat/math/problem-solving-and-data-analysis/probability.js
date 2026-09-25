(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/problem-solving-and-data-analysis"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Probability templates (Problem-Solving and Data Analysis), ordered Easy, Medium, Hard.

  const { MINUS, num, frac, table } = S;
  const {
    DATA, tidy, isClean, fitsGrid, fmt, sum, range, retry, pack, parseTable, parseNumber,
    fractionValue, close, DOMAIN, offerHard, finish, r1, seg, chartText,
  } = C;

  /* ========================================= two-way-table-chance (Easy) */

  const CHANCE_SCENES = [
    {
      intro: "The table shows the numbers of students in three grades who chose each lunch option at a school on Friday.",
      corner: "Grade", rows: ["Grade 10", "Grade 11", "Grade 12"], cols: ["Salad", "Sandwich", "Soup"],
      pick: "If one of these students is selected at random",
      thing: "student", things: "students",
      rowIs: (i) => `is in grade ${10 + i}`, colIs: (j) => `chose ${["salad", "a sandwich", "soup"][j]}`,
      colNot: (j) => `did not choose ${["salad", "a sandwich", "soup"][j]}`,
      cell: (i, j) => `is in grade ${10 + i} and chose ${["salad", "a sandwich", "soup"][j]}`,
    },
    {
      intro: "The table shows how the residents surveyed in two parts of a town usually commute to work.",
      corner: "Part of town", rows: ["North side", "South side"], cols: ["Walk", "Bus", "Car"],
      pick: "If one of these residents is selected at random",
      thing: "resident", things: "residents",
      rowIs: (i) => `lives on the ${["north", "south"][i]} side`, colIs: (j) => `usually commutes ${["by walking", "by bus", "by car"][j]}`,
      colNot: (j) => `does not usually commute ${["by walking", "by bus", "by car"][j]}`,
      cell: (i, j) => `lives on the ${["north", "south"][i]} side and usually commutes ${["by walking", "by bus", "by car"][j]}`,
    },
    {
      intro: "The table shows the numbers of T-shirts of each color and size in a store's inventory.",
      corner: "Color", rows: ["Red", "Blue", "Green"], cols: ["Small", "Medium", "Large"],
      pick: "If one of these T-shirts is selected at random",
      thing: "T-shirt", things: "T-shirts",
      rowIs: (i) => `is ${["red", "blue", "green"][i]}`, colIs: (j) => `is size ${["small", "medium", "large"][j]}`,
      colNot: (j) => `is not size ${["small", "medium", "large"][j]}`,
      cell: (i, j) => `is ${["red", "blue", "green"][i]} and size ${["small", "medium", "large"][j]}`,
    },
    {
      intro: "The table shows the numbers of adult and student tickets sold for three performances of a school play.",
      corner: "Ticket", rows: ["Adult", "Student"], cols: ["Friday", "Saturday", "Sunday"],
      pick: "If one of these tickets is selected at random",
      thing: "ticket", things: "tickets",
      rowIs: (i) => `is ${["an adult", "a student"][i]} ticket`, colIs: (j) => `is for the ${["Friday", "Saturday", "Sunday"][j]} performance`,
      colNot: (j) => `is not for the ${["Friday", "Saturday", "Sunday"][j]} performance`,
      cell: (i, j) => `is ${["an adult", "a student"][i]} ticket for the ${["Friday", "Saturday", "Sunday"][j]} performance`,
    },
    {
      intro: "The table shows the animals a veterinary clinic treated last week, by type of animal and reason for the visit.",
      corner: "Animal", rows: ["Dog", "Cat"], cols: ["Checkup", "Vaccination", "Injury"],
      pick: "If one of these animals is selected at random",
      thing: "animal", things: "animals",
      rowIs: (i) => `is a ${["dog", "cat"][i]}`, colIs: (j) => `came in for ${["a checkup", "a vaccination", "an injury"][j]}`,
      colNot: (j) => `did not come in for ${["a checkup", "a vaccination", "an injury"][j]}`,
      cell: (i, j) => `is a ${["dog", "cat"][i]} that came in for ${["a checkup", "a vaccination", "an injury"][j]}`,
    },
  ];

  const BAGS = [
    { intro: (c) => `A bag contains ${c[0]} red marbles, ${c[1]} blue marbles, and ${c[2]} green marbles.`, pick: "If one marble is selected at random from the bag", is: ["red", "blue", "green"], not: ["not red", "not blue", "not green"], noun: "marble" },
    { intro: (c) => `A playlist has ${c[0]} rock songs, ${c[1]} jazz songs, and ${c[2]} pop songs.`, pick: "If one song is selected at random from the playlist", is: ["a rock song", "a jazz song", "a pop song"], not: ["not a rock song", "not a jazz song", "not a pop song"], noun: "song" },
    { intro: (c) => `A box contains ${c[0]} chocolate granola bars, ${c[1]} peanut granola bars, and ${c[2]} berry granola bars.`, pick: "If one granola bar is selected at random from the box", is: ["chocolate", "peanut", "berry"], not: ["not chocolate", "not peanut", "not berry"], noun: "granola bar" },
  ];

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
      const wrong = offerHard(key, candidates);
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
      const wrong = offerHard(key, [
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
      const wrong = offerHard(num(x), candidates);
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

  const tableChance = {
    id: "two-way-table-chance",
    domain: DATA,
    skill: "Probability",
    subskill: "basic probability",
    difficulty: "Easy",
    title: "Probability from counts",
    recognize:
      "When one item is chosen at random from the whole group, the probability is the number of items with the property " +
      "divided by the number in the whole group, every category counted.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["part-vs-whole", "wrong-quantity"],
    build(t) {
      const form = t.pick(["cell", "cell", "category", "complement", "bag"]);
      const wantNumeric = t.chance(0.35);
      const principles = [
        "For an item selected at random, probability = (number of favorable items) ÷ (total number of items).",
        "The probability that an event does not happen is 1 minus the probability that it does.",
      ];
      const finishWith = (part, whole, keyCandidates, fields) => {
        const value = part / whole;
        const numeric = wantNumeric && fitsGrid(value) && isClean(value, 3);
        return pack(numeric, tidy(value), frac(part, whole), keyCandidates, {
          ...fields,
          principles,
          estimatedSeconds: 60,
        });
      };
      if (form === "bag") {
        const bag = t.pick(BAGS);
        return retry(() => {
          const counts = [t.int(3, 16), t.int(3, 16), t.int(3, 16)];
          const T = sum(counts);
          const i = t.int(0, 2);
          const negate = t.chance(0.4);
          const part = negate ? T - counts[i] : counts[i];
          return finishWith(part, T, [
            [frac(part, T - part), `Divides by the number of ${bag.noun}s that are ${negate ? bag.is[i] : bag.not[i]} instead of by all ${T}.`],
            [frac(T - part, T), `Gives the probability that the ${bag.noun} is ${negate ? bag.is[i] : bag.not[i]}.`],
            [negate ? "2/3" : "1/3", "Treats the three kinds as equally likely, ignoring how many there are of each."],
            [frac(part, T + part), "Adds the favorable count to the total."],
          ], {
            stimulus: null,
            figure: null,
            stem: `${bag.intro(counts)} ${bag.pick}, what is the probability that it is ${negate ? bag.not[i] : bag.is[i]}?`,
            explanation: `There are ${counts.join(" + ")} = ${T} ${bag.noun}s, and ${part} of them are ${negate ? bag.not[i] : bag.is[i]}, so the probability is ${part}/${T}${frac(part, T) === `${part}/${T}` ? "" : ` = ${frac(part, T)}`}.`,
            steps: [
              `Total: ${counts.join(" + ")} = ${T}.`,
              `Favorable: ${negate ? `${T} ${MINUS} ${counts[i]} = ${part}` : part}.`,
              `Probability: ${part}/${T} = ${frac(part, T)}.`,
            ],
            trap: `Dividing by the other ${T - part} ${bag.noun}s instead of all ${T} compares two parts rather than a part with the whole.`,
            hint: `How many ${bag.noun}s are there in all?`,
            verify: () => {
              const items = counts.flatMap((count, kind) => Array(count).fill(kind));
              const hits = items.filter((kind) => (negate ? kind !== i : kind === i)).length;
              return close(hits / items.length, fractionValue(frac(part, T)));
            },
          });
        });
      }
      const scene = t.pick(CHANCE_SCENES);
      return retry(() => {
        const R = scene.rows.length;
        const C = scene.cols.length;
        const counts = scene.rows.map(() => scene.cols.map(() => t.int(4, 40)));
        const rowTotals = counts.map(sum);
        const colTotals = scene.cols.map((_, j) => sum(counts.map((row) => row[j])));
        const T = sum(rowTotals);
        const i = t.int(0, R - 1);
        const j = t.int(0, C - 1);
        const withTotals = t.chance(0.5);
        const headers = [scene.corner, ...scene.cols].concat(withTotals ? ["Total"] : []);
        const body = scene.rows.map((rowName, r) => [rowName, ...counts[r]].concat(withTotals ? [rowTotals[r]] : []));
        if (withTotals) body.push(["Total", ...colTotals, T]);
        const stimulus = { type: "table", content: table(headers, body) };
        let part;
        let event;
        let candidates;
        let matches;
        if (form === "cell") {
          part = counts[i][j];
          event = scene.cell(i, j);
          candidates = [
            [frac(part, rowTotals[i]), `Divides by the ${rowTotals[i]} ${scene.things} in the ${scene.rows[i]} row, as if the ${scene.thing} were selected from that row only.`],
            [frac(part, colTotals[j]), `Divides by the ${colTotals[j]} ${scene.things} in the ${scene.cols[j]} column, as if the ${scene.thing} were selected from that column only.`],
            [frac(rowTotals[i], T), `Counts the whole ${scene.rows[i]} row, ignoring the second condition.`],
            [frac(part, T - part), `Divides by the ${T - part} other ${scene.things} instead of by all ${T}.`],
          ];
          matches = (r, c) => r === i && c === j;
        } else {
          part = form === "complement" ? T - colTotals[j] : colTotals[j];
          event = form === "complement" ? scene.colNot(j) : scene.colIs(j);
          candidates = [
            [frac(T - part, T), `Gives the probability that the ${scene.thing} ${form === "complement" ? scene.colIs(j) : scene.colNot(j)}.`],
            [frac(part, T - part), `Divides by the ${T - part} other ${scene.things} instead of by all ${T}.`],
            [frac(counts[i][j], T), `Counts only the ${scene.rows[i]} row of the ${scene.cols[j]} column.`],
            [form === "complement" ? frac(C - 1, C) : frac(1, C), `Treats the ${C} categories as equally likely, ignoring the counts.`],
          ];
          matches = (r, c) => (form === "complement" ? c !== j : c === j);
        }
        return finishWith(part, T, candidates, {
          stimulus,
          figure: null,
          stem: `${scene.intro} ${scene.pick}, what is the probability that the ${scene.thing} ${event}?`,
          explanation:
            `The ${scene.thing} is selected from all ${T} ${scene.things}, and ${part} of them meet the condition. ` +
            `The probability is ${part}/${T}${frac(part, T) === `${part}/${T}` ? "" : `, which is ${frac(part, T)}`}.`,
          steps: [
            `Whole group: all ${T} ${scene.things} in the table.`,
            form === "cell"
              ? `Favorable: the ${scene.rows[i]} row and ${scene.cols[j]} column cell, ${part}.`
              : form === "complement"
                ? `Favorable: everyone outside the ${scene.cols[j]} column, ${T} ${MINUS} ${colTotals[j]} = ${part}.`
                : `Favorable: the ${scene.cols[j]} column total, ${part}.`,
            `Probability: ${part}/${T} = ${frac(part, T)}.`,
          ],
          trap: form === "cell"
            ? `Dividing by a row or column total answers a question about selecting from that row or column, not from all ${T} ${scene.things}.`
            : `Dividing by the ${T - part} other ${scene.things} compares two parts rather than a part with the whole.`,
          hint: `From how many ${scene.things} is the one selected?`,
          verify: () => {
            const grid = parseTable(stimulus.content).slice(1, 1 + R).map((row) => row.slice(1, 1 + C).map(parseNumber));
            const items = [];
            grid.forEach((row, r) => row.forEach((count, c) => {
              for (let copy = 0; copy < count; copy += 1) items.push([r, c]);
            }));
            const hits = items.filter(([r, c]) => matches(r, c)).length;
            return close(hits / items.length, fractionValue(frac(part, T)));
          },
        });
      });
    },
  };

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

  /* ============================ expected-count-from-probability (Easy) */

  // Each scene: the stated probability, the question, and plausible values
  // (two-decimal probabilities and fractions) for its event.
  const EXPECT_SCENES = [
    {
      given: (p) => `A factory's records show that the probability that a light bulb from its production line is defective is ${p}.`,
      ask: (N, not) => `In a shipment of ${fmt(N)} of these light bulbs, how many would be expected to be ${not ? "free of defects" : "defective"}?`,
      yes: "defective", no: "free of defects", things: "light bulbs",
      decimals: [0.02, 0.03, 0.04, 0.05, 0.06, 0.08], fractions: [[1, 20], [1, 25], [3, 50], [1, 40]],
    },
    {
      given: (p) => `The probability that a seed of a certain type of pepper plant sprouts is ${p}.`,
      ask: (N, not) => `If ${fmt(N)} of these seeds are planted, how many would be expected ${not ? "not to sprout" : "to sprout"}?`,
      yes: "sprout", no: "do not sprout", things: "seeds",
      decimals: [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9], fractions: [[3, 4], [4, 5], [7, 8], [9, 10], [5, 8]],
    },
    {
      given: (p) => `Based on past records, the probability that a flight on a certain route arrives on time is ${p}.`,
      ask: (N, not) => `Of the next ${fmt(N)} flights on this route, how many would be expected to arrive ${not ? "late" : "on time"}?`,
      yes: "arrive on time", no: "arrive late", things: "flights",
      decimals: [0.72, 0.75, 0.8, 0.84, 0.85, 0.88, 0.9, 0.92], fractions: [[4, 5], [7, 8], [9, 10], [17, 20]],
    },
    {
      given: (p) => `A basketball player makes each free throw she attempts with probability ${p}.`,
      ask: (N, not) => `If the player attempts ${fmt(N)} free throws, how many would she be expected to ${not ? "miss" : "make"}?`,
      yes: "are made", no: "are missed", things: "free throws",
      decimals: [0.6, 0.65, 0.7, 0.75, 0.8, 0.85], fractions: [[3, 4], [4, 5], [7, 10], [5, 8]],
    },
    {
      given: (p) => `The probability that a customer who enters a certain store makes a purchase is ${p}.`,
      ask: (N, not) => `If ${fmt(N)} customers enter the store on a certain day, how many would be expected ${not ? "not to make a purchase" : "to make a purchase"}?`,
      yes: "make a purchase", no: "do not make a purchase", things: "customers",
      decimals: [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45], fractions: [[1, 4], [1, 5], [3, 10], [3, 8], [2, 5]],
    },
  ];

  const SPINNERS = [
    { colors: ["red", "blue", "green"], short: ["red", "blue"], thing: "spinner", intro: (S0, c) => `A spinner is divided into ${S0} equal sections: ${c[0]} red, ${c[1]} blue, and the rest green.`, spin: (N) => `If the spinner is spun ${fmt(N)} times, how many times would it be expected to land on` },
    { colors: ["a prize", "a coupon", "nothing"], short: ['"Prize"', '"Coupon"'], thing: "wheel", intro: (S0, c) => `A prize wheel is divided into ${S0} equal sections: ${c[0]} labeled "Prize," ${c[1]} labeled "Coupon," and the rest labeled "Try again."`, spin: (N) => `If the wheel is spun ${fmt(N)} times, how many times would it be expected to land on`, label: ['a section labeled "Prize"', 'a section labeled "Coupon"'] },
  ];

  // A displayed probability ("0.85" or "7/8") back to [numerator, denominator].
  function probabilityParts(text) {
    if (text.includes("/")) return text.split("/").map(Number);
    const places = (text.split(".")[1] || "").length;
    return [Math.round(Number(text) * 10 ** places), 10 ** places];
  }

  function expectedDirect(t, numeric, not) {
    const scene = t.pick(EXPECT_SCENES);
    return retry(() => {
      const asFraction = t.chance(0.4);
      const [a, b] = asFraction ? t.pick(scene.fractions) : [Math.round(t.pick(scene.decimals) * 100), 100];
      const pText = asFraction ? `${a}/${b}` : num(a / b);
      const N = t.pick([40, 50, 60, 80, 100, 120, 150, 160, 200, 240, 250, 300, 400, 500, 600, 800, 1000, 1200]);
      if ((N * a) % b) return null;
      const yes = (N * a) / b;
      const key = not ? N - yes : yes;
      if (key <= 0) return null;
      const p = a / b;
      const cp = asFraction ? frac(b - a, b) : num(tidy(1 - p));
      const up = tidy(N * p * 10);
      const down = tidy((N * p) / 10);
      const percent = Math.round(p * 100);
      const candidates = [
        [num(not ? yes : N - yes), `Finds the expected number of ${scene.things} with the opposite outcome.`],
        asFraction && a > 1 ? [shownWhole(N / b), `Finds 1/${b} of ${fmt(N)} and stops, without multiplying by ${a}.`] : null,
        asFraction ? [shownWhole((N * a) / (a + b)), `Reads ${pText} as a ratio of ${a} to ${b} between the two outcomes, not a part of the whole.`] : null,
        asFraction ? [shownWhole((N * b) / a), `Divides ${fmt(N)} by the probability instead of multiplying.`] : null,
        !asFraction && up <= N ? [shownWhole(not ? N - up : up), `Misplaces the decimal point, using ${num(tidy(p * 10))} for the probability ${pText}.`] : null,
        !asFraction ? [shownWhole(not ? N - down : down), `Misplaces the decimal point, using ${num(tidy(p / 10))} for the probability ${pText}.`] : null,
        !asFraction ? [shownWhole(not ? 100 - percent : percent), `Gives the probability as a percent, ${not ? 100 - percent : percent}, instead of a number of ${scene.things}.`] : null,
      ].filter(Boolean);
      const trapValue = not ? yes : N - yes;
      return pack(numeric, key, fmt(key), candidates, {
        stimulus: null,
        figure: null,
        stem: `${scene.given(pText)} ${scene.ask(N, not)}`,
        explanation: not
          ? `The probability of the other outcome is 1 ${MINUS} ${pText} = ${cp}, so the expected number is ${fmt(N)} × ${cp} = ${fmt(key)}.`
          : `The expected number is the number of trials times the probability: ${fmt(N)} × ${pText} = ${fmt(key)}.`,
        steps: not
          ? [
            `The probability of the opposite outcome is 1 ${MINUS} ${pText} = ${cp}.`,
            `Expected number: ${fmt(N)} × ${cp} = ${fmt(key)}.`,
          ]
          : [
            `Each of the ${fmt(N)} ${scene.things} has probability ${pText}.`,
            `Expected number: ${fmt(N)} × ${pText} = ${fmt(key)}.`,
          ],
        principles: [
          "The expected number of times an outcome occurs is the number of trials times the outcome's probability.",
          "The probability that an outcome does not occur is 1 minus the probability that it does.",
        ],
        trap: not
          ? `The given probability is for the other outcome; ${fmt(N)} × ${pText} = ${fmt(trapValue)} answers the opposite question.`
          : `${fmt(N)} × (1 ${MINUS} ${pText}) = ${fmt(trapValue)} counts the opposite outcome.`,
        hint: "What fraction of the trials would you expect to have this outcome?",
        estimatedSeconds: 55,
        verify: () => {
          const [top, bottom] = probabilityParts(pText);
          const hits = not ? N * (bottom - top) : N * top;
          return key * bottom === hits;
        },
      });
    });
  }

  // Whole-number counts only, as choice text.
  const shownWhole = (value) => (Number.isInteger(value) && value > 0 ? fmt(value) : null);

  function expectedSpinner(t, numeric) {
    const spinner = t.pick(SPINNERS);
    return retry(() => {
      const total = t.pick([8, 10, 12, 16, 20]);
      const c0 = t.int(1, total - 3);
      const c1 = t.int(1, total - c0 - 2);
      const c2 = total - c0 - c1;
      if (c0 === c1 || c0 === c2) return null;
      const N = t.pick([40, 60, 80, 100, 120, 160, 200, 240, 300, 400, 500, 600]);
      if ((N * c0) % total) return null;
      const key = (N * c0) / total;
      const target = spinner.label ? spinner.label[0] : spinner.colors[0];
      return pack(numeric, key, fmt(key), [
        [shownWhole((N * c1) / total), `Uses the ${c1} ${spinner.short[1]} sections instead of the ${c0} ${spinner.short[0]} sections.`],
        [shownWhole(N / 3), `Treats the three kinds of sections as equally likely, ignoring that there are ${c0}, ${c1}, and ${c2}.`],
        [shownWhole((N * c0) / (total - c0)), `Divides by the ${total - c0} other sections instead of all ${total}.`],
        [shownWhole(N - key), `Finds the expected number of spins that do not land on ${target}.`],
      ], {
        stimulus: null,
        figure: null,
        stem: `${spinner.intro(total, [c0, c1])} ${spinner.spin(N)} ${target}?`,
        explanation: `${c0} of the ${total} equal sections are ${target}, so each spin lands there with probability ${frac(c0, total)}. The expected number is ${fmt(N)} × ${frac(c0, total)} = ${fmt(key)}.`,
        steps: [
          `Probability of ${target} on one spin: ${c0}/${total}${frac(c0, total) === `${c0}/${total}` ? "" : ` = ${frac(c0, total)}`}.`,
          `Expected number: ${fmt(N)} × ${frac(c0, total)} = ${fmt(key)}.`,
        ],
        principles: [
          "With equal sections, the probability of landing on a kind of section is the number of those sections divided by the total number.",
          "The expected number of times an outcome occurs is the number of trials times the outcome's probability.",
        ],
        trap: `The three kinds of sections are not equally likely; there are ${c0}, ${c1}, and ${c2} of them.`,
        hint: "On a single spin, how likely is the outcome?",
        estimatedSeconds: 55,
        verify: () => {
          const sections = [...Array(c0).fill(0), ...Array(c1).fill(1), ...Array(c2).fill(2)];
          let expected = 0;
          for (let spin = 0; spin < N; spin += 1) expected += sections.filter((kind) => kind === 0).length / sections.length;
          return close(expected, key);
        },
      });
    });
  }

  const expectedCount = {
    id: "expected-count-from-probability",
    domain: DATA,
    skill: "Probability",
    subskill: "basic probability",
    difficulty: "Easy",
    title: "Expected count from a probability",
    recognize:
      "The expected number of times an outcome occurs is the number of trials times its probability; for the other outcome, " +
      "use 1 minus the probability.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "intermediate-value"],
    build(t) {
      const roll = t.random();
      const numeric = t.chance(0.5);
      if (roll < 0.45) return expectedDirect(t, numeric, false);
      if (roll < 0.75) return expectedDirect(t, numeric, true);
      return expectedSpinner(t, numeric);
    },
  };

  /* ==================== frequency-distribution-probability (Medium) */

  const FREQ_SCENES = [
    {
      values: [0, 1, 2, 3, 4, 5], head: "Number of siblings", things: "students", thing: "student",
      about: "the numbers of siblings of the students in a school club",
      event: (words, k) => `has ${words} ${k} ${k === 1 && words !== "fewer than" ? "sibling" : "siblings"}`,
    },
    {
      values: [0, 1, 2, 3, 4, 5, 6], head: "Library visits last month", things: "students", thing: "student",
      about: "the numbers of times the students in a class visited the school library last month",
      event: (words, k) => `visited the library ${words} ${k} ${k === 1 && words !== "fewer than" ? "time" : "times"} last month`,
    },
    {
      values: [0, 1, 2, 3, 4], head: "Cars owned", things: "households", thing: "household",
      about: "the numbers of cars owned by the households on a street",
      event: (words, k) => `owns ${words} ${k} ${k === 1 && words !== "fewer than" ? "car" : "cars"}`,
    },
    {
      values: [1, 2, 3, 4, 5, 6], head: "Correct answers", things: "students", thing: "student",
      about: "the numbers of questions the students in a class answered correctly on a 6-question quiz",
      event: (words, k) => `answered ${words} ${k} ${k === 1 && words !== "fewer than" ? "question" : "questions"} correctly`,
    },
    {
      values: [1, 2, 3, 4, 5, 6], head: "Eggs in nest", things: "nests", thing: "nest",
      about: "the numbers of eggs in the nests that a biologist counted in a colony of birds",
      event: (words, k) => `contained ${words} ${k} ${k === 1 && words !== "fewer than" ? "egg" : "eggs"}`,
    },
    {
      values: [1, 2, 3, 4, 5], head: "Bedrooms", things: "apartments", thing: "apartment",
      about: "the numbers of bedrooms in the apartments in a building",
      event: (words, k) => `has ${words} ${k} ${k === 1 && words !== "fewer than" ? "bedroom" : "bedrooms"}`,
    },
  ];

  const COMPARISONS = {
    atLeast: { words: "at least", test: (v, k) => v >= k, twin: "moreThan" },
    moreThan: { words: "more than", test: (v, k) => v > k, twin: "atLeast" },
    fewerThan: { words: "fewer than", test: (v, k) => v < k, twin: "atMost" },
    atMost: { words: "at most", test: (v, k) => v <= k, twin: "fewerThan" },
  };

  const BAR = { left: 60, right: 380, top: 16, bottom: 226 };

  // Bar graph of counts per value, in the chart style of the scatterplots.
  function barGraph(values, counts, xTitle, yTitle, alt) {
    const { left, right, top, bottom } = BAR;
    // A gridline at every whole count, so each bar's height can be read exactly.
    const step = 1;
    const yMax = Math.max(...counts) + 1;
    const py = (y) => bottom - (y / yMax) * (bottom - top);
    const slot = (right - left) / values.length;
    const parts = [];
    for (let j = 0; j <= yMax / step; j += 1) {
      const y = py(j * step);
      if (j > 0) parts.push(`<line x1="${left}" y1="${r1(y)}" x2="${right}" y2="${r1(y)}" stroke="currentColor" stroke-width="1" stroke-opacity="0.25"/>`);
      parts.push(chartText(left - 7, y, num(j * step), "end", 12));
    }
    values.forEach((value, index) => {
      const x = left + slot * index + slot * 0.2;
      const height = (counts[index] / yMax) * (bottom - top);
      parts.push(`<rect x="${r1(x)}" y="${r1(bottom - height)}" width="${r1(slot * 0.6)}" height="${r1(height)}" fill="currentColor" fill-opacity="0.35" stroke="currentColor" stroke-width="1.5"/>`);
      parts.push(chartText(left + slot * (index + 0.5), bottom + 14, num(value), "middle", 12));
    });
    parts.push(seg([left, bottom], [right, bottom], 1.5), seg([left, bottom], [left, top], 1.5));
    parts.push(chartText((left + right) / 2, 262, xTitle, "middle", 13));
    parts.push(chartText(17, (top + bottom) / 2, yTitle, "middle", 13, -90));
    return { svg: S.svg(400, 278, parts, alt), alt, notToScale: false, yMax };
  }

  // Reads a bar graph back into counts, left to right, from the bars' heights.
  function readBars(figure) {
    const { top, bottom } = BAR;
    const bars = [];
    const pattern = /<rect x="([\d.]+)" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/g;
    let match;
    while ((match = pattern.exec(figure.svg))) bars.push([Number(match[1]), Number(match[3])]);
    return bars.sort((p, q) => p[0] - q[0]).map(([, height]) => Math.round((height / (bottom - top)) * figure.yMax));
  }

  function frequencyItem(t, numeric) {
    const scene = t.pick(FREQ_SCENES);
    return retry(() => {
      const counts = scene.values.map(() => t.int(1, 12));
      const N = sum(counts);
      if (numeric && ![20, 25, 40, 50].includes(N)) return null;
      const name = t.pick(Object.keys(COMPARISONS));
      const rule = COMPARISONS[name];
      const twin = COMPARISONS[rule.twin];
      const k = t.pick(scene.values.slice(1, -1));
      if (name === "fewerThan" && k === 1) return null;
      const favorable = (test) => sum(scene.values.map((v, index) => (test(v, k) ? counts[index] : 0)));
      const fav = favorable(rule.test);
      const favTwin = favorable(twin.test);
      if (fav === 0 || fav === N) return null;
      const categories = scene.values.filter((v) => rule.test(v, k)).length;
      if (categories < 2) return null;
      const asBars = t.chance(0.5);
      const key = frac(fav, N);
      const decimal = tidy(fav / N);
      const includesK = rule.test(k, k);
      const candidates = [
        [frac(favTwin, N), `${includesK ? "Leaves out" : "Includes"} the ${scene.things} with exactly ${k}; "${rule.words} ${k}" ${includesK ? "includes" : "does not include"} ${k}.`],
        [frac(N - fav, N), `Gives the probability of the opposite event, the ${scene.things} not counted.`],
        [frac(categories, scene.values.length), `Counts the ${categories} values that qualify out of ${scene.values.length}, instead of the ${scene.things} with those values.`],
        [frac(fav, N - fav), `Divides by the ${N - fav} ${scene.things} that do not qualify instead of by all ${N}.`],
      ];
      const wrong = offerHard(key, candidates);
      if (!numeric && wrong.length < 3) return null;
      if (numeric && !(fitsGrid(decimal) && isClean(decimal, 3))) return null;
      const alt =
        `Bar graph. The horizontal axis shows ${scene.head.toLowerCase()}: ${scene.values.join(", ")}. The vertical axis shows the number of ` +
        `${scene.things}. The bar heights are ${counts.join(", ")}, in that order.`;
      const figure = asBars ? barGraph(scene.values, counts, scene.head, `Number of ${scene.things}`, alt) : null;
      const stimulus = asBars ? null : { type: "table", content: table([scene.head, `Number of ${scene.things}`], scene.values.map((v, index) => [v, counts[index]])) };
      const favValues = scene.values.filter((v) => rule.test(v, k));
      const favCounts = favValues.map((v) => counts[scene.values.indexOf(v)]);
      return finish(numeric, {
        stimulus,
        figure,
        stem:
          `The ${asBars ? "bar graph" : "table"} shows ${scene.about}. If one of these ${scene.things} is selected at random, what is ` +
          `the probability that the ${scene.thing} ${scene.event(rule.words, k)}?`,
        correct: numeric ? decimal : key,
        wrong,
        explanation:
          `There are ${counts.join(" + ")} = ${N} ${scene.things} in all. "${rule.words[0].toUpperCase()}${rule.words.slice(1)} ${k}" means ` +
          `${favValues.join(", ")}, which covers ${favCounts.join(" + ")} = ${fav} ${scene.things}. The probability is ${fav}/${N}` +
          `${numeric ? ` = ${num(decimal)}` : key === `${fav}/${N}` ? "" : ` = ${key}`}.`,
        steps: [
          `Total: ${counts.join(" + ")} = ${N} ${scene.things}.`,
          `Values that qualify: ${favValues.join(", ")} (${rule.words} ${k} ${includesK ? "includes" : "excludes"} ${k}).`,
          `Favorable: ${favCounts.join(" + ")} = ${fav}.`,
          `Probability: ${fav}/${N}${numeric ? ` = ${num(decimal)}` : key === `${fav}/${N}` ? "" : ` = ${key}`}.`,
        ],
        principles: [
          "For one member chosen at random, probability = (number of members with the property) ÷ (number of members).",
          "\"At least k\" includes k; \"more than k\" does not. \"At most k\" includes k; \"fewer than k\" does not.",
        ],
        trap: `Whether ${k} itself counts decides the answer: "${rule.words} ${k}" ${includesK ? "includes" : "excludes"} it.`,
        hint: `Which values count, and does ${k} itself count?`,
        estimatedSeconds: 85,
        verify: () => {
          const read = figure
            ? readBars(figure)
            : parseTable(stimulus.content).slice(1).map((row) => parseNumber(row[1]));
          const members = scene.values.flatMap((v, index) => Array(read[index]).fill(v));
          const hits = members.filter((v) => rule.test(v, k)).length;
          return members.length === N && close(hits / members.length, fav / N);
        },
      });
    });
  }

  const frequencyProbability = {
    id: "frequency-distribution-probability",
    domain: DATA,
    skill: "Probability",
    subskill: "basic probability",
    difficulty: "Medium",
    title: "Probability of a range of values in a frequency distribution",
    recognize:
      "Add the counts for every value in the range (deciding whether the boundary value belongs), then divide by the total count, " +
      "not by the number of values.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["wrong-quantity", "part-vs-whole", "reversed-condition"],
    build(t) {
      return frequencyItem(t, t.chance(0.3));
    },
  };

  /* ================================= two-way-or-neither (Medium) */

  const UNION_SCENES = [
    {
      intro: "The table shows the drink orders at a café one morning, by temperature and size.",
      rowHead: "Temperature", rows: ["Hot", "Iced"], cols: ["Small", "Medium", "Large"], things: "orders", thing: "order",
      or: (i, j) => `is for ${["a hot", "an iced"][i]} drink or is ${["small", "medium", "large"][j]}`,
      neither: (i, j) => `is neither for ${["a hot", "an iced"][i]} drink nor ${["small", "medium", "large"][j]}`,
    },
    {
      intro: "The table shows the books checked out from a library on Saturday, by type of book and the age group of the reader.",
      rowHead: "Type", rows: ["Fiction", "Nonfiction"], cols: ["Child", "Teen", "Adult"], things: "books", thing: "book",
      or: (i, j) => `is ${["fiction", "nonfiction"][i]} or was checked out by ${["a child", "a teen", "an adult"][j]}`,
      neither: (i, j) => `is not ${["fiction", "nonfiction"][i]} and was not checked out by ${["a child", "a teen", "an adult"][j]}`,
    },
    {
      intro: "The table shows how the residents surveyed in three parts of a town usually commute to work.",
      rowHead: "Part of town", rows: ["North", "Central", "South"], cols: ["Walk", "Bus", "Car"], things: "residents", thing: "resident",
      or: (i, j) => `lives in the ${["north", "central", "south"][i]} part of town or usually commutes ${["by walking", "by bus", "by car"][j]}`,
      neither: (i, j) => `does not live in the ${["north", "central", "south"][i]} part of town and does not usually commute ${["by walking", "by bus", "by car"][j]}`,
    },
    {
      intro: "The table shows the members of a school's music program, by grade and ensemble. Each member is in exactly one ensemble.",
      rowHead: "Grade", rows: ["Grade 9", "Grade 10", "Grade 11"], cols: ["Band", "Choir", "Orchestra"], things: "members", thing: "member",
      or: (i, j) => `is in grade ${9 + i} or is in the ${["band", "choir", "orchestra"][j]}`,
      neither: (i, j) => `is not in grade ${9 + i} and is not in the ${["band", "choir", "orchestra"][j]}`,
    },
    {
      intro: "The table shows the animals at a shelter, by type and age.",
      rowHead: "Animal", rows: ["Dog", "Cat", "Rabbit"], cols: ["Under 1 year", "1 to 5 years", "Over 5 years"], things: "animals", thing: "animal",
      or: (i, j) => `is ${["a dog", "a cat", "a rabbit"][i]} or is ${["under 1 year old", "1 to 5 years old", "over 5 years old"][j]}`,
      neither: (i, j) => `is neither ${["a dog", "a cat", "a rabbit"][i]} nor ${["under 1 year old", "1 to 5 years old", "over 5 years old"][j]}`,
    },
    {
      intro: "The table shows the tickets sold for a weekend of performances of a school play, by ticket type and day.",
      rowHead: "Ticket", rows: ["Adult", "Student"], cols: ["Friday", "Saturday", "Sunday"], things: "tickets", thing: "ticket",
      or: (i, j) => `is ${["an adult", "a student"][i]} ticket or is for ${["Friday", "Saturday", "Sunday"][j]}`,
      neither: (i, j) => `is not ${["an adult", "a student"][i]} ticket and is not for ${["Friday", "Saturday", "Sunday"][j]}`,
    },
  ];

  function unionItem(t, numeric) {
    const scene = t.pick(UNION_SCENES);
    return retry(() => {
      const R = scene.rows.length;
      const Cn = scene.cols.length;
      const counts = scene.rows.map(() => scene.cols.map(() => t.int(3, 40)));
      const rowTotals = counts.map(sum);
      const colTotals = scene.cols.map((_, j) => sum(counts.map((row) => row[j])));
      const N = sum(rowTotals);
      const i = t.int(0, R - 1);
      const j = t.int(0, Cn - 1);
      const both = counts[i][j];
      const either = rowTotals[i] + colTotals[j] - both;
      const neitherForm = t.chance(0.45);
      const part = neitherForm ? N - either : either;
      const key = frac(part, N);
      const decimal = tidy(part / N);
      // A probability outside 0 to 1 is not a choice the test would print.
      const inRange = (top, bottom) => (top > 0 && top < bottom ? frac(top, bottom) : null);
      const candidates = neitherForm
        ? [
          [inRange(N - rowTotals[i] - colTotals[j], N), `Subtracts both totals from ${N} without adding back the ${both} ${scene.things} subtracted twice.`],
          [frac(either, N), "Gives the probability of the opposite event: one description or the other fits."],
          [frac(N - both, N), `Removes only the ${both} ${scene.things} that fit both descriptions.`],
          [frac(part, N - rowTotals[i]), `Divides by the ${N - rowTotals[i]} ${scene.things} outside the ${scene.rows[i]} row instead of by all ${N}.`],
        ]
        : [
          [inRange(rowTotals[i] + colTotals[j], N), `Adds the row and column totals, counting the ${both} ${scene.things} in both twice.`],
          [frac(both, N), "Counts only the ones that fit both descriptions; \"or\" includes those that fit either."],
          [frac(either - both, N), `Leaves out the ${both} ${scene.things} that fit both descriptions.`],
          [frac(rowTotals[i], N), `Counts only the ${scene.rows[i]} row.`],
        ];
      const wrong = offerHard(key, candidates);
      if (!numeric && wrong.length < 3) return null;
      if (numeric && !(fitsGrid(decimal) && isClean(decimal, 3))) return null;
      const withTotals = t.chance(0.5);
      const content = table(
        [scene.rowHead, ...scene.cols].concat(withTotals ? ["Total"] : []),
        [
          ...scene.rows.map((row, r) => [row, ...counts[r]].concat(withTotals ? [rowTotals[r]] : [])),
          ...(withTotals ? [["Total", ...colTotals, N]] : []),
        ],
      );
      const event = neitherForm ? scene.neither(i, j) : scene.or(i, j);
      const shownKey = numeric ? num(decimal) : key;
      return finish(numeric, {
        stimulus: { type: "table", content },
        stem: `${scene.intro} If one of these ${scene.things} is selected at random, what is the probability that the ${scene.thing} ${event}?`,
        correct: numeric ? decimal : key,
        wrong,
        explanation: neitherForm
          ? `${rowTotals[i]} are in the ${scene.rows[i]} row and ${colTotals[j]} in the ${scene.cols[j]} column, with ${both} in both, so ` +
            `${rowTotals[i]} + ${colTotals[j]} ${MINUS} ${both} = ${either} fit at least one description. The other ${N} ${MINUS} ${either} = ${part} fit neither: ${part}/${N}${shownKey === `${part}/${N}` ? "" : ` = ${shownKey}`}.`
          : `${rowTotals[i]} are in the ${scene.rows[i]} row and ${colTotals[j]} in the ${scene.cols[j]} column; the ${both} in both are counted in each, ` +
            `so ${rowTotals[i]} + ${colTotals[j]} ${MINUS} ${both} = ${either} fit at least one description: ${either}/${N}${shownKey === `${either}/${N}` ? "" : ` = ${shownKey}`}.`,
        steps: [
          `${scene.rows[i]} row total: ${rowTotals[i]}. ${scene.cols[j]} column total: ${colTotals[j]}. Both: ${both}.`,
          `At least one description: ${rowTotals[i]} + ${colTotals[j]} ${MINUS} ${both} = ${either}.`,
          neitherForm ? `Neither: ${N} ${MINUS} ${either} = ${part}.` : `The whole table has ${N} ${scene.things}.`,
          `Probability: ${part}/${N}${shownKey === `${part}/${N}` ? "" : ` = ${shownKey}`}.`,
        ],
        principles: [
          "P(A or B) = P(A) + P(B) − P(A and B): the overlap is counted in both totals, so subtract it once.",
          "\"Neither A nor B\" is the complement of \"A or B\".",
        ],
        trap: `The ${both} ${scene.things} in both the row and the column are in both totals; adding the totals counts them twice.`,
        hint: "Which cells of the table fit the description? Count each cell once.",
        estimatedSeconds: 95,
        verify: () => {
          const rows = parseTable(content);
          const header = rows[0];
          const members = [];
          rows.slice(1).forEach((row) => {
            const r = scene.rows.indexOf(row[0]);
            if (r < 0) return;
            scene.cols.forEach((label, c) => {
              for (let copy = 0; copy < parseNumber(row[header.indexOf(label)]); copy += 1) members.push([r, c]);
            });
          });
          const fits = members.filter(([r, c]) => (neitherForm ? r !== i && c !== j : r === i || c === j)).length;
          return members.length === N && close(fits / members.length, part / N);
        },
      });
    });
  }

  const unionTwoWay = {
    id: "two-way-or-neither",
    domain: DATA,
    skill: "Probability",
    subskill: "basic probability",
    difficulty: "Medium",
    title: "Probability of either or neither from a two-way table",
    recognize:
      "\"A or B\" counts every cell in A's row or B's column once: row total plus column total minus the shared cell. " +
      "\"Neither\" is everything else.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "wrong-quantity", "reversed-condition"],
    build(t) {
      return unionItem(t, t.chance(0.3));
    },
  };

  /* ================================== probability-after-change (Hard) */

  const CHANGE_SCENES = [
    {
      intro: "A bag contains only red marbles and blue marbles.", container: "bag", nouns: "marbles", kinds: ["red", "blue"],
      pick: "a marble selected at random from the bag", is: (k) => `is ${k}`, many: (k) => `${k} marbles`,
    },
    {
      intro: "A playlist contains only jazz songs and pop songs.", container: "playlist", nouns: "songs", kinds: ["jazz", "pop"],
      pick: "a song selected at random from the playlist", is: (k) => `is a ${k} song`, many: (k) => `${k} songs`,
    },
    {
      intro: "A box contains only black pens and blue pens.", container: "box", nouns: "pens", kinds: ["black", "blue"],
      pick: "a pen selected at random from the box", is: (k) => `is ${k}`, many: (k) => `${k} pens`,
    },
    {
      intro: "A basket contains only green apples and red apples.", container: "basket", nouns: "apples", kinds: ["green", "red"],
      pick: "an apple selected at random from the basket", is: (k) => `is ${k}`, many: (k) => `${k} apples`,
    },
    {
      intro: "A jar contains only nickels and dimes.", container: "jar", nouns: "coins", kinds: ["nickel", "dime"],
      pick: "a coin selected at random from the jar", is: (k) => `is a ${k}`, many: (k) => `${k}s`,
    },
    {
      intro: "A drawing box contains only blue raffle tickets and yellow raffle tickets.", container: "drawing box", nouns: "tickets", kinds: ["blue", "yellow"],
      pick: "a ticket selected at random from the box", is: (k) => `is ${k}`, many: (k) => `${k} tickets`,
    },
  ];

  // A probability as the test prints it: a short decimal or a fraction.
  function probabilityText(top, bottom, preferDecimal) {
    const value = top / bottom;
    return preferDecimal && isClean(value, 2) ? num(tidy(value)) : frac(top, bottom);
  }

  function changeTotalItem(t, numeric) {
    const scene = t.pick(CHANGE_SCENES);
    return retry(() => {
      const n = t.int(8, 60);
      const r = t.int(2, n - 2);
      const kind = t.pick(["addX", "removeX", "addY", "removeY"]);
      const k = t.int(2, 20);
      const [r2, n2] = kind === "addX" ? [r + k, n + k] : kind === "removeX" ? [r - k, n - k] : kind === "addY" ? [r, n + k] : [r, n - k];
      if (r2 <= 0 || n2 - r2 <= 0 || n2 <= 0) return null;
      const g1 = S.gcd(r, n);
      const g2 = S.gcd(r2, n2);
      if (n / g1 > 12 || n2 / g2 > 12 || n / g1 < 3 || n2 / g2 < 3) return null;
      // Both probabilities in one format: decimals only when both are short.
      const decimal = t.chance(0.4) && isClean(r / n, 2) && isClean(r2 / n2, 2);
      const p1 = probabilityText(r, n, decimal);
      const p2 = probabilityText(r2, n2, decimal);
      if (p1 === p2) return null;
      const [x, y] = scene.kinds;
      const changed = kind.endsWith("X") ? x : y;
      const verb = kind.startsWith("add") ? "added to" : "removed from";
      const change = `${k} ${scene.many(changed)} are ${verb} the ${scene.container}`;
      const ask = t.pick(["total", "total", "x"]);
      const key = ask === "total" ? n : r;
      // The reflex: change the count but keep the old total.
      const forgot = tidy(k / Math.abs(r2 / n2 - r / n));
      if (!Number.isInteger(forgot) || forgot === n) return null;
      const candidates = ask === "total"
        ? [
          [Number.isInteger(tidy(forgot)) ? num(tidy(forgot)) : null, `Changes the number of ${scene.many(changed)} but not the total number of ${scene.nouns} in the second probability.`],
          [num(n2), `Gives the number of ${scene.nouns} after the change, not before.`],
          [num(r), `Gives the number of ${scene.many(x)} before the change, not the total.`],
          [num(n - r), `Gives the number of ${scene.many(y)} before the change, not the total.`],
        ]
        : [
          [Number.isInteger(tidy((forgot * r) / n)) ? num(tidy((forgot * r) / n)) : null, `Changes the number of ${scene.many(changed)} but not the total number of ${scene.nouns} in the second probability.`],
          [num(n), `Gives the total number of ${scene.nouns} before the change.`],
          [num(r2), `Gives the number of ${scene.many(x)} after the change, not before.`],
          [num(n - r), `Gives the number of ${scene.many(y)}, not ${scene.many(x)}.`],
        ];
      const wrong = offerHard(num(key), candidates);
      if (!numeric && wrong.length < 3) return null;
      const question = ask === "total"
        ? `How many ${scene.nouns} were in the ${scene.container} before the ${scene.many(changed)} were ${kind.startsWith("add") ? "added" : "removed"}?`
        : `How many ${scene.many(x)} were in the ${scene.container} before the ${scene.many(changed)} were ${kind.startsWith("add") ? "added" : "removed"}?`;
      const equation = kind === "addX" ? `(${p1})n + ${k} = (${p2})(n + ${k})`
        : kind === "removeX" ? `(${p1})n ${MINUS} ${k} = (${p2})(n ${MINUS} ${k})`
          : kind === "addY" ? `(${p1})n = (${p2})(n + ${k})` : `(${p1})n = (${p2})(n ${MINUS} ${k})`;
      return finish(numeric, {
        stimulus: null,
        figure: null,
        stem:
          `${scene.intro} The probability that ${scene.pick} ${scene.is(x)} is ${p1}. After ${change}, the probability that ` +
          `${scene.pick} ${scene.is(x)} is ${p2}. ${question}`,
        correct: key,
        wrong,
        explanation:
          `Let n be the original number of ${scene.nouns}, so there were (${p1})n ${scene.many(x)}. After the change, both the number of ` +
          `${scene.many(changed)} and the total change by ${k}: ${equation}. Solving gives n = ${n}` +
          `${ask === "total" ? "." : `, so there were (${p1})(${n}) = ${r} ${scene.many(x)}.`}`,
        steps: [
          `Before: n ${scene.nouns} in all, (${p1})n of them ${scene.many(x)}.`,
          `After: the number of ${scene.many(x)} ${kind.endsWith("X") ? `becomes (${p1})n ${kind.startsWith("add") ? "+" : MINUS} ${k}` : "is unchanged"}, and the total becomes n ${kind.startsWith("add") ? "+" : MINUS} ${k}.`,
          `Set up and solve ${equation}: n = ${n}.`,
          ask === "total" ? `The question asks for the original total: ${n}.` : `Original number of ${scene.many(x)}: (${p1})(${n}) = ${r}.`,
        ],
        principles: [
          "Adding or removing items changes the total as well as the count of the kind added or removed; both appear in the new probability.",
          "Write each probability as (number of that kind) ÷ (total), with the same unknown, and solve.",
        ],
        trap: `The ${k} ${scene.many(changed)} also change the total; keeping the old total in the second probability gives the wrong equation.`,
        hint: "After the change, what is the new total, and what is the new count of the kind asked about?",
        estimatedSeconds: 120,
        verify: () => {
          const [a1, b1] = probabilityParts(p1);
          const [a2, b2] = probabilityParts(p2);
          const found = [];
          for (let total = 1; total <= 500; total += 1) {
            if ((total * a1) % b1) continue;
            const count = (total * a1) / b1;
            const after = kind === "addX" ? [count + k, total + k] : kind === "removeX" ? [count - k, total - k]
              : kind === "addY" ? [count, total + k] : [count, total - k];
            if (after[1] > 0 && after[0] >= 0 && after[0] * b2 === a2 * after[1]) found.push([total, count]);
          }
          return found.length === 1 && (ask === "total" ? found[0][0] : found[0][1]) === key;
        },
      });
    });
  }

  function changeAddItem(t, numeric) {
    const scene = t.pick(CHANGE_SCENES);
    return retry(() => {
      const r = t.int(2, 30);
      const s = t.int(3, 40);
      const add = t.int(2, 40);
      const top = r + add;
      const bottom = r + s + add;
      const g = S.gcd(top, bottom);
      if (bottom / g > 10 || bottom / g < 3) return null;
      if (r / (r + s) >= top / bottom) return null;
      const decimal = t.chance(0.4);
      const p = probabilityText(top, bottom, decimal);
      const pv = top / bottom;
      const [x, y] = scene.kinds;
      const forgot = tidy(pv * (r + s) - r);
      const ratio = pv * s - r;
      if (!Number.isInteger(forgot) || forgot <= 0) return null;
      const wrong = offerHard(num(add), [
        [num(forgot), `Keeps the original total of ${r + s} in the denominator; adding ${scene.many(x)} also raises the total.`],
        [ratio > 0 && Number.isInteger(tidy(ratio)) ? num(tidy(ratio)) : null, `Treats ${p} as the ratio of ${scene.many(x)} to ${scene.many(y)} instead of ${scene.many(x)} to all ${scene.nouns}.`],
        [num(bottom), `Gives the new total number of ${scene.nouns}, not the number added.`],
        [num(top), `Gives the new number of ${scene.many(x)}, not the number added.`],
      ]);
      if (!numeric && wrong.length < 3) return null;
      return finish(numeric, {
        stimulus: null,
        figure: null,
        stem:
          `${scene.intro.replace(/only .*\./, `${r} ${scene.many(x)} and ${s} ${scene.many(y)}.`)} How many ${scene.many(x)} must be added to the ` +
          `${scene.container} so that the probability that ${scene.pick} ${scene.is(x)} is ${p}?`,
        correct: add,
        wrong,
        explanation:
          `If x ${scene.many(x)} are added, there are ${r} + x ${scene.many(x)} out of ${r + s} + x ${scene.nouns} in all, so ` +
          `(${r} + x)/(${r + s} + x) = ${p}. Solving gives x = ${add}: ${top}/${bottom}${frac(top, bottom) === `${top}/${bottom}` ? "" : ` = ${frac(top, bottom)}`}.`,
        steps: [
          `After adding x ${scene.many(x)}: ${r} + x of them, and ${r + s} + x ${scene.nouns} in all.`,
          `Set the probability: (${r} + x)/(${r + s} + x) = ${p}.`,
          `Solve: x = ${add}.`,
          `Check: ${top}/${bottom} = ${p}.`,
        ],
        principles: [
          "Adding items of one kind raises both the count of that kind and the total.",
          "A probability compares a part with the whole, not one part with the other part.",
        ],
        trap: `Keeping ${r + s} as the total gives ${num(forgot)}; the added ${scene.many(x)} are part of the new total.`,
        hint: "After the addition, what are the new count and the new total?",
        estimatedSeconds: 115,
        verify: () => {
          const [a1, b1] = probabilityParts(p);
          const found = [];
          for (let extra = 0; extra <= 1000; extra += 1) if ((r + extra) * b1 === a1 * (r + s + extra)) found.push(extra);
          return found.length === 1 && found[0] === add;
        },
      });
    });
  }

  const afterChange = {
    id: "probability-after-change",
    domain: DATA,
    skill: "Probability",
    subskill: "basic probability",
    difficulty: "Hard",
    title: "Probability after items are added or removed",
    recognize:
      "A probability is part over whole, and adding or removing items changes the whole too: write both probabilities in one " +
      "unknown, with the new total in the second, and solve.",
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 2, trap: 2 },
    tricks: ["part-vs-whole", "intermediate-value", "wrong-quantity"],
    build(t) {
      const numeric = t.chance(0.4);
      return t.chance(0.6) ? changeTotalItem(t, numeric) : changeAddItem(t, numeric);
    },
  };

  return [tableChance, expectedCount, frequencyProbability, unionTwoWay, conditionalTwoWay, afterChange];
});
