"use strict";

// Synthetic, test-only AP course. Three authored weeks exercise every
// optional weekly field (figures given and answer-only, explanation figures,
// multiple choice, free response with rubrics, calculator policies,
// suggested minutes, pipe tables); weeks 4–36 are generic filler so the
// course passes the 36-week contract. Not course content.

const fs = require("node:fs");
const path = require("node:path");
const K = require("../../../tools/lib/figure-kit");

const COURSES = ["calculus-ab", "physics-1", "physics-c-mechanics"];

function plan() {
  const source = { id: "fixture-ced", title: "Fixture course framework", publisher: "Liminal test fixture", edition: "Synthetic", url: "https://example.org/fixture-ced", accessed: "2026-10-08", note: "Synthetic test reference; not a College Board document." };
  const standards = [];
  const courses = COURSES.map((id, c) => {
    const refs = [1, 2].map(u => ({ id: `FX${c}.${u}`, label: `Fixture topic ${c}.${u}`, sourceId: source.id, locator: `Unit ${u}`, gradeBand: "AP course; flexible placement", kind: "content" }));
    standards.push(...refs);
    return { id, title: { "calculus-ab": "Course for AP® Calculus AB", "physics-1": "Course for AP® Physics 1", "physics-c-mechanics": "Course for AP® Physics C: Mechanics" }[id],
      summary: "Fixture course.", scopeNote: "Synthetic fixture; not an authorized AP course.", prerequisites: ["Fixture prerequisite"], outcomes: ["Fixture outcome"], nextStep: "Fixture next step.",
      units: refs.map((ref, u) => ({ id: "u" + (u + 1), title: "Fixture unit " + (u + 1), weeks: u === 0 ? 3 : 33, focus: "Fixture focus.", learning: ["Fixture learning."], standards: [ref.id], activities: ["Fixture activity."], evidence: ["Fixture evidence."], bridge: "Fixture bridge." })) };
  });
  return { version: 1, track: { id: "ap", title: "Courses for AP® exams", description: "Fixture plans.", scopeNote: "Synthetic fixture." }, sources: [source], standards, courses };
}

function figures() {
  const out = new Map();
  {
    const G = K.graph({ xMin: -1, xMax: 4, yMin: -2, yMax: 6, xName: "x", yName: "y", width: 260, height: 200 });
    out.set("fx-w01-f1", K.svg(G.width, G.height, G.grid(), G.axes(), G.curve(x => x * x - 2 * x), G.point(3, 3)));
  }
  {
    const G = K.graph({ xMin: 0, xMax: 4, yMin: 0, yMax: 5, xName: "x", yName: "y", width: 240, height: 170 });
    out.set("fx-w01-f2", K.svg(G.width, G.height, G.grid(), G.axes(), G.riemann(x => 1 + x, 0, 4, 4, "left"), G.curve(x => 1 + x)));
  }
  {
    const G = K.graph({ xMin: -2, xMax: 2, yMin: -2, yMax: 2, xName: "x", yName: "y", equal: true, width: 220, grid: false });
    out.set("fx-w02-f1", K.svg(G.width, G.height, G.axes(), G.slopeField((x, y) => x + y)));
    out.set("fx-w02-f2", K.svg(G.width, G.height, G.axes(), G.slopeField((x, y) => x + y), G.curve(x => -x - 1 + Math.exp(x), { width: 2.5 })));
  }
  out.set("fx-w03-f1", K.svg(330, 230, K.incline({ x: 30, y: 200, base: 260, angle: 30, block: { w: 46, h: 30, label: "m" } })));
  out.set("fx-w03-f2", K.svg(220, 220, K.fbd({ cx: 110, cy: 110, forces: [{ angle: 120, length: 62, label: "F_N" }, { angle: -90, length: 72, label: "F_g" }, { angle: 30, length: 40, label: "f" }] })));
  out.set("fx-w03-f3", K.svg(240, 140, K.wall(30, 40, 120), K.ground(30, 220, 120), K.spring(30, 98, 140, 98, { label: "k" }), K.block(164, 98, 48, 44, { label: "m" })));
  return out;
}

