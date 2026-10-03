"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../src/lib/families/shared");
const families = [
  ...require("../src/lib/families/sat/reading-writing/expression-of-ideas/rhetorical-synthesis"),
  ...require("../src/lib/families/sat/reading-writing/expression-of-ideas/transitions"),
];

// These tasks remain useful, but their explicit clause-role grids do not
// establish Hard reasoning. Keep that editorial decision independent of
// the overall pool-capacity assertion below.
test("explicit synthesis clause-role grids remain Medium", () => {
  for (const id of ["notes-similarity-despite-difference", "notes-stress-while-noting"]) {
    assert.equal(families.find((family) => family.id === id).difficulty, "Medium", id);
  }
});

test("Expression has ten Hard designs for two successive harder sections", () => {
  assert.ok(families.filter((family) => family.difficulty === "Hard").length >= 10);
});

// The old dawn/evening scene supported both contrast (times) and similarity
// (avoiding ferries). Review now compares one explicit dimension: water
// conditions. Exercise every offered key phrase, including seed 17's However.
test("rowing comparison keeps the reviewed contrast across phrase variants", () => {
  const family = families.find((candidate) => candidate.id === "transition-consequence");
  const expected = new Set(["However", "In contrast", "By contrast", "On the other hand"]);
  const seen = new Set();
  for (const seed of [17, 47, 58, 70]) {
    const q = S.instantiate(family, seed);
    assert.equal(q.scene, "eoi-con-two-rowing-clubs");
    assert.match(q.stimulus.content, /sheltered coves.*water remains calm/);
    assert.match(q.stimulus.content, /beyond the breakwater.*large waves/);
    const answer = q.choices[q.correctAnswer];
    assert.ok(expected.has(answer));
    assert.ok(q.choices.some((choice) => ["Likewise", "Similarly"].includes(choice)));
    assert.ok(q.verified);
    seen.add(answer);
  }
  assert.deepEqual(seen, expected);
});

// The old goal only required direct offsets or denominator matching in most
// scenes; one stronger conditional scene cannot calibrate the whole pool.
test("direct reconciliation pool remains Medium", () => {
  assert.equal(families.find((family) => family.id === "notes-reconcile-findings").difficulty, "Medium");
});

// Both percentages refer to the same respondents. Their overlap requires a
// conclusion absent from the individual findings, making an inferential result
// phrase appropriate rather than the former ambiguous survey paraphrase.
test("survey transition derives overlap before limiting additional ridership", () => {
  const family = families.find((candidate) => candidate.id === "transition-elaboration-kind");
  const seen = new Set();
  for (let seed = 0; seed < 1000; seed += 1) {
    const q = S.instantiate(family, seed);
    if (q.scene !== "eoi-elb-bus-survey") continue;
    assert.match(q.stimulus.content, /71 percent/);
    assert.match(q.stimulus.content, /63 percent of the same respondents/);
    assert.match(q.stimulus.content, /some willing respondents must already be bus commuters/);
    const answer = q.choices[q.correctAnswer];
    assert.ok(["Therefore", "Thus"].includes(answer));
    assert.ok(q.choices.includes("In other words"));
    seen.add(answer);
  }
  assert.deepEqual(seen, new Set(["Therefore", "Thus"]));
});

// Half this pool uses local example/addition relations, despite several
// stronger nonadjacent inference scenes. Preserve the reviewed tier floor.
test("mixed elaboration pool remains Medium", () => {
  assert.equal(families.find((family) => family.id === "transition-elaboration-kind").difficulty, "Medium");
});

// A paraphrase may naturally follow Thus/Therefore as an inferential summary.
// Those phrases cannot be used to make In other words uniquely correct.
test("elaboration paraphrases avoid inferential-summary distractors", () => {
  const family = families.find((candidate) => candidate.id === "transition-elaboration-kind");
  const scenes = new Set();
  for (let seed = 0; seed < 500; seed += 1) {
    const q = S.instantiate(family, seed);
    if (!["eoi-elb-eelgrass-density", "eoi-elb-bicycle-households"].includes(q.scene)) continue;
    assert.equal(q.choices[q.correctAnswer], "In other words");
    assert.ok(!q.choices.includes("Thus"));
    assert.ok(!q.choices.includes("Therefore"));
    scenes.add(q.scene);
  }
  assert.equal(scenes.size, 2);
});
