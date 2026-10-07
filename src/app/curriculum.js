(function () {
  "use strict";
  const data = window.LIMINAL_CURRICULUM;
  const C = window.LiminalCurriculum;
  const status = document.getElementById("planStatus");
  if (!data || !C) {
    status.textContent = "The plans could not be loaded. Reload this page, or use the download link below.";
    return;
  }
  const container = document.getElementById("planContent");
  const trackSelect = document.getElementById("planTrack");
  const gradeSelect = document.getElementById("planGrade");
  function el(tag, value, className) {
    const node = document.createElement(tag);
    if (value !== undefined) node.textContent = value;
    if (className) node.className = className;
    return node;
  }
  function link(label, href, className) {
    const node = el("a", label, className);
    node.href = href;
    return node;
  }
  function list(items, tag = "ul") {
    const node = el(tag);
    items.forEach(item => node.append(el("li", item)));
    return node;
  }
  function block(title, content) {
    const section = el("section", undefined, "plan-block");
    section.append(el("h3", title), Array.isArray(content) ? list(content) : el("p", content));
    return section;
  }
  function courseLink(pair, label) {
    return link(label || pair.course.title, C.route(pair.track.track.id, pair.course.grade));
  }
  function weeks(unit) { return "Weeks " + unit.startWeek + "–" + unit.endWeek; }
  function renderSources(track, course) {
    const section = el("section", undefined, "plan-sources");
    section.append(el("h2", "Standards and source notes"), el("p", track.track.scopeNote));
    track.sources.forEach(source => {
      const item = el("p");
      item.append(link(source.title, source.url), document.createTextNode(" · " + source.publisher + ". " + source.edition + ". Checked " + source.accessed + ". " + source.note));
      section.append(item);
    });
    const refs = C.coverage(track, course);
    const details = el("details", undefined, "plan-coverage");
    details.append(el("summary", "View " + refs.length + " mapped references for this year"));
    details.append(el("p", "This index shows where an expectation is planned, not proof that it has been taught or mastered. Short labels are summaries; lettered subskills may be grouped under their numbered standard. Extension marks identify optional advanced expectations."));
    const table = el("table");
    table.append(el("caption", "Source references and their units"));
    const head = el("thead");
    const row = el("tr");
    ["Reference", "Planning label", "Units"].forEach(label => { const cell = el("th", label); cell.scope = "col"; row.append(cell); });
    head.append(row); table.append(head);
    const body = el("tbody");
    refs.forEach(ref => {
      const tr = el("tr");
      const code = el("th"); code.scope = "row";
      code.append(link(ref.id, ref.source.url), el("small", ref.locator));
      const label = el("td", ref.label + (ref.kind === "extension" ? " (Extension)" : ""));
      const units = el("td");
      ref.units.forEach((id, index) => {
        if (index) units.append(document.createTextNode(", "));
        const unit = course.units.find(u => u.id === id);
        const button = el("button", unit.title, "plan-text-button");
        button.type = "button";
        button.addEventListener("click", () => {
          window.location.hash = C.route(track.track.id, course.grade, id);
          revealUnit(id);
        });
        units.append(button);
      });
      tr.append(code, label, units); body.append(tr);
    });
    table.append(body); details.append(table); section.append(details);
    return section;
  }
  function renderCourse(track, course) {
    const fragment = document.createDocumentFragment();
    const header = el("header", undefined, "plan-course-heading");
    header.append(el("p", track.track.title + " · " + C.gradeLabel(course.grade), "eyebrow"));
    const heading = el("h2", course.title); heading.id = "planHeading"; heading.tabIndex = -1;
    header.append(heading, el("p", course.levelLabel + " · 36 weeks · Course outline", "plan-meta"), el("p", course.scopeNote));
    fragment.append(header);
    const overview = el("div", undefined, "plan-overview");
    overview.append(block("Bring forward", course.prerequisites), block("Work toward", course.outcomes));
    fragment.append(overview, block("The thread through the year", course.yearBridge), block("Keep in the weekly routine", course.routines));
    const pace = el("nav", undefined, "plan-pacing"); pace.setAttribute("aria-label", "Units in this year");
    const units = C.pacedUnits(course);
    units.forEach(unit => {
      const button = el("button"); button.type = "button";
      button.append(el("small", weeks(unit)), el("span", unit.title));
      button.addEventListener("click", () => {
        window.location.hash = C.route(track.track.id, course.grade, unit.id);
        revealUnit(unit.id);
      });
      pace.append(button);
    });
    fragment.append(el("h2", "The 36-week sequence"), pace);
    units.forEach((unit, index) => {
      const details = el("details", undefined, "plan-unit");
      details.id = "unit-" + unit.id; details.open = index === 0;
      const summary = el("summary");
      summary.append(el("span", weeks(unit), "plan-week"), el("span", unit.title));
      details.append(summary, el("p", unit.focus, "plan-unit-focus"));
      const columns = el("div", undefined, "plan-unit-columns");
      columns.append(block("Learning goals", unit.learning), block("Coursework to develop", unit.activities), block("Look for evidence", unit.evidence));
      details.append(columns, block("Connect to what follows", unit.bridge));
      const refs = el("p", "References: ", "plan-unit-refs");
      unit.standards.forEach((id, i) => {
        const standard = track.standards.find(s => s.id === id);
        const source = track.sources.find(s => s.id === standard.sourceId);
        if (i) refs.append(document.createTextNode(" · "));
        const a = link(id + (standard.kind === "extension" ? " (+)" : ""), source.url);
        a.title = standard.label + " — " + standard.locator;
        refs.append(a);
      });
      details.append(refs); fragment.append(details);
      const permalink = link("Link to this unit", C.route(track.track.id, course.grade, unit.id), "plan-unit-permalink");
      details.append(permalink);
    });
    const related = C.connections(data, track.track.id, course.grade);
    const bridge = el("section", undefined, "plan-connections");
    bridge.append(el("h2", "Carry the learning forward"), el("p", course.nextStep), block("Across subjects", course.crossSubject));
    const nav = el("nav", undefined, "plan-related"); nav.setAttribute("aria-label", "Related year plans");
    if (related.previous) nav.append(courseLink(related.previous, "← " + C.gradeLabel(course.grade - 1)));
    nav.append(link("Subjects at " + C.gradeLabel(course.grade), C.route("grade", course.grade)));
    if (related.next) nav.append(courseLink(related.next, C.gradeLabel(course.grade + 1) + " →"));
    bridge.append(nav);
    if (track.track.id === "common-core-math" && course.grade === 8) {
      const ready = el("p", "Ready to study: ");
      ready.append(link("Grade 8 mathematics lessons and printable practice", "courses.html"), document.createTextNode(" cover Real Numbers, Linear Equations, Functions, and Bivariate Data. The full-year outline also plans geometry beyond that lesson inventory."));
      bridge.append(ready);
    }
    fragment.append(bridge, renderSources(track, course));
    const journey = el("details", undefined, "plan-journey");
    journey.append(el("summary", "Follow this pathway from kindergarten to Grade 12"));
    const ordered = el("ol");
    track.courses.slice().sort((a, b) => a.grade - b.grade).forEach(c => {
      const item = el("li"); const a = link(C.gradeLabel(c.grade) + " · " + c.title, C.route(track.track.id, c.grade));
      if (c.grade === course.grade) a.setAttribute("aria-current", "page");
      item.append(a); ordered.append(item);
    });
    journey.append(ordered); fragment.append(journey);
    return fragment;
  }
  function renderGrade(grade) {
    const section = el("section", undefined, "plan-grade");
    const title = el("h2", C.gradeLabel(grade) + " · Subjects together"); title.id = "planHeading"; title.tabIndex = -1;
    section.append(title, el("p", "Read the subjects side by side to see useful connections. Choose one mathematics pathway and keep reading alongside it. Unit weeks are flexible planning ranges; a shared week number does not imply identical prerequisites."));
    const grid = el("div", undefined, "plan-grade-grid");
    data.tracks.forEach(track => {
      const course = C.courseAt(data, track.track.id, grade).course;
      const card = el("article");
      card.append(el("p", track.track.title, "eyebrow"), el("h3", course.title), el("p", course.levelLabel, "plan-meta"), el("p", course.scopeNote));
      const schedule = el("ol");
      C.pacedUnits(course).forEach(unit => {
        const item = el("li"); item.append(el("small", weeks(unit)), el("strong", unit.title)); schedule.append(item);
      });
      card.append(schedule, el("p", course.crossSubject), courseLink({ track, course }, "Open this year plan →")); grid.append(card);
    });
    section.append(grid);
    const nav = el("nav", undefined, "plan-related"); nav.setAttribute("aria-label", "Adjacent grades");
    if (grade > 0) nav.append(link("← " + C.gradeLabel(grade - 1), C.route("grade", grade - 1)));
    if (grade < 12) nav.append(link(C.gradeLabel(grade + 1) + " →", C.route("grade", grade + 1)));
    section.append(nav); return section;
  }
  data.tracks.forEach(track => { const option = el("option", track.track.title); option.value = track.track.id; trackSelect.append(option); });
  const all = el("option", "Subjects together"); all.value = "grade"; trackSelect.append(all);
  for (let grade = 0; grade <= 12; grade++) {
    const option = el("option", C.gradeLabel(grade)); option.value = grade; gradeSelect.append(option);
  }
  let preservePickerFocus = false;
  function choose() {
    const target = C.route(trackSelect.value, Number(gradeSelect.value));
    if (window.location.hash !== target) {
      preservePickerFocus = true;
      window.location.hash = target;
    }
  }
  trackSelect.addEventListener("change", choose); gradeSelect.addEventListener("change", choose);
  document.querySelector(".plan-filters").addEventListener("submit", event => { event.preventDefault(); choose(); });
  document.getElementById("planPrint").addEventListener("click", () => window.print());
  document.querySelector(".skip-link").addEventListener("click", event => {
    event.preventDefault();
    const main = document.getElementById("main");
    main.focus(); main.scrollIntoView({ block: "start" });
  });
  let closedForPrint = [];
  window.addEventListener("beforeprint", () => {
    closedForPrint = [...container.querySelectorAll("details:not([open])")];
    closedForPrint.forEach(d => { d.open = true; });
  });
  window.addEventListener("afterprint", () => { closedForPrint.forEach(d => { d.open = false; }); closedForPrint = []; });
  function revealUnit(id) {
    const target = document.getElementById("unit-" + id);
    if (!target) return;
    target.open = true; target.querySelector("summary").focus(); target.scrollIntoView({ block: "start" });
  }
  function render(focus) {
    const state = C.resolve(data, window.location.hash);
    trackSelect.value = state.trackId; gradeSelect.value = state.grade;
    const compare = document.getElementById("planCompare"); compare.href = C.route("grade", state.grade); compare.hidden = state.trackId === "grade";
    if (state.trackId === "grade") container.replaceChildren(renderGrade(state.grade));
    else {
      const pair = C.courseAt(data, state.trackId, state.grade);
      container.replaceChildren(renderCourse(pair.track, pair.course));
    }
    const heading = document.getElementById("planHeading");
    document.title = heading.textContent + " — Liminal year plans";
    status.textContent = (state.invalid ? "That plan link was not recognized; showing " : "Showing ") + heading.textContent + ".";
    if (focus) heading.focus();
    if (state.unitId) revealUnit(state.unitId);
  }
  window.addEventListener("hashchange", () => {
    render(!preservePickerFocus);
    preservePickerFocus = false;
  });
  document.getElementById("planBrowser").hidden = false;
  render(false);
})();
