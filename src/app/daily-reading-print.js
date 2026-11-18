/* Print readings for several levels: choose a range of calendar dates (one
   date is a range of one) or a school night, and the levels; see what will
   print; then make one PDF, level by level with each level's readings in date
   order, in which every reading starts on an odd page. Decisions (what each
   level prints, footers, file names) come from lib/daily-reading.js; the TeX
   from lib/reading-tex.js (printTeX); typesetting and saving from
   app/pdf-action.js (see docs/printing.md). Without the typesetter the PDF
   button is disabled with a sentence saying so, and browser printing remains. */
(function () {
  "use strict";
  const D = window.LiminalDailyReading, Cal = window.LiminalReadingCalendar, R = window.LiminalDailyReadingRender;
  const $ = id => document.getElementById(id);
  const form = $("dailyPrintForm"), byDate = $("dailyPrintByDate"), byNight = $("dailyPrintByNight"), dateInput = $("dailyPrintDate"), untilInput = $("dailyPrintUntil");
  const weekSelect = $("dailyPrintWeek"), daySelect = $("dailyPrintDay"), levels = $("dailyPrintLevels"), preview = $("dailyPrintPreview"), count = $("dailyPrintCount");
  const browserButton = $("dailyPrintBrowser"), note = $("dailyPrintNote"), pages = $("dailyPrintPages");
  const T = window.LiminalReadingTeX, A = window.LiminalPdfAction;
  let ctx = null, ready = false, loaded = [], version = 0, pdf = null;

  // The PDF control replaces the placeholder button; its status line follows the actions.
  function setupPdf() {
    const placeholder = $("dailyPrintPdf");
    if (!T || !A) { placeholder.disabled = true; note.before(R.el("p", "PDF generation is unavailable in this copy of the site.", "daily-pdf")); return null; }
    const control = A.control({ label: "Make one PDF", prepare: () => loaded.length ? { ...T.printTeX(printLevels()), filename: D.printFilename({ ...selection(), grades: loaded.map(item => item.grade) }) } : null });
    control.button.id = "dailyPrintPdf"; control.button.classList.add("daily-primary"); placeholder.replaceWith(control.button);
    const line = R.el("p", undefined, "daily-pdf"); line.append(control.status, " ", control.credits); note.before(line);
    return control;
  }
  const engine = () => !!(pdf && pdf.available);
  function option(label, value) { const node = R.el("option", label); node.value = value; return node; }
  function setup(index) {
    if (ready) return;
    ready = true;
    for (let week = 1; week <= 36; week++) weekSelect.append(option(week, week));
    for (let day = 1; day <= 5; day++) daySelect.append(option(day, day));
    // Name the levels without a date calendar only when some levels have one.
    const mixed = index.grades.some(course => course.calendar);
    index.grades.forEach(course => {
      const label = R.el("label", undefined, "daily-choice"), box = R.el("input");
      box.type = "checkbox"; box.value = D.gradeKey(course.grade); box.name = "dailyPrintLevel";
      label.append(box, document.createTextNode(" " + D.gradeLabel(course.grade) + (mixed && !course.calendar ? " (school year only)" : "")));
      levels.append(label);
    });
    form.addEventListener("change", changed);
    form.addEventListener("submit", event => event.preventDefault());
    pdf = setupPdf();
    browserButton.addEventListener("click", printHere);
  }
  // The form is the state; its route is kept in the address without
  // reloading the view, so a chosen range can be bookmarked or shared. A
  // last date equal to the first (or none) prints that one date.
  function selection() {
    const grades = [...levels.querySelectorAll("input:checked")].map(box => D.gradeFromKey(box.value));
    if (byNight.checked) return { week: Number(weekSelect.value), day: Number(daySelect.value), grades };
    const date = D.validDate(dateInput.value) ? dateInput.value : ctx.today;
    return { date, until: D.validDate(untilInput.value) && untilInput.value !== date ? untilInput.value : null, grades };
  }
  // The last date's picker offers the first date through a month after it.
  function limits() {
    const first = D.validDate(dateInput.value) ? dateInput.value : null;
    untilInput.min = first || ""; untilInput.max = first ? Cal.addDays(first, D.MAX_PRINT_DAYS - 1) || "" : "";
  }
  function changed(event) {
    // A first date moved past the last one takes the last one with it.
    if (event && event.target === dateInput && D.validDate(dateInput.value) && (!D.validDate(untilInput.value) || untilInput.value < dateInput.value)) untilInput.value = dateInput.value;
    limits();
    const chosen = selection();
    dateInput.disabled = untilInput.disabled = !byDate.checked; weekSelect.disabled = daySelect.disabled = !byNight.checked;
    history.replaceState(null, "", D.printRoute(chosen));
    update(chosen);
  }
  function show(selected, context) {
    ctx = context; setup(context.index);
    const night = !!selected.week;
    byNight.checked = night; byDate.checked = !night;
    dateInput.value = selected.date || context.today; untilInput.value = selected.until || dateInput.value; limits();
    weekSelect.value = selected.week || 1; daySelect.value = selected.day || 1;
    dateInput.disabled = untilInput.disabled = night; weekSelect.disabled = daySelect.disabled = !night;
    const grades = selected.grades.length ? selected.grades : [context.remembered && D.gradeAt(context.index, context.remembered.grade) ? context.remembered.grade : context.index.grades[0].grade];
    levels.querySelectorAll("input").forEach(box => { box.checked = grades.includes(D.gradeFromKey(box.value)); });
    if (selected.invalid) context.announce("That print link was not fully recognized; check the dates and levels.", true);
    update(selection());
  }

  // What each level prints: its reading for each date, or for the school
  // night, resolved from the built files, with the footer that names it.
  async function dateNight(item, night) {
    const entry = Cal.readingOn(item.calendar, night.date);
    if (!entry || !D.validReadingId(item.grade, entry.id)) throw new Error("No reading");
    const data = await ctx.getJson(D.readingFile(item.grade, entry.id));
    if (data.grade !== item.grade || !data.reading || data.reading.id !== entry.id) throw new Error("Mismatch");
    const run = Cal.runOn(item.calendar, night.date);
    return { ...night, reading: data.reading, source: data.source, run: run && { part: run.part, of: run.of },
      packet: { ...D.studentPacket(item.grade, data.reading, data.source), date: night.date } };
  }
  async function schoolNight(item, night) {
    const course = await ctx.getJson(D.weekFile(item.grade, night.week)), day = D.dayAt(course, night.week, night.day), source = D.sourceAt(course, day);
    if (!day || !source || course.grade !== item.grade) throw new Error("Mismatch");
    const browse = await ctx.getJson(D.browseFile(item.grade)).catch(() => null), run = browse && D.continuation(item.grade, browse.nights, night.week, night.day);
    return { ...night, reading: day, source, run: run && { part: run.part, of: run.of }, packet: D.studentReading(course, night.week, night.day) };
  }
  // Runs `task` over `items` a few at a time, keeping their order.
  async function inTurn(items, task, width = 6) {
    const results = new Array(items.length);
    let next = 0;
    const worker = async () => { while (next < items.length) { const at = next++; results[at] = await task(items[at]); } };
    await Promise.all(Array.from({ length: Math.min(width, items.length) }, worker));
    return results;
  }
  const failed = item => ({ ...item, available: false, reason: "A reading for " + item.label + " could not be loaded." });
  async function load(plan, chosen) {
    const prepared = await Promise.all(plan.map(async item => {
      if (!item.available || !chosen.date) return item;
      try { return { ...item, calendar: await ctx.getJson(D.calendarFile(item.grade)) }; } catch (error) { return failed(item); }
    }));
    const jobs = prepared.flatMap(item => item.available ? item.nights.map(night => ({ item, night })) : []);
    const done = await inTurn(jobs, ({ item, night }) => (chosen.date ? dateNight(item, night) : schoolNight(item, night)).catch(() => null));
    return prepared.map(item => {
      if (!item.available) return item;
      const nights = done.filter((night, at) => jobs[at].item === item);
      return nights.every(Boolean) ? { ...item, nights } : failed(item);
    });
  }

  function describe(night) {
    const credit = D.selectionCredit(night.reading, night.source);
    return [R.el("p", night.reading.title, "daily-print-title"),
      R.el("p", [credit.author, night.reading.time.totalMinutes + " min", night.run ? "Part " + night.run.part + " of " + night.run.of : null].filter(Boolean).join(" · "), "daily-muted")];
  }
  // One level of the preview; over a range, its readings in date order.
  function level(item) {
    const li = R.el("li", undefined, item.available ? "daily-print-item" : "daily-print-item is-unavailable");
    li.append(R.el("p", item.label + (item.available && item.nights.length > 1 ? " · " + item.nights.length + " readings" : ""), "daily-print-level"));
    if (!item.available) { li.append(R.el("p", item.reason, "daily-muted")); return li; }
    if (item.nights.length === 1) { li.append(...describe(item.nights[0])); return li; }
    const list = R.el("ol", undefined, "daily-print-nights");
    list.append(...item.nights.map(night => {
      const row = R.el("li"), holiday = Cal.holidayOn(night.date);
      row.append(R.el("p", Cal.shortDate(night.date) + (holiday ? " · " + holiday.name : ""), "daily-print-date"), ...describe(night));
      return row;
    }));
    li.append(list);
    return li;
  }
  async function update(chosen) {
    const mine = ++version, canPdf = engine(), problem = chosen.date ? D.printRangeProblem(chosen.date, chosen.until) : null;
    const plan = D.printPlan(ctx.index, chosen);
    if (pdf) pdf.cancel();
    const pdfButton = $("dailyPrintPdf");
    preview.setAttribute("aria-busy", "true"); pdfButton.disabled = browserButton.disabled = true;
    const results = problem ? [] : await load(plan, chosen);
    if (mine !== version) return;
    loaded = results.filter(item => item.available);
    const message = text => [R.el("li", text, "daily-print-item is-unavailable")];
    preview.replaceChildren(...(!plan.length ? message("Choose at least one level.") : problem ? message(problem) : results.map(level)));
    preview.setAttribute("aria-busy", "false");
    const readings = loaded.reduce((sum, item) => sum + item.nights.length, 0);
    count.textContent = !readings ? "" : readings === 1 ? "One reading." : readings + " readings" + (loaded.length > 1 ? ", " + loaded.length + " levels" : "") + ".";
    $("dailyPrintIntro").textContent = canPdf ? "One PDF, level by level, with each level’s readings in date order. Every reading starts on an odd page, so two-sided printing gives each reading sheets of its own." :
      "Every chosen level’s readings, level by level and in date order, each starting on a new page.";
    pdfButton.disabled = !canPdf || !loaded.length; browserButton.disabled = !loaded.length;
    note.textContent = canPdf ? "The PDF adds a blank back page wherever a reading would otherwise start on an even page." :
      "Printing from this browser starts every reading on a new page; on a two-sided printer a reading can share a sheet with the one before it.";
  }

  // The PDF's levels, each a list of its readings in date order.
  function printLevels() { return loaded.map(item => ({ nights: item.nights.map(night => ({ day: night.reading, source: night.source, meta: night.footer, run: night.run })) })); }
  // Browser printing: every reading's student copy, each starting a new page.
  function printHere() {
    if (!loaded.length) return;
    pages.replaceChildren(...loaded.flatMap(item => item.nights.map(night => {
      const section = R.el("section", undefined, "daily-print-level-copy");
      section.append(R.el("p", night.footer + " · Liminal", "daily-print-level-meta"), R.reading(night.packet, { run: night.run }));
      return section;
    })));
    // Reading ids are unique per page; the copies are print-only.
    pages.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    document.body.classList.add("daily-printing-day");
    const done = () => { document.body.classList.remove("daily-printing-day"); pages.replaceChildren(); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  }
  window.LiminalDailyReadingPrint = { show };
})();
