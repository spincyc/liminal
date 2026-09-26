"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../src/lib/core");

const questions = [
  {
    id: "q1",
    sectionKey: "sat-math",
    domain: "Algebra",
    skill: "Linear equations",
    subskill: "solve",
    difficulty: "Easy",
    responseType: "multiple-choice",
    correctAnswer: 2,
    stem: "Solve a linear equation.",
    stimulus: null,
  },
  {
    id: "q2",
    sectionKey: "sat-math",
    domain: "Algebra",
    skill: "Linear equations",
    subskill: "model",
    difficulty: "Medium",
    responseType: "numeric",
    correctAnswer: "4.5",
    stem: "Find the modeled value.",
    stimulus: null,
  },
  {
    id: "q3",
    sectionKey: "sat-reading-writing",
    domain: "Craft and Structure",
    skill: "Words in Context",
    subskill: "meaning",
    difficulty: "Hard",
    responseType: "multiple-choice",
    correctAnswer: 0,
    stem: "Choose the contextual meaning.",
    stimulus: { content: "A brief invented passage." },
  },
];

test("filterQuestions combines taxonomy, difficulty, and search filters", () => {
  assert.deepEqual(
    core.filterQuestions(questions, {
      domains: ["Algebra"],
      difficulties: ["Medium"],
      query: "modeled",
    }).map((question) => question.id),
    ["q2"],
  );
});

test("scoreResponse handles choices, exact numeric keys, and essays", () => {
  assert.equal(core.scoreResponse(questions[0], 2), true);
  assert.equal(core.scoreResponse(questions[0], "2"), true);
  assert.equal(core.scoreResponse(questions[0], 1), false);
  assert.equal(core.scoreResponse(questions[1], "4.5"), true);
  assert.equal(core.scoreResponse(questions[1], "9/2"), true);
  assert.equal(core.scoreResponse(questions[1], "4.50"), true);
  assert.equal(core.scoreResponse(questions[1], "4.5004"), false, "no tolerance band");
  assert.equal(core.scoreResponse({ responseType: "essay" }, "draft"), null);
});

test("a choice question is never correct without a choice", () => {
  const keyA = { responseType: "multiple-choice", correctAnswer: 0 };
  for (const response of [null, undefined, "", " ", 0.4, "0.0", "A", NaN, [], false]) {
    assert.equal(core.scoreResponse(keyA, response), false, JSON.stringify(response));
  }
  assert.equal(core.scoreResponse(keyA, 0), true);
  assert.equal(core.scoreResponse(keyA, "0"), true);
});

test("buildSession is deterministic and respects count", () => {
  const first = core.buildSession(questions, 2, "seed");
  const second = core.buildSession(questions, 2, "seed");
  assert.deepEqual(first.map((question) => question.id), second.map((question) => question.id));
  assert.equal(first.length, 2);
});

test("summarizeProgress calculates accuracy and weak skills", () => {
  const attempts = [
    { questionId: "q1", correct: false },
    { questionId: "q1", correct: true },
    { questionId: "q2", correct: false },
  ];
  const summary = core.summarizeProgress(attempts, questions);
  assert.equal(summary.attempted, 3);
  assert.equal(summary.correct, 1);
  assert.equal(summary.uniqueCompleted, 2);
  assert.equal(
    summary.bySkill["sat-math|Linear equations"].accuracy,
    1 / 3,
  );
});

test("recommendation prioritizes a due missed question", () => {
  const recommendation = core.recommendQuestion(
    questions,
    [{ questionId: "q2", correct: false, reviewAt: 10 }],
    { now: 20, recentIds: [] },
  );
  assert.equal(recommendation.question.id, "q2");
  assert.equal(recommendation.kind, "review");
});

test("recommendation avoids recent questions when possible", () => {
  const recommendation = core.recommendQuestion(questions, [], {
    recentIds: ["q1"],
  });
  assert.notEqual(recommendation.question.id, "q1");
});

/* -------------------------------------------------------------- mini tests */

const catalog = require("../content/catalog.json");

function syntheticBank(sectionKey, section, count) {
  const difficulties = ["Easy", "Medium", "Hard"];
  return Array.from({ length: count }, (unused, index) => ({
    id: `${sectionKey}-${index}`,
    test: sectionKey.startsWith("sat") ? "SAT" : "ACT",
    section,
    sectionKey,
    domain: `Domain ${index % 3}`,
    skill: `Skill ${index % 5}`,
    difficulty: difficulties[index % 3],
    responseType: "multiple-choice",
    choices: ["a", "b", "c", "d"],
    correctAnswer: index % 4,
  }));
}

