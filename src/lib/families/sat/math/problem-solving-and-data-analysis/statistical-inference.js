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
    DATA, fmt, sum, range, retry, parseTable, parseNumber, DOMAIN, offerHard, finish, tidy, isClean, close, fitsGrid, packRanked,
  } = C;

  // Text choices: null when a modelled mistake reads the same as the key.
  function offerStrict(keyText, candidates) {
    if (candidates.some(([text]) => text === keyText)) return null;
    return offerHard(keyText, candidates);
  }

  // Half-width, in percentage points, of a 95% interval for a sample percent
  // p from a random sample of n: the margin a survey would report.
  const percentMargin = (p, n) => Math.round(196 * Math.sqrt((p / 100) * (1 - p / 100) / n));

  // The same for a sample mean, given the population's standard deviation,
  // rounded to `places` decimals.
  const meanMargin = (sd, n, places = 1) => Math.round(((1.96 * sd) / Math.sqrt(n)) * 10 ** places) / 10 ** places;

  /* =================================== sample-proportion-estimate (Medium) */

  // `does` and `doesNot` are plural present-tense predicates, so every stem
  // reads "... of the households use electricity ..." whatever the category.
  const SAMPLE_SCENES = [
    {
      intro: (N, n) => `A city has ${fmt(N)} households. A random sample of ${n} of these households was surveyed about the main fuel used to heat their homes. The table summarizes the results.`,
      head: ["Main heating fuel", "Number of households"], cats: ["Natural gas", "Electricity", "Heating oil", "Wood"],
      does: (c) => `use ${c.toLowerCase()} as their main heating fuel`,
      doesNot: (c) => `do not use ${c.toLowerCase()} as their main heating fuel`,
      whole: "households in the city", one: "household", N: [8000, 60000],
    },
    {
      intro: (N, n) => `A high school has ${fmt(N)} students. A random sample of ${n} of these students was asked how they usually get to school. The table summarizes the results.`,
      head: ["Usual way to school", "Number of students"], cats: ["Bus", "Car", "Walk", "Bicycle"],
      does: (c) => ({ Bus: "usually take the bus", Car: "usually ride in a car", Walk: "usually walk", Bicycle: "usually ride a bicycle" })[c],
      doesNot: (c) => ({ Bus: "do not usually take the bus", Car: "do not usually ride in a car", Walk: "do not usually walk", Bicycle: "do not usually ride a bicycle" })[c],
      whole: "students at the school", one: "student", that: "who", N: [900, 3600],
    },
    {
      intro: (N, n) => `A factory produced ${fmt(N)} light bulbs last week. A random sample of ${n} of these bulbs was inspected. The table summarizes the results.`,
      head: ["Result", "Number of bulbs"], cats: ["No defect", "Minor defect", "Major defect"],
      does: (c) => ({ "No defect": "have no defect", "Minor defect": "have a minor defect", "Major defect": "have a major defect" })[c],
      doesNot: (c) => ({ "No defect": "have a defect", "Minor defect": "do not have a minor defect", "Major defect": "do not have a major defect" })[c],
      whole: "bulbs produced last week", one: "bulb", N: [6000, 48000],
    },
    {
      intro: (N, n) => `An orchard has ${fmt(N)} apple trees. A random sample of ${n} of these trees was inspected for signs of disease. The table summarizes the results.`,
      head: ["Condition", "Number of trees"], cats: ["Healthy", "Leaf spots", "Fruit rot", "Bark damage"],
      does: (c) => ({ Healthy: "are healthy", "Leaf spots": "have leaf spots", "Fruit rot": "have fruit rot", "Bark damage": "have bark damage" })[c],
      doesNot: (c) => ({ Healthy: "are not healthy", "Leaf spots": "do not have leaf spots", "Fruit rot": "do not have fruit rot", "Bark damage": "do not have bark damage" })[c],
      whole: "trees in the orchard", one: "tree", N: [2000, 20000],
    },
    {
      intro: (N, n) => `A town has ${fmt(N)} registered voters. A random sample of ${n} of these voters was asked which of three proposals for a new library they prefer. The table summarizes the results.`,
      head: ["Response", "Number of voters"], cats: ["Proposal A", "Proposal B", "Proposal C", "No preference"],
      does: (c) => (c === "No preference" ? "have no preference" : `prefer ${c}`),
      doesNot: (c) => (c === "No preference" ? "prefer one of the proposals" : `do not prefer ${c}`),
      whole: "registered voters in the town", one: "voter", that: "who", N: [4000, 40000],
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
      const m = percentMargin(p, n);
      if ((n * p) % 100 || m < 2) return null;
      const lo = (N * (p - m)) / 100;
      const hi = (N * (p + m)) / 100;
      const point = (N * p) / 100;
      if (!Number.isInteger(lo) || !Number.isInteger(hi)) return null;
      const between = (a, b) => (Number.isInteger(a) && Number.isInteger(b) && a > 0 ? `Between ${fmt(a)} and ${fmt(b)}` : null);
      const key = between(lo, hi);
      const candidates = t.shuffle([
        [between((n * (p - m)) / 100, (n * (p + m)) / 100), `Applies the interval to the ${fmt(n)} people surveyed instead of all ${fmt(N)} ${ctx.popShort}.`],
        [between((N * p * (100 - m)) / 10000, (N * p * (100 + m)) / 10000), `Treats the margin of error as ${m}% of the estimate instead of ${m} percentage points.`],
        [between((N * (100 - p - m)) / 100, (N * (100 - p + m)) / 100), `Gives the plausible number who ${ctx.notAttr}, the opposite group.`],
        [between(point - m, point + m), `Treats the margin of error as ${m} people instead of ${m} percentage points of all ${fmt(N)}.`],
      ].filter(([text]) => text));
      candidates.push([`Exactly ${fmt(point)}`, "Treats the sample estimate as the exact population value, ignoring the margin of error."]);
      const wrong = offerStrict(key, candidates);
      if (!wrong || (!numeric && wrong.length < 3)) return null;
      const greatest = t.chance(0.5);
      const ask = numeric
        ? `Based on these results, what is the ${greatest ? "greatest" : "least"} plausible number of ${ctx.popShort} who ${ctx.attr}?`
        : `Based on these results, which of the following ranges is most plausible for the number of ${ctx.popShort} who ${ctx.attr}?`;
      const answer = greatest ? hi : lo;
      if (numeric && !fitsGrid(answer)) return null;
      return finish(numeric, {
        stimulus: null,
        stem:
          `${ctx.sampler} surveyed a random sample of ${fmt(n)} of the ${fmt(N)} ${ctx.pop}. Of those surveyed, ${p}% said they ` +
          `${ctx.attr}. The margin of error for this estimate is ${m} percentage points. ${ask}`,
        correct: numeric ? answer : key,
        wrong: numeric ? [] : wrong.slice(0, 3),
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
      pop: "the store's customers", wider: "customers of all online stores", sampled: "the customers surveyed", verb: "want faster shipping",
    },
    {
      intro: (n, p) => `A town surveyed a random sample of ${n} of its households, and ${p}% of them reported owning a pet.`,
      pop: "the town's households", wider: "all households in the state", sampled: "the households surveyed", verb: "own a pet",
    },
    {
      intro: (n, p) => `An airline surveyed a random sample of ${n} of its passengers, and ${p}% of them said they want window seats.`,
      pop: "the airline's passengers", wider: "passengers on all airlines", sampled: "the passengers surveyed", verb: "want window seats",
    },
    {
      intro: (n, p) => `A museum surveyed a random sample of ${n} of its members, and ${p}% of them said they would attend evening hours.`,
      pop: "the museum's members", wider: "all museum visitors in the country", sampled: "the members surveyed", verb: "would attend evening hours",
    },
  ];

  // Two ways to overreach, crossed with each other: every choice differs from
  // two others in one respect, so no choice is the "center" of the others.
  function inferenceConclusion(t) {
    const ctx = t.pick(SCOPES);
    return retry(() => {
      const n = t.pick([150, 200, 250, 300, 400, 500]);
      const p = t.int(15, 85);
      const m = percentMargin(p, n);
      const lo = p - m;
      const hi = p + m;
      const scopeWrong = t.chance(0.5) ? "wider" : "sampled";
      const who = { right: ctx.pop, wider: ctx.wider, sampled: ctx.sampled };
      const say = (sure, scope) =>
        `It is ${sure ? "certain" : "plausible"} that between ${lo}% and ${hi}% of ${who[scope]} ${ctx.verb}.`;
      const key = say(false, "right");
      const scopeReason = scopeWrong === "wider"
        ? `extends the result to ${ctx.wider}, but the sample was drawn only from ${ctx.pop}`
        : `describes ${ctx.sampled}, whose percent is known exactly (${p}%); the interval describes all of ${ctx.pop}`;
      const wrong = [
        [say(false, scopeWrong), `${scopeReason[0].toUpperCase()}${scopeReason.slice(1)}.`],
        [say(true, "right"), "A margin of error gives plausible values, not a guarantee; the true percent could fall outside it."],
        [say(true, scopeWrong), `Overreaches twice: claims certainty, and ${scopeReason}.`],
      ];
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
        trap: "The most confident-sounding statements overreach: in scope (a different group) or in certainty (\"certain\").",
        hint: "Who could have been chosen for the sample, and how sure can the survey make you?",
        verify: () => {
          // Re-read the survey from the stem, then judge every statement.
          const stem = `${ctx.intro(n, p)} The margin of error for this estimate is ${m} percentage points.`;
          const estimate = Number(stem.match(/(\d+)% of them/)[1]);
          const margin = Number(stem.match(/is (\d+) percentage points/)[1]);
          const supported = (text) => {
            const bounds = text.match(/^It is plausible that between (\d+)% and (\d+)% of (.+) (?:would|eat|want|own|prefer)/);
            return Boolean(bounds) && Number(bounds[1]) === estimate - margin && Number(bounds[2]) === estimate + margin &&
              bounds[3] === ctx.pop;
          };
          return supported(key) && wrong.every(([text]) => !supported(text));
        },
      });
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
        if (form === "difference" && cx - cy < 2) return null;
        const stimulus = { type: "table", content: table(scene.head, scene.cats.map((cat, index) => [cat, scaled[index]])) };
        const est = (count) => count * mult;
        const principles = [
          "In a random sample, the fraction of the sample with a characteristic estimates the fraction of the population with it.",
          "Estimated number in the population = (count in sample ÷ sample size) × population size.",
        ];
        const ratioStep = `Each sampled ${scene.one} stands for ${fmt(N)} ÷ ${n} = ${fmt(mult)} in the population.`;
        const common = { stimulus, figure: null, principles, estimatedSeconds: 95 };
        const sampleCheck = () => {
          const rows = parseTable(stimulus.content).slice(1);
          return sum(rows.map((row) => parseNumber(row[1]))) === n;
        };
        // A best estimate is a whole number, so a mistake's result is rounded
        // as a student making it would round it.
        const whole = (value) => (value >= 1 ? fmt(Math.round(value)) : null);
        if (form === "one") {
          const key = est(cx);
          return packRanked(t, numeric, key, [
            [cx, `Gives the number in the sample, ${cx}, without scaling it up to the population.`],
            [N - key, `Estimates the ${scene.whole} ${scene.that || "that"} ${scene.doesNot(scene.cats[x])}, the rest of the population.`],
            [(N * cx) / (n - cx), `Divides by the ${n - cx} sampled that are not in the group instead of by the whole sample of ${n}.`],
            [(N * cx) / 100, `Treats the sample count, ${cx}, as a percent of the ${fmt(N)} ${scene.whole}.`],
            [est(cx) / 10, "Misplaces a decimal point when scaling the sample count up to the population."],
            [est(cx) * 10, "Misplaces a decimal point when scaling the sample count up to the population."],
            [N - cx, `Subtracts the sample count, ${cx}, from the population instead of scaling it up.`],
            [mult, `Gives the number of ${scene.whole.split(" ")[0]} each sampled ${scene.one} stands for, ${fmt(N)} ÷ ${n}, a step on the way.`],
          ], {
            ...common,
            stem: `${scene.intro(N, n)} Based on the sample, what is the best estimate of the number of ${scene.whole} ${scene.that || "that"} ${scene.does(scene.cats[x])}?`,
            explanation: `In the sample, ${cx} of ${n} ${scene.does(scene.cats[x])}, a fraction of ${frac(cx, n)}. Applied to all ${fmt(N)}: ${frac(cx, n)} × ${fmt(N)} = ${fmt(key)}.`,
            steps: [
              `Sample fraction: ${cx}/${n} = ${frac(cx, n)}.`,
              ratioStep,
              `Estimate: ${cx} × ${fmt(mult)} = ${fmt(key)}.`,
            ],
            trap: `${cx} is a count in the sample of ${n}; it must be scaled up to the population of ${fmt(N)}.`,
            hint: "What fraction of the sample is in the group?",
            verify: () => sampleCheck() && key * n === N * cx,
          }, { show: whole, places: 9 });
        }
        if (form === "difference") {
          const key = est(cx - cy);
          return packRanked(t, numeric, key, [
            [cx - cy, `Gives the difference in the sample, ${cx} ${MINUS} ${cy}, without scaling it up to the population.`],
            [est(cx), `Estimates only the ${scene.whole} ${scene.that || "that"} ${scene.does(scene.cats[x])}, without subtracting.`],
            [est(cx + cy), "Adds the two groups instead of finding how many more are in one."],
            [(N * (cx - cy)) / 100, `Treats the sample difference, ${cx - cy}, as a percent of ${fmt(N)}.`],
            [est(cy), `Estimates only the ${scene.whole} ${scene.that || "that"} ${scene.does(scene.cats[y])}.`],
            [est(cx - cy) * 10, "Misplaces a decimal point when scaling the difference up to the population."],
            [est(cx - cy) / 10, "Misplaces a decimal point when scaling the difference up to the population."],
            [(N * (cx - cy)) / (n - cx - cy), `Divides by the ${n - cx - cy} sampled in neither group instead of by the whole sample of ${n}.`],
          ], {
            ...common,
            stem: `${scene.intro(N, n)} Based on the sample, what is the best estimate of how many more of the ${scene.whole} ${scene.does(scene.cats[x])} than ${scene.does(scene.cats[y])}?`,
            explanation: `In the sample, ${cx} ${MINUS} ${cy} = ${cx - cy} more ${scene.does(scene.cats[x])}. Each sampled ${scene.one} stands for ${fmt(mult)} in the population, so the estimate is ${cx - cy} × ${fmt(mult)} = ${fmt(key)}.`,
            steps: [
              `Difference in the sample: ${cx} ${MINUS} ${cy} = ${cx - cy}.`,
              ratioStep,
              `Estimate: ${cx - cy} × ${fmt(mult)} = ${fmt(key)}.`,
            ],
            trap: `${cx - cy} is the difference in the sample of ${n}; the question is about all ${fmt(N)}.`,
            hint: `How many ${scene.whole.split(" ")[0]} does each one in the sample represent?`,
            verify: () => sampleCheck() && key * n === N * (cx - cy),
          }, { show: whole, places: 9 });
        }
        const key = est(cx + cy);
        return packRanked(t, numeric, key, [
          [cx + cy, `Gives the number in the sample, ${cx + cy}, without scaling it up to the population.`],
          [est(cx), `Estimates only the ${scene.whole} ${scene.that || "that"} ${scene.does(scene.cats[x])}.`],
          [N - key, `Estimates the ${scene.whole} in neither group, the rest of the population.`],
          [(N * (cx + cy)) / 100, `Treats the sample count, ${cx + cy}, as a percent of ${fmt(N)}.`],
          [est(Math.abs(cx - cy)), "Subtracts the two groups instead of combining them."],
          [est(cx + cy) / 10, "Misplaces a decimal point when scaling the sample count up to the population."],
          [est(cx + cy) * 10, "Misplaces a decimal point when scaling the sample count up to the population."],
          [N - (cx + cy), `Subtracts the sample count, ${cx + cy}, from the population instead of scaling it up.`],
          [est(cy), `Estimates only the ${scene.whole} ${scene.that || "that"} ${scene.does(scene.cats[y])}.`],
        ], {
          ...common,
          stem: `${scene.intro(N, n)} Based on the sample, what is the best estimate of the number of ${scene.whole} ${scene.that || "that"} either ${scene.does(scene.cats[x])} or ${scene.does(scene.cats[y])}?`,
          explanation: `In the sample, ${cx} + ${cy} = ${cx + cy} of ${n} are in one of the two groups, a fraction of ${frac(cx + cy, n)}. Applied to all ${fmt(N)}: ${fmt(key)}.`,
          steps: [
            `Count in the sample: ${cx} + ${cy} = ${cx + cy}.`,
            ratioStep,
            `Estimate: ${cx + cy} × ${fmt(mult)} = ${fmt(key)}.`,
          ],
          trap: `${cx + cy} is a count in the sample; each sampled ${scene.one} stands for ${fmt(mult)} in the population.`,
          hint: "What fraction of the sample is in either group?",
          verify: () => sampleCheck() && key * n === N * (cx + cy),
        }, { show: whole, places: 9 });
      });
    },
  };

  const sampleInference = {
    id: "sample-inference",
    domain: DOMAIN,
    skill: "Statistical inference",
    subskill: "margin of error",
    difficulty: "Medium",
    title: "What a sample and its margin of error support",
    recognize:
      "A random sample supports plausible values for the population it came from, within the margin of error in percentage " +
      "points; cause needs random assignment, generalizing needs random selection, and nothing is certain.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 2 },
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
      members: "adults", partAll: "All adults living in that neighborhood", popAll: "All adult residents of the city", wider: "All adults in the state",
      finding: (x) => `${x}% of the adults surveyed support building a new public pool`,
      random: (n) => `${n} adults chosen at random from a complete list of the city's residents`,
      convenience: (n) => `the first ${n} adults to enter the public library on a Monday morning`,
      volunteer: (m) => `the ${fmt(m)} adults who answered an invitation on the city's website`,
      subgroup: (n) => `${n} adults selected at random from the residents of one neighborhood`,
    },
    {
      who: "A principal", goal: "estimate the mean number of hours per week that the school's students spend on homework",
      popShort: "the school's students", place: "students in the library after classes", part: "students in the honors classes",
      members: "students", partAll: "All students taking honors classes", popAll: "All students at the school", wider: "All high school students in the state",
      finding: (x) => `the students surveyed spend a mean of ${num(x / 5)} hours per week on homework`,
      random: (n) => `${n} students chosen at random from the school's full enrollment list`,
      convenience: (n) => `the first ${n} students to arrive at the library after classes`,
      volunteer: (m) => `the ${fmt(m)} students who returned a survey left on a cafeteria table`,
      subgroup: (n) => `${n} students selected at random from the school's honors classes`,
    },
    {
      who: "A store manager", goal: "estimate the percent of the store's customers who would use a same-day delivery service",
      popShort: "the store's customers", place: "Saturday-morning shoppers", part: "customers living near the store",
      members: "customers", partAll: "All customers living within a mile", popAll: "All of the store's customers", wider: "All shoppers in the region",
      finding: (x) => `${x}% of the customers surveyed would use a same-day delivery service`,
      random: (n) => `${n} customers chosen at random from the store's complete customer list`,
      convenience: (n) => `the first ${n} customers to walk in after the store opens on Saturday`,
      volunteer: (m) => `the ${fmt(m)} customers responding to a pop-up message on the store's website`,
      subgroup: (n) => `${n} customers selected at random from those living within a mile`,
    },
    {
      who: "A park manager", goal: "estimate the percent of this season's visitors to the park who would pay for a guided tour",
      popShort: "this season's visitors to the park", place: "visitors at one entrance on one day", part: "annual pass holders",
      members: "visitors", partAll: "All annual pass holders", popAll: "All of this season's park visitors", wider: "All visitors to parks in the state",
      finding: (x) => `${x}% of the visitors surveyed would pay for a guided tour`,
      random: (n) => `${n} visitors chosen at random from all of this season's ticket buyers`,
      convenience: (n) => `the first ${n} visitors to arrive at the north entrance on a Sunday`,
      volunteer: (m) => `the ${fmt(m)} visitors mailing back a comment card handed out at the gates`,
      subgroup: (n) => `${n} visitors selected at random from this season's annual pass holders`,
    },
    {
      who: "A transit agency", goal: "estimate the percent of its riders who want later evening bus service",
      popShort: "the agency's riders", place: "riders at one downtown stop", part: "riders of one route",
      members: "riders", partAll: "All riders of that route", popAll: "All of the agency's riders", wider: "All bus riders in the country",
      finding: (x) => `${x}% of the riders surveyed want later evening bus service`,
      random: (n) => `${n} riders chosen at random from all registered fare-card holders`,
      convenience: (n) => `the first ${n} riders to board at the main downtown stop on a weekday`,
      volunteer: (m) => `the ${fmt(m)} riders responding to a post on the agency's social media page`,
      subgroup: (n) => `${n} riders selected at random from the fare-card holders on one route`,
    },
    {
      who: "A hospital", goal: "estimate the percent of its patients who are satisfied with how appointments are scheduled",
      popShort: "the hospital's patients", place: "patients in one waiting room on one afternoon", part: "patients of the children's clinic",
      members: "patients", partAll: "All children's clinic patients", popAll: "All of the hospital's patients", wider: "All hospital patients in the state",
      finding: (x) => `${x}% of the patients surveyed are satisfied with how appointments are scheduled`,
      random: (n) => `${n} patients chosen at random from the hospital's complete patient list`,
      convenience: (n) => `the first ${n} patients to check in at the main waiting room on a Monday`,
      volunteer: (m) => `the ${fmt(m)} patients responding to a survey link printed on their bills`,
      subgroup: (n) => `${n} patients selected at random from those seen at the children's clinic`,
    },
    {
      who: "A public library", goal: "estimate the mean number of books its cardholders borrow per month",
      popShort: "the library's cardholders", place: "cardholders at the library on one Saturday", part: "cardholders who are college students",
      members: "cardholders", partAll: "All cardholders in college", popAll: "All of the library's cardholders", wider: "All library users in the country",
      finding: (x) => `the cardholders surveyed borrow a mean of ${num(x / 10)} books per month`,
      random: (n) => `${n} cardholders chosen at random from a complete list of cardholders`,
      convenience: (n) => `the first ${n} cardholders to check out books on a Saturday morning`,
      volunteer: (m) => `the ${fmt(m)} cardholders responding to a poll on the library's website`,
      subgroup: (n) => `${n} cardholders selected at random from those who are college students`,
    },
    {
      who: "A streaming service", goal: "estimate the percent of its subscribers who would pay for an ad-free plan",
      popShort: "the service's subscribers", place: "subscribers who call the help line on one day", part: "subscribers who joined in the past month",
      members: "subscribers", partAll: "All subscribers who joined last month", popAll: "All of the service's subscribers", wider: "All people who stream videos",
      finding: (x) => `${x}% of the subscribers surveyed would pay for an ad-free plan`,
      random: (n) => `${n} subscribers chosen at random from the complete subscriber list`,
      convenience: (n) => `the first ${n} subscribers to call the help line on a Tuesday morning`,
      volunteer: (m) => `the ${fmt(m)} subscribers answering a pop-up question after an episode`,
      subgroup: (n) => `${n} subscribers selected at random from those who joined last month`,
    },
  ];

  const METHOD_WHY = {
    convenience: (scene) => `Not random: ${scene.place} are simply the easiest to reach and may differ from the rest of ${scene.popShort}.`,
    volunteer: () => "A larger sample does not fix bias: people who choose to respond may differ from those who do not.",
    subgroup: (scene) => `The selection is random, but only among ${scene.part}, who may differ from the rest of ${scene.popShort}.`,
  };

  // Reasons a result may not generalize, two wordings each, so no one
  // sentence recurs across items; `part` and `self` are both offered every
  // time, one as the key.
  const REASONS = {
    part: ["The sample came from only one part of the population.", "The survey could reach only one part of the population."],
    self: ["The people surveyed decided for themselves whether to respond.", "The respondents chose themselves by deciding to answer."],
    size: ["The sample was too small for a population of this size.", "The survey reached too few people for its results to be useful."],
    all: ["The survey did not include every member of the population.", "The survey left some members of the population out."],
    percent: ["The results were reported as a percent, not as a count.", "The survey asked each person only a single question."],
  };

  // Sample sizes for the four methods, all different, so no choice shares
  // its number with another.
  function methodSizes(t) {
    const sizes = t.sample(range(4, 25).map((k) => 20 * k), 3);
    return { n: sizes, m: 100 * t.int(8, 30) };
  }

  function methodChoiceItem(t) {
    const scene = t.pick(SAMPLING_SCENES);
    const { n, m } = methodSizes(t);
    const size = { random: n[0], convenience: n[1], subgroup: n[2], volunteer: m };
    // Half the time the one-part method is worded like the random one, so
    // wording alone never singles out the key.
    const mirror = t.chance(0.5);
    const say = (method) => (method === "subgroup" && mirror
      ? `Surveying ${size.subgroup} ${scene.members} chosen at random from a list of ${scene.part} only`
      : `Surveying ${scene[method](size[method])}`);
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
      trap: `The ${fmt(m)} volunteers outnumber the ${n[0]} people in the random sample, but who is chosen matters more than how many.`,
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
    const { n, m } = methodSizes(t);
    const size = method === "volunteer" ? m : n[0];
    const facts = METHOD_FACTS[method];
    const keyName = facts.self ? "self" : "part";
    const otherName = facts.self ? "part" : "self";
    const described = scene[method](size);
    const word = (name) => t.pick(REASONS[name]);
    const why = {
      self: "Misdescribes this survey: chance, not the people themselves, decided who among those eligible was surveyed.",
      part: `Misdescribes this survey: anyone among ${scene.popShort} could have responded; the trouble is that they chose themselves.`,
      size: `A well-chosen sample of ${fmt(size)} can represent a large population; the trouble is how these people were chosen.`,
      all: "A sample never includes everyone; that is what makes it a sample, and a good one still gives a useful estimate.",
      percent: "Nothing about how the results were reported biases them; the way the sample was chosen does.",
    };
    const extras = t.sample(["size", "all", "percent"], 2);
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure: null,
      stem:
        `${scene.who} wanted to ${scene.goal}, so ${described} were surveyed. Which of the following is the best reason the ` +
        `results may not be a good estimate for all of ${scene.popShort}?`,
      correct: word(keyName),
      wrong: [otherName, ...extras].map((name) => [word(name), why[name]]),
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
        return expected === keyName && size >= 80;
      },
    };
  }

  // To which group does a random sample's result extend? Exactly the group
  // it was drawn from at random: not only the people surveyed, not a wider one.
  function methodScopeItem(t) {
    const scene = t.pick(SAMPLING_SCENES);
    const fromPart = t.chance(0.5);
    const { n } = methodSizes(t);
    const x = t.int(18, 82);
    const surveyed = `Only the ${n[0]} ${scene.members} who were surveyed`;
    const choices = { surveyed, part: scene.partAll, pop: scene.popAll, wider: scene.wider };
    const keyName = fromPart ? "part" : "pop";
    const why = {
      surveyed: "Too narrow: a random sample stands for the whole group it was drawn from, not only the people who happened to be chosen.",
      part: `Too narrow: the sample was drawn at random from all of ${scene.popShort}, not only ${scene.part}.`,
      pop: `Too broad: only ${scene.part} could have been chosen, and they may differ from the rest of ${scene.popShort}.`,
      wider: `Too broad: no one outside ${fromPart ? scene.part : scene.popShort} could have been chosen.`,
    };
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure: null,
      stem:
        `${scene.who} surveyed ${scene[fromPart ? "subgroup" : "random"](n[0])} and found that ${scene.finding(x)}. ` +
        "To which of the following groups can the results of this survey most appropriately be generalized?",
      correct: choices[keyName],
      wrong: Object.keys(choices).filter((name) => name !== keyName).map((name) => [choices[name], why[name]]),
      explanation:
        `The ${scene.members} were chosen at random from ${fromPart ? scene.part : `all of ${scene.popShort}`}, so the results extend to ` +
        `that group and no further: ${choices[keyName].charAt(0).toLowerCase()}${choices[keyName].slice(1)}.`,
      steps: [
        `Find the group the sample was chosen from at random: ${fromPart ? scene.part : `all of ${scene.popShort}`}.`,
        "A random sample represents the whole of that group, not only the people chosen.",
        "It says nothing certain about people who could not have been chosen.",
      ],
      principles: [
        "Results from a random sample generalize to the population the sample was drawn from, and only to it.",
        "The people surveyed stand in for everyone who could have been chosen.",
      ],
      trap: "The group that sounds most useful is often wider than the group the sample was drawn from.",
      hint: "Who could have been chosen for this sample?",
      estimatedSeconds: 55,
      verify: () => {
        const facts = METHOD_FACTS[fromPart ? "subgroup" : "random"];
        return facts.random && facts.whole === !fromPart && choices[keyName] === (fromPart ? scene.partAll : scene.popAll);
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
      const roll = t.random();
      if (roll < 0.4) return methodChoiceItem(t);
      return roll < 0.7 ? methodFlawItem(t) : methodScopeItem(t);
    },
  };

  /* ================================= margin-and-sample-size (Easy) */

  // Percent scenes derive the margin from the estimate and the sample size;
  // mean scenes (in tenths) from a typical standard deviation `sd`.
  const MARGIN_SCENES = [
    {
      members: "students", popShort: "the students at a large university", kind: "percent",
      stat: "the percent of students who use the campus gym at least once a week", unit: "%", values: [18, 72],
      statAll: "the percent of all the university's students who use the campus gym at least once a week",
    },
    {
      members: "adults", popShort: "the adults in a state", kind: "percent",
      stat: "the percent of adults who have a public library card", unit: "%", values: [30, 70],
      statAll: "the percent of all adults in the state who have a public library card",
    },
    {
      members: "employees", popShort: "the employees of a large company", kind: "mean",
      stat: "the mean one-way commute time, in minutes, of the company's employees", unit: " minutes", unitOne: " minute", values: [180, 420], sd: 150, scale: 10,
      statAll: "the mean one-way commute time, in minutes, of all the company's employees",
    },
    {
      members: "households", popShort: "the households in a city", kind: "mean",
      stat: "the mean number of hours per week that each household's television is on", unit: " hours", unitOne: " hour", values: [150, 350], sd: 100, scale: 10,
      statAll: "the mean number of hours per week that the television is on, for all households in the city",
    },
    {
      members: "trees", popShort: "the pine trees in a forest", kind: "mean",
      stat: "the mean height, in feet, of the pine trees in the forest", unit: " feet", unitOne: " foot", values: [450, 800], sd: 80, scale: 10,
      statAll: "the mean height, in feet, of all the pine trees in the forest",
    },
  ];

  function sizeItem(t) {
    const scene = t.pick(MARGIN_SCENES);
    const [small, big] = retry(() => {
      const pair = t.sample([100, 150, 200, 300, 400, 500, 800, 1000, 1200, 1500], 2).sort((a, b) => a - b);
      return pair[1] >= 2 * pair[0] ? pair : null;
    });
    const firstBig = t.chance(0.5);
    const [n1, n2] = firstBig ? [big, small] : [small, big];
    const statWord = scene.kind === "percent" ? "percent" : "mean";
    const say = {
      key: `The estimate from the sample of ${fmt(big)} ${scene.members} likely has the smaller margin of error.`,
      reversed: `The estimate from the sample of ${fmt(small)} ${scene.members} likely has the smaller margin of error.`,
      equal: "The two estimates likely have equal margins of error, since both samples come from the same population.",
      certain: `Neither estimate has a margin of error, since both samples were chosen at random from the ${scene.members}.`,
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
        [say.certain, `Random selection makes an estimate fair, not exact; every sample ${statWord} has a margin of error.`],
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
    return retry(() => {
      const est = t.int(scene.values[0], scene.values[1]);
      const n = t.pick([150, 200, 250, 300, 400, 500, 600]);
      const margin = scene.kind === "percent" ? percentMargin(est, n) : Math.round((1.96 * scene.sd) / Math.sqrt(n));
      if (margin < 3) return null;
      const text = (value) => (value > 0 ? `${num(tidy(value / scale))}${scene.kind === "percent" ? "%" : ""}` : null);
      const estimateText = `${num(est / scale)}${scene.unit}`;
      const marginText = scene.kind === "percent" ? `${margin} percentage points` : `${num(margin / scale)}${margin === scale ? scene.unitOne : scene.unit}`;
      const intro =
        `A random sample of ${n} of ${scene.popShort} was used to estimate ${scene.stat}. The estimate was ${estimateText}, ` +
        `with a margin of error of ${marginText}.`;
      const principles = [
        "An estimate with a margin of error gives a range of plausible values: the estimate minus the margin to the estimate plus the margin.",
        "Values outside that range are not plausible for the population, based on the sample.",
      ];
      if (numeric) {
        const greatest = t.chance(0.5);
        const key = tidy((est + (greatest ? margin : -margin)) / scale);
        return {
          responseType: "numeric",
          stimulus: null,
          figure: null,
          stem: `${intro} Based on these results, what is the ${greatest ? "greatest" : "least"} plausible value for ${scene.statAll}?`,
          correct: key,
          explanation: `The plausible values run from ${text(est - margin)} to ${text(est + margin)}, so the ${greatest ? "greatest" : "least"} is ${num(key)}.`,
          steps: [
            `Plausible range: ${estimateText} ${MINUS} ${marginText} to ${estimateText} + ${marginText}.`,
            `That is ${text(est - margin)} to ${text(est + margin)}.`,
            `The ${greatest ? "greatest" : "least"} plausible value is ${num(key)}.`,
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
      const k = () => t.int(1, Math.max(1, Math.round(margin / 2)));
      const outside = "Lies outside the plausible range, more than the margin of error from the estimate.";
      const item = packRanked(t, false, inside, [
        [est + margin + k(), `${outside} It is just above ${text(est + margin)}.`],
        [est - margin - k(), `${outside} It is just below ${text(est - margin)}.`],
        [est + 2 * margin, "Moves twice the margin of error above the estimate, outside the plausible range."],
        [est - 2 * margin, "Moves twice the margin of error below the estimate, outside the plausible range."],
        [est + margin + margin / 2 + k(), `${outside} It is above ${text(est + margin)}.`],
        [est - margin - margin / 2 - k(), `${outside} It is below ${text(est - margin)}.`],
        [margin, "Gives the margin of error itself, which is a distance, not a value of the statistic."],
      ], {
        stimulus: null,
        figure: null,
        stem: `${intro} Which of the following is a plausible value for ${scene.statAll}?`,
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
      }, { show: text, places: 9 });
      if (!item) return null;
      return {
        ...item,
        verify: () => {
          const numbers = intro.match(/estimate was ([\d.]+)[^,]*, with a margin of error of ([\d.]+)/);
          const center = Number(numbers[1]);
          const width = Number(numbers[2]);
          const within = (choice) => Math.abs(parseFloat(choice) - center) <= width + 1e-9;
          return within(item.correct) && item.wrong.every(([choice]) => !within(choice));
        },
      };
    });
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
      second: (C) => `Later, the officers photographed ${C} different deer with trail cameras`, marked: "collared", unmarked: "uncollared",
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
          [M + C - R, `Counts the different ${scene.animals} seen in the two samples instead of estimating the whole population.`],
          [N - M, `Estimates only the ${scene.unmarked} ${scene.animals}, leaving out the ${M} that were ${scene.marked}.`],
          [(M * C) / (C - R), `Divides by the ${C - R} ${scene.unmarked} ${scene.animals} in the second sample instead of the ${R} ${scene.marked} ones.`],
          [(M * R) / C, "Sets up the proportion upside down."],
          [M * C, `Multiplies ${M} by ${C} without dividing by the ${R} that were ${scene.marked}.`],
          [N + M, `Adds the ${M} ${scene.marked} ${scene.animals} to the estimate as if they were not already counted in it.`],
          [N + C, `Adds the ${C} ${scene.animals} in the second sample to the estimate as if they were not already counted in it.`],
        ]
        : [
          [N, `Gives the estimate of all the ${scene.animals}, a step on the way; ${M} of them are ${scene.marked}.`],
          [C - R, `Gives the number of ${scene.unmarked} ${scene.animals} in the second sample, without scaling it up.`],
          [N - R, `Subtracts the ${R} ${scene.marked} ${scene.animals} in the second sample instead of all ${M} ${scene.marked}.`],
          [N - C, `Subtracts the second sample of ${C}.`],
          [(M * (C - R)) / C, `Scales the ${scene.unmarked} share of the second sample, ${C - R}/${C}, by the ${M} ${scene.marked} ${scene.animals} instead of by the whole population.`],
        ];
      const setup = `${M}/N = ${asPercent ? `${num(tidy(pct))}/100` : `${R}/${C}`}`;
      // A best estimate is a whole number, so a mistake's result is rounded
      // as a student making it would round it.
      const whole = (value) => (value >= 1 ? fmt(Math.round(value)) : null);
      return packRanked(t, numeric, key, candidates, {
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
      }, { show: whole, places: 9 });
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

  // Percent scenes derive each margin from the sample percent and size; mean
  // scenes from a typical standard deviation (in tenths) and the size, so a
  // larger sample never carries an unexplained larger margin.
  const COMPARE_SCENES = [
    {
      kind: "percent", groups: ["School A", "School B"], sizes: [150, 200, 250, 300, 400, 500],
      intro: (n1, n2) => `A researcher surveyed a random sample of ${n1} students at School A and a separate random sample of ${n2} students at School B, asking whether they walk to school.`,
      estimate: (g, v, m) => `At ${g}, ${v}% of the students surveyed walk to school, with a margin of error of ${m} percentage points`,
      same: "It is plausible that the same percent of students at School A and at School B walk to school.",
      greater: (hi, lo) => `It is likely that a greater percent of students at ${hi} than at ${lo} walk to school.`,
      definite: (hi, lo) => `The percent of all students at ${hi} who walk to school is greater than the percent at ${lo}.`,
      exact: (hi, lo, d) => `It is certain that the percent at ${hi} is exactly ${S.plural(Number(d), "percentage point")} greater than at ${lo}.`,
    },
    {
      kind: "percent", groups: ["Easton", "Westfield"], sizes: [300, 400, 500, 600, 800, 1000],
      intro: (n1, n2) => `A polling firm surveyed a random sample of ${fmt(n1)} residents of Easton and a separate random sample of ${fmt(n2)} residents of Westfield about a proposed bike lane.`,
      estimate: (g, v, m) => `In ${g}, ${v}% of those surveyed support the bike lane, with a margin of error of ${m} percentage points`,
      same: "It is plausible that the same percent of residents in Easton and in Westfield support the bike lane.",
      greater: (hi, lo) => `It is likely that a greater percent of residents in ${hi} than in ${lo} support the bike lane.`,
      definite: (hi, lo) => `The percent of all residents of ${hi} who support the bike lane is greater than the percent in ${lo}.`,
      exact: (hi, lo, d) => `It is certain that support in ${hi} is exactly ${S.plural(Number(d), "percentage point")} higher than in ${lo}.`,
    },
    {
      kind: "percent", groups: ["the Main Street store", "the Oak Street store"], sizes: [150, 200, 250, 300, 400],
      intro: (n1, n2) => `A bakery surveyed a random sample of ${n1} customers at its Main Street store and a separate random sample of ${n2} customers at its Oak Street store.`,
      estimate: (g, v, m) => `At ${g}, ${v}% of the customers surveyed were satisfied, with a margin of error of ${m} percentage points`,
      same: "It is plausible that the same percent of customers at the Main Street and Oak Street stores are satisfied.",
      greater: (hi, lo) => `It is likely that a greater percent of customers at ${hi} than at ${lo} are satisfied.`,
      definite: (hi, lo) => `The percent of all customers at ${hi} who are satisfied is greater than the percent at ${lo}.`,
      exact: (hi, lo, d) => `It is certain that satisfaction at ${hi} is exactly ${S.plural(Number(d), "percentage point")} higher than at ${lo}.`,
    },
    {
      kind: "mean", groups: ["Office P", "Office Q"], unit: "minute", base: [180, 320], sd: 120, gapMax: 64, sizes: [60, 80, 100, 120, 150, 200],
      intro: (n1, n2) => `A company recorded the one-way commute times of a random sample of ${n1} employees at Office P and a separate random sample of ${n2} employees at Office Q.`,
      estimate: (g, v, m) => `For ${g}, the mean commute time in the sample was ${v} minutes, with a margin of error of ${m} minutes`,
      same: "It is plausible that the mean commute times of all employees at Office P and Office Q are equal.",
      greater: (hi, lo) => `It is likely that the mean commute time of all employees at ${hi} is greater than at ${lo}.`,
      definite: (hi, lo) => `The mean commute time of all employees at ${hi} is greater than the mean at ${lo}.`,
      exact: (hi, lo, d) => `It is certain that the mean commute at ${hi} is exactly ${S.plural(Number(d), "minute")} longer than at ${lo}.`,
    },
    {
      kind: "mean", groups: ["the 9th graders", "the 12th graders"], unit: "hour", base: [60, 75], sd: 11, gapMax: 9, sizes: [40, 50, 60, 80, 100, 120],
      intro: (n1, n2) => `A school nurse asked a random sample of ${n1} of the school's 9th graders and a separate random sample of ${n2} of its 12th graders how many hours they slept the night before.`,
      estimate: (g, v, m) => `For ${g}, the sample mean was ${v} hours, with a margin of error of ${m} hours`,
      same: "It is plausible that the mean hours of sleep of all 9th graders and all 12th graders at the school are equal.",
      greater: (hi, lo) => `It is likely that the mean hours of sleep of all ${hi.replace("the ", "")} at the school is greater than that of all ${lo.replace("the ", "")}.`,
      definite: (hi, lo) => `The mean hours of sleep of all ${hi.replace("the ", "")} at the school is greater than that of all ${lo.replace("the ", "")}.`,
      exact: (hi, lo, d) => `It is certain that ${hi} at the school sleep exactly ${S.plural(Number(d), "hour")} more, on average, than ${lo}.`,
    },
  ];

  function compareItem(t) {
    const scene = t.pick(COMPARE_SCENES);
    const overlap = t.chance(0.5);
    // Overlapping items mostly put the gap between the two margins: one
    // estimate lies outside the other's narrow range, yet the ranges share values.
    const subtle = t.chance(0.7);
    return retry(() => {
      // Work in tenths for means, whole points for percents.
      const scale = scene.kind === "mean" ? 10 : 1;
      const [n1, n2] = [t.pick(scene.sizes), t.pick(scene.sizes)];
      const low = scene.kind === "mean" ? t.int(scene.base[0], scene.base[1]) : t.int(20, 70);
      // Up to a little past the widest pair of margins the scene can produce.
      const gap = t.int(1, scene.gapMax || 18);
      const high = low + gap;
      if (scene.kind === "percent" && high > 85) return null;
      const hiIndex = t.int(0, 1);
      const values = hiIndex === 0 ? [high, low] : [low, high];
      const margins = values.map((v, g) => (scene.kind === "mean"
        ? Math.round((1.96 * scene.sd) / Math.sqrt([n1, n2][g]))
        : percentMargin(v, [n1, n2][g])));
      const [small, big] = margins.slice().sort((a, b) => a - b);
      if (overlap) {
        if (gap >= big) return null;
        if (subtle && big - small >= 2 && !(gap > small)) return null;
      } else if (gap <= small + big || gap > small + big + Math.max(3, Math.round(big / 2))) return null;
      const show = (value) => num(value / scale);
      const [hi, lo] = hiIndex === 0 ? scene.groups : [scene.groups[1], scene.groups[0]];
      const d = show(gap);
      const statements = {
        same: scene.same,
        greater: scene.greater(hi, lo),
        reversed: scene.greater(lo, hi),
        definite: scene.definite(hi, lo),
        definiteReversed: scene.definite(lo, hi),
        exact: scene.exact(hi, lo, d),
      };
      const keyName = overlap ? "same" : "greater";
      const lines = [0, 1].map((g) => scene.estimate(scene.groups[g], show(values[g]), show(margins[g])));
      const stem = `${scene.intro(n1, n2)} ${lines[0]}. ${lines[1]}. Which of the following conclusions is best supported by these results?`;
      const ranges = [0, 1].map((g) => `${show(values[g] - margins[g])} to ${show(values[g] + margins[g])}`);
      const reasons = {
        same: `The plausible ranges, ${ranges[0]} and ${ranges[1]}, do not overlap, so equal values are not plausible.`,
        reversed: `Reverses the comparison: the estimate for ${hi} is the greater one.`,
        definite: `The plausible ranges, ${ranges[0]} and ${ranges[1]}, overlap, so the data do not show a difference; the gap between the samples could be due to chance.`,
        definiteReversed: `Reverses the comparison, and states as fact what a sample can only make likely.`,
        exact: `The difference between the samples, ${d}, is only an estimate; the margins of error rule out certainty.`,
      };
      const wrongNames = overlap
        ? ["definite", "reversed", "exact"]
        : ["same", "reversed", t.pick(["exact", "definiteReversed"])];
      return {
        responseType: "multiple-choice",
        stimulus: null,
        figure: null,
        stem,
        correct: statements[keyName],
        wrong: wrongNames.map((name) => [statements[name], reasons[name]]),
        explanation:
          `Each estimate plus or minus its margin gives the plausible values: ${ranges[0]} for ${scene.groups[0]} and ${ranges[1]} for ` +
          `${scene.groups[1]}. ${overlap
            ? `The ranges overlap (${show(high - margins[hiIndex])} is below ${show(low + margins[1 - hiIndex])}), so a common value is plausible for both, even though the sample estimates differ by ${d}.`
            : `The ranges do not overlap (${show(high - margins[hiIndex])} is above ${show(low + margins[1 - hiIndex])}), so the value for ${hi} is likely greater than for ${lo}, though not certainly and not by an exact amount.`}`,
        steps: [
          `Plausible values for ${scene.groups[0]}: ${ranges[0]}.`,
          `Plausible values for ${scene.groups[1]}: ${ranges[1]}.`,
          overlap
            ? "The ranges overlap, so equal values are plausible; the data do not show a difference."
            : `The ranges do not overlap, so a difference is likely, with ${hi} greater.`,
        ],
        principles: [
          "An estimate with a margin of error gives a range of plausible values for the population.",
          "When two groups' plausible ranges overlap, the groups may have the same value; when they do not, a difference is likely but not certain.",
        ],
        trap: overlap
          ? `The estimate for ${lo} may fall outside ${hi}'s range, but the question is whether the two ranges share any values; they do.`
          : "A difference supported by the data is still an estimate: likely, not certain, and not exact.",
        hint: "Write each estimate as a range. Do the ranges share any values?",
        estimatedSeconds: 115,
        verify: () => {
          const found = [...stem.matchAll(/ ([\d.]+)(?:%| minutes| hours)[^.]*?margin of error of ([\d.]+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
          if (found.length !== 2) return false;
          const [[a, ea], [b, eb]] = found;
          const diff = Math.abs(a - b);
          // Only clear cases: overlapping ranges with the gap under the larger
          // margin (not significant), or separate ranges (significant).
          const overlaps = diff <= Math.max(ea, eb) - 1e-9;
          const separate = diff > ea + eb + 1e-9;
          if (!overlaps && !separate) return false;
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

  /* ================================= interval-mean-scope (Hard) */

  // A margin of error for a mean describes the population mean, not the
  // individual values, which the sample's range shows vary far more. Values
  // are integers in 1/scale units: `center` bounds the sample mean and
  // `below`/`above` the sample's range around it. The margin of error follows
  // from a standard deviation consistent with that range (about range ÷ 4.6
  // for samples of this size) and the sample size, so the interval is always
  // far narrower than the individual values. `total` scenes also ask about a
  // total.
  const MEAN_SCENES = [
    {
      scale: 100, center: [496, 504], below: [8, 14], above: [8, 14], sizes: [40, 50, 60, 80], pops: [1200, 1600, 2000, 2400],
      intro: (n, N) => `A quality inspector selected a random sample of ${n} of the ${fmt(N)} bags of flour that a mill packed last week and weighed each one.`,
      sample: (m, lo, hi) => `The mean weight of the bags in the sample was ${m} pounds, and their weights ranged from ${lo} to ${hi} pounds.`,
      margin: (E) => `The margin of error for estimating the mean weight of all the bags the mill packed last week is ${E} pounds.`,
      mean: { pop: "the mean weight of all the bags the mill packed last week is", wider: "the mean weight of all bags of flour sold in the state is" },
      most: { pop: "most of the individual bags the mill packed last week weigh", wider: "most individual bags of flour sold in the state weigh" },
      unit: "pounds", ones: "bags", total: "total weight, in pounds, of all the bags the mill packed last week",
    },
    {
      scale: 100, center: [101, 103], below: [5, 8], above: [5, 8], sizes: [40, 50, 60], pops: [1500, 2000, 2500, 3000],
      intro: (n, N) => `A juice plant filled ${fmt(N)} cartons on Monday. An inspector measured the volume of juice in a random sample of ${n} of these cartons.`,
      sample: (m, lo, hi) => `The mean volume in the sample was ${m} liters, and the volumes ranged from ${lo} to ${hi} liters.`,
      margin: (E) => `The margin of error for estimating the mean volume of juice in all the cartons filled on Monday is ${E} liter.`,
      mean: { pop: "the mean volume of juice in all the cartons filled on Monday is", wider: "the mean volume of juice in all cartons sold in the country is" },
      most: { pop: "most of the individual cartons filled on Monday each contain", wider: "most individual juice cartons sold in the country contain" },
      unit: "liters", ones: "cartons", total: "total volume, in liters, of juice in all the cartons filled on Monday",
    },
    {
      scale: 10, center: [1050, 1300], below: [400, 650], above: [400, 650], sizes: [20, 25, 30], pops: [60, 80, 90, 120],
      intro: (n, N) => `A delivery company has ${N} vans. On one day, the company recorded the distance driven by a random sample of ${n} of the vans.`,
      sample: (m, lo, hi) => `The mean distance for the sample was ${m} miles, and the distances ranged from ${lo} to ${hi} miles.`,
      margin: (E) => `The margin of error for estimating the mean distance driven that day by all the company's vans is ${E} miles.`,
      mean: { pop: "the mean distance that all the company's vans drove that day is", wider: "the mean distance that all delivery vans in the city drove that day is" },
      most: { pop: "most of the individual vans in the company's fleet drove that day", wider: "most of the individual delivery vans in the city drove that day" },
      unit: "miles", ones: "vans", total: "total distance, in miles, driven that day by all the company's vans",
    },
    {
      scale: 10, center: [150, 180], below: [25, 40], above: [25, 40], sizes: [40, 50, 60],
      intro: (n) => `A lab tested the battery life of a random sample of ${n} phones of one model.`,
      sample: (m, lo, hi) => `The mean battery life in the sample was ${m} hours, and the battery lives ranged from ${lo} to ${hi} hours.`,
      margin: (E) => `The margin of error for estimating the mean battery life of all phones of this model is ${E} hours.`,
      mean: { pop: "the mean battery life of all phones of this model is", wider: "the mean battery life of all phones the company makes is" },
      most: { pop: "most individual phones of this model have a battery life", wider: "most individual phones the company makes have a battery life" },
      unit: "hours", ones: "phones",
    },
    {
      scale: 10, center: [65, 75], below: [18, 26], above: [16, 24], sizes: [100, 120, 150, 200],
      intro: (n) => `A school nurse asked a random sample of ${n} students at a large high school how many hours they slept the night before.`,
      sample: (m, lo, hi) => `The mean for the sample was ${m} hours, and the students' answers ranged from ${lo} to ${hi} hours.`,
      margin: (E) => `The margin of error for estimating the mean sleep time of all the school's students that night is ${E} hours.`,
      mean: { pop: "the mean sleep time of all the school's students that night is", wider: "the mean sleep time of all high school students in the state that night is" },
      most: { pop: "most of the school's individual students slept that night for", wider: "most individual high school students in the state slept that night for" },
      unit: "hours", ones: "students",
    },
    {
      scale: 10, center: [220, 320], below: [150, 190], above: [300, 450], sizes: [60, 80, 100, 120],
      intro: (n) => `A company surveyed a random sample of ${n} of its employees about the length of their one-way commutes.`,
      sample: (m, lo, hi) => `The mean commute time in the sample was ${m} minutes, and the commute times ranged from ${lo} to ${hi} minutes.`,
      margin: (E) => `The margin of error for estimating the mean commute time of all the company's employees is ${E} minutes.`,
      mean: { pop: "the mean commute time of all the company's employees is", wider: "the mean commute time of all workers in the city is" },
      most: { pop: "most individual employees of the company have commute times", wider: "most individual workers in the city have commute times" },
      unit: "minutes", ones: "employees",
    },
  ];

  function meanScopeConclusion(t, scene, n, N, m, E, lo, hi, show) {
    // Two ways to overreach crossed with each other (see inferenceConclusion).
    const axis = t.pick(["sure", "scope"]);
    const low = show(m - E);
    const high = show(m + E);
    const say = (kind, sure, scope) =>
      `It is ${sure ? "guaranteed" : "plausible"} that ${scene[kind][scope]} between ${low} and ${high} ${scene.unit}.`;
    const key = say("mean", false, "pop");
    const individuals = `Applies the interval to individual ${scene.ones}: it estimates their mean, and the sample's values, from ${show(lo)} to ${show(hi)}, show that individual ${scene.ones} vary far more.`;
    const wrong = axis === "sure"
      ? [
        [say("most", false, "pop"), individuals],
        [say("mean", true, "pop"), "A margin of error gives plausible values for the mean, not a guarantee; the true mean could lie outside it."],
        [say("most", true, "pop"), `Applies the interval to individual ${scene.ones}, and claims certainty besides.`],
      ]
      : [
        [say("most", false, "pop"), individuals],
        [say("mean", false, "wider"), "Extends the result beyond the group the sample was drawn from at random."],
        [say("most", false, "wider"), `Applies the interval to individual ${scene.ones}, and extends it beyond the group sampled.`],
      ];
    const stem = `${scene.intro(n, N)} ${scene.sample(show(m), show(lo), show(hi))} ${scene.margin(show(E))} ` +
      "Which of the following is the most appropriate conclusion based on these results?";
    return {
      responseType: "multiple-choice",
      stimulus: null,
      figure: null,
      stem,
      correct: key,
      wrong,
      explanation:
        `The margin of error describes how precisely the sample mean estimates the population mean, so the plausible values for ` +
        `that mean are ${show(m)} ± ${show(E)}, from ${low} to ${high}. It says nothing about most individual ${scene.ones}: the ` +
        `sample's own values run from ${show(lo)} to ${show(hi)}, far wider than the interval.`,
      steps: [
        `Plausible values for the population mean: ${show(m)} ${MINUS} ${show(E)} = ${low} to ${show(m)} + ${show(E)} = ${high}.`,
        `The interval is about the mean of the population sampled, not about individual ${scene.ones}, whose values vary from ${show(lo)} to ${show(hi)} in the sample alone.`,
        "It gives plausible values, not certain ones, and only for the group the sample was drawn from.",
      ],
      principles: [
        "A margin of error for a sample mean gives plausible values for the population mean, not a range for individual values.",
        "Individual values vary much more than a sample mean does; the larger the sample, the narrower the interval for the mean.",
      ],
      trap: `The interval ${low} to ${high} looks like a range of values, but it is a range for the mean; individual ${scene.ones} in the sample alone ran from ${show(lo)} to ${show(hi)}.`,
      hint: "Is the margin of error about individual values or about something else?",
      estimatedSeconds: 110,
      verify: () => {
        const numbers = stem.replace(/,(\d{3})/g, "$1").match(/sample was ([\d.]+) .*ranged from ([\d.]+) to ([\d.]+) .*? is ([\d.]+) \w+\. Which/);
        if (!numbers) return false;
        const [center, , , width] = numbers.slice(1).map(Number);
        const right = (text) => text.startsWith("It is plausible that ") && text.includes(scene.mean.pop) &&
          text.includes(`between ${num(tidy(center - width))} and ${num(tidy(center + width))} `);
        return right(key) && wrong.every(([text]) => !right(text));
      },
    };
  }

  function meanScopeTotal(t, scene, n, N, m, E, lo, hi, show, numeric) {
    const greatest = t.chance(0.5);
    const sign = greatest ? 1 : -1;
    // Totals in the scene's units, from integer values in 1/scale units.
    const total = (value) => tidy((N * value) / scene.scale);
    const key = total(m + sign * E);
    const stem = `${scene.intro(n, N)} ${scene.sample(show(m), show(lo), show(hi))} ${scene.margin(show(E))} ` +
      `Based on these results, what is the ${greatest ? "greatest" : "least"} plausible value for the ${scene.total}?`;
    const text = (value) => (value > 0 ? fmt(tidy(value)) : null);
    const fields = {
      stimulus: null,
      figure: null,
      stem,
      explanation:
        `The plausible values for the mean are ${show(m)} ± ${show(E)}, from ${show(m - E)} to ${show(m + E)} ${scene.unit} per ` +
        `${scene.ones.replace(/s$/, "")}. The total for all ${fmt(N)} ${scene.ones} is ${fmt(N)} times the mean, so its ${greatest ? "greatest" : "least"} ` +
        `plausible value is ${fmt(N)} × ${show(m + sign * E)} = ${fmt(key)}.`,
      steps: [
        `Plausible mean: ${show(m)} ${greatest ? "+" : MINUS} ${show(E)} = ${show(m + sign * E)} at the ${greatest ? "top" : "bottom"} of the range.`,
        `The total is the number of ${scene.ones} times their mean: ${fmt(N)} × ${show(m + sign * E)}.`,
        `${fmt(N)} × ${show(m + sign * E)} = ${fmt(key)}.`,
      ],
      principles: [
        "A margin of error for a sample mean gives plausible values for the population mean.",
        "A total over a population is its size times its mean, so the whole interval for the mean scales by the size.",
      ],
      trap: `Adding the margin of error, ${show(E)}, to the estimated total treats it as a margin for the total; it is a margin for the mean of each ${scene.ones.replace(/s$/, "")}, so it scales by ${fmt(N)} too.`,
      hint: "What is the total in terms of the mean, and what range of means is plausible?",
      estimatedSeconds: 120,
    };
    const item = packRanked(t, numeric, key, [
      [total(m) + sign * E / scene.scale, `Adds the margin of error, ${show(E)}, to the estimated total once instead of scaling it by the ${fmt(N)} ${scene.ones}.`],
      [total(m), `Gives the estimated total, ${fmt(total(m))}, ignoring the margin of error.`],
      [total(greatest ? hi : lo), `Uses the ${greatest ? "largest" : "smallest"} value in the sample, ${show(greatest ? hi : lo)}, as if every ${scene.ones.replace(/s$/, "")} matched it; the interval for the mean is much narrower.`],
      [total(m + 2 * sign * E), "Moves twice the margin of error from the estimate."],
      [total(m - sign * E), `Gives the ${greatest ? "least" : "greatest"} plausible total instead.`],
      [tidy((n * (m + sign * E)) / scene.scale), `Multiplies by the ${n} ${scene.ones} in the sample instead of all ${fmt(N)}.`],
    ], fields, { show: text, places: 9 });
    if (!item) return null;
    return {
      ...item,
      verify: () => {
        const clean = stem.replace(/,(\d{3})/g, "$1");
        const size = Number(clean.match(/(?:of the|filled|has) (\d+) /)[1]);
        const [center, width] = [Number(clean.match(/(?:sample was|for the sample was) ([\d.]+)/)[1]), Number(clean.match(/ is ([\d.]+) \w+\. Based/)[1])];
        return close(size * (center + sign * width), key, 1e-9) &&
          (numeric || item.wrong.every(([choice]) => !close(parseNumber(choice), key, 1e-9)));
      },
    };
  }

  const intervalMeanScope = {
    id: "interval-mean-scope",
    domain: DATA,
    skill: "Statistical inference",
    subskill: "margin of error",
    difficulty: "Hard",
    title: "What a margin of error for a mean describes",
    recognize:
      "The margin of error bounds the population mean, not individual values, which vary far more; it gives plausible values, " +
      "not certain ones, for the population sampled; a total is the size times the mean, so the whole interval scales.",
    rubric: { steps: 1, concept: 2, interpretation: 2, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["must-vs-could", "wrong-quantity", "neighbouring-rule"],
    build(t) {
      const withTotal = t.chance(0.45);
      const scene = t.pick(withTotal ? MEAN_SCENES.filter((entry) => entry.total) : MEAN_SCENES);
      const numeric = withTotal && t.chance(0.4);
      return retry(() => {
        const n = t.pick(scene.sizes);
        const N = scene.pops ? t.pick(scene.pops) : null;
        const m = t.int(scene.center[0], scene.center[1]);
        const lo = m - t.int(scene.below[0], scene.below[1]);
        const hi = m + t.int(scene.above[0], scene.above[1]);
        const E = Math.round((1.96 * ((hi - lo) / 4.6)) / Math.sqrt(n));
        if (E < 1) return null;
        const show = (value) => num(tidy(value / scene.scale));
        const item = withTotal
          ? meanScopeTotal(t, scene, n, N, m, E, lo, hi, show, numeric)
          : meanScopeConclusion(t, scene, n, N, m, E, lo, hi, show);
        return item && (!numeric || fitsGrid(item.correct)) ? item : null;
      });
    },
  };

  /* ================================= stratified-sample-total (Hard) */

  // Two groups of known, unequal sizes, each sampled at random at its own
  // rate. The estimate for everyone scales each group's sample by that
  // group's size; pooling the samples treats them as one random sample of
  // everyone, which is wrong because the rates differ (and the draw makes
  // the pooled answer differ from the key). `intro` takes the two sizes as
  // printed; `who` joins the property to its noun, and `ones` names it;
  // `col` heads the table's count column. No choice is the complement of
  // the key: two choices summing to the whole would mark the pair.
  const STRATA_SCENES = [
    {
      intro: (a, b) => `A high school has ${a} ninth graders and ${b} twelfth graders.`,
      sampled: "A random sample of students was selected from each of the two grades, and each student in the samples was asked whether they walk to school.",
      head: "Grade", groups: ["Ninth grade", "Twelfth grade"], col: "Number who walk to school",
      whole: "ninth and twelfth graders at the school", who: "who walk to school", ones: "students", group: (i) => ["ninth graders", "twelfth graders"][i],
    },
    {
      intro: (a, b) => `A company has ${a} employees at its downtown office and ${b} employees at its airport office.`,
      sampled: "The company surveyed a random sample of employees from each office about whether they would use a company shuttle.",
      head: "Office", groups: ["Downtown", "Airport"], col: "Number who would use a shuttle",
      whole: "employees at the two offices", who: "who would use a shuttle", ones: "employees", group: (i) => ["downtown employees", "airport employees"][i],
    },
    {
      intro: (a, b) => `A town has ${a} households north of its river and ${b} households south of it.`,
      sampled: "A random sample of households was selected from each side of the river, and each household in the samples was asked whether it has a vegetable garden.",
      head: "Side of the river", groups: ["North", "South"], col: "Number with a vegetable garden",
      whole: "households in the town", who: "that have a vegetable garden", ones: "households", group: (i) => ["households north of the river", "households south of the river"][i],
    },
    {
      intro: (a, b) => `An orchard has ${a} apple trees and ${b} pear trees.`,
      sampled: "An inspector selected a random sample of each type of tree and checked each sampled tree for leaf blight.",
      head: "Type of tree", groups: ["Apple", "Pear"], col: "Number with leaf blight",
      whole: "trees in the orchard", who: "that have leaf blight", ones: "trees", group: (i) => ["apple trees", "pear trees"][i],
    },
    {
      intro: (a, b) => `A library has ${a} adult members and ${b} youth members.`,
      sampled: "The library surveyed a random sample of each kind of member about whether they borrowed an e-book last month.",
      head: "Membership", groups: ["Adult", "Youth"], col: "Number who borrowed an e-book",
      whole: "members of the library", who: "who borrowed an e-book last month", ones: "members", group: (i) => ["adult members", "youth members"][i],
    },
    {
      intro: (a, b) => `Last week a factory made ${a} parts on its day shift and ${b} parts on its night shift.`,
      sampled: "An inspector selected a random sample of the parts made on each shift and checked each sampled part for a defect.",
      head: "Shift", groups: ["Day", "Night"], col: "Number with a defect",
      whole: "parts made last week", who: "that have a defect", ones: "parts", group: (i) => ["parts made on the day shift", "parts made on the night shift"][i],
    },
    {
      intro: (a, b) => `Last month a state park had ${a} weekday visitors and ${b} weekend visitors.`,
      sampled: "The park surveyed a random sample of the weekday visitors and a random sample of the weekend visitors about whether they rated their visit as excellent.",
      head: "Day of visit", groups: ["Weekday", "Weekend"], col: "Number who rated it excellent",
      whole: "visitors last month", who: "who rated their visit as excellent", ones: "visitors", group: (i) => ["weekday visitors", "weekend visitors"][i],
    },
    {
      intro: (a, b) => `A clinic has ${a} patients under 40 years old and ${b} patients 40 years old or older.`,
      sampled: "The clinic surveyed a random sample of patients from each age group about whether they would book appointments online.",
      head: "Age group", groups: ["Under 40", "40 or older"], col: "Number who would book online",
      whole: "patients at the clinic", who: "who would book appointments online", ones: "patients", group: (i) => ["patients under 40", "patients 40 or older"][i],
    },
  ];

  function strataItem(t, scene, askPercent, numeric) {
    return retry(() => {
      // Each group's size is its sample size times its own scale, and the
      // scales differ, so the groups are sampled at different rates.
      const n = [t.int(4, 20) * 5, t.int(4, 20) * 5];
      const k = [t.int(4, 40), t.int(4, 40)];
      if (Math.abs(k[0] - k[1]) < 4) return null;
      const N = [n[0] * k[0], n[1] * k[1]];
      if (N.some((size) => size < 200 || size > 6000)) return null;
      const x = [t.int(Math.ceil(0.1 * n[0]), Math.floor(0.9 * n[0])), t.int(Math.ceil(0.1 * n[1]), Math.floor(0.9 * n[1]))];
      const rate = [x[0] / n[0], x[1] / n[1]];
      if (Math.abs(rate[0] - rate[1]) < 0.2) return null;
      const all = N[0] + N[1];
      const total = k[0] * x[0] + k[1] * x[1];
      const pooled = tidy(((x[0] + x[1]) * all) / (n[0] + n[1]));
      // The trap must land far enough from the key to be a real mistake.
      if (Math.abs(pooled - total) < 0.06 * total) return null;
      const stimulus = {
        type: "table",
        content: table([scene.head, "Number sampled", scene.col], [0, 1].map((i) => [scene.groups[i], n[i], x[i]])),
      };
      const lead = `${scene.intro(fmt(N[0]), fmt(N[1]))} ${scene.sampled} The table shows the results.`;
      const perGroup = [0, 1].map((i) => `${scene.group(i)}: ${x[i]}/${n[i]} of ${fmt(N[i])} = ${fmt(k[i] * x[i])}`);
      const principles = [
        "A random sample from one group describes that group; scale it by that group's size, not by the whole population's.",
        "When groups are sampled at different rates, pooling the samples misweights them; estimate each group, then add.",
      ];
      const trap =
        `Pooling the samples, ${x[0] + x[1]} of ${n[0] + n[1]}, treats them as one random sample of all ${fmt(all)}; ` +
        `but ${n[0]} of ${fmt(N[0])} ${scene.group(0)} and ${n[1]} of ${fmt(N[1])} ${scene.group(1)} were sampled at different rates.`;
      if (askPercent) {
        const key = tidy((total / all) * 100);
        if (!isClean(key, 1)) return null;
        const text = (value) => (value > 0 && value < 100 && isClean(value, 1) ? `${num(tidy(value))}%` : null);
        const item = packRanked(t, numeric, key, [
          [tidy(((x[0] + x[1]) / (n[0] + n[1])) * 100), `Pools the two samples (${x[0] + x[1]} of ${n[0] + n[1]}), ignoring that the groups were sampled at different rates.`],
          [tidy(((rate[0] + rate[1]) / 2) * 100), `Averages the two sample percents as if the groups were the same size; there are ${fmt(N[0])} ${scene.group(0)} and ${fmt(N[1])} ${scene.group(1)}.`],
          [tidy(((k[1] * x[0] + k[0] * x[1]) / all) * 100), "Scales each group's sample by the other group's size."],
          [tidy(rate[0] * 100), `Gives the percent for ${scene.group(0)} alone.`],
          [tidy(rate[1] * 100), `Gives the percent for ${scene.group(1)} alone.`],
        ], {
          stimulus,
          figure: null,
          stem: `${lead} Based on these results, ${numeric ? "what" : "which of the following"} is the best estimate of the percent of all ${scene.whole} ${scene.who}?`,
          explanation:
            `Estimate each group from its own sample: ${perGroup.join("; ")}. Together that is ${fmt(total)} of ${fmt(all)}, ` +
            `or ${num(key)}%.`,
          steps: [
            `Estimate each group from its own sample: ${perGroup.join("; ")}.`,
            `Add: ${fmt(k[0] * x[0])} + ${fmt(k[1] * x[1])} = ${fmt(total)} of the ${fmt(all)} ${scene.whole}.`,
            `${fmt(total)} ÷ ${fmt(all)} = ${num(key)}%.`,
          ],
          principles,
          trap,
          hint: "Did each sample come from the whole population, or from one group of a known size?",
          estimatedSeconds: 130,
        }, { show: text, places: 1, keep: 1 });
        if (!item) return null;
        return Object.assign(item, { verify: () => close(strataCheck(scene, stimulus.content, lead).percent, key, 1e-9) &&
          (numeric || item.wrong.every(([choice]) => !close(parseNumber(choice.replace("%", "")), key, 1e-9))) });
      }
      if (!Number.isInteger(pooled)) return null;
      const item = packRanked(t, numeric, total, [
        [pooled, `Pools the two samples (${x[0] + x[1]} of ${n[0] + n[1]}) and scales by all ${fmt(all)}, ignoring that the groups were sampled at different rates.`],
        [k[1] * x[0] + k[0] * x[1], "Scales each group's sample by the other group's size."],
        [tidy(((rate[0] + rate[1]) / 2) * all), `Averages the two sample rates as if the groups were the same size; there are ${fmt(N[0])} ${scene.group(0)} and ${fmt(N[1])} ${scene.group(1)}.`],
        // One group's estimate only: with both on offer, the key would be
        // their sum.
        ...[t.pick([0, 1])].map((i) => [k[i] * x[i], `Estimates the ${scene.group(i)} alone.`]),
        [x[0] + x[1], `Counts only the ${n[0] + n[1]} ${scene.ones} sampled, not all ${fmt(all)}.`],
      ], {
        stimulus,
        figure: null,
        stem: `${lead} Based on these results, ${numeric ? "what" : "which of the following"} is the best estimate of the number of ${scene.whole} ${scene.who}?`,
        explanation:
          `Each sample describes only its own group, so estimate each group and add: ${perGroup.join("; ")}. ` +
          `The estimate for all ${fmt(all)} is ${fmt(k[0] * x[0])} + ${fmt(k[1] * x[1])} = ${fmt(total)}.`,
        steps: [
          `${scene.groups[0]}: ${x[0]} of ${n[0]} sampled, applied to ${fmt(N[0])}, gives ${fmt(N[0])} × ${x[0]}/${n[0]} = ${fmt(k[0] * x[0])}.`,
          `${scene.groups[1]}: ${x[1]} of ${n[1]} sampled, applied to ${fmt(N[1])}, gives ${fmt(N[1])} × ${x[1]}/${n[1]} = ${fmt(k[1] * x[1])}.`,
          `Add the two estimates: ${fmt(total)}.`,
        ],
        principles,
        trap,
        hint: "Did each sample come from the whole population, or from one group of a known size?",
        estimatedSeconds: 130,
      }, { places: 0, keep: 1 });
      if (!item) return null;
      return Object.assign(item, { verify: () => strataCheck(scene, stimulus.content, lead).total === total &&
        (numeric || item.wrong.every(([choice]) => parseNumber(choice) !== total)) });
    });
  }

  // Re-reads the group sizes from the lead, where the scene's intro put
  // them, and the samples from the table.
  function strataCheck(scene, content, lead) {
    const pattern = scene.intro("\u0000", "\u0001").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace("\u0000", "([\\d,]+)").replace("\u0001", "([\\d,]+)");
    const sizes = new RegExp(`^${pattern}`).exec(lead).slice(1, 3).map(parseNumber);
    const rows = parseTable(content).slice(1).map((row) => row.slice(1).map(Number));
    const total = rows.reduce((sumSoFar, [sampled, count], i) => sumSoFar + (sizes[i] * count) / sampled, 0);
    return { total: tidy(total), percent: tidy((total / (sizes[0] + sizes[1])) * 100) };
  }

  const stratifiedTotal = {
    id: "stratified-sample-total",
    domain: DATA,
    skill: "Statistical inference",
    subskill: "samples and populations",
    difficulty: "Hard",
    title: "Combining random samples taken from groups of different sizes",
    recognize:
      "Each sample was drawn from one group of known size, at its own rate. Estimate each group from its own sample and add; " +
      "pooling the samples, or averaging their rates, weights the groups wrongly.",
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 1, synthesis: 1, trap: 2 },
    tricks: ["unweighted-average", "part-vs-whole", "wrong-quantity"],
    build(t) {
      const scene = t.pick(STRATA_SCENES);
      const askPercent = t.chance(0.35);
      return strataItem(t, scene, askPercent, t.chance(0.35));
    },
  };

  return [methodChoice, marginSize, sampleEstimate, markRecapture, sampleInference, twoEstimates, intervalMeanScope, stratifiedTotal];
});
