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
  // On narrow screens the section links are one row that scrolls sideways
  // (styles/brand.css). The current link is brought into view, and a fade
  // marks each edge that has more links beyond it.
  const subnav = header.querySelector(".lm-subnav");
  function edges() {
    if (!subnav || typeof subnav.scrollWidth !== "number") return;
    const left = subnav.scrollLeft > 1, right = subnav.scrollLeft + subnav.clientWidth < subnav.scrollWidth - 1;
    if (left || right) subnav.setAttribute("data-overflow", left && right ? "both" : left ? "start" : "end");
    else subnav.removeAttribute("data-overflow");
  }
  function revealCurrent() {
    if (!subnav || typeof subnav.scrollWidth !== "number" || subnav.scrollWidth <= subnav.clientWidth) { edges(); return; }
    const current = subnav.querySelector("a[aria-current]");
    if (current && current.getBoundingClientRect) {
      const box = subnav.getBoundingClientRect(), item = current.getBoundingClientRect();
      if (item.left < box.left || item.right > box.right) subnav.scrollLeft += item.left - box.left - (box.width - item.width) / 2;
    }
    edges();
  }
  function update() { render(); revealCurrent(); }
  update();
  window.addEventListener("hashchange", update);
  window.addEventListener("popstate", update);
  if (subnav && typeof subnav.addEventListener === "function") subnav.addEventListener("scroll", edges, { passive: true });
  window.addEventListener("resize", revealCurrent);
})();
