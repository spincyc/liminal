/* The Browse view: one grade's year at a glance, with search and filters.
   Every decision (projection, matching, runs, labels) comes from
   lib/daily-reading.js; this file only builds and updates the DOM, as text. */
(function () {
  "use strict";
  const D = window.LiminalDailyReading, R = window.LiminalDailyReadingRender;
  const $ = id => document.getElementById(id);
  const heading = $("dailyBrowseHeading"), summary = $("dailyBrowseSummary"), list = $("dailyYear"), count = $("dailyCount");
  const query = $("dailyQuery"), modeSelect = $("dailyMode"), genreSelect = $("dailyGenre"), grades = $("dailyGrades");
  let shown = null; // { data, items: [{ night, element }], weeks: [{ week, element }], stages: [element] }

  function option(label, value) { const node = R.el("option", label); node.value = value; return node; }
  function minutes(span) { return span[0] === span[1] ? span[0] + " min" : span[0] + "–" + span[1] + " min"; }

  // The library's grades, from the index: new levels appear without code.
  function gradeLinks(index, current) {
    grades.replaceChildren(...index.grades.map(course => {
      const item = R.el("li"), link = R.link(D.gradeKey(course.grade).toUpperCase(), D.browseRoute(course.grade));
      link.setAttribute("aria-label", D.gradeLabel(course.grade));
      if (course.grade === current) link.setAttribute("aria-current", "page");
      item.append(link); return item;
    }));
  }

  function nightItem(grade, night, run) {
    const item = R.el("li", undefined, "daily-night"), link = R.link("", D.route(grade, night.week, night.day));
    const body = R.el("span", undefined, "daily-night-body");
    const work = D.workLabel(night), meta = [night.author, work, night.minutes + " min", D.modeLabel(night.mode), D.genreLabel(night.genre)].filter(Boolean);
    body.append(R.el("span", night.title, "daily-night-title"), R.el("span", meta.join(" · "), "daily-night-meta"));
    if (run) body.append(R.el("span", "Part " + run.part + " of " + run.of + (run.part < run.of ? " · continues next night" : ""), "daily-night-run"));
    link.append(R.el("span", "Day " + night.day, "daily-night-day"), body);
    item.append(link);
    if (run && run.part > 1) item.classList.add("is-continued");
    if (run && run.part < run.of) item.classList.add("continues");
    return item;
  }
  function build(data) {
    const nights = data.nights, parts = D.runs(nights), items = [], weeks = [], stages = [];
    const year = R.el("div");
    data.progression.forEach(stage => {
      const section = R.el("section", undefined, "daily-stage-group");
      const title = R.el("h3", "Weeks " + stage.weeks[0] + "–" + stage.weeks[1], "daily-stage-title");
      section.append(title, R.el("p", stage.focus, "daily-stage-focus"));
      const grid = R.el("div", undefined, "daily-weeks");
      for (let week = stage.weeks[0]; week <= stage.weeks[1]; week++) {
        const block = R.el("section", undefined, "daily-week"), label = R.el("h4", "Week " + week);
        const ol = R.el("ol", undefined, "daily-nights");
        nights.forEach((night, i) => {
          if (night.week !== week) return;
          const element = nightItem(data.grade, night, parts[i]); items.push({ night, element }); ol.append(element);
        });
        block.append(label, ol); grid.append(block); weeks.push({ week, element: block });
      }
      section.append(grid); year.append(section); stages.push(section);
    });
    return { data, items, weeks, stages, year };
  }

  function filters(nights) {
    const mode = modeSelect.value, genre = genreSelect.value;
    modeSelect.replaceChildren(option("Any", ""), ...D.modes(nights).map(value => option(D.modeLabel(value), value)));
    genreSelect.replaceChildren(option("Any", ""), ...D.genres(nights).map(value => option(D.genreLabel(value), value)));
    // Keep a choice that still applies to this grade.
    modeSelect.value = [...modeSelect.options].some(item => item.value === mode) ? mode : "";
    genreSelect.value = [...genreSelect.options].some(item => item.value === genre) ? genre : "";
  }

  function apply() {
    if (!shown) return;
    const matches = new Set(D.filterNights(shown.data.nights, { query: query.value, mode: modeSelect.value, genre: genreSelect.value }));
    shown.items.forEach(({ night, element }) => { element.hidden = !matches.has(night); });
    shown.weeks.forEach(({ element }) => { element.hidden = !element.querySelector(".daily-night:not([hidden])"); });
    shown.stages.forEach(element => { element.hidden = !element.querySelector(".daily-week:not([hidden])"); });
    const total = shown.data.nights.length, filtered = !!(query.value.trim() || modeSelect.value || genreSelect.value);
    count.replaceChildren(filtered ? matches.size + " of " + total + " nights match." : "");
    if (filtered) {
      const clear = R.el("button", "Clear filters", "daily-clear"); clear.type = "button";
      clear.addEventListener("click", () => { query.value = ""; modeSelect.value = ""; genreSelect.value = ""; apply(); query.focus(); });
      count.append(" ", clear);
    }
  }

  // Shows a grade. `last` is the night most recently opened in the reader:
  // when it belongs to this grade, it is marked and brought into view.
  function show(index, data, { last = null, focus = false } = {}) {
    gradeLinks(index, data.grade);
    shown = build(data);
    heading.textContent = D.gradeLabel(data.grade);
    const span = D.minutesSpan(data.nights);
    summary.textContent = data.nights.length + " nights · " + (span ? minutes(span) + " each · " : "") + D.modes(data.nights).map(D.modeLabel).join(", ");
    const about = R.disclosure("About this reading year", "daily-year");
    about.append(R.el("p", data.overview));
    list.replaceChildren(about, shown.year);
    filters(data.nights); apply();
    let target = null;
    if (last && last.grade === data.grade) {
      const found = shown.items.find(({ night }) => night.week === last.week && night.day === last.day);
      if (found && !found.element.hidden) { target = found.element.querySelector("a"); target.setAttribute("aria-current", "true"); }
    }
    if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ block: "center" }); }
    else if (focus) { heading.focus(); heading.scrollIntoView({ block: "start" }); }
  }

  query.addEventListener("input", apply);
  modeSelect.addEventListener("change", apply);
  genreSelect.addEventListener("change", apply);
  query.form.addEventListener("submit", event => { event.preventDefault(); apply(); });

  window.LiminalDailyReadingBrowse = { show };
})();
