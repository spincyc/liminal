#!/usr/bin/env node
"use strict";

// Validates the AP® course modules: the plan metadata (content/ap.json), unit
// tests and practice exams (content/ap/assessments/<course>/<id>.json, format
// liminal-ap-assessment v1), formula references
// (content/ap/references/<course>.json), their figures
// (content/ap/figures/<course>/<figureId>.svg), duplicates against the AP
// weekly courses, topic coverage, the claims lint, and the trademark
// disclaimer on pages that use the marks.
//
//   node tools/check-ap.js               # everything that exists must be valid
//   node tools/check-ap.js --complete    # also require every test, exam, reference and full coverage
//   node tools/check-ap.js --content <dir> --pages <dir>   # alternate roots (tests, built dist/)

const fs = require("node:fs");
const path = require("node:path");
const A = require("../src/lib/ap-assessment");
const { checkFigureSvg, FIGURE_ID } = require("./lib/weekly-figures");

const ROOT = path.resolve(__dirname, "..");
const COURSE_CALCULATORS = { "calculus-ab": ["none", "graphing"], "calculus-bc": ["none", "graphing"], "physics-1": ["any"], "physics-c-mechanics": ["any"] };
const PHYSICS = new Set(["physics-1", "physics-c-mechanics"]);
const MAX_ASSESSMENT_BYTES = 1024 * 1024;

