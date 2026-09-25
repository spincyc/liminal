(function () {
  "use strict";

  // The booklet page. SAT forms are built from templates to the module
  // blueprint in lib/modules.js and rendered with the practice screen's own
  // renderer (app/render.js), so a booklet shows exactly what practice shows;
  // each prints a form code that rebuilds it. ACT forms still draw from their
  // fixed banks through core.js blueprints.

  const core = window.PracticeCore;
  const booklet = window.PracticeBooklet;
  const site = window.LiminalSite;
  const runs = window.LiminalRuns;
  const modules = window.LiminalModules;
  const render = window.LiminalRender;

  const elements = {
    formGrid: document.getElementById("formGrid"),
    formSummary: document.getElementById("formSummary"),
    moduleOptions: document.getElementById("moduleOptions"),
    moduleSection: document.getElementById("moduleSection"),
    moduleKind: document.getElementById("moduleKind"),
    seedInput: document.getElementById("seedInput"),
    reroll: document.getElementById("rerollBtn"),
    openTest: document.getElementById("openTestBtn"),
    downloadTest: document.getElementById("downloadTestBtn"),
    openKey: document.getElementById("openKeyBtn"),
    downloadKey: document.getElementById("downloadKeyBtn"),
    status: document.getElementById("printStatus"),
    warnings: document.getElementById("printWarnings"),
    shareLink: document.getElementById("shareLink"),
    copyLink: document.getElementById("copyLinkBtn"),
    codeInput: document.getElementById("codeInput"),
    rebuild: document.getElementById("rebuildBtn"),
  };

  const RW = "sat-reading-writing";
  const MATH = "sat-math";
  const bankPromises = new Map();
  const familyLoads = new Map();
  let selectedId = null;
  // A form code the next SAT build rebuilds exactly (from Rebuild, a shared
  // link, or the last build). Changing the form or the seed clears it.
  let pinnedCode = null;

  /* ------------------------------------------------------------- SAT forms */

  const MODULE_WORDS = { 1: "Module 1", h: "Module 2, harder route", e: "Module 2, easier route" };

  function satModuleSlot() {
    return modules.slot(elements.moduleSection.value, elements.moduleKind.value);
  }

  // SAT forms, all built from templates. "sat-full" keeps the id the old
  // bank-built form had, so links shared before still open the full test.
  const SAT_FORMS = [
    {
      id: "sat-full",
      test: "SAT",
      label: "SAT full-length practice test",
      summary:
        "Reading and Writing, a ten-minute break, then Math, two modules " +
        "each. Module 2 is the harder route: a practice approximation, since " +
        "the real test's routing rules are not published.",
      slots: () => modules.fullLengthSlots("h"),
    },
    {
      id: "sat-reading-writing",
      test: "SAT",
      label: "SAT Reading and Writing section",
      summary: "Module 1 and Module 2 on the harder route.",
      slots: () => modules.sectionSlots(RW, "h"),
    },
    {
      id: "sat-math",
      test: "SAT",
      label: "SAT Math section",
      summary: "Module 1 and Module 2 on the harder route. Calculator allowed throughout.",
      slots: () => modules.sectionSlots(MATH, "h"),
    },
    {
      id: "sat-module",
      test: "SAT",
      label: "One SAT module",
      summary: "Choose the section and the module below.",
      slots: () => [satModuleSlot()],
    },
  ];

  function satForm(id) {
    return SAT_FORMS.find((form) => form.id === id) || null;
  }

  // The form a slot list matches, so a code can select its card.
  function satFormForSlots(slots) {
    const tag = (list) => list.map((entry) => `${entry.sectionKey}:${entry.module}`).join(",");
    if (slots.length === 1) return satForm("sat-module");
    return SAT_FORMS.find((form) => form.id !== "sat-module" && tag(form.slots()) === tag(slots)) || null;
  }

  function slotsSize(slots) {
    return slots.reduce((sum, entry) => sum + modules.moduleSpec(entry.sectionKey, entry.module).size, 0);
  }

  function slotsMinutes(slots) {
    return slots.reduce((sum, entry) => sum + modules.moduleSpec(entry.sectionKey, entry.module).minutes, 0);
  }

  function moduleLabel(entry) {
    const section = modules.SECTIONS[entry.sectionKey].label;
    return `${section} — ${MODULE_WORDS[entry.module]}`;
  }

  /* ------------------------------------------------------- form selection */

  function isSat() {
    return site.getTest() === "SAT";
  }

  // Only the forms of the test chosen in the header are offered.
  function testForms() {
    return isSat()
      ? SAT_FORMS
      : core.ALL_BLUEPRINTS.filter((blueprint) => blueprint.test === site.getTest());
  }

  function selectedForm() {
    return testForms().find((form) => form.id === selectedId) || null;
  }

  function ensureSelection() {
    const forms = testForms();
    if (!forms.some((form) => form.id === selectedId)) selectedId = forms[0].id;
  }

  // A seed is short and typeable so a form can be quoted out loud or written
  // on a printed booklet and rebuilt later. SAT seeds go into form codes, so
  // they use lower-case letters and digits only.
  function randomSeed() {
    const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
    let seed = "";
    const values = new Uint32Array(6);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (let index = 0; index < values.length; index += 1) {
        values[index] = Math.floor(Math.random() * 0xffffffff);
      }
    }
    values.forEach((value) => {
      seed += alphabet[value % alphabet.length];
    });
    return seed;
  }

  function currentSeed() {
    const typed = elements.seedInput.value.trim();
    if (!isSat()) return typed || randomSeed();
    try {
      return modules.normalizeSeed(typed);
    } catch (error) {
      return randomSeed();
    }
  }

  // Points the page at a form code: its test, its form card, its seed.
  function pinCode(code) {
    const parsed = modules.parseFormCode(code);
    site.setTest("SAT");
    const form = satFormForSlots(parsed.slots);
    if (form) selectedId = form.id;
    else ensureSelection();
    if (parsed.slots.length === 1) {
      elements.moduleSection.value = parsed.slots[0].sectionKey;
      elements.moduleKind.value = parsed.slots[0].module;
    }
    elements.seedInput.value = parsed.seed;
    elements.codeInput.value = parsed.code;
    pinnedCode = parsed.code;
    return parsed;
  }

  function unpin() {
    pinnedCode = null;
  }

  // A shared link names a form and a seed (?form=&seed=, plus &module= for
  // one SAT module) or, for SAT, a form code (?code=), which wins. Opening an
  // ACT link switches the site to ACT.
  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get("code") || "").trim();
    if (code) {
      try {
        pinCode(code);
        setStatus("Form code loaded. Open the booklet to rebuild it.");
        return;
      } catch (error) {
        setStatus(error.message, "error");
      }
    }
    const id = params.get("form") || "";
    const blueprint = core.blueprintById(id);
    if (satForm(id)) {
      selectedId = id;
      site.setTest("SAT");
    } else if (blueprint && blueprint.test === "ACT") {
      selectedId = blueprint.id;
      site.setTest("ACT");
    }
    const module = /^([rm])([1he])$/.exec(params.get("module") || "");
    if (module) {
      elements.moduleSection.value = module[1] === "r" ? RW : MATH;
      elements.moduleKind.value = module[2];
    }
    ensureSelection();
    const seed = (params.get("seed") || "").trim();
    elements.seedInput.value = seed || randomSeed();
  }

  function updateShareLink() {
    const url = new URL(window.location.href);
    url.search = "";
    if (isSat() && pinnedCode) {
      url.searchParams.set("code", pinnedCode);
    } else {
      url.searchParams.set("form", selectedId);
      if (selectedId === "sat-module") {
        const entry = satModuleSlot();
        url.searchParams.set("module", `${modules.SECTIONS[entry.sectionKey].letter}${entry.module}`);
      }
      url.searchParams.set("seed", elements.seedInput.value.trim());
    }
    elements.shareLink.value = url.toString();
    // Keep the address bar shareable without adding a history entry per edit.
    // Some browsers reject this on file:// pages, where the box above is the
    // link anyway.
    try {
      window.history.replaceState(null, "", url.search);
    } catch (error) {
      /* the share box still holds the full link */
    }
  }

  /* --------------------------------------------------------------- rendering */

  function formMeta(form) {
    if (form.test === "SAT") {
      const slots = form.slots();
      const count = slots.length;
      return `${slotsSize(slots)} questions · ${slotsMinutes(slots)} minutes · ` +
        `${count} module${count === 1 ? "" : "s"}`;
    }
    return `${core.blueprintTotal(form)} questions · ${form.minutes} minutes · ` +
      `${form.sections.length} section${form.sections.length === 1 ? "" : "s"}`;
  }

  // Real radio buttons: the choice is a selection, separate from the build
  // and download actions, and arrow keys move between forms.
  function renderForms() {
    elements.formGrid.innerHTML = "";
    testForms().forEach((form) => {
      const option = document.createElement("label");
      option.className = "option-card";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "form";
      input.value = form.id;
      input.checked = form.id === selectedId;

      const body = document.createElement("span");
      body.className = "option-body";
      const title = document.createElement("span");
      title.className = "option-title";
      title.textContent = form.label;
      const meta = document.createElement("span");
      meta.className = "option-meta";
      meta.textContent = formMeta(form);
      const summary = document.createElement("span");
      summary.className = "option-desc";
      summary.textContent = form.summary;
      body.append(title, meta, summary);

      option.append(input, body);
      input.addEventListener("change", () => {
        if (!input.checked) return;
        selectedId = form.id;
        unpin();
        markSelected();
        updateSummary();
        updateShareLink();
      });
      elements.formGrid.appendChild(option);
    });
    markSelected();
  }

  function markSelected() {
    elements.formGrid.querySelectorAll(".option-card").forEach((option) => {
      const input = option.querySelector("input");
      input.checked = input.value === selectedId;
      option.classList.toggle("is-selected", input.checked);
    });
    elements.moduleOptions.hidden = !(isSat() && selectedId === "sat-module");
  }

  function updateSummary() {
    const form = selectedForm();
    if (!form) return;
    if (form.test === "SAT") {
      const slots = form.slots();
      const parts = slots.map((entry) => {
        const spec = modules.moduleSpec(entry.sectionKey, entry.module);
        return `${moduleLabel(entry)}, ${spec.size} questions in ${spec.minutes} min`;
      });
      elements.formSummary.textContent = `${slots.length === 1 ? "One module" : form.label}: ${parts.join("; ")}.`;
      return;
    }
    const parts = form.sections.map(
      (entry) => `${entry.label}, ${entry.count} questions in ${entry.minutes} min`,
    );
    elements.formSummary.textContent = `${form.label}: ${parts.join("; ")}.`;
  }

  function setStatus(message, kind) {
    elements.status.className = `status-line${kind ? ` ${kind}` : ""}`;
    elements.status.textContent = message;
  }

  function setWarnings(lines) {
    elements.warnings.innerHTML = "";
    lines.forEach((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      elements.warnings.appendChild(item);
    });
    elements.warnings.hidden = !lines.length;
  }

  /* ----------------------------------------------------------- ACT (banks) */

  function loadBank(sectionKey) {
    window.PRACTICE_BANKS = window.PRACTICE_BANKS || {};
    if (window.PRACTICE_BANKS[sectionKey]) {
      return Promise.resolve(window.PRACTICE_BANKS[sectionKey]);
    }
    if (bankPromises.has(sectionKey)) return bankPromises.get(sectionKey);
    const pending = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `content/${sectionKey}.js`;
      script.onload = () => {
        const bank = window.PRACTICE_BANKS[sectionKey];
        if (!bank) reject(new Error(`The ${sectionKey} bank did not register.`));
        else resolve(bank);
      };
      script.onerror = () => {
        bankPromises.delete(sectionKey);
        reject(new Error(`Could not load ${sectionKey}.`));
      };
      document.head.appendChild(script);
    });
    bankPromises.set(sectionKey, pending);
    return pending;
  }

  async function buildActBuild(blueprint) {
    const seed = currentSeed();
    elements.seedInput.value = seed;

    const keys = [...new Set(blueprint.sections.map((entry) => entry.sectionKey))];
    const banks = await Promise.all(keys.map((key) => loadBank(key)));
    const bankBySection = Object.fromEntries(
      keys.map((key, index) => [key, banks[index]]),
    );

    const form = core.buildTestForm(bankBySection, blueprint, seed);
    const short = form.find((group) => group.questions.length < group.entry.count);
    if (short) {
      throw new Error(
        `The ${short.label} bank is short of the ${short.entry.count} items this form needs.`,
      );
    }
    return { model: booklet.buildModel(form, blueprint, seed), options: {}, warnings: [] };
  }

  /* ------------------------------------------------------- SAT (templates) */

  // Each SAT section's templates load as one bundle the first time they are
  // needed, exactly as on the practice page: the bundle carries the shared
  // helpers and registers its templates into window.LiminalFamilies.
  function loadFamilies(sectionKey) {
    if (!familyLoads.has(sectionKey)) {
      const loading = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `lib/families/${sectionKey}.js`;
        script.onload = () => resolve(runs.catalogTemplates(
          (window.LiminalFamilies || {})[sectionKey] || [],
          (window.PRACTICE_TEMPLATES || {})[sectionKey] || { templates: [] },
        ));
        script.onerror = () => {
          familyLoads.delete(sectionKey);
          reject(new Error(`Could not load the ${modules.SECTIONS[sectionKey].label} templates.`));
        };
        document.head.appendChild(script);
      });
      familyLoads.set(sectionKey, loading);
    }
    return familyLoads.get(sectionKey);
  }

  // Some Reading and Writing records carry the passage inside the stem; the
  // practice screen splits it off the same way.
  function withPassage(question) {
    if (question.sectionKey === MATH || (question.stimulus && question.stimulus.content)) return question;
    const split = render.splitStemPassage(question.stem);
    if (!split.passage) return question;
    return { ...question, stimulus: { type: "passage", content: split.passage }, stem: split.question };
  }

  // Booklet content through the practice screen's renderer: text as text
  // nodes (Math typeset), tables as tables, figures parsed and rebuilt from
  // an allow-list, then serialized. Serializing escapes every text node, so
  // the booklet document gets markup, never content strings, as HTML.
  const RENDER = {
    rich: (text, question) => render.renderText(text, { math: question.sectionKey === MATH }).outerHTML,
    stimulus: (stimulus, question) => {
      const node = render.renderStimulus(stimulus, { math: question.sectionKey === MATH });
      return node ? node.outerHTML : "";
    },
    figure: (figure) => {
      const node = render.renderFigure(figure);
      return node ? node.outerHTML : "";
    },
  };

  // The booklet's cover: the form the code's slots match, or a generic
  // title for a code no card offers (the easier route of a whole section).
  function satBlueprint(form) {
    const card = satFormForSlots(form.slots);
    const single = form.modules.length === 1;
    const routes = [...new Set(form.modules.map((entry) => entry.route).filter(Boolean))];
    const notes = [
      "Built from fresh questions to the digital SAT's module structure: " +
        "official module lengths, times, and domain counts, with a practice " +
        "approximation of each module's difficulty mix.",
    ];
    if (routes.length) {
      notes.push(
        `Module 2 here is the ${routes.join(" and ")} route. On the real test, ` +
          "Module 1 performance decides which Module 2 a student sees, by rules " +
          "that are not published; this booklet approximates it.",
      );
    }
    return {
      id: card ? card.id : "sat-form",
      test: "SAT",
      label: single ? `SAT ${moduleLabel(form.modules[0])}` : card ? card.label : "SAT practice test",
      summary: single
        ? `${form.modules[0].size} questions in ${form.modules[0].minutes} minutes.`
        : `${form.modules.map((entry) => moduleLabel(entry)).join("; ")}.`,
      notes,
      minutes: form.minutes,
      breakAfter: form.breakAfter,
    };
  }

  function reportLines(form, drawn) {
    const lines = [];
    form.shortfalls.forEach((report) => {
      const borrowed = report.borrowed.map((entry) => `${entry.count} ${entry.tier}`).join(" and ");
      lines.push(
        `${moduleLabel(report)}: ${report.domain} had ${report.filled} of ${report.wanted} ` +
          `${report.tier} templates left` +
          (borrowed ? `, so it borrowed ${borrowed}` : "") +
          (report.missing ? `; the module is ${report.missing} question${report.missing === 1 ? "" : "s"} short.` : "."),
      );
    });
    if (form.missing && form.missing.length) {
      lines.push(
        `${form.missing.length} template${form.missing.length === 1 ? " in this code has" : "s in this code have"} ` +
          "been retired, so the booklet is short by that many questions.",
      );
    }
    if (form.drift) {
      lines.push(
        "This code's check digits do not match the current templates: a " +
          "template was recalibrated or revised since the code was made, or the " +
          "code was mistyped. Questions or their order may differ from the " +
          "printed booklet.",
      );
    }
    if (drawn.skipped.length) {
      lines.push(
        `${drawn.skipped.length} question${drawn.skipped.length === 1 ? "" : "s"} could not be ` +
          `drawn and ${drawn.skipped.length === 1 ? "was" : "were"} left out ` +
          `(${drawn.skipped.map((entry) => entry.templateId).join(", ")}).`,
      );
    }
    return lines;
  }

  async function buildSatBuild(form) {
    let slots;
    let seed;
    if (pinnedCode) {
      const parsed = modules.parseFormCode(pinnedCode);
      slots = parsed.slots;
      seed = parsed.seed;
    } else {
      slots = form.slots();
      seed = currentSeed();
      elements.seedInput.value = seed;
    }
    const keys = [...new Set(slots.map((entry) => entry.sectionKey))];
    const loaded = await Promise.all(keys.map((key) => loadFamilies(key)));
    const sectionTemplates = Object.fromEntries(keys.map((key, index) => [key, loaded[index]]));
    const built = pinnedCode
      ? modules.rebuildForm(sectionTemplates, pinnedCode)
      : modules.buildForm(sectionTemplates, { seed, slots });
    const drawn = modules.drawForm(built, window.LiminalFamilyShared.instantiate);
    const groups = drawn.modules.map((entry) => ({
      label: moduleLabel(entry),
      minutes: entry.minutes,
      directions: entry.directions,
      questions: entry.questions.map(withPassage),
    }));
    if (!groups.some((group) => group.questions.length)) {
      throw new Error("No questions could be drawn for this form.");
    }
    const model = booklet.buildModel(groups, satBlueprint(built), built.seed, { code: built.code });
    pinnedCode = built.code;
    elements.codeInput.value = built.code;
    return { model, options: { render: RENDER }, warnings: reportLines(built, drawn) };
  }

  /* ---------------------------------------------------------------- building */

  function buildBooklet() {
    const form = selectedForm();
    if (!form) return Promise.reject(new Error("Choose a form first."));
    return form.test === "SAT" ? buildSatBuild(form) : buildActBuild(form);
  }

  // SAT booklets end with their answer key; ACT keeps the key separate.
  function documentFor(build, kind) {
    if (kind === "key") return booklet.renderKeyHtml(build.model, build.options);
    return booklet.renderBookletHtml(build.model, {
      ...build.options,
      key: build.model.blueprint.test === "SAT",
    });
  }

  function fileNameFor(model, kind) {
    return `${model.blueprint.id}-${model.formCode}-${kind}.html`;
  }

  function reportBuilt(build, message) {
    setWarnings(build.warnings);
    setStatus(message, build.warnings.length ? "" : "success");
  }

  // Opened in a tab the browser's own print dialog can turn into a PDF, which
  // is the only route to a PDF that needs nothing installed.
  async function openBooklet(kind) {
    const target = window.open("", "_blank");
    if (!target) {
      setStatus(
        "Allow pop-ups for this site, or use Download instead.",
        "error",
      );
      return;
    }
    target.document.write(
      "<p style='font:14px system-ui;padding:2rem'>Building your booklet…</p>",
    );
    setStatus("Building…", "loading");
    setWarnings([]);
    try {
      const build = await buildBooklet();
      target.document.open();
      target.document.write(documentFor(build, kind));
      target.document.close();
      target.document.title = fileNameFor(build.model, kind).replace(/\.html$/, "");
      updateShareLink();
      reportBuilt(
        build,
        `Form ${build.model.formCode} opened in a new tab. Print it, then choose ` +
          `"Save as PDF".`,
      );
    } catch (error) {
      target.close();
      setStatus(error.message, "error");
    }
  }

  async function downloadBooklet(kind) {
    setStatus("Building…", "loading");
    setWarnings([]);
    try {
      const build = await buildBooklet();
      const blob = new Blob([documentFor(build, kind)], {
        type: "text/html;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileNameFor(build.model, kind);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      updateShareLink();
      reportBuilt(build, `Downloaded ${fileNameFor(build.model, kind)}.`);
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  async function copyShareLink() {
    updateShareLink();
    try {
      await navigator.clipboard.writeText(elements.shareLink.value);
      setStatus("Link copied. Anyone who opens it gets this exact form.");
    } catch (error) {
      elements.shareLink.select();
      setStatus("Press ⌘C or Ctrl+C to copy the selected link.");
    }
  }

  // Rebuild is a click, so the booklet may open in a new tab at once.
  function rebuildFromCode() {
    try {
      pinCode(elements.codeInput.value);
    } catch (error) {
      setWarnings([]);
      setStatus(error.message, "error");
      elements.codeInput.focus();
      return;
    }
    renderForms();
    updateSummary();
    updateShareLink();
    openBooklet("test");
  }

  /* ------------------------------------------------------------------- wiring */

  elements.reroll.addEventListener("click", () => {
    elements.seedInput.value = randomSeed();
    unpin();
    updateShareLink();
    setWarnings([]);
    setStatus("New seed ready. Build the booklet to draw a fresh form.");
  });
  elements.seedInput.addEventListener("change", () => {
    unpin();
    updateShareLink();
  });
  [elements.moduleSection, elements.moduleKind].forEach((select) => {
    select.addEventListener("change", () => {
      unpin();
      renderForms();
      updateSummary();
      updateShareLink();
    });
  });
  elements.openTest.addEventListener("click", () => openBooklet("test"));
  elements.downloadTest.addEventListener("click", () => downloadBooklet("test"));
  elements.openKey.addEventListener("click", () => openBooklet("key"));
  elements.downloadKey.addEventListener("click", () => downloadBooklet("key"));
  elements.copyLink.addEventListener("click", copyShareLink);
  elements.shareLink.addEventListener("focus", () => elements.shareLink.select());
  elements.rebuild.addEventListener("click", rebuildFromCode);
  elements.codeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") rebuildFromCode();
  });
  site.onTestChange(() => {
    ensureSelection();
    renderForms();
    updateSummary();
    updateShareLink();
    setWarnings([]);
    setStatus("");
  });

  readUrl();
  renderForms();
  updateSummary();
  updateShareLink();
})();
