// The unfinished set and the unfinished test, each in its own storage slot,
// so starting a practice set can never overwrite a saved test (or a test a
// set). A slot holds { config, savedAt, state }: `config` is what app.js
// launched (a test's has `simulation`, its state), `state` the test
// screen's snapshot of the set or module on screen (null for a test on its
// break or between modules). Each saved value has an owner (a set's
// sessionId, a test's id); a screen writes its slot only while it owns it,
// so a set replaced in another tab is not written back over its successor.
//
// Also: what a saved set would record if it were discarded
// (LiminalTestEngine.discardResult: every question seen, none unseen), and
// a summary for the resume banner and the dialogs that ask before a saved
// set or test is replaced or discarded.
//
// Pure logic with no DOM access: storage is injected (getItem, setItem,
// removeItem), so the same code runs in Node tests and in the browser
// (window.LiminalSessionStore, after window.LiminalTestEngine).
(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const api = factory(node ? require("./test-engine") : root.LiminalTestEngine);
  if (node) module.exports = api;
  else root.LiminalSessionStore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Engine) {
  "use strict";

  // `liminal:session:v1` held both before tests had their own slot; it is
  // the set slot now, and a test found there moves to the test slot.
  const KEYS = { set: "liminal:session:v1", test: "liminal:session:test:v1" };
  const SLOTS = ["set", "test"];

  const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

  function checkSlot(slot) {
    if (!SLOTS.includes(slot)) throw new RangeError(`Unknown session slot "${slot}" (use set or test)`);
    return slot;
  }

  // "test" for an on-screen SAT test, "set" for everything else.
  function slotOf(saved) {
    return saved && isObject(saved.config) && isObject(saved.config.simulation) ? "test" : "set";
  }

  // A stored value in the shape app.js writes, or null.
  function parse(text) {
    if (typeof text !== "string" || !text) return null;
    let saved;
    try {
      saved = JSON.parse(text);
    } catch (error) {
      return null;
    }
    if (!isObject(saved) || !isObject(saved.config)) return null;
    return saved.state || isObject(saved.config.simulation) ? saved : null;
  }

  // Who may write the slot: a test's id (constant across its modules) or a
  // set's session id.
  function ownerOf(saved) {
    if (!saved || !isObject(saved.config)) return null;
    const config = saved.config;
    const id = isObject(config.simulation) ? config.simulation.id : config.sessionId;
    return id === undefined || id === null || id === "" ? null : String(id);
  }

  // The engine's own snapshot inside the test screen's snapshot.
  function engineSnapshot(saved) {
    const state = saved && saved.state;
    if (!isObject(state)) return null;
    return isObject(state.session) ? state.session : state;
  }

  // The set or module on screen as the engine would resume it at `now`
  // (a timed set's clock counts the time away unless it was paused), or
  // null when there is none or it cannot be read.
  function restoreScreen(saved, now) {
    const snapshot = engineSnapshot(saved);
    if (!snapshot || !Engine) return null;
    try {
      return Engine.restoreState(snapshot, Number(now) || 0);
    } catch (error) {
      return null;
    }
  }

  // What discarding the saved set (or the module on screen in a saved
  // test) records: LiminalTestEngine.discardResult, or null when nothing is
  // on screen (a test on its break).
  function discardResult(saved, now) {
    const state = restoreScreen(saved, now);
    return state ? Engine.discardResult(state, Number(now) || 0) : null;
  }

  // Counts for the resume banner and the dialogs: { slot, title, total,
  // answered, seen, blank, unseen, timed, remainingMs, expired, wallClock,
  // savedAt }. For a test, the counts are the module on screen's (zero on
  // the break).
  function summary(saved, now) {
    const at = Number(now) || 0;
    const state = restoreScreen(saved, at);
    const discard = state ? Engine.discardResult(state, at) : null;
    const timer = state ? Engine.timerStatus(state, at) : null;
    const config = (saved && saved.config) || {};
    return {
      slot: slotOf(saved),
      title: config.title || "",
      total: discard ? discard.total : 0,
      answered: discard ? discard.answered : 0,
      seen: discard ? discard.seen : 0,
      blank: discard ? discard.blank : 0,
      unseen: discard ? discard.unseen : 0,
      timed: Boolean(timer && timer.timed),
      remainingMs: timer && timer.timed ? timer.remainingMs : null,
      expired: Boolean(timer && timer.expired),
      wallClock: Boolean(state && state.wallClock),
      savedAt: Number(saved && saved.savedAt) || null,
    };
  }

  // The two slots over `storage`. `options.onError(error, slot)` hears a
  // write that failed (storage full or blocked); the value is then not
  // saved.
  function create(storage, options) {
    const settings = options || {};
    const report = (error, slot) => {
      if (typeof settings.onError === "function") settings.onError(error, slot);
    };

    function read(slot) {
      try {
        return parse(storage.getItem(KEYS[checkSlot(slot)]));
      } catch (error) {
        return null;
      }
    }

    function remove(slot) {
      try {
        storage.removeItem(KEYS[slot]);
      } catch (error) {
        report(error, slot);
      }
    }

    // Writes `value` unless the slot holds another owner's. Returns
    // "saved", "taken" (another set or test holds the slot), or "failed".
    function store(slot, value, owner) {
      checkSlot(slot);
      const current = read(slot);
      const holder = ownerOf(current);
      if (current && owner && holder && holder !== String(owner)) return "taken";
      try {
        storage.setItem(KEYS[slot], JSON.stringify(value));
        return "saved";
      } catch (error) {
        report(error, slot);
        return "failed";
      }
    }

    // Empties the slot; with `owner`, only while that owner holds it.
    function clear(slot, owner) {
      checkSlot(slot);
      if (owner) {
        const holder = ownerOf(read(slot));
        if (holder && holder !== String(owner)) return false;
      }
      remove(slot);
      return true;
    }

    // A test saved in the set slot (before tests had their own) moves to
    // the test slot, unless one is already there.
    function migrate() {
      const old = read("set");
      if (!old || slotOf(old) !== "test") return false;
      if (!read("test")) {
        try {
          storage.setItem(KEYS.test, JSON.stringify(old));
        } catch (error) {
          report(error, "test");
          return false;
        }
      }
      remove("set");
      return true;
    }

    return {
      load: read,
      store,
      clear,
      migrate,
      all: () => ({ set: read("set"), test: read("test") }),
    };
  }

  return {
    KEYS,
    SLOTS,
    slotOf,
    parse,
    ownerOf,
    engineSnapshot,
    restoreScreen,
    discardResult,
    summary,
    create,
  };
});
