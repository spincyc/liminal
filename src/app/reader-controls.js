/* Shared presentation for sequential readers. Route decisions belong to lib/. */
(function () {
  "use strict";
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  // `steps` limits the controls shown (default First, Previous, Next, Last).
  // A destination's optional `text` replaces its visible word, e.g.
  // "Next: Week 3, Day 2"; `compact` shows Previous/Next as arrows whose word
  // hides at phone widths (the aria-label still names the destination).
  const STEPS = ["first", "previous", "next", "last"], WORDS = { first: "First", previous: "Previous", next: "Next", last: "Last" };
  function fill(control, word, step, text, compact) {
    const key = [step, text || word, compact ? 1 : 0].join("|");
    if (control.dataset.readerText === key) return;
    control.dataset.readerText = key;
    if (!compact || !["previous", "next"].includes(step)) { control.textContent = text || word; return; }
    const label = element("span", text || word, "reader-step-word"), arrow = element("span", step === "previous" ? "‹" : "›", "reader-step-arrow");
    arrow.setAttribute("aria-hidden", "true");
    control.replaceChildren(...(step === "previous" ? [arrow, label] : [label, arrow]));
  }
  function navigation({ label, first, previous, next, last, index, steps = STEPS, compact = false }, existing) {
    const nav = existing || element("nav", undefined, "reader-pagination");
    nav.setAttribute("aria-label", label);
    nav.classList.toggle("reader-pagination-compact", !!compact);
    const list = nav.querySelector("ul") || element("ul");
    if (!list.parentElement) nav.append(list);
    const destinations = { first, previous, next, last };
    steps.forEach((step, i) => {
      const destination = destinations[step], word = WORDS[step];
      const item = list.children[i] || element("li"), tag = destination ? destination.run ? "button" : "a" : "span";
      const previousControl = item.firstElementChild;
      const control = previousControl && previousControl.tagName.toLowerCase() === tag ? previousControl : element(tag);
      fill(control, word, step, destination && destination.text, compact);
      control.dataset.readerStep = step;
      if (destination) {
        control.removeAttribute("aria-disabled");
        if (destination.run) { control.type = "button"; control.onclick = destination.run; }
        else control.href = destination.href;
        if (destination.label) control.setAttribute("aria-label", destination.label);
        else control.removeAttribute("aria-label");
      } else control.setAttribute("aria-disabled", "true");
      if (control !== previousControl) item.replaceChildren(control);
      if (!item.parentElement) list.append(item);
    });
    while (list.children.length > steps.length) list.children[list.children.length - 1].remove();
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
  // A "More" menu for secondary document actions and far jumps: a native
  // disclosure, closed by Escape, an outside click, or choosing an item.
  function menu(label, className = "reader-more") {
    const details = element("details", undefined, className), summary = element("summary"), panel = element("div", undefined, "reader-more-menu");
    summary.append(element("span", label, "reader-more-word"));
    details.append(summary, panel);
    document.addEventListener("click", event => { if (details.open && !details.contains(event.target)) details.open = false; });
    details.addEventListener("keydown", event => { if (event.key === "Escape" && details.open) { details.open = false; summary.focus(); } });
    panel.addEventListener("click", event => { if (event.target.closest("a, button")) details.open = false; });
    return { element: details, panel };
  }
  window.LiminalReaderControls = { navigation, focusNavigation, actions, menu };
})();
