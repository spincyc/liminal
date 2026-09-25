(function () {
  "use strict";

  // The Progress view: stat cards, the skill table with Learn and Practice
  // links, and clearing saved progress. Every number comes from
  // LiminalProgress.stats, the one accuracy model: the retired fixed SAT
  // banks are left out, a blank counts as wrong, and a correct answer after
  // a hint is shown apart rather than counted as correct. Answers to
  // generated questions count under their template's current tier and
  // skill, so the section's templates load first.
  //
  // Interface: window.LiminalViews.progress(ctx) returns the view object
  // described at the top of app/app.js. Hash: #progress.

  function create(ctx) {
    const { Progress, practice } = ctx;
    const byId = (id) => document.getElementById(id);
    const elements = {
      view: byId("dashboardView"),
      stats: byId("dashboardStats"),
      notes: byId("dashboardNotes"),
      skillTableWrap: byId("skillTableWrap"),
      masterySection: byId("masterySection"),
      masterySort: byId("masterySort"),
      masteryNote: byId("masteryNote"),
      clearProgress: byId("clearProgressBtn"),
    };

    let masteryRows = [];
    let clearArmed = false;
    let clearTimer = null;
    let renderId = 0;

    const percent = (value) => (value === null || value === undefined ? "—" : `${Math.round(value * 100)}%`);

    // Template sections with answers here load their templates, so each
    // answer counts at its template's current tier (a template relabeled
    // from Hard to Medium re-tiers its old answers). A section that fails to
    // load keeps the stored labels.
    async function withCurrentTemplates(attempts) {
      const sections = [...new Set(attempts
        .filter((attempt) => attempt.source === "template")
        .map((attempt) => attempt.sectionKey))].filter(practice.usesTemplates);
      await Promise.all(sections.map((key) => ctx.sectionTemplates(key).catch(() => null)));
      return Progress.withCurrentTemplates(attempts, ctx.templateInfo());
    }

    // Attempts kept before v2 may lack their skill; only then are the banks
    // needed, to look the skill up.
    async function withSkills(attempts) {
      const missing = [...new Set(attempts.filter((attempt) => !attempt.skill)
        .map((attempt) => attempt.sectionKey || Progress.sectionOfId(attempt.questionId))
        .filter((key) => ctx.sectionByKey(key)))];
      if (!missing.length) return attempts;
      const banks = await Promise.all(missing.map((key) => ctx.loadBank(key).catch(() => [])));
      const byQuestion = new Map(banks.flat().map((question) => [question.id, question]));
      return attempts.map((attempt) => {
        const question = attempt.skill ? null : byQuestion.get(attempt.questionId);
        return question
          ? { ...attempt, domain: question.domain, skill: question.skill, difficulty: attempt.difficulty || question.difficulty }
          : attempt;
      });
    }

    function card(label, value, note, link) {
      const node = document.createElement("div");
      node.className = "card stat-card";
      const labelNode = document.createElement("span");
      labelNode.className = "stat-label";
      labelNode.textContent = label;
      const valueNode = document.createElement("strong");
      valueNode.className = "stat-value";
      valueNode.textContent = value;
      node.append(labelNode, valueNode);
      if (link) {
        const anchor = document.createElement("a");
        anchor.className = "stat-note";
        anchor.href = link.href;
        anchor.textContent = link.text;
        node.appendChild(anchor);
      } else if (note) {
        const noteNode = document.createElement("span");
        noteNode.className = "stat-note";
        noteNode.textContent = note;
        node.appendChild(noteNode);
      }
      return node;
    }

    function showLoadError(error) {
      elements.stats.innerHTML = "";
      const box = document.createElement("div");
      box.className = "card empty-state";
      const heading = document.createElement("strong");
      heading.textContent = "Your progress could not be loaded.";
      const detail = document.createElement("p");
      detail.textContent = `${error.message} Refresh the page or verify the site was built with npm run build.`;
      box.append(heading, detail);
      elements.stats.appendChild(box);
      elements.skillTableWrap.innerHTML = "";
    }

    async function render(options) {
      ctx.showView("dashboard", options);
      const id = ++renderId;
      const test = ctx.currentTest();
      const progress = ctx.store.get();
      let attempts;
      try {
        attempts = await withCurrentTemplates(await withSkills(Progress.attemptsFor(progress, { test })));
      } catch (error) {
        showLoadError(error);
        return;
      }
      if (id !== renderId || test !== ctx.currentTest()) return;
      const summary = Progress.stats(attempts);
      const hard = summary.byDifficulty.Hard;
      const missed = Progress.missedIds(progress, { test }).length;
      const marked = Progress.markedIds(progress, { test }).length;
      elements.stats.replaceChildren(
        card("Questions answered", ctx.formatNumber(summary.attempted),
          summary.unanswered ? `${summary.unanswered} left blank, counted wrong` : ""),
        card("Overall accuracy", percent(summary.accuracy), ""),
        // Hard accuracy stands alone: overall accuracy on a mostly Easy and
        // Medium mix is what makes practice look better than the real test.
        card("Hard accuracy", percent(hard.accuracy),
          hard.attempted ? `${hard.attempted} Hard question${hard.attempted === 1 ? "" : "s"} counted` : "No Hard questions yet"),
        card("Different questions", ctx.formatNumber(summary.questions), ""),
        card("Missed / marked", `${missed} / ${marked}`, "",
          missed || marked ? { href: "#review", text: "Review them" } : null),
      );
      renderNotes(summary);
      masteryRows = Object.values(summary.bySkill);
      populateMasterySections();
      renderMastery();
    }

    function renderNotes(summary) {
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
      if (summary.legacy) {
        notes.push(`${ctx.formatNumber(summary.legacy)} earlier answer${summary.legacy === 1 ? "" : "s"} from the retired ` +
          "fixed SAT question banks are left out: their difficulty labels ran easier than the real test.");
      }
      elements.notes.replaceChildren(...notes.map((text) => {
        const node = document.createElement("p");
        node.className = "field-note";
        node.textContent = text;
        return node;
      }));
      elements.notes.classList.toggle("hidden", !notes.length);
    }

    /* ------------------------------------------------------- mastery table */

    // Weakness alone puts a single missed question above a skill missed ten
    // times, so the default order weights low accuracy by how much evidence
    // there is for it.
    function focusScore(row) {
      return (1 - row.accuracy) * Math.sqrt(row.attempted);
    }

    const MASTERY_SORTS = {
      focus: (left, right) => focusScore(right) - focusScore(left),
      "accuracy-asc": (left, right) => left.accuracy - right.accuracy || right.attempted - left.attempted,
      "accuracy-desc": (left, right) => right.accuracy - left.accuracy || right.attempted - left.attempted,
      attempted: (left, right) => right.attempted - left.attempted,
      section: (left, right) =>
        ctx.sectionLabel(left.sectionKey).localeCompare(ctx.sectionLabel(right.sectionKey)) ||
        left.skill.localeCompare(right.skill),
      skill: (left, right) => left.skill.localeCompare(right.skill),
    };

    // Only sections the student has actually attempted are offered, so the
    // filter never leads to an empty table.
    function populateMasterySections() {
      const present = [...new Set(masteryRows.map((row) => row.sectionKey))].sort(
        (left, right) => ctx.sectionLabel(left).localeCompare(ctx.sectionLabel(right)),
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
        option.textContent = `${ctx.sectionLabel(sectionKey)} (${count})`;
        elements.masterySection.appendChild(option);
      });
      if (previous && present.includes(previous)) elements.masterySection.value = previous;
      // Nothing to filter or sort yet: hide the controls rather than show them
      // disabled with no reason.
      elements.masterySection.closest(".inline-controls").classList.toggle("hidden", !masteryRows.length);
    }

    function emptyState() {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      const title = document.createElement("strong");
      title.textContent = `No ${ctx.currentTest()} answers yet.`;
      const body = document.createElement("p");
      body.textContent = "Finish a practice set and your accuracy for each skill appears here, weakest first.";
      const link = document.createElement("a");
      link.className = "button primary";
      link.href = "#practice";
      link.textContent = "Build a practice set";
      empty.append(title, body, link);
      return empty;
    }

    function studyLinks(row) {
      const cell = document.createElement("span");
      cell.className = "row-links";
      const learn = practice.learnPageId(row.sectionKey, row.domain, row.skill);
      if (learn) {
        const link = document.createElement("a");
        link.href = `learn.html#${learn}`;
        link.textContent = "Learn";
        link.setAttribute("aria-label", `Learn: ${row.skill}`);
        cell.appendChild(link);
      }
      if (ctx.sectionByKey(row.sectionKey)) {
        const link = document.createElement("a");
        link.href = practice.practiceHash(row.sectionKey, row.skill);
        link.textContent = "Practice";
        link.setAttribute("aria-label", `Practice ${row.skill}`);
        cell.appendChild(link);
      }
      return cell;
    }

    function renderMastery() {
      if (!masteryRows.length) {
        elements.masteryNote.textContent = "";
        elements.skillTableWrap.replaceChildren(emptyState());
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
        '<th scope="col">Accuracy</th><th scope="col">Next step</th><th scope="col">Study</th></tr></thead>';
      const body = document.createElement("tbody");
      rows.forEach((row) => {
        const accuracy = Math.round(row.accuracy * 100);
        const tr = document.createElement("tr");
        const cells = [
          ["Skill", row.skill],
          ["Section", ctx.sectionLabel(row.sectionKey)],
          ["Answered", String(row.attempted)],
          ["Accuracy", null],
          ["Next step", accuracy < 50 ? "Rebuild with Easy" : accuracy < 80 ? "Continue at Medium" : "Try Hard"],
          ["Study", studyLinks(row)],
        ];
        cells.forEach(([label, content]) => {
          const td = document.createElement("td");
          td.dataset.label = label;
          if (label === "Answered") td.className = "num";
          if (content === null) {
            const cell = document.createElement("span");
            cell.className = "meter-cell";
            const meter = document.createElement("span");
            meter.className = "meter";
            meter.setAttribute("aria-hidden", "true");
            const fill = document.createElement("i");
            fill.style.width = `${accuracy}%`;
            meter.appendChild(fill);
            cell.append(meter, document.createTextNode(`${accuracy}%`));
            if (row.hintedCorrect) {
              const hinted = document.createElement("small");
              hinted.className = "meter-note";
              hinted.textContent = `+${row.hintedCorrect} with a hint`;
              cell.appendChild(hinted);
            }
            td.appendChild(cell);
          } else if (typeof content === "string") {
            td.textContent = content;
          } else {
            td.appendChild(content);
          }
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      table.appendChild(body);
      elements.skillTableWrap.replaceChildren(table);
    }

    /* ------------------------------------------------------------- clear */

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
      ctx.clearProgress();
      resetClearButton();
    }

    elements.masterySection.addEventListener("change", renderMastery);
    elements.masterySort.addEventListener("change", renderMastery);
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
