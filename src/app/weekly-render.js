(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalWeeklyRender = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const NOTICE = "Independent educational coursework. Not affiliated with standards bodies or publishers. SAT® and ACT® are trademarks of College Board and ACT, Inc.; no affiliation.";
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function link(text, href, className) {
    const node = el("a", text, className); node.href = href; return node;
  }
  function rich(text, math) {
    const node = window.LiminalRender.renderText(text, { math });
    node.classList.add("weekly-rich"); return node;
  }
  function section(title, className) {
    const node = el("section", undefined, className || "weekly-section");
    node.append(el("h3", title)); return node;
  }
  function disclosure(title, className) {
    const node = el("details", undefined, className);
    node.append(el("summary", title)); return node;
  }
  function solution(item, math) {
    const body = el("div", undefined, "weekly-answer");
    body.append(rich(item.answer, math));
    const steps = el("ol", undefined, "weekly-steps");
    item.steps.forEach(step => { const li = el("li"); li.append(rich(step, math)); steps.append(li); });
    body.append(steps); return body;
  }
  function passageId(prefix, id) { return prefix + "-passage-" + encodeURIComponent(id); }
  function passageLinks(item, passages, prefix, onRead) {
    const links = el("div", undefined, "weekly-passage-links");
    (item.passageIds || []).forEach(id => {
      const passage = passages.find(p => p.id === id);
      if (passage) links.append(link("Read: " + passage.title, "#" + passageId(prefix, id)));
    });
    // Passage anchors are local reading controls, not coursework routes.
    links.addEventListener("click", event => {
      const anchor = event.target.closest("a");
      if (!anchor) return;
      if (onRead) onRead();
      const target = document.getElementById(anchor.getAttribute("href").slice(1));
      if (target) { event.preventDefault(); target.focus(); target.scrollIntoView({ block: "start" }); }
    });
    return links;
  }
  function passagesBlock(passages, math, prefix) {
    const block = el("div", undefined, "weekly-passages");
    passages.forEach(passage => {
      const article = el("article", undefined, "weekly-passage");
      article.id = passageId(prefix, passage.id); article.tabIndex = -1;
      article.append(el("h4", passage.title), el("p", passage.readingMode === "read-aloud" ? "Read aloud together" : passage.readingMode === "shared" ? "Shared reading" : "Independent reading", "weekly-meta"), rich(passage.text, math));
      const credit = el("p", passage.attribution, "weekly-meta");
      if (/^https:\/\//i.test(passage.sourceUrl || "")) credit.append(document.createTextNode(" · "), link("Source", passage.sourceUrl));
      article.append(credit); block.append(article);
    });
    return block;
  }
  function reading(week, math) {
    const sectionNode = section("Read"); sectionNode.append(passagesBlock(week.passages, math, "week")); return sectionNode;
  }
  function guide(week, math, onRead) {
    const fragment = document.createDocumentFragment();
    const teaching = section("Understand the idea");
    week.explanation.forEach(paragraph => teaching.append(rich(paragraph, math)));
    const sequence = disclosure("The week at a glance", "weekly-teaching");
    sequence.append(el("p", "Builds on: " + week.connection.before));
    const days = el("ol"); week.days.forEach(day => days.append(el("li", day))); sequence.append(days, el("p", "Leads to: " + week.connection.after));
    teaching.append(sequence); fragment.append(teaching);
    const examples = section("Work through examples");
    week.examples.forEach((example, index) => {
      const article = el("article", undefined, "weekly-example");
      article.append(el("h4", "Example " + (index + 1)), rich(example.prompt, math));
      article.append(passageLinks(example, week.passages, "week", onRead));
      const answer = disclosure("Show reasoning and answer", "weekly-example-answer");
      // Insert solutions only when requested, so a closed guide stays quiet.
      answer.addEventListener("toggle", () => {
        if (answer.open && answer.children.length === 1) answer.append(solution(example, math));
      });
      article.append(answer); examples.append(article);
    });
    fragment.append(examples); return fragment;
  }
  function worksheet(packet, answers, options = {}) {
    const math = packet.trackId !== "common-core-reading";
    const body = el("div", undefined, "weekly-worksheet");
    const sheet = packet.worksheet;
    body.append(el("h4", "Worksheet " + sheet.id.toUpperCase() + " · " + sheet.title), rich(sheet.directions, math));
    if (options.includePassages) body.append(passagesBlock(packet.passages, math, "sheet"));
    const items = el("ol", undefined, "weekly-items");
    sheet.items.forEach(item => {
      const li = el("li"); li.append(rich(item.prompt, math), passageLinks(item, packet.passages, options.includePassages ? "sheet" : "week", options.onRead));
      if (answers) li.append(solution(item, math));
      else { const space = el("div", undefined, "weekly-workspace"); space.setAttribute("aria-hidden", "true"); li.append(space); }
      items.append(li);
    });
    body.append(items); return body;
  }
  function brand() {
    const mark = el("div", undefined, "wordmark");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "brand-symbol"); svg.setAttribute("viewBox", "0 0 28 34"); svg.setAttribute("fill", "none"); svg.setAttribute("aria-hidden", "true");
    for (const pathData of ["M3 32V15a11 11 0 0 1 22 0v17M10 32V15a4 4 0 0 1 8 0v17", "M0 32h28"]) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData); path.setAttribute("stroke", "currentColor"); path.setAttribute("stroke-width", "2.5"); svg.append(path);
    }
    const name = el("span", "Liminal"); name.append(el("span", ".", "wordmark-dot")); mark.append(svg, name); return mark;
  }
  const EXPORT_CSS = `
    *{box-sizing:border-box}body{margin:0;background:#fff;color:#000;font:16px/1.6 system-ui,sans-serif}
    main{max-width:800px;margin:32px auto;padding:0 24px}h1{font:28px/1.2 Georgia,serif;margin:20px 0 12px}
    h4{font-size:18px;margin:22px 0 12px}p{margin:8px 0}.wordmark{font-size:30px;line-height:1}
    a{color:#000}.weekly-meta,footer{color:#333;font-size:13px}.weekly-workspace{min-height:150px}
    .weekly-items>li{break-inside:avoid}.weekly-passage{background:#fff;color:#000}.weekly-answer{background:#fff}
    .weekly-page .weekly-workspace{min-height:38mm}.weekly-print-control{margin:20px 0;padding:8px 14px;font:inherit}
    .weekly-footer{border-top:1px solid #777;margin-top:24px;padding-top:12px}.weekly-export{--color-line:#777;--color-line-strong:#777;--color-soft:#fff;--color-surface:#fff;--color-ink:#000;--color-accent:#000;--color-muted:#333;color-scheme:light}
    @media print{main{margin:0;padding:0}.weekly-print-control{display:none}.weekly-footer{font-size:9pt}a{text-decoration:none}}
  `;
  // Only the whitelisted packet enters this document. Never clone the reader,
  // its hidden disclosures, application state, or the underlying course JSON.
  function exportDocument(packet, answers, styles = "", sourceUrl = "") {
    const doc = document.implementation.createHTMLDocument("Liminal · Week " + packet.week + " · Worksheet " + packet.worksheet.id.toUpperCase() + (answers ? " · Answer key" : " · Student worksheet"));
    doc.documentElement.lang = "en";
    const charset = doc.createElement("meta"); charset.setAttribute("charset", "utf-8");
    const viewport = doc.createElement("meta"); viewport.setAttribute("name", "viewport"); viewport.setAttribute("content", "width=device-width, initial-scale=1");
    const style = doc.createElement("style"); style.textContent = styles + "\n" + EXPORT_CSS;
    doc.head.append(charset, viewport, style); doc.body.className = "weekly-page weekly-export";
    const main = el("main"); main.append(brand());
    const heading = el("header");
    heading.append(el("h1", "Week " + packet.week + " · " + packet.title), el("p", window.LiminalWeekly.trackLabel(packet.trackId) + " · " + window.LiminalWeekly.gradeLabel(packet.grade) + " · " + (answers ? "Answer key" : "Student worksheet"), "weekly-meta"));
    const context = window.LiminalWeekly.courseContext(packet.trackId, packet.grade);
    if (context) heading.append(el("p", context, "weekly-context"));
    if (!answers) heading.append(el("p", "Name: __________________________  Date: ______________"));
    main.append(heading, worksheet(packet, answers, { includePassages: true }));
    const footer = el("footer", undefined, "weekly-footer");
    footer.append(el("p", "Original Liminal coursework. " + NOTICE));
    if (/^https?:\/\//i.test(sourceUrl)) {
      const source = el("p", "Coursework source: "); source.append(link(sourceUrl, sourceUrl)); footer.append(source);
    }
    main.append(footer); doc.body.append(main); return doc;
  }
  return { el, link, rich, section, disclosure, guide, reading, worksheet, exportDocument, NOTICE };
});
