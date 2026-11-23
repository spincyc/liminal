/* Preserve practice bookmarks and list published expansions under their pathway. */
(function () {
  "use strict";

  function redirectPracticeLink() {
    if (/^#(?:practice|progress|review|tips)(?:\/|$)/.test(window.location.hash)) {
      window.location.replace("practice.html" + window.location.search + window.location.hash);
    }
  }

  const index = window.LIMINAL_LESSON_MODULES;
  const N = window.LiminalNavigation;
  if (index && N) document.querySelectorAll("[data-lesson-pathway]").forEach(list => {
    const entries = index.modules.filter(entry => entry.trackId === list.dataset.lessonPathway).sort((a, b) => a.grade - b.grade);
    list.replaceChildren();
    entries.forEach(entry => {
      const item = document.createElement("li"), link = document.createElement("a"), scope = document.createElement("span");
      link.href = "lessons.html" + N.lessonRoute(entry.trackId, entry.grade);
      link.textContent = (entry.grade === 0 ? "Kindergarten" : "Grade " + entry.grade) + " expanded lessons";
      scope.textContent = (entry.units && entry.units.length ? entry.units.length + " topics · " : "") + "Fresh practice";
      link.append(scope); item.append(link); list.append(item);
    });
    list.hidden = !entries.length;
  });

  const search = window.document?.getElementById("directorySearch");
  if (search) {
    const input = document.getElementById("directoryQuery");
    const clear = document.getElementById("directoryClear");
    const status = document.getElementById("directoryStatus");
    const terms = text => text.toLowerCase().match(/[a-z0-9]+/g) || [];
    const label = anchor => Array.from(anchor.childNodes, node => node.textContent).join(" ");
    const areas = Array.from(document.querySelectorAll(".study-area"), area => {
      const heading = area.dataset.searchTerms || area.querySelector("h2").textContent;
      const links = Array.from(area.querySelectorAll("li > a"), anchor => {
        const row = anchor.parentElement;
        const parent = row.parentElement.closest("li");
        const pathway = parent ? label(parent.querySelector(":scope > a")) : "";
        const keywords = terms([heading, pathway, label(anchor), anchor.dataset.searchTerms].join(" "));
        return { row, parent, keywords };
      });
      return { area, links };
    });

    function filterDirectory() {
      const query = input.value.trim();
      const words = terms(query);
      let matches = 0;
      areas.forEach(({ area, links }) => {
        let count = 0;
        links.forEach(({ row, keywords }) => {
          row.hidden = query !== "" && (!words.length || !words.every(word => keywords.some(term => term.startsWith(word))));
          if (!row.hidden) count++;
        });
        // A matching expansion stays under its original pathway.
        links.forEach(({ row, parent }) => {
          if (!row.hidden && parent) parent.hidden = false;
        });
        area.hidden = count === 0;
        matches += count;
      });
      clear.hidden = query === "";
      status.textContent = !query ? "" : matches ? matches + (matches === 1 ? " matching resource" : " matching resources") : "No resources match “" + query + "”. Try a subject, exam, or grade.";
    }
    search.hidden = false;
    input.addEventListener("input", filterDirectory);
    search.addEventListener("submit", event => { event.preventDefault(); filterDirectory(); });
    clear.addEventListener("click", () => { input.value = ""; filterDirectory(); input.focus(); });
    filterDirectory();
  }

  redirectPracticeLink();
  window.addEventListener("hashchange", redirectPracticeLink);
})();
