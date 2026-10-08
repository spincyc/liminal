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

  function documentLabel(text) {
    const label = el("div", "course-document-label");
    const brand = el("span", "course-document-brand");
    const mark = document.createElementNS(SVG_NS, "svg");
    Object.entries({ viewBox: "0 0 28 34", fill: "none", "aria-hidden": "true", focusable: "false" })
      .forEach(([name, value]) => mark.setAttribute(name, value));
    ["M3 32V15a11 11 0 0 1 22 0v17M10 32V15a4 4 0 0 1 8 0v17", "M0 32h28"].forEach((d) => {
      const path = document.createElementNS(SVG_NS, "path");
      Object.entries({ d, stroke: "currentColor", "stroke-width": "2.5" })
        .forEach(([name, value]) => path.setAttribute(name, value));
      mark.appendChild(path);
    });
    brand.append(mark, el("span", "", "Liminal."));
    label.append(brand, el("span", "course-eyebrow", text));
    return label;
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
    (values || []).forEach((value, index) => {
      const item = el("li");
      if (ordered) item.value = index + 1;
      item.appendChild(renderText(value));
      node.appendChild(item);
    });
    parent.appendChild(node);
    return node;
  }

  function footer() { return el("footer", "course-document-footer worksheet-footer", INDEPENDENT); }

  function learningTask(task, kind, interactive) {
    const readiness = kind === "readiness";
    const section = el("section", `course-example course-${kind}`);
    section.appendChild(el("h4", "", readiness ? "Before you begin" : "Your turn · finish the steps"));
    section.appendChild(el("p", "course-task-instruction", readiness
      ? "Try this short check by hand. If you get stuck, read the repair before the lesson."
      : "Use the start below, then finish by hand. Explain each step. A calculator may check arithmetic afterward."));
    prose(section, task.prompt);
    if (task.table) section.appendChild(renderTable(task.table));
    if (task.graph) section.appendChild(renderGraph(task.graph));
    if (task.starter) {
      const start = el("div", "course-task-starter");
      start.appendChild(el("strong", "", "Start here"));
      prose(start, task.starter);
      section.appendChild(start);
      list(section, task.stepsToComplete, true);
    }
    const space = el("div", "course-task-workspace");
    space.setAttribute("aria-label", "Space to try the task before checking");
    section.appendChild(space);
    const solution = el(interactive ? "details" : "div", "course-example-solution course-task-check");
    solution.appendChild(el(interactive ? "summary" : "h4", "", "Check after trying"));
    list(solution, task.steps, true);
    prose(solution, task.answer, "course-answer");
    if (task.repair) prose(solution, task.repair, "course-repair");
    section.appendChild(solution);
    return section;
  }

  function renderGuide(course, lessonIds, options) {
    const settings = options || {};
    const selected = new Set(lessonIds || course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)));
    const guide = el("article", `course-document worksheet-document course-guide${settings.compact ? " course-inline-guide" : ""}`);
    if (!settings.compact) {
      const header = el("header", "course-document-head worksheet-heading");
      header.append(documentLabel("Study guide"), el("h1", "", course.title));
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
        if (lesson.readiness) lessonNode.appendChild(learningTask(lesson.readiness, "readiness", settings.interactive));
        (lesson.explanation || []).forEach((paragraph) => prose(lessonNode, paragraph));
        (lesson.workSamples || []).forEach((sample) => {
          const example = el("section", "course-example course-written-example");
          example.appendChild(el("h4", "", "Model of written work"));
          prose(example, sample.title);
          const solution = el(settings.interactive ? "details" : "div", "course-example-solution");
          if (settings.interactive) solution.appendChild(el("summary", "", "Show the written solution"));
          const figure = root.LiminalRender.renderFigure({ svg: sample.svg,
            alt: [sample.title, ...sample.transcript].join(" ") });
          figure.classList.add("course-work-sample");
          const caption = el("figcaption", "course-work-caption");
          caption.appendChild(renderText(sample.description));
          figure.appendChild(caption);
          solution.appendChild(figure);
          if (settings.interactive) {
            const fullSize = el("a", "course-work-full-size", "Open the written page at full size");
            fullSize.href = `content/work-samples/${sample.file}`;
            solution.appendChild(fullSize);
            const transcript = el("details", "course-work-transcript");
            transcript.appendChild(el("summary", "", "Read the typed steps"));
            list(transcript, sample.transcript, true);
            solution.appendChild(transcript);
          }
          example.appendChild(solution);
          lessonNode.appendChild(example);
        });
        (lesson.examples || []).forEach((example, index) => {
          const exampleNode = el("section", "course-example");
          exampleNode.appendChild(el("h4", "worksheet-number", `Worked example ${index + 1}`));
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
          if (lesson.bridge && index + 1 === (lesson.bridge.afterExample || 1)) {
            lessonNode.appendChild(learningTask(lesson.bridge, "bridge", settings.interactive));
          }
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
    const xTicks = ticks(graph.xMin, graph.xMax, xStep);
    const yTicks = ticks(graph.yMin, graph.yMax, yStep);
    // Preserve every grid interval while spacing numeric labels far enough
    // apart to read on paper. Dense integer grids otherwise overprint labels.
    const xLabelWidth = Math.max(...xTicks.map(value => String(value).length), 1) * 8 + 8;
    const xLabelStride = Math.max(1, Math.ceil(xLabelWidth / (width * xStep / (graph.xMax - graph.xMin))));
    const yLabelStride = Math.max(1, Math.ceil(16 / (height * yStep / (graph.yMax - graph.yMin))));
    xTicks.forEach((value) => {
      svg.appendChild(svgEl("line", { x1: x(value), y1: numberLine ? 80 : top, x2: x(value), y2: numberLine ? 90 : top + height, class: numberLine ? "course-grid-axis" : "course-grid-line" }));
      if (Math.round(value / xStep) % xLabelStride === 0) svg.appendChild(svgEl("text", { x: x(value), y: numberLine ? 108 : top + height + 17, "text-anchor": "middle", class: "course-grid-label" }, value));
    });
    if (!numberLine) yTicks.forEach((value) => {
      svg.appendChild(svgEl("line", { x1: left, y1: y(value), x2: left + width, y2: y(value), class: "course-grid-line" }));
      if (Math.round(value / yStep) % yLabelStride === 0) svg.appendChild(svgEl("text", { x: left - 8, y: y(value) + 4, "text-anchor": "end", class: "course-grid-label" }, value));
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
    wrap.append(svg, el("figcaption", "course-graph-caption", numberLine ? `Each tick: ${xStep}.` : `Each grid interval: ${xLabel || "horizontal"} = ${xStep}; ${yLabel || "vertical"} = ${yStep}.`));
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
    const tableByGraph = !answers && question.table && (question.graph || question.answerGraph) && !hasWideTable(question);
    const item = el("section", `course-question worksheet-problem${answers ? " course-key-question" : ""}${question.graph || question.answerGraph ? " course-question-graph" : ""}${!answers && hasWideTable(question) ? " course-question-wide" : ""}`);
    if (!answers && hasWideTable(question) && (question.graph || question.answerGraph)) item.classList.add("course-question-long-table");
    item.appendChild(el("h3", "course-question-number worksheet-number", `${question.number}.`));
    if (!answers && question.expectations) {
      const label = question.support === "guided" ? "Use the support" : "Try on your own";
      item.appendChild(el("p", "course-question-stage", `${label}${question.lessonId ? ` · Lesson ${question.lessonId}` : ""}`));
    }
    const prompt = el("div", "course-question-prompt");
    prompt.appendChild(renderText(question.prompt));
    item.appendChild(prompt);
    if (question.table && !tableByGraph) item.appendChild(renderTable(question.table));
    if (answers) {
      const answer = el("div", "course-answer");
      answer.append(el("strong", "", "Answer: "), renderText(question.answer));
      item.appendChild(answer);
      list(item, question.steps, true);
      if (question.answerGraph || question.graph) item.appendChild(renderGraph(question.answerGraph || question.graph));
      item.appendChild(el("p", "course-question-meta", `${question.lessonId} · ${question.skill || ""}`));
    } else {
      const layout = el("div", "course-question-layout");
      if (question.expectations) {
        const directions = el("dl", "course-expectations");
        for (const [key, label] of [["byHand", "By hand"], ["calculator", "Calculator"], ["showWork", "Show"], ["answerForm", "Finish with"]]) {
          const field = el("div", "course-expectation");
          field.appendChild(el("dt", "", label));
          const detail = el("dd");
          prose(detail, question.expectations[key]);
          field.appendChild(detail);
          directions.appendChild(field);
        }
        if (question.support === "guided") {
          for (const [key, label] of [["firstStep", "First step"], ["check", "Check your thinking"]]) {
            const field = el("div", "course-expectation course-support-field");
            field.appendChild(el("dt", "course-support-label", label));
            const detail = el("dd", "course-support-text");
            prose(detail, question.expectations[key]);
            field.appendChild(detail);
            directions.appendChild(field);
          }
        }
        layout.appendChild(directions);
      }
      const response = el("div", `course-response${question.graph || question.answerGraph ? " course-response-graph" : ""}`);
      response.appendChild(el("p", "course-work-label", "Your working"));
      const work = el("div", "course-workspace");
      work.setAttribute("aria-label", "Space to show your work");
      const count = Math.min(7, Math.max(3, Math.round(question.workLines || 4)));
      // The authored hint still reserves handwriting room, without prescribing
      // lines: students can calculate, sketch, or arrange their work freely.
      work.style.setProperty("--course-work-units", String(count));
      if (tableByGraph) {
        const tableWork = el("div", "course-givens-work");
        tableWork.append(renderTable(question.table), work);
        response.appendChild(tableWork);
      }
      if (question.graph) response.appendChild(renderGraph(question.graph));
      else if (question.answerGraph) response.appendChild(renderGraph(question.answerGraph, { blank: true }));
      if (!work.parentNode) response.appendChild(work);
      response.appendChild(el("p", "course-work-label", "Answer / conclusion"));
      const finalSpace = el("div", "course-final-space");
      finalSpace.setAttribute("aria-label", "Space for the answer or conclusion");
      response.appendChild(finalSpace);
      layout.appendChild(response);
      item.appendChild(layout);
    }
    return item;
  }

  function sheetHeader(course, sheet, answers, page, pages, packetDays) {
    packetDays = packetDays || sheet.days;
    const head = el("header", "course-document-head course-sheet-head worksheet-heading");
    head.appendChild(documentLabel(`${sheet.day ? `Night ${sheet.day} / ` : ""}${sheet.worksheetVariant ? `Worksheet ${sheet.worksheetVariant} / ` : ""}${answers ? "Worked answers" : "Student worksheets"}`));
    head.appendChild(el("h1", "", course.title));
    if (!answers && sheet.title && sheet.title !== course.title && sheet.title !== course.title + " practice") head.appendChild(el("p", "course-sheet-title", sheet.title));
    head.appendChild(el("p", "course-form-code", `Form ${sheet.code} · Version ${sheet.version}${pages > 1 ? ` · Page ${page} of ${pages}` : ""}`));
    if (page === 1) head.appendChild(el("p", "course-document-meta course-replay-meta", `${sheet.packetSeed ? "Packet seed" : "Seed"}: ${sheet.packetSeed || sheet.seed} · ${sheet.questions.length} questions per ${sheet.worksheetVariant ? "worksheet" : "night"}${packetDays ? ` · ${packetDays} night${packetDays === 1 ? "" : "s"}` : ""} · ${sheet.practiceMode === "rebuild" ? "Rebuild" : "Mixed review"}. Lessons: ${(sheet.lessonIds || []).join(", ")}.`));
    if (!answers || page === 1) (sheet.warnings || []).forEach((warning) => head.appendChild(el("p", "course-print-warning", `Packet note: ${warning}`)));
    if (!answers) {
      if (page === 1) head.appendChild(el("p", "course-student-name", "Name: __________________________________   Date: ______________"));
      const paired = sheet.practiceMode === "rebuild" && sheet.questions.some(question => question.support === "guided");
      head.appendChild(el("p", "course-sheet-directions", paired
        ? "Read the lesson first. Use the support on the first problem of each pair; cover it for the next. Pause after two problems and check the separate key."
        : "Choose a method and work independently. Follow each problem’s calculator and work directions. Check the separate key after a small group of problems."));
      if (page === 1) head.appendChild(el("p", "course-document-meta", "A correct number alone is not the whole answer: include the evidence listed under Show. If stuck, mark the step where you need help."));
    } else if (page === 1) {
      head.appendChild(el("p", "course-sheet-directions", "Compare reasoning as well as answers. Mark each problem: on my own / with help / retry. For a miss, find the first different step, explain the correction, then cover the key and redo it."));
      head.appendChild(el("p", "course-document-meta", "For a fresh retry, use the same problem number on an unused worksheet letter from this night. Try it tomorrow; return to the lesson again a few days later. Needing help means choose a smaller step, not more pages at once."));
    }
    return head;
  }

  function pageColumns(className) {
    const body = el("div", `${className} course-page-columns`);
    body.append(el("div", "course-print-column"), el("div", "course-print-column"));
    return body;
  }

  function sheetPage(course, sheet, answers, pageNumber, pages, packetDays) {
    const page = el("section", answers ? "course-answer-page" : "course-sheet-page");
    page.append(sheetHeader(course, sheet, answers, pageNumber, pages, packetDays),
      pageColumns(answers ? "course-key-questions" : "course-questions"), footer());
    return page;
  }

  async function preparePrint() {
    if (!document.fonts) throw new Error("This browser cannot load the print fonts. Try a current browser.");
    const faces = await Promise.all(["", "bold ", "italic ", "bold italic "].map(face =>
      document.fonts.load(`${face}10pt "Liminal Reading Serif"`)));
    if (faces.some(loaded => !loaded.length)) throw new Error("Print fonts did not load. Reload the page and try again.");
    await document.fonts.ready;
  }

  function printMeasurer() {
    // Match the booklet's Letter content box. Explicit columns let every
    // continuation become a real page, so duplex separators use actual counts.
    const rules = [];
    Array.from(document.styleSheets).forEach((sheet) => {
      try { Array.from(sheet.cssRules).forEach((rule) => rules.push(rule.cssText)); }
      catch (_) { /* Cross-origin styles cannot be read; ours are local. */ }
    });
    if (!rules.some((rule) => rule.includes("course-sheet-page"))) return null;
    const frame = el("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:var(--worksheet-page-width, 7.4in);height:var(--worksheet-page-height, 9.7in);border:0;visibility:hidden;pointer-events:none";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    // An overflowing trial must not add a scrollbar and change column width.
    doc.documentElement.style.overflow = "hidden";
    const style = doc.createElement("style");
    style.textContent = rules.join("\n").replace(/@media\s+print\b/g, "@media all");
    doc.head.appendChild(style);
    // Reuse already loaded faces; a fresh iframe must not measure fallback
    // glyphs while fetching the same embedded fonts a second time.
    if (document.fonts && doc.fonts) document.fonts.forEach(face => doc.fonts.add(face));
    doc.body.className = "course-export";
    return {
      fits(page, className) {
        const copy = doc.importNode(page, true);
        const wrapper = doc.createElement("article");
        wrapper.className = className || "course-document worksheet-document course-worksheet";
        wrapper.appendChild(copy);
        doc.body.replaceChildren(wrapper);
        // Six CSS pixels allow for print rounding at the bottom margin.
        return copy.getBoundingClientRect().height <= frame.clientHeight - 6 &&
          copy.scrollWidth <= copy.clientWidth + 1;
      },
      remove() { frame.remove(); },
    };
  }

  function splitForColumn(node, fits) {
    // DOM ranges preserve safe math and inline markup. Try complete blocks
    // first, then word boundaries only when a single paragraph is oversized.
    // Figures, math runs and table rows stay atomic.
    const blockBoundaries = [], wordBoundaries = [];
    const tables = Array.from(node.querySelectorAll("table"));
    tables.forEach((table, index) => table.dataset.courseFragmentTable = String(index));
    const weight = part => {
      const copy = part.cloneNode(true);
      copy.querySelectorAll(".worksheet-number, thead").forEach(label => label.remove());
      return copy.textContent.trim().length + copy.querySelectorAll("svg, .course-workspace, .course-final-space").length;
    };
    const originalWeight = weight(node);
    const atomic = "svg, .lm-math, .lm-math-sr, .course-repeat, tr, .course-workspace, .course-final-space";
    function visit(parent) {
      Array.from(parent.childNodes).forEach((child, index) => {
        if (child.nodeType === 1 && !child.matches(atomic) &&
            !child.classList.contains("worksheet-number")) visit(child);
        if (child.nodeType === 3 && !parent.closest("h1, h2, h3, h4, svg, .lm-math, .lm-math-sr, .course-repeat")) {
          for (const match of child.textContent.matchAll(/\s+/g)) wordBoundaries.push([child, match.index + match[0].length]);
        }
        if (index < parent.childNodes.length - 1 && child.nodeType === 1 &&
            /^(?:DIV|SECTION|P|OL|UL|LI|DL|FIGURE|TABLE|THEAD|TBODY|TR|H[1-6])$/.test(child.tagName)) blockBoundaries.push([parent, index + 1]);
      });
    }
    visit(node);
    // Traversal order is document order; never bisect a problem label alone.
    const pieces = ([container, offset]) => {
      const before = document.createRange();
      before.selectNodeContents(node); before.setEnd(container, offset);
      const after = document.createRange();
      after.selectNodeContents(node); after.setStart(container, offset);
      const left = node.cloneNode(false), right = node.cloneNode(false);
      left.appendChild(before.cloneContents()); right.appendChild(after.cloneContents());
      right.querySelectorAll("table").forEach(table => {
        const source = tables[Number(table.dataset.courseFragmentTable)];
        const header = source?.querySelector("thead");
        if (header && !table.querySelector("thead")) table.prepend(header.cloneNode(true));
      });
      const heading = node.querySelector(":scope > .worksheet-number");
      if (heading && right.textContent.trim()) {
        const label = heading.cloneNode(true);
        label.textContent = heading.textContent.replace(/ · continued$/, "") + " · continued";
        right.prepend(label);
      }
      left.classList.add("course-continuation-fragment");
      right.classList.add("course-continuation-fragment");
      return [left, right];
    };
    const findSplit = boundaries => {
      let low = 0, high = boundaries.length - 1, chosen = null;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const pair = pieces(boundaries[middle]);
        if (fits(pair[0])) { chosen = pair; low = middle + 1; }
        else high = middle - 1;
      }
      // A fitting label alone is not progress. An oversized atomic figure
      // must fail promptly rather than copying its label forever.
      return chosen && weight(chosen[0]) > 0 && weight(chosen[1]) < originalWeight && weight(chosen[1]) > 0 ? chosen : null;
    };
    const chosen = findSplit(blockBoundaries) || findSplit(wordBoundaries);
    [node, ...(chosen || [])].forEach(part => part.querySelectorAll("[data-course-fragment-table]")
      .forEach(table => table.removeAttribute("data-course-fragment-table")));
    return chosen;
  }

  function paginateNodes(nodes, makePage, measurer, className) {
    const pages = [];
    let page, columns, columnIndex;
    const start = () => {
      page = makePage(pages.length + 1, 999);
      columns = page.querySelectorAll(".course-print-column");
      columnIndex = 0;
      pages.push(page);
    };
    const advance = () => { if (columnIndex === 0) columnIndex = 1; else start(); };
    start();
    for (const original of nodes) {
      let node = original;
      while (node) {
        const column = columns[columnIndex];
        column.appendChild(node);
        const fits = !measurer || measurer.fits(page, className);
        if (fits) { node = null; continue; }
        node.remove();
        if (column.children.length) { advance(); continue; }
        const pair = splitForColumn(node, prefix => {
          column.appendChild(prefix);
          const fits = measurer.fits(page, className);
          prefix.remove();
          return fits;
        });
        if (!pair) throw new Error(`A figure or table row exceeds a printable column (${node.textContent.slice(0, 80)}). Check its dimensions before printing.`);
        column.appendChild(pair[0]);
        node = pair[1];
        advance();
      }
      if (!measurer && columns[columnIndex].children.length >= 2) advance();
    }
    if (!pages[pages.length - 1].querySelector(".course-print-column > *")) pages.pop();
    // Number after pagination; the placeholder reserves at least as much room.
    pages.forEach((page, index) => {
      const code = page.querySelector(".course-form-code");
      if (code) code.textContent = code.textContent.replace(/Page \d+ of 999/, `Page ${index + 1} of ${pages.length}`);
    });
    return pages;
  }

  function renderWorksheet(course, sheet, options) {
    const settings = options || {};
    const answers = !!settings.answers;
    const article = el("article", `course-document worksheet-document course-worksheet${answers ? " course-answer-key" : ""}`);
    if (sheet.worksheetVariant) article.dataset.worksheetVariant = sheet.worksheetVariant;
    const measurer = settings.measurer || printMeasurer();
    try {
      const nodes = sheet.questions.map(question => questionNode(question, answers));
      paginateNodes(nodes, (number, total) => sheetPage(course, sheet, answers, number, total, settings.packetDays), measurer, article.className)
        .forEach(page => article.appendChild(page));
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
      sheets.forEach((sheet) => packet.appendChild(renderWorksheet(course, sheet, { ...settings, packetDays: settings.packetDays || sheet.days || sheets.length, measurer })));
    } finally {
      if (measurer) measurer.remove();
    }
    return packet;
  }

  function nightlyGuidePage(course, sheet, lessonIds, pageNumber, pages) {
    const page = el("section", "course-guide-page");
    const head = el("header", "course-document-head course-sheet-head worksheet-heading");
    head.append(documentLabel(`Night ${sheet.day}${sheet.worksheetVariant ? ` / Worksheet ${sheet.worksheetVariant}` : ""} / Study guide`), el("h1", "", course.title));
    head.appendChild(el("p", "course-form-code", `Form ${sheet.code} · Version ${sheet.version} · Page ${pageNumber} of ${pages}`));
    head.appendChild(el("p", "course-document-meta", `Lessons in tonight’s questions: ${lessonIds.join(", ")}. Read the explanations and examples before trying the student worksheets.`));
    const body = pageColumns("course-guide-page-body");
    page.append(head, body, footer());
    return page;
  }

  function renderNightlyGuide(course, sheet, lessonIds, measurer) {
    // Reuse the complete lesson presentation, retaining authored examples
    // and the order of their givens, reasoning and worked figures. Ordinary
    // blocks stay together; oversized blocks use the same continuations as keys.
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
          node.dataset.lessonId = id;
          chunks.push({ node, title, continuation: true });
          group = el("section", "course-guide-chunk course-guide-takeaways");
          group.dataset.lessonId = id;
        } else group.appendChild(node);
      });
      if (group.children.length) chunks.push({ node: group, title, continuation: !group.classList.contains("course-guide-opening") });
    });
    const article = el("article", "course-document worksheet-document course-guide course-paginated-guide");
    const nodes = [];
    chunks.forEach((chunk, index) => {
      if (index && chunks[index - 1].node.classList.contains("course-guide-opening") &&
          chunks[index - 1].node.dataset.lessonId === chunk.node.dataset.lessonId) return;
      if (chunk.node.classList.contains("course-guide-opening") && chunks[index + 1]?.node.dataset.lessonId === chunk.node.dataset.lessonId) {
        chunk.node.appendChild(chunks[index + 1].node);
      }
      nodes.push(chunk.node);
    });
    paginateNodes(nodes,
      (number, total) => nightlyGuidePage(course, sheet, lessonIds, number, total), measurer, article.className)
      .forEach(page => article.appendChild(page));
    return article;
  }

  function separatorPage(component) {
    const page = el("section", "course-document worksheet-document course-packet-blank");
    page.dataset.night = component.night;
    page.dataset.component = "separator";
    if (component.worksheetVariant) page.dataset.worksheetVariant = component.worksheetVariant;
    page.append(documentLabel(`Night ${component.night}${component.worksheetVariant ? ` / Worksheet ${component.worksheetVariant}` : ""} / Separator back`), el("h1", "", "This side is intentionally blank"));
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
          components.push({ night, kind, code: sheet.code, worksheetVariant: sheet.worksheetVariant, pageCount: node.children.length, node });
        });
      });
      engine.packetPagePlan(components, { duplex: settings.duplex !== false }).forEach((component) => {
        const node = component.node;
        node.classList.add("course-packet-component");
        node.dataset.night = component.night;
        node.dataset.component = component.kind;
        if (component.worksheetVariant) node.dataset.worksheetVariant = component.worksheetVariant;
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

  function exportHtml(title, contentElement, cssText, fontLicense) {
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
    const license = doc.createElement("meta");
    license.name = "font-license";
    license.content = fontLicense || document.querySelector('meta[name="font-license"]')?.content || "";
    doc.head.appendChild(license);
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

  return { preparePrint, renderText, renderGraph, renderTable, renderGuide, renderWorksheet, renderPacket, renderNightlyPacket, exportHtml };
});
