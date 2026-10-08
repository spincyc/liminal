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

  redirectPracticeLink();
  window.addEventListener("hashchange", redirectPracticeLink);
})();
