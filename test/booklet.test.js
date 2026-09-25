"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const core = require("../src/lib/core");
const booklet = require("../src/lib/booklet");

function makeBank(sectionKey, count, offset) {
  const difficulties = ["Easy", "Medium", "Hard"];
  return Array.from({ length: count }, (unused, index) => ({
    id: `${sectionKey}-${String(index + offset).padStart(4, "0")}`,
    test: sectionKey.startsWith("sat") ? "SAT" : "ACT",
    sectionKey,
    section: sectionKey,
    domain: "Algebra",
    skill: "Linear equations",
    subskill: "solve",
    difficulty: difficulties[index % 3],
    responseType: "multiple-choice",
    stem: `Question ${index + offset}?`,
    choices: ["one", "two", "three", "four"],
    correctAnswer: index % 4,
    explanation: "Because.",
    solutionSteps: ["Step one."],
    distractorRationales: [0, 1, 2, 3]
      .filter((choice) => choice !== index % 4)
      .map((choice) => ({ index: choice, reason: "Wrong." })),
    trap: "A trap.",
    stimulus: null,
  }));
}

const bankBySection = {
  "sat-reading-writing": makeBank("sat-reading-writing", 200, 1),
  "sat-math": makeBank("sat-math", 200, 1),
};

const blueprint = core.blueprintById("sat-full");

test("full-length blueprints match the official section structure", () => {
  assert.equal(core.blueprintTotal(blueprint), 98);
  assert.equal(core.blueprintTotal(core.blueprintById("act-full")), 131);
  assert.equal(core.blueprintTotal(core.blueprintById("act-full-science")), 171);
});

test("buildTestForm never repeats a question across modules of one bank", () => {
  const form = core.buildTestForm(bankBySection, blueprint, "seed-a");
  const ids = form.flatMap((group) => group.questions.map((question) => question.id));
  assert.equal(ids.length, 98);
  assert.equal(new Set(ids).size, 98, "every drawn question must be distinct");
});

test("buildTestForm fills every section to its requested count", () => {
  const form = core.buildTestForm(bankBySection, blueprint, "seed-b");
  form.forEach((group) => {
    assert.equal(group.questions.length, group.entry.count, group.label);
  });
});

test("buildTestForm is deterministic for a seed and varies across seeds", () => {
  const first = core.buildTestForm(bankBySection, blueprint, "same");
  const second = core.buildTestForm(bankBySection, blueprint, "same");
  const other = core.buildTestForm(bankBySection, blueprint, "different");
  const ids = (form) => form.flatMap((g) => g.questions.map((q) => q.id)).join(",");
  assert.equal(ids(first), ids(second));
  assert.notEqual(ids(first), ids(other));
});

test("SAT keeps A-D labels and the ACT alternates F-J on even questions", () => {
  assert.deepEqual(core.answerLetters("SAT", 1), ["A", "B", "C", "D"]);
  assert.deepEqual(core.answerLetters("SAT", 2), ["A", "B", "C", "D"]);
  assert.deepEqual(core.answerLetters("ACT", 1), ["A", "B", "C", "D"]);
  assert.deepEqual(core.answerLetters("ACT", 2), ["F", "G", "H", "J"]);
  assert.deepEqual(core.answerLetters("ACT", 3), ["A", "B", "C", "D"]);
});

test("booklet numbering runs continuously and keys the right letter", () => {
  const form = core.buildTestForm(bankBySection, blueprint, "seed-c");
  const model = booklet.buildModel(form, blueprint, "seed-c");
  const items = model.sections.flatMap((section) => section.questions);
  assert.equal(model.total, 98);
  items.forEach((item, index) => {
    assert.equal(item.number, index + 1);
    assert.equal(item.correctLetter, item.letters[item.question.correctAnswer]);
  });
  assert.equal(model.minutes, 134);
});

test("form codes are stable per seed", () => {
  assert.equal(booklet.formCode("seed-c"), booklet.formCode("seed-c"));
  assert.notEqual(booklet.formCode("seed-c"), booklet.formCode("seed-d"));
});

