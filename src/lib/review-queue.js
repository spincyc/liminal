// Spaced re-practice of missed questions, and the counts behind the error
// log. Pure logic with no DOM access; loads in Node and as a plain browser
// script (window.LiminalReviewQueue, after window.LiminalProgress).
//
// The schedule is derived from attempts alone, so it stores nothing of its
// own and follows the attempts through migration and multi-tab merges.
//
// - A miss (a wrong answer, a blank, or a correct answer reached after a
//   hint: LiminalProgress.isMiss) enters the schedule at stage 1, due one
//   local calendar day later.
// - A correct answer on or after the due day steps it to the next stage:
//   due 3, then 7, then 21 days after that answer. A correct answer at the
//   21-day stage graduates it ("learned").
// - A wrong answer, a blank, or a correct answer reached after a hint puts
//   it back at stage 1, due the next day. A hinted answer is not evidence of
//   mastery here either (see LiminalProgress.stats).
// - A correct answer before the due day changes nothing: recall inside the
//   gap tests memory of the answer, not the method.
// - A graduated question that is missed again re-enters at stage 1.
//
// Answers from any set count. An answer belongs to the miss it was built to
// re-practise (attempt.reviewOf) or else to its own question, so a fresh
// version of a template counts toward the original miss.
//
// Stage 1 re-serves the exact question last missed. Later stages serve a
// fresh draw of the same template (new numbers or scene), which tests
// transfer rather than memory of one item. Bank questions have no template,
// so they always come back as they were. Answers from the retired fixed SAT
// banks (source "legacy-bank") are left out: those items are no longer
// practised.
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const Progress = node ? require("./progress") : root.LiminalProgress;
  const api = factory(Progress, node ? require("./core") : root.PracticeCore);
  if (node) module.exports = api;
  else root.LiminalReviewQueue = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Progress, Core) {
  "use strict";

  // Days until the next re-practice at each stage (stage n uses INTERVALS[n - 1]).
  const INTERVALS = [1, 3, 7, 21];
  // The most questions one Review set takes, most overdue first. The plan
  // makes Review the next step at most once a calendar day
  // (lib/analytics.js reviewDoneToday), so a day's Review stays about ten
  // to fifteen minutes; whatever is still due waits for the student's
  // choice or the next day. Six is the largest size the plan's simulation
  // supported (2026-10-16, moderate learner, 45 minutes a day, 12 weeks):
  // Review 22% of questions with the backlog levelling off, against 26% at
  // seven, 32% at eight and 40% at ten; no size started every skill by
  // week 8 in 8 of 10 runs (six: 5, seven: 7, eight: 3).
  const SET_LIMIT = 6;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const REASONS = Progress.ERROR_REASONS;
  // A skill's error log suggests its Learn page when at least this many of
  // its tagged misses are content errors and they are more than half of them.
  const CONTENT_GAP_MIN = 2;

  /* ---------------------------------------------------------------- days */

  // A local calendar day as a whole number (days since 1970-01-01 in the
  // device's time zone). Adding n to it is n calendar days whatever
  // daylight saving does to the hours in between.
  function dayOf(ms) {
    const date = new Date(Number(ms) || 0);
    return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
  }

  // The first local moment of a day number, in ms.
  function startOfDay(day) {
    const date = new Date(day * MS_PER_DAY);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).getTime();
  }

  // "YYYY-MM-DD" for a day number.
  function dayKey(day) {
    return new Date(day * MS_PER_DAY).toISOString().slice(0, 10);
  }

  /* ------------------------------------------------------------ schedule */

  // The schedule an answer belongs to. A generated question's schedule is
  // its design's: "<sectionKey>:<templateId>", so every version of a
  // template, from any set, counts toward the one schedule (Review serves
  // fresh versions from the second return anyway), and a student who
  // misses several versions of one design has one entry, not one per
  // version. A bank question's is the miss it was built to re-practise
  // (reviewOf) or else its own id.
  function rootOf(attempt) {
    if (!attempt) return null;
    const parsed = Progress.parseQuestionId(attempt.questionId);
    const templateId = attempt.templateId || (parsed && parsed.templateId);
    if (templateId && (attempt.source === "template" || parsed)) {
      return `${attempt.sectionKey || (parsed && parsed.sectionKey) || Progress.sectionOfId(attempt.questionId)}:${templateId}`;
    }
    return attempt.reviewOf || attempt.questionId || null;
  }

  function scored(attempt) {
    return attempt.correct === true || attempt.correct === false;
  }

  function byTime(list) {
    return list
      .map((attempt, index) => ({ attempt, index }))
      .sort((left, right) => (Number(left.attempt.timestamp) || 0) - (Number(right.attempt.timestamp) || 0) ||
        left.index - right.index)
      .map((entry) => entry.attempt);
  }

  // Back to stage 1 after a lapse; `attempt` is the lapse.
  function restart(entry, attempt, day) {
    entry.stage = 1;
    entry.dueDay = day + INTERVALS[0];
    entry.learned = false;
    entry.learnedAt = null;
    entry.exactId = attempt.questionId;
    entry.contentIdentity = attempt.contentIdentity || null;
    entry.lastMissId = attempt.id;
    entry.lastMissAt = Number(attempt.timestamp) || 0;
    entry.misses += 1;
  }

  function newEntry(questionId, attempt) {
    const sectionKey = attempt.sectionKey || Progress.sectionOfId(questionId);
    const parsed = Progress.parseQuestionId(questionId);
    return {
      questionId,
      sectionKey,
      test: attempt.test || Progress.testOf(sectionKey || questionId),
      domain: attempt.domain || null,
      skill: attempt.skill || null,
      subskill: attempt.subskill || null,
      difficulty: attempt.difficulty || null,
      source: attempt.source || (parsed ? "template" : "bank"),
      templateId: attempt.templateId || (parsed && parsed.templateId) || null,
      stage: 1,
      dueDay: 0,
      learned: false,
      learnedAt: null,
      exactId: questionId,
      contentIdentity: attempt.contentIdentity || null,
      lastMissId: null,
      lastMissAt: 0,
      lastAnswerAt: 0,
      misses: 0,
      steps: 0,
    };
  }

  // Map questionId -> entry for every question with a miss on record,
  // learned ones included. Each entry: { questionId, sectionKey, test,
  // domain, skill, subskill, difficulty, source, templateId, stage (1-4),
  // dueDay, learned, learnedAt, exactId (the question stage 1 re-serves),
  // lastMissId, lastMissAt, lastAnswerAt, misses, steps }.
  function build(attempts) {
    const entries = new Map();
    const usable = (attempts || []).filter((attempt) => attempt && typeof attempt.questionId === "string" &&
      scored(attempt) && attempt.source !== "legacy-bank");
    byTime(usable).forEach((attempt) => {
      const questionId = rootOf(attempt);
      const day = dayOf(attempt.timestamp);
      const success = attempt.correct === true && !attempt.hinted;
      let entry = entries.get(questionId);
      if (!entry || entry.learned) {
        // Only a miss starts (or restarts) a schedule.
        if (!Progress.isMiss(attempt)) return;
        entry = entry || newEntry(questionId, attempt);
        entries.set(questionId, entry);
        restart(entry, attempt, day);
        entry.lastAnswerAt = Number(attempt.timestamp) || 0;
        return;
      }
      entry.lastAnswerAt = Number(attempt.timestamp) || 0;
      // A correct answer to revised fixed-bank content cannot demonstrate
      // recall of the earlier question. A new miss below starts the current
      // revision's schedule while retaining all original attempt history.
      if (success && entry.source !== "template" &&
          (attempt.contentIdentity || null) !== entry.contentIdentity) return;
      if (!success) {
        restart(entry, attempt, day);
      } else if (day >= entry.dueDay) {
        entry.steps += 1;
        if (entry.stage >= INTERVALS.length) {
          entry.learned = true;
          entry.learnedAt = Number(attempt.timestamp) || 0;
        } else {
          entry.stage += 1;
          entry.dueDay = day + INTERVALS[entry.stage - 1];
        }
      }
    });
    return entries;
  }

  // "exact" re-serves entry.exactId; "fresh" draws its template again.
  function modeOf(entry) {
    return entry.stage > 1 && entry.source === "template" && entry.templateId ? "fresh" : "exact";
  }

  function isDue(entry, today) {
    return !entry.learned && entry.dueDay <= today;
  }

  function byDue(left, right) {
    return left.dueDay - right.dueDay || left.lastMissAt - right.lastMissAt ||
      (left.questionId < right.questionId ? -1 : left.questionId > right.questionId ? 1 : 0);
  }

  // The schedule as of `now`. Options:
  //   skip(entry)      true leaves an entry out (a retired template, say)
  //                    and counts it in `unavailable`
  //   flightAt(entry)  for a section with a plan: null while the miss's
  //                    skill has never been in flight, so the entry is
  //                    parked (not due, listed in `parked`); else the moment
  //                    it first entered flight, and a miss from before that
  //                    is scheduled from that day (its interval counted from
  //                    it); undefined outside a plan
  //   prefer(entry)    true for entries to take first among those due
  //                    (misses on skills already drilled), each group most
  //                    overdue first
  // Returns { due, upcoming (soonest first), learned, unavailable, parked,
  // today, nextDue: { day, count } | null }. Entries rescheduled from their
  // skill's first flight are copies with the later dueDay.
  function summarize(entries, now, options) {
    const settings = options || {};
    const today = dayOf(now === undefined ? Date.now() : now);
    const summary = { today, due: [], upcoming: [], learned: [], unavailable: [], parked: [], nextDue: null };
    const list = entries instanceof Map ? [...entries.values()] : (entries || []);
    list.forEach((original) => {
      let entry = original;
      if (entry.learned) {
        summary.learned.push(entry);
        return;
      }
      if (!Core.questionAvailable(entry.exactId || entry.questionId, entry.sectionKey) ||
          (settings.skip && settings.skip(entry))) {
        summary.unavailable.push(entry);
        return;
      }
      const flight = settings.flightAt ? settings.flightAt(entry) : undefined;
      if (flight === null) {
        summary.parked.push(entry);
        return;
      }
      if (Number.isFinite(flight) && dayOf(entry.lastMissAt) < dayOf(flight)) {
        const from = dayOf(flight) + INTERVALS[Math.max(0, entry.stage - 1)];
        if (from > entry.dueDay) entry = Object.assign({}, entry, { dueDay: from });
      }
      if (isDue(entry, today)) summary.due.push(entry);
      else summary.upcoming.push(entry);
    });
    const prefer = settings.prefer || (() => true);
    summary.due.sort((left, right) => Number(Boolean(prefer(right))) - Number(Boolean(prefer(left))) || byDue(left, right));
    summary.upcoming.sort(byDue);
    if (summary.upcoming.length) {
      const day = summary.upcoming[0].dueDay;
      summary.nextDue = { day, count: summary.upcoming.filter((entry) => entry.dueDay === day).length };
    }
    return summary;
  }

  // The due entries one review set takes, in order (pass summarize's `due`,
  // most overdue first): at most `limit` (default SET_LIMIT), and at most
  // one per template (a set never repeats a template; bank questions count
  // by id). Returns { picked, left } where `left` is what stays due.
  function pickSet(due, options) {
    const limit = (options && options.limit) || SET_LIMIT;
    const used = new Set();
    const picked = [];
    const left = [];
    (due || []).forEach((entry) => {
      const key = entry.templateId ? `${entry.sectionKey}:${entry.templateId}` : entry.questionId;
      if (!Core.questionAvailable(entry.exactId || entry.questionId, entry.sectionKey) || picked.length >= limit || used.has(key)) {
        left.push(entry);
        return;
      }
      used.add(key);
      picked.push(entry);
    });
    return { picked, left };
  }

  /* ----------------------------------------------------------- error log */

  // Every missed answer (wrong, blank, or correct only after a hint),
  // newest first.
  function missedAttempts(attempts) {
    const list = (attempts || []).filter(Progress.isMiss);
    return byTime(list).reverse();
  }

  // An attempt's tag reason, or null when untagged (or tagged with a reason
  // this version does not know).
  function reasonOf(errorLog, attempt) {
    const tag = errorLog && errorLog[attempt.id];
    return tag && REASONS.includes(tag.reason) ? tag.reason : null;
  }

  function sectionOf(attempt) {
    return attempt.sectionKey || Progress.sectionOfId(attempt.questionId);
  }

  // `filter`: { reason: "all" | "untagged" | a reason, sectionKey, skill }.
  function filterMissed(missed, errorLog, filter) {
    const settings = filter || {};
    return (missed || []).filter((attempt) => {
      if (settings.sectionKey && sectionOf(attempt) !== settings.sectionKey) return false;
      if (settings.skill && attempt.skill !== settings.skill) return false;
      if (!settings.reason || settings.reason === "all") return true;
      const reason = reasonOf(errorLog, attempt);
      return settings.reason === "untagged" ? reason === null : reason === settings.reason;
    });
  }

  // { total, untagged, content, process, careless, time }.
  function reasonCounts(missed, errorLog) {
    const counts = { total: 0, untagged: 0 };
    REASONS.forEach((reason) => {
      counts[reason] = 0;
    });
    (missed || []).forEach((attempt) => {
      counts.total += 1;
      counts[reasonOf(errorLog, attempt) || "untagged"] += 1;
    });
    return counts;
  }

  // Skills whose tagged misses are mostly content errors, the case a Learn
  // page addresses: [{ sectionKey, domain, skill, content, tagged, total }],
  // most content errors first.
  function contentGaps(missed, errorLog, options) {
    const minimum = (options && options.minimum) || CONTENT_GAP_MIN;
    const bySkill = new Map();
    (missed || []).forEach((attempt) => {
      if (!attempt.skill) return;
      const sectionKey = sectionOf(attempt);
      const key = `${sectionKey}|${attempt.skill}`;
      if (!bySkill.has(key)) {
        bySkill.set(key, { sectionKey, domain: attempt.domain || null, skill: attempt.skill, content: 0, tagged: 0, total: 0 });
      }
      const row = bySkill.get(key);
      const reason = reasonOf(errorLog, attempt);
      row.total += 1;
      if (reason) row.tagged += 1;
      if (reason === "content") row.content += 1;
    });
    return [...bySkill.values()]
      .filter((row) => row.content >= minimum && row.content * 2 > row.tagged)
      .sort((left, right) => right.content - left.content || right.total - left.total ||
        (left.skill < right.skill ? -1 : 1));
  }

  return {
    INTERVALS,
    SET_LIMIT,
    CONTENT_GAP_MIN,
    dayOf,
    startOfDay,
    dayKey,
    rootOf,
    build,
    modeOf,
    isDue,
    summarize,
    pickSet,
    missedAttempts,
    reasonOf,
    filterMissed,
    reasonCounts,
    contentGaps,
  };
});
