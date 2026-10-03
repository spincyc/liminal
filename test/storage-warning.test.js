"use strict";

// App adapter checks with injected storage failures; these do not claim
// native browser, layout, or accessibility coverage.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Progress = require("../src/lib/progress");
const SessionStore = require("../src/lib/session-store");
const Engine = require("../src/lib/test-engine");
const Simulation = require("../src/lib/simulation");

function fixture() {
  const node = () => {
    const classes = new Set(["hidden"]);
    return {
      textContent: "", addEventListener() {}, querySelector() { return null; },
      classList: {
        add: (name) => classes.add(name), remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name),
        toggle(name, force) { if (force) classes.add(name); else classes.delete(name); },
      },
    };
  };
  const nodes = Object.fromEntries(["storageWarning", "storageWarningText", "storageDownloadBtn"].map((id) => [id, node()]));
  const values = new Map();
  const failures = new Set();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem(key, value) {
      if (failures.has(key)) throw new Error("Quota exceeded");
      values.set(key, value);
    },
    removeItem: (key) => values.delete(key),
  };
  const env = { failures, values, nodes, problems: [] };
  const window = {
    console: { warn() {}, error() {} },
    document: { getElementById: (id) => nodes[id], querySelectorAll: () => [] },
    localStorage: storage,
    location: { hash: "#practice" },
    addEventListener() {},
    PRACTICE_CATALOG: { sections: [] },
    PracticeCore: require("../src/lib/core"),
    LiminalProgress: Progress,
    LiminalSessionStore: SessionStore,
    // Saved snapshots already contain the questions; omit network loading.
    LiminalPractice: { ...require("../src/lib/practice"), usesTemplates: () => false },
    LiminalSimulation: Simulation,
    LiminalModules: require("../src/lib/modules"),
    LiminalTestEngine: Engine,
    LiminalSite: { getTest: () => "SAT", onTestChange() {} },
    LiminalShell: {
      start(options) {
        if (env.startError) throw env.startError;
        env.screen = options;
      },
      canResume(snapshot) {
        try { return Boolean(Engine.restore(snapshot.session || snapshot)); } catch (error) { return false; }
      },
    },
    LiminalViews: {},
  };
  window.window = window;
  for (const [factory, name, hash] of [["practice", "setup", "practice"], ["progress", "dashboard", "progress"], ["review", "review", "review"], ["tips", "signs", "tips"]]) {
    window.LiminalViews[factory] = (ctx) => {
      env.ctx = ctx;
      return { name, hash, element: node(), open: (options) => ctx.showView(name, options),
        onSessionChange: (problem) => { if (problem) env.problems.push(problem); } };
    };
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/app/app.js"), "utf8"), window);
  env.ctx.launch({ questions: [], tools: [] });
  env.saveSet = () => env.screen.onSave({ session: {} });
  env.saveProgress = () => env.ctx.update((progress) => ({ ...progress, marked: ["unsaved-question"] }));
  env.warningVisible = () => !nodes.storageWarning.classList.contains("hidden");
  return env;
}

test("a recovered set save does not hide unsaved progress", () => {
  const env = fixture();
  env.failures.add(Progress.STORAGE_KEY);
  assert.equal(env.saveProgress().ok, false);
  env.failures.add(SessionStore.KEYS.set);
  env.saveSet();
  env.failures.delete(SessionStore.KEYS.set);
  env.saveSet();
  assert.equal(env.ctx.store.saved(), false);
  assert.equal(env.values.has(Progress.STORAGE_KEY), false);
  assert.equal(env.warningVisible(), true);
  assert.match(env.nodes.storageWarningText.textContent, /could not save your progress/);
  env.failures.delete(Progress.STORAGE_KEY);
  assert.equal(env.saveProgress().ok, true);
  assert.equal(env.warningVisible(), false);
});

