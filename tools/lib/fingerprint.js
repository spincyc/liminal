"use strict";

// Legacy fingerprint: a short hash of the questions it builds for a
// fixed set of seeds. Question ids and run codes store only a template id
// and a seed, so any edit that changes what a seed builds changes what an old
// id or code rebuilds; the registry (tools/update-templates.js) bumps the
// template's version when its fingerprint changes, so stored attempts can
// tell which version they were answered on.
//
// Only what the student sees counts: the question, its choices and key, and
// the teaching text. Metadata (tier, skill, tags, timing) and the gate's own
// measurements are left out, so relabeling a template or adding a record field
// does not mark every stored attempt as answered on an older version. A seed
// whose build throws contributes its error message.

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");

const SOURCE_ALGORITHM = "source-v1";

const FINGERPRINT_SEEDS = Array.from({ length: 8 }, (unused, index) => `fp-${index}`);
const VISIBLE_FIELDS = [
  "responseType", "scene", "stimulus", "figure", "stem", "choices", "correctAnswer",
  "hint", "explanation", "solutionSteps", "principles", "strategy", "trap", "distractorRationales",
];

// JSON with object keys sorted, so the hash does not depend on the order in
// which a template happens to assemble its record.
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry === undefined ? null : entry)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined && typeof value[key] !== "function")
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

function fingerprintRecords(records) {
  return crypto.createHash("sha256").update(canonicalJson(records)).digest("hex").slice(0, 16);
}

function templateFingerprint(family, instantiate) {
  const records = FINGERPRINT_SEEDS.map((seed) => {
    try {
      const record = instantiate(family, seed);
      return Object.fromEntries(VISIBLE_FIELDS.map((field) => [field, record[field]]));
    } catch (error) {
      return { error: String(error && error.message ? error.message : error) };
    }
  });
  return fingerprintRecords(records);
}

