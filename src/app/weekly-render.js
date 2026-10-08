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
  // A figure { id, alt, caption?, notToScale?, svg } through the shared
  // allow-list renderer; the caption is plain text.
  function figure(data) {
    const node = window.LiminalRender.renderFigure({ svg: data.svg, alt: data.alt, notToScale: data.notToScale === true });
    if (!node) return null;
    node.classList.add("weekly-figure");
    if (data.caption) node.append(el("figcaption", data.caption, "weekly-figure-caption"));
    return node;
  }
  function figureBlock(ids, figures) {
    const block = el("div", undefined, "weekly-figures");
    (ids || []).forEach(id => {
      const data = (figures || []).find(f => f.id === id);
      const node = data && figure(data);
      if (node) block.append(node);
    });
    return block.childNodes.length ? block : null;
  }
  function choiceList(item, math, showKey) {
    const list = el("ol", undefined, "weekly-choices");
    item.choices.forEach((choice, index) => {
      const letter = window.LiminalWeekly.CHOICE_LETTERS[index];
      const li = el("li", undefined, showKey && item.key === letter ? "weekly-choice weekly-choice-key" : "weekly-choice");
      li.append(el("span", "(" + letter + ")", "weekly-choice-letter"), rich(choice, math));
      list.append(li);
    });
    return list;
  }
  // Prompt, point value, given figures and choices: everything a student sees.
  function taskBody(target, item, math, figures, showKey) {
    target.append(rich(item.prompt, math));
    if (Number.isInteger(item.points)) target.append(el("p", "(" + item.points + (item.points === 1 ? " point)" : " points)"), "weekly-points"));
    const given = figureBlock(item.figureIds, figures);
    if (given) target.append(given);
    if (Array.isArray(item.choices)) target.append(choiceList(item, math, showKey));
  }
  function solution(item, math, figures) {
    const body = el("div", undefined, "weekly-answer");
    if (item.key) body.append(el("p", "Correct choice: (" + item.key + ")", "weekly-key"));
    body.append(rich(item.answer, math));
    const steps = el("ol", undefined, "weekly-steps");
    item.steps.forEach(step => { const li = el("li"); li.append(rich(step, math)); steps.append(li); });
    body.append(steps);
    const drawn = figureBlock(item.answerFigureIds, figures);
    if (drawn) body.append(drawn);
    if (Array.isArray(item.rubric)) {
      const rubric = el("div", undefined, "weekly-rubric");
      rubric.append(el("p", "Scoring (" + item.points + (item.points === 1 ? " point)" : " points)"), "weekly-rubric-title"));
      const rows = el("ul");
      item.rubric.forEach(row => {
        const li = el("li"); li.append(el("span", row.points + (row.points === 1 ? " point: " : " points: "), "weekly-rubric-points"), rich(row.criterion, math));
        rows.append(li);
      });
      rubric.append(rows); body.append(rubric);
    }
    return body;
  }
  // Sheet-level calculator policy and suggested time, on screen and in print.
  function sheetBadges(sheet) {
    const W = window.LiminalWeekly;
    const badges = el("p", undefined, "weekly-badges");
    if (W.calculatorLabel(sheet.calculator)) badges.append(el("span", W.calculatorLabel(sheet.calculator), "weekly-badge weekly-calculator"));
    if (Number.isInteger(sheet.minutes)) badges.append(el("span", "Suggested time: " + sheet.minutes + " min", "weekly-badge weekly-minutes"));
    return badges.childNodes.length ? badges : null;
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
  function passagesBlock(passages, math, prefix, items) {
    const block = el("div", undefined, "weekly-passages");
    passages.forEach(passage => {
      const article = el("article", undefined, "weekly-passage");
      article.id = passageId(prefix, passage.id); article.tabIndex = -1;
      if (items) {
        const numbers = items.flatMap((item, index) => (item.passageIds || []).includes(passage.id) ? [index + 1] : []);
        const ranges = [];
        for (let index = 0; index < numbers.length; index++) {
          const first = numbers[index]; let last = first;
          while (numbers[index + 1] === last + 1) last = numbers[++index];
          ranges.push(first === last ? String(first) : first + "–" + last);
        }
        article.append(el("p", (numbers.length === 1 ? "Question " : "Questions ") + ranges.join(", "), "weekly-passage-range"));
      }
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
    const explained = figureBlock(week.explanationFigureIds, week.figures);
    if (explained) teaching.append(explained);
    const sequence = disclosure("The week at a glance", "weekly-teaching");
    sequence.append(el("p", "Builds on: " + week.connection.before));
    const days = el("ol"); week.days.forEach(day => days.append(el("li", day))); sequence.append(days, el("p", "Leads to: " + week.connection.after));
    teaching.append(sequence); fragment.append(teaching);
    const examples = section("Work through examples");
    week.examples.forEach((example, index) => {
      const article = el("article", undefined, "weekly-example worksheet-problem");
      article.append(el("h4", "Example " + (index + 1), "worksheet-number"));
      taskBody(article, example, math, week.figures, false);
      article.append(passageLinks(example, week.passages, "week", onRead));
      const answer = disclosure("Show reasoning and answer", "weekly-example-answer");
      // Insert solutions only when requested, so a closed guide stays quiet.
      answer.addEventListener("toggle", () => {
        if (answer.open && answer.children.length === 1) answer.append(solution(example, math, week.figures));
      });
      article.append(answer); examples.append(article);
    });
    fragment.append(examples); return fragment;
  }
  // Printing a study lesson includes every worked model, even if its screen
  // disclosure has never been opened. Populate synchronously: toggle events
  // may run only after the browser has already captured the print document.
  function prepareGuidePrint(guideNode, week, math) {
    const answers = [...guideNode.querySelectorAll(".weekly-example-answer")];
    const open = answers.map(node => !!node.open);
    answers.forEach((node, index) => {
      if (node.children.length === 1) node.append(solution(week.examples[index], math, week.figures));
      node.open = true;
    });
    return () => answers.forEach((node, index) => { node.open = open[index]; });
  }
  function worksheet(packet, answers, options = {}) {
    const math = packet.trackId !== "common-core-reading";
    const body = el("div", undefined, "weekly-worksheet");
    const sheet = packet.worksheet;
    body.append(el("h4", "Worksheet " + sheet.id.toUpperCase() + " · " + sheet.title, "weekly-sheet-heading"));
    const badges = sheetBadges(sheet);
    if (badges) body.append(badges);
    body.append(rich(sheet.directions, math));
    const flow = el("div", undefined, "weekly-sheet-body worksheet-columns");
    if (options.includePassages) flow.append(passagesBlock(packet.passages, math, "sheet", sheet.items));
    const items = el("ol", undefined, "weekly-items");
    sheet.items.forEach((item, index) => {
      const li = el("li", undefined, "worksheet-problem");
      li.append(el("h5", String(index + 1), "worksheet-number"));
      taskBody(li, item, math, packet.figures, answers);
      li.append(passageLinks(item, packet.passages, options.includePassages ? "sheet" : "week", options.onRead));
      if (answers) li.append(solution(item, math, packet.figures));
      else { const space = el("div", undefined, "weekly-workspace"); space.setAttribute("aria-hidden", "true"); li.append(space); }
      items.append(li);
    });
    flow.append(items);
    // A final column spanner balances the last page and keeps its credit on
    // that page instead of following a full-height fragmented column box.
    if (options.footer) flow.append(options.footer);
    body.append(flow);
    return body;
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
    *{box-sizing:border-box}.weekly-export{margin:0;background:#fff;color:#000;--color-line:#777;--color-line-strong:#777;--color-soft:#fff;--color-surface:#fff;--color-ink:#000;--color-accent:#000;--color-muted:#333;color-scheme:light}
    .weekly-export main{max-width:800px;margin:32px auto;padding:0 24px}
    .weekly-export .wordmark{display:flex;align-items:center;gap:10px;font:30px/1 Georgia,serif}
    .weekly-export .brand-symbol{display:block;flex:none;width:28px;height:34px}
    .weekly-export h1{font:28px/1.2 var(--worksheet-serif);margin:20px 0 12px}
    .weekly-export p{margin:8px 0}.weekly-export a{color:#000}
    .weekly-print-control{margin:20px 0;padding:8px 14px;font:inherit}
    @media screen{.weekly-export{font:16px/1.6 var(--worksheet-serif)}.weekly-export .weekly-workspace{min-height:150px}}
    @media print{.weekly-export main{margin:0;padding:0;max-width:none}.weekly-export h1{font:bold 16pt/1.2 var(--worksheet-serif);margin:0 0 6pt}.weekly-export .wordmark{justify-content:center;font:14pt/1 var(--worksheet-serif);margin-bottom:10pt}.weekly-export .brand-symbol{width:12pt;height:15pt}.weekly-print-control{display:none!important}.weekly-export a{text-decoration:none}}
  `;
  // Read the built styles, including all four embedded font faces, afresh on
  // every export. A stylesheet/font failure leaves the selected sheet intact
  // and the action available for retry instead of making an incomplete file.
  function exportAssets(doc) {
    const required = ["tokens", "math", "weekly", "brand", "print", "worksheet-print"];
    const styles = required.map(name => {
      const sheet = [...doc.styleSheets].find(sheet => new RegExp("/" + name + "\\.css(?:\\?|$)").test(sheet.href || ""));
      if (!sheet) throw new Error("Worksheet styles are still loading. Reload the page and try again.");
      try { return [...sheet.cssRules].map(rule => rule.cssText).join("\n"); }
      catch (_) { throw new Error("Worksheet styles could not be read. Reload the page and try again."); }
    }).join("\n");
    const fontLicense = doc.querySelector('meta[name="font-license"]')?.content || "";
    if ((styles.match(/data:font\/woff2;base64,/g) || []).length < 4 || !fontLicense.includes("SIL OPEN FONT LICENSE")) {
      throw new Error("The worksheet typeface could not load. Reload the page and try again before exporting.");
    }
    return { styles, fontLicense };
  }
  // Only the whitelisted packet enters this document. Never clone the reader,
  // its hidden disclosures, application state, or the underlying course JSON.
  function exportDocument(packet, answers, styles = "", sourceUrl = "", fontLicense = "") {
    const doc = document.implementation.createHTMLDocument("Liminal · Week " + packet.week + " · Worksheet " + packet.worksheet.id.toUpperCase() + (answers ? " · Answer key" : " · Student worksheet"));
    doc.documentElement.lang = "en";
    const charset = doc.createElement("meta"); charset.setAttribute("charset", "utf-8");
    const viewport = doc.createElement("meta"); viewport.setAttribute("name", "viewport"); viewport.setAttribute("content", "width=device-width, initial-scale=1");
    const style = doc.createElement("style"); style.textContent = styles + "\n" + EXPORT_CSS;
    const license = doc.createElement("meta"); license.setAttribute("name", "font-license"); license.setAttribute("content", fontLicense);
    doc.head.append(charset, viewport, style, license); doc.body.className = "weekly-page weekly-export";
    const main = el("main", undefined, "worksheet-document"); main.append(brand());
    const heading = el("header", undefined, "worksheet-heading");
    heading.append(el("h1", "Week " + packet.week + " · " + packet.title, "worksheet-title"), el("p", window.LiminalWeekly.trackLabel(packet.trackId) + " · " + window.LiminalWeekly.courseLabel(packet) + " · " + (answers ? "Answer key" : "Student worksheet"), "weekly-meta"));
    const context = window.LiminalWeekly.courseContext(packet.trackId, packet.courseId || packet.grade);
    if (context) heading.append(el("p", context, "weekly-context"));
    if (!answers) heading.append(el("p", "Name: __________________________  Date: ______________"));
    const footer = el("footer", undefined, "weekly-footer worksheet-footer");
    footer.append(el("p", "Original Liminal coursework. " + NOTICE));
    const notice = window.LiminalWeekly.trackNotice(packet.trackId);
    if (notice) footer.append(el("p", notice, "weekly-track-notice"));
    if (/^https?:\/\//i.test(sourceUrl)) {
      const source = el("p", "Coursework source: "); source.append(link(sourceUrl, sourceUrl)); footer.append(source);
    }
    main.append(heading, worksheet(packet, answers, { includePassages: true, footer }));
    doc.body.append(main); return doc;
  }
  return { el, link, rich, section, disclosure, figure, guide, prepareGuidePrint, reading, worksheet, exportAssets, exportDocument, NOTICE };
});
