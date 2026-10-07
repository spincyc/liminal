(function () {
  "use strict";
  const data = window.LIMINAL_HIGH_SCHOOL;
  const H = window.LiminalHighSchool;
  const W = window.LiminalWeekly;
  const index = window.LIMINAL_WEEKLY_INDEX;
  const status = document.getElementById("highSchoolStatus");
  if (!data || !H || !W || !Array.isArray(data.courses) || !data.courses.length) {
    status.textContent = "The course plans could not be loaded. Reload this page to try again.";
    return;
  }
  const container = document.getElementById("highSchoolContent");
  const navigation = document.getElementById("highSchoolCourses");
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function link(text, href) { const node = el("a", text); node.href = href; return node; }
  function list(values) { const node = el("ul"); (values || []).forEach(value => node.append(el("li", value))); return node; }
  function disclosure(label, className) { const node = el("details", undefined, className); node.append(el("summary", label)); return node; }
  function teachingBlock(title, values) {
    const block = el("section"); block.append(el("h3", title), Array.isArray(values) ? list(values) : el("p", values)); return block;
  }
  function weeklyLink(course, week, label) {
    return index && W.courseAt(index, "high-school-math", course.id) ? link(label, "weeks.html" + W.route("high-school-math", course.id, week)) : null;
  }
  function references(unit) {
    const node = disclosure("Standards and scope references", "high-school-standards");
    const items = el("ul");
    unit.standards.forEach(id => {
      const standard = data.standards.find(entry => entry.id === id);
      const source = standard && data.sources.find(entry => entry.id === standard.sourceId);
      const item = el("li");
      if (source && /^https:\/\//i.test(source.url)) item.append(link(id, source.url));
      else item.append(el("span", id));
      if (standard) item.append(el("p", standard.label + (standard.kind === "extension" ? " (Extension)" : standard.kind === "editorial-objective" ? " (Editorial objective)" : "")), el("small", standard.locator));
      items.append(item);
    });
    node.append(items); return node;
  }
  function renderCourse(course) {
    const article = el("article", undefined, "high-school-course");
    const header = el("header"); const title = el("h2", course.title); title.id = "highSchoolHeading"; title.tabIndex = -1;
    header.append(el("p", "36 weeks · Course plan", "weekly-meta"), title, el("p", course.summary || course.scopeNote));
    const tools = el("div", undefined, "weekly-actions high-school-print-tools");
    const ready = weeklyLink(course, 1, "Open weekly work →");
    if (ready) tools.append(ready); else tools.append(el("span", "Weekly work is being prepared.", "weekly-meta"));
    const print = el("button", "Print plan"); print.type = "button"; print.addEventListener("click", () => window.print()); tools.append(print);
    header.append(tools); article.append(header);
    H.pacedUnits(course).forEach(unit => {
      const node = el("details", undefined, "high-school-unit"); node.id = "high-school-unit-" + unit.id;
      const summary = el("summary"); summary.append(el("span", "Weeks " + unit.startWeek + "–" + unit.endWeek, "high-school-unit-week"), el("span", unit.title, "high-school-unit-title"));
      const body = el("div", undefined, "high-school-unit-body");
      body.append(el("p", unit.focus), teachingBlock("Goals", unit.learning));
      const teaching = disclosure("Teaching and practice"); teaching.append(teachingBlock("Coursework", unit.activities), teachingBlock("Check understanding", unit.evidence), teachingBlock("Next connection", unit.bridge));
      body.append(teaching, references(unit));
      const links = el("div", undefined, "weekly-links");
      const work = weeklyLink(course, unit.startWeek, "Start week " + unit.startWeek); if (work) links.append(work);
      links.append(link("Link to unit", H.route(course.id, unit.id))); body.append(links);
      node.append(summary, body); article.append(node);
    });
    const notes = disclosure("Scope and starting points", "high-school-notes");
    notes.append(el("p", course.scopeNote), teachingBlock("Starting points", course.prerequisites), teachingBlock("Course goals", course.goals)); article.append(notes);
    const sources = disclosure("Sources and alignment notes", "high-school-notes high-school-sources");
    sources.append(el("p", "This conventional sequence uses editorial scope and flexible placement. Linked standards and texts are references, not a claim of complete alignment or official certification."));
    (data.sources || []).forEach(source => {
      const paragraph = el("p");
      if (/^https:\/\//i.test(source.url)) paragraph.append(link(source.title, source.url)); else paragraph.append(el("span", source.title));
      paragraph.append(document.createTextNode(" · " + source.edition + ". Checked " + source.accessed + ". " + source.note)); sources.append(paragraph);
    });
    article.append(sources); return article;
  }
  function render(focus) {
    const selected = H.resolve(data, window.location.hash);
    if (!selected.course) { status.textContent = "No course plan is available yet."; return; }
    navigation.replaceChildren(...H.courses(data).map(course => {
      const anchor = link(course.title, H.route(course.id));
      if (course.id === selected.course.id) anchor.setAttribute("aria-current", "page"); return anchor;
    }));
    container.replaceChildren(renderCourse(selected.course));
    document.title = selected.course.title + " — Liminal high-school math";
    status.classList.toggle("weekly-sr", !selected.invalid);
    status.textContent = (selected.invalid ? "That course link was not recognized. Showing " : "Showing ") + selected.course.title + ".";
    if (selected.unitId) {
      const unit = document.getElementById("high-school-unit-" + selected.unitId);
      if (unit) { unit.open = true; unit.querySelector("summary").focus(); unit.scrollIntoView({ block: "start" }); }
    } else if (focus) document.getElementById("highSchoolHeading").focus();
  }
  document.querySelector(".skip-link").addEventListener("click", event => {
    event.preventDefault(); const main = document.getElementById("main"); main.focus(); main.scrollIntoView({ block: "start" });
  });
  let printDisclosures = [];
  window.addEventListener("beforeprint", () => {
    printDisclosures = [...container.querySelectorAll("details:not([open])")]; printDisclosures.forEach(node => { node.open = true; });
  });
  window.addEventListener("afterprint", () => { printDisclosures.forEach(node => { node.open = false; }); printDisclosures = []; });
  window.addEventListener("hashchange", () => render(true));
  document.getElementById("highSchoolBrowser").hidden = false;
  render(false);
})();
