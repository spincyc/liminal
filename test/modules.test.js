"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Mask = require("../src/lib/template-mask");
const Runs = require("../src/lib/runs");
const Modules = require("../src/lib/modules");
const S = require("../src/lib/families/shared");

const RW = "sat-reading-writing";
const MATH = "sat-math";

function realTemplates() {
  return {
    [MATH]: Runs.catalogTemplates(require("../src/lib/families/sat/math"), require("../content/templates/sat-math.json")),
    [RW]: Runs.catalogTemplates(
      require("../src/lib/families/sat/reading-writing"),
      require("../content/templates/sat-reading-writing.json"),
    ),
  };
}

// `perCell` templates in every domain x tier cell of a section, three skills
// per domain, bits numbered from `firstBit`.
function fakeSection(sectionKey, perCell, firstBit) {
  const templates = [];
  Modules.SECTIONS[sectionKey].domains.forEach((domain, domainIndex) => {
    Modules.TIERS.forEach((tier) => {
      for (let index = 0; index < perCell; index += 1) {
        const id = `${sectionKey.slice(4, 8)}-${domainIndex}-${tier[0]}-${index}`;
        templates.push({
          id,
          bit: (firstBit || 0) + templates.length,
          domain: domain.name,
          difficulty: tier,
          skill: `${domain.name} skill ${index % 3}`,
          family: { id },
        });
      }
    });
  });
  return templates;
}

function countBy(templates, key) {
  return templates.reduce((counts, template) => {
    counts[template[key]] = (counts[template[key]] || 0) + 1;
    return counts;
  }, {});
}

function cellsOf(templates) {
  const cells = {};
  templates.forEach((template) => {
    cells[template.domain] = cells[template.domain] || {};
    cells[template.domain][template.difficulty] = (cells[template.domain][template.difficulty] || 0) + 1;
  });
  return cells;
}

/* ------------------------------------------------------------ blueprint */

test("module specs keep the official lengths, times, and domain counts", () => {
  for (const [sectionKey, size, minutes] of [[RW, 27, 32], [MATH, 22, 35]]) {
    for (const key of ["1", "h", "e"]) {
      const spec = Modules.moduleSpec(sectionKey, key);
      assert.equal(spec.size, size);
      assert.equal(spec.minutes, minutes);
      const tiers = { Easy: 0, Medium: 0, Hard: 0 };
      spec.domains.forEach((domain) => {
        const row = spec.cells[domain.name];
        assert.equal(row.Easy + row.Medium + row.Hard, domain.count, `${spec.label} ${domain.name}`);
        Modules.TIERS.forEach((tier) => {
          tiers[tier] += row[tier];
          // Controlled rounding: every cell within one of its proportional share.
          const share = (domain.count * spec.mix[tier]) / size;
          assert.ok(row[tier] >= Math.floor(share) && row[tier] <= Math.ceil(share), `${spec.label} ${domain.name} ${tier}`);
        });
      });
      assert.deepEqual(tiers, spec.mix, spec.label);
    }
  }
  assert.deepEqual(
    Modules.SECTIONS[MATH].domains.map((domain) => domain.count),
    [8, 8, 3, 3],
  );
  assert.deepEqual(
    Modules.SECTIONS[RW].domains.map((domain) => domain.name),
    ["Craft and Structure", "Information and Ideas", "Standard English Conventions", "Expression of Ideas"],
  );
});

test("the domain x tier split is pinned, so a change to it is deliberate", () => {
  const table = (sectionKey, key) => Object.values(Modules.moduleSpec(sectionKey, key).cells)
    .map((row) => `${row.Easy}/${row.Medium}/${row.Hard}`).join(" ");
  assert.equal(table(RW, "1"), "3/3/2 3/2/2 2/2/3 1/2/2");
  assert.equal(table(RW, "h"), "1/3/4 1/3/3 1/2/4 0/2/3");
  assert.equal(table(RW, "e"), "3/4/1 3/3/1 3/3/1 2/2/1");
  assert.equal(table(MATH, "1"), "3/3/2 2/3/3 1/1/1 1/1/1");
  assert.equal(table(MATH, "h"), "1/3/4 1/3/4 0/1/2 0/1/2");
  assert.equal(table(MATH, "e"), "3/4/1 3/4/1 2/1/0 1/1/1");
});

