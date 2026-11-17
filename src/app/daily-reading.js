/* Nightly readings: routing, loading and the reader. Views: Year (with
   Tonight), a school night, a calendar date, one reading by id, a month of
   the date calendar, and the multi-level day print. Every decision comes
   from lib/ (daily-reading, reading-calendar, reading-library,
   reading-level); this file builds the DOM, as text. */
(function () {
  "use strict";
  const D = window.LiminalDailyReading, Cal = window.LiminalReadingCalendar, Lib = window.LiminalReadingLibrary, LL = window.LiminalReadingLevel;
  const R = window.LiminalDailyReadingRender, B = window.LiminalDailyReadingBrowse, M = window.LiminalDailyReadingCalendar, P = window.LiminalDailyReadingPrint, C = window.LiminalReaderControls;
  const $ = id => document.getElementById(id);
  const status = $("dailyStatus"), reader = $("dailyReader"), container = $("dailyContent"), browsePanel = $("dailyBrowse");
  const monthPanel = $("dailyMonth"), printPanel = $("dailyPrint"), crumbList = $("dailyCrumbList");
  const gradeSelect = $("dailyGrade"), weekSelect = $("dailyWeek"), daySelect = $("dailyDay"), dateInput = $("dailyDate");
  const weekField = $("dailyWeekField"), dayField = $("dailyDayField"), dateField = $("dailyDateField");
  const browseGrade = $("dailyBrowseGrade"), monthGrade = $("dailyMonthGrade");
  const printFooter = $("dailyPrintFooter"), toolbar = $("dailyToolbar"), topNav = $("dailyNavigation");
  let index, request = 0, preservePickerFocus = false, inFlight = null, topNavigation, pendingNavigation = null, shownTitle = null;
  let packetShown = null, remembered = null;
  const more = C.menu("More");
  $("dailyMore").append(more.element);
  // Generate PDF typesets the reading shown, in the packet style
  // (lib/reading-tex.js), in this browser (app/pdf-action.js; see
  // docs/printing.md). It lives in the More menu; its progress shows under
  // the toolbar. Without the typesetter the button is disabled and the menu
  // says why.
  const T = window.LiminalReadingTeX, A = window.LiminalPdfAction;
  let pdfJob = null;
  const pdf = T && A ? A.control({ prepare: () => pdfJob && { ...T.nightTeX(pdfJob.entry), filename: pdfJob.filename } }) : null;
  const pdfLine = R.el("p", undefined, "daily-pdf");
  if (pdf && pdf.available) { pdfLine.append(pdf.status, " ", pdf.credits); toolbar.after(pdfLine); }

  // ---- Loading ----
  // One main load at a time: a newer choice cancels the download it
  // supersedes. Supporting files (browse lists, calendars, library records)
  // are cached promises shared by every view.
  async function load(path) {
    if (inFlight) inFlight.abort();
    const controller = inFlight = new AbortController();
    try {
      const response = await fetch(path, { signal: controller.signal });
      if (!response.ok) throw new Error("Unavailable");
      return await response.json();
    } finally { if (inFlight === controller) inFlight = null; }
  }
  const cache = new Map();
  function getJson(path) {
    if (!path) return Promise.reject(new Error("No path"));
    if (!cache.has(path)) cache.set(path, fetch(path).then(response => { if (!response.ok) throw new Error("Unavailable"); return response.json(); })
      .catch(error => { cache.delete(path); throw error; }));
    return cache.get(path);
  }
  async function browseData(grade) {
    const data = await getJson(D.browseFile(grade));
    if (data.schemaVersion !== 1 || data.grade !== grade || !Array.isArray(data.nights) || !Array.isArray(data.progression)) throw new Error("Browse mismatch");
    return data;
  }
  async function calendarData(grade) {
    const calendar = await getJson(D.calendarFile(grade));
    if (calendar.schemaVersion !== 1 || calendar.grade !== grade || !Array.isArray(calendar.years) || calendar.years.length !== Cal.CYCLE) throw new Error("Calendar mismatch");
    return calendar;
  }

  // ---- Remembered place (this browser only; never required) ----
  function readRemembered() { try { return D.parseRemembered(window.localStorage.getItem(D.STORAGE_KEY)); } catch (_) { return null; } }
  function saveRemembered(selected) {
    remembered = D.remember(remembered, selected);
    try { window.localStorage.setItem(D.STORAGE_KEY, JSON.stringify(remembered)); } catch (_) { /* Private mode or storage off: nothing is remembered. */ }
  }
  // The reading-level plan, when this browser has one, names tonight's
  // night. Its bundle (night titles, which place stretch nights) loads only then.
  let planBundle = null;
  function bundle() {
    if (window.LIMINAL_READING_LEVEL) return Promise.resolve(window.LIMINAL_READING_LEVEL);
    return planBundle = planBundle || new Promise((resolve, reject) => {
      const script = document.createElement("script"); script.src = "content/reading-level.js";
      script.onload = () => window.LIMINAL_READING_LEVEL ? resolve(window.LIMINAL_READING_LEVEL) : reject(new Error("No bundle"));
      script.onerror = () => { planBundle = null; reject(new Error("No bundle")); }; document.head.append(script);
    });
  }
  async function planNight(today) {
    try {
      if (!LL) return null;
      const raw = window.localStorage.getItem(LL.STORAGE_KEY), state = raw ? LL.parseState(raw) : null;
      if (!state || !state.plan || state.plan.complete) return null;
      const data = await bundle();
      const plan = LL.makePlan({ ...state.plan, libraryLevels: data.library.map(entry => entry.level), titles: Object.fromEntries(data.library.map(entry => [entry.level, entry.nights])) });
      return LL.nightOn(plan, today);
    } catch (_) { return null; }
  }

  // ---- Page furniture ----
  function announce(message, visible = false) { status.textContent = message; status.classList.toggle("daily-sr", !visible); }
  function button(label, action, className) { const node = R.el("button", label, className); node.type = "button"; node.addEventListener("click", action); return node; }
  function option(label, value) { const node = R.el("option", label); node.value = value; return node; }
  function showOnly(name) {
    document.body.dataset.readingView = name;
    browsePanel.hidden = name !== "browse"; reader.hidden = !["read", "date", "reading"].includes(name);
    monthPanel.hidden = name !== "month"; printPanel.hidden = name !== "print";
    if (name !== "read" && name !== "date" && name !== "reading") { printFooter.textContent = ""; packetShown = null; clearPdf(); }
    weekField.hidden = dayField.hidden = name !== "read"; dateField.hidden = name !== "date";
  }
  // One breadcrumb names the place; the last item is the current page.
  function crumbs(items) {
    const all = [{ label: "Readings", href: "daily-reading.html" }, ...items];
    crumbList.replaceChildren(...all.map((item, i) => {
      const li = R.el("li"), current = i === all.length - 1;
      if (item.href && !current) li.append(R.link(item.label, item.href));
      else { const span = R.el("span", item.label); if (current) span.setAttribute("aria-current", "page"); li.append(span); }
      return li;
    }));
  }
  function setTitle(parts) { shownTitle = null; document.title = D.documentTitle(parts); }
  function gradeOptions(select, short) {
    select.replaceChildren(...index.grades.map(course => {
      const choice = option(short ? D.gradeKey(course.grade).toUpperCase() : D.gradeLabel(course.grade), D.gradeKey(course.grade));
      choice.setAttribute("aria-label", D.gradeLabel(course.grade)); return choice;
    }));
  }
  function today() { return Cal.today(); }

  // ---- The More menu: secondary actions for the reading shown ----
  function menuItems(items) {
    more.panel.replaceChildren(...items.filter(Boolean).flatMap(item => {
      if (item.node) return [item.node, ...(item.after ? [item.after] : [])];
      const node = item.href ? R.link(item.label, item.href) : button(item.label, item.run);
      if (item.disabled) node.disabled = true;
      return [node];
    }));
  }
  // The PDF control for the reading shown; a new reading cancels a PDF in progress.
  function pdfItem() {
    if (!pdf) return null;
    pdf.button.disabled = !pdf.available || !pdfJob;
    const after = pdf.available ? null : R.el("p", undefined, "reader-more-note");
    if (after) after.append(pdf.status);
    return { node: pdf.button, after };
  }
  function clearPdf() { if (pdf) pdf.cancel(); pdfJob = null; }
  function printStudent() { if (!packetShown) return; window.print(); }
  function printAdult() {
    if (!packetShown) return;
    // The adult copy prints the discussion help and "Before you read".
    const toggle = container.querySelector(".daily-help-toggle"), wasOpen = toggle && toggle.getAttribute("aria-expanded") === "true";
    if (toggle && !wasOpen) toggle.click();
    document.body.classList.add("daily-print-adult");
    const done = () => { document.body.classList.remove("daily-print-adult"); if (toggle && !wasOpen && toggle.getAttribute("aria-expanded") === "true") toggle.click(); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done); window.print();
  }
  function download(packet) {
    if (!packet) return;
    const css = [...document.styleSheets].filter(sheet => /\/(tokens|home|daily-reading|brand|reading-print)\.css(?:\?|$)/.test(sheet.href || ""))
      .map(sheet => { try { return [...sheet.cssRules].map(rule => rule.cssText).join("\n"); } catch (_) { return ""; } }).join("\n");
    const href = new URL("daily-reading.html" + window.location.hash, window.location.href).href;
    const fontLicense = document.querySelector('meta[name="font-license"]').content;
    const doc = R.exportDocument(packet, css, href, fontLicense), html = "<!doctype html>\n" + doc.documentElement.outerHTML;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" })), anchor = R.link("Download reading", url);
    anchor.download = "liminal-" + packet.day.id + (packet.date ? "-" + packet.date : "") + "-student.html"; document.body.append(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); announce("Downloaded the student copy of this reading, without discussion help.");
  }
  function documentActions(extra = []) {
    return [...extra,
      { label: "Print student copy", run: printStudent, disabled: !packetShown },
      { label: "Print adult copy, with discussion help", run: printAdult, disabled: !packetShown },
      { label: "Download student copy (HTML)", run: () => download(packetShown), disabled: !packetShown }, pdfItem()];
  }

  // ---- Sequence navigation (top keeps focus and position; bottom returns to the top) ----
  reader.addEventListener("click", event => {
    const link = event.target.closest("a[data-reader-step]");
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    pendingNavigation = { href: link.hash, step: link.dataset.readerStep, top: toolbar.contains(link), y: toolbar.getBoundingClientRect().top };
  });
  function takeMovement() { const movement = pendingNavigation && pendingNavigation.href === window.location.hash ? pendingNavigation : null; pendingNavigation = null; return movement; }
  function topNavigationOf(options) {
    topNavigation = C.navigation({ compact: true, steps: ["previous", "next"], ...options }, topNavigation);
    if (!topNavigation.parentElement) topNav.append(topNavigation);
    return topNavigation;
  }
  function afterRender(movement, focus) {
    if (movement) {
      if (movement.top) window.scrollBy({ top: toolbar.getBoundingClientRect().top - movement.y, behavior: "instant" });
      else { toolbar.scrollIntoView({ block: "start", behavior: "instant" }); C.focusNavigation(topNavigation, movement.step); }
    } else if (focus) {
      const heading = $("dailyHeading"); if (heading) heading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
  function busy(on) {
    container.setAttribute("aria-busy", String(on));
    if (on) clearPdf();
    for (const control of more.panel.querySelectorAll("button")) if (on) control.disabled = true;
  }

  // ---- Cross-references ("Around this reading") ----
  // Built after the reading shows, from the library and calendar records;
  // each part appears only when its data exists.
  function relatedSection() { const section = R.el("section", undefined, "daily-related"); section.setAttribute("aria-label", "Around this reading"); section.hidden = true; return section; }
  function relatedGroup(section, heading, links) {
    if (!links.length) return;
    const group = R.el("div", undefined, "daily-related-group"), list = R.el("ul");
    links.forEach(item => { const li = R.el("li"); li.append(R.link(item.label, item.href)); if (item.note) li.append(R.el("span", " " + item.note, "daily-muted")); list.append(li); });
    group.append(R.el("h2", heading), list); section.append(group); section.hidden = false;
  }
  async function fillRelated(section, { grade, reading, source, current, date: shown }) {
    const work = source && source.library && Lib.validWorkId(source.library) ? source.library : null;
    const place = [];
    if (work) place.push({ label: "Read it in the full work", href: Lib.fullWorkHref(work, reading), note: "(" + source.title + ")" });
    if (reading.week && D.hasCalendar(index, grade)) {
      try {
        // On a date page the reading's own date is already shown; name the next one.
        const from = shown && shown >= today() ? Cal.addDays(shown, 1) : today(), date = Cal.nextDateOf(await calendarData(grade), reading.id, from);
        if (date && current()) place.push({ label: "On the date calendar: " + Cal.longDate(date), href: "daily-reading.html" + D.dateRoute(grade, date) });
      } catch (_) { /* The calendar is optional here. */ }
    }
    if (!current()) return;
    relatedGroup(section, "This reading elsewhere", place);
    if (!work) return;
    try {
      const [meta, library] = await Promise.all([getJson(Lib.metaFile(work)), getJson(Lib.INDEX_FILE).catch(() => null)]);
      if (!current()) return;
      const others = Lib.related(meta, reading.id), here = (meta.uses || []).findIndex(use => use.id === reading.id);
      // The readings nearest this passage in the work, any level.
      const nearest = others.map(use => ({ use, distance: Math.abs((meta.uses || []).indexOf(use) - here) })).sort((a, b) => a.distance - b.distance).slice(0, 6)
        .map(({ use }) => use).sort((a, b) => meta.uses.indexOf(a) - meta.uses.indexOf(b));
      const fromWork = nearest.map(use => ({ label: use.title, href: Lib.useHref(use), note: "· " + Lib.useLabel(use) }));
      if (others.length > nearest.length) fromWork.push({ label: "All " + (others.length + 1) + " readings from this work", href: Lib.href(work) });
      relatedGroup(section, "More from " + source.title, fromWork);
      const author = library && Array.isArray(library.works) ? library.works.filter(item => item.author === source.author && item.id !== work && item.readings > 0) : [];
      relatedGroup(section, "More by " + source.author, author.slice(0, 8).map(item => ({ label: item.title, href: Lib.href(item.id), note: "· " + item.readings + (item.readings === 1 ? " reading" : " readings") })));
    } catch (_) { /* The library record is optional here. */ }
  }

  // ---- Year view ----
  async function browse(selected, focus) {
    const current = ++request;
    showOnly("browse");
    browseGrade.value = D.gradeKey(selected.grade);
    crumbs([{ label: D.gradeLabel(selected.grade) }]);
    const list = $("dailyYear"); list.setAttribute("aria-busy", "true");
    announce("Opening " + D.gradeLabel(selected.grade) + "…");
    const monthLink = $("dailyMonthLink");
    monthLink.hidden = !D.hasCalendar(index, selected.grade);
    monthLink.href = D.monthRoute(selected.grade, today().slice(0, 7));
    $("dailyPrintLink").href = D.printRoute({ date: today(), grades: [selected.grade] });
    try {
      const data = await browseData(selected.grade);
      if (current !== request) return;
      B.show(data, { last: remembered && remembered.night, week: selected.week, focus });
      setTitle([selected.week ? "Week " + selected.week : null, D.gradeLabel(selected.grade) + " nightly readings"]);
      announce((selected.invalid ? "That link was not recognized. Showing " : "Showing ") + D.gradeLabel(selected.grade) + ": " + data.nights.length + " nights.", selected.invalid);
      saveRemembered(selected);
      tonightCard(current);
    } catch (_) {
      if (current !== request) return;
      announce("This grade could not be loaded. Try again, or choose another grade.", true);
    } finally { if (current === request) list.setAttribute("aria-busy", "false"); }
  }
  async function tonightCard(current) {
    const card = $("dailyTonight"), list = $("dailyTonightList"), when = today();
    const nights = remembered && remembered.night ? await browseData(remembered.night.grade).then(data => data.nights).catch(() => null) : null;
    const plan = await planNight(when);
    if (current !== request) return;
    const entries = D.tonight({ index, state: remembered, planNight: plan, today: when, nights });
    list.replaceChildren(...entries.map(entry => {
      const item = R.el("li", undefined, "daily-tonight-" + entry.kind);
      const main = R.link("", entry.href); main.className = "daily-tonight-link";
      main.append(R.el("span", entry.label, "daily-tonight-label"));
      if (entry.title) main.append(R.el("span", entry.title, "daily-tonight-title"));
      item.append(main);
      if (entry.next) {
        const next = R.link("", entry.next.href); next.className = "daily-tonight-next";
        next.append(R.el("span", entry.next.label, "daily-tonight-label"));
        if (entry.next.title) next.append(R.el("span", entry.next.title, "daily-tonight-title"));
        item.append(next);
      }
      return item;
    }));
    card.hidden = !entries.length;
  }

  // ---- One reading shown in the reader (school night, date or id) ----
  // `print` is { meta, run } for the PDF: its footer and place in a run.
  function showReading({ grade, reading, source, packet, run, current, bottom, before, extraActions = [], print = {} }) {
    const article = R.reading(packet, { notes: reading.questions, challenge: reading.challenge, run,
      fullWork: source.library && Lib.validWorkId(source.library) ? Lib.fullWorkHref(source.library, reading) : null });
    const related = relatedSection();
    container.replaceChildren(...(before ? [before] : []), article, ...(bottom ? [bottom] : []), related);
    packetShown = packet;
    pdfJob = T ? { entry: { day: reading, source, meta: print.meta || D.printMeta(grade, { date: packet.date }), run: print.run || null },
      filename: "liminal-" + reading.id + (packet.date ? "-" + packet.date : "") + ".pdf" } : null;
    menuItems(documentActions(extraActions));
    printFooter.textContent = R.printFooterText(packet);
    shownTitle = reading.title;
    fillRelated(related, { grade, reading, source, current, date: packet.date || null });
  }
  function failed(current, message) {
    if (current !== request) return;
    announce(message, true);
    container.replaceChildren(R.el("p", message, "daily-error"), button("Try again", () => route()));
  }
  function readerToolbar(selected) {
    gradeSelect.value = D.gradeKey(selected.grade);
    if (selected.view === "read") { weekSelect.value = selected.week; daySelect.value = selected.day; }
    if (selected.view === "date") dateInput.value = selected.date;
  }

  // A school night.
  async function read(selected, focus) {
    const current = ++request, movement = takeMovement();
    showOnly("read"); readerToolbar(selected); busy(true);
    const pages = D.navigation(selected), label = page => page && "Week " + page.week + ", Day " + page.day;
    topNavigationOf({ label: "Nightly readings, top", previous: pages.previous && { href: pages.previous.href, label: "Previous night: " + label(pages.previous) },
      next: pages.next && { href: pages.next.href, label: "Next night: " + label(pages.next) } });
    if (movement && movement.top) C.focusNavigation(topNavigation, movement.step);
    crumbs([{ label: D.gradeLabel(selected.grade), href: D.browseRoute(selected.grade) }, { label: "Week " + selected.week, href: D.browseRoute(selected.grade, selected.week) }, { label: "Day " + selected.day }]);
    announce("Opening " + D.gradeLabel(selected.grade) + ", " + D.nightLabel(selected.week, selected.day) + "…");
    saveRemembered(selected);
    try {
      // Only the night's week (five nights and their sources), not the grade.
      const [course, nights] = await Promise.all([load(D.weekFile(selected.grade, selected.week)), browseData(selected.grade).then(data => data.nights).catch(() => null)]);
      if (course.schemaVersion !== 1 || course.grade !== selected.grade || course.week !== selected.week || !Array.isArray(course.days) || course.days.length !== 5 ||
        course.days.some(day => day.week !== selected.week) || !Array.isArray(course.sources)) throw new Error("Reading mismatch");
      if (current !== request) return;
      const day = D.dayAt(course, selected.week, selected.day), source = D.sourceAt(course, day), packet = D.studentReading(course, selected.week, selected.day);
      if (!day || !packet) throw new Error("Night unavailable");
      const bottom = C.navigation({ label: "Nightly readings, bottom", steps: ["previous", "next"],
        previous: pages.previous && { href: pages.previous.href, text: "‹ Previous: " + label(pages.previous) }, next: pages.next && { href: pages.next.href, text: "Next: " + label(pages.next) + " ›" } });
      // The browse list knows a run across week boundaries; the week file alone may not.
      const run = D.continuation(selected.grade, nights, selected.week, selected.day), tex = T && T.entry(course, day, T.schoolMeta(selected.grade, day));
      showReading({ grade: selected.grade, reading: day, source, packet, run, current: () => current === request, bottom,
        print: { meta: tex ? tex.meta : null, run: run ? { part: run.part, of: run.of } : tex && tex.run },
        extraActions: [pages.first && { label: "First night of the year", href: pages.first.href }, pages.last && { label: "Last night of the year", href: pages.last.href },
          { label: "Print this night for several levels", href: D.printRoute({ week: selected.week, day: selected.day, grades: [selected.grade] }) }] });
      setTitle([day.title, D.gradeLabel(selected.grade) + ", " + D.nightLabel(day.week, day.day)]);
      announce((selected.invalid ? "That reading link was not recognized. Showing " : "Showing ") + D.gradeLabel(selected.grade) + ", " + D.nightLabel(day.week, day.day) + ": " + day.title + ".", selected.invalid);
      afterRender(movement, focus);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      failed(current, "This reading could not be loaded. Try again, or choose another grade.");
    } finally { if (current === request) busy(false); }
  }

  // The date calendar's reading for a date.
  async function dateView(selected, focus) {
    const current = ++request, movement = takeMovement(), date = selected.date, grade = selected.grade;
    showOnly("date"); readerToolbar(selected); busy(true);
    const previous = Cal.addDays(date, -1), next = Cal.addDays(date, 1);
    topNavigationOf({ label: "Calendar days, top", previous: { href: D.dateRoute(grade, previous), label: "Previous day: " + Cal.longDate(previous) },
      next: { href: D.dateRoute(grade, next), label: "Next day: " + Cal.longDate(next) } });
    if (movement && movement.top) C.focusNavigation(topNavigation, movement.step);
    const month = date.slice(0, 7), monthLabel = Cal.MONTHS[Number(month.slice(5)) - 1] + " " + month.slice(0, 4);
    crumbs([{ label: D.gradeLabel(grade), href: D.browseRoute(grade) }, { label: monthLabel, href: D.hasCalendar(index, grade) ? D.monthRoute(grade, month) : null }, { label: Cal.longDate(date).replace(/, \d{4}$/, "") }]);
    saveRemembered(selected);
    const calendarActions = [{ label: "Today", href: D.dateRoute(grade, today()) }, D.hasCalendar(index, grade) && { label: "This month’s calendar", href: D.monthRoute(grade, month) },
      { label: "Print this date for several levels", href: D.printRoute({ date, grades: [grade] }) }];
    if (!D.hasCalendar(index, grade)) {
      // Honest absence: say so, and offer the school year.
      packetShown = null; clearPdf(); menuItems(calendarActions.slice(0, 1)); printFooter.textContent = "";
      const note = R.el("section", undefined, "daily-unavailable");
      note.append(R.el("h1", "The date calendar for " + D.gradeLabel(grade) + " is not available yet"), R.el("p", "Each level’s calendar appears once it has a reading for every day of three years. Meanwhile, the school year’s 180 nights are ready."));
      const links = R.el("p"); links.append(R.link("Open the " + D.gradeLabel(grade) + " school year", D.browseRoute(grade)));
      const other = index.grades.filter(course => course.calendar);
      if (other.length) links.append(document.createTextNode(" · "), R.link("Date calendar for " + D.gradeLabel(other[0].grade), D.dateRoute(other[0].grade, date)));
      note.append(links); container.replaceChildren(note);
      setTitle([Cal.longDate(date), D.gradeLabel(grade)]);
      announce("The date calendar for " + D.gradeLabel(grade) + " is not available yet."); busy(false);
      return;
    }
    announce("Opening the reading for " + Cal.longDate(date) + "…");
    try {
      const calendar = await calendarData(grade), entry = Cal.readingOn(calendar, date);
      if (!entry || !D.validReadingId(grade, entry.id)) throw new Error("No reading for this date");
      const data = await load(D.readingFile(grade, entry.id));
      if (current !== request) return;
      if (data.schemaVersion !== 1 || data.grade !== grade || !data.reading || data.reading.id !== entry.id || !data.source) throw new Error("Reading mismatch");
      const packet = { ...D.studentPacket(grade, data.reading, data.source), date }, run = Cal.runOn(calendar, date);
      const runLinks = run && { part: run.part, of: run.of,
        from: run.part > 1 ? { label: Cal.shortDate(previous), href: D.dateRoute(grade, previous) } : null,
        to: run.part < run.of ? { label: Cal.shortDate(next), href: D.dateRoute(grade, next) } : null };
      const before = R.el("p", undefined, "daily-date-note");
      before.append(R.el("span", Cal.longDate(date), "daily-date-long"), document.createTextNode(" · " + Cal.cycleNote(date) + "."));
      if (entry.week) { before.append(document.createTextNode(" Also the school year’s ")); before.append(R.link(D.nightLabel(entry.week, entry.day), D.route(grade, entry.week, entry.day)), document.createTextNode(".")); }
      const bottom = C.navigation({ label: "Calendar days, bottom", steps: ["previous", "next"],
        previous: { href: D.dateRoute(grade, previous), text: "‹ " + Cal.shortDate(previous) }, next: { href: D.dateRoute(grade, next), text: Cal.shortDate(next) + " ›" } });
      showReading({ grade, reading: data.reading, source: data.source, packet, run: runLinks, current: () => current === request, bottom, before, extraActions: calendarActions,
        print: { meta: D.printMeta(grade, { date }), run: run && { part: run.part, of: run.of } } });
      setTitle([data.reading.title, D.gradeLabel(grade) + ", " + Cal.shortDate(date)]);
      announce((selected.invalid ? "That date was not recognized. Showing today: " : "Showing ") + D.gradeLabel(grade) + ", " + Cal.longDate(date) + ": " + data.reading.title + ".", selected.invalid);
      afterRender(movement, focus);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      failed(current, "The reading for this date could not be loaded. Try again, or choose another date.");
    } finally { if (current === request) busy(false); }
  }

  // Any one reading by id (links from the library and the calendar).
  async function readingView(selected, focus) {
    const current = ++request, grade = selected.grade;
    showOnly("reading"); readerToolbar(selected); busy(true);
    // A school night has its own place in the year; open it there.
    const night = /-w(\d\d)-d([1-5])$/.exec(selected.id);
    if (night) { window.location.replace(D.route(grade, Number(night[1]), Number(night[2]))); return; }
    crumbs([{ label: D.gradeLabel(grade), href: D.browseRoute(grade) }, { label: "Calendar reading" }]);
    announce("Opening this reading…");
    try {
      const data = await load(D.readingFile(grade, selected.id));
      if (current !== request) return;
      if (data.schemaVersion !== 1 || data.grade !== grade || !data.reading || data.reading.id !== selected.id || !data.source) throw new Error("Reading mismatch");
      const excerpt = data.reading.excerpt, step = id => id && D.validReadingId(grade, id) ? { href: D.readingRoute(grade, id) } : null;
      topNavigationOf({ label: "Continued reading, top", previous: step(excerpt.continuesFrom) && { ...step(excerpt.continuesFrom), label: "Previous part" },
        next: step(excerpt.continuesTo) && { ...step(excerpt.continuesTo), label: "Next part" } });
      let before = null, date = null;
      if (D.hasCalendar(index, grade)) {
        date = await calendarData(grade).then(calendar => Cal.nextDateOf(calendar, selected.id, today())).catch(() => null);
        if (current !== request) return;
      }
      if (date) { before = R.el("p", undefined, "daily-date-note"); before.append(document.createTextNode("On the date calendar: "), R.link(Cal.longDate(date), D.dateRoute(grade, date)), document.createTextNode(" · " + Cal.cycleNote(date) + ".")); }
      const run = { part: 0, of: 0, from: step(excerpt.continuesFrom) && { label: "the previous part", href: D.readingRoute(grade, excerpt.continuesFrom) },
        to: step(excerpt.continuesTo) && { label: "the next part", href: D.readingRoute(grade, excerpt.continuesTo) } };
      showReading({ grade, reading: data.reading, source: data.source, packet: D.studentPacket(grade, data.reading, data.source), run, current: () => current === request, before });
      setTitle([data.reading.title, D.gradeLabel(grade)]);
      announce("Showing " + D.gradeLabel(grade) + ": " + data.reading.title + ".");
      afterRender(null, focus);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      failed(current, "This reading could not be loaded. It may have moved; try the school year or the library.");
    } finally { if (current === request) busy(false); }
  }

  // A month of a level's date calendar.
  async function monthView(selected, focus) {
    const current = ++request, grade = selected.grade, month = selected.month;
    showOnly("month"); monthGrade.value = D.gradeKey(grade);
    const label = Cal.MONTHS[Number(month.slice(5)) - 1] + " " + month.slice(0, 4);
    crumbs([{ label: D.gradeLabel(grade), href: D.browseRoute(grade) }, { label }]);
    $("dailyMonthHeading").textContent = label + " · " + D.gradeLabel(grade);
    setTitle([label, D.gradeLabel(grade) + " date calendar"]);
    saveRemembered(selected);
    const grid = $("dailyMonthGrid");
    if (!D.hasCalendar(index, grade)) {
      M.unavailable(grid, grade); $("dailyMonthNote").textContent = "";
      announce("The date calendar for " + D.gradeLabel(grade) + " is not available yet."); return;
    }
    grid.setAttribute("aria-busy", "true"); announce("Opening " + label + "…");
    try {
      const [calendar, spans] = await Promise.all([calendarData(grade), getJson(D.SPANS_FILE)]);
      if (current !== request) return;
      M.show(grid, { grade, month, calendar, spans, today: today() });
      $("dailyMonthNote").textContent = "Cycle year " + Cal.cycleYear(Number(month.slice(0, 4))) + " of " + Cal.CYCLE + ". Each date’s reading returns three years later.";
      announce((selected.invalid ? "That month was not recognized. Showing " : "Showing ") + label + ".", selected.invalid);
      if (focus) $("dailyMonthHeading").focus();
    } catch (_) {
      if (current !== request) return;
      announce("This month could not be loaded. Try again.", true);
    } finally { if (current === request) grid.setAttribute("aria-busy", "false"); }
  }

  async function printView(selected, focus) {
    ++request;
    showOnly("print"); crumbs([{ label: "Print a day" }]);
    setTitle(["Print a day for several levels"]);
    P.show(selected, { index, getJson, today: today(), remembered, announce });
    if (focus) $("dailyPrintHeading").focus();
  }

  // ---- Routing ----
  function route(focus = false) {
    const selected = D.view(index, window.location.hash, { grade: remembered && remembered.grade, today: today() });
    if (selected.view === "print") return printView(selected, focus);
    if (!selected.course) return;
    if (selected.view === "browse") return browse(selected, focus);
    if (selected.view === "date") return dateView(selected, focus);
    if (selected.view === "month") return monthView(selected, focus);
    if (selected.view === "reading") return readingView(selected, focus);
    return read(selected, focus);
  }
  function go(href) { if (href && window.location.hash !== href) { preservePickerFocus = true; window.location.hash = href; } }
  // Changing grade keeps the place: the same week and day, or the same date.
  function chooseReader(event) {
    const grade = D.gradeFromKey(gradeSelect.value), view = document.body.dataset.readingView;
    if (view === "date") return go(D.dateRoute(grade, D.validDate(dateInput.value) ? dateInput.value : today()));
    if (view === "reading") return go(D.browseRoute(grade));
    const week = Number(weekSelect.value), day = event && event.target === weekSelect ? 1 : Number(daySelect.value);
    go(D.route(grade, week, day));
  }
  async function start() {
    if (!D || !R || !Cal || !Lib || !C) { announce("The readings could not be loaded. Reload this page to try again.", true); return; }
    remembered = readRemembered();
    try {
      const response = await fetch("content/reading-daily/index.json");
      if (!response.ok) throw new Error("Index unavailable"); index = await response.json();
      if (index.schemaVersion !== 1 || !Array.isArray(index.grades) || index.grades.some(course => !D.validGrade(course.grade)) || new Set(index.grades.map(course => course.grade)).size !== index.grades.length) throw new Error("Index mismatch");
      if (!index.grades.length) {
        announce("The nightly readings are being prepared. ", true);
        status.append(R.link("Open weekly reading lessons", "weeks.html#common-core-reading/k/1"), document.createTextNode(" or "), R.link("explore the reading year plans.", "curriculum.html#common-core-reading/k"));
        return;
      }
      gradeOptions(gradeSelect, true); gradeOptions(browseGrade, false); gradeOptions(monthGrade, true);
      for (let week = 1; week <= 36; week++) weekSelect.append(option(week, week));
      for (let day = 1; day <= 5; day++) daySelect.append(option(day, day));
      [gradeSelect, weekSelect, daySelect].forEach(select => select.addEventListener("change", chooseReader));
      dateInput.addEventListener("change", () => { if (D.validDate(dateInput.value)) chooseReader(); });
      document.querySelector(".daily-filters").addEventListener("submit", event => { event.preventDefault(); chooseReader(); });
      browseGrade.addEventListener("change", () => go(D.browseRoute(D.gradeFromKey(browseGrade.value))));
      $("dailyBrowseGradeForm").addEventListener("submit", event => event.preventDefault());
      monthGrade.addEventListener("change", () => { const month = /\/month\/(\d{4}-\d{2})$/.exec(window.location.hash); go(D.monthRoute(D.gradeFromKey(monthGrade.value), month ? month[1] : today().slice(0, 7))); });
      $("dailyMonthForm").addEventListener("submit", event => event.preventDefault());
      window.addEventListener("hashchange", () => { const focus = !preservePickerFocus; preservePickerFocus = false; route(focus); });
      // Browser print headers use the reading's own title; grade and place
      // are in the printed footer.
      let saved = null;
      window.addEventListener("beforeprint", () => { if (shownTitle && !reader.hidden) { saved = document.title; document.title = shownTitle; } });
      window.addEventListener("afterprint", () => { if (saved) document.title = saved; saved = null; });
      route();
    } catch (_) {
      announce("The readings could not be loaded. Reload this page to try again, or explore the year plans.", true);
    }
  }
  document.querySelector(".skip-link").addEventListener("click", event => { event.preventDefault(); const main = $("main"); main.focus(); main.scrollIntoView({ block: "start" }); });
  start();
})();
