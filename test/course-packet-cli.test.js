"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { parseArgs, selectLessons, studentPacket, packetManifest } = require("../tools/course-packet.js");

test("packet CLI rejects malformed bounds and missing values before launching a browser", () => {
  for (const args of [["--days", "31"], ["--days", "0"], ["--count", "1.5"], ["--count", "101"], ["--seed", " "], ["--seed", "a".repeat(141)], ["--out"], ["--seed", "--pdf"], ["--lessons", "1-1,"], ["--unknown"]]) {
    assert.throws(() => parseArgs(args), Error, JSON.stringify(args));
  }
  assert.deepEqual(parseArgs(["--days=3", "--count", "12", "--lessons", "1-2, 1-1", "--pdf"]).lessons, ["1-2", "1-1"]);
  const defaults = parseArgs([]);
  assert.equal(defaults.course, "grade-8-math");
  assert.equal(defaults.unit, "all");
  assert.equal(defaults.days, 10);
  assert.equal(defaults.count, 20);
});

test("packet selection keeps course order and enforces the chosen unit", () => {
  const course = { units: [{ id: "topic-1", lessons: [{ id: "1-1" }, { id: "1-2" }] }, { id: "topic-2", lessons: [{ id: "2-1" }] }] };
  assert.deepEqual(selectLessons(course, { unit: "all" }), ["1-1", "1-2", "2-1"]);
  assert.deepEqual(selectLessons(course, { unit: "topic-1", lessons: ["1-2", "1-1", "1-2"] }), ["1-1", "1-2"]);
  assert.throws(() => selectLessons(course, { unit: "topic-1", lessons: ["2-1"] }), /outside the selected unit/);
  assert.throws(() => selectLessons(course, { unit: "topic-5" }), /Unknown unit/);
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
  const result = spawnSync(process.execPath, [path.join(__dirname, "../tools/course-packet.js"), "--help"], { encoding: "utf8", timeout: 10000, env: { ...process.env, CHROMIUM: "/missing-browser", CHROMEDRIVER: "/missing-driver" } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /student-worksheets\.html/);
  assert.match(result.stdout, /--pdf/);
});

test("downloaded manifest records replay settings and form codes without solutions", () => {
  const manifest = packetManifest({ id: "grade-8-math", title: "Math", revision: "abcdef12" }, [{ day: 1, seed: "home/night-1", code: "COURSE-abcdef12-123", warnings: ["Some repeats"], questions: [{ answer: "secret-answer", steps: ["secret-step"] }] }], ["1-1", "1-2"], { count: 20, days: 1, seed: "home", pdf: true });
  assert.deepEqual(manifest.settings, { lessonIds: ["1-1", "1-2"], count: 20, days: 1, seed: "home" });
  assert.equal(manifest.course.revision, "abcdef12");
  assert.deepEqual(manifest.sheets, [{ day: 1, seed: "home/night-1", code: "COURSE-abcdef12-123", warnings: ["Some repeats"] }]);
  assert.equal(manifest.files.length, 6);
  assert.doesNotMatch(JSON.stringify(manifest), /secret|questions|steps/);
});
