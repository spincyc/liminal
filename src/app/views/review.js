(function () {
  "use strict";

  // The Review view: missed and marked questions for the current test, a
  // set that practices a whole list, and unmarking from the marked list.
  // Generated questions are rebuilt from their ids; the retired fixed SAT
  // banks load only when a list holds one of their questions.
  //
  // Interface: window.LiminalViews.review(ctx) returns the view object
  // described at the top of app/app.js. Hash: #review.

  const SHOWN = 100;

  function create(ctx) {
    const { Progress, practice, core } = ctx;
    const byId = (id) => document.getElementById(id);
    const elements = {
      view: byId("reviewView"),
      missedTab: byId("missedTab"),
      flaggedTab: byId("flaggedTab"),
      list: byId("reviewList"),
    };

    let activeList = "missed";
    let renderId = 0;
    // After unmarking, focus returns to the list's tab once it redraws.
    let focusTabAfterRender = false;

    function idsFor(listName, test) {
      const progress = ctx.store.get();
      return listName === "missed"
        ? Progress.missedIds(progress, { test })
        : Progress.markedIds(progress, { test });
    }

    function renderTabs(counts) {
      [elements.missedTab, elements.flaggedTab].forEach((button) => {
        const list = button.dataset.list;
        const selected = list === activeList;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (selected) elements.list.setAttribute("aria-labelledby", button.id);
        button.textContent = list === "missed" ? "Missed" : "Marked for review";
        if (counts) {
          const count = document.createElement("span");
          count.className = "tab-count";
          count.textContent = `(${counts[list]})`;
          button.appendChild(count);
        }
      });
    }

    function message(title, body) {
      const box = document.createElement("div");
      box.className = "card empty-state";
      const heading = document.createElement("strong");
      heading.textContent = title;
      const text = document.createElement("p");
      text.textContent = body;
      box.append(heading, text);
      return box;
    }

    function emptyList(test) {
      const listLabel = activeList === "flagged" ? "marked" : "missed";
      const box = message(`No ${listLabel} ${test} questions.`, activeList === "flagged"
        ? "Use Mark for Review during a set and the question is saved here."
        : "Questions you answer wrong or leave blank are saved here so you can try them again.");
      const link = document.createElement("a");
      link.className = "button primary";
      link.href = "#practice";
      link.textContent = "Build a practice set";
      box.appendChild(link);
      return box;
    }

    // The progress change redraws this list (onProgressChange).
    function unmark(question) {
      focusTabAfterRender = true;
      ctx.update((progress) => Progress.setMarked(progress, question.id, false));
    }

    // A question rebuilt from its template shows the template as it is now;
    // when the template has been revised since the student answered, say so.
    function revisedSince(question, latest) {
      const attempt = latest.get(question.id);
      if (!attempt || !question.templateId) return false;
      const template = ctx.templatesNow(question.sectionKey).find((entry) => entry.id === question.templateId);
      return Boolean(template) && (Number(attempt.templateVersion) || 1) !== (template.version || 1);
    }

    function isMathSection(sectionKey) {
      return sectionKey === "sat-math" || sectionKey === "act-mathematics";
    }

    function itemCard(question, latest) {
      const card = document.createElement("article");
      card.className = "card review-item";
      const header = document.createElement("div");
      header.className = "review-item-head";
      const tags = document.createElement("span");
      tags.textContent = `${ctx.sectionLabel(question.sectionKey)} · ${question.skill}`;
      const id = document.createElement("small");
      id.textContent = question.id;
      header.append(tags, id);
      const stem = document.createElement("h2");
      stem.className = "review-stem";
      if (isMathSection(question.sectionKey) && ctx.render && ctx.render.appendMath) {
        ctx.render.appendMath(stem, question.stem);
      } else {
        stem.textContent = question.stem;
      }
      card.append(header, stem);
      if (revisedSince(question, latest)) {
        const note = document.createElement("p");
        note.className = "field-note";
        note.textContent = "Revised since you answered it: this is the question as its template builds it now.";
        card.appendChild(note);
      }
      const actions = document.createElement("div");
      actions.className = "review-item-actions";
      const learn = practice.learnHref(question);
      if (learn) {
        const link = document.createElement("a");
        link.href = learn;
        link.textContent = `Learn: ${question.skill}${question.subskill ? ` — ${question.subskill}` : ""}`;
        actions.appendChild(link);
      }
      if (activeList === "flagged") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "text-link";
        button.textContent = "Unmark";
        button.setAttribute("aria-label", `Unmark question ${question.id}`);
        button.addEventListener("click", () => unmark(question));
        actions.appendChild(button);
      }
      if (actions.childNodes.length) card.appendChild(actions);
      return card;
    }

    function practiceAll(test, matches) {
      const set = core.buildSession(matches, "all", `${Date.now()}-review`, { spreadFamilies: false });
      const listLabel = activeList === "flagged" ? "marked" : "missed";
      try {
        ctx.launch({
          title: `${test} review: ${listLabel} questions`,
          sectionKey: set[0].sectionKey,
          kind: activeList === "flagged" ? "review-marked" : "review-missed",
          questions: set,
          feedback: "instant",
          timeLimitSeconds: null,
        });
      } catch (error) {
        elements.list.prepend(message("The test screen could not open.", error.message));
      }
    }

    async function render(listName, options) {
      activeList = listName || activeList;
      ctx.showView("review", options);
      const id = ++renderId;
      const test = ctx.currentTest();
      renderTabs(null);
      elements.list.replaceChildren(message("Loading saved questions…", ""));
      const lists = { missed: idsFor("missed", test), flagged: idsFor("flagged", test) };
      let resolved;
      try {
        resolved = {
          missed: await ctx.questionsForIds(lists.missed),
          flagged: await ctx.questionsForIds(lists.flagged),
        };
      } catch (error) {
        if (id !== renderId) return;
        elements.list.replaceChildren(message("Saved questions could not be loaded.",
          `${error.message} Refresh the page or verify the site was built with npm run build.`));
        return;
      }
      if (id !== renderId || test !== ctx.currentTest()) return;
      renderTabs({ missed: resolved.missed.length, flagged: resolved.flagged.length });
      if (focusTabAfterRender) {
        focusTabAfterRender = false;
        (activeList === "flagged" ? elements.flaggedTab : elements.missedTab).focus();
      }
      const matches = resolved[activeList];
      elements.list.innerHTML = "";
      if (!matches.length) {
        elements.list.appendChild(emptyList(test));
        return;
      }
      const toolbar = document.createElement("div");
      toolbar.className = "review-toolbar";
      const start = document.createElement("button");
      start.type = "button";
      start.className = "button primary";
      start.textContent = `Practice all ${matches.length}`;
      start.addEventListener("click", () => practiceAll(test, matches));
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = activeList === "flagged"
        ? "Feedback after each question, no timer. Questions you leave unmarked in the set leave this list."
        : "Feedback after each question, no timer.";
      toolbar.append(start, note);
      elements.list.appendChild(toolbar);
      const latest = Progress.latestAttempts(ctx.store.get(), { test });
      matches.slice(0, SHOWN).forEach((question) => elements.list.appendChild(itemCard(question, latest)));
      if (matches.length > SHOWN) {
        const more = document.createElement("p");
        more.className = "field-note";
        more.textContent = `Showing the first ${SHOWN} of ${matches.length}; all are included when you practice.`;
        elements.list.appendChild(more);
      }
    }

    [elements.missedTab, elements.flaggedTab].forEach((button, index, tabs) => {
      button.addEventListener("click", () => render(button.dataset.list, { focus: false }));
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const next = tabs[(index + 1) % tabs.length];
        next.focus();
        render(next.dataset.list, { focus: false });
      });
    });

    return {
      name: "review",
      hash: "review",
      element: elements.view,
      open: (options) => render(null, options),
      onTestChange(current) {
        if (current) render(null, { focus: false });
      },
      onProgressChange(current) {
        if (current) render(null, { focus: false });
      },
    };
  }

  window.LiminalViews = window.LiminalViews || {};
  window.LiminalViews.review = create;
})();