function banksFor(blueprint) {
  return Object.fromEntries(
    blueprint.sections.map((entry) => [
      entry.sectionKey,
      syntheticBank(entry.sectionKey, entry.sectionKey, 120),
    ]),
  );
}

test("every mini test blueprint references real catalog sections", () => {
  const known = new Set(catalog.sections.map((section) => section.key));
  for (const blueprint of core.MINI_TEST_BLUEPRINTS) {
    assert.ok(blueprint.id && blueprint.label && blueprint.minutes > 0);
    for (const entry of blueprint.sections) {
      assert.ok(
        known.has(entry.sectionKey),
        `${blueprint.id} references unknown section ${entry.sectionKey}`,
      );
      assert.ok(entry.count > 0);
    }
  }
});

test("every mini test blueprint totals twenty questions", () => {
  for (const blueprint of core.MINI_TEST_BLUEPRINTS) {
    assert.equal(
      core.blueprintTotal(blueprint),
      20,
      `${blueprint.id} does not total 20 questions`,
    );
  }
});

test("mini test difficulty mix sums to one", () => {
  const total = core.MINI_TEST_DIFFICULTY_MIX.reduce(
    (sum, entry) => sum + entry.weight,
    0,
  );
  assert.ok(Math.abs(total - 1) < 1e-9);
});

test("allocateByWeight distributes remainders without losing items", () => {
  assert.deepEqual(core.allocateByWeight(20, [0.3, 0.45, 0.25]), [6, 9, 5]);
  assert.equal(core.allocateByWeight(7, [0.3, 0.45, 0.25]).reduce((a, b) => a + b), 7);
  assert.equal(core.allocateByWeight(1, [0.3, 0.45, 0.25]).reduce((a, b) => a + b), 1);
});

test("buildMiniTest honors each blueprint's per-section counts and order", () => {
  for (const blueprint of core.MINI_TEST_BLUEPRINTS) {
    const built = core.buildMiniTest(banksFor(blueprint), blueprint, "seed-1");
    assert.equal(built.length, core.blueprintTotal(blueprint));

    const counts = {};
    built.forEach((question) => {
      counts[question.sectionKey] = (counts[question.sectionKey] || 0) + 1;
    });
    blueprint.sections.forEach((entry) => {
      assert.equal(counts[entry.sectionKey], entry.count);
    });

    // Sections stay grouped in blueprint order.
    const order = built.map((question) => question.sectionKey);
    const expected = blueprint.sections.flatMap((entry) =>
      Array.from({ length: entry.count }, () => entry.sectionKey),
    );
    assert.deepEqual(order, expected);

    const ids = new Set(built.map((question) => question.id));
    assert.equal(ids.size, built.length, "mini test repeated a question");
  }
});

test("buildMiniTest is deterministic for a given seed", () => {
  const blueprint = core.blueprintById("sat");
  const banks = banksFor(blueprint);
  const first = core.buildMiniTest(banks, blueprint, "same-seed");
  const second = core.buildMiniTest(banks, blueprint, "same-seed");
  const third = core.buildMiniTest(banks, blueprint, "other-seed");
  assert.deepEqual(first.map((q) => q.id), second.map((q) => q.id));
  assert.notDeepEqual(first.map((q) => q.id), third.map((q) => q.id));
});

test("buildMiniTest excludes essay prompts", () => {
  const blueprint = {
    id: "essay-check",
    sections: [{ sectionKey: "act-writing", count: 3 }],
  };
  const bank = syntheticBank("act-writing", "Writing", 10)
    .map((question) => ({ ...question, responseType: "essay" }))
    .concat(syntheticBank("act-writing-mc", "Writing", 4)
      .map((question) => ({ ...question, sectionKey: "act-writing" })));
  const built = core.buildMiniTest({ "act-writing": bank }, blueprint, "seed");
  assert.equal(built.length, 3);
  assert.ok(built.every((question) => question.responseType !== "essay"));
});

test("buildMiniTest backfills when a difficulty tier is short", () => {
  const blueprint = { id: "thin", sections: [{ sectionKey: "thin", count: 6 }] };
  const bank = syntheticBank("thin", "Thin", 8)
    .map((question) => ({ ...question, difficulty: "Medium" }));
  const built = core.buildMiniTest({ thin: bank }, blueprint, "seed");
  assert.equal(built.length, 6);
  assert.equal(new Set(built.map((q) => q.id)).size, 6);
});

