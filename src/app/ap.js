/* ap.html: course plans, unit tests, practice exams and formula references
   for the AP® course modules. Routes (LiminalAp.resolve): "#" all courses,
   "#<course>[/u<n>]" a plan, "#<course>/test/<id>" a student copy,
   "#<course>/test/<id>/key" its answer key, "#<course>/reference". Student
   and key copies are separate routes, so a printout carries only one. Plan
   pacing reuses LiminalHighSchool.pacedUnits; weekly links use LiminalWeekly. */
(function () {
  "use strict";
  const plan = window.LIMINAL_AP_PLAN;
  const data = window.LIMINAL_AP;
  const A = window.LiminalAp;
  const R = window.LiminalApRender;
  const H = window.LiminalHighSchool;
  const W = window.LiminalWeekly;
  const index = window.LIMINAL_WEEKLY_INDEX;
  const status = document.getElementById("apStatus");
  if (!plan || !Array.isArray(plan.courses) || !data || !A || !R || !H || !window.LiminalRender) {
    status.textContent = "The course plans could not be loaded. Reload this page to try again.";
    return;
  }
  const container = document.getElementById("apContent");
  const navigation = document.getElementById("apCourses");
  const cache = new Map();
  let request = 0;
  const el = R.el, link = R.link;
  function list(values) { const node = el("ul"); (values || []).forEach(value => node.append(el("li", value))); return node; }
  function disclosure(label, className) { const node = el("details", undefined, className); node.append(el("summary", label)); return node; }
  function block(title, values) { const node = el("section"); node.append(el("h3", title), Array.isArray(values) ? list(values) : el("p", values)); return node; }
  function button(label, action) { const node = el("button", label); node.type = "button"; node.addEventListener("click", action); return node; }
  async function printReady() {
    try {
      if (document.fonts) {
        const faces = await Promise.all(["", "bold ", "italic ", "bold italic "].map(face => document.fonts.load(face + '10pt "Liminal Reading Serif"')));
        if (faces.some(loaded => !loaded.length)) throw new Error("Print font unavailable");
        await document.fonts.ready;
      }
      window.print();
    } catch (_) { status.classList.toggle("weekly-sr", false); status.textContent = "The print typeface could not load. Reload the page and try printing again."; }
  }
  function standard(id) { return (plan.standards || []).find(s => s.id === id); }
  function source(id) { return (plan.sources || []).find(s => s.id === id); }
  function externalLink(entry) { return entry && /^https:\/\//i.test(entry.url) ? link(entry.title, entry.url) : el("span", entry ? entry.title : ""); }
  function weeklyHref(course, week) {
    if (!W || !index || !W.courseAt(index, "ap", course.id)) return "";
    return "weeks.html" + W.route("ap", course.id, week);
  }
  function available(course, id) { return (data.assessments || []).find(a => a.courseId === course.id && a.id === id) || null; }
  function referenceEntry(course) { return course.reference ? (data.references || []).find(r => r.courseId === course.id) || null : null; }
  function assessmentLinks(course, id, label) {
    const node = el("p", undefined, "ap-test-links");
    const entry = available(course, id);
    node.append(el("span", label + ": ", "ap-test-label"));
    if (!entry) { node.append(el("span", "in preparation", "weekly-meta")); return node; }
    node.append(link("Student copy", A.route(course.id, "student", id)), document.createTextNode(" · "), link("Answer key", A.route(course.id, "key", id)),
      el("span", " · " + entry.mc + " MC, " + entry.fr + " FR, " + entry.minutes + " min", "weekly-meta"));
    return node;
  }
  function scoreNote() { return el("p", "Unit tests and the practice exam report raw points by section and unit. They are practice, not AP scores, and give no score conversion. For official practice, use College Board's Bluebook previews and released materials.", "ap-note"); }

  function renderHub() {
    const article = el("article", undefined, "ap-hub");
    const title = el("h2", plan.track.title); title.id = "apHeading"; title.tabIndex = -1; title.className = "ap-sr";
    article.append(title, el("p", "Each course runs 36 weeks, unit by unit, with a test at the end of every unit and a full-length, printable practice exam.", "ap-lede"));
    const grid = el("div", undefined, "ap-cards");
    A.planCourses(plan).forEach(course => {
      const card = el("section", undefined, "ap-card");
      const heading = el("h3"); heading.append(link(course.title, A.route(course.id))); card.append(heading, el("p", course.summary));
      const links = el("p", undefined, "ap-card-links");
      links.append(link("Course plan", A.route(course.id)));
      const weekly = weeklyHref(course, 1);
      if (weekly) links.append(document.createTextNode(" · "), link("Weekly work", weekly));
      if (available(course, "practice-exam")) links.append(document.createTextNode(" · "), link("Practice exam", A.route(course.id, "student", "practice-exam")));
      if (referenceEntry(course)) links.append(document.createTextNode(" · "), link("Formula reference", A.route(course.id, "reference")));
      card.append(links); grid.append(card);
    });
    article.append(grid, scoreNote());
    const about = disclosure("About these courses", "ap-notes");
    about.append(el("p", plan.track.scopeNote), el("p", "The physics courses use paper investigations with supplied data. They do not replace the hands-on lab work the AP® physics courses require."));
    article.append(about);
    return article;
  }

  function examFormat(course) {
    const exam = course.exam;
    const node = disclosure("Exam format (" + exam.effective + ")", "ap-notes ap-exam");
    const table = el("table", undefined, "ap-table");
    const head = el("tr"); ["Section", "Questions", "Minutes", "Calculator"].forEach(h => { const th = el("th", h); th.scope = "col"; head.append(th); });
    const thead = el("thead"); thead.append(head); table.append(thead);
    const body = el("tbody");
    exam.sections.forEach(section => section.parts.forEach(part => {
      const row = el("tr"); const th = el("th", "Section " + section.id + (section.parts.length > 1 ? " Part " + part.id : "") + ": " + section.title + " (" + section.weight + ")"); th.scope = "row";
      row.append(th, el("td", String(part.questions)), el("td", String(part.minutes)), el("td", A.calculatorLabel(part.calculator))); body.append(row);
    }));
    table.append(body);
    node.append(table, list([...exam.notes, exam.calculator, exam.reference, exam.delivery]));
    const credit = el("p", "Checked " + exam.checked + ". Source: ", "weekly-meta"); credit.append(externalLink(source(exam.sourceId))); node.append(credit);
    return node;
  }
  function references(unit) {
    const node = disclosure("Framework topics", "high-school-standards");
    const items = el("ul");
    unit.standards.forEach(id => {
      const entry = standard(id);
      const item = el("li");
      item.append(el("span", id + (entry ? " · " + entry.label : ""), entry && entry.kind === "editorial-objective" ? "ap-editorial" : ""));
      if (entry && entry.kind === "editorial-objective") item.append(el("small", " (Editorial objective)"));
      items.append(item);
    });
    node.append(items); return node;
  }
  function weekList(course, unit) {
    const node = disclosure("Weeks " + unit.startWeek + "–" + unit.endWeek, "ap-weeks");
    const items = el("ol", undefined, "ap-week-list");
    course.schedule.filter(entry => entry.unitId === unit.id).forEach(entry => {
      const li = el("li"); li.setAttribute("value", String(entry.week));
      const href = weeklyHref(course, entry.week);
      const label = "Week " + entry.week + ": " + entry.title;
      li.append(href ? link(label, href) : el("span", label));
      const marks = [entry.investigation ? "paper investigation" : "", entry.assessment === "practice-exam" ? "practice exam" : entry.assessment ? "unit test" : ""].filter(Boolean);
      if (marks.length) li.append(el("span", " · " + marks.join(" · "), "weekly-meta"));
      items.append(li);
    });
    node.append(items); return node;
  }
  function renderPlan(course) {
    const article = el("article", undefined, "high-school-course ap-course");
    const header = el("header");
    const title = el("h2", course.title); title.id = "apHeading"; title.tabIndex = -1;
    header.append(el("p", "36 weeks · Course plan", "weekly-meta"), title, el("p", course.summary));
    const tools = el("div", undefined, "reader-actions ap-print-tools");
    const weekly = weeklyHref(course, 1);
    if (weekly) tools.append(link("Open weekly work →", weekly)); else tools.append(el("span", "Weekly work is being prepared.", "weekly-meta"));
    if (available(course, "practice-exam")) tools.append(link("Practice exam", A.route(course.id, "student", "practice-exam")));
    if (referenceEntry(course)) tools.append(link("Formula reference", A.route(course.id, "reference")));
    tools.append(button("Print plan", () => printReady()));
    header.append(tools);
    if (course.labNote) header.append(el("p", course.labNote, "ap-note"));
    header.append(scoreNote(), examFormat(course));
    article.append(header);
    H.pacedUnits(course).forEach(unit => {
      const node = el("details", undefined, "high-school-unit"); node.id = "ap-unit-" + unit.id;
      const summary = el("summary");
      summary.append(el("span", "Weeks " + unit.startWeek + "–" + unit.endWeek, "high-school-unit-week"), el("span", (unit.unit ? "Unit " + unit.unit + ": " : "") + unit.title, "high-school-unit-title"));
      const body = el("div", undefined, "high-school-unit-body");
      body.append(el("p", unit.focus));
      if (unit.mcWeight) body.append(el("p", "Exam multiple-choice weighting: " + unit.mcWeight, "weekly-meta"));
      body.append(block("Goals", unit.learning));
      const teaching = disclosure("Teaching and practice"); teaching.append(block("Coursework", unit.activities), block("Check understanding", unit.evidence), block("Next connection", unit.bridge));
      body.append(teaching, weekList(course, unit), references(unit));
      body.append(assessmentLinks(course, unit.test, unit.test === "practice-exam" ? "Practice exam (week " + course.schedule.find(e => e.assessment === "practice-exam").week + ")" : "Unit test (week " + unit.endWeek + ")"));
      const links = el("div", undefined, "weekly-links");
      const start = weeklyHref(course, unit.startWeek); if (start) links.append(link("Start week " + unit.startWeek, start));
      links.append(link("Link to unit", A.route(course.id, "unit", unit.id))); body.append(links);
      node.append(summary, body); article.append(node);
    });
    const notes = disclosure("Scope and starting points", "high-school-notes");
    notes.append(el("p", course.scopeNote), block("Starting points", course.prerequisites));
    if (Array.isArray(course.prerequisiteLinks) && course.prerequisiteLinks.length) {
      const p = el("p", "Related plans: ");
      course.prerequisiteLinks.forEach((entry, i) => { if (i) p.append(document.createTextNode(" · ")); p.append(link(entry.label, entry.href)); });
      notes.append(p);
    }
    notes.append(block("Course goals", course.outcomes), block("After this course", course.nextStep), block("Calculators and references", [course.calculatorNote, course.referenceNote]));
    article.append(notes);
    const sources = disclosure("Sources and alignment notes", "high-school-notes high-school-sources");
    sources.append(el("p", "Topic numbers and titles identify alignment with College Board's course framework. They are references, not a claim of authorization or endorsement."));
    (plan.sources || []).filter(s => s.id.endsWith(course.id) || s.id.startsWith("ced-" + course.id)).forEach(entry => {
      const p = el("p"); p.append(externalLink(entry), document.createTextNode(" · " + entry.edition + ". Checked " + entry.accessed + ". " + entry.note)); sources.append(p);
    });
    article.append(sources);
    return article;
  }

  function assessmentTools(course, selected, entry) {
    const tools = el("div", undefined, "reader-actions ap-print-tools");
    tools.append(link("← " + course.shortTitle + " plan", A.route(course.id, "unit", (course.units.find(u => u.test === selected.assessmentId) || {}).id)));
    const copies = el("nav", undefined, "ap-copies"); copies.setAttribute("aria-label", "Copy");
    [["student", "Student copy"], ["key", "Answer key"]].forEach(([copy, label]) => {
      const a = link(label, A.route(course.id, copy, selected.assessmentId)); if (selected.copy === copy) a.setAttribute("aria-current", "page"); copies.append(a);
    });
    tools.append(copies, button(selected.copy === "key" ? "Print answer key" : "Print student copy", () => printReady()));
    return tools;
  }
  async function load(file) {
    if (!cache.has(file)) {
      const pending = fetch(file).then(response => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      });
      cache.set(file, pending);
      pending.catch(() => { if (cache.get(file) === pending) cache.delete(file); });
    }
    return cache.get(file);
  }
  async function renderAssessment(course, selected, token) {
    const entry = available(course, selected.assessmentId);
    const wrap = el("div", undefined, "ap-assessment");
    wrap.append(assessmentTools(course, selected, entry));
    if (!entry) {
      const title = el("h2", (selected.assessmentId === "practice-exam" ? "Practice exam" : "Unit " + selected.assessmentId.slice(5) + " test")); title.id = "apHeading"; title.tabIndex = -1;
      wrap.append(title, el("p", "This assessment is being prepared."));
      return wrap;
    }
    const doc = await load(entry.file);
    const ref = referenceEntry(course);
    const reference = ref && selected.copy === "student" ? await load(ref.file) : null;
    if (token !== request) return null;
    const context = course.title;
    if (selected.copy === "key") {
      wrap.append(R.key(A.keyCopy(doc), { context,
        topicLabel: id => { const s = standard(id); return s ? s.label : ""; },
        unitTitle: n => { const u = course.units.find(unit => unit.unit === n); return u ? u.title : ""; } }));
    } else wrap.append(R.booklet(A.studentCopy(doc), { context, reference }));
    return wrap;
  }
  async function renderReference(course, token) {
    const entry = referenceEntry(course);
    const wrap = el("div", undefined, "ap-assessment");
    const tools = el("div", undefined, "reader-actions ap-print-tools");
    tools.append(link("← " + course.shortTitle + " plan", A.route(course.id)), button("Print reference", () => printReady()));
    wrap.append(tools);
    if (!entry) {
      const title = el("h2", "Formula reference"); title.id = "apHeading"; title.tabIndex = -1;
      wrap.append(title, el("p", "This reference is being prepared."), el("p", course.referenceNote));
      return wrap;
    }
    const ref = await load(entry.file);
    if (token !== request) return null;
    wrap.append(R.referenceSheet(ref, { note: course.referenceNote }));
    return wrap;
  }

  async function render(focus) {
    const token = ++request;
    const selected = A.resolve(plan, window.location.hash);
    const current = selected.course ? selected.course.id : "";
    const nav = [link("All courses", "#"), ...A.planCourses(plan).map(course => link(course.shortTitle, A.route(course.id)))];
    nav.forEach((anchor, i) => { if ((i === 0 && !current) || (i > 0 && A.planCourses(plan)[i - 1].id === current)) anchor.setAttribute("aria-current", "page"); });
    navigation.replaceChildren(...nav);
    document.body.dataset.view = selected.view;
    let node;
    container.setAttribute("aria-busy", "true");
    // Remove the previous copy before any network wait: a student route must
    // never leave an earlier answer key visible or available to print.
    container.replaceChildren(el("p", "Loading…"));
    try {
      if (selected.view === "hub") node = renderHub();
      else if (selected.view === "plan") node = renderPlan(selected.course);
      else if (selected.view === "reference") node = await renderReference(selected.course, token);
      else node = await renderAssessment(selected.course, selected, token);
    } catch (error) {
      if (token !== request) return;
      node = el("p", "This document could not be loaded. Check the connection and reload the page.");
    }
    if (token !== request || !node) return;
    container.replaceChildren(node);
    container.setAttribute("aria-busy", "false");
    const name = selected.course ? selected.course.title + (selected.view === "assessment" ? " · " + (selected.copy === "key" ? "Answer key" : "Student copy") : "") : plan.track.title;
    document.title = name + " — Liminal";
    status.classList.toggle("weekly-sr", !selected.invalid);
    status.textContent = (selected.invalid ? "That link was not recognized. Showing " : "Showing ") + name + ".";
    if (selected.unitId) {
      const unit = document.getElementById("ap-unit-" + selected.unitId);
      if (unit) { unit.open = true; unit.querySelector("summary").focus(); unit.scrollIntoView({ block: "start" }); }
    } else if (focus) { const heading = document.getElementById("apHeading"); if (heading) heading.focus(); }
  }
  document.querySelector(".skip-link").addEventListener("click", event => {
    event.preventDefault(); const main = document.getElementById("main"); main.focus(); main.scrollIntoView({ block: "start" });
  });
  // Print opens plan disclosures. Reference notes and the required footer
  // finish the final column flow, without becoming a separate credit page.
  let printDisclosures = [];
  let restoreFooter = null;
  window.addEventListener("beforeprint", () => {
    if (restoreFooter) restoreFooter();
    restoreFooter = null;
    printDisclosures = [...container.querySelectorAll("details:not([open])")];
    printDisclosures.forEach(node => { node.open = true; });
    const flow = [...container.querySelectorAll(".ap-reference-body")].at(-1);
    const footer = document.querySelector("body > footer");
    if (flow && footer) {
      const parent = footer.parentNode, next = footer.nextSibling;
      flow.append(footer); footer.classList.add("worksheet-footer");
      restoreFooter = () => { parent.insertBefore(footer, next); footer.classList.remove("worksheet-footer"); };
    }
  });
  window.addEventListener("afterprint", () => {
    printDisclosures.forEach(node => { node.open = false; }); printDisclosures = [];
    if (restoreFooter) restoreFooter();
    restoreFooter = null;
  });
  window.addEventListener("hashchange", () => render(true));
  document.getElementById("apBrowser").hidden = false;
  render(false);
})();
