/* Print a day for several levels: choose a calendar date or a school night
   and the levels, see what will print, then make one PDF in which every
   level starts on a fresh sheet. Decisions (what each level prints, footers,
   file names) come from lib/daily-reading.js; the TeX from lib/reading-tex.js
   (dayTeX); typesetting and saving from app/pdf-action.js (see
   docs/printing.md). Without the typesetter the PDF button is disabled with
   a sentence saying so, and browser printing remains. */
(function () {
  "use strict";
  const D = window.LiminalDailyReading, Cal = window.LiminalReadingCalendar, R = window.LiminalDailyReadingRender;
  const $ = id => document.getElementById(id);
  const form = $("dailyPrintForm"), byDate = $("dailyPrintByDate"), byNight = $("dailyPrintByNight"), dateInput = $("dailyPrintDate");
  const weekSelect = $("dailyPrintWeek"), daySelect = $("dailyPrintDay"), levels = $("dailyPrintLevels"), preview = $("dailyPrintPreview");
  const browserButton = $("dailyPrintBrowser"), note = $("dailyPrintNote"), pages = $("dailyPrintPages");
  const T = window.LiminalReadingTeX, A = window.LiminalPdfAction;
  let ctx = null, ready = false, loaded = [], version = 0, pdf = null;

  // The PDF control replaces the placeholder button; its status line follows the actions.
  function setupPdf() {
    const placeholder = $("dailyPrintPdf");
    if (!T || !A) { placeholder.disabled = true; note.before(R.el("p", "PDF generation is unavailable in this copy of the site.", "daily-pdf")); return null; }
    const control = A.control({ label: "Make one PDF", prepare: () => loaded.length ? { ...T.dayTeX(entries()), filename: D.printFilename({ ...selection(), grades: loaded.map(item => item.grade) }) } : null });
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
  // reloading the view, so a chosen day can be bookmarked or shared.
  function selection() {
    const grades = [...levels.querySelectorAll("input:checked")].map(box => D.gradeFromKey(box.value));
    return byNight.checked ? { week: Number(weekSelect.value), day: Number(daySelect.value), grades } : { date: D.validDate(dateInput.value) ? dateInput.value : ctx.today, grades };
  }
  function changed() {
    const chosen = selection();
    dateInput.disabled = !byDate.checked; weekSelect.disabled = daySelect.disabled = !byNight.checked;
    history.replaceState(null, "", D.printRoute(chosen));
    update(chosen);
  }
  function show(selected, context) {
    ctx = context; setup(context.index);
    const night = !!selected.week;
    byNight.checked = night; byDate.checked = !night;
    dateInput.value = selected.date || context.today; weekSelect.value = selected.week || 1; daySelect.value = selected.day || 1;
    dateInput.disabled = night; weekSelect.disabled = daySelect.disabled = !night;
    const grades = selected.grades.length ? selected.grades : [context.remembered && D.gradeAt(context.index, context.remembered.grade) ? context.remembered.grade : context.index.grades[0].grade];
    levels.querySelectorAll("input").forEach(box => { box.checked = grades.includes(D.gradeFromKey(box.value)); });
    if (selected.invalid) context.announce("That print link was not fully recognized; check the day and levels.", true);
    update(selection());
  }

  // What each level prints: its reading for the date or night, resolved
  // from the built files, with the footer that names it.
  async function resolve(item, chosen) {
    if (chosen.date) {
      const calendar = await ctx.getJson(D.calendarFile(item.grade)), entry = Cal.readingOn(calendar, chosen.date);
      if (!entry || !D.validReadingId(item.grade, entry.id)) throw new Error("No reading");
      const data = await ctx.getJson(D.readingFile(item.grade, entry.id));
      if (data.grade !== item.grade || !data.reading || data.reading.id !== entry.id) throw new Error("Mismatch");
      const run = Cal.runOn(calendar, chosen.date);
      return { ...item, reading: data.reading, source: data.source, run: run && { part: run.part, of: run.of }, packet: { ...D.studentPacket(item.grade, data.reading, data.source), date: chosen.date } };
    }
    const course = await ctx.getJson(D.weekFile(item.grade, chosen.week)), day = D.dayAt(course, chosen.week, chosen.day), source = D.sourceAt(course, day);
    if (!day || !source || course.grade !== item.grade) throw new Error("Mismatch");
    const browse = await ctx.getJson(D.browseFile(item.grade)).catch(() => null), run = browse && D.continuation(item.grade, browse.nights, chosen.week, chosen.day);
    return { ...item, reading: day, source, run: run && { part: run.part, of: run.of }, packet: D.studentReading(course, chosen.week, chosen.day) };
  }
  async function update(chosen) {
    const mine = ++version, plan = D.printPlan(ctx.index, chosen), canPdf = engine();
    if (pdf) pdf.cancel();
    const pdfButton = $("dailyPrintPdf");
    preview.setAttribute("aria-busy", "true"); pdfButton.disabled = browserButton.disabled = true;
    const results = await Promise.all(plan.map(item => item.available ? resolve(item, chosen).catch(() => ({ ...item, available: false, reason: "This reading could not be loaded." })) : item));
    if (mine !== version) return;
    loaded = results.filter(item => item.available);
    preview.replaceChildren(...(results.length ? results.map((item, i) => {
      const li = R.el("li", undefined, item.available ? "daily-print-item" : "daily-print-item is-unavailable");
      li.append(R.el("p", item.label + (item.available && loaded.indexOf(item) > 0 ? canPdf ? " · starts on a fresh sheet" : " · starts on a new page" : ""), "daily-print-level"));
      if (!item.available) { li.append(R.el("p", item.reason, "daily-muted")); return li; }
      const credit = D.selectionCredit(item.reading, item.source);
      li.append(R.el("p", item.reading.title, "daily-print-title"),
        R.el("p", [credit.author, item.reading.time.totalMinutes + " min", item.run ? "Part " + item.run.part + " of " + item.run.of : null].filter(Boolean).join(" · "), "daily-muted"));
      return li;
    }) : [R.el("li", "Choose at least one level.", "daily-print-item is-unavailable")]));
    preview.setAttribute("aria-busy", "false");
    $("dailyPrintIntro").textContent = canPdf ? "One PDF in which each level starts on a fresh sheet, so two-sided printing never puts two levels on one sheet of paper." :
      "Every chosen level’s reading for one day, each starting on a new page.";
    pdfButton.disabled = !canPdf || !loaded.length; browserButton.disabled = !loaded.length;
    note.textContent = canPdf ? "The PDF starts each level on an odd page, adding a blank back where needed." :
      "Printing from this browser starts each level on a new page; on a two-sided printer a level can share a sheet with the one before it.";
  }

  function entries() { return loaded.map(item => ({ day: item.reading, source: item.source, meta: item.footer, run: item.run })); }
  // Browser printing: every level's student copy, each starting a new page.
  function printHere() {
    if (!loaded.length) return;
    pages.replaceChildren(...loaded.map(item => {
      const section = R.el("section", undefined, "daily-print-level-copy");
      section.append(R.el("p", item.footer + " · Liminal", "daily-print-level-meta"), R.reading(item.packet, { run: item.run }));
      return section;
    }));
    // Reading ids are unique per page; the copies are print-only.
    pages.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    document.body.classList.add("daily-printing-day");
    const done = () => { document.body.classList.remove("daily-printing-day"); pages.replaceChildren(); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  }
  window.LiminalDailyReadingPrint = { show };
})();