test("summarizeMiniTest reports accuracy by section and domain", () => {
  const items = [
    { id: "a", sectionKey: "s1", test: "SAT", section: "Math", domain: "Algebra",
      responseType: "multiple-choice", choices: ["w", "x"], correctAnswer: 0 },
    { id: "b", sectionKey: "s1", test: "SAT", section: "Math", domain: "Algebra",
      responseType: "multiple-choice", choices: ["w", "x"], correctAnswer: 1 },
    { id: "c", sectionKey: "s2", test: "SAT", section: "Reading", domain: "Ideas",
      responseType: "multiple-choice", choices: ["w", "x"], correctAnswer: 0 },
  ];
  const responses = new Map([["a", 0], ["b", 0]]);
  const summary = core.summarizeMiniTest(items, responses);

  assert.equal(summary.total, 3);
  assert.equal(summary.answered, 2);
  assert.equal(summary.unanswered, 1);
  assert.equal(summary.correct, 1);
  assert.equal(summary.accuracy, 1 / 3);

  const math = summary.bySection.find((row) => row.sectionKey === "s1");
  assert.equal(math.total, 2);
  assert.equal(math.correct, 1);
  assert.equal(math.accuracy, 0.5);

  // Weakest domain sorts first.
  assert.equal(summary.byDomain[0].accuracy, 0);
  assert.equal(summary.byDomain[0].domain, "Ideas");
});

test("summarizeMiniTest counts a blank answer as incorrect, not skipped", () => {
  const items = [
    { id: "a", sectionKey: "s1", test: "ACT", section: "Math", domain: "Algebra",
      responseType: "numeric", correctAnswer: "5" },
  ];
  const summary = core.summarizeMiniTest(items, new Map([["a", ""]]));
  assert.equal(summary.unanswered, 1);
  assert.equal(summary.correct, 0);
  assert.equal(summary.accuracy, 0);
  assert.equal(summary.items[0].answered, false);
});

test("numeric responses accept fractions, the U+2212 minus, and thousands commas", () => {
  const key = { responseType: "numeric", correctAnswer: "-1.75" };
  assert.equal(core.scoreResponse(key, "-7/4"), true);
  assert.equal(core.scoreResponse(key, "\u22121.75"), true);
  assert.equal(core.scoreResponse(key, "7/4"), false);
  assert.equal(core.scoreResponse({ responseType: "numeric", correctAnswer: "1000" }, "1,000"), true);
  assert.equal(core.scoreResponse({ responseType: "numeric", correctAnswer: "50\u00b0" }, "50"), true);
  assert.ok(Number.isNaN(core.parseNumericResponse("3/0")));
  assert.ok(Number.isNaN(core.parseNumericResponse("abc")));
});

// The real test's student-produced-response rules: a terminating key is
// matched exactly; a key whose decimal does not fit the grid also takes a
// decimal that fills the grid, rounded or cut off.
test("numeric scoring follows the grid rules for terminating keys", () => {
  const score = (key, response) => core.scoreResponse({ responseType: "numeric", correctAnswer: key }, response);
  assert.equal(score("0.75", "3/4"), true);
  assert.equal(score("0.75", ".75"), true);
  assert.equal(score("0.75", "6/8"), true);
  assert.equal(score("0.75", ".7500"), true);
  assert.equal(score("0.75", ".751"), false);
  assert.equal(score("0.75", ".7"), false);
  assert.equal(score("3/4", "0.75"), true, "a terminating fraction key takes its decimal");
  assert.equal(score("-2.5", "-5/2"), true);
  assert.equal(score("-2.5", "-2.49"), false);
  assert.equal(score("12", "12.0"), true);
  assert.equal(score("12", "24/2"), true);
  assert.equal(score("12", "12.001"), false);
  for (const empty of [null, undefined, "", "-", ".", "/"]) {
    assert.equal(score("0", empty), false, JSON.stringify(empty));
  }
});

test("numeric scoring accepts grid-filling decimals for repeating keys", () => {
  const score = (key, response) => core.scoreResponse({ responseType: "numeric", correctAnswer: key }, response);
  // 2/3: the examples the real directions give.
  for (const good of ["2/3", "4/6", ".6666", ".6667", "0.666", "0.667"]) {
    assert.equal(score("2/3", good), true, good);
  }
  for (const bad of [".66", ".67", "0.66", "0.67", ".6668", "0.668", "667/1000"]) {
    assert.equal(score("2/3", bad), false, bad);
  }
  // 7/3 = 2.333…: only three decimal places fit after "2.".
  for (const good of ["7/3", "14/6", "2.333"]) assert.equal(score("7/3", good), true, good);
  for (const bad of ["2.33", "2.334", "2.3", "02.33"]) assert.equal(score("7/3", bad), false, bad);
  // A negative answer gets a sixth character for the sign.
  for (const good of ["-2/3", "-.6666", "-.6667", "-0.666", "\u22120.667"]) {
    assert.equal(score("-2/3", good), true, good);
  }
  for (const bad of ["-.666", "-.667", "-0.67", ".6667"]) assert.equal(score("-2/3", bad), false, bad);
  // A terminating decimal too long for the grid follows the same rule.
  assert.equal(score("1/32", ".0313"), true);
  assert.equal(score("1/32", ".0312"), true);
  assert.equal(score("1/32", ".031"), false);
  assert.equal(score("1/32", "0.03125"), true, "the exact value is always right");
});

