"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs, selectModule, selectLessons, selectWorksheets, studentPacket, packetManifest } = require("../tools/course-packet.js");

function runCli(args) {
  const scratch = path.join(__dirname, "../.scratch");
  fs.mkdirSync(scratch, { recursive: true });
  const directory = fs.mkdtempSync(path.join(scratch, "course-packet-test-"));
  const output = path.join(directory, "stdout.log");
  const errors = path.join(directory, "stderr.log");
  const handles = [];
  try {
    let result;
    try {
      handles.push(fs.openSync(output, "w"));
      handles.push(fs.openSync(errors, "w"));
      // File descriptors preserve actual CLI output in runners that restrict pipes.
      result = spawnSync(process.execPath, [path.join(__dirname, "../tools/course-packet.js"), ...args], {
        encoding: "utf8", timeout: 10000, stdio: ["ignore", ...handles],
        env: { ...process.env, CHROMIUM: "/missing-browser", CHROMEDRIVER: "/missing-driver" },
      });
    } finally {
      handles.forEach(handle => fs.closeSync(handle));
    }
    return { ...result, stdout: fs.readFileSync(output, "utf8"), stderr: fs.readFileSync(errors, "utf8") };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test("packet CLI rejects malformed bounds and missing values before launching a browser", () => {
  for (const args of [["--days", "31"], ["--days", "0"], ["--count", "1.5"], ["--count", "101"], ["--seed", " "], ["--seed", "a".repeat(141)], ["--out"], ["--seed", "--pdf"], ["--lessons", "1-1,"], ["--unknown"]]) {
    assert.throws(() => parseArgs(args), Error, JSON.stringify(args));
  }
  assert.deepEqual(parseArgs(["--days=3", "--count", "12", "--lessons", "1-2, 1-1", "--pdf"]).lessons, ["1-2", "1-1"]);
  const defaults = parseArgs([]);
  assert.equal(defaults.track, "common-core-math");
  assert.equal(defaults.grade, 8);
  assert.equal(defaults.unit, "all");
  assert.equal(defaults.days, 10);
  assert.equal(defaults.count, 20);
  assert.equal(defaults.mode, "rebuild");
  assert.equal(defaults.allWorksheets, false);
});

test("practice modes validate and explicit worksheet selection conflicts with all alternatives", () => {
  assert.equal(parseArgs(["--mode", "review"]).mode, "review");
  assert.equal(parseArgs(["--mode=rebuild"]).mode, "rebuild");
  for (const mode of ["mixed", "Rebuild", "true"]) assert.throws(() => parseArgs(["--mode", mode]), /--mode must be rebuild or review/);
  assert.throws(() => parseArgs(["--mode"]), /Missing value/);
  for (const args of [["--all-worksheets", "--worksheets", "A"], ["--worksheets=B", "--all-worksheets"]]) {
    assert.throws(() => parseArgs(args), /cannot be combined with --worksheets/);
  }
});

test("CLI rejects an invalid practice mode before launching a browser", () => {
  const result = runCli(["--mode", "unsupported"]);
  assert.ifError(result.error);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--mode must be rebuild or review/);
  assert.doesNotMatch(result.stderr, /executable|ChromeDriver/);
});

test("packet selection keeps course order and enforces the chosen unit", () => {
  const course = { units: [{ id: "topic-1", lessons: [{ id: "1-1" }, { id: "1-2" }] }, { id: "topic-2", lessons: [{ id: "2-1" }] }] };
  assert.deepEqual(selectLessons(course, { unit: "all" }), ["1-1", "1-2", "2-1"]);
  assert.deepEqual(selectLessons(course, { unit: "topic-1", lessons: ["1-2", "1-1", "1-2"] }), ["1-1", "1-2"]);
  assert.throws(() => selectLessons(course, { unit: "topic-1", lessons: ["2-1"] }), /outside the selected unit/);
  assert.throws(() => selectLessons(course, { unit: "topic-5" }), /Unknown unit/);
});

test("combined CLI packets record duplex layout and include their own printable artifact", () => {
  assert.throws(() => parseArgs(["--single-sided"]), /requires --combined/);
  for (const args of [["--combined", "--pdf"], ["--combined", "--single-sided", "--pdf"]]) {
    const options = parseArgs(args);
    const manifest = packetManifest({ id: "grade-8-math", title: "Math", revision: "v1" }, [], ["1-1"], options);
    assert.equal(manifest.printing.duplex, !args.includes("--single-sided"));
    assert.equal(manifest.files.length, 8);
    assert.ok(manifest.files.includes("nightly-packet.html"));
    assert.ok(manifest.files.includes("nightly-packet.pdf"));
  }
});

test("CLI worksheet choices select one alternative per night and survive student projection", () => {
  assert.deepEqual(parseArgs(["--days", "3", "--worksheets", "b,c,a"]).worksheetChoices, ["B", "C", "A"]);
  assert.deepEqual(parseArgs(["--days", "3", "--worksheets", "C"]).worksheetChoices, ["C", "C", "C"]);
  assert.deepEqual(parseArgs(["--days", "2"]).worksheetChoices, ["A", "A"]);
  for (const choices of ["D", "A,", "A,B,C", "A,B,C,D"]) assert.throws(() => parseArgs(["--days", "2", "--worksheets", choices]), /one choice per night/);
  const sheet = { day: 2, worksheetVariant: "C", code: "C-form", questions: [{ number: 1, prompt: "Prompt", workLines: 4, answer: "private", steps: ["private"] }] };
  assert.equal(studentPacket([sheet])[0].worksheetVariant, "C");
  const options = parseArgs(["--days", "2", "--worksheets", "B,C", "--mode", "review"]);
  const manifest = packetManifest({ id: "math", title: "Math", revision: "v1" }, [sheet], ["1-1"], options);
  assert.deepEqual(manifest.settings.worksheetChoices, ["B", "C"]);
  assert.equal(manifest.settings.practiceMode, "review");
  assert.equal(manifest.settings.allWorksheets, false);
  assert.equal(manifest.sheets[0].worksheetVariant, "C");
  assert.doesNotMatch(JSON.stringify(manifest), /private/);
});

test("all worksheet exports retain each alternative and the actual night count for replay", () => {
  const nights = Array.from({ length: 5 }, (_, index) => ({ day: index + 1,
    worksheets: ["A", "B", "C"].map(worksheetVariant => ({ day: index + 1, days: 5, worksheetVariant,
      code: `night-${index + 1}-${worksheetVariant}`, practiceMode: "rebuild", questions: Array.from({ length: 8 }, (_, number) => ({ number: number + 1, prompt: `${index + 1}-${worksheetVariant}-${number}` })) })) }));
  const options = parseArgs(["--all-worksheets", "--days", "5", "--count", "8", "--combined", "--mode", "rebuild"]);
  assert.equal(options.worksheetChoices, undefined);
  const selected = selectWorksheets(nights, parseArgs(["--days", "5", "--worksheets", "C,B,A,B,C"]));
  assert.deepEqual(selected.map(sheet => sheet.worksheetVariant), ["C", "B", "A", "B", "C"]);
  const packet = selectWorksheets(nights, options);
  assert.equal(packet.length, 15);
  assert.equal(packet.reduce((count, sheet) => count + sheet.questions.length, 0), 120);
  assert.strictEqual(packet[4], nights[1].worksheets[1], "reserve exports reuse the generated form and key");
  assert.ok(studentPacket(packet).every(sheet => sheet.days === 5 && sheet.practiceMode === "rebuild"));
  const manifest = packetManifest({ id: "math", title: "Math", revision: "v1" }, packet, ["1-1"], options);
  assert.equal(manifest.settings.days, 5);
  assert.equal(manifest.settings.practiceMode, "rebuild");
  assert.equal(manifest.settings.allWorksheets, true);
  assert.equal(manifest.settings.worksheetChoices, undefined);
  assert.equal(manifest.sheets.length, 15);
  assert.deepEqual(manifest.sheets.map(sheet => [sheet.day, sheet.worksheetVariant]), nights.flatMap(night => night.worksheets.map(sheet => [sheet.day, sheet.worksheetVariant])));
  assert.match(manifest.replayNote, /--all-worksheets/);
  assert.match(manifest.replayNote, /--mode/);
});

test("student projection keeps explicit practice directions and strips unrecognized nested metadata", () => {
  const expectations = { byHand: "Rewrite the fraction.", calculator: "Check only after your work.", showWork: "Show the division.", answerForm: "An exact decimal.", firstStep: "Identify numerator and denominator.", check: "Multiply back to check.", answer: "secret-answer", answerGraph: { points: [{ x: 8, y: 9 }] }, metadata: { private: "secret-metadata" } };
  const packet = [{ practiceMode: "rebuild", questions: [{ number: 1, prompt: "Convert the fraction.", workLines: 4, support: "guided", lessonId: "1-1", lessonTitle: "Rational numbers", expectations, answer: "secret-answer", steps: ["secret-step"], private: "secret-private" }] }];
  const output = studentPacket(packet);
  assert.equal(output[0].practiceMode, "rebuild");
  assert.deepEqual(output[0].questions[0], { number: 1, prompt: "Convert the fraction.", workLines: 4, support: "guided", lessonId: "1-1", lessonTitle: "Rational numbers", expectations: { byHand: expectations.byHand, calculator: expectations.calculator, showWork: expectations.showWork, answerForm: expectations.answerForm, firstStep: expectations.firstStep, check: expectations.check } });
  assert.doesNotMatch(JSON.stringify(output), /secret|answerGraph|metadata|"answer":|"steps":/);
  assert.equal(packet[0].questions[0].expectations.answer, "secret-answer", "projection does not mutate the worked key");
  packet[0].practiceMode = { answer: "secret-mode" };
  packet[0].questions[0].support = { answer: "secret-support" };
  packet[0].questions[0].expectations.firstStep = { answer: "secret-nested-answer" };
  assert.doesNotMatch(JSON.stringify(studentPacket(packet)), /secret/);
});

test("student renderer receives no solution model, even for answer-only graphs", () => {
  const table = { headers: ["x", "y"], rows: [["0", "1"]] };
  const graph = { xMin: -3, xMax: 3, yMin: -3, yMax: 3, xStep: 1, yStep: 1, xLabel: "x", yLabel: "y", points: [{ x: 1, y: 2, label: "solution-only-point" }], lines: [[{ x: 0, y: 0 }, { x: 1, y: 2 }]], check: "secret-graph-check" };
  const packet = [{ title: "Practice", code: "COURSE-form", version: "1", day: 1, courseId: "grade-8-math", seed: "packet/night-1", packetSeed: "packet", lessonIds: ["2-1"], warnings: ["1 problem repeats an earlier night."], identities: ["secret-identity"], questions: [{ number: 1, prompt: "Draw a line.", workLines: 4, table, answerGraph: graph, answer: "secret-answer", steps: ["secret-step"], check: { secret: true }, templateId: "secret-template", signature: "secret-signature" }] }];
  const output = studentPacket(packet);
  assert.deepEqual(output[0].questions[0], { number: 1, prompt: "Draw a line.", workLines: 4, table, graph: { xMin: -3, xMax: 3, yMin: -3, yMax: 3, xStep: 1, yStep: 1, xLabel: "x", yLabel: "y" } });
  assert.doesNotMatch(JSON.stringify(output), /secret|solution-only-point|answer|steps|check|identities/);
  packet[0].days = 10;
  for (const field of ["courseId", "seed", "packetSeed", "lessonIds", "warnings", "days"]) assert.deepEqual(studentPacket(packet)[0][field], packet[0][field]);
  assert.equal(packet[0].questions[0].answer, "secret-answer", "projection must preserve the answer packet");
  packet[0].questions[0].graph = { ...graph, points: [{ x: 0, y: 1 }] };
  assert.deepEqual(studentPacket(packet)[0].questions[0].graph.points, [{ x: 0, y: 1 }], "given graph data stays visible");
  assert.doesNotMatch(JSON.stringify(studentPacket(packet)), /secret|answerGraph|steps|check|identities/, "given graph metadata also stays out");
  packet[0].questions[0].graph.numberLine = true;
  assert.equal(studentPacket(packet)[0].questions[0].graph.numberLine, true);
});

test("packet help is usable without a browser or course build", () => {
  const result = runCli(["--help"]);
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /student-worksheets\.html/);
  assert.match(result.stdout, /--pdf/);
  assert.match(result.stdout, /--mode/);
  assert.match(result.stdout, /--all-worksheets/);
});

