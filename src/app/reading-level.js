/* Reading-level page: DOM only. Every decision (ladder, scoring, placement,
   plan, re-check, saved-state parsing) comes from lib/reading-level.js.
   Content strings render as text nodes, never as HTML. */
(function () {
  "use strict";
  const L = window.LiminalReadingLevel, B = window.LIMINAL_READING_LEVEL;
  const status = document.getElementById("rlStatus"), view = document.getElementById("rlView");
  let state = null, readingStarted = null, storageWorks = true, confirmingReset = false;

  // ---- Small DOM helpers ----
  function el(tag, text, className) { const node = document.createElement(tag); if (text !== undefined && text !== null) node.textContent = text; if (className) node.className = className; return node; }
  function link(label, href, className) { const node = el("a", label, className); node.href = href; return node; }
  function button(label, action, className) { const node = el("button", label, className); node.type = "button"; node.addEventListener("click", action); return node; }
  function heading(text, level = "h2") { const node = el(level, text); node.id = "rlHeading"; node.tabIndex = -1; return node; }
  function announce(message) { status.textContent = message || ""; }
  function focusHeading() { const node = document.getElementById("rlHeading"); if (node) { node.focus({ preventScroll: true }); node.scrollIntoView({ block: "start" }); } }

  // ---- Data ----
  const labels = B ? B.labels || {} : {};
  const label = level => L.levelLabel(level, labels);
  const probes = B ? B.probes : [];
  const probesById = Object.fromEntries(probes.map(probe => [probe.id, probe]));
  const ladder = L ? L.ladderLevels(probes) : [];
  const libraryLevels = B ? B.library.map(entry => entry.level) : [];
  const titles = B ? Object.fromEntries(B.library.map(entry => [entry.level, entry.nights])) : {};
  function probeAt(level, form) { return probes.find(probe => probe.level === level && probe.form === form) || null; }

  // ---- Dates (ISO strings; shown in UTC so the stored day never shifts) ----
  function today() { const now = new Date(); return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0"); }
  const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const longDate = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  function showDate(iso, long = false) { return (long ? longDate : dateFormat).format(new Date(iso + "T00:00:00Z")); }

  // ---- Storage: versioned, try/catch, parsed as untrusted ----
  function load() {
    let raw = null;
    try { raw = window.localStorage.getItem(L.STORAGE_KEY); } catch (_) { storageWorks = false; }
    state = raw ? L.parseState(raw) : L.emptyState();
  }
  function save() {
    try { window.localStorage.setItem(L.STORAGE_KEY, L.serializeState(state)); storageWorks = true; }
    catch (_) { storageWorks = false; }
  }
  function reset() {
    try { window.localStorage.removeItem(L.STORAGE_KEY); } catch (_) { storageWorks = false; }
    state = L.emptyState(); confirmingReset = false; readingStarted = null;
    go("", "Saved results and plan erased from this browser.");
  }

  // ---- Attempts ----
  function history() {
    let order = 0;
    return state.attempts.flatMap(attempt => attempt.responses.map(response => {
      const probe = probesById[response.probeId];
      return probe ? { level: probe.level, form: probe.form, order: order++ } : null;
    }).filter(Boolean));
  }
  function attemptById(id) { return state.attempts.find(attempt => attempt.id === id) || null; }
  function latest(kind) { return state.attempts.filter(attempt => attempt.kind === kind && attempt.finishedAt).pop() || null; }
  function newAttempt(kind, startLevel) {
    const attempt = { id: kind.slice(0, 3) + "-" + Date.now().toString(36), kind, startedAt: new Date().toISOString(), finishedAt: null, startLevel, responses: [] };
    state.attempts.push(attempt); return attempt;
  }
  function present(attempt, level, preference) {
    const choice = L.chooseForm(level, history(), preference), probe = probeAt(level, choice.form);
    state.current = { attemptId: attempt.id, probeId: probe.id, phase: "reading", answers: [], readingMs: null, rating: null, repeat: choice.repeat };
    readingStarted = null; save(); go("", "");
  }
  function startCalibration(level) {
    const attempt = newAttempt("calibration", level);
    present(attempt, L.nextStep([], ladder, level).level, ["a", "b"]);
  }
  function startRecheck() {
    if (!state.plan) return;
    const attempt = newAttempt("recheck", null);
    present(attempt, L.recheckLevel(state.plan, ladder), ["b", "a"]);
  }
  function stopAttempt() {
    const current = state.current;
    state.current = null;
    if (current) state.attempts = state.attempts.filter(attempt => attempt.id !== current.attemptId);
    readingStarted = null; save(); go("", "Check stopped. Nothing from it was kept.");
  }
  function continueAttempt() {
    const attempt = attemptById(state.current.attemptId);
    state.current = null;
    if (attempt.kind === "calibration") {
      const step = L.nextStep(L.replay(attempt, probesById), ladder, attempt.startLevel);
      if (!step.done) { present(attempt, step.level, ["a", "b"]); return; }
      attempt.finishedAt = new Date().toISOString(); save(); go("#result", "Check finished.");
      return;
    }
    const result = L.replay(attempt, probesById)[0];
    const decision = L.applyRecheck(state.plan, result, today(), libraryLevels, labels);
    attempt.finishedAt = new Date().toISOString();
    state.plan = { ...decision.inputs, createdAt: new Date().toISOString(), note: decision.message };
    save(); go("#plan", decision.message);
  }

  // ---- Navigation ----
  function go(hash, message) {
    if (window.location.hash !== hash) history_replace(hash);
    render(); announce(message); focusHeading();
  }
  function history_replace(hash) { window.history.pushState(null, "", hash || window.location.pathname + window.location.search); }

  // ---- Shared pieces ----
  // While the student reads and answers, the passage has a neutral label:
  // a night's descriptive title can state an answer. The title, author and
  // source follow on the feedback screen (sourceSection).
  function passageSection(probe) {
    const section = el("section", undefined, "rl-passage"); section.setAttribute("aria-labelledby", "rlPassageTitle");
    const title = el("h3", "Passage"); title.id = "rlPassageTitle";
    section.append(title, el("p", probe.intro, "rl-context"));
    if (probe.contentNote) section.append(el("p", "Content note: " + probe.contentNote, "rl-content-note"));
    const text = el("div", undefined, "rl-text");
    probe.blocks.forEach(block => text.append(blockNode(block)));
    section.append(text, el("p", "The title, author and source appear after the questions.", "rl-muted"));
    return section;
  }
  // Tab-separated source tables render as a scrollable table (text nodes only).
  function blockNode(block) {
    const rows = block.type === "paragraph" && L.tableRows(block.text);
    if (!rows) return el(block.type === "heading" ? "h4" : "p", block.text, "rl-" + block.type);
    const width = Math.max(...rows.map(row => row.cells.length)), table = el("table", undefined, "rl-source-table"), body = el("tbody");
    rows.forEach(row => {
      const tr = el("tr", undefined, row.cells.length === 1 ? "rl-table-span" : undefined);
      row.cells.forEach(cell => { const node = el(row.header ? "th" : "td", cell); if (row.header) node.scope = "col"; tr.append(node); });
      // A one-cell row (a year) spans the table; other short rows keep their columns.
      if (row.cells.length === 1) tr.firstChild.colSpan = width;
      else for (let i = row.cells.length; i < width; i++) tr.append(el(row.header ? "th" : "td", ""));
      body.append(tr);
    });
    table.append(body);
    const wrap = el("div", undefined, "rl-table-wrap rl-source-table-wrap"); wrap.tabIndex = 0; wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "Table from the passage");
    wrap.append(table); return wrap;
  }
  function sourceSection(probe) {
    const box = el("section", undefined, "rl-source-card");
    box.append(el("h3", "About the passage"), el("p", probe.title + (probe.workTitle ? " (" + probe.workTitle + ")" : ""), "rl-source-title"),
      el("p", "By " + probe.author + (probe.translator ? " · Translated by " + probe.translator : ""), "rl-author"));
    const source = el("details", undefined, "rl-source"); source.append(el("summary", "Source"));
    source.append(el("p", probe.source), el("p", probe.locator), el("p", "Public domain in the United States. " + probe.rights));
    box.append(source, link("Read this night in the daily library", L.route(probe.level, probe.week, probe.day)));
    return box;
  }
  function stepLabel(attempt) {
    return attempt.kind === "recheck" ? "Re-check passage" : "Passage " + (attempt.responses.length + (state.current.phase === "feedback" ? 0 : 1)) + " of up to " + L.MAX_PROBES;
  }

  // ---- Views ----
  function readingView(attempt, probe) {
    const wrap = el("section", undefined, "rl-card");
    wrap.append(el("p", stepLabel(attempt), "rl-step"), heading("Read the passage"));
    wrap.append(el("p", "The reading clock started when this passage appeared. Read at your usual pace, then press Done. You will be able to look back at the passage while you answer.", "rl-muted"));
    if (state.current.restarted) wrap.append(el("p", "The page reloaded, so the reading clock started again.", "rl-notice"));
    view.append(wrap, passageSection(probe));
    const actions = el("div", "", "rl-actions");
    actions.append(button("Done reading", () => {
      state.current.readingMs = Math.max(1, Math.round(performance.now() - readingStarted));
      state.current.phase = "questions"; readingStarted = null; save(); go("", "Reading time recorded. Answer the questions; the passage stays above.");
    }, "rl-primary"));
    actions.append(button("Stop this check", stopAttempt, "rl-quiet"));
    view.append(actions);
    readingStarted = performance.now();
  }
  function questionsView(attempt, probe) {
    const wrap = el("section", undefined, "rl-card");
    wrap.append(el("p", stepLabel(attempt), "rl-step"), heading("Answer the questions"));
    wrap.append(el("p", "Look back at the passage as often as you like. Choose one answer for each question.", "rl-muted"));
    const jump = button("Go to the questions", () => { const first = form.querySelector("input"); first.focus({ preventScroll: true }); form.scrollIntoView({ block: "start" }); }, "rl-quiet rl-jump");
    wrap.append(jump); view.append(wrap);
    const layout = el("div", undefined, "rl-split");
    const form = el("form", undefined, "rl-questions"); form.noValidate = true; form.setAttribute("aria-label", "Questions");
    probe.items.forEach((item, index) => {
      const set = el("fieldset", undefined, "rl-item"), legend = el("legend");
      legend.append(el("span", (index + 1) + ". ", "rl-number"), document.createTextNode(item.stem)); set.append(legend);
      item.options.forEach((option, choice) => {
        const row = el("label", undefined, "rl-option"), input = el("input");
        input.type = "radio"; input.name = "q" + index; input.value = String(choice);
        input.checked = state.current.answers[index] === choice;
        input.addEventListener("change", () => { state.current.answers[index] = choice; save(); });
        row.append(input, el("span", "ABCD"[choice], "rl-letter"), el("span", option)); set.append(row);
      });
      form.append(set);
    });
    const rating = el("fieldset", undefined, "rl-item rl-rating"), legend = el("legend", "How did this passage feel? (optional)"); rating.append(legend);
    [["easy", "Too easy"], ["right", "About right"], ["hard", "Too hard"]].forEach(([value, text]) => {
      const row = el("label", undefined, "rl-option rl-option-inline"), input = el("input");
      input.type = "radio"; input.name = "rating"; input.value = value; input.checked = state.current.rating === value;
      input.addEventListener("change", () => { state.current.rating = value; save(); });
      row.append(input, el("span", text)); rating.append(row);
    });
    form.append(rating);
    const actions = el("div", undefined, "rl-actions"), submit = el("button", "Check answers", "rl-primary"); submit.type = "submit";
    actions.append(submit, button("Stop this check", stopAttempt, "rl-quiet")); form.append(actions);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const missing = probe.items.map((_, index) => index).filter(index => !Number.isInteger(state.current.answers[index]));
      if (missing.length) { announce("Answer question " + missing.map(index => index + 1).join(", ") + " first."); const first = form.querySelector('input[name="q' + missing[0] + '"]'); if (first) first.focus(); return; }
      const answers = probe.items.map((_, index) => state.current.answers[index]);
      attempt.responses.push({ probeId: probe.id, answers, readingMs: state.current.readingMs, rating: state.current.rating, repeat: state.current.repeat, at: new Date().toISOString() });
      state.current.phase = "feedback"; save(); go("", "Answers checked.");
    });
    layout.append(passageSection(probe), form); view.append(layout);
  }
  function feedbackView(attempt, probe) {
    const response = attempt.responses[attempt.responses.length - 1], result = L.evaluate(probe, response);
    const wrap = el("section", undefined, "rl-card");
    wrap.append(el("p", stepLabel(attempt), "rl-step"), heading(result.correct + " of " + result.total + " correct"));
    const facts = el("p", "This was a " + label(probe.level) + " passage. " + (result.wpm ? "Reading pace: about " + result.wpm + " words a minute" + (result.pace === "slow" ? " (slow for this level)" : result.pace === "rushed" ? " (faster than careful reading, so it cannot count toward moving up)" : "") + "." : ""), "rl-muted");
    wrap.append(facts);
    if (response.repeat) wrap.append(el("p", "You have seen this passage before, so this result can hold your level but not move it up.", "rl-notice"));
    const list = el("ol", undefined, "rl-review");
    probe.items.forEach((item, index) => {
      const right = response.answers[index] === item.key, entry = el("li", undefined, right ? "rl-right" : "rl-wrong");
      entry.append(el("p", item.stem, "rl-review-stem"));
      entry.append(el("p", (right ? "Correct: " : "Your answer: " + item.options[response.answers[index]] + ". Answer: ") + item.options[item.key], "rl-review-answer"));
      entry.append(el("p", item.rationale, "rl-muted"));
      list.append(entry);
    });
    wrap.append(list, sourceSection(probe));
    const done = attempt.kind === "recheck" || L.nextStep(L.replay(attempt, probesById), ladder, attempt.startLevel).done;
    const actions = el("div", undefined, "rl-actions");
    actions.append(button(done ? (attempt.kind === "recheck" ? "See the decision" : "See your starting point") : "Next passage", continueAttempt, "rl-primary"));
    wrap.append(actions); view.append(wrap);
  }
  function homeView() {
    const intro = el("section", undefined, "rl-card");
    if (!ladder.length) { intro.append(heading("Not available yet"), el("p", "The reading-level passages are being prepared. Explore the daily reading library meanwhile.")); view.append(intro); return; }
    if (state.plan) {
      const plan = L.makePlan({ ...state.plan, libraryLevels, titles });
      const next = plan.weeks.map(week => week.recheck).filter(Boolean).find(recheck => recheck.date >= today());
      const card = el("section", undefined, "rl-card rl-summary");
      card.append(heading("Your plan"));
      card.append(el("p", label(state.plan.core.level) + " nights" + (state.plan.stretch ? ", with stretch nights from " + label(state.plan.stretch.level) : "") + ". " + (next ? "Next re-check: " + showDate(next.date, true) + "." : "A re-check is due.")));
      if (state.plan.note) card.append(el("p", state.plan.note, "rl-muted"));
      const actions = el("div", undefined, "rl-actions");
      actions.append(link("Open the plan", "#plan", "rl-button rl-primary"), button("Take the re-check now", startRecheck));
      if (latest("calibration")) actions.append(link("See the starting point", "#result", "rl-button"));
      card.append(actions); view.append(card);
    }
    intro.append(state.plan ? el("h2", "Check again") : heading("Find your starting point"));
    const steps = el("ol", undefined, "rl-steps");
    ["Read a short passage. A clock runs from when it appears until you press Done.",
      "Answer " + L.itemCount(ladder[0]) + "–" + L.itemCount(ladder[ladder.length - 1]) + " multiple-choice questions. You can look back at the passage.",
      "The next passage moves up if that went well, or down if it was hard. Up to " + L.MAX_PROBES + " passages, about 15–35 minutes.",
      "Get a starting week in the daily library and a dated plan that adds harder nights gradually."].forEach(text => steps.append(el("li", text)));
    intro.append(steps);
    const form = el("form", undefined, "rl-start"), field = el("label", "Start at"), select = el("select"); select.id = "rlStartLevel";
    ladder.forEach(level => { const option = el("option", label(level)); option.value = String(level); select.append(option); });
    const stated = latest("calibration"); if (stated && ladder.includes(stated.startLevel)) select.value = String(stated.startLevel);
    field.append(select);
    form.append(field, el("p", "Choose your current grade, or the level you read comfortably now. Levels without passages yet are skipped.", "rl-muted"));
    const start = el("button", "Start the check", "rl-primary"); start.type = "submit"; form.append(start);
    form.addEventListener("submit", event => { event.preventDefault(); startCalibration(Number(select.value)); });
    intro.append(form); view.append(intro);
    view.append(storageSection());
  }
  function storageSection() {
    const box = el("section", undefined, "rl-card rl-storage");
    box.append(el("h2", "Saved in this browser"));
    box.append(el("p", storageWorks ? "Dates, passages, answers, reading times and your plan are kept only in this browser. No names or personal details are asked for or stored." : "This browser is not saving, so a reload will lose your progress.", "rl-muted"));
    if (state.attempts.length || state.plan) {
      if (confirmingReset) {
        box.append(el("p", "Erase every saved check and the plan from this browser? This cannot be undone.", "rl-notice"));
        const actions = el("div", undefined, "rl-actions");
        const erase = button("Erase", reset, "rl-danger"); actions.append(erase, button("Cancel", () => { confirmingReset = false; render(); }));
        box.append(actions); setTimeout(() => erase.focus(), 0);
      } else box.append(button("Erase saved results…", () => { confirmingReset = true; render(); }));
    }
    return box;
  }
  function resultView() {
    const attempt = latest("calibration");
    if (!attempt) { go("", "No finished check yet."); return; }
    const results = L.replay(attempt, probesById), place = L.placement(results, ladder, labels);
    const card = el("section", undefined, "rl-card");
    card.append(el("p", "Finished " + showDate(attempt.finishedAt.slice(0, 10), true), "rl-step"), heading("Your starting point"));
    card.append(el("p", label(place.level) + " · week " + place.week, "rl-placement"));
    card.append(el("p", place.explanation));
    if (place.supported) {
      const help = el("p", "Read with an adult: ");
      help.append(link(label(place.level) + " week 1", L.route(place.level, 1, 1)));
      if (libraryLevels.includes(0)) help.append(document.createTextNode(" · for a younger child, the "), link("Kindergarten read-aloud nights", L.route(0, 1, 1)));
      card.append(help);
    } else { const open = el("p"); open.append(link("Open " + label(place.level) + ", week " + place.week, L.route(place.level, place.week, 1))); card.append(open); }
    view.append(card);

    const evidence = el("section", undefined, "rl-card");
    evidence.append(el("h2", "What the passages showed"));
    const table = el("table", undefined, "rl-table"), head = el("tr");
    ["Passage", "Correct", "Pace", "Felt", "Result"].forEach(text => head.append(el("th", text)));
    const thead = el("thead"); thead.append(head); table.append(thead);
    const body = el("tbody");
    results.forEach(result => {
      const row = el("tr");
      row.append(el("td", label(result.level)), el("td", result.correct + " of " + result.total),
        el("td", result.wpm ? result.wpm + " wpm" + (result.pace === "comfortable" ? "" : " (" + result.pace + ")") : "—"),
        el("td", { easy: "Too easy", right: "About right", hard: "Too hard" }[result.rating] || "—"),
        el("td", { pass: "Comfortable", near: "Close", weak: "Hard" }[result.result]));
      body.append(row);
    });
    table.append(body);
    const scroll = el("div", undefined, "rl-table-wrap"); scroll.append(table); evidence.append(scroll);
    evidence.append(el("p", "Comfortable means at least " + Math.round(L.STRONG_SHARE * 100) + "% correct at a steady pace without feeling too hard. Pace is words divided by the time from the passage appearing to Done.", "rl-muted"));
    const skills = el("ul", undefined, "rl-skills");
    L.skillSummary(results).forEach(entry => skills.append(el("li", entry.label + ": " + entry.correct + " of " + entry.total)));
    evidence.append(el("h3", "By kind of question"), skills);
    view.append(evidence);

    const make = el("section", undefined, "rl-card");
    make.append(el("h2", state.plan ? "Make a new plan from this result" : "Make a plan"));
    make.append(el("p", "Most nights stay at your starting level. " + (place.confirmed ? "A growing share of stretch nights comes from the next level: " + L.STRETCH_NIGHTS_BY_STAGE.join(", then ") + " a week. " : "Stretch nights begin once a re-check confirms this start. ") + "Every " + L.RECHECK_EVERY_WEEKS + " weeks, a one-passage re-check moves you up or holds your level.", "rl-muted"));
    const form = el("form", undefined, "rl-plan-form");
    const startField = el("label", "First week starts on or after"), startInput = el("input"); startInput.type = "date"; startInput.required = true; startInput.value = L.addDays(today(), 1); startInput.id = "rlPlanStart"; startField.append(startInput);
    const nightsField = el("label", "Reading nights"), nights = el("select"); nights.id = "rlPlanNights";
    [["weekdays", "Monday to Friday"], ["school-nights", "Sunday to Thursday"]].forEach(([value, text]) => { const option = el("option", text); option.value = value; nights.append(option); });
    nightsField.append(nights);
    const weeksField = el("label", "Length"), weeks = el("select"); weeks.id = "rlPlanWeeks";
    L.PLAN_WEEKS.forEach(count => { const option = el("option", count + " weeks"); option.value = String(count); weeks.append(option); }); weeks.value = String(L.DEFAULT_PLAN_WEEKS);
    weeksField.append(weeks);
    const submit = el("button", state.plan ? "Replace my plan" : "Make my plan", "rl-primary"); submit.type = "submit";
    form.append(startField, nightsField, weeksField, submit);
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!L.validDate(startInput.value)) { announce("Choose a start date."); startInput.focus(); return; }
      state.plan = { startDate: startInput.value, weeks: Number(weeks.value), nights: nights.value, stage: 0, ...L.planCursors(place, libraryLevels),
        confirmed: place.confirmed, supported: place.supported, createdAt: new Date().toISOString(), note: place.explanation };
      save(); go("#plan", "Plan made.");
    });
    make.append(form); view.append(make);
  }
  function planView() {
    if (!state.plan) { go("", "No plan yet."); return; }
    const plan = L.makePlan({ ...state.plan, libraryLevels, titles });
    const card = el("section", undefined, "rl-card rl-plan-head");
    card.append(heading("Reading plan"));
    const pattern = state.plan.nights === "weekdays" ? "Monday to Friday" : "Sunday to Thursday";
    card.append(el("p", "From " + showDate(plan.firstNight, true) + " · " + state.plan.weeks + " weeks · " + pattern, "rl-step"));
    card.append(el("p", "Main level: " + label(state.plan.core.level) + " from week " + L.nightAt(state.plan.core.index).week + ", day " + L.nightAt(state.plan.core.index).day + "." +
      (state.plan.stretch ? " Stretch nights: " + label(state.plan.stretch.level) + " from week " + L.nightAt(state.plan.stretch.index).week + "." : state.plan.confirmed ? " No higher level is in the library yet." : " Stretch nights begin after a re-check confirms this level.")));
    if (state.plan.supported) card.append(el("p", "Read these nights with an adult until a re-check shows you are ready to read them alone.", "rl-notice"));
    if (state.plan.note) card.append(el("p", state.plan.note, "rl-muted rl-note"));
    card.append(el("p", "Practice placement from a few short passages; not a standardized test or measured reading level.", "rl-print-only"));
    const actions = el("div", undefined, "rl-actions");
    actions.append(button("Print plan", () => window.print(), "rl-primary"), button("Take the re-check now", startRecheck));
    if (latest("calibration")) actions.append(link("Starting point", "#result", "rl-button"));
    actions.append(link("Home", "#", "rl-button"));
    card.append(actions); view.append(card);
    const list = el("div", undefined, "rl-weeks");
    plan.weeks.forEach(week => {
      const section = el("section", undefined, "rl-week");
      const first = week.nights[0], last = week.nights[week.nights.length - 1];
      section.append(el("h3", "Week " + week.number + (first ? " · " + showDate(first.date) + " – " + showDate(last.date) : "")));
      const nights = el("ol", undefined, "rl-nights");
      week.nights.forEach(night => {
        const item = el("li", undefined, night.kind === "stretch" ? "rl-night rl-stretch" : "rl-night");
        item.append(el("span", showDate(night.date), "rl-date"));
        const what = el("span", undefined, "rl-what");
        what.append(link(label(night.level) + " · week " + night.week + ", day " + night.day, night.href));
        if (night.title) what.append(el("span", night.title + (night.minutes ? " · about " + night.minutes + " min" : ""), "rl-night-title"));
        item.append(what);
        if (night.kind === "stretch") item.append(el("span", "Stretch", "rl-tag"));
        nights.append(item);
      });
      if (week.recheck) {
        const item = el("li", undefined, "rl-night rl-recheck");
        item.append(el("span", showDate(week.recheck.date), "rl-date"), el("span", "Re-check: one short passage and its questions, about 10 minutes", "rl-what"), el("span", "Re-check", "rl-tag"));
        nights.append(item);
      }
      section.append(nights); list.append(section);
    });
    view.append(list);
    if (plan.endOfLibrary) view.append(el("p", "The plan reaches the end of the levels now in the library.", "rl-notice"));
  }

  function render() {
    view.replaceChildren();
    if (state.current) {
      const attempt = attemptById(state.current.attemptId), probe = probesById[state.current.probeId];
      if (!attempt || !probe) { state.current = null; save(); render(); return; }
      document.title = "Reading level — Liminal";
      if (state.current.phase === "reading") readingView(attempt, probe);
      else if (state.current.phase === "questions") questionsView(attempt, probe);
      else feedbackView(attempt, probe);
      return;
    }
    const route = window.location.hash;
    if (route === "#plan" && state.plan) { document.title = "Reading plan — Liminal"; planView(); }
    else if (route === "#result" && latest("calibration")) { document.title = "Starting point · Reading level — Liminal"; resultView(); }
    else { document.title = "Liminal — Reading level"; homeView(); }
  }

  function start() {
    if (!L || !B || B.schemaVersion !== 1 || !Array.isArray(B.probes)) { announce("The reading-level check could not be loaded. Reload this page to try again."); return; }
    load();
    // A reload mid-passage cannot trust the old clock, so it starts again.
    if (state.current && state.current.phase === "reading") state.current.restarted = true;
    render();
    window.addEventListener("hashchange", () => { if (!state.current) { render(); focusHeading(); } });
    window.addEventListener("popstate", () => { if (!state.current) { render(); focusHeading(); } });
    window.addEventListener("storage", event => { if (event.key === L.STORAGE_KEY && !state.current) { load(); render(); } });
  }
  document.querySelector(".skip-link").addEventListener("click", event => { event.preventDefault(); const main = document.getElementById("main"); main.focus(); main.scrollIntoView({ block: "start" }); });
  start();
})();
