/* The Year view: one grade's school year at a glance, with search, filters
   and a jump to any week. Every decision (projection, matching, runs, genre
   families, labels) comes from lib/daily-reading.js; this file only builds
   and updates the DOM, as text. */
(function () {
  "use strict";
  const D = window.LiminalDailyReading, R = window.LiminalDailyReadingRender;
  const $ = id => document.getElementById(id);
  const summary = $("dailyBrowseSummary"), list = $("dailyYear"), count = $("dailyCount");
  const query = $("dailyQuery"), modeSelect = $("dailyMode"), modeField = $("dailyModeField"), genreSelect = $("dailyGenre"), jump = $("dailyJump");
  let shown = null; // Current year, its disclosures, and their state before filtering.

  function option(label, value) { const node = R.el("option", label); node.value = value; return node; }
  function minutes(span) { return span[0] === span[1] ? span[0] + " min" : span[0] + "–" + span[1] + " min"; }
  function capital(text) { return text ? text[0].toUpperCase() + text.slice(1) : ""; }

  function nightItem(grade, night, run, first, modes) {
    const item = R.el("li", undefined, "daily-night"), link = R.link("", D.route(grade, night.week, night.day));
    const body = R.el("span", undefined, "daily-night-body");
    const work = D.workLabel(night), meta = [night.author, work, night.minutes + " min", modes > 1 ? D.modeLabel(night.mode) : null, capital(D.genreLabel(night.genre))].filter(Boolean);
    body.append(R.el("span", night.title, "daily-night-title"), R.el("span", meta.join(" · "), "daily-night-meta"));
    if (run) {
      // A run that began in an earlier week says where, so a week opened on
      // its own still leads back to part 1.
      const began = run.part > 1 && first && first.week !== night.week ? " · began " + D.nightLabel(first.week, first.day) : "";
      body.append(R.el("span", "Part " + run.part + " of " + run.of + began + (run.part < run.of ? " · continues next night" : ""), "daily-night-run"));
    }
    link.append(R.el("span", "Day " + night.day, "daily-night-day"), body);
    item.append(link);
    if (run && run.part > 1) item.classList.add("is-continued");
    if (run && run.part < run.of) item.classList.add("continues");
    return item;
  }
  function build(data, openWeek, currentWeek) {
    const nights = data.nights, parts = D.runs(nights), items = [], weeks = [], stages = [], modes = D.modes(nights).length;
    const year = R.el("div");
    data.progression.forEach(stage => {
      const section = R.el("section", undefined, "daily-stage-group");
      section.append(R.el("h3", "Weeks " + stage.weeks[0] + "–" + stage.weeks[1], "daily-stage-title"), R.el("p", stage.focus, "daily-stage-focus"));
      const group = R.el("div", undefined, "daily-weeks");
      for (let week = stage.weeks[0]; week <= stage.weeks[1]; week++) {
        const block = R.el("details", undefined, "daily-week"), label = R.el("summary"), about = D.weekSummary(nights, week);
        block.id = "dailyWeek" + week;
        const head = R.el("span", undefined, "daily-week-head");
        head.append(R.el("span", "Week " + week, "daily-week-number"));
        if (week === currentWeek) head.append(R.el("span", "Current week", "daily-week-current"));
        head.append(R.el("span", about.minutes + " min", "daily-week-count"));
        label.append(head, R.el("span", about.works.join(" · "), "daily-week-works"));
        block.open = week === openWeek;
        const ol = R.el("ol", undefined, "daily-nights");
        nights.forEach((night, i) => {
          if (night.week !== week) return;
          const run = parts[i], first = run ? nights[i - run.part + 1] : null;
          const element = nightItem(data.grade, night, run, first, modes); items.push({ night, element }); ol.append(element);
        });
        block.append(label, ol); group.append(block); weeks.push({ week, element: block, minutes: about.minutes });
      }
      section.append(group); year.append(section); stages.push(section);
    });
    return { data, items, weeks, stages, year, filtering: false, openWeeks: new Set([openWeek]) };
  }

  function filters(nights) {
    const mode = modeSelect.value, genre = genreSelect.value, modes = D.modes(nights);
    modeSelect.replaceChildren(option("Any", ""), ...modes.map(value => option(D.modeLabel(value), value)));
    genreSelect.replaceChildren(option("Any", ""), ...D.genreFamilies(nights).map(value => option(value, value)));
    // A grade read in one mode has nothing to filter by mode.
    modeField.hidden = modes.length < 2;
    // Keep a choice that still applies to this grade.
    modeSelect.value = !modeField.hidden && [...modeSelect.options].some(item => item.value === mode) ? mode : "";
    genreSelect.value = [...genreSelect.options].some(item => item.value === genre) ? genre : "";
    jump.replaceChildren(option("Choose…", ""), ...Array.from({ length: 36 }, (_, i) => option("Week " + (i + 1), String(i + 1))));
  }

  function apply() {
    if (!shown) return;
    const matches = new Set(D.filterNights(shown.data.nights, { query: query.value, mode: modeSelect.value, family: genreSelect.value }));
    const total = shown.data.nights.length, filtered = !!(query.value.trim() || modeSelect.value || genreSelect.value);
    // Search covers the whole year, including closed weeks. Keep the reader's
    // disclosure choices so clearing a search returns to a compact outline.
    if (filtered && !shown.filtering) shown.openWeeks = new Set(shown.weeks.filter(({ element }) => element.open).map(({ week }) => week));
    shown.items.forEach(({ night, element }) => { element.hidden = !matches.has(night); });
    shown.weeks.forEach(({ week, element, minutes: total }) => {
      const visible = element.querySelectorAll(".daily-night:not([hidden])").length;
      element.hidden = !visible;
      element.querySelector(".daily-week-count").textContent = filtered ? visible + " of 5 nights" : total + " min";
      if (filtered) element.open = !element.hidden;
      else if (shown.filtering) element.open = shown.openWeeks.has(week);
    });
    shown.stages.forEach(element => { element.hidden = !element.querySelector(".daily-week:not([hidden])"); });
    shown.filtering = filtered;
    count.replaceChildren(filtered ? matches.size + " of " + total + " nights match." : "");
    if (filtered) {
      const clear = R.el("button", "Clear filters", "daily-clear"); clear.type = "button";
      clear.addEventListener("click", () => { query.value = ""; modeSelect.value = ""; genreSelect.value = ""; apply(); query.focus(); });
      count.append(" ", clear);
    }
  }
  function clearFilters() { query.value = ""; modeSelect.value = ""; genreSelect.value = ""; apply(); }

  // Shows a grade. `last` is the night most recently opened in the reader:
  // when it belongs to this grade it is marked and brought into view, and
  // its week is the current week. `week` (from #browse/<grade>/<week>)
  // opens and shows that week instead.
  function show(data, { last = null, week = null, focus = false } = {}) {
    const lastHere = last && last.grade === data.grade ? last : null, currentWeek = lastHere ? lastHere.week : null;
    shown = build(data, week || currentWeek || 1, currentWeek);
    const span = D.minutesSpan(data.nights), modes = D.modes(data.nights);
    summary.textContent = D.gradeLabel(data.grade) + " · " + data.nights.length + " nights in 36 weeks · " + (span ? minutes(span) + " each" : "") + (modes.length === 1 ? " · " + D.modeLabel(modes[0]) : "");
    const about = R.disclosure("About this reading year", "daily-year");
    about.append(R.el("p", data.overview));
    list.replaceChildren(about, shown.year);
    filters(data.nights); apply();
    let target = null;
    if (week) {
      const found = shown.weeks.find(item => item.week === week);
      if (found.element.hidden) { clearFilters(); count.textContent = "Filters cleared to show week " + week + "."; }
      found.element.open = true; target = found.element.querySelector("summary");
    } else if (lastHere) {
      const found = shown.items.find(({ night }) => night.week === lastHere.week && night.day === lastHere.day);
      if (found) {
        // Next/previous-night navigation can leave the active search. Returning
        // to the year must still reveal the reading the student just opened.
        if (found.element.hidden) { clearFilters(); count.textContent = "Filters cleared to show your last reading."; }
        found.element.closest("details").open = true;
        target = found.element.querySelector("a"); target.setAttribute("aria-current", "true");
      }
    }
    if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ block: week ? "start" : "center" }); }
    else if (focus) { const heading = $("dailyBrowseHeading"); heading.focus(); heading.scrollIntoView({ block: "start" }); }
  }

  query.addEventListener("input", apply);
  modeSelect.addEventListener("change", apply);
  genreSelect.addEventListener("change", apply);
  query.form.addEventListener("submit", event => { event.preventDefault(); apply(); });
  // "Go to week" is a link in disguise: it changes the route, so the
  // browser's Back returns to where the reader was.
  jump.addEventListener("change", () => { if (shown && jump.value) window.location.hash = D.browseRoute(shown.data.grade, Number(jump.value)); jump.value = ""; });
  // Printing the year prints a reading log: every week open, then restored.
  let printing = null;
  window.addEventListener("beforeprint", () => { if (!shown || document.body.dataset.readingView !== "browse") return; printing = shown.weeks.map(({ element }) => element.open); shown.weeks.forEach(({ element }) => { element.open = true; }); });
  window.addEventListener("afterprint", () => { if (printing && shown) shown.weeks.forEach(({ element }, i) => { element.open = printing[i]; }); printing = null; });

  window.LiminalDailyReadingBrowse = { show };
})();
