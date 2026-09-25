// Learn pages: the strict Markdown subset that content/learn is written in.
//
// parse() turns one page into front matter and a JSON block tree, and lists
// every construct outside the subset as an error with its line number, so a
// page either means exactly what it says or fails the build. The tree holds
// data only: text stays text, links are checked targets rather than URLs to
// trust, and there is no path for markup to reach the page as HTML. Pure
// logic with no DOM access; loads in Node and as a plain browser script
// (window.LiminalLearn), where the route and link helpers serve learn.js.
//
// The subset, in full:
//   front matter   --- / key: value / --- with id, title, and on skill
//                  pages section, domain and skill
//   headings       one "# Title" first; "## Text {#anchor}" (anchor
//                  required); "### Text" with an optional {#anchor}
//   paragraphs     lines joined with spaces
//   lists          "- item" or "1. item", one level, one paragraph per item
//   tables         "| a | b |" header, a "| --- | --- |" delimiter row, rows;
//                  a pipe splits cells only with spaces on both sides, so
//                  |x − 3| stays text (or write \|)
//   preformatted   ``` fenced blocks, kept verbatim, for aligned work
//   callouts       "> **Example.** …" and following "> " lines; labels
//                  Example, Fails when, Trap, Desmos, Check, Note, Rule
//   inline         **bold**, *italic*, `code`, [text](learn:<page>#<anchor>),
//                  [text](#<anchor>), [text](https://<allowed host>/…),
//                  {{fact:<id>}}, and backslash escapes of punctuation
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalLearn = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const CALLOUT_LABELS = ["Example", "Fails when", "Trap", "Desmos", "Check", "Note", "Rule"];
  const ALLOWED_HOSTS = [
    "satsuite.collegeboard.org",
    "collegeboard.org",
    "bluebook.collegeboard.org",
    "www.desmos.com",
    "desmos.com",
  ];
  const FRONT_MATTER_KEYS = ["id", "title", "section", "domain", "skill"];

  const SEGMENT = "[a-z0-9]+(?:-[a-z0-9]+)*";
  const ANCHOR = new RegExp(`^${SEGMENT}$`);
  const PAGE_ID = new RegExp(`^${SEGMENT}(?:/${SEGMENT})*$`);
  const FACT_ID = /^[a-z0-9]+(?:[-.][a-z0-9]+)*$/;
  const LEARN_TARGET = new RegExp(`^learn:(${SEGMENT}(?:/${SEGMENT})*)(?:#(${SEGMENT}))?$`);
  const SAME_PAGE_TARGET = new RegExp(`^#(${SEGMENT})$`);

  const HEADING = /^(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/;
  const BULLET = /^-[ \t]+(.*)$/;
  const ORDERED = /^(\d{1,9})\.[ \t]+(.*)$/;
  const OTHER_MARKER = /^(?:[*+][ \t]+\S|\d{1,9}\)[ \t]+\S)/;
  const NESTED_ITEM = /^[ \t]+(?:[-*+]|\d{1,9}[.)])[ \t]+\S/;
  const RULE = /^(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;
  const SETEXT = /^=+[ \t]*$/;
  const FENCE_CLOSE = /^```[ \t]*$/;
  const CALLOUT_LABEL = new RegExp(
    `^\\*\\*(${CALLOUT_LABELS.join("|")})( [^*]*?)?[.:]?\\*\\*[.:]?(?=\\s|$)\\s*`,
  );
  // Raw HTML anywhere, even inside code, fails: a page never needs it, and
  // an autolink or entity would show as literal text anyway.
  const RAW_HTML = /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>|<!--|<[A-Za-z][A-Za-z0-9+.-]*:[^\s<>]*>/;
  const ENTITY = /&(?:[A-Za-z][A-Za-z0-9]*|#[0-9]+|#[xX][0-9A-Fa-f]+);/;
  const PUNCTUATION = /^[!-/:-@[-`{-~]$/;

  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const calloutKind = (label) => label.toLowerCase().replace(/\s+/g, "-");

  /* ------------------------------------------------------------- inline */

  // Adjacent text merges into one string; a line break inside a paragraph
  // is a space.
  function pushText(nodes, text) {
    const clean = text.replace(/[ \t]*\n[ \t]*/g, " ");
    if (!clean) return;
    if (typeof nodes[nodes.length - 1] === "string") nodes[nodes.length - 1] += clean;
    else nodes.push(clean);
  }

  // The next single "*" after `from`, stepping over "**" pairs, so italic
  // text may hold bold text.
  function closingStar(text, from) {
    for (let index = from; index < text.length; index += 1) {
      if (text[index] !== "*") continue;
      if (text[index + 1] === "*") {
        index += 1;
        continue;
      }
      return index;
    }
    return -1;
  }

  function isAllowedUrl(value) {
    if (typeof value !== "string" || /\s/.test(value)) return false;
    let url;
    try {
      url = new URL(value);
    } catch (error) {
      return false;
    }
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      ALLOWED_HOSTS.includes(url.hostname);
  }

  // A link target is a Learn page (with an optional anchor), an anchor on
  // this page, or an https URL on an allowed host; anything else is an error.
  function resolveTarget(target, pageId) {
    const learn = LEARN_TARGET.exec(target);
    if (learn) return learn[2] ? { page: learn[1], anchor: learn[2] } : { page: learn[1] };
    const local = SAME_PAGE_TARGET.exec(target);
    if (local) return { page: pageId, anchor: local[1] };
    if (/^https?:/i.test(target)) {
      if (isAllowedUrl(target)) return { url: target };
      return {
        error: `link "${target}" is not an https link to an allowed host (${ALLOWED_HOSTS.join(", ")})`,
      };
    }
    return {
      error: `link target "${target}" must be learn:<page-id>, learn:<page-id>#<anchor>, #<anchor>, or an https URL`,
    };
  }

  // ctx: { report(offset, message), fact(id, offset), link(link, offset), pageId }
  function parseInline(text, ctx, options, base) {
    const settings = options || {};
    const origin = base || 0;
    const nodes = [];
    let buffer = "";
    const flush = () => {
      pushText(nodes, buffer);
      buffer = "";
    };
    let index = 0;
    while (index < text.length) {
      const char = text[index];
      const at = origin + index;

      if (char === "\\") {
        const next = text[index + 1];
        if (next !== undefined && PUNCTUATION.test(next)) {
          buffer += next;
          index += 2;
          continue;
        }
        if (next !== undefined && /[A-Za-z]/.test(next)) {
          const command = /^\\[A-Za-z]+/.exec(text.slice(index))[0];
          ctx.report(at, `"${command}" looks like LaTeX; write math as Unicode text (x², √, π, ≤, ·)`);
          index += command.length;
          continue;
        }
        ctx.report(at, "a backslash only escapes punctuation");
        index += 1;
        continue;
      }

      if (char === "`") {
        const close = text.indexOf("`", index + 1);
        if (close < 0) {
          ctx.report(at, "unmatched ` (inline code needs a closing backtick)");
          index += 1;
          continue;
        }
        const code = text.slice(index + 1, close).replace(/\n/g, " ");
        if (!code.trim()) ctx.report(at, "empty inline code");
        flush();
        nodes.push({ type: "code", text: code });
        index = close + 1;
        continue;
      }

      if (text.startsWith("{{", index)) {
        const match = /^\{\{fact:([^{}]*)\}\}/.exec(text.slice(index));
        if (!match || !FACT_ID.test(match[1])) {
          ctx.report(at, "double braces hold only {{fact:<id>}} (lower-case letters, digits, - and .)");
          buffer += "{{";
          index += 2;
          continue;
        }
        flush();
        nodes.push({ type: "fact", id: match[1] });
        ctx.fact(match[1], at);
        index += match[0].length;
        continue;
      }

      if (text.startsWith("{#", index)) {
        ctx.report(at, "an {#anchor} belongs at the end of a ## or ### heading");
        buffer += "{#";
        index += 2;
        continue;
      }

      if (char === "!" && text[index + 1] === "[") {
        ctx.report(at, "images are not supported");
        buffer += char;
        index += 1;
        continue;
      }

      if (char === "[") {
        const close = text.indexOf("]", index + 1);
        const opens = text.indexOf("[", index + 1);
        const isLink = close > 0 && (opens < 0 || opens > close) && text[close + 1] === "(";
        if (isLink && settings.noLink) {
          ctx.report(at, "a link cannot go inside a heading or another link");
        } else if (isLink) {
          const end = text.indexOf(")", close + 2);
          if (end < 0) {
            ctx.report(at, "unclosed link target (missing \")\")");
            buffer += char;
            index += 1;
            continue;
          }
          const target = text.slice(close + 2, end).trim();
          const resolved = resolveTarget(target, ctx.pageId);
          const content = parseInline(
            text.slice(index + 1, close),
            ctx,
            Object.assign({}, settings, { noLink: true }),
            at + 1,
          );
          if (!plainText(content).trim()) ctx.report(at, "a link needs text");
          flush();
          if (resolved.error) {
            ctx.report(at, resolved.error);
            content.forEach((node) => (typeof node === "string" ? pushText(nodes, node) : nodes.push(node)));
          } else {
            nodes.push(Object.assign({ type: "link" }, resolved, { content }));
            ctx.link(resolved, at);
          }
          index = end + 1;
          continue;
        }
      }

      if (char === "*") {
        const strong = text[index + 1] === "*";
        const width = strong ? 2 : 1;
        const close = strong ? text.indexOf("**", index + 2) : closingStar(text, index + 1);
        const nested = strong ? settings.noStrong : settings.noEm;
        if (close < 0 || nested) {
          ctx.report(
            at,
            nested
              ? `${strong ? "bold" : "italic"} text cannot nest inside itself`
              : `unmatched ${strong ? "**" : "*"} (emphasis needs a closing ${strong ? "**" : "*"}; write multiplication as · or ×)`,
          );
          buffer += strong ? "**" : "*";
          index += width;
          continue;
        }
        const inner = text.slice(index + width, close);
        if (!inner.trim() || /^\s|\s$/.test(inner)) {
          ctx.report(at, "emphasis cannot be empty or start or end with a space");
        }
        const flag = strong ? { noStrong: true } : { noEm: true };
        flush();
        nodes.push({
          type: strong ? "strong" : "em",
          content: parseInline(inner, ctx, Object.assign({}, settings, flag), at + width),
        });
        index = close + width;
        continue;
      }

      buffer += char;
      index += 1;
    }
    flush();
    // Trim the edges of the whole run, not of each node.
    if (typeof nodes[0] === "string") nodes[0] = nodes[0].replace(/^\s+/, "");
    const last = nodes.length - 1;
    if (typeof nodes[last] === "string") nodes[last] = nodes[last].replace(/\s+$/, "");
    return nodes.filter((node) => node !== "");
  }

  // Parses a run of source lines as one inline flow, mapping each error back
  // to the line it came from.
  function inlineFrom(chunk, ctx, options) {
    const text = chunk.map((entry) => entry.text.trim()).join("\n");
    const lineAt = (offset) => {
      const breaks = (text.slice(0, offset).match(/\n/g) || []).length;
      return chunk[Math.min(breaks, chunk.length - 1)].line;
    };
    return parseInline(text, {
      pageId: ctx.pageId,
      report: (offset, message) => ctx.report(lineAt(offset), message),
      fact: (id, offset) => ctx.uses.facts.push({ id, line: lineAt(offset) }),
      link: (link, offset) => ctx.uses.links.push(Object.assign({}, link, { line: lineAt(offset) })),
    }, options);
  }

  function plainText(content) {
    return (content || []).map((node) => {
      if (typeof node === "string") return node;
      if (node.type === "code") return node.text;
      if (node.type === "fact") return node.text !== undefined ? node.text : `{{fact:${node.id}}}`;
      return plainText(node.content);
    }).join("");
  }

  /* ------------------------------------------------------------- blocks */

  function isDelimiterRow(text) {
    const body = text.trim();
    if (!body.includes("|") || !body.includes("-")) return false;
    const cells = body.replace(/^\|/, "").replace(/\|$/, "").split("|");
    return cells.every((cell) => /^\s*:?-+:?\s*$/.test(cell));
  }

  function isTableStart(lines, index) {
    return lines[index].text.startsWith("|") && index + 1 < lines.length &&
      isDelimiterRow(lines[index + 1].text);
  }

  // A pipe separates cells only with whitespace or a row edge on both sides
  // (the rule render.js uses for question tables), so |x − 3| stays in its
  // cell; "\|" is always a literal pipe.
  function splitRow(text) {
    let body = text.trim();
    if (body.startsWith("|")) body = body.slice(1);
    if (body.endsWith("|") && !body.endsWith("\\|")) body = body.slice(0, -1);
    const cells = [];
    let cell = "";
    for (let index = 0; index < body.length; index += 1) {
      const char = body[index];
      if (char === "\\" && body[index + 1] === "|") {
        cell += "\\|";
        index += 1;
        continue;
      }
      const before = index === 0 || /\s/.test(body[index - 1]);
      const after = index === body.length - 1 || /\s/.test(body[index + 1]);
      if (char === "|" && before && after) {
        cells.push(cell.trim());
        cell = "";
        continue;
      }
      cell += char;
    }
    cells.push(cell.trim());
    return cells;
  }

  function startsBlock(lines, index) {
    const text = lines[index].text;
    return text.startsWith("```") || text.startsWith("~~~") || HEADING.test(text) ||
      text.startsWith(">") || BULLET.test(text) || ORDERED.test(text) || isTableStart(lines, index);
  }

  function parseHeading(entry, match, ctx) {
    const level = match[1].length;
    let text = (match[2] || "").trim();
    let id = null;
    const anchor = /[ \t]*\{#([^{}]*)\}$/.exec(text);
    if (anchor) {
      id = anchor[1];
      text = text.slice(0, anchor.index).trim();
      if (!ANCHOR.test(id)) {
        ctx.report(entry.line, `anchor "{#${id}}" must be lower-case letters and digits joined by hyphens`);
      }
    }
    if (level > 3) ctx.report(entry.line, "only #, ## and ### headings are supported");
    if (!text) ctx.report(entry.line, "empty heading");
    if (level === 1 && id) ctx.report(entry.line, "the # title takes no {#anchor}");
    if (level === 2 && !id) ctx.report(entry.line, "every ## heading needs an {#anchor}");
    const block = {
      type: "heading",
      level: Math.min(level, 3),
      line: entry.line,
      content: inlineFrom([{ text, line: entry.line }], ctx, { noLink: true }),
    };
    if (id) block.id = id;
    return block;
  }

  function parseFence(lines, index, ctx, blocks) {
    const open = lines[index];
    const info = open.text.slice(3).trim();
    if (info && info !== "text") {
      ctx.report(open.line, `a \`\`\` block takes no language ("${info}"); write math as plain Unicode text`);
    }
    const body = [];
    let cursor = index + 1;
    while (cursor < lines.length && !FENCE_CLOSE.test(lines[cursor].text)) {
      body.push(lines[cursor]);
      cursor += 1;
    }
    if (cursor >= lines.length) ctx.report(open.line, "``` block is never closed");
    body.forEach((entry) => {
      if (entry.text.includes("{{")) ctx.report(entry.line, "{{fact:…}} is not supported inside a ``` block");
    });
    if (!body.some((entry) => entry.text.trim())) ctx.report(open.line, "empty ``` block");
    blocks.push({ type: "pre", line: open.line, text: body.map((entry) => entry.text.replace(/\s+$/, "")).join("\n") });
    return cursor + 1;
  }

  function parseList(lines, index, ctx, blocks) {
    const first = lines[index];
    const ordered = ORDERED.test(first.text);
    const own = ordered ? ORDERED : BULLET;
    const other = ordered ? BULLET : ORDERED;
    const items = [];
    let cursor = index;
    while (cursor < lines.length) {
      const entry = lines[cursor];
      if (!entry.text.trim()) {
        // A blank line ends the list unless the next item of the same kind
        // follows it.
        let next = cursor + 1;
        while (next < lines.length && !lines[next].text.trim()) next += 1;
        if (next < lines.length && own.test(lines[next].text)) {
          cursor = next;
          continue;
        }
        break;
      }
      const item = own.exec(entry.text);
      if (item) {
        const text = ordered ? item[2] : item[1];
        if (!text.trim()) ctx.report(entry.line, "empty list item");
        items.push([{ text, line: entry.line }]);
        cursor += 1;
        continue;
      }
      if (other.test(entry.text)) break;
      if (NESTED_ITEM.test(entry.text)) {
        ctx.report(entry.line, "lists are one level deep; nested items are not supported");
        cursor += 1;
        continue;
      }
      if (/^[ \t]*```/.test(entry.text)) {
        ctx.report(entry.line, "a ``` block cannot go inside a list item; end the list first");
        break;
      }
      if (startsBlock(lines, cursor)) break;
      // An indented or unindented continuation of the item's text.
      items[items.length - 1].push(entry);
      cursor += 1;
    }
    const block = {
      type: "list",
      ordered,
      line: first.line,
      items: items.map((chunk) => inlineFrom(chunk, ctx)),
    };
    const start = ordered ? Number(ORDERED.exec(first.text)[1]) : 1;
    if (start !== 1) block.start = start;
    blocks.push(block);
    return cursor;
  }

  function parseTable(lines, index, ctx, blocks) {
    const headEntry = lines[index];
    const head = splitRow(headEntry.text);
    const delimiter = lines[index + 1].text.trim().replace(/^\|/, "").replace(/\|$/, "").split("|")
      .map((cell) => cell.trim());
    if (delimiter.length !== head.length) {
      ctx.report(lines[index + 1].line, `the delimiter row has ${delimiter.length} cells; the header has ${head.length}`);
    }
    const align = delimiter.map((cell) => {
      if (cell.startsWith(":") && cell.endsWith(":")) return "center";
      if (cell.endsWith(":")) return "right";
      if (cell.startsWith(":")) return "left";
      return null;
    });
    const cell = (text, line) => inlineFrom([{ text, line }], ctx);
    const rows = [];
    let cursor = index + 2;
    while (cursor < lines.length && lines[cursor].text.startsWith("|")) {
      const entry = lines[cursor];
      const cells = splitRow(entry.text);
      if (cells.length !== head.length) {
        ctx.report(entry.line, `this row has ${cells.length} cells; the header has ${head.length} (put a space on both sides of each separating |)`);
      }
      rows.push(cells.map((text) => cell(text, entry.line)));
      cursor += 1;
    }
    if (!rows.length) ctx.report(headEntry.line, "a table needs at least one row under its delimiter row");
    const block = {
      type: "table",
      line: headEntry.line,
      head: head.map((text) => cell(text, headEntry.line)),
      rows,
    };
    if (align.some(Boolean)) block.align = align.slice(0, head.length);
    blocks.push(block);
    return cursor;
  }

  function parseCallout(lines, index, ctx, blocks) {
    const inner = [];
    let cursor = index;
    while (cursor < lines.length && lines[cursor].text.startsWith(">")) {
      inner.push({ text: lines[cursor].text.replace(/^> ?/, ""), line: lines[cursor].line });
      cursor += 1;
    }
    if (cursor < lines.length && lines[cursor].text.trim()) {
      ctx.report(lines[cursor].line, "every line of a callout starts with >; leave a blank line after a callout");
    }
    const firstIndex = inner.findIndex((entry) => entry.text.trim());
    if (firstIndex < 0) {
      ctx.report(lines[index].line, "empty callout");
      return cursor;
    }
    const first = inner[firstIndex];
    const opening = first.text.trim();
    const label = CALLOUT_LABEL.exec(opening);
    // A label line inside a callout means two callouts were run together;
    // the second would render as a bold line inside the first.
    inner.slice(firstIndex + 1).forEach((entry) => {
      if (CALLOUT_LABEL.test(entry.text.trim())) {
        ctx.report(entry.line, "a new callout starts after a blank line with no >; this label would sit inside the callout above");
      }
    });
    if (!label) {
      ctx.report(
        first.line,
        `a > block is a callout and starts with a label: ${CALLOUT_LABELS.map((name) => `**${name}.**`).join(", ")}`,
      );
      return cursor;
    }
    const body = parseBlocks(
      [{ text: opening.slice(label[0].length), line: first.line }].concat(inner.slice(firstIndex + 1)),
      ctx,
      true,
    );
    if (!body.length) ctx.report(first.line, "a callout needs text after its label");
    blocks.push({
      type: "callout",
      kind: calloutKind(label[1]),
      label: `${label[1]}${label[2] || ""}`.trim(),
      line: first.line,
      blocks: body,
    });
    return cursor;
  }

  function parseParagraph(lines, index, ctx, blocks) {
    const chunk = [];
    let cursor = index;
    while (cursor < lines.length && lines[cursor].text.trim()) {
      if (cursor > index && startsBlock(lines, cursor)) break;
      const text = lines[cursor].text;
      if (cursor > index && (SETEXT.test(text) || RULE.test(text))) {
        ctx.report(lines[cursor].line, "underlined headings and horizontal rules are not supported");
        cursor += 1;
        continue;
      }
      if (/^\|\s.*\s\|$/.test(text.trim()) && cursor === index) {
        ctx.report(lines[cursor].line, "a table needs a | --- | delimiter row under its header row");
      }
      chunk.push(lines[cursor]);
      cursor += 1;
    }
    blocks.push({ type: "paragraph", line: lines[index].line, content: inlineFrom(chunk, ctx) });
    return cursor;
  }

  function parseBlocks(lines, ctx, inCallout) {
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
      const entry = lines[index];
      const text = entry.text;
      if (!text.trim()) {
        index += 1;
        continue;
      }
      if (/^[ \t]/.test(text)) {
        ctx.report(entry.line, "a block cannot start indented (no indented code or nested lists; use ``` for aligned work)");
        while (index < lines.length && lines[index].text.trim()) index += 1;
        continue;
      }
      if (text.startsWith("```")) {
        index = parseFence(lines, index, ctx, blocks);
        continue;
      }
      if (text.startsWith("~~~")) {
        ctx.report(entry.line, "fence preformatted text with ```, not ~~~");
        index += 1;
        continue;
      }
      const heading = HEADING.exec(text);
      if (heading) {
        if (inCallout) ctx.report(entry.line, "a heading cannot go inside a callout");
        else blocks.push(parseHeading(entry, heading, ctx));
        index += 1;
        continue;
      }
      if (text.startsWith(">")) {
        if (inCallout) {
          ctx.report(entry.line, "callouts cannot nest");
          index += 1;
          continue;
        }
        index = parseCallout(lines, index, ctx, blocks);
        continue;
      }
      if (BULLET.test(text) || ORDERED.test(text)) {
        index = parseList(lines, index, ctx, blocks);
        continue;
      }
      if (OTHER_MARKER.test(text)) {
        ctx.report(entry.line, 'list items start with "- " or "1. "');
        index += 1;
        continue;
      }
      if (RULE.test(text)) {
        ctx.report(entry.line, "horizontal rules are not supported");
        index += 1;
        continue;
      }
      if (isTableStart(lines, index)) {
        index = parseTable(lines, index, ctx, blocks);
        continue;
      }
      index = parseParagraph(lines, index, ctx, blocks);
    }
    return blocks;
  }

  /* ------------------------------------------------------- front matter */

  function parseFrontMatter(lines, report) {
    const meta = {};
    if (!lines.length || lines[0].text.trim() !== "---") {
      report(1, "a page starts with front matter between --- lines");
      return { meta, next: 0 };
    }
    let index = 1;
    for (; index < lines.length; index += 1) {
      const { text, line } = lines[index];
      if (text.trim() === "---") break;
      if (!text.trim() || /^\s*#/.test(text)) continue;
      const match = /^([A-Za-z][\w-]*):(?:[ \t]+(.*))?$/.exec(text);
      if (!match) {
        report(line, 'front matter lines are "key: value"');
        continue;
      }
      const key = match[1];
      let value = (match[2] || "").trim();
      const quoted = /^"(.*)"$/.exec(value) || /^'(.*)'$/.exec(value);
      value = quoted ? quoted[1] : value.replace(/\s+#.*$/, "");
      if (!FRONT_MATTER_KEYS.includes(key)) {
        report(line, `unknown front matter key "${key}" (allowed: ${FRONT_MATTER_KEYS.join(", ")})`);
      } else if (hasOwn(meta, key)) {
        report(line, `front matter "${key}" appears twice`);
      } else if (!value) {
        report(line, `front matter "${key}" is empty`);
      } else {
        if (/[{}*`[\]]/.test(value) && key === "title") report(line, "the title is plain text: no markup or facts");
        meta[key] = value;
      }
    }
    if (index >= lines.length) {
      report(1, "front matter is never closed with ---");
      return { meta, next: lines.length };
    }
    if (!meta.id) report(1, 'front matter needs "id"');
    else if (!PAGE_ID.test(meta.id)) report(1, `id "${meta.id}" must be lower-case path segments joined by /`);
    if (!meta.title) report(1, 'front matter needs "title"');
    return { meta, next: index + 1 };
  }

  /* -------------------------------------------------------------- parse */

  // Returns { meta, blocks, errors: [{ line, message }], facts: [{ id, line }],
  // links: [{ page, anchor?, line } | { url, line }] }. Every block keeps
  // its source line (the build drops them); inline content is an array of
  // strings and { type: strong | em | code | link | fact } nodes.
  function parse(source) {
    const errors = [];
    const report = (line, message) => errors.push({ line, message });
    const lines = String(source).replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n")
      .map((text, index) => ({ text, line: index + 1 }));
    const front = parseFrontMatter(lines, report);

    lines.slice(1).forEach((entry) => {
      const html = RAW_HTML.exec(entry.text);
      if (html) report(entry.line, `raw HTML is not allowed ("${html[0]}"); write plain text`);
      const entity = ENTITY.exec(entry.text);
      if (entity) report(entry.line, `HTML entities are not allowed ("${entity[0]}"); type the character itself`);
      if (entry.text.includes("\t") && entry.line > front.next) {
        report(entry.line, "use spaces, not tabs");
      }
    });

    const ctx = { report, uses: { facts: [], links: [] }, pageId: front.meta.id || null };
    const blocks = parseBlocks(lines.slice(front.next), ctx, false);

    const headings = blocks.filter((block) => block.type === "heading");
    if (!blocks.length || blocks[0].type !== "heading" || blocks[0].level !== 1) {
      report(blocks.length ? blocks[0].line : lines.length, 'the page body starts with one "# Title" heading');
    }
    headings.filter((heading) => heading.level === 1).slice(1).forEach((heading) => {
      report(heading.line, 'a page has one "#" heading; use ## for sections');
    });
    const seen = new Set();
    headings.filter((heading) => heading.id).forEach((heading) => {
      if (seen.has(heading.id)) report(heading.line, `anchor "{#${heading.id}}" is used twice on this page`);
      seen.add(heading.id);
    });

    errors.sort((a, b) => a.line - b.line);
    return { meta: front.meta, blocks, errors, facts: ctx.uses.facts, links: ctx.uses.links };
  }

  /* ------------------------------------------------------------ helpers */

  // Calls visit(node) for every inline node object (not plain strings) in
  // a block tree, depth first.
  function walkInline(blocks, visit) {
    const inline = (content) => (content || []).forEach((node) => {
      if (typeof node === "string") return;
      visit(node);
      if (node.content) inline(node.content);
    });
    (blocks || []).forEach((block) => {
      if (block.content) inline(block.content);
      if (block.items) block.items.forEach(inline);
      if (block.head) block.head.forEach(inline);
      if (block.rows) block.rows.forEach((row) => row.forEach(inline));
      if (block.blocks) walkInline(block.blocks, visit);
    });
  }

  // Anchors on a page, with the heading level each is on.
  function anchors(blocks) {
    const found = new Map();
    (blocks || []).forEach((block) => {
      if (block.type === "heading" && block.id) found.set(block.id, block.level);
    });
    return found;
  }

  // The ## sections of a page, in order, for its contents list.
  function outline(blocks) {
    return (blocks || [])
      .filter((block) => block.type === "heading" && block.level === 2 && block.id)
      .map((block) => ({ id: block.id, text: plainText(block.content) }));
  }

  // Each ## section's blocks, up to the next ## heading.
  function sections(blocks) {
    const found = [];
    let current = null;
    (blocks || []).forEach((block) => {
      if (block.type === "heading" && block.level <= 2) {
        current = block.level === 2 ? { heading: block, blocks: [] } : null;
        if (current) found.push(current);
        return;
      }
      if (current) current.blocks.push(block);
    });
    return found;
  }

  /* ---------------------------------------------------- routes and links */

  function pageHash(pageId, anchor) {
    return `#${pageId}${anchor ? `/${anchor}` : ""}`;
  }

  // The address other pages use for a Learn page or one of its sections.
  function learnHref(pageId, anchor) {
    return `learn.html${pageHash(pageId, anchor)}`;
  }

  function practiceHref(sectionKey, skillSlug) {
    return `index.html#practice/${sectionKey}/${skillSlug}`;
  }

  // "#<pageId>" or "#<pageId>/<anchor>"; an empty hash is the index.
  function route(hash, pages) {
    let raw = String(hash || "").replace(/^#/, "");
    try {
      raw = decodeURIComponent(raw);
    } catch (error) {
      /* a malformed escape is matched as written */
    }
    raw = raw.replace(/^\/+|\/+$/g, "");
    if (!raw) return { view: "index" };
    const known = (id) => Boolean(pages) && hasOwn(pages, id);
    if (known(raw)) return { view: "page", id: raw, anchor: null };
    const cut = raw.lastIndexOf("/");
    if (cut > 0 && known(raw.slice(0, cut))) {
      return { view: "page", id: raw.slice(0, cut), anchor: raw.slice(cut + 1) };
    }
    return { view: "missing", path: raw };
  }

  // Where a link node points from within learn.html, or null when it must
  // render as text (a URL that fails the allow-list is never followed).
  function linkHref(node) {
    if (node.url !== undefined) return isAllowedUrl(node.url) ? node.url : null;
    if (typeof node.page === "string" && PAGE_ID.test(node.page) &&
      (!node.anchor || ANCHOR.test(node.anchor))) {
      return pageHash(node.page, node.anchor);
    }
    return null;
  }

  return {
    CALLOUT_LABELS,
    ALLOWED_HOSTS,
    FRONT_MATTER_KEYS,
    ANCHOR,
    PAGE_ID,
    FACT_ID,
    parse,
    parseInline: (text, pageId) => {
      const errors = [];
      const content = parseInline(String(text), {
        pageId: pageId || null,
        report: (offset, message) => errors.push({ offset, message }),
        fact: () => {},
        link: () => {},
      });
      return { content, errors };
    },
    plainText,
    walkInline,
    anchors,
    outline,
    sections,
    isAllowedUrl,
    pageHash,
    learnHref,
    practiceHref,
    route,
    linkHref,
  };
});
