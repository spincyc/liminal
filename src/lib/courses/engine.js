/* Course worksheet selection is independent of exam sessions and progress. */
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(node ? require("./math.js") : root.LiminalCourseMath, function (id) {
    if (id !== "grade-8-math") throw new Error("No generators registered for course: " + id);
    return node
      ? [1, 2, 3, 4].flatMap(n => require("./grade8-topic" + n + ".js"))
      : [1, 2, 3, 4].flatMap(n => root["LiminalGrade8Topic" + n] || []);
  });
  if (node) module.exports = api;
  else root.LiminalCourses = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (M, templatesForCourse) {
  "use strict";
  const MAX_COUNT = 100;
  const MAX_DAYS = 30;
  const WORKSHEET_VARIANTS = Object.freeze(["A", "B", "C"]);
  function lessons(course) { return course.units.flatMap(unit => unit.lessons); }
  function nightlyLessons(course, sheet) {
    if (!sheet || !Array.isArray(sheet.questions) || !sheet.questions.length) throw new Error("A nightly packet needs questions");
    const ids = new Set(sheet.questions.map(question => question.lessonId));
    const all = lessons(course);
    if ([...ids].some(id => !all.some(lesson => lesson.id === id))) throw new Error("A nightly question refers to an unknown lesson");
    return all.filter(lesson => ids.has(lesson.id)).map(lesson => lesson.id);
  }
  function packetPagePlan(components, options) {
    if (!Array.isArray(components)) throw new Error("Packet sections must be a list");
    const duplex = !options || options.duplex !== false;
    let page = 1;
    return components.map((component, index) => {
      if (!component || !Number.isSafeInteger(component.pageCount) || component.pageCount < 1 ||
          !Number.isSafeInteger(component.night) || component.night < 1 ||
          !["guide", "student", "answers"].includes(component.kind)) throw new Error("Invalid packet section");
      const startPage = page;
      const blankAfter = duplex && component.pageCount % 2 === 1 && index < components.length - 1;
      page += component.pageCount + Number(blankAfter);
      if (!Number.isSafeInteger(page)) throw new Error("Packet page count is too large");
      return { ...component, startPage, blankAfter };
    });
  }
  function visibleIdentity(question) {
    // Keep the complete signature to avoid silently treating hash collisions as duplicates.
    return JSON.stringify([question.prompt, question.table || null, question.graph || null]);
  }
  function identity(question) {
    // Authors identify the mathematical task and givens, ignoring superficial
    // changes such as variable letters or the order of an unordered relation.
    return question.practiceKey ? JSON.stringify(["practice", question.practiceKey]) : visibleIdentity(question);
  }
  function selection(course, settings) {
    const all = lessons(course);
    const selected = new Set(settings.lessonIds || all.map(lesson => lesson.id));
    if (!selected.size || [...selected].some(id => !all.some(lesson => lesson.id === id))) throw new Error("Choose valid course lessons");
    return all.filter(lesson => selected.has(lesson.id)).map(lesson => lesson.id);
  }
  function validateGraph(graph) {
    if (!graph || typeof graph !== "object") throw new Error("Invalid graph");
    for (const key of ["xMin", "xMax", "yMin", "yMax", "xStep", "yStep"]) {
      if (!Number.isFinite(graph[key])) throw new Error("Invalid graph " + key);
    }
    if (graph.xMax <= graph.xMin || graph.yMax <= graph.yMin || graph.xStep <= 0 || graph.yStep <= 0 ||
      (graph.xMax - graph.xMin) / graph.xStep > 100 || (graph.yMax - graph.yMin) / graph.yStep > 100) {
      throw new Error("Invalid graph scale");
    }
    const points = [...(graph.points || []), ...(graph.lines || []).flat()];
    if (points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error("Invalid graph coordinate");
  }
  function validateQuestion(question) {
    for (const key of ["prompt", "answer"]) {
      if (typeof question[key] !== "string" || !question[key].trim()) throw new Error("Missing question " + key);
    }
    if (!Array.isArray(question.steps) || question.steps.length < 1 || question.steps.some(s => typeof s !== "string" || !s.trim())) {
      throw new Error("Missing worked solution steps");
    }
    if (!Number.isInteger(question.workLines) || question.workLines < 1 || question.workLines > 12) throw new Error("Invalid working space");
    if (question.practiceKey !== undefined && (typeof question.practiceKey !== "string" || !question.practiceKey.trim())) throw new Error("Invalid practice identity");
    if (question.table) {
      const t = question.table;
      if (!Array.isArray(t.headers) || !t.headers.length || !Array.isArray(t.rows) || !t.rows.length ||
        t.rows.some(row => !Array.isArray(row) || row.length !== t.headers.length) ||
        [...t.headers, ...t.rows.flat()].some(value => typeof value !== "string")) throw new Error("Invalid question table");
    }
    if (question.graph) validateGraph(question.graph);
    if (question.answerGraph) validateGraph(question.answerGraph);
    return question;
  }
  function buildWorksheet(course, templates, options, plan) {
    const settings = options || {};
    const lessonIds = selection(course, settings);
    const count = settings.count === undefined ? 20 : Number(settings.count);
    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) throw new Error("Choose 1–100 problems per worksheet");
    const seed = String(settings.seed === undefined ? "practice" : settings.seed).trim();
    if (!seed || seed.length > 160) throw new Error("Enter a seed of 1–160 characters");
    const byLesson = new Map(lessonIds.map(id => [id, templates.filter(t => t.lessonId === id)]));
    if ([...byLesson.values()].some(values => !values.length)) throw new Error("A selected lesson has no practice generators");
    const selectedTemplates = [...byLesson.values()].flat();
    if (new Set(selectedTemplates.map(t => t.id)).size !== selectedTemplates.length) throw new Error("Duplicate template IDs");
    const rng = M.random(seed);
    const cycle = plan ? plan.cycle : rng.shuffle(lessonIds);
    const offsets = plan ? plan.offsets : new Map(lessonIds.map(id => [id, rng.int(0, byLesson.get(id).length - 1)]));
    const uses = plan ? plan.uses : new Map(lessonIds.map(id => [id, 0]));
    const prior = new Set(settings.avoid || []);
    const priorVisible = plan ? plan.visible : new Set();
    const seen = new Set();
    const seenVisible = new Set();
    const questions = [];
    for (let slot = 0; slot < count; slot += 1) {
      const lessonId = cycle[((plan ? plan.position : 0) + slot) % cycle.length];
      const pool = byLesson.get(lessonId);
      const offset = offsets.get(lessonId) + uses.get(lessonId);
      const template = pool[offset % pool.length];
      let chosen = null;
      // Preserve design coverage. Do not silently replace an exhausted graph
      // design with hundreds of table questions, or recycle an earlier night.
      for (let attempt = 0; attempt < 600; attempt += 1) {
        const drawSeed = seed + "/" + slot + "/" + template.id + "/" + attempt;
        const raw = validateQuestion(template.generate(M.random(drawSeed)));
        const signature = identity(raw);
        const visible = visibleIdentity(raw);
        if (seen.has(signature) || prior.has(signature) || seenVisible.has(visible) || priorVisible.has(visible)) continue;
        const entry = { ...raw, id: template.id + ":" + drawSeed, number: slot + 1, templateId: template.id,
          lessonId, skill: template.skill, signature, visibleSignature: visible };
        chosen = entry;
        break;
      }
      if (!chosen) throw new Error(`Could not find enough distinct exercises for lesson ${lessonId} under these settings. Try fewer questions or nights, or select more lessons.`);
      uses.set(lessonId, uses.get(lessonId) + 1);
      seen.add(chosen.signature);
      seenVisible.add(chosen.visibleSignature);
      questions.push(chosen);
    }
    const version = String(course.revision || course.version);
    const code = "COURSE-" + version.slice(0, 8) + "-" + M.hash(JSON.stringify([course.id, seed, lessonIds, questions.map(q => q.id)])).toUpperCase();
    const warnings = !plan && count < lessonIds.length ? [`This worksheet has fewer questions than selected lessons. Choose at least ${lessonIds.length} questions to include every selected lesson.`] : [];
    return { courseId: course.id, version, seed, code, lessonIds, title: course.title + " practice", questions,
      warnings, identities: [...seen], visibleIdentities: [...seenVisible] };
  }
  function generateWorksheet(course, templates, options) { return buildWorksheet(course, templates, options); }
  function generatePacket(course, templates, options) {
    const settings = options || {};
    const days = settings.days === undefined ? 10 : Number(settings.days);
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) throw new Error("Choose 1–30 nights");
    const seed = String(settings.seed === undefined ? "practice" : settings.seed).trim();
    if (!seed || seed.length > 140) throw new Error("Enter a packet seed of 1–140 characters");
    const lessonIds = selection(course, settings);
    const rng = M.random(seed + "/schedule");
    const plan = { cycle: rng.shuffle(lessonIds), position: 0, visible: new Set(),
      offsets: new Map(lessonIds.map(id => [id, rng.int(0, Math.max(0, templates.filter(t => t.lessonId === id).length - 1))])),
      uses: new Map(lessonIds.map(id => [id, 0])) };
    const avoid = new Set(settings.avoid || []);
    const packet = [];
    for (let day = 1; day <= days; day += 1) {
      const sheet = buildWorksheet(course, templates, { ...settings, seed: seed + "/night-" + day, avoid: [...avoid] }, plan);
      sheet.packetSeed = seed;
      sheet.day = day;
      sheet.days = days;
      sheet.identities.forEach(id => avoid.add(id));
      sheet.visibleIdentities.forEach(id => plan.visible.add(id));
      plan.position += sheet.questions.length;
      packet.push(sheet);
    }
    if (plan.position < lessonIds.length) packet[0].warnings.push(`This packet has fewer questions than selected lessons. Choose at least ${lessonIds.length} total questions to include every selected lesson.`);
    return packet;
  }
  function generatePacketChoices(course, templates, options) {
    const settings = options || {};
    const days = settings.days === undefined ? 10 : Number(settings.days);
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) throw new Error("Choose 1–30 nights");
    const seed = String(settings.seed === undefined ? "practice" : settings.seed).trim();
    if (!seed || seed.length > 140) throw new Error("Enter a packet seed of 1–140 characters");
    const lessonIds = selection(course, settings);
    const rng = M.random(seed + "/schedule");
    const plan = { cycle: rng.shuffle(lessonIds), position: 0, visible: new Set(),
      offsets: new Map(lessonIds.map(id => [id, rng.int(0, Math.max(0, templates.filter(t => t.lessonId === id).length - 1))])),
      uses: new Map(lessonIds.map(id => [id, 0])) };
    const avoid = new Set(settings.avoid || []);
    const nights = [];
    for (let day = 1; day <= days; day += 1) {
      const worksheets = [];
      let nextUses;
      for (const worksheetVariant of WORKSHEET_VARIANTS) {
        // Alternatives practice the same nightly lesson/design sequence.
        // Advance that sequence once per night, not once per alternative.
        const variantPlan = { ...plan, uses: new Map(plan.uses) };
        let sheet;
        try {
          sheet = buildWorksheet(course, templates, { ...settings, seed: seed + "/" + worksheetVariant + "/night-" + day, avoid: [...avoid] }, variantPlan);
        } catch (failure) {
          if (/enough distinct exercises/.test(failure.message)) throw new Error(`Three full worksheets per night need more distinct exercises. ${failure.message}`);
          throw failure;
        }
        Object.assign(sheet, { packetSeed: seed, day, days, worksheetVariant });
        sheet.identities.forEach(id => avoid.add(id));
        sheet.visibleIdentities.forEach(id => plan.visible.add(id));
        nextUses = variantPlan.uses;
        worksheets.push(sheet);
      }
      plan.uses = nextUses;
      plan.position += worksheets[0].questions.length;
      nights.push({ day, worksheets });
    }
    if (plan.position < lessonIds.length) {
      const warning = `Each selected worksheet packet has fewer questions than selected lessons. Choose at least ${lessonIds.length} total questions per selection to include every selected lesson.`;
      nights[0].worksheets.forEach(sheet => sheet.warnings.push(warning));
    }
    return nights;
  }
  function selectPacketWorksheets(nights, choices) {
    if (!Array.isArray(nights)) throw new Error("Worksheet nights must be a list");
    const selected = choices || {};
    const seen = new Set();
    for (const day of Object.keys(selected)) {
      if (!nights.some(night => String(night.day) === day)) throw new Error("Choose a worksheet for an available night");
    }
    return nights.map(night => {
      if (!night || !Number.isInteger(night.day) || night.day < 1 || seen.has(night.day) || !Array.isArray(night.worksheets)) throw new Error("Invalid worksheet night");
      seen.add(night.day);
      const variant = Object.prototype.hasOwnProperty.call(selected, night.day) ? selected[night.day] : "A";
      const matches = night.worksheets.filter(sheet => sheet.worksheetVariant === variant && sheet.day === night.day);
      if (matches.length !== 1) throw new Error(`Choose an available worksheet for Night ${night.day}`);
      return matches[0];
    });
  }
  return { MAX_COUNT, MAX_DAYS, WORKSHEET_VARIANTS, lessons, nightlyLessons, packetPagePlan, identity, visibleIdentity, validateQuestion, validateGraph, templatesForCourse, generateWorksheet, generatePacket, generatePacketChoices, selectPacketWorksheets };
});
