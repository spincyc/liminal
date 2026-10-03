"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadPassages } = require("../content/sources/act-reading");
const { STRATEGIES, passageFormat } = require("../tools/generators/generate-act-reading");
const bank = require("../content/banks/act-reading.json");
const storedPassages = require("../content/passages/act-reading.json");
const passages = loadPassages();
const authored = passages.flatMap((passage) =>
  passage.questions.map((question) => ({ passage, question })),
);

test("ACT Reading covers every catalogued subskill", () => {
  const section = require("../content/catalog.json").sections.find((s) => s.key === "act-reading");
  const expected = section.domains.flatMap((domain) => Object.values(domain.skills).flat());
  const present = new Set(authored.map(({ question }) => question.subskill));
  assert.deepEqual(expected.filter((subskill) => !present.has(subskill)), []);
});

test("ACT Reading assembly preserves authored keys, rationales, teaching text, and passage units", () => {
  assert.equal(bank.length, 575);
  assert.equal(passages.length, 55);
  assert.equal(storedPassages.length, passages.length);
  for (const [i, { passage, question }] of authored.entries()) {
    const record = bank[i];
    assert.equal(record.id, `act-reading-${String(i + 1).padStart(4, "0")}`);
    assert.equal(record.passageId, passage.id, record.id);
    assert.equal(record.stimulus, null, record.id);
    assert.equal(record.choices[record.correctAnswer], question.key, record.id);
    assert.equal(record.stem, question.stem, record.id);
    assert.equal(record.hint, question.hint, record.id);
    assert.equal(record.explanation, question.why, record.id);
    assert.deepEqual(record.solutionSteps, question.steps, record.id);
    assert.equal(record.strategy, STRATEGIES[question.subskill], record.id);
    assert.equal(record.format, passageFormat(passage), record.id);
    assert.equal(record.reviewStatus, "automated-verified", record.id);
    const reasons = new Map(question.wrong);
    assert.equal(record.distractorRationales.length, 3, record.id);
    for (const { index, reason } of record.distractorRationales) {
      assert.equal(reason, reasons.get(record.choices[index]), record.id);
      assert.notEqual(index, record.correctAnswer, record.id);
    }
  }
  for (const [i, passage] of passages.entries()) {
    const stored = storedPassages[i];
    assert.equal(stored.id, passage.id);
    for (const field of ["title", "intro", "content"]) {
      assert.equal(stored[field], passage[field], `${passage.id}: ${field}`);
    }
    assert.deepEqual(stored.figure, passage.figure, `${passage.id}: figure`);
    assert.equal(stored.wordCount, passage.content.trim().split(/\s+/).length);
  }
});

test("original Reading passages do not claim unidentified adaptations", () => {
  for (const passage of passages) {
    assert.match(passage.intro, /original/i, passage.id);
    assert.doesNotMatch(passage.intro, /adapted from/i, passage.id);
  }
});

test("the smoke-seed table key follows changes rather than the largest final value", () => {
  const passage = passages.find((p) => p.id === "act-reading-p011");
  const rows = passage.content.split("\n")
    .filter((line) => /^(Actinotus|Grevillea|Eucalyptus|Conospermum)\s*\|/.test(line))
    .map((line) => {
      const [species, ...values] = line.split("|").map((cell) => cell.trim());
      return { species, values: values.map(Number) };
    });
  assert.equal(rows.length, 4);
  const largestChange = rows.reduce((best, row) =>
    row.values[1] - row.values[0] > best.values[1] - best.values[0] ? row : best,
  );
  assert.equal(bank[104].choices[bank[104].correctAnswer], largestChange.species);
  const demanding = rows.find((row) => row.species === "Conospermum");
  assert.ok(demanding.values[1] > demanding.values[0]);
  assert.ok(demanding.values[2] > demanding.values[0]);
  assert.doesNotMatch(passage.content, /Neither treatment\s+alone lifts it above the untreated rate/);
});

test("the illustrated CO2 minimum aligns with September", () => {
  const passage = passages.find((p) => p.id === "act-reading-p018");
  const { validateFigure, hydrateBank } = require("../tools/lib/content");
  assert.deepEqual(validateFigure(passage.figure), []);
  const dots = [...passage.figure.svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"/g)]
    .map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
  assert.equal(dots.length, 12);
  const minimum = dots.reduce((a, b) => a.y > b.y ? a : b);
  assert.match(passage.figure.svg, new RegExp(`<text x="${minimum.x}" y="278" text-anchor="middle">Sep</text>`));
  const altValues = [...passage.figure.alt.matchAll(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ([−\d]+)/g)];
  assert.equal(altValues.length, 12);
  assert.equal(altValues.reduce((a, b) => Number(a[2].replace("−", "-")) < Number(b[2].replace("−", "-")) ? a : b)[1], "Sep");
  assert.doesNotMatch(passage.content, /\*/);
  assert.equal(hydrateBank("act-reading").find((q) => q.id === "act-reading-0173").figure.svg, passage.figure.svg);
  assert.match(bank[172].choices[bank[172].correctAnswer], /^September/);
});

test("the food-access weakening result holds the author's price explanation fixed", () => {
  const question = authored[278].question;
  assert.match(question.stem, /incomes did not change/);
  assert.match(question.key, /without cutting prices/);
  assert.doesNotMatch(question.key, /also cut produce prices/);
});

test("cross-text agreement keeps the metropolitan scope accepted by both writers", () => {
  const question = authored[98].question;
  assert.match(question.stem, /metropolitan area/);
  assert.match(question.key, /at that scale/);
  assert.doesNotMatch(question.key, /within several years/);
});

test("slow-slip teaching distinguishes seismic moment from radiated energy", () => {
  const { passage, question } = authored[368];
  assert.match(passage.content, /seismic moment/);
  assert.match(question.why, /moment from radiated energy/);
  assert.doesNotMatch(question.hint, /same energy/);
});