test("downloaded manifest records replay settings and form codes without solutions", () => {
  const manifest = packetManifest({ id: "grade-8-math", title: "Math", revision: "abcdef12" }, [{ day: 1, seed: "home/night-1", code: "COURSE-abcdef12-123", warnings: ["Some repeats"], questions: [{ answer: "secret-answer", steps: ["secret-step"] }] }], ["1-1", "1-2"], { count: 20, days: 1, seed: "home", pdf: true });
  assert.deepEqual(manifest.settings, { lessonIds: ["1-1", "1-2"], count: 20, days: 1, seed: "home", practiceMode: "rebuild", allWorksheets: false });
  assert.equal(manifest.course.revision, "abcdef12");
  assert.deepEqual(manifest.sheets, [{ day: 1, seed: "home/night-1", code: "COURSE-abcdef12-123", warnings: ["Some repeats"] }]);
  assert.equal(manifest.files.length, 6);
  assert.doesNotMatch(JSON.stringify(manifest), /secret|questions|steps/);
});


test("grade packet selection is explicit and legacy CLI exports remain compatible", () => {
  assert.strictEqual(require("../tools/course-packet.js"), require("../tools/lesson-packet.js"));
  const modules = [{ id: "grade-8-math", trackId: "common-core-math", grade: 8 }, { id: "sample-k", trackId: "common-core-math", grade: 0 }];
  assert.strictEqual(selectModule(modules, parseArgs([])), modules[0]);
  assert.strictEqual(selectModule(modules, parseArgs(["--track", "common-core-math", "--grade", "K"])), modules[1]);
  assert.strictEqual(selectModule(modules, parseArgs(["--course", "grade-8-math"])), modules[0]);
  assert.throws(() => selectModule(modules, parseArgs(["--grade", "7"])), /No expanded lessons.*grade 7/);
  assert.throws(() => selectModule(modules, parseArgs(["--track", "singapore-math"])), /No expanded lessons.*singapore/);
  for (const args of [["--course", "grade-8-math", "--grade", "8"], ["--track=common-core-math", "--course=grade-8-math"], ["--grade", "13"], ["--grade", "8.0"]]) assert.throws(() => parseArgs(args));
  const result = runCli(["--grade", "7"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /No expanded lessons.*grade 7/);
  assert.doesNotMatch(result.stderr, /executable|ChromeDriver/);
  const manifest = packetManifest({ ...modules[0], title: "Math", revision: "v1" }, [], [], parseArgs([]));
  assert.equal(manifest.course.trackId, "common-core-math");
  assert.equal(manifest.course.grade, 8);
});
