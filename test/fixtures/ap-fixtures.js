"use strict";
// Synthetic AP assessment fixtures. Placeholder wording only: no course
// content, no College Board material. Shapes follow content/ap.json's
// blueprints so the validator, projections and pages can be exercised.
const fs = require("node:fs");
const path = require("node:path");
const A = require("../../src/lib/ap-assessment");
const ROOT = path.resolve(__dirname, "../..");
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "content/ap.json"), "utf8"));

const FIGURE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><line x1="10" y1="70" x2="110" y2="70" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="70" x2="10" y2="10" stroke="currentColor" stroke-width="1.5"/><polyline points="10,60 40,40 70,45 110,15" fill="none" stroke="currentColor" stroke-width="2"/><text x="112" y="74" font-size="9" fill="currentColor">t</text></svg>';
const PHYSICS_POINTS = { MR: 10, TBR: 12, EDA: 10, QQT: 8 };

function course(courseId) { return plan.courses.find(c => c.id === courseId); }
function topicsOf(courseId, unit) {
  return A.topicsForUnit(plan, courseId, Number(unit)).map(s => s.id);
}
function mc(courseId, segment, number, topic, extra = {}) {
  const letter = A.LETTERS[(number - 1) % 4];
  const physics = !A.isCalculus(courseId);
  const unit = physics ? " m/s" : "";
  return { id: A.ITEM_PREFIX[courseId] + "-" + segment + "-mc" + String(number).padStart(2, "0"),
    prompt: `Fixture question ${A.ITEM_PREFIX[courseId]}-${segment}-${number}. For the placeholder function f(x) = x^2 − ${number}, which value is marked as the fixture answer?`,
    choices: A.LETTERS.map((l, i) => `${number + i * 10}.${i}${unit}`), key: letter,
    rationale: `Fixture rationale ${number}: the keyed placeholder is choice ${letter}.`,
    distractorNotes: Object.fromEntries(A.LETTERS.filter(l => l !== letter).map(l => [l, `Placeholder note for choice ${l}.`])),
    topics: [topic], ...extra };
}
function fr(courseId, segment, number, topic, points, extra = {}) {
  const sizes = points === 9 ? [3, 3, 3] : points === 10 ? [4, 3, 3] : points === 12 ? [4, 4, 4] : [3, 3, 2];
  return { id: A.ITEM_PREFIX[courseId] + "-" + segment + "-fr" + number,
    prompt: `Fixture free-response stimulus ${A.ITEM_PREFIX[courseId]}-${segment}-${number}. A placeholder quantity Q(t) = 3t + ${number} is given for 0 ≤ t ≤ 4.`,
    topics: [topic], ...extra,
    parts: sizes.map((size, i) => ({ label: String.fromCharCode(97 + i), prompt: `Placeholder task ${String.fromCharCode(97 + i)} for stimulus ${number}.`, points: size,
      rubric: Array.from({ length: size }, (_, k) => ({ points: 1, criterion: `Fixture criterion ${k + 1} for part ${String.fromCharCode(97 + i)}.` })),
      answer: `Fixture answer ${String.fromCharCode(97 + i)}${number}.`, steps: ["Fixture step one.", "Fixture step two."] })) };
}

function unitTest(courseId, unit = 1, options = {}) {
  const segment = "u" + unit;
  const topics = topicsOf(courseId, unit);
  const pick = n => topics[(n - 1) % topics.length];
  const calculus = A.isCalculus(courseId);
  const items = Array.from({ length: 12 }, (_, i) => mc(courseId, segment, i + 1, pick(i + 1)));
  const figureId = A.ITEM_PREFIX[courseId] + "-" + segment + "-f1";
  items[1].figureIds = [figureId];
  const types = options.types || ["MR", "QQT"];
  const frs = calculus ? [fr(courseId, segment, 1, pick(2), 9, { context: true }), fr(courseId, segment, 2, pick(3), 9)]
    : types.map((type, i) => fr(courseId, segment, i + 1, pick(i + 4), PHYSICS_POINTS[type], { type }));
  const sections = calculus ? [
    { id: "I", title: "Multiple choice", kind: "mc", parts: [
      { id: "A", minutes: 16, calculator: "none", directions: "Fixture directions: no calculator.", items: items.slice(0, 8) },
      { id: "B", minutes: 10, calculator: "graphing", directions: "Fixture directions: graphing calculator.", items: items.slice(8) }] },
    { id: "II", title: "Free response", kind: "fr", parts: [
      { id: "A", minutes: 15, calculator: "graphing", directions: "Fixture directions: show your work.", items: [frs[0]] },
      { id: "B", minutes: 15, calculator: "none", directions: "Fixture directions: no calculator.", items: [frs[1]] }] },
  ] : [
    { id: "I", title: "Multiple choice", kind: "mc", parts: [{ id: "A", minutes: 30, calculator: "any", directions: "Fixture directions.", items }] },
    { id: "II", title: "Free response", kind: "fr", parts: [{ id: "A", minutes: 30, calculator: "any", directions: "Fixture directions.", items: frs }] },
  ];
  const unitTitle = course(courseId).units.find(u => u.id === segment).title;
  return { format: A.FORMAT, version: 1, courseId, id: "unit-" + unit, kind: "unit-test", unitId: segment,
    title: "Unit " + unit + " test: " + unitTitle, author: "test-fixture",
    directions: "Fixture test directions. Answer every question.",
    figures: [{ id: figureId, alt: "A placeholder line graph with four points.", notToScale: true }], sections };
}

