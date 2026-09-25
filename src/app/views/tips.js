(function () {
  "use strict";

  // The Study tips view: content/guides/answer-signs.js, a study guide of
  // probabilistic tells, each with the case where it fails. Principles may
  // carry a `caution` of their own. Rendered as text, never as HTML.
  //
  // Interface: window.LiminalViews.tips(ctx) returns the view object
  // described at the top of app/app.js. Hash: #tips.

  function create(ctx) {
    const byId = (id) => document.getElementById(id);
    const elements = {
      view: byId("signsView"),
      disclaimer: byId("signsDisclaimer"),
      principles: byId("signsPrinciples"),
      filter: byId("signsFilter"),
      groups: byId("signsGroups"),
    };

    let activeFilter = "all";

    function groupsForTest(data) {
      const test = ctx.currentTest();
      return (data.groups || []).filter((group) => group.test === test || /^both$/i.test(group.test));
    }

    function labelled(className, label, value) {
      const row = document.createElement("p");
      row.className = className;
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      row.append(strong, document.createTextNode(value));
      return row;
    }

    function renderPrinciples(data) {
      elements.principles.innerHTML = "";
      (data.principles || []).forEach((principle) => {
        const card = document.createElement("div");
        card.className = "principle";
        const title = document.createElement("h3");
        title.textContent = principle.title;
        const body = document.createElement("p");
        body.textContent = principle.body;
        card.append(title, body);
        if (principle.caution) card.appendChild(labelled("tell-caution", "Caution", principle.caution));
        elements.principles.appendChild(card);
      });
    }

    function buildFilter(groups) {
      elements.filter.innerHTML = "";
      const options = [{ id: "all", label: `All ${ctx.currentTest()} sections` }].concat(
        groups.map((group) => ({ id: group.id, label: group.category })),
      );
      options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chip";
        button.dataset.filter = option.id;
        button.textContent = option.label;
        button.addEventListener("click", () => {
          activeFilter = option.id;
          applyFilter();
        });
        elements.filter.appendChild(button);
      });
    }

    function applyFilter() {
      elements.filter.querySelectorAll(".chip").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
      });
      elements.groups.querySelectorAll(".signs-group").forEach((group) => {
        const show = activeFilter === "all" || group.dataset.group === activeFilter;
        group.classList.toggle("hidden", !show);
      });
    }

    function tellCard(tell) {
      const card = document.createElement("article");
      card.className = "tell";
      const name = document.createElement("h3");
      name.textContent = tell.name;
      card.appendChild(name);
      [
        ["Look for", tell.sign, "sign"],
        ["Why it works", tell.why, "why"],
        ["Example", tell.example, "example"],
        ["Caution", tell.caution, "caution"],
      ].forEach(([label, value, kind]) => {
        if (value) card.appendChild(labelled(`tell-${kind}`, label, value));
      });
      return card;
    }

    function buildGroups(groups) {
      elements.groups.innerHTML = "";
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
        group.tells.forEach((tell) => list.appendChild(tellCard(tell)));
        section.append(head, intro, list);
        elements.groups.appendChild(section);
      });
    }

    function render(options) {
      ctx.showView("signs", options);
      const data = window.PRACTICE_ANSWER_SIGNS;
      if (!data) {
        elements.groups.innerHTML =
          '<div class="card empty-state"><strong>The study tips could not load.</strong>' +
          "<p>Confirm content/answer-signs.js was built.</p></div>";
        return;
      }
      elements.disclaimer.textContent = data.disclaimer;
      renderPrinciples(data);
      const groups = groupsForTest(data);
      if (!groups.some((group) => group.id === activeFilter)) activeFilter = "all";
      buildFilter(groups);
      buildGroups(groups);
      applyFilter();
    }

    return {
      name: "signs",
      hash: "tips",
      element: elements.view,
      open: (options) => render(options),
      onTestChange(current) {
        if (current) render({ focus: false });
      },
    };
  }

  window.LiminalViews = window.LiminalViews || {};
  window.LiminalViews.tips = create;
})();
