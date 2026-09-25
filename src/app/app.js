(function () {
  "use strict";

  const catalog = window.PRACTICE_CATALOG;
  const core = window.PracticeCore;
  const site = window.LiminalSite;
  const runs = window.LiminalRuns;
  const mask = window.LiminalTemplateMask;
  // Namespaced: every project site under one github.io account shares a single
  // localStorage origin.
  const STORAGE_KEY = "liminal:progress:v2";
  // An unfinished set, so closing the tab mid-test loses nothing.
  const SESSION_KEY = "liminal:session:v1";
  // Question counts that match a real module (SAT) or section (ACT).
  const MODULE_SIZES = {
    "sat-reading-writing": 27,
    "sat-math": 22,
    "act-english": 50,
    "act-mathematics": 45,
    "act-reading": 36,
    "act-science": 40,
  };
  // The quick path in the Hard math reps card; the practice form's Hard math
  // reps mode sets any count, feedback, or timer.
  const HARD_REPS_DEFAULT_COUNT = 10;

  const views = {
    setup: document.getElementById("setupView"),
    dashboard: document.getElementById("dashboardView"),
    review: document.getElementById("reviewView"),
    signs: document.getElementById("signsView"),
  };
  // The address bar names the view, so every nav link is a real link that
  // works from the booklet page too.
  const VIEW_BY_HASH = {
    practice: "setup",
    progress: "dashboard",
    review: "review",
    tips: "signs",
  };

  const elements = {
    form: document.getElementById("practiceForm"),
    setupLede: document.getElementById("setupLede"),
    section: document.getElementById("sectionSelect"),
    sectionNote: document.getElementById("sectionNote"),
    mode: document.getElementById("modeSelect"),
    modeNote: document.getElementById("modeNote"),
    count: document.getElementById("countInput"),
    countPicks: document.getElementById("countPicks"),
    feedbackMode: document.getElementById("feedbackSelect"),
    timed: document.getElementById("timedCheck"),
    timedNote: document.getElementById("timedNote"),
    resumeBanner: document.getElementById("resumeBanner"),
    resumeText: document.getElementById("resumeText"),
    resumeBtn: document.getElementById("resumeBtn"),
    discardSession: document.getElementById("discardSessionBtn"),
    filterDetails: document.getElementById("filterDetails"),
    filterSummary: document.getElementById("filterSummary"),
    filterHint: document.getElementById("filterHint"),
    domain: document.getElementById("domainSelect"),
    skill: document.getElementById("skillSelect"),
    search: document.getElementById("searchInput"),
    matchCount: document.getElementById("matchCount"),
    bankStatus: document.getElementById("bankStatus"),
    start: document.getElementById("startBtn"),
    recommendText: document.getElementById("recommendText"),
    recommendBtn: document.getElementById("recommendBtn"),
    hardRepsBtn: document.getElementById("hardRepsBtn"),
    hardRepsCustomize: document.getElementById("hardRepsCustomizeBtn"),
    hardRepsStatus: document.getElementById("hardRepsStatus"),
    miniTestOptions: document.getElementById("miniTestOptions"),
    miniTestStatus: document.getElementById("miniTestStatus"),
    dashboardStats: document.getElementById("dashboardStats"),
    skillTableWrap: document.getElementById("skillTableWrap"),
    masterySection: document.getElementById("masterySection"),
    masterySort: document.getElementById("masterySort"),
    masteryNote: document.getElementById("masteryNote"),
    clearProgress: document.getElementById("clearProgressBtn"),
    missedTab: document.getElementById("missedTab"),
    flaggedTab: document.getElementById("flaggedTab"),
    reviewList: document.getElementById("reviewList"),
    signsDisclaimer: document.getElementById("signsDisclaimer"),
    signsPrinciples: document.getElementById("signsPrinciples"),
    signsFilter: document.getElementById("signsFilter"),
    signsGroups: document.getElementById("signsGroups"),
  };

  let progress = loadProgress();
  let currentBank = [];
  let recommendation = null;
  let activeReviewList = "missed";
  let masteryRows = [];
  let clearArmed = false;
  let clearTimer = null;
  let bankRequestId = 0;
  let currentView = "setup";
  const bankPromises = new Map();
  // The last section chosen for each test, so switching back restores it.
  const sectionByTest = { SAT: "sat-reading-writing", ACT: "act-english" };

  function emptyProgress() {
    return {
      version: 2,
      attempts: [],
      flagged: [],
      recentIds: [],
      servedIds: [],
    };
  }

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && parsed.version === 2) {
        parsed.attempts = Array.isArray(parsed.attempts) ? parsed.attempts : [];
        parsed.flagged = Array.isArray(parsed.flagged) ? parsed.flagged : [];
        parsed.recentIds = Array.isArray(parsed.recentIds) ? parsed.recentIds : [];
        parsed.servedIds = Array.isArray(parsed.servedIds) ? parsed.servedIds : [];
        return parsed;
      }
    } catch (error) {
      console.warn("Could not read local practice progress.", error);
    }
    return emptyProgress();
  }

  function saveProgress() {
    progress.attempts = progress.attempts.slice(-5000);
    progress.recentIds = progress.recentIds.slice(-30);
    // Deep enough that a section's rotation is felt, shallow enough that a
    // filtered pool is never starved.
    progress.servedIds = progress.servedIds.slice(-400);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      setStatus(elements.bankStatus, "Progress could not be saved in this browser. Practice can continue.", "error");
    }
  }

  function setStatus(node, message, kind) {
    node.className = `status-line${kind ? ` ${kind}` : ""}`;
    node.textContent = message || "";
  }

  /* ------------------------------------------------------------ test scope */

  function currentTest() {
    return site.getTest();
  }

  function testSections(test) {
    return catalog.sections.filter((section) => section.test === (test || currentTest()));
  }

  // Attempts carry their section; older records fall back to the question id,
  // which starts with the test too.
  function attemptTest(attempt) {
    return site.testOf(attempt.sectionKey) || site.testOf(attempt.questionId);
  }

  function testAttempts(test) {
    return progress.attempts.filter((attempt) => attemptTest(attempt) === (test || currentTest()));
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  function sectionByKey(key) {
    return catalog.sections.find((section) => section.key === key);
  }

  function populateSections() {
    const sections = testSections();
    elements.section.innerHTML = "";
    sections.forEach((section) => {
      const option = document.createElement("option");
      option.value = section.key;
      option.textContent = section.shortLabel;
      elements.section.appendChild(option);
    });
    const remembered = sectionByTest[currentTest()];
    elements.section.value = sections.some((section) => section.key === remembered)
      ? remembered
      : sections[0].key;
  }

  function renderSetupCopy() {
    const test = currentTest();
    const sections = testSections(test);
    const essay = (section) => (section.responseTypes || []).includes("essay");
    const questions = sections.filter((section) => !essay(section)).length * catalog.targetPerSection;
    const prompts = sections.filter(essay).length * catalog.targetPerSection;
    elements.setupLede.textContent =
      `Build a set from ${formatNumber(questions)} original ${test} questions` +
      (prompts ? ` and ${formatNumber(prompts)} writing prompts` : "") +
      ". Every set opens in the digital test screen.";
  }

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

  async function loadTestBanks(test) {
    const banks = await Promise.all(testSections(test).map((section) => loadBank(section.key)));
    return banks.flat();
  }

  async function changeSection() {
    const requestId = ++bankRequestId;
    const section = sectionByKey(elements.section.value);
    sectionByTest[section.test] = section.key;
    elements.start.disabled = true;
    elements.recommendBtn.disabled = true;
    elements.matchCount.className = "match-count";
    elements.matchCount.textContent = "";
    setStatus(elements.bankStatus, `Loading ${section.test} ${section.shortLabel}…`, "loading");
    elements.sectionNote.textContent = section.optional
      ? "An optional ACT section. It is not part of the ACT Composite score."
      : section.test === "ACT"
        ? "A required section that counts toward the ACT Composite score."
        : "One of the digital SAT's two sections.";
    try {
      const bank = await loadBank(section.key);
      if (usesTemplates(section.key)) await sectionTemplates(section.key);
      if (requestId !== bankRequestId) return;
      currentBank = bank;
      populateTaxonomy();
      updateMatches();
      updateRecommendation();
      setStatus(elements.bankStatus, "");
    } catch (error) {
      if (requestId !== bankRequestId) return;
      currentBank = [];
      elements.matchCount.textContent = "";
      setStatus(
        elements.bankStatus,
        `${error.message} If this file is open locally, confirm the site was built with npm run build.`,
        "error",
      );
    }
  }

  function populateTaxonomy() {
    const section = sectionByKey(elements.section.value);
    replaceOptions(elements.domain, [
      { value: "", label: "All domains" },
      ...section.domains.map((domain) => ({ value: domain.name, label: domain.name })),
    ]);
    populateSkills();
  }

  function populateSkills() {
    const section = sectionByKey(elements.section.value);
    const selectedDomain = elements.domain.value;
    const domains = selectedDomain
      ? section.domains.filter((domain) => domain.name === selectedDomain)
      : section.domains;
    const skills = [...new Set(domains.flatMap((domain) => Object.keys(domain.skills)))];
    replaceOptions(elements.skill, [
      { value: "", label: "All skills" },
      ...skills.map((skill) => ({ value: skill, label: skill })),
    ]);
  }

  function replaceOptions(select, options) {
    select.innerHTML = "";
    options.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  function difficultyInputs() {
    return Array.from(document.querySelectorAll('input[name="difficulty"]'));
  }

  function selectedDifficulties() {
    return difficultyInputs().filter((input) => input.checked).map((input) => input.value);
  }

  function latestMissedIds() {
    const latest = new Map();
    progress.attempts.forEach((attempt) => latest.set(attempt.questionId, attempt));
    return [...latest.values()]
      .filter((attempt) => attempt.correct === false)
      .map((attempt) => attempt.questionId);
  }

  function activeIncludedIds(mode) {
    if (mode === "missed") return latestMissedIds();
    if (mode === "flagged") return progress.flagged;
    return null;
  }

  /* ------------------------------------------------------ template sections */

  // SAT sections are built from templates: parameterized families that draw a
  // fresh question each time. A run takes at most one question per template
  // (lib/runs.js); the run is a template mask plus a seed, and every question's
  // id names its section, template, and seed, so any past question can be
  // rebuilt exactly. ACT sections still draw from their fixed banks.
  // Each template section is one bundle built from
  // src/lib/families/<test>/<section>/ (see tools/lib/families.js).
  const TEMPLATE_SECTIONS = ["sat-math", "sat-reading-writing"];
  // Questions generated before templates had registry bits used this prefix.
  const LEGACY_HARD_PREFIX = "sat-math-hard:";
  const scriptLoads = new Map();
  const familyLoads = new Map();

  function usesTemplates(sectionKey) {
    return TEMPLATE_SECTIONS.includes(sectionKey);
  }

  function loadScript(file) {
    if (!scriptLoads.has(file)) {
      scriptLoads.set(file, new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `lib/families/${file}.js`;
        script.onload = resolve;
        script.onerror = () => {
          scriptLoads.delete(file);
          reject(new Error(`Could not load ${file}.js.`));
        };
        document.head.appendChild(script);
      }));
    }
    return scriptLoads.get(file);
  }

  // The templates are large, so a section's bundle loads the first time that
  // section is chosen; its files register into window.LiminalFamilies.
  function loadFamilies(sectionKey) {
    if (!usesTemplates(sectionKey)) return Promise.resolve([]);
    if (!familyLoads.has(sectionKey)) {
      const loading = loadScript(sectionKey)
        .then(() => runs.catalogTemplates(
          (window.LiminalFamilies || {})[sectionKey] || [],
          (window.PRACTICE_TEMPLATES || {})[sectionKey] || { templates: [] },
        ))
        .catch((error) => {
          familyLoads.delete(sectionKey);
          throw error;
        });
      familyLoads.set(sectionKey, loading);
    }
    return familyLoads.get(sectionKey);
  }

  const loadedTemplates = new Map();

  async function sectionTemplates(sectionKey) {
    if (!loadedTemplates.has(sectionKey)) loadedTemplates.set(sectionKey, await loadFamilies(sectionKey));
    return loadedTemplates.get(sectionKey);
  }

  function templatesNow(sectionKey) {
    return loadedTemplates.get(sectionKey) || [];
  }

  // Rebuilds a generated question from its id: "<section>:<template>:<seed>",
  // or the older "sat-math-hard:<family>:<seed>".
  function generatedQuestion(id) {
    const legacy = id.startsWith(LEGACY_HARD_PREFIX);
    const parts = (legacy ? `sat-math:${id.slice(LEGACY_HARD_PREFIX.length)}` : id).split(":");
    if (parts.length !== 3 || !usesTemplates(parts[0])) return null;
    const [sectionKey, templateId, seed] = parts;
    const template = templatesNow(sectionKey).find((entry) => entry.id === templateId);
    if (!template || !window.LiminalFamilyShared) return null;
    return { ...window.LiminalFamilyShared.instantiate(template.family, seed), id };
  }

  function isGeneratedId(id) {
    return id.startsWith(LEGACY_HARD_PREFIX) || usesTemplates(id.split(":")[0]);
  }

  function templateSeen(sectionKey) {
    const code = (progress.templatesSeen || {})[sectionKey];
    try {
      return code ? mask.fromCode(code) : mask.EMPTY;
    } catch (error) {
      return mask.EMPTY;
    }
  }

  // Templates served in any run so far; a new run prefers the rest.
  function rememberTemplates(sectionKey, runMask) {
    progress.templatesSeen = progress.templatesSeen || {};
    progress.templatesSeen[sectionKey] = mask.toCode(mask.union(templateSeen(sectionKey), runMask));
    saveProgress();
  }

  function newRunSeed() {
    return Math.floor(Math.random() * 36 ** 6).toString(36);
  }

  // One run: at most one question per template, preferring templates not yet
  // seen, spread across skills, never repeating a scene.
  function buildTemplateRun(sectionKey, templates, count, filters) {
    const seed = newRunSeed();
    const run = runs.chooseTemplates(templates, {
      count,
      seed,
      filters,
      seen: templateSeen(sectionKey),
    });
    const questions = runs.drawQuestions(
      run.templates,
      seed,
      window.LiminalFamilyShared.instantiate,
      `${sectionKey}:`,
    );
    rememberTemplates(sectionKey, run.mask);
    return { questions, code: runs.runCode(run.mask, seed) };
  }

  function formFilters() {
    return {
      domains: elements.domain.value ? [elements.domain.value] : [],
      skills: elements.skill.value ? [elements.skill.value] : [],
      difficulties: selectedDifficulties(),
    };
  }

  // The Hard math card: ten Hard SAT Math templates, report at the end.
  async function startHardRepsCard() {
    elements.hardRepsBtn.disabled = true;
    setStatus(elements.hardRepsStatus, "Preparing fresh hard problems…", "loading");
    let templates;
    try {
      templates = await sectionTemplates("sat-math");
    } catch (error) {
      setStatus(elements.hardRepsStatus, `${error.message} Refresh the page and try again.`, "error");
      elements.hardRepsBtn.disabled = false;
      return;
    }
    const run = buildTemplateRun("sat-math", templates, HARD_REPS_DEFAULT_COUNT, { difficulties: ["Hard"] });
    elements.hardRepsBtn.disabled = false;
    setStatus(elements.hardRepsStatus, "");
    launchTestMode({
      title: "SAT Math — Hard",
      sectionKey: "sat-math",
      questions: run.questions,
      runCode: run.code,
      feedback: "end",
      timeLimitSeconds: null,
    });
  }

  // Sets the practice form to SAT Math, Hard only, so the count, feedback, and
  // timer are the student's to choose.
  async function customizeHardReps() {
    if (currentTest() !== "SAT") return;
    if (elements.section.value !== "sat-math") {
      elements.section.value = "sat-math";
      await changeSection();
    }
    elements.mode.value = "targeted";
    difficultyInputs().forEach((input) => {
      input.checked = input.value === "Hard";
    });
    updateMatches();
    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    elements.form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    elements.count.focus({ preventScroll: true });
    setStatus(elements.hardRepsStatus, "The practice form is set to SAT Math, Hard only. Choose the count, feedback, and timer there.", "success");
  }

  /* --------------------------------------------------------- practice form */

  function matchingQuestions() {
    const mode = elements.mode.value;
    const sectionKey = elements.section.value;
    if ((mode === "missed" || mode === "flagged") && usesTemplates(sectionKey)) {
      const ids = mode === "missed" ? latestMissedIds() : progress.flagged;
      const generated = ids
        .filter(isGeneratedId)
        .map(generatedQuestion)
        .filter((question) => question && question.sectionKey === sectionKey);
      return onePerTemplate([...matchingBankQuestions(), ...generated]);
    }
    return matchingBankQuestions();
  }

  // Keeps the first question of each template, so a review set too takes at
  // most one question per template.
  function onePerTemplate(questions) {
    const seen = new Set();
    return questions.filter((question) => {
      const key = question.templateId || question.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Template sections build fresh runs in these modes; review modes replay
  // specific past questions.
  function buildsTemplateRun(mode) {
    return usesTemplates(elements.section.value) &&
      (mode === "targeted" || mode === "full" || mode === "adaptive");
  }

  function runFilters(mode) {
    if (mode === "targeted") return formFilters();
    if (mode === "adaptive") {
      const weak = weakestSkill(elements.section.value);
      return weak ? { skills: [weak.skill] } : {};
    }
    return {};
  }

  function matchingBankQuestions() {
    const mode = elements.mode.value;
    if (mode === "full") return currentBank.slice();
    return core.filterQuestions(currentBank, {
      domains: elements.domain.value ? [elements.domain.value] : [],
      skills: elements.skill.value ? [elements.skill.value] : [],
      difficulties: selectedDifficulties(),
      query: elements.search.value,
      includedIds: activeIncludedIds(mode),
    });
  }

  const MODE_NOTES = {
    targeted: "Questions you have not seen recently, narrowed by any topic filters.",
    full: "A mix from the whole section. Topic filters are not used.",
    adaptive: "Starts with the recommended question, then mixes the section. Topic filters are not used.",
    missed: "Questions you answered wrong most recently in this section.",
    flagged: "Questions you marked for review in this section.",
  };

  // Which topic filters a mode uses, so the disclosure can say why the rest
  // are turned off.
  function filterUse(mode) {
    if (mode === "full" || mode === "adaptive") {
      return { domain: false, skill: false, difficulty: false, search: false,
        hint: "Full section mix and Recommended next draw from the whole section, so topic filters are off." };
    }
    if (buildsTemplateRun(mode)) {
      return { domain: true, skill: true, difficulty: true, search: false,
        hint: "Questions here are generated fresh from templates, so there is no text to search." };
    }
    return { domain: true, skill: true, difficulty: true, search: true, hint: "" };
  }

  function activeFilterCount(use) {
    let count = 0;
    if (use.domain && elements.domain.value) count += 1;
    if (use.skill && elements.skill.value) count += 1;
    if (use.difficulty && selectedDifficulties().length < difficultyInputs().length) count += 1;
    if (use.search && elements.search.value.trim()) count += 1;
    return count;
  }

  function renderFilterState(mode) {
    const use = filterUse(mode);
    elements.domain.disabled = !use.domain;
    elements.skill.disabled = !use.skill;
    elements.search.disabled = !use.search;
    difficultyInputs().forEach((input) => {
      input.disabled = !use.difficulty;
    });
    elements.filterHint.textContent = use.hint;
    elements.filterHint.classList.toggle("hidden", !use.hint);
    const count = activeFilterCount(use);
    const anyUsed = use.domain || use.skill || use.difficulty || use.search;
    elements.filterSummary.textContent = !anyUsed
      ? "Not used in this mode"
      : count
        ? `${count} filter${count === 1 ? "" : "s"} on`
        : "All topics";
    elements.filterSummary.classList.toggle("is-active", anyUsed && count > 0);
  }

  function emptyReason(mode) {
    if (mode === "missed") return "You have no missed questions in this section yet.";
    if (mode === "flagged") return "You have not marked any questions for review in this section.";
    return "No questions match. Loosen a filter under Narrow by topic.";
  }

  function updateMatches() {
    const mode = elements.mode.value;
    elements.modeNote.textContent = MODE_NOTES[mode] || "";
    renderFilterState(mode);
    elements.matchCount.className = "match-count";
    if (buildsTemplateRun(mode)) {
      // A set takes at most one question per template, so the templates that
      // match are the most questions it can hold.
      const available = runs.available(templatesNow(elements.section.value), runFilters(mode));
      elements.matchCount.textContent = available
        ? `${formatNumber(available)} question template${available === 1 ? "" : "s"} match, at most one question each`
        : "No question templates match. Loosen a filter under Narrow by topic.";
      elements.matchCount.classList.toggle("is-empty", available === 0);
      elements.start.disabled = available === 0;
      elements.count.max = String(Math.max(1, available));
      renderCountPicks(available);
      updateTimedNote();
      return;
    }
    // Recommended next draws from the whole section whatever the filters say.
    const matches = mode === "adaptive" ? currentBank : matchingQuestions();
    if (mode === "full" || mode === "adaptive") {
      elements.matchCount.textContent = `${formatNumber(matches.length)} questions in this section`;
    } else if (matches.length) {
      elements.matchCount.textContent = `${formatNumber(matches.length)} question${matches.length === 1 ? "" : "s"} match`;
    } else {
      elements.matchCount.textContent = emptyReason(mode);
      elements.matchCount.classList.add("is-empty");
    }
    elements.start.disabled = matches.length === 0 && mode !== "adaptive";
    elements.count.max = String(Math.max(1, matches.length));
    renderCountPicks(matches.length);
    updateTimedNote();
  }

  // 10, one real module (or section), two modules for the SAT, and all.
  function renderCountPicks(available, unlimited) {
    const moduleSize = MODULE_SIZES[elements.section.value];
    const picks = [10, moduleSize, elements.section.value.startsWith("sat-") ? moduleSize * 2 : null]
      .filter((value, index, list) => value && value < available && list.indexOf(value) === index);
    elements.countPicks.innerHTML = "";
    [...picks, ...(unlimited || !available ? [] : ["all"])].forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = value === "all" ? `All ${formatNumber(available)}` : String(value);
      button.dataset.count = String(value === "all" ? available : value);
      button.setAttribute("aria-pressed", String(elements.count.value === button.dataset.count));
      button.addEventListener("click", () => {
        elements.count.value = button.dataset.count;
        renderCountPicks(available, unlimited);
        updateTimedNote();
      });
      elements.countPicks.appendChild(button);
    });
  }

  function requestedCount() {
    const available = Math.max(1, Number(elements.count.max) || 1);
    const value = Math.round(Number(elements.count.value));
    return Math.min(available, Math.max(1, Number.isFinite(value) ? value : 20));
  }

  function updateTimedNote() {
    const budget = core.paceBudgetSeconds(elements.section.value, requestedCount());
    elements.timed.disabled = budget === null;
    if (budget === null) elements.timed.checked = false;
    elements.timedNote.textContent = budget === null
      ? "This section is not timed per question on the real test."
      : `${requestedCount()} question${requestedCount() === 1 ? "" : "s"} in ` +
        `${formatDuration(budget * 1000)}, the real test's pace.`;
  }

  // The skill with the lowest accuracy in this section, among skills with at
  // least two answered questions.
  function weakestSkill(sectionKey) {
    const bySkill = {};
    progress.attempts.forEach((attempt) => {
      if (attempt.sectionKey !== sectionKey || typeof attempt.correct !== "boolean" || !attempt.skill) return;
      const row = bySkill[attempt.skill] || (bySkill[attempt.skill] = { skill: attempt.skill, answered: 0, correct: 0 });
      row.answered += 1;
      if (attempt.correct) row.correct += 1;
    });
    return Object.values(bySkill)
      .filter((row) => row.answered >= 2)
      .sort((left, right) => left.correct / left.answered - right.correct / right.answered)[0] || null;
  }

  function updateRecommendation() {
    if (usesTemplates(elements.section.value)) {
      const weak = weakestSkill(elements.section.value);
      elements.recommendText.textContent = weak
        ? `Your weakest skill so far is ${weak.skill} (${weak.correct} of ${weak.answered} correct). ` +
          "Start a set on it."
        : "Answer a few questions in this section and a focus will appear here.";
      elements.recommendBtn.disabled = !weak;
      return;
    }
    recommendation = core.recommendQuestion(
      currentBank,
      progress.attempts,
      { recentIds: progress.recentIds },
    );
    if (!recommendation) {
      elements.recommendText.textContent = "No recommendation is available for this section.";
      elements.recommendBtn.disabled = true;
      return;
    }
    elements.recommendText.textContent =
      `${recommendation.reason} Next: ${recommendation.question.domain} — ` +
      `${recommendation.question.subskill}.`;
    elements.recommendBtn.disabled = false;
  }

  /* ---------------------------------------------------------------- mini test */

  function renderMiniTests() {
    const blueprints = core.MINI_TEST_BLUEPRINTS.filter((blueprint) => blueprint.test === currentTest());
    elements.miniTestOptions.innerHTML = "";
    setStatus(elements.miniTestStatus, "");
    blueprints.forEach((blueprint, index) => {
      const item = document.createElement("div");
      item.className = "mini-test-item";
      const name = document.createElement("h3");
      name.textContent = blueprint.label;
      const summary = document.createElement("p");
      summary.textContent = blueprint.summary;
      const total = core.blueprintTotal(blueprint);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `button ${index === 0 ? "primary" : "secondary"}`;
      button.dataset.blueprint = blueprint.id;
      button.textContent = `Start: ${total} questions, ${blueprint.minutes} min`;
      button.setAttribute(
        "aria-label",
        `Start the ${blueprint.label}: ${total} questions in ${blueprint.minutes} minutes`,
      );
      button.addEventListener("click", () => startMiniTest(blueprint.id, button));
      item.append(name, summary, button);
      elements.miniTestOptions.appendChild(item);
    });
  }

  async function startMiniTest(blueprintId, button) {
    const blueprint = core.blueprintById(blueprintId);
    if (!blueprint) return;
    button.disabled = true;
    setStatus(elements.miniTestStatus, `Preparing the ${blueprint.label}…`, "loading");

    if (blueprint.sections.every((entry) => usesTemplates(entry.sectionKey))) {
      let questions;
      try {
        questions = await templateMiniTest(blueprint);
      } catch (error) {
        setStatus(elements.miniTestStatus, `${error.message} Refresh the page and try again.`, "error");
        button.disabled = false;
        return;
      }
      button.disabled = false;
      setStatus(elements.miniTestStatus, "");
      launchTestMode({
        title: blueprint.label,
        sectionKey: blueprint.sections[0].sectionKey,
        questions,
        feedback: "end",
        timeLimitSeconds: blueprint.minutes * 60,
        tools: { calculator: true, reference: true },
      });
      return;
    }

    let bankBySection;
    try {
      const banks = await Promise.all(
        blueprint.sections.map((entry) => loadBank(entry.sectionKey)),
      );
      bankBySection = Object.fromEntries(
        blueprint.sections.map((entry, index) => [entry.sectionKey, banks[index]]),
      );
    } catch (error) {
      setStatus(elements.miniTestStatus, `${error.message} Confirm the site was built with npm run build.`, "error");
      button.disabled = false;
      return;
    }

    const questions = core.buildMiniTest(bankBySection, blueprint, `${Date.now()}-${blueprint.id}`);
    button.disabled = false;
    if (questions.length < core.blueprintTotal(blueprint)) {
      setStatus(elements.miniTestStatus, "Not enough items are available to build this mini test.", "error");
      return;
    }

    setStatus(elements.miniTestStatus, "");
    const math = blueprint.sections.some((entry) => /math/.test(entry.sectionKey));
    launchTestMode({
      title: blueprint.label,
      sectionKey: blueprint.sections[0].sectionKey,
      questions,
      feedback: "end",
      timeLimitSeconds: blueprint.minutes * 60,
      tools: { calculator: math, reference: math && blueprint.id.startsWith("sat") },
    });
  }

  // A mini test on template sections: each section's share, split across
  // difficulty like the bank mini tests, one question per template.
  async function templateMiniTest(blueprint) {
    const questions = [];
    for (const entry of blueprint.sections) {
      const templates = await sectionTemplates(entry.sectionKey);
      const counts = core.allocateByWeight(
        entry.count,
        core.MINI_TEST_DIFFICULTY_MIX.map((tier) => tier.weight),
      );
      core.MINI_TEST_DIFFICULTY_MIX.forEach((tier, index) => {
        if (!counts[index]) return;
        const run = buildTemplateRun(entry.sectionKey, templates, counts[index], { difficulties: [tier.difficulty] });
        questions.push(...run.questions);
      });
    }
    return questions;
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  /* ------------------------------------------------------------ practice flow */

  function startSession(event) {
    if (event) event.preventDefault();
    const mode = elements.mode.value;
    if (buildsTemplateRun(mode)) {
      const section = sectionByKey(elements.section.value);
      const run = buildTemplateRun(section.key, templatesNow(section.key), requestedCount(), runFilters(mode));
      if (!run.questions.length) {
        setStatus(elements.bankStatus, "No question templates match this set. Loosen a filter.", "error");
        return;
      }
      launchTestMode({
        title: `${section.test} ${section.shortLabel}`,
        sectionKey: section.key,
        questions: run.questions,
        runCode: run.code,
        feedback: elements.feedbackMode.value,
        timeLimitSeconds: elements.timed.checked
          ? core.paceBudgetSeconds(section.key, run.questions.length)
          : null,
      });
      return;
    }
    let pool = matchingQuestions();
    if (mode === "adaptive" && recommendation) {
      const remaining = currentBank.filter((question) => question.id !== recommendation.question.id);
      pool = [recommendation.question, ...core.deterministicShuffle(
        remaining,
        `${Date.now()}-adaptive`,
      )];
    }
    if (!pool.length) {
      setStatus(elements.bankStatus, "No questions match this set. Adjust a filter or choose another mode.", "error");
      return;
    }
    const count = requestedCount();
    // Review modes exist precisely to serve questions again, so history is
    // only avoided when the student asked for new practice.
    const revisiting = mode === "missed" || mode === "flagged";
    const questions = mode === "adaptive"
      ? pool.slice(0, count)
      : core.buildSession(pool, count, `${Date.now()}-${elements.section.value}`, {
          avoidIds: revisiting ? [] : progress.servedIds,
          spreadFamilies: !revisiting,
        });
    rememberServed(questions);
    const section = sectionByKey(elements.section.value);
    launchTestMode({
      title: `${section.test} ${section.shortLabel}`,
      sectionKey: section.key,
      questions,
      feedback: elements.feedbackMode.value,
      timeLimitSeconds: elements.timed.checked
        ? core.paceBudgetSeconds(section.key, questions.length)
        : null,
    });
  }

  /* ------------------------------------------------------- digital test mode */

  function loadActiveSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
      return saved && saved.config && saved.state ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function storeActiveSession(value) {
    try {
      if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
      else localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn("Could not save the unfinished set.", error);
    }
  }

  function renderResumeBanner() {
    const saved = loadActiveSession();
    elements.resumeBanner.classList.toggle("hidden", !saved);
    if (!saved) return;
    const when = new Date(saved.savedAt).toLocaleString();
    elements.resumeText.textContent =
      `${saved.config.title}: ${saved.config.questionCount} questions, ` +
      `${saved.config.feedback === "end" ? "report at the end" : "feedback after each question"}. Saved ${when}.`;
  }

  // Every session, practice or timed, runs in the full-screen test mode. The
  // app keeps the records: attempts as they are checked (instant feedback)
  // or all at once when the set is finished (report at the end).
  function launchTestMode(config, resume) {
    if (!window.LiminalShell) {
      setStatus(elements.bankStatus, "The test screen did not load. Refresh the page and try again.", "error");
      return;
    }
    const math = config.sectionKey === "sat-math" || config.sectionKey === "act-mathematics";
    const { questions, ...rest } = config;
    const saved = { config: { ...rest, questionCount: resume ? config.questionCount : questions.length } };
    window.LiminalShell.start({
      ...config,
      tools: config.tools || { calculator: math, reference: config.sectionKey === "sat-math" },
      resume: resume || null,
      onSave(state) {
        storeActiveSession({ ...saved, savedAt: Date.now(), state });
      },
      onAnswer({ question, response, correct }) {
        recordAttempt(question, correct, response);
        saveProgress();
      },
      onFinish(result) {
        const flagged = new Set(progress.flagged);
        result.items.forEach((item) => {
          if (item.marked && !flagged.has(item.question.id)) progress.flagged.push(item.question.id);
        });
        saveProgress();
        if (result.feedback === "end") {
          result.items.forEach((item) => {
            recordAttempt(item.question, item.answered ? item.correct : false, item.answered ? item.response : null);
          });
          saveProgress();
        }
        storeActiveSession(null);
      },
      // Back where the set started, with every count brought up to date.
      onExit() {
        storeActiveSession(null);
        renderResumeBanner();
        updateMatches();
        updateRecommendation();
        openView(currentView);
      },
    });
  }

  function resumeActiveSession() {
    const saved = loadActiveSession();
    if (!saved) return renderResumeBanner();
    launchTestMode({ ...saved.config, questions: [] }, saved.state);
  }

  // Recorded when a session is built, not when a question is answered, so
  // abandoning a session still rotates its questions out.
  function rememberServed(questions) {
    const seen = new Set(progress.servedIds);
    questions.forEach((question) => {
      if (!seen.has(question.id)) progress.servedIds.push(question.id);
    });
    saveProgress();
  }

  function recordAttempt(question, correct, rawResponse) {
    progress.attempts.push({
      questionId: question.id,
      sectionKey: question.sectionKey,
      difficulty: question.difficulty,
      domain: question.domain,
      skill: question.skill,
      ...(question.familyId ? { familyId: question.familyId, seed: question.seed } : {}),
      correct,
      response: question.responseType === "essay" ? "[local essay draft]" : rawResponse,
      timestamp: Date.now(),
      reviewAt: correct === false
        ? Date.now() + 24 * 60 * 60 * 1000
        : correct === true
          ? Date.now() + 7 * 24 * 60 * 60 * 1000
          : null,
    });
    progress.recentIds.push(question.id);
  }

  /* ------------------------------------------------------------------ views */

  // focus: move focus to the view's heading (after navigation, not after a
  // re-render the student did not ask for, such as a test switch).
  function showView(name, options) {
    const focus = !options || options.focus !== false;
    const changed = name !== currentView;
    currentView = name;
    Object.entries(views).forEach(([key, view]) => {
      view.classList.toggle("hidden", key !== name);
    });
    document.querySelectorAll(".site-nav .nav-link").forEach((link) => {
      if (link.dataset.view === name) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (!focus) return;
    if (changed || window.scrollY > 0) {
      const reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }
    const heading = views[name].querySelector("h1");
    if (heading) requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }

  function openView(name, options) {
    if (name === "dashboard") renderDashboard(options);
    else if (name === "review") renderReview(null, options);
    else if (name === "signs") renderSigns(options);
    else showView("setup", options);
  }

  function viewFromHash() {
    return VIEW_BY_HASH[window.location.hash.replace(/^#/, "")] || null;
  }

  function hashForView(name) {
    return `#${Object.keys(VIEW_BY_HASH).find((key) => VIEW_BY_HASH[key] === name)}`;
  }

  function onNavClick(event) {
    const link = event.currentTarget;
    const view = link.dataset.view;
    if (!views[view]) return; // Booklets is another page.
    event.preventDefault();
    const hash = hashForView(view);
    if (window.location.hash === hash) openView(view);
    else window.location.hash = hash;
  }

  async function renderDashboard(options) {
    showView("dashboard", options);
    const test = currentTest();
    elements.dashboardStats.innerHTML =
      '<div class="card stat-card"><span class="stat-label">Loading your progress…</span></div>';
    let questions;
    try {
      questions = await loadTestBanks(test);
    } catch (error) {
      showLoadError(elements.dashboardStats, error);
      elements.skillTableWrap.innerHTML = "";
      return;
    }
    if (test !== currentTest()) return;
    const attempts = testAttempts(test);
    const summary = core.summarizeProgress(attempts, questions);
    const marked = progress.flagged.filter((id) => site.testOf(id) === test).length;
    const missed = latestMissedIds().filter((id) => site.testOf(id) === test).length;
    // Hard accuracy stands alone: overall accuracy on a mostly Easy and
    // Medium mix is what makes practice look better than the real test.
    const hard = core.accuracyByDifficulty(attempts, questions).Hard;
    const percent = (value) => (value === null ? "—" : `${Math.round(value * 100)}%`);
    const cards = [
      ["Questions answered", formatNumber(summary.attempted), ""],
      ["Overall accuracy", percent(summary.accuracy), ""],
      ["Hard accuracy", percent(hard.accuracy),
        hard.attempted ? `${hard.attempted} Hard question${hard.attempted === 1 ? "" : "s"} tried` : "No Hard questions yet"],
      ["Different questions", formatNumber(summary.uniqueCompleted), ""],
      ["Missed / marked", `${missed} / ${marked}`, missed || marked ? "review" : ""],
    ];
    elements.dashboardStats.innerHTML = "";
    cards.forEach(([label, value, note]) => {
      const card = document.createElement("div");
      card.className = "card stat-card";
      const labelNode = document.createElement("span");
      labelNode.className = "stat-label";
      labelNode.textContent = label;
      const valueNode = document.createElement("strong");
      valueNode.className = "stat-value";
      valueNode.textContent = value;
      card.append(labelNode, valueNode);
      if (note === "review") {
        const link = document.createElement("a");
        link.className = "stat-note";
        link.href = "#review";
        link.textContent = "Review them";
        card.appendChild(link);
      } else if (note) {
        const noteNode = document.createElement("span");
        noteNode.className = "stat-note";
        noteNode.textContent = note;
        card.appendChild(noteNode);
      }
      elements.dashboardStats.appendChild(card);
    });
    masteryRows = Object.values(summary.bySkill);
    populateMasterySections();
    renderMastery();
  }

  /* ------------------------------------------------------------- mastery table */

  // Weakness alone puts a single missed question above a skill missed ten
  // times, so the default order weights low accuracy by how much evidence
  // there is for it.
  function focusScore(row) {
    return (1 - row.accuracy) * Math.sqrt(row.attempted);
  }

  const MASTERY_SORTS = {
    focus: (left, right) => focusScore(right) - focusScore(left),
    "accuracy-asc": (left, right) =>
      left.accuracy - right.accuracy || right.attempted - left.attempted,
    "accuracy-desc": (left, right) =>
      right.accuracy - left.accuracy || right.attempted - left.attempted,
    attempted: (left, right) => right.attempted - left.attempted,
    section: (left, right) =>
      sectionLabel(left.sectionKey).localeCompare(sectionLabel(right.sectionKey)) ||
      left.skill.localeCompare(right.skill),
    skill: (left, right) => left.skill.localeCompare(right.skill),
  };

  function sectionLabel(sectionKey) {
    const section = sectionByKey(sectionKey);
    return section ? section.shortLabel : sectionKey;
  }

  // Only sections the student has actually attempted are offered, so the
  // filter never leads to an empty table.
  function populateMasterySections() {
    const present = [...new Set(masteryRows.map((row) => row.sectionKey))].sort(
      (left, right) => sectionLabel(left).localeCompare(sectionLabel(right)),
    );
    const previous = elements.masterySection.value;
    elements.masterySection.innerHTML = "";
    const all = document.createElement("option");
    all.value = "all";
    all.textContent = `All sections (${masteryRows.length} skills)`;
    elements.masterySection.appendChild(all);
    present.forEach((sectionKey) => {
      const option = document.createElement("option");
      option.value = sectionKey;
      const count = masteryRows.filter((row) => row.sectionKey === sectionKey).length;
      option.textContent = `${sectionLabel(sectionKey)} (${count})`;
      elements.masterySection.appendChild(option);
    });
    if (previous && present.includes(previous)) elements.masterySection.value = previous;
    // Nothing to filter or sort yet: hide the controls rather than show them
    // disabled with no reason.
    elements.masterySection.closest(".inline-controls").classList.toggle("hidden", !masteryRows.length);
  }

  function renderMastery() {
    if (!masteryRows.length) {
      elements.masteryNote.textContent = "";
      elements.skillTableWrap.innerHTML = "";
      const empty = document.createElement("div");
      empty.className = "empty-state";
      const title = document.createElement("strong");
      title.textContent = `No ${currentTest()} answers yet.`;
      const body = document.createElement("p");
      body.textContent = "Finish a practice set and your accuracy for each skill appears here, weakest first.";
      const link = document.createElement("a");
      link.className = "button primary";
      link.href = "#practice";
      link.textContent = "Build a practice set";
      empty.append(title, body, link);
      elements.skillTableWrap.appendChild(empty);
      return;
    }

    const sectionFilter = elements.masterySection.value || "all";
    const sortKey = elements.masterySort.value || "focus";
    const rows = masteryRows
      .filter((row) => sectionFilter === "all" || row.sectionKey === sectionFilter)
      .sort(MASTERY_SORTS[sortKey] || MASTERY_SORTS.focus);

    elements.masteryNote.textContent = sortKey === "focus"
      ? `${rows.length} skill${rows.length === 1 ? "" : "s"}, weakest first: accuracy weighted by ` +
        "how many questions you have answered in each skill."
      : `${rows.length} skill${rows.length === 1 ? "" : "s"}.`;

    const table = document.createElement("table");
    table.className = "data-table";
    table.innerHTML =
      '<thead><tr><th scope="col">Skill</th><th scope="col">Section</th><th scope="col">Answered</th>' +
      '<th scope="col">Accuracy</th><th scope="col">Next step</th></tr></thead>';
    const body = document.createElement("tbody");
    rows.forEach((row) => {
      const accuracy = Math.round(row.accuracy * 100);
      const tr = document.createElement("tr");
      const cells = [
        ["Skill", row.skill],
        ["Section", sectionLabel(row.sectionKey)],
        ["Answered", String(row.attempted)],
        ["Accuracy", null],
        ["Next step", accuracy < 50 ? "Rebuild with Easy" : accuracy < 80 ? "Continue at Medium" : "Try Hard"],
      ];
      cells.forEach(([label, text]) => {
        const td = document.createElement("td");
        td.dataset.label = label;
        if (label === "Answered") td.className = "num";
        if (text === null) {
          const cell = document.createElement("span");
          cell.className = "meter-cell";
          const meter = document.createElement("span");
          meter.className = "meter";
          meter.setAttribute("aria-hidden", "true");
          const fill = document.createElement("i");
          fill.style.width = `${accuracy}%`;
          meter.appendChild(fill);
          cell.append(meter, document.createTextNode(`${accuracy}%`));
          td.appendChild(cell);
        } else {
          td.textContent = text;
        }
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    table.appendChild(body);
    elements.skillTableWrap.innerHTML = "";
    elements.skillTableWrap.appendChild(table);
  }

  /* ------------------------------------------------------------ review lists */

  function reviewIds(listName, test) {
    const ids = listName === "missed" ? latestMissedIds() : progress.flagged;
    return ids.filter((id) => site.testOf(id) === test);
  }

  function reviewMatches(ids, questions) {
    const idSet = new Set(ids);
    return [
      ...questions.filter((question) => idSet.has(question.id)),
      ...ids.filter(isGeneratedId).map(generatedQuestion).filter(Boolean),
    ];
  }

  function renderReviewTabs(counts) {
    [elements.missedTab, elements.flaggedTab].forEach((button) => {
      const list = button.dataset.list;
      const selected = list === activeReviewList;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected) elements.reviewList.setAttribute("aria-labelledby", button.id);
      button.textContent = list === "missed" ? "Missed" : "Marked for review";
      if (counts) {
        const count = document.createElement("span");
        count.className = "tab-count";
        count.textContent = `(${counts[list]})`;
        button.appendChild(count);
      }
    });
  }

  async function renderReview(listName, options) {
    activeReviewList = listName || activeReviewList;
    showView("review", options);
    const test = currentTest();
    renderReviewTabs(null);
    elements.reviewList.innerHTML = '<div class="card"><p class="muted">Loading saved questions…</p></div>';
    let questions;
    try {
      questions = await loadTestBanks(test);
    } catch (error) {
      showLoadError(elements.reviewList, error);
      return;
    }
    const lists = { missed: reviewIds("missed", test), flagged: reviewIds("flagged", test) };
    const generatedSections = new Set([...lists.missed, ...lists.flagged]
      .filter(isGeneratedId)
      .map((id) => (id.startsWith(LEGACY_HARD_PREFIX) ? "sat-math" : id.split(":")[0])));
    await Promise.all([...generatedSections].map((sectionKey) =>
      sectionTemplates(sectionKey).catch((error) => console.warn(error.message))));
    if (test !== currentTest()) return;
    const matchesByList = {
      missed: reviewMatches(lists.missed, questions),
      flagged: reviewMatches(lists.flagged, questions),
    };
    renderReviewTabs({ missed: matchesByList.missed.length, flagged: matchesByList.flagged.length });
    const matches = matchesByList[activeReviewList];
    const listLabel = activeReviewList === "flagged" ? "marked" : "missed";
    elements.reviewList.innerHTML = "";
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "card empty-state";
      const title = document.createElement("strong");
      title.textContent = `No ${listLabel} ${test} questions.`;
      const body = document.createElement("p");
      body.textContent = activeReviewList === "flagged"
        ? "Use Mark for Review during a set and the question is saved here."
        : "Questions you answer wrong are saved here so you can try them again.";
      const link = document.createElement("a");
      link.className = "button primary";
      link.href = "#practice";
      link.textContent = "Build a practice set";
      empty.append(title, body, link);
      elements.reviewList.appendChild(empty);
      return;
    }
    const toolbar = document.createElement("div");
    toolbar.className = "review-toolbar";
    const start = document.createElement("button");
    start.type = "button";
    start.className = "button primary";
    start.textContent = `Practice all ${matches.length}`;
    start.addEventListener("click", () => {
      const set = core.buildSession(matches, "all", `${Date.now()}-review`);
      const math = set.some((question) => /math/.test(question.sectionKey));
      launchTestMode({
        title: `${test} review: ${listLabel} questions`,
        sectionKey: set[0].sectionKey,
        questions: set,
        feedback: "instant",
        timeLimitSeconds: null,
        tools: { calculator: math, reference: set.some((question) => question.sectionKey === "sat-math") },
      });
    });
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "Feedback after each question, no timer.";
    toolbar.append(start, note);
    elements.reviewList.appendChild(toolbar);
    matches.slice(0, 100).forEach((question) => {
      const card = document.createElement("article");
      card.className = "card review-item";
      const header = document.createElement("div");
      header.className = "review-item-head";
      const tags = document.createElement("span");
      tags.textContent = `${sectionLabel(question.sectionKey)} · ${question.skill}`;
      const id = document.createElement("small");
      id.textContent = question.id;
      header.append(tags, id);
      const stem = document.createElement("h2");
      stem.className = "review-stem";
      stem.textContent = question.stem;
      card.append(header, stem);
      elements.reviewList.appendChild(card);
    });
    if (matches.length > 100) {
      const more = document.createElement("p");
      more.className = "field-note";
      more.textContent = `Showing the first 100 of ${matches.length}; all are included when you practice.`;
      elements.reviewList.appendChild(more);
    }
  }

  function showLoadError(container, error) {
    container.innerHTML = "";
    const card = document.createElement("div");
    card.className = "card empty-state";
    const heading = document.createElement("strong");
    heading.textContent = "Practice content could not be loaded.";
    const detail = document.createElement("p");
    detail.textContent = `${error.message} Refresh the page or verify the site was built with npm run build.`;
    card.append(heading, detail);
    container.appendChild(card);
  }

  function resetClearButton() {
    clearArmed = false;
    window.clearTimeout(clearTimer);
    elements.clearProgress.classList.remove("is-armed");
    elements.clearProgress.textContent = "Clear all saved progress";
  }

  function clearProgress() {
    if (!clearArmed) {
      clearArmed = true;
      elements.clearProgress.classList.add("is-armed");
      elements.clearProgress.textContent = "Click again to clear everything";
      clearTimer = window.setTimeout(resetClearButton, 5000);
      return;
    }
    progress = emptyProgress();
    saveProgress();
    resetClearButton();
    renderDashboard({ focus: false });
    updateMatches();
    updateRecommendation();
  }

  /* ------------------------------------------------------------- study tips */

  let activeSignsFilter = "all";

  function signsGroupsForTest(data) {
    const test = currentTest();
    return (data.groups || []).filter((group) => group.test === test || /^both$/i.test(group.test));
  }

  function renderSigns(options) {
    showView("signs", options);
    const data = window.PRACTICE_ANSWER_SIGNS;
    if (!data) {
      elements.signsGroups.innerHTML =
        '<div class="card empty-state"><strong>The study tips could not load.</strong>' +
        "<p>Confirm content/answer-signs.js was built.</p></div>";
      return;
    }
    elements.signsDisclaimer.textContent = data.disclaimer;

    elements.signsPrinciples.innerHTML = "";
    (data.principles || []).forEach((principle) => {
      const card = document.createElement("div");
      card.className = "principle";
      const title = document.createElement("h3");
      title.textContent = principle.title;
      const body = document.createElement("p");
      body.textContent = principle.body;
      card.append(title, body);
      elements.signsPrinciples.appendChild(card);
    });

    const groups = signsGroupsForTest(data);
    if (!groups.some((group) => group.id === activeSignsFilter)) activeSignsFilter = "all";
    buildSignsFilter(groups);
    buildSignsGroups(groups);
    applySignsFilter();
  }

  function buildSignsFilter(groups) {
    elements.signsFilter.innerHTML = "";
    const options = [{ id: "all", label: `All ${currentTest()} sections` }].concat(
      groups.map((group) => ({ id: group.id, label: group.category })),
    );
    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.dataset.filter = option.id;
      button.textContent = option.label;
      button.addEventListener("click", () => {
        activeSignsFilter = option.id;
        applySignsFilter();
      });
      elements.signsFilter.appendChild(button);
    });
  }

  function applySignsFilter() {
    elements.signsFilter.querySelectorAll(".chip").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === activeSignsFilter));
    });
    elements.signsGroups.querySelectorAll(".signs-group").forEach((group) => {
      const show = activeSignsFilter === "all" || group.dataset.group === activeSignsFilter;
      group.classList.toggle("hidden", !show);
    });
  }

  function buildSignsGroups(groups) {
    elements.signsGroups.innerHTML = "";
    groups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "card signs-group";
      section.dataset.group = group.id;

      const head = document.createElement("div");
      head.className = "signs-group-head";
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = group.test;
      const title = document.createElement("h2");
      title.textContent = group.title;
      head.append(badge, title);

      const intro = document.createElement("p");
      intro.className = "signs-group-intro";
      intro.textContent = group.intro;

      const list = document.createElement("div");
      list.className = "tell-list";
      group.tells.forEach((tell) => list.appendChild(buildTellCard(tell)));
      section.append(head, intro, list);
      elements.signsGroups.appendChild(section);
    });
  }

  function buildTellCard(tell) {
    const card = document.createElement("article");
    card.className = "tell";
    const name = document.createElement("h3");
    name.textContent = tell.name;
    card.appendChild(name);
    const rows = [
      ["Look for", tell.sign, "sign"],
      ["Why it works", tell.why, "why"],
      ["Example", tell.example, "example"],
      ["Caution", tell.caution, "caution"],
    ];
    rows.forEach(([label, value, kind]) => {
      if (!value) return;
      const row = document.createElement("p");
      row.className = `tell-${kind}`;
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      row.append(strong, document.createTextNode(value));
      card.appendChild(row);
    });
    return card;
  }

  /* ------------------------------------------------------------ test switch */

  function onTestChanged() {
    populateSections();
    renderSetupCopy();
    renderMiniTests();
    setStatus(elements.hardRepsStatus, "");
    changeSection();
    if (currentView !== "setup") openView(currentView, { focus: false });
  }

  /* ----------------------------------------------------------------- wiring */

  function wireEvents() {
    elements.section.addEventListener("change", changeSection);
    elements.domain.addEventListener("change", () => {
      populateSkills();
      updateMatches();
    });
    [elements.skill, elements.mode, elements.count].forEach((control) => {
      control.addEventListener("change", updateMatches);
    });
    elements.search.addEventListener("input", updateMatches);
    difficultyInputs().forEach((input) => {
      input.addEventListener("change", updateMatches);
    });
    elements.form.addEventListener("submit", startSession);
    elements.count.addEventListener("input", () => {
      renderCountPicks(Number(elements.count.max) || 1);
      updateTimedNote();
    });
    elements.resumeBtn.addEventListener("click", resumeActiveSession);
    elements.discardSession.addEventListener("click", () => {
      storeActiveSession(null);
      renderResumeBanner();
    });
    elements.recommendBtn.addEventListener("click", () => {
      elements.mode.value = "adaptive";
      updateMatches();
      startSession();
    });
    elements.hardRepsBtn.addEventListener("click", startHardRepsCard);
    elements.hardRepsCustomize.addEventListener("click", customizeHardReps);
    elements.masterySection.addEventListener("change", renderMastery);
    elements.masterySort.addEventListener("change", renderMastery);
    elements.clearProgress.addEventListener("click", clearProgress);
    document.querySelectorAll(".site-header a[data-view]").forEach((link) => {
      link.addEventListener("click", onNavClick);
    });
    window.addEventListener("hashchange", () => {
      const view = viewFromHash();
      if (view) openView(view);
    });
    [elements.missedTab, elements.flaggedTab].forEach((button, index, tabs) => {
      button.addEventListener("click", () => renderReview(button.dataset.list, { focus: false }));
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const next = tabs[(index + 1) % tabs.length];
        next.focus();
        renderReview(next.dataset.list, { focus: false });
      });
    });
    site.onTestChange(onTestChanged);
  }

  populateSections();
  renderSetupCopy();
  renderMiniTests();
  wireEvents();
  renderResumeBanner();
  changeSection();
  openView(viewFromHash() || "setup", { focus: false });
})();