function practiceExam(courseId) {
  const c = course(courseId);
  const blueprint = c.blueprints.practiceExam;
  const mcs = [];
  Object.entries(blueprint.mcByUnit).forEach(([unit, count]) => {
    const topics = topicsOf(courseId, unit);
    for (let i = 0; i < count; i++) mcs.push(topics[i % topics.length]);
  });
  const items = mcs.map((topic, i) => mc(courseId, "pe", i + 1, topic));
  const topic = n => topicsOf(courseId, n)[0];
  let sections;
  if (A.isCalculus(courseId)) {
    const frs = [1, 2, 3, 4, 5, 6].map(n => fr(courseId, "pe", n, topic(n + 2), 9, n <= 2 ? { context: true } : {}));
    sections = [
      { id: "I", title: "Multiple choice", kind: "mc", parts: [
        { id: "A", minutes: 62, calculator: "none", directions: "Fixture directions.", items: items.slice(0, 29) },
        { id: "B", minutes: 38, calculator: "graphing", directions: "Fixture directions.", items: items.slice(29) }] },
      { id: "II", title: "Free response", kind: "fr", parts: [
        { id: "A", minutes: 30, calculator: "graphing", directions: "Fixture directions.", items: frs.slice(0, 2) },
        { id: "B", minutes: 60, calculator: "none", directions: "Fixture directions.", items: frs.slice(2) }] },
    ];
  } else {
    const frs = ["MR", "TBR", "EDA", "QQT"].map((type, i) => fr(courseId, "pe", i + 1, topic(i + 2), PHYSICS_POINTS[type], { type }));
    sections = [
      { id: "I", title: "Multiple choice", kind: "mc", parts: [{ id: "A", minutes: 85, calculator: "any", directions: "Fixture directions.", items }] },
      { id: "II", title: "Free response", kind: "fr", parts: [{ id: "A", minutes: 95, calculator: "any", directions: "Fixture directions.", items: frs }] },
    ];
  }
  return { format: A.FORMAT, version: 1, courseId, id: "practice-exam", kind: "practice-exam", title: "Practice exam (fixture)", author: "test-fixture",
    directions: "Fixture exam directions.", sections };
}

function reference(courseId) {
  return { format: A.REFERENCE_FORMAT, version: 1, courseId, title: "Formula reference (fixture)",
    intro: "A placeholder arrangement of relations for testing.", notes: ["Fixture note: symbols are placeholders."],
    groups: [{ id: "motion", title: "Placeholder group", rows: [{ relation: "q = r + s", meaning: "Placeholder relation one.", units: "m" }, { relation: "u = v/w", meaning: "Placeholder relation two.", units: "s" }] }] };
}

// Writes a content root (plan, fixtures, figures) for builds and checks.
function writeContent(directory, docs, references = []) {
  fs.mkdirSync(directory, { recursive: true });
  fs.copyFileSync(path.join(ROOT, "content/ap.json"), path.join(directory, "ap.json"));
  for (const doc of docs) {
    const dir = path.join(directory, "ap", "assessments", doc.courseId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, doc.id + ".json"), JSON.stringify(doc, null, 2));
    for (const figure of doc.figures || []) {
      const figures = path.join(directory, "ap", "figures", doc.courseId);
      fs.mkdirSync(figures, { recursive: true });
      fs.writeFileSync(path.join(figures, figure.id + ".svg"), FIGURE_SVG);
    }
  }
  for (const ref of references) {
    fs.mkdirSync(path.join(directory, "ap", "references"), { recursive: true });
    fs.writeFileSync(path.join(directory, "ap", "references", ref.courseId + ".json"), JSON.stringify(ref, null, 2));
  }
  return directory;
}

module.exports = { plan, FIGURE_SVG, unitTest, practiceExam, reference, writeContent, topicsOf };
