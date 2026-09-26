(function () {
  "use strict";

  // The Review view, where mistakes become practice, for the current test:
  //   Due     misses on a spaced schedule (lib/review-queue.js), practised in
  //           one set: the same question the next day, then fresh versions
  //           of its template at 3, 7, and 21 days.
  //   Missed  the error log: every missed answer with the student's answer,
  //           date, time, and hint use, a reason and a rule the student
  //           writes (Progress.tagError), filters, and a retry or a fresh
  //           version of each.
  //   Marked  questions marked for review, to practise or unmark.
  // Lists are labelled from the attempts and the built template registries
  // (which carry each template's current tier, skill, and version), so
  // opening Review loads no template bundle or bank. A question is rebuilt
  // only when the student opens it or practises it, and long lists show a
  // page at a time.
  //
  // Interface: window.LiminalViews.review(ctx) returns the view object
  // described at the top of app/app.js. Hash: #review, or #review/due,
  // #review/missed, #review/marked to open a list.

  const PAGE_SIZE = 20;
  // A due set's size, and the most a "practise these" set from the error
  // log takes (newest first).
  const DUE_SET_LIMIT = 20;
  const MISSED_SET_LIMIT = 30;
  const RULE_MAX_LENGTH = 200;
  const REASONS = [
    { key: "content", label: "Content", hint: "I didn't know the rule, fact, or concept." },
    { key: "process", label: "Process", hint: "I knew it but set it up or applied it wrong." },
    { key: "careless", label: "Careless", hint: "A slip; I'd get it right if I did it again." },
    { key: "time", label: "Time", hint: "I ran out of time or rushed it." },
  ];
  const LIST_LABELS = { due: "Due", missed: "Missed", flagged: "Marked" };
  const HASH_LISTS = { due: "due", missed: "missed", marked: "flagged", flagged: "flagged" };
  const DEFAULT_LETTERS = ["A", "B", "C", "D", "E"];

  function create(ctx) {
    const { Progress, practice, core } = ctx;
    const Render = ctx.render;
    const Queue = window.LiminalReviewQueue;
    const byId = (id) => document.getElementById(id);
    const elements = {
      view: byId("reviewView"),
      missedTab: byId("missedTab"),
      flaggedTab: byId("flaggedTab"),
      list: byId("reviewList"),
    };

    /* ------------------------------------------------------------ helpers */

    // A small element builder: props set attributes, except className,
    // text (textContent), value, and on<event> listeners.
    function h(tag, props, children) {
      const node = document.createElement(tag);
      Object.entries(props || {}).forEach(([name, value]) => {
        if (value === undefined || value === null || value === false) return;
        if (name === "className") node.className = value;
        else if (name === "text") node.textContent = String(value);
        else if (name === "value") node.value = value;
        else if (name.startsWith("on")) node.addEventListener(name.slice(2), value);
        else node.setAttribute(name, value === true ? "" : String(value));
      });
      (children || []).forEach((child) => {
        if (child !== null && child !== undefined && child !== false) node.append(child);
      });
      return node;
    }

    let idCounter = 0;
    const uniqueId = (prefix) => `${prefix}-${++idCounter}`;

    function isMathSection(sectionKey) {
      return sectionKey === "sat-math" || sectionKey === "act-mathematics";
    }

    function mathOptions(sectionKey) {
      return isMathSection(sectionKey) ? { math: true } : {};
    }

    // Inline text with math typeset in Math sections.
    function inlineText(tag, sectionKey, text, props) {
      const node = h(tag, props || {});
      if (isMathSection(sectionKey) && Render && Render.appendMath) Render.appendMath(node, String(text));
      else node.textContent = String(text);
      return node;
    }

    function formatDate(ms) {
      return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }

    function formatDay(day) {
      const today = model ? model.schedule.today : Queue.dayOf(Date.now());
      if (day === today) return "today";
      if (day === today + 1) return "tomorrow";
      return new Date(Queue.startOfDay(day)).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    function plural(count, one, many) {
      return `${ctx.formatNumber(count)} ${count === 1 ? one : many || `${one}s`}`;
    }

    function message(title, body) {
      const box = h("div", { className: "card empty-state" }, [h("strong", { text: title })]);
      if (body) box.appendChild(h("p", { text: body }));
      return box;
    }

    function practiceLink() {
      return h("a", { className: "button primary", href: "#practice", text: "Build a practice set" });
    }

    /* -------------------------------------------------------------- state */

    let activeList = "due";
    let model = null;
    // A change this view made (a tag, noted scenes) patches the page in
    // place; any other progress change redraws it.
    let ownChange = false;
    // After unmarking, focus returns to the list's tab once it redraws.
    let focusTabAfterDraw = false;
    let feedbackAtEnd = false;
    const pages = { due: 1, missed: 1, flagged: 1 };
    const filters = { reason: "all", sectionKey: "", skill: "" };
    // Cards whose question is open (by card key), kept across redraws.
    const openCards = new Set();
    // Rebuilt questions by id (promises), so reopening one is instant.
    const questionCache = new Map();
    // What a redraw rebuilds in place after a tag: the error log's summary.
    let missedSummaryHost = null;

    function currentInfo() {
      const registries = {};
      Progress.TEMPLATE_SECTIONS.forEach((sectionKey) => {
        registries[sectionKey] = ctx.registry(sectionKey);
      });
      return Progress.registryTemplateInfo(registries);
    }

    function buildModel() {
      const test = ctx.currentTest();
      const progress = ctx.store.get();
      const info = currentInfo();
      const attempts = Progress.withCurrentTemplates(Progress.attemptsFor(progress, { test }), info);
      const live = (entry) => entry.source !== "template" ||
        Boolean((info[entry.sectionKey] || {})[entry.templateId]);
      const entries = Queue.build(attempts);
      const latest = new Map();
      attempts.forEach((attempt) => {
        if (attempt.correct === true || attempt.correct === false) latest.set(attempt.questionId, attempt);
      });
      return {
        test,
        info,
        errorLog: progress.errorLog || {},
        latest,
        entries,
        schedule: Queue.summarize(entries, Date.now(), { skip: (entry) => !live(entry) }),
        missed: Queue.missedAttempts(attempts),
        marked: Progress.markedIds(progress, { test }),
      };
    }

    // A template still in its registry, so it can be rebuilt or drawn again.
    function templateLive(sectionKey, templateId) {
      return Boolean(templateId && (model.info[sectionKey] || {})[templateId]);
    }

    // Section, taxonomy, and tier for a question id with no attempt at hand.
    function labelsForId(questionId) {
      const attempt = model.latest.get(questionId);
      if (attempt) return attempt;
      const parsed = Progress.parseQuestionId(questionId);
      const sectionKey = parsed ? parsed.sectionKey : Progress.sectionOfId(questionId);
      const info = parsed ? (model.info[sectionKey] || {})[parsed.templateId] : null;
      return Object.assign({ sectionKey, questionId }, info || {});
    }

    function titleText(item) {
      const skill = item.skill || "Question";
      return `${ctx.sectionLabel(item.sectionKey)} · ${skill}${item.subskill ? ` — ${item.subskill}` : ""}`;
    }

    // "Learn: <skill> — <subskill>", or a bare "Learn" (named in full for
    // screen readers) where a list repeats it on every row.
    function learnLink(item, short) {
      const href = practice.learnHref(item);
      if (!href) return null;
      const name = `Learn: ${item.skill}${item.subskill ? ` — ${item.subskill}` : ""}`;
      return h("a", { href, text: short ? "Learn" : name, "aria-label": short ? name : null });
    }

    /* -------------------------------------------------------------- tabs */

    const dueTab = h("button", {
      id: "reviewDueTab",
      className: "segmented-option",
      type: "button",
      role: "tab",
      "aria-controls": "reviewList",
      "aria-selected": "false",
      tabindex: "-1",
    });
    dueTab.dataset.list = "due";
    elements.missedTab.before(dueTab);
    const tabs = [dueTab, elements.missedTab, elements.flaggedTab];

    function tabFor(list) {
      return tabs.find((button) => button.dataset.list === list);
    }

    function renderTabs() {
      const counts = {
        due: model.schedule.due.length,
        missed: model.missed.length,
        flagged: model.marked.length,
      };
      tabs.forEach((button) => {
        const list = button.dataset.list;
        const selected = list === activeList;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (selected) elements.list.setAttribute("aria-labelledby", button.id);
        button.replaceChildren(LIST_LABELS[list], h("span", { className: "tab-count", text: `(${counts[list]})` }));
      });
    }

    /* ------------------------------------------------------------ drawing */

    function focusedKey() {
      const active = document.activeElement;
      return active && elements.list.contains(active) ? active.dataset.focusKey || null : null;
    }

    function restoreFocus(key) {
      if (!key) return;
      const target = [...elements.list.querySelectorAll("[data-focus-key]")]
        .find((node) => node.dataset.focusKey === key);
      if (target) target.focus({ preventScroll: true });
    }

    function draw() {
      model = buildModel();
      renderTabs();
      const key = focusedKey();
      missedSummaryHost = null;
      const nodes = activeList === "due" ? duePanel() : activeList === "missed" ? missedPanel() : markedPanel();
      elements.list.replaceChildren(...nodes);
      restoreFocus(key);
      if (focusTabAfterDraw) {
        focusTabAfterDraw = false;
        tabFor(activeList).focus();
      }
    }

    // The first pages of `items` drawn by `card`, and a button (null when
    // everything is shown) that adds the next page: into `host` when given,
    // else just before the button.
    function paged(listName, items, card, host) {
      let shown = Math.min(items.length, pages[listName] * PAGE_SIZE);
      const nodes = items.slice(0, shown).map(card);
      if (shown >= items.length) return { nodes, more: null };
      const more = h("button", { type: "button", className: "button secondary review-more" });
      more.dataset.focusKey = `${listName}:more`;
      const label = () => {
        more.textContent = `Show ${Math.min(PAGE_SIZE, items.length - shown)} more ` +
          `(${ctx.formatNumber(shown)} of ${ctx.formatNumber(items.length)} shown)`;
      };
      label();
      more.addEventListener("click", () => {
        pages[listName] += 1;
        const end = Math.min(items.length, pages[listName] * PAGE_SIZE);
        const added = items.slice(shown, end).map(card);
        shown = end;
        if (host) host.append(...added);
        else more.before(...added);
        const first = added[0];
        const heading = first && (first.matches("[data-card-heading]") ? first : first.querySelector("[data-card-heading]"));
        if (shown >= items.length) more.remove();
        else label();
        if (heading) heading.focus();
      });
      return { nodes, more };
    }

    function statusLine() {
      return h("p", { className: "status-line", role: "status" });
    }

    /* ----------------------------------------------------- launching sets */

    // Opens a review set; returns an error message, or null when it opened.
    function launchSet(title, questions, feedback) {
      try {
        ctx.launch({
          title,
          sectionKey: questions[0].sectionKey,
          kind: "review",
          questions,
          feedback: feedback || "instant",
          timeLimitSeconds: null,
        });
        return null;
      } catch (error) {
        return `The test screen could not open: ${error.message}`;
      }
    }

    // Runs `build` (which returns the set's title, questions, and feedback)
    // with the button disabled and failures reported in `status`.
    async function startSet(button, status, build) {
      button.disabled = true;
      ctx.setStatus(status, "Building the set…");
      try {
        const set = await build();
        if (!set || !set.questions.length) {
          ctx.setStatus(status, (set && set.empty) || "No question could be built for this set.", "error");
          return;
        }
        ctx.setStatus(status, "");
        const error = launchSet(set.title, set.questions, set.feedback);
        if (error) ctx.setStatus(status, error, "error");
      } catch (error) {
        ctx.setStatus(status, `The set could not be built (${error.message}). Refresh the page and try again.`, "error");
      } finally {
        button.disabled = false;
      }
    }

    function loadQuestion(id) {
      if (!questionCache.has(id)) {
        questionCache.set(id, ctx.questionsForIds([id])
          .then((list) => list[0] || null)
          .catch((error) => {
            questionCache.delete(id);
            throw error;
          }));
      }
      return questionCache.get(id);
    }

    // Fresh draws of these templates in one section, recorded as served.
    // Draws prefer scenes the student has not seen; the scenes of the
    // questions being re-practised (`seenIds`) are noted in history first,
    // in case it lost them. Map templateId -> question.
    async function freshDraws(sectionKey, templateIds, seenIds) {
      const wanted = new Set(templateIds);
      const templates = (await ctx.sectionTemplates(sectionKey)).filter((template) => wanted.has(template.id));
      if (!templates.length) return new Map();
      const scenes = {};
      (seenIds || []).forEach((id) => {
        const question = ctx.rebuildQuestion(id);
        if (question && question.scene) scenes[question.templateId] = (scenes[question.templateId] || []).concat(question.scene);
      });
      if (Progress.noteScenes(ctx.store.get(), sectionKey, scenes) !== ctx.store.get()) {
        quietly(() => ctx.update((progress) => Progress.noteScenes(progress, sectionKey, scenes)));
      }
      const run = ctx.buildRun({ sectionKey, count: templates.length, templates });
      return new Map(run.questions.map((question) => [question.templateId, question]));
    }

    // The questions for due entries, each carrying reviewOf: exact ones
    // rebuilt, later stages drawn fresh; in the test's section order, due
    // order within a section.
    async function dueQuestions(entries) {
      const built = new Map();
      const exact = entries.filter((entry) => Queue.modeOf(entry) === "exact");
      const exactQuestions = await ctx.questionsForIds(exact.map((entry) => entry.exactId));
      const byId = new Map(exactQuestions.map((question) => [question.id, question]));
      exact.forEach((entry) => {
        const question = byId.get(entry.exactId);
        if (question) built.set(entry.questionId, { ...question, reviewOf: entry.questionId });
      });
      const freshBySection = new Map();
      entries.filter((entry) => Queue.modeOf(entry) === "fresh").forEach((entry) => {
        if (!freshBySection.has(entry.sectionKey)) freshBySection.set(entry.sectionKey, []);
        freshBySection.get(entry.sectionKey).push(entry);
      });
      for (const [sectionKey, list] of freshBySection) {
        const drawn = await freshDraws(sectionKey, list.map((entry) => entry.templateId),
          list.flatMap((entry) => [entry.questionId, entry.exactId]));
        list.forEach((entry) => {
          const question = drawn.get(entry.templateId);
          if (question) built.set(entry.questionId, { ...question, reviewOf: entry.questionId });
        });
      }
      const order = ctx.testSections(model.test).map((section) => section.key);
      return entries
        .filter((entry) => built.has(entry.questionId))
        .sort((left, right) => order.indexOf(left.sectionKey) - order.indexOf(right.sectionKey))
        .map((entry) => built.get(entry.questionId));
    }

    /* ---------------------------------------------------- question detail */

    // Where a question's passage or table is: its stimulus, or, in Reading
    // and Writing records that carry it in the stem, the stem's leading
    // paragraphs (as the test screen splits them).
    function stimulusFor(question) {
      if (question.stimulus && question.stimulus.content) return { stimulus: question.stimulus, stem: question.stem };
      if (!isMathSection(question.sectionKey) && Render.splitStemPassage) {
        const split = Render.splitStemPassage(question.stem);
        if (split.passage) return { stimulus: { type: "passage", content: split.passage }, stem: split.question };
      }
      return { stimulus: null, stem: question.stem };
    }

    // The question's number in the set it was answered in, from the
    // attempt id "<session>:<index>"; ACT letters alternate by number.
    function lettersFor(question, attempt) {
      if (question.test !== "ACT" || !attempt || !attempt.sessionId) return DEFAULT_LETTERS;
      const index = Number(String(attempt.id).slice(String(attempt.sessionId).length + 1));
      return Number.isInteger(index) && core.answerLetters ? core.answerLetters("ACT", index + 1) : DEFAULT_LETTERS;
    }

    function hasResponse(value) {
      return value !== null && value !== undefined && value !== "";
    }

    // "B", or the typed answer, or null; without the question at hand.
    function responseText(attempt) {
      if (!attempt || !hasResponse(attempt.response)) return null;
      if (typeof attempt.response === "number") {
        const letters = attempt.test === "ACT" ? lettersFor({ test: "ACT" }, attempt) : DEFAULT_LETTERS;
        return letters[attempt.response] || `choice ${attempt.response + 1}`;
      }
      return String(attempt.response);
    }

    function section(title, body) {
      return h("section", { className: "review-exp-section" }, [h("h3", { text: title }), ...body]);
    }

    function answerBlock(question, attempt) {
      const response = attempt ? attempt.response : null;
      if (question.responseType === "multiple-choice" && Array.isArray(question.choices)) {
        const letters = lettersFor(question, attempt);
        const chosen = typeof response === "number" ? response : hasResponse(response) ? Number(response) : null;
        const key = Number(question.correctAnswer);
        return h("ol", { className: "review-choices", "aria-label": "Answer choices" }, question.choices.map((choice, index) => {
          const tags = [];
          if (index === key) tags.push(h("span", { className: "review-choice-tag is-key", text: "Correct answer" }));
          if (index === chosen) tags.push(h("span", { className: "review-choice-tag is-yours", text: "Your answer" }));
          const classes = ["review-choice", index === key ? "is-key" : "", index === chosen && index !== key ? "is-wrong" : ""];
          return h("li", { className: classes.filter(Boolean).join(" ") }, [
            h("span", { className: "review-choice-letter", "aria-hidden": "true", text: letters[index] || String(index + 1) }),
            h("span", { className: "sr-only", text: `Choice ${letters[index] || index + 1}: ` }),
            inlineText("span", question.sectionKey, choice, { className: "review-choice-text" }),
            ...tags,
          ]);
        }));
      }
      return h("dl", { className: "review-numeric" }, [
        h("div", {}, [h("dt", { text: "Your answer" }), h("dd", {
          className: hasResponse(response) ? "is-wrong" : "",
          text: hasResponse(response) ? String(response) : "Not answered",
        })]),
        h("div", {}, [h("dt", { text: "Correct answer" }), h("dd", { className: "is-key", text: String(question.correctAnswer) })]),
      ]);
    }

    function explanationBlocks(question, attempt) {
      const blocks = [];
      const math = mathOptions(question.sectionKey);
      if (question.explanation) blocks.push(section("Explanation", [Render.renderText(question.explanation, math)]));
      if (Array.isArray(question.solutionSteps) && question.solutionSteps.length) {
        blocks.push(section("Steps", [h("ol", { className: "review-steps" },
          question.solutionSteps.map((step) => inlineText("li", question.sectionKey, step)))]));
      }
      const chosen = attempt && typeof attempt.response === "number" ? attempt.response : null;
      const rationale = chosen !== null && chosen !== Number(question.correctAnswer) &&
        (question.distractorRationales || []).find((item) => item.index === chosen);
      if (rationale) {
        const letter = lettersFor(question, attempt)[chosen] || String(chosen + 1);
        blocks.push(section(`Why ${letter} is wrong`, [inlineText("p", question.sectionKey, rationale.reason)]));
      }
      if (question.trap) blocks.push(section("Common trap", [inlineText("p", question.sectionKey, question.trap)]));
      return blocks;
    }

    // The question as the student saw it (rebuilt from its template or
    // bank): figure, passage, stem, the choices with their answer and the
    // correct one, and the explanation.
    function questionDetail(question, attempt) {
      const math = mathOptions(question.sectionKey);
      const parts = stimulusFor(question);
      const wrap = h("div", { className: "review-question" });
      if (attempt && attempt.updated) {
        wrap.appendChild(h("p", {
          className: "review-note",
          text: "This template was revised after you answered, so this is the question as it is built now; " +
            "your recorded answer may not match these choices.",
        }));
      }
      const figure = question.figure ? Render.renderFigure(question.figure) : null;
      if (figure) wrap.appendChild(figure);
      const stimulus = parts.stimulus
        ? Render.renderStimulus(parts.stimulus, Object.assign({ underlines: question.sectionKey === "act-english" }, math))
        : null;
      if (stimulus) wrap.appendChild(stimulus);
      wrap.appendChild(h("div", { className: "review-question-stem" }, [Render.renderText(parts.stem || "", math)]));
      wrap.appendChild(answerBlock(question, attempt));
      const explanation = explanationBlocks(question, attempt);
      if (explanation.length) wrap.appendChild(h("div", { className: "review-explanation" }, explanation));
      return wrap;
    }

    // "Show question": rebuilds the question the first time it opens.
    function questionToggle(cardKey, questionId, attempt) {
      const container = h("div", { className: "review-question-host", id: uniqueId("review-question"), hidden: true });
      const button = h("button", {
        type: "button",
        className: "text-link",
        "aria-expanded": "false",
        "aria-controls": container.id,
        text: "Show question",
      });
      button.dataset.focusKey = `${cardKey}:show`;
      let loaded = false;
      async function setOpen(open) {
        button.setAttribute("aria-expanded", String(open));
        button.textContent = open ? "Hide question" : "Show question";
        container.hidden = !open;
        if (open) openCards.add(cardKey);
        else openCards.delete(cardKey);
        if (!open || loaded) return;
        container.replaceChildren(h("p", { className: "muted", text: "Loading the question…" }));
        try {
          const question = await loadQuestion(questionId);
          loaded = true;
          container.replaceChildren(question
            ? questionDetail(question, attempt)
            : h("p", { className: "muted", text: "This question can no longer be built: its template was retired." }));
        } catch (error) {
          container.replaceChildren(h("p", {
            className: "status-line error",
            text: `The question could not be loaded (${error.message}). Refresh the page and try again.`,
          }));
        }
      }
      button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
      if (openCards.has(cardKey)) setOpen(true);
      return { button, container };
    }

    function cardHead(item, aside) {
      return h("div", { className: "review-item-head" }, [
        h("h2", { className: "review-item-title", tabindex: "-1", "data-card-heading": true, text: titleText(item) }),
        aside ? h("span", { className: "review-item-aside", text: aside }) : null,
      ]);
    }

    /* ---------------------------------------------------------------- due */

    function howItWorks() {
      const act = model.test === "ACT";
      return h("details", { className: "review-how" }, [
        h("summary", { text: "How the schedule works" }),
        h("p", {
          text: "A question you miss comes back the next day as the same question. Each time you answer it " +
            "correctly on or after its day, it waits longer: 3 days, then 7, then 21. " +
            (act
              ? "ACT questions come from fixed banks, so they come back as they were. "
              : "From the second return on you get a fresh version built the same way, with new numbers or a " +
                "new passage, so you practise the method rather than remember an answer. ") +
            "A correct answer at the 21-day return marks it learned.",
        }),
        h("p", {
          text: "A wrong answer, a blank, or needing a hint starts it over at one day. Answers in any set " +
            "count, not only here; a correct answer before the question's day changes nothing, because " +
            "recall that soon tests memory rather than the method.",
        }),
      ]);
    }

    function dueSummary() {
      const { schedule } = model;
      const status = statusLine();
      const card = h("section", { className: "card review-summary", "aria-label": "Due today" });
      const dueCount = schedule.due.length;
      card.appendChild(h("h2", {
        text: dueCount ? `${plural(dueCount, "question")} due today` : "Nothing is due today",
      }));
      const facts = [];
      if (schedule.nextDue) {
        facts.push(`Next: ${plural(schedule.nextDue.count, "question")} ${formatDay(schedule.nextDue.day)}.`);
      }
      const scheduled = schedule.due.length + schedule.upcoming.length;
      facts.push(`${plural(scheduled, "question")} in the schedule, ${ctx.formatNumber(schedule.learned.length)} learned.`);
      card.appendChild(h("p", { className: "muted", text: facts.join(" ") }));
      if (schedule.unavailable.length) {
        card.appendChild(h("p", {
          className: "field-note",
          text: `${plural(schedule.unavailable.length, "scheduled question")} can no longer be built because ` +
            "their templates were retired, so they are left out.",
        }));
      }
      if (dueCount) {
        const { picked, left } = Queue.pickSet(schedule.due, { limit: DUE_SET_LIMIT });
        const start = h("button", {
          type: "button",
          className: "button primary",
          text: `Start review (${picked.length})`,
        });
        start.dataset.focusKey = "start-due";
        start.addEventListener("click", () => startSet(start, status, async () => ({
          title: `${model.test} review: due today`,
          questions: await dueQuestions(picked),
          feedback: feedbackAtEnd ? "end" : "instant",
          empty: "None of the due questions could be built. Refresh the page and try again.",
        })));
        const check = h("input", { type: "checkbox" });
        check.checked = feedbackAtEnd;
        check.dataset.focusKey = "feedback-end";
        check.addEventListener("change", () => {
          feedbackAtEnd = check.checked;
        });
        card.appendChild(h("div", { className: "card-actions" }, [
          start,
          h("label", { className: "check-line" }, [check, " Show answers at the end, not after each question"]),
        ]));
        const notes = ["No timer."];
        if (left.length) {
          notes.push(`The other ${plural(left.length, "due question")} come in the next set: a set takes up to ` +
            `${DUE_SET_LIMIT}, one per template.`);
        }
        card.appendChild(h("p", { className: "field-note", text: notes.join(" ") }));
      }
      card.appendChild(status);
      card.appendChild(howItWorks());
      return card;
    }

    // The rules the student wrote for misses of this question (or of fresh
    // versions of it), newest first, once each.
    function rulesFor(questionId) {
      const rules = [];
      model.missed.forEach((attempt) => {
        if (Queue.rootOf(attempt) !== questionId) return;
        const rule = ((model.errorLog[attempt.id] || {}).rule || "").trim();
        if (rule && !rules.includes(rule)) rules.push(rule);
      });
      return rules;
    }

    function dueRow(entry) {
      const mode = Queue.modeOf(entry) === "fresh" ? "a fresh version" : "the same question";
      const overdue = model.schedule.today - entry.dueDay;
      const when = overdue <= 0 ? "Due today" : `Due since ${formatDay(entry.dueDay)}`;
      const facts = [
        `Return ${entry.stage} of ${Queue.INTERVALS.length}: ${mode}`,
        when,
        entry.misses > 1 ? `missed ${entry.misses} times` : null,
        entry.difficulty,
      ].filter(Boolean);
      const learn = learnLink(entry, true);
      const rules = rulesFor(entry.questionId);
      return h("li", { className: "review-due-row" }, [
        h("span", { className: "review-due-title", tabindex: "-1", "data-card-heading": true, text: titleText(entry) }),
        h("span", { className: "review-due-facts", text: facts.join(" · ") }),
        rules.length ? h("span", { className: "review-due-rule", text: `Your rule: ${rules[0]}` }) : null,
        learn,
      ].filter(Boolean));
    }

    function upcomingList() {
      const byDay = new Map();
      model.schedule.upcoming.forEach((entry) => byDay.set(entry.dueDay, (byDay.get(entry.dueDay) || 0) + 1));
      const days = [...byDay.entries()].slice(0, 7);
      return h("section", { className: "card review-upcoming", "aria-label": "Coming up" }, [
        h("h2", { text: "Coming up" }),
        h("ul", { className: "review-upcoming-list" }, days.map(([day, count]) => h("li", {}, [
          h("span", { className: "review-upcoming-day", text: formatDay(day) }),
          h("span", { text: plural(count, "question") }),
        ]))),
      ]);
    }

    function duePanel() {
      const { schedule } = model;
      const scheduled = schedule.due.length + schedule.upcoming.length + schedule.unavailable.length;
      if (!scheduled && !schedule.learned.length) {
        const box = message(`Nothing to re-practise yet in ${model.test}.`,
          "Questions you answer wrong or leave blank come back here after a day, then again after 3, 7, and 21 " +
          "days, until you get them right each time.");
        box.appendChild(practiceLink());
        return [box];
      }
      const nodes = [dueSummary()];
      if (schedule.due.length) {
        const list = h("ul", { className: "review-due-list", "aria-label": "Due questions" });
        const { nodes: rows, more } = paged("due", schedule.due, dueRow, list);
        list.append(...rows);
        nodes.push(h("section", { className: "card review-due" }, [list, more]));
      }
      if (schedule.upcoming.length) nodes.push(upcomingList());
      return nodes;
    }

    /* ------------------------------------------------------------- missed */

    function scopedMissed() {
      return Queue.filterMissed(model.missed, model.errorLog, {
        sectionKey: filters.sectionKey,
        skill: filters.skill,
      });
    }

    function sectionsIn(list) {
      const keys = new Set(list.map((attempt) => attempt.sectionKey || Progress.sectionOfId(attempt.questionId)));
      return ctx.testSections(model.test).filter((entry) => keys.has(entry.key));
    }

    function skillsIn(list) {
      const counts = new Map();
      list.forEach((attempt) => {
        if (attempt.skill) counts.set(attempt.skill, (counts.get(attempt.skill) || 0) + 1);
      });
      return [...counts.entries()].sort((left, right) => right[1] - left[1] || (left[0] < right[0] ? -1 : 1));
    }

    function redrawMissedList() {
      pages.missed = 1;
      draw();
    }

    function reasonFilterChips(counts) {
      const options = [
        { key: "all", label: "All", count: counts.total },
        { key: "untagged", label: "Untagged", count: counts.untagged },
        ...REASONS.map((reason) => ({ key: reason.key, label: reason.label, count: counts[reason.key] })),
      ];
      return h("div", { className: "chip-row review-reason-filter", role: "group", "aria-label": "Show missed answers by reason" },
        options.map((option) => {
          const chip = h("button", {
            type: "button",
            className: "chip",
            "aria-pressed": String(filters.reason === option.key),
          }, [option.label, h("span", { className: "tab-count", text: `(${ctx.formatNumber(option.count)})` })]);
          chip.dataset.focusKey = `reason-filter:${option.key}`;
          chip.addEventListener("click", () => {
            filters.reason = option.key;
            redrawMissedList();
          });
          return chip;
        }));
    }

    function selectField(label, focusKey, options, value, onChange) {
      const select = h("select", {}, options.map(([optionValue, text]) => h("option", { value: optionValue, text })));
      select.value = value;
      select.dataset.focusKey = focusKey;
      select.addEventListener("change", () => onChange(select.value));
      return h("label", { className: "field review-filter" }, [h("span", { className: "field-label", text: label }), select]);
    }

    function contentGapNotes(scoped) {
      return Queue.contentGaps(scoped, model.errorLog).slice(0, 3).map((gap) => {
        const href = practice.learnHref({ sectionKey: gap.sectionKey, domain: gap.domain, skill: gap.skill });
        const share = gap.content === gap.tagged ? `All ${gap.content}` : `${gap.content} of the ${gap.tagged}`;
        const text = `${share} tagged misses in ${gap.skill} are content errors: something to learn rather ` +
          "than a slip.";
        return h("p", { className: "notice review-gap", role: "note" }, [
          text,
          href ? " " : null,
          href ? h("a", { href, text: `Read Learn: ${gap.skill}` }) : null,
        ]);
      });
    }

    function missedSummaryContent() {
      const scoped = scopedMissed();
      const counts = Queue.reasonCounts(scoped, model.errorLog);
      const tagged = counts.total - counts.untagged;
      const sections = sectionsIn(model.missed);
      const skills = skillsIn(Queue.filterMissed(model.missed, model.errorLog, { sectionKey: filters.sectionKey }));
      const nodes = [
        h("h2", { text: "Why you missed them" }),
        h("p", {
          className: "muted",
          text: `${plural(counts.total, "missed answer")}, ${ctx.formatNumber(tagged)} tagged with a reason. ` +
            "Tag each miss, then look for the reason that keeps coming back.",
        }),
        reasonFilterChips(counts),
      ];
      const selects = [];
      if (sections.length > 1) {
        selects.push(selectField("Section", "filter-section",
          [["", "All sections"], ...sections.map((entry) => [entry.key, entry.shortLabel])],
          filters.sectionKey, (value) => {
            filters.sectionKey = value;
            filters.skill = "";
            redrawMissedList();
          }));
      }
      selects.push(selectField("Skill", "filter-skill",
        [["", "All skills"], ...skills.map(([skill, count]) => [skill, `${skill} (${count})`])],
        filters.skill, (value) => {
          filters.skill = value;
          redrawMissedList();
        }));
      nodes.push(h("div", { className: "review-filters" }, selects));
      nodes.push(...contentGapNotes(scoped));
      const rules = rulesList(scoped);
      if (rules) nodes.push(rules);
      return nodes;
    }

    // Every rule the student has written for these misses, newest first,
    // with its skill: the lessons of the error log in one place.
    function rulesList(scoped) {
      const seen = new Set();
      const items = [];
      scoped.forEach((attempt) => {
        const rule = ((model.errorLog[attempt.id] || {}).rule || "").trim();
        if (!rule || seen.has(rule.toLowerCase())) return;
        seen.add(rule.toLowerCase());
        items.push(h("li", {}, [
          h("span", { className: "review-rule-text", text: rule }),
          attempt.skill ? h("small", { className: "cell-note", text: attempt.skill }) : null,
        ].filter(Boolean)));
      });
      if (!items.length) return null;
      return h("details", { className: "review-rules" }, [
        h("summary", { text: `Your rules (${items.length})` }),
        h("ul", { className: "review-rules-list" }, items),
      ]);
    }

    function refreshMissedSummary() {
      if (!missedSummaryHost) return;
      const key = focusedKey();
      missedSummaryHost.replaceChildren(...missedSummaryContent());
      restoreFocus(key);
    }

    function stillMissedIds(list) {
      const ids = [];
      list.forEach((attempt) => {
        const latest = model.latest.get(attempt.questionId);
        if (Progress.isMiss(latest) && !ids.includes(attempt.questionId)) ids.push(attempt.questionId);
      });
      return ids;
    }

    function missedToolbar(list) {
      const ids = stillMissedIds(list);
      if (!ids.length) return null;
      const status = statusLine();
      const count = Math.min(ids.length, MISSED_SET_LIMIT);
      const start = h("button", { type: "button", className: "button primary", text: `Practise these (${count})` });
      start.dataset.focusKey = "start-missed";
      const roots = new Map();
      list.forEach((attempt) => {
        if (!roots.has(attempt.questionId)) roots.set(attempt.questionId, Queue.rootOf(attempt));
      });
      start.addEventListener("click", () => startSet(start, status, async () => {
        const wanted = ids.slice(0, MISSED_SET_LIMIT);
        // One question per template, as in every set; the rest come next time.
        const questions = practice.onePerTemplate(await ctx.questionsForIds(wanted));
        return {
          title: `${model.test} review: missed questions`,
          questions: questions.map((question) => ({ ...question, reviewOf: roots.get(question.id) || question.id })),
        };
      }));
      const note = ids.length > MISSED_SET_LIMIT
        ? `The ${MISSED_SET_LIMIT} newest questions in this list you have not since answered correctly. `
        : "The questions in this list you have not since answered correctly, one per question design. ";
      return h("div", { className: "review-toolbar" }, [
        start,
        h("p", { className: "muted", text: `${note}Feedback after each question, no timer.` }),
        status,
      ]);
    }

    // One tap tags the miss; the chosen reason stays pressed.
    function reasonPicker(attempt, labelId, onPick) {
      const current = Queue.reasonOf(model.errorLog, attempt);
      const buttons = REASONS.map((reason) => {
        const button = h("button", {
          type: "button",
          className: "chip",
          "aria-pressed": String(current === reason.key),
          title: reason.hint,
          text: reason.label,
        });
        button.dataset.focusKey = `${attempt.id}:reason:${reason.key}`;
        button.addEventListener("click", () => {
          buttons.forEach((other, index) => other.setAttribute("aria-pressed", String(REASONS[index] === reason)));
          onPick(reason.key);
        });
        return button;
      });
      return h("div", { className: "chip-row review-reasons", role: "group", "aria-labelledby": labelId }, buttons);
    }

    // Runs a progress change this view has already shown on screen.
    function quietly(change) {
      ownChange = true;
      try {
        return change();
      } finally {
        ownChange = false;
      }
    }

    function saveTag(attempt, tag) {
      return quietly(() => ctx.update((progress) => Progress.tagError(progress, attempt.id, tag)));
    }

    // The reason picker, its hint, and the rule line (once a reason is set).
    function tagBlock(attempt) {
      const tag = model.errorLog[attempt.id] || {};
      let reason = Queue.reasonOf(model.errorLog, attempt);
      const wrap = h("div", { className: "review-tag" });
      const hint = h("p", { className: "field-note review-reason-hint" });
      const ruleStatus = h("span", { className: "review-rule-status", role: "status" });
      const input = h("input", {
        type: "text",
        id: uniqueId("review-rule"),
        maxlength: String(RULE_MAX_LENGTH),
        placeholder: "e.g. Circle what the question asks before solving",
        value: tag.rule || "",
      });
      input.dataset.focusKey = `${attempt.id}:rule`;
      const save = h("button", { type: "button", className: "button secondary", text: "Save rule" });
      save.dataset.focusKey = `${attempt.id}:rule-save`;
      const ruleRow = h("div", { className: "review-rule", hidden: !reason }, [
        h("label", { className: "field-label", for: input.id, text: "Rule I'll remember (optional)" }),
        h("div", { className: "input-row" }, [input, save]),
        ruleStatus,
      ]);
      const showHint = () => {
        const chosen = REASONS.find((entry) => entry.key === reason);
        hint.textContent = chosen ? chosen.hint : "Tap the reason that fits best.";
      };
      const saveRule = () => {
        if (!reason) return;
        const rule = input.value.trim().slice(0, RULE_MAX_LENGTH);
        if (rule === ((model.errorLog[attempt.id] || {}).rule || "")) return;
        const result = saveTag(attempt, { reason, rule });
        ruleStatus.textContent = result && result.ok === false ? "Kept for this visit only." : "Saved.";
      };
      const labelId = uniqueId("review-why");
      const picker = reasonPicker(attempt, labelId, (key) => {
        reason = key;
        saveTag(attempt, { reason, rule: input.value.trim().slice(0, RULE_MAX_LENGTH) });
        ruleRow.hidden = false;
        ruleStatus.textContent = "";
        showHint();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          saveRule();
        }
      });
      input.addEventListener("input", () => {
        ruleStatus.textContent = "";
      });
      input.addEventListener("change", saveRule);
      save.addEventListener("click", saveRule);
      showHint();
      wrap.append(h("span", { className: "field-label", id: labelId, text: "Why did you miss it?" }), picker, hint, ruleRow);
      return wrap;
    }

    function scheduleStatus(attempt) {
      const entry = model.entries.get(Queue.rootOf(attempt));
      if (!entry || model.schedule.unavailable.includes(entry)) return null;
      if (entry.learned) return "Learned";
      if (entry.dueDay <= model.schedule.today) return "Re-practice due today";
      return `Next re-practice ${formatDay(entry.dueDay)}`;
    }

    function missedCard(attempt) {
      const facts = [];
      const answer = responseText(attempt);
      facts.push(answer ? `Your answer: ${answer}` : "Not answered");
      facts.push(Number.isFinite(attempt.timeMs) && attempt.timeMs !== null
        ? `Time: ${ctx.formatDuration(attempt.timeMs)}`
        : "Time not recorded");
      if (attempt.hinted) facts.push("Hint used");
      if (attempt.difficulty) facts.push(attempt.difficulty);
      const flags = [];
      if (attempt.updated) flags.push(h("span", { className: "review-flag", text: "Template revised since" }));
      if (attempt.source === "legacy-bank") flags.push(h("span", { className: "review-flag", text: "Retired question bank" }));
      const status = scheduleStatus(attempt);
      if (status) flags.push(h("span", { className: "review-flag is-schedule", text: status }));
      const card = h("article", { className: "card review-item" }, [
        cardHead(attempt, attempt.timestamp ? formatDate(attempt.timestamp) : null),
        h("p", { className: "review-facts", text: facts.join(" · ") }),
        flags.length ? h("p", { className: "review-flags" }, flags) : null,
        tagBlock(attempt),
      ]);
      const toggle = questionToggle(`missed:${attempt.id}`, attempt.questionId, attempt);
      const actionStatus = statusLine();
      const retry = h("button", { type: "button", className: "text-link", text: "Retry this" });
      retry.dataset.focusKey = `${attempt.id}:retry`;
      retry.addEventListener("click", () => startSet(retry, actionStatus, async () => {
        const question = await loadQuestion(attempt.questionId);
        return {
          title: `Retry: ${attempt.skill || "missed question"}`,
          questions: question ? [{ ...question, reviewOf: Queue.rootOf(attempt) }] : [],
          empty: "This question can no longer be built: its template was retired.",
        };
      }));
      let fresh = null;
      if (attempt.source === "template" && templateLive(attempt.sectionKey, attempt.templateId)) {
        fresh = h("button", { type: "button", className: "text-link", text: "Try a fresh version" });
        fresh.dataset.focusKey = `${attempt.id}:fresh`;
        fresh.addEventListener("click", () => startSet(fresh, actionStatus, async () => {
          const drawn = await freshDraws(attempt.sectionKey, [attempt.templateId],
            [attempt.questionId, Queue.rootOf(attempt)]);
          const question = drawn.get(attempt.templateId);
          return {
            title: `Fresh version: ${attempt.skill || "missed question"}`,
            questions: question ? [{ ...question, reviewOf: Queue.rootOf(attempt) }] : [],
            empty: "A new version could not be drawn from this template. Try again.",
          };
        }));
      }
      card.append(
        h("div", { className: "review-item-actions" }, [toggle.button, retry, fresh, learnLink(attempt)]),
        actionStatus,
        toggle.container,
      );
      return card;
    }

    function missedPanel() {
      if (!model.missed.length) {
        const box = message(`No missed ${model.test} questions.`,
          "Questions you answer wrong or leave blank are saved here with your answer, so you can see why " +
          "you missed them and try them again.");
        box.appendChild(practiceLink());
        return [box];
      }
      if (filters.sectionKey && !sectionsIn(model.missed).some((entry) => entry.key === filters.sectionKey)) {
        filters.sectionKey = "";
      }
      if (filters.skill && !Queue.filterMissed(model.missed, model.errorLog, filters.sectionKey
        ? { sectionKey: filters.sectionKey, skill: filters.skill }
        : { skill: filters.skill }).length) {
        filters.skill = "";
      }
      missedSummaryHost = h("section", { className: "card review-summary", "aria-label": "Error log summary" },
        missedSummaryContent());
      const list = Queue.filterMissed(model.missed, model.errorLog, filters);
      const nodes = [missedSummaryHost];
      if (!list.length) {
        nodes.push(message("No missed answers match these filters.", "Choose All to see every missed answer."));
        return nodes;
      }
      const toolbar = missedToolbar(list);
      if (toolbar) nodes.push(toolbar);
      const page = paged("missed", list, missedCard);
      nodes.push(...page.nodes, page.more);
      return nodes.filter(Boolean);
    }

    /* ------------------------------------------------------------- marked */

    // The progress change redraws this list (onProgressChange).
    function unmark(questionId) {
      focusTabAfterDraw = true;
      ctx.update((progress) => Progress.setMarked(progress, questionId, false));
    }

    function markedCard(questionId) {
      const item = labelsForId(questionId);
      const card = h("article", { className: "card review-item" }, [
        cardHead(item, item.timestamp ? `Last answered ${formatDate(item.timestamp)}` : null),
      ]);
      const facts = [];
      if (item.difficulty) facts.push(item.difficulty);
      if (item.updated) facts.push("Template revised since you answered");
      if (facts.length) card.appendChild(h("p", { className: "review-facts", text: facts.join(" · ") }));
      const toggle = questionToggle(`marked:${questionId}`, questionId, model.latest.get(questionId) || null);
      const unmarkButton = h("button", {
        type: "button",
        className: "text-link",
        text: "Unmark",
        "aria-label": `Unmark ${titleText(item)}`,
      });
      unmarkButton.addEventListener("click", () => unmark(questionId));
      card.append(h("div", { className: "review-item-actions" }, [toggle.button, unmarkButton, learnLink(item)]),
        toggle.container);
      return card;
    }

    function markedPanel() {
      if (!model.marked.length) {
        const box = message(`No marked ${model.test} questions.`,
          "Use Mark for Review during a set and the question is saved here.");
        box.appendChild(practiceLink());
        return [box];
      }
      const status = statusLine();
      const start = h("button", { type: "button", className: "button primary", text: `Practise all ${model.marked.length}` });
      start.dataset.focusKey = "start-marked";
      const ids = model.marked.slice();
      start.addEventListener("click", () => startSet(start, status, async () => {
        const matches = await ctx.questionsForIds(ids);
        return {
          title: `${model.test} review: marked questions`,
          questions: matches.length
            ? core.buildSession(practice.onePerTemplate(matches), "all", `${Date.now()}-review`, { spreadFamilies: false })
            : [],
        };
      }));
      const toolbar = h("div", { className: "review-toolbar" }, [
        start,
        h("p", {
          className: "muted",
          text: "Feedback after each question, no timer. Questions you leave unmarked in the set leave this list.",
        }),
        status,
      ]);
      const page = paged("flagged", model.marked, markedCard);
      return [toolbar, ...page.nodes, page.more].filter(Boolean);
    }

    /* -------------------------------------------------------------- wiring */

    function select(list, options) {
      if (list && list !== activeList) {
        activeList = list;
        pages[list] = 1;
      }
      ctx.showView("review", options);
      draw();
    }

    tabs.forEach((button, index) => {
      button.addEventListener("click", () => select(button.dataset.list, { focus: false }));
      button.addEventListener("keydown", (event) => {
        const moves = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: tabs.length - 1 };
        if (!(event.key in moves)) return;
        event.preventDefault();
        const next = tabs[(moves[event.key] + tabs.length) % tabs.length];
        next.focus();
        select(next.dataset.list, { focus: false });
      });
    });

    return {
      name: "review",
      hash: "review",
      element: elements.view,
      open(options, params) {
        select(HASH_LISTS[(params || [])[0]] || null, options);
      },
      onTestChange(current) {
        filters.reason = "all";
        filters.sectionKey = "";
        filters.skill = "";
        Object.keys(pages).forEach((key) => {
          pages[key] = 1;
        });
        if (current) draw();
      },
      onProgressChange(current) {
        if (!current) return;
        if (ownChange) {
          model = buildModel();
          renderTabs();
          refreshMissedSummary();
          return;
        }
        draw();
      },
    };
  }

  window.LiminalViews = window.LiminalViews || {};
  window.LiminalViews.review = create;
})();
