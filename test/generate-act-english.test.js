"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { loadPassages } = require("../content/sources/act-english");
const {
  STRATEGIES,
  arrangeUnderlined,
} = require("../tools/generators/generate-act-english");

test("every authored ACT English subskill has a shared strategy", () => {
  const subskills = new Set(
    loadPassages().flatMap((passage) => passage.questions.map((question) => question.subskill)),
  );
  assert.deepEqual(
    [...subskills].filter((subskill) => !STRATEGIES[subskill]),
    [],
  );
});

test("underlined choices keep NO CHANGE in position A", () => {
  const kept = arrangeUnderlined({
    keep: true,
    wrong: [["B", "reason B"], ["C", "reason C"], ["D", "reason D"]],
  }, "kept");
  assert.equal(kept.choices[0], "NO CHANGE");
  assert.equal(kept.correctAnswer, 0);

  const corrected = arrangeUnderlined({
    keep: false,
    key: "correct",
    noChange: "reason A",
    wrong: [["wrong one", "reason one"], ["wrong two", "reason two"]],
  }, "corrected");
  assert.equal(corrected.choices[0], "NO CHANGE");
  assert.notEqual(corrected.correctAnswer, 0);
  assert.equal(corrected.choices[corrected.correctAnswer], "correct");
});

function correctedPassage(passageNumber) {
  const passage = loadPassages()[passageNumber - 1];
  return passage.content.replace(/\{(\d+)(?: ([^}]+))?\}/g, (marker, number, original) => {
    if (!original) return "";
    const question = passage.questions.find((item) => item.number === Number(number));
    const arranged = arrangeUnderlined(question, `${passage.id}-${number}`);
    return question.keep ? original : arranged.choices[arranged.correctAnswer];
  }).replace(/\s+/g, " ");
}

test("keyed replacements consume exactly the intended words in their passage", () => {
  assert.match(correctedPassage(4), /A tuner can hear this work only when two strings/);
  assert.match(correctedPassage(5), /My mother, who had signed me up in March, did not ask/);
  assert.match(correctedPassage(5), /There were six of us in that shallow end/);
  assert.match(correctedPassage(40), /Next, the nailing is the part with no margin/);
});

test("underlined alternatives never duplicate the original hidden behind NO CHANGE", () => {
  const normalize = (text) => text.replace(/\s+/g, " ").trim();
  for (const passage of loadPassages()) {
    for (const question of passage.questions) {
      if (!Object.hasOwn(question, "keep")) continue;
      const marker = passage.content.match(new RegExp(`\\{${question.number} ([^}]+)\\}`));
      assert.ok(marker, `${passage.id} ${question.number}: underlined portion exists`);
      const original = normalize(marker[1]);
      for (const [choice] of question.wrong) {
        assert.notEqual(normalize(choice), original, `${passage.id} ${question.number}: duplicate NO CHANGE`);
      }
    }
  }
});

test("ACT English Hard keys are not identifiable by a consistently longest choice", () => {
  const hard = loadPassages().flatMap((passage) => passage.questions)
    .filter((question) => question.difficulty === "Hard");
  const longestKeys = hard.filter((question) => {
    const key = question.keep ? "NO CHANGE" : question.key;
    const alternatives = question.wrong.map(([text]) => text);
    if (question.keep === false) alternatives.push("NO CHANGE");
    return alternatives.every((text) => key.length > text.length);
  });
  assert.ok(longestKeys.length / hard.length <= 0.4,
    `${longestKeys.length}/${hard.length} Hard questions have a uniquely longest key`);
});
