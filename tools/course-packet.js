#!/usr/bin/env node
"use strict";

// Local, dependency-free export through the same DOM renderer as courses.html.
// Student artifacts contain static presentation only, never the solution model.
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const { setTimeout: delay } = require("node:timers/promises");
const ROOT = path.resolve(__dirname, "..");
const Engine = require("../src/lib/courses/engine.js");
const { loadCourses } = require("./build-courses.js");
const NAMES = ["original-study-guide", "student-worksheets", "worked-answers"];
function documentNames(options) { return options.combined ? [...NAMES, "nightly-packet"] : NAMES; }

function usage() {
  return `Usage: node tools/course-packet.js [options]

  --course <id>       course id (default: grade-8-math)
  --unit <id|all>     topic to practice (default: all)
  --lessons <ids>     comma-separated lesson ids within the chosen topic
  --count <1-100>     problems per worksheet (default: 20)
  --days <1-30>       nights of homework (default: 10)
  --mode <approach>   rebuild or review (default: rebuild)
  --seed <text>       reproducible packet seed, 1-140 characters (default: practice)
  --worksheets <ids>  A, B, or C for all nights, or one per night: B,C,A (default: A)
  --all-worksheets   export all A/B/C alternatives; cannot combine with --worksheets
  --out <directory>   destination (default: .scratch/course-packets/<course>)
  --pdf              also save matching Letter-size PDFs
  --combined         also save nightly-packet: guide, worksheets, answers per night
  --single-sided     omit separator backs in --combined (default: double-sided)
  --list             list courses, topics, and lesson ids
  --help             show this help

Requires installed Chromium and a compatible ChromeDriver for HTML and PDF.
Set CHROMIUM and CHROMEDRIVER to executable paths if they are not on PATH.
Writes original-study-guide.html, student-worksheets.html, worked-answers.html
and packet-manifest.json; --pdf adds matching PDF files. Replaces these filenames
in --out. The manifest records replay settings, revisions, and form codes.
With --combined, nightly-packet.html (and .pdf with --pdf) contains all nights
in one print job, with each section starting on a fresh sheet for duplex printing.
The guide covers the selected lessons; --unit all includes the whole course.
Three full alternatives are generated for every night. --worksheets chooses
which worksheet and matching key to export for each night. --all-worksheets
exports the complete reserve supply with a separate matching answer document.
Rebuild pairs first-step support with fresh independent practice of the same method.
Review varies methods without first-step prompts.
Same seed + mode + lessons + count + days + course revision reproduces the alternatives;
the same worksheet choices reproduce the selected forms.
All files are local and work offline; this command does not publish anything.

Example:
  node tools/course-packet.js --unit topic-1 --days 10 --count 20 --seed home-1 --out .scratch/print/home-1 --pdf`;
}