// Hash complete source files, not observations of a handful of draws. Shared
// helpers, topic data and even dormant literal requires belong to the closure.
// Conservatively, comments/metadata and another template in the same file also
// change this digest. This trades extra version bumps for never silently
// rebuilding an old seed using an edited, unsampled branch.
//
// Template modules are dependency-free CommonJS/browser scripts. Enforce their
// static, local require contract rather than guessing at dynamic dependencies.
function staticRequires(source, file) {
  const requires = [];
  let position = 0;
  const unsupported = () => { throw new Error(`${file}: fingerprint requires static local dependencies`); };
  function quoted(quote) {
    position += 1;
    while (position < source.length) {
      const char = source[position++];
      if (char === "\\") position += 1;
      else if (char === quote) return;
      else if (char === "\n" || char === "\r") unsupported();
    }
    unsupported();
  }
  function template() {
    position += 1;
    while (position < source.length) {
      const char = source[position++];
      if (char === "\\") position += 1;
      else if (char === "`") return;
      else if (char === "$" && source[position] === "{") { position += 1; code(true); }
    }
    unsupported();
  }
  function code(interpolation = false) {
    let braces = 0;
    let expression = true;
    let previous = "";
    const parens = [];
    while (position < source.length) {
      const char = source[position];
      if (/\s/.test(char)) { position += 1; continue; }
      if (source.startsWith("//", position)) {
        const end = source.indexOf("\n", position + 2);
        position = end < 0 ? source.length : end + 1;
        continue;
      }
      if (source.startsWith("/*", position)) {
        const end = source.indexOf("*/", position + 2);
        if (end < 0) unsupported();
        position = end + 2;
        continue;
      }
      if (char === '"' || char === "'") { quoted(char); expression = false; previous = "literal"; continue; }
      if (char === "`") { template(); expression = false; previous = "literal"; continue; }
      if (char === "/" && expression) {
        const start = position++;
        let characterClass = false;
        while (position < source.length) {
          const current = source[position++];
          if (current === "\\") position += 1;
          else if (current === "[") characterClass = true;
          else if (current === "]") characterClass = false;
          else if (current === "/" && !characterClass) break;
          else if (current === "\n" || current === "\r") unsupported();
        }
        // Fail closed if an ambiguous slash expression could hide a module
        // reference. Regexes containing these words can use another spelling.
        if (/\b(?:require|module|import)\b/.test(source.slice(start, position))) unsupported();
        while (/[a-z]/i.test(source[position] || "") && position < source.length) position += 1;
        expression = false;
        previous = "literal";
        continue;
      }
      const identifier = /^[A-Za-z_$][\w$]*/.exec(source.slice(position));
      if (identifier) {
        const name = identifier[0];
        if (name === "require") {
          const call = /^require\s*\(\s*(["'])([^"'\\]+)\1\s*\)/.exec(source.slice(position));
          if (!call || !call[2].startsWith(".")) unsupported();
          requires.push(call[2]);
          position += call[0].length;
          expression = false;
          previous = "literal";
          continue;
        }
        if (name === "import" || (name === "module" && previous !== "typeof" &&
            !/^module\s*\.\s*exports\b/.test(source.slice(position)))) unsupported();
        position += name.length;
        expression = /^(return|throw|case|delete|typeof|void|new|in|of|yield|await|else|instanceof)$/.test(name);
        previous = name;
        continue;
      }
      if (char === "\\") unsupported(); // Escaped identifiers cannot hide a require alias.
      if (char === "{") braces += 1;
      if (char === "}") {
        if (interpolation && braces === 0) { position += 1; return; }
        braces -= 1;
      }
      if (char === "(") parens.push(/^(if|while|for|with|switch|catch)$/.test(previous));
      expression = char === ")" ? Boolean(parens.pop()) : !/[\w\].]/.test(char);
      previous = char;
      position += 1;
    }
    if (interpolation) unsupported();
  }
  code();
  return requires;
}

function sourceFiles(root, entryFiles) {
  const found = new Map();
  const visit = (file) => {
    file = fs.realpathSync(file);
    const relative = path.relative(root, file).split(path.sep).join("/");
    if (relative.startsWith("../") || path.isAbsolute(relative)) throw new Error(`Fingerprint dependency outside source root: ${file}`);
    if (found.has(relative)) return;
    const source = fs.readFileSync(file, "utf8");
    found.set(relative, source);
    if (path.extname(file) === ".json") return;
    const resolve = createRequire(file).resolve;
    staticRequires(source, relative).forEach((dependency) => visit(resolve(dependency)));
  };
  entryFiles.forEach(visit);
  return [...found.entries()].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
}

function sourceFingerprint(root, entryFiles, templateId) {
  return crypto.createHash("sha256")
    .update(canonicalJson({ algorithm: SOURCE_ALGORITHM, templateId, files: sourceFiles(root, entryFiles) }))
    .digest("hex");
}

function sectionFingerprints(root, sectionKey) {
  root = fs.realpathSync(root);
  const [test, ...section] = sectionKey.split("-");
  const index = require.resolve(path.join(root, "src/lib/families", test, section.join("-")));
  const families = require(index);
  const owners = new Map();
  const visited = new Set();
  const visit = (module) => {
    if (visited.has(module.id)) return;
    visited.add(module.id);
    if (module.id !== index && Array.isArray(module.exports)) {
      module.exports.forEach((family) => { if (families.includes(family)) owners.set(family, module.filename); });
    }
    module.children.forEach(visit);
  };
  visit(require.cache[index]);
  const shared = path.join(root, "src/lib/families/shared/index.js");
  const instantiate = require(shared).instantiate;
  const fingerprints = new Map(families.map((family) => {
    const owner = owners.get(family);
    if (!owner) throw new Error(`${sectionKey}/${family.id}: cannot locate defining source module`);
    return [family.id, sourceFingerprint(root, [owner, shared], family.id)];
  }));
  return { families, instantiate, fingerprints };
}

module.exports = { SOURCE_ALGORITHM, FINGERPRINT_SEEDS, VISIBLE_FIELDS, canonicalJson, fingerprintRecords,
  templateFingerprint, sourceFiles, sourceFingerprint, sectionFingerprints };
