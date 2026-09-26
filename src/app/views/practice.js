(function () {
  "use strict";

  // The Practice view: "Take a test" (an SAT module, section, or the
  // full-length test on screen), then practice sets: the skill drill, the
  // set builder form, and the side cards (mini tests, Hard math reps, retake
  // a set, booklets), with the unfinished test and set above them all.
  //
  // Interface: window.LiminalViews.practice(ctx) returns the view object
  // described at the top of app/app.js. `ctx` is app.js's shared context:
  // catalog, core, site, runs, Progress, practice, store, update, loaders
  // (loadBank, sectionTemplates, templatesNow, rebuildQuestion), buildRun,
  // buildMiniTest, launch, resume, confirmReplace, confirmDiscard,
  // describeSaved, startTest, startDrill, activeSession, showView, and
  // formatting helpers. Every start button asks ctx.confirmReplace before
  // it builds anything. Hash: #practice, or
  // #practice/<sectionKey>/<skillSlug> to open the drill set to one skill.

  // Question counts that match a real module (SAT) or section (ACT).
  const MODULE_SIZES = {
    "sat-reading-writing": 27,
    "sat-math": 22,
    "act-english": 50,
    "act-mathematics": 45,
    "act-reading": 36,
    "act-science": 40,
  };
  // The quick path in the Hard math reps card; the practice form's targeted
  // mode sets any count, feedback, or timer.
  const HARD_REPS_DEFAULT_COUNT = 10;
  const DEFAULT_COUNT = 20;
  const DRILL_MAX = 30;

  function create(ctx) {
    const { core, practice, Progress } = ctx;
    const byId = (id) => document.getElementById(id);
    const elements = {
      view: byId("setupView"),
      form: byId("practiceForm"),
      setupLede: byId("setupLede"),
      section: byId("sectionSelect"),
      sectionNote: byId("sectionNote"),
      mode: byId("modeSelect"),
      modeNote: byId("modeNote"),
      count: byId("countInput"),
      countPicks: byId("countPicks"),
      feedbackMode: byId("feedbackSelect"),
      timed: byId("timedCheck"),
      timedNote: byId("timedNote"),
      resume: {
        test: {
          banner: byId("resumeTestBanner"),
          text: byId("resumeTestText"),
          resume: byId("resumeTestBtn"),
          discard: byId("discardTestBtn"),
        },
        set: {
          banner: byId("resumeSetBanner"),
          text: byId("resumeSetText"),
          resume: byId("resumeSetBtn"),
          discard: byId("discardSetBtn"),
        },
      },
      sessionStatus: byId("sessionStatus"),
      filterSummary: byId("filterSummary"),
      filterHint: byId("filterHint"),
      domain: byId("domainSelect"),
      skill: byId("skillSelect"),
      search: byId("searchInput"),
      matchCount: byId("matchCount"),
      bankStatus: byId("bankStatus"),
      start: byId("startBtn"),
      recommendText: byId("recommendText"),
      recommendBtn: byId("recommendBtn"),
      hardRepsBtn: byId("hardRepsBtn"),
      hardRepsCustomize: byId("hardRepsCustomizeBtn"),
      hardRepsStatus: byId("hardRepsStatus"),
      miniTestOptions: byId("miniTestOptions"),
      miniTestStatus: byId("miniTestStatus"),
      retakeForm: byId("retakeForm"),
      retakeInput: byId("retakeInput"),
      retakeBtn: byId("retakeBtn"),
      retakeStatus: byId("retakeStatus"),
      testArea: byId("testArea"),
      testModuleKind: byId("testModuleKind"),
      testStatus: byId("testStatus"),
      drillForm: byId("drillForm"),
      drillLede: byId("drillLede"),
      drillSection: byId("drillSection"),
      drillSkill: byId("drillSkill"),
      drillCount: byId("drillCount"),
      drillFeedback: byId("drillFeedback"),
      drillStart: byId("drillStart"),
      drillNote: byId("drillNote"),
      drillStatus: byId("drillStatus"),
    };

    let currentBank = [];
    let recommendation = null;
    let bankRequestId = 0;
    // The count the student asked for; the field shows it, capped by what
    // the current filters can hold.
    let desiredCount = Number(elements.count.value) || DEFAULT_COUNT;
    // A retake whose templates changed waits for a second click.
    let retakePending = null;
    // The last section chosen for each test, so switching back restores it.
    const sectionByTest = { SAT: "sat-reading-writing", ACT: "act-english" };

    const progress = () => ctx.store.get();
    const sectionKey = () => elements.section.value;
    const usesTemplates = () => practice.usesTemplates(sectionKey());

    function mathSection(key) {
      return key === "sat-math" || key === "act-mathematics";
    }

    /* ------------------------------------------------------------- copy */

    function populateSections() {
      const sections = ctx.testSections();
      elements.section.innerHTML = "";
      sections.forEach((section) => {
        const option = document.createElement("option");
        option.value = section.key;
        option.textContent = section.shortLabel;
        elements.section.appendChild(option);
      });
      const remembered = sectionByTest[ctx.currentTest()];
      elements.section.value = sections.some((section) => section.key === remembered)
        ? remembered
        : sections[0].key;
    }

    // SAT questions are generated fresh each time, so the honest number is
    // how many kinds of question there are; ACT sections are fixed banks.
    function renderSetupCopy() {
      const test = ctx.currentTest();
      const sections = ctx.testSections(test);
      // SAT drills are generated; ACT drills draw from fixed banks.
      elements.drillLede.textContent = test === "SAT"
        ? "A short set on a single skill at one level, with new numbers or a new context each time."
        : "A short set on a single skill at one level, from the questions you have seen least recently.";
      if (test === "SAT") {
        const templates = sections.reduce(
          (total, section) => total + practice.templateCount(ctx.registry(section.key)), 0);
        elements.setupLede.textContent =
          "Take a timed test built like the real SAT, or practice in shorter sets. Every question is " +
          `new each time, drawn from ${ctx.formatNumber(templates)} kinds of question.`;
        return;
      }
      const essay = (section) => (section.responseTypes || []).includes("essay");
      const questions = sections.filter((section) => !essay(section)).length * ctx.catalog.targetPerSection;
      const prompts = sections.filter(essay).length * ctx.catalog.targetPerSection;
      elements.setupLede.textContent =
        `Build a set from ${ctx.formatNumber(questions)} original ${test} questions` +
        (prompts ? ` and ${ctx.formatNumber(prompts)} writing prompts` : "") +
        ". Every set opens in the digital test screen.";
    }

    /* ---------------------------------------------------------- loading */

    function reviewIds(mode) {
      const filter = { sectionKey: sectionKey() };
      return mode === "missed" ? Progress.missedIds(progress(), filter) : Progress.markedIds(progress(), filter);
    }

    // A template section needs its retired fixed bank only to show old
    // missed or marked questions from it again.
    function needsBank(mode) {
      if (!usesTemplates()) return true;
      if (mode !== "missed" && mode !== "flagged") return false;
      return reviewIds(mode).some((id) => !Progress.parseQuestionId(id));
    }

    async function changeSection() {
      const requestId = ++bankRequestId;
      const section = ctx.sectionByKey(sectionKey());
      sectionByTest[section.test] = section.key;
      elements.start.disabled = true;
      elements.recommendBtn.disabled = true;
      elements.matchCount.className = "match-count";
      elements.matchCount.textContent = "";
      ctx.setStatus(elements.bankStatus, `Loading ${section.test} ${section.shortLabel}…`, "loading");
      elements.sectionNote.textContent = section.optional
        ? "An optional ACT section. It is not part of the ACT Composite score."
        : section.test === "ACT"
          ? "A required section that counts toward the ACT Composite score."
          : "One of the digital SAT's two sections.";
      try {
        if (practice.usesTemplates(section.key)) await ctx.sectionTemplates(section.key);
        const bank = needsBank(elements.mode.value)
          ? await ctx.loadBank(section.key)
          : ctx.bankIfLoaded(section.key) || [];
        if (requestId !== bankRequestId) return;
        currentBank = bank;
        populateTaxonomy();
        updateMatches();
        updateRecommendation();
        ctx.setStatus(elements.bankStatus, "");
      } catch (error) {
        if (requestId !== bankRequestId) return;
        currentBank = [];
        elements.matchCount.textContent = "";
        ctx.setStatus(
          elements.bankStatus,
          `${error.message} If this file is open locally, confirm the site was built with npm run build.`,
          "error",
        );
      }
    }

    // Loads the retired bank when a review mode needs it, then recounts.
    async function changeMode() {
      if (needsBank(elements.mode.value) && !ctx.bankIfLoaded(sectionKey())) {
        await changeSection();
        return;
      }
      updateMatches();
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

    function populateTaxonomy() {
      const section = ctx.sectionByKey(sectionKey());
      replaceOptions(elements.domain, [
        { value: "", label: "All domains" },
        ...section.domains.map((domain) => ({ value: domain.name, label: domain.name })),
      ]);
      populateSkills();
    }

    function populateSkills() {
      const section = ctx.sectionByKey(sectionKey());
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

    function difficultyInputs() {
      return Array.from(elements.form.querySelectorAll('input[name="difficulty"]'));
    }

    function selectedDifficulties() {
      return difficultyInputs().filter((input) => input.checked).map((input) => input.value);
    }

    function formFilters() {
      return {
        domains: elements.domain.value ? [elements.domain.value] : [],
        skills: elements.skill.value ? [elements.skill.value] : [],
        difficulties: selectedDifficulties(),
      };
    }

    /* ----------------------------------------------------- matching sets */

    // Template sections build fresh runs in these modes; review modes replay
    // specific past questions.
    function buildsTemplateRun(mode) {
      return usesTemplates() && (mode === "targeted" || mode === "mix" || mode === "adaptive");
    }

    // Tiers and skills come from the current templates, so a relabeled
    // template's old answers count where the template stands now.
    function weakest() {
      return Progress.weakestSkill(progress(), { sectionKey: sectionKey() }, { current: ctx.templateInfo() });
    }

    // Missed and marked questions, narrowed by every topic filter, including
    // the ones rebuilt from their templates.
    function reviewQuestions(mode) {
      const ids = reviewIds(mode);
      const filters = { ...formFilters(), query: elements.search.value };
      const fromBank = core.filterQuestions(currentBank, { ...filters, includedIds: ids });
      if (!usesTemplates()) return fromBank;
      const generated = ids.filter((id) => Progress.parseQuestionId(id))
        .map(ctx.rebuildQuestion)
        .filter((question) => question && question.sectionKey === sectionKey());
      return practice.onePerTemplate([...fromBank, ...core.filterQuestions(generated, filters)]);
    }

    function matchingBankQuestions() {
      const mode = elements.mode.value;
      if (mode === "missed" || mode === "flagged") return reviewQuestions(mode);
      if (mode === "mix" || mode === "adaptive") return currentBank.slice();
      return core.filterQuestions(currentBank, { ...formFilters(), query: elements.search.value });
    }

    function modeNote(mode) {
      if (mode === "targeted") {
        return usesTemplates()
          ? "New questions of the kinds you have seen least recently, narrowed by any topic filters."
          : "Questions you have not seen recently, narrowed by any topic filters.";
      }
      if (mode === "mix") return "A mix from the whole section, weighted like the real test. Topic filters are not used. For the real module structure, use Take a test.";
      if (mode === "adaptive") {
        return usesTemplates()
          ? `A set on your weakest skill so far: the lowest accuracy among skills with at least ${Progress.WEAK_SKILL_MIN_ATTEMPTS} answers counted. Until then, a mix of the whole section.`
          : "Starts with the recommended question, then mixes the section. Topic filters are not used.";
      }
      if (mode === "missed") return "Questions you answered wrong or left blank most recently in this section.";
      return "Questions you have marked for review in this section.";
    }

    // Which topic filters a mode uses, so the disclosure can say why the rest
    // are turned off.
    function filterUse(mode) {
      if (mode === "mix") {
        return { domain: false, skill: false, difficulty: false, search: false,
          hint: "The whole-section mix draws from every topic, so topic filters are off." };
      }
      if (mode === "adaptive") {
        return { domain: false, skill: false, difficulty: false, search: false,
          hint: usesTemplates()
            ? "Recommended next picks the skill for you, so topic filters are off."
            : "Recommended next draws from the whole section, so topic filters are off." };
      }
      if (buildsTemplateRun(mode)) {
        return { domain: true, skill: true, difficulty: true, search: false,
          hint: "Questions here are new each time, so there is no text to search." };
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
      if (mode === "missed") return "No missed questions match in this section.";
      if (mode === "flagged") return "No marked questions match in this section.";
      return "No questions match. Loosen a filter under Narrow by topic.";
    }

    // The most questions the set can hold. The count field follows it, so a
    // count above it never blocks Start.
    function setAvailable(available) {
      const max = Math.max(1, available);
      elements.count.max = String(max);
      elements.count.value = String(Math.min(Math.max(1, desiredCount), max));
      renderCountPicks(available);
      updateTimedNote();
    }

    function updateMatches() {
      const mode = elements.mode.value;
      elements.modeNote.textContent = modeNote(mode);
      renderFilterState(mode);
      elements.matchCount.className = "match-count";
      if (buildsTemplateRun(mode)) {
        // A set takes at most one question per template, so the templates
        // that match are the most questions it can hold.
        const available = ctx.runs.available(ctx.templatesNow(sectionKey()),
          practice.runFilters(mode, formFilters(), weakest()));
        elements.matchCount.textContent = available
          ? `Up to ${ctx.formatNumber(available)} question${available === 1 ? "" : "s"}, one of each kind that matches`
          : "Nothing matches. Loosen a filter under Narrow by topic.";
        elements.matchCount.classList.toggle("is-empty", available === 0);
        elements.start.disabled = available === 0;
        setAvailable(available);
        return;
      }
      const matches = matchingBankQuestions();
      if (mode === "mix" || mode === "adaptive") {
        elements.matchCount.textContent = `${ctx.formatNumber(matches.length)} questions in this section`;
      } else if (matches.length) {
        elements.matchCount.textContent = `${ctx.formatNumber(matches.length)} question${matches.length === 1 ? "" : "s"} match`;
      } else {
        elements.matchCount.textContent = emptyReason(mode);
        elements.matchCount.classList.add("is-empty");
      }
      elements.start.disabled = matches.length === 0;
      setAvailable(matches.length);
    }

    // 10, one real module (or section), two modules for the SAT, and all.
    function renderCountPicks(available) {
      const moduleSize = MODULE_SIZES[sectionKey()];
      const picks = [10, moduleSize, sectionKey().startsWith("sat-") ? moduleSize * 2 : null]
        .filter((value, index, list) => value && value < available && list.indexOf(value) === index);
      elements.countPicks.innerHTML = "";
      [...picks, ...(available ? ["all"] : [])].forEach((value) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chip";
        button.textContent = value === "all" ? `All ${ctx.formatNumber(available)}` : String(value);
        button.dataset.count = String(value === "all" ? available : value);
        button.setAttribute("aria-pressed", String(elements.count.value === button.dataset.count));
        button.addEventListener("click", () => {
          desiredCount = Number(button.dataset.count);
          elements.count.value = button.dataset.count;
          renderCountPicks(available);
          updateTimedNote();
        });
        elements.countPicks.appendChild(button);
      });
    }

    function requestedCount() {
      const available = Math.max(1, Number(elements.count.max) || 1);
      const value = Math.round(Number(elements.count.value));
      return Math.min(available, Math.max(1, Number.isFinite(value) && value > 0 ? value : DEFAULT_COUNT));
    }

    function updateTimedNote() {
      const budget = core.paceBudgetSeconds(sectionKey(), requestedCount());
      elements.timed.disabled = budget === null;
      if (budget === null) elements.timed.checked = false;
      elements.timedNote.textContent = budget === null
        ? "This section is not timed per question on the real test."
        : `${requestedCount()} question${requestedCount() === 1 ? "" : "s"} in ` +
          `${ctx.formatDuration(budget * 1000)}, the real test's pace.`;
    }

    function updateRecommendation() {
      if (usesTemplates()) {
        const weak = weakest();
        elements.recommendText.textContent = weak
          ? `Your weakest skill so far is ${weak.skill}: ${weak.correct} of ${weak.attempted} correct` +
            `${weak.hintedCorrect ? ` without a hint (${weak.hintedCorrect} more with one)` : ""}. Start a set on it.`
          : "Answer a few questions in this section and your weakest skill will appear here.";
        elements.recommendBtn.disabled = !weak;
        return;
      }
      recommendation = core.recommendQuestion(
        currentBank,
        Progress.attemptsFor(progress(), { sectionKey: sectionKey() }),
        { recentIds: Progress.recentQuestionIds(progress(), 30) },
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

    /* ------------------------------------------------------------ launch */

    function tryLaunch(config, statusNode) {
      try {
        ctx.launch(config);
        return true;
      } catch (error) {
        ctx.setStatus(statusNode, error.message, "error");
        return false;
      }
    }

    function timeLimit(key, count) {
      return elements.timed.checked ? core.paceBudgetSeconds(key, count) : null;
    }

    // The set's kind (History) is the form's mode; the whole-section mix is
    // "mix", never "full", which is the full-length test's.
    async function startSession(event) {
      if (event) event.preventDefault();
      if (!(await ctx.confirmReplace("set"))) return;
      const mode = elements.mode.value;
      const section = ctx.sectionByKey(sectionKey());
      const title = `${section.test} ${section.shortLabel}`;
      if (buildsTemplateRun(mode)) {
        const run = ctx.buildRun({
          sectionKey: section.key,
          count: requestedCount(),
          filters: practice.runFilters(mode, formFilters(), weakest()),
        });
        if (!run.questions.length) {
          ctx.setStatus(elements.bankStatus, "Nothing matches this set. Loosen a filter.", "error");
          return;
        }
        tryLaunch({
          title,
          sectionKey: section.key,
          kind: mode,
          questions: run.questions,
          runCode: run.code,
          setCode: run.setCode,
          feedback: elements.feedbackMode.value,
          timeLimitSeconds: timeLimit(section.key, run.questions.length),
        }, elements.bankStatus);
        return;
      }
      let pool = matchingBankQuestions();
      if (mode === "adaptive" && recommendation) {
        const remaining = currentBank.filter((question) => question.id !== recommendation.question.id);
        pool = [recommendation.question, ...core.deterministicShuffle(remaining, `${Date.now()}-adaptive`)];
      }
      if (!pool.length) {
        ctx.setStatus(elements.bankStatus, "No questions match this set. Adjust a filter or choose another mode.", "error");
        return;
      }
      const count = requestedCount();
      // Review modes exist precisely to serve questions again, so history is
      // only avoided when the student asked for new practice.
      const revisiting = mode === "missed" || mode === "flagged";
      // ACT English and Reading questions share passages: a set not
      // narrowed to a domain or skill reads whole passages, as the test
      // does (core.buildSession passageSets); a narrowed one may spread.
      const filters = filterUse(mode).domain ? formFilters() : { domains: [], skills: [] };
      const passageSets = !revisiting && !filters.domains.length && !filters.skills.length &&
        pool.every((question) => question.passageId);
      const questions = mode === "adaptive"
        ? pool.slice(0, count)
        : core.buildSession(pool, count, `${Date.now()}-${section.key}`, {
          avoidIds: revisiting ? [] : Progress.recentlyServedIds(progress(), section.key),
          spreadFamilies: !revisiting,
          passageSets,
        });
      // Recorded when a set is built, not when it is answered, so an
      // abandoned set still rotates its questions out.
      if (!revisiting) {
        ctx.update((current) => Progress.serveQuestions(current, section.key, questions.map((question) => question.id)));
      }
      tryLaunch({
        title: revisiting ? `${title}: ${mode === "missed" ? "missed" : "marked"} questions` : title,
        sectionKey: section.key,
        kind: mode,
        questions,
        feedback: elements.feedbackMode.value,
        timeLimitSeconds: timeLimit(section.key, questions.length),
      }, elements.bankStatus);
    }

    // The Hard math card: ten Hard SAT Math templates, report at the end.
    async function startHardReps() {
      if (!(await ctx.confirmReplace("set"))) return;
      elements.hardRepsBtn.disabled = true;
      ctx.setStatus(elements.hardRepsStatus, "Preparing fresh hard problems…", "loading");
      try {
        await ctx.sectionTemplates("sat-math");
      } catch (error) {
        ctx.setStatus(elements.hardRepsStatus, `${error.message} Refresh the page and try again.`, "error");
        elements.hardRepsBtn.disabled = false;
        return;
      }
      const run = ctx.buildRun({ sectionKey: "sat-math", count: HARD_REPS_DEFAULT_COUNT, filters: { difficulties: ["Hard"] } });
      elements.hardRepsBtn.disabled = false;
      ctx.setStatus(elements.hardRepsStatus, "");
      tryLaunch({
        title: "SAT Math — Hard",
        sectionKey: "sat-math",
        kind: "hard-reps",
        questions: run.questions,
        runCode: run.code,
        setCode: run.setCode,
        feedback: "end",
        timeLimitSeconds: null,
      }, elements.hardRepsStatus);
    }

    function scrollToForm() {
      scrollToCard(elements.form, elements.count);
    }

    // Sets the practice form to SAT Math, Hard only, so the count, feedback,
    // and timer are the student's to choose.
    async function customizeHardReps() {
      if (ctx.currentTest() !== "SAT") return;
      if (sectionKey() !== "sat-math") {
        elements.section.value = "sat-math";
        await changeSection();
      }
      elements.mode.value = "targeted";
      difficultyInputs().forEach((input) => {
        input.checked = input.value === "Hard";
      });
      updateMatches();
      scrollToForm();
      ctx.setStatus(elements.hardRepsStatus, "The practice form is set to SAT Math, Hard only. Choose the count, feedback, and timer there.", "success");
    }

    /* --------------------------------------------------------- mini test */

    function renderMiniTests() {
      const blueprints = core.MINI_TEST_BLUEPRINTS.filter((blueprint) => blueprint.test === ctx.currentTest());
      elements.miniTestOptions.innerHTML = "";
      ctx.setStatus(elements.miniTestStatus, "");
      blueprints.forEach((blueprint, index) => {
        const item = document.createElement("div");
        item.className = "mini-test-item";
        const name = document.createElement("h4");
        name.textContent = blueprint.label;
        const summary = document.createElement("p");
        summary.textContent = blueprint.summary;
        const total = core.blueprintTotal(blueprint);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `button ${index === 0 ? "primary" : "secondary"}`;
        button.textContent = `Start: ${total} questions, ${blueprint.minutes} min`;
        button.setAttribute("aria-label",
          `Start the ${blueprint.label}: ${total} questions in ${blueprint.minutes} minutes`);
        button.addEventListener("click", () => startMiniTest(blueprint, button));
        item.append(name, summary, button);
        elements.miniTestOptions.appendChild(item);
      });
    }

    async function startMiniTest(blueprint, button) {
      if (!(await ctx.confirmReplace("set"))) return;
      button.disabled = true;
      ctx.setStatus(elements.miniTestStatus, `Preparing the ${blueprint.label}…`, "loading");
      let questions;
      try {
        if (blueprint.sections.every((entry) => practice.usesTemplates(entry.sectionKey))) {
          questions = await ctx.buildMiniTest(blueprint);
        } else {
          const banks = await Promise.all(blueprint.sections.map((entry) => ctx.loadBank(entry.sectionKey)));
          const bankBySection = Object.fromEntries(
            blueprint.sections.map((entry, index) => [entry.sectionKey, banks[index]]),
          );
          questions = core.buildMiniTest(bankBySection, blueprint, `${Date.now()}-${blueprint.id}`);
        }
      } catch (error) {
        ctx.setStatus(elements.miniTestStatus, `${error.message} Refresh the page and try again.`, "error");
        button.disabled = false;
        return;
      }
      button.disabled = false;
      if (questions.length < core.blueprintTotal(blueprint)) {
        ctx.setStatus(elements.miniTestStatus, "Not enough items are available to build this mini test.", "error");
        return;
      }
      ctx.setStatus(elements.miniTestStatus, "");
      // The test screen offers the calculator on math questions only and the
      // reference sheet on SAT Math only, switching at each section.
      tryLaunch({
        title: blueprint.label,
        sectionKey: blueprint.sections[0].sectionKey,
        kind: "mini",
        questions,
        feedback: "end",
        timeLimitSeconds: blueprint.minutes * 60,
        tools: {
          calculator: blueprint.sections.some((entry) => mathSection(entry.sectionKey)),
          reference: blueprint.sections.some((entry) => entry.sectionKey === "sat-math"),
        },
      }, elements.miniTestStatus);
    }

    /* ------------------------------------------------------------ retake */

    function resetRetake() {
      retakePending = null;
      elements.retakeBtn.textContent = "Retake";
    }

    // Templates whose version changed since this browser answered the set,
    // so they now build a different question.
    function changedTemplates(parsed, questions, templates) {
      const versions = new Map(templates.map((template) => [template.id, template.version || 1]));
      const used = new Map();
      Progress.attemptsFor(progress(), { sectionKey: parsed.sectionKey })
        .filter((attempt) => attempt.runCode === parsed.code && attempt.templateId)
        .forEach((attempt) => used.set(attempt.templateId, Number(attempt.templateVersion) || 1));
      return questions.filter((question) => used.has(question.templateId) &&
        used.get(question.templateId) !== (versions.get(question.templateId) || 1)).length;
    }

    async function retake(event) {
      event.preventDefault();
      const fallback = practice.usesTemplates(sectionKey()) ? sectionKey() : null;
      let parsed;
      try {
        parsed = practice.parseSetCode(elements.retakeInput.value, fallback);
      } catch (error) {
        resetRetake();
        ctx.setStatus(elements.retakeStatus, error.message, "error");
        return;
      }
      let run;
      let templates;
      try {
        templates = await ctx.sectionTemplates(parsed.sectionKey);
        run = practice.rebuildRun({
          parsed,
          templates,
          registry: ctx.registry(parsed.sectionKey),
          instantiate: window.LiminalFamilyShared.instantiate,
        });
      } catch (error) {
        ctx.setStatus(elements.retakeStatus, `${error.message} Refresh the page and try again.`, "error");
        return;
      }
      if (!run.questions.length) {
        resetRetake();
        ctx.setStatus(elements.retakeStatus, "None of this set's questions can be built any more.", "error");
        return;
      }
      const changed = changedTemplates(parsed, run.questions, templates);
      const warnings = [
        run.missing ? `${run.missing} of its questions can no longer be built` : "",
        changed ? `${changed} of its questions ${changed === 1 ? "has" : "have"} changed since you took it` : "",
      ].filter(Boolean);
      const key = `${parsed.sectionKey}|${parsed.code}`;
      if (warnings.length && retakePending !== key) {
        retakePending = key;
        elements.retakeBtn.textContent = "Retake anyway";
        ctx.setStatus(elements.retakeStatus,
          `${warnings.join(", and ")}, so the questions will not all match the original.`, "error");
        return;
      }
      resetRetake();
      ctx.setStatus(elements.retakeStatus, "");
      if (!(await ctx.confirmReplace("set"))) return;
      const section = ctx.sectionByKey(parsed.sectionKey);
      tryLaunch({
        title: `${section.test} ${section.shortLabel}: set ${run.setCode}`,
        sectionKey: parsed.sectionKey,
        kind: "retake",
        questions: run.questions,
        runCode: run.code,
        setCode: run.setCode,
        feedback: elements.feedbackMode.value,
        timeLimitSeconds: null,
      }, elements.retakeStatus);
    }

    /* --------------------------------------------------------- take a test */

    // A module, a section, or the full-length test, from the button's
    // data-test-kind and data-section.
    async function startTest(button) {
      const kind = button.dataset.testKind;
      const request = { kind };
      if (kind !== "full") request.sectionKey = button.dataset.section;
      if (kind === "module") request.module = elements.testModuleKind.value;
      if (!(await ctx.confirmReplace("test"))) return;
      const buttons = elements.testArea.querySelectorAll("[data-test-kind]");
      buttons.forEach((item) => { item.disabled = true; });
      ctx.setStatus(elements.testStatus, "Preparing your test…", "loading");
      try {
        await ctx.startTest(request);
        ctx.setStatus(elements.testStatus, "");
      } catch (error) {
        ctx.setStatus(elements.testStatus, `${error.message} Refresh the page and try again.`, "error");
      } finally {
        buttons.forEach((item) => { item.disabled = false; });
      }
    }

    /* --------------------------------------------------------------- drill */

    function drillLevelInputs() {
      return Array.from(elements.drillForm.querySelectorAll('input[name="drillLevel"]'));
    }

    function drillLevel() {
      const checked = drillLevelInputs().find((input) => input.checked);
      return checked ? checked.value : "";
    }

    function setDrillLevel(value) {
      drillLevelInputs().forEach((input) => { input.checked = input.value === value; });
    }

    function drillCount() {
      const value = Math.round(Number(elements.drillCount.value));
      return Math.min(DRILL_MAX, Math.max(1, Number.isFinite(value) && value > 0 ? value : ctx.DRILL_COUNT));
    }

    // The drill's sections follow the SAT | ACT switch; its skills are
    // grouped by domain.
    function populateDrillSections() {
      const sections = ctx.testSections();
      const current = elements.drillSection.value;
      replaceOptions(elements.drillSection, sections.map((section) => ({ value: section.key, label: section.shortLabel })));
      if (sections.some((section) => section.key === current)) elements.drillSection.value = current;
      populateDrillSkills();
    }

    function populateDrillSkills(preferred) {
      const section = ctx.sectionByKey(elements.drillSection.value);
      const current = preferred || elements.drillSkill.value;
      elements.drillSkill.innerHTML = "";
      ((section && section.domains) || []).forEach((domain) => {
        const group = document.createElement("optgroup");
        group.label = domain.name;
        Object.keys(domain.skills).forEach((skill) => {
          const option = document.createElement("option");
          option.value = skill;
          option.textContent = skill;
          group.appendChild(option);
        });
        elements.drillSkill.appendChild(group);
      });
      if ([...elements.drillSkill.options].some((option) => option.value === current)) {
        elements.drillSkill.value = current;
      }
      updateDrillNote();
    }

    // How many questions the drill can hold. A template section repeats a
    // kind of question with new numbers or a new context, so it rarely runs
    // short; a bank section holds only the questions that match.
    async function updateDrillNote() {
      const key = elements.drillSection.value;
      const skill = elements.drillSkill.value;
      const level = drillLevel();
      const count = drillCount();
      elements.drillNote.className = "match-count";
      if (!key || !skill) {
        elements.drillNote.textContent = "";
        elements.drillStart.disabled = true;
        return;
      }
      let kinds = null;
      let matching = null;
      if (practice.usesTemplates(key)) {
        let templates = ctx.templatesNow(key);
        if (!templates.length) {
          try {
            templates = await ctx.sectionTemplates(key);
          } catch (error) {
            ctx.setStatus(elements.drillStatus, `${error.message} Refresh the page and try again.`, "error");
            return;
          }
        }
        if (key !== elements.drillSection.value || skill !== elements.drillSkill.value) return;
        kinds = ctx.runs.available(templates, { skills: [skill], difficulties: level ? [level] : [] });
      } else {
        let bank = ctx.bankIfLoaded(key);
        if (!bank) {
          try {
            bank = await ctx.loadBank(key);
          } catch (error) {
            ctx.setStatus(elements.drillStatus, `${error.message} Refresh the page and try again.`, "error");
            return;
          }
        }
        if (key !== elements.drillSection.value || skill !== elements.drillSkill.value) return;
        matching = core.filterQuestions(bank, { skills: [skill], difficulties: level ? [level] : [] }).length;
      }
      const levelWord = level ? `${level.toLowerCase()} ` : "";
      if (kinds === 0 || matching === 0) {
        elements.drillNote.textContent = `No ${levelWord}questions for this skill yet. Choose another level.`;
        elements.drillNote.classList.add("is-empty");
        elements.drillStart.disabled = true;
        return;
      }
      elements.drillStart.disabled = false;
      elements.drillNote.textContent = kinds !== null
        ? `${count} ${levelWord}question${count === 1 ? "" : "s"} from ${kinds} kind${kinds === 1 ? "" : "s"} ` +
          "of question; repeats use new numbers or a new context."
        : `${Math.min(count, matching)} of ${matching} matching ${levelWord}question${matching === 1 ? "" : "s"}.`;
    }

    async function startDrill(event) {
      event.preventDefault();
      const request = {
        sectionKey: elements.drillSection.value,
        skill: elements.drillSkill.value,
        difficulty: drillLevel() || null,
        count: drillCount(),
        feedback: elements.drillFeedback.value,
      };
      elements.drillCount.value = String(request.count);
      if (!(await ctx.confirmReplace("set"))) return;
      elements.drillStart.disabled = true;
      ctx.setStatus(elements.drillStatus, "Preparing your drill…", "loading");
      try {
        const opened = await ctx.startDrill(request);
        if (opened === null) {
          ctx.setStatus(elements.drillStatus, "");
          return;
        }
        ctx.setStatus(elements.drillStatus, opened
          ? (opened < request.count ? `Only ${opened} questions matched, so the drill has ${opened}.` : "")
          : "No questions match this drill. Choose another level.", opened ? "" : "error");
      } catch (error) {
        ctx.setStatus(elements.drillStatus, `${error.message} Refresh the page and try again.`, "error");
      } finally {
        elements.drillStart.disabled = false;
      }
    }

    /* ---------------------------------------------------- resume banners */

    // One row for the unfinished test and one for the unfinished set; each
    // lives in its own slot, so both can be waiting at once.
    function renderResumeBanner() {
      ["test", "set"].forEach((slot) => {
        const row = elements.resume[slot];
        let saved = ctx.activeSession.load(slot);
        if (saved && !ctx.activeSession.valid(saved)) {
          ctx.activeSession.clear(slot);
          ctx.setStatus(elements.sessionStatus,
            `An unfinished ${slot} could not be restored, so it was removed.`, "error");
          saved = null;
        }
        row.banner.classList.toggle("hidden", !saved);
        if (saved) row.text.textContent = ctx.describeSaved(saved);
      });
    }

    async function resumeSaved(slot) {
      const button = elements.resume[slot].resume;
      button.disabled = true;
      const problem = await ctx.resume(slot);
      button.disabled = false;
      if (problem) {
        ctx.setStatus(elements.sessionStatus, problem, "error");
        renderResumeBanner();
      }
    }

    async function discardSaved(slot) {
      const discarded = await ctx.confirmDiscard(slot);
      if (!discarded) return;
      ctx.setStatus(elements.sessionStatus, slot === "test"
        ? "The unfinished test was discarded. Modules you finished stay in your progress, with the questions you saw in one you had not."
        : "The unfinished set was discarded. The questions you saw are recorded in your progress.", "success");
      renderResumeBanner();
    }

    /* --------------------------------------------------------- deep link */

    function scrollToCard(card, focus) {
      const reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (focus) focus.focus({ preventScroll: true });
    }

    // index.html#practice/<sectionKey>/<skillSlug> (Learn's "Practice this
    // skill"): the drill set to that skill, ready to start.
    async function applyDeepLink(params) {
      const [key, skillSlug] = params;
      const section = ctx.sectionByKey(key);
      if (!section || section.test === undefined) return;
      if (ctx.currentTest() !== section.test) ctx.site.setTest(section.test);
      const found = practice.findSkill(section, skillSlug);
      if (!found) {
        ctx.setStatus(elements.drillStatus, "That skill link did not match a skill in this section.", "error");
        scrollToCard(elements.drillForm);
        return;
      }
      elements.drillSection.value = section.key;
      populateDrillSkills(found.skill);
      await updateDrillNote();
      if (elements.drillStart.disabled) {
        setDrillLevel("");
        await updateDrillNote();
      }
      ctx.setStatus(elements.drillStatus,
        `The drill is set to ${found.skill}. Choose a level and start.`, "success");
      scrollToCard(elements.drillForm, elements.drillStart);
    }

    /* ------------------------------------------------------------ wiring */

    elements.form.addEventListener("submit", startSession);
    elements.section.addEventListener("change", changeSection);
    elements.mode.addEventListener("change", changeMode);
    elements.domain.addEventListener("change", () => {
      populateSkills();
      updateMatches();
    });
    elements.skill.addEventListener("change", updateMatches);
    elements.search.addEventListener("input", updateMatches);
    difficultyInputs().forEach((input) => input.addEventListener("change", updateMatches));
    elements.count.addEventListener("input", () => {
      const value = Math.round(Number(elements.count.value));
      if (Number.isFinite(value) && value > 0) desiredCount = value;
      renderCountPicks(Number(elements.count.max) || 1);
      updateTimedNote();
    });
    // A typed count above what matches settles to the most available, so
    // the form never refuses to start.
    elements.count.addEventListener("change", () => {
      elements.count.value = String(requestedCount());
      renderCountPicks(Number(elements.count.max) || 1);
      updateTimedNote();
    });
    ["test", "set"].forEach((slot) => {
      elements.resume[slot].resume.addEventListener("click", () => resumeSaved(slot));
      elements.resume[slot].discard.addEventListener("click", () => discardSaved(slot));
    });
    elements.recommendBtn.addEventListener("click", () => {
      elements.mode.value = "adaptive";
      updateMatches();
      startSession();
    });
    elements.hardRepsBtn.addEventListener("click", startHardReps);
    elements.hardRepsCustomize.addEventListener("click", customizeHardReps);
    elements.retakeForm.addEventListener("submit", retake);
    elements.retakeInput.addEventListener("input", resetRetake);
    elements.testArea.querySelectorAll("[data-test-kind]").forEach((button) => {
      button.addEventListener("click", () => startTest(button));
    });
    elements.drillForm.addEventListener("submit", startDrill);
    elements.drillSection.addEventListener("change", () => {
      ctx.setStatus(elements.drillStatus, "");
      populateDrillSkills();
    });
    elements.drillSkill.addEventListener("change", updateDrillNote);
    elements.drillCount.addEventListener("input", updateDrillNote);
    elements.drillCount.addEventListener("change", () => {
      elements.drillCount.value = String(drillCount());
      updateDrillNote();
    });
    drillLevelInputs().forEach((input) => input.addEventListener("change", updateDrillNote));

    function onTestChange() {
      populateSections();
      populateDrillSections();
      renderSetupCopy();
      renderMiniTests();
      ctx.setStatus(elements.hardRepsStatus, "");
      ctx.setStatus(elements.retakeStatus, "");
      ctx.setStatus(elements.testStatus, "");
      ctx.setStatus(elements.drillStatus, "");
      changeSection();
    }

    populateSections();
    populateDrillSections();
    renderSetupCopy();
    renderMiniTests();
    renderResumeBanner();
    changeSection();

    return {
      name: "setup",
      hash: "practice",
      element: elements.view,
      open(options, params) {
        ctx.showView("setup", options);
        if (params && params.length >= 2) applyDeepLink(params);
      },
      onTestChange,
      onProgressChange() {
        updateMatches();
        updateRecommendation();
      },
      onSessionChange(problem) {
        renderResumeBanner();
        if (problem) ctx.setStatus(elements.sessionStatus, problem, "error");
      },
    };
  }

  window.LiminalViews = window.LiminalViews || {};
  window.LiminalViews.practice = create;
})();
