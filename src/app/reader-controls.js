/* Shared presentation for sequential readers. Route decisions belong to lib/. */
(function () {
  "use strict";
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function navigation({ label, first, previous, next, last, index }) {
    const nav = element("nav", undefined, "reader-pagination");
    nav.setAttribute("aria-label", label);
    const list = element("ul");
    [["First", first], ["Previous", previous], ["Next", next], ["Last", last]].forEach(([text, destination]) => {
      const item = element("li"), control = element(destination ? destination.run ? "button" : "a" : "span", text);
      if (destination) {
        if (destination.run) { control.type = "button"; control.addEventListener("click", destination.run); }
        else control.href = destination.href;
        if (destination.label) control.setAttribute("aria-label", destination.label);
      } else control.setAttribute("aria-disabled", "true");
      item.append(control); list.append(item);
    });
    nav.append(list);
    if (index) { const link = element("a", index.label, "reader-index"); link.href = index.href; nav.append(link); }
    return nav;
  }
  function actions(items) {
    const group = element("div", undefined, "reader-actions");
    items.forEach(({ label, run }) => {
      const button = element("button", label); button.type = "button";
      button.addEventListener("click", run); group.append(button);
    });
    return group;
  }
  window.LiminalReaderControls = { navigation, actions };
})();
