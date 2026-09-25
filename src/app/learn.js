(function () {
  "use strict";

  // The Learn page: an index of the SAT lessons, and one lesson at a time,
  // routed by the hash: "#<pageId>" or "#<pageId>/<anchor>". Lessons arrive
  // prebuilt as block trees (tools/build-learn.js). Every string reaches the
  // page as a text node or through textContent, and every href comes from
  // LiminalLearn, which re-checks it; nothing is ever parsed as HTML.

  const learn = window.LiminalLearn;
  const data = window.LIMINAL_LEARN || { pages: {}, index: [] };
  const view = document.getElementById("learnView");
  const status = document.getElementById("learnStatus");
  const BASE_TITLE = "Learn — Liminal";
  // A column narrower than this reads badly; tables that would need one
  // stack each row as label: value pairs instead (as they do on a phone).
  const MIN_COLUMN_PX = 120;
  const KINDS = new Set(learn.CALLOUT_LABELS.map((label) => label.toLowerCase().replace(/\s+/g, "-")));

  let shownPage = null;
  let sectionHeadings = new Map();

  /* ------------------------------------------------------------ helpers */

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function link(href, text, className) {
    const anchor = el("a", className, text);
    anchor.setAttribute("href", href);
    return anchor;
  }

  function httpsUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url : null;
    } catch (error) {
      return null;
    }
  }

  function groupOf(page) {
    return data.index.find((group) => (page.kind === "general"
      ? group.kind === "general"
      : group.sectionKey === page.section)) || null;
  }

  /* ------------------------------------------------------------- inline */

  function renderInline(parent, content) {
    (content || []).forEach((node) => {
      if (typeof node === "string") {
        parent.append(document.createTextNode(node));
        return;
      }
      if (node.type === "strong" || node.type === "em") {
        const child = el(node.type === "strong" ? "strong" : "em");
        renderInline(child, node.content);
        parent.append(child);
      } else if (node.type === "code") {
        parent.append(el("code", null, String(node.text)));
      } else if (node.type === "fact") {
        parent.append(el("span", "learn-fact", String(node.text === undefined ? "" : node.text)));
      } else if (node.type === "link") {
        const href = learn.linkHref(node);
        const child = el(href ? "a" : "span");
        if (href) child.setAttribute("href", href);
        renderInline(child, node.content);
        parent.append(child);
      }
      // Any other node type is dropped, never guessed at.
    });
  }

  /* ------------------------------------------------------------- blocks */

  function renderTable(block) {
    const wrap = el("div", "learn-table-wrap");
    const table = el("table", "learn-table");
    // Explicit roles keep the table's semantics when stacked rows change
    // its display.
    table.setAttribute("role", "table");
    const align = block.align || [];
    const labels = block.head.map((cell) => learn.plainText(cell));
    const cellFor = (tag, content, column) => {
      const cell = el(tag);
      if (align[column] === "center" || align[column] === "right") cell.classList.add(`align-${align[column]}`);
      renderInline(cell, content);
      return cell;
    };
    const head = el("thead");
    head.setAttribute("role", "rowgroup");
    const headRow = el("tr");
    headRow.setAttribute("role", "row");
    block.head.forEach((content, column) => {
      const cell = cellFor("th", content, column);
      cell.setAttribute("scope", "col");
      cell.setAttribute("role", "columnheader");
      headRow.append(cell);
    });
    head.append(headRow);
    const body = el("tbody");
    body.setAttribute("role", "rowgroup");
    block.rows.forEach((row) => {
      const tr = el("tr");
      tr.setAttribute("role", "row");
      row.forEach((content, column) => {
        const cell = cellFor("td", content, column);
        cell.setAttribute("role", "cell");
        cell.dataset.label = labels[column] || "";
        tr.append(cell);
      });
      body.append(tr);
    });
    table.append(head, body);
    wrap.dataset.columns = String(block.head.length);
    wrap.append(table);
    return wrap;
  }

  function renderCallout(block) {
    const kind = KINDS.has(block.kind) ? block.kind : "note";
    const box = el("div", `callout callout-${kind}`);
    box.append(el("p", "callout-label", String(block.label || "")));
    renderBlocks(box, block.blocks);
    return box;
  }

  function renderHeading(block) {
    const level = block.level === 3 ? 3 : 2;
    const heading = el(`h${level}`, "learn-heading");
    renderInline(heading, block.content);
    if (block.id && learn.ANCHOR.test(block.id)) {
      heading.id = `section-${block.id}`;
      heading.tabIndex = -1;
      sectionHeadings.set(block.id, heading);
    }
    return heading;
  }

  function renderBlocks(parent, blocks) {
    (blocks || []).forEach((block) => {
      if (block.type === "heading") {
        parent.append(renderHeading(block));
      } else if (block.type === "paragraph") {
        const paragraph = el("p");
        renderInline(paragraph, block.content);
        parent.append(paragraph);
      } else if (block.type === "list") {
        const list = el(block.ordered ? "ol" : "ul", "learn-list");
        if (block.ordered && Number.isInteger(block.start)) list.start = block.start;
        block.items.forEach((content) => {
          const item = el("li");
          renderInline(item, content);
          list.append(item);
        });
        parent.append(list);
      } else if (block.type === "table") {
        parent.append(renderTable(block));
      } else if (block.type === "pre") {
        parent.append(el("pre", "learn-pre", String(block.text)));
      } else if (block.type === "callout") {
        parent.append(renderCallout(block));
      }
    });
  }

  // Stacks tables that would be cramped or overflow at the current width,
  // and makes a preformatted block focusable only when it scrolls, so a
  // keyboard can scroll it.
  function fitWidths() {
    view.querySelectorAll(".learn-table-wrap").forEach((wrap) => {
      wrap.classList.remove("is-stacked");
      const columns = Number(wrap.dataset.columns) || 1;
      const cramped = wrap.clientWidth < columns * MIN_COLUMN_PX;
      if (cramped || wrap.scrollWidth > wrap.clientWidth + 1) wrap.classList.add("is-stacked");
    });
    view.querySelectorAll("pre.learn-pre").forEach((pre) => {
      if (pre.scrollWidth > pre.clientWidth + 1) {
        pre.tabIndex = 0;
        pre.setAttribute("aria-label", "Worked steps (scrolls sideways)");
      } else {
        pre.removeAttribute("tabindex");
        pre.removeAttribute("aria-label");
      }
    });
  }

  /* -------------------------------------------------------------- views */

  function pageHead(titleText, crumbs) {
    const head = el("header", "page-head learn-page-head");
    if (crumbs) head.append(crumbs);
    const title = el("h1", null, titleText);
    title.tabIndex = -1;
    head.append(title);
    return { head, title };
  }

  function renderIndex() {
    view.replaceChildren();
    const { head, title } = pageHead("Learn");
    head.append(el(
      "p",
      "lede",
      "One lesson for every SAT skill: what the question asks, worked examples, the traps, " +
        "and when each shortcut fails. Each lesson links straight to practice for its skill.",
    ));
    view.append(head);

    if (!data.index.length) {
      view.append(el("p", "empty-state", "No Learn pages have been built yet."));
      return title;
    }

    data.index.forEach((group) => {
      const section = el("section", "learn-group");
      section.append(el("h2", null, String(group.title)));
      if (group.kind === "section") {
        group.domains.forEach((domain) => {
          const block = el("div", "learn-domain");
          block.append(el("h3", null, String(domain.name)));
          const list = el("ul", "learn-skill-list");
          domain.pages.forEach((entry) => {
            const item = el("li", "learn-skill card");
            item.append(link(learn.pageHash(entry.id), String(entry.title), "learn-skill-link"));
            if (entry.subskills.length) {
              const subs = el("ul", "learn-subskills");
              subs.setAttribute("aria-label", `${entry.title} sections`);
              entry.subskills.forEach((sub) => {
                const subItem = el("li");
                subItem.append(link(learn.pageHash(entry.id, sub.anchor), String(sub.title)));
                subs.append(subItem);
              });
              item.append(subs);
            }
            list.append(item);
          });
          block.append(list);
          section.append(block);
        });
      } else {
        const list = el("ul", "learn-skill-list");
        group.pages.forEach((entry) => {
          const item = el("li", "learn-skill card");
          item.append(link(learn.pageHash(entry.id), String(entry.title), "learn-skill-link"));
          list.append(item);
        });
        section.append(list);
      }
      view.append(section);
    });
    return title;
  }

  function breadcrumbs(page) {
    const nav = el("nav", "learn-crumbs");
    nav.setAttribute("aria-label", "Breadcrumb");
    const list = el("ol");
    const home = el("li");
    home.append(link("#", "Learn"));
    list.append(home);
    const group = groupOf(page);
    if (group) list.append(el("li", null, String(group.title)));
    if (page.kind === "skill" && page.domain) list.append(el("li", null, String(page.domain)));
    nav.append(list);
    return nav;
  }

  function practiceLink(page) {
    if (page.kind !== "skill" || !/^sat-[a-z-]+$/.test(String(page.section)) ||
      !learn.ANCHOR.test(String(page.skillSlug))) {
      return null;
    }
    return link(learn.practiceHref(page.section, page.skillSlug), "Practice this skill", "button primary");
  }

  // Time-sensitive numbers are marked in the text; this lists the official
  // pages they were checked against, each with its oldest check date.
  function factsNote(page) {
    const sources = new Map();
    (page.facts || []).forEach((fact) => {
      const url = httpsUrl(fact.source);
      if (!url) return;
      const known = sources.get(url.href);
      if (!known || String(fact.verified) < known.verified) {
        sources.set(url.href, { url, verified: String(fact.verified) });
      }
    });
    if (!sources.size) return null;
    const note = el("section", "learn-facts");
    note.setAttribute("aria-label", "Sources for time-sensitive numbers");
    note.append(el(
      "p",
      null,
      "Numbers marked with a dotted underline can change. Check them against the official source before relying on them:",
    ));
    const list = el("ul");
    sources.forEach(({ url, verified }) => {
      const item = el("li");
      item.append(link(url.href, `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`));
      item.append(document.createTextNode(` (checked ${verified})`));
      list.append(item);
    });
    note.append(list);
    return note;
  }

  function renderPage(page) {
    view.replaceChildren();
    sectionHeadings = new Map();
    const blocks = page.blocks || [];
    const titleBlock = blocks[0] && blocks[0].type === "heading" && blocks[0].level === 1 ? blocks[0] : null;
    const { head, title } = pageHead(titleBlock ? learn.plainText(titleBlock.content) : String(page.title), breadcrumbs(page));
    const practice = practiceLink(page);
    if (practice) {
      const actions = el("p", "learn-actions");
      actions.append(practice);
      head.append(actions);
    }
    view.append(head);

    const layout = el("div", "learn-layout");
    const sections = learn.outline(blocks);
    if (sections.length) {
      const toc = el("nav", "learn-toc");
      toc.setAttribute("aria-label", "On this page");
      toc.append(el("p", "learn-toc-title", "On this page"));
      const list = el("ol");
      sections.forEach((section) => {
        const item = el("li");
        item.append(link(learn.pageHash(page.id, section.id), section.text));
        list.append(item);
      });
      toc.append(list);
      layout.append(toc);
    }

    const article = el("article", "learn-article card");
    article.setAttribute("aria-labelledby", "learnTitle");
    title.id = "learnTitle";
    renderBlocks(article, titleBlock ? blocks.slice(1) : blocks);
    const facts = factsNote(page);
    if (facts) article.append(facts);
    const endPractice = practiceLink(page);
    if (endPractice) {
      const end = el("p", "learn-actions learn-end");
      end.append(endPractice);
      article.append(end);
    }
    layout.append(article);
    view.append(layout);
    document.title = `${page.title} — ${BASE_TITLE}`;
    return title;
  }

  function renderMissing(path) {
    view.replaceChildren();
    const { head, title } = pageHead("No such Learn page");
    const text = el("p", "lede");
    text.append(document.createTextNode("Nothing here has the address “"));
    text.append(el("code", null, path));
    text.append(document.createTextNode("”. "));
    text.append(link("#", "See every Learn page"));
    text.append(document.createTextNode("."));
    head.append(text);
    view.append(head);
    document.title = BASE_TITLE;
    return title;
  }

  /* ------------------------------------------------------------- routing */

  // Draws the view the hash names. `moveFocus` is false on the first load,
  // so opening the page does not jump focus unless the link names a section.
  function show(moveFocus) {
    const target = learn.route(window.location.hash, data.pages);
    status.textContent = "";
    let focusTarget = null;
    let changed = false;
    if (target.view === "page") {
      if (shownPage !== target.id) {
        focusTarget = renderPage(data.pages[target.id]);
        shownPage = target.id;
        changed = true;
        fitWidths();
      }
      const section = target.anchor ? sectionHeadings.get(target.anchor) : null;
      if (target.anchor && !section) {
        status.textContent = "That section is not on this page; showing the top.";
      }
      if (section) {
        section.scrollIntoView({ block: "start" });
        section.focus({ preventScroll: true });
        return;
      }
      if (!changed && moveFocus !== false) focusTarget = view.querySelector("h1");
    } else {
      shownPage = null;
      focusTarget = target.view === "missing" ? renderMissing(target.path) : renderIndex();
      if (target.view === "index") document.title = BASE_TITLE;
      changed = true;
    }
    if (changed || moveFocus !== false) window.scrollTo(0, 0);
    if (focusTarget && moveFocus !== false) focusTarget.focus({ preventScroll: true });
  }

  window.addEventListener("hashchange", () => show(true));

  // Following a link to the hash already shown fires no hashchange; scroll
  // to it anyway, so "On this page" links always work.
  view.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href^='#']");
    if (!anchor || anchor.getAttribute("href") !== window.location.hash) return;
    event.preventDefault();
    show(true);
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(fitWidths, 120);
  });

  show(false);
})();
