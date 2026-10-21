(function () {
  "use strict";

  // The Progress view: what to study next, told honestly. From the top: the
  // "Start here" diagnostic, the plan (test date, weekly goal, next focus),
  // the weekly report (printable, with a plain-text summary to copy for a
  // parent, and an On track / Needs attention signal), official scores
  // beside recent accuracy (SAT), the stat cards, the skill map with its
  // practice states and plan status, official question-bank checks (SAT),
  // pacing, the history of finished sets with a trend chart, and saving,
  // restoring, or clearing the record. Every number comes from LiminalProgress.stats, the
  // one accuracy model (through LiminalAnalytics): the retired fixed SAT
  // banks are left out, a blank counts as wrong, and a correct answer after
  // a hint is shown apart rather than counted as correct. Answers to
  // generated questions count under their template's current tier and
  // skill, read from the built registries, so the page draws without
  // loading any template bundle; bundles load only for a diagnostic or for
  // each question's expected time.
  //
  // Interface: window.LiminalViews.progress(ctx) returns the view object
  // described at the top of app/app.js. Hash: #progress.

  const SVG_NS = "http://www.w3.org/2000/svg";
  const BLUEBOOK = "https://bluebook.collegeboard.org/";
  const QUESTION_BANK = "https://satsuite.collegeboard.org/practice/student-question-bank";
  // How the plan describes a skill's place in it (Analytics.planState).
  const PLAN_STATUS = {
    "in-flight": "In flight",
    "moved-on": "Moved on: back in the next pass",
    "passed-over": "Passed over by your diagnostic",
    waiting: "Waiting its turn",
  };
  const OFFICIAL_LABELS = {
    confirmed: "Confirmed on official questions",
    low: "Official check low \u2014 keep practising",
  };
  // The trend chart shows this many of the latest sets; the table lists all.
  const TREND_POINTS = 30;
  const TREND_POINTS_NARROW = 15;
  const HISTORY_ROWS = 10;
  const SLOWEST_SKILLS = 5;
  // Session kinds (the shared list: practice, mini, retake, module, section,
  // full, drill, review, diagnostic) plus the practice modes sets used
  // before it.
  const KIND_LABELS = {
    diagnostic: "Diagnostic",
    practice: "Practice",
    targeted: "Practice",
    full: "Full-length",
    adaptive: "Recommended",
    missed: "Missed review",
    flagged: "Marked review",
    "hard-reps": "Hard math",
    mini: "Mini test",
    retake: "Retake",
    module: "Module",
    section: "Section",
    drill: "Drill",
    "skill-drill": "Skill drill",
    "missed-drill": "Missed drill",
    review: "Review",
    mix: "Whole-section mix",
    mixed: "Mixed set",
    transfer: "Math transfer check",
    desmos: "Desmos drill",
    discarded: "Discarded",
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function svg(tag, attributes) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attributes || {}).forEach((name) => node.setAttribute(name, attributes[name]));
    return node;
  }

  let uid = 0;
  function newId(prefix) {
    uid += 1;
    return `pg-${prefix}-${uid}`;
  }

  // A card with an h2 it is labelled by.
  function cardWith(className, title) {
    const card = el("section", `card ${className}`);
    const heading = el("h2", null, title);
    heading.id = newId("heading");
    card.setAttribute("aria-labelledby", heading.id);
    card.appendChild(heading);
    return { card, heading };
  }

  // ctx.setStatus rewrites a status line's classes, so none are added here.
  function statusLine() {
    const node = el("div", "status-line");
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    return node;
  }

  const percent = (value) => (value === null || value === undefined ? "—" : `${Math.round(value * 100)}%`);
  const seconds = (value) => (value === null || value === undefined ? "—" : `${Math.round(value)} s`);

  function create(ctx) {
    const { core, Progress, practice } = ctx;
    const Analytics = window.LiminalAnalytics;
    const ProgressIO = window.LiminalProgressIO;
    const byId = (id) => document.getElementById(id);
    const elements = {
      view: byId("dashboardView"),
      stats: byId("dashboardStats"),
      notes: byId("dashboardNotes"),
      skillTableWrap: byId("skillTableWrap"),
      masteryHeading: byId("masteryHeading"),
      masterySection: byId("masterySection"),
      masterySort: byId("masterySort"),
      masteryNote: byId("masteryNote"),
      clearNote: byId("clearNote"),
      clearProgress: byId("clearProgressBtn"),
    };

    // Without its logic the view says so, and the rest of the page still
    // works.
    if (!Analytics || !ProgressIO) {
      return {
        name: "dashboard",
        hash: "progress",
        element: elements.view,
        open(options) {
          ctx.showView("dashboard", options);
          elements.stats.textContent = "The progress scripts did not load. Refresh the page.";
        },
      };
    }

    const count = (value, one, many) => `${ctx.formatNumber(value)} ${value === 1 ? one : many || `${one}s`}`;

    function dayLabel(ms, withWeekday) {
      const date = new Date(ms);
      const options = { month: "short", day: "numeric" };
      if (date.getFullYear() !== new Date().getFullYear()) options.year = "numeric";
      if (withWeekday) options.weekday = "long";
      return date.toLocaleDateString(undefined, options);
    }

    function sectionName(sectionKey) {
      const section = ctx.sectionByKey(sectionKey);
      return section ? `${section.test} ${section.shortLabel}` : sectionKey;
    }

    // Learn and Practice links for a skill; Practice opens the drill at the
    // skill's next level (the drill's own default).
    function studyLinks(row, level) {
      const cell = el("span", "row-links");
      const learn = practice.learnHref({ sectionKey: row.sectionKey, domain: row.domain, skill: row.skill });
      if (learn) {
        const link = el("a", null, "Learn");
        link.href = learn;
        link.setAttribute("aria-label", `Learn: ${row.skill}`);
        cell.appendChild(link);
      }
      if (ctx.sectionByKey(row.sectionKey)) {
        const link = el("a", null, level ? `Practice at ${level}` : "Practice");
        link.href = practice.practiceHash(row.sectionKey, row.skill);
        link.setAttribute("aria-label", `Practice ${row.skill}${level ? ` at ${level}` : ""}`);
        cell.appendChild(link);
      }
      return cell;
    }

    /* ---------------------------------------------------- page structure */

    const masteryCard = elements.skillTableWrap.closest("section");
    const dangerZone = elements.clearProgress.closest("section");
    const loadStatus = statusLine();

    const start = (() => {
      const { card, heading } = cardWith("start-card", "Start here");
      const intro = el("p", "muted");
      const list = el("div", "start-list");
      const status = statusLine();
      card.append(intro, list, status);
      return { card, heading, intro, list, status };
    })();

    const plan = (() => {
      const { card } = cardWith("plan-card", "Your plan");
      const lede = el("p", "muted",
        "Practice guidance from your answers on this device. It suggests what to study; it never estimates a score.");
      const form = el("form", "plan-form");
      form.noValidate = true;
      const dateLabel = el("label", "field");
      const dateInput = el("input");
      dateInput.type = "date";
      dateInput.name = "testDate";
      dateLabel.append(el("span", "field-label", "Test date"), dateInput);
      const weekLabel = el("label", "field");
      const weekInput = el("input");
      weekInput.type = "number";
      weekInput.name = "weeklyQuestions";
      weekInput.min = "1";
      weekInput.max = String(Analytics.WEEKLY_MAX);
      weekInput.step = "1";
      weekInput.inputMode = "numeric";
      weekInput.placeholder = "e.g. 150";
      weekLabel.append(el("span", "field-label", "Questions per week"), weekInput);
      const save = el("button", "button secondary", "Save plan");
      save.type = "submit";
      form.append(dateLabel, weekLabel, save);
      const status = statusLine();
      const summary = el("div", "plan-summary");
      const countdown = el("p", "plan-countdown");
      const week = el("div", "plan-week");
      const focus = el("div", "plan-focus");
      const review = el("p", "plan-review");
      const score = el("p", "plan-score");
      summary.append(countdown, week, focus, review, score);
      card.append(lede, form, status, summary);
      return { card, form, dateInput, weekInput, status, countdown, week, focus, review, score };
    })();

    // Scores from official tests, each beside the student's Liminal
    // accuracy in the weeks before it. Only shown, never predicted.
    const official = (() => {
      const { card } = cardWith("official-card", "Official scores");
      const lede = el("p", "muted",
        "Record each official practice test you take in Bluebook, and real SAT scores. Each one sits beside your " +
        `Liminal accuracy in the ${Analytics.COMPARISON_DAYS} days up to the test, so you can see whether practice here ` +
        "tracks the real test. Liminal never turns accuracy into a score.");
      const form = el("form", "plan-form official-form");
      form.noValidate = true;
      const field = (labelText, input) => {
        const label = el("label", "field");
        label.append(el("span", "field-label", labelText), input);
        return label;
      };
      const dateInput = el("input");
      dateInput.type = "date";
      dateInput.name = "date";
      const kindSelect = el("select");
      kindSelect.name = "kind";
      [["practice", "Bluebook practice test"], ["sat", "Real SAT"]].forEach(([value, text]) => {
        const option = el("option", null, text);
        option.value = value;
        kindSelect.appendChild(option);
      });
      const labelInput = el("input");
      labelInput.type = "text";
      labelInput.name = "label";
      labelInput.maxLength = Analytics.SCORE_LABEL_MAX;
      labelInput.placeholder = "e.g. Practice Test 4";
      const scoreInput = (name) => {
        const input = el("input");
        input.type = "number";
        input.name = name;
        input.min = String(Analytics.SECTION_SCORE.min);
        input.max = String(Analytics.SECTION_SCORE.max);
        input.step = String(Analytics.SECTION_SCORE.step);
        input.inputMode = "numeric";
        return input;
      };
      const rwInput = scoreInput("readingWriting");
      const mathInput = scoreInput("math");
      const save = el("button", "button secondary", "Add score");
      save.type = "submit";
      form.append(field("Test date", dateInput), field("Test", kindSelect), field("Name (optional)", labelInput),
        field("Reading and Writing", rwInput), field("Math", mathInput), save);
      const status = statusLine();
      const tableWrap = el("div", "table-wrap");
      const note = el("p", "field-note");
      card.append(lede, form, status, tableWrap, note);
      return { card, form, dateInput, kindSelect, labelInput, rwInput, mathInput, status, tableWrap, note };
    })();

    // The weekly report: the last week for the student or a parent, with
    // the off-track signal; printed on its own, or copied as plain text.
    const weekly = (() => {
      const { card } = cardWith("weekly-card", "Weekly report");
      const lede = el("p", "muted");
      const signal = el("div", "weekly-signal");
      const facts = el("dl", "weekly-facts");
      const note = el("p", "field-note");
      const actions = el("div", "card-actions weekly-actions");
      const copy = el("button", "button secondary", "Copy summary");
      copy.type = "button";
      const print = el("button", "button secondary", "Print report");
      print.type = "button";
      actions.append(copy, print);
      const status = statusLine();
      const fallback = el("textarea", "weekly-text hidden");
      fallback.readOnly = true;
      fallback.rows = 8;
      fallback.setAttribute("aria-label", "Weekly report summary");
      card.append(lede, signal, facts, note, actions, status, fallback);
      return { card, lede, signal, facts, note, copy, print, status, fallback };
    })();

    // Official question-bank checks: a skill at its practice target,
    // checked on College Board's own questions.
    const checks = (() => {
      const { card } = cardWith("checks-card", "Official question checks");
      const lede = el("p", "muted");
      const bank = el("a", null, "Student Question Bank");
      bank.href = QUESTION_BANK;
      bank.target = "_blank";
      bank.rel = "noopener";
      lede.append("Liminal\u2019s Easy, Medium and Hard are its own labels. When a skill meets its practice target, check it ",
        "on official questions: open College Board\u2019s ", bank, ` (from My Practice), filter to the skill at Medium, and do ` +
        `about ${Analytics.OFFICIAL_CHECK.suggested} questions you haven\u2019t seen. Record how many you got right. At least ` +
        `${Math.round(Analytics.OFFICIAL_CHECK.confirm * 100)}% confirms the skill on official questions; below ` +
        `${Math.round(Analytics.OFFICIAL_CHECK.low * 100)}%, the skill comes back into your plan to keep practising.`);
      const prompts = el("div", "check-prompts");
      const form = el("form", "plan-form check-form");
      form.noValidate = true;
      const field = (labelText, input) => {
        const label = el("label", "field");
        label.append(el("span", "field-label", labelText), input);
        return label;
      };
      const skillSelect = el("select");
      skillSelect.name = "skill";
      const levelSelect = el("select");
      levelSelect.name = "difficulty";
      Progress.CHECK_DIFFICULTIES.forEach((tier) => {
        const option = el("option", null, tier);
        option.value = tier;
        levelSelect.appendChild(option);
      });
      const number = (name, value) => {
        const input = el("input");
        input.type = "number";
        input.name = name;
        input.min = name === "correct" ? "0" : "1";
        input.max = String(Progress.CHECK_MAX_QUESTIONS);
        input.step = "1";
        input.inputMode = "numeric";
        if (value !== undefined) input.value = String(value);
        return input;
      };
      const correctInput = number("correct");
      const attemptedInput = number("attempted", Analytics.OFFICIAL_CHECK.suggested);
      const dateInput = el("input");
      dateInput.type = "date";
      dateInput.name = "date";
      const save = el("button", "button secondary", "Record check");
      save.type = "submit";
      form.append(field("Skill", skillSelect), field("Level", levelSelect), field("Right", correctInput),
        field("Out of", attemptedInput), field("Date", dateInput), save);
      const status = statusLine();
      const tableWrap = el("div", "table-wrap");
      card.append(lede, prompts, form, status, tableWrap);
      return { card, prompts, form, skillSelect, levelSelect, correctInput, attemptedInput, dateInput, status, tableWrap };
    })();

    const pacing = (() => {
      const { card } = cardWith("pacing-card", "Pacing");
      const intro = el("p", "muted");
      const body = el("div", "pacing-body");
      const expectedButton = el("button", "button secondary", "Compare with each question's expected time");
      expectedButton.type = "button";
      const status = statusLine();
      card.append(intro, body, expectedButton, status);
      return { card, intro, body, expectedButton, status };
    })();

    const history = (() => {
      const { card } = cardWith("history-card", "History");
      const head = el("div", "card-head");
      const controls = el("div", "inline-controls");
      const field = el("label", "field");
      const select = el("select");
      field.append(el("span", "field-label", "Section"), select);
      controls.appendChild(field);
      head.appendChild(controls);
      const note = el("p", "field-note");
      const legend = el("ul", "trend-legend");
      const chart = el("div", "trend-chart");
      const tableWrap = el("div", "table-wrap");
      const more = el("button", "button secondary hidden", "");
      more.type = "button";
      card.append(head, note, legend, chart, tableWrap, more);
      return { card, controls, select, note, legend, chart, tableWrap, more };
    })();

    const data = (() => {
      const note = el("p", "muted",
        "Download a copy to keep it safe or to move it to another browser, and restore it here from the file.");
      const actions = el("div", "data-actions");
      const download = el("button", "button secondary", "Download my progress");
      download.type = "button";
      const restore = el("button", "button secondary", "Restore from a file");
      restore.type = "button";
      const input = el("input", "hidden");
      input.type = "file";
      input.accept = ".json,application/json";
      input.tabIndex = -1;
      input.setAttribute("aria-hidden", "true");
      actions.append(download, restore, elements.clearProgress, input);
      const panel = el("div", "import-panel hidden");
      const status = statusLine();
      return { note, actions, download, restore, input, panel, status };
    })();

    elements.view.querySelector(".page-head").after(loadStatus, start.card, plan.card, weekly.card, official.card);
    masteryCard.after(checks.card, pacing.card, history.card);
    elements.clearNote.after(data.note);
    dangerZone.classList.add("data-zone");
    dangerZone.append(data.actions, data.panel, data.status);
    elements.masteryHeading.textContent = "Skill map";
    const mapHelp = el("details", "skill-map-help");
    elements.masteryNote.replaceWith(mapHelp);
    mapHelp.append(el("summary", null, "How skill states work"), elements.masteryNote);
    const sections = new Map([
      ["plan", plan.card], ["report", weekly.card], ["scores", official.card], ["skills", masteryCard],
      ["checks", checks.card], ["pacing", pacing.card], ["history", history.card], ["saved", dangerZone],
    ]);
    const sectionNav = el("nav", "progress-sections");
    sectionNav.setAttribute("aria-label", "Progress sections");
    sections.forEach((card, key) => {
      const heading = card.querySelector("h2");
      heading.tabIndex = -1;
      const link = el("a", null, heading.textContent);
      link.href = "#progress/" + key;
      link.dataset.section = key;
      sectionNav.append(link);
    });
    elements.view.querySelector(".page-head").append(sectionNav);
    function focusSection(key) {
      const card = sections.get(key);
      if (!card || card.classList.contains("hidden")) return;
      if (key === "skills") {
        const map = elements.skillTableWrap.querySelector("details");
        if (map) map.open = true;
      }
      const heading = card.querySelector("h2");
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: "start" });
    }
    sectionNav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || link.getAttribute("href") !== window.location.hash || event.button > 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      focusSection(link.dataset.section);
    });
    elements.masterySort.replaceChildren(...[["need", "What to study next"], ["domain", "Domain"]].map(([value, text]) => {
      const option = el("option", null, text);
      option.value = value;
      return option;
    }));

    /* ---------------------------------------------------------- the model */

    let renderId = 0;
    let model = null;
    let historyExpanded = false;
    const mapExpansion = new Map();
    let printingMap = false;

    // Each template's current tier and skill: the built registries, with any
    // loaded templates over them.
    function templateInfo() {
      const registries = Object.fromEntries(Progress.TEMPLATE_SECTIONS.map((key) => [key, ctx.registry(key)]));
      return Analytics.mergeTemplateInfo(Analytics.registryTemplateInfo(registries), ctx.templateInfo());
    }

    // Attempts kept before v2 may lack their skill; only then are the banks
    // needed, to look the skill up.
    function missingSkillSections(attempts) {
      return [...new Set(attempts.filter((attempt) => !attempt.skill)
        .map((attempt) => attempt.sectionKey || Progress.sectionOfId(attempt.questionId))
        .filter((key) => ctx.sectionByKey(key)))];
    }

    async function withSkills(attempts, missing) {
      const banks = await Promise.all(missing.map((key) => ctx.loadBank(key).catch(() => [])));
      const byQuestion = new Map(banks.flat().map((question) => [question.id, question]));
      return attempts.map((attempt) => {
        const question = attempt.skill ? null : byQuestion.get(attempt.questionId);
        return question && Progress.questionMatchesAttempt(question, attempt)
          ? { ...attempt, domain: question.domain, skill: question.skill, difficulty: attempt.difficulty || question.difficulty }
          : attempt;
      });
    }

    function sessionTest(session) {
      return Progress.testOf(session.sectionKey || (session.sections || [])[0]);
    }

    // The skill map and the next step come from ctx.guide, as on every
    // page. SAT template tiers are editorial judgments; fixed ACT bank
    // labels are unverified and do not guide practice targets.
    function buildModel(test, progress, attempts) {
      const guide = ctx.guide(test, attempts);
      const trend = Analytics.sessionTrend(progress.sessions, attempts, (session) => sessionTest(session) === test);
      return {
        test,
        tiered: guide.sections.some(core.supportsDifficulty),
        progress,
        attempts,
        sections: guide.sections,
        summary: Progress.stats(attempts),
        rows: guide.rows,
        guide,
        trend,
        checks: Analytics.checksBySkill(progress.officialChecks || []),
      };
    }

    function showLoadError(error) {
      ctx.setStatus(loadStatus, "");
      elements.stats.innerHTML = "";
      const box = el("div", "card empty-state");
      box.append(el("strong", null, "Your progress could not be loaded."),
        el("p", null, `${error.message} Refresh the page or verify the site was built with npm run build.`));
      elements.stats.appendChild(box);
      elements.skillTableWrap.innerHTML = "";
    }

    async function render(options, params = []) {
      ctx.showView("dashboard", options);
      const id = ++renderId;
      const test = ctx.currentTest();
      const progress = ctx.store.get();
      let attempts = Progress.attemptsFor(progress, { test });
      const missing = missingSkillSections(attempts);
      if (missing.length) {
        ctx.setStatus(loadStatus, "Loading your earlier answers…", "loading");
        try {
          attempts = await withSkills(attempts, missing);
        } catch (error) {
          showLoadError(error);
          return;
        }
        if (id !== renderId || test !== ctx.currentTest()) return;
        ctx.setStatus(loadStatus, "");
      }
      model = buildModel(test, progress, Progress.withCurrentTemplates(attempts, templateInfo()));
      renderStats();
      renderNotes();
      renderStart();
      renderPlan();
      renderWeekly();
      renderOfficial();
      renderChecks();
      sectionNav.querySelector('[data-section="scores"]').hidden = model.test !== "SAT";
      sectionNav.querySelector('[data-section="checks"]').hidden = model.test !== "SAT";
      populateMapSections();
      renderMap();
      renderPacing();
      populateHistorySections();
      renderHistory();
      if (params.length) window.requestAnimationFrame(() => focusSection(params[0]));
    }

    /* -------------------------------------------------------------- stats */

    function card(label, value, note, link) {
      const node = el("div", "card stat-card");
      node.append(el("span", "stat-label", label), el("strong", "stat-value", value));
      if (link) {
        const anchor = el("a", "stat-note", link.text);
        anchor.href = link.href;
        node.appendChild(anchor);
      } else if (note) {
        node.appendChild(el("span", "stat-note", note));
      }
      return node;
    }

    // Beside Hard accuracy, the same on each Hard design's first recorded answer,
    // excluding later recorded attempts at that design.
    function hardNote(hard) {
      if (!hard.attempted) return "No Hard questions yet";
      const first = Analytics.firstSight(model.attempts, "Hard");
      const counted = `${count(hard.attempted, "Hard question")} counted`;
      return first.attempted
        ? `${counted}; ${percent(first.accuracy)} on first recorded answers across ${count(first.attempted, "design")}`
        : counted;
    }

    // Practice targets met, by section: SAT Math's count leads, so the Math
    // plan is not read against Reading and Writing's skills too.
    function targetsCard(rows, states) {
      const met = (key) => rows.filter((row) => row.sectionKey === key &&
        (row.state === "at-gate" || row.state === "mastered")).length;
      const total = (key) => rows.filter((row) => row.sectionKey === key).length;
      const keys = model.sections.map((section) => section.key).filter((key) => total(key));
      const lead = keys.find((key) => Analytics.PLANS[key]) || keys[0];
      if (!lead) return card("Practice targets met", "0 / 0", "");
      const others = keys.filter((key) => key !== lead).map((key) => `${ctx.sectionLabel(key)} ${met(key)} / ${total(key)}`);
      return card(`${ctx.sectionLabel(lead)} practice targets met`, `${met(lead)} / ${total(lead)}`,
        [...others, `${states.mastered} advanced met`].join(" \u00b7 "));
    }

    function renderStats() {
      const { summary, rows, progress, test, tiered } = model;
      const hard = summary.byDifficulty.Hard;
      const untiered = "Difficulty labels here are not verified";
      const missed = Progress.missedIds(progress, { test }).length;
      const marked = Progress.markedIds(progress, { test }).length;
      const states = Analytics.stateCounts(rows);
      // Counted: every question the accuracy model counts, a blank as wrong;
      // answered: the ones with an answer, as the weekly count below counts.
      const answered = summary.attempted - summary.unanswered;
      elements.stats.replaceChildren(
        card("Questions counted", ctx.formatNumber(summary.attempted),
          summary.unanswered
            ? `${ctx.formatNumber(answered)} answered, ${ctx.formatNumber(summary.unanswered)} left blank (counted wrong)`
            : "Each counted once, at its first answer"),
        card("Overall accuracy", percent(summary.accuracy), ""),
        // Hard accuracy stands alone: overall accuracy on a mostly Easy and
        // Medium mix is what makes practice look better than the real test.
        tiered
          ? card("Hard accuracy", percent(hard.accuracy), hardNote(hard))
          : card("Hard accuracy", "—", untiered),
        tiered ? targetsCard(rows, states)
          : card("Skills practised", `${rows.length - states["not-started"]} / ${rows.length}`, "Accuracy only, no gate"),
        card("Missed / marked", `${ctx.formatNumber(missed)} / ${ctx.formatNumber(marked)}`, "",
          missed || marked ? { href: "#review", text: "Review them" } : null),
      );
    }

    function renderNotes() {
      const { summary } = model;
      const notes = [];
      if (summary.hintedCorrect) {
        notes.push(`${ctx.formatNumber(summary.hintedCorrect)} correct answer${summary.hintedCorrect === 1 ? "" : "s"} ` +
          "came after a hint. They count as answered but not as correct: following a hint is not yet finding the method.");
      }
      if (summary.updated) {
        notes.push(`${ctx.formatNumber(summary.updated)} answer${summary.updated === 1 ? " was" : "s were"} to ` +
          "questions whose template has been revised since. They still count, under the template's current " +
          "difficulty and skill; review them to see the question as it is now.");
      }
      if (summary.repeats) {
        notes.push(`${ctx.formatNumber(summary.repeats)} answer${summary.repeats === 1 ? " was" : "s were"} to ` +
          "questions you had answered before, as when Review brings a miss back. They are left out of accuracy and " +
          "the skill map: a second try at the same question shows memory of it, not the skill.");
      }
      if (summary.legacy) {
        notes.push(`${ctx.formatNumber(summary.legacy)} earlier answer${summary.legacy === 1 ? "" : "s"} from the retired ` +
          "fixed SAT question banks are left out: their difficulty labels ran easier than the real test.");
      }
      elements.notes.replaceChildren(...notes.map((text) => el("p", "field-note", text)));
      elements.notes.classList.toggle("hidden", !notes.length);
    }

    /* --------------------------------------------------------- diagnostic */

    function sectionAnswered(sectionKey) {
      return model.rows.some((row) => row.sectionKey === sectionKey && row.attempted);
    }

    function renderStart() {
      const sections = model.sections.filter((section) => practice.usesTemplates(section.key));
      start.card.classList.toggle("hidden", !sections.length);
      if (!sections.length) return;
      const fresh = sections.filter((section) => !sectionAnswered(section.key));
      start.card.classList.toggle("is-start", fresh.length > 0);
      start.heading.textContent = fresh.length ? "Start here" : "Diagnostic";
      const { count: size } = Analytics.DIAGNOSTIC;
      // Honest about its reach: twenty questions place a student by domain;
      // they cannot grade a section's skills.
      start.intro.textContent = (fresh.length
        ? `A ${size}-question diagnostic shows where you stand by domain before you practise. `
        : `Take a ${size}-question diagnostic again at any time to see where you stand by domain now. `) +
        "It mixes Medium and Hard questions across all four domains in the real test's proportions, which is at most " +
        "two questions in any skill: too few to grade a skill, so it does not fill your skill map. For Math it sets " +
        "where the Math plan starts. It is not a score; an official practice test in Bluebook is. " +
        "There is no timer, though each question is timed for your pacing; answers and explanations come at the end.";
      start.list.replaceChildren(...sections.map((section) => {
        const item = el("div", "start-item");
        const text = el("div", "start-text");
        text.appendChild(el("strong", null, `${section.test} ${section.shortLabel}`));
        const last = model.trend.filter((point) => point.kind === "diagnostic" && point.sectionKey === section.key).pop();
        const placement = model.guide.placements[section.key];
        let detail;
        if (last) {
          detail = `Last diagnostic ${dayLabel(last.finishedAt)}: ${percent(last.accuracy)} correct` +
            (last.hard.attempted ? `, Hard ${percent(last.hard.accuracy)}.` : ".");
          if (placement && placement.stage) detail += ` The Math plan starts at stage ${placement.stage}.`;
        } else {
          detail = sectionAnswered(section.key) ? "No diagnostic taken yet." : "No answers yet. Start here.";
        }
        text.appendChild(el("span", "muted", detail));
        const isFresh = fresh.includes(section);
        const button = el("button", `button ${isFresh ? "primary" : "secondary"}`,
          isFresh ? `Start the ${section.shortLabel} diagnostic` : last ? "Take it again" : "Take the diagnostic");
        button.type = "button";
        button.addEventListener("click", () => startDiagnostic(section, button));
        item.append(text, button);
        return item;
      }));
    }

    async function startDiagnostic(section, button) {
      button.disabled = true;
      ctx.setStatus(start.status, `Preparing the ${ctx.sectionName(section.key)} diagnostic…`, "loading");
      try {
        await ctx.startDiagnostic(section.key);
        ctx.setStatus(start.status, "");
      } catch (error) {
        ctx.setStatus(start.status, `${error.message} Refresh the page and try again.`, "error");
      } finally {
        button.disabled = false;
      }
    }

    /* --------------------------------------------------------------- plan */

    function meter(fraction, label) {
      const bar = el("span", "meter");
      bar.setAttribute("aria-hidden", "true");
      const fill = el("i");
      fill.style.width = `${Math.round(Math.max(0, Math.min(1, fraction)) * 100)}%`;
      bar.appendChild(fill);
      const wrap = el("span", "meter-cell");
      wrap.append(bar, document.createTextNode(label));
      return wrap;
    }

    function renderPlan() {
      const saved = Progress.planFor(model.progress, model.test);
      // Leave the fields alone while the student is typing in them.
      if (!plan.form.contains(document.activeElement)) {
        plan.dateInput.value = saved.testDate || "";
        plan.weekInput.value = saved.weeklyQuestions ? String(saved.weeklyQuestions) : "";
      }

      const days = Analytics.daysUntil(saved.testDate);
      const goal = saved.weeklyQuestions || null;
      if (days === null) {
        plan.countdown.textContent = "Add your test date to count down to it.";
      } else if (days > 1) {
        const date = dayLabel(Analytics.parseDate(saved.testDate).getTime(), true);
        const weeks = days >= 14 ? ` (about ${Math.round(days / 7)} weeks)` : "";
        const ahead = goal ? ` At ${ctx.formatNumber(goal)} a week, that is about ${ctx.formatNumber(Math.round((goal * days) / 7))} more questions.` : "";
        plan.countdown.textContent = `${days} days until your test on ${date}${weeks}.${ahead}`;
      } else if (days === 1) {
        plan.countdown.textContent = "Your test is tomorrow. Rest, and review your notes rather than cramming.";
      } else if (days === 0) {
        plan.countdown.textContent = "Your test is today. Good luck.";
      } else {
        plan.countdown.textContent = `Your test date (${dayLabel(Analytics.parseDate(saved.testDate).getTime())}) has passed. Set the next one.`;
      }

      // Each test has its own goal, counted from that test's answers: every
      // question answered since Monday, once (Analytics.weekCount): a Review
      // question answered again is not a new question; blanks do not count.
      const done = Analytics.weekCount(model.attempts);
      const counts = "Weeks start on Monday. Each question counts once: a Review question you answered before does " +
        "not count again, a fresh version does, and blanks do not.";
      plan.week.replaceChildren(el("h3", null, "This week"));
      if (goal) {
        plan.week.appendChild(meter(done / goal, `${ctx.formatNumber(done)} of ${ctx.formatNumber(goal)} answered`));
        plan.week.appendChild(el("p", "muted", done >= goal
          ? `Goal met for this week. ${counts}`
          : `${ctx.formatNumber(goal - done)} to go. ${counts}`));
      } else {
        plan.week.appendChild(el("p", "muted",
          `${count(done, "question")} answered since Monday. ${counts} Set a weekly goal to track it.`));
      }

      renderFocus();

      const missed = Progress.missedIds(model.progress, { test: model.test }).length;
      const marked = Progress.markedIds(model.progress, { test: model.test }).length;
      plan.review.replaceChildren();
      if (missed || marked) {
        plan.review.append(`Review: ${count(missed, "missed question")} and ${ctx.formatNumber(marked)} marked. `);
        const link = el("a", null, "Open Review");
        link.href = "#review";
        plan.review.appendChild(link);
      } else {
        plan.review.textContent = "Nothing is waiting in Review.";
      }

      plan.score.replaceChildren();
      plan.score.classList.toggle("hidden", model.test !== "SAT");
      if (model.test === "SAT") {
        const link = el("a", null, "official full-length practice test in Bluebook");
        link.href = BLUEBOOK;
        link.target = "_blank";
        link.rel = "noopener";
        // The Math plan in Learn calls for an official test every two to
        // three weeks; say when the last recorded one was.
        const scores = model.progress.officialScores || [];
        const last = scores.length ? Analytics.parseDate(scores[scores.length - 1].date) : null;
        const since = last ? Analytics.daysUntil(Analytics.formatDate(new Date()), last.getTime()) : null;
        const lead = since === null
          ? "No official practice test recorded yet. Take an "
          : since >= 21
            ? `Your last official practice test was ${count(since, "day")} ago; the plan suggests one every two to three weeks. Take an `
            : "For a score, take an ";
        plan.score.append(lead, link, " and add it under Official scores. Liminal reports " +
          "accuracy only and never estimates a score: its questions are not calibrated against real test results.");
      }
    }

    // The one next step (ctx.guide), in the words Practice and every report
    // use. Before any answer, the diagnostic above comes first.
    function renderFocus() {
      plan.focus.replaceChildren(el("h3", null, "Next focus"));
      const step = model.summary.attempted || model.guide.dueCount ? model.guide.step() : null;
      if (!step) {
        plan.focus.appendChild(el("p", "muted", model.sections.some((section) => practice.usesTemplates(section.key))
          ? "No answers yet. Take the diagnostic above, and your next step appears here."
          : "Answer a few questions and your next step appears here."));
        appendTransferFocus();
        return;
      }
      const words = ctx.stepWords(step);
      const line = el("p");
      line.appendChild(el("strong", null, words.title));
      if (words.section) line.append(` (${words.section})`);
      line.append(`. ${words.reason}`);
      plan.focus.appendChild(line);
      if (words.level) plan.focus.appendChild(el("p", "muted", words.level));
      if (words.then) plan.focus.appendChild(el("p", "muted", words.then));
      if (words.more) plan.focus.appendChild(el("p", "muted", words.more));
      if (step.kind === "review") {
        const links = el("span", "row-links");
        const link = el("a", null, "Open Review");
        link.href = "#review";
        links.appendChild(link);
        plan.focus.appendChild(links);
        appendTransferFocus();
        return;
      }
      const actions = el("div", "card-actions");
      if (words.learnHref) {
        const lesson = el("a", "button secondary", "Read the lesson");
        lesson.href = words.learnHref;
        lesson.setAttribute("aria-label", `Read the lesson: ${step.skill}`);
        actions.appendChild(lesson);
      }
      const go = el("button", "button primary", words.button);
      go.type = "button";
      go.addEventListener("click", () => startFocus(step, go));
      actions.appendChild(go);
      plan.focus.appendChild(actions);
      if (step.kind === "skill") plan.focus.appendChild(studyLinks(step.row, step.level));
      appendTransferFocus(step.kind === "skill" && step.sectionKey === "sat-math");
    }

    function appendTransferFocus(hasMathLesson) {
      if (model.test !== "SAT") return;
      const region = el("div", "transfer-focus");
      region.appendChild(el("h4", null, "Learn, then check"));
      region.appendChild(el("p", "muted", "Solve the lesson's Try it problems, then check your method on fresh Easy and Medium Math. " +
        "Unpractised skills may appear to expose gaps; use the check's review to choose repair lessons."));
      const actions = el("div", "card-actions");
      if (!hasMathLesson) {
        const step = model.guide.lessonStep("sat-math");
        const row = step && step.row || { sectionKey: "sat-math", domain: "Geometry and Trigonometry", skill: "Lines, angles, and triangles" };
        const lesson = el("a", "button secondary", step ? `Repair: ${step.skill}` : "Start with triangles and similarity");
        lesson.href = practice.learnHref(row);
        actions.appendChild(lesson);
        const drill = el("a", "button secondary", "Practice that skill");
        drill.href = practice.practiceHash("sat-math", row.skill);
        actions.appendChild(drill);
      }
      const check = el("button", "button secondary", "Start a fresh 12-question check");
      check.type = "button";
      check.addEventListener("click", async () => {
        check.disabled = true;
        ctx.setStatus(plan.status, "Preparing your check…", "loading");
        try {
          const opened = await ctx.startTransfer("sat-math");
          ctx.setStatus(plan.status, opened === 0 ? "No accessible Math questions are available for this check." : "", opened === 0 ? "error" : "");
        } catch (error) {
          ctx.setStatus(plan.status, `${error.message} Refresh the page and try again.`, "error");
        } finally {
          check.disabled = false;
        }
      });
      actions.appendChild(check);
      region.appendChild(actions);
      const method = el("p", "note");
      const guide = el("a", null, "Worked transfer practice");
      guide.href = "learn.html#sat/general/math-transfer";
      method.append(guide, ". For the check, write the requested quantity and first equation on paper; answers come at the end. " +
        "The Geometry emphasis is a teaching mix. Finite question pools may repeat.");
      region.appendChild(method);
      plan.focus.appendChild(region);
    }

    async function startFocus(step, button) {
      button.disabled = true;
      ctx.setStatus(plan.status, "Preparing your set\u2026", "loading");
      try {
        const opened = await ctx.startStep(step);
        ctx.setStatus(plan.status, opened === 0 ? "No questions match this step yet." : "", opened === 0 ? "error" : "");
      } catch (error) {
        ctx.setStatus(plan.status, `${error.message} Refresh the page and try again.`, "error");
      } finally {
        button.disabled = false;
      }
    }

    /* ------------------------------------------------------ weekly report */

    function weeklyModel() {
      const progress = model.progress;
      return Analytics.weeklyReport({
        test: model.test,
        attempts: model.attempts,
        sessions: progress.sessions,
        rows: model.rows,
        plan: model.guide.plans ? model.guide.plans["sat-math"] : null,
        officialChecks: progress.officialChecks || [],
        officialScores: progress.officialScores || [],
        testDate: Progress.planFor(progress, model.test).testDate,
        now: Date.now(),
      });
    }

    function factRow(term, value) {
      const wrap = el("div", "weekly-fact");
      wrap.append(el("dt", null, term));
      const dd = el("dd");
      [].concat(value).forEach((part) => dd.append(part));
      wrap.append(dd);
      return wrap;
    }

    function shortDay(text) {
      const date = Analytics.parseDate(text);
      return date ? dayLabel(date.getTime()) : text;
    }

    function skillList(entries) {
      if (!entries.length) return "None";
      const list = el("ul", "weekly-list");
      entries.forEach((entry) => {
        const item = el("li");
        item.append(el("strong", null, entry.skill),
          ` \u00b7 Track ${entry.track} \u00b7 ${Analytics.STATE_LABELS[entry.state]} \u00b7 ${entry.spent} of ${entry.budget} used` +
          (entry.easyStuck ? " \u00b7 drills never got past Easy" : "") +
          (entry.official ? ` \u00b7 ${OFFICIAL_LABELS[entry.official]}` : ""));
        list.appendChild(item);
      });
      return list;
    }

    function renderWeekly() {
      const report = weeklyModel();
      weekly.report = report;
      weekly.lede.textContent = `Your ${model.test} practice from ${dayLabel(report.from)} to ${dayLabel(report.to)}, for you or a parent. Print it, or ` +
        "copy a plain-text summary to send. It reports practice, never a score.";
      const status = report.signal.status;
      const badge = el("p", `weekly-status is-${status}`);
      badge.append(el("strong", null, Analytics.SIGNAL_LABELS[status]));
      if (status === "on-track") badge.append(" \u2014 nothing in the last week needs attention.");
      const reasons = el("ul", "weekly-reasons");
      report.signal.reasons.forEach((reason) => {
        const item = el("li", null, reason.text);
        if (reason.href) {
          const link = el("a", null, "Read it");
          link.href = reason.href;
          item.append(" ", link);
        }
        reasons.appendChild(item);
      });
      weekly.signal.replaceChildren(badge, ...(report.signal.reasons.length ? [reasons] : []));

      const rows = [
        factRow("Practice days", `${report.practiceDays} of the last ${report.days}`),
        factRow("Time in sets", count(report.minutes, "minute")),
        factRow("Questions", `${ctx.formatNumber(report.newQuestions)} new, ${ctx.formatNumber(report.reviewQuestions)} Review`),
      ];
      if (report.mathTargets) {
        rows.push(factRow("Math practice targets met", `${report.mathTargets.met} of ${report.mathTargets.total} skills`));
      }
      if (report.modules) {
        rows.push(factRow("Timed modules", report.modules.length
          ? report.modules.map((entry) => `${ctx.sectionLabel(entry.sectionKey)}: ${entry.correct} of ${entry.total}, ` +
            `Hard ${entry.hardCorrect} of ${entry.hardTotal} (${dayLabel(entry.at)})`).join("; ")
          : "None this week"));
      }
      if (report.skills) {
        rows.push(factRow("Math skills in flight", skillList(report.skills.inFlight)));
        rows.push(factRow("Moved on", skillList(report.skills.movedOn)));
      }
      if (report.checks) {
        rows.push(factRow("Official checks", report.checks.length
          ? report.checks.map((check) => `${check.skill}: ${check.correct} of ${check.attempted} ${check.difficulty} ` +
            `(${percent(check.accuracy)}, ${shortDay(check.date)})`).join("; ")
          : "None this week"));
      }
      if (report.scores) {
        rows.push(factRow("Official Math scores", report.scores.length
          ? report.scores.slice().reverse().map((score) => `${score.math} (${shortDay(score.date)}` +
            `${score.kind === "sat" ? ", real SAT" : score.kind === "practice" ? ", practice test" : ""})`).join("; ")
          : "None recorded"));
      }
      if (report.pace) {
        rows.push(factRow("Plan pace", report.pace.enough
          ? `${count(report.pace.departures, "skill")} left flight in the last ${report.pace.windowDays} days; ` +
            `${report.pace.remaining} still in the first pass`
          : "Not enough history yet"));
      }
      rows.push(factRow("Test date", report.testDate
        ? `${dayLabel(Analytics.parseDate(report.testDate).getTime())}` +
          (report.daysLeft !== null && report.daysLeft >= 0 ? ` (${count(report.daysLeft, "day")} left)` : " (passed)")
        : "Not set: add it under Your plan"));
      weekly.facts.replaceChildren(...rows);
      weekly.note.textContent = report.unavailable.length
        ? `Timed modules, plan tracks, official checks and official scores are SAT-only, so they are not available for ${model.test}. ` +
          "Accuracy here is practice feedback, not a score."
        : "Accuracy here is practice feedback. Liminal never estimates or predicts a score; official practice tests are the score gauge.";
      weekly.fallback.classList.add("hidden");
    }

    function reportText() {
      return Analytics.weeklyReportText(weekly.report || weeklyModel(), { sectionName: ctx.sectionLabel });
    }

    async function copySummary() {
      const text = reportText();
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("no clipboard");
        await navigator.clipboard.writeText(text);
        weekly.fallback.classList.add("hidden");
        ctx.setStatus(weekly.status, "Summary copied. Paste it into a message or email.", "success");
      } catch (error) {
        // Without clipboard access, show the text selected to copy by hand.
        weekly.fallback.value = text;
        weekly.fallback.classList.remove("hidden");
        weekly.fallback.focus();
        weekly.fallback.select();
        ctx.setStatus(weekly.status, "This browser did not allow copying. The summary is selected below: copy it from there.", "error");
      }
    }

    // Prints the weekly report on its own (progress.css, body.print-weekly).
    // The class goes when printing ends (afterprint), which a print dialog
    // that does not block cannot outrun; only a browser without the event
    // removes it on a timer.
    function printReport() {
      document.body.classList.add("print-weekly");
      const done = () => document.body.classList.remove("print-weekly");
      const hasEvent = "onafterprint" in window;
      if (hasEvent) window.addEventListener("afterprint", done, { once: true });
      try {
        window.print();
      } finally {
        if (!hasEvent) window.setTimeout(done, 0);
      }
    }

    /* ------------------------------------------------------ official checks */

    function populateCheckSkills(selected) {
      const previous = selected || checks.skillSelect.value;
      // SAT Math, the section with a plan, first.
      const groups = model.sections.filter((section) => Progress.TEMPLATE_SECTIONS.includes(section.key))
        .sort((left, right) => Number(Boolean(Analytics.PLANS[right.key])) - Number(Boolean(Analytics.PLANS[left.key])))
        .map((section) => {
        const group = el("optgroup");
        group.label = section.shortLabel;
        section.domains.forEach((domain) => Object.keys(domain.skills).forEach((skill) => {
          const option = el("option", null, skill);
          option.value = `${section.key}|${skill}`;
          group.appendChild(option);
        }));
        return group;
      });
      checks.skillSelect.replaceChildren(...groups);
      if ([...checks.skillSelect.options].some((option) => option.value === previous)) checks.skillSelect.value = previous;
    }

    // From a skill row or a prompt: the form set to that skill, focused.
    function checkSkill(row) {
      focusSection("checks");
      checks.skillSelect.value = `${row.sectionKey}|${row.skill}`;
      checks.levelSelect.value = "Medium";
      checks.correctInput.focus();
    }

    let removeCheckArmed = null;

    function renderChecks() {
      checks.card.classList.toggle("hidden", model.test !== "SAT");
      if (model.test !== "SAT") return;
      populateCheckSkills();
      checks.dateInput.max = Analytics.formatDate(new Date());
      if (!checks.form.contains(document.activeElement) && !checks.dateInput.value) {
        checks.dateInput.value = Analytics.formatDate(new Date());
      }
      const list = (model.progress.officialChecks || []).filter((check) => Progress.testOf(check.sectionKey) === model.test);
      const prompts = Analytics.checkPromptList(model.rows, list, model.guide.plans);
      checks.prompts.replaceChildren(...(prompts.length ? [el("h3", null, "Check it on official questions")] : []),
        ...prompts.map(({ row, reason }) => {
          const item = el("div", "start-item");
          const text = el("div", "start-text");
          const { suggested } = Analytics.OFFICIAL_CHECK;
          text.append(el("strong", null, row.skill),
            el("span", "muted", `${ctx.sectionLabel(row.sectionKey)} \u00b7 ` + (reason === "moved-on"
              ? `its practice turn is over, short of the target: see where you stand on ${suggested} official Medium questions you haven\u2019t seen.`
              : `practice target met. Do about ${suggested} of its official Medium questions you haven\u2019t seen.`)));
          const button = el("button", "button secondary", "Record a check");
          button.type = "button";
          button.setAttribute("aria-label", `Record an official check of ${row.skill}`);
          button.addEventListener("click", () => checkSkill(row));
          item.append(text, button);
          return item;
        }));
      if (!list.length) {
        checks.tableWrap.replaceChildren(el("p", "muted", "No official checks recorded yet."));
        return;
      }
      const bySkill = Analytics.checksBySkill(list);
      const table = el("table", "pg-table official-table check-table");
      table.appendChild(el("caption", "sr-only", "Official question checks, newest first"));
      const head = el("thead");
      const headRow = el("tr");
      ["Date", "Skill", "Result", "Effect", ""].forEach((text) => {
        const th = el("th", null, text);
        th.scope = "col";
        headRow.appendChild(th);
      });
      head.appendChild(headRow);
      const body = el("tbody");
      list.slice().reverse().forEach((check) => {
        const tr = el("tr");
        const date = el("td", "date", shortDay(check.date));
        date.dataset.label = "Date";
        const skill = el("th", null, check.skill);
        skill.scope = "row";
        skill.dataset.label = "Skill";
        const result = el("td", "num", `${check.correct} of ${check.attempted} ${check.difficulty}`);
        result.dataset.label = "Result";
        result.appendChild(el("span", "cell-note", percent(Analytics.checkAccuracy(check))));
        const key = `${check.sectionKey}|${check.skill}`;
        const latest = (bySkill.get(key) || {}).latest === check;
        const row = model.rows.find((entry) => entry.sectionKey === check.sectionKey && entry.skill === check.skill);
        const status = latest ? Analytics.officialStatus(check, row) : null;
        const effect = el("td", null, !latest ? "Superseded by a later check" : status ? OFFICIAL_LABELS[status]
          : Analytics.checkAccuracy(check) >= Analytics.OFFICIAL_CHECK.confirm
            ? "Confirms the skill once it meets its practice target" : "No change to the plan");
        effect.dataset.label = "Effect";
        const actions = el("td");
        const remove = el("button", "button secondary", removeCheckArmed === check.id ? "Click again to remove" : "Remove");
        remove.type = "button";
        remove.setAttribute("aria-label", `${removeCheckArmed === check.id ? "Click again to remove" : "Remove"} the check of ${check.skill} from ${date.textContent}`);
        remove.addEventListener("click", () => removeCheck(check.id));
        actions.appendChild(remove);
        tr.append(date, skill, result, effect, actions);
        body.appendChild(tr);
      });
      table.append(head, body);
      checks.tableWrap.replaceChildren(table);
    }

    function addCheck(event) {
      event.preventDefault();
      const [sectionKey, skill] = checks.skillSelect.value.split("|");
      const cleaned = Analytics.cleanCheckInput({
        sectionKey,
        skill,
        difficulty: checks.levelSelect.value,
        correct: checks.correctInput.value,
        attempted: checks.attemptedInput.value,
        date: checks.dateInput.value,
      }, { now: Date.now() });
      const bad = [checks.correctInput, checks.attemptedInput, checks.dateInput].some((input) => input.validity.badInput);
      if (bad || !cleaned.check) {
        const errors = cleaned.errors;
        ctx.setStatus(checks.status, errors.includes("skill") ? "Choose the skill you checked."
          : errors.includes("attempted") ? `Enter how many questions you did, from 1 to ${Progress.CHECK_MAX_QUESTIONS}.`
            : errors.includes("correct") ? "Enter how many you got right: a whole number, no more than you did."
              : "Enter the day you did them; it cannot be after today.", "error");
        return;
      }
      const check = Object.assign(cleaned.check, { id: Progress.newId("c"), at: Date.now() });
      const result = ctx.update((progress) => Progress.addOfficialCheck(progress, check));
      if (result.ok) {
        checks.correctInput.value = "";
        checks.correctInput.focus();
      }
      const accuracy = Analytics.checkAccuracy(check);
      const effect = accuracy < Analytics.OFFICIAL_CHECK.low
        ? " It is below the bar, so the skill comes back into your plan in its next pass."
        : accuracy >= Analytics.OFFICIAL_CHECK.confirm ? " That meets the bar for official questions." : "";
      ctx.setStatus(checks.status, result.ok ? `Check recorded: ${check.skill}, ${check.correct} of ${check.attempted}.${effect}`
        : "The check could not be saved in this browser.", result.ok ? "success" : "error");
    }

    function removeCheck(id) {
      if (removeCheckArmed !== id) {
        removeCheckArmed = id;
        window.setTimeout(() => {
          if (removeCheckArmed !== id) return;
          removeCheckArmed = null;
          if (model) renderChecks();
        }, 5000);
        renderChecks();
        const again = [...checks.tableWrap.querySelectorAll("button")].find((button) => button.textContent.startsWith("Click again"));
        if (again) again.focus();
        return;
      }
      removeCheckArmed = null;
      const result = ctx.update((progress) => Progress.removeOfficialCheck(progress, id));
      ctx.setStatus(checks.status, result.ok ? "Check removed." : "The change could not be saved in this browser.",
        result.ok ? "success" : "error");
      checks.skillSelect.focus();
    }

    function savePlan(event) {
      event.preventDefault();
      const cleaned = Analytics.cleanPlan({
        testDate: plan.dateInput.value,
        weeklyQuestions: plan.weekInput.value.trim(),
      });
      // A half-typed date or a number the browser cannot read has an empty
      // value, which would otherwise clear the field.
      const badDate = plan.dateInput.validity.badInput || cleaned.errors.includes("testDate");
      const badWeek = plan.weekInput.validity.badInput || cleaned.errors.includes("weeklyQuestions");
      if (badDate || badWeek) {
        ctx.setStatus(plan.status, badDate
          ? "Enter the test date as a real date."
          : `Enter a weekly goal between 1 and ${ctx.formatNumber(Analytics.WEEKLY_MAX)} questions.`, "error");
        return;
      }
      // Unset fields are removed from the plan (undefined is not stored).
      const result = ctx.update((progress) => Progress.setPlan(progress, {
        testDate: cleaned.plan.testDate,
        weeklyQuestions: cleaned.plan.weeklyQuestions,
      }, model.test));
      ctx.setStatus(plan.status, result.ok ? "Plan saved." : "The plan could not be saved in this browser.",
        result.ok ? "success" : "error");
    }

    /* ---------------------------------------------------- official scores */

    const OFFICIAL_KIND_LABELS = { practice: "Bluebook practice test", sat: "Real SAT" };
    let removeArmed = null;
    let removeTimer = null;

    function comparisonCell(label, scoreValue, section) {
      const td = el("td", "num");
      td.dataset.label = label;
      td.appendChild(el("strong", null, scoreValue === undefined ? "—" : String(scoreValue)));
      const practiceText = section.attempted
        ? `Liminal ${percent(section.accuracy)} of ${ctx.formatNumber(section.attempted)}` +
          (section.hard.attempted ? `; Hard ${percent(section.hard.accuracy)} of ${ctx.formatNumber(section.hard.attempted)}` : "")
        : "No Liminal answers";
      td.appendChild(el("span", "cell-note", practiceText));
      return td;
    }

    function renderOfficial() {
      official.card.classList.toggle("hidden", model.test !== "SAT");
      if (model.test !== "SAT") return;
      official.dateInput.max = Analytics.formatDate(new Date());
      const rows = Analytics.officialComparison(model.attempts, model.progress.officialScores).reverse();
      if (!rows.length) {
        official.tableWrap.replaceChildren();
        official.note.textContent = "No official scores yet.";
        return;
      }
      const table = el("table", "pg-table official-table");
      table.appendChild(el("caption", "sr-only", "Official scores, newest first, with Liminal accuracy before each"));
      const head = el("thead");
      const headRow = el("tr");
      ["Test date", "Test", "Reading and Writing", "Math", ""].forEach((text) => {
        const th = el("th", null, text);
        th.scope = "col";
        headRow.appendChild(th);
      });
      head.appendChild(headRow);
      const body = el("tbody");
      rows.forEach((row) => {
        const { score } = row;
        const tr = el("tr");
        const date = el("td", "date", dayLabel(Analytics.parseDate(score.date).getTime()));
        date.dataset.label = "Test date";
        const name = el("th");
        name.scope = "row";
        name.dataset.label = "Test";
        name.appendChild(el("span", null, score.label || OFFICIAL_KIND_LABELS[score.kind] || "Official test"));
        if (score.label) name.appendChild(el("small", "kind-tag", OFFICIAL_KIND_LABELS[score.kind] || ""));
        const actions = el("td");
        const remove = el("button", "button secondary", removeArmed === score.id ? "Click again to remove" : "Remove");
        remove.type = "button";
        remove.setAttribute("aria-label", removeArmed === score.id
          ? `Click again to remove the score from ${date.textContent}`
          : `Remove the score from ${date.textContent}`);
        remove.addEventListener("click", () => removeOfficial(score.id));
        actions.appendChild(remove);
        tr.append(date, name,
          comparisonCell("Reading and Writing", score.readingWriting, row.sections.readingWriting),
          comparisonCell("Math", score.math, row.sections.math),
          actions);
        body.appendChild(tr);
      });
      table.append(head, body);
      official.tableWrap.replaceChildren(table);
      official.note.textContent = `Liminal accuracy covers the ${Analytics.COMPARISON_DAYS} days up to each test day, ` +
        "counts a blank as wrong and a hinted answer as not correct, leaves out questions seen before, and is not a score.";
    }

    function addOfficial(event) {
      event.preventDefault();
      const bad = [official.dateInput, official.rwInput, official.mathInput].some((input) => input.validity.badInput);
      const cleaned = Analytics.cleanOfficialScore({
        date: official.dateInput.value,
        kind: official.kindSelect.value,
        label: official.labelInput.value,
        readingWriting: official.rwInput.value.trim(),
        math: official.mathInput.value.trim(),
      }, { now: Date.now() });
      if (bad || !cleaned.score) {
        const errors = cleaned.errors;
        const { min, max, step } = Analytics.SECTION_SCORE;
        ctx.setStatus(official.status, errors.includes("date") || official.dateInput.validity.badInput
          ? "Enter the day you took the test; it cannot be after today."
          : errors.includes("scores")
            ? "Enter at least one section score."
            : `Enter each section score as a number from ${min} to ${max} in steps of ${step}.`, "error");
        return;
      }
      const score = Object.assign(cleaned.score, { id: Progress.newId("o"), at: Date.now() });
      const result = ctx.update((progress) => Progress.addOfficialScore(progress, score));
      if (result.ok) {
        official.form.reset();
        official.dateInput.focus();
      }
      ctx.setStatus(official.status, result.ok ? "Score added." : "The score could not be saved in this browser.",
        result.ok ? "success" : "error");
    }

    // A first click arms the button for five seconds; a second removes.
    function removeOfficial(id) {
      window.clearTimeout(removeTimer);
      if (removeArmed !== id) {
        removeArmed = id;
        removeTimer = window.setTimeout(() => {
          removeArmed = null;
          if (model) renderOfficial();
        }, 5000);
        renderOfficial();
        const again = [...official.tableWrap.querySelectorAll("button")].find((button) => button.textContent.startsWith("Click again"));
        if (again) again.focus();
        return;
      }
      removeArmed = null;
      const result = ctx.update((progress) => Progress.removeOfficialScore(progress, id));
      ctx.setStatus(official.status, result.ok ? "Score removed." : "The change could not be saved in this browser.",
        result.ok ? "success" : "error");
      official.dateInput.focus();
    }

    /* ---------------------------------------------------------- skill map */

    function populateMapSections() {
      const previous = elements.masterySection.value;
      const options = [["all", `All sections (${model.rows.length} skills)`]].concat(model.sections.map((section) => [
        section.key,
        `${section.shortLabel} (${model.rows.filter((row) => row.sectionKey === section.key).length})`,
      ]));
      elements.masterySection.replaceChildren(...options.map(([value, text]) => {
        const option = el("option", null, text);
        option.value = value;
        return option;
      }));
      const keys = options.map(([value]) => value);
      // A student who has worked in one section sees that section first.
      const answered = model.sections.filter((section) => sectionAnswered(section.key));
      const fallback = answered.length === 1 ? answered[0].key : "all";
      elements.masterySection.value = keys.includes(previous) ? previous : fallback;
    }

    function gateCell(row) {
      const cell = el("span", "gate-cell");
      const { gate } = row;
      const bar = el("span", "gate-meter");
      bar.setAttribute("aria-hidden", "true");
      const fill = el("i");
      fill.style.width = `${Math.round((gate.accuracy || 0) * 100)}%`;
      if (gate.met) fill.className = "is-met";
      const mark = el("b");
      mark.style.left = `${Math.round((Analytics.GATE.correct / Analytics.GATE.window) * 100)}%`;
      bar.append(fill, mark);
      const text = el("span", "gate-text", gate.attempted ? `${gate.correct} of ${gate.attempted}` : "—");
      let noteText = gate.attempted >= gate.window ? `needs ${gate.needed}` : `${gate.attempted} of ${gate.window} so far`;
      if (gate.attempted >= gate.window && gate.correct >= gate.needed && !gate.met) {
        noteText = gate.days < Analytics.GATE.days ? "needs a second day" : "needs a second question design";
      }
      const note = el("small", "cell-note", noteText);
      cell.append(bar, text, note);
      return cell;
    }

    function tierCell(tally) {
      const cell = el("span", "tier-cell", percent(tally.accuracy));
      if (tally.attempted) cell.appendChild(el("small", "cell-note", `of ${tally.attempted}`));
      return cell;
    }

    function stateBadge(state) {
      return el("span", `state-badge state-${state}`, Analytics.STATE_LABELS[state]);
    }

    // The state badge, with the plan's place for the skill and its latest
    // official check under it.
    function stateCell(row) {
      const cell = el("span", "state-stack");
      cell.appendChild(stateBadge(row.state));
      const plan = model.guide.plans && model.guide.plans[row.sectionKey];
      const entry = plan && plan.skills[row.skill];
      if (entry && PLAN_STATUS[entry.status]) {
        const track = plan.tracks.find((item) => item.key === entry.track);
        cell.appendChild(el("small", "cell-note plan-note", entry.status === "in-flight"
          ? `In flight, ${track ? track.name : "its track"}: ${entry.spent} of ${entry.budget} used`
          : entry.easyStuck ? "Moved on while its drills were still Easy: reread its lesson; back in the next pass"
            : PLAN_STATUS[entry.status]));
      }
      const latest = (model.checks.get(`${row.sectionKey}|${row.skill}`) || {}).latest;
      if (latest) {
        const status = Analytics.officialStatus(latest, row);
        cell.appendChild(el("small", `cell-note official-note${status ? ` is-${status}` : ""}`,
          `${status ? `${OFFICIAL_LABELS[status]}: ` : "Official check: "}${latest.correct} of ${latest.attempted} ${latest.difficulty}`));
      }
      return cell;
    }

    // Learn and Practice, and "Check it on official questions" for a skill
    // at its target with no check yet, or one whose turn ended short of it.
    function studyCell(row) {
      const cell = studyLinks(row);
      if (model.test === "SAT" && Analytics.checkPrompts([row], model.progress.officialChecks, model.guide.plans).length) {
        const button = el("button", "text-link", "Check it on official questions");
        button.type = "button";
        button.setAttribute("aria-label", `Check ${row.skill} on official questions`);
        button.addEventListener("click", () => checkSkill(row));
        cell.appendChild(button);
      }
      return cell;
    }

    function skillRow(row, showDomain) {
      const tr = el("tr");
      // The skill names the row for screen readers.
      const skill = el("th", "skill-name");
      skill.scope = "row";
      skill.appendChild(el("span", null, row.skill));
      if (showDomain) skill.appendChild(el("small", "cell-note", `${ctx.sectionLabel(row.sectionKey)} · ${row.domain}`));
      const answered = el("td", "num", ctx.formatNumber(row.attempted));
      answered.dataset.label = "Answered";
      if (row.hintedCorrect) answered.appendChild(el("small", "cell-note", `${row.hintedCorrect} after a hint`));
      const cells = [
        skill,
        answered,
        ["Medium", row.tiered ? tierCell(row.medium) : el("span", "tier-cell", "—")],
        ["Hard", row.tiered ? tierCell(row.hard) : el("span", "tier-cell", "—")],
        [`Gate: last ${Analytics.GATE.window} Medium`, row.tiered ? gateCell(row) : el("span", "gate-cell", "No gate"), "gate-cell-wrap"],
        [null, stateCell(row), "state-cell"],
        [null, studyCell(row), "study-cell"],
      ].map((entry) => {
        if (!Array.isArray(entry)) return entry;
        const td = el("td", entry[2]);
        if (entry[0]) td.dataset.label = entry[0];
        td.appendChild(entry[1]);
        return td;
      });
      tr.append(...cells);
      return tr;
    }

    function renderMap() {
      const sectionFilter = elements.masterySection.value || "all";
      const sortKey = elements.masterySort.value || "need";
      const rows = Analytics.sortSkills(
        model.rows.filter((row) => sectionFilter === "all" || row.sectionKey === sectionFilter),
        sortKey,
      );
      const { GATE, HARD_BAR, MIN_ATTEMPTS } = Analytics;
      const untiered = model.tiered ? "" : "These questions come from fixed banks whose difficulty labels are not " +
        "verified. Skills here show accuracy only, without practice-target states. ";
      elements.masteryNote.textContent = untiered ||
        `States are practice guidance, not a score or proof of mastery. Practice target met: at least ${GATE.correct} correct of your last ` +
        `${GATE.window} Medium questions in a skill. Advanced practice target met: that target, plus at least ${HARD_BAR.correct} ` +
        `correct of your last ${HARD_BAR.window} Hard questions. Each window must span ${GATE.days} days and ${GATE.templates} ` +
        "question designs, and each question counts once, at its first answer. " +
        `Under ${MIN_ATTEMPTS} answers is not enough data. ` +
        (sortKey === "need" ? "Sorted by need: weak skills with evidence first, then skills without enough answers." : "");
      if (!rows.length) {
        elements.skillTableWrap.replaceChildren(el("p", "muted", "No skills in this section."));
        return;
      }
      const table = el("table", "pg-table skill-map");
      const head = el("thead");
      const headRow = el("tr");
      ["Skill", "Answered", "Medium", "Hard", `Gate: last ${GATE.window} Medium`, "State", "Study"].forEach((text) => {
        const th = el("th", null, text);
        th.scope = "col";
        headRow.appendChild(th);
      });
      head.appendChild(headRow);
      table.appendChild(head);
      if (sortKey === "domain") {
        const groups = new Map();
        rows.forEach((row) => {
          const key = `${row.sectionKey}|${row.domain}`;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(row);
        });
        groups.forEach((list) => {
          const body = el("tbody");
          const groupRow = el("tr", "group-row");
          const th = el("th", null, sectionFilter === "all"
            ? `${ctx.sectionLabel(list[0].sectionKey)} · ${list[0].domain}`
            : list[0].domain);
          th.colSpan = 7;
          th.scope = "rowgroup";
          groupRow.appendChild(th);
          body.appendChild(groupRow);
          list.forEach((row) => body.appendChild(skillRow(row, false)));
          table.appendChild(body);
        });
      } else {
        const body = el("tbody");
        rows.forEach((row) => body.appendChild(skillRow(row, true)));
        table.appendChild(body);
      }
      const practiced = rows.filter((row) => row.attempted > 0).length;
      const key = model.test + ":" + sectionFilter;
      const disclosure = el("details", "skill-map-disclosure");
      disclosure.open = mapExpansion.get(key) === true;
      const summary = el("summary", null, `${count(rows.length, "skill")} · ${practiced} practiced`);
      disclosure.append(summary);
      if (!practiced) disclosure.append(el("p", "muted", "No counted answers yet. Choose a skill below to learn or practice."));
      disclosure.append(table);
      disclosure.addEventListener("toggle", () => {
        if (disclosure.isConnected && !printingMap) mapExpansion.set(key, disclosure.open);
      });
      elements.skillTableWrap.replaceChildren(disclosure);
    }

    /* ------------------------------------------------------------- pacing */

    // Each question's own estimate, read from its rebuilt question once its
    // section's templates have loaded; null before that and for bank
    // questions. Cached, since a record holds thousands of answers.
    const expectedCache = new Map();
    function expectedSeconds(attempt) {
      if (attempt.source !== "template") return null;
      if (expectedCache.has(attempt.questionId)) return expectedCache.get(attempt.questionId);
      if (!ctx.templatesNow(attempt.sectionKey).length) return null;
      const question = ctx.rebuildQuestion(attempt.questionId);
      const value = question && Number(question.estimatedSeconds) > 0 ? Number(question.estimatedSeconds) : null;
      expectedCache.set(attempt.questionId, value);
      return value;
    }

    function overPaceText(row) {
      if (row.overPace === null) return "—";
      const difference = Math.round(row.overPace);
      if (Math.abs(difference) < 3) return "on pace";
      return difference > 0 ? `${difference} s over` : `${-difference} s under`;
    }

    function paceVerdict(row) {
      if (row.overPace === null) return "";
      const difference = Math.round(row.overPace);
      const pace = ` Real-test pace is about ${Math.round(row.pace)} s`;
      if (Math.abs(difference) < 3) return `${pace}: you are on pace.`;
      return `${pace}: you take ${Math.abs(difference)} s ${difference > 0 ? "longer" : "less"}.`;
    }

    function paceTable(caption, firstColumn, rows, name) {
      const table = el("table", "pg-table pace-table");
      table.appendChild(el("caption", null, caption));
      const head = el("thead");
      const headRow = el("tr");
      [firstColumn, "Timed", "Median", "Expected", "Vs. real-test pace"].forEach((text) => {
        const th = el("th", null, text);
        th.scope = "col";
        headRow.appendChild(th);
      });
      head.appendChild(headRow);
      const body = el("tbody");
      rows.forEach((row) => {
        const tr = el("tr");
        const first = el("th", null, name(row));
        first.scope = "row";
        first.dataset.label = firstColumn;
        tr.appendChild(first);
        [
          ["Timed", ctx.formatNumber(row.count)],
          ["Median", seconds(row.median)],
          ["Expected", row.expectedCount ? seconds(row.expectedMedian) : "—"],
          ["Vs. pace", overPaceText(row)],
        ].forEach(([label, text]) => {
          const td = el("td", "num", text);
          td.dataset.label = label;
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      table.append(head, body);
      // Wide at large text sizes: the table scrolls, not the page.
      const wrap = el("div", "table-wrap");
      wrap.appendChild(table);
      return wrap;
    }

    function renderPacing() {
      const result = Analytics.pacing(model.attempts, {
        paceSeconds: ctx.core.SECONDS_PER_QUESTION,
        expectedSeconds,
      });
      const paces = model.sections
        .filter((section) => ctx.core.SECONDS_PER_QUESTION[section.key])
        .map((section) => `${section.shortLabel} about ${Math.round(ctx.core.SECONDS_PER_QUESTION[section.key])} s`);
      pacing.intro.textContent = "Median seconds per question from timed answers on this device, next to real-test " +
        `pace (section time over its length${paces.length ? `: ${paces.join(", ")}` : ""}) and to the time each ` +
        "question was written to take (its estimate).";
      const waiting = model.attempts.some((attempt) => attempt.source === "template" &&
        Number(attempt.timeMs) > 0 && !ctx.templatesNow(attempt.sectionKey).length);
      pacing.expectedButton.classList.toggle("hidden", !waiting);
      if (!result.timed) {
        pacing.body.replaceChildren(el("p", "muted", "No timed answers yet. Every question in a set is timed; " +
          "finish one and your pace appears here." +
          (result.untimed ? ` ${count(result.untimed, "earlier answer")} from before timing began ${result.untimed === 1 ? "is" : "are"} left out.` : "")));
        pacing.expectedButton.classList.add("hidden");
        return;
      }
      const order = model.sections.map((section) => section.key);
      const blocks = result.sections
        .sort((left, right) => order.indexOf(left.sectionKey) - order.indexOf(right.sectionKey))
        .map((row) => {
          const block = el("div", "pace-section");
          block.appendChild(el("h3", null, `${sectionName(row.sectionKey)}: ${count(row.count, "timed answer")}`));
          block.appendChild(el("p", null, `Median ${seconds(row.median)} per question.${paceVerdict(row)}`));
          const totals = row.right.totalSeconds + row.wrong.totalSeconds;
          if (row.right.count && row.wrong.count) {
            block.appendChild(el("p", null,
              `Right answers: median ${seconds(row.right.median)} (${row.right.count}). ` +
              `Wrong or blank: median ${seconds(row.wrong.median)} (${row.wrong.count}). ` +
              `Misses took ${percent(row.wrong.totalSeconds / totals)} of your time here.`));
          }
          const tiers = result.tiers.filter((tier) => tier.sectionKey === row.sectionKey);
          const skills = result.skills.filter((skill) => skill.sectionKey === row.sectionKey).slice(0, SLOWEST_SKILLS);
          const tables = el("div", "pace-tables");
          if (tiers.length) {
            tables.appendChild(paceTable("By difficulty", "Difficulty", tiers, (tier) => tier.difficulty));
          }
          if (skills.length) {
            tables.appendChild(paceTable(`Slowest skills (${Analytics.PACE_MIN} or more timed)`, "Skill", skills,
              (skill) => skill.skill));
          }
          if (tables.childNodes.length) block.appendChild(tables);
          return block;
        });
      if (result.untimed) {
        blocks.push(el("p", "field-note",
          `${count(result.untimed, "earlier answer")} without a time (from before timing began) ${result.untimed === 1 ? "is" : "are"} left out.`));
      }
      pacing.body.replaceChildren(...blocks);
    }

    async function loadExpected() {
      const keys = [...new Set(model.attempts
        .filter((attempt) => attempt.source === "template" && Number(attempt.timeMs) > 0)
        .map((attempt) => attempt.sectionKey))].filter(practice.usesTemplates);
      pacing.expectedButton.disabled = true;
      ctx.setStatus(pacing.status, "Loading the question templates…", "loading");
      try {
        await Promise.all(keys.map((key) => ctx.sectionTemplates(key)));
        ctx.setStatus(pacing.status, "");
      } catch (error) {
        ctx.setStatus(pacing.status, `${error.message} Refresh the page and try again.`, "error");
      }
      pacing.expectedButton.disabled = false;
      if (model) renderPacing();
    }

    /* ------------------------------------------------------------ history */

    function populateHistorySections() {
      const present = [...new Set(model.trend.map((point) => point.sectionKey).filter(Boolean))];
      const previous = history.select.value;
      const options = [["all", "All sections"]].concat(model.sections
        .filter((section) => present.includes(section.key))
        .map((section) => [section.key, section.shortLabel]));
      history.select.replaceChildren(...options.map(([value, text]) => {
        const option = el("option", null, text);
        option.value = value;
        return option;
      }));
      history.select.value = options.some(([value]) => value === previous) ? previous : "all";
      history.controls.classList.toggle("hidden", options.length < 3);
    }

    function historyPoints() {
      const filter = history.select.value || "all";
      return model.trend.filter((point) => filter === "all" || point.sectionKey === filter);
    }

    function renderHistory() {
      const points = historyPoints();
      if (!points.length) {
        history.note.textContent = "Finished sets appear here with their accuracy" +
          (model.tiered ? ", and Hard accuracy on its own." : ".");
        history.legend.replaceChildren();
        history.chart.replaceChildren();
        history.tableWrap.replaceChildren();
        history.more.classList.add("hidden");
        return;
      }
      history.note.textContent = `${count(points.length, "finished set")}. Accuracy counts a blank as wrong and ` +
        "a correct answer after a hint as not correct." +
        (model.tiered ? " Hard accuracy covers the Hard questions in each set." : "");
      drawTrend(points);
      renderHistoryTable(points);
    }

    function renderHistoryTable(points) {
      const newest = points.slice().reverse();
      const shown = historyExpanded ? newest : newest.slice(0, HISTORY_ROWS);
      const table = el("table", "pg-table history-table");
      table.appendChild(el("caption", "sr-only", "Finished sets, newest first"));
      const head = el("thead");
      const headRow = el("tr");
      ["Finished", "Set", "Questions", "Accuracy", ...(model.tiered ? ["Hard"] : []), "Time"].forEach((text) => {
        const th = el("th", null, text);
        th.scope = "col";
        headRow.appendChild(th);
      });
      head.appendChild(headRow);
      const body = el("tbody");
      shown.forEach((point) => {
        const tr = el("tr");
        const title = el("th");
        title.scope = "row";
        title.dataset.label = "Set";
        title.appendChild(el("span", null, point.title || sectionName(point.sectionKey)));
        const kind = point.kind === "discarded" && point.discardedKind
          ? `Discarded ${(KIND_LABELS[point.discardedKind] || point.discardedKind).toLowerCase()}`
          : KIND_LABELS[point.kind] || point.kind;
        if (kind) title.appendChild(el("small", `kind-tag${point.kind === "diagnostic" ? " is-diagnostic" : ""}`, kind));
        const cell = (label, text, className) => {
          const td = el("td", className || "num", text);
          td.dataset.label = label;
          return td;
        };
        // Answers to questions seen before are left out of the set's
        // accuracy; say how many, so a Review set is not read as a blank.
        const accuracyCell = (entry) => {
          const td = cell("Accuracy", percent(entry.accuracy));
          if (entry.repeats) td.appendChild(el("small", "cell-note", `${entry.repeats} seen before, not counted`));
          return td;
        };
        tr.append(
          cell("Finished", point.finishedAt ? dayLabel(point.finishedAt) : "—", "date"),
          title,
          cell("Questions", ctx.formatNumber(point.total)),
          accuracyCell(point),
          ...(model.tiered ? [cell("Hard", point.hard.attempted ? `${percent(point.hard.accuracy)} of ${point.hard.attempted}` : "—")] : []),
          cell("Time", point.timeMs ? ctx.formatDuration(point.timeMs) : "—"),
        );
        body.appendChild(tr);
      });
      table.append(head, body);
      history.tableWrap.replaceChildren(table);
      history.more.textContent = historyExpanded ? "Show the latest only" : `Show all ${points.length} sets`;
      history.more.classList.toggle("hidden", newest.length <= HISTORY_ROWS);
    }

    // The trend chart: one point per set, oldest left. Hard accuracy is the
    // story (accent, circles); overall accuracy is context (grey, squares),
    // so neither series relies on color alone. Built from SVG elements with
    // DOM APIs, sized to its box so text stays readable on a phone.
    let chartWidth = 0;
    function drawTrend(all) {
      let points = all.slice(-TREND_POINTS);
      history.legend.replaceChildren();
      history.chart.replaceChildren();
      if (points.length < 2) {
        history.chart.appendChild(el("p", "muted", "The trend chart appears after your second finished set."));
        return;
      }
      // Hard is plotted only where difficulty labels can be trusted.
      [["hard", "Hard accuracy"], ["all", "Accuracy, all questions"]].filter(([key]) => model.tiered || key !== "hard").forEach(([key, text]) => {
        const item = el("li", `legend-${key}`);
        const swatch = el("span", "legend-key");
        swatch.setAttribute("aria-hidden", "true");
        item.append(swatch, text);
        history.legend.appendChild(item);
      });

      const width = Math.max(280, Math.round(history.chart.clientWidth || 600));
      chartWidth = width;
      const narrow = width < 480;
      if (narrow && points.length > TREND_POINTS_NARROW) points = points.slice(-TREND_POINTS_NARROW);
      const height = narrow ? 190 : 220;
      const margin = { top: 12, right: narrow ? 64 : 80, bottom: 30, left: 44 };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;
      const x = (index) => margin.left + (points.length === 1 ? plotWidth / 2 : (index * plotWidth) / (points.length - 1));
      const y = (value) => margin.top + (1 - value) * plotHeight;

      const chart = svg("svg", { viewBox: `0 0 ${width} ${height}`, width: String(width), height: String(height), class: "trend-svg" });
      chart.setAttribute("role", "img");
      const hardPoints = points.filter((point) => point.hard.attempted);
      const first = points[0];
      const last = points[points.length - 1];
      chart.setAttribute("aria-label",
        `Accuracy over your last ${points.length} sets: ${percent(first.accuracy)} in the first, ${percent(last.accuracy)} in the latest.` +
        (model.tiered ? (hardPoints.length
          ? ` Hard accuracy: ${percent(hardPoints[0].hard.accuracy)} in the first set with Hard questions, ${percent(hardPoints[hardPoints.length - 1].hard.accuracy)} in the latest.`
          : " No Hard questions in these sets.") : "") +
        " The table below lists every set.");

      [0, 0.5, 1].forEach((value) => {
        chart.appendChild(svg("line", { class: "trend-grid", x1: margin.left, x2: width - margin.right, y1: y(value), y2: y(value) }));
        const label = svg("text", { class: "trend-axis", x: margin.left - 8, y: y(value), "text-anchor": "end", "dominant-baseline": "middle" });
        label.textContent = `${value * 100}%`;
        chart.appendChild(label);
      });
      [[0, "start"], [points.length - 1, "end"]].forEach(([index, anchor]) => {
        const label = svg("text", { class: "trend-axis", x: x(index), y: height - 8, "text-anchor": anchor });
        label.textContent = dayLabel(points[index].finishedAt || Date.now());
        chart.appendChild(label);
      });

      const series = [
        { key: "all", list: points.map((point, index) => ({ point, index, value: point.accuracy })).filter((entry) => entry.value !== null) },
        { key: "hard", list: points.map((point, index) => ({ point, index, value: model.tiered && point.hard.attempted ? point.hard.accuracy : null }))
          .filter((entry) => entry.value !== null) },
      ];
      series.forEach(({ key, list }) => {
        if (list.length > 1) {
          chart.appendChild(svg("polyline", {
            class: `trend-line trend-${key}`,
            points: list.map((entry) => `${x(entry.index)},${y(entry.value)}`).join(" "),
          }));
        }
        list.forEach((entry) => {
          const group = svg("g", { class: `trend-point trend-${key}` });
          const title = svg("title");
          title.textContent = `${entry.point.title || sectionName(entry.point.sectionKey)}, ` +
            `${entry.point.finishedAt ? dayLabel(entry.point.finishedAt) : ""}: ${percent(entry.point.accuracy)} correct` +
            (model.tiered && entry.point.hard.attempted ? `; Hard ${percent(entry.point.hard.accuracy)} of ${entry.point.hard.attempted}` : "");
          group.appendChild(title);
          group.appendChild(svg("circle", { class: "trend-hit", cx: x(entry.index), cy: y(entry.value), r: 11 }));
          group.appendChild(key === "hard"
            ? svg("circle", { class: "trend-mark", cx: x(entry.index), cy: y(entry.value), r: 4.5 })
            : svg("rect", { class: "trend-mark", x: x(entry.index) - 4, y: y(entry.value) - 4, width: 8, height: 8 }));
          chart.appendChild(group);
        });
      });

      // End labels name each series where it stops, unless they would
      // collide; the legend names them either way.
      const ends = series.map(({ key, list }) => list.length && { key, entry: list[list.length - 1] }).filter(Boolean);
      const apart = ends.length < 2 || Math.abs(y(ends[0].entry.value) - y(ends[1].entry.value)) >= 16;
      if (apart) {
        ends.forEach(({ key, entry }) => {
          const label = svg("text", { class: "trend-end", x: x(entry.index) + 10, y: y(entry.value), "dominant-baseline": "middle" });
          label.textContent = `${key === "hard" ? "Hard" : "All"} ${percent(entry.value)}`;
          chart.appendChild(label);
        });
      }
      history.chart.appendChild(chart);
    }

    // Redraw at the new width, so the chart's text never scales down.
    if (window.ResizeObserver) {
      let pending = null;
      new window.ResizeObserver(() => {
        if (!model || elements.view.classList.contains("hidden")) return;
        const width = Math.round(history.chart.clientWidth);
        if (!width || Math.abs(width - chartWidth) < 8) return;
        window.cancelAnimationFrame(pending);
        pending = window.requestAnimationFrame(() => {
          const points = historyPoints();
          if (points.length) drawTrend(points);
        });
      }).observe(history.chart);
    }

    /* ---------------------------------------------------- save and restore */

    function download() {
      ctx.store.refresh();
      const progress = ctx.store.get();
      const file = ProgressIO.exportFile(progress, Date.now());
      const url = URL.createObjectURL(new Blob([file.text], { type: "application/json" }));
      const link = el("a", "hidden");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      ctx.setStatus(data.status, `Saved ${file.name}: ${count(progress.attempts.length, "answer")} and ` +
        `${count(progress.sessions.length, "finished set")}, SAT and ACT.`, "success");
    }

    let replaceArmed = false;
    let replaceTimer = null;

    function closePanel() {
      replaceArmed = false;
      window.clearTimeout(replaceTimer);
      data.panel.replaceChildren();
      data.panel.classList.add("hidden");
    }

    function describeFile(info) {
      const parts = [`It holds ${count(info.attempts, "answer")}`];
      const tests = ["SAT", "ACT"].filter((test) => info.tests[test]).map((test) => `${ctx.formatNumber(info.tests[test])} ${test}`);
      if (tests.length) parts[0] += ` (${tests.join(", ")})`;
      parts.push(` and ${count(info.sessions, "finished set")}`);
      if (info.firstAt && info.lastAt) parts.push(`, from ${dayLabel(info.firstAt)} to ${dayLabel(info.lastAt)}`);
      let text = `${parts.join("")}.`;
      if (info.exportedAt) text += ` Saved ${dayLabel(Date.parse(info.exportedAt))}.`;
      if (info.migrated) text += " It is an older record and was brought up to date.";
      const dropped = info.dropped.attempts + info.dropped.sessions + info.dropped.errorLog + info.dropped.plan;
      if (dropped) text += ` ${count(dropped, "entry", "entries")} could not be read and will be left out.`;
      return text;
    }

    function showPanel(fileName, result) {
      closePanel();
      const current = ctx.store.get();
      const heading = el("h3", null, `Restore ${fileName}?`);
      const about = el("p", null, describeFile(result.info));
      const choice = el("p", "muted",
        `Merge adds what is new to the ${count(current.attempts.length, "answer")} saved here and keeps them. ` +
        "Replace discards what is saved here and uses the file instead.");
      const buttons = el("div", "data-actions");
      const merge = el("button", "button primary", "Merge into my progress");
      const replace = el("button", "button danger", "Replace my progress");
      const cancel = el("button", "button secondary", "Cancel");
      [merge, replace, cancel].forEach((button) => {
        button.type = "button";
      });
      merge.addEventListener("click", () => {
        let outcome = null;
        const saved = ctx.update((progress) => {
          outcome = ProgressIO.mergeImport(progress, result.progress);
          return outcome.progress;
        });
        closePanel();
        const { added, over } = outcome;
        ctx.setStatus(data.status, saved.ok
          ? `Merged: ${count(added.attempts, "new answer")} and ${count(added.sessions, "new set")}.` +
            (over ? ` This browser keeps the newest ${ctx.formatNumber(Progress.LIMITS.attempts)} answers, so the oldest ${ctx.formatNumber(over)} were left out.` : "")
          : "The file was read, but this browser could not save it.", saved.ok ? "success" : "error");
        data.restore.focus();
      });
      replace.addEventListener("click", () => {
        if (!replaceArmed) {
          replaceArmed = true;
          replace.classList.add("is-armed");
          replace.textContent = "Click again to replace";
          replaceTimer = window.setTimeout(() => {
            replaceArmed = false;
            replace.classList.remove("is-armed");
            replace.textContent = "Replace my progress";
          }, 5000);
          return;
        }
        const saved = ctx.update(() => ProgressIO.replaceWith(result.progress, Progress.newId("e")));
        closePanel();
        ctx.setStatus(data.status, saved.ok
          ? `Replaced: this browser now holds the file's ${count(result.info.attempts, "answer")}.`
          : "The file was read, but this browser could not save it.", saved.ok ? "success" : "error");
        data.restore.focus();
      });
      cancel.addEventListener("click", () => {
        closePanel();
        ctx.setStatus(data.status, "Nothing was restored.");
        data.restore.focus();
      });
      buttons.append(merge, replace, cancel);
      data.panel.append(heading, about, choice, buttons);
      data.panel.classList.remove("hidden");
      merge.focus();
    }

    async function readFile() {
      const file = data.input.files && data.input.files[0];
      data.input.value = "";
      if (!file) return;
      closePanel();
      if (file.size > ProgressIO.MAX_CHARS) {
        ctx.setStatus(data.status, "The file is too large to be a Liminal progress file.", "error");
        return;
      }
      ctx.setStatus(data.status, `Reading ${file.name}…`, "loading");
      let text;
      try {
        text = await file.text();
      } catch (error) {
        ctx.setStatus(data.status, "The file could not be read.", "error");
        return;
      }
      const result = ProgressIO.parseImport(text, { epoch: Progress.newId("e") });
      if (!result.ok) {
        ctx.setStatus(data.status, result.error, "error");
        return;
      }
      ctx.setStatus(data.status, "");
      showPanel(file.name, result);
    }

    /* ------------------------------------------------------------- clear */

    let clearArmed = false;
    let clearTimer = null;

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
        ctx.setStatus(data.status, "Download your progress first if you may want it back.");
        clearTimer = window.setTimeout(() => {
          resetClearButton();
          ctx.setStatus(data.status, "");
        }, 5000);
        return;
      }
      closePanel();
      const result = ctx.clearProgress();
      resetClearButton();
      ctx.setStatus(data.status, result.ok
        ? "All saved progress was cleared."
        : "This browser could not clear all saved progress. Try again when storage is available.",
        result.ok ? "success" : "error");
    }

    /* ------------------------------------------------------------- events */

    elements.masterySection.addEventListener("change", () => model && renderMap());
    elements.masterySort.addEventListener("change", () => model && renderMap());
    history.select.addEventListener("change", () => {
      historyExpanded = false;
      if (model) renderHistory();
    });
    history.more.addEventListener("click", () => {
      historyExpanded = !historyExpanded;
      renderHistoryTable(historyPoints());
    });
    plan.form.addEventListener("submit", savePlan);
    official.form.addEventListener("submit", addOfficial);
    checks.form.addEventListener("submit", addCheck);
    weekly.copy.addEventListener("click", copySummary);
    weekly.print.addEventListener("click", printReport);
    pacing.expectedButton.addEventListener("click", loadExpected);
    data.download.addEventListener("click", download);
    data.restore.addEventListener("click", () => data.input.click());
    data.input.addEventListener("change", readFile);
    elements.clearProgress.addEventListener("click", clearProgress);
    let closedForPrint = [];
    window.addEventListener("beforeprint", () => {
      printingMap = true;
      closedForPrint = [...masteryCard.querySelectorAll("details:not([open])")];
      closedForPrint.forEach((details) => { details.open = true; });
    });
    window.addEventListener("afterprint", () => {
      closedForPrint.forEach((details) => { details.open = false; });
      closedForPrint = [];
      window.setTimeout(() => { printingMap = false; }, 0);
    });

    return {
      name: "dashboard",
      hash: "progress",
      element: elements.view,
      open: (options, params) => render(options, params),
      onTestChange(current) {
        if (current) render({ focus: false });
      },
      onProgressChange(current) {
        if (current) render({ focus: false });
      },
    };
  }

  window.LiminalViews = window.LiminalViews || {};
  window.LiminalViews.progress = create;
})();