test("pace budgets follow real-test seconds per question", () => {
  assert.equal(core.paceBudgetSeconds("sat-math", 22), 35 * 60);
  assert.equal(core.paceBudgetSeconds("sat-reading-writing", 27), 32 * 60);
  assert.equal(core.paceBudgetSeconds("act-writing", 1), null);
  assert.equal(core.paceBudgetSeconds("sat-math", 0), null);
});

test("accuracyByDifficulty counts generated attempts and falls back to the bank", () => {
  const bank = [{ id: "q1", difficulty: "Easy" }, { id: "q2", difficulty: "Hard" }];
  const tiers = core.accuracyByDifficulty([
    { questionId: "q1", correct: true },
    { questionId: "q2", correct: false },
    { questionId: "gen-1", difficulty: "Hard", correct: true },
    { questionId: "gen-2", difficulty: "Hard", correct: null },
  ], bank);
  assert.deepEqual(tiers.Easy, { attempted: 1, correct: 1, accuracy: 1 });
  assert.deepEqual(tiers.Hard, { attempted: 2, correct: 1, accuracy: 0.5 });
  assert.equal(tiers.Medium.accuracy, null);
});

test("summarizeProgress leaves unresolvable attempts out of both counts", () => {
  const summary = core.summarizeProgress([
    { questionId: "q1", correct: true },
    { questionId: "missing-1", correct: false },
    { questionId: "missing-2", correct: true },
  ], questions);
  assert.equal(summary.attempted, 1);
  assert.equal(summary.correct, 1);
  assert.equal(summary.accuracy, 1);
  assert.equal(summary.uniqueCompleted, 1);
});

test("pace budgets for mixed sections sum each question's own pace", () => {
  const mixed = [
    ...Array.from({ length: 11 }, () => ({ sectionKey: "sat-reading-writing" })),
    ...Array.from({ length: 9 }, () => ({ sectionKey: "sat-math" })),
  ];
  assert.equal(core.paceBudgetForQuestions(mixed), Math.round(11 * (32 * 60) / 27 + 9 * (35 * 60) / 22));
  assert.equal(core.paceBudgetForQuestions([{ sectionKey: "act-writing" }]), null);
  assert.equal(core.paceBudgetForQuestions([{}], "sat-math"), Math.round((35 * 60) / 22));
  assert.equal(core.paceBudgetForQuestions([]), null);
});

test("summarizeProgress counts generated attempts by their own skill", () => {
  const summary = core.summarizeProgress([
    { questionId: "gen-1", sectionKey: "sat-math", skill: "Circles", correct: true },
    { questionId: "gen-2", sectionKey: "sat-math", skill: "Circles", correct: false },
  ], []);
  assert.equal(summary.uniqueCompleted, 2);
  assert.equal(summary.correct, 1);
  assert.equal(summary.bySkill["sat-math|Circles"].attempted, 2);
});

test("sections that share passages are drawn as whole passages", () => {
  const bank = [];
  ["p1", "p2", "p3"].forEach((passageId, p) => {
    for (let i = 1; i <= 4; i += 1) {
      bank.push({ id: `act-reading-${p}${i}`, passageId, sectionKey: "act-reading", responseType: "multiple-choice",
        difficulty: ["Easy", "Medium", "Hard"][i % 3], skill: "Main idea", subskill: "x" });
    }
  });
  const drawn = core.drawSectionItems(bank, 6, "seed");
  const passages = drawn.map((question) => question.passageId);
  assert.equal(drawn.length, 6);
  assert.equal(new Set(passages).size, 2, "one whole passage and the start of another");
  assert.deepEqual(passages.slice(0, 4), Array(4).fill(passages[0]));
  assert.deepEqual(drawn.slice(0, 4).map((question) => question.id), drawn.slice(0, 4).map((question) => question.id).slice().sort(),
    "questions keep passage order");
  const session = core.buildSession(bank, 8, "seed", { passageSets: true });
  assert.equal(new Set(session.map((question) => question.passageId)).size, 2);
  const avoided = core.buildSession(bank, 4, "seed", { passageSets: true, avoidIds: bank.filter((q) => q.passageId !== "p3").map((q) => q.id) });
  assert.deepEqual([...new Set(avoided.map((question) => question.passageId))], ["p3"], "recently served passages come last");
  assert.ok(new Set(core.buildSession(bank, 6, "seed").map((question) => question.passageId)).size >= 2);
});
