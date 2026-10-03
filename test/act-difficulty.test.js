"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const core = require("../src/lib/core");

// Run the actual closure-local view functions against controlled DOM/state.
// This isolates filters and rendered text without claiming browser layout or
// accessibility-tree coverage; no production test hooks are needed.
function viewFunctions(file, names, state) {
  const source = fs.readFileSync(path.join(__dirname, "../src/app/views", file), "utf8");
  const functions = names.map((name) => {
    const match = source.match(new RegExp(`^    (?:async )?function ${name}\\([^]*?^    \\}`, "m"));
    assert.ok(match, `View function ${name} exists`);
    return match[0];
  });
  return vm.runInNewContext(`${functions.join("\n")}\n({${names.join(",")}})`, state);
}

class Element {
  constructor(tag = "div", className = "", text = "") {
    this.tag = tag;
    this.className = className;
    this.text = text;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.value = "";
    this.hidden = false;
    this.disabled = false;
    this.classList = { toggle() {}, add() {}, remove() {} };
  }
  append(...children) {
    this.children.push(...children.map((child) => typeof child === "string" ? new Element("text", "", child) : child));
  }
  appendChild(child) { this.append(child); return child; }
  replaceChildren(...children) { this.children = children; this.text = ""; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  get textContent() { return this.text + this.children.map((child) => child.textContent).join(""); }
  set textContent(text) { this.text = String(text); this.children = []; }
}

function descendants(node) {
  return [node, ...node.children.flatMap(descendants)];
}

function practiceFixture() {
  const fieldset = new Element("fieldset");
  const drillFieldset = new Element("fieldset");
  const inputs = ["Easy", "Medium", "Hard"].map((value) => ({ value, checked: value === "Hard", closest: () => fieldset }));
  const drillInputs = [...inputs.map((input) => ({ ...input, closest: () => drillFieldset })),
    { value: "", checked: false, closest: () => drillFieldset }];
  const elements = Object.fromEntries([
    "domain", "skill", "search", "filterHint", "filterSummary", "mode", "drillSection", "drillSkill",
    "drillLevelNote", "drillCount", "drillFeedback", "drillStart", "drillStatus",
  ].map((name) => [name, new Element()]));
  elements.form = { querySelectorAll: () => inputs };
  elements.drillForm = { querySelectorAll: () => drillInputs };
  elements.drillSection.value = "act-mathematics";
  elements.drillSkill.value = "Linear equations";
  elements.drillCount.value = "3";
  elements.mode.value = "targeted";
  const currentBank = ["Easy", "Medium", "Hard"].map((difficulty, index) => ({
    id: `act-mathematics-${index}`, sectionKey: "act-mathematics", difficulty,
    skill: "Linear equations", domain: "Algebra", stem: "Solve the equation.",
  }));
  const state = {
    core, elements, currentBank, DRILL_MAX: 30,
    sectionKey: () => elements.drillSection.value,
    usesTemplates: () => core.supportsDifficulty(elements.drillSection.value),
    reviewIds: () => currentBank.map((q) => q.id),
    Analytics: { skillLevel: () => ({ level: "Medium" }) },
    guide: () => ({ row: () => ({}) }),
    ctx: { levelWords: () => "Next level", confirmReplace: async () => true, setStatus() {},
      startDrill: async (request) => { state.request = request; return request.count; } },
  };
  const functions = viewFunctions("practice.js", [
    "difficultyInputs", "selectedDifficulties", "formFilters", "buildsTemplateRun", "filterUse",
    "activeFilterCount", "renderFilterState", "reviewQuestions", "matchingBankQuestions",
    "drillLevelInputs", "drillLevel", "setDrillLevel", "applyDrillLevel", "drillCount", "startDrill",
  ], state);
  return { ...functions, state, elements, inputs, drillInputs, fieldset, drillFieldset };
}

test("ACT targeted and review filters ignore stale SAT tier selections and hide their controls", () => {
  const f = practiceFixture();
  for (const mode of ["targeted", "missed", "flagged", "mix"]) {
    f.elements.mode.value = mode;
    f.renderFilterState(mode);
    assert.equal(f.fieldset.hidden, true, mode);
    assert.ok(f.inputs.every((input) => input.disabled), mode);
    assert.equal(f.formFilters().difficulties.length, 0, mode);
    assert.equal(f.matchingBankQuestions().length, 3, mode);
  }
  f.elements.mode.value = "targeted";
  f.elements.skill.value = "Different skill";
  assert.equal(f.matchingBankQuestions().length, 0, "topic filters still work");
  f.elements.skill.value = "";
  f.elements.drillSection.value = "sat-math";
  f.renderFilterState("targeted");
  assert.equal(f.fieldset.hidden, false);
  assert.ok(f.inputs.every((input) => !input.disabled));
  assert.deepEqual(Array.from(f.formFilters().difficulties), ["Hard"], "SAT selection is preserved");
});

test("ACT skill drills hide levels and submit no tier even if a stale control is checked", async () => {
  const f = practiceFixture();
  f.applyDrillLevel();
  assert.equal(f.drillFieldset.hidden, true);
  assert.ok(f.drillInputs.every((input) => input.disabled));
  f.drillInputs.forEach((input) => { input.checked = input.value === "Hard"; });
  await f.startDrill({ preventDefault() {} });
  assert.equal(f.state.request.difficulty, null);
  f.elements.drillSection.value = "sat-math";
  f.applyDrillLevel();
  assert.equal(f.drillFieldset.hidden, false);
  assert.ok(f.drillInputs.every((input) => !input.disabled));
  await f.startDrill({ preventDefault() {} });
  assert.equal(f.state.request.difficulty, "Medium");
});

function historyFixture(sectionKey, withHard = true) {
  const history = Object.fromEntries(["note", "legend", "chart", "tableWrap", "more"].map((name) => [name, new Element()]));
  const points = [0, 1].map((index) => ({ sectionKey, title: "Practice", kind: "practice", total: 2,
    finishedAt: index + 1, accuracy: 0.5, hard: { attempted: withHard ? 1 : 0, accuracy: index } }));
  const state = {
    history, model: { tiered: core.supportsDifficulty(sectionKey) },
    TREND_POINTS: 30, TREND_POINTS_NARROW: 15, HISTORY_ROWS: 10, KIND_LABELS: {},
    historyExpanded: false, chartWidth: 0, historyPoints: () => points,
    percent: (value) => `${value * 100}%`, sectionName: (key) => key, dayLabel: (value) => String(value),
    count: (value, noun) => `${value} ${noun}s`, ctx: { formatNumber: String, formatDuration: String },
    el: (tag, className, text) => new Element(tag, className, text),
    svg: (tag, attrs) => { const node = new Element(tag); node.attributes = attrs || {}; return node; },
  };
  const functions = viewFunctions("progress.js", ["renderHistory", "renderHistoryTable", "drawTrend"], state);
  return { ...functions, history, points };
}

test("ACT history suppresses Hard figures in visible text, chart labels and point tooltips", () => {
  for (const sectionKey of ["act-mathematics", "act-reading", "sat-math"]) {
    for (const withHard of [true, false]) {
      const f = historyFixture(sectionKey, withHard);
      f.renderHistory();
      const sat = core.supportsDifficulty(sectionKey);
      assert.equal(/Hard/.test(f.history.note.textContent), sat);
      assert.equal(/Hard/.test(f.history.tableWrap.textContent), sat);
      assert.equal(/Hard/.test(f.history.legend.textContent), sat);
      const nodes = descendants(f.history.chart);
      const chart = nodes.find((node) => node.tag === "svg");
      assert.equal(/Hard/.test(chart.attributes["aria-label"]), sat);
      const titles = nodes.filter((node) => node.tag === "title").map((node) => node.textContent);
      assert.ok(titles.length >= 2);
      assert.equal(titles.some((text) => /Hard/.test(text)), sat && withHard);
      assert.match(chart.attributes["aria-label"], /50%/, "overall accuracy remains available");
      f.points.length = 0;
      f.renderHistory();
      assert.equal(/Hard/.test(f.history.note.textContent), sat, "empty history copy");
    }
  }
});
