(function () {
  "use strict";

  // Shared by every page. The SAT | ACT switch in the header scopes the whole
  // site to one test at a time; the choice is stored so it follows the
  // student between pages and visits. Pages listen with onTestChange.
  const TEST_KEY = "liminal:test:v1";
  const TESTS = ["SAT", "ACT"];
  const DEFAULT_TEST = "SAT";
  const listeners = [];

  function parseTest(raw) {
    if (raw === null || raw === undefined) return null;
    let value = raw;
    try {
      value = JSON.parse(raw);
    } catch (error) {
      /* an unquoted value is accepted as written */
    }
    return TESTS.includes(value) ? value : null;
  }

  function readStoredTest() {
    try {
      return parseTest(localStorage.getItem(TEST_KEY)) || DEFAULT_TEST;
    } catch (error) {
      return DEFAULT_TEST;
    }
  }

  let current = readStoredTest();

  // Section keys, question ids, and generated ids all start with the test:
  // "sat-math", "act-english-…", "sat-math-hard:…".
  function testOf(key) {
    const text = String(key || "");
    if (text.startsWith("sat-")) return "SAT";
    if (text.startsWith("act-")) return "ACT";
    return null;
  }

  function applyToPage() {
    document.documentElement.dataset.test = current;
    document.querySelectorAll("[data-test-option]").forEach((button) => {
      const selected = button.dataset.testOption === current;
      button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll("[data-test-name]").forEach((node) => {
      node.textContent = current;
    });
    document.querySelectorAll("[data-test-only]").forEach((node) => {
      node.hidden = node.dataset.testOnly !== current;
    });
  }

  function setTest(test, options) {
    if (!TESTS.includes(test)) return;
    const persist = !options || options.persist !== false;
    const changed = test !== current;
    current = test;
    if (persist) {
      try {
        localStorage.setItem(TEST_KEY, JSON.stringify(test));
      } catch (error) {
        /* the switch still works for this page view */
      }
    }
    applyToPage();
    if (changed) listeners.forEach((listener) => listener(current));
  }

  function onTestChange(listener) {
    listeners.push(listener);
  }

  document.querySelectorAll("[data-test-option]").forEach((button) => {
    button.addEventListener("click", () => setTest(button.dataset.testOption));
  });

  // Another tab changed the test: follow it, so two open pages never disagree.
  window.addEventListener("storage", (event) => {
    if (event.key !== TEST_KEY) return;
    const next = parseTest(event.newValue) || DEFAULT_TEST;
    if (next !== current) setTest(next, { persist: false });
  });

  applyToPage();

  window.LiminalSite = {
    TESTS,
    TEST_KEY,
    getTest: () => current,
    setTest,
    onTestChange,
    testOf,
  };
})();
