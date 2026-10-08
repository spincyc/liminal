/* Enhance the static header as curriculum, reading and weekly hashes change. */
(function () {
  "use strict";
  const header = document.querySelector(".lm-header");
  const navigation = window.LiminalNavigation;
  if (!header || !navigation) return;

  function updateLink(anchor, item) {
    anchor.setAttribute("href", item.href);
    if (anchor.textContent !== item.label) anchor.textContent = item.label;
    if (item.current) anchor.setAttribute("aria-current", item.current);
    else anchor.removeAttribute("aria-current");
  }
  function render() {
    const model = navigation.model(window.location, { weeklyIndex: window.LIMINAL_WEEKLY_INDEX, highSchool: window.LIMINAL_HIGH_SCHOOL, lessonModules: window.LIMINAL_LESSON_MODULES });
    model.primary.forEach(item => updateLink(header.querySelector('[data-lm-primary="' + item.id + '"]'), item));
    const nav = header.querySelector(".lm-subnav");
    nav.hidden = !model.secondary.length;
    nav.setAttribute("aria-label", model.secondaryLabel);
    // Reuse anchors so changing a hash does not replace a focused link.
    const anchors = [...nav.querySelectorAll("a")];
    model.secondary.forEach((item, index) => {
      const anchor = anchors[index] || document.createElement("a");
      updateLink(anchor, item);
      if (!anchors[index]) nav.append(anchor);
    });
    anchors.slice(model.secondary.length).forEach(anchor => anchor.remove());
  }
  render();
  window.addEventListener("hashchange", render);
  window.addEventListener("popstate", render);
})();
