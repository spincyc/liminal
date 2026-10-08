(function () {
  "use strict";
  const index = window.LIMINAL_WEEKLY_INDEX;
  const W = window.LiminalWeekly;
  const R = window.LiminalWeeklyRender;
  const Controls = window.LiminalReaderControls;
  const status = document.getElementById("weeklyStatus");
  if (!index || !W || !R || !Controls || !window.LiminalRender) {
    status.textContent = "Weekly coursework could not be loaded. Reload this page to try again.";
    return;
  }
  if (!Array.isArray(index.courses) || !index.courses.length) {
    status.textContent = "Weekly coursework is not available yet. Explore the year plans while lessons are prepared.";
    return;
  }
  const container = document.getElementById("weeklyContent");
  const trackSelect = document.getElementById("weeklyTrack");
  const gradeSelect = document.getElementById("weeklyGrade");
  const weekSelect = document.getElementById("weeklyWeek");
  const reader = document.getElementById("weeklyBrowser");
  const toolbar = document.getElementById("weeklyToolbar");
  const topNav = document.getElementById("weeklyNavigation");
  const actionSlot = document.getElementById("weeklyActions");
  const lessonActions = Controls.actions([{ label: "Print worked lesson", run: () => window.print() }]);
  actionSlot.append(lessonActions);
  const cache = new Map();
  let request = 0;
  let topNavigation = null;
  let pendingNavigation = null;
  let preservePickerFocus = false;
  let activeView = "learn";
  let preparePrint = null;
  let restorePrint = null;
  reader.addEventListener("click", event => {
    const link = event.target.closest("a[data-reader-step]");
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    pendingNavigation = { href: link.hash, step: link.dataset.readerStep, top: toolbar.contains(link), y: toolbar.getBoundingClientRect().top };
  });
  window.addEventListener("beforeprint", () => {
    if (restorePrint) restorePrint();
    restorePrint = preparePrint ? preparePrint() : null;
  });
  window.addEventListener("afterprint", () => {
    if (restorePrint) restorePrint();
    restorePrint = null;
  });
  function option(label, value) { const node = R.el("option", label); node.value = value; return node; }
  function button(label, action) {
    const node = R.el("button", label); node.type = "button"; node.addEventListener("click", action); return node;
  }
  function announce(text, visible = false) {
    status.textContent = text; status.classList.toggle("weekly-sr", !visible);
  }
  const tracks = [...new Set(index.courses.map(course => course.trackId))];
  tracks.forEach(id => trackSelect.append(option(W.trackLabel(id), id)));
  // Trademark notices for the tracks on offer (for example the AP® disclaimer).
  const pageFooter = document.querySelector("body > footer");
  if (pageFooter) tracks.map(W.trackNotice).filter(Boolean).forEach(notice => pageFooter.append(R.el("p", notice, "weekly-track-notice")));
  function pickers(selected) {
    const named = !!selected.course.courseId;
    trackSelect.value = selected.trackId;
    document.getElementById("weeklyCourseLabel").textContent = named ? "Course" : "Grade";
    gradeSelect.closest("label").classList.toggle("reader-select-wide", named);
    const courses = index.courses.filter(course => course.trackId === selected.trackId).slice();
    if (!named) courses.sort((a, b) => a.grade - b.grade);
    gradeSelect.replaceChildren(...courses.map(course => {
      const node = option(named ? W.courseShortLabel(course) : W.gradeKey(course.grade).toUpperCase(), W.courseKey(course));
      node.setAttribute("aria-label", W.courseLabel(course)); return node;
    }));
    gradeSelect.value = W.courseKey(selected.course);
    weekSelect.replaceChildren(...selected.course.weeks.map(week => {
      const node = option(week.week, week.week); node.setAttribute("aria-label", "Week " + week.week); return node;
    }));
    weekSelect.value = selected.week;
  }
  function choose(event) {
    const course = W.courseAt(index, trackSelect.value, gradeSelect.value) || index.courses.find(c => c.trackId === trackSelect.value);
    const week = event && event.target === weekSelect ? Number(weekSelect.value) : 1;
    const hash = W.route(course.trackId, W.courseKey(course), week);
    if (window.location.hash !== hash) { preservePickerFocus = true; window.location.hash = hash; }
  }
  [trackSelect, gradeSelect, weekSelect].forEach(select => select.addEventListener("change", choose));
  document.querySelector(".weekly-filters").addEventListener("submit", event => { event.preventDefault(); choose(); });
  document.querySelector(".skip-link").addEventListener("click", event => {
    event.preventDefault(); const main = document.getElementById("main"); main.focus(); main.scrollIntoView({ block: "start" });
  });
  function stylesForExport() {
    // Carry local math/print styling into a standalone, offline HTML file.
    return [...document.styleSheets].filter(sheet => /\/(tokens|math|weekly|brand)\.css(?:\?|$)/.test(sheet.href || ""))
      .map(sheet => { try { return [...sheet.cssRules].map(rule => rule.cssText).join("\n"); } catch (_) { return ""; } }).join("\n");
  }
  function exportSheet(course, week, sheetId, answers, print) {
    const packet = answers ? W.answerWorksheet(course, week.week, sheetId) : W.studentWorksheet(course, week.week, sheetId);
    const sourceUrl = new URL("weeks.html" + W.route(course.trackId, W.courseKey(course), week.week), window.location.href).href;
    const doc = R.exportDocument(packet, answers, stylesForExport(), sourceUrl);
    const html = "<!doctype html>\n" + doc.documentElement.outerHTML;
    if (print) {
      const popup = window.open("", "_blank");
      if (!popup) { announce("The print window was blocked. Allow pop-ups for this site, or download the worksheet and print that file.", true); return; }
      popup.opener = null;
      popup.document.open(); popup.document.write(html); popup.document.close();
      const control = popup.document.createElement("button"); control.type = "button"; control.className = "weekly-print-control"; control.textContent = "Print " + (answers ? "answer key" : "student worksheet");
      control.addEventListener("click", () => popup.print()); popup.document.querySelector("main").prepend(control);
      popup.focus();
      announce("The " + (answers ? "answer key" : "student worksheet") + " opened in a separate print window. Use its Print button.");
    } else {
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const anchor = R.link("Download", url);
      anchor.download = "liminal-" + course.trackId + "-" + W.courseKey(course) + "-week-" + week.week + "-" + sheetId + (answers ? "-answers" : "-student") + ".html";
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce("Downloaded " + (answers ? "the separate answer key." : "a student worksheet with blank work space."));
    }
  }
  function practice(course, week, onRead) {
    const section = R.section("Try it yourself");
    section.append(R.el("p", "Choose a worksheet. Show your thinking in the blank space.", "weekly-muted"));
    const toolbar = R.el("div", undefined, "reader-bar reader-toolbar weekly-sheet-tools");
    const selectors = R.el("div", undefined, "reader-selectors");
    const label = R.el("label", "Worksheet", "weekly-sheet-picker reader-select-wide");
    const select = R.el("select");
    week.worksheets.forEach(sheet => select.append(option(sheet.id.toUpperCase() + " · " + sheet.title, sheet.id)));
    label.append(select); selectors.append(label);
    const sheetContent = R.el("div");
    toolbar.append(selectors, Controls.actions([
      { label: "Print student sheet", run: () => exportSheet(course, week, select.value, false, true) },
      { label: "Download student sheet", run: () => exportSheet(course, week, select.value, false, false) },
    ]));
    const answers = R.disclosure("Answer key", "weekly-key-tools");
    const keyControls = Controls.actions([
      { label: "Print answer key", run: () => exportSheet(course, week, select.value, true, true) },
      { label: "Download answer key", run: () => exportSheet(course, week, select.value, true, false) },
    ]);
    const keyContent = R.el("div", undefined, "weekly-item-answer");
    answers.append(keyControls, keyContent);
    function showKey() {
      if (answers.open && !keyContent.childNodes.length) keyContent.append(R.worksheet(W.answerWorksheet(course, week.week, select.value), true, { onRead }));
    }
    function showSheet() {
      answers.open = false; keyContent.replaceChildren();
      sheetContent.replaceChildren(R.worksheet(W.studentWorksheet(course, week.week, select.value), false, { onRead }));
    }
    select.addEventListener("change", () => { showSheet(); announce("Showing worksheet " + select.value.toUpperCase() + "."); });
    answers.addEventListener("toggle", showKey);
    section.append(toolbar, answers, sheetContent); showSheet(); return section;
  }
  function views(course, week) {
    const group = R.el("div", undefined, "weekly-views");
    const tabs = R.el("div", undefined, "weekly-tabs"); tabs.setAttribute("role", "tablist"); tabs.setAttribute("aria-label", "Weekly work");
    const entries = [];
    const math = course.trackId !== "common-core-reading";
    const onRead = () => show("read");
    function add(id, label, build) {
      const tab = button(label, () => show(id)); tab.id = "weekly-tab-" + id;
      tab.setAttribute("role", "tab"); tab.setAttribute("aria-controls", "weekly-panel-" + id);
      const panel = R.el("div"); panel.id = "weekly-panel-" + id; panel.tabIndex = 0;
      panel.setAttribute("role", "tabpanel"); panel.setAttribute("aria-labelledby", tab.id);
      entries.push({ id, tab, panel, build, ready: false }); tabs.append(tab); group.append(panel);
      tab.addEventListener("keydown", event => {
        const index = entries.findIndex(entry => entry.id === id);
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % entries.length;
        else if (event.key === "ArrowLeft") next = (index + entries.length - 1) % entries.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = entries.length - 1;
        else return;
        event.preventDefault(); show(entries[next].id); entries[next].tab.focus();
      });
    }
    function show(id) {
      const selected = entries.find(entry => entry.id === id) || entries[0];
      if (!selected.ready) { selected.panel.append(selected.build()); selected.ready = true; }
      entries.forEach(entry => {
        const current = entry === selected;
        entry.tab.setAttribute("aria-selected", String(current)); entry.tab.tabIndex = current ? 0 : -1;
        entry.panel.hidden = !current;
      });
      activeView = selected.id;
      lessonActions.firstElementChild.textContent = selected.id === "read" ? "Print reading" : "Print worked lesson";
      actionSlot.hidden = selected.id === "worksheets";
    }
    add("learn", "Learn", () => R.guide(week, math, onRead));
    if (week.passages.length) add("read", "Read", () => R.reading(week, math));
    add("worksheets", "Worksheets", () => practice(course, week, onRead));
    // Study lessons print their worked examples; worksheet answers stay hidden.
    // Include referenced reading and restore the learner's disclosure state.
    preparePrint = () => {
      const restores = [];
      const learn = entries.find(entry => entry.id === "learn");
      if (!learn.panel.hidden) {
        restores.push(R.prepareGuidePrint(learn.panel, week, math));
        learn.panel.classList.add("weekly-print-lesson");
        restores.push(() => learn.panel.classList.remove("weekly-print-lesson"));
      }
      const reading = entries.find(entry => entry.id === "read");
      if (reading && reading.panel.hidden) {
        if (!reading.ready) { reading.panel.append(reading.build()); reading.ready = true; }
        reading.panel.hidden = false;
        restores.push(() => { reading.panel.hidden = true; });
      }
      return () => restores.forEach(restore => restore());
    };
    group.prepend(tabs); show(activeView); return group;
  }
  function navigation(selected, position, existing) {
    const pages = W.navigation(index, selected);
    const destination = (href, label) => href ? { href, label } : null;
    return Controls.navigation({
      label: "Week navigation, " + position,
      first: destination(pages.first, "First week"),
      previous: destination(pages.previous, "Previous week, week " + (selected.week - 1)),
      next: destination(pages.next, "Next week, week " + (selected.week + 1)),
      last: destination(pages.last, "Last week, week 36"),
    }, existing);
  }
  async function render(focus) {
    const currentRequest = ++request;
    const movement = pendingNavigation && pendingNavigation.href === window.location.hash ? pendingNavigation : null;
    pendingNavigation = null;
    preparePrint = null; restorePrint = null;
    const selected = W.resolve(index, window.location.hash);
    pickers(selected); container.setAttribute("aria-busy", "true");
    topNavigation = navigation(selected, "top", topNavigation);
    if (!topNavigation.parentElement) topNav.append(topNavigation);
    if (movement && movement.top) Controls.focusNavigation(topNavigation, movement.step);
    lessonActions.firstElementChild.disabled = true;
    // Keep the previous lesson's height while loading, but never export it as
    // the newly selected week or let a tab re-enable its document actions.
    container.querySelectorAll("button, select").forEach(control => { control.disabled = true; });
    announce("Opening " + W.courseLabel(selected.course) + ", week " + selected.week + "…", !container.childElementCount);
    try {
      let course = cache.get(selected.course.file);
      if (!course) {
        const response = await fetch(selected.course.file);
        if (!response.ok) throw new Error("Course unavailable");
        course = await response.json();
        if (course.trackId !== selected.trackId || W.courseKey(course) !== W.courseKey(selected.course) || !Array.isArray(course.weeks)) throw new Error("Course mismatch");
        cache.set(selected.course.file, course);
      }
      if (currentRequest !== request) return;
      const week = W.weekAt(course, selected.week);
      if (!week) throw new Error("Week unavailable");
      const heading = R.el("header", undefined, "weekly-heading");
      heading.append(R.el("p", W.trackLabel(course.trackId) + " · " + W.courseLabel(course) + " · Week " + week.week + " of 36", "weekly-meta"));
      const context = W.courseContext(course.trackId, course.courseId || course.grade);
      if (context) heading.append(R.el("p", context, "weekly-context"));
      const title = R.el("h2", week.title); title.id = "weeklyHeading"; title.tabIndex = -1;
      heading.append(title, R.rich(week.objective, course.trackId !== "common-core-reading"));
      const links = R.el("div", undefined, "weekly-links");
      const yearRoute = W.planRoute(course.trackId, W.courseKey(course));
      links.append(R.link("Year plan", yearRoute), R.link("Unit and standards", yearRoute + "/" + encodeURIComponent(week.unitId)));
      if (course.trackId === "common-core-reading") links.append(R.link("Nightly reading", "daily-reading.html#" + W.courseKey(course) + "/" + week.week + "/1"));
      const N = window.LiminalNavigation;
      const expansion = N && N.moduleAt(window.LIMINAL_LESSON_MODULES, course.trackId, course.grade);
      if (expansion) {
        const topics = (expansion.units || []).filter(topic => (topic.planUnitIds || []).includes(week.unitId));
        if (topics.length) topics.forEach(topic => links.append(R.link("Expanded lessons: " + topic.title, "lessons.html" + N.lessonRoute(course.trackId, course.grade, topic.lessonIds[0]))));
        else links.append(R.link("This grade’s expanded lessons", "lessons.html" + N.lessonRoute(course.trackId, course.grade)));
      }
      heading.append(links);
      const fragment = document.createDocumentFragment();
      fragment.append(heading, views(course, week), navigation(selected, "bottom"));
      container.replaceChildren(fragment);
      lessonActions.firstElementChild.disabled = false;
      document.title = "Week " + week.week + " · " + week.title + " — Liminal";
      announce((selected.invalid ? "That coursework link was not recognized. Showing " : "Showing ") + W.courseLabel(course) + ", week " + week.week + ": " + week.title + ".", selected.invalid);
      if (movement) {
        if (movement.top) window.scrollBy({ top: toolbar.getBoundingClientRect().top - movement.y, behavior: "instant" });
        else { toolbar.scrollIntoView({ block: "start", behavior: "instant" }); Controls.focusNavigation(topNavigation, movement.step); }
      } else if (focus) {
        title.focus({ preventScroll: true });
        toolbar.scrollIntoView({ block: "start", behavior: "instant" });
      }
    } catch (_) {
      if (currentRequest !== request) return;
      cache.delete(selected.course.file);
      announce("This week's coursework could not be loaded. Try again, or choose another week or pathway.", true);
      container.replaceChildren(button("Try again", () => render(false)));
    } finally {
      if (currentRequest === request) container.setAttribute("aria-busy", "false");
    }
  }
  window.addEventListener("hashchange", () => { const focus = !preservePickerFocus; preservePickerFocus = false; render(focus); });
  reader.hidden = false;
  render(false);
})();
