(function () {
  "use strict";

  const catalog = window.PRACTICE_CATALOG;
  const core = window.PracticeCore;
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
  const views = {
    setup: document.getElementById("setupView"),
    dashboard: document.getElementById("dashboardView"),
    review: document.getElementById("reviewView"),
    signs: document.getElementById("signsView"),
  };

  const elements = {
    form: document.getElementById("practiceForm"),
    section: document.getElementById("sectionSelect"),
    sectionNote: document.getElementById("sectionNote"),
    mode: document.getElementById("modeSelect"),
    count: document.getElementById("countInput"),
    countPicks: document.getElementById("countPicks"),
    feedbackMode: document.getElementById("feedbackSelect"),
    timed: document.getElementById("timedCheck"),
    timedNote: document.getElementById("timedNote"),
    resumeBanner: document.getElementById("resumeBanner"),
    resumeText: document.getElementById("resumeText"),
    resumeBtn: document.getElementById("resumeBtn"),
    discardSession: document.getElementById("discardSessionBtn"),
    domain: document.getElementById("domainSelect"),
    skill: document.getElementById("skillSelect"),
    search: document.getElementById("searchInput"),
    matchCount: document.getElementById("matchCount"),
    bankStatus: document.getElementById("bankStatus"),
    start: document.getElementById("startBtn"),
    recommendText: document.getElementById("recommendText"),
    recommendBtn: document.getElementById("recommendBtn"),
    miniTestOptions: document.getElementById("miniTestOptions"),
    miniTestSummary: document.getElementById("miniTestSummary"),
    miniTestStart: document.getElementById("miniTestStartBtn"),
    miniTestStatus: document.getElementById("miniTestStatus"),
    dashboardStats: document.getElementById("dashboardStats"),
    skillTableWrap: document.getElementById("skillTableWrap"),
    masterySection: document.getElementById("masterySection"),
    masterySort: document.getElementById("masterySort"),
    masteryNote: document.getElementById("masteryNote"),
    clearProgress: document.getElementById("clearProgressBtn"),
    reviewList: document.getElementById("reviewList"),
    home: document.getElementById("homeLink"),
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
  let bankRequestId = 0;
  const bankPromises = new Map();

  let selectedBlueprintId = "sat";

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
      elements.bankStatus.className = "status-line error";
      elements.bankStatus.textContent =
        "Progress could not be saved in this browser. Practice can continue.";
    }
  }

  function sectionByKey(key) {
    return catalog.sections.find((section) => section.key === key);
  }

  function populateSections() {
    catalog.sections.forEach((section) => {
      const option = document.createElement("option");
      option.value = section.key;
      option.textContent = `${section.test} — ${section.shortLabel} (${catalog.targetPerSection})`;
      elements.section.appendChild(option);
    });
    elements.section.value = "sat-reading-writing";
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

  async function loadAllBanks() {
    const banks = await Promise.all(catalog.sections.map((section) => loadBank(section.key)));
    return banks.flat();
  }

  async function changeSection() {
    const requestId = ++bankRequestId;
    const section = sectionByKey(elements.section.value);
    elements.start.disabled = true;
    elements.recommendBtn.disabled = true;
    elements.bankStatus.className = "status-line loading";
    elements.bankStatus.textContent = `Loading ${section.test} ${section.shortLabel}…`;
    elements.sectionNote.textContent = section.optional
      ? "This is an optional ACT section and is not part of the current Composite score."
      : section.test === "ACT"
        ? "This required section contributes to the current ACT Composite score."
        : "This is one of the digital SAT's two sections.";
    try {
      const bank = await loadBank(section.key);
      if (section.key === "sat-math") {
        await loadHardFamilies().catch((error) => console.warn(error.message));
      }
      if (requestId !== bankRequestId) return;
      currentBank = bank;
      const hardOption = elements.mode.querySelector('option[value="hard-reps"]');
      const hardAvailable = section.key === "sat-math" && (window.SAT_MATH_HARD_FAMILIES || []).length > 0;
      hardOption.hidden = !hardAvailable;
      hardOption.disabled = !hardAvailable;
      if (!hardAvailable && elements.mode.value === "hard-reps") elements.mode.value = "targeted";
      populateTaxonomy();
      updateMatches();
      updateRecommendation();
      elements.bankStatus.className = "status-line success";
      elements.bankStatus.textContent =
        `${currentBank.length} validated original items ready. Content version ${catalog.contentVersion}.`;
    } catch (error) {
      if (requestId !== bankRequestId) return;
      currentBank = [];
      elements.matchCount.textContent = "Unavailable";
      elements.bankStatus.className = "status-line error";
      elements.bankStatus.textContent =
        `${error.message} If this file is open locally, confirm the site was built with npm run build.`;
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

  function selectedDifficulties() {
    return Array.from(
      document.querySelectorAll('input[name="difficulty"]:checked'),
      (input) => input.value,
    );
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

  /* ------------------------------------------------------- hard math reps */

  const HARD_ID_PREFIX = "sat-math-hard:";
  const HARD_FAMILY_FILES = [
    "shared",
    "algebra",
    "advanced-quadratics",
    "advanced-functions",
    "data-analysis",
    "geometry",
  ];
  let hardFamiliesLoading = null;

  // The generators are about half a megabyte, so they load only once SAT Math
  // is chosen, in order, since each family file registers onto shared.js.
  function loadHardFamilies() {
    if (!hardFamiliesLoading) {
      hardFamiliesLoading = HARD_FAMILY_FILES.reduce(
        (chain, name) => chain.then(() => new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `lib/families/sat-math-hard/${name}.js`;
          script.onload = resolve;
          script.onerror = () => reject(new Error(`Could not load ${name}.js.`));
          document.head.appendChild(script);
        })),
        Promise.resolve(),
      ).catch((error) => {
        hardFamiliesLoading = null;
        throw error;
      });
    }
    return hardFamiliesLoading;
  }

  function hardFamilies() {
    const families = window.SAT_MATH_HARD_FAMILIES || [];
    return families.filter((family) =>
      (!elements.domain.value || family.domain === elements.domain.value) &&
      (!elements.skill.value || family.skill === elements.skill.value));
  }

  // A generated question's id names its family and seed, so any past item can
  // be rebuilt exactly, e.g. to re-serve a missed one.
  function hardQuestion(familyId, seed) {
    const family = (window.SAT_MATH_HARD_FAMILIES || []).find((entry) => entry.id === familyId);
    if (!family || !window.SAT_MATH_HARD_SHARED) return null;
    const record = window.SAT_MATH_HARD_SHARED.instantiate(family, seed);
    return { ...record, id: `${HARD_ID_PREFIX}${familyId}:${seed}` };
  }

  function hardQuestionById(id) {
    if (!id.startsWith(HARD_ID_PREFIX)) return null;
    const [familyId, seed] = id.slice(HARD_ID_PREFIX.length).split(":");
    return hardQuestion(familyId, seed);
  }

  // Families are dealt round-robin in a shuffled order, and each family's
  // seed counter advances, so a set never repeats a problem already served.
  function buildHardReps(count) {
    const families = core.deterministicShuffle(hardFamilies(), `${Date.now()}-hard`);
    if (!families.length) return [];
    progress.hardSeeds = progress.hardSeeds || {};
    const questions = [];
    for (let index = 0; questions.length < count; index += 1) {
      const family = families[index % families.length];
      const seed = progress.hardSeeds[family.id] || 1000;
      progress.hardSeeds[family.id] = seed + 1;
      const question = hardQuestion(family.id, seed);
      if (question) questions.push(question);
      if (index > count * 4) break;
    }
    saveProgress();
    return questions;
  }

  function matchingQuestions() {
    const mode = elements.mode.value;
    if (mode === "hard-reps") return [];
    if ((mode === "missed" || mode === "flagged") && elements.section.value === "sat-math") {
      const ids = mode === "missed" ? latestMissedIds() : progress.flagged;
      const generated = ids.map(hardQuestionById).filter(Boolean);
      return [...matchingBankQuestions(), ...generated];
    }
    return matchingBankQuestions();
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

  function updateMatches() {
    const mode = elements.mode.value;
    const filtersDisabled = mode === "full" || mode === "adaptive";
    [elements.domain, elements.skill, elements.search].forEach((control) => {
      control.disabled = filtersDisabled;
    });
    document.querySelectorAll('input[name="difficulty"]').forEach((input) => {
      input.disabled = filtersDisabled;
    });
    if (mode === "hard-reps") {
      const types = hardFamilies().length;
      elements.matchCount.textContent = `${types} problem type${types === 1 ? "" : "s"}, fresh each time`;
      elements.start.disabled = types === 0;
      document.querySelectorAll('input[name="difficulty"]').forEach((input) => {
        input.disabled = true;
      });
      elements.search.disabled = true;
      elements.count.max = "100";
      renderCountPicks(100, true);
      updateTimedNote();
      return;
    }
    const matches = matchingQuestions();
    elements.matchCount.textContent = `${matches.length} match${matches.length === 1 ? "" : "es"}`;
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
    [...picks, ...(unlimited ? [] : ["all"])].forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "count-pick";
      button.textContent = value === "all" ? `All (${available})` : String(value);
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
      ? "This section is not timed per question."
      : `${requestedCount()} questions in ${formatDuration(budget * 1000)}, the real test's pace.`;
  }

  function updateRecommendation() {
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

  function renderMiniTestOptions() {
    elements.miniTestOptions.innerHTML = "";
    core.MINI_TEST_BLUEPRINTS.forEach((blueprint) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mini-test-option";
      button.dataset.blueprint = blueprint.id;
      button.setAttribute("aria-pressed", String(blueprint.id === selectedBlueprintId));
      if (blueprint.id === selectedBlueprintId) button.classList.add("active");
      const name = document.createElement("strong");
      name.textContent = blueprint.label;
      const meta = document.createElement("span");
      meta.textContent =
        `${core.blueprintTotal(blueprint)} questions · ${blueprint.minutes} min`;
      button.append(name, meta);
      button.addEventListener("click", () => {
        selectedBlueprintId = blueprint.id;
        renderMiniTestOptions();
      });
      elements.miniTestOptions.appendChild(button);
    });
    const active = core.blueprintById(selectedBlueprintId);
    elements.miniTestSummary.textContent = active ? active.summary : "";
    elements.miniTestStart.disabled = !active;
  }

  async function startMiniTest() {
    const blueprint = core.blueprintById(selectedBlueprintId);
    if (!blueprint) return;
    elements.miniTestStart.disabled = true;
    elements.miniTestStatus.className = "status-line loading";
    elements.miniTestStatus.textContent = `Preparing the ${blueprint.label}…`;

    let bankBySection;
    try {
      const banks = await Promise.all(
        blueprint.sections.map((entry) => loadBank(entry.sectionKey)),
      );
      bankBySection = Object.fromEntries(
        blueprint.sections.map((entry, index) => [entry.sectionKey, banks[index]]),
      );
    } catch (error) {
      elements.miniTestStatus.className = "status-line error";
      elements.miniTestStatus.textContent =
        `${error.message} Confirm the site was built with npm run build.`;
      elements.miniTestStart.disabled = false;
      return;
    }

    const questions = core.buildMiniTest(bankBySection, blueprint, `${Date.now()}-${blueprint.id}`);
    if (questions.length < core.blueprintTotal(blueprint)) {
      elements.miniTestStatus.className = "status-line error";
      elements.miniTestStatus.textContent =
        "Not enough items are available to build this mini test.";
      elements.miniTestStart.disabled = false;
      return;
    }

    elements.miniTestStatus.className = "status-line";
    elements.miniTestStatus.textContent = "";
    elements.miniTestStart.disabled = false;
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
    if (mode === "hard-reps") {
      const questions = buildHardReps(requestedCount());
      if (!questions.length) return;
      launchTestMode({
        title: "SAT Math — Hard reps",
        sectionKey: "sat-math",
        questions,
        feedback: elements.feedbackMode.value,
        timeLimitSeconds: elements.timed.checked
          ? core.paceBudgetSeconds("sat-math", questions.length)
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
      elements.bankStatus.className = "status-line error";
      elements.bankStatus.textContent = "No questions match this session. Adjust a filter or review list.";
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
      elements.bankStatus.className = "status-line error";
      elements.bankStatus.textContent = "The test screen did not load. Refresh the page and try again.";
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
      onExit() {
        storeActiveSession(null);
        renderResumeBanner();
        showView("setup");
        updateMatches();
        updateRecommendation();
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

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  function showView(name) {
    Object.entries(views).forEach(([key, view]) => {
      view.classList.toggle("hidden", key !== name);
    });
    document.querySelectorAll(".nav-link").forEach((button) => {
      const selected = button.dataset.view === name;
      button.classList.toggle("active", selected);
      if (selected) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    const heading = views[name].querySelector("h1");
    if (heading) requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }

  async function renderDashboard() {
    showView("dashboard");
    elements.dashboardStats.innerHTML =
      '<div class="panel loading-card">Loading progress across sections…</div>';
    let questions;
    try {
      questions = await loadAllBanks();
    } catch (error) {
      showLoadError(elements.dashboardStats, error);
      elements.skillTableWrap.innerHTML = "";
      return;
    }
    const summary = core.summarizeProgress(progress.attempts, questions);
    const marked = progress.flagged.length;
    const missed = latestMissedIds().length;
    // Hard accuracy stands alone: overall accuracy on a mostly Easy and
    // Medium mix is what makes practice look better than the real test.
    const hard = core.accuracyByDifficulty(progress.attempts, questions).Hard;
    const cards = [
      ["Questions attempted", summary.attempted],
      ["Overall accuracy", summary.accuracy === null ? "—" : `${Math.round(summary.accuracy * 100)}%`],
      [
        hard.attempted ? `Hard accuracy (${hard.attempted} tried)` : "Hard accuracy",
        hard.accuracy === null ? "—" : `${Math.round(hard.accuracy * 100)}%`,
      ],
      ["Unique completed", summary.uniqueCompleted],
      ["Marked / missed", `${marked} / ${missed}`],
    ];
    elements.dashboardStats.innerHTML = "";
    cards.forEach(([label, value]) => {
      const card = document.createElement("div");
      card.className = "panel stat-card";
      const strong = document.createElement("strong");
      strong.textContent = value;
      const span = document.createElement("span");
      span.textContent = label;
      card.append(strong, span);
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
    return section ? `${section.test} — ${section.shortLabel}` : sectionKey;
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
  }

  function renderMastery() {
    if (!masteryRows.length) {
      elements.masteryNote.textContent = "";
      elements.skillTableWrap.innerHTML =
        '<div class="empty-state"><strong>No scored attempts yet.</strong>' +
        "<p>Complete a practice session to see skill-level accuracy.</p></div>";
      return;
    }

    const sectionFilter = elements.masterySection.value || "all";
    const sortKey = elements.masterySort.value || "focus";
    const rows = masteryRows
      .filter((row) => sectionFilter === "all" || row.sectionKey === sectionFilter)
      .sort(MASTERY_SORTS[sortKey] || MASTERY_SORTS.focus);

    elements.masteryNote.textContent = sortKey === "focus"
      ? `${rows.length} skills, weakest first — accuracy weighted by how many ` +
        "questions you have answered in each skill."
      : `${rows.length} skills.`;

    const table = document.createElement("table");
    table.innerHTML =
      "<thead><tr><th>Skill</th><th>Section</th><th>Attempts</th>" +
      "<th>Accuracy</th><th>Next step</th></tr></thead>";
    const body = document.createElement("tbody");
    rows.forEach((row) => {
      const accuracy = Math.round(row.accuracy * 100);
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td>${escapeHtml(row.skill)}</td>` +
        `<td class="mastery-section-cell">${escapeHtml(sectionLabel(row.sectionKey))}</td>` +
        `<td>${row.attempted}</td>` +
        `<td><span class="meter"><i style="width:${accuracy}%"></i></span> ${accuracy}%</td>` +
        `<td>${accuracy < 50 ? "Rebuild with Easy" : accuracy < 80 ? "Continue at Medium" : "Try Hard"}</td>`;
      body.appendChild(tr);
    });
    table.appendChild(body);
    elements.skillTableWrap.innerHTML = "";
    elements.skillTableWrap.appendChild(table);
  }

  async function renderReview(listName) {
    activeReviewList = listName || activeReviewList;
    showView("review");
    document.querySelectorAll(".review-tab").forEach((button) => {
      const selected = button.dataset.list === activeReviewList;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected) {
        elements.reviewList.setAttribute("aria-labelledby", button.id);
      }
    });
    elements.reviewList.innerHTML =
      '<div class="panel loading-card">Loading saved questions…</div>';
    let questions;
    try {
      questions = await loadAllBanks();
    } catch (error) {
      showLoadError(elements.reviewList, error);
      return;
    }
    const ids = activeReviewList === "missed"
      ? latestMissedIds()
      : progress[activeReviewList];
    const idSet = new Set(ids);
    const generatedIds = ids.filter((id) => id.startsWith(HARD_ID_PREFIX));
    if (generatedIds.length) await loadHardFamilies().catch((error) => console.warn(error.message));
    const matches = [
      ...questions.filter((question) => idSet.has(question.id)),
      ...generatedIds.map(hardQuestionById).filter(Boolean),
    ];
    elements.reviewList.innerHTML = "";
    if (!matches.length) {
      elements.reviewList.innerHTML =
        `<div class="panel empty-state"><strong>No ${activeReviewList === "flagged" ? "marked" : activeReviewList} questions.</strong>` +
        "<p>Your list will appear here as you practice.</p></div>";
      return;
    }
    const start = document.createElement("button");
    start.className = "button primary review-start";
    start.textContent = `Practice all ${matches.length}`;
    start.addEventListener("click", () => {
      const questions = core.buildSession(matches, "all", `${Date.now()}-review`);
      const math = questions.some((question) => /math/.test(question.sectionKey));
      launchTestMode({
        title: "Review list",
        sectionKey: questions[0].sectionKey,
        questions,
        feedback: "instant",
        timeLimitSeconds: null,
        tools: { calculator: math, reference: questions.some((question) => question.sectionKey === "sat-math") },
      });
    });
    elements.reviewList.appendChild(start);
    matches.slice(0, 100).forEach((question) => {
      const card = document.createElement("article");
      card.className = "panel review-item";
      const header = document.createElement("div");
      header.className = "review-item-head";
      const tags = document.createElement("span");
      tags.textContent = `${question.test} ${question.section} · ${question.skill}`;
      const id = document.createElement("small");
      id.textContent = question.id;
      header.append(tags, id);
      const heading = document.createElement("h2");
      heading.textContent = question.stem;
      card.append(header, heading);
      elements.reviewList.appendChild(card);
    });
    if (matches.length > 100) {
      const note = document.createElement("p");
      note.className = "field-note";
      note.textContent = `Showing the first 100 of ${matches.length}; all are included when you practice.`;
      elements.reviewList.appendChild(note);
    }
  }

  function showLoadError(container, error) {
    container.innerHTML = "";
    const card = document.createElement("div");
    card.className = "panel empty-state error";
    const heading = document.createElement("strong");
    heading.textContent = "Practice content could not be loaded.";
    const detail = document.createElement("p");
    detail.textContent = `${error.message} Refresh the page or verify the site was built with npm run build.`;
    card.append(heading, detail);
    container.appendChild(card);
  }

  function clearProgress() {
    if (!clearArmed) {
      clearArmed = true;
      elements.clearProgress.textContent = "Click again to confirm";
      setTimeout(() => {
        clearArmed = false;
        elements.clearProgress.textContent = "Clear local progress";
      }, 5000);
      return;
    }
    progress = emptyProgress();
    saveProgress();
    clearArmed = false;
    elements.clearProgress.textContent = "Clear local progress";
    renderDashboard();
    updateRecommendation();
  }

  let signsRendered = false;
  let activeSignsFilter = "all";

  function renderSigns() {
    showView("signs");
    const data = window.PRACTICE_ANSWER_SIGNS;
    if (!data) {
      elements.signsGroups.innerHTML =
        '<div class="panel empty-state"><strong>The answer-signs guide could not load.</strong>' +
        "<p>Confirm content/answer-signs.js was built.</p></div>";
      return;
    }
    if (signsRendered) return;

    elements.signsDisclaimer.textContent = data.disclaimer;

    elements.signsPrinciples.innerHTML = "";
    (data.principles || []).forEach((principle) => {
      const card = document.createElement("div");
      card.className = "signs-principle";
      const title = document.createElement("h3");
      title.textContent = principle.title;
      const body = document.createElement("p");
      body.textContent = principle.body;
      card.append(title, body);
      elements.signsPrinciples.appendChild(card);
    });

    buildSignsFilter(data.groups);
    buildSignsGroups(data.groups);
    applySignsFilter();
    signsRendered = true;
  }

  function buildSignsFilter(groups) {
    elements.signsFilter.innerHTML = "";
    const options = [{ id: "all", label: "All sections" }].concat(
      groups.map((group) => ({ id: group.id, label: `${group.test} ${group.category}` })),
    );
    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "signs-filter-btn";
      button.dataset.filter = option.id;
      button.textContent = option.label;
      button.setAttribute("aria-pressed", String(option.id === activeSignsFilter));
      button.addEventListener("click", () => {
        activeSignsFilter = option.id;
        applySignsFilter();
      });
      elements.signsFilter.appendChild(button);
    });
  }

  function applySignsFilter() {
    elements.signsFilter.querySelectorAll(".signs-filter-btn").forEach((button) => {
      const selected = button.dataset.filter === activeSignsFilter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
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
      section.className = "panel signs-group";
      section.dataset.group = group.id;

      const head = document.createElement("div");
      head.className = "signs-group-head";
      const badge = document.createElement("span");
      badge.className = `signs-badge signs-badge-${group.test.toLowerCase()}`;
      badge.textContent = group.test;
      const title = document.createElement("h2");
      title.textContent = group.title;
      head.append(badge, title);

      const intro = document.createElement("p");
      intro.className = "signs-group-intro";
      intro.textContent = group.intro;

      section.append(head, intro);

      group.tells.forEach((tell) => {
        section.appendChild(buildTellCard(tell));
      });
      elements.signsGroups.appendChild(section);
    });
  }

  function buildTellCard(tell) {
    const card = document.createElement("article");
    card.className = "signs-tell";
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
      row.className = `signs-row signs-row-${kind}`;
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      row.append(strong, document.createTextNode(value));
      card.appendChild(row);
    });
    return card;
  }

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
    document.querySelectorAll('input[name="difficulty"]').forEach((input) => {
      input.addEventListener("change", updateMatches);
    });
    elements.form.addEventListener("submit", startSession);
    elements.count.addEventListener("input", () => {
      renderCountPicks(Number(elements.count.max) || 1, elements.mode.value === "hard-reps");
      updateTimedNote();
    });
    elements.resumeBtn.addEventListener("click", resumeActiveSession);
    elements.discardSession.addEventListener("click", () => {
      storeActiveSession(null);
      renderResumeBanner();
    });
    elements.home.addEventListener("click", () => showView("setup"));
    elements.recommendBtn.addEventListener("click", () => {
      elements.mode.value = "adaptive";
      updateMatches();
      startSession();
    });
    elements.miniTestStart.addEventListener("click", startMiniTest);
    elements.masterySection.addEventListener("change", renderMastery);
    elements.masterySort.addEventListener("change", renderMastery);
    elements.clearProgress.addEventListener("click", clearProgress);
    document.querySelectorAll(".nav-link").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.view === "dashboard") renderDashboard();
        else if (button.dataset.view === "review") renderReview();
        else if (button.dataset.view === "signs") renderSigns();
        else showView("setup");
      });
    });
    document.querySelectorAll(".review-tab").forEach((button) => {
      button.addEventListener("click", () => renderReview(button.dataset.list));
    });
  }

  populateSections();
  renderMiniTestOptions();
  wireEvents();
  renderResumeBanner();
  changeSection();
})();
