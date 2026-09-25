// The student's practice record: attempts, marks, template history, finished
// sets, and plan, stored in one localStorage key. Pure logic with no DOM
// access: storage is injected (anything with getItem, setItem), so the same
// code runs in Node tests and in the browser (window.LiminalProgress, after
// window.LiminalTemplateMask).
//
// Schema v3 (key liminal:progress:v3):
//   attempts  every answer a set showed, including unanswered ones
//             (answered: false, correct: false); append-only, unique by id.
//             A re-practice of an earlier miss carries reviewOf (the missed
//             question's id); the review schedule is derived from these.
//   marked    question ids currently marked for review.
//   errorLog  { [attemptId]: { reason, rule?, at } }.
//   history   per section: a serve counter, the counter value each template
//             (or bank question) was last served at, the scenes each
//             template has shown, and the union mask of served templates.
//   sessions  one summary per finished set.
//   plan      { testDate?, weeklyQuestions? }.
// v2 (liminal:progress:v2) is migrated on first load and left untouched as a
// backup.
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const Mask = node ? require("./template-mask") : root.LiminalTemplateMask;
  const api = factory(Mask);
  if (node) module.exports = api;
  else root.LiminalProgress = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Mask) {
  "use strict";

  const STORAGE_KEY = "liminal:progress:v3";
  const LEGACY_KEY = "liminal:progress:v2";
  const VERSION = 3;
  // Bounds that keep the record well inside a browser's storage quota, which
  // every site under one github.io account shares.
  const LIMITS = {
    attempts: 5000,
    sessions: 500,
    scenesPerTemplate: 30,
    servedPerSection: 400,
    // What a save falls back to when the quota is hit.
    attemptsWhenFull: 2000,
  };
  const SOURCES = ["template", "bank", "legacy-bank"];
  const ERROR_REASONS = ["content", "process", "careless", "time"];
  const DIFFICULTIES = ["Easy", "Medium", "Hard"];
  // A skill needs this many counted answers before it can be called weakest.
  const WEAK_SKILL_MIN_ATTEMPTS = 2;
  // Sections built from templates; a generated question's id is
  // "<section>:<template>:<seed>", or "sat-math-hard:<family>:<seed>" from
  // before templates had registry bits.
  const TEMPLATE_SECTIONS = ["sat-math", "sat-reading-writing"];
  const LEGACY_HARD_PREFIX = "sat-math-hard:";

  /* ------------------------------------------------------------ identity */

  // "SAT" or "ACT" from a section key or a question id; both start with it.
  function testOf(key) {
    const text = String(key || "");
    if (text.startsWith("sat-")) return "SAT";
    if (text.startsWith("act-")) return "ACT";
    return null;
  }

  // { sectionKey, templateId, seed, legacy } for a generated question id,
  // else null.
  function parseQuestionId(id) {
    const text = String(id || "");
    const legacy = text.startsWith(LEGACY_HARD_PREFIX);
    const parts = (legacy ? `sat-math:${text.slice(LEGACY_HARD_PREFIX.length)}` : text).split(":");
    if (parts.length !== 3 || !TEMPLATE_SECTIONS.includes(parts[0]) || !parts[1] || !parts[2]) {
      return null;
    }
    return { sectionKey: parts[0], templateId: parts[1], seed: parts[2], legacy };
  }

  // Bank ids are "<section>-0001".
  function sectionOfId(id) {
    const generated = parseQuestionId(id);
    if (generated) return generated.sectionKey;
    const match = /^([a-z]+(?:-[a-z]+)+)-\d+$/.exec(String(id || ""));
    return match ? match[1] : null;
  }

  // Generated questions carry their template; SAT questions without one come
  // from the retired fixed banks, whose Hard labels were inflated.
  function sourceOf(question) {
    if (!question) return "bank";
    if (question.templateId || parseQuestionId(question.id)) return "template";
    return testOf(question.sectionKey || question.id) === "SAT" ? "legacy-bank" : "bank";
  }

  let idCounter = 0;
  function newId(prefix) {
    idCounter = (idCounter + 1) % 1296;
    return `${prefix || ""}${Date.now().toString(36)}${idCounter.toString(36).padStart(2, "0")}` +
      Math.floor(Math.random() * 36 ** 4).toString(36).padStart(4, "0");
  }

  /* --------------------------------------------------------------- shape */

  function empty(options) {
    return {
      version: VERSION,
      epoch: (options && options.epoch) || newId("e"),
      attempts: [],
      marked: [],
      errorLog: {},
      history: {},
      sessions: [],
      plan: {},
    };
  }

  const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const strings = (list) => (Array.isArray(list) ? list.filter((item) => typeof item === "string") : []);
  const unique = (list) => [...new Set(list)];

  function normalizeHistory(raw) {
    const history = {};
    if (!isObject(raw)) return history;
    Object.keys(raw).forEach((sectionKey) => {
      const entry = raw[sectionKey];
      if (!isObject(entry)) return;
      const lastServed = {};
      if (isObject(entry.lastServed)) {
        Object.keys(entry.lastServed).forEach((id) => {
          const value = Number(entry.lastServed[id]);
          if (Number.isFinite(value) && value >= 0) lastServed[id] = value;
        });
      }
      const scenes = {};
      if (isObject(entry.scenes)) {
        Object.keys(entry.scenes).forEach((id) => {
          const list = strings(entry.scenes[id]);
          if (list.length) scenes[id] = list;
        });
      }
      history[sectionKey] = {
        serve: Math.max(0, Number(entry.serve) || 0, ...Object.values(lastServed)),
        lastServed,
        scenes,
        mask: typeof entry.mask === "string" && entry.mask ? entry.mask : "0",
      };
    });
    return history;
  }

  // Makes any parsed v3 value safe to use, dropping what cannot be read.
  function normalize(raw) {
    if (!isObject(raw) || raw.version !== VERSION) return null;
    const progress = empty({ epoch: typeof raw.epoch === "string" && raw.epoch ? raw.epoch : "e0" });
    const seen = new Set();
    progress.attempts = (Array.isArray(raw.attempts) ? raw.attempts : []).filter((attempt) => {
      if (!isObject(attempt) || typeof attempt.id !== "string" || typeof attempt.questionId !== "string") {
        return false;
      }
      if (seen.has(attempt.id)) return false;
      seen.add(attempt.id);
      return true;
    });
    progress.marked = unique(strings(raw.marked));
    progress.errorLog = isObject(raw.errorLog) ? Object.assign({}, raw.errorLog) : {};
    progress.history = normalizeHistory(raw.history);
    progress.sessions = (Array.isArray(raw.sessions) ? raw.sessions : [])
      .filter((session) => isObject(session) && typeof session.id === "string");
    progress.plan = isObject(raw.plan) ? Object.assign({}, raw.plan) : {};
    return progress;
  }

  /* ----------------------------------------------------------- migration */

  function migrateAttempt(attempt, index) {
    const generated = parseQuestionId(attempt.questionId);
    const sectionKey = attempt.sectionKey || sectionOfId(attempt.questionId);
    const source = generated ? "template" : testOf(sectionKey || attempt.questionId) === "SAT"
      ? "legacy-bank"
      : "bank";
    const response = attempt.response === undefined ? null : attempt.response;
    const answered = response !== null && response !== "";
    const record = {
      // Deterministic, so two tabs migrating at once agree on every id.
      id: `v2:${index}`,
      questionId: attempt.questionId,
      sectionKey: sectionKey || null,
      test: testOf(sectionKey || attempt.questionId),
      domain: attempt.domain || null,
      skill: attempt.skill || null,
      subskill: attempt.subskill || null,
      difficulty: attempt.difficulty || null,
      source,
      correct: attempt.correct === true ? true : attempt.correct === false ? false : null,
      answered,
      response,
      hinted: false,
      timeMs: null,
      // Unknown for records kept before v3.
      feedback: null,
      sessionId: null,
      timestamp: Number(attempt.timestamp) || 0,
    };
    if (generated) {
      record.templateId = attempt.familyId || generated.templateId;
      // Templates had no versions before v3; every one was version 1.
      record.templateVersion = 1;
      record.seed = attempt.seed === undefined ? generated.seed : String(attempt.seed);
    }
    if (attempt.reviewAt !== undefined) record.reviewAt = attempt.reviewAt;
    return record;
  }

  // v2: { version: 2, attempts, flagged, recentIds, servedIds, templatesSeen }.
  function migrate(v2, options) {
    const progress = empty(options);
    if (!isObject(v2)) return progress;
    progress.attempts = (Array.isArray(v2.attempts) ? v2.attempts : [])
      .map((attempt, index) => (isObject(attempt) && typeof attempt.questionId === "string"
        ? migrateAttempt(attempt, index)
        : null))
      .filter(Boolean);
    progress.marked = unique(strings(v2.flagged));
    if (isObject(v2.templatesSeen)) {
      Object.keys(v2.templatesSeen).forEach((sectionKey) => {
        const code = v2.templatesSeen[sectionKey];
        if (typeof code !== "string") return;
        sectionHistory(progress.history, sectionKey).mask = safeMaskCode(code);
      });
    }
    // Bank questions served recently, oldest first: each keeps its order as
    // its serve number so the newest stay avoided.
    strings(v2.servedIds).forEach((id) => {
      const sectionKey = sectionOfId(id);
      if (!sectionKey || parseQuestionId(id)) return;
      const entry = sectionHistory(progress.history, sectionKey);
      entry.serve += 1;
      entry.lastServed[id] = entry.serve;
    });
    return progress;
  }

  /* ------------------------------------------------------------- storage */

  function readKey(storage, key) {
    const text = storage.getItem(key);
    return text === null || text === undefined ? null : JSON.parse(text);
  }

  // { progress, migrated, readable, absent }. `readable` is false when
  // storage itself failed (blocked, or corrupt JSON) and `absent` is true
  // when nothing is stored yet; in both cases a store keeps what it holds in
  // memory rather than trusting an empty read.
  function load(storage, options) {
    try {
      const stored = normalize(readKey(storage, STORAGE_KEY));
      if (stored) return { progress: stored, migrated: false, readable: true, absent: false };
      const legacy = readKey(storage, LEGACY_KEY);
      if (isObject(legacy) && legacy.version === 2) {
        return { progress: migrate(legacy, options), migrated: true, readable: true, absent: false };
      }
      return { progress: empty(options), migrated: false, readable: true, absent: true };
    } catch (error) {
      return { progress: empty(options), migrated: false, readable: false, absent: false };
    }
  }

  function byTimestamp(left, right) {
    return (Number(left.timestamp) || 0) - (Number(right.timestamp) || 0);
  }

  // Keeps the newest records within the limits.
  function capped(progress, attemptLimit) {
    const limit = attemptLimit || LIMITS.attempts;
    return Object.assign({}, progress, {
      attempts: progress.attempts.length > limit ? progress.attempts.slice(-limit) : progress.attempts,
      sessions: progress.sessions.length > LIMITS.sessions
        ? progress.sessions.slice(-LIMITS.sessions)
        : progress.sessions,
    });
  }

  function save(storage, progress) {
    for (const limit of [LIMITS.attempts, LIMITS.attemptsWhenFull]) {
      const value = capped(progress, limit);
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(value));
        return { ok: true, progress: value };
      } catch (error) {
        /* try again smaller, then give up */
      }
    }
    return { ok: false, progress: capped(progress) };
  }

  function unionById(first, second, order) {
    const seen = new Set(first.map((item) => item.id));
    const merged = first.concat(second.filter((item) => item && !seen.has(item.id) && seen.add(item.id)));
    return order ? merged.slice().sort(order) : merged;
  }

  function mergeHistory(left, right) {
    const history = JSON.parse(JSON.stringify(left || {}));
    Object.keys(right || {}).forEach((sectionKey) => {
      const incoming = right[sectionKey];
      const entry = sectionHistory(history, sectionKey);
      entry.serve = Math.max(entry.serve, incoming.serve || 0);
      Object.keys(incoming.lastServed || {}).forEach((id) => {
        entry.lastServed[id] = Math.max(entry.lastServed[id] || 0, incoming.lastServed[id]);
      });
      Object.keys(incoming.scenes || {}).forEach((id) => {
        entry.scenes[id] = unique((entry.scenes[id] || []).concat(incoming.scenes[id]))
          .slice(-LIMITS.scenesPerTemplate);
      });
      entry.mask = unionMaskCodes(entry.mask, incoming.mask);
    });
    return history;
  }

  // What another tab stored (`stored`) plus what this tab holds (`local`).
  // Attempts and sessions are append-only, so they are unioned by id; history
  // only grows, so it takes the larger of each value. Marks, the error log's
  // existing entries, and the plan come from storage: every change to them
  // is applied to a fresh read, so storage already has this tab's changes.
  // A different epoch means the record was cleared since this tab read it,
  // and the clear wins.
  function merge(stored, local) {
    if (!local || stored.epoch !== local.epoch) return stored;
    const errorLog = Object.assign({}, local.errorLog, stored.errorLog);
    return Object.assign({}, stored, {
      attempts: unionById(stored.attempts, local.attempts, byTimestamp),
      sessions: unionById(stored.sessions, local.sessions,
        (left, right) => (left.finishedAt || 0) - (right.finishedAt || 0)),
      history: mergeHistory(stored.history, local.history),
      errorLog,
    });
  }

  // The app's handle on the record. Every change goes through update(),
  // which reads what is stored now (another tab may have written), merges
  // this tab's unsaved records, applies the change, and writes.
  function createStore(storage, options) {
    const settings = options || {};
    const first = load(storage, settings);
    let current = first.progress;
    let lastSaveOk = true;
    if (first.migrated) lastSaveOk = save(storage, current).ok;

    function update(change) {
      const fresh = load(storage, settings);
      const base = fresh.readable && !fresh.absent ? merge(fresh.progress, current) : current;
      const changed = typeof change === "function" ? change(base) || base : base;
      const result = save(storage, changed);
      current = result.progress;
      lastSaveOk = result.ok;
      return result;
    }

    return {
      key: STORAGE_KEY,
      get: () => current,
      update,
      // Re-reads storage, as when another tab changed it.
      refresh() {
        const fresh = load(storage, settings);
        if (fresh.readable && !fresh.absent) current = merge(fresh.progress, current);
        return current;
      },
      // The student asked for everything to go, so the v2 backup goes too.
      clear() {
        const result = save(storage, empty());
        try {
          storage.removeItem(LEGACY_KEY);
        } catch (error) {
          /* nothing more to remove */
        }
        current = result.progress;
        lastSaveOk = result.ok;
        return result;
      },
      saved: () => lastSaveOk,
    };
  }

  /* ------------------------------------------------------------- changes */

  // Adds attempts whose ids are new; recording the same answer twice (once
  // when checked, again when the set finishes) keeps the first.
  function recordAttempts(progress, attempts) {
    const ids = new Set(progress.attempts.map((attempt) => attempt.id));
    const added = (attempts || []).filter((attempt) => {
      if (!attempt || typeof attempt.id !== "string" || ids.has(attempt.id)) return false;
      ids.add(attempt.id);
      return true;
    });
    if (!added.length) return progress;
    return Object.assign({}, progress, { attempts: progress.attempts.concat(added) });
  }

  // `marks` maps question ids to true (marked) or false (unmarked).
  function setMarks(progress, marks) {
    const next = new Set(progress.marked);
    Object.keys(marks || {}).forEach((id) => {
      if (marks[id]) next.add(id);
      else next.delete(id);
    });
    return Object.assign({}, progress, { marked: [...next] });
  }

  function setMarked(progress, questionId, marked) {
    return setMarks(progress, { [questionId]: Boolean(marked) });
  }

  // Why a missed answer was missed. A null tag removes the entry.
  function tagError(progress, attemptId, tag, now) {
    const errorLog = Object.assign({}, progress.errorLog);
    if (!tag) {
      delete errorLog[attemptId];
    } else {
      if (!ERROR_REASONS.includes(tag.reason)) throw new Error(`Unknown error reason "${tag.reason}"`);
      errorLog[attemptId] = Object.assign(
        { reason: tag.reason, at: now === undefined ? Date.now() : now },
        tag.rule ? { rule: String(tag.rule) } : {},
      );
    }
    return Object.assign({}, progress, { errorLog });
  }

  function recordSession(progress, session) {
    if (!session || typeof session.id !== "string") return progress;
    if (progress.sessions.some((entry) => entry.id === session.id)) return progress;
    return Object.assign({}, progress, { sessions: progress.sessions.concat(session) });
  }

  function setPlan(progress, plan) {
    return Object.assign({}, progress, { plan: Object.assign({}, progress.plan, plan) });
  }

  function sectionHistory(history, sectionKey) {
    if (!history[sectionKey]) {
      history[sectionKey] = { serve: 0, lastServed: {}, scenes: {}, mask: "0" };
    }
    return history[sectionKey];
  }

  function safeMaskCode(code) {
    try {
      return Mask.toCode(Mask.fromCode(code));
    } catch (error) {
      return "0";
    }
  }

  function unionMaskCodes(left, right) {
    const read = (code) => {
      try {
        return Mask.fromCode(code || "0");
      } catch (error) {
        return Mask.EMPTY;
      }
    };
    return Mask.toCode(Mask.union(read(left), read(right)));
  }

  function cloneHistory(progress) {
    return JSON.parse(JSON.stringify(progress.history || {}));
  }

  // One run served these templates: they share the next serve number, each
  // template's scene joins its list, and the run's mask joins the section's.
  // `served` = { templateIds, scenes: { [templateId]: scene }, mask: code }.
  function serveTemplates(progress, sectionKey, served) {
    const history = cloneHistory(progress);
    const entry = sectionHistory(history, sectionKey);
    const ids = unique(strings(served && served.templateIds));
    if (!ids.length) return progress;
    entry.serve += 1;
    ids.forEach((id) => {
      entry.lastServed[id] = entry.serve;
    });
    const scenes = (served && served.scenes) || {};
    Object.keys(scenes).forEach((id) => {
      if (!scenes[id]) return;
      entry.scenes[id] = unique((entry.scenes[id] || []).filter((scene) => scene !== scenes[id])
        .concat(String(scenes[id]))).slice(-LIMITS.scenesPerTemplate);
    });
    if (served && served.mask) entry.mask = unionMaskCodes(entry.mask, served.mask);
    return Object.assign({}, progress, { history });
  }

  // Scenes the student has seen that history does not hold (an answer kept
  // from before scenes were recorded, or one past the per-template limit),
  // so later draws steer around them too. Serve numbers are untouched, and
  // the noted scenes count as the oldest seen. `scenes`: { [templateId]:
  // [scene] }. Returns `progress` itself when nothing is new.
  function noteScenes(progress, sectionKey, scenes) {
    const history = cloneHistory(progress);
    const entry = sectionHistory(history, sectionKey);
    let changed = false;
    Object.keys(scenes || {}).forEach((id) => {
      const known = entry.scenes[id] || [];
      const added = unique(strings(scenes[id]).filter((scene) => scene && !known.includes(scene)));
      if (!added.length) return;
      entry.scenes[id] = added.concat(known).slice(-LIMITS.scenesPerTemplate);
      changed = true;
    });
    return changed ? Object.assign({}, progress, { history }) : progress;
  }

  // A fixed-bank set: its questions share the next serve number, and only
  // the most recently served stay remembered.
  function serveQuestions(progress, sectionKey, questionIds) {
    const ids = unique(strings(questionIds));
    if (!ids.length) return progress;
    const history = cloneHistory(progress);
    const entry = sectionHistory(history, sectionKey);
    entry.serve += 1;
    ids.forEach((id) => {
      entry.lastServed[id] = entry.serve;
    });
    const kept = Object.entries(entry.lastServed)
      .sort((left, right) => right[1] - left[1])
      .slice(0, LIMITS.servedPerSection);
    entry.lastServed = Object.fromEntries(kept);
    return Object.assign({}, progress, { history });
  }

  /* ------------------------------------------------------------- records */

  const hasResponse = (value) => value !== null && value !== undefined && value !== "";

  // One attempt record from a question and what happened to it. `context`:
  // { id, sessionId, feedback, runCode, templateVersion, now }.
  function buildAttempt(question, outcome, context) {
    const settings = context || {};
    const essay = question.responseType === "essay";
    const answered = hasResponse(outcome.response);
    const correct = essay ? null : answered ? outcome.correct === true : false;
    const now = settings.now === undefined ? Date.now() : settings.now;
    const source = sourceOf(question);
    const record = {
      id: settings.id,
      questionId: question.id,
      sectionKey: question.sectionKey || sectionOfId(question.id),
      test: testOf(question.sectionKey || question.id),
      domain: question.domain || null,
      skill: question.skill || null,
      subskill: question.subskill || null,
      difficulty: question.difficulty || null,
      source,
      correct,
      answered,
      response: essay ? (answered ? "[local essay draft]" : null) : answered ? outcome.response : null,
      hinted: Boolean(outcome.hinted),
      timeMs: Number.isFinite(Number(outcome.timeMs)) && outcome.timeMs !== null
        ? Math.round(Number(outcome.timeMs))
        : null,
      feedback: settings.feedback === "instant" ? "instant" : "end",
      sessionId: settings.sessionId || null,
      timestamp: now,
      // When a missed question is next due for the recommendation.
      reviewAt: correct === false ? now + 24 * 60 * 60 * 1000
        : correct === true ? now + 7 * 24 * 60 * 60 * 1000
          : null,
    };
    if (source === "template") {
      const parsed = parseQuestionId(question.id) || {};
      record.templateId = question.templateId || parsed.templateId;
      record.templateVersion = Number(settings.templateVersion) || 1;
      record.seed = question.seed !== undefined ? String(question.seed) : parsed.seed;
    }
    if (settings.runCode) record.runCode = settings.runCode;
    // A question built to re-practise an earlier miss names it, so the
    // review schedule (lib/review-queue.js) follows a fresh version back to
    // the original.
    if (typeof question.reviewOf === "string" && question.reviewOf) record.reviewOf = question.reviewOf;
    return record;
  }

  function tally() {
    return { total: 0, correct: 0 };
  }

  // One finished set's summary. `meta`: { id, sectionKey, kind, title,
  // runCode, startedAt, finishedAt }; `items`: the shell's result items.
  function summarizeSession(meta, items, elapsedMs) {
    const list = items || [];
    const byDomain = {};
    const hard = tally();
    let correct = 0;
    let hintedCorrect = 0;
    list.forEach((item) => {
      const question = item.question || {};
      const right = item.answered && item.correct === true;
      if (right) correct += 1;
      if (right && item.hinted) hintedCorrect += 1;
      const domain = question.domain || "Other";
      byDomain[domain] = byDomain[domain] || tally();
      byDomain[domain].total += 1;
      if (right) byDomain[domain].correct += 1;
      if (question.difficulty === "Hard") {
        hard.total += 1;
        if (right) hard.correct += 1;
      }
    });
    const sections = unique(list.map((item) => item.question && item.question.sectionKey).filter(Boolean));
    const session = {
      id: meta.id,
      sectionKey: meta.sectionKey || sections[0] || null,
      kind: meta.kind || "practice",
      title: meta.title || "",
      startedAt: meta.startedAt || null,
      finishedAt: meta.finishedAt || Date.now(),
      total: list.length,
      correct,
      hintedCorrect,
      hard,
      timeMs: Number.isFinite(Number(elapsedMs)) ? Math.round(Number(elapsedMs)) : null,
      byDomain,
    };
    if (sections.length > 1) session.sections = sections;
    if (meta.runCode) session.runCode = meta.runCode;
    if (meta.feedback) session.feedback = meta.feedback;
    return session;
  }

  /* --------------------------------------------------------------- reads */

  function attemptTest(attempt) {
    return attempt.test || testOf(attempt.sectionKey) || testOf(attempt.questionId);
  }

  function attemptSection(attempt) {
    return attempt.sectionKey || sectionOfId(attempt.questionId);
  }

  // `filter`: { test, sectionKey, sectionKeys }.
  function matchesFilter(filter, test, sectionKey) {
    const settings = filter || {};
    if (settings.test && test !== settings.test) return false;
    if (settings.sectionKey && sectionKey !== settings.sectionKey) return false;
    if (settings.sectionKeys && !settings.sectionKeys.includes(sectionKey)) return false;
    return true;
  }

  function attemptsFor(progress, filter) {
    return progress.attempts.filter((attempt) =>
      matchesFilter(filter, attemptTest(attempt), attemptSection(attempt)));
  }

  // Questions whose most recent answer was wrong or left blank.
  function missedIds(progress, filter) {
    const latest = new Map();
    attemptsFor(progress, filter).forEach((attempt) => {
      if (attempt.correct === true || attempt.correct === false) latest.set(attempt.questionId, attempt);
    });
    return [...latest.values()].filter((attempt) => attempt.correct === false)
      .map((attempt) => attempt.questionId);
  }

  function markedIds(progress, filter) {
    return progress.marked.filter((id) => matchesFilter(filter, testOf(id), sectionOfId(id)));
  }

  function isMarked(progress, questionId) {
    return progress.marked.includes(questionId);
  }

  // Each question's most recent scored attempt: Map questionId -> attempt.
  function latestAttempts(progress, filter) {
    const latest = new Map();
    attemptsFor(progress, filter).forEach((attempt) => {
      if (attempt.correct === true || attempt.correct === false) latest.set(attempt.questionId, attempt);
    });
    return latest;
  }

  // A template's fingerprint covers what the student sees, not its tier or
  // taxonomy, so a template relabeled since (Hard to Medium, say) keeps its
  // version. Stats therefore take difficulty, domain, skill, and subskill
  // from the current template, falling back to what the attempt stored, and
  // flag `updated` when the template's version changed since the answer.
  // `current`: { [sectionKey]: { [templateId]: { difficulty, domain, skill,
  // subskill, version } } }.
  function withCurrentTemplates(attempts, current) {
    return (attempts || []).map((attempt) => {
      if (attempt.source !== "template" || !attempt.templateId) return attempt;
      const info = ((current || {})[attemptSection(attempt)] || {})[attempt.templateId];
      if (!info) return attempt;
      const next = Object.assign({}, attempt, {
        difficulty: info.difficulty || attempt.difficulty,
        domain: info.domain || attempt.domain,
        skill: info.skill || attempt.skill,
        subskill: info.subskill || attempt.subskill,
      });
      if ((Number(attempt.templateVersion) || 1) !== (Number(info.version) || 1)) next.updated = true;
      return next;
    });
  }

  // withCurrentTemplates's `current` from the built template registries
  // ({ [sectionKey]: registry }, as window.PRACTICE_TEMPLATES holds them),
  // whose live entries carry each template's tier, taxonomy, and version.
  // Views label and re-tier answers with it without loading a section's
  // template bundle. Retired entries are left out.
  function registryTemplateInfo(registries) {
    const info = {};
    Object.keys(registries || {}).forEach((sectionKey) => {
      const registry = registries[sectionKey];
      info[sectionKey] = {};
      ((registry && registry.templates) || []).forEach((entry) => {
        if (!entry || entry.retired || typeof entry.id !== "string") return;
        info[sectionKey][entry.id] = {
          difficulty: entry.difficulty || null,
          domain: entry.domain || null,
          skill: entry.skill || null,
          subskill: entry.subskill || null,
          version: Number(entry.version) > 0 ? Number(entry.version) : 1,
        };
      });
    });
    return info;
  }

  // The most recently answered question ids, newest last.
  function recentQuestionIds(progress, limit) {
    return progress.attempts.slice(-(limit || 30)).map((attempt) => attempt.questionId);
  }

  function historyFor(progress, sectionKey) {
    const entry = (progress.history || {})[sectionKey];
    return entry
      ? JSON.parse(JSON.stringify(entry))
      : { serve: 0, lastServed: {}, scenes: {}, mask: "0" };
  }

  // Bank question ids served in this section, most recent first.
  function recentlyServedIds(progress, sectionKey, limit) {
    return Object.entries(historyFor(progress, sectionKey).lastServed)
      .sort((left, right) => right[1] - left[1])
      .slice(0, limit || LIMITS.servedPerSection)
      .map(([id]) => id);
  }

  function rate(row) {
    return Object.assign(row, { accuracy: row.attempted ? row.correct / row.attempted : null });
  }

  function statRow(extra) {
    return Object.assign({ attempted: 0, correct: 0, hintedCorrect: 0, unanswered: 0, accuracy: null }, extra);
  }

  // The one accuracy model every view uses. An attempt counts when it was
  // scored (essays are not) and did not come from the retired fixed SAT
  // banks (`legacy` counts those left out). Unanswered counts as incorrect.
  // A correct answer reached after a hint is counted in `hintedCorrect` and
  // not as correct: it is not evidence of mastery. `updated` counts answers
  // flagged by withCurrentTemplates. `includeLegacy` counts the retired
  // banks too.
  function stats(attempts, options) {
    const settings = options || {};
    const summary = statRow({ legacy: 0, updated: 0, questions: 0, byDifficulty: {}, bySkill: {}, byDomain: {} });
    DIFFICULTIES.forEach((tier) => {
      summary.byDifficulty[tier] = statRow({ difficulty: tier });
    });
    const questions = new Set();
    (attempts || []).forEach((attempt) => {
      if (attempt.correct !== true && attempt.correct !== false) return;
      if (attempt.source === "legacy-bank" && !settings.includeLegacy) {
        summary.legacy += 1;
        return;
      }
      questions.add(attempt.questionId);
      if (attempt.updated) summary.updated += 1;
      const sectionKey = attemptSection(attempt);
      const rows = [summary];
      if (summary.byDifficulty[attempt.difficulty]) rows.push(summary.byDifficulty[attempt.difficulty]);
      if (attempt.skill) {
        const key = `${sectionKey}|${attempt.skill}`;
        summary.bySkill[key] = summary.bySkill[key] ||
          statRow({ sectionKey, domain: attempt.domain || null, skill: attempt.skill });
        rows.push(summary.bySkill[key]);
      }
      if (attempt.domain) {
        const key = `${sectionKey}|${attempt.domain}`;
        summary.byDomain[key] = summary.byDomain[key] ||
          statRow({ sectionKey, domain: attempt.domain });
        rows.push(summary.byDomain[key]);
      }
      rows.forEach((row) => {
        row.attempted += 1;
        if (attempt.correct && !attempt.hinted) row.correct += 1;
        if (attempt.correct && attempt.hinted) row.hintedCorrect += 1;
        if (attempt.answered === false) row.unanswered += 1;
      });
    });
    summary.questions = questions.size;
    [summary, ...Object.values(summary.byDifficulty), ...Object.values(summary.bySkill),
      ...Object.values(summary.byDomain)].forEach(rate);
    return summary;
  }

  // The skill with the lowest accuracy among those with enough counted
  // answers, in the given sections; ties go to the skill answered more.
  // `options.current` re-tiers template attempts (see withCurrentTemplates).
  function weakestSkill(progress, filter, options) {
    const settings = options || {};
    const minimum = settings.minAttempts || WEAK_SKILL_MIN_ATTEMPTS;
    const attempts = withCurrentTemplates(attemptsFor(progress, filter), settings.current);
    return Object.values(stats(attempts).bySkill)
      .filter((row) => row.attempted >= minimum)
      .sort((left, right) => left.accuracy - right.accuracy || right.attempted - left.attempted)[0] || null;
  }

  return {
    STORAGE_KEY,
    LEGACY_KEY,
    VERSION,
    LIMITS,
    SOURCES,
    ERROR_REASONS,
    TEMPLATE_SECTIONS,
    WEAK_SKILL_MIN_ATTEMPTS,
    // identity
    testOf,
    parseQuestionId,
    sectionOfId,
    sourceOf,
    newId,
    // shape and storage
    empty,
    normalize,
    migrate,
    load,
    save,
    merge,
    createStore,
    // changes
    recordAttempts,
    setMarked,
    setMarks,
    tagError,
    recordSession,
    setPlan,
    serveTemplates,
    noteScenes,
    serveQuestions,
    // records
    buildAttempt,
    summarizeSession,
    // reads
    attemptTest,
    attemptsFor,
    missedIds,
    markedIds,
    isMarked,
    latestAttempts,
    withCurrentTemplates,
    registryTemplateInfo,
    recentQuestionIds,
    historyFor,
    recentlyServedIds,
    stats,
    weakestSkill,
  };
});
