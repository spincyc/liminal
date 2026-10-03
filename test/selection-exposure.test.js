"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Runs = require("../src/lib/runs");
const Modules = require("../src/lib/modules");
const Practice = require("../src/lib/practice");
const Progress = require("../src/lib/progress");
const Mask = require("../src/lib/template-mask");
const S = require("../src/lib/families/shared");

const template = (id, bit) => ({ id, bit, difficulty: "Hard", domain: "Algebra", skill: "Linear functions", family: { id } });
const item = (family, stem, scene) => ({ templateId: family.id, stem, scene, responseType: "multiple-choice",
  choices: ["one", "two", "three", "four"], verified: true });
const saveRun = (progress, key, run) => Progress.serveTemplates(progress, key, {
  templateIds: run.templateIds, scenes: run.scenes, itemIdentities: run.itemIdentities, mask: run.servedMaskCode,
});

function realTemplates(key) {
  return Runs.catalogTemplates(require(`../src/lib/families/sat/${key === "sat-math" ? "math" : "reading-writing"}`),
    require(`../content/templates/${key}.json`));
}

test("history avoids shared scenes across template ids and visible Math items without scenes", () => {
  const first = template("first", 0);
  const second = template("second", 1);
  const instantiate = (family, seed) => item(family, `question ${Number(seed.split(".").pop()) % 3}`, null);
  const one = Practice.buildTemplateRun({ sectionKey: "sat-math", templates: [first], count: 1, seed: "a", instantiate });
  let progress = saveRun(Progress.empty(), "sat-math", one);
  const two = Practice.buildTemplateRun({ sectionKey: "sat-math", templates: [second], count: 1, seed: "b", instantiate,
    history: Progress.historyFor(progress, "sat-math") });
  assert.notEqual(two.itemIdentities[0], one.itemIdentities[0]);
  assert.equal(two.questions[0].stem, "question 1");
  assert.deepEqual(two.repeats, []);
  progress = Progress.serveTemplates(progress, "sat-reading-writing", {
    templateIds: [first.id], scenes: { first: "shared-topic" }, itemIdentities: one.itemIdentities,
  });
  const drawn = Runs.drawQuestions([second], "s", (family, seed) => {
    const attempt = Number(seed.split(".").pop());
    return item(family, `different visible question ${attempt}`, attempt === 0 ? "shared-topic" : "fresh-topic");
  }, "", Runs.exposureOptions(Progress.historyFor(progress, "sat-reading-writing")));
  assert.equal(drawn[0].scene, "fresh-topic");
  assert.deepEqual(drawn.repeats, []);
});

test("finite draws preserve count, report reuse, and choose the oldest available item", () => {
  const t = template("finite", 0);
  const instantiate = (family, seed) => item(family, `only-${Number(seed.split(".").pop()) % 2}`, "one-topic");
  const zero = Runs.visibleIdentity(instantiate(t.family, "x.0"));
  const one = Runs.visibleIdentity(instantiate(t.family, "x.1"));
  const run = Practice.buildTemplateRun({ sectionKey: "sat-math", templates: [t], count: 1, seed: "finite", instantiate,
    history: { recentItems: [one, zero], recentScenes: ["one-topic"] } });
  assert.equal(run.questions.length, 1);
  assert.equal(run.questions[0].stem, "only-1");
  assert.equal(run.repeats[0].reason, "candidate-pool-exhausted");
  assert.deepEqual(Practice.runWarnings(run), { repeatedItems: 1, repeatedScenes: 1, missingQuestions: 0, borrowedQuestions: 0 });
  const code = Practice.rebuildRun({ templates: [t], code: run.setCode, instantiate });
  assert.deepEqual(code.questions, run.questions);
  const drill = Practice.buildDrill({ sectionKey: "sat-math", templates: [t], skill: t.skill, difficulty: "Hard",
    count: 5, seed: "finite", instantiate });
  assert.equal(drill.questions.length, 5);
  assert.equal(new Set(drill.itemIdentities).size, 2);
  assert.equal(drill.repeats.filter((entry) => entry.withinRunItem).length, 3);
  assert.equal(drill.shortfall, 0);
  assert.ok(drill.questions.every((question) => question.templateId === t.id));
});

test("visible duplicates under different templates steer, and old unpinned codes retain their original draws", () => {
  const templates = [template("first", 0), template("second", 1)];
  const instantiate = (family, seed) => item(family, `visible-${Number(seed.split(".").pop())}`, null);
  const run = Practice.buildTemplateRun({ sectionKey: "sat-math", templates, count: 2, seed: "old", instantiate });
  assert.equal(new Set(run.itemIdentities).size, 2);
  assert.match(run.code, /-01$/);
  assert.deepEqual(Practice.rebuildRun({ code: run.setCode, templates, instantiate }).questions, run.questions);
  const old = Practice.rebuildRun({ code: "math-3-old", templates, instantiate });
  assert.ok(old.questions.every((question) => question.stem === "visible-0"));
  const pinnedBad = Runs.drawQuestions([templates[0]], "s", () => ({ verified: false }), "", { attempts: { first: 2 } });
  assert.equal(pinnedBad.length, 0);
  assert.equal(pinnedBad.skipped[0].reason, "pinned-unverified");
});

