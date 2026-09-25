// SAT modules and full-length forms built from templates.
//
// The digital SAT gives each section as two modules. Module 1 is a broad mix;
// the Module 2 a student sees is harder or easier depending on Module 1. The
// College Board does not publish its routing rules or the exact difficulty
// mix of each module, so the blueprint below is a practice approximation and
// every page that uses it must say so. What is official is kept exactly:
// module lengths, times, and domain counts per module.
//
// A module is chosen template by template, never more than one question per
// template, and a form never repeats a template across its modules. A form is
// fully described by its code (see formCode), which rebuilds it exactly.
// Pure logic with no DOM access; loads in Node and as a plain browser script
// (window.LiminalModules, after window.LiminalTemplateMask and
// window.LiminalRuns).
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(
    node ? require("./template-mask") : root.LiminalTemplateMask,
    node ? require("./runs") : root.LiminalRuns,
  );
  if (node) module.exports = api;
  else root.LiminalModules = api;
})(typeof self !== "undefined" ? self : this, function (Mask, Runs) {
  "use strict";

  const TIERS = ["Easy", "Medium", "Hard"];

  // When a domain x tier cell runs short, it borrows from the nearest tier of
  // the same domain. Medium borrows Hard before Easy: a short module then errs
  // harder, never easier, because practice that overstates readiness is the
  // failure this site exists to avoid.
  const NEAREST = {
    Easy: ["Medium", "Hard"],
    Medium: ["Hard", "Easy"],
    Hard: ["Medium", "Easy"],
  };

  // Module 2 routes. "1" is Module 1. The letters appear in form codes, so
  // they are permanent.
  const MODULES = {
    1: { key: "1", label: "Module 1", route: null },
    h: { key: "h", label: "Module 2", route: "harder" },
    e: { key: "e", label: "Module 2", route: "easier" },
  };

  // Per module: length, minutes, domain counts in the official order, and
  // the difficulty mix of each module kind (Easy / Medium / Hard). Section
  // letters appear in form codes, so they are permanent.
  const SECTIONS = {
    "sat-reading-writing": {
      key: "sat-reading-writing",
      letter: "r",
      label: "Reading and Writing",
      size: 27,
      minutes: 32,
      // Reading and Writing questions are grouped by domain in this order.
      order: "domain",
      domains: [
        { name: "Craft and Structure", count: 8 },
        { name: "Information and Ideas", count: 7 },
        { name: "Standard English Conventions", count: 7 },
        { name: "Expression of Ideas", count: 5 },
      ],
      mixes: {
        1: { Easy: 9, Medium: 9, Hard: 9 },
        h: { Easy: 3, Medium: 10, Hard: 14 },
        e: { Easy: 11, Medium: 12, Hard: 4 },
      },
      directions:
        "Each question has its own passage or pair of passages, which may " +
        "include a table or a graph. Read each passage and question " +
        "carefully, then choose the best answer based on the passage. Every " +
        "question has exactly one best answer.",
    },
    "sat-math": {
      key: "sat-math",
      letter: "m",
      label: "Math",
      size: 22,
      minutes: 35,
      // Math questions run Easy to Hard, shuffled within each tier.
      order: "tier",
      domains: [
        { name: "Algebra", count: 8 },
        { name: "Advanced Math", count: 8 },
        { name: "Problem-Solving and Data Analysis", count: 3 },
        { name: "Geometry and Trigonometry", count: 3 },
      ],
      mixes: {
        1: { Easy: 7, Medium: 8, Hard: 7 },
        h: { Easy: 2, Medium: 8, Hard: 12 },
        e: { Easy: 9, Medium: 10, Hard: 3 },
      },
      directions:
        "A calculator is allowed on every question. Unless a question says " +
        "otherwise, all numbers are real and figures lie in a plane; a figure " +
        "marked as not drawn to scale may not show true lengths or angles. " +
        "For a question without answer " +
        "choices, write one answer on the line: up to 5 characters for a " +
        "positive answer and 6 for a negative one (the minus sign counts); " +
        "a fraction or a decimal, not a mixed number; no units, commas, or " +
        "percent signs.",
    },
  };

  const BREAK_MINUTES = 10;
  const SECTION_ORDER = ["sat-reading-writing", "sat-math"];

  function hash(text) {
    let value = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function sectionBlueprint(sectionKey) {
    const section = SECTIONS[sectionKey];
    if (!section) throw new RangeError(`No module blueprint for section "${sectionKey}"`);
    return section;
  }

  function moduleKind(key) {
    const kind = MODULES[String(key)];
    if (!kind) throw new RangeError(`Unknown module "${key}" (use 1, h, or e)`);
    return kind;
  }

  /* ----------------------------------------------------------- blueprint */

  // All k-element subsets of 0..n-1, in lexicographic order.
  function combinations(n, k, start) {
    const from = start || 0;
    if (k === 0) return [[]];
    const result = [];
    for (let first = from; first <= n - k; first += 1) {
      combinations(n, k - 1, first + 1).forEach((rest) => result.push([first, ...rest]));
    }
    return result;
  }

  // Splits a module into domain x tier cells whose rows sum to the domain
  // counts and whose columns sum to the tier mix, as close to proportional
  // as integers allow (controlled rounding). Each cell takes the floor of
  // its share, domain x tier / module size; the questions left over go one
  // per cell to the cells whose shares were cut the most, over every
  // placement that keeps both sums (a 4 x 3 table has at most 81), the
  // first in domain and tier order winning a tie. Integer arithmetic only,
  // so the split never depends on floating point.
  function cellCounts(domains, mix) {
    const total = domains.reduce((sum, domain) => sum + domain.count, 0);
    const mixTotal = TIERS.reduce((sum, tier) => sum + (mix[tier] || 0), 0);
    if (total !== mixTotal || !total) {
      throw new RangeError(`Domain counts (${total}) and difficulty mix (${mixTotal}) disagree`);
    }
    const product = (row, column) => domains[row].count * (mix[TIERS[column]] || 0);
    const base = domains.map((domain, row) => TIERS.map((tier, column) => Math.floor(product(row, column) / total)));
    const cut = domains.map((domain, row) => TIERS.map((tier, column) => product(row, column) % total));
    const rowLeft = domains.map((domain, row) => domain.count - base[row].reduce((sum, value) => sum + value, 0));
    const columnLeft = TIERS.map((tier, column) =>
      (mix[tier] || 0) - base.reduce((sum, row) => sum + row[column], 0));

    let best = null;
    let bestScore = -1;
    const picks = [];
    (function place(row, score) {
      if (row === domains.length) {
        if (columnLeft.every((left) => left === 0) && score > bestScore) {
          best = picks.slice();
          bestScore = score;
        }
        return;
      }
      combinations(TIERS.length, rowLeft[row]).forEach((columns) => {
        if (columns.some((column) => columnLeft[column] <= 0)) return;
        columns.forEach((column) => { columnLeft[column] -= 1; });
        picks.push(columns);
        place(row + 1, score + columns.reduce((sum, column) => sum + cut[row][column], 0));
        picks.pop();
        columns.forEach((column) => { columnLeft[column] += 1; });
      });
    })(0, 0);
    if (!best) throw new Error("Could not split the module across domains and tiers");

    const cells = {};
    domains.forEach((domain, row) => {
      cells[domain.name] = {};
      TIERS.forEach((tier, column) => {
        cells[domain.name][tier] = base[row][column] + (best[row].includes(column) ? 1 : 0);
      });
    });
    return cells;
  }

  // Everything one module needs: its length, time, label, tier mix, domain
  // counts, and the domain x tier cells a chooser fills.
  function moduleSpec(sectionKey, key) {
    const section = sectionBlueprint(sectionKey);
    const kind = moduleKind(key);
    const mix = section.mixes[kind.key];
    return {
      sectionKey,
      module: kind.key,
      route: kind.route,
      label: `${section.label} — ${kind.label}`,
      size: section.size,
      minutes: section.minutes,
      order: section.order,
      directions: section.directions,
      mix: { ...mix },
      domains: section.domains.map((domain) => ({ ...domain })),
      cells: cellCounts(section.domains, mix),
    };
  }

  /* ------------------------------------------------------------ choosing */

  // Official order within a module: Reading and Writing by domain, Easy to
  // Hard within each domain; Math Easy to Hard. Ties fall to a seeded
  // shuffle, so the order depends only on the templates, their labels, and
  // the seed.
  function orderModule(templates, sectionKey, seed) {
    const section = sectionBlueprint(sectionKey);
    const domainRank = (template) => {
      const index = section.domains.findIndex((domain) => domain.name === template.domain);
      return index < 0 ? section.domains.length : index;
    };
    const tierRank = (template) => {
      const index = TIERS.indexOf(template.difficulty);
      return index < 0 ? TIERS.length : index;
    };
    const rank = (template) => [
      section.order === "domain" ? domainRank(template) : 0,
      tierRank(template),
      hash(`${seed}|order|${template.id}`),
      template.id,
    ];
    return templates.slice().sort((left, right) => {
      const [a, b] = [rank(left), rank(right)];
      for (let place = 0; place < a.length; place += 1) {
        if (a[place] !== b[place]) return a[place] < b[place] ? -1 : 1;
      }
      return 0;
    });
  }

  // Chooses one module's templates: each domain x tier cell of `spec` from
  // its own tier first, preferring the skill used least so far in the
  // module, then a seeded shuffle. Only then does a short cell borrow from
  // the nearest tier of its domain (NEAREST), so borrowing never starves
  // another cell. Never two of one template; never one in `exclude` (ids).
  // Returns the ordered templates, their mask, and one shortfall per cell
  // that its own tier could not fill:
  //   { domain, tier, wanted, filled, borrowed: [{ tier, count }], missing }
  // A cell still `missing` questions leaves the module short: templates are
  // never borrowed across domains, because domain counts are official.
  function chooseModule(templates, spec, options) {
    const settings = options || {};
    const seed = String(settings.seed === undefined ? "" : settings.seed);
    const excluded = new Set(settings.exclude || []);
    const taken = new Set();
    const skillUses = new Map();
    const chosen = [];

    function take(domain, tier, count) {
      const pool = templates.filter((template) =>
        template.domain === domain && template.difficulty === tier &&
        !excluded.has(template.id) && !taken.has(template.id));
      const order = new Map(pool.map((template) => [template.id, hash(`${seed}|${template.id}`)]));
      let got = 0;
      while (got < count) {
        let best = null;
        pool.forEach((template) => {
          if (taken.has(template.id)) return;
          if (!best) {
            best = template;
            return;
          }
          const uses = (entry) => skillUses.get(entry.skill) || 0;
          const difference = uses(template) - uses(best) ||
            order.get(template.id) - order.get(best.id);
          if (difference < 0 || (difference === 0 && template.id < best.id)) best = template;
        });
        if (!best) break;
        taken.add(best.id);
        chosen.push(best);
        skillUses.set(best.skill, (skillUses.get(best.skill) || 0) + 1);
        got += 1;
      }
      return got;
    }

    const cells = [];
    spec.domains.forEach((domain) => {
      TIERS.forEach((tier) => {
        const wanted = (spec.cells[domain.name] || {})[tier] || 0;
        if (!wanted) return;
        cells.push({ domain: domain.name, tier, wanted, filled: take(domain.name, tier, wanted), borrowed: [] });
      });
    });
    cells.forEach((cell) => {
      let short = cell.wanted - cell.filled;
      NEAREST[cell.tier].forEach((tier) => {
        if (!short) return;
        const got = take(cell.domain, tier, short);
        if (got) cell.borrowed.push({ tier, count: got });
        short -= got;
      });
      cell.missing = short;
    });

    const ordered = orderModule(chosen, spec.sectionKey, seed);
    return {
      templates: ordered,
      mask: Mask.fromBits(ordered.map((template) => template.bit)),
      shortfalls: cells
        .filter((cell) => cell.filled < cell.wanted)
        .map((cell) => ({
          sectionKey: spec.sectionKey,
          module: spec.module,
          domain: cell.domain,
          tier: cell.tier,
          wanted: cell.wanted,
          filled: cell.filled,
          borrowed: cell.borrowed,
          missing: cell.missing,
        })),
    };
  }

  /* --------------------------------------------------------------- forms */

  // A form is a list of module slots, in the order they are taken.
  function slot(sectionKey, key) {
    sectionBlueprint(sectionKey);
    return { sectionKey, module: moduleKind(key).key };
  }

  // One section: Module 1, then Module 2 on the given route.
  function sectionSlots(sectionKey, route) {
    return [slot(sectionKey, "1"), slot(sectionKey, route || "h")];
  }

  // The whole test: Reading and Writing, a 10-minute break, then Math.
  function fullLengthSlots(route) {
    return SECTION_ORDER.flatMap((sectionKey) => sectionSlots(sectionKey, route));
  }

  // Seeds go into form codes, so they are lower-case letters and digits.
  function normalizeSeed(seed) {
    const text = String(seed === undefined || seed === null ? "" : seed)
      .toLowerCase()
      .replace(/[^0-9a-z]/g, "");
    if (!text) throw new RangeError("A form seed needs at least one letter or digit.");
    return text;
  }

  function slotTag(slots) {
    return slots.map((entry) => `${SECTIONS[entry.sectionKey].letter}${entry.module}`).join("");
  }

  // The break falls between the two sections of a full-length form.
  function breakAfter(slots) {
    const index = slots.findIndex((entry, position) =>
      position + 1 < slots.length && slots[position + 1].sectionKey !== entry.sectionKey);
    return index < 0 ? null : index;
  }

  // Four base-36 digits over the form's templates, in order, with their
  // versions. A rebuild recomputes it: a mismatch means a template was
  // relabeled, revised, or retired since the code was made (or the code was
  // mistyped), so the booklet may differ from the printed one.
  function checkDigits(tag, seed, modules) {
    const body = modules
      .map((entry) => entry.templates.map((template) => `${template.id}@${template.version || 1}`).join(","))
      .join("/");
    return (hash(`${tag}|${seed}|${body}`) % 36 ** 4).toString(36).padStart(4, "0");
  }

  // A form's code: its module slots, its seed, one template mask per module,
  // and check digits, e.g. "r1rhm1mh-k3x9q2-<mask>.<mask>.<mask>.<mask>-7qx4".
  // Masks use the permanent registry bits (template-mask.js), so a code names
  // the same templates however many are added later; the seed fixes each
  // question's draw and the order within each tier.
  function formCode(form) {
    return `${form.tag}-${form.seed}-${form.modules.map((entry) => Mask.toCode(entry.mask)).join(".")}-${form.check}`;
  }

  const CODE = /^((?:[rm][1he])+)-([0-9a-z]+)-([0-9a-z]+(?:\.[0-9a-z]+)*)-([0-9a-z]{4})$/;
  const LETTERS = { r: "sat-reading-writing", m: "sat-math" };

  function parseFormCode(code) {
    const text = String(code || "").trim().toLowerCase().replace(/\s+/g, "");
    const match = CODE.exec(text);
    if (!match) throw new SyntaxError(`"${String(code || "").trim()}" is not a form code.`);
    const slots = match[1].match(/[rm][1he]/g).map((pair) => slot(LETTERS[pair[0]], pair[1]));
    const masks = match[3].split(".").map((part) => Mask.fromCode(part));
    if (masks.length !== slots.length) {
      throw new SyntaxError(`Form code has ${masks.length} masks for ${slots.length} modules.`);
    }
    return { code: text, tag: match[1], slots, seed: match[2], masks, check: match[4] };
  }

  function finishForm(slots, seed, modules) {
    const tag = slotTag(slots);
    const form = {
      seed,
      tag,
      slots,
      breakAfter: breakAfter(slots),
      minutes: modules.reduce((sum, entry) => sum + entry.minutes, 0),
      modules,
      shortfalls: modules.flatMap((entry) => entry.shortfalls || []),
      check: checkDigits(tag, seed, modules),
    };
    form.code = formCode(form);
    return form;
  }

  function moduleEntry(spec, templates, mask, shortfalls) {
    return {
      sectionKey: spec.sectionKey,
      module: spec.module,
      route: spec.route,
      label: spec.label,
      minutes: spec.minutes,
      size: spec.size,
      directions: spec.directions,
      spec,
      templates,
      mask,
      shortfalls,
    };
  }

  // Builds a form from each section's templates (runs.catalogTemplates
  // output, keyed by section): the full-length test by default, with
  // Module 2 on `route` ("h" harder, the default, or "e" easier), or any
  // `slots`. Modules of one section never share a template.
  function buildForm(sectionTemplates, options) {
    const settings = options || {};
    const seed = normalizeSeed(settings.seed);
    const slots = (settings.slots || fullLengthSlots(settings.route))
      .map((entry) => slot(entry.sectionKey, entry.module));
    const used = new Map();
    const modules = slots.map((entry) => {
      const spec = moduleSpec(entry.sectionKey, entry.module);
      const exclude = used.get(entry.sectionKey) || new Set();
      used.set(entry.sectionKey, exclude);
      const chosen = chooseModule((sectionTemplates || {})[entry.sectionKey] || [], spec, { seed, exclude });
      chosen.templates.forEach((template) => exclude.add(template.id));
      return moduleEntry(spec, chosen.templates, chosen.mask, chosen.shortfalls);
    });
    return finishForm(slots, seed, modules);
  }

  // Rebuilds the form a code names: exactly its templates, in the official
  // order. `missing` lists mask bits no live template holds (retired since);
  // `drift` is true when the check digits no longer match.
  function rebuildForm(sectionTemplates, code) {
    const parsed = parseFormCode(code);
    const missing = [];
    const modules = parsed.slots.map((entry, index) => {
      const spec = moduleSpec(entry.sectionKey, entry.module);
      const pool = (sectionTemplates || {})[entry.sectionKey] || [];
      const mask = parsed.masks[index];
      const templates = orderModule(Runs.templatesForMask(pool, mask), entry.sectionKey, parsed.seed);
      const live = new Set(templates.map((template) => template.bit));
      Mask.bits(mask).filter((bit) => !live.has(bit)).forEach((bit) => {
        missing.push({ sectionKey: entry.sectionKey, module: entry.module, bit });
      });
      return moduleEntry(spec, templates, mask, []);
    });
    const form = finishForm(parsed.slots, parsed.seed, modules);
    form.drift = form.check !== parsed.check;
    form.check = parsed.check;
    form.code = parsed.code;
    form.missing = missing;
    return form;
  }

  // Draws one question per template with runs.drawQuestions, a section at a
  // time so no two questions of a section share a scene, and returns each
  // module with its questions in module order. Question ids are
  // "<section>:<template>:<seed>", as in practice runs, so any question can
  // be rebuilt from its id. drawQuestions retries a draw that throws or
  // fails its own check and leaves out a template with no good draw; those
  // are listed in `skipped` ({ sectionKey, module, templateId, reason }).
  //
  // A form code records no attempts: no seen scenes are passed, so every
  // attempt follows from the section's templates, their versions, and the
  // seed, which the code's masks and check digits pin.
  function drawForm(form, instantiate) {
    const bySection = new Map();
    form.modules.forEach((entry) => {
      bySection.set(entry.sectionKey, (bySection.get(entry.sectionKey) || []).concat(entry.templates));
    });
    const drawn = new Map();
    const reasons = new Map();
    bySection.forEach((templates, sectionKey) => {
      const questions = Runs.drawQuestions(templates, form.seed, instantiate, `${sectionKey}:`);
      (questions.skipped || []).forEach((entry) => reasons.set(`${sectionKey}:${entry.templateId}`, entry.reason));
      questions.forEach((question) => {
        if (question && question.verified !== false) drawn.set(`${sectionKey}:${question.templateId}`, question);
      });
    });
    const skipped = [];
    const modules = form.modules.map((entry) => ({
      ...entry,
      questions: entry.templates
        .map((template) => {
          const key = `${entry.sectionKey}:${template.id}`;
          const question = drawn.get(key);
          if (!question) {
            skipped.push({
              sectionKey: entry.sectionKey,
              module: entry.module,
              templateId: template.id,
              reason: reasons.get(key) || "unverified",
            });
          }
          return question;
        })
        .filter(Boolean),
    }));
    return { modules, skipped };
  }

  return {
    BREAK_MINUTES,
    MODULES,
    NEAREST,
    SECTIONS,
    SECTION_ORDER,
    TIERS,
    buildForm,
    cellCounts,
    chooseModule,
    drawForm,
    formCode,
    fullLengthSlots,
    moduleSpec,
    normalizeSeed,
    orderModule,
    parseFormCode,
    rebuildForm,
    sectionSlots,
    slot,
  };
});
