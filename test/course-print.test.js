"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { exportPacket, parseArgs } = require("../tools/lesson-packet");

const ROOT = path.resolve(__dirname, "..");
function executable(name) {
  const candidates = [...(process.env.PATH || "").split(path.delimiter), path.join(require("node:os").homedir(), ".local/bin")];
  return candidates.map(dir => path.join(dir, name)).find(file => { try { fs.accessSync(file, fs.constants.X_OK); return true; } catch { return false; } });
}
const browserAvailable = (process.env.CHROMIUM || executable("chromium")) && (process.env.CHROMEDRIVER || executable("chromedriver"));
const pdfTextTool = executable("pdftotext");
const browserOptions = { skip: !browserAvailable || !pdfTextTool ? "Chromium, ChromeDriver and pdftotext are required for real pagination verification" : false, timeout: 60000 };
const course = { id: "print-fixture", title: "Print fixture", version: "1", units: [{ id: "unit", title: "Unit", lessons: [{
  id: "1-1", title: "Keep the complete reasoning", objective: "Explain the steps.", explanation: ["Read the original explanation."],
  examples: [{ prompt: "Try the sample.", answer: "Guide answer.", steps: ["Reason carefully.", "Check the result."] }],
  practiceAdvice: "Try the student worksheet before reading its separate key.",
}] }] };
function worksheet(questions) {
  return { title: "Continuation fixture", code: "PRINT-C", version: "1", seed: "print", packetSeed: "print", day: 1, days: 1, worksheetVariant: "C", lessonIds: ["1-1"], questions };
}
function marker(prefix, i) { return prefix + String(i).padStart(3, "0"); }
function pdfText(directory, name) { return execFileSync(pdfTextTool, ["-layout", path.join(directory, `${name}.pdf`), "-"], { encoding: "utf8" }); }
function assertMarkers(text, prefix, count) {
  for (let i = 0; i < count; i++) assert.equal(text.split(marker(prefix, i)).length - 1, 1, `${marker(prefix, i)} must occur exactly once`);
}
async function scratch(work) {
  const base = path.join(ROOT, ".scratch/print-lessons");
  fs.mkdirSync(base, { recursive: true });
  const directory = fs.mkdtempSync(path.join(base, "test-"));
  try { await work(directory); } finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

test("measured worksheet columns preserve long prompts, tables and numbered key steps in actual PDFs", browserOptions, async () => scratch(async directory => {
  const questions = [{ number: 1, lessonId: "1-1", workLines: 7,
    prompt: Array.from({ length: 65 }, (_, i) => `${marker("PROMPT", i)} Explain why equal quantities stay equal while each operation changes their written form.`).join("\n\n"),
    answer: "PRIVATEANSWER", steps: Array.from({ length: 85 }, (_, i) => `${marker("STEP", i)} Check the units and substitute the result before explaining the next operation.`),
  }, { number: 2, lessonId: "1-1", workLines: 3, prompt: "FINALQUESTION Review the complete table.",
    table: { headers: ["Index", "Measurement"], rows: Array.from({ length: 45 }, (_, i) => [marker("ROW", i), String(i)]) },
    answer: "FINALPRIVATEANSWER", steps: ["FINALSTEP State the conclusion."],
  }];
  const options = { ...parseArgs(["--days", "1", "--count", "2", "--combined", "--pdf"]), outDir: directory };
  await exportPacket(course, [worksheet(questions)], ["1-1"], options, AbortSignal.timeout(45000));
  const student = pdfText(directory, "student-worksheets"), key = pdfText(directory, "worked-answers");
  for (const text of [student, key]) {
    assertMarkers(text, "PROMPT", 65); assertMarkers(text, "ROW", 45);
    assert.equal(text.split("FINALQUESTION").length - 1, 1);
    assert.ok(text.includes("continued"), "oversized questions continue with their number");
    assert.ok((text.match(/Index\s+Measurement/g) || []).length > 1, "table headers repeat on a continuation");
  }
  assert.doesNotMatch(student, /PRIVATEANSWER|STEP\d{3}|FINALSTEP/);
  assertMarkers(key, "STEP", 85);
  assert.match(key, /FINALPRIVATEANSWER/);
  const pages = pdfText(directory, "nightly-packet").split("\f").filter(page => page.trim());
  const combined = fs.readFileSync(path.join(directory, "nightly-packet.html"), "utf8");
  const components = Array.from(combined.matchAll(/data-component="(guide|student|answers)"[^>]*data-start-page="(\d+)"[^>]*data-page-count="(\d+)"/g));
  assert.equal(components.length, 3);
  for (const match of components) {
    const [, kind, start, count] = match;
    assert.equal(Number(start) % 2, 1, `${kind} starts on a fresh duplex sheet`);
    const label = { guide: "Study guide", student: "Student worksheets", answers: "Worked answers" }[kind];
    for (let offset = 0; offset < Number(count); offset++) assert.match(pages[Number(start) - 1 + offset], new RegExp(`Night 1 / Worksheet C / ${label}`));
  }
  for (const name of ["original-study-guide", "student-worksheets", "worked-answers", "nightly-packet"]) {
    const html = fs.readFileSync(path.join(directory, `${name}.html`), "utf8");
    assert.equal((html.match(/data:font\/woff2;base64,/g) || []).length, 4);
    assert.match(html, /<meta name="font-license" content="[^]*SIL OPEN FONT LICENSE/);
    assert.doesNotMatch(html, /<(script|iframe|link)\b/);
  }
}));

test("an oversized indivisible table row fails promptly without duplicating a heading indefinitely", browserOptions, async () => scratch(async directory => {
  const sheet = worksheet([{ number: 1, lessonId: "1-1", prompt: "Check this deliberately oversized row.", workLines: 3,
    table: { headers: ["Value"], rows: [["A long indivisible cell. ".repeat(2000)]] }, answer: "private", steps: ["private"] }]);
  await assert.rejects(exportPacket(course, [sheet], ["1-1"], { ...parseArgs(["--days", "1", "--count", "1"]), outDir: directory }, AbortSignal.timeout(15000)), /figure or table row exceeds a printable column/);
}));

test("print preparation requires all four real font faces before measurement", async () => {
  const { preparePrint } = require("../src/app/course-render");
  const previous = global.document;
  const loads = [];
  try {
    global.document = { fonts: { load: async face => { loads.push(face); return []; }, ready: Promise.resolve() } };
    await assert.rejects(preparePrint(), /Print fonts did not load/);
    assert.equal(loads.length, 4);
    assert.ok(loads.every(face => face.includes('"Liminal Reading Serif"')));
    global.document.fonts.load = async () => [{ status: "loaded" }];
    await preparePrint();
  } finally {
    if (previous === undefined) delete global.document;
    else global.document = previous;
  }
});