test("successive real sections share print and practice history and retain replay codes", () => {
  for (const key of ["sat-reading-writing", "sat-math"]) {
    const templates = realTemplates(key);
    let progress = Progress.empty();
    const allItems = new Set();
    for (let index = 0; index < 6; index += 1) {
      const history = Progress.historyFor(progress, key);
      const first = Practice.buildModuleRun({ sectionKey: key, module: "1", templates, seed: `online${index}`,
        history, instantiate: S.instantiate });
      assert.equal(first.shortfall, 0);
      first.itemIdentities.forEach((identity) => assert.ok(!allItems.has(identity), `${key} repeats an earlier item`));
      first.itemIdentities.forEach((identity) => allItems.add(identity));
      progress = saveRun(progress, key, first);
      const form = Modules.buildForm({ [key]: templates }, { seed: `print${index}`, slots: [Modules.slot(key, "h")],
        history: { [key]: Progress.historyFor(progress, key) } });
      const drawn = Modules.drawForm(form, S.instantiate);
      assert.equal(drawn.shortfall, 0);
      assert.equal(new Set(drawn.itemIdentities).size, drawn.itemIdentities.length);
      drawn.itemIdentities.forEach((identity) => assert.ok(!allItems.has(identity), `${key} print repeats an earlier item`));
      drawn.itemIdentities.forEach((identity) => allItems.add(identity));
      const again = Modules.drawForm(Modules.rebuildForm({ [key]: templates }, drawn.code), S.instantiate,
        { history: { [key]: Progress.historyFor(progress, key) } });
      assert.deepEqual(again.modules.map((entry) => entry.questions), drawn.modules.map((entry) => entry.questions));
      assert.equal(again.form.drift, false);
      drawn.modules.forEach((entry) => { progress = saveRun(progress, key, entry); });
    }
  }
});

test("successive full Reading and Writing forms keep every blueprint cell and avoid recent exact items", () => {
  const key = "sat-reading-writing";
  const templates = realTemplates(key);
  let progress = Progress.empty();
  for (let index = 0; index < 12; index += 1) {
    const history = Progress.historyFor(progress, key);
    const form = Modules.buildForm({ [key]: templates }, { seed: `seq${index}`, slots: Modules.sectionSlots(key), history: { [key]: history } });
    const drawn = Modules.drawForm(form, S.instantiate);
    assert.deepEqual(drawn.modules.map((entry) => entry.questions.length), [27, 27]);
    assert.equal(new Set(drawn.itemIdentities).size, 54);
    assert.deepEqual(drawn.itemIdentities.filter((identity) => history.recentItems.includes(identity)), []);
    drawn.modules.forEach((entry) => {
      for (const [domain, tiers] of Object.entries(entry.spec.cells)) {
        for (const [tier, wanted] of Object.entries(tiers)) {
          assert.equal(entry.questions.filter((question) => question.domain === domain && question.difficulty === tier).length,
            wanted, `${domain} ${tier}`);
        }
      }
      progress = saveRun(progress, key, entry);
    });
    const replay = Modules.drawForm(Modules.rebuildForm({ [key]: templates }, drawn.code), S.instantiate);
    assert.deepEqual(replay.modules.map((entry) => entry.questions), drawn.modules.map((entry) => entry.questions));
  }
});

test("form attempt codes validate masks, protect attempts with check digits, and preserve old codes", () => {
  const key = "sat-math";
  const templates = [template("first", 0), template("second", 1)];
  const instantiate = (family, seed) => item(family, `visible-${Number(seed.split(".").pop())}`, null);
  const form = Modules.buildForm({ [key]: templates }, { seed: "old", slots: [Modules.slot(key, "1")] });
  const legacy = Modules.drawForm(Modules.rebuildForm({ [key]: templates }, form.code), instantiate);
  assert.ok(legacy.modules[0].questions.every((question) => question.stem === "visible-0"));
  const drawn = Modules.drawForm(form, instantiate);
  assert.equal(new Set(drawn.itemIdentities).size, 2);
  assert.equal(Modules.parseFormCode(drawn.code).attempts[0].length, Mask.size(form.modules[0].mask));
  assert.throws(() => Modules.parseFormCode(`${drawn.code}0`), /attempts do not match/);
  const changed = drawn.code.slice(0, -1) + (drawn.code.endsWith("1") ? "2" : "1");
  assert.equal(Modules.rebuildForm({ [key]: templates }, changed).drift, true);
});
