// Saving the practice record to a file and restoring it: the file's shape,
// the checks a file passes before anything is written, and how a restored
// record joins the one this browser holds. Pure logic with no DOM access;
// loads in Node and as a plain browser script (window.LiminalProgressIO,
// after window.LiminalProgress and window.LiminalAnalytics).
//
// A file is { format: "liminal-progress", version: 3, exportedAt, progress },
// where progress is the v3 record (LiminalProgress). A bare v3 record (the
// stored value itself) and a bare v2 record (migrated as on first load) are
// accepted too. Anything else is refused, as is a record from a newer
// version of Liminal, whose fields this version would silently drop.
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(
    node ? require("./progress") : root.LiminalProgress,
    node ? require("./analytics") : root.LiminalAnalytics,
  );
  if (node) module.exports = api;
  else root.LiminalProgressIO = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Progress, Analytics) {
  "use strict";

  const FORMAT = "liminal-progress";
  const VERSION = Progress.VERSION;
  // A full record is a few MB; a file far larger is not one of ours.
  const MAX_CHARS = 25 * 1024 * 1024;
  const TIERS = ["Easy", "Medium", "Hard"];
  const TESTS = ["SAT", "ACT"];

  const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  const isCount = (value) => Number.isFinite(value) && value >= 0;
  const optionalString = (value) => value === undefined || value === null || typeof value === "string";
  const optionalBoolean = (value) => value === undefined || typeof value === "boolean";

  /* --------------------------------------------------------------- export */

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  // The file for `progress` (the whole record, every test): { name, text }.
  function exportFile(progress, now) {
    const at = new Date(now === undefined ? Date.now() : now);
    const payload = { format: FORMAT, version: VERSION, exportedAt: at.toISOString(), progress };
    return {
      name: `liminal-progress-${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}.json`,
      text: JSON.stringify(payload),
    };
  }

  /* ----------------------------------------------------------- validation */

  // An attempt as LiminalProgress.buildAttempt writes it. Fields other lanes
  // may add later pass through untouched; only the ones the app reads are
  // checked.
  function validAttempt(attempt) {
    if (!isObject(attempt)) return false;
    if (typeof attempt.id !== "string" || !attempt.id) return false;
    if (typeof attempt.questionId !== "string" || !attempt.questionId) return false;
    if (!Progress.SOURCES.includes(attempt.source)) return false;
    if (attempt.correct !== true && attempt.correct !== false && attempt.correct !== null) return false;
    if (!isCount(attempt.timestamp)) return false;
    if (attempt.difficulty !== undefined && attempt.difficulty !== null && !TIERS.includes(attempt.difficulty)) return false;
    if (attempt.test !== undefined && attempt.test !== null && !TESTS.includes(attempt.test)) return false;
    if (attempt.timeMs !== undefined && attempt.timeMs !== null && !isCount(attempt.timeMs)) return false;
    if (!optionalBoolean(attempt.hinted) || !optionalBoolean(attempt.answered)) return false;
    return ["sectionKey", "domain", "skill", "subskill", "templateId", "seed", "sessionId", "runCode", "feedback"]
      .every((field) => optionalString(attempt[field]));
  }

  function validTally(value) {
    return value === undefined || (isObject(value) && isCount(value.total) && isCount(value.correct));
  }

  function validSession(session) {
    return isObject(session) && typeof session.id === "string" && Boolean(session.id) &&
      isCount(session.total) && isCount(session.correct) &&
      (session.finishedAt === undefined || session.finishedAt === null || isCount(session.finishedAt)) &&
      optionalString(session.sectionKey) && optionalString(session.kind) && optionalString(session.title) &&
      validTally(session.hard) && (session.byDomain === undefined || isObject(session.byDomain));
  }

  function validErrorTag(tag) {
    return isObject(tag) && Progress.ERROR_REASONS.includes(tag.reason) && optionalString(tag.rule);
  }

  // The fields every stored v3 record has, so a stray JSON file with a
  // "version" key is not taken for one.
  function looksLikeV3(record) {
    return record.version === 3 && Array.isArray(record.attempts) && Array.isArray(record.marked) &&
      Array.isArray(record.sessions) && isObject(record.history) && isObject(record.errorLog);
  }

  function looksLikeV2(record) {
    return record.version === 2 && Array.isArray(record.attempts);
  }

  function refuse(error) {
    return { ok: false, error };
  }

  const FOREIGN = "This is not a Liminal progress file. Choose a file saved with “Download my progress”.";

  // Reads a file's text. Returns { ok: true, progress, info } with a record
  // safe to merge or store, or { ok: false, error } with a sentence for the
  // student. info: { source: "export" | "record", version, migrated,
  // exportedAt, attempts, sessions, marked, tests: { SAT, ACT }, firstAt,
  // lastAt, dropped: { attempts, sessions, errorLog, plan } }.
  function parseImport(text, options) {
    const settings = options || {};
    if (typeof text !== "string" || !text.trim()) return refuse("The file is empty.");
    if (text.length > MAX_CHARS) return refuse("The file is too large to be a Liminal progress file.");
    let data;
    try {
      // "__proto__" keys never reach the record (Object.assign would treat
      // them as a prototype).
      data = JSON.parse(text, (key, value) => (key === "__proto__" ? undefined : value));
    } catch (error) {
      return refuse(FOREIGN);
    }
    if (!isObject(data)) return refuse(FOREIGN);

    let record = data;
    let source = "record";
    let exportedAt = null;
    if (data.format !== undefined) {
      if (data.format !== FORMAT) return refuse(FOREIGN);
      if (!isObject(data.progress)) return refuse("The file names Liminal but holds no progress record.");
      record = data.progress;
      source = "export";
      if (typeof data.exportedAt === "string" && Number.isFinite(Date.parse(data.exportedAt))) {
        exportedAt = data.exportedAt;
      }
    }
    const version = record.version;
    if (Number.isInteger(version) && version > VERSION) {
      return refuse(`This file was saved by a newer version of Liminal (record version ${version}). ` +
        "Reload the page to get the latest version, then try again.");
    }
    if (source === "export" && data.version !== undefined && data.version !== version) return refuse(FOREIGN);

    let migrated = false;
    let candidate;
    if (looksLikeV3(record)) {
      candidate = record;
    } else if (looksLikeV2(record)) {
      candidate = Progress.migrate(record, { epoch: settings.epoch });
      migrated = true;
    } else {
      return refuse(FOREIGN);
    }

    const attempts = candidate.attempts.filter(validAttempt);
    const sessions = candidate.sessions.filter(validSession);
    const errorLog = {};
    let droppedTags = 0;
    Object.keys(isObject(candidate.errorLog) ? candidate.errorLog : {}).forEach((id) => {
      if (validErrorTag(candidate.errorLog[id])) errorLog[id] = candidate.errorLog[id];
      else droppedTags += 1;
    });
    // Only a real date and a sensible weekly count survive (Analytics.cleanPlan).
    const plan = Analytics.cleanPlan(isObject(candidate.plan) ? candidate.plan : {});
    const progress = Progress.normalize(Object.assign({}, candidate, {
      version: VERSION,
      attempts,
      sessions,
      errorLog,
      plan: plan.plan,
    }));
    if (!progress) return refuse(FOREIGN);
    if (candidate.attempts.length && !progress.attempts.length) {
      return refuse("None of the answers in this file could be read.");
    }

    const tests = { SAT: 0, ACT: 0 };
    let firstAt = null;
    let lastAt = null;
    progress.attempts.forEach((attempt) => {
      const test = Progress.attemptTest(attempt);
      if (tests[test] !== undefined) tests[test] += 1;
      const at = Number(attempt.timestamp) || 0;
      if (at) {
        firstAt = firstAt === null ? at : Math.min(firstAt, at);
        lastAt = lastAt === null ? at : Math.max(lastAt, at);
      }
    });
    return {
      ok: true,
      progress,
      info: {
        source,
        version,
        migrated,
        exportedAt,
        attempts: progress.attempts.length,
        sessions: progress.sessions.length,
        marked: progress.marked.length,
        tests,
        firstAt,
        lastAt,
        dropped: {
          attempts: candidate.attempts.length - progress.attempts.length,
          sessions: candidate.sessions.length - progress.sessions.length,
          errorLog: droppedTags,
          plan: plan.errors.length,
        },
      },
    };
  }

  /* -------------------------------------------------------------- restore */

  // The same answer: one attempt id can name two different answers only when
  // two browsers migrated their own v2 records ("v2:0", "v2:1", ...).
  function sameAttempt(left, right) {
    return left.questionId === right.questionId && Number(left.timestamp) === Number(right.timestamp);
  }

  // `imported` joined to `current` with LiminalProgress.merge: attempts and
  // sessions are unioned by id, template history keeps the larger of each
  // value, and where both hold an error tag this browser's wins. Merge
  // treats a different epoch as a clear, so the file takes this browser's
  // epoch first. Beyond merge: marks are unioned (a file's marks are the
  // student's too), and the plan keeps this browser's values, filling gaps
  // from the file. An imported attempt whose id this browser already uses
  // for a different answer is kept under "<id>~<file epoch>", so merging
  // the same file twice changes nothing. Returns { progress, added:
  // { attempts, sessions, marked }, over: attempts beyond what the browser
  // keeps (LIMITS.attempts; the oldest go first) }.
  function mergeImport(current, imported) {
    const known = new Map(current.attempts.map((attempt) => [attempt.id, attempt]));
    const renamed = new Map();
    const attempts = imported.attempts.map((attempt) => {
      const existing = known.get(attempt.id);
      if (!existing || sameAttempt(existing, attempt)) return attempt;
      const id = `${attempt.id}~${imported.epoch}`;
      renamed.set(attempt.id, id);
      return Object.assign({}, attempt, { id });
    });
    const errorLog = {};
    Object.keys(imported.errorLog || {}).forEach((id) => {
      errorLog[renamed.get(id) || id] = imported.errorLog[id];
    });
    const merged = Progress.merge(current, Object.assign({}, imported, { attempts, errorLog, epoch: current.epoch }));
    const marked = [...new Set(current.marked.concat(imported.marked || []))];
    const progress = Object.assign({}, merged, {
      marked,
      plan: Object.assign({}, imported.plan, current.plan),
    });
    return {
      progress,
      added: {
        attempts: progress.attempts.length - current.attempts.length,
        sessions: progress.sessions.length - current.sessions.length,
        marked: marked.length - current.marked.length,
      },
      over: Math.max(0, progress.attempts.length - Progress.LIMITS.attempts),
    };
  }

  // The file's record in place of this browser's, under a new epoch: other
  // open tabs then treat it like a clear and drop their older copies instead
  // of merging them back in.
  function replaceWith(imported, epoch) {
    return Object.assign({}, imported, { epoch: epoch || Progress.newId("e") });
  }

  return {
    FORMAT,
    VERSION,
    MAX_CHARS,
    exportFile,
    parseImport,
    mergeImport,
    replaceWith,
    validAttempt,
    validSession,
  };
});
