/* Preview and print a holiday week, calendar dates or a school night for
   several levels. The browser print and TeX copies use the same selection. */
(function () {
  "use strict";
  const D = window.LiminalDailyReading, Cal = window.LiminalReadingCalendar, R = window.LiminalDailyReadingRender;
  const $ = id => document.getElementById(id);
  const form = $("dailyPrintForm"), byDate = $("dailyPrintByDate"), byNight = $("dailyPrintByNight"), dateInput = $("dailyPrintDate"), untilInput = $("dailyPrintUntil");
  const weekSelect = $("dailyPrintWeek"), daySelect = $("dailyPrintDay"), levels = $("dailyPrintLevels"), preview = $("dailyPrintPreview"), count = $("dailyPrintCount");
  const holidaySelect = $("dailyHoliday"), holidayYear = $("dailyHolidayYear");
  const browserButton = $("dailyPrintBrowser"), note = $("dailyPrintNote"), pages = $("dailyPrintPages");
  const T = window.LiminalReadingTeX, A = window.LiminalPdfAction;
  const H = window.LiminalHolidayWeeks;
  let ctx = null, ready = false, holidayMode = false, loaded = [], version = 0, pdf = null, job = null;

  // The PDF control replaces the placeholder button; its status line follows the actions.
  function setupPdf() {
    const placeholder = $("dailyPrintPdf");
    if (!T || !A) { placeholder.disabled = true; note.before(R.el("p", "PDF generation is unavailable in this copy of the site.", "daily-pdf")); return null; }
    const control = A.control({ prepare: () => {
      if (!job) return null;
      const levels = printLevels();
      return { ...(job.holiday ? T.documentTeX(levels) : T.printTeX(levels)), filename: job.filename };
    } });
    control.button.id = "dailyPrintPdf"; control.button.classList.add("daily-primary"); placeholder.replaceWith(control.button);
    const line = R.el("p", undefined, "daily-pdf"); line.append(control.status, " ", control.credits); note.before(line);
    return control;
  }
  const engine = () => !!(pdf && pdf.available);
  function option(label, value) { const node = R.el("option", label); node.value = value; return node; }
  function setup() {
    if (ready) return;
    ready = true;
    for (let week = 1; week <= 36; week++) weekSelect.append(option(week, week));
    for (let day = 1; day <= 5; day++) daySelect.append(option(day, day));
    Cal.HOLIDAYS.forEach(holiday => holidaySelect.append(option(holiday.name, holiday.key)));
    function checkLevels(checked) {
      levels.querySelectorAll("input").forEach(box => { box.checked = checked; });
      changed();
    }
    $("dailyHolidayAll").addEventListener("click", () => checkLevels(true));
    $("dailyHolidayClear").addEventListener("click", () => checkLevels(false));
    form.addEventListener("change", changed);
    form.addEventListener("submit", event => event.preventDefault());
    pdf = setupPdf();
    browserButton.addEventListener("click", printHere);
  }
  function levelChoices(index, chosen) {
    levels.replaceChildren();
    const mixed = index.grades.some(course => course.calendar);
    index.grades.filter(course => !holidayMode || !D.isAdvanced(course.grade)).forEach(course => {
      const label = R.el("label", undefined, "daily-choice"), box = R.el("input");
      box.type = "checkbox"; box.value = D.gradeKey(course.grade); box.name = "dailyPrintLevel";
      box.checked = chosen.includes(course.grade);
      label.append(box, document.createTextNode(" " + D.gradeLabel(course.grade) + (mixed && !course.calendar ? " (school year only)" : "")));
      levels.append(label);
    });
  }
  // The form is the state; its route is kept in the address without
  // reloading the view, so a chosen range can be bookmarked or shared. A
  // last date equal to the first (or none) prints that one date.
  function selection() {
    const grades = [...levels.querySelectorAll("input:checked")].map(box => D.gradeFromKey(box.value));
    if (holidayMode) return { holiday: holidaySelect.value, year: holidayYear.valueAsNumber, grades };
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
    const chosen = selection();
    if (!holidayMode) {
      limits();
      dateInput.disabled = untilInput.disabled = !byDate.checked; weekSelect.disabled = daySelect.disabled = !byNight.checked;
    }
    const route = holidayMode ? D.holidayRoute(chosen, ctx.index) : D.printRoute(chosen);
    if (route) history.replaceState(null, "", route);
    update(chosen);
  }
  function show(selected, context) {
    ctx = context; setup();
    holidayMode = selected.view === "holidays";
    $("dailyLevelPicker").open = !holidayMode;
    $("dailyPrintDays").hidden = $("dailyPrintDays").disabled = holidayMode;
    $("dailyHolidayFields").hidden = $("dailyHolidayFields").disabled = !holidayMode;
    $("dailyHolidayLevelActions").hidden = !holidayMode;
    const other = $("dailyPrintSwitch");
    other.href = holidayMode ? "#print" : "#holidays";
    other.textContent = holidayMode ? "Print readings for a day or a range of dates" : "Holiday reading weeks";
    if (holidayMode) {
      holidaySelect.value = selected.holiday; holidayYear.value = selected.year;
      levelChoices(context.index, selected.grades);
      if (selected.invalid) context.announce("Part of this link was unrecognized. Check the holiday, year and levels.", true);
      return update(selection());
    }
    const night = !!selected.week;
    byNight.checked = night; byDate.checked = !night;
    dateInput.value = selected.date || context.today; untilInput.value = selected.until || dateInput.value; limits();
    weekSelect.value = selected.week || 1; daySelect.value = selected.day || 1;
    dateInput.disabled = untilInput.disabled = night; weekSelect.disabled = daySelect.disabled = !night;
    const grades = selected.grades.length ? selected.grades : [context.remembered && D.gradeAt(context.index, context.remembered.grade) ? context.remembered.grade : context.index.grades[0].grade];
    levelChoices(context.index, grades);
    if (selected.invalid) context.announce("That print link was not fully recognized; check the dates and levels.", true);
    update(selection());
  }

  // What each level prints: its reading for each date, or for the school
  // night, resolved from the built files, with the footer that names it.
  async function dateNight(item, night) {
    const id = night.id || Cal.readingOn(item.calendar, night.date)?.id;
    if (!D.validReadingId(item.grade, id)) throw new Error("No reading");
    const data = await ctx.getJson(D.readingFile(item.grade, id));
    if (data.grade !== item.grade || !data.reading || data.reading.id !== id || data.source?.id !== data.reading.sourceId) throw new Error("Mismatch");
    const run = night.id ? null : Cal.runOn(item.calendar, night.date);
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
  async function load(plan, chosen, mine) {
    const prepared = await Promise.all(plan.map(async item => {
      if (!item.available || !chosen.date) return item;
      try {
        const calendar = await ctx.getJson(D.calendarFile(item.grade));
        if (!chosen.holiday) return { ...item, calendar };
        const set = Cal.setFor(calendar, chosen.year);
        const ids = H.readingIds(chosen.holiday, D.gradeKey(item.grade), set, window.LiminalHolidayWeekSelections);
        return { ...item, nights: item.nights.map((night, i) => ({ ...night, id: ids[i] })) };
      } catch (_) { return failed(item); }
    }));
    const jobs = prepared.flatMap(item => item.available ? item.nights.map(night => ({ item, night })) : []);
    const done = await inTurn(jobs, ({ item, night }) => mine === version
      ? (chosen.date ? dateNight(item, night) : schoolNight(item, night)).catch(() => null) : null);
    return prepared.map(item => {
      if (!item.available) return item;
      const nights = done.filter((night, at) => jobs[at].item === item);
      if (!nights.every(Boolean)) return failed(item);
      if (chosen.holiday && T) {
        const days = nights.map(night => night.reading);
        nights.forEach(night => { night.run = T.runOf(days, night.reading); });
      }
      return { ...item, nights };
    });
  }

  function describe(night, grade) {
    const credit = D.selectionCredit(night.reading, night.source);
    const title = R.el("p", undefined, "daily-print-title");
    title.append(holidayMode ? R.link(night.reading.title, D.readingRoute(grade, night.reading.id)) : night.reading.title);
    return [title,
      R.el("p", [credit.author, night.reading.time.totalMinutes + " min", night.run ? "Part " + night.run.part + " of " + night.run.of : null].filter(Boolean).join(" · "), "daily-muted")];
  }
  // One level of the preview; over a range, its readings in date order.
  function level(item, index) {
    const li = R.el("li", undefined, item.available ? "daily-print-item" : "daily-print-item is-unavailable");
    const label = item.label + (item.available && item.nights.length > 1 ? " · " + item.nights.length + " readings" : "");
    const collapse = item.available && holidayMode;
    const group = collapse ? R.el("details") : li;
    if (collapse) { group.open = index === 0; li.append(group); }
    group.append(R.el(collapse ? "summary" : "p", label, "daily-print-level"));
    if (!item.available) { li.append(R.el("p", item.reason, "daily-muted")); return li; }
    if (item.nights.length === 1) { li.append(...describe(item.nights[0], item.grade)); return li; }
    const list = R.el("ol", undefined, "daily-print-nights");
    list.append(...item.nights.map(night => {
      const row = R.el("li"), holiday = Cal.holidayOn(night.date);
      row.append(R.el("p", Cal.shortDate(night.date) + (holiday ? " · " + holiday.name : ""), "daily-print-date"), ...describe(night, item.grade));
      return row;
    }));
    group.append(list);
    return li;
  }
  function cancel() {
    version++; job = null; loaded = [];
    if (pdf) pdf.cancel();
  }
  async function update(chosen) {
    cancel();
    const mine = version, canPdf = engine();
    const countSelected = chosen.grades.length;
    const allSelected = countSelected === levels.querySelectorAll("input").length;
    $("dailyLevelSummary").textContent = countSelected === 0 ? "Choose reading levels" :
      countSelected === 1 ? D.gradeLabel(chosen.grades[0]) :
      (allSelected ? "All " : "") + countSelected + " levels selected";
    let problem = chosen.date ? D.printRangeProblem(chosen.date, chosen.until) : null;
    if (chosen.holiday) {
      try {
        if (!H || !window.LiminalHolidayWeekSelections) throw new Error("Holiday week selections could not be loaded. Reload the page to try again.");
        const week = H.dates(chosen.holiday, chosen.year);
        chosen = { ...chosen, date: week[0], until: week[6] };
      } catch (error) { problem = error.message; }
    }
    const plan = D.printPlan(ctx.index, chosen);
    const pdfButton = $("dailyPrintPdf");
    preview.setAttribute("aria-busy", "true"); pdfButton.disabled = browserButton.disabled = true;
    count.textContent = "Loading readings…";
    const intro = $("dailyPrintIntro");
    if (chosen.holiday) {
      intro.textContent = chosen.date ? "Seven daily readings per level, from " + Cal.longDate(chosen.date) + " through " + Cal.longDate(chosen.until) + "." :
        "Choose a holiday and year for seven daily readings per level.";
      document.title = D.documentTitle([chosen.date && Cal.holidayName(chosen.holiday) + " " + chosen.year, "Holiday reading weeks"]);
    } else {
      intro.textContent = "Every chosen level’s readings for a day or a range of dates, level by level and in date order.";
    }
    const results = problem ? [] : await load(plan, chosen, mine);
    if (mine !== version) return;
    loaded = results.filter(item => item.available);
    const message = text => [R.el("li", text, "daily-print-item is-unavailable")];
    preview.replaceChildren(...(problem ? message(problem) : !plan.length ? message("Choose at least one level.") : results.map(level)));
    preview.setAttribute("aria-busy", "false");
    const readings = loaded.reduce((sum, item) => sum + item.nights.length, 0);
    count.textContent = !readings ? "" : readings === 1 ? "One reading." : readings + " readings" + (loaded.length > 1 ? ", " + loaded.length + " levels" : "") + ".";
    const complete = !chosen.holiday || loaded.length === plan.length;
    if (readings && complete) {
      const grades = loaded.map(item => item.grade);
      job = { holiday: chosen.holiday, filename: D.printFilename({ ...chosen, grades }) };
    }
    pdfButton.disabled = !canPdf || !job; browserButton.disabled = !job;
    if (!complete && !problem) note.textContent = "A selected level could not be loaded. Reload the page to retry, or change the selected levels.";
    else if (!canPdf) note.textContent = "Printing from this browser starts every reading on a new page. On a two-sided printer a reading can share a sheet with the one before it.";
    else if (chosen.holiday) note.textContent = "In the PDF, each reading starts on a new page and each level starts on a new sheet for double-sided printing.";
    else note.textContent = "Each reading starts on an odd page in the PDF, so it has its own sheets for double-sided printing.";
  }

  // The PDF's levels, each a list of its readings in date order.
  function printLevels() {
    return loaded.map(item => {
      const course = { days: item.nights.map(night => night.reading), sources: item.nights.map(night => night.source) };
      return { nights: item.nights.map(night => T.entry(course, night.reading, night.footer, night.run)) };
    });
  }
  // Browser printing: every reading's student copy, each starting a new page.
  function printHere() {
    if (!job) return;
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
  window.LiminalDailyReadingPrint = { show, cancel };
})();
