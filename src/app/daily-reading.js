(function () {
  "use strict";
  const D = window.LiminalDailyReading, R = window.LiminalDailyReadingRender;
  const status = document.getElementById("dailyStatus"), browser = document.getElementById("dailyBrowser"), container = document.getElementById("dailyContent");
  const gradeSelect = document.getElementById("dailyGrade"), weekSelect = document.getElementById("dailyWeek"), daySelect = document.getElementById("dailyDay");
  let index, request = 0, preservePickerFocus = false;
  const cache = new Map();
  function announce(message, visible = false) { status.textContent = message; status.classList.toggle("daily-sr", !visible); }
  function button(label, action) { const node = R.el("button", label); node.type = "button"; node.addEventListener("click", action); return node; }
  function option(label, value) { const node = R.el("option", label); node.value = value; return node; }
  function pickers(selected) { gradeSelect.value = D.gradeKey(selected.grade); weekSelect.value = selected.week; daySelect.value = selected.day; }
  function choose(event) {
    const reset = event && event.target === gradeSelect;
    const href = D.route(D.gradeFromKey(gradeSelect.value), reset ? 1 : Number(weekSelect.value), reset || event && event.target === weekSelect ? 1 : Number(daySelect.value));
    if (href && window.location.hash !== href) { preservePickerFocus = true; window.location.hash = href; }
  }
  function navigation(selected) {
    const nav = R.el("nav", undefined, "daily-nav"); nav.setAttribute("aria-label", "Adjacent reading nights");
    const pages = D.navigation(selected);
    if (pages.previous) { const a = R.link("← Previous night", pages.previous.href); a.setAttribute("aria-label", "Previous night: week " + pages.previous.week + ", day " + pages.previous.day); nav.append(a); }
    else nav.append(R.el("span", "First night", "daily-muted"));
    if (pages.next) { const a = R.link("Next night →", pages.next.href); a.setAttribute("aria-label", "Next night: week " + pages.next.week + ", day " + pages.next.day); nav.append(a); }
    else nav.append(R.el("span", "End of the reading year", "daily-muted"));
    return nav;
  }
  function download(packet) {
    const css = [...document.styleSheets].filter(sheet => /\/(tokens|home|daily-reading|brand)\.css(?:\?|$)/.test(sheet.href || ""))
      .map(sheet => { try { return [...sheet.cssRules].map(rule => rule.cssText).join("\n"); } catch (_) { return ""; } }).join("\n");
    const href = new URL("daily-reading.html" + D.route(packet.grade, packet.day.week, packet.day.day), window.location.href).href;
    const doc = R.exportDocument(packet, css, href), html = "<!doctype html>\n" + doc.documentElement.outerHTML;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" })), anchor = R.link("Download reading", url);
    anchor.download = "liminal-" + packet.day.id + "-student.html"; document.body.append(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); announce("Downloaded this reading and its discussion questions, without facilitator notes.");
  }
  async function render(focus = false) {
    const current = ++request, selected = D.resolve(index, window.location.hash);
    if (!selected.course) return;
    pickers(selected); container.replaceChildren(); container.setAttribute("aria-busy", "true");
    announce("Opening " + D.gradeLabel(selected.grade) + ", week " + selected.week + ", day " + selected.day + "…", true);
    try {
      let course = cache.get(selected.grade);
      if (!course) {
        // Construct the path from the validated grade, never from remote data.
        const response = await fetch("content/reading-daily/" + D.gradeKey(selected.grade) + ".json");
        if (!response.ok) throw new Error("Reading unavailable");
        course = await response.json();
        if (course.schemaVersion !== 1 || course.grade !== selected.grade || !Array.isArray(course.days) || course.days.length !== 180) throw new Error("Reading mismatch");
        cache.set(selected.grade, course);
      }
      if (current !== request) return;
      const day = D.dayAt(course, selected.week, selected.day), packet = D.studentReading(course, selected.week, selected.day);
      if (!day || !packet) throw new Error("Night unavailable");
      const article = R.reading(packet, { notes: day.questions });
      const actions = R.el("div", undefined, "daily-actions");
      actions.append(button("Print reading", () => window.print()), button("Download reading", () => download(packet)));
      const guide = R.disclosure("Tonight’s reading focus", "daily-focus"); guide.append(R.el("p", day.challenge));
      container.append(article, navigation(selected), actions, guide, R.progression(course, selected.week));
      document.title = day.title + " · " + D.gradeLabel(selected.grade) + " — Liminal";
      announce((selected.invalid ? "That reading link was not recognized. Showing " : "Showing ") + D.gradeLabel(selected.grade) + ", week " + day.week + ", day " + day.day + ": " + day.title + ".", selected.invalid);
      if (focus) { const heading = document.getElementById("dailyHeading"); heading.focus(); heading.scrollIntoView({ block: "start" }); }
    } catch (_) {
      if (current !== request) return;
      cache.delete(selected.grade); announce("This reading could not be loaded. Try again, or choose another grade.", true);
      container.replaceChildren(button("Try again", () => render()));
    } finally { if (current === request) container.setAttribute("aria-busy", "false"); }
  }
  async function start() {
    if (!D || !R) { announce("The reading library could not be loaded. Reload this page to try again.", true); return; }
    try {
      const response = await fetch("content/reading-daily/index.json");
      if (!response.ok) throw new Error("Index unavailable"); index = await response.json();
      if (index.schemaVersion !== 1 || !Array.isArray(index.grades) || index.grades.some(course => !D.validGrade(course.grade)) || new Set(index.grades.map(course => course.grade)).size !== index.grades.length) throw new Error("Index mismatch");
      if (!index.grades.length) {
        announce("The daily reading library is being prepared. ", true);
        status.append(R.link("Open weekly reading instruction", "weeks.html#common-core-reading/k/1"), document.createTextNode(" or "), R.link("explore the reading year plans.", "curriculum.html#common-core-reading/k"));
        return;
      }
      index.grades.forEach(course => {
        const choice = option(D.gradeKey(course.grade).toUpperCase(), D.gradeKey(course.grade));
        choice.setAttribute("aria-label", D.gradeLabel(course.grade)); gradeSelect.append(choice);
      });
      for (let week = 1; week <= 36; week++) weekSelect.append(option(week, week));
      for (let day = 1; day <= 5; day++) daySelect.append(option(day, day));
      [gradeSelect, weekSelect, daySelect].forEach(select => select.addEventListener("change", choose));
      document.querySelector(".daily-filters").addEventListener("submit", event => { event.preventDefault(); choose(); });
      window.addEventListener("hashchange", () => { const focus = !preservePickerFocus; preservePickerFocus = false; render(focus); });
      browser.hidden = false; render();
    } catch (_) {
      announce("The reading library could not be loaded. Reload this page to try again, or explore the year plans below.", true);
    }
  }
  document.querySelector(".skip-link").addEventListener("click", event => { event.preventDefault(); const main = document.getElementById("main"); main.focus(); main.scrollIntoView({ block: "start" }); });
  start();
})();