test("cellCounts rejects a mix that disagrees with the domain counts", () => {
  assert.throws(() => Modules.cellCounts([{ name: "a", count: 3 }], { Easy: 1, Medium: 1, Hard: 0 }), RangeError);
});

/* -------------------------------------------------------------- choosing */

test("a module fills every domain x tier cell from its own tier when it can", () => {
  const templates = fakeSection(MATH, 6);
  for (const key of ["1", "h", "e"]) {
    const spec = Modules.moduleSpec(MATH, key);
    const chosen = Modules.chooseModule(templates, spec, { seed: "s1" });
    assert.equal(chosen.templates.length, 22);
    assert.equal(new Set(chosen.templates.map((template) => template.id)).size, 22);
    assert.equal(Mask.size(chosen.mask), 22);
    assert.deepEqual(chosen.shortfalls, []);
    const cells = cellsOf(chosen.templates);
    spec.domains.forEach((domain) => {
      Modules.TIERS.forEach((tier) => {
        assert.equal((cells[domain.name] || {})[tier] || 0, spec.cells[domain.name][tier], `${key} ${domain.name} ${tier}`);
      });
    });
  }
});

test("a module spreads a cell's picks across skills", () => {
  const templates = fakeSection(RW, 6);
  const spec = Modules.moduleSpec(RW, "h");
  const chosen = Modules.chooseModule(templates, spec, { seed: "spread" });
  const hard = chosen.templates.filter((template) => template.domain === "Craft and Structure" && template.difficulty === "Hard");
  assert.equal(hard.length, 4);
  // Three skills in the domain: four picks use all three, none more than twice.
  const uses = Object.values(countBy(chosen.templates.filter((template) => template.domain === "Craft and Structure"), "skill"));
  assert.equal(uses.length, 3);
  assert.ok(Math.max(...uses) - Math.min(...uses) <= 1, `skill uses ${uses}`);
});

test("a short cell borrows from the nearest tier of its domain and reports it", () => {
  // Algebra: 1 Easy, 5 Medium, no Hard. Module 1 wants 3 / 3 / 2.
  const templates = fakeSection(MATH, 4).filter((template) => template.domain !== "Algebra");
  const algebra = (tier, count) => Array.from({ length: count }, (unused, index) => ({
    id: `alg-${tier}-${index}`,
    bit: 500 + templates.length + index + (tier === "Medium" ? 50 : 0),
    domain: "Algebra",
    difficulty: tier,
    skill: `alg skill ${index}`,
    family: { id: `alg-${tier}-${index}` },
  }));
  const pool = templates.concat(algebra("Easy", 1), algebra("Medium", 5));
  const spec = Modules.moduleSpec(MATH, "1");
  const chosen = Modules.chooseModule(pool, spec, { seed: "thin" });
  assert.deepEqual(chosen.shortfalls, [
    {
      sectionKey: MATH, module: "1", domain: "Algebra", tier: "Easy",
      wanted: 3, filled: 1, borrowed: [{ tier: "Medium", count: 2 }], missing: 0,
    },
    {
      sectionKey: MATH, module: "1", domain: "Algebra", tier: "Hard",
      wanted: 2, filled: 0, borrowed: [], missing: 2,
    },
  ]);
  // Borrowing never takes a cell's own templates: Medium keeps its 3.
  const cells = cellsOf(chosen.templates);
  assert.deepEqual(cells.Algebra, { Easy: 1, Medium: 5 });
  // Never across domains: the module is short by the two missing.
  assert.equal(chosen.templates.length, 20);
  assert.equal(countBy(chosen.templates, "domain").Algebra, 6);
});

