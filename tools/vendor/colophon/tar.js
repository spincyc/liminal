"use strict";
// A minimal reader for uncompressed POSIX tar archives (ustar, with pax and
// GNU long-name records): enough to take verified members out of a runtime
// release without a dependency. Only regular files are returned; links,
// devices and anything else are reported so the caller can refuse them.
const fs = require("node:fs");

const BLOCK = 512;

function text(buffer, start, length) {
  const field = buffer.subarray(start, start + length);
  const end = field.indexOf(0);
  return field.subarray(0, end < 0 ? field.length : end).toString("utf8");
}

function octal(buffer, start, length) {
  const field = buffer.subarray(start, start + length);
  if (field[0] & 0x80) throw new Error("tar: binary size fields are not supported");
  const value = text(buffer, start, length).trim();
  if (!/^[0-7]*$/.test(value)) throw new Error("tar: invalid numeric field");
  return value ? parseInt(value, 8) : 0;
}

function pax(body) {
  const records = {};
  let offset = 0;
  while (offset < body.length) {
    const space = body.indexOf(0x20, offset);
    if (space < 0) throw new Error("tar: invalid pax record");
    const length = Number(body.subarray(offset, space).toString("ascii"));
    if (!Number.isSafeInteger(length) || length <= 0 || offset + length > body.length) throw new Error("tar: invalid pax record");
    const record = body.subarray(space + 1, offset + length - 1).toString("utf8");
    const equals = record.indexOf("=");
    if (equals > 0) records[record.slice(0, equals)] = record.slice(equals + 1);
    offset += length;
  }
  return records;
}

// Calls visit({ name, size, type, read }) for every member in order; read()
// returns the member's bytes. Returns when the end-of-archive marker is reached.
function each(file, visit) {
  const fd = fs.openSync(file, "r");
  try {
    const size = fs.fstatSync(fd).size;
    const header = Buffer.alloc(BLOCK);
    let offset = 0;
    let longName = null;
    let extended = {};
    const readAt = (position, length) => {
      const bytes = Buffer.alloc(length);
      if (length && fs.readSync(fd, bytes, 0, length, position) !== length) throw new Error("tar: truncated archive");
      return bytes;
    };
    while (offset + BLOCK <= size) {
      if (fs.readSync(fd, header, 0, BLOCK, offset) !== BLOCK) throw new Error("tar: truncated header");
      if (header.every(byte => byte === 0)) return;
      let sum = 0;
      for (let i = 0; i < BLOCK; i++) sum += i >= 148 && i < 156 ? 32 : header[i];
      if (sum !== octal(header, 148, 8)) throw new Error("tar: header checksum mismatch");
      const type = String.fromCharCode(header[156] || 48);
      const length = octal(header, 124, 12);
      const body = offset + BLOCK;
      const next = body + Math.ceil(length / BLOCK) * BLOCK;
      if (next > size) throw new Error("tar: truncated member");
      if (type === "x") { extended = pax(readAt(body, length)); offset = next; continue; }
      if (type === "g") { offset = next; continue; }
      if (type === "L") { longName = text(readAt(body, length), 0, length); offset = next; continue; }
      const prefix = text(header, 345, 155);
      const name = extended.path || longName || (prefix ? prefix + "/" : "") + text(header, 0, 100);
      const kind = type === "0" || type === "\0" ? "file" : type === "5" ? "directory" : "other:" + type;
      visit({ name, size: length, type: kind, read: () => readAt(body, length) });
      longName = null;
      extended = {};
      offset = next;
    }
    throw new Error("tar: missing end-of-archive marker");
  } finally { fs.closeSync(fd); }
}

// Writes a tar archive of { name, bytes } entries (used by the tests).
function write(file, entries) {
  const blocks = [];
  for (const { name, bytes } of entries) {
    const header = Buffer.alloc(BLOCK);
    let stored = name;
    if (Buffer.byteLength(name) > 100) {
      const record = (body => { let length = body.length + 3; while (String(length).length + 1 + body.length + 1 !== length) length++; return length + " " + body + "\n"; })("path=" + name);
      blocks.push(...[header0("././@PaxHeader", Buffer.byteLength(record), "x"), pad(Buffer.from(record))]);
      stored = name.slice(-100);
    }
    blocks.push(header0(stored, bytes.length, "0", header), pad(Buffer.from(bytes)));
  }
  blocks.push(Buffer.alloc(BLOCK * 2));
  fs.writeFileSync(file, Buffer.concat(blocks));
  function pad(buffer) { return Buffer.concat([buffer, Buffer.alloc((BLOCK - buffer.length % BLOCK) % BLOCK)]); }
  function header0(name, size, type, header = Buffer.alloc(BLOCK)) {
    header.fill(0);
    header.write(name, 0, 100, "utf8");
    header.write("0000644\0", 100); header.write("0000000\0", 108); header.write("0000000\0", 116);
    header.write(size.toString(8).padStart(11, "0") + "\0", 124);
    header.write("00000000000\0", 136);
    header.write(type, 156);
    header.write("ustar\0" + "00", 257);
    header.fill(32, 148, 156);
    let sum = 0;
    for (const byte of header) sum += byte;
    header.write(sum.toString(8).padStart(6, "0") + "\0 ", 148);
    return header;
  }
}

module.exports = { each, write };