test("one shared seed gives each blueprint its own form code", () => {
  const codes = core.ALL_BLUEPRINTS.map((candidate) => {
    const form = candidate.sections.map((entry) => ({
      entry,
      label: entry.label,
      minutes: entry.minutes,
      directions: entry.directions,
      questions: [],
    }));
    return booklet.buildModel(form, candidate, "shared").formCode;
  });
  assert.equal(new Set(codes).size, codes.length, `form codes collided: ${codes}`);
});

test("a shared seed rebuilds a byte-identical booklet", () => {
  const render = (seed) => {
    const form = core.buildTestForm(bankBySection, blueprint, seed);
    return booklet.renderBookletHtml(booklet.buildModel(form, blueprint, seed));
  };
  assert.equal(render("shared-link"), render("shared-link"));
  assert.notEqual(render("shared-link"), render("other-link"));
});

test("stimulus text splits into paragraphs, tables, and lists", () => {
  const blocks = booklet.parseBlocks(
    "Intro line.\n\nPeriod | Count\nFirst | 48\nThird | 62\n\n• alpha\n• beta",
  );
  assert.deepEqual(blocks.map((block) => block.type), ["text", "table", "list"]);
  assert.deepEqual(blocks[1].rows[0], ["Period", "Count"]);
  assert.deepEqual(blocks[2].items, ["alpha", "beta"]);
});

test("pipe tables render as real HTML tables", () => {
  const html = booklet.blocksToHtml("Thickness | Loss\n3 | 37\n6 | 34");
  assert.match(html, /<table class="data">/);
  assert.match(html, /<th>Thickness<\/th>/);
  assert.match(html, /<td>37<\/td>/);
});

test("LaTeX escaping emits no raw Unicode and protects specials", () => {
  const source = "50% of x² − 3 ≤ π, “quoted” — ends with √9 and 5 × 2 & more_stuff";
  const out = booklet.tex(source);
  assert.match(out, /\\%/);
  assert.match(out, /\\textsuperscript\{2\}/);
  assert.match(out, /\$-\$/);
  assert.match(out, /\$\\leq\$/);
  assert.match(out, /\$\\pi\$/);
  assert.match(out, /``quoted''/);
  assert.match(out, /---/);
  assert.match(out, /\$\\sqrt\{9\}\$/);
  assert.match(out, /\$\\times\$/);
  assert.match(out, /\\&/);
  assert.match(out, /\\_/);
  assert.ok(
    !/[^\x00-\x7F]/.test(out),
    `LaTeX output must stay ASCII, got: ${out}`,
  );
});

// ACT booklets draw from the fixed banks. SAT booklets are built from
// templates (see the template-form tests below and test/modules.test.js).
test("full ACT blueprints fit the real catalog and the real banks", () => {
  const { loadCatalog, loadBank } = require("../tools/lib/content");
  const known = new Set(loadCatalog().sections.map((section) => section.key));
  const scoreable = new Map();

  for (const blueprint of core.FULL_TEST_BLUEPRINTS.filter((entry) => entry.test === "ACT")) {
    assert.ok(blueprint.id && blueprint.label && blueprint.minutes > 0);
    const demand = new Map();
    for (const entry of blueprint.sections) {
      assert.ok(
        known.has(entry.sectionKey),
        `${blueprint.id} references unknown section ${entry.sectionKey}`,
      );
      assert.ok(entry.count > 0 && entry.minutes > 0 && entry.label && entry.directions);
      demand.set(entry.sectionKey, (demand.get(entry.sectionKey) || 0) + entry.count);
    }
    // Modules that share a bank draw without replacement, so the bank must
    // cover their combined demand, not just the largest single module.
    for (const [sectionKey, needed] of demand) {
      if (!scoreable.has(sectionKey)) {
        scoreable.set(
          sectionKey,
          loadBank(sectionKey).filter((question) => question.responseType !== "essay")
            .length,
        );
      }
      assert.ok(
        scoreable.get(sectionKey) >= needed,
        `${blueprint.id} needs ${needed} ${sectionKey} items but the bank has ` +
          `${scoreable.get(sectionKey)}`,
      );
    }
  }
});

