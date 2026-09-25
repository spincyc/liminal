(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/problem-solving-and-data-analysis"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Statistical inference templates (Problem-Solving and Data Analysis), ordered Easy, Medium, Hard.

  const { MINUS, num, frac, table } = S;
  const {
    DATA, fmt, shown, sum, range, retry, pack, parseTable, parseNumber, DOMAIN, offerHard, finish, tidy, isClean, close,
  } = C;

  /* =================================== sample-proportion-estimate (Medium) */

  const SAMPLE_SCENES = [
    {
      intro: (N, n) => `A city has ${fmt(N)} households. A random sample of ${n} of these households was surveyed about the main fuel used to heat their homes. The table summarizes the results.`,
      head: ["Main heating fuel", "Number of households"], cats: ["Natural gas", "Electricity", "Heating oil", "Wood"],
      does: (c) => `use ${c.toLowerCase()} as their main heating fuel`, whole: "households in the city", N: [8000, 60000],
    },
    {
      intro: (N, n) => `A high school has ${fmt(N)} students. A random sample of ${n} of these students was asked how they usually get to school. The table summarizes the results.`,
      head: ["Usual way to school", "Number of students"], cats: ["Bus", "Car", "Walk", "Bicycle"],
      does: (c) => ({ Bus: "usually take the bus", Car: "usually ride in a car", Walk: "usually walk", Bicycle: "usually ride a bicycle" })[c],
      whole: "students at the school", N: [900, 3600],
    },
    {
      intro: (N, n) => `A factory produced ${fmt(N)} light bulbs last week. A random sample of ${n} of these bulbs was inspected. The table summarizes the results.`,
      head: ["Result", "Number of bulbs"], cats: ["No defect", "Minor defect", "Major defect"],
      does: (c) => ({ "No defect": "have no defect", "Minor defect": "have a minor defect", "Major defect": "have a major defect" })[c],
      whole: "bulbs produced last week", N: [6000, 48000],
    },
    {
      intro: (N, n) => `An orchard has ${fmt(N)} apple trees. A random sample of ${n} of these trees was inspected for signs of disease. The table summarizes the results.`,
      head: ["Condition", "Number of trees"], cats: ["Healthy", "Leaf spots", "Fruit rot", "Bark damage"],
      does: (c) => ({ Healthy: "are healthy", "Leaf spots": "have leaf spots", "Fruit rot": "have fruit rot", "Bark damage": "have bark damage" })[c],
      whole: "trees in the orchard", N: [2000, 20000],
    },
    {
      intro: (N, n) => `A town has ${fmt(N)} registered voters. A random sample of ${n} of these voters was asked which of three proposals for a new library they prefer. The table summarizes the results.`,
      head: ["Response", "Number of voters"], cats: ["Proposal A", "Proposal B", "Proposal C", "No preference"],
      does: (c) => (c === "No preference" ? "have no preference" : `prefer ${c.toLowerCase().replace("proposal", "Proposal")}`),
      whole: "registered voters in the town", N: [4000, 40000],
    },
  ];

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
      const wrong = offerHard(key, candidates);
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

  const sampleEstimate = {
    id: "sample-proportion-estimate",
    domain: DATA,
    skill: "Statistical inference",
    subskill: "samples and populations",
    difficulty: "Medium",
    title: "Scaling a random sample to its population",
    recognize:
      "A random sample stands in for its population in proportion: find the fraction of the sample in the group (count ÷ " +
      "sample size) and apply that fraction to the population size.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "part-vs-whole", "wrong-quantity"],
    build(t) {
      const scene = t.pick(SAMPLE_SCENES);
      const form = t.pick(["one", "one", "difference", "either"]);
      const numeric = t.chance(0.4);
      return retry(() => {
        const n = t.pick([50, 60, 80, 100, 120, 150, 200, 240, 250, 300, 400]);
        const mult = t.int(Math.ceil(scene.N[0] / n), Math.floor(scene.N[1] / n));
        const N = n * mult;
        const k = scene.cats.length;
        const counts = scene.cats.map(() => t.int(3, 30));
        const drawn = sum(counts);
        // Rescale the draws to sum to n.
        const scaled = counts.map((count) => Math.max(2, Math.round((count * n) / drawn)));
        scaled[0] += n - sum(scaled);
        if (scaled[0] < 2 || new Set(scaled).size < k) return null;
        const [x, y] = t.sample(range(0, k - 1), 2);
        const cx = scaled[x];
        const cy = scaled[y];
        if (form === "difference" && cx <= cy) return null;
        const stimulus = { type: "table", content: table(scene.head, scene.cats.map((cat, index) => [cat, scaled[index]])) };
        const est = (count) => count * mult;
        const principles = [
          "In a random sample, the fraction of the sample with a characteristic estimates the fraction of the population with it.",
          "Estimated number in the population = (count in sample ÷ sample size) × population size.",
        ];
        const ratioStep = `Each sampled ${scene.whole.split(" ")[0].replace(/s$/, "")} stands for ${fmt(N)} ÷ ${n} = ${mult} in the population.`;
        const common = { stimulus, figure: null, principles, estimatedSeconds: 95 };
        const sampleCheck = () => {
          const rows = parseTable(stimulus.content).slice(1);
          return sum(rows.map((row) => parseNumber(row[1]))) === n;
        };
        if (form === "one") {
          const key = est(cx);
          return pack(numeric, key, fmt(key), [
            [shown((N * cx) / 100, 0), `Treats the sample count, ${cx}, as a percent of the ${fmt(N)} ${scene.whole}.`],
            [shown(N - key, 0), `Estimates the ${scene.whole} that do not ${scene.does(scene.cats[x]).replace(/^(use|usually|have|are|prefer)/, "$1")}, the rest of the population.`.replace(" not are ", " are not ")],
            [shown((N * cx) / (n - cx), 0), `Divides by the ${n - cx} sampled that are not in the group instead of by the whole sample of ${n}.`],
            [shown(cx, 0), `Gives the number in the sample, ${cx}, without scaling it up to the population.`],
          ], {
            ...common,
            stem: `${scene.intro(N, n)} Based on the sample, what is the best estimate of the number of ${scene.whole} that ${scene.does(scene.cats[x])}?`,
            explanation: `In the sample, ${cx} of ${n} ${scene.does(scene.cats[x])}, a fraction of ${frac(cx, n)}. Applied to all ${fmt(N)}: ${frac(cx, n)} × ${fmt(N)} = ${fmt(key)}.`,
            steps: [
              `Sample fraction: ${cx}/${n} = ${frac(cx, n)}.`,
              ratioStep,
              `Estimate: ${cx} × ${mult} = ${fmt(key)}.`,
            ],
            trap: `${cx} is a count in the sample of ${n}; it must be scaled up to the population of ${fmt(N)}.`,
            hint: "What fraction of the sample is in the group?",
            verify: () => sampleCheck() && key * n === N * cx,
          });
        }
        if (form === "difference") {
          const key = est(cx - cy);
          return pack(numeric, key, fmt(key), [
            [shown(cx - cy, 0), `Gives the difference in the sample, ${cx} ${MINUS} ${cy}, without scaling it up to the population.`],
            [shown(est(cx), 0), `Estimates only the ${scene.whole} that ${scene.does(scene.cats[x])}, without subtracting.`],
            [shown(est(cx + cy), 0), "Adds the two groups instead of finding how many more are in one."],
            [shown((N * (cx - cy)) / 100, 0), `Treats the sample difference, ${cx - cy}, as a percent of ${fmt(N)}.`],
          ], {
            ...common,
            stem: `${scene.intro(N, n)} Based on the sample, how many more of the ${scene.whole} would be expected to ${scene.does(scene.cats[x])} than to ${scene.does(scene.cats[y])}?`,
            explanation: `In the sample, ${cx} ${MINUS} ${cy} = ${cx - cy} more ${scene.does(scene.cats[x])}. Each sampled one stands for ${mult} in the population, so the estimate is ${cx - cy} × ${mult} = ${fmt(key)}.`,
            steps: [
              `Difference in the sample: ${cx} ${MINUS} ${cy} = ${cx - cy}.`,
              ratioStep,
              `Estimate: ${cx - cy} × ${mult} = ${fmt(key)}.`,
            ],
            trap: `${cx - cy} is the difference in the sample of ${n}; the question is about all ${fmt(N)}.`,
            hint: "How many members of the population does each person or item in the sample represent?",
            verify: () => sampleCheck() && key * n === N * (cx - cy),
          });
        }
        const key = est(cx + cy);
        return pack(numeric, key, fmt(key), [
          [shown(cx + cy, 0), `Gives the number in the sample, ${cx + cy}, without scaling it up to the population.`],
          [shown(est(cx), 0), `Estimates only the ${scene.whole} that ${scene.does(scene.cats[x])}.`],
          [shown(N - key, 0), `Estimates the ${scene.whole} in neither group, the rest of the population.`],
          [shown((N * (cx + cy)) / 100, 0), `Treats the sample count, ${cx + cy}, as a percent of ${fmt(N)}.`],
        ], {
          ...common,
          stem: `${scene.intro(N, n)} Based on the sample, how many of the ${scene.whole} would be expected to either ${scene.does(scene.cats[x])} or ${scene.does(scene.cats[y])}?`,
          explanation: `In the sample, ${cx} + ${cy} = ${cx + cy} of ${n} are in one of the two groups, a fraction of ${frac(cx + cy, n)}. Applied to all ${fmt(N)}: ${fmt(key)}.`,
          steps: [
            `Count in the sample: ${cx} + ${cy} = ${cx + cy}.`,
            ratioStep,
            `Estimate: ${cx + cy} × ${mult} = ${fmt(key)}.`,
          ],
          trap: `${cx + cy} is a count in the sample; each sampled one stands for ${mult} in the population.`,
          hint: "What fraction of the sample is in either group?",
          verify: () => sampleCheck() && key * n === N * (cx + cy),
        });
      });
    },
  };

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

  /* ================================== sampling-method-choice (Easy) */

  // Four ways to choose whom to survey. Only `random` is random and covers the
  // whole population; `volunteer` lets people choose themselves.
  const METHOD_FACTS = {
    random: { random: true, whole: true, self: false },
    convenience: { random: false, whole: false, self: false },
    volunteer: { random: false, whole: false, self: true },
    subgroup: { random: true, whole: false, self: false },
  };

  const SAMPLING_SCENES = [
    {
      who: "The city council", goal: "estimate the percent of the city's adult residents who support building a new public pool",
      popShort: "the city's adult residents", place: "library visitors on one morning", part: "residents of one neighborhood",
      random: (n) => `${n} adults selected at random from a list of all adult residents of the city`,
      convenience: (n) => `the first ${n} adults to enter the city's public library on a Monday morning`,
      volunteer: (m) => `the ${fmt(m)} adults responding to an invitation posted on the city's official website`,
      subgroup: (n) => `${n} adults selected at random from the residents of one neighborhood of the city`,
    },
    {
      who: "A principal", goal: "estimate the mean number of hours per week that the school's students spend on homework",
      popShort: "the school's students", place: "students in the library after classes", part: "students in the honors classes",
      random: (n) => `${n} students selected at random from a list of all students enrolled at the school`,
      convenience: (n) => `the first ${n} students to arrive at the school library after classes on Tuesday`,
      volunteer: (m) => `the ${fmt(m)} students returning a survey left on a table in the school cafeteria`,
      subgroup: (n) => `${n} students selected at random from the students enrolled in the school's honors classes`,
    },
    {
      who: "A store manager", goal: "estimate the percent of the store's customers who would use a same-day delivery service",
      popShort: "the store's customers", place: "Saturday-morning shoppers", part: "customers living near the store",
      random: (n) => `${n} customers selected at random from the store's list of all its customers`,
      convenience: (n) => `the first ${n} customers to walk into the store after it opens on a Saturday morning`,
      volunteer: (m) => `the ${fmt(m)} customers responding to a pop-up message on the store's website`,
      subgroup: (n) => `${n} customers selected at random from those who live within one mile of the store`,
    },
    {
      who: "A park manager", goal: "estimate the percent of this season's visitors to the park who would pay for a guided tour",
      popShort: "this season's visitors to the park", place: "visitors at one entrance on one day", part: "annual pass holders",
      random: (n) => `${n} visitors selected at random from all of this season's ticket buyers`,
      convenience: (n) => `the first ${n} visitors to arrive at the park's north entrance on a Sunday morning`,
      volunteer: (m) => `the ${fmt(m)} visitors mailing back a comment card handed out at the park's gates`,
      subgroup: (n) => `${n} visitors selected at random from those who bought annual passes this season`,
    },
    {
      who: "A transit agency", goal: "estimate the percent of its riders who want later evening bus service",
      popShort: "the agency's riders", place: "riders at one downtown stop", part: "riders of one route",
      random: (n) => `${n} riders selected at random from a list of all registered fare-card holders`,
      convenience: (n) => `the first ${n} riders to board a bus at the main downtown stop on a weekday morning`,
      volunteer: (m) => `the ${fmt(m)} riders responding to a post on the agency's social media page`,
      subgroup: (n) => `${n} riders selected at random from the fare-card holders who ride one particular route`,
    },
  ];

  const METHOD_WHY = {
    convenience: (scene) => `Not random: ${scene.place} are simply the easiest to reach and may differ from the rest of ${scene.popShort}.`,
    volunteer: () => "A larger sample does not fix bias: people who choose to respond may differ from those who do not.",
    subgroup: (scene) => `The selection is random, but only among ${scene.part}, who may differ from the rest of ${scene.popShort}.`,
  };

  // Reasons a result may not generalize, kept within a few characters of one another.
  const REASONS = {
    part: "The sample was drawn from only one part of the whole population.",
    self: "The people surveyed decided for themselves whether to respond.",
    size: "The sample was too small to represent a population of this size.",
    all: "The survey did not include every single member of the population.",
    percent: "The results were reported as a percent instead of as a count.",
  };

  function methodChoiceItem(t) {
    const scene = t.pick(SAMPLING_SCENES);
    const n = t.pick([100, 120, 150, 200, 250, 300, 400]);
    const m = t.pick([800, 900, 1000, 1200, 1500, 2000]);
    const phrase = (method) => scene[method](method === "volunteer" ? m : n);
    const say = (method) => `Surveying ${phrase(method)}`;
    const keyText = say("random");
    const wrongMethods = ["convenience", "volunteer", "subgroup"];
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure: null,
      stem:
        `${scene.who} wants to ${scene.goal}. Which of the following methods of choosing people to survey is most likely to ` +
        `produce a sample that is representative of ${scene.popShort}?`,
      correct: keyText,
      wrong: wrongMethods.map((method) => [say(method), METHOD_WHY[method](scene)]),
      explanation:
        `A sample represents a population when everyone in the population has a chance of being chosen, by a random process. ` +
        `Only selecting at random from a list of all of ${scene.popShort} does that; a large group of volunteers, the people at one ` +
        "place, or a random sample of one part does not.",
      steps: [
        `The population is ${scene.popShort}.`,
        "Rule out methods that are not random (the first people to arrive, volunteers who respond).",
        `Rule out random selection from only part of the population; the key selects at random from all of ${scene.popShort}.`,
      ],
      principles: [
        "A random sample from the whole population tends to represent it; convenience samples and volunteers tend not to.",
        "A larger sample does not correct a biased way of choosing it.",
      ],
      trap: `The ${fmt(m)} volunteers outnumber the ${n} people in the random sample, but who is chosen matters more than how many.`,
      hint: "Could every member of the population have ended up in the sample, and did chance decide who did?",
      estimatedSeconds: 60,
      verify: () => {
        const methods = ["random", ...wrongMethods];
        const good = methods.filter((method) => METHOD_FACTS[method].random && METHOD_FACTS[method].whole && !METHOD_FACTS[method].self);
        return good.length === 1 && say(good[0]) === keyText;
      },
    };
  }

  function methodFlawItem(t) {
    const scene = t.pick(SAMPLING_SCENES);
    const method = t.pick(["convenience", "volunteer", "subgroup"]);
    const n = t.pick([100, 120, 150, 200, 250, 300, 400]);
    const m = t.pick([800, 900, 1000, 1200, 1500, 2000]);
    const size = method === "volunteer" ? m : n;
    const facts = METHOD_FACTS[method];
    const keyName = facts.self ? "self" : "part";
    const described = scene[method](size);
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure: null,
      stem:
        `${scene.who} wanted to ${scene.goal}, so ${described} were surveyed. Which of the following is the best reason the ` +
        `results may not be a good estimate for all of ${scene.popShort}?`,
      correct: REASONS[keyName],
      wrong: [
        [REASONS.size, `A well-chosen sample of ${fmt(size)} can represent a large population; the trouble is how these people were chosen.`],
        [REASONS.all, "A sample never includes everyone; that is what makes it a sample, and a good one still gives a useful estimate."],
        [REASONS.percent, "Reporting a percent does nothing to bias the result; the way the sample was chosen does."],
      ],
      explanation: facts.self
        ? "The people surveyed decided for themselves whether to respond, and people who choose to respond may hold different views from those who do not."
        : `Only ${method === "convenience" ? scene.place : scene.part} could be chosen, and they may differ from the rest of ${scene.popShort}.`,
      steps: [
        `The population is ${scene.popShort}.`,
        facts.self ? "The people surveyed chose themselves by responding." : "Only one part of the population could be chosen.",
        `So the sample may not represent all of ${scene.popShort}, however many people are in it.`,
      ],
      principles: [
        "A sample supports conclusions about a population only when it is chosen at random from the whole population.",
        "Size does not fix bias: a large sample chosen from part of a population, or of volunteers, can still mislead.",
      ],
      trap: `${fmt(size)} people is plenty for an estimate; the flaw is in who could be chosen, not how many were.`,
      hint: "Who could have been surveyed, and who could not?",
      estimatedSeconds: 60,
      verify: () => {
        const expected = facts.self ? "self" : !facts.whole ? "part" : null;
        return expected === keyName && size >= 100;
      },
    };
  }

  const methodChoice = {
    id: "sampling-method-choice",
    domain: DATA,
    skill: "Statistical inference",
    subskill: "study design",
    difficulty: "Easy",
    title: "Choosing whom to survey",
    recognize:
      "A survey represents a population only if chance chooses the people from the whole population. Volunteers, whoever is " +
      "nearby, and a random sample of one part do not, and a bigger sample does not fix that.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["neighbouring-rule", "context-constraint"],
    build(t) {
      return t.chance(0.55) ? methodChoiceItem(t) : methodFlawItem(t);
    },
  };

  /* ================================= margin-and-sample-size (Easy) */

  const MARGIN_SCENES = [
    {
      members: "students", popShort: "the students at a large university", kind: "percent",
      stat: "the percent of students who use the campus gym at least once a week", unit: "%", values: [18, 72], margins: [2, 3, 4, 5],
      statAll: "the percent of all the university's students who use the campus gym at least once a week",
    },
    {
      members: "adults", popShort: "the adults in a state", kind: "percent",
      stat: "the percent of adults who have a public library card", unit: "%", values: [30, 70], margins: [2, 3, 4],
      statAll: "the percent of all adults in the state who have a public library card",
    },
    {
      members: "employees", popShort: "the employees of a large company", kind: "mean",
      stat: "the mean one-way commute time, in minutes, of the company's employees", unit: " minutes", values: [180, 420], margins: [8, 10, 12, 15, 20], scale: 10,
      statAll: "the mean one-way commute time, in minutes, of all the company's employees",
    },
    {
      members: "households", popShort: "the households in a city", kind: "mean",
      stat: "the mean number of hours per week that each household's television is on", unit: " hours", values: [150, 350], margins: [5, 8, 10, 12], scale: 10,
      statAll: "the mean number of hours per week that the television is on, for all households in the city",
    },
    {
      members: "trees", popShort: "the pine trees in a forest", kind: "mean",
      stat: "the mean height, in feet, of the pine trees in the forest", unit: " feet", values: [450, 800], margins: [10, 15, 20, 25], scale: 10,
      statAll: "the mean height, in feet, of all the pine trees in the forest",
    },
  ];

  function sizeItem(t) {
    const scene = t.pick(MARGIN_SCENES);
    const [small, big] = t.sample([100, 150, 200, 300, 400, 500, 800, 1000, 1200, 1500], 2).sort((a, b) => a - b);
    if (big < 2 * small) return sizeItem(t);
    const firstBig = t.chance(0.5);
    const [n1, n2] = firstBig ? [big, small] : [small, big];
    const statWord = scene.kind === "percent" ? "percent" : "mean";
    const say = {
      key: `The estimate from the sample of ${fmt(big)} ${scene.members} likely has the smaller margin of error.`,
      reversed: `The estimate from the sample of ${fmt(small)} ${scene.members} likely has the smaller margin of error.`,
      equal: "The two estimates likely have equal margins of error, since both samples come from the same population.",
      certain: `The estimate from the sample of ${fmt(big)} ${scene.members} is certain to equal the population ${statWord}.`,
    };
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure: null,
      stem:
        `Two researchers each selected a random sample of ${scene.popShort} to estimate ${scene.stat}. One sample had ` +
        `${fmt(n1)} ${scene.members}, and the other had ${fmt(n2)}. Each researcher reported the estimate with a margin of ` +
        "error, computed in the same way. Which of the following is most likely true?",
      correct: say.key,
      wrong: [
        [say.reversed, "Reverses the relationship: a larger random sample gives a more precise estimate, so a smaller margin of error."],
        [say.equal, "The margin of error depends on the size of the sample, not only on the population it comes from."],
        [say.certain, "A larger sample narrows the margin of error but never removes it; no sample makes the estimate certain."],
      ],
      explanation:
        `A larger random sample varies less from sample to sample, so its estimate is more precise and its margin of error is ` +
        `smaller. The sample of ${fmt(big)} is larger than the sample of ${fmt(small)}.`,
      steps: [
        "Both samples are random and from the same population, so only their sizes differ.",
        "A larger random sample gives a smaller margin of error.",
        `The sample of ${fmt(big)} is the larger one.`,
      ],
      principles: [
        "For random samples from the same population, a larger sample tends to give a smaller margin of error.",
        "A margin of error never makes an estimate certain; it describes how far the true value plausibly lies from it.",
      ],
      trap: "More data means less uncertainty, not more; and no sample size makes an estimate exact.",
      hint: "Which estimate would you expect to vary less if the survey were repeated?",
      estimatedSeconds: 55,
      verify: () => {
        // Standard error of a proportion near 0.5, as a stand-in for any statistic.
        const error = (size) => Math.sqrt(0.25 / size);
        const smaller = error(n1) < error(n2) ? n1 : n2;
        return smaller === big && say.key.includes(`sample of ${fmt(smaller)} `);
      },
    };
  }

  function plausibleItem(t, numeric) {
    const scene = t.pick(MARGIN_SCENES);
    const scale = scene.scale || 1;
    const est = t.int(scene.values[0], scene.values[1]);
    const margin = t.pick(scene.margins);
    const n = t.pick([150, 200, 250, 300, 400, 500, 600]);
    const text = (value) => `${num(value / scale)}${scene.kind === "percent" ? "%" : ""}`;
    const estimateText = `${num(est / scale)}${scene.unit}`;
    const marginText = scene.kind === "percent" ? `${margin} percentage points` : `${num(margin / scale)}${scene.unit}`;
    const intro =
      `A random sample of ${n} of ${scene.popShort} was used to estimate ${scene.stat}. The estimate was ${estimateText}, ` +
      `with a margin of error of ${marginText}.`;
    const principles = [
      "An estimate with a margin of error gives a range of plausible values: the estimate minus the margin to the estimate plus the margin.",
      "Values outside that range are not plausible for the population, based on the sample.",
    ];
    if (numeric) {
      const greatest = t.chance(0.5);
      const key = (est + (greatest ? margin : -margin)) / scale;
      return {
        responseType: "numeric",
        stimulus: null,
        figure: null,
        stem: `${intro} Based on these results, what is the ${greatest ? "greatest" : "least"} plausible value for ${scene.statAll}?`,
        correct: tidy(key),
        explanation: `The plausible values run from ${text(est - margin)} to ${text(est + margin)}, so the ${greatest ? "greatest" : "least"} is ${num(tidy(key))}.`,
        steps: [
          `Plausible range: ${estimateText} ${MINUS} ${marginText} to ${estimateText} + ${marginText}.`,
          `That is ${text(est - margin)} to ${text(est + margin)}.`,
          `The ${greatest ? "greatest" : "least"} plausible value is ${num(tidy(key))}.`,
        ],
        principles,
        trap: `The estimate, ${num(est / scale)}, is the most likely single value, but the question asks for the ${greatest ? "top" : "bottom"} of the plausible range.`,
        hint: "How far from the estimate can a plausible value be?",
        estimatedSeconds: 50,
        verify: () => {
          const numbers = intro.match(/estimate was ([\d.]+)[^,]*, with a margin of error of ([\d.]+)/);
          const center = Number(numbers[1]);
          const width = Number(numbers[2]);
          return close(greatest ? center + width : center - width, key);
        },
      };
    }
    const inside = est + t.pick([-1, 1]) * t.int(1, margin - 1);
    const above = est + margin + t.int(1, margin);
    const below = est - margin - t.int(1, margin);
    const twice = est + (t.chance(0.5) ? 2 : -2) * margin;
    const wrong = [
      [text(above), `Lies more than the margin of error above the estimate, outside the plausible range.`],
      [text(below), `Lies more than the margin of error below the estimate, outside the plausible range.`],
      [text(twice), "Moves twice the margin of error from the estimate, outside the plausible range."],
      [text(margin), "Gives the margin of error itself, which is a distance, not a value of the statistic."],
    ].filter(([value]) => value !== text(inside));
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure: null,
      stem: `${intro} Which of the following is a plausible value for ${scene.statAll}?`,
      correct: text(inside),
      wrong,
      explanation:
        `The plausible values run from ${text(est - margin)} to ${text(est + margin)}. Only ${text(inside)} lies in that range.`,
      steps: [
        `Plausible range: ${text(est - margin)} to ${text(est + margin)}.`,
        "Check each choice against the range.",
        `${text(inside)} is inside it; the others are outside.`,
      ],
      principles,
      trap: "A value need not equal the estimate to be plausible, and a value just past the margin is not plausible.",
      hint: "What range of values does the margin of error allow?",
      estimatedSeconds: 55,
      verify: () => {
        const numbers = intro.match(/estimate was ([\d.]+)[^,]*, with a margin of error of ([\d.]+)/);
        const center = Number(numbers[1]);
        const width = Number(numbers[2]);
        const value = (choice) => parseFloat(choice);
        const within = (choice) => Math.abs(value(choice) - center) <= width + 1e-9;
        return within(text(inside)) && wrong.every(([choice]) => !within(choice));
      },
    };
  }

  const marginSize = {
    id: "margin-and-sample-size",
    domain: DATA,
    skill: "Statistical inference",
    subskill: "margin of error",
    difficulty: "Easy",
    title: "Reading a margin of error",
    recognize:
      "A margin of error gives the plausible values, from the estimate minus the margin to the estimate plus it; a larger random " +
      "sample gives a smaller margin, and no sample gives certainty.",
    rubric: { steps: 0, concept: 1, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["reversed-condition", "wrong-quantity"],
    build(t) {
      const roll = t.random();
      if (roll < 0.4) return sizeItem(t);
      return plausibleItem(t, roll > 0.72);
    },
  };

  /* ================================= mark-recapture-estimate (Medium) */

  const MARK_SCENES = [
    {
      animals: "trout", place: "a lake", where: "in the lake",
      first: (M) => `To estimate the number of trout in a lake, biologists caught ${M} trout, tagged them, and released them back into the lake.`,
      second: (C) => `A month later, they caught ${C} trout`, marked: "tagged", unmarked: "untagged",
      assume: "Assume that the tagged trout mixed evenly with the others and that no trout entered or left the lake in between.",
    },
    {
      animals: "deer", place: "a forest", where: "in the forest",
      first: (M) => `To estimate the number of deer in a forest, wildlife officers captured ${M} deer, fitted each with a collar, and released them.`,
      second: (C) => `Later, the officers photographed ${C} different deer with trail cameras`, marked: "collared", unmarked: "without collars",
      assume: "Assume that the collared deer mixed evenly with the others and that the deer population did not change in between.",
    },
    {
      animals: "butterflies", place: "a meadow", where: "in the meadow",
      first: (M) => `To estimate the number of butterflies in a meadow, students caught ${M} butterflies, marked each with a small dot of paint, and released them.`,
      second: (C) => `The next day, they caught ${C} butterflies`, marked: "marked", unmarked: "unmarked",
      assume: "Assume that the marked butterflies mixed evenly with the others and that no butterflies arrived or left in between.",
    },
    {
      animals: "turtles", place: "a pond", where: "in the pond",
      first: (M) => `To estimate the number of turtles in a pond, researchers caught ${M} turtles, marked each shell, and returned them to the pond.`,
      second: (C) => `Two weeks later, they caught ${C} turtles`, marked: "marked", unmarked: "unmarked",
      assume: "Assume that the marked turtles mixed evenly with the others and that no turtles entered or left the pond in between.",
    },
    {
      animals: "squirrels", place: "a park", where: "in the park",
      first: (M) => `To estimate the number of squirrels in a park, ecologists trapped ${M} squirrels, attached a small ear tag to each, and released them.`,
      second: (C) => `A week later, they trapped ${C} squirrels`, marked: "tagged", unmarked: "untagged",
      assume: "Assume that the tagged squirrels mixed evenly with the others and that no squirrels arrived or left in between.",
    },
  ];

  function markItem(t, numeric) {
    const scene = t.pick(MARK_SCENES);
    const form = t.pick(["total", "total", "unmarked"]);
    const asPercent = t.chance(0.35);
    return retry(() => {
      const R = t.int(4, 30);
      const C = t.int(Math.max(40, 4 * R), 300);
      const M = t.int(30, 400);
      const N = (M * C) / R;
      if (!Number.isInteger(N) || N > 60000 || N < 2 * M) return null;
      const pct = (100 * R) / C;
      if (asPercent && !isClean(pct, 1)) return null;
      const key = form === "total" ? N : N - M;
      const found = asPercent ? `, and ${num(tidy(pct))}% of them were ${scene.marked}` : `, of which ${R} were ${scene.marked}`;
      const ask = form === "total"
        ? `Based on these results, what is the best estimate of the number of ${scene.animals} ${scene.where}?`
        : `Based on these results, what is the best estimate of the number of ${scene.animals} ${scene.where} that are ${scene.unmarked}?`;
      const candidates = form === "total"
        ? [
          [shown(M + C - R, 0), `Counts the different ${scene.animals} seen in the two samples instead of estimating the whole population.`],
          [shown(N - M, 0), `Estimates only the ${scene.unmarked} ${scene.animals}, leaving out the ${M} that were ${scene.marked}.`],
          [shown((M * C) / (C - R), 0), `Divides by the ${C - R} ${scene.unmarked} ${scene.animals} in the second sample instead of the ${R} ${scene.marked} ones.`],
          [shown((M * R) / C, 0), "Sets up the proportion upside down."],
          [shown(M * C, 0), `Multiplies ${M} by ${C} without dividing by the ${R} that were ${scene.marked}.`],
        ]
        : [
          [shown(N, 0), `Gives the estimate of all the ${scene.animals}, a step on the way; ${M} of them are ${scene.marked}.`],
          [shown(C - R, 0), `Gives the number of ${scene.unmarked} ${scene.animals} in the second sample, without scaling it up.`],
          [shown(N - R, 0), `Subtracts the ${R} ${scene.marked} ${scene.animals} in the second sample instead of all ${M} ${scene.marked}.`],
          [shown(N - C, 0), `Subtracts the second sample of ${C}.`],
        ];
      const setup = `${M}/N = ${asPercent ? `${num(tidy(pct))}/100` : `${R}/${C}`}`;
      return pack(numeric, key, fmt(key), candidates, {
        stimulus: null,
        figure: null,
        stem: `${scene.first(M)} ${scene.second(C)}${found}. ${scene.assume} ${ask}`,
        explanation:
          `The share of ${scene.marked} ${scene.animals} in the second sample, ${asPercent ? `${num(tidy(pct))}%` : `${R}/${C}`}, estimates their share of the whole ` +
          `population, which contains exactly ${M} ${scene.marked} ones. So ${setup}, and N = ${fmt(N)}` +
          `${form === "total" ? "." : `. Of these, ${M} are ${scene.marked}, so about ${fmt(N)} ${MINUS} ${M} = ${fmt(key)} are ${scene.unmarked}.`}`,
        steps: [
          `Share ${scene.marked} in the second sample: ${asPercent ? `${num(tidy(pct))}%` : `${R}/${C}`}.`,
          `The population has ${M} ${scene.marked} ${scene.animals}, so ${setup}.`,
          `Solve: N = ${fmt(N)}.`,
          ...(form === "total" ? [] : [`${scene.unmarked[0].toUpperCase()}${scene.unmarked.slice(1)}: ${fmt(N)} ${MINUS} ${M} = ${fmt(key)}.`]),
        ],
        principles: [
          "A random sample's proportion estimates the population's proportion.",
          "When the number of marked members of a population is known, the sample's share of marked members gives the population size.",
        ],
        trap: form === "total"
          ? `${M + C - R} is only the number of different ${scene.animals} actually seen; the question asks about all of them.`
          : `${fmt(N)} is the whole population; ${M} of those are ${scene.marked}.`,
        hint: `In the second sample, what fraction of the ${scene.animals} were ${scene.marked}, and how many ${scene.marked} ${scene.animals} are there in all?`,
        estimatedSeconds: 95,
        verify: () => {
          // Brute force: the population size whose marked share matches the sample's.
          let size = null;
          for (let candidate = M; candidate <= 100000; candidate += 1) {
            if (M * C === candidate * R) {
              size = candidate;
              break;
            }
          }
          return size !== null && (form === "total" ? size : size - M) === key;
        },
      });
    });
  }

  const markRecapture = {
    id: "mark-recapture-estimate",
    domain: DATA,
    skill: "Statistical inference",
    subskill: "samples and populations",
    difficulty: "Medium",
    title: "Estimating a population size from marked animals",
    recognize:
      "The marked animals' share of the second sample estimates their share of the whole population, and their number in the " +
      "population is known: set the two shares equal and solve for the population size.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "part-vs-whole", "wrong-quantity"],
    build(t) {
      return markItem(t, t.chance(0.5));
    },
  };

  /* =============================== two-estimates-compare (Hard) */

  const COMPARE_SCENES = [
    {
      kind: "percent", groups: ["School A", "School B"],
      intro: (n1, n2) => `A researcher surveyed a random sample of ${n1} students at School A and a separate random sample of ${n2} students at School B, asking whether they walk to school.`,
      estimate: (g, v, m) => `At ${g}, ${v}% of the students surveyed walk to school, with a margin of error of ${m} percentage points`,
      same: "It is plausible that the same percent of students at School A and at School B walk to school.",
      greater: (hi, lo) => `It is likely that a greater percent of students at ${hi} than at ${lo} walk to school.`,
      exact: (hi, lo, d) => `It is certain that the percent at ${hi} is exactly ${d} points greater than at ${lo}.`,
    },
    {
      kind: "percent", groups: ["Easton", "Westfield"],
      intro: (n1, n2) => `A polling firm surveyed a random sample of ${n1} residents of Easton and a separate random sample of ${n2} residents of Westfield about a proposed bike lane.`,
      estimate: (g, v, m) => `In ${g}, ${v}% of those surveyed support the bike lane, with a margin of error of ${m} percentage points`,
      same: "It is plausible that the same percent of residents in Easton and in Westfield support the bike lane.",
      greater: (hi, lo) => `It is likely that a greater percent of residents in ${hi} than in ${lo} support the bike lane.`,
      exact: (hi, lo, d) => `It is certain that support in ${hi} is exactly ${d} points higher than in ${lo}.`,
    },
    {
      kind: "percent", groups: ["the Main Street store", "the Oak Street store"],
      intro: (n1, n2) => `A bakery surveyed a random sample of ${n1} customers at its Main Street store and a separate random sample of ${n2} customers at its Oak Street store.`,
      estimate: (g, v, m) => `At ${g}, ${v}% of the customers surveyed were satisfied, with a margin of error of ${m} percentage points`,
      same: "It is plausible that the same percent of customers at the Main Street and Oak Street stores are satisfied.",
      greater: (hi, lo) => `It is likely that a greater percent of customers at ${hi} than at ${lo} are satisfied.`,
      exact: (hi, lo, d) => `It is certain that satisfaction at ${hi} is exactly ${d} points higher than at ${lo}.`,
    },
    {
      kind: "mean", groups: ["Office P", "Office Q"], unit: "minutes", base: [180, 320], margins: [8, 10, 12, 15, 20],
      intro: (n1, n2) => `A company recorded the one-way commute times of a random sample of ${n1} employees at Office P and a separate random sample of ${n2} employees at Office Q.`,
      estimate: (g, v, m) => `For ${g}, the mean commute time in the sample was ${v} minutes, with a margin of error of ${m} minutes`,
      same: "It is plausible that the mean commute times of all employees at Office P and Office Q are equal.",
      greater: (hi, lo) => `It is likely that the mean commute time of all employees at ${hi} is greater than at ${lo}.`,
      exact: (hi, lo, d) => `It is certain that the mean commute at ${hi} is exactly ${d} minutes longer than at ${lo}.`,
    },
    {
      kind: "mean", groups: ["the 9th graders", "the 12th graders"], unit: "hours", base: [60, 70], margins: [2, 3, 4, 5, 6],
      intro: (n1, n2) => `A school nurse asked a random sample of ${n1} of the school's 9th graders and a separate random sample of ${n2} of its 12th graders how many hours they slept the night before.`,
      estimate: (g, v, m) => `For ${g}, the sample mean was ${v} hours, with a margin of error of ${m} hours`,
      same: "It is plausible that the mean hours of sleep of all 9th graders and all 12th graders at the school are equal.",
      greater: (hi, lo) => `It is likely that the mean hours of sleep of all ${hi.replace("the ", "")} at the school is greater than that of all ${lo.replace("the ", "")}.`,
      exact: (hi, lo, d) => `It is certain that ${hi} at the school sleep exactly ${d} hours more, on average, than ${lo}.`,
    },
  ];

  function compareItem(t) {
    const scene = t.pick(COMPARE_SCENES);
    return retry(() => {
      const overlap = t.chance(0.5);
      // Work in tenths for means, whole points for percents.
      const scale = scene.kind === "mean" ? 10 : 1;
      const m1 = scene.kind === "mean" ? t.pick(scene.margins) : t.int(2, 6);
      const m2 = scene.kind === "mean" ? t.pick(scene.margins) : t.int(2, 6);
      const sumM = m1 + m2;
      // Overlapping: the gap exceeds each margin alone (so it looks decisive) but not their sum.
      if (overlap && Math.max(m1, m2) + 1 > sumM - 1) return null;
      const gap = overlap ? t.int(Math.max(m1, m2) + 1, sumM - 1) : t.int(sumM + 1, sumM + Math.max(2, Math.round(sumM / 2)));
      // A whole-number difference of means would print as "exactly 1 hours".
      if (scene.kind === "mean" && gap % 10 === 0) return null;
      const low = scene.kind === "mean" ? t.int(scene.base[0], scene.base[1]) : t.int(20, 70);
      const high = low + gap;
      if (scene.kind === "percent" && high > 90) return null;
      const hiIndex = t.int(0, 1);
      const values = hiIndex === 0 ? [high, low] : [low, high];
      const margins = [m1, m2];
      const show = (value) => num(value / scale);
      const [hi, lo] = hiIndex === 0 ? scene.groups : [scene.groups[1], scene.groups[0]];
      const loGroup = scene.groups[1 - hiIndex];
      const d = show(gap);
      const statements = {
        same: scene.same,
        greater: scene.greater(hi, lo),
        reversed: scene.greater(lo, hi),
        exact: scene.exact(hi, lo, d),
      };
      const keyName = overlap ? "same" : "greater";
      const n1 = t.pick([200, 250, 300, 400, 500, 600]);
      const n2 = t.pick([200, 250, 300, 400, 500, 600]);
      const lines = [0, 1].map((g) => scene.estimate(scene.groups[g], show(values[g]), show(margins[g])));
      const stem = `${scene.intro(n1, n2)} ${lines[0]}. ${lines[1]}. Which of the following conclusions is best supported by these results?`;
      const ranges = [0, 1].map((g) => `${show(values[g] - margins[g])} to ${show(values[g] + margins[g])}`);
      const reasons = {
        same: `The plausible ranges, ${ranges[0]} and ${ranges[1]}, do not overlap, so equal values are not plausible.`,
        greater: `The plausible ranges, ${ranges[0]} and ${ranges[1]}, overlap, so the difference in the samples could be due to chance.`,
        reversed: `Reverses the comparison: the estimate for ${hi} is the greater one.`,
        exact: `The difference between the samples, ${d}, is only an estimate; the margins of error rule out certainty.`,
      };
      return {
        responseType: "multiple-choice",
        stimulus: null,
        figure: null,
        stem,
        correct: statements[keyName],
        wrong: ["same", "greater", "reversed", "exact"].filter((name) => name !== keyName).map((name) => [statements[name], reasons[name]]),
        explanation:
          `Each estimate plus or minus its margin gives the plausible values: ${ranges[0]} for ${scene.groups[0]} and ${ranges[1]} for ` +
          `${scene.groups[1]}. ${overlap
            ? `The ranges overlap (${show(high - margins[hiIndex])} is below ${show(low + margins[1 - hiIndex])}), so a common value is plausible for both, even though the sample estimates differ by ${d}.`
            : `The ranges do not overlap (${show(high - margins[hiIndex])} is above ${show(low + margins[1 - hiIndex])}), so the value for ${hi} is likely greater than for ${loGroup}.`}`,
        steps: [
          `Plausible values for ${scene.groups[0]}: ${ranges[0]}.`,
          `Plausible values for ${scene.groups[1]}: ${ranges[1]}.`,
          overlap
            ? `The ranges overlap, so equal values are plausible; the data do not show a difference.`
            : `The ranges do not overlap, so a difference is likely, with ${hi} greater.`,
        ],
        principles: [
          "An estimate with a margin of error gives a range of plausible values for the population.",
          "When two groups' plausible ranges overlap, the groups may have the same value; when they do not, a difference is likely.",
        ],
        trap: overlap
          ? `The estimates differ by ${d}, more than either margin alone, but the ranges still overlap because the margins add.`
          : "A difference supported by the data is still an estimate: likely, not certain, and not exact.",
        hint: "Write each estimate as a range. Do the ranges share any values?",
        estimatedSeconds: 115,
        verify: () => {
          const found = [...stem.matchAll(/ ([\d.]+)(?:%| minutes| hours)[^.]*?margin of error of ([\d.]+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
          if (found.length !== 2) return false;
          const [[a, ea], [b, eb]] = found;
          const overlaps = a - ea <= b + eb && b - eb <= a + ea;
          const higher = a > b ? scene.groups[0] : scene.groups[1];
          const expected = overlaps ? scene.same : scene.greater(higher, higher === scene.groups[0] ? scene.groups[1] : scene.groups[0]);
          return expected === statements[keyName];
        },
      };
    });
  }

  const twoEstimates = {
    id: "two-estimates-compare",
    domain: DATA,
    skill: "Statistical inference",
    subskill: "margin of error",
    difficulty: "Hard",
    title: "Comparing two estimates that each have a margin of error",
    recognize:
      "Turn each estimate and margin into a range of plausible values. Overlapping ranges leave equal values plausible, however " +
      "far apart the estimates look; separate ranges make a difference likely, never certain.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 0, trap: 2 },
    tricks: ["must-vs-could", "reversed-condition"],
    build(t) {
      return compareItem(t);
    },
  };

  return [methodChoice, marginSize, sampleEstimate, markRecapture, sampleInference, twoEstimates];
});
