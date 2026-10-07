(function () {
  "use strict";
  const data = window.LIMINAL_CURRICULUM;
  const C = window.LiminalCurriculum;
  const W = window.LiminalWeekly;
  const weeklyIndex = window.LIMINAL_WEEKLY_INDEX;
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
  function disclosure(title, className = "plan-disclosure") {
    const node = el("details", undefined, className);
    node.append(el("summary", title));
    return node;
  }
  function renderSources(track, course) {
    const section = disclosure("Standards and sources", "plan-disclosure plan-sources");
    section.append(el("p", track.track.scopeNote));
    track.sources.forEach(source => {
      const item = el("p");
      item.append(link(source.title, source.url), document.createTextNode(" · " + source.edition + ". Checked " + source.accessed + ". " + source.note));
      section.append(item);
    });
    const refs = C.coverage(track, course);
    const details = disclosure(refs.length + " mapped references", "plan-coverage");
    details.append(el("p", "Planning labels summarize the standards. Follow each source for full wording; mapping does not establish mastery."));
    const records = el("ul", undefined, "plan-reference-list");
    refs.forEach(ref => {
      const item = el("li");
      item.append(link(ref.id, ref.source.url), el("p", ref.label + (ref.kind === "extension" ? " (Extension)" : "")), el("small", ref.locator));
      const units = el("div", undefined, "plan-reference-units");
      C.pacedUnits(course).filter(u => ref.units.includes(u.id)).forEach(unit => {
        const button = el("button", weeks(unit), "plan-text-button");
        button.type = "button";
        button.title = unit.title;
        button.addEventListener("click", () => {
          window.location.hash = C.route(track.track.id, course.grade, unit.id);
          revealUnit(unit.id);
        });
        units.append(button);
      });
      item.append(units); records.append(item);
    });
    details.append(records); section.append(details);
    return section;
  }
  function renderCourse(track, course) {
    const fragment = document.createDocumentFragment();
    const header = el("header", undefined, "plan-course-heading");
    header.append(el("p", C.trackLabel(track.track), "plan-print-pathway"));
    const heading = el("h2", C.courseHeading(track.track, course)); heading.id = "planHeading"; heading.tabIndex = -1;
    header.append(heading, el("p", "36 weeks · Course outline", "plan-meta"));
    const context = C.courseContext(track.track, course);
    if (context) header.append(el("p", context, "plan-context"));
    const weekly = W && weeklyIndex && W.courseAt(weeklyIndex, track.track.id, course.grade);
    if (weekly) header.append(link("Start weekly work →", "weeks.html" + W.route(track.track.id, course.grade, 1), "plan-weekly-start"));
    fragment.append(header);
    const units = C.pacedUnits(course);
    units.forEach(unit => {
      const details = el("details", undefined, "plan-unit");
      details.id = "unit-" + unit.id;
      const summary = el("summary");
      summary.append(el("span", weeks(unit), "plan-week"), el("span", unit.title, "plan-unit-title"));
      const body = el("div", undefined, "plan-unit-body");
      body.append(el("p", unit.focus, "plan-unit-focus"));
      if (weekly) {
        const lessons = el("ol", undefined, "plan-weekly-list");
        weekly.weeks.filter(week => week.unitId === unit.id).forEach(week => {
          const item = el("li");
          item.append(link("Week " + week.week + " · " + week.title, "weeks.html" + W.route(track.track.id, course.grade, week.week)));
          lessons.append(item);
        });
        body.append(lessons);
      }
      const goals = C.unitGoals(unit);
      if (goals.length) body.append(block("Goals", goals));
      const teaching = disclosure("Teaching notes", "plan-unit-notes");
      teaching.append(block("Coursework ideas", unit.activities), block("Check understanding", unit.evidence), block("Next connection", unit.bridge));
      body.append(teaching);
      const refs = disclosure("Standards (" + unit.standards.length + ")", "plan-unit-standards");
      const entries = el("ul");
      unit.standards.forEach(id => {
        const standard = track.standards.find(s => s.id === id);
        const source = track.sources.find(s => s.id === standard.sourceId);
        const item = el("li");
        const a = link(id + (standard.kind === "extension" ? " (+)" : ""), source.url);
        a.title = standard.label + " — " + standard.locator;
        item.append(a, el("span", standard.label)); entries.append(item);
      });
      refs.append(entries); body.append(refs);
      body.append(link("Link to unit", C.route(track.track.id, course.grade, unit.id), "plan-unit-permalink"));
      details.append(summary, body); fragment.append(details);
    });
    const related = C.connections(data, track.track.id, course.grade);
    const nav = el("nav", undefined, "plan-related"); nav.setAttribute("aria-label", "Adjacent year plans");
    if (related.previous) nav.append(courseLink(related.previous, "← " + C.gradeLabel(course.grade - 1)));
    if (related.next) nav.append(courseLink(related.next, C.gradeLabel(course.grade + 1) + " →"));
    fragment.append(nav);
    if (track.track.id === "common-core-math" && course.grade === 8) {
      const ready = el("p", undefined, "plan-ready");
      ready.append(link("Study Grade 8 math →", "courses.html"), el("small", "Lessons and practice for four topics."));
      fragment.append(ready);
    }
    const overview = disclosure("About this year");
    overview.append(el("p", course.title), el("p", course.scopeNote), block("Starting points", course.prerequisites), block("Year goals", course.outcomes), block("How the year connects", course.yearBridge), block("Weekly routine", course.routines), block("Next year", course.nextStep), block("Across subjects", course.crossSubject));
    fragment.append(overview, renderSources(track, course));
    const journey = disclosure("Other grades", "plan-disclosure plan-journey");
    const ordered = el("ol");
    track.courses.slice().sort((a, b) => a.grade - b.grade).forEach(c => {
      const item = el("li"); const a = link(C.gradeLabel(c.grade), C.route(track.track.id, c.grade));
      if (c.grade === course.grade) a.setAttribute("aria-current", "page");
      item.append(a); ordered.append(item);
    });
    journey.append(ordered); fragment.append(journey);
    return fragment;
  }
  function renderGrade(grade) {
    const section = el("section", undefined, "plan-grade");
    const title = el("h2", C.gradeLabel(grade)); title.id = "planHeading"; title.tabIndex = -1;
    section.append(title, el("p", "Choose one math pathway, with reading alongside.", "plan-context"));
    const grid = el("div", undefined, "plan-grade-grid");
    data.tracks.forEach(track => {
      const course = C.courseAt(data, track.track.id, grade).course;
      const card = el("article");
      card.append(el("h3", C.trackLabel(track.track)), el("p", "36 weeks · " + course.units.length + " units · Outline", "plan-meta"));
      const context = C.courseContext(track.track, course);
      if (context) card.append(el("p", context, "plan-context"));
      const details = disclosure("Units and connections");
      const schedule = el("ol");
      C.pacedUnits(course).forEach(unit => {
        const item = el("li"); item.append(el("small", weeks(unit)), courseLink({ track, course }, unit.title));
        item.lastChild.href = C.route(track.track.id, grade, unit.id);
        schedule.append(item);
      });
      details.append(schedule, el("p", course.crossSubject));
      card.append(courseLink({ track, course }, "Open plan →"), details); grid.append(card);
    });
    section.append(grid);
    const nav = el("nav", undefined, "plan-related"); nav.setAttribute("aria-label", "Adjacent grades");
    if (grade > 0) nav.append(link("← " + C.gradeLabel(grade - 1), C.route("grade", grade - 1)));
    if (grade < 12) nav.append(link(C.gradeLabel(grade + 1) + " →", C.route("grade", grade + 1)));
    section.append(nav); return section;
  }
  data.tracks.forEach(track => { const option = el("option", C.trackLabel(track.track)); option.value = track.track.id; trackSelect.append(option); });
  const all = el("option", "Compare subjects"); all.value = "grade"; trackSelect.append(all);
  for (let grade = 0; grade <= 12; grade++) {
    const option = el("option", C.gradeKey(grade).toUpperCase()); option.value = grade; option.setAttribute("aria-label", C.gradeLabel(grade)); gradeSelect.append(option);
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
    status.classList.toggle("sr-only", !state.invalid);
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
