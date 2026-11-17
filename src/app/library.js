/* The library: every complete work behind the nightly readings. The index
   searches and filters works; a work page shows its record and contents and
   reads the whole text online in chunks, with every nightly passage marked
   and linked to its reading. Decisions come from lib/reading-library.js and
   lib/daily-reading.js; this file builds the DOM, as text. */
(function () {
  "use strict";
  const D = window.LiminalDailyReading, Lib = window.LiminalReadingLibrary, R = window.LiminalDailyReadingRender, C = window.LiminalReaderControls;
  const $ = id => document.getElementById(id);
  const status = $("libraryStatus"), indexPanel = $("libraryIndex"), workPanel = $("libraryWork"), crumbs = $("libraryCrumbs");
  const query = $("libraryQuery"), level = $("libraryLevel"), family = $("libraryFamily"), author = $("libraryAuthor"), period = $("libraryPeriod");
  const list = $("libraryWorks"), count = $("libraryCount"), jump = $("libraryJump"), text = $("libraryText");
  let library = null, request = 0, topNav = null, focusNext = false;
  const cache = new Map();
  function getJson(path) {
    if (!path) return Promise.reject(new Error("No path"));
    if (!cache.has(path)) cache.set(path, fetch(path).then(response => { if (!response.ok) throw new Error("Unavailable"); return response.json(); }).catch(error => { cache.delete(path); throw error; }));
    return cache.get(path);
  }
  function announce(message, visible = false) { status.textContent = message; status.classList.toggle("daily-sr", !visible); }
  function option(label, value) { const node = R.el("option", label); node.value = value; return node; }
  function setCrumbs(items) {
    const all = [{ label: "Readings", href: "daily-reading.html" }, { label: "Library", href: "library.html" }, ...items];
    crumbs.replaceChildren(...all.map((item, i) => {
      const li = R.el("li");
      if (i < all.length - 1) li.append(R.link(item.label, item.href));
      else { const span = R.el("span", item.label); span.setAttribute("aria-current", "page"); li.append(span); }
      return li;
    }));
  }
  function words(n) { return n >= 1000 ? "about " + Math.round(n / 1000).toLocaleString("en-US") + ",000 words" : n + " words"; }
  function levelsLabel(levels) { return levels.map(grade => grade === 0 ? "K" : D.gradeLabel(grade).replace("Grade ", "")).join(", "); }

  // ---- Index ----
  function filters() {
    const choices = Lib.choices(library.works);
    level.replaceChildren(option("Any", ""), ...choices.levels.map(grade => option(D.gradeLabel(grade), String(grade))));
    family.replaceChildren(option("Any", ""), ...choices.families.map(name => option(name, name)));
    author.replaceChildren(option("Any", ""), ...choices.authors.map(name => option(name, name)));
    period.replaceChildren(option("Any", ""), ...choices.periods.map(item => option(item.label, item.id)));
  }
  function apply() {
    const works = Lib.filterWorks(library.works, { query: query.value, level: level.value === "" ? null : Number(level.value), family: family.value, author: author.value, period: period.value });
    list.replaceChildren(...works.map(work => {
      const item = R.el("li", undefined, "library-entry"), link = R.link(work.title, Lib.href(work.id));
      const title = R.el("h2"); title.append(link);
      const by = work.author + (work.translator ? " · translated by " + work.translator : "") + " · " + work.year;
      const facts = [words(work.words), work.readings ? work.readings + (work.readings === 1 ? " nightly reading" : " nightly readings") + " · " + (work.levels.length === 1 ? "level " : "levels ") + levelsLabel(work.levels) : "No nightly readings yet",
        Lib.families(work).join(", "), work.complete ? null : "Selected works from the edition"].filter(Boolean);
      item.append(title, R.el("p", by, "library-by"), R.el("p", facts.join(" · "), "daily-muted"));
      return item;
    }));
    const filtered = !!(query.value.trim() || level.value || family.value || author.value || period.value);
    count.replaceChildren(filtered ? works.length + " of " + library.works.length + " works match." : "");
    if (filtered) {
      const clear = R.el("button", "Clear filters", "daily-clear"); clear.type = "button";
      clear.addEventListener("click", () => { query.value = ""; level.value = ""; family.value = ""; author.value = ""; period.value = ""; apply(); query.focus(); });
      count.append(" ", clear);
    }
  }
  function showIndex(invalid) {
    ++request;
    indexPanel.hidden = false; workPanel.hidden = true; setCrumbs([]);
    document.title = "Library — Liminal";
    if (!library.works.length) {
      $("librarySummary").textContent = "The library is being filled. Until a work arrives here, each nightly reading still shows its source, edition and rights record.";
      document.querySelector(".library-search").hidden = true; list.replaceChildren();
      const link = R.el("p"); link.append(R.link("Open the nightly readings", "daily-reading.html")); list.append(link);
      announce(invalid ? "That library link was not recognized." : "The library has no works yet.", invalid);
      return;
    }
    const readings = library.works.reduce((sum, work) => sum + work.readings, 0);
    $("librarySummary").textContent = library.works.length + " complete public-domain works behind " + readings.toLocaleString("en-US") + " nightly readings. Read any of them whole, with every nightly passage marked.";
    apply();
    announce((invalid ? "That library link was not recognized. " : "") + "Showing " + library.works.length + " works.", invalid);
    if (focusNext) $("libraryHeading").focus();
  }

  // ---- A work ----
  function disclosure(label, className) { return R.disclosure(label, className); }
  function about(meta) {
    const work = meta.work, wrap = R.el("div", undefined, "library-about"), uses = (meta.uses || []).filter(use => Array.isArray(use.blocks));
    // The nightly readings drawn from this work, by level.
    const readings = disclosure(uses.length ? "Nightly readings from this work (" + uses.length + ")" : "No nightly readings from this work yet", "library-uses");
    const byLevel = new Map();
    uses.forEach(use => { if (!byLevel.has(use.grade)) byLevel.set(use.grade, []); byLevel.get(use.grade).push(use); });
    [...byLevel].sort((a, b) => a[0] - b[0]).forEach(([grade, items]) => {
      readings.append(R.el("h2", D.gradeLabel(grade) + " (" + items.length + ")"));
      const ol = R.el("ol");
      items.forEach(use => {
        const li = R.el("li"); li.append(R.link(use.title, Lib.useHref(use)), R.el("span", " · " + (use.week ? D.nightLabel(use.week, use.day) : "calendar reading") + " · ", "daily-muted"), R.link("in the text", Lib.route(work.id, use.id)));
        ol.append(li);
      });
      readings.append(ol);
    });
    const record = disclosure("Edition and rights", "library-record");
    const facts = R.el("dl");
    [["Author", work.author], ["Title", work.title], ["Translator", work.translator ? work.translator + " (" + work.translationYear + ")" : null], ["Published", String(work.publicationYear)],
      ["Edition", work.edition], ["Scope", meta.scope && meta.scope.complete === false ? meta.scope.note : "The complete work"], ["Rights", "Public domain in the United States. " + work.rights.basis],
      ["Checked", work.rights.verifiedDate], ["Length", words(meta.words) + " in " + meta.blocks + " paragraphs, stanzas and headings"]].forEach(([term, value]) => {
      if (!value) return; const row = R.el("div"); row.append(R.el("dt", term), R.el("dd", value)); facts.append(row);
    });
    const links = R.el("p", undefined, "daily-source-links");
    for (const [label, url] of [["Source record", work.url], ["The transcription used", work.textUrl], ["Rights evidence", work.rights.evidenceUrl]]) if (D.safeHttps(url)) links.append(R.link(label, url));
    record.append(facts, links);
    wrap.append(readings, record);
    return wrap;
  }
  function jumpOptions(meta, chunkIndex) {
    const heads = (meta.contents || []).filter(item => item.level === 1);
    const entries = heads.length ? heads.map(item => ({ label: item.text, block: item.block })) : meta.chunks.map((chunk, i) => ({ label: "Part " + (i + 1), block: chunk.first }));
    if (!entries.length || entries[0].block > 0) entries.unshift({ label: "Beginning", block: 0 });
    jump.replaceChildren(option("Part " + (chunkIndex + 1) + " of " + meta.chunks.length, ""), ...entries.map(item => option(item.label, String(item.block))));
    jump.value = "";
  }
  function partNav(meta, i, position, existing) {
    const chunks = meta.chunks, id = meta.work.id;
    const step = (n, word) => n >= 0 && n < chunks.length ? { href: Lib.route(id, chunks[n].first), label: word + " part: " + (n + 1) + " of " + chunks.length, text: position === "bottom" ? (word === "Previous" ? "‹ Previous part" : "Next part ›") : undefined } : null;
    return C.navigation({ label: "Parts of the work, " + position, steps: ["previous", "next"], compact: position === "top", previous: step(i - 1, "Previous"), next: step(i + 1, "Next") }, existing);
  }
  function blockElement(block, piecesRendered) {
    const tag = block.type === "heading" ? "h" + Math.min(4, (block.level || 1) + 1) : "p";
    const node = R.el(tag, undefined, block.type === "heading" ? "library-heading" : "library-" + block.type);
    node.id = "b" + block.index;
    piecesRendered(node);
    return node;
  }
  function renderChunk(meta, chunk, target) {
    const marked = Lib.markedBlocks(chunk, meta.uses), out = document.createDocumentFragment();
    marked.forEach(block => {
      block.starts.forEach(use => {
        const label = R.el("p", undefined, "library-passage-label" + (use.id === target ? " is-target" : "")); label.id = "passage-" + use.id;
        label.append(R.link(Lib.useLabel(use), Lib.useHref(use)), document.createTextNode(": " + use.title));
        out.append(label);
      });
      const original = chunk.blocks[block.index - chunk.first];
      if (block.type === "paragraph" && D.tableRows(original.text)) {
        // A source table keeps its table; a marked one is marked whole.
        const node = R.blockNode({ type: "paragraph", text: original.text });
        if (block.pieces.some(piece => piece.uses.length)) { const wrap = R.el("div", undefined, "library-marked-block"); wrap.append(node); out.append(wrap); } else out.append(node);
        return;
      }
      out.append(blockElement(block, node => block.pieces.forEach(piece => {
        if (!piece.uses.length) { R.emphasized(node, piece.text, document); return; }
        const mark = R.el("mark", undefined, "library-marked" + (piece.uses.some(use => use.id === target) ? " is-target" : ""));
        mark.title = piece.uses.map(Lib.useLabel).join("; ");
        R.emphasized(mark, piece.text, document); node.append(mark);
      })));
    });
    return out;
  }
  async function showWork(selected) {
    const current = ++request;
    indexPanel.hidden = true; workPanel.hidden = false; text.setAttribute("aria-busy", "true");
    announce("Opening this work…");
    try {
      const meta = await getJson(Lib.metaFile(selected.id));
      if (meta.schemaVersion !== 1 || !meta.work || meta.work.id !== selected.id || !Array.isArray(meta.chunks) || !meta.chunks.length) throw new Error("Work mismatch");
      if (current !== request) return;
      const use = selected.reading ? (meta.uses || []).find(item => item.id === selected.reading && Array.isArray(item.blocks)) : null;
      const block = use ? use.blocks[0] : selected.block !== null ? selected.block : 0, i = Math.max(0, Lib.chunkAt(meta, block));
      const part = meta.chunks[i], chunk = await getJson(part.file);
      if (current !== request) return;
      if (chunk.work !== selected.id || chunk.first !== part.first || !Array.isArray(chunk.blocks)) throw new Error("Chunk mismatch");
      const work = meta.work;
      setCrumbs([{ label: work.title }]);
      $("libraryWorkTitle").textContent = work.title;
      $("libraryWorkBy").textContent = "By " + work.author + (work.translator ? " · Translated by " + work.translator : "");
      $("libraryWorkMeta").textContent = [String(work.publicationYear), words(meta.words), (meta.uses || []).length + " nightly readings"].join(" · ");
      $("libraryWorkAbout").replaceChildren(about(meta));
      jumpOptions(meta, i);
      topNav = partNav(meta, i, "top", topNav);
      if (!topNav.parentElement) $("libraryNavigation").append(topNav);
      text.replaceChildren(renderChunk(meta, chunk, use ? use.id : null));
      $("libraryBottom").replaceChildren(partNav(meta, i, "bottom"));
      document.title = work.title + " · Library — Liminal";
      announce((selected.invalid ? "That link was not fully recognized. " : "") + (use ? "Showing the passage for " + Lib.useLabel(use) + ": " + use.title + "." : "Showing " + work.title + ", part " + (i + 1) + " of " + meta.chunks.length + "."), selected.invalid);
      const target = use ? $("passage-" + use.id) : selected.block !== null ? $("b" + selected.block) : null;
      if (target) { target.scrollIntoView({ block: "start" }); if (use) { const link = target.querySelector("a"); if (link) link.focus({ preventScroll: true }); } }
      else if (focusNext) { $("libraryWorkTitle").focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
      if (selected.reading && !use) announce("That reading is not in this work. Showing the work from its beginning.", true);
    } catch (_) {
      if (current !== request) return;
      setCrumbs([{ label: "Unavailable" }]);
      $("libraryWorkTitle").textContent = "This work could not be opened";
      $("libraryWorkBy").textContent = ""; $("libraryWorkMeta").textContent = ""; $("libraryWorkAbout").replaceChildren(); $("libraryBottom").replaceChildren();
      const back = R.el("p"); back.append(R.link("Back to the library", "library.html")); text.replaceChildren(back);
      announce("This work could not be opened. It may not be in the library yet.", true);
    } finally { if (current === request) text.setAttribute("aria-busy", "false"); }
  }

  function route() {
    const selected = Lib.parseRoute(window.location.hash);
    if (selected.view === "work") showWork(selected); else showIndex(selected.invalid);
    focusNext = true;
  }
  async function start() {
    if (!D || !Lib || !R || !C) { announce("The library could not be loaded. Reload this page to try again.", true); return; }
    try {
      library = await getJson(Lib.INDEX_FILE);
      if (library.schemaVersion !== 1 || !Array.isArray(library.works)) throw new Error("Index mismatch");
    } catch (_) { library = { schemaVersion: 1, works: [] }; }
    filters();
    for (const control of [query]) control.addEventListener("input", apply);
    for (const control of [level, family, author, period]) control.addEventListener("change", apply);
    query.form.addEventListener("submit", event => { event.preventDefault(); apply(); });
    jump.form.addEventListener("submit", event => event.preventDefault());
    jump.addEventListener("change", () => { const id = Lib.parseRoute(window.location.hash).id; if (id && jump.value !== "") window.location.hash = Lib.route(id, Number(jump.value)); });
    window.addEventListener("hashchange", route);
    route();
  }
  document.querySelector(".skip-link").addEventListener("click", event => { event.preventDefault(); const main = $("main"); main.focus(); main.scrollIntoView({ block: "start" }); });
  start();
})();