test("Medium borrows Hard before Easy", () => {
  // Advanced Math has no Medium templates; Module 1 wants 2 / 3 / 3.
  const templates = fakeSection(MATH, 6).filter((template) =>
    !(template.domain === "Advanced Math" && template.difficulty === "Medium"));
  const spec = Modules.moduleSpec(MATH, "1");
  const report = Modules.chooseModule(templates, spec, { seed: "m" }).shortfalls
    .find((entry) => entry.domain === "Advanced Math");
  assert.equal(report.tier, "Medium");
  // Hard has 6: its own cell takes 3 first, and Medium borrows the other 3.
  assert.deepEqual(report.borrowed, [{ tier: "Hard", count: 3 }]);
  assert.equal(report.missing, 0);
  // With only 3 Hard, the Hard cell keeps them all and Medium falls to Easy.
  const fewerHard = templates.filter((template) =>
    !(template.domain === "Advanced Math" && template.difficulty === "Hard" && /-[345]$/.test(template.id)));
  const again = Modules.chooseModule(fewerHard, spec, { seed: "m" });
  assert.deepEqual(again.shortfalls.find((entry) => entry.domain === "Advanced Math").borrowed, [{ tier: "Easy", count: 3 }]);
  assert.deepEqual(cellsOf(again.templates)["Advanced Math"], { Easy: 5, Hard: 3 });
});

test("a domain with no templates leaves the module short and says so", () => {
  const templates = fakeSection(RW, 5).filter((template) => template.domain !== "Expression of Ideas");
  const chosen = Modules.chooseModule(templates, Modules.moduleSpec(RW, "1"), { seed: "x" });
  assert.equal(chosen.templates.length, 22);
  const missing = chosen.shortfalls.filter((entry) => entry.domain === "Expression of Ideas");
  assert.equal(missing.reduce((sum, entry) => sum + entry.missing, 0), 5);
  assert.ok(chosen.shortfalls.every((entry) => entry.domain === "Expression of Ideas"));
});

test("an empty pool builds an empty module rather than failing", () => {
  const chosen = Modules.chooseModule([], Modules.moduleSpec(MATH, "h"), { seed: "none" });
  assert.equal(chosen.templates.length, 0);
  assert.equal(chosen.mask, Mask.EMPTY);
  assert.equal(chosen.shortfalls.reduce((sum, entry) => sum + entry.missing, 0), 22);
});

test("excluded templates are never chosen", () => {
  const templates = fakeSection(MATH, 3);
  const spec = Modules.moduleSpec(MATH, "1");
  const first = Modules.chooseModule(templates, spec, { seed: "e" });
  const exclude = new Set(first.templates.map((template) => template.id));
  const second = Modules.chooseModule(templates, spec, { seed: "e", exclude });
  assert.ok(second.templates.every((template) => !exclude.has(template.id)));
});

test("choosing is deterministic for a seed and varies across seeds", () => {
  const templates = fakeSection(RW, 6);
  const spec = Modules.moduleSpec(RW, "1");
  const ids = (seed) => Modules.chooseModule(templates, spec, { seed }).templates.map((template) => template.id).join(",");
  assert.equal(ids("same"), ids("same"));
  assert.notEqual(ids("same"), ids("other"));
  // Input order does not matter.
  const reversed = Modules.chooseModule(templates.slice().reverse(), spec, { seed: "same" })
    .templates.map((template) => template.id).join(",");
  assert.equal(reversed, ids("same"));
});

/* -------------------------------------------------------------- ordering */

