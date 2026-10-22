/* DOM rendering for AP® assessments, exam-prep guides and formula
   references. Takes projections from lib/ap-assessment.js (a student booklet
   or an answer key, never both) and guide documents, and builds elements with
   text nodes only; math text goes through LiminalRender.renderText and
   figures through LiminalRender.renderFigure, which rebuilds SVG from its
   allow-list. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalApRender = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function A() { return globalThis.LiminalAp; }
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function link(text, href, className) { const node = el("a", text, className); node.href = href; return node; }
  function rich(text, className) {
    const node = globalThis.LiminalRender.renderText(String(text), { math: true });
    node.classList.add("ap-rich"); if (className) node.classList.add(className);
    return node;
  }
  function plural(count, word) { return count + " " + word + (count === 1 ? "" : "s"); }
  function figureNodes(packet, ids) {
    return (ids || []).map(id => (packet.figures || []).find(f => f.id === id)).filter(Boolean).map(figure => {
      const node = globalThis.LiminalRender.renderFigure(figure);
      if (node && figure.caption) node.append(el("figcaption", figure.caption, "ap-figure-caption"));
      return node;
    }).filter(Boolean);
  }
  function calculatorBadge(policy) {
    const node = el("p", A().calculatorLabel(policy), "ap-calc ap-calc-" + policy);
    return node;
  }
  // "Unit test · 12 multiple choice · 2 free response · 56 minutes"
  function summaryLine(packet) {
    const count = kind => packet.sections.filter(s => s.kind === kind).reduce((n, s) => n + s.parts.reduce((m, p) => m + p.items.length, 0), 0);
    const minutes = packet.sections.reduce((n, s) => n + s.parts.reduce((m, p) => m + p.minutes, 0), 0);
    return [A().kindLabel(packet.kind), count("mc") ? count("mc") + " multiple choice" : "", count("fr") ? count("fr") + " free response" : "", minutes + " minutes"].filter(Boolean).join(" · ");
  }
  function partsTable(packet) {
    const table = el("table", undefined, "ap-table ap-parts");
    table.append(el("caption", "Sections and timing", "ap-sr"));
    const head = el("tr"); ["Section", "Items", "Minutes", "Calculator"].forEach(h => { const th = el("th", h); th.scope = "col"; head.append(th); });
    const thead = el("thead"); thead.append(head); table.append(thead);
    const body = el("tbody");
    packet.sections.forEach(section => section.parts.forEach(part => {
      const row = el("tr");
      const th = el("th", partName(section, part)); th.scope = "row";
      row.append(th, el("td", String(part.items.length)), el("td", String(part.minutes)), el("td", A().calculatorLabel(part.calculator)));
      body.append(row);
    }));
    table.append(body); return table;
  }
  function partName(section, part) { return "Section " + section.id + (section.parts.length > 1 ? " Part " + part.id : "") + ": " + section.title; }
  function docHeader(packet, label, context) {
    const header = el("header", undefined, "ap-doc-head worksheet-heading");
    header.append(el("p", label, "ap-copy-label"));
    const title = el("h2", packet.title, "worksheet-title"); title.id = "apHeading"; title.tabIndex = -1;
    header.append(title, el("p", (context ? context + " · " : "") + summaryLine(packet), "weekly-meta"));
    return header;
  }
  function choiceList(item) {
    const list = el("ol", undefined, "ap-choices");
    list.setAttribute("type", "A");
    item.choices.forEach((choice, i) => {
      const li = el("li");
      li.append(el("span", A().LETTERS[i], "ap-letter"), rich(choice, "ap-choice-text"));
      list.append(li);
    });
    return list;
  }
  function nameLine() { const node = el("p", undefined, "ap-name"); node.append(el("span", "Name: ____________________"), el("span", "Date: ____________")); return node; }
  function workspace() { const node = el("div", undefined, "ap-workspace"); node.setAttribute("aria-hidden", "true"); return node; }

  // Student booklet: prompts, choices, points and given figures, then the
  // separate answer sheet; physics booklets append the formula reference.
  function booklet(packet, options = {}) {
    const article = el("article", undefined, "ap-doc ap-student worksheet-document");
    article.dataset.copy = "student";
    const header = docHeader(packet, "Student copy", options.context);
    header.append(nameLine(), rich(packet.directions), partsTable(packet));
    article.append(header);
    packet.sections.forEach(section => {
      const node = el("section", undefined, "ap-section ap-section-" + section.kind);
      node.append(el("h3", "Section " + section.id + ": " + section.title));
      section.parts.forEach(part => {
        const block = el("div", undefined, "ap-part");
        const heading = el("h4", (section.parts.length > 1 ? "Part " + part.id + " · " : "") + plural(part.items.length, "question") + " · " + part.minutes + " minutes");
        const head = el("div", undefined, "ap-part-head");
        head.append(heading, calculatorBadge(part.calculator), rich(part.directions, "ap-directions"));
        block.append(head);
        const items = el("ol", undefined, "ap-items worksheet-columns");
        items.setAttribute("start", String(part.items[0] ? part.items[0].number : 1));
        part.items.forEach(item => {
          const li = el("li", undefined, "ap-item worksheet-problem ap-item-" + item.kind);
          li.append(el("h5", String(item.number), "worksheet-number"));
          if (item.kind === "mc") li.append(rich(item.prompt), ...figureNodes(packet, item.figureIds), choiceList(item));
          else {
            li.append(el("p", plural(item.points, "point"), "ap-item-points"), rich(item.prompt), ...figureNodes(packet, item.figureIds));
            const parts = el("ol", undefined, "ap-fr-parts");
            item.parts.forEach(part => {
              const p = el("li");
              p.append(el("span", "(" + part.label + ")", "ap-part-label"), rich(part.prompt), ...figureNodes(packet, part.figureIds), el("p", plural(part.points, "point"), "ap-points"), workspace());
              parts.append(p);
            });
            li.append(parts);
          }
          items.append(li);
        });
        block.append(items); node.append(block);
      });
      article.append(node);
    });
    // A free-response-only set is answered in its workspaces: no bubble sheet,
    // and its first question need not start a new printed page.
    if (packet.answerSheet.mc.length) article.append(answerSheet(packet));
    else article.classList.add("ap-fr-only");
    if (options.reference) article.append(referenceSheet(options.reference, { appended: true }));
    return article;
  }
  function answerSheet(packet) {
    const node = el("section", undefined, "ap-answer-sheet");
    node.append(el("h3", "Answer sheet"), el("p", packet.title, "weekly-meta"), nameLine());
    if (packet.answerSheet.mc.length) {
      node.append(el("p", "Multiple choice: fill in one letter for each question.", "ap-sheet-note"));
      const grid = el("ol", undefined, "ap-bubbles");
      packet.answerSheet.mc.forEach(row => {
        const li = el("li");
        li.setAttribute("value", String(row.number));
        li.append(el("span", row.number + ".", "ap-bubble-number"));
        row.letters.forEach(letter => li.append(el("span", letter, "ap-bubble")));
        grid.append(li);
      });
      node.append(grid);
    }
    if (packet.answerSheet.fr.length) node.append(el("p", "Free response: write each answer in the workspace under its part in the booklet, showing your work.", "ap-sheet-note"));
    return node;
  }

  // Answer key: keys, rationales, scoring guidelines and the raw-point tally.
  function key(packet, options = {}) {
    const article = el("article", undefined, "ap-doc ap-key worksheet-document");
    article.dataset.copy = "key";
    article.append(docHeader(packet, "Answer key · keep separate from student copies", options.context));
    const topic = id => { const label = options.topicLabel ? options.topicLabel(id) : ""; return label ? id + " " + label : id; };
    const mc = packet.sections.filter(s => s.kind === "mc").flatMap(s => s.parts.flatMap(p => p.items));
    if (mc.length) {
      const section = el("section", undefined, "ap-section");
      section.append(el("h3", "Multiple-choice key"));
      const table = el("table", undefined, "ap-table ap-key-table");
      const head = el("tr"); ["Question", "Key", "Unit"].forEach(h => { const th = el("th", h); th.scope = "col"; head.append(th); });
      const thead = el("thead"); thead.append(head); table.append(thead);
      const body = el("tbody");
      mc.forEach(item => {
        const row = el("tr"); const th = el("th", String(item.number)); th.scope = "row";
        row.append(th, el("td", item.key, "ap-key-letter"), el("td", String(A().topicUnit(item.topics[0]) || "")));
        body.append(row);
      });
      table.append(body); section.append(table);
      const rationales = el("ol", undefined, "ap-items ap-rationales worksheet-columns");
      mc.forEach(item => {
        const li = el("li", undefined, "ap-item worksheet-problem");
        li.setAttribute("value", String(item.number));
        li.append(el("h5", String(item.number), "worksheet-number"), el("p", "Answer " + item.key, "ap-key-answer"), rich(item.rationale));
        if (item.distractorNotes) {
          const notes = el("ul", undefined, "ap-distractors");
          Object.entries(item.distractorNotes).forEach(([letter, note]) => { const n = el("li"); n.append(el("span", letter + ": ", "ap-letter-inline"), rich(note, "ap-inline")); notes.append(n); });
          li.append(notes);
        }
        li.append(...figureNodes(packet, item.answerFigureIds), el("p", "Topics: " + item.topics.map(topic).join("; "), "ap-topics"));
        rationales.append(li);
      });
      section.append(el("h4", "Rationales"), rationales);
      article.append(section);
    }
    const fr = packet.sections.filter(s => s.kind === "fr").flatMap(s => s.parts.flatMap(p => p.items));
    if (fr.length) {
      const section = el("section", undefined, "ap-section");
      section.append(el("h3", "Free-response scoring guidelines"));
      const flow = el("div", undefined, "worksheet-columns");
      fr.forEach(item => {
        const block = el("article", undefined, "ap-guideline");
        const head = el("div", undefined, "ap-guideline-head");
        head.append(el("h4", "Question " + item.number + " · " + plural(item.points, "point") + (item.type ? " · " + A().frTypeLabel(item.type) : ""), "worksheet-number"), rich(item.prompt), ...figureNodes(packet, item.figureIds), ...figureNodes(packet, item.answerFigureIds));
        block.append(head);
        item.parts.forEach(part => {
          const p = el("section", undefined, "ap-guideline-part");
          p.append(el("h5", "(" + part.label + ") · " + plural(part.points, "point")), rich(part.prompt, "ap-muted"));
          const answer = el("div", undefined, "ap-answer"); answer.append(rich(part.answer));
          const steps = el("ol", undefined, "weekly-steps"); part.steps.forEach(step => { const li = el("li"); li.append(rich(step)); steps.append(li); });
          answer.append(steps);
          p.append(answer);
          const figures = [...figureNodes(packet, part.figureIds), ...figureNodes(packet, part.answerFigureIds)];
          if (figures.length) {
            const group = el("div", undefined, "ap-key-figures");
            group.append(...figures); p.append(group);
          }
          const rubric = el("table", undefined, "ap-table ap-rubric");
          const head = el("tr"); ["Points", "Award for"].forEach(h => { const th = el("th", h); th.scope = "col"; head.append(th); });
          const thead = el("thead"); thead.append(head); rubric.append(thead);
          const body = el("tbody");
          part.rubric.forEach(row => { const tr = el("tr"); const td = el("td"); td.append(rich(row.criterion)); tr.append(el("td", String(row.points)), td); body.append(tr); });
          rubric.append(body); p.append(rubric);
          block.append(p);
        });
        block.append(el("p", "Topics: " + item.topics.map(topic).join("; "), "ap-topics"));
        flow.append(block);
      });
      section.append(flow); article.append(section);
    }
    article.append(tallySheet(packet, options));
    return article;
  }
  // Raw points by section and unit, to fill in by hand. Never a scaled score.
  function tallySheet(packet, options = {}) {
    const node = el("section", undefined, "ap-section ap-tally");
    node.append(el("h3", "Raw-point tally"), el("p", "Record raw points earned. This is practice: the totals are not AP scores, and no conversion to the exam's score scale is given. The exam weights its two sections equally, so read each section on its own.", "ap-sheet-note"));
    const table = (caption, rows) => {
      const t = el("table", undefined, "ap-table ap-tally-table");
      t.append(el("caption", caption));
      const head = el("tr"); ["", "Earned", "Possible"].forEach((h, i) => { const th = el("th", h); th.scope = "col"; if (!i) th.append(el("span", "Group", "ap-sr")); head.append(th); });
      const thead = el("thead"); thead.append(head); t.append(thead);
      const body = el("tbody");
      rows.forEach(([label, points]) => { const tr = el("tr"); const th = el("th", label); th.scope = "row"; tr.append(th, el("td", "", "ap-blank"), el("td", String(points))); body.append(tr); });
      t.append(body); return t;
    };
    node.append(table("By section", packet.tally.sections.map(s => ["Section " + s.id + ": " + s.title, s.points])));
    if (packet.tally.units) node.append(table("By unit", packet.tally.units.map(u => [u.unit ? "Unit " + u.unit + (options.unitTitle ? ": " + options.unitTitle(u.unit) : "") : "Other", u.points])));
    return node;
  }

  // Liminal's own formula reference: groups of relations with meanings.
  function referenceSheet(ref, options = {}) {
    const node = el("section", undefined, "ap-reference-sheet worksheet-document" + (options.appended ? " ap-reference-appended" : ""));
    const head = el("header", undefined, "ap-reference-head worksheet-heading");
    const title = el(options.appended ? "h3" : "h2", ref.title, "worksheet-title");
    if (!options.appended) { title.id = "apHeading"; title.tabIndex = -1; }
    head.append(title, rich(ref.intro)); node.append(head);
    const flow = el("div", undefined, "ap-reference-body worksheet-columns");
    ref.groups.forEach(group => {
      const table = el("table", undefined, "ap-table ap-reference-table");
      table.append(el("caption", group.title));
      const head = el("tr"); ["Relation", "Meaning", "Units"].forEach(h => { const th = el("th", h); th.scope = "col"; head.append(th); });
      const thead = el("thead"); thead.append(head); table.append(thead);
      const body = el("tbody");
      group.rows.forEach(row => {
        const tr = el("tr"); const th = el("th"); th.scope = "row"; th.append(rich(row.relation, "ap-inline"));
        const meaning = el("td"); meaning.append(rich(row.meaning, "ap-inline"));
        const units = el("td"); units.append(rich(row.units, "ap-inline"));
        tr.append(th, meaning, units); body.append(tr);
      });
      table.append(body); flow.append(table);
    });
    if (Array.isArray(ref.notes)) { const list = el("ul", undefined, "ap-reference-notes"); ref.notes.forEach(n => list.append(el("li", n))); flow.append(list); }
    if (options.note) flow.append(el("p", options.note, "ap-note ap-reference-note"));
    node.append(flow); return node;
  }

  // Exam-prep guide: sections of typed blocks (LiminalAp.GUIDE_BLOCKS). A
  // check shows its problem; its hint and its answer open in place from
  // buttons, so it is tried before it is checked. Print drops the buttons and
  // panels and prints every check's answer at the end, numbered to match,
  // built from the document rather than from what the reader opened.
  // options.href(ref) resolves a links block's refs ("" leaves plain text).
  function guide(doc, options = {}) {
    const article = el("article", undefined, "ap-doc ap-guide worksheet-document");
    article.dataset.copy = "guide";
    const checks = A().guideChecks(doc);
    const header = el("header", undefined, "ap-doc-head worksheet-heading");
    header.append(el("p", A().guideKindLabel(doc.kind), "ap-copy-label"));
    const title = el("h2", doc.title, "worksheet-title"); title.id = "apHeading"; title.tabIndex = -1;
    const meta = [options.context, "about " + doc.minutes + " minutes", checks.length ? plural(checks.length, "check") : ""].filter(Boolean).join(" · ");
    header.append(title, el("p", meta, "weekly-meta"), rich(doc.summary, "ap-guide-summary"));
    article.append(header);
    const numbers = new Map(checks.map(entry => [entry.block, entry.number]));
    const body = el("div", undefined, "ap-guide-body worksheet-columns");
    doc.sections.forEach(section => {
      const node = el("section", undefined, "ap-guide-section");
      node.append(el("h3", section.title));
      section.blocks.forEach(block => { const shown = guideBlock(doc, block, numbers, options); if (shown) node.append(shown); });
      body.append(node);
    });
    article.append(body);
    if (checks.length) article.append(checkKey(doc, checks));
    return article;
  }
  function label(text) { return el("p", text, "ap-block-label"); }
  function steps(list) { const node = el("ol", undefined, "weekly-steps"); list.forEach(step => { const li = el("li"); li.append(rich(step)); node.append(li); }); return node; }
  function answerLine(text) { const node = el("div", undefined, "ap-guide-answer"); node.append(el("p", "Answer", "ap-key-answer"), rich(text)); return node; }
  function toggle(panel, show, hide, labelId) {
    const button = el("button", show, "ap-check-toggle");
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", panel.id);
    button.setAttribute("aria-describedby", labelId);
    panel.hidden = true;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? hide : show;
      panel.hidden = !open;
    });
    return button;
  }
  function guideBlock(doc, block, numbers, options) {
    const type = block.type;
    if (type === "text") return rich(block.text, "ap-guide-text");
    if (type === "list") {
      const node = el(block.ordered ? "ol" : "ul", undefined, "ap-guide-list");
      block.items.forEach(item => { const li = el("li"); li.append(rich(item)); node.append(li); });
      return node;
    }
    if (type === "table") {
      const table = el("table", undefined, "ap-table ap-guide-table");
      if (block.caption) table.append(el("caption", block.caption));
      const head = el("tr"); block.head.forEach(h => { const th = el("th"); th.scope = "col"; th.append(rich(h, "ap-inline")); head.append(th); });
      const thead = el("thead"); thead.append(head); table.append(thead);
      const tbody = el("tbody");
      block.rows.forEach(row => { const tr = el("tr"); row.forEach(cell => { const td = el("td"); td.append(rich(cell, "ap-inline")); tr.append(td); }); tbody.append(tr); });
      table.append(tbody);
      const wrap = el("div", undefined, "ap-guide-table-wrap"); wrap.append(table);
      // Focusable and named, so a keyboard can scroll a table wider than the screen.
      wrap.tabIndex = 0; wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", block.caption || "Table");
      return wrap;
    }
    if (type === "rule") {
      const node = el("div", undefined, "ap-rule");
      const name = el("p", undefined, "ap-rule-title"); name.append(rich(block.title, "ap-inline"));
      node.append(label("Know this"), name, rich(block.text));
      if (block.conditions) {
        const list = el("ul", undefined, "ap-guide-list ap-conditions");
        block.conditions.forEach(item => { const li = el("li"); li.append(rich(item)); list.append(li); });
        node.append(el("p", "Conditions", "ap-conditions-label"), list);
      }
      return node;
    }
    if (type === "trap") {
      const node = el("div", undefined, "ap-trap");
      const fix = el("div", undefined, "ap-trap-fix"); fix.append(label("Fix"), rich(block.fix));
      node.append(label("Trap"), rich(block.text), fix);
      return node;
    }
    if (type === "model") {
      const node = el("div", undefined, "ap-model");
      node.append(label("Write it like this"));
      if (block.prompt) node.append(rich(block.prompt, "ap-muted"));
      node.append(rich(block.text, "ap-model-text"));
      return node;
    }
    if (type === "example") {
      const node = el("div", undefined, "ap-example");
      node.append(label("Example"), rich(block.prompt), ...figureNodes(doc, block.figureIds));
      const solution = el("div", undefined, "ap-answer");
      solution.append(answerLine(block.answer), steps(block.steps));
      node.append(solution);
      return node;
    }
    if (type === "check") {
      const number = numbers.get(block);
      const node = el("div", undefined, "ap-check");
      node.setAttribute("role", "group");
      const heading = el("p", "Check " + number, "ap-check-label"); heading.id = "ap-check-" + number;
      node.setAttribute("aria-labelledby", heading.id);
      node.append(heading, rich(block.prompt), ...figureNodes(doc, block.figureIds));
      const actions = el("div", undefined, "ap-check-actions");
      const panels = [];
      if (block.hint) {
        const hint = el("div", undefined, "ap-check-panel ap-check-hint"); hint.id = "ap-check-" + number + "-hint";
        hint.append(label("Hint"), rich(block.hint));
        actions.append(toggle(hint, "Show a hint", "Hide the hint", heading.id)); panels.push(hint);
      }
      const answer = el("div", undefined, "ap-check-panel ap-answer"); answer.id = "ap-check-" + number + "-answer";
      answer.append(answerLine(block.answer), steps(block.steps));
      const see = studyNote(doc, block); if (see) answer.append(see);
      actions.append(toggle(answer, "Show answer", "Hide answer", heading.id)); panels.push(answer);
      node.append(actions, ...panels);
      return node;
    }
    if (type === "figure") { const [figure] = figureNodes(doc, [block.id]); return figure || null; }
    if (type === "links") {
      const node = el("ul", undefined, "ap-guide-links");
      block.items.forEach(item => {
        const href = options.href ? options.href(item.ref) : "";
        const li = el("li"); li.append(href ? link(item.label, href) : el("span", item.label)); node.append(li);
      });
      return node;
    }
    return null;
  }
  // Where a missed check sends the reader: a section of the same guide.
  function studyNote(doc, block) {
    const section = block.see && doc.sections.find(s => s.id === block.see);
    return section ? el("p", "If you missed it, study “" + section.title + "”, then try this check again on another day.", "ap-study-note") : null;
  }
  // Printed answers to every check, after the guide.
  function checkKey(doc, checks) {
    const node = el("section", undefined, "ap-check-key");
    node.setAttribute("aria-label", "Answers to the checks");
    node.append(el("h3", "Answers to the checks"));
    const list = el("ol", undefined, "ap-check-key-list worksheet-columns");
    checks.forEach(({ block, number }) => {
      const li = el("li"); li.setAttribute("value", String(number));
      li.append(el("p", "Check " + number, "ap-check-label"));
      if (block.hint) li.append(el("p", "Hint", "ap-block-label"), rich(block.hint));
      li.append(answerLine(block.answer), steps(block.steps));
      const see = studyNote(doc, block); if (see) li.append(see);
      list.append(li);
    });
    node.append(list);
    return node;
  }

  return { el, link, rich, booklet, answerSheet, key, tallySheet, referenceSheet, partsTable, summaryLine, guide };
});
