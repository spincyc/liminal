"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../src/lib/families/shared");
const Runs = require("../src/lib/runs");
const boundaries = require("../src/lib/families/sat/reading-writing/standard-english-conventions/boundaries");
const forms = require("../src/lib/families/sat/reading-writing/standard-english-conventions/form-structure-and-sense");
const families = [...boundaries, ...forms];
const family = (id) => families.find((entry) => entry.id === id);

function findScene(id, phrase) {
  for (let seed = 0; seed < 1000; seed += 1) {
    const question = S.instantiate(family(id), seed);
    if (question.stimulus.content.includes(phrase)) return question.scene;
  }
  assert.fail(`No scene containing ${phrase} in ${id}`);
}

test("shared Tallis and Mary Rose contexts have canonical topic identities", () => {
  assert.equal(findScene("sec-colon-before-list", "Tallis Street Youth Choir"), "sec-tallis-choir-program");
  assert.equal(findScene("sec-no-colon-after-verb", "Tallis Street Youth Choir"), "sec-tallis-choir-program");
  assert.equal(findScene("sec-irregular-past-participle", "Mary Rose"), "sec-mary-rose-raised");
  assert.equal(findScene("sec-conditional-verb-forms", "Mary Rose"), "sec-mary-rose-raised");
});

test("the former Tallis collision seed redraws one topic within a set", () => {
  const pair = [family("sec-colon-before-list"), family("sec-no-colon-after-verb")];
  const questions = Runs.drawQuestions(pair.map((entry, bit) => ({ ...entry, bit, family: entry })), "b3", S.instantiate);
  assert.equal(questions.length, 2);
  assert.equal(new Set(questions.map((question) => question.scene)).size, 2);
  assert.ok(questions.filter((question) => question.scene === "sec-tallis-choir-program").length <= 1);
});