test("Reading and Writing runs by domain in official order, Easy to Hard within each", () => {
  const chosen = Modules.chooseModule(fakeSection(RW, 6), Modules.moduleSpec(RW, "1"), { seed: "o" });
  const domains = Modules.SECTIONS[RW].domains.map((domain) => domain.name);
  const keys = chosen.templates.map((template) =>
    domains.indexOf(template.domain) * 10 + Modules.TIERS.indexOf(template.difficulty));
  assert.deepEqual(keys, keys.slice().sort((a, b) => a - b));
  assert.equal(chosen.templates[0].domain, "Craft and Structure");
  assert.equal(chosen.templates[26].domain, "Expression of Ideas");
});

test("Math runs Easy, Medium, Hard, shuffled by seed within each tier", () => {
  const templates = fakeSection(MATH, 6);
  const spec = Modules.moduleSpec(MATH, "1");
  const first = Modules.chooseModule(templates, spec, { seed: "a" }).templates;
  const tiers = first.map((template) => Modules.TIERS.indexOf(template.difficulty));
  assert.deepEqual(tiers, tiers.slice().sort((a, b) => a - b));
  // The same templates under another seed come out in another order within a tier.
  const reordered = Modules.orderModule(first, MATH, "b");
  assert.deepEqual(reordered.map((template) => template.difficulty), first.map((template) => template.difficulty));
  assert.notDeepEqual(reordered.map((template) => template.id), first.map((template) => template.id));
  // Domains are mixed within a tier, not grouped.
  const easyDomains = first.filter((template) => template.difficulty === "Easy").map((template) => template.domain);
  assert.ok(new Set(easyDomains).size > 1);
});

/* ------------------------------------------------------------------ forms */

test("a full-length form has four modules, never repeats a template, and breaks between sections", () => {
  const sections = { [RW]: fakeSection(RW, 6), [MATH]: fakeSection(MATH, 6) };
  const form = Modules.buildForm(sections, { seed: "Full-1" });
  assert.equal(form.seed, "full1");
  assert.equal(form.tag, "r1rhm1mh");
  assert.deepEqual(form.modules.map((entry) => entry.templates.length), [27, 27, 22, 22]);
  assert.deepEqual(form.modules.map((entry) => entry.label), [
    "Reading and Writing — Module 1",
    "Reading and Writing — Module 2",
    "Math — Module 1",
    "Math — Module 2",
  ]);
  assert.deepEqual(form.modules.map((entry) => entry.route), [null, "harder", null, "harder"]);
  assert.equal(form.breakAfter, 1);
  assert.equal(form.minutes, 134);
  [RW, MATH].forEach((sectionKey) => {
    const ids = form.modules.filter((entry) => entry.sectionKey === sectionKey)
      .flatMap((entry) => entry.templates.map((template) => template.id));
    assert.equal(new Set(ids).size, ids.length, `${sectionKey} repeated a template`);
  });
  const wide = { [RW]: fakeSection(RW, 8), [MATH]: fakeSection(MATH, 8) };
  const easier = Modules.buildForm(wide, { seed: "full1", route: "e" });
  assert.deepEqual(easier.shortfalls, []);
  assert.equal(easier.tag, "r1rem1me");
  assert.equal(countBy(easier.modules[3].templates, "difficulty").Hard, 3);
});

test("a thin section borrows across the whole form without repeating", () => {
  // Two per cell: Module 2 (harder) can't find 4 Hard Craft and Structure
  // templates after Module 1 took 2, so it borrows and reports.
  const sections = { [RW]: fakeSection(RW, 2), [MATH]: fakeSection(MATH, 2) };
  const form = Modules.buildForm(sections, { seed: "thin" });
  [RW, MATH].forEach((sectionKey) => {
    const ids = form.modules.filter((entry) => entry.sectionKey === sectionKey)
      .flatMap((entry) => entry.templates.map((template) => template.id));
    assert.equal(new Set(ids).size, ids.length);
  });
  assert.ok(form.shortfalls.length > 0);
  form.modules.forEach((entry) => {
    const missing = entry.shortfalls.reduce((sum, report) => sum + report.missing, 0);
    assert.equal(entry.templates.length, entry.size - missing, entry.label);
  });
  assert.ok(form.shortfalls.every((report) => report.sectionKey && report.module && report.domain && report.tier));
});