function parseArgs(argv) {
  const options = { course: "grade-8-math", unit: "all", count: 20, days: 10, mode: "rebuild", seed: "practice", pdf: false, allWorksheets: false };
  const values = new Set(["course", "unit", "lessons", "count", "days", "mode", "seed", "worksheets", "out"]);
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (["--help", "-h"].includes(argument)) { options.help = true; continue; }
    if (["--pdf", "--list", "--combined"].includes(argument)) { options[argument.slice(2)] = true; continue; }
    if (argument === "--all-worksheets") { options.allWorksheets = true; continue; }
    if (argument === "--single-sided") { options.singleSided = true; continue; }
    const match = /^--([a-z]+)(?:=(.*))?$/.exec(argument);
    if (!match || !values.has(match[1])) throw new Error(`Unknown option: ${argument}. Use --help.`);
    const value = match[2] === undefined ? argv[++index] : match[2];
    if (value === undefined || value.startsWith("--") || !value.trim()) throw new Error(`Missing value for --${match[1]}.`);
    options[match[1]] = value;
  }
  if (options.help) return options;
  if (options.singleSided && !options.combined) throw new Error("--single-sided requires --combined.");
  if (!["rebuild", "review"].includes(options.mode)) throw new Error("--mode must be rebuild or review.");
  if (options.allWorksheets && options.worksheets !== undefined) throw new Error("--all-worksheets cannot be combined with --worksheets. Choose all alternatives or selected worksheets.");
  for (const [key, max] of [["count", Engine.MAX_COUNT], ["days", Engine.MAX_DAYS]]) {
    if (!/^\d+$/.test(String(options[key])) || Number(options[key]) < 1 || Number(options[key]) > max) {
      throw new Error(`--${key} must be an integer from 1 to ${max}.`);
    }
    options[key] = Number(options[key]);
  }
  options.seed = options.seed.trim();
  if (options.seed.length > 140) throw new Error("--seed must contain 1–140 characters.");
  const choices = (options.worksheets || "A").split(",").map(choice => choice.trim().toUpperCase());
  if (choices.some(choice => !Engine.WORKSHEET_VARIANTS.includes(choice)) || (choices.length !== 1 && choices.length !== options.days)) {
    throw new Error("--worksheets must be A, B, or C for all nights, or exactly one choice per night (for example B,C,A for 3 nights).");
  }
  if (!options.allWorksheets) options.worksheetChoices = choices.length === 1 ? Array(options.days).fill(choices[0]) : choices;
  if (options.lessons !== undefined) {
    options.lessons = options.lessons.split(",").map(id => id.trim());
    if (options.lessons.some(id => !id)) throw new Error("--lessons must be comma-separated lesson ids, without empty entries.");
  }
  options.outDir = options.out ? path.resolve(options.out) : path.join(ROOT, ".scratch/course-packets", options.course);
  return options;
}

function selectLessons(course, options) {
  const units = options.unit === "all" ? course.units : course.units.filter(unit => unit.id === options.unit);
  if (!units.length) throw new Error(`Unknown unit "${options.unit}". Choose ${course.units.map(unit => unit.id).join(", ")}, or all.`);
  const available = units.flatMap(unit => unit.lessons.map(lesson => lesson.id));
  if (!options.lessons) return available;
  const invalid = options.lessons.filter(id => !available.includes(id));
  if (invalid.length) throw new Error(`Lesson(s) outside the selected unit: ${invalid.join(", ")}. Available: ${available.join(", ")}.`);
  return available.filter(id => options.lessons.includes(id));
}

function selectWorksheets(nights, options) {
  return options.allWorksheets ? nights.flatMap(night => night.worksheets)
    : Engine.selectPacketWorksheets(nights, Object.fromEntries(options.worksheetChoices.map((variant, index) => [index + 1, variant])));
}

function studentPacket(packet) {
  const fields = (source, names) => Object.fromEntries(names.filter(name => source[name] !== undefined).map(name => [name, source[name]]));
  const point = value => fields(value, ["x", "y", "label"]);
  const graph = (source, blank) => {
    const result = fields(source, ["xMin", "xMax", "yMin", "yMax", "xStep", "yStep", "xLabel", "yLabel", "numberLine"]);
    if (!blank && source.points) result.points = source.points.map(point);
    if (!blank && source.lines) result.lines = source.lines.map(line => line.map(point));
    return result;
  };
  return packet.map(sheet => ({
    title: sheet.title, version: sheet.version, code: sheet.code, day: sheet.day, days: sheet.days, worksheetVariant: sheet.worksheetVariant,
    courseId: sheet.courseId, seed: sheet.seed, packetSeed: sheet.packetSeed,
    ...(["rebuild", "review"].includes(sheet.practiceMode) ? { practiceMode: sheet.practiceMode } : {}),
    lessonIds: sheet.lessonIds, warnings: sheet.warnings,
    questions: sheet.questions.map(question => {
      const output = { number: question.number, prompt: question.prompt, workLines: question.workLines };
      if (["guided", "independent"].includes(question.support)) output.support = question.support;
      for (const name of ["lessonId", "lessonTitle"]) {
        if (typeof question[name] === "string") output[name] = question[name];
      }
      if (question.expectations) output.expectations = Object.fromEntries(
        ["byHand", "calculator", "showWork", "answerForm", "firstStep", "check"]
          .filter(name => typeof question.expectations[name] === "string")
          .map(name => [name, question.expectations[name]])
      );
      if (question.table) output.table = fields(question.table, ["headers", "rows"]);
      if (question.graph) output.graph = graph(question.graph, false);
      else if (question.answerGraph) {
        // Axes alone provide the workspace without passing solution coordinates,
        // labels, checks, or arbitrary generator metadata to the student renderer.
        output.graph = graph(question.answerGraph, true);
      }
      return output;
    }),
  }));
}

