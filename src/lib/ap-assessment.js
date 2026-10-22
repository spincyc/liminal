/* Pure model for the AP® course pages: unit tests, practice exams, mixed
   multiple-choice sets and free-response sets (`liminal-ap-assessment` v1), their student and key
   projections, raw-point tallies, blueprint and answer-key checks; exam-prep
   guides (`liminal-ap-guide` v1) and the course's optional `prep` block in
   content/ap.json; the claims lint; and ap.html routing. No DOM access;
   loads in Node and the browser.

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
   weekly meaning. Scores are raw points only: there is no conversion.

   A guide: { format, version, courseId, id, kind: "strategy" | "unit-review"
   | "fr-archetype", unitId? (unit reviews), title, author, summary, minutes,
   figures?, sections: [{ id, title, blocks }] }, where each block is one of
   GUIDE_BLOCKS: text { text }, list { items, ordered? }, table { caption?,
   head, rows }, rule { title, text, conditions? }, trap { text, fix }, model
   { prompt?, text }, example { prompt, answer, steps, figureIds? }, check
   { id, prompt, hint?, answer, steps, figureIds?, see? (the section to study
   when it is missed) }, figure { id }, links
   { items: [{ label, ref }] }. A ref names a page of the course: test:<id>,
   key:<id>, guide:<id>, unit:u<n> or week:<1–36>. */
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(node ? require("./assessment") : root.LiminalAssessment,
    node ? require("./assessment-adapters") : root.LiminalAssessmentAdapters);
  if (node) module.exports = api;
  else root.LiminalAp = api;
})(typeof window === "object" ? window : globalThis, function (Assessment, Adapters) {
  "use strict";
  const FORMAT = "liminal-ap-assessment";
  const REFERENCE_FORMAT = "liminal-ap-reference";
  const GUIDE_FORMAT = "liminal-ap-guide";
  const VERSION = 1;
  const DISCLAIMER = "AP® and Advanced Placement® are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this website.";
  const COURSES = ["calculus-ab", "calculus-bc", "physics-1", "physics-c-mechanics"];
  const TOPIC_PREFIX = { "calculus-ab": "AB", "calculus-bc": "BC", "physics-1": "P1", "physics-c-mechanics": "CM" };
  const ITEM_PREFIX = { "calculus-ab": "ab", "calculus-bc": "bc", "physics-1": "p1", "physics-c-mechanics": "cm" };
  const LETTERS = ["A", "B", "C", "D"];
  // The order calculator policies take within a section, as on the exams.
  const COURSE_PART_ORDER = { "calculus-ab": ["graphing", "none"], "calculus-bc": ["graphing", "none"], "physics-1": ["any"], "physics-c-mechanics": ["any"] };
  const CALCULATOR = { none: "No calculator", graphing: "Graphing calculator", any: "Calculator allowed" };
  const FR_TYPES = { MR: "Mathematical Routines", TBR: "Translation Between Representations", EDA: "Experimental Design and Analysis", QQT: "Qualitative/Quantitative Translation" };
  const KIND_LABEL = { "unit-test": "Unit test", "practice-exam": "Practice exam", "mixed-set": "Mixed set", "fr-set": "Free-response set" };
  const GUIDE_KINDS = { strategy: "Exam strategy", "unit-review": "Unit review", "fr-archetype": "Free-response workshop" };
  const GUIDE_BLOCKS = ["text", "list", "table", "rule", "trap", "model", "example", "check", "figure", "links"];
  const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  // Practice exams beyond the course's own (week 33) are forms b, c, …;
  // mixed multiple-choice sets are mixed-<n>; free-response sets are
  // fr-<archetype>.
  const PRACTICE_EXAM_ID = /^practice-exam(?:-[b-z])?$/;
  const MIXED_SET_ID = /^mixed-[1-9][0-9]?$/;
  const FR_SET_ID = /^fr-[a-z0-9]+(?:-[a-z0-9]+)*$/;
  // Key balance: each letter keys 15–35% of a test's multiple choice, and the
  // key is the unique longest choice in at most 40% of items.
  const KEY_SHARE = [0.15, 0.35];
  const LONGEST_SHARE = 0.4;

  function own(object, key) { return !!object && Object.prototype.hasOwnProperty.call(object, key); }
  function isMc(item) { return !!item && Array.isArray(item.choices); }
  function isCalculus(courseId) { return courseId === "calculus-ab" || courseId === "calculus-bc"; }
  function calculatorLabel(policy) { return own(CALCULATOR, policy) ? CALCULATOR[policy] : ""; }
  function kindLabel(kind) { return own(KIND_LABEL, kind) ? KIND_LABEL[kind] : ""; }
  function guideKindLabel(kind) { return own(GUIDE_KINDS, kind) ? GUIDE_KINDS[kind] : ""; }
  function frTypeLabel(type) { return own(FR_TYPES, type) ? FR_TYPES[type] : ""; }
  // BC uses Liminal editorial objective slugs, not invented official topic
  // numbers. Review objectives and malformed references are not unit topics.
  function topicUnit(topic) {
    const value = String(topic || "");
    const match = /^(?:AB|P1|CM)\.([1-9][0-9]*)\.[1-9][0-9]*$/.exec(value)
      || /^BC\.([1-9]|10)\.[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.exec(value);
    return match ? Number(match[1]) : null;
  }
  function isAssessmentTopic(standard, courseId) {
    return !!standard && own(TOPIC_PREFIX, courseId) && typeof standard.id === "string"
      && standard.id.startsWith(TOPIC_PREFIX[courseId] + ".") && topicUnit(standard.id) !== null
      && standard.kind === (courseId === "calculus-bc" ? "editorial-objective" : "content");
  }
  function topicsForUnit(plan, courseId, unit) {
    return (plan && plan.standards || []).filter(standard => isAssessmentTopic(standard, courseId) && topicUnit(standard.id) === unit);
  }
  // An item counts toward the unit of its first (primary) topic.
  function primaryUnit(item) { return item && Array.isArray(item.topics) ? topicUnit(item.topics[0]) : null; }
  function assessmentId(kind, unit) { return kind === "practice-exam" ? "practice-exam" : "unit-" + unit; }
  // The ID segment an assessment's items and figures carry: unit-3 → u3,
  // practice-exam → pe, practice-exam-b → peb, mixed-2 → mixed-2, fr-polar →
  // fr-polar. A guide's checks and figures carry the guide ID itself.
  function segment(id) {
    const value = String(id || "");
    const unit = /^unit-([1-9][0-9]?)$/.exec(value);
    if (unit) return "u" + unit[1];
    if (PRACTICE_EXAM_ID.test(value)) return "pe" + value.slice("practice-exam-".length);
    return MIXED_SET_ID.test(value) || FR_SET_ID.test(value) ? value : "";
  }

  // The optional `prep` block of a course in content/ap.json names the extra
  // practice-exam forms (`exams`, form A being the course's own), mixed
  // multiple-choice sets (`mixed`), the strategy guides, one review guide per
  // content unit (`reviews`: review-u<n>), and the free-response workshop
  // (`workshop`: each fr-<archetype> ID is both a guide and its practice set),
  // plus review plans of sessions and tasks.
  function prepOf(course) { return course && course.prep && typeof course.prep === "object" ? course.prep : null; }
  function ids(list, key) { return (Array.isArray(list) ? list : []).map(entry => key && entry && typeof entry === "object" ? entry[key] : entry).filter(id => typeof id === "string"); }
  function examIds(course) {
    const prep = prepOf(course);
    const formA = (course && course.units || []).some(u => u.test === "practice-exam") ? ["practice-exam"] : [];
    return [...new Set([...formA, ...ids(prep && prep.exams, "id")])];
  }
  function mixedIds(course) { const prep = prepOf(course); return ids(prep && prep.mixed); }
  function setIds(course) { const prep = prepOf(course); return ids(prep && prep.workshop); }
  function assessmentIds(course) {
    return [...new Set([...(course && course.units || []).map(u => u.test).filter(Boolean), ...examIds(course), ...mixedIds(course), ...setIds(course)])];
  }
  // The kind an assessment ID has in its course: what the plan says it is.
  function assessmentKind(course, id) {
    if (!assessmentIds(course).includes(id)) return null;
    if (/^unit-/.test(id)) return "unit-test";
    if (PRACTICE_EXAM_ID.test(id)) return "practice-exam";
    if (MIXED_SET_ID.test(id)) return "mixed-set";
    return FR_SET_ID.test(id) ? "fr-set" : null;
  }
  function guideIds(course) {
    const prep = prepOf(course);
    return prep ? [...new Set([...ids(prep.strategy), ...ids(prep.reviews), ...ids(prep.workshop)])] : [];
  }
  function guideKind(course, id) {
    const prep = prepOf(course);
    if (!prep || !guideIds(course).includes(id)) return null;
    if (ids(prep.workshop).includes(id)) return "fr-archetype";
    if (ids(prep.reviews).includes(id)) return "unit-review";
    return "strategy";
  }
  // Self-checks in reading order, numbered from 1 as printed.
  function guideChecks(doc) {
    const out = [];
    (doc && Array.isArray(doc.sections) ? doc.sections : []).forEach(section => (Array.isArray(section && section.blocks) ? section.blocks : [])
      .forEach(block => { if (block && block.type === "check") out.push({ section, block, number: out.length + 1 }); }));
    return out;
  }
  // test:<assessment>, key:<assessment>, guide:<guide>, unit:u<n>, week:<n>.
  const REF = /^(test|key|guide|unit|week):([a-z0-9-]+)$/;
  function parseRef(ref) { const match = REF.exec(String(ref || "")); return match ? { kind: match[1], id: match[2] } : null; }
  function refHref(courseId, ref) {
    const parsed = parseRef(ref);
    if (!parsed || !COURSES.includes(courseId)) return "";
    if (parsed.kind === "week") return /^[1-9][0-9]?$/.test(parsed.id) && Number(parsed.id) <= 36 ? "weeks.html#ap/" + courseId + "/" + parsed.id : "";
    return route(courseId, { test: "student", key: "key", guide: "guide", unit: "unit" }[parsed.kind], parsed.id);
  }
  function itemPoints(item) {
    return item ? Assessment.maximum(Adapters.apItem(item).scoring) : 0;
  }
  function rubricPoints(rubric) { return (Array.isArray(rubric) ? rubric : []).reduce((sum, row) => sum + (Number.isInteger(row.points) ? row.points : 0), 0); }

  // Every item in reading order with its printed number: multiple choice is
  // numbered 1…n across Section I, free response 1…m across Section II.
  function entries(doc) {
    return Assessment.entries(Adapters.apDocument(doc)).map(entry => ({
      section: entry.section.source, part: entry.part.source, item: entry.item.source, number: entry.number,
    }));
  }
  function minutes(doc) { return Assessment.totals(Adapters.apDocument(doc)).minutes; }
  function counts(doc) {
    const model = Adapters.apDocument(doc), list = Assessment.entries(model), total = Assessment.totals(model);
    const mc = list.filter(entry => entry.item.scoring.kind === "binary").length;
    return { mc, fr: total.items - mc, minutes: total.minutes, points: total.points };
  }

  // Maximum raw points by section and by unit (primary topic). A tally is a
  // record of raw points earned; it is never converted to a score.
  function tally(doc) {
    const model = Adapters.apDocument(doc), list = Assessment.entries(model);
    const bySection = new Map(Assessment.groupTotals(list, entry => entry.section.id).map(row => [row.key, row]));
    const sections = model.sections.map(section => {
      const row = bySection.get(section.id) || { items: 0, points: 0 };
      return { id: section.id, title: section.source.title, kind: section.source.kind, items: row.items, points: row.points };
    });
    const units = Assessment.groupTotals(list, entry => primaryUnit(entry.item.source))
      .map(row => ({ unit: row.key, items: row.items, points: row.points })).sort((a, b) => (a.unit || 0) - (b.unit || 0));
    const total = Assessment.totals(model);
    return { sections, units, total: { items: total.items, points: total.points } };
  }
  // Raw points earned from recorded responses: { mc: { <number>: "B" },
  // fr: { <itemId>: { <label>: points } } }. Unanswered counts as zero.
  function rawPoints(doc, responses = {}) {
    const result = tally(doc);
    const list = Assessment.entries(Adapters.apDocument(doc));
    const outcomes = list.map(({ item, number }) => Assessment.outcome(item.scoring,
      item.scoring.kind === "binary" ? responses.mc && responses.mc[number] : responses.fr && responses.fr[item.source.id]));
    const earned = new Map(Assessment.groupTotals(list, entry => entry.section.id, outcomes).map(row => [row.key, row.earned]));
    const byUnit = new Map(Assessment.groupTotals(list, entry => primaryUnit(entry.item.source), outcomes).map(row => [row.key, row.earned]));
    return { sections: result.sections.map(s => ({ id: s.id, title: s.title, earned: earned.get(s.id) || 0, points: s.points })),
      units: result.units.map(u => ({ unit: u.unit, earned: byUnit.get(u.unit) || 0, points: u.points })) };
  }

  function copyFigure(figure) {
    return { id: figure.id, alt: figure.alt, ...(figure.caption ? { caption: figure.caption } : {}),
      ...(figure.notToScale === true ? { notToScale: true } : {}), ...(typeof figure.svg === "string" ? { svg: figure.svg } : {}) };
  }
  function figureRefs(item) {
    return [...(item.figureIds || []), ...(item.answerFigureIds || []), ...(item.parts || []).flatMap(p => [...(p.figureIds || []), ...(p.answerFigureIds || [])])];
  }
  function project(doc, key) {
    const { sections } = Assessment.project(Adapters.apDocument(doc), key);
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
    if (doc.kind === "fr-set") return frSetProblems(doc, course);
    if (doc.kind === "mixed-set") return mixedSetProblems(doc, course);
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

  // A free-response set: one Section II whose parts keep the exam's order
  // (graphing calculator before none), at the exam's pace per question, with
  // every question worth the course's free-response points. Physics sets
  // (`frTypes`) practise one question type, each question worth that type's
  // points and paced by `minutesByType`.
  function frSetProblems(doc, course) {
    const problems = [], label = doc.id + ": ", rule = course.blueprints.frSet;
    if (!rule) return [label + "the course has no free-response set blueprint"];
    const section = doc.sections[0];
    if (doc.sections.length !== 1 || !section || section.id !== "II" || section.kind !== "fr") return [label + "a free-response set is one section II of kind fr"];
    const order = COURSE_PART_ORDER[doc.courseId] || [];
    const policies = section.parts.map(part => part.calculator);
    if (section.parts.some((part, i) => part.id !== String.fromCharCode(65 + i))) problems.push(label + "parts are A, B, … in order");
    if (new Set(policies).size !== policies.length || policies.some((p, i) => i && order.indexOf(p) <= order.indexOf(policies[i - 1]))) problems.push(label + "parts take one calculator policy each, in the exam's order (" + order.join(", then ") + ")");
    const pace = item => rule.frTypes ? (own(rule.minutesByType, item.type) ? rule.minutesByType[item.type] : 0) : rule.minutesPerQuestion;
    section.parts.forEach(part => {
      const want = part.items.reduce((sum, item) => sum + pace(item), 0);
      if (part.minutes !== want) problems.push(label + `part ${part.id} is ${part.minutes} minutes; ${part.items.length} questions take ${want}`);
    });
    const items = section.parts.flatMap(part => part.items);
    if (items.length < rule.questions[0] || items.length > rule.questions[1]) problems.push(label + `has ${items.length} questions; sets hold ${rule.questions[0]}–${rule.questions[1]}`);
    items.forEach(item => {
      if (isMc(item)) problems.push(label + item.id + " is multiple choice; sets hold free response only");
      else if (rule.frTypes) {
        if (!own(rule.frTypes, item.type)) problems.push(label + `${item.id} needs a free-response type (${Object.keys(rule.frTypes).join(", ")})`);
        else if (itemPoints(item) !== rule.frTypes[item.type]) problems.push(label + `${item.id} (${item.type}) is worth ${itemPoints(item)} points; that type is worth ${rule.frTypes[item.type]}`);
      } else if (itemPoints(item) !== rule.frPoints) problems.push(label + `${item.id} is worth ${itemPoints(item)} points; free response is worth ${rule.frPoints}`);
    });
    if (rule.frTypes && new Set(items.filter(item => !isMc(item)).map(item => item.type)).size > 1) problems.push(label + "a physics free-response set practises one question type");
    return problems;
  }

  // A mixed set: one Section I with the blueprint's parts, drawing its
  // questions' primary topics from at least `minUnits` different units.
  function mixedSetProblems(doc, course) {
    const problems = [], label = doc.id + ": ", rule = course.blueprints.mixedSet;
    if (!rule) return [label + "the course has no mixed-set blueprint"];
    const section = doc.sections[0];
    if (doc.sections.length !== 1 || !section || section.id !== "I" || section.kind !== "mc") return [label + "a mixed set is one section I of kind mc"];
    if (section.parts.length !== rule.parts.length) return [label + `needs ${rule.parts.length} parts`];
    rule.parts.forEach((want, i) => {
      const part = section.parts[i], where = label + "part " + want.id;
      if (part.id !== want.id) problems.push(where + ` is labeled ${part.id}`);
      if (part.items.length !== want.questions) problems.push(where + ` has ${part.items.length} questions; the blueprint has ${want.questions}`);
      if (part.minutes !== want.minutes) problems.push(where + ` is ${part.minutes} minutes; the blueprint has ${want.minutes}`);
      if (part.calculator !== want.calculator) problems.push(where + ` calculator is ${part.calculator}; the blueprint has ${want.calculator}`);
      part.items.forEach(item => { if (!isMc(item)) problems.push(where + ` holds free response: ${item.id}`); });
    });
    const units = new Set(section.parts.flatMap(part => part.items.map(primaryUnit)).filter(Boolean));
    if (units.size < rule.minUnits) problems.push(label + `draws on ${units.size} units; mixed sets draw on at least ${rule.minUnits}`);
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
  // "<course>/test/<id>", "<course>/test/<id>/key", "<course>/reference",
  // "<course>/prep" (exam preparation) and "<course>/guide/<id>".
  const ASSESSMENT_ID = /^(?:unit-[1-9][0-9]?|practice-exam(?:-[b-z])?|mixed-[1-9][0-9]?|fr-[a-z0-9]+(?:-[a-z0-9]+)*)$/;
  function route(courseId, view, id) {
    if (courseId === undefined || courseId === null || courseId === "") return "#";
    if (!COURSES.includes(courseId)) return "";
    if (!view) return "#" + courseId;
    if (view === "unit") return /^u[1-9][0-9]?$/.test(id || "") ? "#" + courseId + "/" + id : "";
    if (view === "reference") return "#" + courseId + "/reference";
    if (view === "prep") return "#" + courseId + "/prep";
    if (view === "guide") return SLUG.test(id || "") ? "#" + courseId + "/guide/" + id : "";
    if (view === "student" || view === "key") return ASSESSMENT_ID.test(id || "") ? "#" + courseId + "/test/" + id + (view === "key" ? "/key" : "") : "";
    return "";
  }
  function planCourses(plan) { return COURSES.map(id => (plan && plan.courses || []).find(c => c.id === id)).filter(Boolean); }
  function resolve(plan, hash) {
    const raw = String(hash || "").replace(/^#/, "");
    const parts = raw ? raw.split("/") : [];
    const none = { view: "hub", course: null, unitId: null, assessmentId: null, copy: null, guideId: null, invalid: !!raw };
    if (!parts.length) return { ...none, invalid: false };
    const course = planCourses(plan).find(c => c.id === parts[0]);
    if (!course) return none;
    const plain = { view: "plan", course, unitId: null, assessmentId: null, copy: null, guideId: null, invalid: false };
    if (parts.length === 1) return plain;
    if (parts.length === 2 && parts[1] === "reference" && course.reference) return { ...plain, view: "reference" };
    if (parts.length === 2 && parts[1] === "prep" && prepOf(course)) return { ...plain, view: "prep" };
    if (parts.length === 2 && course.units.some(u => u.id === parts[1])) return { ...plain, unitId: parts[1] };
    if (parts.length === 3 && parts[1] === "guide" && guideIds(course).includes(parts[2])) return { ...plain, view: "guide", guideId: parts[2] };
    const expected = new Set(assessmentIds(course));
    if (parts[1] === "test" && expected.has(parts[2]) && (parts.length === 3 || parts.length === 4 && parts[3] === "key")) {
      return { ...plain, view: "assessment", assessmentId: parts[2], copy: parts.length === 4 ? "key" : "student" };
    }
    return { ...plain, invalid: true };
  }
  return { FORMAT, REFERENCE_FORMAT, GUIDE_FORMAT, VERSION, DISCLAIMER, COURSES, TOPIC_PREFIX, ITEM_PREFIX, LETTERS, CALCULATOR, FR_TYPES, KEY_SHARE, LONGEST_SHARE, CLAIMS,
    GUIDE_KINDS, GUIDE_BLOCKS, SLUG, COURSE_PART_ORDER,
    isMc, isCalculus, isAssessmentTopic, topicsForUnit, calculatorLabel, kindLabel, guideKindLabel, frTypeLabel, topicUnit, primaryUnit, assessmentId, segment, itemPoints, rubricPoints, entries, minutes, counts,
    prepOf, examIds, mixedIds, setIds, assessmentIds, assessmentKind, guideIds, guideKind, guideChecks, parseRef, refHref,
    tally, rawPoints, studentCopy, keyCopy, answerSheet, keyBalance, blueprintProblems, claimProblems, strings, normalized, identity,
    route, resolve, planCourses };
});
