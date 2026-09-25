"use strict";

// Parses figure SVG the way the browser's DOMParser does for "image/svg+xml",
// into the node tree src/app/render.js's sanitizeSvgTree takes:
//   element: { name, namespace, attributes: [{ name, value, namespace }], children }
//   text:    { text }
// XML is strict: a markup error that DOMParser would report as <parsererror>
// (and the app would then show only the figure's text fallback) throws a
// SyntaxError here. Enough of XML for generated figures: elements,
// attributes, namespaces, text, the five named and numeric character
// references, comments, CDATA, processing instructions, and a doctype-free
// prolog. Tooling only; the browser uses DOMParser.

const XML_NS = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NS = "http://www.w3.org/2000/xmlns/";
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const NAME = /^[A-Za-z_][\w.-]*(?::[A-Za-z_][\w.-]*)?$/;

function decode(text, where) {
  return text.replace(/&([^;&\s]*);?/g, (match, body) => {
    if (!match.endsWith(";")) throw new SyntaxError(`bare & in ${where}`);
    if (Object.prototype.hasOwnProperty.call(NAMED, body)) return NAMED[body];
    const numeric = /^#(?:x([0-9a-fA-F]+)|([0-9]+))$/.exec(body);
    if (numeric) {
      const code = numeric[1] ? parseInt(numeric[1], 16) : Number(numeric[2]);
      if (!code || code > 0x10ffff) throw new SyntaxError(`invalid character reference &${body}; in ${where}`);
      return String.fromCodePoint(code);
    }
    throw new SyntaxError(`undefined entity &${body}; in ${where}`);
  });
}

function parseXml(source) {
  const text = String(source);
  let position = 0;
  let root = null;
  const stack = [];

  function resolve(prefix, scope, forAttribute) {
    if (prefix === "xml") return XML_NS;
    if (prefix === "xmlns") return XMLNS_NS;
    if (!prefix) return forAttribute ? null : scope[""] || null;
    if (!Object.prototype.hasOwnProperty.call(scope, prefix)) {
      throw new SyntaxError(`undeclared namespace prefix "${prefix}"`);
    }
    return scope[prefix];
  }

  function openTag() {
    const end = findTagEnd(position);
    const body = text.slice(position + 1, end);
    const selfClosing = body.endsWith("/");
    const inner = selfClosing ? body.slice(0, -1) : body;
    const nameMatch = /^([^\s/>]+)/.exec(inner);
    if (!nameMatch || !NAME.test(nameMatch[1])) throw new SyntaxError(`bad tag name at ${position}`);
    const qualified = nameMatch[1];
    const raw = [];
    const attributePattern = /\s+([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/y;
    let cursor = qualified.length;
    for (;;) {
      attributePattern.lastIndex = cursor;
      const match = attributePattern.exec(inner);
      if (!match) break;
      const name = match[1];
      const value = match[3] !== undefined ? match[3] : match[4];
      if (!NAME.test(name)) throw new SyntaxError(`bad attribute name "${name}"`);
      if (value.includes("<")) throw new SyntaxError(`"<" in the value of ${name}`);
      if (raw.some((entry) => entry.name === name)) throw new SyntaxError(`duplicate attribute ${name}`);
      raw.push({ name, value: decode(value, `attribute ${name}`).replace(/[\t\n\r]/g, " ") });
      cursor = attributePattern.lastIndex;
    }
    if (inner.slice(cursor).trim()) throw new SyntaxError(`malformed attributes in <${qualified}>`);
    const parentScope = stack.length ? stack[stack.length - 1].scope : {};
    const scope = { ...parentScope };
    raw.forEach(({ name, value }) => {
      if (name === "xmlns") scope[""] = value;
      else if (name.startsWith("xmlns:")) scope[name.slice(6)] = value;
    });
    const [prefix, local] = qualified.includes(":") ? qualified.split(":") : [null, qualified];
    const node = {
      name: local,
      namespace: resolve(prefix, scope, false),
      attributes: raw.map(({ name, value }) => {
        const attributePrefix = name.includes(":") ? name.split(":")[0] : name === "xmlns" ? "xmlns" : null;
        return { name, value, namespace: resolve(attributePrefix, scope, true) };
      }),
      children: [],
    };
    if (stack.length) stack[stack.length - 1].node.children.push(node);
    else if (root) throw new SyntaxError("more than one root element");
    else root = node;
    position = end + 1;
    if (!selfClosing) stack.push({ node, qualified, scope });
  }

  // The ">" that ends the tag starting at `start`, skipping quoted values.
  function findTagEnd(start) {
    let quote = null;
    for (let index = start + 1; index < text.length; index += 1) {
      const character = text[index];
      if (quote) {
        if (character === quote) quote = null;
      } else if (character === '"' || character === "'") quote = character;
      else if (character === "<") throw new SyntaxError(`"<" inside a tag at ${index}`);
      else if (character === ">") return index;
    }
    throw new SyntaxError("unterminated tag");
  }

  function closeTag() {
    const end = text.indexOf(">", position);
    if (end < 0) throw new SyntaxError("unterminated end tag");
    const name = text.slice(position + 2, end).trim();
    const open = stack.pop();
    if (!open || open.qualified !== name) throw new SyntaxError(`</${name}> does not close <${open ? open.qualified : ""}>`);
    position = end + 1;
  }

  function skip(opener, closer, label) {
    const end = text.indexOf(closer, position + opener.length);
    if (end < 0) throw new SyntaxError(`unterminated ${label}`);
    const content = text.slice(position + opener.length, end);
    position = end + closer.length;
    return content;
  }

  function addText(value) {
    if (!value) return;
    if (!stack.length) {
      if (value.trim()) throw new SyntaxError("text outside the root element");
      return;
    }
    stack[stack.length - 1].node.children.push({ text: value });
  }

  while (position < text.length) {
    if (text.startsWith("<!--", position)) {
      if (skip("<!--", "-->", "comment").includes("--")) throw new SyntaxError('"--" inside a comment');
    } else if (text.startsWith("<![CDATA[", position)) {
      if (!stack.length) throw new SyntaxError("CDATA outside the root element");
      addText(skip("<![CDATA[", "]]>", "CDATA section"));
    } else if (text.startsWith("<?", position)) {
      skip("<?", "?>", "processing instruction");
    } else if (text.startsWith("<!", position)) {
      throw new SyntaxError("doctype and declarations are not supported");
    } else if (text.startsWith("</", position)) {
      closeTag();
    } else if (text[position] === "<") {
      if (root && !stack.length) throw new SyntaxError("more than one root element");
      openTag();
    } else {
      const next = text.indexOf("<", position);
      const end = next < 0 ? text.length : next;
      const raw = text.slice(position, end);
      if (raw.includes("]]>")) throw new SyntaxError('"]]>" in text');
      addText(decode(raw, "text"));
      position = end;
    }
  }
  if (stack.length) throw new SyntaxError(`unclosed <${stack[stack.length - 1].qualified}>`);
  if (!root) throw new SyntaxError("no root element");
  return root;
}

module.exports = { XMLNS_NS, XML_NS, parseXml };
