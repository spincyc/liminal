(function () {
  "use strict";

  // The Progress view: what to study next, told honestly. From the top: the
  // "Start here" diagnostic, the plan (test date, weekly goal, next focus),
  // official scores beside recent accuracy (SAT), the stat cards, the skill map with its practice states, pacing, the
  // history of finished sets with a trend chart, and saving, restoring, or
  // clearing the record. Every number comes from LiminalProgress.stats, the
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
    const { Progress, practice } = ctx;
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

    // Sections a skill map can describe: scored ones (the essay is not).
    function mapSections(test) {
      return ctx.testSections(test).filter((section) =>
        (section.responseTypes || []).some((type) => type !== "essay"));
    }

    function studyLinks(row) {
      const cell = el("span", "row-links");
      const learn = practice.learnHref({ sectionKey: row.sectionKey, domain: row.domain, skill: row.skill });
      if (learn) {
        const link = el("a", null, "Learn");
        link.href = learn;
        link.setAttribute("aria-label", `Learn: ${row.skill}`);
        cell.appendChild(link);
      }
      if (ctx.sectionByKey(row.sectionKey)) {
        const link = el("a", null, "Practice");
        link.href = practice.practiceHash(row.sectionKey, row.skill);
        link.setAttribute("aria-label", `Practice ${row.skill}`);
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

    elements.view.querySelector(".page-head").after(loadStatus, start.card, plan.card, official.card);
    masteryCard.after(pacing.card, history.card);
    elements.clearNote.after(data.note);
    dangerZone.classList.add("data-zone");
    dangerZone.append(data.actions, data.panel, data.status);
    elements.masteryHeading.textContent = "Skill map";
    elements.masterySort.replaceChildren(...[["need", "What to study next"], ["domain", "Domain"]].map(([value, text]) => {
      const option = el("option", null, text);
      option.value = value;
      return option;
    }));

    /* ---------------------------------------------------------- the model */

    let renderId = 0;
    let model = null;
    let historyExpanded = false;

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
        return question
          ? { ...attempt, domain: question.domain, skill: question.skill, difficulty: attempt.difficulty || question.difficulty }
          : attempt;
      });
    }

    function sessionTest(session) {
      return Progress.testOf(session.sectionKey || (session.sections || [])[0]);
    }

    function buildModel(test, progress, attempts) {
      const sections = mapSections(test);
      const rows = Analytics.skillMap(attempts, sections);
      const trend = Analytics.sessionTrend(progress.sessions, attempts, (session) => sessionTest(session) === test);
      return {
        test,
        progress,
        attempts,
        sections,
        summary: Progress.stats(attempts),
        rows,
        trend,
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

    async function render(options) {
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
      renderOfficial();
      populateMapSections();
      renderMap();
      renderPacing();
      populateHistorySections();
      renderHistory();
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

    function renderStats() {
      const { summary, rows, progress, test } = model;
      const hard = summary.byDifficulty.Hard;
      const missed = Progress.missedIds(progress, { test }).length;
      const marked = Progress.markedIds(progress, { test }).length;
      const states = Analytics.stateCounts(rows);
      elements.stats.replaceChildren(
        card("Questions answered", ctx.formatNumber(summary.attempted),
          summary.unanswered ? `${summary.unanswered} left blank, counted wrong` : ""),
        card("Overall accuracy", percent(summary.accuracy), ""),
        // Hard accuracy stands alone: overall accuracy on a mostly Easy and
        // Medium mix is what makes practice look better than the real test.
        card("Hard accuracy", percent(hard.accuracy),
          hard.attempted ? `${count(hard.attempted, "Hard question")} counted` : "No Hard questions yet"),
        card("Skills at the gate", `${states["at-gate"] + states.mastered} / ${rows.length}`,
          `${states.mastered} mastered`),
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
      start.intro.textContent = (fresh.length
        ? `A ${size}-question diagnostic shows where you stand before you practise, and fills your skill map so this page can say what to study first. `
        : `Take a ${size}-question diagnostic again at any time to see where your skills stand now. `) +
        "It mixes Medium and Hard questions across all four domains in the real test's proportions. " +
        "There is no timer, though each question is timed for your pacing; answers and explanations come at the end.";
      start.list.replaceChildren(...sections.map((section) => {
        const item = el("div", "start-item");
        const text = el("div", "start-text");
        text.appendChild(el("strong", null, `${section.test} ${section.shortLabel}`));
        const last = model.trend.filter((point) => point.kind === "diagnostic" && point.sectionKey === section.key).pop();
        let detail;
        if (last) {
          detail = `Last diagnostic ${dayLabel(last.finishedAt)}: ${percent(last.accuracy)} correct` +
            (last.hard.attempted ? `, Hard ${percent(last.hard.accuracy)}.` : ".");
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
      const name = `${section.test} ${section.shortLabel}`;
      button.disabled = true;
      ctx.setStatus(start.status, `Preparing the ${name} diagnostic…`, "loading");
      let templates;
      try {
        templates = await ctx.sectionTemplates(section.key);
      } catch (error) {
        button.disabled = false;
        ctx.setStatus(start.status, `${error.message} Refresh the page and try again.`, "error");
        return;
      }
      const chosen = Analytics.chooseDiagnostic(templates, {
        weights: practice.domainWeights(section),
        recency: practice.recencyFor(Progress.historyFor(ctx.store.get(), section.key), templates),
        seed: practice.newRunSeed(),
      });
      button.disabled = false;
      if (!chosen.templates.length) {
        ctx.setStatus(start.status, "No Medium or Hard templates are available for this section.", "error");
        return;
      }
      const run = ctx.buildRun({ sectionKey: section.key, count: chosen.templates.length, templates: chosen.templates });
      ctx.setStatus(start.status, "");
      try {
        ctx.launch({
          title: `${name} diagnostic`,
          sectionKey: section.key,
          kind: "diagnostic",
          questions: Analytics.orderByTier(run.questions),
          runCode: run.code,
          setCode: run.setCode,
          feedback: "end",
          timeLimitSeconds: null,
        });
      } catch (error) {
        ctx.setStatus(start.status, error.message, "error");
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
      const saved = model.progress.plan || {};
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

      // The goal is about practice, so every test's answers count toward it.
      const done = Analytics.weekCount(model.progress.attempts);
      plan.week.replaceChildren(el("h3", null, "This week"));
      if (goal) {
        plan.week.appendChild(meter(done / goal, `${ctx.formatNumber(done)} of ${ctx.formatNumber(goal)}`));
        plan.week.appendChild(el("p", "muted", done >= goal
          ? "Goal met for this week. Weeks start on Monday."
          : `${ctx.formatNumber(goal - done)} to go. Weeks start on Monday; blanks do not count.`));
      } else {
        plan.week.appendChild(el("p", "muted",
          `${count(done, "question")} answered since Monday. Set a weekly goal to track it.`));
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
        plan.score.append("For a score, take an ", link, " and add it under Official scores. Liminal reports " +
          "accuracy only and never estimates a score: its questions are not calibrated against real test results.");
      }
    }

    function renderFocus() {
      const keys = model.sections.filter((section) => !section.optional).map((section) => section.key);
      const focus = Analytics.nextFocus(model.rows, { sectionKeys: keys });
      plan.focus.replaceChildren(el("h3", null, "Next focus"));
      if (!focus) {
        plan.focus.appendChild(el("p", "muted", "Answer a few questions and your next focus appears here."));
        return;
      }
      const { row } = focus;
      const line = el("p");
      line.appendChild(el("strong", null, row.skill));
      line.append(` (${sectionName(row.sectionKey)}, ${row.domain}). `);
      let reason;
      if (focus.reason === "weakest") {
        reason = `Your weakest skill with enough answers: ${percent(row.accuracy)} correct over ${count(row.attempted, "answer")}` +
          (row.gate.attempted
            ? `, ${row.gate.correct} of your last ${row.gate.attempted} Medium. `
            : ". ") +
          `The gate is ${Analytics.GATE.correct} of your last ${Analytics.GATE.window} Medium questions.`;
      } else if (!row.attempted) {
        reason = "Your least practised skill: not started yet.";
      } else {
        reason = `Your least practised skill: ${count(row.attempted, "answer")} so far.`;
      }
      line.append(reason);
      plan.focus.append(line, studyLinks(row));
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
      }));
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
      const note = el("small", "cell-note", gate.attempted >= gate.window
        ? `needs ${gate.needed}`
        : `${gate.attempted} of ${gate.window} so far`);
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

    function skillRow(row, showDomain) {
      const tr = el("tr");
      const skill = el("td", "skill-name");
      skill.appendChild(el("span", null, row.skill));
      if (showDomain) skill.appendChild(el("small", "cell-note", `${ctx.sectionLabel(row.sectionKey)} · ${row.domain}`));
      const answered = el("td", "num", ctx.formatNumber(row.attempted));
      answered.dataset.label = "Answered";
      if (row.hintedCorrect) answered.appendChild(el("small", "cell-note", `${row.hintedCorrect} after a hint`));
      const cells = [
        skill,
        answered,
        ["Medium", tierCell(row.medium)],
        ["Hard", tierCell(row.hard)],
        [`Gate: last ${Analytics.GATE.window} Medium`, gateCell(row), "gate-cell-wrap"],
        [null, stateBadge(row.state), "state-cell"],
        [null, studyLinks(row), "study-cell"],
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
      elements.masteryNote.textContent =
        `States are practice guidance, not a score. The gate: at least ${GATE.correct} correct of your last ` +
        `${GATE.window} Medium questions in a skill. Mastered: the gate, plus at least ${HARD_BAR.correct} ` +
        `correct of your last ${HARD_BAR.window} Hard questions. Each question counts once, at its first answer. ` +
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
      elements.skillTableWrap.replaceChildren(table);
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
      return table;
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
        history.note.textContent = "Finished sets appear here with their accuracy, and Hard accuracy on its own.";
        history.legend.replaceChildren();
        history.chart.replaceChildren();
        history.tableWrap.replaceChildren();
        history.more.classList.add("hidden");
        return;
      }
      history.note.textContent = `${count(points.length, "finished set")}. Accuracy counts a blank as wrong and ` +
        "a correct answer after a hint as not correct; Hard accuracy covers the Hard questions in each set.";
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
      ["Finished", "Set", "Questions", "Accuracy", "Hard", "Time"].forEach((text) => {
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
        const kind = KIND_LABELS[point.kind] || point.kind;
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
          cell("Hard", point.hard.attempted ? `${percent(point.hard.accuracy)} of ${point.hard.attempted}` : "—"),
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
      [["hard", "Hard accuracy"], ["all", "Accuracy, all questions"]].forEach(([key, text]) => {
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
        (hardPoints.length
          ? ` Hard accuracy: ${percent(hardPoints[0].hard.accuracy)} in the first set with Hard questions, ${percent(hardPoints[hardPoints.length - 1].hard.accuracy)} in the latest.`
          : " No Hard questions in these sets.") +
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
        { key: "hard", list: points.map((point, index) => ({ point, index, value: point.hard.attempted ? point.hard.accuracy : null }))
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
            (entry.point.hard.attempted ? `; Hard ${percent(entry.point.hard.accuracy)} of ${entry.point.hard.attempted}` : "");
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
      ctx.clearProgress();
      resetClearButton();
      ctx.setStatus(data.status, "All saved progress was cleared.", "success");
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
    pacing.expectedButton.addEventListener("click", loadExpected);
    data.download.addEventListener("click", download);
    data.restore.addEventListener("click", () => data.input.click());
    data.input.addEventListener("change", readFile);
    elements.clearProgress.addEventListener("click", clearProgress);

    return {
      name: "dashboard",
      hash: "progress",
      element: elements.view,
      open: (options) => render(options),
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
