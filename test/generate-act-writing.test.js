"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { generate } = require("../tools/generators/generate-act-writing");

test("Writing guides model adoption, rejection, and conditional trial for each issue", () => {
  const issues = new Map();
  for (let sequence = 1; sequence <= 575; sequence += 1) {
    const question = generate({ sequence, task: { domain: "Ideas and Analysis" } });
    const issue = question.stimulus.content.split("\n")[0];
    const thesis = question.correctAnswer.sampleThesis;
    const position = /should adopt/.test(thesis) ? "adopt"
      : /should decline/.test(thesis) ? "decline" : "trial";
    if (!issues.has(issue)) issues.set(issue, new Set());
    issues.get(issue).add(position);
    assert.match(question.explanation, /no single required position/);
    assert.equal(question.correctAnswer.reviewCriteria.length, 4);
    for (const step of question.correctAnswer.outline) {
      const reference = step.match(/Perspective (\d)/);
      if (reference) {
        const perspective = question.stimulus.content.split("\n").find((line) =>
          line.startsWith(`Perspective ${reference[1]}:`));
        assert.match(perspective, /risk|costs|unintended|reliability|Opportunity costs/i);
      }
    }
  }
  assert.equal(issues.size, 53);
  for (const [issue, positions] of issues) assert.equal(positions.size, 3, issue);
});
