/* The month view of a level's date calendar. The grid's cells, runs and
   span starts come from lib/reading-calendar.js (monthGrid); this file only
   builds the DOM, as text. Seven columns on wide screens; a list of days on
   phones (styles/daily-reading.css). */
(function () {
  "use strict";
  const D = window.LiminalDailyReading, Cal = window.LiminalReadingCalendar, R = window.LiminalDailyReadingRender, C = window.LiminalReaderControls;
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let monthNav = null;

  function navigation(grade, month) {
    const previous = Cal.addMonths(month, -1), next = Cal.addMonths(month, 1), name = Cal.monthLabel;
    // Months end at 0001-01 and 9999-12: past either end there is no link.
    const step = (value, word) => { const href = value && D.monthRoute(grade, value); return href ? { href, label: word + " month: " + name(value) } : null; };
    monthNav = C.navigation({ label: "Months", compact: true, steps: ["previous", "next"], previous: step(previous, "Previous"), next: step(next, "Next") }, monthNav);
    const holder = document.getElementById("dailyMonthNavigation");
    if (!monthNav.parentElement) holder.append(monthNav);
    let today = holder.querySelector(".daily-today");
    if (!today) { today = R.el("a", "This month", "daily-today"); holder.append(today); }
    today.href = D.monthRoute(grade, Cal.today().slice(0, 7));
  }
  function show(grid, { grade, month, calendar, spans, today }) {
    navigation(grade, month);
    const model = Cal.monthGrid(calendar, spans, month), runs = new Map();
    const head = R.el("div", undefined, "daily-cal-days"); head.setAttribute("aria-hidden", "true");
    WEEKDAYS.forEach(day => head.append(R.el("span", day.slice(0, 3))));
    const list = R.el("ol", undefined, "daily-cal-grid");
    model.weeks.flat().forEach((cell, i) => {
      if (!cell) { const pad = R.el("li", undefined, "daily-cal-pad"); pad.setAttribute("aria-hidden", "true"); list.append(pad); return; }
      const item = R.el("li", undefined, "daily-cal-cell daily-run-" + cell.run + (cell.spanStart ? " daily-span-start" : "") + (cell.date === today ? " is-today" : ""));
      const link = R.link("", D.dateRoute(grade, cell.date));
      const weekday = WEEKDAYS[i % 7], run = cell.run === "single" ? null : runs.get(cell.date) || Cal.runOn(calendar, cell.date);
      const short = R.el("span", weekday.slice(0, 3) + " ", "daily-cal-weekday"); short.setAttribute("aria-hidden", "true");
      const number = R.el("span", undefined, "daily-cal-date"); number.append(short, document.createTextNode(String(cell.day)));
      link.append(R.el("span", weekday + ", " + Cal.MONTHS[model.month - 1] + " ", "daily-sr"), number);
      if (cell.date === today) link.append(R.el("span", " (today)", "daily-sr"));
      link.append(R.el("span", cell.entry ? cell.entry.title : "No reading", "daily-cal-title"));
      if (run) link.append(R.el("span", "Part " + run.part + " of " + run.of, "daily-cal-part"));
      if (cell.entry && cell.entry.week) link.append(R.el("span", "School " + D.nightLabel(cell.entry.week, cell.entry.day).replace("Week ", "week ").replace("Day ", "day "), "daily-cal-school"));
      if (cell.date === today) link.setAttribute("aria-current", "date");
      item.append(link); list.append(item);
    });
    const legend = R.el("p", "A bar joins the days of one continued story. A mark on a day’s top edge starts a new span: on those days every level begins something new.", "daily-cal-legend");
    grid.replaceChildren(legend, head, list);
  }
  // A level without a calendar has no months to step through: the month
  // navigation of the level shown before goes too.
  function unavailable(grid, grade) {
    document.getElementById("dailyMonthNavigation").replaceChildren(); monthNav = null;
    const note = R.el("section", undefined, "daily-unavailable");
    note.append(R.el("p", "The date calendar for " + D.gradeLabel(grade) + " is not available yet. " + WRITTEN_BY_YEAR));
    note.append(links([{ label: "Open the " + D.gradeLabel(grade) + " school year", href: D.browseRoute(grade) }]));
    grid.replaceChildren(note);
  }
  const WRITTEN_BY_YEAR = "The date calendar is written one year at a time, and a level’s calendar appears with its first written year.";
  function links(items) {
    const list = R.el("ul", undefined, "daily-unavailable-links");
    items.forEach(item => { const li = R.el("li"); li.append(R.link(item.label, item.href)); list.append(li); });
    return list;
  }
  // A date or month whose cycle year is not written yet (`note` from
  // lib/reading-calendar.js unwritten): what is missing, why, and links to
  // the nearest dates (or their months) with readings and to the school
  // year, so the view is never empty.
  function notice(grade, note, { month = false, heading = "h1" } = {}) {
    const section = R.el("section", undefined, "daily-unavailable daily-unwritten"), title = R.el(heading, note.heading);
    if (heading === "h1") title.tabIndex = -1;
    section.append(title, R.el("p", note.text));
    section.append(links([...note.dates.map(date => month
      ? { label: "Open " + Cal.monthLabel(date.slice(0, 7)), href: D.monthRoute(grade, date.slice(0, 7)) }
      : { label: "Open " + Cal.longDate(date), href: D.dateRoute(grade, date) }),
    { label: "Open the " + D.gradeLabel(grade) + " school year", href: D.browseRoute(grade) }]));
    return section;
  }
  // A month in a year not written yet keeps its month navigation, so the
  // months either side stay one step away.
  function unwritten(grid, { grade, month, note }) {
    navigation(grade, month);
    grid.replaceChildren(notice(grade, note, { month: true, heading: "h2" }));
  }
  window.LiminalDailyReadingCalendar = { show, unavailable, unwritten, notice, links, WRITTEN_BY_YEAR };
})();
