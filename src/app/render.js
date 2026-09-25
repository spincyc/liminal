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

  /* ------------------------------------------------------------- math text */

  // Math text is typed in plain notation: x^2, x^(3/5), (x + 1)/(x − 2),
  // √(x + 4), ⁵√(x⁶). mathTokens reads that notation and returns a node tree
  // the DOM renderer draws as a stacked fraction, a raised exponent, or a
  // radical with an overline:
  //   { type: "text", text }
  //   { type: "sup", children, simple }       an exponent written with ^
  //   { type: "frac", num, den, inline? }     a/b; inline (a slash) in exponents
  //   { type: "root", index, children }       index null, "3", "4", "5", "n"
  //   { type: "fence", open, close, children } brackets around a stacked fraction
  // It only typesets what is unambiguous. Anything else stays text: words
  // and units (km/h, miles/hour, and/or, m/s), dates (9/25/2026), money
  // ($3/4), 2/3x (is x in the denominator?), and Unicode superscripts that
  // are already in the text.

  const MATH_TOKEN = new RegExp([
    "(?<num>\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?|\\.\\d+)",
    "(?<sups>[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ]+)",
    "(?<word>[\\p{Lu}\\p{Ll}\\p{Lt}\\p{Lo}]+)",
    "(?<root>[√∛∜])",
    "(?<space>\\s+)",
    "(?<other>[\\s\\S])",
  ].join("|"), "gu");

  const BRACKETS = { "(": ")", "[": "]" };
  const CLOSERS = new Set([")", "]"]);
  const MINUS_SIGNS = new Set(["−", "-"]);
  const GREEK = /^[\u0370-\u03ff]+$/; // Greek letters (π, θ) are not Latin words
  // Function names that may stand before a bracket in an operand: f(5)/f(3).
  const FUNCTION_LETTERS = new Set(["f", "g", "h", "k", "p", "q"]);
  const FUNCTION_WORDS = new Set(["sin", "cos", "tan", "log", "ln"]);
  // A number directly followed by these is an ordinal (3rd), not 3·r·d.
  const ORDINALS = new Set(["st", "nd", "rd", "th"]);
  // Unit pairs such as 20 m/s or 3,600 s/h are rates, not fractions.
  const UNITS = new Set([
    "m", "km", "cm", "mm", "mi", "ft", "in", "yd", "g", "kg", "mg", "lb", "lbs",
    "oz", "s", "sec", "min", "h", "hr", "hrs", "L", "mL", "gal", "qt",
  ]);
  const NOT_FRACTIONS = new Set(["w/o", "c/o", "n/a"]);
  const CURRENCY = new Set(["$", "€", "£", "¥", "¢"]);
  const SUPERSCRIPT_INDEX = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "ⁿ": "n" };

  // Lexes a line into tokens { kind, text } and nests bracket pairs as
  // { kind: "group", open, close, items }. An unmatched bracket stays text.
  function mathItems(text) {
    const root = { items: [] };
    const stack = [root];
    for (const match of String(text).matchAll(MATH_TOKEN)) {
      const kind = Object.keys(match.groups).find((name) => match.groups[name] !== undefined);
      const value = match[0];
      const top = stack[stack.length - 1];
      if (kind === "other" && BRACKETS[value]) {
        const group = { kind: "group", open: value, close: BRACKETS[value], items: [] };
        top.items.push(group);
        stack.push(group);
      } else if (kind === "other" && CLOSERS.has(value) && stack.length > 1 && top.close === value) {
        stack.pop();
      } else if (kind === "other" && CLOSERS.has(value)) {
        // A closer that matches nothing open, or the wrong kind: unwind to
        // text so the brackets print exactly as written.
        top.items.push({ kind: "other", text: value });
      } else {
        top.items.push({ kind, text: value });
      }
    }
    // Groups still open at the end of the line were never closed: flatten
    // them back into their parent as text.
    while (stack.length > 1) {
      const group = stack.pop();
      const parent = stack[stack.length - 1];
      parent.items.pop();
      parent.items.push({ kind: "other", text: group.open }, ...group.items);
    }
    return root.items;
  }

  function isNode(item, type) {
    return item && item.kind === "node" && (!type || item.node.type === type);
  }

  // Tokens that can be one factor of an operand: 3, x, ², (x + 1), √2, x^2.
  function isFactor(item) {
    return Boolean(item) && (item.kind === "num" || item.kind === "word" ||
      item.kind === "sups" || item.kind === "group" || isNode(item, "sup") || isNode(item, "root"));
  }

  function isSign(item) {
    return Boolean(item) && item.kind === "other" && MINUS_SIGNS.has(item.text);
  }

  function isDegree(item, previous) {
    return Boolean(item) && item.kind === "other" && item.text === "°" &&
      Boolean(previous) && previous.kind === "num";
  }

  function latinLetters(word) {
    return GREEK.test(word) ? 0 : Array.from(word).filter((ch) => !GREEK.test(ch)).length;
  }

  function nodeItem(node) {
    return { kind: "node", node };
  }

  // ⁵√(x⁶), ∛8, √(x + 4), √2. A superscript number directly before √ is the
  // root's index unless it is an exponent on what precedes it (12²√3).
  function applyRoots(items, context) {
    const out = [];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (item.kind !== "root") {
        out.push(item);
        continue;
      }
      const next = items[index + 1];
      let children = null;
      if (next && next.kind === "group" && next.open === "(") children = convert(next.items, context);
      else if (next && next.kind === "num") children = [{ type: "text", text: next.text }];
      else if (next && next.kind === "word" && Array.from(next.text).length === 1) {
        children = [{ type: "text", text: next.text }];
      }
      if (!children) {
        out.push(item);
        continue;
      }
      let rootIndex = item.text === "∛" ? "3" : item.text === "∜" ? "4" : null;
      const before = out[out.length - 1];
      if (item.text === "√" && before && before.kind === "sups" &&
          /^(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]+|ⁿ)$/.test(before.text) && !isFactor(out[out.length - 2])) {
        rootIndex = Array.from(before.text).map((ch) => SUPERSCRIPT_INDEX[ch]).join("");
        out.pop();
      }
      out.push(nodeItem({ type: "root", index: rootIndex, children }));
      index += 1;
    }
    return out;
  }

  // x^2, x^k, (2/3)^−2, 2^(x + 1). The exponent reaches one number, one
  // letter, or one bracket group, the usual precedence of ^.
  function applyPowers(items, context) {
    const out = [];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const base = out[out.length - 1];
      if (item.kind !== "other" || item.text !== "^" || !isFactor(base)) {
        out.push(item);
        continue;
      }
      let next = items[index + 1];
      let sign = "";
      let used = 1;
      if (isSign(next) && items[index + 2] &&
          (items[index + 2].kind === "num" || items[index + 2].kind === "word")) {
        sign = next.text;
        next = items[index + 2];
        used = 2;
      }
      let node = null;
      if (next && next.kind === "group" && !sign) {
        node = { type: "sup", children: convert(next.items, { inSup: true }), simple: false };
      } else if (next && next.kind === "num") {
        node = { type: "sup", children: [{ type: "text", text: sign + next.text }], simple: true };
      } else if (next && next.kind === "word") {
        // x^ab is (x^a)b: the exponent takes one letter.
        const [first, ...rest] = Array.from(next.text);
        node = { type: "sup", children: [{ type: "text", text: sign + first }], simple: true };
        if (rest.length) {
          items = items.slice();
          items.splice(index + used + 1, 0, { kind: "word", text: rest.join("") });
        }
      }
      if (!node) {
        out.push(item);
        continue;
      }
      out.push(nodeItem(node));
      index += used;
    }
    return out;
  }

  // The operand to the left of a slash: the run of factors that ends there.
  function numeratorStart(items, end) {
    let start = end + 1;
    while (start > 0 && (isFactor(items[start - 1]) || isDegree(items[start - 1], items[start - 2]))) {
      start -= 1;
    }
    return start;
  }

  // The operand to the right of a slash: an optional minus, one factor, and
  // its exponents. Returns the index after it, or -1 when what follows would
  // make the reading ambiguous (1/2x, 1/2(3)).
  function denominatorEnd(items, begin) {
    let index = begin;
    if (isSign(items[index]) && isFactor(items[index + 1])) index += 1;
    const primary = items[index];
    if (!primary || primary.kind === "sups" || isNode(primary, "sup")) return -1;
    if (primary.kind === "word" && isCall(items, index)) {
      index += 2;
    } else if (primary.kind === "word") {
      if (latinLetters(primary.text) > 1) return -1;
      index += 1;
    } else if (isFactor(primary)) {
      index += 1;
    } else {
      return -1;
    }
    while (items[index] && (items[index].kind === "sups" || isNode(items[index], "sup") ||
        isDegree(items[index], items[index - 1]))) {
      index += 1;
    }
    if (isFactor(items[index])) return -1;
    return index;
  }

  function isCall(items, index) {
    const word = items[index];
    const group = items[index + 1];
    return Boolean(word) && word.kind === "word" && Boolean(group) && group.kind === "group" &&
      (FUNCTION_LETTERS.has(word.text) || FUNCTION_WORDS.has(word.text));
  }

  function plainText(items) {
    return items.map((item) => (item.kind === "group" ? item.open + plainText(item.items) + item.close
      : item.text || "")).join("");
  }

  function acceptableNumerator(items) {
    const hasCoefficient = items[0].kind === "num";
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (item.kind !== "word") continue;
      if (index > 0 && items[index - 1].kind === "num" && ORDINALS.has(item.text)) return false;
      if (items[index + 1] && items[index + 1].kind === "group") {
        if (latinLetters(item.text) > 1 && !FUNCTION_WORDS.has(item.text)) return false;
      } else if (!hasCoefficient && latinLetters(item.text) > 1) {
        return false;
      }
    }
    return true;
  }

  function isYear(item) {
    return item.kind === "num" && /^(?:19|20)\d\d$/.test(item.text);
  }

  // Decides whether items[start..slash) / items(slash..end) is a fraction.
  function acceptableFraction(items, start, slash, end, gap) {
    const num = items.slice(start, slash - gap);
    const den = items.slice(slash + 1 + gap, end);
    const before = items[start - 1];
    const after = items[end];
    const isSlash = (item) => Boolean(item) && item.kind === "other" && item.text === "/";
    if (!num.length || !den.length) return false;
    // Part of a chain such as 9/25/2026 or a / b/c, which reads (a/b)/c.
    if (isSlash(before) || isSlash(after)) return false;
    if (before && before.kind === "space" && isSlash(items[start - 2])) return false;
    if (before && before.kind === "other" && CURRENCY.has(before.text)) return false;
    if (!acceptableNumerator(num)) return false;
    const numWords = num.filter((item) => item.kind === "word").map((item) => item.text);
    const denWords = den.filter((item) => item.kind === "word").map((item) => item.text);
    if (numWords.length === 1 && denWords.length === 1 && den.length === 1 &&
        UNITS.has(numWords[0]) && UNITS.has(denWords[0]) &&
        num.every((item) => item.kind === "num" || item.kind === "word")) {
      return false;
    }
    if (NOT_FRACTIONS.has(`${plainText(num)}/${plainText(den)}`.toLowerCase())) return false;
    if (num.length === 1 && den.length === 1 && isYear(num[0]) && isYear(den[0])) return false;
    return true;
  }

  // One operand's nodes. A lone bracket group loses its brackets: the
  // fraction bar groups it now.
  function operand(items, context) {
    if (items.length === 1 && items[0].kind === "group") {
      return { nodes: convert(items[0].items, context), grouped: true };
    }
    return { nodes: convert(items, context), grouped: false };
  }

  function applyFractions(items, context) {
    let out = items.slice();
    for (let slash = 0; slash < out.length; slash += 1) {
      const item = out[slash];
      if (item.kind !== "other" || item.text !== "/") continue;
      // "a/b" or "a / b"; never a slash spaced on one side only.
      const spaced = out[slash - 1] && out[slash - 1].kind === "space" && out[slash - 1].text === " " &&
        out[slash + 1] && out[slash + 1].kind === "space" && out[slash + 1].text === " ";
      const gap = spaced ? 1 : 0;
      const start = numeratorStart(out, slash - 1 - gap);
      const end = denominatorEnd(out, slash + 1 + gap);
      if (end < 0 || !acceptableFraction(out, start, slash, end, gap)) continue;
      const num = operand(out.slice(start, slash - gap), context);
      const den = operand(out.slice(slash + 1 + gap, end), context);
      const node = { type: "frac", num: num.nodes, den: den.nodes };
      if (context.inSup) {
        node.inline = true;
        node.numGrouped = num.grouped;
        node.denGrouped = den.grouped;
      }
      out = out.slice(0, start).concat([nodeItem(node)], out.slice(end));
      slash = start;
    }
    return out;
  }

  function isStackedFraction(node) {
    return node.type === "frac" && !node.inline;
  }

  // Brackets around nothing but a stacked fraction are dropped, (1/2)x → ½x,
  // unless they carry meaning: a call or product before them, f(1/2) and
  // 4(1/4), or an exponent after them, (2/3)². Kept brackets around a
  // stacked fraction become a fence so they can stretch to its height.
  function groupNodes(group, before, after, context) {
    const inner = convert(group.items, context);
    const body = inner.filter((node) => !(node.type === "text" && node.text.trim() === ""));
    const signed = body.length === 2 && body[0].type === "text" && MINUS_SIGNS.has(body[0].text);
    const lone = (body.length === 1 && isStackedFraction(body[0])) ||
      (signed && isStackedFraction(body[1]));
    const bound = isFactor(before) || (before && before.kind === "node") ||
      (after && (after.kind === "sups" || isNode(after, "sup")));
    if (lone && !bound) return inner;
    if (inner.some(isStackedFraction)) {
      return [{ type: "fence", open: group.open, close: group.close, children: inner }];
    }
    return [{ type: "text", text: group.open }, ...inner, { type: "text", text: group.close }];
  }

  function mergeText(nodes) {
    const out = [];
    nodes.forEach((node) => {
      const last = out[out.length - 1];
      if (node.type === "text" && last && last.type === "text") last.text += node.text;
      else if (node.type !== "text" || node.text !== "") out.push(node);
    });
    return out;
  }

  // Items to nodes, after the structural passes for this bracket level.
  function convert(items, context) {
    const settings = context || {};
    const passed = applyFractions(applyPowers(applyRoots(items, settings), settings), settings);
    const nodes = [];
    passed.forEach((item, index) => {
      if (item.kind === "node") nodes.push(item.node);
      else if (item.kind === "group") {
        nodes.push(...groupNodes(item, passed[index - 1], passed[index + 1], settings));
      } else nodes.push({ type: "text", text: item.text });
    });
    return mergeText(nodes);
  }

  function mathTokens(text) {
    const source = text === null || text === undefined ? "" : String(text);
    return convert(mathItems(source), {});
  }

  /* --------------------------------------------------------- math speech */

  const ROOT_NAMES = { 2: "square", 3: "cube", 4: "fourth", 5: "fifth", 6: "sixth",
    7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth" };

  // An operand reads without "the fraction … end fraction" when it is one
  // plain term such as 3, −2, 4π, or x², with no operator inside it.
  function isSimple(nodes) {
    return nodes.length === 1 && nodes[0].type === "text" &&
      /^[−-]?[^\s+\-−=±·×÷/]+$/.test(nodes[0].text);
  }

  function rootName(index) {
    if (!index) return "square";
    if (ROOT_NAMES[index]) return ROOT_NAMES[index];
    return `${index}th`;
  }

  function nodeSpeech(node) {
    if (node.type === "text") return node.text;
    if (node.type === "fence") return node.open + mathSpeech(node.children) + node.close;
    if (node.type === "frac") {
      const num = mathSpeech(node.num);
      const den = mathSpeech(node.den);
      return isSimple(node.num) && isSimple(node.den)
        ? ` ${num} over ${den} `
        : ` the fraction, ${num}, over ${den}, end fraction `;
    }
    if (node.type === "sup") {
      const power = mathSpeech(node.children);
      if (node.simple && power === "2") return " squared ";
      if (node.simple && power === "3") return " cubed ";
      if (node.simple) return ` to the power ${power} `;
      return ` raised to the exponent, ${power}, end exponent `;
    }
    if (node.type === "root") {
      const name = `the ${rootName(node.index)} root of`;
      const radicand = mathSpeech(node.children);
      return isSimple(node.children) ? ` ${name} ${radicand} ` : ` ${name}, ${radicand}, end root `;
    }
    return "";
  }

  // What a screen reader says for typeset nodes, in ClearSpeak's style:
  // "3 over 5", "x squared", "the square root of, x + 4, end root".
  function mathSpeech(nodes) {
    return (nodes || []).map(nodeSpeech).join("").replace(/\s+/g, " ").trim();
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

  // Draws math nodes. Each typeset piece carries its spoken form in visually
  // hidden text and hides the drawing from assistive technology, so a
  // screen reader says "3 over 5" instead of "3 5". Pieces nested inside a
  // hidden drawing need no spoken form of their own.
  function appendMathNodes(target, nodes, hidden) {
    nodes.forEach((node) => {
      if (node.type === "text") {
        target.appendChild(doc().createTextNode(node.text));
      } else if (node.type === "fence") {
        const fence = el("span", "lm-math-fence");
        fence.append(el("span", "lm-math-bracket", node.open));
        appendMathNodes(fence, node.children, hidden);
        fence.append(el("span", "lm-math-bracket", node.close));
        target.appendChild(fence);
      } else if (node.type === "frac" && node.inline) {
        // A fraction in an exponent stays on one line, a/b, with the
        // brackets it was written with.
        const operand = (parts, grouped) => (grouped
          ? [{ type: "text", text: "(" }, ...parts, { type: "text", text: ")" }]
          : parts);
        appendMathNodes(target, [...operand(node.num, node.numGrouped), { type: "text", text: "/" },
          ...operand(node.den, node.denGrouped)], hidden);
      } else {
        const wrap = el("span", `lm-math lm-math-${node.type}`);
        if (!hidden) wrap.appendChild(el("span", "lm-math-sr", ` ${mathSpeech([node])} `));
        const drawing = mathDrawing(node);
        if (!hidden) drawing.setAttribute("aria-hidden", "true");
        wrap.appendChild(drawing);
        target.appendChild(wrap);
      }
    });
  }

  // The radical sign is drawn, not typed: a √ glyph's height differs from
  // font to font, while this stretches to the radicand's height so its top
  // always meets the overline, even over a stacked fraction.
  function radicalSign() {
    const svg = doc().createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "lm-math-sign");
    svg.setAttribute("viewBox", "0 0 10 20");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("focusable", "false");
    const path = doc().createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M0.5 12.5 L2.6 11 L5.4 19.4 L10 0.6");
    svg.appendChild(path);
    return svg;
  }

  function mathDrawing(node) {
    if (node.type === "sup") {
      const sup = el("sup", "lm-math-power");
      appendMathNodes(sup, node.children, true);
      return sup;
    }
    if (node.type === "frac") {
      const stack = el("span", "lm-math-stack");
      const num = el("span", "lm-math-num");
      const den = el("span", "lm-math-den");
      appendMathNodes(num, node.num, true);
      appendMathNodes(den, node.den, true);
      stack.append(num, den);
      return stack;
    }
    const box = el("span", "lm-math-radical");
    if (node.index) box.appendChild(el("span", "lm-math-index", node.index));
    box.appendChild(radicalSign());
    const radicand = el("span", "lm-math-radicand");
    appendMathNodes(radicand, node.children, true);
    box.appendChild(radicand);
    return box;
  }

  // Appends text with its math typeset: exponents, fractions, radicals.
  function appendMath(target, text) {
    appendMathNodes(target, mathTokens(text), false);
    return target;
  }

  function appendPlain(target, text, options) {
    if (options && options.math) appendMath(target, text);
    else target.appendChild(doc().createTextNode(text));
  }

  function appendInline(target, text, options) {
    if (!(options && options.underlines)) {
      appendPlain(target, text, options);
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
        appendPlain(target, segment.text, options);
      }
    });
  }

  // A text element: plain textContent, or typeset math when asked.
  function textEl(tag, className, text, options) {
    if (!(options && options.math)) return el(tag, className, text);
    return appendMath(el(tag, className), text);
  }

  function renderTable(block, options) {
    const wrap = el("div", "lm-table-wrap");
    const table = el("table", "lm-table");
    const head = el("thead");
    const headRow = el("tr");
    block.header.forEach((cell, index) => {
      const th = textEl("th", "", cell, options);
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
        const td = textEl(isHeader ? "th" : "td", "", cell, options);
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
        container.appendChild(renderTable(block, settings));
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
        block.lines.forEach((line) => group.appendChild(textEl("p", "lm-equation", line, settings)));
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
  // tables where pipe rows appear. options.math typesets exponents,
  // fractions, and radicals (see mathTokens); pass it for Math sections.
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
    mathTokens,
    mathSpeech,
    splitStemPassage,
    sanitizeSvgTree,
    svgSize,
    // DOM
    renderBlocks,
    renderText,
    renderStimulus,
    appendMath,
    renderFigure,
    buildSvg,
  };
});
