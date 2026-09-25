(function () {
  "use strict";

  // The page's shell: shared services for the views, routing between them,
  // and the one place sets are launched and recorded. Each view lives in
  // app/views/ and registers a factory on window.LiminalViews; this file
  // loads last, builds the context below, and hands it to every view.
  //
  // View interface (each factory returns):
  //   name              the nav's data-view and the view element's key
  //   hash              the address-bar name (#practice, #progress, ...)
  //   element           the view's <section>
  //   open(options, params)  render and show; params come from the hash
  //   onTestChange()    optional: the SAT | ACT switch changed
  //   onProgressChange() optional: progress changed in this tab or another
  //   onSessionChange() optional: the saved unfinished set changed

  const catalog = window.PRACTICE_CATALOG;
  const core = window.PracticeCore;
  const site = window.LiminalSite;
  const runs = window.LiminalRuns;
  const Progress = window.LiminalProgress;
  const practice = window.LiminalPractice;

  // An unfinished set, so closing the tab mid-test loses nothing.
  const SESSION_KEY = "liminal:session:v1";

  // localStorage can throw on access when a browser blocks site data; the
  // app then keeps progress in memory for this visit.
  function browserStorage() {
    try {
      const storage = window.localStorage;
      storage.getItem(Progress.STORAGE_KEY);
      return storage;
    } catch (error) {
      const memory = new Map();
      return {
        getItem: (key) => (memory.has(key) ? memory.get(key) : null),
        setItem: (key, value) => memory.set(key, String(value)),
        removeItem: (key) => memory.delete(key),
      };
    }
  }

  const storage = browserStorage();
  const store = Progress.createStore(storage);

  /* ------------------------------------------------------------- helpers */

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function setStatus(node, message, kind) {
    node.className = `status-line${kind ? ` ${kind}` : ""}`;
    node.textContent = message || "";
  }

  function currentTest() {
    return site.getTest();
  }

  function testSections(test) {
    return catalog.sections.filter((section) => section.test === (test || currentTest()));
  }

  function sectionByKey(key) {
    return catalog.sections.find((section) => section.key === key);
  }

  function sectionLabel(sectionKey) {
    const section = sectionByKey(sectionKey);
    return section ? section.shortLabel : sectionKey;
  }

  function isMath(sectionKey) {
    return sectionKey === "sat-math" || sectionKey === "act-mathematics";
  }

  function registry(sectionKey) {
    return (window.PRACTICE_TEMPLATES || {})[sectionKey] || { templates: [] };
  }

  /* ------------------------------------------------------------- content */

  const bankPromises = new Map();

  // A section's fixed bank, loaded on demand. SAT banks are the retired
  // fixed questions: they load only to show an old question again.
  function loadBank(sectionKey) {
    window.PRACTICE_BANKS = window.PRACTICE_BANKS || {};
    if (window.PRACTICE_BANKS[sectionKey]) return Promise.resolve(window.PRACTICE_BANKS[sectionKey]);
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

  function bankIfLoaded(sectionKey) {
    return (window.PRACTICE_BANKS || {})[sectionKey] || null;
  }

  const scriptLoads = new Map();
  const familyLoads = new Map();
  const loadedTemplates = new Map();

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

  // A template section's bundle loads the first time the section is used;
  // its files register into window.LiminalFamilies.
  function sectionTemplates(sectionKey) {
    if (!practice.usesTemplates(sectionKey)) return Promise.resolve([]);
    if (loadedTemplates.has(sectionKey)) return Promise.resolve(loadedTemplates.get(sectionKey));
    if (!familyLoads.has(sectionKey)) {
      familyLoads.set(sectionKey, loadScript(sectionKey)
        .then(() => {
          const templates = runs.catalogTemplates(
            (window.LiminalFamilies || {})[sectionKey] || [],
            registry(sectionKey),
          );
          loadedTemplates.set(sectionKey, templates);
          return templates;
        })
        .catch((error) => {
          familyLoads.delete(sectionKey);
          throw error;
        }));
    }
    return familyLoads.get(sectionKey);
  }

  function templatesNow(sectionKey) {
    return loadedTemplates.get(sectionKey) || [];
  }

  // What each loaded template is now: its tier, taxonomy, and version, for
  // LiminalProgress.withCurrentTemplates. Sections not loaded yet are absent,
  // and their attempts keep what they stored.
  function templateInfo() {
    const info = {};
    loadedTemplates.forEach((templates, sectionKey) => {
      info[sectionKey] = {};
      templates.forEach((template) => {
        info[sectionKey][template.id] = {
          difficulty: template.difficulty,
          domain: template.domain,
          skill: template.skill,
          subskill: template.family && template.family.subskill,
          version: template.version || 1,
        };
      });
    });
    return info;
  }

  // Rebuilds a generated question from its id; null until its section's
  // templates have loaded, or when the template is gone.
  function rebuildQuestion(id) {
    const parsed = Progress.parseQuestionId(id);
    if (!parsed || !window.LiminalFamilyShared) return null;
    const template = templatesNow(parsed.sectionKey).find((entry) => entry.id === parsed.templateId);
    if (!template) return null;
    return { ...window.LiminalFamilyShared.instantiate(template.family, parsed.seed), id };
  }

  // Questions for stored ids, in the given order: generated ones rebuilt
  // from their templates, bank ones from their banks, loading only what the
  // ids need. Ids that cannot be found are left out.
  async function questionsForIds(ids) {
    const generatedSections = new Set();
    const bankSections = new Set();
    ids.forEach((id) => {
      const parsed = Progress.parseQuestionId(id);
      if (parsed) generatedSections.add(parsed.sectionKey);
      else {
        const sectionKey = Progress.sectionOfId(id);
        if (sectionByKey(sectionKey)) bankSections.add(sectionKey);
      }
    });
    await Promise.all([
      ...[...generatedSections].map((key) => sectionTemplates(key)),
      ...[...bankSections].map((key) => loadBank(key)),
    ]);
    const bankById = new Map();
    bankSections.forEach((key) => (bankIfLoaded(key) || []).forEach((question) => bankById.set(question.id, question)));
    return ids
      .map((id) => (Progress.parseQuestionId(id) ? rebuildQuestion(id) : bankById.get(id)))
      .filter(Boolean);
  }

  /* ---------------------------------------------------------------- runs */

  function recordServed(run) {
    if (!run.templateIds.length) return;
    store.update((progress) => Progress.serveTemplates(progress, run.sectionKey, {
      templateIds: run.templateIds,
      scenes: run.scenes,
      mask: run.servedMaskCode,
    }));
  }

  // A fresh template run, preferring templates served least recently and
  // following the catalog's domain weights; recorded as served.
  // `templates` narrows the pool (a drill on specific templates).
  function buildRun({ sectionKey, count, filters, templates }) {
    const run = practice.buildTemplateRun({
      sectionKey,
      templates: templates || templatesNow(sectionKey),
      count,
      filters,
      history: Progress.historyFor(store.get(), sectionKey),
      domainWeights: practice.domainWeights(sectionByKey(sectionKey)),
      instantiate: window.LiminalFamilyShared.instantiate,
    });
    recordServed(run);
    return run;
  }

  async function buildMiniTest(blueprint) {
    const sections = {};
    for (const entry of blueprint.sections) {
      sections[entry.sectionKey] = {
        templates: await sectionTemplates(entry.sectionKey),
        history: Progress.historyFor(store.get(), entry.sectionKey),
        domainWeights: practice.domainWeights(sectionByKey(entry.sectionKey)),
      };
    }
    const built = practice.templateMiniTest({
      blueprint,
      sections,
      instantiate: window.LiminalFamilyShared.instantiate,
    });
    built.runs.forEach(recordServed);
    return built.questions;
  }

  /* ------------------------------------------------------- unfinished set */

  const activeSession = {
    load() {
      try {
        const saved = JSON.parse(storage.getItem(SESSION_KEY));
        return saved && saved.config && saved.state ? saved : null;
      } catch (error) {
        return null;
      }
    },
    store(value) {
      try {
        if (value) storage.setItem(SESSION_KEY, JSON.stringify(value));
        else storage.removeItem(SESSION_KEY);
      } catch (error) {
        console.warn("Could not save the unfinished set.", error);
      }
    },
    clear() {
      activeSession.store(null);
    },
    // A saved set the test screen can actually reopen.
    valid(saved) {
      return Boolean(saved && window.LiminalShell && window.LiminalShell.canResume(saved.state));
    },
  };

  /* ------------------------------------------------------------ recording */

  function templateVersionOf(question) {
    if (!question || !question.templateId) return undefined;
    const template = templatesNow(question.sectionKey).find((entry) => entry.id === question.templateId);
    if (template && template.version) return template.version;
    return practice.templateVersions(registry(question.sectionKey))[question.templateId] || 1;
  }

  function attemptFor(meta, item, now) {
    return Progress.buildAttempt(item.question, item, {
      id: `${meta.sessionId}:${item.index}`,
      sessionId: meta.sessionId,
      feedback: meta.feedback,
      runCode: meta.runCode,
      templateVersion: templateVersionOf(item.question),
      now,
    });
  }

  let saveWarned = false;
  // Views are not re-rendered behind the test screen; closing it refreshes
  // them once.
  let shellOpen = false;

  function clearProgress() {
    const result = store.clear();
    notifyProgress();
    return result;
  }

  function update(change) {
    const result = store.update(change);
    if (!result.ok && !saveWarned) {
      saveWarned = true;
      console.warn("Progress could not be saved in this browser. Practice can continue.");
    }
    notifyProgress();
    return result;
  }

  // Every item a finished set showed is recorded: answered or not, checked
  // or not. Items checked during an instant-feedback set were recorded when
  // they were checked (same ids, so they are never counted twice).
  function recordFinish(meta, result) {
    const now = Date.now();
    const pending = result.items.filter((item) => !(result.feedback === "instant" && item.checked));
    const marks = {};
    result.items.forEach((item) => {
      marks[item.question.id] = Boolean(item.marked);
    });
    update((progress) => {
      let next = Progress.recordAttempts(progress, pending.map((item) => attemptFor(meta, item, now)));
      next = Progress.setMarks(next, marks);
      return Progress.recordSession(next, Progress.summarizeSession(
        {
          id: meta.sessionId,
          sectionKey: meta.sectionKey,
          kind: meta.kind,
          title: meta.title,
          runCode: meta.runCode,
          feedback: meta.feedback,
          startedAt: meta.startedAt,
          finishedAt: now,
        },
        result.items,
        result.elapsedMs,
      ));
    });
  }

  /* ------------------------------------------------------ digital test mode */

  function toolsFor(questions, sectionKey) {
    const keys = new Set(questions.map((question) => question.sectionKey).filter(Boolean));
    if (!keys.size) keys.add(sectionKey);
    return {
      calculator: [...keys].some(isMath),
      reference: keys.has("sat-math"),
    };
  }

  // Every set, practice or timed, runs in the full-screen test mode.
  // `config`: { title, sectionKey, kind, questions, feedback,
  // timeLimitSeconds, runCode?, setCode?, tools? }. Throws when the test
  // screen cannot open; the caller shows why.
  function launch(config, resume) {
    if (!window.LiminalShell) throw new Error("The test screen did not load. Refresh the page and try again.");
    const { questions, ...rest } = config;
    const meta = {
      ...rest,
      sessionId: rest.sessionId || Progress.newId("s"),
      startedAt: rest.startedAt || Date.now(),
      questionCount: resume ? rest.questionCount : questions.length,
    };
    const progress = store.get();
    const options = {
      ...meta,
      questions,
      tools: meta.tools || toolsFor(questions || [], meta.sectionKey),
      marked: resume ? undefined : questions.map((question) => Progress.isMarked(progress, question.id)),
      resume: resume || null,
      learnHref: practice.learnHref,
      onSave(state) {
        activeSession.store({ config: meta, savedAt: Date.now(), state });
      },
      onAnswer(item) {
        update((current) => Progress.recordAttempts(current, [attemptFor(meta, item, Date.now())]));
      },
      onFinish(result) {
        recordFinish(meta, result);
        activeSession.clear();
      },
      reportActions: (report) => reportActions(meta, report),
      // Back where the set started, with every count brought up to date.
      onExit(detail) {
        shellOpen = false;
        if (detail && detail.reason === "discard") activeSession.clear();
        notifySession();
        notifyProgress();
        showView(currentView);
      },
    };
    shellOpen = true;
    try {
      window.LiminalShell.start(options);
    } catch (error) {
      shellOpen = false;
      throw error;
    }
  }

  // Reopens the saved set, or discards it with a reason when it cannot be
  // reopened. Returns an error message, or null when the set opened.
  function resume() {
    const saved = activeSession.load();
    if (!saved) return "There is no unfinished set to resume.";
    if (!activeSession.valid(saved)) {
      activeSession.clear();
      notifySession();
      return "The unfinished set could not be restored, so it was removed.";
    }
    try {
      launch({ ...saved.config, questions: [] }, saved.state);
      return null;
    } catch (error) {
      activeSession.clear();
      notifySession();
      return `The unfinished set could not be restored (${error.message}), so it was removed.`;
    }
  }

  /* ------------------------------------------------- after-report actions */

  function instantSet(title, questions, kind) {
    const sectionKey = questions[0].sectionKey;
    launch({
      title,
      sectionKey,
      kind,
      questions,
      feedback: "instant",
      timeLimitSeconds: null,
    });
  }

  // New questions from the templates of what was missed; bank questions
  // (no templates) come back as they were.
  async function practiceMissed(meta, items) {
    const questions = [];
    const bySection = new Map();
    items.forEach((item) => {
      const key = item.question.sectionKey;
      if (!bySection.has(key)) bySection.set(key, []);
      bySection.get(key).push(item);
    });
    for (const [sectionKey, list] of bySection) {
      const ids = practice.missedTemplateIds(list);
      if (practice.usesTemplates(sectionKey) && ids.length) {
        const templates = (await sectionTemplates(sectionKey)).filter((template) => ids.includes(template.id));
        questions.push(...buildRun({ sectionKey, count: templates.length, templates }).questions);
      }
      list.filter((item) => !item.question.templateId).forEach((item) => questions.push(item.question));
    }
    if (questions.length) instantSet(`${meta.title}: what you missed`, questions, "missed-drill");
  }

  const DRILL_COUNT = 10;

  async function drillSkill(row) {
    const section = sectionByKey(row.sectionKey);
    let questions;
    if (practice.usesTemplates(row.sectionKey)) {
      await sectionTemplates(row.sectionKey);
      questions = buildRun({ sectionKey: row.sectionKey, count: DRILL_COUNT, filters: { skills: [row.skill] } }).questions;
    } else {
      const bank = await loadBank(row.sectionKey);
      questions = core.buildSession(core.filterQuestions(bank, { skills: [row.skill] }), DRILL_COUNT,
        `${Date.now()}-drill`, { avoidIds: Progress.recentlyServedIds(store.get(), row.sectionKey) });
    }
    if (questions.length) instantSet(`${section.test} ${section.shortLabel}: ${row.skill}`, questions, "skill-drill");
  }

  function reportActions(meta, report) {
    const actions = [];
    const missed = report.items.filter((item) => !(item.answered && item.correct));
    if (missed.length) {
      const fresh = missed.every((item) => item.question.templateId);
      actions.push({
        label: `Practice what I missed (${missed.length})`,
        note: fresh
          ? "New questions built the same way, with feedback after each."
          : "The same questions again, with feedback after each.",
        run: () => practiceMissed(meta, missed).catch((error) => console.error(error)),
      });
    }
    const sectionKeys = [...new Set(report.items.map((item) => item.question.sectionKey).filter(Boolean))];
    const weakest = Progress.weakestSkill(store.get(), { sectionKeys }, { current: templateInfo() });
    if (weakest) {
      actions.push({
        label: `Drill my weakest skill: ${weakest.skill}`,
        note: `${Math.round(weakest.accuracy * 100)}% correct over ${weakest.attempted} answers so far. ` +
          `Up to ${DRILL_COUNT} questions, feedback after each.`,
        run: () => drillSkill(weakest).catch((error) => console.error(error)),
      });
    }
    return actions;
  }

  /* ---------------------------------------------------------------- views */

  const ctx = {
    catalog,
    core,
    site,
    runs,
    Progress,
    practice,
    render: window.LiminalRender,
    store,
    update,
    clearProgress,
    formatNumber,
    formatDuration,
    setStatus,
    currentTest,
    testSections,
    sectionByKey,
    sectionLabel,
    registry,
    loadBank,
    bankIfLoaded,
    sectionTemplates,
    templatesNow,
    templateInfo,
    rebuildQuestion,
    questionsForIds,
    buildRun,
    buildMiniTest,
    launch,
    resume,
    activeSession,
    showView,
    openView,
  };

  const factories = window.LiminalViews || {};
  const views = ["practice", "progress", "review", "tips"]
    .map((name) => factories[name](ctx))
    .reduce((all, view) => Object.assign(all, { [view.name]: view }), {});
  const viewByHash = Object.fromEntries(Object.values(views).map((view) => [view.hash, view.name]));
  let currentView = "setup";

  function notifyProgress() {
    if (shellOpen) return;
    Object.values(views).forEach((view) => {
      if (view.onProgressChange) view.onProgressChange(view.name === currentView);
    });
  }

  function notifySession() {
    if (shellOpen) return;
    Object.values(views).forEach((view) => {
      if (view.onSessionChange) view.onSessionChange();
    });
  }

  // focus: move focus to the view's heading (after navigation, not after a
  // re-render the student did not ask for, such as a test switch).
  function showView(name, options) {
    const focus = !options || options.focus !== false;
    const changed = name !== currentView;
    currentView = name;
    Object.values(views).forEach((view) => {
      view.element.classList.toggle("hidden", view.name !== name);
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
    const heading = views[name].element.querySelector("h1");
    if (heading) requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }

  function openView(name, options, params) {
    const view = views[name] || views.setup;
    view.open(options || {}, params || []);
  }

  function openFromHash(options) {
    const route = practice.parseRoute(window.location.hash);
    const name = viewByHash[route.view];
    if (name) openView(name, options, route.params);
    return Boolean(name);
  }

  function onNavClick(event) {
    const link = event.currentTarget;
    const view = views[link.dataset.view];
    if (!view) return; // Learn and Booklets are other pages.
    event.preventDefault();
    const hash = `#${view.hash}`;
    if (window.location.hash === hash) openView(view.name);
    else window.location.hash = hash;
  }

  function onTestChanged() {
    Object.values(views).forEach((view) => {
      if (view.onTestChange) view.onTestChange(view.name === currentView);
    });
  }

  document.querySelectorAll(".site-header a[data-view]").forEach((link) => {
    link.addEventListener("click", onNavClick);
  });
  window.addEventListener("hashchange", () => openFromHash());
  // Another tab recorded progress or changed the unfinished set.
  window.addEventListener("storage", (event) => {
    if (event.key === null || event.key === Progress.STORAGE_KEY) {
      store.refresh();
      notifyProgress();
    }
    if (event.key === null || event.key === SESSION_KEY) notifySession();
  });
  site.onTestChange(onTestChanged);

  if (!openFromHash({ focus: false })) openView("setup", { focus: false });
})();
