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
  function practiceMode(settings) {
    const mode = settings.practiceMode === undefined ? "review" : settings.practiceMode;
    if (!["rebuild", "review"].includes(mode)) throw new Error("Choose rebuild or review practice");
    return mode;
  }
  function packetPlan(lessonIds, templates, seed, mode) {
    const rng = M.random(seed + "/schedule");
    return { cycle: mode === "rebuild" ? lessonIds : rng.shuffle(lessonIds), position: 0, visible: new Set(),
      offsets: new Map(lessonIds.map(id => [id, mode === "rebuild" ? 0 : rng.int(0, Math.max(0, templates.filter(t => t.lessonId === id).length - 1))])),
      uses: new Map(lessonIds.map(id => [id, 0])), designUses: new Map() };
  }
  function coverageWarning(lessonIds, sheets, mode, label) {
    const covered = new Set(sheets.flatMap(sheet => sheet.questions.map(question => question.lessonId)));
    if (lessonIds.every(id => covered.has(id))) return null;
    if (mode === "rebuild") return `${label} covers ${covered.size} of ${lessonIds.length} selected lessons. Rebuild practice keeps guided and independent questions together. Choose more questions or nights, or fewer lessons, to include every selected lesson.`;
    return `${label} has fewer questions than selected lessons. Choose at least ${lessonIds.length} total questions to include every selected lesson.`;
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
    const mode = practiceMode(settings);
    const lessonIds = selection(course, settings);
    const lessonData = new Map(lessons(course).map(lesson => [lesson.id, lesson]));
    const count = settings.count === undefined ? 20 : Number(settings.count);
    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) throw new Error("Choose 1–100 problems per worksheet");
    const seed = String(settings.seed === undefined ? "practice" : settings.seed).trim();
    if (!seed || seed.length > 160) throw new Error("Enter a seed of 1–160 characters");
    const byLesson = new Map(lessonIds.map(id => {
      const pool = templates.filter(t => t.lessonId === id);
      if (mode === "rebuild" && lessonData.get(id).rebuildOrder) {
        const order = lessonData.get(id).rebuildOrder;
        const ranks = new Map(order.map((templateId, index) => [templateId, index]));
        pool.sort((a, b) => (ranks.get(a.id) ?? order.length) - (ranks.get(b.id) ?? order.length));
      }
      return [id, pool];
    }));
    if ([...byLesson.values()].some(values => !values.length)) throw new Error("A selected lesson has no practice generators");
    const selectedTemplates = [...byLesson.values()].flat();
    if (new Set(selectedTemplates.map(t => t.id)).size !== selectedTemplates.length) throw new Error("Duplicate template IDs");
    const rng = M.random(seed);
    const cycle = plan ? plan.cycle : mode === "rebuild" ? lessonIds : rng.shuffle(lessonIds);
    const offsets = plan ? plan.offsets : new Map(lessonIds.map(id => [id, mode === "rebuild" ? 0 : rng.int(0, byLesson.get(id).length - 1)]));
    const uses = plan ? plan.uses : new Map(lessonIds.map(id => [id, 0]));
    const designUses = plan ? plan.designUses : new Map();
    const prior = new Set(settings.avoid || []);
    const priorVisible = plan ? plan.visible : new Set();
    const seen = new Set();
    const seenVisible = new Set();
    const questions = [];
    let pair;
    for (let slot = 0; slot < count; slot += 1) {
      const position = (plan ? plan.position : 0) + slot;
      if (mode === "review" || slot % 2 === 0) {
        // Choose the least-practiced lesson/design, breaking ties in course
        // and authored design order. Odd independent questions count too, so
        // they cannot permanently favor one lesson or exhaust one design.
        const lessonId = mode === "rebuild"
          ? cycle.reduce((best, id) => uses.get(id) < uses.get(best) ? id : best, cycle[0])
          : cycle[position % cycle.length];
        const pool = byLesson.get(lessonId);
        const template = mode === "rebuild"
          ? pool.reduce((best, value) => (designUses.get(value.id) || 0) < (designUses.get(best.id) || 0) ? value : best, pool[0])
          : pool[(offsets.get(lessonId) + uses.get(lessonId)) % pool.length];
        pair = { lessonId, template };
      }
      // Keep a complete pair inside each worksheet. An odd final question is
      // independent; the shared question counters still rotate lessons and
      // designs over subsequent nights instead of favoring the same lesson.
      const { lessonId, template } = pair;
      const support = mode === "rebuild" && slot % 2 === 0 && slot + 1 < count ? "guided" : "independent";
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
          lessonId, lessonTitle: lessonData.get(lessonId).title || lessonId, skill: template.skill, support, signature, visibleSignature: visible,
          ...(course.expectations && course.expectations[template.id] ? { expectations: { ...course.expectations[template.id] } } : {}) };
        chosen = entry;
        break;
      }
      if (!chosen) throw new Error(`Could not find enough distinct exercises for lesson ${lessonId} under these settings. Try fewer questions or nights, or select more lessons.`);
      uses.set(lessonId, uses.get(lessonId) + 1);
      designUses.set(template.id, (designUses.get(template.id) || 0) + 1);
      seen.add(chosen.signature);
      seenVisible.add(chosen.visibleSignature);
      questions.push(chosen);
    }
    const version = String(course.revision || course.version);
    const codeInputs = [course.id, seed, lessonIds, questions.map(q => q.id)];
    if (mode !== "review") codeInputs.push(mode, questions.map(question => question.support));
    const code = "COURSE-" + version.slice(0, 8) + "-" + M.hash(JSON.stringify(codeInputs)).toUpperCase();
    const warning = !plan && coverageWarning(lessonIds, [{ questions }], mode, "This worksheet");
    const warnings = warning ? [warning] : [];
    return { courseId: course.id, version, seed, code, lessonIds, practiceMode: mode, title: course.title + " practice", questions,
      warnings, identities: [...seen], visibleIdentities: [...seenVisible] };
  }
  function generateWorksheet(course, templates, options) { return buildWorksheet(course, templates, options); }
  function generatePacket(course, templates, options) {
    const settings = options || {};
    const mode = practiceMode(settings);
    const days = settings.days === undefined ? 10 : Number(settings.days);
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) throw new Error("Choose 1–30 nights");
    const seed = String(settings.seed === undefined ? "practice" : settings.seed).trim();
    if (!seed || seed.length > 140) throw new Error("Enter a packet seed of 1–140 characters");
    const lessonIds = selection(course, settings);
    const plan = packetPlan(lessonIds, templates, seed, mode);
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
    const warning = coverageWarning(lessonIds, packet, mode, "This packet");
    if (warning) packet[0].warnings.push(warning);
    return packet;
  }
  function generatePacketChoices(course, templates, options) {
    const settings = options || {};
    const mode = practiceMode(settings);
    const days = settings.days === undefined ? 10 : Number(settings.days);
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) throw new Error("Choose 1–30 nights");
    const seed = String(settings.seed === undefined ? "practice" : settings.seed).trim();
    if (!seed || seed.length > 140) throw new Error("Enter a packet seed of 1–140 characters");
    const lessonIds = selection(course, settings);
    const plan = packetPlan(lessonIds, templates, seed, mode);
    const avoid = new Set(settings.avoid || []);
    const nights = [];
    for (let day = 1; day <= days; day += 1) {
      const worksheets = [];
      let nextUses, nextDesignUses;
      for (const worksheetVariant of WORKSHEET_VARIANTS) {
        // Alternatives practice the same nightly lesson/design sequence.
        // Advance that sequence once per night, not once per alternative.
        const variantPlan = { ...plan, uses: new Map(plan.uses), designUses: new Map(plan.designUses) };
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
        nextDesignUses = variantPlan.designUses;
        worksheets.push(sheet);
      }
      plan.uses = nextUses;
      plan.designUses = nextDesignUses;
      plan.position += worksheets[0].questions.length;
      nights.push({ day, worksheets });
    }
    const warning = coverageWarning(lessonIds, nights.map(night => night.worksheets[0]), mode, "Each selected worksheet packet");
    if (warning) {
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
