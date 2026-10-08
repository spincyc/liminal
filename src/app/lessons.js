(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const N = window.LiminalNavigation;
  const state = { entry: null, loading: false, course: null, selected: new Set(), nights: [], choices: {}, sheets: [], job: null, styles: null, exportBusy: false, readId: null, mode: "study" };

  const stylesheets = ["styles/tokens.css", "styles/app.css", "styles/math.css", "styles/courses.css"];
  let catalog = [];
  let request = 0;
  const moduleCache = new Map();
  const scriptCache = new Map();

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function error(message) {
    $("courseError").textContent = message || "";
    $("courseError").hidden = !message;
  }

  function options(select, entries, selected) {
    select.replaceChildren();
    entries.forEach((entry) => {
      const option = element("option", "", entry.label);
      option.value = entry.value;
      select.appendChild(option);
    });
    if (entries.some((entry) => entry.value === selected)) select.value = selected;
  }

  function unique(values) { return [...new Set(values.map(String))]; }
  function gradeLabel(grade) { return String(grade).toLowerCase() === "k" || Number(grade) === 0 ? "Kindergarten" : `Grade ${grade}`; }
  function selectedIds() { return state.course.units.flatMap((unit) => unit.lessons.filter((lesson) => state.selected.has(lesson.id)).map((lesson) => lesson.id)); }

  function setExportButtons() {
    document.querySelectorAll("[data-course-export]").forEach((button) => {
      button.disabled = state.loading || state.exportBusy || (button.dataset.courseExport === "guide" ? !state.selected.size : !state.sheets.length || !!state.job);
    });
  }

  function cancel(message) {
    if (state.job) {
      const job = state.job;
      state.job = null;
      job.worker.terminate();
      clearTimeout(job.timeout);
      URL.revokeObjectURL(job.url);
      const reason = new Error("Cancelled");
      reason.name = "AbortError";
      job.reject(reason);
    }
    $("courseCancel").hidden = true;
    $("courseBuild").disabled = !state.selected.size;
    $("courseBuild").textContent = "Make practice";
    $("courseForm").removeAttribute("aria-busy");
    if (message) $("courseBuildStatus").textContent = message;
    setExportButtons();
  }

  function invalidate() {
    cancel();
    state.nights = [];
    state.choices = {};
    state.sheets = [];
    $("coursePacketSection").hidden = true;
    $("coursePreview").replaceChildren();
    $("courseBuildStatus").textContent = "Practice will use your selected lessons.";
    const count = Number($("courseCount").value);
    const days = Number($("courseDays").value);
    $("courseAmountSummary").textContent = `${count || "—"} question${count === 1 ? "" : "s"} · ${days || "—"} night${days === 1 ? "" : "s"}`;
    error("");
    setExportButtons();
  }

  function showMode(mode, focus) {
    state.mode = mode;
    const study = mode === "study";
    $("courseGuideDetails").hidden = !study;
    $("coursePracticePanel").hidden = study;
    $("courseRead").setAttribute("aria-pressed", String(study));
    $("coursePractice").setAttribute("aria-pressed", String(!study));
    if (focus) {
      const heading = $(study ? "courseStudyHeading" : "builderHeading");
      heading.focus({ preventScroll: true });
      $(study ? "courseGuideDetails" : "coursePracticePanel").scrollIntoView({ block: "start", behavior: "auto" });
    }
  }

  function readLesson(focus = false, historyMode = "push") {
    const id = $("courseReadLesson").value;
    state.readId = id || null;
    $("courseGuide").replaceChildren();
    if (id) $("courseGuide").appendChild(LiminalCourseRender.renderGuide(state.course, [id], { compact: true, interactive: true }));
    else $("courseGuide").appendChild(element("p", "course-empty", "Choose a lesson in the Lessons menu to begin reading."));
    const select = $("courseReadLesson"), index = select.selectedIndex, count = select.options.length;
    const destination = position => ({ run() { select.selectedIndex = position; readLesson(true); } });
    for (const placement of ["Top", "Bottom"]) {
      const container = $("courseReadNavigation" + placement);
      container.replaceChildren();
      container.hidden = count < 2;
      if (count > 1) container.append(window.LiminalReaderControls.navigation({
        label: "Selected lessons, " + placement.toLowerCase() + ", " + (index + 1) + " of " + count,
        first: index > 0 ? destination(0) : null,
        previous: index > 0 ? destination(index - 1) : null,
        next: index < count - 1 ? destination(index + 1) : null,
        last: index < count - 1 ? destination(count - 1) : null,
      }));
    }
    $("courseReadLesson").disabled = !id;
    $("coursePracticeLesson").disabled = !id;
    $("coursePracticeLessonTop").disabled = !id;
    if (id && state.entry && !state.loading && historyMode !== "none") {
      const hash = N.lessonRoute(state.entry.trackId, state.entry.grade, id);
      if (window.location.hash !== hash) window.history[historyMode === "replace" ? "replaceState" : "pushState"](null, "", hash);
    }
    if (focus) {
      const heading = $("courseGuide").querySelector(".course-lesson-intro h3") || $("courseStudyHeading");
      heading.tabIndex = -1; heading.focus({ preventScroll: true });
      $("courseGuideDetails").scrollIntoView({ block: "start" });
    }
  }

  function updateSelection(preserveRoute = false) {
    document.querySelectorAll("[data-lesson-id]").forEach((input) => { input.checked = state.selected.has(input.dataset.lessonId); });
    document.querySelectorAll("[data-unit-id]").forEach((input) => {
      const unit = state.course.units.find((item) => item.id === input.dataset.unitId);
      const count = unit.lessons.filter((lesson) => state.selected.has(lesson.id)).length;
      input.checked = count === unit.lessons.length;
      input.indeterminate = count > 0 && count < unit.lessons.length;
    });
    const all = state.course.units.flatMap((unit) => unit.lessons);
    const selected = all.filter((lesson) => state.selected.has(lesson.id));
    $("courseSelectionCount").textContent = `${selected.length} of ${all.length} lessons selected${selected.length ? "." : ". Choose at least one lesson."}`;
    $("courseSelectionLabel").textContent = `${selected.length} selected`;
    $("coursePracticeSelection").textContent = selected.length === 1
      ? `${selected[0].id} · ${selected[0].title}`
      : selected.length ? `${selected.length} selected lessons` : "Choose a lesson in the Lessons menu.";
    $("courseBuild").disabled = !selected.length;
    options($("courseReadLesson"), selected.map((lesson) => ({ value: lesson.id, label: `${lesson.id} · ${lesson.title}` })), state.readId);
    readLesson(false, preserveRoute ? "none" : "replace");
    setExportButtons();
  }

  function showLessons() {
    const container = $("courseLessons");
    container.replaceChildren();
    state.course.units.forEach((unit) => {
      const details = element("details", "course-unit");
      details.open = unit.lessons.some((lesson) => state.selected.has(lesson.id));
      details.appendChild(element("summary", "", unit.title));
      const allLabel = element("label", "course-unit-choice");
      const all = element("input");
      all.type = "checkbox";
      all.dataset.unitId = unit.id;
      all.addEventListener("change", () => {
        unit.lessons.forEach((lesson) => { if (all.checked) state.selected.add(lesson.id); else state.selected.delete(lesson.id); });
        invalidate();
        updateSelection();
      });
      allLabel.append(all, element("span", "", "All lessons in this topic"));
      details.appendChild(allLabel);
      const choices = element("div", "course-lesson-choices");
      unit.lessons.forEach((lesson) => {
        const label = element("label", "course-lesson-choice");
        const input = element("input");
        input.type = "checkbox";
        input.dataset.lessonId = lesson.id;
        input.addEventListener("change", () => {
          if (input.checked) state.selected.add(lesson.id); else state.selected.delete(lesson.id);
          invalidate();
          updateSelection();
        });
        label.append(input, element("span", "", `${lesson.id} · ${lesson.title}`));
        choices.appendChild(label);
      });
      details.appendChild(choices);
      container.appendChild(details);
    });
    updateSelection(true);
  }

  function showCourse(course, context) {
    state.course = course;
    const lessons = course.units.flatMap(unit => unit.lessons);
    const linked = lessons.find(lesson => lesson.id === context.lessonId);
    const first = linked || lessons[0];
    state.selected = new Set([first.id]);
    state.readId = first.id;
    $("courseDescription").textContent = course.description || "";
    $("courseScope").textContent = course.scopeNote || "";
    const source = course.source || {};
    $("courseSource").textContent = source.title ? `Topic alignment: ${source.title}. ${source.alignment || "Original practice following this topic sequence."}` : "Original Liminal lesson materials.";
    $("courseRoutine").replaceChildren();
    (course.studyRoutine || []).forEach((text) => {
      const item = element("li");
      item.appendChild(LiminalCourseRender.renderText(text));
      $("courseRoutine").appendChild(item);
    });
    showLessons();
    return context.lessonId && !linked ? "That lesson was not found in this grade’s expansion. Showing the first lesson." : "";
  }

  function pickers(context) {
    const tracks = unique(catalog.map(entry => entry.trackId));
    if (context.trackId && !tracks.includes(context.trackId)) tracks.push(context.trackId);
    options($("courseTrack"), tracks.map(track => ({ value: track, label: N.trackLabel(track) })), context.trackId);
    const grades = catalog.filter(entry => entry.trackId === $("courseTrack").value).map(entry => entry.grade);
    if (context.grade !== null && context.trackId === $("courseTrack").value && !grades.includes(context.grade)) grades.push(context.grade);
    options($("courseGrade"), grades.sort((a, b) => a - b).map(grade => ({ value: N.gradeKey(grade), label: N.gradeKey(grade).toUpperCase() + (N.moduleAt({ modules: catalog }, $("courseTrack").value, grade) ? "" : " · unavailable") })), N.gradeKey(context.grade));
    $("moduleSelectors").hidden = !tracks.length;
  }

  function renderContext(context) {
    const known = context.trackId !== null;
    $("coursePathway").textContent = known ? N.trackLabel(context.trackId) : "Course lessons";
    $("coursePageTitle").textContent = known ? gradeLabel(context.grade) : "Expanded lessons and practice";
    $("courseCoverage").textContent = context.entry ? context.entry.scopeNote || "Original lessons and generated practice supplement this grade’s year plan." : "";
    document.title = (known ? N.trackLabel(context.trackId) + " · " + gradeLabel(context.grade) + " — " : "") + "Expanded lessons · Liminal";
    const links = $("courseContextLinks");
    links.replaceChildren();
    const targets = known ? [["Year plan", "curriculum.html#" + context.trackId + "/" + N.gradeKey(context.grade)], ["Weekly work", "weeks.html#" + context.trackId + "/" + N.gradeKey(context.grade) + "/1"], ["Compare subjects", "curriculum.html#grade/" + N.gradeKey(context.grade)]] : [["Browse year plans", "curriculum.html"]];
    targets.forEach(([label, href]) => { const a = element("a", "", label); a.href = href; links.append(a); });
    pickers(context);
  }

  function loadScript(path) {
    if (scriptCache.has(path)) return scriptCache.get(path);
    if ([...document.scripts].some(script => script.getAttribute("src") === path)) return Promise.resolve();
    if (!scriptCache.has(path)) scriptCache.set(path, new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = path;
      script.onload = resolve;
      script.onerror = () => { script.remove(); scriptCache.delete(path); reject(new Error("The question library could not be loaded. Reload this page to try again.")); };
      document.head.appendChild(script);
    }));
    return scriptCache.get(path);
  }

  async function loadModule(entry) {
    if (!moduleCache.has(entry.id)) moduleCache.set(entry.id, (async () => {
      const response = await fetch(entry.file);
      if (!response.ok) throw new Error("These lessons could not be loaded. Reload this page to try again.");
      const course = await response.json();
      if (course.id !== entry.id || course.trackId !== entry.trackId || course.grade !== entry.grade || !Array.isArray(course.units)) throw new Error("The lesson file does not match the requested grade.");
      for (const script of entry.generatorScripts) await loadScript(script);
      return course;
    })().catch(failure => { moduleCache.delete(entry.id); throw failure; }));
    return moduleCache.get(entry.id);
  }

  async function route(focus = false) {
    const current = ++request;
    const context = N.lessonContext({ modules: catalog }, window.location);
    const same = context.entry && state.entry && context.entry.id === state.entry.id && state.course && !state.loading;
    const status = $("courseLoadStatus");
    renderContext(context);
    status.classList.remove("error");
    status.classList.remove("sr-only");
    status.setAttribute("role", "status");
    if (!context.entry) {
      invalidate(); state.course = null; state.entry = null; state.selected.clear(); state.loading = false;
      $("courseApp").hidden = true;
      status.textContent = context.unavailable ? "Expanded lessons and generated practice have not been published for this pathway and grade. Continue with this grade’s weekly work or year plan above." : context.invalid ? "That lesson link was not recognized. Choose an available pathway and grade, or browse the year plans." : "Expanded lessons are not available yet. Browse the year plans while lessons are prepared.";
      return;
    }
    if (same) {
      const lessons = state.course.units.flatMap(unit => unit.lessons);
      const lesson = context.lessonId ? lessons.find(item => item.id === context.lessonId) : lessons[0];
      if (lesson) {
        if (!state.selected.has(lesson.id)) { state.selected = new Set([lesson.id]); invalidate(); }
        state.readId = lesson.id;
        showLessons();
      }
      status.textContent = context.lessonId && !lesson ? "That lesson was not found in this grade’s expansion. Your current lesson is still open." : "Showing " + gradeLabel(context.grade) + " expanded lessons.";
      status.classList.toggle("sr-only", !context.lessonId || !!lesson);
      return;
    }
    invalidate();
    state.loading = true;
    $("courseApp").setAttribute("aria-busy", "true");
    $("courseApp").inert = true;
    setExportButtons();
    status.textContent = "Opening " + N.trackLabel(context.trackId) + ", " + gradeLabel(context.grade) + " expanded lessons…";
    try {
      const course = await loadModule(context.entry);
      if (current !== request) return;
      state.entry = context.entry;
      const canonical = N.lessonRoute(context.trackId, context.grade, context.lessonId);
      if (window.location.hash !== canonical || window.location.search) window.history.replaceState(null, "", canonical);
      const warning = showCourse(course, context);
      state.loading = false;
      $("courseApp").hidden = false;
      status.textContent = warning || "Showing " + N.trackLabel(context.trackId) + ", " + gradeLabel(context.grade) + " expanded lessons.";
      status.classList.toggle("sr-only", !warning);
      showMode("study", false);
      if (focus) $("coursePageTitle").focus({ preventScroll: true });
    } catch (failure) {
      if (current !== request) return;
      state.course = null; state.entry = null; state.selected.clear();
      $("courseApp").hidden = true;
      status.textContent = failure.message;
      status.classList.add("error"); status.setAttribute("role", "alert");
    } finally {
      if (current === request) {
        state.loading = false;
        $("courseApp").removeAttribute("aria-busy");
        $("courseApp").inert = false;
        setExportButtons();
      }
    }
  }

  function chooseTrack() {
    const entry = catalog.find(item => item.trackId === $("courseTrack").value && N.gradeKey(item.grade) === $("courseGrade").value) || catalog.find(item => item.trackId === $("courseTrack").value);
    if (entry) window.location.hash = N.lessonRoute(entry.trackId, entry.grade);
  }

  function buildInWorker(course, settings) {
    return new Promise((resolve, reject) => {
      const source = `"use strict"; self.onmessage = function (event) { try { importScripts.apply(null, event.data.scripts); const course = event.data.course; const result = LiminalCourses.generatePacketChoices(course, LiminalCourses.templatesForModule(course.id), event.data.settings); self.postMessage({ nights: result }); } catch (error) { self.postMessage({ error: error.message || String(error) }); } };`;
      const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
      let worker;
      try { worker = new Worker(url); }
      catch (failure) { URL.revokeObjectURL(url); reject(new Error("The worksheet builder could not start. Open this page from the Liminal website and try again.")); return; }
      const job = { worker, url, reject, timeout: null };
      state.job = job;
      const finish = (failure, nights) => {
        if (state.job !== job) return;
        state.job = null;
        worker.terminate();
        clearTimeout(job.timeout);
        URL.revokeObjectURL(url);
        if (failure) reject(failure); else resolve(nights);
      };
      worker.onmessage = (event) => finish(event.data.error ? new Error(event.data.error) : null, event.data.nights);
      worker.onerror = () => finish(new Error("The worksheet builder could not load its question library. Reload the page and try again."));
      job.timeout = setTimeout(() => finish(new Error("This packet took too long to build. Try fewer questions or nights.")), 60000);
      worker.postMessage({ course, settings, scripts: state.entry.generatorScripts.map((path) => new URL(path, document.baseURI).href) });
    });
  }

  function renderPreview() {
    const index = Number($("coursePreviewNight").value) || 0;
    const sheet = state.sheets[index];
    if (!sheet) return;
    const night = state.nights[index];
    $("courseWorksheetLabel").textContent = `Worksheet for night ${night.day}`;
    options($("coursePreviewWorksheet"), night.worksheets.map((choice) => ({ value: choice.worksheetVariant, label: `Worksheet ${choice.worksheetVariant} · ${choice.questions.length} questions` })), sheet.worksheetVariant);
    $("courseChoiceSummary").querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.nightIndex) === index)));
    $("coursePacketScope").options[0].textContent = `Night ${sheet.day || index + 1} only · Worksheet ${sheet.worksheetVariant}`;
    $("coursePacketScope").options[1].textContent = `All ${state.sheets.length} night${state.sheets.length === 1 ? "" : "s"}`;
    $("coursePacketScope").options[1].disabled = state.sheets.length === 1;
    if (state.sheets.length === 1) $("coursePacketScope").value = "current";
    $("coursePreview").replaceChildren(LiminalCourseRender.renderWorksheet(state.course, sheet, { answers: $("coursePreviewAnswers").checked, packetDays: state.sheets.length }));
  }

  function summarizeChoices() {
    const selectedTotal = state.sheets.reduce((total, sheet) => total + sheet.questions.length, 0);
    const available = state.nights.flatMap((night) => night.worksheets);
    const availableTotal = available.reduce((total, sheet) => total + sheet.questions.length, 0);
    const practiceLabel = state.sheets[0].practiceMode === "rebuild" ? "Rebuild step by step" : "Mixed review";
    $("coursePacketSummary").textContent = `${practiceLabel} · ${state.sheets.length} night${state.sheets.length === 1 ? "" : "s"} · ${state.sheets.length} worksheet${state.sheets.length === 1 ? "" : "s"} selected for printing (${selectedTotal} questions). ${available.length} full worksheets available (${availableTotal} questions).`;
    $("courseReserveSummary").textContent = `All ${available.length} worksheets (${availableTotal} distinct questions), including A, B, and C for every night. Keep the extra worksheets for another try at the same skills; there is no need to finish them all tonight.`;
    $("courseChoiceSummary").replaceChildren();
    state.sheets.forEach((sheet, index) => {
      const item = element("li");
      const button = element("button", "course-night-choice", `Night ${sheet.day} · ${sheet.worksheetVariant}`);
      button.type = "button";
      button.dataset.nightIndex = String(index);
      button.setAttribute("aria-label", `Preview night ${sheet.day}, worksheet ${sheet.worksheetVariant} selected`);
      button.addEventListener("click", () => {
        $("coursePreviewNight").value = String(index);
        $("coursePreviewAnswers").checked = false;
        renderPreview();
        $("coursePreviewWorksheet").focus({ preventScroll: true });
      });
      item.appendChild(button);
      $("courseChoiceSummary").appendChild(item);
    });
  }

  function chooseWorksheet() {
    const index = Number($("coursePreviewNight").value) || 0;
    const night = state.nights[index];
    if (!night) return;
    state.choices = { ...state.choices, [night.day]: $("coursePreviewWorksheet").value };
    state.sheets = LiminalCourses.selectPacketWorksheets(state.nights, state.choices);
    $("coursePreviewAnswers").checked = false;
    summarizeChoices();
    renderPreview();
    $("courseChoiceStatus").textContent = `Night ${night.day} will print worksheet ${state.choices[night.day]} with its matching answers. Other nights keep their selections.`;
  }

  async function build(event) {
    if (event) event.preventDefault();
    if (state.loading || !state.course) return;
    if (!$("courseSeed").value.trim()) $("courseAdvanced").open = true;
    if (!$("courseForm").reportValidity()) return;
    if (!state.selected.size) { error("Select at least one lesson before building homework."); return; }
    const seed = $("courseSeed").value.trim();
    if (!seed) { error("Enter a packet seed, or choose a fresh seed."); $("courseSeed").focus(); return; }
    cancel();
    error("");
    state.nights = [];
    state.choices = {};
    state.sheets = [];
    $("coursePacketSection").hidden = true;
    const settings = { lessonIds: selectedIds(), count: Number($("courseCount").value), days: Number($("courseDays").value), seed, practiceMode: $("coursePracticeMode").value };
    $("courseBuildStatus").textContent = `Making three full worksheets of ${settings.count} questions for each of ${settings.days} night${settings.days === 1 ? "" : "s"} (${settings.days * settings.count * 3} questions)…`;
    $("courseBuild").disabled = true;
    $("courseBuild").textContent = "Building…";
    $("courseCancel").hidden = false;
    $("courseForm").setAttribute("aria-busy", "true");
    try {
      const pending = buildInWorker(state.course, settings);
      setExportButtons();
      const nights = await pending;
      if (!Array.isArray(nights) || !nights.length) throw new Error("No worksheets were produced. Check your lesson selection and try again.");
      const sheets = LiminalCourses.selectPacketWorksheets(nights);
      state.nights = nights;
      state.sheets = sheets;
      $("coursePacketScope").value = "current";
      options($("coursePreviewNight"), sheets.map((sheet, index) => ({ value: String(index), label: `Night ${sheet.day || index + 1}` })));
      $("coursePreviewAnswers").checked = false;
      summarizeChoices();
      $("courseChoiceStatus").textContent = "Worksheet A is selected for every night. Choose A, B, or C per night, or export all three in the reserve supply below.";
      const warnings = unique(nights.flatMap((night) => night.worksheets.flatMap((sheet) => sheet.warnings || [])));
      $("courseWarnings").replaceChildren();
      if (warnings.length) {
        $("courseWarnings").appendChild(element("strong", "", "Packet notes"));
        const list = element("ul");
        warnings.forEach((warning) => list.appendChild(element("li", "", warning)));
        $("courseWarnings").appendChild(list);
      }
      $("courseWarnings").hidden = !warnings.length;
      renderPreview();
      $("coursePacketSection").hidden = false;
      $("courseBuildStatus").textContent = `Ready: three choices per night, each with ${settings.count} questions. Choose your worksheets below.`;
    } catch (failure) {
      if (failure.name === "AbortError") return;
      error(failure.message || "The packet could not be built. Please try again.");
      $("courseBuildStatus").textContent = "";
    } finally {
      if (!state.job) {
        $("courseBuild").disabled = !state.selected.size;
        $("courseBuild").textContent = "Make practice";
        $("courseCancel").hidden = true;
        $("courseForm").removeAttribute("aria-busy");
        setExportButtons();
      }
    }
  }

  function loadStyles() {
    if (!state.styles) {
      state.styles = Promise.all(stylesheets.map(async (path) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error("Print styles could not be loaded. Check your connection and try again.");
        return response.text();
      })).then((parts) => parts.join("\n")).catch((failure) => { state.styles = null; throw failure; });
    }
    return state.styles;
  }

  async function exportDocument(button) {
    if (state.exportBusy || state.loading || !state.course) return;
    const kind = button.dataset.courseExport;
    if (kind !== "guide" && !state.sheets.length) return;
    const print = button.dataset.exportAction === "print";
    // Reserve the browsing context inside the user's click, before async work.
    const printWindow = print ? window.open("about:blank", "_blank") : null;
    if (print && !printWindow) { $("courseExportStatus").textContent = "Allow a new tab for the print view, or use Download HTML."; return; }
    if (printWindow) { printWindow.opener = null; printWindow.document.title = "Preparing print view…"; printWindow.document.body.textContent = "Preparing your print view…"; }
    state.exportBusy = true;
    setExportButtons();
    $("courseExportStatus").textContent = "Preparing your document…";
    // Capture the current selection so changing controls cannot mix documents.
    const course = state.course;
    const lessons = selectedIds();
    const allWorksheets = button.dataset.exportScope === "all";
    const sheets = allWorksheets ? state.nights.flatMap((night) => night.worksheets) : state.sheets.slice();
    const packetDays = state.nights.length;
    const combinedSheets = kind === "combined" && $("coursePacketScope").value !== "all"
      ? [sheets[Number($("coursePreviewNight").value) || 0]] : sheets;
    const duplex = $("coursePacketSides").value === "duplex";
    try {
      const css = await loadStyles();
      const label = kind === "combined" ? `Nightly packet — ${combinedSheets.length === 1 ? `Night ${combinedSheets[0].day}, Worksheet ${combinedSheets[0].worksheetVariant}` : `all ${combinedSheets.length} nights`}` : kind === "guide" ? "Study guide" : `${kind === "answers" ? "Worked answers" : "Student worksheets"}${allWorksheets ? " — all A/B/C worksheets" : ""}`;
      const content = kind === "combined" ? LiminalCourseRender.renderNightlyPacket(course, combinedSheets, { duplex, packetDays }) : kind === "guide" ? LiminalCourseRender.renderGuide(course, lessons) : LiminalCourseRender.renderPacket(course, sheets, { answers: kind === "answers", packetDays });
      const html = LiminalCourseRender.exportHtml(`${course.title} — ${label}`, content, css);
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      if (printWindow) {
        printWindow.location.replace(url);
        $("courseExportStatus").textContent = "Print view opened. Use your browser’s Print command to print or save as PDF.";
      } else {
        const link = element("a");
        link.href = url;
        const suffix = kind === "combined" ? `-${combinedSheets.length === 1 ? `night-${combinedSheets[0].day}` : "all-nights"}-${duplex ? "duplex" : "single-sided"}-${combinedSheets[0].code}` : sheets.length && kind !== "guide" ? `${allWorksheets ? "-all-worksheets" : ""}-${sheets[0].code}` : "";
        link.download = `liminal-${course.id}-${kind}${suffix}.html`.replace(/[^a-z0-9._-]/gi, "-");
        document.body.appendChild(link);
        link.click();
        link.remove();
        $("courseExportStatus").textContent = `${label} downloaded as a complete offline HTML document.`;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (failure) {
      if (printWindow) printWindow.close();
      $("courseExportStatus").textContent = failure.message || "The document could not be prepared. Please try again.";
    } finally {
      state.exportBusy = false;
      setExportButtons();
    }
  }

  function freshSeed() {
    const numbers = new Uint32Array(2);
    crypto.getRandomValues(numbers);
    $("courseSeed").value = `practice-${Array.from(numbers, (number) => number.toString(36)).join("-")}`;
    invalidate();
    $("courseBuildStatus").textContent = "New seed ready. Choose Make practice to generate another set.";
  }

  function start() {
    try {
      if (!window.LIMINAL_LESSON_MODULES || !N || !window.LiminalCourses || !window.LiminalCourseRender || !window.LiminalRender || !window.LiminalReaderControls) throw new Error("The lesson library did not finish loading. Reload this page to try again.");
      catalog = LIMINAL_LESSON_MODULES.modules;
      $("courseSeed").value = `practice-${new Date().toISOString().slice(0, 10)}`;
      $("courseTrack").addEventListener("change", chooseTrack);
      $("courseGrade").addEventListener("change", () => { window.location.hash = N.lessonRoute($("courseTrack").value, $("courseGrade").value); });
      $("moduleSelectors").addEventListener("submit", event => { event.preventDefault(); chooseTrack(); });
      window.addEventListener("hashchange", () => route());
      window.addEventListener("popstate", () => route());
      $("courseSelectAll").addEventListener("click", () => { state.selected = new Set(state.course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id))); invalidate(); updateSelection(); });
      $("courseSelectNone").addEventListener("click", () => { state.selected.clear(); invalidate(); updateSelection(); });
      ["courseCount", "courseDays", "courseSeed"].forEach((id) => $(id).addEventListener("input", invalidate));
      ["courseCount", "courseDays"].forEach((id) => $(id).addEventListener("invalid", () => { $("coursePacketSettings").open = true; }));
      $("courseSeed").addEventListener("invalid", () => { $("courseAdvanced").open = true; });
      $("coursePracticeMode").addEventListener("change", invalidate);
      $("courseFresh").addEventListener("click", freshSeed);
      $("courseCancel").addEventListener("click", () => { cancel("Build cancelled. Adjust the options or build again."); $("courseBuild").focus(); });
      $("courseForm").addEventListener("submit", build);
      $("coursePreviewNight").addEventListener("change", () => { $("coursePreviewAnswers").checked = false; renderPreview(); });
      $("coursePreviewWorksheet").addEventListener("change", chooseWorksheet);
      $("coursePreviewAnswers").addEventListener("change", renderPreview);
      $("coursePacketSides").addEventListener("change", () => {
        $("coursePacketPrintHelp").textContent = $("coursePacketSides").value === "duplex"
          ? "Double-sided packets include separator backs when needed, so every guide, worksheet set, and answer key begins on a new sheet. Keep every page and print one page per side, flipping on the long edge."
          : "Single-sided packets start each section on a new page without separator backs. Choose single-sided printing in the print dialog.";
      });
      $("courseLessonPicker").open = window.matchMedia("(min-width: 861px)").matches;
      $("courseRead").addEventListener("click", () => showMode("study", true));
      $("coursePractice").addEventListener("click", () => showMode("practice", true));
      $("courseReadLesson").addEventListener("change", () => readLesson());
      function amount(count, nights, practiceMode) {
        $("courseCount").value = count;
        $("courseDays").value = nights;
        if (practiceMode) $("coursePracticeMode").value = practiceMode;
        invalidate();
      }
      $("courseShortSet").addEventListener("click", () => amount(8, 1));
      $("courseFiveNights").addEventListener("click", () => amount(8, 5, "rebuild"));
      $("courseTenNights").addEventListener("click", () => {
        const selectedUnits = state.course.units.filter((unit) => unit.lessons.some((lesson) => state.selected.has(lesson.id)));
        if (selectedUnits.length === 1) state.selected = new Set(selectedUnits[0].lessons.map((lesson) => lesson.id));
        amount(20, 10, "review");
        updateSelection();
      });
      function practiceThisLesson() {
        if (!state.readId) return;
        state.selected = new Set([state.readId]);
        amount(8, 1, "rebuild");
        updateSelection();
        showMode("practice", true);
        build();
      }
      $("coursePracticeLesson").addEventListener("click", practiceThisLesson);
      $("coursePracticeLessonTop").addEventListener("click", practiceThisLesson);
      let printGuide;
      window.addEventListener("beforeprint", () => {
        if (printGuide || state.loading || !state.course) return;
        printGuide = LiminalCourseRender.renderGuide(state.course, selectedIds());
        printGuide.classList.add("course-browser-print");
        document.body.appendChild(printGuide);
      });
      window.addEventListener("afterprint", () => {
        if (printGuide) printGuide.remove();
        printGuide = null;
      });
      document.querySelectorAll("[data-course-export]").forEach((button) => button.addEventListener("click", () => exportDocument(button)));
      route();
      loadStyles().catch(() => {}); // A later export retries a failed prefetch.
      showMode("study", false);
    } catch (failure) {
      $("courseLoadStatus").textContent = failure.message;
      $("courseLoadStatus").classList.add("error");
      $("courseLoadStatus").setAttribute("role", "alert");
    }
  }

  start();
})();
