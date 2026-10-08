/* Reading-level calibration: pure scoring, the adaptive ladder, placement,
   the acceleration plan, re-checks and saved-state parsing. No DOM access;
   loads in Node (module.exports) and the browser (window.LiminalReadingLevel).

   This is a practice placement inside Liminal's daily library, made from a
   few short passages. It is not a standardized test, a Lexile measure or a
   measured reading level. Levels are the daily library's grade numbers
   (1–12, then Advanced 1–4 as 13–16); nothing here assumes a top level, so
   a probe form for any library level can be added as data. */
(function (root, factory) {
  // Level names and route keys come from the daily library's own module
  // (lib/daily-reading.js loads first in the page), so a new library level
  // such as Advanced 1 (13, key a1) needs no change here.
  const node = typeof module === "object" && module.exports;
  const api = factory(node ? require("./daily-reading") : root.LiminalDailyReading);
  if (node) module.exports = api;
  else root.LiminalReadingLevel = api;
})(typeof window === "object" ? window : globalThis, function (D) {
  "use strict";

  // ---- Thresholds. Each is an editorial choice, kept conservative. ----

  // A probe shows strong comprehension at 75% correct or better: 3 of 4, or
  // all 3 of a 3-item probe. Guessing 3 of 4 among four equally plausible
  // options happens about 5% of the time (all 3 of 3, about 1.6%); it rises
  // sharply when options can be ruled out without reading (about 11% with one
  // ruled out per item, 31% with two), so every distractor must be plausible.
  const STRONG_SHARE = 0.75;
  // Below half correct (0–1 of 4, 0–1 of 3) is weak: the passage was not
  // understood well enough to read alone, so the ladder steps down faster.
  const WEAK_BELOW = 0.5;
  // At most five passages in one sitting (about 15–35 minutes). Most
  // students find their boundary in two to four.
  const MAX_PROBES = 5;
  // Faster than this many words a minute is not careful first reading of an
  // unfamiliar passage at these levels; the passage stays visible during the
  // questions, so a rushed probe cannot move a student up.
  const MAX_PLAUSIBLE_WPM = 600;
  // Pace floors, in words a minute from Start to Done. They are deliberately
  // low (well under the rates usually reported for typical silent reading at
  // each grade) so that only clearly laboured reading holds a student at a
  // level. Editorial choices, not norms. Levels above the table use its last
  // value until a new level supplies its own.
  const COMFORTABLE_WPM_FLOOR = { 1: 40, 2: 55, 3: 70, 4: 80, 5: 90, 6: 100, 7: 105, 8: 110, 9: 115, 10: 120, 11: 125, 12: 130 };
  // Placement week within the placed level's 36-week year:
  //   START — passed the level, the next level was weak (or untried);
  //   STRONG — passed it with every answer right at a comfortable pace;
  //   NEAR — passed it, and the next level was partly understood.
  // Weeks 10 and 19 begin the second and third quarters of the year.
  const PLACEMENT_WEEK = { start: 1, strong: 10, near: 19 };
  // A re-check with an alternate form every four weeks.
  const RECHECK_EVERY_WEEKS = 4;
  // Stretch nights a week from the next level, by plan stage (one stage per
  // re-check block). Never more than 2 of 5, so most nights stay at the
  // placement. A weak re-check returns to the first stage.
  const STRETCH_NIGHTS_BY_STAGE = [1, 2, 2];
  // Stretch nights sit mid-week (0-based night positions), so each week
  // opens and closes at the comfortable level.
  const STRETCH_SLOTS = { 1: [2], 2: [1, 3] };
  const NIGHTS_PER_WEEK = 5;
  const PLAN_WEEKS = [4, 8, 12];
  const DEFAULT_PLAN_WEEKS = 12;
  const NIGHT_SETS = { weekdays: [1, 2, 3, 4, 5], "school-nights": [0, 1, 2, 3, 4] };
  const NIGHTS_PER_YEAR = 180;
  const FORMS = ["a", "b"]; // a: first check, b: alternate form for re-checks
  const SKILLS = ["literal", "vocabulary", "inference", "structure", "central"];
  const SKILL_LABELS = { literal: "Literal detail", vocabulary: "Vocabulary in context", inference: "Inference",
    structure: "Structure and craft", central: "Central idea and purpose" };
  const RATINGS = ["easy", "right", "hard"];
  const STORAGE_KEY = "liminal:reading-level:v1";
  const STATE_VERSION = 1;

  // ---- Levels ----
  function validLevel(level) { return Number.isInteger(level) && level >= 0 && level <= 99; }
  // The library's key and label; a level the library does not know yet
  // falls back to its number, and probes.json levelLabels can override.
  function levelKey(level) { return (D && D.gradeKey(level)) || String(level); }
  function levelLabel(level, labels) {
    if (labels && typeof labels[level] === "string") return labels[level];
    return (D && D.gradeLabel(level)) || "Level " + level;
  }
  function itemCount(level) { return level <= 2 ? 3 : 4; }
  function comfortableFloor(level) {
    const known = Object.keys(COMFORTABLE_WPM_FLOOR).map(Number).sort((a, b) => a - b);
    const at = known.filter(value => value <= level).pop();
    return COMFORTABLE_WPM_FLOOR[at === undefined ? known[0] : at];
  }
  function route(level, week, day) { return "daily-reading.html#" + levelKey(level) + "/" + week + "/" + day; }
  function nightAt(index) { return { week: Math.floor(index / NIGHTS_PER_WEEK) + 1, day: index % NIGHTS_PER_WEEK + 1 }; }
  function nightIndex(week, day) { return (week - 1) * NIGHTS_PER_WEEK + day - 1; }
  function above(levels, level) { return levels.filter(value => value > level).sort((a, b) => a - b)[0]; }
  function below(levels, level) { return levels.filter(value => value < level).sort((a, b) => b - a); }

  // ---- Scoring ----
  function wordCount(text) { return (String(text).match(/\S+/g) || []).length; }
  function score(probe, answers) {
    const bySkill = {};
    let correct = 0;
    probe.items.forEach((item, index) => {
      const right = Array.isArray(answers) && answers[index] === item.key;
      if (right) correct++;
      const entry = bySkill[item.skill] || (bySkill[item.skill] = { correct: 0, total: 0 });
      entry.total++; if (right) entry.correct++;
    });
    return { correct, total: probe.items.length, bySkill };
  }
  function comprehension(correct, total) {
    if (!total) return "weak";
    const share = correct / total;
    return share >= STRONG_SHARE ? "strong" : share < WEAK_BELOW ? "weak" : "middle";
  }
  function pace(words, ms, level) {
    if (!(words > 0) || !(ms > 0)) return { wpm: null, band: "unknown" };
    const wpm = Math.round(words / (ms / 60000));
    return { wpm, band: wpm > MAX_PLAUSIBLE_WPM ? "rushed" : wpm < comfortableFloor(level) ? "slow" : "comfortable" };
  }
  // One probe's result: pass (read it independently), near (partly), or weak.
  function evaluate(probe, response) {
    const counts = score(probe, response.answers);
    const comp = comprehension(counts.correct, counts.total);
    const speed = pace(probe.words, response.readingMs, probe.level);
    const rating = RATINGS.includes(response.rating) ? response.rating : null;
    const pass = comp === "strong" && speed.band === "comfortable" && rating !== "hard" && !response.repeat;
    const result = pass ? "pass" : comp === "weak" ? "weak" : "near";
    const reasons = [];
    if (comp === "strong" && !pass) {
      if (speed.band === "slow") reasons.push("slow");
      if (speed.band === "rushed") reasons.push("rushed");
      if (speed.band === "unknown") reasons.push("untimed");
      if (rating === "hard") reasons.push("felt-hard");
      if (response.repeat) reasons.push("repeat");
    }
    return { probeId: probe.id, level: probe.level, form: probe.form, correct: counts.correct, total: counts.total,
      bySkill: counts.bySkill, comprehension: comp, wpm: speed.wpm, pace: speed.band, rating, result,
      perfect: pass && counts.correct === counts.total, reasons };
  }

  // ---- The ladder ----
  // Levels with both forms in the probe set, ascending.
  function ladderLevels(probes) {
    const levels = [...new Set(probes.map(probe => probe.level))];
    return levels.filter(level => FORMS.every(form => probes.some(probe => probe.level === level && probe.form === form))).sort((a, b) => a - b);
  }
  function startLevel(levels, requested) {
    if (!levels.length) return null;
    if (levels.includes(requested)) return requested;
    // The nearest ladder level at or below the request, else the lowest.
    return below(levels, requested)[0] ?? levels[0];
  }
  // results: evaluated probes in order; start: the requested first level.
  // Returns { done, level } for the next
  // probe, or { done: true } when the boundary is found or probes run out.
  function nextStep(results, levels, start) {
    if (!results.length) return { done: false, level: startLevel(levels, start) };
    if (results.length >= MAX_PROBES) return { done: true };
    const last = results[results.length - 1], tried = new Map(results.map(entry => [entry.level, entry]));
    if (last.result === "pass") {
      const up = above(levels, last.level);
      return up === undefined || tried.has(up) ? { done: true } : { done: false, level: up };
    }
    const lower = below(levels, last.level);
    if (!lower.length || tried.has(lower[0])) return { done: true };
    // A weak result steps down two ladder levels when both are untried; a
    // later pass steps back up one at a time, so no level is skipped.
    const target = last.result === "weak" && lower[1] !== undefined && !tried.has(lower[1]) ? lower[1] : lower[0];
    return { done: false, level: target };
  }

  // ---- Placement ----
  function placement(results, levels, labels) {
    const passed = results.filter(entry => entry.result === "pass").sort((a, b) => b.level - a.level);
    const evidence = results.map(entry => ({ level: entry.level, correct: entry.correct, total: entry.total, wpm: entry.wpm, pace: entry.pace, rating: entry.rating, result: entry.result }));
    const label = level => levelLabel(level, labels);
    if (!passed.length) {
      const lowest = Math.min(...results.map(entry => entry.level));
      const lower = below(levels, lowest);
      if (lower.length) {
        return { level: lower[0], week: 1, confirmed: false, supported: false, top: false, evidence,
          explanation: "No passage was comfortable within " + MAX_PROBES + " tries, so this start, " + label(lower[0]) + " week 1, is a step below the lowest passage tried and is not yet confirmed. Your first re-check confirms it before stretch nights begin." };
      }
      return { level: lowest, week: 1, confirmed: false, supported: true, top: false, evidence,
        explanation: "The " + label(lowest) + " passage was not yet comfortable to read alone. Start at " + label(lowest) + " week 1 and read with an adult: these nights are written for reading aloud or together. Your re-check shows when you are ready to read them alone." };
    }
    const best = passed[0], next = above(levels, best.level), nextResult = results.find(entry => entry.level === next);
    let week = PLACEMENT_WEEK.start, why;
    if (nextResult && nextResult.result === "near") {
      week = PLACEMENT_WEEK.near;
      why = "You read the " + label(best.level) + " passage comfortably and understood part of the " + label(next) + " passage, so you start in the second half of the " + label(best.level) + " year.";
    } else if (best.perfect) {
      week = PLACEMENT_WEEK.strong;
      why = "You answered every " + label(best.level) + " question correctly at a comfortable pace" + (nextResult ? ", but the " + label(next) + " passage was hard" : "") + ", so you start a quarter of the way into the " + label(best.level) + " year.";
    } else {
      why = "You read the " + label(best.level) + " passage comfortably" + (nextResult ? " and the " + label(next) + " passage was hard" : "") + ", so you start at the beginning of the " + label(best.level) + " year.";
    }
    const top = next === undefined;
    if (top) why += " This is the highest level the calibration covers.";
    else if (!nextResult) why += " The calibration stopped before trying " + label(next) + "; your re-checks will.";
    return { level: best.level, week, confirmed: true, supported: false, top, evidence, explanation: why };
  }
  function skillSummary(results) {
    const totals = {};
    for (const entry of results) for (const [skill, counts] of Object.entries(entry.bySkill || {})) {
      const total = totals[skill] || (totals[skill] = { correct: 0, total: 0 });
      total.correct += counts.correct; total.total += counts.total;
    }
    return SKILLS.filter(skill => totals[skill]).map(skill => ({ skill, label: SKILL_LABELS[skill], ...totals[skill] }));
  }

  // ---- Dates (ISO YYYY-MM-DD, computed in UTC so time zones cannot shift a day) ----
  function validDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const time = Date.parse(value + "T00:00:00Z");
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
  }
  function addDays(date, days) { return new Date(Date.parse(date + "T00:00:00Z") + days * 86400000).toISOString().slice(0, 10); }
  function weekday(date) { return new Date(date + "T00:00:00Z").getUTCDay(); }

  // ---- The plan ----
  // core: { level, index } is the next night at the placement (index 0–179);
  // stretch: { level, index } | null is the next stretch night. Placements
  // that are not yet confirmed get no stretch nights.
  function planCursors(placementInfo, libraryLevels) {
    const core = { level: placementInfo.level, index: nightIndex(placementInfo.week, 1) };
    const up = placementInfo.confirmed ? above(libraryLevels, placementInfo.level) : undefined;
    return { core, stretch: up === undefined ? null : { level: up, index: 0 } };
  }
  function stretchCount(stage) { return STRETCH_NIGHTS_BY_STAGE[Math.min(Math.max(stage, 0), STRETCH_NIGHTS_BY_STAGE.length - 1)]; }
  function makePlan(options) {
    const { startDate, weeks = DEFAULT_PLAN_WEEKS, nights = "weekdays", stage = 0, libraryLevels = [], titles = null } = options;
    if (!validDate(startDate)) throw new Error("Plan needs a valid start date");
    if (!PLAN_WEEKS.includes(weeks)) throw new Error("Plan length must be one of " + PLAN_WEEKS.join(", ") + " weeks");
    const days = NIGHT_SETS[nights];
    if (!days) throw new Error("Unknown night pattern");
    let core = options.core ? { ...options.core } : null, stretch = options.stretch ? { ...options.stretch } : null;
    if (!core || !validLevel(core.level) || !(core.index >= 0 && core.index < NIGHTS_PER_YEAR)) throw new Error("Plan needs a starting night");
    let first = startDate;
    while (weekday(first) !== days[0]) first = addDays(first, 1);
    const plan = { startDate, firstNight: first, weeks: [], nights, stage, endOfLibrary: false };
    function take(cursor) {
      const at = nightAt(cursor.index), title = titles && titles[cursor.level] && titles[cursor.level][cursor.index];
      return { level: cursor.level, week: at.week, day: at.day, href: route(cursor.level, at.week, at.day),
        title: title ? title[0] : null, minutes: title ? title[1] : null };
    }
    function advanceCore() {
      core.index++;
      if (core.index < NIGHTS_PER_YEAR) return;
      // A finished year continues where the stretch nights reached.
      if (stretch) { core = stretch; const up = above(libraryLevels, core.level); stretch = up === undefined ? null : { level: up, index: 0 }; }
      else core = null;
    }
    for (let week = 0; week < weeks; week++) {
      const weekStage = stage + Math.floor(week / RECHECK_EVERY_WEEKS), slots = STRETCH_SLOTS[stretchCount(weekStage)] || [];
      const entry = { number: week + 1, stage: weekStage, nights: [], recheck: null };
      const weekStart = addDays(first, week * 7);
      days.forEach((dayOfWeek, position) => {
        const date = addDays(weekStart, (dayOfWeek - days[0] + 7) % 7);
        if (stretch && slots.includes(position) && stretch.index < NIGHTS_PER_YEAR) {
          entry.nights.push({ date, kind: "stretch", ...take(stretch) }); stretch.index++;
          return;
        }
        if (!core) { plan.endOfLibrary = true; return; }
        entry.nights.push({ date, kind: "core", ...take(core) }); advanceCore();
      });
      if ((week + 1) % RECHECK_EVERY_WEEKS === 0) {
        const last = entry.nights.length ? entry.nights[entry.nights.length - 1].date : addDays(weekStart, 4);
        entry.recheck = { date: addDays(last, 1) };
      }
      plan.weeks.push(entry);
    }
    plan.after = { core: core ? { ...core } : null, stretch: stretch ? { ...stretch } : null };
    return plan;
  }
  // Where a student is in a plan on a date: the first night dated after it,
  // assuming every earlier night was read.
  function cursorsOn(planInputs, date, libraryLevels) {
    const plan = makePlan({ ...planInputs, libraryLevels });
    const nights = plan.weeks.flatMap(week => week.nights);
    const next = nights.find(night => night.date > date);
    if (!next) return { core: plan.after.core, stretch: plan.after.stretch, stage: planInputs.stage + Math.ceil(planInputs.weeks / RECHECK_EVERY_WEEKS) };
    let core = null, stretch = null;
    for (const night of nights.slice(nights.indexOf(next))) {
      const cursor = { level: night.level, index: nightIndex(night.week, night.day) };
      if (night.kind === "core" && !core) core = cursor;
      if (night.kind === "stretch" && !stretch) stretch = cursor;
      if (core && stretch) break;
    }
    if (!core) core = plan.after.core;
    if (!stretch) stretch = plan.after.stretch;
    const weekIndex = plan.weeks.findIndex(week => week.nights.includes(next));
    return { core, stretch, stage: planInputs.stage + Math.floor(weekIndex / RECHECK_EVERY_WEEKS) };
  }

  // ---- Re-checks ----
  // An unconfirmed placement re-checks itself; otherwise the stretch level
  // (or, at the top of the ladder, the placement level). When the stretch
  // level has no probes yet, the next probed level above stands in for it, so
  // a missing level never blocks advancing.
  function recheckLevel(planInputs, ladder) {
    const target = planInputs.confirmed && planInputs.stretch ? planInputs.stretch.level : planInputs.core.level;
    if (ladder.includes(target)) return target;
    if (planInputs.confirmed && planInputs.stretch) { const up = above(ladder, target - 1); if (up !== undefined) return up; }
    return below(ladder, target)[0] ?? ladder[0];
  }
  // A form not yet taken at that level, in preference order (calibrations
  // prefer form a, re-checks the alternate form b). When both have been
  // seen, the one taken longest ago, flagged as a repeat (which cannot move
  // a student up, because the passage is familiar). history entries are
  // { level, form, order } with order increasing over time.
  function chooseForm(level, history, preference = ["b", "a"]) {
    const seen = history.filter(entry => entry.level === level);
    const fresh = preference.find(form => !seen.some(entry => entry.form === form));
    if (fresh) return { form: fresh, repeat: false };
    const lastSeen = form => Math.max(...seen.filter(entry => entry.form === form).map(entry => entry.order));
    return { form: lastSeen("a") <= lastSeen("b") ? "a" : "b", repeat: true };
  }
  // Applies a re-check result at the plan's current position. Returns the
  // inputs for the next plan and a plain-language decision.
  function applyRecheck(planInputs, result, date, libraryLevels, labels) {
    const at = cursorsOn(planInputs, date, libraryLevels);
    const label = level => levelLabel(level, labels);
    const base = { startDate: addDays(date, 1), weeks: planInputs.weeks, nights: planInputs.nights };
    if (!planInputs.confirmed) {
      if (result.result === "pass") {
        const up = above(libraryLevels, at.core.level);
        return { action: "confirm", message: "Confirmed: " + label(at.core.level) + " is comfortable. Stretch nights from the next level begin now.",
          inputs: { ...base, confirmed: true, supported: false, stage: 0, core: at.core, stretch: up === undefined ? null : { level: up, index: 0 } } };
      }
      return { action: "hold", message: "Hold at " + label(at.core.level) + ". Keep reading these nights" + (planInputs.supported ? " together" : "") + " and re-check again in " + RECHECK_EVERY_WEEKS + " weeks.",
        inputs: { ...base, confirmed: false, supported: planInputs.supported, stage: 0, core: at.core, stretch: null } };
    }
    if (result.result === "pass" && at.stretch && result.level >= at.stretch.level) {
      const up = above(libraryLevels, at.stretch.level);
      const shown = result.level === at.stretch.level ? label(at.stretch.level) + " is now comfortable, so it" : "the " + label(result.level) + " re-check passage was comfortable, so " + label(at.stretch.level);
      return { action: "advance", message: "Advance: " + shown + " becomes your main level, continuing from your stretch nights.",
        inputs: { ...base, confirmed: true, supported: false, stage: 0, core: at.stretch, stretch: up === undefined ? null : { level: up, index: 0 } } };
    }
    if (result.result === "weak") {
      return { action: "hold", message: "Hold at " + label(at.core.level) + " with one stretch night a week; the stretch passage was hard this time.",
        inputs: { ...base, confirmed: true, supported: false, stage: 0, core: at.core, stretch: at.stretch } };
    }
    const reason = result.result === "pass" ? (at.stretch ? "" : " You are at the top of the levels this calibration covers.")
      : " You are close: the stretch passage was partly understood" + (result.reasons.length ? " (" + result.reasons.map(reasonText).join(", ") + ")" : "") + ".";
    return { action: "hold", message: "Hold at " + label(at.core.level) + " and keep stretching." + reason,
      inputs: { ...base, confirmed: true, supported: false, stage: at.stage, core: at.core, stretch: at.stretch } };
  }
  function reasonText(code) {
    return { slow: "the reading pace was slow for that level", rushed: "the reading time was too short to count", untimed: "the reading was not timed",
      "felt-hard": "it felt too hard", repeat: "the passage had been seen before" }[code] || code;
  }

  // ---- Saved state ----
  function emptyState() { return { version: STATE_VERSION, attempts: [], current: null, plan: null }; }
  function isRecord(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
  function validTime(value) { return typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value)); }
  function validId(value) { return typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value); }
  function parseResponse(value) {
    if (!isRecord(value) || !validId(value.probeId)) return null;
    if (!Array.isArray(value.answers) || value.answers.length > 8 || !value.answers.every(answer => answer === null || (Number.isInteger(answer) && answer >= 0 && answer <= 3))) return null;
    if (!(Number.isFinite(value.readingMs) && value.readingMs > 0 && value.readingMs < 86400000)) return null;
    return { probeId: value.probeId, answers: value.answers.slice(), readingMs: value.readingMs,
      rating: RATINGS.includes(value.rating) ? value.rating : null, repeat: value.repeat === true, at: validTime(value.at) ? value.at : null };
  }
  function parseCursor(value) {
    return isRecord(value) && validLevel(value.level) && Number.isInteger(value.index) && value.index >= 0 && value.index < NIGHTS_PER_YEAR ? { level: value.level, index: value.index } : null;
  }
  function parsePlan(value) {
    if (!isRecord(value) || !validDate(value.startDate) || !PLAN_WEEKS.includes(value.weeks) || !NIGHT_SETS[value.nights]) return null;
    const core = parseCursor(value.core);
    if (!core || !Number.isInteger(value.stage) || value.stage < 0 || value.stage > 99) return null;
    const stretch = value.stretch === null ? null : parseCursor(value.stretch);
    if (value.stretch !== null && !stretch) return null;
    return { startDate: value.startDate, weeks: value.weeks, nights: value.nights, stage: value.stage, core, stretch,
      confirmed: value.confirmed === true, supported: value.supported === true, createdAt: validTime(value.createdAt) ? value.createdAt : null,
      note: typeof value.note === "string" ? value.note.slice(0, 600) : null };
  }
  function parseAttempt(value) {
    if (!isRecord(value) || !validId(value.id) || !["calibration", "recheck"].includes(value.kind) || !validTime(value.startedAt)) return null;
    if (!Array.isArray(value.responses) || value.responses.length > MAX_PROBES) return null;
    const responses = value.responses.map(parseResponse);
    if (responses.some(response => !response)) return null;
    return { id: value.id, kind: value.kind, startedAt: value.startedAt, finishedAt: validTime(value.finishedAt) ? value.finishedAt : null,
      startLevel: validLevel(value.startLevel) ? value.startLevel : null, responses };
  }
  // Untrusted text from localStorage. Anything malformed is dropped rather
  // than half-loaded; an unknown version is ignored, never overwritten here.
  function parseState(raw) {
    let value;
    try { value = typeof raw === "string" ? JSON.parse(raw) : raw; } catch (_) { return emptyState(); }
    if (!isRecord(value) || value.version !== STATE_VERSION) return emptyState();
    const attempts = Array.isArray(value.attempts) ? value.attempts.slice(-50).map(parseAttempt).filter(Boolean) : [];
    let current = null;
    if (isRecord(value.current) && attempts.some(attempt => attempt.id === value.current.attemptId && !attempt.finishedAt) && validId(value.current.probeId)
      && ["reading", "questions", "feedback"].includes(value.current.phase)) {
      const answers = Array.isArray(value.current.answers) && value.current.answers.length <= 8 && value.current.answers.every(answer => answer === null || (Number.isInteger(answer) && answer >= 0 && answer <= 3)) ? value.current.answers.slice() : [];
      current = { attemptId: value.current.attemptId, probeId: value.current.probeId, phase: value.current.phase, answers,
        readingMs: Number.isFinite(value.current.readingMs) && value.current.readingMs > 0 ? value.current.readingMs : null,
        rating: RATINGS.includes(value.current.rating) ? value.current.rating : null, repeat: value.current.repeat === true };
      if (current.phase !== "reading" && !current.readingMs) current = null;
    }
    return { version: STATE_VERSION, attempts, current, plan: value.plan === null || value.plan === undefined ? null : parsePlan(value.plan) };
  }
  function serializeState(state) { return JSON.stringify({ ...state, version: STATE_VERSION }); }

  // Replays an attempt's responses against the probe set.
  function replay(attempt, probesById) {
    return attempt.responses.map(response => {
      const probe = probesById[response.probeId];
      return probe ? evaluate(probe, response) : null;
    }).filter(Boolean);
  }

  return {
    STRONG_SHARE, WEAK_BELOW, MAX_PROBES, MAX_PLAUSIBLE_WPM, COMFORTABLE_WPM_FLOOR, PLACEMENT_WEEK, RECHECK_EVERY_WEEKS,
    STRETCH_NIGHTS_BY_STAGE, STRETCH_SLOTS, NIGHTS_PER_WEEK, PLAN_WEEKS, DEFAULT_PLAN_WEEKS, NIGHT_SETS, NIGHTS_PER_YEAR,
    FORMS, SKILLS, SKILL_LABELS, RATINGS, STORAGE_KEY, STATE_VERSION,
    validLevel, levelKey, levelLabel, itemCount, comfortableFloor, route, nightAt, nightIndex,
    wordCount, score, comprehension, pace, evaluate, ladderLevels, startLevel, nextStep, placement, skillSummary,
    validDate, addDays, weekday, planCursors, makePlan, cursorsOn, recheckLevel, chooseForm, applyRecheck, reasonText,
    emptyState, parseState, serializeState, replay,
  };
});