test("one section and one module are forms too", () => {
  const sections = { [RW]: fakeSection(RW, 6), [MATH]: fakeSection(MATH, 6) };
  const math = Modules.buildForm(sections, { seed: "s", slots: Modules.sectionSlots(MATH) });
  assert.equal(math.tag, "m1mh");
  assert.equal(math.breakAfter, null);
  assert.equal(math.minutes, 70);
  const single = Modules.buildForm(sections, { seed: "s", slots: [Modules.slot(RW, "e")] });
  assert.equal(single.tag, "re");
  assert.equal(single.modules[0].templates.length, 27);
  assert.throws(() => Modules.slot(RW, "x"), RangeError);
  assert.throws(() => Modules.buildForm(sections, { seed: "--" }), RangeError);
});

test("a form code rebuilds exactly the same form", () => {
  const sections = { [RW]: fakeSection(RW, 6), [MATH]: fakeSection(MATH, 6) };
  const form = Modules.buildForm(sections, { seed: "k3x9q2" });
  assert.match(form.code, /^r1rhm1mh-k3x9q2-[0-9a-z]+(\.[0-9a-z]+){3}-[0-9a-z]{4}$/);
  const parsed = Modules.parseFormCode(form.code.toUpperCase());
  assert.equal(parsed.seed, "k3x9q2");
  assert.deepEqual(parsed.masks, form.modules.map((entry) => entry.mask));
  const again = Modules.rebuildForm(sections, ` ${form.code} `);
  assert.equal(again.code, form.code);
  assert.equal(again.drift, false);
  assert.deepEqual(again.missing, []);
  assert.deepEqual(
    again.modules.map((entry) => entry.templates.map((template) => template.id)),
    form.modules.map((entry) => entry.templates.map((template) => template.id)),
  );
});

test("a code survives added templates, and flags retired and relabeled ones", () => {
  const sections = { [RW]: fakeSection(RW, 4), [MATH]: fakeSection(MATH, 4) };
  const form = Modules.buildForm(sections, { seed: "keep" });
  const ids = (built) => built.modules.map((entry) => entry.templates.map((template) => template.id));

  // New templates take new bits; the code still names the old set.
  const grown = { [RW]: sections[RW].concat(fakeSection(RW, 3, 900).map((template) => ({ ...template, id: `new-${template.id}` }))), [MATH]: sections[MATH] };
  const rebuilt = Modules.rebuildForm(grown, form.code);
  assert.deepEqual(ids(rebuilt), ids(form));
  assert.equal(rebuilt.drift, false);

  // A retired template (gone from the live list) is reported, not replaced.
  const gone = form.modules[2].templates[0];
  const retired = { [RW]: sections[RW], [MATH]: sections[MATH].filter((template) => template.id !== gone.id) };
  const short = Modules.rebuildForm(retired, form.code);
  assert.deepEqual(short.missing, [{ sectionKey: MATH, module: "1", bit: gone.bit }]);
  assert.equal(short.modules[2].templates.length, 21);
  assert.equal(short.drift, true);

  // A relabeled or revised template changes the check digits.
  const relabeled = { [RW]: sections[RW], [MATH]: sections[MATH].map((template) => (template.id === gone.id ? { ...template, version: 2 } : template)) };
  assert.equal(Modules.rebuildForm(relabeled, form.code).drift, true);
});

test("malformed codes are rejected with a clear error", () => {
  assert.throws(() => Modules.parseFormCode("not a code"), SyntaxError);
  assert.throws(() => Modules.parseFormCode("r1rh-abc-1.2.3-abcd"), /3 masks for 2 modules/);
  assert.throws(() => Modules.parseFormCode("x1-abc-1-abcd"), SyntaxError);
  // A run code is not a form code.
  assert.throws(() => Modules.parseFormCode("7phl4hfxcdfx66p-bp99wd"), SyntaxError);
});

