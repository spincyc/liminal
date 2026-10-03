"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const Identity = require("../src/lib/question-identity");
const Progress = require("../src/lib/progress");
const { instantiate } = require("../src/lib/families/shared/instantiate");
const families = require("../src/lib/families/sat/reading-writing");

test("the reported different-seed duplicate has one visible identity even after reshuffling choices", () => {
  const template = families.find((entry) => entry.id === "central-idea-academic-argument");
  const first = instantiate(template, "2");
  const duplicate = instantiate(template, "17");
  assert.notEqual(first.seed, duplicate.seed);
  assert.equal(first.stem, duplicate.stem);
  assert.deepEqual(first.stimulus, duplicate.stimulus);
  assert.deepEqual(first.choices, duplicate.choices);
  assert.equal(Identity.visibleIdentity(first), Identity.visibleIdentity(duplicate));
  const reshuffled = { ...duplicate, choices: duplicate.choices.slice().reverse(),
    correctAnswer: 3 - duplicate.correctAnswer, templateId: "another-template", scene: "another-scene",
    hint: "New hint", explanation: "New feedback", templateVersion: 99 };
  assert.equal(Identity.visibleIdentity(first), Identity.visibleIdentity(reshuffled));
  assert.notEqual(Progress.contentIdentity(first), Progress.contentIdentity(reshuffled),
    "historical grading identity still distinguishes ordered choices and feedback");
});

test("visible identities retain quantitative, stimulus, figure, and response distinctions", () => {
  const question = { responseType: "multiple-choice", stem: "If x² = 16, what is x?", choices: ["−4", "4", "8", "16"],
    stimulus: { type: "table", content: "Year | Count\n1 | 12\n2 | 24" },
    figure: { svg: '<svg viewBox="0 0 10 10"><path d="M 0 0 L 8 9"/></svg>', alt: "A triangle", notToScale: false },
    calculatorPolicy: "allowed" };
  const identity = Identity.visibleIdentity(question);
  const different = [
    { stem: "If x³ = 16, what is x?" },
    { stem: "If x² = −16, what is x?" },
    { choices: ["−4", "4", "8", "17"] },
    { stimulus: { ...question.stimulus, content: "Year | Count\n1 | 12\n2 | 25" } },
    { stimulus: { ...question.stimulus, type: "passage" } },
    { figure: { ...question.figure, svg: question.figure.svg.replace("8 9", "9 8") } },
    { figure: { ...question.figure, alt: "A quadrilateral" } },
    { figure: { ...question.figure, notToScale: true } },
    { responseType: "numeric" },
    { calculatorPolicy: "not-allowed" },
  ];
  different.forEach((change) => assert.notEqual(identity, Identity.visibleIdentity({ ...question, ...change })));
  assert.equal(identity, Identity.visibleIdentity({ ...question,
    figure: { notToScale: false, alt: question.figure.alt, svg: question.figure.svg },
    stimulus: { content: question.stimulus.content, type: "table", id: "ignored-storage-key" } }));
  assert.equal(Identity.visibleIdentity({ id: "historical-without-snapshot" }), null);
});

test("visible identity is dependency-free and agrees in Node and the browser", () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve("../src/lib/question-identity"), "utf8"), context);
  const question = { stem: "What is 2 + 3?", responseType: "numeric" };
  assert.equal(context.LiminalQuestionIdentity.visibleIdentity(question), Identity.visibleIdentity(question));
  assert.equal(Identity.isVisibleIdentity(Identity.visibleIdentity(question)), true);
  assert.equal(Identity.isVisibleIdentity("vi1-invalid"), false);
});
