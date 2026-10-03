"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { reviewProblems } = require("../tools/check-template-reviews");

function fixture() {
  const family = { id: "review-fixture", difficulty: "Medium" };
  const fingerprint = "a".repeat(64);
  const section = { sectionKey: "sat-math", families: [family],
    fingerprints: new Map([[family.id, fingerprint]]),
    registry: { templates: [{ id: family.id, version: 2, fingerprint }] },
    instantiate: (family, seed) => ({ responseType: "numeric", stem: `Question ${seed}`,
      correctAnswer: "1/2", scene: null }) };
  const review = { sectionKey: "sat-math", templateId: family.id, templateVersion: 2,
    fingerprintAlgorithm: "source-v1", fingerprint, difficulty: "Medium", verdict: "accepted",
    method: "independent-agent-blind-solve", reviewer: "reviewer", author: "author",
    reviewedAt: "2026-10-02", evidence: "docs/reviews/2026-10-02-cold-review.md",
    samples: ["one", "two", "three"].map((seed) => ({ seed, answer: "0.5", scene: null })) };
  return { section, review, manifest: { format: "liminal-template-reviews", version: 1, reviews: [review] } };
}

test("a current independent review accepts equivalent numeric answers", () => {
  const { manifest, section } = fixture();
  assert.deepEqual(reviewProblems(manifest, [section], () => true), []);
});
test("source or tier changes invalidate editorial admission", () => {
  for (const field of ["fingerprint", "difficulty", "templateVersion"]) {
    const { manifest, review, section } = fixture();
    review[field] = "stale";
    assert.ok(reviewProblems(manifest, [section], () => true).some((s) => s.includes("stale")), field);
  }
});
test("missing review, self review and duplicated seeds fail", () => {
  const { manifest, review, section } = fixture();
  review.reviewer = review.author;
  review.samples.forEach((s) => { s.seed = "one"; });
  const errors = reviewProblems(manifest, [section], () => false);
  assert.ok(errors.some((s) => s.includes("independent reviewer")));
  assert.ok(errors.some((s) => s.includes("distinct")));
  assert.ok(errors.some((s) => s.includes("evidence")));
  manifest.reviews = [];
  assert.ok(reviewProblems(manifest, [section], () => true).some((s) => s.includes("review missing")));
});
test("a changed key cannot retain a review of a different answer", () => {
  const { manifest, section } = fixture();
  section.instantiate = () => ({ responseType: "multiple-choice", correctAnswer: 2, scene: "scene" });
  const errors = reviewProblems(manifest, [section], () => true);
  assert.ok(errors.some((s) => s.includes("disagrees")));
  assert.ok(errors.some((s) => s.includes("scene mismatch")));
});
test("repeating a scene with a different choice order is not new editorial coverage", () => {
  const { manifest, review, section } = fixture();
  section.instantiate = (family, seed) => ({ responseType: "multiple-choice", stem: "Fixed question",
    choices: seed === "one" ? ["a", "b", "c", "d"] : ["b", "a", "c", "d"],
    correctAnswer: seed === "one" ? 0 : 1, scene: "one-scene" });
  review.samples.forEach((sample) => { sample.answer = sample.seed === "one" ? 0 : 1; sample.scene = "one-scene"; });
  assert.ok(reviewProblems(manifest, [section], () => true).some((s) => s.includes("reshuffled choices")));
});
test("whitespace does not create an independent reviewer and invalid dates cannot roll over", () => {
  const { manifest, review, section } = fixture();
  review.reviewer = " AUTHOR ";
  review.reviewedAt = "2026-02-31";
  const errors = reviewProblems(manifest, [section], () => true);
  assert.ok(errors.some((s) => s.includes("independent reviewer")));
  assert.ok(errors.some((s) => s.includes("invalid review date")));
});