/* ---------------------------------------------------------------- drawing */

test("drawForm draws one question per template, in module order, without shared scenes", () => {
  const sections = { [RW]: fakeSection(RW, 6), [MATH]: fakeSection(MATH, 6) };
  const form = Modules.buildForm(sections, { seed: "draw" });
  // One Math template always throws and one never verifies: both are left
  // out and reported; every other template keeps its place.
  const failing = {
    [form.modules[2].templates[0].id]: "throws",
    [form.modules[3].templates[5].id]: "unverified",
  };
  // 80 scenes for 54 Reading and Writing questions, each seed landing on one
  // of them, so collisions happen unless drawQuestions steers around them.
  const instantiate = (family, seed) => {
    if (failing[family.id] === "throws") throw new Error("only 2 distinct distractors");
    const index = [...seed].reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) % 9973, 0);
    return {
      templateId: family.id,
      scene: family.id.startsWith("read") ? `scene-${index % 80}` : null,
      verified: failing[family.id] !== "unverified",
    };
  };
  const drawn = Modules.drawForm(form, instantiate);
  drawn.modules.forEach((entry, index) => {
    const expected = form.modules[index].templates
      .map((template) => template.id)
      .filter((id) => !failing[id]);
    assert.deepEqual(entry.questions.map((question) => question.templateId), expected);
  });
  const rwScenes = drawn.modules.filter((entry) => entry.sectionKey === RW)
    .flatMap((entry) => entry.questions.map((question) => question.scene));
  assert.equal(rwScenes.length, 54);
  assert.equal(new Set(rwScenes).size, 54, "no two questions of a section share a scene");
  assert.deepEqual(
    drawn.skipped.map((entry) => [entry.templateId, entry.reason]).sort(),
    Object.entries(failing).sort(),
  );
  assert.ok(drawn.modules[0].questions[0].id.startsWith(`${RW}:`));
});

test("the real templates fill a full-length form with verified questions that never name their method", () => {
  const sections = realTemplates();
  const form = Modules.buildForm(sections, { seed: "k3x9q2" });
  // Tiers may borrow while templates are relabeled; domains never run dry.
  assert.deepEqual(form.shortfalls.filter((report) => report.missing), []);
  const drawn = Modules.drawForm(form, S.instantiate);
  const questions = drawn.modules.flatMap((entry) => entry.questions);
  assert.deepEqual(drawn.modules.map((entry) => entry.questions.length), [27, 27, 22, 22]);
  assert.deepEqual(drawn.skipped, []);
  drawn.modules.forEach((entry) => {
    const domains = countBy(entry.questions, "domain");
    entry.spec.domains.forEach((domain) => assert.equal(domains[domain.name], domain.count, `${entry.label} ${domain.name}`));
  });
  assert.equal(new Set(questions.map((question) => question.id)).size, 98);
  const titles = new Map(Object.values(sections).flat().map((template) => [template.id, template.family.title]));
  // The retired fixed banks told the student the method ("Use the slope
  // perpendicular structure for this case."; "Work from the ... relationship
  // shown, and verify"): 560 of 575 SAT Math stems matched this.
  const methodNaming = /\b(use|using|apply|applying)\b[^.?]*\b(structure|method|rule|formula|strategy)\b|\bwork from the\b[^.?]*\brelationship shown\b|\band verify\b/i;
  questions.forEach((question) => {
    assert.ok(!methodNaming.test(question.stem), `${question.id} names its method: ${question.stem}`);
    const title = titles.get(question.templateId);
    if (title) assert.ok(!question.stem.toLowerCase().includes(title.toLowerCase()), `${question.id} names its template`);
  });
  const rebuilt = Modules.drawForm(Modules.rebuildForm(sections, form.code), S.instantiate);
  assert.deepEqual(
    rebuilt.modules.flatMap((entry) => entry.questions.map((question) => question.id)),
    questions.map((question) => question.id),
  );
});
