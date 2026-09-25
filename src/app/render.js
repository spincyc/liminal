(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalRender = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Renders question content for the digital test mode. Content strings are
  // data: text always goes in through textContent, pipe rows become real
  // tables, and SVG figures are parsed as XML and rebuilt from an allow-list
  // rather than injected. The parsing helpers are pure and run in Node; the
  // render* functions need a DOM.

  const SVG_NS = "http://www.w3.org/2000/svg";

  /* ------------------------------------------------------------ text blocks */

  // A pipe separates cells only with whitespace or a line edge on both
  // sides, so an absolute value such as |x - 3| stays prose.
  const PIPE = /(^|\s)\|(\s|$)/;

  function isPipeRow(line) {
    const text = String(line).trim();
    if (!PIPE.test(text)) return false;
    return splitCells(text).length >= 2;
  }

  function splitCells(line) {
    let text = String(line).trim();
    // Markdown-style rows carry a pipe at both ends.
    if (text.length > 1 && text.startsWith("|") && text.endsWith("|")) {
      text = text.slice(1, -1);
    }
    return text.split(/\s*\|\s*/).map((cell) => cell.trim());
  }

  function isSeparatorRow(line) {
    return /^[\s|:-]+$/.test(line) && line.includes("-") && line.includes("|");
  }

  const BULLET = /^\s*[•▪◦·*-]\s+/;
  const PASSAGE_LABEL = /^(Text|Passage)\s+(\d+|[A-Z])$/i;

  function tableBlock(rows) {
    const cells = rows.map(splitCells);
    const width = Math.max(...cells.map((row) => row.length));
    const padded = cells.map((row) => row.concat(Array(width - row.length).fill("")));
    return {
      kind: "table",
      header: padded[0],
      rows: padded.slice(1),
      rowHeaders: padded[0][0] === "",
    };
  }

  // Splits one blank-line-separated chunk into runs of table rows, bullet
  // lists, labels, and prose lines.
  function chunkBlocks(lines) {
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
      const line = lines[index];
      if (isPipeRow(line)) {
        const run = [];
        while (index < lines.length && (isPipeRow(lines[index]) || isSeparatorRow(lines[index]) ||
          (run.length && PIPE.test(lines[index].trim())))) {
          if (!isSeparatorRow(lines[index])) run.push(lines[index]);
          index += 1;
        }
        if (run.length >= 2) blocks.push(tableBlock(run));
        else blocks.push({ kind: "paragraph", lines: run });
        continue;
      }
      if (BULLET.test(line)) {
        const items = [];
        while (index < lines.length && BULLET.test(lines[index])) {
          items.push(lines[index].replace(BULLET, "").trim());
          index += 1;
        }
        blocks.push({ kind: "list", items });
        continue;
      }
      if (PASSAGE_LABEL.test(line.trim())) {
        blocks.push({ kind: "heading", text: line.trim() });
        index += 1;
        continue;
      }
      const prose = [];
      while (
        index < lines.length &&
        !isPipeRow(lines[index]) &&
        !BULLET.test(lines[index]) &&
        !PASSAGE_LABEL.test(lines[index].trim())
      ) {
        prose.push(lines[index]);
        index += 1;
      }
      blocks.push({ kind: "paragraph", lines: prose });
    }
    return blocks;
  }

  function isTitleLine(chunk) {
    const text = chunk.trim();
    return !text.includes("\n") && text.length <= 70 && /\s/.test(text) &&
      !/[.!?:;,"'”’)\]]$/.test(text) && !isPipeRow(text);
  }

  // Parses stimulus or stem text into blocks:
  //   { kind: "paragraph", lines: [..] }       prose; single newlines kept
  //   { kind: "table", header, rows, rowHeaders }
  //   { kind: "list", items }
  //   { kind: "heading", text }                "Text 1", a passage title
  //   { kind: "equations", lines }             one equation per line
  // options.type "equations" treats every line as an equation; options.titles
  // lets a short unpunctuated first line become the passage title.
  function parseBlocks(text, options) {
    const settings = options || {};
    const source = String(text === null || text === undefined ? "" : text)
      .replace(/\r\n?/g, "\n");
    const chunks = source
      .split(/\n[ \t]*\n/)
      .map((chunk) => chunk.replace(/^\n+|\n+$/g, ""))
      .filter((chunk) => chunk.trim() !== "");
    if (settings.type === "equations") {
      const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);
      return lines.length ? [{ kind: "equations", lines }] : [];
    }
    const blocks = [];
    chunks.forEach((chunk, index) => {
      if (settings.titles && index === 0 && chunks.length > 1 && isTitleLine(chunk)) {
        blocks.push({ kind: "heading", text: chunk.trim(), title: true });
        return;
      }
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");
      blocks.push(...chunkBlocks(lines));
    });
    return blocks;
  }

  // Some Reading and Writing records carry the passage inside the stem, with
  // the question as the last paragraph. Returns { passage, question }.
  function splitStemPassage(stem) {
    const text = String(stem || "").replace(/\r\n?/g, "\n").trim();
    const cut = text.lastIndexOf("\n\n");
    if (cut < 0) return { passage: "", question: text };
    return { passage: text.slice(0, cut).trim(), question: text.slice(cut + 2).trim() };
  }

  // ACT English marks underlined portions as {N text} and numbered points as
  // {N}. Returns plain and marked segments.
  function parseUnderlines(text) {
    const source = String(text || "");
    const pattern = /\{(\d{1,3})(?: ([^{}]+))?\}/g;
    const segments = [];
    let last = 0;
    let match;
    while ((match = pattern.exec(source))) {
      if (match.index > last) segments.push({ text: source.slice(last, match.index) });
      if (match[2]) segments.push({ text: match[2], underline: Number(match[1]) });
      else segments.push({ marker: Number(match[1]) });
      last = pattern.lastIndex;
    }
    if (last < source.length) segments.push({ text: source.slice(last) });
    return segments;
  }

  /* ------------------------------------------------------------ SVG figures */

  const SVG_ELEMENTS = new Set([
    "svg", "g", "line", "polyline", "polygon", "circle", "ellipse", "rect",
    "path", "text", "tspan",
  ]);

  const NUMBER = "-?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[-+]?\\d+)?";
  const LENGTH = new RegExp(`^${NUMBER}(?:px|em|ex|%)?$`, "i");
  const NUMBER_LIST = new RegExp(`^\\s*${NUMBER}(?:[\\s,]+${NUMBER})*\\s*$`, "i");
  const VIEWBOX = new RegExp(`^\\s*${NUMBER}(?:[\\s,]+${NUMBER}){3}\\s*$`, "i");
  const POINTS = /^[\d\s.,eE+-]*$/;
  const PATH = /^[MmLlHhVvCcSsQqTtAaZz\d\s.,eE+-]*$/;
  const PAINT = /^(none|currentColor|transparent|#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\(\s*[\d.%\s,]+\))$/i;
  const DASH = /^(none|[\d\s.,]+)$/;
  const FONT_FAMILY = /^[\w\s,'"-]{1,100}$/;
  const OPACITY = /^(0|1|0?\.\d+|1\.0+)$/;
  const TRANSFORM = new RegExp(
    `^\\s*(?:(?:matrix|translate|scale|rotate|skewX|skewY)\\s*\\([\\d\\s.,eE+-]*\\)[\\s,]*)+$`,
  );

  function oneOf(values) {
    const allowed = new Set(values);
    return (value) => allowed.has(value);
  }

  function matches(pattern) {
    return (value) => pattern.test(value);
  }

  const ATTRIBUTE_RULES = {
    x: matches(NUMBER_LIST),
    y: matches(NUMBER_LIST),
    dx: matches(NUMBER_LIST),
    dy: matches(NUMBER_LIST),
    x1: matches(LENGTH),
    y1: matches(LENGTH),
    x2: matches(LENGTH),
    y2: matches(LENGTH),
    cx: matches(LENGTH),
    cy: matches(LENGTH),
    r: matches(LENGTH),
    rx: matches(LENGTH),
    ry: matches(LENGTH),
    width: matches(LENGTH),
    height: matches(LENGTH),
    points: matches(POINTS),
    d: matches(PATH),
    viewBox: matches(VIEWBOX),
    fill: matches(PAINT),
    stroke: matches(PAINT),
    "stroke-width": matches(LENGTH),
    "stroke-dasharray": matches(DASH),
    "stroke-linecap": oneOf(["butt", "round", "square"]),
    "stroke-linejoin": oneOf(["miter", "round", "bevel"]),
    "font-size": matches(LENGTH),
    "font-family": matches(FONT_FAMILY),
    "font-style": oneOf(["normal", "italic", "oblique"]),
    "font-weight": oneOf(["normal", "bold", "bolder", "lighter", "400", "500", "600", "700"]),
    "text-anchor": oneOf(["start", "middle", "end"]),
    "dominant-baseline": oneOf([
      "auto", "middle", "central", "hanging", "alphabetic", "mathematical",
      "ideographic", "text-before-edge", "text-after-edge",
    ]),
    transform: matches(TRANSFORM),
    opacity: matches(OPACITY),
    "fill-opacity": matches(OPACITY),
    "stroke-opacity": matches(OPACITY),
  };

  const MAX_NODES = 4000;
  const MAX_DEPTH = 24;

  // Sanitizes an abstract node tree:
  //   element: { name, namespace?, attributes: [{ name, value, namespace? }], children }
  //   text:    { text }
  // Keeps only allow-listed SVG elements and attributes with well-formed
  // values; drops scripts, event handlers, links, styles, and anything
  // namespaced. Text survives only inside <text> and <tspan>. Returns the
  // clean tree, or null when the root is not an <svg>.
  function sanitizeSvgTree(tree) {
    let budget = MAX_NODES;
    function clean(node, depth, inText) {
      if (!node || budget <= 0 || depth > MAX_DEPTH) return null;
      budget -= 1;
      if (typeof node.text === "string") {
        return inText ? { text: node.text } : null;
      }
      const name = String(node.name || "");
      if (!SVG_ELEMENTS.has(name)) return null;
      if (node.namespace && node.namespace !== SVG_NS) return null;
      const attributes = [];
      (node.attributes || []).forEach((attribute) => {
        const attrName = String(attribute.name || "");
        if (attribute.namespace) return;
        if (!Object.prototype.hasOwnProperty.call(ATTRIBUTE_RULES, attrName)) return;
        const value = String(attribute.value === undefined ? "" : attribute.value).trim();
        if (!value || value.length > 5000) return;
        if (/url\s*\(|javascript:|expression\s*\(|[<>]/i.test(value)) return;
        if (!ATTRIBUTE_RULES[attrName](value)) return;
        attributes.push({ name: attrName, value });
      });
      const textual = name === "text" || name === "tspan";
      const children = [];
      (node.children || []).forEach((child) => {
        const kept = clean(child, depth + 1, textual);
        if (kept) children.push(kept);
      });
      return { name, attributes, children };
    }
    if (!tree || tree.name !== "svg") return null;
    return clean(tree, 0, false);
  }

  function attributeValue(node, name) {
    const found = (node.attributes || []).find((attribute) => attribute.name === name);
    return found ? found.value : null;
  }

  // The figure's intrinsic size from viewBox, or from width and height.
  function svgSize(tree) {
    const viewBox = attributeValue(tree, "viewBox");
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        return { width: parts[2], height: parts[3], viewBox: parts.join(" ") };
      }
    }
    const width = parseFloat(attributeValue(tree, "width"));
    const height = parseFloat(attributeValue(tree, "height"));
    if (width > 0 && height > 0 && !/%/.test(attributeValue(tree, "width") || "")) {
      return { width, height, viewBox: `0 0 ${width} ${height}` };
    }
    return null;
  }

  /* ---------------------------------------------------------------- DOM */

  function doc() {
    if (typeof document === "undefined") throw new Error("LiminalRender needs a DOM.");
    return document;
  }

  function el(tag, className, text) {
    const node = doc().createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function appendLines(target, lines, options) {
    lines.forEach((line, index) => {
      if (index) target.appendChild(doc().createElement("br"));
      appendInline(target, line, options);
    });
  }

  function appendInline(target, text, options) {
    if (!(options && options.underlines)) {
      target.appendChild(doc().createTextNode(text));
      return;
    }
    parseUnderlines(text).forEach((segment) => {
      if (segment.marker !== undefined) {
        const marker = el("span", "lm-ul-marker", segment.marker);
        marker.dataset.n = String(segment.marker);
        marker.setAttribute("aria-label", `Point ${segment.marker}`);
        target.appendChild(marker);
      } else if (segment.underline !== undefined) {
        const wrap = el("span", "lm-ul");
        wrap.dataset.n = String(segment.underline);
        const underlined = el("u", "", segment.text);
        const number = el("span", "lm-ul-n", segment.underline);
        number.setAttribute("aria-label", `(underlined portion ${segment.underline})`);
        wrap.append(underlined, number);
        target.appendChild(wrap);
      } else {
        target.appendChild(doc().createTextNode(segment.text));
      }
    });
  }

  function renderTable(block) {
    const wrap = el("div", "lm-table-wrap");
    const table = el("table", "lm-table");
    const head = el("thead");
    const headRow = el("tr");
    block.header.forEach((cell, index) => {
      const th = el("th", "", cell);
      th.scope = "col";
      if (index === 0 && block.rowHeaders) th.setAttribute("aria-hidden", "true");
      headRow.appendChild(th);
    });
    head.appendChild(headRow);
    const body = el("tbody");
    block.rows.forEach((row) => {
      const tr = el("tr");
      row.forEach((cell, index) => {
        const isHeader = block.rowHeaders && index === 0;
        const td = el(isHeader ? "th" : "td", "", cell);
        if (isHeader) td.scope = "row";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    table.append(head, body);
    wrap.appendChild(table);
    return wrap;
  }

  // Renders parsed blocks into a container element.
  function renderBlocks(blocks, options) {
    const settings = options || {};
    const container = el("div", settings.className || "lm-rich");
    blocks.forEach((block) => {
      if (block.kind === "table") {
        container.appendChild(renderTable(block));
      } else if (block.kind === "list") {
        const list = el("ul", "lm-list");
        block.items.forEach((item) => {
          const li = el("li");
          appendInline(li, item, settings);
          list.appendChild(li);
        });
        container.appendChild(list);
      } else if (block.kind === "heading") {
        container.appendChild(el(block.title ? "h3" : "p", block.title
          ? "lm-passage-title"
          : "lm-passage-label", block.text));
      } else if (block.kind === "equations") {
        const group = el("div", "lm-equations");
        block.lines.forEach((line) => group.appendChild(el("p", "lm-equation", line)));
        container.appendChild(group);
      } else {
        const paragraph = el("p");
        appendLines(paragraph, block.lines, settings);
        container.appendChild(paragraph);
      }
    });
    return container;
  }

  // Plain question text (stems, explanations): paragraphs on blank lines,
  // tables where pipe rows appear.
  function renderText(text, options) {
    return renderBlocks(parseBlocks(text), options);
  }

  // A stimulus object { type, content }.
  function renderStimulus(stimulus, options) {
    const settings = Object.assign({}, options || {});
    if (!stimulus || !stimulus.content) return null;
    const blocks = parseBlocks(stimulus.content, {
      type: stimulus.type,
      titles: settings.titles !== false,
    });
    settings.className = `lm-stimulus lm-stimulus-${String(stimulus.type || "text")
      .replace(/[^a-z0-9-]/gi, "")}`;
    return renderBlocks(blocks, settings);
  }

  // Converts a parsed DOM node into the abstract tree sanitizeSvgTree takes.
  function domToTree(node) {
    if (node.nodeType === 3 || node.nodeType === 4) return { text: node.nodeValue || "" };
    if (node.nodeType !== 1) return null;
    return {
      name: node.localName,
      namespace: node.namespaceURI || null,
      attributes: Array.from(node.attributes).map((attribute) => ({
        name: attribute.name,
        namespace: attribute.namespaceURI || null,
        value: attribute.value,
      })),
      children: Array.from(node.childNodes).map(domToTree).filter(Boolean),
    };
  }

  function treeToSvg(tree) {
    const document = doc();
    if (typeof tree.text === "string") return document.createTextNode(tree.text);
    const node = document.createElementNS(SVG_NS, tree.name);
    tree.attributes.forEach((attribute) => node.setAttribute(attribute.name, attribute.value));
    tree.children.forEach((child) => node.appendChild(treeToSvg(child)));
    return node;
  }

  // Parses an SVG string as XML and rebuilds it from the allow-list.
  // Returns an <svg> element, or null when the markup is unusable.
  function buildSvg(markup) {
    if (typeof DOMParser === "undefined" || !markup) return null;
    let parsed;
    try {
      parsed = new DOMParser().parseFromString(String(markup), "image/svg+xml");
    } catch (error) {
      return null;
    }
    const rootNode = parsed && parsed.documentElement;
    if (!rootNode || rootNode.getElementsByTagName("parsererror").length ||
        rootNode.localName === "parsererror") {
      return null;
    }
    const clean = sanitizeSvgTree(domToTree(rootNode));
    if (!clean) return null;
    const size = svgSize(clean);
    clean.attributes = clean.attributes.filter((attribute) =>
      attribute.name !== "width" && attribute.name !== "height" && attribute.name !== "viewBox"
    );
    if (size) clean.attributes.push({ name: "viewBox", value: size.viewBox });
    const svg = treeToSvg(clean);
    svg.setAttribute("focusable", "false");
    if (size) {
      svg.style.maxWidth = `${Math.round(Math.min(Math.max(size.width * 1.25, 220), 560))}px`;
      svg.style.aspectRatio = `${size.width} / ${size.height}`;
    }
    return svg;
  }

  // A figure { svg, alt, notToScale }: the drawing, its accessible name, and
  // the not-to-scale note beneath it when flagged.
  function renderFigure(figure) {
    if (!figure || !figure.svg) return null;
    const wrap = el("figure", "lm-figure");
    const alt = String(figure.alt || "Figure").trim() || "Figure";
    const svg = buildSvg(figure.svg);
    if (svg) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", alt);
      wrap.appendChild(svg);
    } else {
      wrap.appendChild(el("p", "lm-figure-fallback", `Figure: ${alt}`));
    }
    if (figure.notToScale) {
      wrap.appendChild(el("figcaption", "lm-figure-note", "Note: Figure not drawn to scale."));
    }
    return wrap;
  }

  return {
    SVG_NS,
    SVG_ELEMENTS: [...SVG_ELEMENTS],
    SVG_ATTRIBUTES: Object.keys(ATTRIBUTE_RULES),
    // Pure helpers
    isPipeRow,
    splitCells,
    parseBlocks,
    parseUnderlines,
    splitStemPassage,
    sanitizeSvgTree,
    svgSize,
    // DOM
    renderBlocks,
    renderText,
    renderStimulus,
    renderFigure,
    buildSvg,
  };
});
