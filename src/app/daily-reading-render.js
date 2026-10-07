/* Text-node rendering, shared by the browser and standalone student download. */
(function (root, factory) {
  const api = factory(typeof module === "object" && module.exports ? require("../lib/daily-reading") : root.LiminalDailyReading);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalDailyReadingRender = api;
})(typeof window === "object" ? window : globalThis, function (D) {
  "use strict";
  function el(tag, text, className, doc = document) { const node = doc.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
  function link(label, href, doc = document) { const node = el("a", label, undefined, doc); node.href = href; return node; }
  function disclosure(label, className, doc = document) { const node = el("details", undefined, className, doc); node.append(el("summary", label, undefined, doc)); return node; }
  function sourceDetails(source, excerpt, doc) {
    const details = disclosure("Source and public-domain record", "daily-source", doc);
    details.append(el("p", D.sourceLabel(source), undefined, doc), el("p", source.edition, undefined, doc), el("p", excerpt.locator, undefined, doc),
      el("p", "Public domain in the United States. " + source.rights.basis, undefined, doc), el("p", "Rights record checked " + source.rights.verifiedDate + ".", "daily-muted", doc));
    const links = el("div", undefined, "daily-source-links", doc);
    for (const [label, url] of [["Source record", source.url], ["Read the source text", source.textUrl], ["Rights evidence", source.rights.evidenceUrl]]) if (D.safeHttps(url)) links.append(link(label, url, doc));
    details.append(links); return details;
  }
  function attribution(source, excerpt, doc) {
    const footer = el("footer", undefined, "daily-attribution", doc);
    footer.append(el("p", D.sourceLabel(source) + ". " + source.edition, undefined, doc), el("p", excerpt.locator, undefined, doc),
      el("p", "Public domain in the United States. " + source.rights.basis, undefined, doc));
    if (D.safeHttps(source.textUrl)) footer.append(el("p", "Source text: " + source.textUrl, undefined, doc));
    return footer;
  }
  function reading(packet, { notes = null, doc = document, standalone = false } = {}) {
    const { day, source } = packet;
    const article = el("article", undefined, "daily-reading", doc), header = el("header", undefined, "daily-heading", doc);
    header.append(el("p", D.gradeLabel(packet.grade) + " · Week " + day.week + " · Day " + day.day, "daily-meta", doc));
    const title = el(standalone ? "h1" : "h2", day.title, undefined, doc); title.id = "dailyHeading"; title.tabIndex = -1;
    const credit = D.selectionCredit(day, source);
    header.append(title);
    if (credit.workTitle) header.append(el("p", credit.workTitle, "daily-work-title", doc));
    header.append(el("p", "By " + credit.author + (source.translator ? " · Translated by " + source.translator : ""), "daily-author", doc));
    const budget = el("p", "About " + day.time.totalMinutes + " min · read " + day.time.readingMinutes + " + discuss " + day.time.discussionMinutes, "daily-budget", doc);
    header.append(budget, el("p", D.modeLabel(day.readingMode), "daily-mode", doc));
    article.append(header, el("p", day.context, "daily-context", doc));
    if (day.contentNote) article.append(el("p", "Content note: " + day.contentNote, "daily-content-note", doc));
    if (day.excerpt.continuesFrom) article.append(el("p", "Continued from the previous night.", "daily-continuation", doc));
    const passage = el("section", undefined, "daily-passage", doc); passage.setAttribute("aria-label", "Reading selection");
    day.blocks.forEach(block => passage.append(el(block.type === "heading" ? "h3" : "p", block.text, "daily-" + block.type, doc)));
    article.append(passage);
    if (day.excerpt.continuesTo) article.append(el("p", "This reading continues next night.", "daily-continuation", doc));
    const discussion = el("section", undefined, "daily-discussion", doc);
    discussion.append(el("h3", "Talk about the reading", undefined, doc), el("p", day.focus, "daily-muted", doc));
    const questions = el("ol", undefined, "daily-questions", doc);
    day.questions.forEach(question => {
      const item = el("li", undefined, undefined, doc); item.append(el("p", question.prompt, undefined, doc));
      const answer = notes && notes.find(note => note.id === question.id);
      if (answer) {
        const details = disclosure("Facilitator notes", "daily-facilitator", doc);
        // The closed disclosure has no hidden answer text until requested.
        let loaded = false;
        details.addEventListener("toggle", () => {
          if (!details.open || loaded) return;
          loaded = true;
          for (const note of answer.facilitatorNotes) details.append(el("p", note, undefined, doc));
          const evidence = el("div", undefined, "daily-evidence", doc); evidence.append(el("p", "Look back at:", undefined, doc));
          answer.evidence.forEach(quote => evidence.append(el("blockquote", quote, undefined, doc))); details.append(evidence);
        });
        item.append(details);
      }
      questions.append(item);
    });
    discussion.append(questions); article.append(discussion, sourceDetails(source, day.excerpt, doc), attribution(source, day.excerpt, doc));
    return article;
  }
  function progression(course, week, doc = document) {
    const details = disclosure("About this reading year", "daily-year", doc);
    details.append(el("p", course.overview, undefined, doc));
    const sequence = el("ol", undefined, "daily-progression", doc);
    course.progression.forEach(stage => {
      const item = el("li", undefined, undefined, doc);
      if (stage.weeks[0] <= week && week <= stage.weeks[1]) item.setAttribute("aria-current", "step");
      item.append(el("p", "Weeks " + stage.weeks[0] + "–" + stage.weeks[1] + ": " + stage.focus, "daily-stage", doc), el("p", stage.rationale, undefined, doc)); sequence.append(item);
    });
    details.append(sequence); return details;
  }
  function exportDocument(packet, css = "", pageUrl = "") {
    const doc = document.implementation.createHTMLDocument("Daily reading · " + packet.day.title + " — Liminal");
    doc.documentElement.lang = "en";
    const charset = el("meta", undefined, undefined, doc); charset.setAttribute("charset", "utf-8");
    const viewport = el("meta", undefined, undefined, doc); viewport.setAttribute("name", "viewport"); viewport.setAttribute("content", "width=device-width, initial-scale=1");
    const style = el("style", css, undefined, doc); doc.head.append(charset, viewport, style);
    doc.body.className = "daily-page daily-export";
    const main = el("main", undefined, "page-width daily-main", doc);
    const brand = el("p", undefined, "wordmark daily-export-brand", doc);
    const symbol = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    symbol.setAttribute("class", "brand-symbol"); symbol.setAttribute("viewBox", "0 0 28 34"); symbol.setAttribute("fill", "none"); symbol.setAttribute("aria-hidden", "true");
    for (const shape of ["M3 32V15a11 11 0 0 1 22 0v17M10 32V15a4 4 0 0 1 8 0v17", "M0 32h28"]) {
      const line = doc.createElementNS("http://www.w3.org/2000/svg", "path"); line.setAttribute("d", shape); line.setAttribute("stroke", "currentColor"); line.setAttribute("stroke-width", "2.5"); symbol.append(line);
    }
    brand.append(symbol, el("span", "Liminal.", undefined, doc));
    main.append(brand, reading(packet, { doc, standalone: true }));
    const footer = el("footer", undefined, "daily-export-footer", doc);
    if (D.safeHttps(pageUrl)) footer.append(link("Return to this reading", pageUrl, doc));
    footer.append(el("p", "Independent educational coursework. Not affiliated with publishers. SAT® and ACT® are trademarks of College Board and ACT, Inc.; no affiliation.", undefined, doc));
    main.append(footer); doc.body.append(main); return doc;
  }
  return { el, link, disclosure, reading, progression, exportDocument };
});