const DAYS = ["Notice the idea.", "Model it with an example.", "Practise with support.", "Practise independently.", "Check understanding."];
const EXPLANATION = ["Fixture explanation paragraph about the representation.", "Fixture explanation paragraph about the method.", "Fixture explanation paragraph about a common error."];
function filler(week, name) {
  return { id: `fx-w${week}-${name}`, prompt: `Fixture filler task ${name} for week ${week}.`, answer: "Filler answer " + name,
    steps: ["Identify the fixture quantity.", "Apply the fixture rule.", "Check the fixture result."], passageIds: [], skill: "Fixture skill" };
}
function fillerWeek(week, unitId, standard) {
  return { week, unitId, title: "Fixture week " + week, objective: "Practise the fixture objective.", standards: [standard],
    connection: { before: "Earlier fixture work.", after: "Later fixture work." }, days: DAYS.slice(), explanation: EXPLANATION.slice(),
    examples: [filler(week, "example-1"), filler(week, "example-2")].map(({ id, skill, ...rest }) => rest), passages: [],
    worksheets: ["a", "b", "c"].map(id => ({ id, title: "Fixture sheet " + id, directions: "Show your reasoning.", items: Array.from({ length: 6 }, (_, i) => filler(week, id + (i + 1))) })) };
}
function mc(id, prompt, choices, key, extra = {}) {
  return { id, prompt, choices, key, answer: `(${key}) ${choices["ABCD".indexOf(key)]}`, steps: ["Fixture reasoning step one.", "Fixture reasoning step two."], passageIds: [], skill: "Fixture multiple choice", ...extra };
}
function fr(id, prompt, rubric, extra = {}) {
  return { id, prompt, points: rubric.reduce((s, r) => s + r.points, 0), rubric, answer: "Fixture model response for " + id + ".", steps: ["Fixture scoring step one.", "Fixture scoring step two."], passageIds: [], skill: "Fixture free response", ...extra };
}

