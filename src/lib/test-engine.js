(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(function () {
      return require("./core.js");
    });
  } else {
    root.LiminalTestEngine = factory(function () {
      return root.PracticeCore;
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (loadCore) {
  "use strict";

  // Session logic for the digital test mode: navigation, answers, marks,
  // eliminations, instant checking, the section timer, per-question time,
  // and the final summary. No DOM access. Every action returns a new
  // JSON-safe state, so the shell can save a snapshot after each change and
  // resume after a reload. Time is read only through the `now` passed in, so
  // tests can drive the clock.

  const SCHEMA = "liminal-test-session";
  const VERSION = 1;
  // The real test warns once when five minutes remain.
  const DEFAULT_ALERT_SECONDS = 300;
  // A student-produced response holds five characters, or six when the first
  // is a negative sign.
  const NUMERIC_MAX_POSITIVE = 5;
  const NUMERIC_MAX_NEGATIVE = 6;

  function core() {
    const api = loadCore();
    if (!api || typeof api.scoreResponse !== "function") {
      throw new Error("LiminalTestEngine needs PracticeCore (lib/core.js) loaded first.");
    }
    return api;
  }

  function filled(length, value) {
    return Array.from({ length }, () => (typeof value === "function" ? value() : value));
  }

  function hasResponse(value) {
    return value !== null && value !== undefined && value !== "";
  }

  function isChoiceQuestion(question) {
    return question && question.responseType === "multiple-choice" &&
      Array.isArray(question.choices);
  }

  function copyState(state) {
    return Object.assign({}, state, {
      responses: state.responses.slice(),
      marked: state.marked.slice(),
      eliminated: state.eliminated.map((list) => list.slice()),
      checked: state.checked.slice(),
      hinted: state.hinted.slice(),
      visited: state.visited.slice(),
      timeMs: (state.timeMs || filled(state.questions.length, 0)).slice(),
    });
  }

  function clampIndex(state, index) {
    const last = state.questions.length - 1;
    const number = Math.trunc(Number(index));
    if (!Number.isFinite(number)) return state.index;
    return Math.max(0, Math.min(last, number));
  }

  function createState(options, nowMs) {
    const settings = options || {};
    const questions = Array.isArray(settings.questions) ? settings.questions.slice() : [];
    if (!questions.length) throw new Error("A test session needs at least one question.");
    const limit = Number(settings.timeLimitSeconds);
    const count = questions.length;
    // Questions already on the student's marked list start marked, so the
    // list can mirror what the student leaves marked.
    const marked = Array.isArray(settings.marked) && settings.marked.length === count
      ? settings.marked.map(Boolean)
      : filled(count, false);
    return {
      schema: SCHEMA,
      version: VERSION,
      feedback: settings.feedback === "instant" ? "instant" : "end",
      timeLimitSeconds: Number.isFinite(limit) && limit > 0 ? Math.round(limit) : null,
      alertSeconds: Number.isFinite(Number(settings.alertSeconds))
        ? Number(settings.alertSeconds)
        : DEFAULT_ALERT_SECONDS,
      questions,
      index: 0,
      responses: filled(count, null),
      marked,
      eliminated: filled(count, () => []),
      checked: filled(count, false),
      hinted: filled(count, false),
      visited: [true].concat(filled(count - 1, false)),
      // Time spent on each question while it was on screen; the running span
      // of the current one starts at questionSince (null while no question is
      // shown, such as on the review page).
      timeMs: filled(count, 0),
      questionSince: nowMs,
      eliminatorOn: false,
      elapsedMs: 0,
      segmentStart: nowMs,
      alertShown: false,
      finished: false,
      finishReason: null,
      reported: false,
    };
  }

  /* ------------------------------------------------------------------ timer */

  function elapsedMs(state, nowMs) {
    const running = state.segmentStart !== null && state.segmentStart !== undefined;
    const total = state.elapsedMs + (running ? Math.max(0, nowMs - state.segmentStart) : 0);
    const limitMs = state.timeLimitSeconds ? state.timeLimitSeconds * 1000 : null;
    return limitMs !== null ? Math.min(total, limitMs) : total;
  }

  // The clock as the shell displays it. `alertDue` is true exactly once per
  // session: the first reading at or under the alert threshold, and only when
  // the limit is longer than the threshold (a four-minute set never warns at
  // its start).
  function timerStatus(state, nowMs) {
    const elapsed = elapsedMs(state, nowMs);
    const limitMs = state.timeLimitSeconds ? state.timeLimitSeconds * 1000 : null;
    const remainingMs = limitMs === null ? null : Math.max(0, limitMs - elapsed);
    const alertMs = state.alertSeconds * 1000;
    return {
      timed: limitMs !== null,
      limitMs,
      elapsedMs: elapsed,
      remainingMs,
      remainingSeconds: remainingMs === null ? null : Math.ceil(remainingMs / 1000),
      elapsedSeconds: Math.floor(elapsed / 1000),
      alertDue: limitMs !== null && !state.finished && !state.alertShown &&
        limitMs > alertMs && remainingMs > 0 && remainingMs <= alertMs,
      expired: limitMs !== null && remainingMs <= 0,
      finished: state.finished,
    };
  }

  // Advances the clock: records the one-time alert and finishes the session
  // when time runs out. Returns the new state and the timer reading.
  function tick(state, nowMs) {
    const status = timerStatus(state, nowMs);
    let next = state;
    if (status.alertDue) next = Object.assign({}, next, { alertShown: true });
    if (status.expired && !state.finished) {
      next = finish(next, nowMs, "time");
    }
    return Object.assign({ state: next }, status);
  }

  /* --------------------------------------------------------- question time */

  // Adds the running span to the current question. An instantly checked
  // question stops gaining time: what follows is reading the explanation,
  // not solving. Without a clock reading nothing changes.
  function settleQuestionTime(state, nowMs) {
    if (nowMs === undefined || nowMs === null) return state;
    if (state.questionSince === null || state.questionSince === undefined) return state;
    const next = copyState(state);
    const counting = !state.finished &&
      !(state.feedback === "instant" && state.checked[state.index]);
    if (counting) next.timeMs[state.index] += Math.max(0, nowMs - state.questionSince);
    next.questionSince = nowMs;
    return next;
  }

  // Time on each question so far, including the current running span.
  function questionTimes(state, nowMs) {
    return settleQuestionTime(state, nowMs).timeMs ||
      filled(state.questions.length, 0);
  }

  // The review page and the report show no question, so no question gains
  // time there.
  function leaveQuestion(state, nowMs) {
    if (state.questionSince === null || state.questionSince === undefined) return state;
    const next = settleQuestionTime(state, nowMs);
    return Object.assign({}, next, { questionSince: null });
  }

  function enterQuestion(state, nowMs) {
    if (state.finished || (state.questionSince !== null && state.questionSince !== undefined)) return state;
    if (nowMs === undefined || nowMs === null) return state;
    return Object.assign({}, state, { questionSince: nowMs });
  }

  /* ---------------------------------------------------------------- actions */

  function locked(state, index) {
    return state.finished || (state.feedback === "instant" && state.checked[index]);
  }

  // Multiple choice takes a choice index; numeric takes the typed text.
  // Choosing a struck-out option restores it, as the real eliminator does.
  function select(state, value, index) {
    const at = index === undefined ? state.index : clampIndex(state, index);
    if (locked(state, at)) return state;
    const question = state.questions[at];
    const next = copyState(state);
    if (!hasResponse(value)) {
      next.responses[at] = null;
      return next;
    }
    if (isChoiceQuestion(question)) {
      const choice = Math.trunc(Number(value));
      if (!Number.isFinite(choice) || choice < 0 || choice >= question.choices.length) {
        return state;
      }
      next.responses[at] = choice;
      next.eliminated[at] = next.eliminated[at].filter((item) => item !== choice);
    } else {
      next.responses[at] = String(value);
    }
    return next;
  }

  function clearResponse(state, index) {
    return select(state, null, index);
  }

  function toggleMark(state, index) {
    const at = index === undefined ? state.index : clampIndex(state, index);
    if (state.finished) return state;
    const next = copyState(state);
    next.marked[at] = !next.marked[at];
    return next;
  }

  // The eliminator switch shows or hides the strike buttons. It is one
  // setting for the whole session, like the toolbar toggle it mimics.
  function toggleEliminator(state) {
    if (state.finished) return state;
    return Object.assign({}, state, { eliminatorOn: !state.eliminatorOn });
  }

  // Striking the selected choice clears the selection.
  function toggleEliminate(state, choice, index) {
    const at = index === undefined ? state.index : clampIndex(state, index);
    const question = state.questions[at];
    if (locked(state, at) || !isChoiceQuestion(question)) return state;
    const option = Math.trunc(Number(choice));
    if (!Number.isFinite(option) || option < 0 || option >= question.choices.length) {
      return state;
    }
    const next = copyState(state);
    const struck = next.eliminated[at];
    if (struck.includes(option)) {
      next.eliminated[at] = struck.filter((item) => item !== option);
    } else {
      next.eliminated[at] = struck.concat(option).sort((a, b) => a - b);
      if (next.responses[at] === option) next.responses[at] = null;
    }
    return next;
  }

  // With a clock reading, the time so far goes to the question being left
  // and the new one starts counting.
  function goTo(state, index, nowMs) {
    const at = clampIndex(state, index);
    if (at === state.index) return enterQuestion(state, nowMs);
    const next = copyState(settleQuestionTime(state, nowMs));
    next.index = at;
    next.visited[at] = true;
    if (nowMs !== undefined && nowMs !== null && !next.finished) next.questionSince = nowMs;
    return next;
  }

  function nextQuestion(state, nowMs) {
    return goTo(state, state.index + 1, nowMs);
  }

  function back(state, nowMs) {
    return goTo(state, state.index - 1, nowMs);
  }

  function isLast(state) {
    return state.index === state.questions.length - 1;
  }

  // Instant feedback only: locks the current answer and reports the verdict.
  function check(state, index, nowMs) {
    const at = index === undefined || index === null ? state.index : clampIndex(state, index);
    if (state.feedback !== "instant" || state.finished || state.checked[at]) return state;
    if (!hasResponse(state.responses[at])) return state;
    const next = copyState(settleQuestionTime(state, nowMs));
    next.checked[at] = true;
    return next;
  }

  function useHint(state, index) {
    const at = index === undefined ? state.index : clampIndex(state, index);
    if (state.feedback !== "instant" || state.finished || state.checked[at]) return state;
    const next = copyState(state);
    next.hinted[at] = true;
    return next;
  }

  function finish(state, nowMs, reason) {
    if (state.finished) return state;
    const next = copyState(settleQuestionTime(state, nowMs));
    next.elapsedMs = elapsedMs(state, nowMs);
    next.segmentStart = null;
    next.questionSince = null;
    next.finished = true;
    next.finishReason = reason === "time" ? "time" : "user";
    return next;
  }

  function markReported(state) {
    return state.reported ? state : Object.assign({}, state, { reported: true });
  }

  /* ---------------------------------------------------------------- reading */

  function isCorrect(state, index) {
    const question = state.questions[index];
    const response = state.responses[index];
    if (!hasResponse(response)) return false;
    return core().scoreResponse(question, response) === true;
  }

  // Per-question status for the navigator, the review page, and the report.
  function itemStatus(state, index) {
    const answered = hasResponse(state.responses[index]);
    const revealed = state.finished || (state.feedback === "instant" && state.checked[index]);
    return {
      index,
      number: index + 1,
      current: index === state.index,
      answered,
      marked: state.marked[index],
      checked: state.checked[index],
      hinted: state.hinted[index],
      visited: state.visited[index],
      correct: revealed ? isCorrect(state, index) : null,
    };
  }

  function counts(state) {
    const statuses = state.questions.map((_, index) => itemStatus(state, index));
    return {
      total: statuses.length,
      answered: statuses.filter((item) => item.answered).length,
      unanswered: statuses.filter((item) => !item.answered).length,
      marked: statuses.filter((item) => item.marked).length,
    };
  }

  function groupAccuracy(items, keyOf, order) {
    const groups = new Map();
    items.forEach((item) => {
      const key = keyOf(item.question);
      if (!groups.has(key)) groups.set(key, { key, total: 0, correct: 0, accuracy: 0 });
      const row = groups.get(key);
      row.total += 1;
      if (item.correct) row.correct += 1;
    });
    const rows = [...groups.values()].map((row) =>
      Object.assign(row, { accuracy: row.total ? row.correct / row.total : 0 })
    );
    if (order) rows.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    return rows;
  }

  // The report. Accuracy only: never a scaled score. Domain rows come from
  // PracticeCore.summarizeMiniTest (weakest first); each item keeps its
  // position so repeated IDs cannot collide.
  function summary(state, nowMs) {
    const api = core();
    const times = questionTimes(state, nowMs);
    const keyed = state.questions.map((question, index) =>
      Object.assign({}, question, { id: `${index}:${question.id}` })
    );
    const responses = new Map();
    keyed.forEach((question, index) => {
      if (hasResponse(state.responses[index])) responses.set(question.id, state.responses[index]);
    });
    const base = api.summarizeMiniTest(keyed, responses);
    const items = state.questions.map((question, index) => ({
      index,
      number: index + 1,
      question,
      response: hasResponse(state.responses[index]) ? state.responses[index] : null,
      answered: hasResponse(state.responses[index]),
      correct: isCorrect(state, index),
      marked: state.marked[index],
      checked: state.checked[index],
      hinted: state.hinted[index],
      timeMs: Math.round(times[index] || 0),
    }));
    const correct = items.filter((item) => item.correct).length;
    // A set that mixes sections (a mini test) is paced question by question.
    const budget = typeof api.paceBudgetForQuestions === "function"
      ? api.paceBudgetForQuestions(state.questions)
      : typeof api.paceBudgetSeconds === "function"
        ? api.paceBudgetSeconds(state.questions[0].sectionKey, state.questions.length)
        : null;
    const elapsed = elapsedMs(state, nowMs === undefined ? 0 : nowMs);
    return {
      feedback: state.feedback,
      finishReason: state.finishReason,
      total: items.length,
      correct,
      answered: items.filter((item) => item.answered).length,
      unanswered: items.filter((item) => !item.answered).length,
      marked: items.filter((item) => item.marked).length,
      accuracy: items.length ? correct / items.length : null,
      elapsedMs: elapsed,
      timeLimitSeconds: state.timeLimitSeconds,
      paceBudgetSeconds: budget,
      byDomain: base.byDomain.map((row) => ({
        domain: row.domain,
        section: row.section,
        sectionKey: row.sectionKey,
        total: row.total,
        correct: row.correct,
        accuracy: row.accuracy,
      })),
      byDifficulty: groupAccuracy(items, (question) => question.difficulty,
        api.DIFFICULTY_ORDER || ["Easy", "Medium", "Hard"]).map((row) => ({
        difficulty: row.key,
        total: row.total,
        correct: row.correct,
        accuracy: row.accuracy,
      })),
      items,
    };
  }

  // The payload handed to the app's onFinish callback.
  function result(state, nowMs) {
    const report = summary(state, nowMs);
    return {
      feedback: report.feedback,
      elapsedMs: report.elapsedMs,
      timeLimitSeconds: report.timeLimitSeconds,
      finishReason: report.finishReason,
      correct: report.correct,
      total: report.total,
      items: report.items.map((item) => ({
        index: item.index,
        question: item.question,
        response: item.response,
        answered: item.answered,
        correct: item.correct,
        marked: item.marked,
        checked: item.checked,
        hinted: item.hinted,
        timeMs: item.timeMs,
      })),
    };
  }

  /* ---------------------------------------------------------- persistence */

  // A snapshot freezes the elapsed time and notes the wall clock. A timed
  // set keeps counting while the page is closed or reloading, as a real
  // section clock would, unless the student paused it on purpose (`paused`,
  // from Save and exit). An untimed set counts only time on the page.
  // Question times never count closed time.
  function serialize(state, nowMs, options) {
    const snapshot = copyState(settleQuestionTime(state, nowMs));
    snapshot.elapsedMs = elapsedMs(state, nowMs);
    snapshot.segmentStart = null;
    snapshot.questionSince = null;
    snapshot.savedAtMs = Number.isFinite(Number(nowMs)) ? Number(nowMs) : null;
    snapshot.paused = Boolean(options && options.paused);
    return JSON.parse(JSON.stringify(snapshot));
  }

  function restore(snapshot, nowMs) {
    if (!snapshot || typeof snapshot !== "object") return null;
    if (snapshot.schema !== SCHEMA || snapshot.version !== VERSION) return null;
    if (!Array.isArray(snapshot.questions) || !snapshot.questions.length) return null;
    const count = snapshot.questions.length;
    const list = (value, fallback) =>
      Array.isArray(value) && value.length === count ? value.slice() : filled(count, fallback);
    const state = {
      schema: SCHEMA,
      version: VERSION,
      feedback: snapshot.feedback === "instant" ? "instant" : "end",
      timeLimitSeconds: Number(snapshot.timeLimitSeconds) > 0
        ? Math.round(Number(snapshot.timeLimitSeconds))
        : null,
      alertSeconds: Number.isFinite(Number(snapshot.alertSeconds))
        ? Number(snapshot.alertSeconds)
        : DEFAULT_ALERT_SECONDS,
      questions: snapshot.questions.slice(),
      index: 0,
      responses: list(snapshot.responses, null),
      marked: list(snapshot.marked, false).map(Boolean),
      eliminated: list(snapshot.eliminated, () => [])
        .map((item) => (Array.isArray(item) ? item.filter(Number.isInteger) : [])),
      checked: list(snapshot.checked, false).map(Boolean),
      hinted: list(snapshot.hinted, false).map(Boolean),
      visited: list(snapshot.visited, false).map(Boolean),
      timeMs: list(snapshot.timeMs, 0).map((value) => Math.max(0, Number(value) || 0)),
      questionSince: null,
      eliminatorOn: Boolean(snapshot.eliminatorOn),
      elapsedMs: Math.max(0, Number(snapshot.elapsedMs) || 0),
      segmentStart: null,
      alertShown: Boolean(snapshot.alertShown),
      finished: Boolean(snapshot.finished),
      finishReason: snapshot.finishReason === "time" || snapshot.finishReason === "user"
        ? snapshot.finishReason
        : null,
      reported: Boolean(snapshot.reported),
    };
    state.index = clampIndex(state, snapshot.index);
    state.visited[state.index] = true;
    const savedAt = Number(snapshot.savedAtMs);
    if (state.timeLimitSeconds && !state.finished && !snapshot.paused &&
        snapshot.savedAtMs !== null && Number.isFinite(savedAt) && nowMs > savedAt) {
      state.elapsedMs += nowMs - savedAt;
    }
    if (!state.finished) {
      state.segmentStart = nowMs;
      state.questionSince = nowMs;
    }
    return state;
  }

  /* ------------------------------------------------------ numeric entry */

  // Cleans typed student-produced-response text: digits, one decimal point,
  // one fraction bar, and a leading negative sign; five characters, or six
  // with the sign. Returns the cleaned text and whether anything was cut.
  function sanitizeNumericEntry(text) {
    const raw = String(text === null || text === undefined ? "" : text)
      .replace(/[−‒–—]/g, "-");
    let output = "";
    let dot = false;
    let slash = false;
    for (const character of raw) {
      if (/[0-9]/.test(character)) output += character;
      else if (character === "-" && output === "") output += character;
      else if (character === "." && !dot) {
        dot = true;
        output += character;
      } else if (character === "/" && !slash && output !== "" && output !== "-") {
        slash = true;
        output += character;
      }
    }
    const max = output.startsWith("-") ? NUMERIC_MAX_NEGATIVE : NUMERIC_MAX_POSITIVE;
    const trimmed = output.slice(0, max);
    return { value: trimmed, changed: trimmed !== raw, max };
  }

  // Parses entered text for the answer preview. `kind` is "empty",
  // "incomplete" (still typing, such as "3/" or "-"), "fraction", or
  // "number"; `value` is the number when complete.
  function describeNumericEntry(text) {
    const value = String(text || "");
    if (!value) return { kind: "empty", value: null, text: "" };
    const fraction = /^(-?)(\d*\.?\d*)\/(\d*\.?\d*)$/.exec(value);
    if (fraction) {
      const numerator = fraction[2];
      const denominator = fraction[3];
      if (!/\d/.test(numerator) || !/\d/.test(denominator)) {
        return { kind: "incomplete", value: null, text: value };
      }
      const number = Number(denominator) === 0
        ? NaN
        : (fraction[1] ? -1 : 1) * Number(numerator) / Number(denominator);
      return {
        kind: Number.isFinite(number) ? "fraction" : "invalid",
        value: Number.isFinite(number) ? number : null,
        text: value,
        sign: fraction[1],
        numerator,
        denominator,
      };
    }
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(value)) {
      return { kind: "number", value: Number(value), text: value };
    }
    return { kind: "incomplete", value: null, text: value };
  }

  /* -------------------------------------------------------- session wrapper */

  // A small stateful wrapper for the shell: holds the state and the clock.
  function wrap(state, now) {
    const clock = typeof now === "function" ? now : () => Date.now();
    const session = {
      state,
      now: clock,
    };
    function apply(action) {
      return function () {
        const args = Array.prototype.slice.call(arguments);
        session.state = action.apply(null, [session.state].concat(args));
        return session.state;
      };
    }
    Object.assign(session, {
      select: apply(select),
      clearResponse: apply(clearResponse),
      toggleMark: apply(toggleMark),
      toggleEliminator: apply(toggleEliminator),
      toggleEliminate: apply(toggleEliminate),
      goTo(index) {
        session.state = goTo(session.state, index, clock());
        return session.state;
      },
      next() {
        session.state = nextQuestion(session.state, clock());
        return session.state;
      },
      back() {
        session.state = back(session.state, clock());
        return session.state;
      },
      check(index) {
        session.state = check(session.state, index, clock());
        return session.state;
      },
      leaveQuestion() {
        session.state = leaveQuestion(session.state, clock());
        return session.state;
      },
      enterQuestion() {
        session.state = enterQuestion(session.state, clock());
        return session.state;
      },
      useHint: apply(useHint),
      markReported: apply(markReported),
      finish(reason) {
        session.state = finish(session.state, clock(), reason);
        return session.state;
      },
      tick() {
        const reading = tick(session.state, clock());
        session.state = reading.state;
        return reading;
      },
      timer: () => timerStatus(session.state, clock()),
      current: () => session.state.questions[session.state.index],
      isLast: () => isLast(session.state),
      isLocked: (index) => locked(session.state, index === undefined ? session.state.index : index),
      isCorrect: (index) => isCorrect(session.state, index === undefined ? session.state.index : index),
      itemStatus: (index) => itemStatus(session.state, index),
      statuses: () => session.state.questions.map((_, index) => itemStatus(session.state, index)),
      counts: () => counts(session.state),
      questionTimes: () => questionTimes(session.state, clock()),
      summary: () => summary(session.state, clock()),
      result: () => result(session.state, clock()),
      serialize: (options) => serialize(session.state, clock(), options),
    });
    return session;
  }

  function create(options) {
    const settings = options || {};
    const now = typeof settings.now === "function" ? settings.now : () => Date.now();
    return wrap(createState(settings, now()), now);
  }

  function restoreSession(snapshot, options) {
    const settings = options || {};
    const now = typeof settings.now === "function" ? settings.now : () => Date.now();
    const state = restore(snapshot, now());
    return state ? wrap(state, now) : null;
  }

  return {
    SCHEMA,
    VERSION,
    DEFAULT_ALERT_SECONDS,
    NUMERIC_MAX_POSITIVE,
    NUMERIC_MAX_NEGATIVE,
    // Session objects
    create,
    restore: restoreSession,
    // Pure state functions
    createState,
    restoreState: restore,
    serialize,
    select,
    clearResponse,
    toggleMark,
    toggleEliminator,
    toggleEliminate,
    goTo,
    next: nextQuestion,
    back,
    check,
    leaveQuestion,
    enterQuestion,
    questionTimes,
    useHint,
    finish,
    markReported,
    tick,
    timerStatus,
    elapsedMs,
    isLast,
    isLocked: locked,
    isCorrect,
    itemStatus,
    counts,
    summary,
    result,
    hasResponse,
    sanitizeNumericEntry,
    describeNumericEntry,
  };
});