test("a recovered progress save does not hide an unsaved set", () => {
  const env = fixture();
  env.failures.add(SessionStore.KEYS.set);
  env.saveSet();
  env.failures.add(Progress.STORAGE_KEY);
  assert.equal(env.saveProgress().ok, false);
  env.failures.delete(Progress.STORAGE_KEY);
  assert.equal(env.saveProgress().ok, true);
  assert.equal(env.values.has(SessionStore.KEYS.set), false);
  assert.equal(env.warningVisible(), true);
  assert.match(env.nodes.storageWarningText.textContent, /could not save your unfinished set/);
  env.failures.delete(SessionStore.KEYS.set);
  env.saveSet();
  assert.equal(env.warningVisible(), false);
});

const question = {
  id: "sat-math:resume-fixture:1", templateId: "resume-fixture", templateVersion: 1,
  sectionKey: "sat-math", test: "SAT", section: "Math", responseType: "multiple-choice",
  stem: "Choose two.", choices: ["2", "3", "4", "5"], correctAnswer: 0,
  domain: "Algebra", skill: "Linear equations in one variable", difficulty: "Medium",
};

function savedSet() {
  return {
    config: { sessionId: "resume-set", sectionKey: "sat-math", tools: [] }, savedAt: 10,
    state: { schema: "liminal-test-shell", version: 1,
      session: Engine.create({ questions: [question], now: () => 10 }).serialize({ paused: true }) },
  };
}

function savedTest(done = false) {
  const saved = savedSet();
  let simulation = Simulation.beginModule(Simulation.create({ kind: "module", sectionKey: "sat-math", id: "resume-test", seed: "1", now: 10 }), {
    sessionId: "resume-set", questionIds: [question.id], templateIds: [question.templateId], now: 10,
  });
  if (done) simulation = Simulation.finishModule(simulation, {
    sessionId: "resume-set", items: Simulation.compactItems([{ question, response: 0, answered: true, correct: true, timeMs: 100 }]),
    elapsedMs: 100, now: 110,
  });
  saved.config.simulation = simulation;
  if (done) saved.state = null;
  return saved;
}

for (const slot of ["set", "test"]) test(`a transient ${slot} screen failure preserves the saved snapshot for retry`, async () => {
  const env = fixture();
  const original = JSON.stringify(slot === "set" ? savedSet() : savedTest());
  env.values.set(SessionStore.KEYS[slot], original);
  env.startError = new Error("Temporary rendering error");
  const problem = await env.ctx.resume(slot);
  assert.match(problem, /Temporary rendering error/);
  assert.equal(env.values.get(SessionStore.KEYS[slot]), original);
  assert.match(problem, /still saved/);
  env.startError = null;
  assert.equal(await env.ctx.resume(slot), null);
  assert.equal(env.screen.resume.session.questions[0].id, question.id);
});

test("a transient combined-report failure preserves completed module snapshots until retry opens", async () => {
  const env = fixture();
  const original = JSON.stringify(savedTest(true));
  env.values.set(SessionStore.KEYS.test, original);
  env.startError = new Error("Temporary report error");
  await env.ctx.resume("test");
  await new Promise(setImmediate);
  assert.equal(env.values.get(SessionStore.KEYS.test), original);
  assert.ok(env.problems.some((problem) => /Temporary report error/.test(problem) && /still saved/.test(problem)));
  env.startError = null;
  await env.ctx.resume("test");
  await new Promise(setImmediate);
  assert.equal(env.screen.reportSummary.correct, 1);
  assert.equal(env.screen.resume.questions[0].id, question.id);
  assert.equal(env.values.has(SessionStore.KEYS.test), false);
});

test("an invalid snapshot is still removed instead of offered for retry", async () => {
  const env = fixture();
  env.values.set(SessionStore.KEYS.set, JSON.stringify({ config: { sessionId: "invalid" }, state: { schema: "invalid" } }));
  assert.match(await env.ctx.resume("set"), /so it was removed/);
  assert.equal(env.values.has(SessionStore.KEYS.set), false);
});
