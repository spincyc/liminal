"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os");
const { pathToFileURL } = require("node:url"), { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const chromium = process.env.CHROMIUM || [...process.env.PATH.split(path.delimiter), path.join(os.homedir(), ".local/bin")]
  .map(dir => path.join(dir, "chromium")).find(file => fs.existsSync(file));

async function exercise() {
  const D = window.LiminalDailyReading, P = window.LiminalDailyReadingPrint;
  const index = { grades: [0, 12, 13].map(grade => ({ grade, calendar: true })) };
  const today = "2026-12-27", selections = {}, calendars = {}, readings = {};
  const source = { id: "source", author: "Author", title: "Work", publicationYear: 1900, rights: {} };
  for (const grade of [0, 12]) {
    const key = D.gradeKey(grade), prefix = "reading-" + key + "-";
    selections[key] = Array.from({ length: 6 }, (_, i) => prefix + "lead-" + (i + 1));
    // The holiday week crosses into 2027. Only the second set has its anchor.
    const last = prefix + "new-year";
    calendars[D.calendarFile(grade)] = { grade, sets: [{}, { anchors: { "new-year": { id: last } } }] };
    for (const id of [...selections[key], last]) {
      const reading = { id, title: id, sourceId: source.id, time: { readingMinutes: 7, discussionMinutes: 3, totalMinutes: 10 },
        challenge: "Listen.", focus: "Discuss.", context: "Read together.", excerpt: {},
        blocks: [{ type: "paragraph", text: "An evening reading." }], questions: [{ prompt: "What did you notice?" }] };
      readings[D.readingFile(grade, id)] = { grade, reading, source };
    }
  }
  window.LiminalHolidayWeekSelections = { "new-year": selections };
  const context = { index, today, announce() {}, getJson: async file => calendars[file] || readings[file] };
  const selected = D.view(index, "#holidays/new-year/2027", { today });
  await P.show(selected, context);
  const byId = id => document.getElementById(id), pdf = byId("dailyPrintPdf");
  const report = { checked: [...byId("dailyPrintLevels").querySelectorAll("input:checked")].map(box => box.value),
    dates: [...byId("dailyPrintPreview").querySelectorAll(".daily-print-date")].slice(0, 7).map(node => node.textContent),
    titles: [...byId("dailyPrintPreview").querySelectorAll(".daily-print-title a")].map(link => link.textContent) };
  pdf.click();
  report.nights = (window.testTeX.match(/LIMINAL-READING-START/g) || []).length;
  report.grades = (window.testTeX.match(/LIMINAL-LEVEL-START/g) || []).length;
  delete readings[D.readingFile(12, selections["12"][3])];
  await P.show(selected, context);
  report.missing = byId("dailyPrintPreview").querySelector(".is-unavailable").textContent;
  report.blocked = pdf.disabled && byId("dailyPrintBrowser").disabled;
  return report;
}

test("holiday workspace previews the curated week and withholds an incomplete packet", { skip: !chromium && "Chromium is unavailable" }, () => {
  const scratch = path.join(root, ".scratch");
  fs.mkdirSync(scratch, { recursive: true });
  const dir = fs.mkdtempSync(path.join(scratch, "holiday-week-ui-"));
  try {
    const scripts = ["lib/reading-calendar.js", "lib/daily-reading.js", "lib/holiday-weeks.js", "lib/reading-tex.js",
      "app/daily-reading-render.js", "app/pdf-action.js", "app/daily-reading-print.js"];
    const page = fs.readFileSync(path.join(root, "src/daily-reading.html"), "utf8")
      .replace(/<script\b[^>]*><\/script>|<link\b[^>]*>/g, "").replace("</body>", scripts.map(file =>
        '<script src="' + pathToFileURL(path.join(root, "src", file)) + '"></script>').join("\n") + `<script>
          window.LiminalNativeTeXRuntime = { url: "runtime.json" };
          window.Colophon = { generate: async options => { window.testTeX = options.files[0].data; throw Error("Captured"); } };
          (${exercise})().then(result => { document.body.textContent = JSON.stringify(result); })
            .catch(error => { document.body.textContent = error.stack; });
        </script></body>`);
    const file = path.join(dir, "fixture.html");
    fs.writeFileSync(file, page);
    const html = execFileSync(chromium, ["--headless", "--no-sandbox", "--disable-dev-shm-usage",
      "--user-data-dir=" + path.join(dir, "profile"), "--dump-dom", pathToFileURL(file).href],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30000 });
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
    assert.match(body, /^\{/, body.slice(0, 500));
    const report = JSON.parse(body);
    assert.deepEqual(report.checked, ["k", "12"]);
    assert.deepEqual(report.titles, ["k", "12"].flatMap(key => ["lead-1", "lead-2", "lead-3", "lead-4", "lead-5", "lead-6", "new-year"].map(part => "reading-" + key + "-" + part)));
    assert.match(report.dates[0], /Dec 26/);
    assert.match(report.dates[6], /Jan 1.*New Year/);
    assert.equal(report.nights, 14); assert.equal(report.grades, 2);
    assert.match(report.missing, /Grade 12.*could not be loaded/); assert.equal(report.blocked, true);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
