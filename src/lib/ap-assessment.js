/* Pure model for the AP® course pages: unit tests and practice exams
   (`liminal-ap-assessment` v1), their student and key projections, raw-point
   tallies, blueprint and answer-key checks, the claims lint, and ap.html
   routing. No DOM access; loads in Node and the browser.

   Document: { format, version, courseId, id, kind, unitId?, title, author,
   directions, figures?: [{ id, alt, caption?, notToScale?, svg? }],
   sections: [{ id, title, kind: "mc" | "fr", parts: [{ id, title?, minutes,
   calculator, directions, items }] }] }.
   A multiple-choice item: { id, prompt, choices[4], key, rationale,
   distractorNotes?, topics, figureIds?, answerFigureIds? }.
   A free-response item: { id, prompt, type?, context?, topics, figureIds?,
   parts: [{ label, prompt, points, rubric: [{ points, criterion }], answer,
   steps, figureIds?, answerFigureIds? }] }.
   Field names shared with weekly worksheet items (prompt, choices, key,
   points, rubric, answer, steps, figureIds, answerFigureIds) keep their
   weekly meaning. Scores are raw points only: there is no conversion. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalAp = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const FORMAT = "liminal-ap-assessment";
  const REFERENCE_FORMAT = "liminal-ap-reference";
  const VERSION = 1;
  const DISCLAIMER = "AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.";
  const COURSES = ["calculus-ab", "physics-1", "physics-c-mechanics"];
  const TOPIC_PREFIX = { "calculus-ab": "AB", "physics-1": "P1", "physics-c-mechanics": "CM" };
  const ITEM_PREFIX = { "calculus-ab": "ab", "physics-1": "p1", "physics-c-mechanics": "cm" };
  const LETTERS = ["A", "B", "C", "D"];
  const CALCULATOR = { none: "No calculator", graphing: "Graphing calculator", any: "Calculator allowed" };
  const FR_TYPES = { MR: "Mathematical Routines", TBR: "Translation Between Representations", EDA: "Experimental Design and Analysis", QQT: "Qualitative/Quantitative Translation" };
  const KIND_LABEL = { "unit-test": "Unit test", "practice-exam": "Practice exam" };
  // Key balance: each letter keys 15–35% of a test's multiple choice, and the
  // key is the unique longest choice in at most 40% of items.
  const KEY_SHARE = [0.15, 0.35];
  const LONGEST_SHARE = 0.4;

  function own(object, key) { return !!object && Object.prototype.hasOwnProperty.call(object, key); }
  function isMc(item) { return !!item && Array.isArray(item.choices); }
  function calculatorLabel(policy) { return own(CALCULATOR, policy) ? CALCULATOR[policy] : ""; }
  function kindLabel(kind) { return own(KIND_LABEL, kind) ? KIND_LABEL[kind] : ""; }
  function frTypeLabel(type) { return own(FR_TYPES, type) ? FR_TYPES[type] : ""; }
  // "AB.5.3" → 5; editorial objectives and malformed references → null.
  function topicUnit(topic) {
    const match = /^(?:AB|P1|CM)\.([1-9][0-9]*)\.[1-9][0-9]*$/.exec(String(topic || ""));
    return match ? Number(match[1]) : null;
  }
  // An item counts toward the unit of its first (primary) topic.
  function primaryUnit(item) { return item && Array.isArray(item.topics) ? topicUnit(item.topics[0]) : null; }
  function assessmentId(kind, unit) { return kind === "practice-exam" ? "practice-exam" : "unit-" + unit; }
  function itemPoints(item) {
    if (isMc(item)) return 1;
    return (item && Array.isArray(item.parts) ? item.parts : []).reduce((sum, part) => sum + (Number.isInteger(part.points) ? part.points : 0), 0);
  }
  function rubricPoints(rubric) { return (Array.isArray(rubric) ? rubric : []).reduce((sum, row) => sum + (Number.isInteger(row.points) ? row.points : 0), 0); }

  // Every item in reading order with its printed number: multiple choice is
  // numbered 1…n across Section I, free response 1…m across Section II.
  function entries(doc) {
    const out = [];
    let mc = 0, fr = 0;
    (doc && doc.sections || []).forEach(section => (section.parts || []).forEach(part => (part.items || []).forEach(item => {
      out.push({ section, part, item, number: isMc(item) ? ++mc : ++fr });
    })));
    return out;
  }
  function minutes(doc) { return (doc && doc.sections || []).reduce((sum, s) => sum + (s.parts || []).reduce((a, p) => a + (Number(p.minutes) || 0), 0), 0); }
  function counts(doc) {
    const list = entries(doc);
    return { mc: list.filter(e => isMc(e.item)).length, fr: list.filter(e => !isMc(e.item)).length, minutes: minutes(doc), points: list.reduce((s, e) => s + itemPoints(e.item), 0) };
  }

  // Maximum raw points by section and by unit (primary topic). A tally is a
  // record of raw points earned; it is never converted to a score.
  function tally(doc) {
    const sections = (doc && doc.sections || []).map(section => {
      const items = (section.parts || []).flatMap(part => part.items || []);
      return { id: section.id, title: section.title, kind: section.kind, items: items.length, points: items.reduce((s, item) => s + itemPoints(item), 0) };
    });
    const units = new Map();
    entries(doc).forEach(({ item }) => {
      const unit = primaryUnit(item);
      const row = units.get(unit) || { unit, items: 0, points: 0 };
      row.items += 1; row.points += itemPoints(item); units.set(unit, row);
    });
    return { sections, units: [...units.values()].sort((a, b) => (a.unit || 0) - (b.unit || 0)),
      total: { items: sections.reduce((s, r) => s + r.items, 0), points: sections.reduce((s, r) => s + r.points, 0) } };
  }
  // Raw points earned from recorded responses: { mc: { <number>: "B" },
  // fr: { <itemId>: { <label>: points } } }. Unanswered counts as zero.
  function rawPoints(doc, responses = {}) {
    const result = tally(doc);
    const earned = new Map(result.sections.map(s => [s.id, 0]));
    const byUnit = new Map(result.units.map(u => [u.unit, 0]));
    entries(doc).forEach(({ section, item, number }) => {
      let points = 0;
      if (isMc(item)) points = responses.mc && responses.mc[number] === item.key ? 1 : 0;
      else {
        const given = responses.fr && responses.fr[item.id] || {};
        item.parts.forEach(part => { const value = Number(given[part.label]); if (Number.isInteger(value)) points += Math.max(0, Math.min(part.points, value)); });
      }
      earned.set(section.id, earned.get(section.id) + points);
      byUnit.set(primaryUnit(item), byUnit.get(primaryUnit(item)) + points);
    });
    return { sections: result.sections.map(s => ({ id: s.id, title: s.title, earned: earned.get(s.id), points: s.points })),
      units: result.units.map(u => ({ unit: u.unit, earned: byUnit.get(u.unit), points: u.points })) };
  }

  function copyFigure(figure) {
    return { id: figure.id, alt: figure.alt, ...(figure.caption ? { caption: figure.caption } : {}),
      ...(figure.notToScale === true ? { notToScale: true } : {}), ...(typeof figure.svg === "string" ? { svg: figure.svg } : {}) };
  }
  function ids(value) { return Array.isArray(value) && value.length ? value.slice() : null; }
  // Explicit allowlists: a student copy carries prompts, choices, points and
  // given figures only. Keys, rationales, rubrics, answers, steps, topics,
  // question types and answer-only figures enter the key copy alone.
  function projectItem(item, number, key) {
    const base = { number, id: item.id, prompt: item.prompt, ...(ids(item.figureIds) ? { figureIds: ids(item.figureIds) } : {}) };
    if (isMc(item)) {
      return { ...base, kind: "mc", choices: item.choices.slice(), points: 1,
        ...(key ? { key: item.key, rationale: item.rationale, topics: item.topics.slice(),
          ...(item.distractorNotes ? { distractorNotes: LETTERS.filter(l => own(item.distractorNotes, l)).reduce((o, l) => (o[l] = item.distractorNotes[l], o), {}) } : {}),
          ...(ids(item.answerFigureIds) ? { answerFigureIds: ids(item.answerFigureIds) } : {}) } : {}) };
    }
    return { ...base, kind: "fr", points: itemPoints(item),
      ...(key ? { topics: item.topics.slice(), ...(item.type ? { type: item.type } : {}), ...(item.context === true ? { context: true } : {}),
        ...(ids(item.answerFigureIds) ? { answerFigureIds: ids(item.answerFigureIds) } : {}) } : {}),
      parts: item.parts.map(part => ({ label: part.label, prompt: part.prompt, points: part.points,
        ...(ids(part.figureIds) ? { figureIds: ids(part.figureIds) } : {}),
        ...(key ? { answer: part.answer, steps: part.steps.slice(), rubric: part.rubric.map(r => ({ points: r.points, criterion: r.criterion })),
          ...(ids(part.answerFigureIds) ? { answerFigureIds: ids(part.answerFigureIds) } : {}) } : {}) })) };
  }
  function figureRefs(item) {
    return [...(item.figureIds || []), ...(item.answerFigureIds || []), ...(item.parts || []).flatMap(p => [...(p.figureIds || []), ...(p.answerFigureIds || [])])];
  }
  function project(doc, key) {
    const numbered = entries(doc);
    let index = 0;
    const sections = doc.sections.map(section => ({ id: section.id, title: section.title, kind: section.kind,
      parts: section.parts.map(part => ({ id: part.id, ...(part.title ? { title: part.title } : {}), minutes: part.minutes, calculator: part.calculator,
        directions: part.directions, items: part.items.map(item => projectItem(item, numbered[index++].number, key)) })) }));
    const used = new Set(sections.flatMap(s => s.parts.flatMap(p => p.items.flatMap(figureRefs))));
    const figures = (doc.figures || []).filter(f => used.has(f.id)).map(copyFigure);
    const result = tally(doc);
    return { format: key ? "liminal-ap-answer-key" : "liminal-ap-student-booklet", version: VERSION,
      courseId: doc.courseId, id: doc.id, kind: doc.kind, ...(doc.unitId ? { unitId: doc.unitId } : {}), title: doc.title,
      directions: doc.directions, sections, ...(figures.length ? { figures } : {}),
      answerSheet: answerSheet(doc),
      tally: key ? result : { sections: result.sections, total: result.total } };
  }
  function studentCopy(doc) { return project(doc, false); }
  function keyCopy(doc) { return project(doc, true); }
  // The separate answer sheet: a bubble row per multiple-choice question and
  // the free-response parts, which are answered in the booklet's workspace.
  function answerSheet(doc) {
    const list = entries(doc);
    return { mc: list.filter(e => isMc(e.item)).map(e => ({ number: e.number, section: e.section.id, part: e.part.id, letters: LETTERS.slice() })),
      fr: list.filter(e => !isMc(e.item)).map(e => ({ number: e.number, section: e.section.id, part: e.part.id, labels: e.item.parts.map(p => p.label), points: itemPoints(e.item) })) };
  }

  // Answer-key tells across one test's multiple choice.
  function keyBalance(doc) {
    const mc = entries(doc).map(e => e.item).filter(isMc);
    const letters = Object.fromEntries(LETTERS.map(l => [l, 0]));
    let longest = 0;
    mc.forEach(item => {
      if (own(letters, item.key)) letters[item.key] += 1;
      const lengths = item.choices.map(c => String(c).trim().length);
      const keyed = lengths[LETTERS.indexOf(item.key)];
      if (keyed !== undefined && lengths.filter(n => n >= keyed).length === 1) longest += 1;
    });
    const problems = [];
    if (mc.length) {
      LETTERS.forEach(l => {
        const share = letters[l] / mc.length;
        if (share < KEY_SHARE[0] || share > KEY_SHARE[1]) problems.push(`key ${l} is ${letters[l]} of ${mc.length} multiple-choice items; keep each letter between 15% and 35%`);
      });
      if (longest / mc.length > LONGEST_SHARE) problems.push(`the key is the unique longest choice in ${longest} of ${mc.length} items; keep it at or below 40%`);
    }
    return { total: mc.length, letters, longest, problems };
  }

  // Blueprint problems for one document against its course plan (content/ap.json).
  function blueprintProblems(doc, course) {
    const problems = [];
    if (!course || !course.blueprints) return ["no course blueprint for " + (doc && doc.courseId)];
    const exam = doc.kind === "practice-exam";
    const blueprint = exam ? course.blueprints.practiceExam : course.blueprints.unitTest;
    const shape = exam ? course.exam.sections.map(s => ({ id: s.id, kind: s.id === "I" ? "mc" : "fr", parts: s.parts })) : blueprint.sections;
    const label = doc.id + ": ";
    if (doc.sections.length !== shape.length) problems.push(label + `expected ${shape.length} sections, found ${doc.sections.length}`);
    shape.forEach((expected, i) => {
      const section = doc.sections[i];
      if (!section) return;
      if (section.id !== expected.id || section.kind !== expected.kind) problems.push(label + `section ${i + 1} should be ${expected.id} (${expected.kind})`);
      if (section.parts.length !== expected.parts.length) { problems.push(label + `section ${expected.id} needs ${expected.parts.length} parts`); return; }
      expected.parts.forEach((want, j) => {
        const part = section.parts[j];
        const where = label + `section ${expected.id} part ${want.id}`;
        if (part.id !== want.id) problems.push(where + ` is labeled ${part.id}`);
        if (part.items.length !== want.questions) problems.push(where + ` has ${part.items.length} questions; the blueprint has ${want.questions}`);
        if (part.calculator !== want.calculator) problems.push(where + ` calculator is ${part.calculator}; the blueprint has ${want.calculator}`);
        if (Number.isInteger(want.minutes) && part.minutes !== want.minutes) problems.push(where + ` is ${part.minutes} minutes; the exam allows ${want.minutes}`);
        part.items.forEach(item => { if (isMc(item) !== (expected.kind === "mc")) problems.push(where + ` holds the wrong item kind: ${item.id}`); });
      });
    });
    if (!exam && Array.isArray(blueprint.minutes)) {
      const total = minutes(doc);
      if (total < blueprint.minutes[0] || total > blueprint.minutes[1]) problems.push(label + `takes ${total} minutes; unit tests take ${blueprint.minutes[0]}–${blueprint.minutes[1]}`);
    }
    const items = entries(doc).map(e => e.item);
    const fr = items.filter(item => !isMc(item));
    fr.forEach(item => {
      const points = itemPoints(item);
      if (Number.isInteger(blueprint.frPoints) && points !== blueprint.frPoints) problems.push(label + `${item.id} is worth ${points} points; free response is worth ${blueprint.frPoints}`);
      if (blueprint.frTypes) {
        if (!own(blueprint.frTypes, item.type)) problems.push(label + `${item.id} needs a free-response type (${Object.keys(blueprint.frTypes).join(", ")})`);
        else if (points !== blueprint.frTypes[item.type]) problems.push(label + `${item.id} (${item.type}) is worth ${points} points; that type is worth ${blueprint.frTypes[item.type]}`);
      } else if (item.type !== undefined) problems.push(label + `${item.id} has a physics question type`);
    });
    const types = fr.map(item => item.type);
    if (blueprint.distinctFrTypes && new Set(types).size !== types.length) problems.push(label + "free-response types must differ");
    if (blueprint.oneOfEachFrType && Object.keys(blueprint.frTypes).some(type => types.filter(t => t === type).length !== 1)) problems.push(label + "needs exactly one free-response question of each type");
    if (Number.isInteger(blueprint.minContextFr) && fr.filter(item => item.context === true).length < blueprint.minContextFr) problems.push(label + `needs at least ${blueprint.minContextFr} free-response questions in real-world contexts`);
    if (exam) {
      const byUnit = {};
      items.filter(isMc).forEach(item => { const unit = primaryUnit(item); byUnit[unit] = (byUnit[unit] || 0) + 1; });
      const want = blueprint.mcByUnit;
      new Set([...Object.keys(want), ...Object.keys(byUnit)]).forEach(unit => {
        if ((byUnit[unit] || 0) !== (want[unit] || 0)) problems.push(label + `unit ${unit} has ${byUnit[unit] || 0} multiple-choice questions; the blueprint has ${want[unit] || 0}`);
      });
    } else {
      const tested = Number(String(doc.unitId || "").slice(1));
      items.forEach(item => {
        if (primaryUnit(item) !== tested) problems.push(label + `${item.id}'s first topic must be in unit ${tested}`);
        (item.topics || []).forEach(topic => { if (topicUnit(topic) > tested) problems.push(label + `${item.id} uses later topic ${topic}`); });
      });
    }
    return problems;
  }

  // Claims lint. A sentence fails when it makes a promise, prediction or
  // endorsement claim; it passes when the claim is negated (the disclaimer,
  // "not an AP score", "does not predict"). College Board and Bluebook
  // sentences may say "official" when they refer to College Board's materials.
  const CLAIMS = [
    // "Guarantee" fails only beside an outcome the site must not promise
    // (scores, passing, the exam, credit, grades, results). Existence theorems
    // and conservation laws "guarantee" things legitimately.
    { id: "guarantee", pattern: /^(?=.*\b[Gg]uarantee(?:s|d)?\b)(?=.*(?:\b[Ss]cor(?:e|es|ed|ing)\b|\b[Pp]ass(?:es|ed|ing)?\b|\b[Ee]xams?\b|\bAP(?![A-Za-z])|\b[Cc]redit\b|\b[Gg]rades?\b|\b[Rr]esults?\b|\b[Ss]uccess(?:ful)?\b|\ba\s+[345](?:\s+on\b|[.!?,;]|\s*$)))/ },
    { id: "predict-score", pattern: /\bpredict(?:s|ed|ion|ions|ive|or)?\b[^.]*\bscores?\b|\bscores?\b[^.]*\bpredict(?:s|ed|ion|ions|ive|or)?\b/i },
    { id: "score-of-5", pattern: /\b(?:score|scored|scoring|earn|earns|earned|get|gets|got|achieve|achieves)\s+(?:of\s+|an?\s+)[345](?![\s-]*(?:points?|pts)\b)\b|\ba\s+[345]\s+on\s+the\b|\b[345]s\s+on\s+the\s+(?:AP|exam)\b/i },
    { id: "score-scale", pattern: /\b1\s*(?:[–-]|to)\s*5\s+(?:scale|score)|\bscaled score|\bscore (?:conversion|estimate|calculator)\b|\bequivalent AP®? score/i },
    { id: "official", pattern: /\bofficial(?:ly)?\b/i, allow: /\bCollege Board\b|\bBluebook\b/ },
    { id: "endorsement", pattern: /\bendorse[ds]?\b|\bendorsement\b|\bCollege Board[- ]approved\b|\bapproved by\b|\bauthori[sz]ed\b|\bcertified\b|\baccredited\b|\bsponsored by\b/i },
    { id: "pass-or-credit", pattern: /\bpass(?:es|ing)? the (?:AP )?exam\b|\b(?:earn|earns|get|gets|receive)\b[^.]*\bcollege credit\b/i },
    { id: "mark-as-noun", pattern: /\bAP®?(?:'s|’s)\b|\bAPs\b/ },
  ];
  const NEGATION = /\b(?:not|no|never|neither|nor|without|cannot)\b|n['’]t\b/i;
  // No lookbehind: this file loads in browsers older than Safari 16.4.
  function sentences(text) { return String(text).replace(/([.!?])\s+/g, "$1\n").split(/\n+/).filter(s => s.trim()); }
  function claimProblems(text) {
    const found = [];
    sentences(text).forEach(sentence => {
      if (sentence.includes(DISCLAIMER)) return;
      CLAIMS.forEach(claim => {
        if (!claim.pattern.test(sentence)) return;
        if (claim.id !== "mark-as-noun" && (NEGATION.test(sentence) || claim.allow && claim.allow.test(sentence))) return;
        found.push({ claim: claim.id, sentence: sentence.trim() });
      });
    });
    return found;
  }
  // Every string in a JSON value, with its path.
  function strings(value, where = "", out = []) {
    if (typeof value === "string") out.push({ where, text: value });
    else if (Array.isArray(value)) value.forEach((v, i) => strings(v, where + "[" + i + "]", out));
    else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => strings(v, where ? where + "." + k : k, out));
    return out;
  }

  // Displayed identity for duplicate checks across weeks, tests and exams:
  // normalized prompt text, choices (order-free) and figure drawings.
  function normalized(value) { return String(value || "").normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim(); }
  function identity(item, figures = []) {
    const svg = id => { const figure = figures.find(f => f.id === id); return figure && figure.svg ? normalized(figure.svg) : id; };
    return JSON.stringify([normalized(item.prompt), (item.choices || []).map(normalized).sort(), (item.figureIds || []).map(svg).sort(),
      (item.parts || []).map(p => [normalized(p.prompt), (p.figureIds || []).map(svg).sort()])]);
  }

  // ap.html routes: "" (all courses), "<course>", "<course>/u<n>",
  // "<course>/test/<id>", "<course>/test/<id>/key", "<course>/reference".
  const ASSESSMENT_ID = /^(?:unit-[1-9][0-9]?|practice-exam)$/;
  function route(courseId, view, id) {
    if (courseId === undefined || courseId === null || courseId === "") return "#";
    if (!COURSES.includes(courseId)) return "";
    if (!view) return "#" + courseId;
    if (view === "unit") return /^u[1-9][0-9]?$/.test(id || "") ? "#" + courseId + "/" + id : "";
    if (view === "reference") return "#" + courseId + "/reference";
    if (view === "student" || view === "key") return ASSESSMENT_ID.test(id || "") ? "#" + courseId + "/test/" + id + (view === "key" ? "/key" : "") : "";
    return "";
  }
  function planCourses(plan) { return COURSES.map(id => (plan && plan.courses || []).find(c => c.id === id)).filter(Boolean); }
  function resolve(plan, hash) {
    const raw = String(hash || "").replace(/^#/, "");
    const parts = raw ? raw.split("/") : [];
    const none = { view: "hub", course: null, unitId: null, assessmentId: null, copy: null, invalid: !!raw };
    if (!parts.length) return { ...none, invalid: false };
    const course = planCourses(plan).find(c => c.id === parts[0]);
    if (!course) return none;
    const plain = { view: "plan", course, unitId: null, assessmentId: null, copy: null, invalid: false };
    if (parts.length === 1) return plain;
    if (parts.length === 2 && parts[1] === "reference" && course.reference) return { ...plain, view: "reference" };
    if (parts.length === 2 && course.units.some(u => u.id === parts[1])) return { ...plain, unitId: parts[1] };
    const expected = new Set(course.units.map(u => u.test).filter(Boolean));
    if (parts[1] === "test" && expected.has(parts[2]) && (parts.length === 3 || parts.length === 4 && parts[3] === "key")) {
      return { ...plain, view: "assessment", assessmentId: parts[2], copy: parts.length === 4 ? "key" : "student" };
    }
    return { ...plain, invalid: true };
  }
  return { FORMAT, REFERENCE_FORMAT, VERSION, DISCLAIMER, COURSES, TOPIC_PREFIX, ITEM_PREFIX, LETTERS, CALCULATOR, FR_TYPES, KEY_SHARE, LONGEST_SHARE, CLAIMS,
    isMc, calculatorLabel, kindLabel, frTypeLabel, topicUnit, primaryUnit, assessmentId, itemPoints, rubricPoints, entries, minutes, counts,
    tally, rawPoints, studentCopy, keyCopy, answerSheet, keyBalance, blueprintProblems, claimProblems, strings, normalized, identity,
    route, resolve, planCourses };
});
