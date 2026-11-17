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
  // Where a printed reading sits: a school night, a calendar date, or (for a
  // calendar reading opened by id) only its grade.
  function readingLocation(packet) {
    if (packet.date) { const C = typeof window === "object" && window.LiminalReadingCalendar; return D.gradeLabel(packet.grade) + " · " + (C ? C.shortDate(packet.date) : packet.date); }
    return D.gradeLabel(packet.grade) + (packet.day.week ? " · Week " + packet.day.week + " · Day " + packet.day.day : "");
  }
  function printFooterText(packet) { return readingLocation(packet) + " · Liminal"; }
  function timeEstimate(time) { return "About " + time.totalMinutes + " min · read " + time.readingMinutes + " + discuss " + time.discussionMinutes; }
  // The full digital record. On screen the time lives in "Before you read";
  // print keeps it in the compact source note (docs/design-system.md).
  function sourceDetails(source, excerpt, doc, fullWork = null) {
    const details = disclosure("Source and rights", "daily-source", doc);
    details.append(el("p", D.sourceLabel(source), undefined, doc), el("p", source.edition, undefined, doc), el("p", excerpt.locator, undefined, doc),
      el("p", "Public domain in the United States. " + source.rights.basis, undefined, doc), el("p", "Rights record checked " + source.rights.verifiedDate + ".", "daily-muted", doc));
    const links = el("div", undefined, "daily-source-links", doc);
    if (fullWork) links.append(link("Read it in the full work", fullWork, doc));
    for (const [label, url] of [["Source record", source.url], ["Read the source text", source.textUrl], ["Rights evidence", source.rights.evidenceUrl]]) if (D.safeHttps(url)) links.append(link(label, url, doc));
    details.append(links); return details;
  }
  // Time, mode, challenge, focus and content note, above the text. Open when
  // an adult reads aloud or shares the reading; a disclosure otherwise.
  function beforeYouRead(day, doc, challenge = null) {
    const items = D.beforeYouRead({ ...day, challenge: challenge || undefined });
    const details = disclosure("Before you read", "daily-before", doc);
    details.open = day.readingMode !== "independent";
    const list = el("dl", undefined, undefined, doc);
    items.forEach(item => { const row = el("div", undefined, undefined, doc); row.append(el("dt", item.label, undefined, doc), el("dd", item.text, undefined, doc)); list.append(row); });
    details.append(list); return details;
  }
  // "Part 2 of 3 · continued from Week 2, Day 5", linked when the reader
  // knows the neighbouring part; plain text otherwise (offline copies).
  function continuationNote(text, target, className, doc) {
    const node = el("p", undefined, "daily-continuation" + (className ? " " + className : ""), doc);
    node.append(doc.createTextNode(text));
    if (target && target.href) { node.append(doc.createTextNode(" ")); node.append(link(target.label, target.href, doc)); }
    return node;
  }
  function attribution(source, time, doc) {
    const note = D.sourceNote(source);
    const footer = el("footer", undefined, "daily-attribution", doc);
    footer.append(el("h3", "Source", undefined, doc), el("p", note.credit + ". " + note.rights, undefined, doc));
    if (note.url) {
      const reference = el("p", undefined, undefined, doc); reference.append(link(note.linkText, note.url, doc)); footer.append(reference);
    }
    footer.append(el("p", timeEstimate(time), "daily-source-budget", doc));
    return footer;
  }
  // The supplied text as text nodes only: paired _underscores_ become <em>
  // (the editions' plain-text italics), and a tab-separated source table
  // becomes a table. The words are never changed or parsed as markup.
  function emphasized(node, text, doc) {
    for (const segment of D.emphasis(text)) node.append(segment.em ? el("em", segment.text, undefined, doc) : doc.createTextNode(segment.text));
    return node;
  }
  function blockNode(block, doc) {
    const rows = block.type === "paragraph" && D.tableRows(block.text);
    if (!rows) return emphasized(el(block.type === "heading" ? "h3" : "p", undefined, block.type === "heading" ? "daily-text-heading" : "daily-" + block.type, doc), block.text, doc);
    const width = Math.max(...rows.map(row => row.cells.length)), table = el("table", undefined, "daily-table", doc), body = el("tbody", undefined, undefined, doc);
    rows.forEach(row => {
      const tr = el("tr", undefined, row.cells.length === 1 ? "daily-table-span" : undefined, doc);
      row.cells.forEach(cell => { const node = el(row.header ? "th" : "td", cell, undefined, doc); if (row.header) node.setAttribute("scope", "col"); tr.append(node); });
      // A one-cell row (a year) spans the table; short rows keep their columns.
      if (row.cells.length === 1) tr.childNodes[0].setAttribute("colspan", String(width));
      else for (let i = row.cells.length; i < width; i++) tr.append(el(row.header ? "th" : "td", "", undefined, doc));
      body.append(tr);
    });
    table.append(body);
    const wrap = el("div", undefined, "daily-table-wrap", doc); wrap.setAttribute("tabindex", "0"); wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "Table from the selection");
    wrap.append(table); return wrap;
  }
  // One reading. Options: `notes` (the full questions, for "Show discussion
  // help"), `challenge` (adult guidance), `run` (D.continuation-style part,
  // of, from and to links), and `fullWork` (its passage in the library).
  function reading(packet, { notes = null, doc = document, challenge = null, run = null, fullWork = null } = {}) {
    const { day, source } = packet;
    const article = el("article", undefined, "daily-reading", doc), header = el("header", undefined, "daily-heading", doc);
    const title = el("h1", day.title, undefined, doc); title.id = "dailyHeading"; title.tabIndex = -1;
    const credit = D.selectionCredit(day, source);
    header.append(title);
    if (credit.workTitle) header.append(el("p", credit.workTitle, "daily-work-title", doc));
    header.append(el("p", "By " + credit.author + (source.translator ? " · Translated by " + source.translator : ""), "daily-author", doc));
    // On paper the mode stays in the title block, except "Read independently".
    if (day.readingMode !== "independent") header.append(el("p", D.modeLabel(day.readingMode), "daily-mode daily-print-only", doc));
    article.append(header, beforeYouRead(day, doc, challenge), el("h2", "Reading", "daily-print-heading", doc), el("p", day.context, "daily-context", doc));
    if (day.contentNote) article.append(el("p", "Content note: " + day.contentNote, "daily-content-note daily-print-only", doc));
    const part = run && run.of > 1 ? "Part " + run.part + " of " + run.of + " · " : "";
    if (day.excerpt.continuesFrom) article.append(run && run.from ? continuationNote(part + "continued from", run.from, null, doc) : el("p", part + "Continued from the previous night.", "daily-continuation", doc));
    const passage = el("section", undefined, "daily-passage", doc); passage.setAttribute("aria-label", "Reading selection");
    day.blocks.forEach(block => passage.append(blockNode(block, doc)));
    article.append(passage);
    if (day.excerpt.continuesTo) article.append(run && run.to ? continuationNote("Continues in", run.to, "daily-continues", doc) : el("p", "This reading continues next night.", "daily-continuation daily-continues", doc));
    const discussion = el("section", undefined, "daily-discussion", doc);
    const discussionHeading = el("h2", undefined, undefined, doc);
    discussionHeading.append(el("span", "Talk about it", "daily-screen-label", doc), el("span", "Questions", "daily-print-label", doc));
    discussion.append(discussionHeading, el("p", day.focus, "daily-focus-line daily-print-only", doc));
    const questions = el("ol", undefined, "daily-questions", doc);
    const items = day.questions.map(question => {
      const item = el("li", undefined, undefined, doc); item.append(el("p", question.prompt, undefined, doc)); questions.append(item);
      return { item, answer: notes && notes.find(note => note.id === question.id) };
    });
    if (items.some(entry => entry.answer)) {
      // One toggle for every question. The notes join the page only when
      // first requested, so a closed reader holds no answer text.
      const toggle = el("button", "Show discussion help", "daily-help-toggle", doc); toggle.type = "button"; toggle.setAttribute("aria-expanded", "false");
      let loaded = false;
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        if (open && !loaded) {
          loaded = true;
          items.forEach(({ item, answer }) => {
            if (!answer) return;
            const help = el("div", undefined, "daily-facilitator", doc);
            for (const note of answer.facilitatorNotes) help.append(el("p", note, undefined, doc));
            const evidence = el("div", undefined, "daily-evidence", doc); evidence.append(el("p", "Look back at:", undefined, doc));
            answer.evidence.forEach(quote => evidence.append(el("blockquote", quote, undefined, doc))); help.append(evidence);
            item.append(help);
          });
        }
        toggle.setAttribute("aria-expanded", String(open)); toggle.textContent = open ? "Hide discussion help" : "Show discussion help";
      });
      discussion.append(toggle);
    }
    discussion.append(questions); article.append(discussion, sourceDetails(source, day.excerpt, doc, fullWork), attribution(source, day.time, doc));
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
  function exportDocument(packet, css = "", pageUrl = "", fontLicense = "") {
    const doc = document.implementation.createHTMLDocument(packet.day.title + " · " + readingLocation(packet) + " — Liminal");
    doc.documentElement.lang = "en";
    const charset = el("meta", undefined, undefined, doc); charset.setAttribute("charset", "utf-8");
    const viewport = el("meta", undefined, undefined, doc); viewport.setAttribute("name", "viewport"); viewport.setAttribute("content", "width=device-width, initial-scale=1");
    doc.head.append(charset, viewport);
    if (fontLicense) {
      const license = el("meta", undefined, undefined, doc); license.setAttribute("name", "font-license"); license.setAttribute("content", fontLicense); doc.head.append(license);
    }
    const style = el("style", css, undefined, doc); doc.head.append(style);
    doc.body.className = "daily-page daily-export";
    const main = el("main", undefined, "page-width daily-main", doc);
    main.append(reading(packet, { doc }));
    const footer = el("footer", undefined, "daily-export-footer", doc);
    if (D.safeHttps(pageUrl)) footer.append(link("Return to this reading", pageUrl, doc));
    footer.append(el("p", "Liminal · Independent educational coursework. Not affiliated with publishers. SAT® and ACT® are trademarks of College Board and ACT, Inc.; no affiliation.", undefined, doc));
    main.append(footer); doc.body.append(main, el("footer", printFooterText(packet), "daily-print-footer", doc)); return doc;
  }
  return { el, link, disclosure, reading, blockNode, emphasized, progression, readingLocation, printFooterText, timeEstimate, exportDocument };
});
