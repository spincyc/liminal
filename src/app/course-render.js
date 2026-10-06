(function (root, factory) {
  "use strict";
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalCourseRender = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  // Presentation only: no UI state, storage, generation, or answer computation.
  const SVG_NS = "http://www.w3.org/2000/svg";
  const INDEPENDENT = "Liminal · Original, independent educational practice. Not affiliated with or endorsed by the textbook publisher.";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function renderText(value) {
    const text = String(value == null ? "" : value);
    const node = root.LiminalRender.renderText(text, { math: true });
    // The shared renderer preserves decimal brackets as text. Replace only
    // those text leaves, preserving its safe math, paragraphs, and tables.
    const leaves = [];
    const walk = (parent) => Array.from(parent.childNodes).forEach((child) => {
      if (child.nodeType === 3) leaves.push(child);
      else if (child.nodeType === 1 && !child.classList.contains("lm-math-sr")) walk(child);
    });
    walk(node);
    leaves.forEach((leaf) => {
      const pattern = /(-?\d+\.\d*)\[(\d+)\]/g;
      const textValue = leaf.nodeValue;
      let match;
      let start = 0;
      const fragment = document.createDocumentFragment();
      while ((match = pattern.exec(textValue))) {
        fragment.appendChild(document.createTextNode(textValue.slice(start, match.index)));
        const repeat = el("span", "course-repeat");
        const speech = el("span", "lm-math-sr", `${match[1]} followed by repeating ${match[2]}`);
        const visual = el("span");
        visual.setAttribute("aria-hidden", "true");
        visual.append(document.createTextNode(match[1]), el("span", "course-repeat-digits", match[2]));
        repeat.append(speech, visual);
        fragment.appendChild(repeat);
        start = match.index + match[0].length;
      }
      if (start) {
        fragment.appendChild(document.createTextNode(textValue.slice(start)));
        leaf.replaceWith(fragment);
      }
    });
    return node;
  }

  function prose(parent, value, className) {
    const node = renderText(value);
    if (className) node.classList.add(className);
    parent.appendChild(node);
    return node;
  }

  function list(parent, values, ordered) {
    const node = el(ordered ? "ol" : "ul");
    (values || []).forEach((value) => {
      const item = el("li");
      item.appendChild(renderText(value));
      node.appendChild(item);
    });
    parent.appendChild(node);
    return node;
  }

  function footer() { return el("footer", "course-document-footer", INDEPENDENT); }

  function renderGuide(course, lessonIds, options) {
    const settings = options || {};
    const selected = new Set(lessonIds || course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)));
    const guide = el("article", `course-document course-guide${settings.compact ? " course-inline-guide" : ""}`);
    if (!settings.compact) {
      const header = el("header", "course-document-head");
      header.append(el("p", "course-eyebrow", "Liminal / Study guide"), el("h1", "", course.title));
      prose(header, course.description || "");
      if (course.scopeNote) prose(header, course.scopeNote, "course-scope");
      const source = course.source || {};
      if (source.title) header.appendChild(el("p", "course-document-meta", `Topic alignment: ${source.title}${source.edition ? ` · ${source.edition}` : ""}${source.volume ? ` · ${source.volume}` : ""}. Original Liminal explanations and examples.`));
      guide.appendChild(header);
      if (course.studyRoutine && course.studyRoutine.length) {
        const routine = el("section", "course-routine");
        routine.appendChild(el("h2", "", "A steady nightly routine"));
        list(routine, course.studyRoutine, true);
        guide.appendChild(routine);
      }
    }
    course.units.forEach((unit) => {
      const lessons = unit.lessons.filter((lesson) => selected.has(lesson.id));
      if (!lessons.length) return;
      const section = el("section", "course-guide-unit");
      if (!settings.compact) {
        section.appendChild(el("h2", "", unit.title));
        if (unit.description) prose(section, unit.description);
      }
      lessons.forEach((lesson) => {
        const lessonNode = el("section", "course-guide-lesson");
        lessonNode.id = `guide-${lesson.id}`;
        const intro = el("div", "course-lesson-intro");
        intro.appendChild(el("h3", "", `${lesson.id} · ${lesson.title}`));
        const metadata = [];
        if (lesson.bookPage !== undefined && lesson.bookPage !== null) metadata.push(`Textbook page ${lesson.bookPage}`);
        if (lesson.standards && lesson.standards.length && !settings.compact) metadata.push(`Standards: ${lesson.standards.join(", ")}`);
        if (metadata.length) intro.appendChild(el("p", "course-document-meta", metadata.join(" · ")));
        prose(intro, lesson.objective || "", "course-objective");
        lessonNode.appendChild(intro);
        (lesson.explanation || []).forEach((paragraph) => prose(lessonNode, paragraph));
        (lesson.examples || []).forEach((example, index) => {
          const exampleNode = el("section", "course-example");
          exampleNode.appendChild(el("h4", "", `${settings.interactive ? "Try an example" : "Worked example"} ${index + 1}`));
          prose(exampleNode, example.prompt);
          if (example.table) exampleNode.appendChild(renderTable(example.table));
          if (example.graph) exampleNode.appendChild(renderGraph(example.graph));
          const solution = el(settings.interactive ? "details" : "div", "course-example-solution");
          if (settings.interactive) solution.appendChild(el("summary", "", "Show reasoning and answer"));
          list(solution, example.steps, true);
          if (example.solutionTable) solution.appendChild(renderTable(example.solutionTable));
          if (example.solutionGraph) solution.appendChild(renderGraph(example.solutionGraph));
          const answer = el("div", "course-answer");
          answer.appendChild(el("strong", "", "Answer: "));
          answer.appendChild(renderText(example.answer));
          solution.appendChild(answer);
          exampleNode.appendChild(solution);
          lessonNode.appendChild(exampleNode);
        });
        if (lesson.pitfalls && lesson.pitfalls.length) {
          const pitfalls = el("section", "course-pitfalls");
          pitfalls.appendChild(el("h4", "", "Check your thinking"));
          list(pitfalls, lesson.pitfalls, false);
          lessonNode.appendChild(pitfalls);
        }
        if (lesson.practiceAdvice) {
          const advice = el("section", "course-practice-advice");
          advice.appendChild(el("h4", "", "Put it into practice"));
          prose(advice, lesson.practiceAdvice);
          lessonNode.appendChild(advice);
        }
        section.appendChild(lessonNode);
      });
      guide.appendChild(section);
    });
    if (!settings.compact) {
      // End the guide with a complete worked example and its takeaways,
      // rather than a final page holding only a short practice note.
      const lesson = guide.querySelector(".course-guide-unit:last-child .course-guide-lesson:last-child");
      const examples = lesson ? lesson.querySelectorAll(":scope > .course-example") : [];
      if (examples.length) {
        const closing = el("div", "course-guide-closing");
        let node = examples[examples.length - 1];
        lesson.insertBefore(closing, node);
        while (node) {
          const next = node.nextElementSibling;
          closing.appendChild(node);
          node = next;
        }
        closing.appendChild(footer());
      } else guide.appendChild(footer());
    }
    return guide;
  }

  function renderTable(data) {
    const wrap = el("div", "course-table-wrap");
    const table = el("table", "course-table");
    if (data.headers && data.headers.length) {
      const head = el("thead");
      const row = el("tr");
      data.headers.forEach((value) => {
        const cell = el("th");
        cell.scope = "col";
        cell.appendChild(renderText(value));
        row.appendChild(cell);
      });
      head.appendChild(row);
      table.appendChild(head);
    }
    const body = el("tbody");
    (data.rows || []).forEach((values) => {
      const row = el("tr");
      values.forEach((value) => {
        const cell = el("td");
        cell.appendChild(renderText(value));
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
    table.appendChild(body);
    wrap.appendChild(table);
    return wrap;
  }

  function svgEl(tag, attributes, text) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function renderGraph(graph, options) {
    const wrap = el("figure", "course-graph");
    const bounds = [graph.xMin, graph.xMax, graph.yMin, graph.yMax];
    if (!bounds.every(Number.isFinite) || graph.xMax <= graph.xMin || graph.yMax <= graph.yMin) {
      wrap.appendChild(el("figcaption", "", "Graph unavailable: invalid coordinate bounds."));
      return wrap;
    }
    const blank = !!(options && options.blank);
    const xStep = Number.isFinite(graph.xStep) && graph.xStep > 0 ? graph.xStep : 1;
    const yStep = Number.isFinite(graph.yStep) && graph.yStep > 0 ? graph.yStep : 1;
    const xLabel = String(graph.xLabel == null ? "x" : graph.xLabel);
    const yLabel = String(graph.yLabel == null ? "y" : graph.yLabel);
    const numberLine = graph.numberLine === true;
    const points = blank ? [] : (graph.points || []).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    const lines = blank ? [] : (graph.lines || []).filter((line) => Array.isArray(line) && line.length >= 2 && line.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)));
    const description = `${numberLine ? "Number line" : blank ? "Blank coordinate grid" : "Coordinate graph"}. ${xLabel}: ${graph.xMin} to ${graph.xMax}, interval ${xStep}.` + (numberLine ? "" : ` ${yLabel}: ${graph.yMin} to ${graph.yMax}, interval ${yStep}.`) +
      (points.length ? ` Points: ${points.map((point) => `${point.label ? `${point.label} ` : ""}(${point.x}, ${point.y})`).join("; ")}.` : "") +
      (lines.length ? ` Lines through: ${lines.map((line) => line.map((point) => `(${point.x}, ${point.y})`).join(" to ")).join("; ")}.` : "");
    const svg = svgEl("svg", { viewBox: numberLine ? "0 0 360 145" : "0 0 360 300", role: "img", "aria-label": description });
    if (numberLine) wrap.classList.add("course-number-line");
    svg.appendChild(svgEl("title", {}, description));
    const left = 48, top = 15, width = 280, height = 240;
    const x = (value) => left + (value - graph.xMin) / (graph.xMax - graph.xMin) * width;
    const y = (value) => numberLine ? 85 : top + height - (value - graph.yMin) / (graph.yMax - graph.yMin) * height;
    const xAxis = y(Math.max(graph.yMin, Math.min(graph.yMax, 0)));
    const yAxis = x(Math.max(graph.xMin, Math.min(graph.xMax, 0)));
    const ticks = (min, max, step) => {
      // Bound SVG size even if malformed data asks for millions of ticks.
      const stride = step * Math.max(1, Math.ceil((max - min) / step / 40));
      const values = [];
      for (let i = Math.ceil(min / stride); i <= Math.floor(max / stride); i += 1) values.push(Number((i * stride).toPrecision(10)));
      return values;
    };
    ticks(graph.xMin, graph.xMax, xStep).forEach((value) => {
      svg.appendChild(svgEl("line", { x1: x(value), y1: numberLine ? 80 : top, x2: x(value), y2: numberLine ? 90 : top + height, class: numberLine ? "course-grid-axis" : "course-grid-line" }));
      svg.appendChild(svgEl("text", { x: x(value), y: numberLine ? 108 : top + height + 17, "text-anchor": "middle", class: "course-grid-label" }, value));
    });
    if (!numberLine) ticks(graph.yMin, graph.yMax, yStep).forEach((value) => {
      svg.appendChild(svgEl("line", { x1: left, y1: y(value), x2: left + width, y2: y(value), class: "course-grid-line" }));
      svg.appendChild(svgEl("text", { x: left - 8, y: y(value) + 4, "text-anchor": "end", class: "course-grid-label" }, value));
    });
    if (!numberLine) svg.appendChild(svgEl("rect", { x: left, y: top, width, height, class: "course-grid-border" }));
    svg.appendChild(svgEl("line", { x1: left, y1: xAxis, x2: left + width, y2: xAxis, class: "course-grid-axis" }));
    if (!numberLine) svg.appendChild(svgEl("line", { x1: yAxis, y1: top, x2: yAxis, y2: top + height, class: "course-grid-axis" }));
    if (xLabel) svg.appendChild(svgEl("text", { x: left + width / 2, y: numberLine ? 135 : 295, "text-anchor": "middle", class: "course-axis-label" }, xLabel));
    if (yLabel && !numberLine) svg.appendChild(svgEl("text", { transform: "translate(13 135) rotate(-90)", "text-anchor": "middle", class: "course-axis-label" }, yLabel));
    // Clip numeric data to the graph rectangle without importing SVG markup.
    const inside = (point) => point.x >= graph.xMin && point.x <= graph.xMax && point.y >= graph.yMin && point.y <= graph.yMax;
    lines.forEach((line) => {
      for (let index = 1; index < line.length; index += 1) {
        const start = line[index - 1], end = line[index];
        const dx = end.x - start.x, dy = end.y - start.y;
        let lo = 0, hi = 1;
        [[-dx, start.x - graph.xMin], [dx, graph.xMax - start.x], [-dy, start.y - graph.yMin], [dy, graph.yMax - start.y]].forEach(([p, q]) => {
          if (!p) { if (q < 0) lo = 2; }
          else if (p < 0) lo = Math.max(lo, q / p);
          else hi = Math.min(hi, q / p);
        });
        if (lo <= hi) svg.appendChild(svgEl("line", { x1: x(start.x + lo * dx), y1: y(start.y + lo * dy), x2: x(start.x + hi * dx), y2: y(start.y + hi * dy), class: "course-data-line" }));
      }
    });
    const visiblePoints = points.filter(inside);
    const crowded = visiblePoints.some((point, index) => point.label && visiblePoints.some((other, otherIndex) => otherIndex !== index && other.label && Math.abs(x(point.x) - x(other.x)) < 45 && Math.abs(y(point.y) - y(other.y)) < 25));
    visiblePoints.forEach((point, index) => {
      svg.appendChild(svgEl("circle", { cx: x(point.x), cy: y(point.y), r: 3.5, class: "course-data-point" }));
      if (point.label && crowded) {
        const calloutX = left + (index + .5) * width / visiblePoints.length;
        const calloutY = top + 24;
        svg.appendChild(svgEl("line", { x1: calloutX, y1: calloutY + 5, x2: x(point.x), y2: y(point.y) - 5, class: "course-point-leader" }));
        svg.appendChild(svgEl("text", { x: calloutX, y: calloutY, "text-anchor": "middle", class: "course-point-label" }, index + 1));
      } else if (point.label) svg.appendChild(svgEl("text", { x: x(point.x) + (point.x > (graph.xMin + graph.xMax) / 2 ? -7 : 7), y: y(point.y) + (point.y > (graph.yMin + graph.yMax) / 2 ? 15 : -7), "text-anchor": point.x > (graph.xMin + graph.xMax) / 2 ? "end" : "start", class: "course-point-label" }, point.label));
    });
    wrap.append(svg, el("figcaption", "course-graph-caption", numberLine ? `Number line: intervals of ${xStep}.` : `${xLabel || "Horizontal axis"}: intervals of ${xStep}; ${yLabel || "Vertical axis"}: intervals of ${yStep}.`));
    if (crowded) {
      const legend = el("ol", "course-graph-legend");
      visiblePoints.forEach((point) => {
        const item = el("li");
        item.appendChild(renderText(point.label || `(${point.x}, ${point.y})`));
        legend.appendChild(item);
      });
      wrap.append(legend, el("p", "course-graph-caption", "Placement is approximate. Very close points can overlap at this scale; compare their values in the key."));
    }
    return wrap;
  }

  function hasWideTable(question) {
    const table = question.table;
    return !!table && Math.max((table.headers || []).length, ...(table.rows || []).map((row) => row.length)) > 4;
  }

  function questionNode(question, answers) {
    const item = el("section", `course-question${answers ? " course-key-question" : ""}${question.graph || question.answerGraph ? " course-question-graph" : ""}${!answers && hasWideTable(question) ? " course-question-wide" : ""}`);
    const prompt = el("div", "course-question-prompt");
    prompt.append(el("strong", "course-question-number", `${question.number}.`), renderText(question.prompt));
    item.appendChild(prompt);
    if (question.table) item.appendChild(renderTable(question.table));
    if (answers) {
      const answer = el("div", "course-answer");
      answer.append(el("strong", "", "Answer: "), renderText(question.answer));
      item.appendChild(answer);
      list(item, question.steps, true);
      if (question.answerGraph || question.graph) item.appendChild(renderGraph(question.answerGraph || question.graph));
      item.appendChild(el("p", "course-question-meta", `${question.lessonId} · ${question.skill || ""}`));
    } else {
      if (question.graph) item.appendChild(renderGraph(question.graph));
      else if (question.answerGraph) item.appendChild(renderGraph(question.answerGraph, { blank: true }));
      const work = el("div", "course-workspace");
      work.setAttribute("aria-label", "Space to show your work");
      const count = Math.min(7, Math.max(3, Math.round(question.workLines || 4)));
      // The authored hint still reserves handwriting room, without prescribing
      // lines: students can calculate, sketch, or arrange their work freely.
      work.style.setProperty("--course-work-units", String(count));
      item.appendChild(work);
    }
    return item;
  }

  function sheetHeader(course, sheet, answers, page, pages, packetDays) {
    packetDays = packetDays || sheet.days;
    const head = el("header", "course-document-head course-sheet-head");
    head.appendChild(el("p", "course-eyebrow", `Liminal${sheet.day ? ` / Night ${sheet.day}` : ""} / ${answers ? "Worked answers" : "Student worksheets"}`));
    head.appendChild(el("h1", "", course.title));
    if (!answers && sheet.title && sheet.title !== course.title) head.appendChild(el("p", "course-sheet-title", sheet.title));
    head.appendChild(el("p", "course-form-code", `Form ${sheet.code} · Version ${sheet.version}${pages > 1 ? ` · Page ${page} of ${pages}` : ""}`));
    if (!answers || page === 1) head.appendChild(el("p", "course-document-meta course-replay-meta", `${sheet.packetSeed ? "Packet seed" : "Seed"}: ${sheet.packetSeed || sheet.seed} · ${sheet.questions.length} questions per night${packetDays ? ` · ${packetDays} night${packetDays === 1 ? "" : "s"}` : ""}. Lessons: ${(sheet.lessonIds || []).join(", ")}.`));
    if (!answers || page === 1) (sheet.warnings || []).forEach((warning) => head.appendChild(el("p", "course-print-warning", `Packet note: ${warning}`)));
    if (!answers) {
      head.appendChild(el("p", "course-student-name", "Name: __________________________________   Date: ______________"));
      head.appendChild(el("p", "course-document-meta", "Show your work. Use the study guide first; check the separate answer key afterward."));
    }
    return head;
  }

  function sheetPage(course, sheet, questions, pageNumber, pages, packetDays) {
    const page = el("section", `course-sheet-page${questions.some((question) => question.graph || question.answerGraph) ? " course-sheet-graphs" : ""}`);
    page.appendChild(sheetHeader(course, sheet, false, pageNumber, pages, packetDays));
    const grid = el("div", "course-questions");
    questions.forEach((question) => grid.appendChild(questionNode(question, false)));
    page.append(grid, footer());
    return page;
  }

  function printMeasurer() {
    // Measure real typeset rows, including graphs and tables, in Letter's
    // 7.4 by 10 inch content box. No timing estimate or fixed question count
    // can guarantee a page fits. The iframe is removed before returning.
    const rules = [];
    Array.from(document.styleSheets).forEach((sheet) => {
      try { Array.from(sheet.cssRules).forEach((rule) => rules.push(rule.cssText)); }
      catch (_) { /* Cross-origin styles cannot be read; ours are local. */ }
    });
    if (!rules.some((rule) => rule.includes("course-sheet-page"))) return null;
    const frame = el("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:7.4in;height:10in;border:0;visibility:hidden;pointer-events:none";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    const style = doc.createElement("style");
    style.textContent = rules.join("\n").replace(/@media\s+print\b/g, "@media all");
    doc.head.appendChild(style);
    doc.body.className = "course-export";
    return {
      fits(page, className) {
        const copy = doc.importNode(page, true);
        const wrapper = doc.createElement("article");
        wrapper.className = className || "course-document course-worksheet";
        wrapper.appendChild(copy);
        doc.body.replaceChildren(wrapper);
        // A small allowance protects against fractional printer rounding.
        return copy.getBoundingClientRect().height <= 945 && copy.scrollWidth <= copy.clientWidth + 1;
      },
      remove() { frame.remove(); },
    };
  }

  function answerPage(course, sheet, questions, pageNumber, pages, packetDays) {
    const page = el("section", "course-answer-page");
    page.appendChild(sheetHeader(course, sheet, true, pageNumber, pages, packetDays));
    const body = el("div", "course-key-questions");
    questions.forEach((question) => body.appendChild(questionNode(question, true)));
    page.append(body, footer());
    return page;
  }

  function renderWorksheet(course, sheet, options) {
    const settings = options || {};
    const answers = !!settings.answers;
    const article = el("article", `course-document course-worksheet${answers ? " course-answer-key" : ""}`);
    const measurer = settings.measurer || printMeasurer();
    const pageRenderer = answers ? answerPage : sheetPage;
    const groups = [];
    let offset = 0;
    try {
      while (offset < sheet.questions.length) {
        let count = Math.min(6, sheet.questions.length - offset);
        let group = sheet.questions.slice(offset, offset + count);
        if (measurer) {
          const pageNumber = groups.length + 1;
          while (count > 1 && !measurer.fits(pageRenderer(course, sheet, group, pageNumber, 99, settings.packetDays))) {
            count = answers || group.some(hasWideTable) ? count - 1 : count > 2 ? count - (count % 2 || 2) : 1;
            group = sheet.questions.slice(offset, offset + count);
          }
          if (!measurer.fits(pageRenderer(course, sheet, group, pageNumber, 99, settings.packetDays))) throw new Error(`Question ${group[0].number} is too large for a Letter page.`);
        } else {
          // Install courses.css before rendering for measured page fit.
          const roomy = group.some((question) => question.graph || question.answerGraph || question.table || question.workLines > 5 || String(question.prompt).length > 350);
          count = Math.min(roomy || answers ? 2 : 4, count);
          group = sheet.questions.slice(offset, offset + count);
        }
        groups.push(group);
        offset += group.length;
      }
      groups.forEach((questions, index) => article.appendChild(pageRenderer(course, sheet, questions, index + 1, groups.length, settings.packetDays)));
    } finally {
      if (measurer && !settings.measurer) measurer.remove();
    }
    return article;
  }

  function renderPacket(course, sheets, options) {
    const settings = options || {};
    const packet = el("div", "course-packet");
    const measurer = printMeasurer();
    try {
      sheets.forEach((sheet) => packet.appendChild(renderWorksheet(course, sheet, { ...settings, packetDays: sheets.length, measurer })));
    } finally {
      if (measurer) measurer.remove();
    }
    return packet;
  }

  function nightlyGuidePage(course, sheet, lessonIds, chunks, pageNumber, pages) {
    const page = el("section", "course-guide-page");
    const head = el("header", "course-document-head course-sheet-head");
    head.append(el("p", "course-eyebrow", `Liminal / Night ${sheet.day} / Study guide`), el("h1", "", course.title));
    head.appendChild(el("p", "course-form-code", `Form ${sheet.code} · Version ${sheet.version} · Page ${pageNumber} of ${pages}`));
    head.appendChild(el("p", "course-document-meta", `Lessons in tonight’s questions: ${lessonIds.join(", ")}. Read the explanations and examples before trying the student worksheets.`));
    const body = el("div", "course-guide-page-body");
    if (chunks.length && chunks[0].continuation) body.appendChild(el("h3", "course-guide-continuation", `${chunks[0].title} · continued`));
    chunks.forEach((chunk) => body.appendChild(chunk.node.cloneNode(true)));
    page.append(head, body, footer());
    return page;
  }

  function renderNightlyGuide(course, sheet, lessonIds, measurer) {
    // Reuse the complete lesson presentation. Chunk only at authored block
    // boundaries: an introduction and its explanations, a worked example,
    // or the lesson's closing advice. Never cut through typeset reasoning.
    const source = renderGuide(course, lessonIds, { compact: true });
    const chunks = [];
    source.querySelectorAll(".course-guide-lesson").forEach((lesson) => {
      const id = lesson.id.slice("guide-".length);
      const title = lesson.querySelector("h3").textContent;
      let group = el("section", "course-guide-chunk course-guide-opening");
      group.dataset.lessonId = id;
      Array.from(lesson.children).forEach((node) => {
        if (node.classList.contains("course-example")) {
          if (group.children.length) chunks.push({ node: group, title, continuation: !group.classList.contains("course-guide-opening") });
          const givenGraph = node.querySelector(":scope > .course-graph");
          const givenTable = node.querySelector(":scope > .course-table-wrap");
          const solution = node.querySelector(".course-example-solution");
          const workedGraph = solution.querySelector(":scope > .course-graph");
          const illustrations = givenGraph && workedGraph ? [["Given graph", givenGraph], ["Worked graph", workedGraph]]
            : givenGraph && givenTable && givenTable.querySelector("tr").children.length <= 4 ? [["Given table", givenTable], ["Given graph", givenGraph]] : null;
          if (illustrations) {
            // Two full-size illustrations beside one another leave room for
            // the complete reasoning without shrinking coordinate labels.
            const pair = el("div", "course-guide-figures");
            illustrations.forEach(([label, figure]) => {
              const panel = el("div");
              panel.append(el("p", "course-figure-label", label), figure);
              pair.appendChild(panel);
            });
            node.insertBefore(pair, solution);
          }
          node.dataset.lessonId = id;
          chunks.push({ node, title, continuation: true });
          group = el("section", "course-guide-chunk course-guide-takeaways");
          group.dataset.lessonId = id;
        } else group.appendChild(node);
      });
      if (group.children.length) chunks.push({ node: group, title, continuation: !group.classList.contains("course-guide-opening") });
    });
    const article = el("article", "course-document course-guide course-paginated-guide");
    const groups = [];
    let group = [];
    const fits = (values) => measurer.fits(nightlyGuidePage(course, sheet, lessonIds, values, groups.length + 1, 999), article.className);
    chunks.forEach((chunk) => {
      if (fits([...group, chunk])) { group.push(chunk); return; }
      if (group.length) { groups.push(group); group = []; }
      if (!fits([chunk])) throw new Error(`Study guide for ${chunk.title} has a block too large for a Letter page. Shorten the introduction or worked example before printing.`);
      group.push(chunk);
    });
    if (group.length) groups.push(group);
    groups.forEach((values, index) => article.appendChild(nightlyGuidePage(course, sheet, lessonIds, values, index + 1, groups.length)));
    return article;
  }

  function separatorPage(component) {
    const page = el("section", "course-document course-packet-blank");
    page.dataset.night = component.night;
    page.dataset.component = "separator";
    page.append(el("p", "course-eyebrow", `Liminal / Night ${component.night} / Separator back`), el("h1", "", "This side is intentionally blank"));
    page.appendChild(el("p", "", "Keep this back with the preceding section. The next section begins on a fresh sheet when printed on both sides."));
    page.appendChild(el("p", "course-form-code", `Form ${component.code}`));
    page.appendChild(footer());
    return page;
  }

  function renderNightlyPacket(course, sheets, options) {
    const settings = options || {};
    const engine = root.LiminalCourses;
    if (!engine || !engine.nightlyLessons || !engine.packetPagePlan) throw new Error("Load the course engine before rendering a nightly packet.");
    if (!Array.isArray(sheets) || !sheets.length) throw new Error("Build at least one night before printing a nightly packet.");
    const measurer = printMeasurer();
    if (!measurer) throw new Error("Load courses.css before printing a nightly packet so every page can be measured.");
    const packet = el("div", "course-packet course-nightly-packet");
    packet.dataset.duplex = settings.duplex !== false ? "true" : "false";
    const components = [];
    try {
      sheets.forEach((sheet, index) => {
        const night = sheet.day || index + 1;
        const numberedSheet = { ...sheet, day: night };
        const lessonIds = engine.nightlyLessons(course, sheet);
        const guide = renderNightlyGuide(course, numberedSheet, lessonIds, measurer);
        const packetDays = settings.packetDays || sheet.days || sheets.length;
        const student = renderWorksheet(course, numberedSheet, { packetDays, measurer });
        const answers = renderWorksheet(course, numberedSheet, { answers: true, packetDays, measurer });
        [["guide", guide], ["student", student], ["answers", answers]].forEach(([kind, node]) => {
          components.push({ night, kind, code: sheet.code, pageCount: node.children.length, node });
        });
      });
      engine.packetPagePlan(components, { duplex: settings.duplex !== false }).forEach((component) => {
        const node = component.node;
        node.classList.add("course-packet-component");
        node.dataset.night = component.night;
        node.dataset.component = component.kind;
        node.dataset.startPage = component.startPage;
        node.dataset.pageCount = component.pageCount;
        packet.appendChild(node);
        if (component.blankAfter) packet.appendChild(separatorPage(component));
      });
      return packet;
    } finally {
      measurer.remove();
    }
  }

  function exportHtml(title, contentElement, cssText) {
    const doc = document.implementation.createHTMLDocument(String(title));
    doc.documentElement.lang = "en";
    const charset = doc.createElement("meta");
    charset.setAttribute("charset", "utf-8");
    const viewport = doc.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    const style = doc.createElement("style");
    // CSS comes from our static stylesheets, never from course data. Prevent
    // a style terminator from changing the serialized document structure.
    style.textContent = String(cssText || "").replace(/<\/style/gi, "<\\/style");
    doc.head.prepend(charset, viewport);
    doc.head.appendChild(style);
    doc.body.className = "course-export";
    const note = doc.createElement("p");
    note.className = "course-print-instructions";
    note.textContent = "Print or save as PDF using your browser’s Print command. Choose Letter paper, 100% scale, and turn off browser headers and footers. This document works offline.";
    if (contentElement.classList.contains("course-nightly-packet")) {
      note.textContent += " Print the full document with one page per sheet.";
      note.textContent += contentElement.dataset.duplex === "true"
        ? " For two-sided printing, use long-edge binding and keep every labeled separator back. Each study guide, student worksheet section, and answer section begins on a fresh sheet."
        : " Choose single-sided printing. The document omits separator backs; each section begins on a fresh page.";
    }
    doc.body.append(note, doc.importNode(contentElement, true));
    return `<!doctype html>\n${doc.documentElement.outerHTML}`;
  }

  return { renderText, renderGraph, renderTable, renderGuide, renderWorksheet, renderPacket, renderNightlyPacket, exportHtml };
});
