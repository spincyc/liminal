/* Shared presentation for sequential readers. Route decisions belong to lib/. */
(function () {
  "use strict";
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function navigation({ label, first, previous, next, last, index }, existing) {
    const nav = existing || element("nav", undefined, "reader-pagination");
    nav.setAttribute("aria-label", label);
    const list = nav.querySelector("ul") || element("ul");
    if (!list.parentElement) nav.append(list);
    [["First", first], ["Previous", previous], ["Next", next], ["Last", last]].forEach(([text, destination], i) => {
      const item = list.children[i] || element("li"), tag = destination ? destination.run ? "button" : "a" : "span";
      const previousControl = item.firstElementChild;
      const control = previousControl && previousControl.tagName.toLowerCase() === tag ? previousControl : element(tag);
      if (control.textContent !== text) control.textContent = text;
      control.dataset.readerStep = text.toLowerCase();
      if (destination) {
        if (destination.run) { control.type = "button"; control.onclick = destination.run; }
        else control.href = destination.href;
        if (destination.label) control.setAttribute("aria-label", destination.label);
        else control.removeAttribute("aria-label");
      } else control.setAttribute("aria-disabled", "true");
      if (control !== previousControl) item.replaceChildren(control);
      if (!item.parentElement) list.append(item);
    });
    let link = nav.querySelector(".reader-index");
    if (index) {
      if (!link) { link = element("a", undefined, "reader-index"); nav.append(link); }
      link.textContent = index.label; link.href = index.href;
    } else if (link) link.remove();
    return nav;
  }
  // Keep pagination usable for repeated Enter presses, including an endpoint
  // where the invoked control becomes disabled. Never let focus scroll content.
  function focusNavigation(nav, step) {
    for (const key of [step, "next", "previous", "first", "last"]) {
      const control = nav.querySelector('[data-reader-step="' + key + '"]');
      if (control && control.getAttribute("aria-disabled") !== "true") {
        control.focus({ preventScroll: true }); return;
      }
    }
  }
  function actions(items) {
    const group = element("div", undefined, "reader-actions");
    items.forEach(({ label, run }) => {
      const button = element("button", label); button.type = "button";
      button.addEventListener("click", run); group.append(button);
    });
    return group;
  }
  window.LiminalReaderControls = { navigation, focusNavigation, actions };
})();