// Authoring guard, mirroring tools/build-weekly.js: content is plain text
// (the browser inserts text nodes), with no markup or LaTeX delimiters.
const assignedAttribute = String.raw`[a-z_:][a-z0-9_.:-]*\s*=\s*(?:"[^"<>]*"|'[^'<>]*'|[^\s"'=<>\x60]+)`;
const markup = new RegExp(String.raw`<!--|<!doctype\b|<\/?[a-z][a-z0-9:-]*(?:\s+${assignedAttribute})*\s*\/?>`, "i");
function safeHttps(value) {
  if (typeof value !== "string" || !/^https:\/\/[^/?#]/.test(value) || /[\s\\<>"'\u0000-\u001f\u007f]/.test(value)) return false;
  try { const url = new URL(value); return url.protocol === "https:" && !!url.hostname && !url.username && !url.password; } catch { return false; }
}
function validDate(value) {
  const time = Date.parse(value);
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

function collector() {
  const problems = [];
  const fail = (where, message) => problems.push(where + ": " + message);
  const check = (condition, where, message) => { if (!condition) fail(where, message); return !!condition; };
  const text = (value, where) => check(typeof value === "string" && value.trim().length > 0, where, "missing text");
  const list = (value, minimum, where) => check(Array.isArray(value) && value.length >= minimum && value.every(v => typeof v === "string" && v.trim()), where, `needs at least ${minimum} text entries`);
  const unique = (values, where) => check(new Set(values).size === values.length, where, "duplicate IDs");
  const records = (value, where) => check(Array.isArray(value) && value.every(v => v && typeof v === "object" && !Array.isArray(v)), where, "needs a list of objects");
  function plain(value, where) {
    for (const { where: at, text: string } of A.strings(value, where)) {
      if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(string) || markup.test(string)) fail(at, "non-plain text (markup or control characters)");
      if (/\\[()[\]]|\$\$/.test(string)) fail(at, "LaTeX delimiters");
    }
  }
  function claims(value, where) {
    for (const { where: at, text: string } of A.strings(value, where)) {
      for (const found of A.claimProblems(string)) fail(at, `banned claim (${found.claim}): "${found.sentence.slice(0, 120)}"`);
    }
  }
  return { problems, fail, check, text, list, unique, records, plain, claims };
}

function readJson(file, c) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (error) { c.fail(path.relative(ROOT, file), "unreadable JSON (" + error.message + ")"); return null; }
}

// content/ap.json: the plan contract shared with the weekly build's named-track
// plans (units, standards, sources), plus AP schedule, exam and blueprints.
function planShape(plan, c) {
  const before = c.problems.length;
  for (const key of ["sources", "standards", "courses"]) if (!c.records(plan[key], "ap." + key)) return false;
  plan.standards.forEach((standard, i) => c.text(standard.id, "ap.standards[" + i + "].id"));
  plan.courses.forEach((course, n) => {
    const where = "ap.courses[" + n + "]";
    if (course.prerequisiteLinks !== undefined) c.records(course.prerequisiteLinks, where + ".prerequisiteLinks");
    if (c.records(course.units, where + ".units")) course.units.forEach((unit, i) => {
      c.list(unit.standards, 1, where + ".units[" + i + "].standards");
      c.check(Number.isInteger(unit.weeks) && unit.weeks > 0 && unit.weeks <= 36, where + ".units[" + i + "].weeks", "needs a whole week count from 1 to 36");
    });
    if (c.records(course.schedule, where + ".schedule")) course.schedule.forEach((entry, i) => c.list(entry.standards, 1, where + ".schedule[" + i + "].standards"));
    const exam = course.exam;
    if (!c.check(exam && typeof exam === "object" && !Array.isArray(exam), where + ".exam", "needs exam facts")) return;
    if (c.records(exam.sections, where + ".exam.sections")) exam.sections.forEach((section, i) => c.records(section.parts, where + ".exam.sections[" + i + "].parts"));
    const blueprints = course.blueprints;
    if (!c.check(blueprints && typeof blueprints === "object", where + ".blueprints", "needs assessment blueprints")) return;
    for (const kind of ["unitTest", "practiceExam"]) c.check(blueprints[kind] && typeof blueprints[kind] === "object" && !Array.isArray(blueprints[kind]), where + ".blueprints." + kind, "needs a blueprint");
    if (blueprints.unitTest && c.records(blueprints.unitTest.sections, where + ".blueprints.unitTest.sections")) {
      blueprints.unitTest.sections.forEach((section, i) => c.records(section.parts, where + ".blueprints.unitTest.sections[" + i + "].parts"));
    }
  });
  return c.problems.length === before;
}
function validatePlan(plan, c) {
  if (!c.check(plan && plan.version === 1 && plan.track && plan.track.id === "ap", "content/ap.json", "needs version 1 and track ap")) return;
  if (!planShape(plan, c)) return;
  c.plain(plan, "ap");
  c.claims(plan, "ap");
  for (const key of ["title", "description", "scopeNote"]) c.text(plan.track[key], "ap.track." + key);
  c.check(plan.notice === A.DISCLAIMER, "ap.notice", "must be the exact trademark disclaimer");
  c.check(Array.isArray(plan.sources) && Array.isArray(plan.standards) && Array.isArray(plan.courses), "ap", "needs sources, standards and courses");
  if (!Array.isArray(plan.sources) || !Array.isArray(plan.standards) || !Array.isArray(plan.courses)) return;
  c.unique(plan.sources.map(s => s.id), "ap.sources");
  c.unique(plan.standards.map(s => s.id), "ap.standards");
  for (const source of plan.sources) {
    for (const key of ["id", "title", "publisher", "edition", "note"]) c.text(source[key], "source " + source.id + "." + key);
    c.check(safeHttps(source.url), "source " + source.id, "needs an https URL");
    c.check(validDate(source.accessed), "source " + source.id, "needs an accessed date (YYYY-MM-DD)");
  }
  for (const standard of plan.standards) {
    for (const key of ["id", "label", "locator", "gradeBand"]) c.text(standard[key], "reference " + standard.id + "." + key);
    c.check(plan.sources.some(s => s.id === standard.sourceId), "reference " + standard.id, "unresolved source");
    c.check(["content", "editorial-objective"].includes(standard.kind), "reference " + standard.id, "kind must be content or editorial-objective");
    if (standard.kind === "content") c.check(!standard.id.startsWith("BC.") && A.topicUnit(standard.id) !== null, "reference " + standard.id, "content references look like AB.1.2");
    if (standard.id.startsWith("BC.")) {
      c.check(standard.kind === "editorial-objective", "reference " + standard.id, "BC references are editorial objectives, not numbered CED topics");
      c.check(A.isAssessmentTopic(standard, "calculus-bc") || ["BC.REVIEW", "BC.BEYOND"].includes(standard.id), "reference " + standard.id, "BC objectives use BC.<1–10>.<DESCRIPTIVE_UPPERCASE_SLUG>");
      if (A.isAssessmentTopic(standard, "calculus-bc")) {
        const source = plan.sources.find(s => s.id === standard.sourceId);
        c.check(source && /^https:\/\/apcentral\.collegeboard\.org\/courses\/ap-calculus-bc\/?(?:#.*)?$/.test(source.url), "reference " + standard.id, "BC objectives cite the official HTML course unit overview");
      }
    }
  }
  c.check(JSON.stringify(plan.courses.map(course => course.id)) === JSON.stringify(A.COURSES), "ap.courses", "must be " + A.COURSES.join(", ") + " in order");
  const covered = new Set();
  for (const course of plan.courses) {
    const where = "ap." + course.id;
    if (!A.COURSES.includes(course.id)) continue;
    const prefix = A.TOPIC_PREFIX[course.id];
    for (const key of ["title", "shortTitle", "examName", "summary", "scopeNote", "nextStep", "referenceNote", "calculatorNote"]) c.text(course[key], where + "." + key);
    c.list(course.prerequisites, 1, where + ".prerequisites");
    c.list(course.outcomes, 1, where + ".outcomes");
    c.check(course.grade === undefined && course.source === undefined, where, "named plans have no grade or source alias");
    c.check(/^Course for AP® /.test(course.title), where + ".title", "reads \"Course for AP® …\" (referential use)");
    (course.prerequisiteLinks || []).forEach((entry, i) => {
      c.text(entry.label, where + ".prerequisiteLinks." + i);
      c.check(/^(?:high-school|ap)\.html#[a-z0-9-]+$/.test(entry.href || ""), where + ".prerequisiteLinks." + i, "links to a local plan page");
    });
    if (PHYSICS.has(course.id)) {
      c.check(course.reference === course.id, where + ".reference", "physics courses have a formula reference named for the course");
      c.check(typeof course.labNote === "string" && /25%/.test(course.labNote) && /do not replace/i.test(course.labNote), where + ".labNote", "must state that paper investigations do not replace the required lab work");
    } else c.check(course.reference === null, where + ".reference", "Calculus has no formula reference");
    if (!c.check(Array.isArray(course.units) && course.units.length > 1, where, "needs units")) continue;
    c.unique(course.units.map(u => u.id), where + ".units");
    c.check(course.units.reduce((sum, u) => sum + u.weeks, 0) === 36, where, "units must total 36 weeks");
    const contentUnits = course.units.filter(u => u.unit !== null);
    const review = course.units[course.units.length - 1];
    if (course.id === "calculus-bc") {
      c.check(contentUnits.length === 10 && course.units.length === 11, where + ".units", "BC needs ten instructional units and a final review unit");
      const weights = ["5–10%", "5–10%", "5–10%", "5–10%", "10–15%", "15–20%", "5–10%", "5–10%", "10–15%", "15–20%"];
      c.check(JSON.stringify(contentUnits.map(u => u.mcWeight)) === JSON.stringify(weights), where + ".units", "BC weights must match the sourced course overview");
    }
    course.units.forEach((unit, index) => {
      const at = where + "." + unit.id;
      c.check(unit.id === "u" + (index + 1), at, "units are u1, u2, … in order");
      c.check(Number.isInteger(unit.weeks) && unit.weeks > 0, at, "needs a positive week count");
      for (const key of ["title", "focus", "bridge"]) c.text(unit[key], at + "." + key);
      for (const key of ["learning", "standards", "activities", "evidence"]) c.list(unit[key], 1, at + "." + key);
      c.unique(unit.standards || [], at + ".standards");
      (unit.standards || []).forEach(ref => {
        const standard = plan.standards.find(s => s.id === ref);
        if (!c.check(standard, at, "unresolved reference " + ref)) return;
        c.check(ref.startsWith(prefix + "."), at, "reference from another course " + ref);
        covered.add(ref);
        if (A.isAssessmentTopic(standard, course.id)) c.check(A.topicUnit(ref) === unit.unit, at, ref + " belongs to unit " + A.topicUnit(ref));
      });
      if (unit.unit !== null) {
        const expected = A.topicsForUnit(plan, course.id, unit.unit).map(s => s.id);
        if (course.id === "physics-c-mechanics" && unit.unit === 1) expected.push("CM.TOOLKIT");
        c.check(JSON.stringify([...unit.standards].sort()) === JSON.stringify(expected.sort()), at + ".standards", (course.id === "calculus-bc" ? "must contain exactly the unit's course objectives" : "must contain exactly the unit's framework topics") + (course.id === "physics-c-mechanics" && unit.unit === 1 ? " and CM.TOOLKIT" : ""));
      }
      c.check(unit.test === (unit === review ? "practice-exam" : "unit-" + unit.unit), at + ".test", "content units name unit-<n>; the final review unit names practice-exam");
    });
    c.check(review.unit === null && contentUnits.length === course.units.length - 1, where, "the last unit is the editorial review unit (unit: null)");
    c.check(contentUnits.every((u, i) => u.unit === i + 1), where, "content units follow the framework's unit numbers");
    // Schedule: one entry per week with topic references inside its unit.
    const pacing = course.units.flatMap(u => Array(u.weeks).fill(u));
    if (c.check(Array.isArray(course.schedule) && course.schedule.length === 36, where + ".schedule", "needs 36 weeks")) {
      const placed = new Map();
      course.schedule.forEach((entry, index) => {
        const at = where + ".schedule.week-" + (index + 1);
        c.check(entry.week === index + 1, at, "weeks run 1–36 in order");
        c.check(pacing[index] && entry.unitId === pacing[index].id, at, "wrong unit for the pacing (expected " + (pacing[index] && pacing[index].id) + ")");
        c.text(entry.title, at + ".title");
        c.check(Array.isArray(entry.standards) && entry.standards.length > 0 && entry.standards.every(ref => pacing[index] && pacing[index].standards.includes(ref)), at, "references must belong to the week's unit");
        if (entry.assessment !== undefined) {
          c.check(!placed.has(entry.assessment), at, "assessment placed twice: " + entry.assessment);
          placed.set(entry.assessment, entry.week);
        }
        c.check(entry.investigation === undefined || entry.investigation === true, at, "investigation is true or absent");
      });
      course.units.forEach(unit => {
        const end = pacing.lastIndexOf(unit) + 1;
        if (unit.test === "practice-exam") c.check(placed.has("practice-exam") && course.schedule[placed.get("practice-exam") - 1]?.unitId === unit.id, where, "the practice exam is placed in the review unit");
        else c.check(placed.get(unit.test) === end, where, unit.test + " is placed in the unit's last week (" + end + ")");
      });
      c.check(placed.get("practice-exam") === 33, where + ".schedule", "the practice exam is placed in week 33");
      c.check(placed.size === course.units.length, where + ".schedule", "every unit's assessment is placed once");
      const scheduled = new Set(course.schedule.flatMap(entry => entry.standards || []));
      plan.standards.filter(s => s.id.startsWith(prefix + ".")).forEach(s => c.check(scheduled.has(s.id), where + ".schedule", "no week covers " + s.id));
      if (PHYSICS.has(course.id)) contentUnits.forEach(unit => c.check(course.schedule.some(e => e.unitId === unit.id && e.investigation), where + "." + unit.id, "needs at least one paper investigation week"));
    }
    // Exam facts and blueprints.
    const exam = course.exam;
    if (c.check(exam && Array.isArray(exam.sections) && exam.sections.length === 2, where + ".exam", "needs two sections")) {
      for (const key of ["name", "effective", "delivery", "calculator", "reference"]) c.text(exam[key], where + ".exam." + key);
      c.list(exam.notes, 1, where + ".exam.notes");
      c.check(plan.sources.some(s => s.id === exam.sourceId), where + ".exam", "unresolved source");
      c.check(validDate(exam.checked), where + ".exam.checked", "needs a date");
      exam.sections.forEach((section, i) => {
        c.check(section.id === ["I", "II"][i], where + ".exam", "sections are I and II in order");
        c.text(section.title, where + ".exam." + section.id + ".title");
        c.text(section.weight, where + ".exam." + section.id + ".weight");
        c.check(section.parts.length > 0, where + ".exam." + section.id, "needs parts");
        section.parts.forEach((part, j) => {
          c.check(part.id === String.fromCharCode(65 + j), where + ".exam." + section.id, "parts are A, B, … in order");
          c.check(Number.isInteger(part.questions) && part.questions > 0 && Number.isInteger(part.minutes) && part.minutes > 0, where + ".exam." + section.id + part.id, "needs question and minute counts");
          c.check(COURSE_CALCULATORS[course.id].includes(part.calculator), where + ".exam." + section.id + part.id, "calculator policy not allowed for the course");
        });
      });
      if (course.id === "calculus-bc") {
        const shape = sections => sections.map(s => s.parts.map(p => [p.questions, p.minutes, p.calculator]));
        c.check(JSON.stringify(shape(exam.sections)) === JSON.stringify([[[29, 62, "none"], [13, 38, "graphing"]], [[2, 30, "graphing"], [4, 60, "none"]]]), where + ".exam", "BC exam parts must match the May 2027 counts, minutes and calculator policies");
      }
      const mc = exam.sections[0].parts.reduce((s, p) => s + p.questions, 0);
      const blueprint = course.blueprints && course.blueprints.practiceExam;
      if (c.check(blueprint && blueprint.mcByUnit, where + ".blueprints.practiceExam", "needs mcByUnit")) {
        c.check(typeof blueprint.mcByUnit === "object" && !Array.isArray(blueprint.mcByUnit) && Object.values(blueprint.mcByUnit).every(n => Number.isInteger(n) && n > 0), where + ".blueprints.practiceExam.mcByUnit", "needs positive whole question counts");
        const units = Object.keys(blueprint.mcByUnit).map(Number);
        c.check(JSON.stringify(units) === JSON.stringify(contentUnits.map(u => u.unit)), where + ".blueprints.practiceExam", "mcByUnit names every content unit");
        c.check(units.reduce((s, u) => s + blueprint.mcByUnit[u], 0) === mc, where + ".blueprints.practiceExam", "mcByUnit must total " + mc);
        contentUnits.forEach(unit => {
          const range = /^(\d+)–(\d+)%$/.exec(unit.mcWeight || "");
          if (!c.check(range, where + "." + unit.id + ".mcWeight", "needs a weighting like 10–15%")) return;
          const share = blueprint.mcByUnit[unit.unit] / mc * 100;
          c.check(share >= Number(range[1]) && share <= Number(range[2]), where + ".blueprints.practiceExam", `unit ${unit.unit} share ${share.toFixed(1)}% is outside ${unit.mcWeight}`);
        });
      }
      const unitTest = course.blueprints && course.blueprints.unitTest;
      if (course.id === "calculus-bc") {
        const shape = unitTest.sections.map(s => s.parts.map(p => [p.questions, p.calculator]));
        c.check(JSON.stringify(shape) === JSON.stringify([[[8, "none"], [4, "graphing"]], [[1, "graphing"], [1, "none"]]]), where + ".blueprints.unitTest", "BC unit tests require the calculus four-part blueprint");
      }
      c.check(Array.isArray(unitTest.minutes) && unitTest.minutes.length === 2 && unitTest.minutes.every(n => Number.isInteger(n) && n > 0) && unitTest.minutes[0] <= unitTest.minutes[1], where + ".blueprints.unitTest", "needs a valid minutes range");
      c.check(unitTest.sections.length === 2, where + ".blueprints.unitTest", "needs two sections");
      unitTest.sections.forEach((section, i) => {
        const at = where + ".blueprints.unitTest." + section.id;
        c.check(section.id === ["I", "II"][i] && section.kind === ["mc", "fr"][i], at, "sections are I (mc) and II (fr) in order");
        c.check(section.parts.length > 0, at, "needs parts");
        section.parts.forEach((part, j) => {
          c.check(part.id === String.fromCharCode(65 + j), at, "parts are A, B, … in order");
          c.check(Number.isInteger(part.questions) && part.questions > 0, at, "needs whole question counts");
          c.check(COURSE_CALCULATORS[course.id].includes(part.calculator), at, "calculator policy not allowed for the course");
        });
      });
      for (const [kind, rule] of Object.entries(course.blueprints)) {
        if (!["unitTest", "practiceExam"].includes(kind)) continue;
        const at = where + ".blueprints." + kind;
        if (PHYSICS.has(course.id)) {
          c.check(rule.frTypes && typeof rule.frTypes === "object" && JSON.stringify(Object.keys(rule.frTypes).sort()) === JSON.stringify(Object.keys(A.FR_TYPES).sort()) && Object.values(rule.frTypes).every(n => Number.isInteger(n) && n > 0), at, "needs whole point values for every physics free-response type");
          c.check(kind === "unitTest" ? rule.distinctFrTypes === true : rule.oneOfEachFrType === true, at, "must require distinct free-response types");
          if (kind === "unitTest") c.check(Number.isInteger(rule.minTypeUsesAcrossUnitTests) && rule.minTypeUsesAcrossUnitTests >= 3, at, "must require every free-response type in at least three unit tests");
        } else {
          c.check(Number.isInteger(rule.frPoints) && rule.frPoints > 0, at, "needs whole free-response points");
          if (course.id === "calculus-bc") c.check(rule.frPoints === 9, at, "BC free-response questions are worth nine points");
          if (kind === "practiceExam") c.check(Number.isInteger(rule.minContextFr) && rule.minContextFr >= 2, at, "must require at least two free-response questions in context");
        }
      }
    }
  }
  plan.standards.forEach(s => c.check(covered.has(s.id), "reference " + s.id, "not mapped to any unit"));
}

function figureReferences(item) {
  return { given: [...(item.figureIds || []), ...(item.parts || []).flatMap(p => p.figureIds || [])],
    answer: [...(item.answerFigureIds || []), ...(item.parts || []).flatMap(p => p.answerFigureIds || [])] };
}

// Reject malformed collections before traversing them. Validation must report
// authoring errors instead of throwing from a projection or duplicate check.
function assessmentShape(doc, where, c) {
  const before = c.problems.length;
  if (doc.figures !== undefined) c.records(doc.figures, where + ".figures");
  const references = (value, at) => {
    for (const key of ["figureIds", "answerFigureIds"]) if (value[key] !== undefined) c.list(value[key], 0, at + "." + key);
  };
  if (c.records(doc.sections, where + ".sections")) doc.sections.forEach((section, s) => {
    const at = where + ".sections[" + s + "]";
    if (c.records(section.parts, at + ".parts")) section.parts.forEach((part, p) => {
      const pat = at + ".parts[" + p + "]";
      if (c.records(part.items, pat + ".items")) part.items.forEach((item, i) => {
        const it = pat + ".items[" + i + "]";
        references(item, it);
        if (item.topics !== undefined) c.list(item.topics, 0, it + ".topics");
        if (item.choices !== undefined) c.list(item.choices, 0, it + ".choices");
        if (item.parts !== undefined && c.records(item.parts, it + ".parts")) item.parts.forEach((subpart, n) => {
          const sub = it + ".parts[" + n + "]";
          references(subpart, sub);
          if (subpart.rubric !== undefined) c.records(subpart.rubric, sub + ".rubric");
        });
      });
    });
  });
  return c.problems.length === before;
}

// One unit test or practice exam.
function validateAssessment(doc, expected, ctx, c) {
  const where = expected.courseId + "/" + expected.id;
  if (!c.check(doc && doc.format === A.FORMAT && doc.version === A.VERSION, where, "needs format " + A.FORMAT + " version 1")) return;
  if (!assessmentShape(doc, where, c)) return;
  c.plain(doc, where);
  c.claims(doc, where);
  const course = ctx.plan.courses.find(entry => entry.id === expected.courseId);
  if (!c.check(doc.courseId === expected.courseId && doc.id === expected.id, where, "courseId and id must match the file path")) return;
  const unit = course && course.units.find(u => u.test === doc.id);
  if (!c.check(unit, where, "is not an assessment in the course plan")) return;
  const exam = doc.id === "practice-exam";
  c.check(doc.kind === (exam ? "practice-exam" : "unit-test"), where + ".kind", "must be " + (exam ? "practice-exam" : "unit-test"));
  c.check(exam ? doc.unitId === undefined : doc.unitId === unit.id, where + ".unitId", exam ? "practice exams have no unitId" : "must be " + unit.id);
  for (const key of ["title", "author", "directions"]) c.text(doc[key], where + "." + key);
  const segment = exam ? "pe" : "u" + unit.unit;
  const prefix = A.ITEM_PREFIX[doc.courseId] + "-" + segment;
  // Figures: declared once, used, resolved to an admissible file.
  const figures = Array.isArray(doc.figures) ? doc.figures : [];
  c.check(doc.figures === undefined || Array.isArray(doc.figures), where + ".figures", "must be a list");
  c.unique(figures.map(f => f.id), where + ".figures");
  const svgs = ctx.figures.get(doc.courseId) || new Map();
  figures.forEach(figure => {
    const at = where + ".figures." + figure.id;
    c.check(typeof figure.id === "string" && FIGURE_ID.test(figure.id) && new RegExp("^" + prefix + "-f[1-9][0-9]*$").test(figure.id), at, "figure IDs look like " + prefix + "-f1");
    c.text(figure.alt, at + ".alt");
    c.check(figure.svg === undefined, at, "SVG lives in content/ap/figures/" + doc.courseId + "/" + figure.id + ".svg, not inline");
    c.check(figure.notToScale === undefined || figure.notToScale === true, at, "notToScale is true or absent");
    if (c.check(svgs.has(figure.id), at, "missing file content/ap/figures/" + doc.courseId + "/" + figure.id + ".svg")) ctx.usedFigures.add(doc.courseId + "/" + figure.id);
  });
  const declared = new Set(figures.map(f => f.id));
  const referenced = new Set();
  const givenFigures = new Set(), answerFigures = new Set();
  // Sections, parts and items.
  if (!c.check(Array.isArray(doc.sections) && doc.sections.length > 0, where, "needs sections")) return;
  c.unique(doc.sections.map(s => s.id), where + ".sections");
  const itemIds = [];
  doc.sections.forEach(section => {
    const at = where + ".section-" + section.id;
    c.text(section.title, at + ".title");
    c.check(["mc", "fr"].includes(section.kind), at, "kind is mc or fr");
    if (!c.check(Array.isArray(section.parts) && section.parts.length > 0, at, "needs parts")) return;
    c.unique(section.parts.map(p => p.id), at + ".parts");
    section.parts.forEach(part => {
      const pat = at + part.id;
      c.check(typeof part.id === "string" && /^[A-Z]$/.test(part.id), pat, "part IDs are capital letters");
      c.check(Number.isInteger(part.minutes) && part.minutes > 0, pat + ".minutes", "needs whole minutes");
      c.check(COURSE_CALCULATORS[doc.courseId].includes(part.calculator), pat + ".calculator", "must be one of " + COURSE_CALCULATORS[doc.courseId].join(", "));
      c.text(part.directions, pat + ".directions");
      if (part.title !== undefined) c.text(part.title, pat + ".title");
      c.check(part.items.length > 0, pat, "needs items");
    });
  });
  A.entries(doc).forEach(({ section, item, number }) => {
    const at = where + "/" + (item && item.id || "item-" + number);
    if (!c.check(item && typeof item === "object", at, "invalid item")) return;
    itemIds.push(item.id);
    c.text(item.prompt, at + ".prompt");
    if (c.check(Array.isArray(item.topics) && item.topics.length > 0, at + ".topics", "needs topic references")) {
      c.unique(item.topics, at + ".topics");
      item.topics.forEach(ref => {
        const standard = ctx.plan.standards.find(s => s.id === ref);
        c.check(A.isAssessmentTopic(standard, doc.courseId), at + ".topics", (doc.courseId === "calculus-bc" ? "not a course objective of this course: " : "not a framework topic of this course: ") + ref);
        ctx.testedTopics.add(ref);
      });
    }
    const refs = figureReferences(item);
    refs.given.forEach(id => givenFigures.add(id));
    refs.answer.forEach(id => answerFigures.add(id));
    [...refs.given, ...refs.answer].forEach(id => { referenced.add(id); c.check(declared.has(id), at, "undeclared figure " + id); });
    c.check(refs.given.every(id => !refs.answer.includes(id)), at, "a figure cannot be both given and answer-only");
    if (A.isMc(item)) {
      c.check(section.kind === "mc", at, "multiple choice belongs in a multiple-choice section");
      c.check(new RegExp("^" + prefix + "-mc" + String(number).padStart(2, "0") + "$").test(item.id || ""), at, "ID must be " + prefix + "-mc" + String(number).padStart(2, "0"));
      if (c.check(item.choices.length === 4 && item.choices.every(choice => typeof choice === "string" && choice.trim()), at + ".choices", "needs exactly four choices")) {
        c.check(new Set(item.choices.map(A.normalized)).size === 4, at + ".choices", "choices must be distinct");
      }
      c.check(A.LETTERS.includes(item.key), at + ".key", "must be A, B, C or D");
      c.text(item.rationale, at + ".rationale");
      if (item.distractorNotes !== undefined) {
        const letters = A.LETTERS.filter(l => l !== item.key);
        c.check(item.distractorNotes && JSON.stringify(Object.keys(item.distractorNotes).sort()) === JSON.stringify(letters), at + ".distractorNotes", "needs a note for each wrong choice (" + letters.join(", ") + ")");
        letters.forEach(l => item.distractorNotes && c.text(item.distractorNotes[l], at + ".distractorNotes." + l));
      }
      for (const key of ["parts", "type", "context", "points", "rubric", "answer", "steps"]) c.check(item[key] === undefined, at, "multiple choice has no " + key);
      // Alt text describes the drawing without stating the keyed choice.
      const keyed = A.normalized(item.choices[A.LETTERS.indexOf(item.key)]);
      if (keyed.length >= 4) refs.given.forEach(id => { const f = figures.find(x => x.id === id); c.check(!f || !A.normalized(f.alt).includes(keyed), at, "figure " + id + " alt text states the answer"); });
    } else {
      c.check(section.kind === "fr", at, "free response belongs in a free-response section");
      c.check(new RegExp("^" + prefix + "-fr" + number + "$").test(item.id || ""), at, "ID must be " + prefix + "-fr" + number);
      for (const key of ["key", "rationale", "distractorNotes", "answer", "steps", "rubric"]) c.check(item[key] === undefined, at, "free-response answers and rubrics belong to its parts, not " + key);
      if (PHYSICS.has(doc.courseId)) c.check(Object.prototype.hasOwnProperty.call(A.FR_TYPES, item.type), at + ".type", "physics free response needs a type: " + Object.keys(A.FR_TYPES).join(", "));
      else c.check(item.type === undefined, at + ".type", "Calculus free response has no type");
      c.check(item.context === undefined || typeof item.context === "boolean", at + ".context", "is true, false or absent");
      if (!c.check(Array.isArray(item.parts) && item.parts.length > 0, at + ".parts", "needs parts")) return;
      item.parts.forEach((part, index) => {
        const pat = at + "(" + (part && part.label) + ")";
        c.check(part.label === String.fromCharCode(97 + index), pat, "part labels run a, b, c, …");
        for (const key of ["prompt", "answer"]) c.text(part[key], pat + "." + key);
        c.list(part.steps, 1, pat + ".steps");
        c.check(Number.isInteger(part.points) && part.points > 0, pat + ".points", "needs whole points");
        if (c.check(Array.isArray(part.rubric) && part.rubric.length > 0, pat + ".rubric", "needs rubric rows")) {
          part.rubric.forEach((row, i) => { c.check(Number.isInteger(row.points) && row.points > 0, pat + ".rubric." + i, "needs whole points"); c.text(row.criterion, pat + ".rubric." + i + ".criterion"); });
          c.check(A.rubricPoints(part.rubric) === part.points, pat + ".rubric", `rubric totals ${A.rubricPoints(part.rubric)} points; the part is worth ${part.points}`);
        }
      });
    }
    // Duplicate displayed items across every course's tests, exams and weeks.
    const identity = A.identity(item, figures.map(f => ({ id: f.id, svg: svgs.get(f.id) })));
    if (ctx.identities.has(identity)) c.fail(at, "duplicates " + ctx.identities.get(identity));
    else ctx.identities.set(identity, at);
  });
  c.unique(itemIds, where + " item IDs");
  for (const id of givenFigures) c.check(!answerFigures.has(id), where + ".figures." + id, "a figure cannot be both given and answer-only anywhere in the assessment");
  figures.forEach(f => c.check(referenced.has(f.id), where + ".figures." + f.id, "declared but never used"));
  const shaped = doc.sections.every(s => Array.isArray(s.parts) && s.parts.every(p => Array.isArray(p.items) && p.items.every(i => i && typeof i === "object")));
  if (!shaped) return;
  A.blueprintProblems(doc, course).forEach(problem => c.fail(where, "blueprint: " + problem));
  A.keyBalance(doc).problems.forEach(problem => c.fail(where, "key balance: " + problem));
}

// Formula references: Liminal's own grouping of relations with meanings.
function validateReference(ref, courseId, c) {
  const where = "reference " + courseId;
  if (!c.check(ref && ref.format === A.REFERENCE_FORMAT && ref.version === 1 && ref.courseId === courseId, where, "needs format " + A.REFERENCE_FORMAT + " version 1 and the course ID")) return;
  c.check(PHYSICS.has(courseId), where, "only the physics courses have references");
  c.plain(ref, where);
  c.claims(ref, where);
  for (const key of ["title", "intro"]) c.text(ref[key], where + "." + key);
  if (ref.notes !== undefined) c.list(ref.notes, 1, where + ".notes");
  if (!c.records(ref.groups, where + ".groups") || !c.check(ref.groups.length > 0, where, "needs groups")) return;
  c.unique(ref.groups.map(g => g.id), where + ".groups");
  ref.groups.forEach(group => {
    const at = where + "." + group.id;
    c.check(typeof group.id === "string" && /^[a-z0-9][a-z0-9-]*$/.test(group.id), at, "invalid group ID");
    c.text(group.title, at + ".title");
    if (c.records(group.rows, at + ".rows") && c.check(group.rows.length > 0, at, "needs rows")) {
      group.rows.forEach((row, i) => { for (const key of ["relation", "meaning", "units"]) c.text(row[key], at + "." + i + "." + key); });
    }
  });
}

// Weekly AP courses (content/weekly/ap/<course>.json) feed duplicates and coverage.
function weeklyItems(course) {
  const out = [];
  (course.weeks || []).forEach(week => {
    (week.examples || []).forEach((item, i) => out.push({ where: "week " + week.week + " example " + (i + 1), item, week }));
    (week.worksheets || []).forEach(sheet => (sheet.items || []).forEach(item => out.push({ where: "week " + week.week + " sheet " + sheet.id + " " + item.id, item, week })));
  });
  return out;
}

// Pages that show the marks must carry the exact disclaimer.
function disclaimerProblems(pagesDir) {
  const problems = [];
  if (!fs.existsSync(pagesDir)) return problems;
  for (const name of fs.readdirSync(pagesDir).filter(n => n.endsWith(".html")).sort()) {
    // Visible text: tags removed, so "AP<span>®</span>" still counts as the mark.
    const html = fs.readFileSync(path.join(pagesDir, name), "utf8").replace(/<[^>]*>/g, "").replace(/&reg;|&#174;|&#xae;/gi, "®").replace(/&amp;/g, "&");
    if (/AP®|Advanced Placement/.test(html) && !html.includes(A.DISCLAIMER)) problems.push(name + ": uses the AP® marks without the exact disclaimer");
  }
  const weekly = path.join(pagesDir, "lib", "weekly.js");
  if (fs.existsSync(weekly)) {
    const constant = /AP_DISCLAIMER\s*=\s*"([^"]+)"/.exec(fs.readFileSync(weekly, "utf8"));
    if (constant && constant[1] !== A.DISCLAIMER) problems.push("lib/weekly.js: AP_DISCLAIMER differs from the exact disclaimer");
  }
  return problems;
}
// The AP page's own copy: visible text in ap.html and string literals in app/ap*.js.
function pageClaimProblems(pagesDir) {
  const problems = [];
  const files = [path.join(pagesDir, "ap.html"), ...(fs.existsSync(path.join(pagesDir, "app")) ? fs.readdirSync(path.join(pagesDir, "app")).filter(n => /^ap(?:-[a-z-]+)?\.js$/.test(n)).map(n => path.join(pagesDir, "app", n)) : [])];
  for (const file of files.filter(f => fs.existsSync(f))) {
    const source = fs.readFileSync(file, "utf8");
    const texts = file.endsWith(".html") ? [source.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ")]
      : [...source.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)].map(m => m[1]);
    texts.forEach(text => A.claimProblems(text).forEach(found => problems.push(path.basename(file) + `: banned claim (${found.claim}): "${found.sentence.slice(0, 100)}"`)));
  }
  return problems;
}

function loadSvgDirectory(directory, c, where) {
  const figures = new Map();
  if (!fs.existsSync(directory)) return figures;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const name = entry.name;
    if (name === ".gitkeep") continue;
    if (!entry.isFile() || !name.endsWith(".svg") || !FIGURE_ID.test(name.slice(0, -4))) { c.fail(where, "unexpected entry " + name); continue; }
    const svg = fs.readFileSync(path.join(directory, name), "utf8");
    try { checkFigureSvg(svg, where + "/" + name); figures.set(name.slice(0, -4), svg); } catch (error) { c.fail(where + "/" + name, error.message); }
  }
  return figures;
}

// Loads and validates everything under a content root. Returns the parsed
// plan, assessments (figures carry their SVG), references, a report of
// what is pending, and every problem found.
function loadAp({ contentDir = path.join(ROOT, "content"), pagesDir = path.join(ROOT, "src"), complete = false } = {}) {
  const c = collector();
  const planFile = path.join(contentDir, "ap.json");
  const result = { plan: null, assessments: [], references: [], pending: [], problems: c.problems, counts: {} };
  if (!fs.existsSync(planFile)) { c.fail("content/ap.json", "missing"); return result; }
  const plan = readJson(planFile, c);
  validatePlan(plan, c);
  if (c.problems.length) return result;
  result.plan = plan;
  const apDir = path.join(contentDir, "ap");
  const ctx = { plan, figures: new Map(), usedFigures: new Set(), identities: new Map(), testedTopics: new Set() };
  for (const entry of fs.existsSync(apDir) ? fs.readdirSync(apDir, { withFileTypes: true }) : []) {
    c.check(entry.isDirectory() && ["assessments", "references", "figures"].includes(entry.name) || entry.name === ".gitkeep", "content/ap", "unexpected entry " + entry.name);
  }
  for (const courseId of A.COURSES) ctx.figures.set(courseId, loadSvgDirectory(path.join(apDir, "figures", courseId), c, "content/ap/figures/" + courseId));
  for (const name of fs.existsSync(path.join(apDir, "figures")) ? fs.readdirSync(path.join(apDir, "figures")) : []) c.check(A.COURSES.includes(name) || name === ".gitkeep", "content/ap/figures", "unexpected entry " + name);
  // Weekly items first, so a test item repeating a worksheet item is reported at the test.
  const weeklyDir = path.join(contentDir, "weekly", "ap");
  const weekly = new Map();
  for (const courseId of A.COURSES) {
    const file = path.join(weeklyDir, courseId + ".json");
    if (!fs.existsSync(file)) continue;
    const course = readJson(file, c);
    if (!course) continue;
    weekly.set(courseId, course);
    const figureDir = path.join(contentDir, "weekly", "figures", "ap", courseId);
    const figureSvgs = (course.weeks || []).flatMap(week => (week.figures || []).map(f => {
      const svgFile = path.join(figureDir, f.id + ".svg");
      return { id: f.id, svg: fs.existsSync(svgFile) ? fs.readFileSync(svgFile, "utf8") : undefined };
    }));
    weeklyItems(course).forEach(({ where, item }) => {
      const identity = A.identity(item, figureSvgs);
      if (!ctx.identities.has(identity)) ctx.identities.set(identity, courseId + " weekly " + where);
    });
    c.claims(course, "weekly/ap/" + courseId);
  }
  for (const course of plan.courses) {
    const dir = path.join(apDir, "assessments", course.id);
    const expected = course.units.map(u => u.test);
    for (const name of fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => n !== ".gitkeep") : []) {
      if (!c.check(name.endsWith(".json") && expected.includes(name.slice(0, -5)), "content/ap/assessments/" + course.id, "unexpected file " + name)) continue;
      const file = path.join(dir, name);
      c.check(fs.statSync(file).size <= MAX_ASSESSMENT_BYTES, "content/ap/assessments/" + course.id + "/" + name, "exceeds 1 MB");
      const doc = readJson(file, c);
      if (!doc) continue;
      const before = c.problems.length;
      validateAssessment(doc, { courseId: course.id, id: name.slice(0, -5) }, ctx, c);
      if (c.problems.length === before) {
        const svgs = ctx.figures.get(course.id);
        result.assessments.push({ ...doc, ...(doc.figures ? { figures: doc.figures.map(f => ({ ...f, svg: svgs.get(f.id) })) } : {}) });
      }
    }
    const present = new Set(result.assessments.filter(d => d.courseId === course.id).map(d => d.id));
    expected.filter(id => !present.has(id)).forEach(id => result.pending.push(course.id + "/" + id));
    if (course.reference) {
      const file = path.join(apDir, "references", course.reference + ".json");
      if (fs.existsSync(file)) {
        const ref = readJson(file, c);
        const before = c.problems.length;
        validateReference(ref, course.id, c);
        if (ref && c.problems.length === before) result.references.push(ref);
      } else result.pending.push(course.id + "/reference");
    }
    // Coverage: every framework topic in at least one test item and one week.
    const topics = plan.standards.filter(s => A.isAssessmentTopic(s, course.id)).map(s => s.id);
    const untested = topics.filter(t => !ctx.testedTopics.has(t));
    if (untested.length) result.pending.push(`${course.id}: ${untested.length} of ${topics.length} topics not yet in a test item`);
    if (complete && untested.length) c.fail(course.id, "topics without a test item: " + untested.slice(0, 10).join(", ") + (untested.length > 10 ? ", …" : ""));
    const weeklyCourse = weekly.get(course.id);
    const taught = new Set(weeklyCourse ? (weeklyCourse.weeks || []).flatMap(w => w.standards || []) : []);
    const unweekly = topics.filter(t => !taught.has(t));
    if (!weeklyCourse) result.pending.push(course.id + ": weekly course not present");
    else if (unweekly.length) result.pending.push(`${course.id}: ${unweekly.length} topics not in any weekly week`);
    if (complete && unweekly.length) c.fail(course.id, "topics without a week: " + unweekly.slice(0, 10).join(", ") + (unweekly.length > 10 ? ", …" : ""));
    // Physics unit tests rotate free-response types: each type three times or more.
    const rule = course.blueprints.unitTest.minTypeUsesAcrossUnitTests;
    if (rule) {
      const types = result.assessments.filter(d => d.courseId === course.id && d.kind === "unit-test").flatMap(d => A.entries(d).filter(e => !A.isMc(e.item)).map(e => e.item.type));
      const short = Object.keys(A.FR_TYPES).filter(type => types.filter(t => t === type).length < rule);
      if (complete && short.length) c.fail(course.id, `unit tests need each free-response type at least ${rule} times; short: ${short.join(", ")}`);
    }
  }
  if (complete) result.pending.filter(p => /\/(?:unit-\d+|practice-exam|reference)$/.test(p)).forEach(p => c.fail(p, "missing (required by --complete)"));
  // Figure files nobody uses.
  for (const [courseId, svgs] of ctx.figures) for (const id of svgs.keys()) c.check(ctx.usedFigures.has(courseId + "/" + id), "content/ap/figures/" + courseId + "/" + id + ".svg", "orphan figure");
  disclaimerProblems(pagesDir).forEach(p => c.fail("pages", p));
  pageClaimProblems(pagesDir).forEach(p => c.fail("pages", p));
  result.counts = { assessments: result.assessments.length, references: result.references.length,
    mc: result.assessments.reduce((s, d) => s + A.counts(d).mc, 0), fr: result.assessments.reduce((s, d) => s + A.counts(d).fr, 0) };
  return result;
}

function main(argv = process.argv.slice(2)) {
  const option = name => { const i = argv.indexOf(name); return i >= 0 ? path.resolve(argv[i + 1]) : undefined; };
  const complete = argv.includes("--complete");
  const result = loadAp({ contentDir: option("--content"), pagesDir: option("--pages"), complete });
  if (result.problems.length) {
    console.error(`AP check failed: ${result.problems.length} problem(s).`);
    result.problems.slice(0, 25).forEach(p => console.error("  " + p));
    if (result.problems.length > 25) console.error(`  … and ${result.problems.length - 25} more`);
    return 1;
  }
  const { counts } = result;
  console.log(`AP check passed: plan for ${result.plan.courses.length} courses; ${counts.assessments} assessments (${counts.mc} MC, ${counts.fr} FR); ${counts.references} references.`);
  if (!complete && result.pending.length) console.log(`Pending (fails only with --complete): ${result.pending.length} — ${result.pending.slice(0, 6).join("; ")}${result.pending.length > 6 ? "; …" : ""}`);
  return 0;
}

module.exports = { loadAp, validatePlan, validateAssessment, validateReference, disclaimerProblems, pageClaimProblems, main };
if (require.main === module) process.exitCode = main();