test("rendered booklet and key cover every question", () => {
  const form = core.buildTestForm(bankBySection, blueprint, "seed-e");
  const model = booklet.buildModel(form, blueprint, "seed-e");
  const html = booklet.renderBookletHtml(model);
  const key = booklet.renderKeyHtml(model);
  assert.equal((html.match(/class="q"/g) || []).length, 98);
  assert.match(html, /Answer sheet/);
  assert.equal((key.match(/Correct answer:/g) || []).length, 98);
  const texOut = booklet.renderTex(model);
  assert.equal((texOut.match(/\\question\{/g) || []).length, 98);
  assert.ok(!/[^\x00-\x7F]/.test(texOut), "LaTeX source must stay ASCII");
});

/* ------------------------------------------------ template forms (SAT) */

function richQuestion(overrides) {
  return {
    id: "sat-math:t:k3.t.0",
    sectionKey: "sat-math",
    domain: "Algebra",
    skill: "Linear functions",
    difficulty: "Hard",
    responseType: "multiple-choice",
    stem: 'Which "value" <b>fits</b>?',
    choices: ["1", "2", "3", "4"],
    correctAnswer: 2,
    explanation: "Because.",
    solutionSteps: ["One.", "Two."],
    distractorRationales: [{ index: 0, reason: "Stops early." }],
    trap: "A trap.",
    stimulus: null,
    figure: null,
    ...overrides,
  };
}

// Stands in for app/render.js, which needs a DOM.
const fakeRender = {
  rich: (text) => `<div class="lm-rich"><p>${booklet.escapeHtml(text)}</p></div>`,
  stimulus: (stimulus) => `<div class="lm-stimulus"><p>${booklet.escapeHtml(stimulus.content)}</p></div>`,
  figure: (figure) => `<figure class="lm-figure">${booklet.escapeHtml(figure.alt)}</figure>`,
};

const satBlueprint = {
  id: "sat-math",
  test: "SAT",
  label: "SAT Math section",
  summary: "Two modules.",
  notes: ["Module 2 here is the harder route."],
  breakAfter: null,
  minutes: 70,
};

function richModel() {
  const groups = [
    {
      label: "Math — Module 1",
      minutes: 35,
      directions: "Calculator allowed.",
      questions: [
        richQuestion(),
        richQuestion({
          id: "sat-math:u:k3.u.0",
          responseType: "numeric",
          choices: null,
          correctAnswer: "7/3",
          distractorRationales: null,
          figure: { svg: "<svg></svg>", alt: "A triangle", notToScale: true },
        }),
      ],
    },
    {
      label: "Math — Module 2, harder route",
      minutes: 35,
      directions: "Calculator allowed.",
      questions: [richQuestion({ id: "sat-math:v:k3.v.0", stimulus: { type: "table", content: "x | y\n1 | 2" } })],
    },
  ];
  return booklet.buildModel(groups, satBlueprint, "k3", { code: "m1mh-k3-1.2-abcd" });
}

test("template forms render through the page's renderer, with the key at the end", () => {
  const model = richModel();
  assert.equal(model.code, "m1mh-k3-1.2-abcd");
  assert.equal(model.formCode, booklet.formCode("m1mh-k3-1.2-abcd"));
  const html = booklet.renderBookletHtml(model, { render: fakeRender, key: true });
  assert.equal((html.match(/<article class="q rich"/g) || []).length, 3);
  assert.match(html, /<div class="figure"><figure class="lm-figure">A triangle<\/figure><\/div>/);
  assert.match(html, /<div class="stimulus table"><div class="lm-stimulus">/);
  assert.match(html, /Which &quot;value&quot; &lt;b&gt;fits&lt;\/b&gt;\?/);
  assert.ok(!html.includes("<b>fits"), "content must never reach the booklet as markup");
  assert.match(html, /<code>m1mh-k3-1\.2-abcd<\/code>/);
  assert.match(html, /Module 2 here is the harder route\./);
  assert.ok(!html.includes("ten-minute break"), "one section has no break");
  // Bubbles for choices, a box for the student-produced response.
  assert.equal((html.match(/class="write-in"/g) || []).length, 1);
  assert.equal((html.match(/class="bubble"/g) || []).length, 8);
  // The key and explanations follow the answer sheet.
  const sheet = html.indexOf("Answer sheet — form");
  const key = html.indexOf("Answer key — form");
  assert.ok(sheet > 0 && key > sheet);
  assert.equal((html.match(/Correct answer:/g) || []).length, 3);
  assert.match(html, /Correct answer: 7\/3/);
  assert.match(html, /<li class="inline">A\. <div class="lm-rich"><p>Stops early\.<\/p><\/div><\/li>/);

  const keyOnly = booklet.renderKeyHtml(model, { render: fakeRender });
  assert.match(keyOnly, /<code>m1mh-k3-1\.2-abcd<\/code>/);
  assert.equal((keyOnly.match(/Correct answer:/g) || []).length, 3);
  assert.ok(!keyOnly.includes('<article class="q'), "the key alone prints no questions");
});

test("without a renderer, text is escaped and no figure markup is emitted", () => {
  const html = booklet.renderBookletHtml(richModel());
  assert.equal((html.match(/<article class="q"/g) || []).length, 3);
  assert.ok(!html.includes("<figure") && !html.includes('<div class="figure">'));
  assert.match(html, /<p class="stem"><span class="num">1\.<\/span> Which &quot;value&quot;/);
  assert.ok(!html.includes("Answer key — form"), "the key is opt-in");
});

test("the break direction prints only for a form with a break", () => {
  const empty = (blueprint) => blueprint.sections.map((entry) => ({
    entry, label: entry.label, minutes: entry.minutes, directions: entry.directions, questions: [],
  }));
  const full = core.blueprintById("act-full");
  const mini = core.blueprintById("act");
  const fullModel = booklet.buildModel(empty(full), full, "s");
  const miniModel = booklet.buildModel(empty(mini), mini, "s");
  assert.match(booklet.renderBookletHtml(fullModel), /ten-minute break after\s+Mathematics/);
  assert.match(booklet.renderTex(fullModel), /ten-minute break after Mathematics/);
  assert.ok(!booklet.renderBookletHtml(miniModel).includes("ten-minute break"));
  assert.ok(!booklet.renderTex(miniModel).includes("ten-minute break"));
});

test("escapeHtml escapes quotes as well as markup", () => {
  assert.equal(booklet.escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
});

test("a real template form fills a 98-question booklet", () => {
  const Runs = require("../src/lib/runs");
  const Modules = require("../src/lib/modules");
  const S = require("../src/lib/families/shared");
  const sections = {
    "sat-math": Runs.catalogTemplates(require("../src/lib/families/sat/math"), require("../content/templates/sat-math.json")),
    "sat-reading-writing": Runs.catalogTemplates(
      require("../src/lib/families/sat/reading-writing"),
      require("../content/templates/sat-reading-writing.json"),
    ),
  };
  const form = Modules.buildForm(sections, { seed: "booklet" });
  const drawn = Modules.drawForm(form, S.instantiate);
  const groups = drawn.modules.map((entry) => ({
    label: entry.label, minutes: entry.minutes, directions: entry.directions, questions: entry.questions,
  }));
  const model = booklet.buildModel(groups, { ...satBlueprint, breakAfter: form.breakAfter }, form.seed, { code: form.code });
  assert.equal(model.total, 98);
  assert.equal(model.minutes, 134);
  const html = booklet.renderBookletHtml(model, { key: true });
  assert.equal((html.match(/<article class="q"/g) || []).length, 98);
  assert.equal((html.match(/Correct answer:/g) || []).length, 98);
  assert.match(html, /ten-minute break after\s+Reading and Writing — Module 2/);
  const numeric = drawn.modules.flatMap((entry) => entry.questions).filter((question) => question.responseType === "numeric").length;
  assert.equal((html.match(/class="write-in"/g) || []).length, numeric);
});

test("the booklet CLI builds ACT only and points SAT to the Booklets page", () => {
  const { spawnSync } = require("node:child_process");
  const path = require("node:path");
  const result = spawnSync(process.execPath, [path.join(__dirname, "..", "tools", "build-booklet.js"), "--form", "sat-full"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /print\.html/);
});

/* ------------------------------------------------- repetition prevention */

function familyBank(count) {
  return Array.from({ length: count }, (unused, index) => ({
    id: `fam-${String(index).padStart(3, "0")}`,
    sectionKey: "sat-math",
    skill: "Linear equations",
    subskill: "solve",
    difficulty: "Medium",
    responseType: "multiple-choice",
    // Ten items per family, so a naive shuffle would clump.
    tags: [`family:shape-${Math.floor(index / 10)}`],
  }));
}

test("questionFamily prefers the generator tag over the taxonomy", () => {
  assert.equal(
    core.questionFamily({ tags: ["family:sat-math/quadratic/hard"], sectionKey: "x" }),
    "sat-math/quadratic/hard",
  );
  assert.equal(
    core.questionFamily({ tags: [], sectionKey: "sat-math", skill: "S", subskill: "u" }),
    "sat-math|S|u",
  );
});

test("a session avoids recently served questions", () => {
  const bank = familyBank(100);
  const first = core.buildSession(bank, 10, "seed-1");
  const second = core.buildSession(bank, 10, "seed-1", {
    avoidIds: first.map((question) => question.id),
  });
  const overlap = second.filter((question) =>
    first.some((earlier) => earlier.id === question.id),
  );
  assert.equal(overlap.length, 0, "a rebuilt session must not recycle served items");
  assert.equal(second.length, 10);
});

test("history relaxes rather than starving a small pool", () => {
  const bank = familyBank(12);
  const served = bank.slice(0, 10).map((question) => question.id);
  const session = core.buildSession(bank, 10, "seed-2", { avoidIds: served });
  assert.equal(session.length, 10, "must still fill the requested length");
  assert.equal(new Set(session.map((q) => q.id)).size, 10, "and stay distinct");
});

test("a session spreads across template families", () => {
  const bank = familyBank(100);
  const session = core.buildSession(bank, 10, "seed-3");
  const families = session.map((question) => core.questionFamily(question));
  assert.equal(
    new Set(families).size,
    10,
    `expected one item per family, got ${JSON.stringify(families)}`,
  );
});

test("no single family dominates even when the pool is skewed", () => {
  // 40 items of one family, 6 of another: the session must not be all of one.
  const skewed = [
    ...Array.from({ length: 40 }, (unused, index) => ({
      id: `big-${index}`, tags: ["family:big"], sectionKey: "s", skill: "k", subskill: "u",
    })),
    ...Array.from({ length: 6 }, (unused, index) => ({
      id: `small-${index}`, tags: ["family:small"], sectionKey: "s", skill: "k", subskill: "u",
    })),
  ];
  const session = core.buildSession(skewed, 10, "seed-4");
  const big = session.filter((q) => q.id.startsWith("big")).length;
  assert.ok(big <= 6, `one family took ${big} of 10 slots`);
});

test("review sessions can opt out of both constraints", () => {
  const bank = familyBank(30);
  const session = core.buildSession(bank, 5, "seed-5", { spreadFamilies: false });
  assert.equal(session.length, 5);
});

test("buildSession still honours its original contract", () => {
  const bank = familyBank(30);
  assert.equal(core.buildSession(bank, "all", "s").length, 30);
  assert.equal(core.buildSession(bank, 7, "s").length, 7);
  const a = core.buildSession(bank, 7, "same");
  const b = core.buildSession(bank, 7, "same");
  assert.deepEqual(a.map((q) => q.id), b.map((q) => q.id), "must stay deterministic");
});