function course() {
  const p = plan().courses[0];
  const weeks = [];
  // Week 1: given graph figures, multiple choice, a pipe table, no calculator.
  const w1 = fillerWeek(1, "u1", p.units[0].standards[0]);
  w1.title = "Fixture graphs and tables";
  w1.figures = [{ id: "fx-w01-f1", alt: "Parabola on an xy-plane with x from −1 to 4 and a marked point at (3, 3).", caption: "Graph of f" }, { id: "fx-w01-f2", alt: "Four left rectangles under an increasing line on 0 to 4." }];
  w1.explanationFigureIds = ["fx-w01-f2"];
  w1.examples[0] = { prompt: "Use the graph of f to estimate f(3).", figureIds: ["fx-w01-f1"], choices: ["1", "2", "3", "4"], key: "C", answer: "(C) 3", steps: ["Find x = 3 on the graph.", "Read the marked point.", "The value is 3."] };
  w1.worksheets[0].calculator = "none"; w1.worksheets[0].minutes = 15;
  w1.worksheets[0].items[0] = mc("fx-w1-a1", "The marked point on the graph has which y-coordinate?", ["0", "1", "3", "9"], "C", { figureIds: ["fx-w01-f1"] });
  w1.worksheets[0].items[1] = mc("fx-w1-a2", "A table gives values of g.\n\n| x | 0 | 1 | 2 |\n| --- | --- | --- | --- |\n| g(x) | 4 | 7 | 12 |\n\nWhat is the average rate of change of g on [0, 2]?", ["3", "4", "6", "8"], "B");
  w1.worksheets[1].calculator = "graphing"; w1.worksheets[1].minutes = 20;
  w1.worksheets[1].items[0] = { ...filler(1, "b1"), prompt: "Estimate the area under the line with four left rectangles.", figureIds: ["fx-w01-f2"] };
  weeks.push(w1);
  // Week 2: answer-only figure (a sketched solution) and free response with a rubric.
  const w2 = fillerWeek(2, "u1", p.units[0].standards[0]);
  w2.title = "Fixture slope fields";
  w2.figures = [{ id: "fx-w02-f1", alt: "Slope field for dy/dx = x + y on a square window from −2 to 2." }, { id: "fx-w02-f2", alt: "The same slope field with the solution curve through (0, 0) sketched.", caption: "Key sketch" }];
  w2.worksheets[0].calculator = "none";
  w2.worksheets[0].items[0] = fr("fx-w2-a1", "Sketch the solution curve through (0, 0) on the slope field, then explain how its slope changes.",
    [{ points: 1, criterion: "Curve passes through (0, 0) with slope 0 there." }, { points: 1, criterion: "Curve follows the segments in each quadrant." }, { points: 1, criterion: "Explanation names the sign of x + y." }],
    { figureIds: ["fx-w02-f1"], answerFigureIds: ["fx-w02-f2"] });
  w2.worksheets[2].items[0] = fr("fx-w2-c1", "Justify why the solution through (0, 0) is decreasing nowhere on 0 < x < 1.", [{ points: 2, criterion: "States that dy/dx = x + y > 0 for points reached there, with a reason." }]);
  weeks.push(w2);
  // Week 3: physics figures, any calculator, example with given and answer figures.
  const w3 = fillerWeek(3, "u1", p.units[0].standards[0]);
  w3.title = "Fixture forces";
  w3.figures = [{ id: "fx-w03-f1", alt: "A block of mass m at rest on a ramp inclined at angle θ.", notToScale: true }, { id: "fx-w03-f2", alt: "Free-body diagram: normal force perpendicular to the ramp, weight downward, friction up the ramp." }, { id: "fx-w03-f3", alt: "A block attached to a horizontal spring fixed to a wall." }];
  w3.examples[1] = { prompt: "Draw a free-body diagram for the block on the ramp.", figureIds: ["fx-w03-f1"], answerFigureIds: ["fx-w03-f2"], answer: "Three forces act on the block.", steps: ["Weight acts downward.", "The normal force is perpendicular to the surface.", "Static friction points up the slope."] };
  for (const sheet of w3.worksheets) sheet.calculator = "any";
  w3.worksheets[0].items[0] = mc("fx-w3-a1", "The block attached to the spring is pulled 0.10 m to the right and released. Which quantity is greatest at the release point?", ["Speed", "Kinetic energy", "Magnitude of acceleration", "Momentum"], "C", { figureIds: ["fx-w03-f3"] });
  w3.worksheets[0].items[1] = fr("fx-w3-a2", "A 2.0 kg block rests on the ramp shown with θ = 30°. Find the friction force (g = 9.8 m/s^2).",
    [{ points: 1, criterion: "Identifies friction balancing the component of weight along the slope." }, { points: 1, criterion: "Computes 9.8 N (accept 9.7–9.9 N) with units." }], { figureIds: ["fx-w03-f1"] });
  weeks.push(w3);
  for (let week = 4; week <= 36; week++) weeks.push(fillerWeek(week, "u2", p.units[1].standards[0]));
  return { format: "liminal-weekly-course", version: 1, trackId: "ap", courseId: "calculus-ab", author: "test-fixture", weeks };
}

// Writes the fixture as a content/weekly tree: ap/calculus-ab.json and its
// figure files. Returns the directory.
function writeContent(directory) {
  fs.mkdirSync(path.join(directory, "ap"), { recursive: true });
  fs.writeFileSync(path.join(directory, "ap/calculus-ab.json"), JSON.stringify(course(), null, 2) + "\n");
  const figureDir = path.join(directory, "figures/ap/calculus-ab");
  fs.mkdirSync(figureDir, { recursive: true });
  for (const [id, svg] of figures()) fs.writeFileSync(path.join(figureDir, id + ".svg"), svg);
  return directory;
}

module.exports = { plan, figures, course, writeContent };