function packetManifest(course, packet, lessonIds, options) {
  return {
    format: "liminal-course-packet", version: 1,
    course: { id: course.id, title: course.title, revision: String(course.revision || course.version) },
    settings: { lessonIds, count: options.count, days: options.days, seed: options.seed,
      practiceMode: options.mode || "rebuild", allWorksheets: !!options.allWorksheets,
      ...(!options.allWorksheets && options.worksheetChoices ? { worksheetChoices: options.worksheetChoices } : {}) },
    ...(options.combined ? { printing: { combined: true, duplex: !options.singleSided } } : {}),
    replayNote: "Replay requires the same course revision. Use --course, --unit all, --lessons, --count, --days, --mode (practiceMode), and --seed with the recorded settings. Use --all-worksheets when allWorksheets is true; otherwise use --worksheets with worksheetChoices.",
    sheets: packet.map(sheet => ({ day: sheet.day, seed: sheet.seed, code: sheet.code, warnings: sheet.warnings,
      ...(sheet.worksheetVariant ? { worksheetVariant: sheet.worksheetVariant } : {}) })),
    files: documentNames(options).flatMap(name => (options.pdf ? ["html", "pdf"] : ["html"]).map(extension => `${name}.${extension}`)),
  };
}

function executable(name, candidates) {
  const override = process.env[name];
  const paths = override ? [override] : candidates.flatMap(candidate => candidate.includes(path.sep)
    ? [candidate]
    : [...(process.env.PATH || "").split(path.delimiter), path.join(require("node:os").homedir(), ".local/bin")].map(directory => path.join(directory, candidate)));
  const found = paths.find(candidate => {
    try { fs.accessSync(candidate, fs.constants.X_OK); return fs.statSync(candidate).isFile(); }
    catch { return false; }
  });
  if (!found) throw new Error(`No ${name} executable found. Install a compatible Chromium/ChromeDriver pair, or set ${name} to its executable path. Use courses.html to download in your browser.`);
  return path.resolve(found);
}

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function withBrowser(scratch, signal, work) {
  const browser = executable("CHROMIUM", ["chromium", "chromium-browser", "google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]);
  const driver = executable("CHROMEDRIVER", ["chromedriver"]);
  const port = await freePort();
  const logPath = path.join(scratch, "chromedriver.log");
  const log = fs.openSync(logPath, "w");
  const child = spawn(driver, [`--port=${port}`, "--allowed-ips=127.0.0.1"], { stdio: ["ignore", log, log], detached: process.platform !== "win32" });
  fs.closeSync(log);
  let launchError;
  child.on("error", error => { launchError = error; });
  let session;
  async function request(route, body, timeout = 60000, cleanup = false) {
    const timeoutSignal = AbortSignal.timeout(timeout);
    const response = await fetch(`http://127.0.0.1:${port}${route}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: cleanup ? timeoutSignal : AbortSignal.any([timeoutSignal, signal]),
    });
    const result = await response.json();
    if (!response.ok || result.value?.error) throw new Error(result.value?.message || `ChromeDriver returned HTTP ${response.status}.`);
    return result.value;
  }
  try {
    const deadline = Date.now() + 10000;
    while (true) {
      signal.throwIfAborted();
      if (launchError) throw launchError;
      if (child.exitCode !== null) throw new Error(`ChromeDriver exited before starting. ${fs.readFileSync(logPath, "utf8").slice(-1500)}`);
      try { await request("/status", undefined, 1000); break; }
      catch (error) { if (Date.now() >= deadline) throw new Error(`ChromeDriver did not become ready: ${error.message}`); }
      await delay(100, undefined, { signal });
    }
    const value = await request("/session", { capabilities: { alwaysMatch: {
      browserName: "chrome",
      "goog:chromeOptions": { binary: browser, args: ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--no-first-run", "--no-default-browser-check", `--user-data-dir=${path.join(scratch, "profile")}`] },
    } } });
    session = value.sessionId;
    const command = (route, body, timeout) => request(`/session/${session}${route}`, body, timeout);
    await command("/timeouts", { pageLoad: 30000, script: 60000 });
    return await work(command);
  } finally {
    if (session) {
      try { await fetch(`http://127.0.0.1:${port}/session/${session}`, { method: "DELETE", signal: AbortSignal.timeout(10000) }); }
      catch { /* Terminate the owned process group even if the session stopped responding. */ }
    }
    const stop = signalName => {
      try {
        if (process.platform === "win32") child.kill(signalName);
        else if (child.pid) process.kill(-child.pid, signalName);
      } catch (error) { if (error.code !== "ESRCH") throw error; }
    };
    stop("SIGTERM");
    if (child.exitCode === null && child.signalCode === null && !launchError) {
      await Promise.race([new Promise(resolve => child.once("exit", resolve)), delay(1500)]);
    }
    // A driver can exit before its browser descendants, so signal its owned
    // process group even when the driver has already reported an exit.
    stop("SIGKILL");
  }
}

async function exportPacket(course, packet, lessonIds, options, signal = new AbortController().signal) {
  const scratchRoot = path.join(ROOT, ".scratch/packet-cli");
  fs.mkdirSync(scratchRoot, { recursive: true });
  const scratch = fs.mkdtempSync(path.join(scratchRoot, "render-"));
  try {
    const css = ["tokens", "app", "math", "courses"].map(name => fs.readFileSync(path.join(ROOT, "src/styles", name + ".css"), "utf8")).join("\n");
    const helper = path.join(scratch, "renderer.html");
    const scripts = ["lib/courses/math.js", "lib/courses/engine.js", "app/render.js", "app/course-render.js"].map(name => `<script src="${pathToFileURL(path.join(ROOT, "src", name)).href}"></script>`).join("\n");
    fs.writeFileSync(helper, `<!doctype html><meta charset="utf-8"><title>Local packet renderer</title>${scripts}`);
    await withBrowser(scratch, signal, async command => {
      await command("/url", { url: pathToFileURL(helper).href });
      // The shared renderer measures printable row heights using these styles.
      await command("/execute/sync", { script: "const style = document.createElement('style'); style.textContent = arguments[0]; document.head.appendChild(style);", args: [css] });
      const documents = [
        { name: NAMES[0], title: `${course.title} — Original study guide`, kind: "guide", course, data: lessonIds },
        { name: NAMES[1], title: `${course.title} — Student worksheets`, kind: "student", course: { title: course.title }, data: studentPacket(packet) },
        { name: NAMES[2], title: `${course.title} — Worked answers`, kind: "answers", course, data: packet },
      ];
      if (options.combined) documents.push({ name: "nightly-packet", title: `${course.title} — Nightly packet`, kind: "combined", course, data: packet, duplex: !options.singleSided });
      for (const document of documents) {
        const html = await command("/execute/sync", { script: `
          const [input, css] = arguments;
          const render = window.LiminalCourseRender;
          if (!render) throw new Error("Course renderer did not load.");
          const content = input.kind === "combined"
            ? render.renderNightlyPacket(input.course, input.data, {duplex: input.duplex, packetDays: input.packetDays})
            : input.kind === "guide"
            ? render.renderGuide(input.course, input.data)
            : render.renderPacket(input.course, input.data, {answers: input.kind === "answers", packetDays: input.packetDays});
          if (content.querySelector("script, iframe, object, embed")) throw new Error("Export contains active content.");
          if (input.kind === "student" && content.querySelector(".course-answer, .course-answer-key, .course-key-questions, .course-question-meta")) throw new Error("Student export contains solution content.");
          return render.exportHtml(input.title, content, css);
        `, args: [{ ...document, packetDays: options.days }, css] });
        if (typeof html !== "string" || !html.startsWith("<!doctype html>")) throw new Error("Renderer returned an invalid document.");
        fs.writeFileSync(path.join(scratch, document.name + ".html"), html);
      }
      if (options.pdf) {
        for (const name of documentNames(options)) {
          await command("/url", { url: pathToFileURL(path.join(scratch, name + ".html")).href });
          const result = await command("/goog/cdp/execute", { cmd: "Page.printToPDF", params: {
            printBackground: false, preferCSSPageSize: true, displayHeaderFooter: false,
            paperWidth: 8.5, paperHeight: 11, marginTop: 0.4, marginBottom: 0.4, marginLeft: 0.4, marginRight: 0.4,
          } }, 90000);
          const pdf = Buffer.from(result.data || "", "base64");
          if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new Error(`Chromium did not produce ${name}.pdf.`);
          fs.writeFileSync(path.join(scratch, name + ".pdf"), pdf);
        }
      }
    });
    const manifest = packetManifest(course, packet, lessonIds, options);
    fs.writeFileSync(path.join(scratch, "packet-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    fs.mkdirSync(options.outDir, { recursive: true });
    const files = [...manifest.files, "packet-manifest.json"];
    for (const file of files) fs.copyFileSync(path.join(scratch, file), path.join(options.outDir, file));
    return files.map(file => path.join(options.outDir, file));
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) { console.log(usage()); return; }
  const { courses } = loadCourses();
  if (options.list) {
    for (const course of courses) {
      console.log(`${course.id}: ${course.title}`);
      for (const unit of course.units) console.log(`  ${unit.id}: ${unit.title}\n    ${unit.lessons.map(lesson => lesson.id).join(", ")}`);
    }
    return;
  }
  const course = courses.find(item => item.id === options.course);
  if (!course) throw new Error(`Unknown course "${options.course}". Use --list.`);
  const lessonIds = selectLessons(course, options);
  const nights = Engine.generatePacketChoices(course, Engine.templatesForCourse(course.id), { lessonIds, count: options.count, days: options.days, seed: options.seed, practiceMode: options.mode });
  const packet = selectWorksheets(nights, options);
  const controller = new AbortController();
  const interrupt = () => controller.abort(new Error("Packet export interrupted."));
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", interrupt);
  try {
    const files = await exportPacket(course, packet, lessonIds, options, controller.signal);
    console.log(`${course.title}: ${options.mode}; ${options.days} nights × ${options.count} problems per worksheet; ${packet.length} worksheets exported${options.allWorksheets ? " (all A/B/C)" : ""}; ${lessonIds.length} lessons; seed "${options.seed}".`);
    for (const sheet of packet) {
      console.log(`  Night ${sheet.day}, Worksheet ${sheet.worksheetVariant}: ${sheet.code}`);
      for (const warning of sheet.warnings) console.warn(`  Night ${sheet.day}: ${warning}`);
    }
    for (const file of files) console.log(`  Wrote ${file}`);
    if (!options.pdf && documentNames(options).some(name => fs.existsSync(path.join(options.outDir, name + ".pdf")))) {
      console.warn("  Existing PDFs in this destination were not updated. Re-run with --pdf to replace them with this packet.");
    }
  } finally {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", interrupt);
  }
}

module.exports = { parseArgs, selectLessons, selectWorksheets, studentPacket, packetManifest, exportPacket, main };
if (require.main === module) main().catch(error => { console.error(`Course packet: ${error.message}`); process.exitCode = 1; });
