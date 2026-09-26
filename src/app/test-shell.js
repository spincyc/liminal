(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalShell = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  // Digital test mode: a full-viewport test screen with a top bar (title,
  // directions, timer, tools), a question area, and a bottom bar (question
  // navigator, Back, Next), then a review page, a report, and an answer
  // review. Session decisions live in LiminalTestEngine; content rendering
  // lives in LiminalRender; scoring comes from PracticeCore. One module of
  // an on-screen SAT test (options.module) is submitted from its review page
  // and hands over to the app instead of showing a report; the break
  // between sections has its own screen (startBreak).

  const SHELL_SCHEMA = "liminal-test-shell";
  const SHELL_VERSION = 1;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const CALCULATOR_URL = "https://www.desmos.com/calculator";
  const SAVE_EVERY_MS = 15000;
  // Typing an answer changes the state on every keystroke; snapshots are
  // written once the typing pauses, and at once when the page is hidden.
  const SAVE_DEBOUNCE_MS = 600;
  const DEFAULT_LETTERS = ["A", "B", "C", "D", "E"];
  // The line reader's band reaches this far (px) past the letters of its
  // first and last lines.
  const READER_PAD = 6;

  const DIRECTIONS = {
    "sat-reading-writing": [
      "Each question comes with its own short text or pair of texts; some add a table or a student's notes. Read the text, then choose the single best of the four answers.",
      "Answer from what the text states or strongly implies, not from outside knowledge.",
    ],
    "sat-math": [
      "Most questions have four answer choices; choose the single best one. For the rest, type your own answer in the box, following the entry rules below.",
      "A calculator is allowed on every question. Unless a question says otherwise, every variable and expression stands for a real number, figures lie in a plane and are drawn to scale, and the domain of a function f is every real x for which f(x) is a real number.",
    ],
    "act-english": [
      "Parts of each passage are underlined and numbered. For each one, choose the option that best fits standard written English and the passage's purpose and style; choose NO CHANGE if the original is best.",
      "Other questions ask about a numbered point in the passage or about the passage as a whole.",
    ],
    "act-mathematics": [
      "Solve each problem and choose the correct answer. A calculator is allowed.",
      "Unless a question says otherwise, figures are not necessarily drawn to scale, figures lie in a plane, and \"line\" means a straight line.",
    ],
    "act-reading": [
      "Read each passage, then choose the best answer to each question based on what the passage states or implies.",
    ],
    "act-science": [
      "Each passage is followed by several questions. Refer to the passage as often as you need. A calculator is not allowed.",
    ],
  };

  const SPR_RULES = [
    "If more than one answer is correct, enter just one.",
    "A positive answer can use up to 5 characters; a negative answer up to 6, counting the negative sign.",
    "Enter a fraction or a decimal. If a fraction does not fit, enter its decimal; if a decimal does not fit, round it or cut it off at the fourth digit.",
    "Enter a mixed number such as 2 1/4 as an improper fraction (9/4) or a decimal (2.25).",
    "Do not type commas, units, percent signs, or dollar signs.",
  ];

  const SPR_EXAMPLES = [
    ["4.5", "4.5, 4.50, 9/2", "4 1/2"],
    ["5/6", "5/6, .8333, 0.833", ".83, 0.83"],
    ["−1/7", "-1/7, -.1428, -.1429, -0.143", "-.14, -0.14"],
  ];

  // How an item ended, for the answer review, the navigator, and the
  // report. "hinted": right, but only after a hint, so not counted.
  const VERDICT_LABELS = {
    correct: "Correct",
    hinted: "Right after a hint, not counted",
    incorrect: "Incorrect",
    omitted: "Not answered",
  };
  const VERDICT_ICONS = { correct: "check", hinted: "bulb", incorrect: "cross", omitted: "warning" };

  let active = null;

  /* ------------------------------------------------------------- utilities */

  function h(tag, props, children) {
    const node = document.createElement(tag);
    const settings = props || {};
    Object.keys(settings).forEach((key) => {
      const value = settings[key];
      if (value === undefined || value === null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = String(value);
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value === true) node.setAttribute(key, "");
      else node.setAttribute(key, String(value));
    });
    append(node, children);
    return node;
  }

  function append(node, children) {
    [].concat(children === undefined ? [] : children).forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === "string" || typeof child === "number"
        ? document.createTextNode(String(child))
        : child);
    });
    return node;
  }

  function svgEl(tag, attrs, children) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach((key) => node.setAttribute(key, String(attrs[key])));
    (children || []).forEach((child) => node.appendChild(
      typeof child === "string" ? document.createTextNode(child) : child,
    ));
    return node;
  }

  const ICONS = {
    calculator: [
      ["rect", { x: 5, y: 2.5, width: 14, height: 19, rx: 2 }],
      ["rect", { x: 8, y: 5.5, width: 8, height: 3.5, rx: 0.5 }],
      ["path", { d: "M8.5 12.5h.01M12 12.5h.01M15.5 12.5h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01M8.5 18.5h.01M12 18.5h.01M15.5 18.5h.01", "stroke-width": 2.4 }],
    ],
    reference: [
      ["path", { d: "M6 3h9l4 4v14H6z" }],
      ["path", { d: "M15 3v4h4" }],
      ["path", { d: "M9 11h7M9 14.5h7M9 18h4" }],
    ],
    close: [["path", { d: "M6 6l12 12M18 6L6 18" }]],
    bookmark: [["path", { d: "M7 3.5h10v17l-5-3.6-5 3.6z" }]],
    pin: [
      ["path", { d: "M12 21s6.5-6.3 6.5-11a6.5 6.5 0 1 0-13 0c0 4.7 6.5 11 6.5 11z" }],
      ["circle", { cx: 12, cy: 10, r: 2.3 }],
    ],
    up: [["path", { d: "M6 15l6-6 6 6" }]],
    down: [["path", { d: "M6 9l6 6 6-6" }]],
    clock: [["circle", { cx: 12, cy: 12, r: 8.5 }], ["path", { d: "M12 7.5V12l3 2" }]],
    bulb: [
      ["path", { d: "M9 18h6M10 21h4" }],
      ["path", { d: "M12 3a6 6 0 0 0-3.8 10.6c.7.6 1 1.4 1 2.4h5.6c0-1 .3-1.8 1-2.4A6 6 0 0 0 12 3z" }],
    ],
    check: [["path", { d: "M5 12.5l4.5 4.5L19 7.5" }]],
    cross: [["path", { d: "M7 7l10 10M17 7L7 17" }]],
    list: [["path", { d: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01", "stroke-width": 2.2 }]],
    warning: [
      ["path", { d: "M12 3.5l9.5 16.5h-19z" }],
      ["path", { d: "M12 10v4.5M12 17.2h.01" }],
    ],
    annotate: [
      ["path", { d: "M14.5 4l5 5-8.5 8.5H6v-5z" }],
      ["path", { d: "M12.5 6l5 5" }],
      ["path", { d: "M4 21h16" }],
    ],
    reader: [
      ["path", { d: "M3.5 4.5h17M3.5 19.5h17" }],
      ["rect", { x: 3.5, y: 8.5, width: 17, height: 7, rx: 1.5 }],
    ],
    grip: [["path", { d: "M8.5 7.5L12 4l3.5 3.5M8.5 16.5L12 20l3.5-3.5M7 12h10" }]],
    minus: [["path", { d: "M6 12h12" }]],
    plus: [["path", { d: "M12 6v12M6 12h12" }]],
  };

  function icon(name, className) {
    const svg = svgEl("svg", {
      viewBox: "0 0 24 24",
      width: 24,
      height: 24,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.8,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false",
      class: `lm-icon lm-icon-${name}${className ? ` ${className}` : ""}`,
    });
    (ICONS[name] || []).forEach(([tag, attrs]) => svg.appendChild(svgEl(tag, attrs)));
    return svg;
  }

  function formatClock(ms, roundUp) {
    const seconds = Math.max(0, roundUp ? Math.ceil(ms / 1000) : Math.floor(ms / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = String(seconds % 60).padStart(2, "0");
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
  }

  function spokenClock(ms, roundUp) {
    const seconds = Math.max(0, roundUp ? Math.ceil(ms / 1000) : Math.floor(ms / 1000));
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    const parts = [];
    if (minutes) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
    if (rest || !minutes) parts.push(`${rest} second${rest === 1 ? "" : "s"}`);
    return parts.join(" ");
  }

  function percent(value) {
    return value === null || value === undefined ? "—" : `${Math.round(value * 100)}%`;
  }

  function plural(count, word) {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
  }

  // What discarding records, in words, from LiminalTestEngine.discardResult
  // counts ({ seen, answered, blank, unseen }): every question seen, none
  // unseen. The app's own dialogs (replacing or discarding a saved set)
  // use the same words.
  function describeDiscard(info) {
    if (!info || !info.seen) return "";
    const parts = [];
    if (info.answered) parts.push(`${info.answered} answered`);
    if (info.blank) parts.push(`${info.blank} left blank, which count${info.blank === 1 ? "s" : ""} as wrong`);
    const verb = info.seen === 1 ? "is" : "are";
    return `The ${plural(info.seen, "question")} you saw ${verb} recorded in your progress (${parts.join(" and ")})` +
      (info.unseen ? `; the ${info.unseen} you never opened ${info.unseen === 1 ? "is" : "are"} not.` : ".");
  }

  function isMathSection(sectionKey) {
    return /math/i.test(String(sectionKey || ""));
  }

  function hasResponse(value) {
    return value !== null && value !== undefined && value !== "";
  }

  /* ------------------------------------------------------ reference sheet */

  function frac(numerator, denominator) {
    return h("span", { className: "lm-frac", "aria-label": `${numerator} over ${denominator}` }, [
      h("span", { className: "lm-frac-n", "aria-hidden": "true", text: numerator }),
      h("span", { className: "lm-frac-d", "aria-hidden": "true", text: denominator }),
    ]);
  }

  function formula(parts) {
    return h("p", { className: "lm-formula" }, parts.map((part) => {
      if (typeof part === "string") return part;
      if (part.sup) return h("sup", { text: part.sup });
      if (part.frac) return frac(part.frac[0], part.frac[1]);
      return "";
    }));
  }

  function label(x, y, text, extra) {
    return svgEl("text", Object.assign({
      x, y, "font-size": 11, "text-anchor": "middle", fill: "currentColor", stroke: "none",
      "font-style": "italic",
    }, extra || {}), [text]);
  }

  function refFigure(children, viewBox) {
    return svgEl("svg", {
      viewBox: viewBox || "0 0 120 90",
      class: "lm-ref-svg",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.5,
      "aria-hidden": "true",
      focusable: "false",
    }, children);
  }

  function rightMark(x, y, dx, dy) {
    return svgEl("path", { d: `M${x + dx} ${y}v${dy}h${-dx}`, "stroke-width": 1 });
  }

  const DASHED = { "stroke-dasharray": "3 3", "stroke-width": 1 };

  function referenceItems() {
    return [
      {
        name: "Circle",
        figure: refFigure([
          svgEl("circle", { cx: 60, cy: 45, r: 32 }),
          svgEl("path", { d: "M60 45h32" }),
          svgEl("circle", { cx: 60, cy: 45, r: 1.8, fill: "currentColor" }),
          label(76, 40, "r"),
        ]),
        formulas: [["A = πr", { sup: "2" }], ["C = 2πr"]],
      },
      {
        name: "Rectangle",
        figure: refFigure([
          svgEl("rect", { x: 18, y: 20, width: 84, height: 46 }),
          label(60, 80, "ℓ"),
          label(110, 47, "w"),
        ]),
        formulas: [["A = ℓw"]],
      },
      {
        name: "Triangle",
        figure: refFigure([
          svgEl("path", { d: "M12 70L82 16L108 70z" }),
          svgEl("path", Object.assign({ d: "M82 16V70" }, DASHED)),
          rightMark(82, 70, -7, -7),
          label(89, 48, "h"),
          label(60, 84, "b"),
        ]),
        formulas: [["A = ", { frac: ["1", "2"] }, "bh"]],
      },
      {
        name: "Right triangle",
        figure: refFigure([
          svgEl("path", { d: "M20 70H104L20 16z" }),
          rightMark(20, 70, 8, -8),
          label(11, 46, "a"),
          label(62, 84, "b"),
          label(68, 38, "c"),
        ]),
        formulas: [["c", { sup: "2" }, " = a", { sup: "2" }, " + b", { sup: "2" }]],
      },
      {
        name: "Special right triangles",
        wide: true,
        figure: refFigure([
          svgEl("path", { d: "M24 74H110.6L24 24z" }),
          rightMark(24, 74, 7, -7),
          label(16, 53, "x", { "text-anchor": "end" }),
          label(67, 88, "x√3"),
          label(72, 44, "2x", { "text-anchor": "start" }),
          label(29, 42, "60°", { "font-size": 9, "font-style": "normal", "text-anchor": "start" }),
          label(86, 70, "30°", { "font-size": 9, "font-style": "normal", "text-anchor": "end" }),
          svgEl("path", { d: "M150 74H200L150 24z" }),
          rightMark(150, 74, 7, -7),
          label(142, 53, "s", { "text-anchor": "end" }),
          label(175, 88, "s"),
          label(179, 44, "s√2", { "text-anchor": "start" }),
          label(153, 49, "45°", { "font-size": 9, "font-style": "normal", "text-anchor": "start" }),
          label(182, 70, "45°", { "font-size": 9, "font-style": "normal", "text-anchor": "end" }),
        ], "0 0 224 92"),
        formulas: [],
      },
      {
        name: "Rectangular box",
        figure: refFigure([
          svgEl("path", { d: "M18 34h58v40H18z" }),
          svgEl("path", { d: "M18 34l22-16h58L76 34M98 18v40L76 74" }),
          label(47, 86, "ℓ"),
          label(91, 77, "w", { "text-anchor": "start" }),
          label(10, 57, "h"),
        ]),
        formulas: [["V = ℓwh"]],
      },
      {
        name: "Cylinder",
        figure: refFigure([
          svgEl("ellipse", { cx: 60, cy: 22, rx: 28, ry: 7 }),
          svgEl("path", { d: "M32 22v50a28 7 0 0 0 56 0V22" }),
          svgEl("path", Object.assign({ d: "M32 72a28 7 0 0 1 56 0" }, DASHED)),
          svgEl("path", { d: "M60 22h28", "stroke-width": 1 }),
          svgEl("circle", { cx: 60, cy: 22, r: 1.4, fill: "currentColor" }),
          label(76, 12, "r"),
          label(97, 50, "h"),
        ]),
        formulas: [["V = πr", { sup: "2" }, "h"]],
      },
      {
        name: "Sphere",
        figure: refFigure([
          svgEl("circle", { cx: 60, cy: 45, r: 32 }),
          svgEl("path", { d: "M28 45a32 9 0 0 0 64 0" }),
          svgEl("path", Object.assign({ d: "M28 45a32 9 0 0 1 64 0" }, DASHED)),
          svgEl("path", { d: "M60 45L86 27", "stroke-width": 1 }),
          svgEl("circle", { cx: 60, cy: 45, r: 1.6, fill: "currentColor" }),
          label(76, 30, "r"),
        ]),
        formulas: [["V = ", { frac: ["4", "3"] }, "πr", { sup: "3" }]],
      },
      {
        name: "Cone",
        figure: refFigure([
          svgEl("path", { d: "M30 70L60 10L90 70" }),
          svgEl("path", { d: "M30 70a30 8 0 0 0 60 0" }),
          svgEl("path", Object.assign({ d: "M30 70a30 8 0 0 1 60 0" }, DASHED)),
          svgEl("path", Object.assign({ d: "M60 10v60" }, DASHED)),
          svgEl("path", { d: "M60 70h30", "stroke-width": 1 }),
          label(66, 44, "h", { "text-anchor": "start" }),
          label(76, 83, "r"),
        ]),
        formulas: [["V = ", { frac: ["1", "3"] }, "πr", { sup: "2" }, "h"]],
      },
      {
        name: "Rectangular pyramid",
        figure: refFigure([
          svgEl("path", { d: "M16 72H78L100 56" }),
          svgEl("path", Object.assign({ d: "M16 72L38 56H100" }, DASHED)),
          svgEl("path", { d: "M16 72L58 12L78 72M58 12L100 56" }),
          svgEl("path", Object.assign({ d: "M58 12V64" }, DASHED)),
          svgEl("path", Object.assign({ d: "M38 56L58 12" }, DASHED)),
          label(47, 85, "ℓ"),
          label(96, 70, "w"),
          label(55, 47, "h", { "text-anchor": "end" }),
        ]),
        formulas: [["V = ", { frac: ["1", "3"] }, "ℓwh"]],
      },
    ];
  }

  function buildReferenceSheet() {
    const grid = h("div", { className: "lm-ref-grid" }, referenceItems().map((item) =>
      h("figure", { className: `lm-ref-item${item.wide ? " is-wide" : ""}` }, [
        item.figure,
        h("figcaption", {}, [
          h("span", { className: "lm-ref-name", text: item.name }),
        ].concat(item.formulas.map(formula))),
      ])
    ));
    const facts = h("ul", { className: "lm-ref-facts" }, [
      h("li", { text: "A full circle measures 360°, which is 2π radians." }),
      h("li", { text: "The three angle measures of any triangle add up to 180°." }),
    ]);
    return h("div", { className: "lm-ref-body" }, [grid, facts]);
  }

  /* ------------------------------------------------- dialogs and mounting */

  // A modal question in `dialog`: Cancel, an optional secondary choice
  // (`settings.alternative`: { text, onChoose }), and the confirming action.
  function confirmIn(dialog, settings) {
    const cancel = h("button", {
      type: "button",
      className: "lm-btn lm-btn-secondary",
      text: settings.cancel || "Cancel",
      onClick: () => dialog.close("cancel"),
    });
    const alternative = settings.alternative
      ? h("button", {
        type: "button",
        className: "lm-btn lm-btn-secondary lm-btn-danger",
        text: settings.alternative.text,
        onClick: () => dialog.close("alternative"),
      })
      : null;
    const confirm = h("button", {
      type: "button",
      className: "lm-btn lm-btn-primary",
      text: settings.confirm || "OK",
      onClick: () => dialog.close("confirm"),
    });
    dialog.replaceChildren(
      h("h2", { id: "lm-dialog-title", className: "lm-dialog-title", text: settings.title }),
      h("p", { className: "lm-dialog-text", text: settings.text }),
      h("div", { className: "lm-dialog-actions" }, [cancel, alternative, confirm]),
    );
    const opener = document.activeElement;
    dialog.returnValue = "";
    dialog.onclose = () => {
      if (dialog.returnValue === "confirm") settings.onConfirm();
      else if (dialog.returnValue === "alternative") settings.alternative.onChoose();
      else if (opener && opener.isConnected) opener.focus();
    };
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      cancel.focus();
    } else if (root.confirm(`${settings.title}\n\n${settings.text}`)) {
      settings.onConfirm();
    }
  }

  // Puts a full-screen node on the page. The page behind it is inert while
  // it is open, so Tab and screen readers stay inside. Returns the undo.
  function mount(node) {
    const previousOverflow = document.documentElement.style.overflow;
    const inerted = [];
    document.body.appendChild(node);
    Array.from(document.body.children).forEach((child) => {
      if (child === node || child.hasAttribute("inert") || child.tagName === "SCRIPT") return;
      child.setAttribute("inert", "");
      inerted.push(child);
    });
    document.documentElement.style.overflow = "hidden";
    return function unmount() {
      node.remove();
      inerted.forEach((child) => child.removeAttribute("inert"));
      document.documentElement.style.overflow = previousOverflow;
    };
  }

  /* ---------------------------------------------------------------- break */

  // The break between the sections of a full-length test: its own
  // countdown, on the wall clock (`endsAt`), so it keeps running while the
  // page is closed; a way to go on early; and Save and exit. `options`:
  // { title, endsAt, next (what starts after it), now?,
  //   onContinue(reason: "skip" | "time"), onExit({ reason: "save" | "discard" }) }.
  function startBreak(options) {
    if (active) active.close();
    const controller = createBreak(options || {});
    active = controller;
    return { close: controller.close, element: controller.root };
  }

  function createBreak(options) {
    const now = typeof options.now === "function" ? options.now : () => Date.now();
    const endsAt = Number(options.endsAt) || now();
    const call = (name, payload) => {
      if (typeof options[name] !== "function") return;
      try {
        options[name](payload);
      } catch (error) {
        if (root.console) root.console.error(`LiminalShell ${name} failed`, error);
      }
    };
    let closed = false;
    let timerId = null;
    const refs = {};
    refs.clock = h("p", { className: "lm-break-clock", role: "timer" });
    refs.dialog = h("dialog", { className: "lm-dialog", "aria-labelledby": "lm-dialog-title" });
    refs.resume = h("button", {
      type: "button",
      className: "lm-btn lm-btn-primary lm-break-resume",
      text: "Resume testing",
      onClick: () => end("skip"),
    });
    const title = options.title || "Break";
    const shell = h("div", {
      className: "lm-shell lm-break-shell",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": `${title}: break`,
      dataset: { view: "break" },
    }, [
      h("header", { className: "lm-top" }, [
        h("div", { className: "lm-top-left" }, [h("h1", { className: "lm-title", text: title })]),
        h("div", { className: "lm-top-center" }, [h("p", { className: "lm-center-label", text: "Break" })]),
        h("div", { className: "lm-top-right" }, [
          h("button", {
            type: "button",
            className: "lm-tool lm-tool-close",
            "aria-label": "Exit",
            title: "Exit",
            onClick: requestExit,
          }, [icon("close"), h("span", { className: "lm-tool-label", text: "Exit" })]),
        ]),
      ]),
      h("main", { className: "lm-main" }, [
        h("div", { className: "lm-page lm-break" }, [
          h("h2", { className: "lm-page-title", tabindex: "-1", text: "Break time" }),
          h("p", { className: "lm-break-label", text: "Time left" }),
          refs.clock,
          h("p", { className: "lm-lede", text: "Stand up, stretch, and get some water. The break clock keeps running even if you leave this page." }),
          h("p", { className: "lm-lede", text: `Next: ${options.next || "the next section"}. It starts on its own when the break ends.` }),
          refs.resume,
          h("p", { className: "lm-break-note", text: "On test day you would wait for the clock to run out. Here you can go on whenever you are ready." }),
        ]),
      ]),
      refs.dialog,
    ]);

    function remaining() {
      return Math.max(0, endsAt - now());
    }

    function tick() {
      if (closed) return;
      const left = remaining();
      const shown = formatClock(left, true);
      if (refs.clock.textContent !== shown) {
        refs.clock.textContent = shown;
        refs.clock.setAttribute("aria-label", `Break time left: ${spokenClock(left, true)}`);
      }
      if (left <= 0) end("time");
    }

    function teardown() {
      if (closed) return;
      closed = true;
      if (timerId !== null) root.clearInterval(timerId);
      if (refs.dialog.open) {
        refs.dialog.onclose = null;
        refs.dialog.close();
      }
      unmount();
      if (active && active.root === shell) active = null;
    }

    // The next screen opens after this one is gone.
    function end(reason) {
      if (closed) return;
      teardown();
      root.setTimeout(() => call("onContinue", reason), 0);
    }

    function requestExit() {
      confirmIn(refs.dialog, {
        title: "Leave the break?",
        text: "Save and exit keeps your place: resume the test from the Practice page. The break clock keeps running while you are away. Discard test ends the whole test for good; modules you finished stay in your progress.",
        cancel: "Stay on the break",
        alternative: { text: "Discard test", onChoose: () => leave("discard") },
        confirm: "Save and exit",
        onConfirm: () => leave("save"),
      });
    }

    function leave(reason) {
      teardown();
      call("onExit", { reason });
    }

    const unmount = mount(shell);
    tick();
    if (!closed) {
      timerId = root.setInterval(tick, 250);
      const heading = shell.querySelector(".lm-page-title");
      if (heading) heading.focus({ preventScroll: true });
    }
    return { root: shell, close: teardown };
  }

  /* ------------------------------------------------------------ the shell */

  // Whether a saved snapshot can be resumed, so an app never offers a
  // Resume button that cannot work.
  function canResume(snapshot) {
    const Engine = root.LiminalTestEngine;
    if (!Engine || !snapshot || typeof snapshot !== "object") return false;
    const inner = snapshot.schema === SHELL_SCHEMA ? snapshot.session : snapshot;
    try {
      return Boolean(Engine.restore(inner, { now: () => Date.now() }));
    } catch (error) {
      return false;
    }
  }

  function start(options) {
    if (active) active.close();
    const controller = createShell(options || {});
    active = controller;
    return {
      close: controller.close,
      snapshot: controller.snapshot,
      element: controller.root,
    };
  }

  function createShell(options) {
    const Engine = root.LiminalTestEngine;
    const Render = root.LiminalRender;
    const Core = root.PracticeCore;
    if (!Engine || !Render || !Core) {
      throw new Error("LiminalShell needs PracticeCore, LiminalTestEngine, and LiminalRender loaded first.");
    }
    // The passage tools (Annotate and the line reader) come from their own
    // modules; without them the screen works as before, minus those tools.
    const Annotations = root.LiminalAnnotations || null;
    const LineReader = root.LiminalLineReader || null;
    const now = typeof options.now === "function" ? options.now : () => Date.now();
    const call = (name, payload) => {
      const callback = options[name];
      if (typeof callback !== "function") return undefined;
      try {
        return callback(payload);
      } catch (error) {
        if (root.console) root.console.error(`LiminalShell ${name} failed`, error);
        return undefined;
      }
    };

    /* ---- session and resume */
    const resume = options.resume && typeof options.resume === "object" ? options.resume : null;
    const resumeShell = resume && resume.schema === SHELL_SCHEMA ? resume : null;
    let session = null;
    if (resume) {
      session = Engine.restore(resumeShell ? resumeShell.session : resume, { now });
      if (!session) {
        const error = new Error("This saved set could not be restored.");
        error.code = "restore-failed";
        throw error;
      }
    }
    let view = "question";
    let timerHidden = false;
    if (session && resumeShell) {
      view = ["question", "review", "report", "answers"].includes(resumeShell.view)
        ? resumeShell.view
        : "question";
      timerHidden = Boolean(resumeShell.timerHidden);
    }
    if (!session) {
      session = Engine.create({
        questions: options.questions,
        feedback: options.feedback,
        timeLimitSeconds: options.timeLimitSeconds,
        alertSeconds: options.alertSeconds,
        marked: options.marked,
        now,
      });
    }
    if (session.state.finished && view !== "answers") view = "report";
    if (!session.state.finished && (view === "report" || view === "answers")) view = "question";
    if (view !== "question") session.leaveQuestion();

    const first = session.state.questions[0];
    const sectionKey = options.sectionKey || (resumeShell && resumeShell.sectionKey) ||
      first.sectionKey || "";
    const title = options.title || (resumeShell && resumeShell.title) || first.section ||
      "Practice set";
    // A template run's set code (section, template mask, and seed), shown in
    // the report so the exact set can be named and built again.
    const runCode = options.setCode || options.runCode ||
      (resumeShell && (resumeShell.setCode || resumeShell.runCode)) || null;
    const mathSection = isMathSection(sectionKey);
    // Annotate and the line reader apply question by question: only where a
    // Reading and Writing or ACT passage is on screen (toolAvailable).
    const tools = Object.assign(
      { calculator: mathSection, reference: mathSection, annotate: true, lineReader: true },
      (resumeShell && resumeShell.tools) || {},
      options.tools || {},
    );
    const directions = options.directions || (resumeShell && resumeShell.directions) || null;
    // One module of an on-screen SAT test: `{ next }` names what follows
    // ("Module 2", "the break", "your results"). Submitting it, or its time
    // running out, delivers the result and hands over to the app
    // (onContinue) instead of showing a report, so there is no going back.
    const moduleInfo = options.module || (resumeShell && resumeShell.module) || null;
    // A module's clock runs on the wall clock, as on test day: Save and exit
    // does not stop it (LiminalTestEngine serialize), so time away counts.
    if (moduleInfo && !session.state.wallClock && !session.state.finished) session.useWallClock();
    // A set that spans sections (a mini test) switches directions and tools
    // at each section boundary, as the real test does.
    const mixed = new Set(session.state.questions.map((question) => question.sectionKey).filter(Boolean)).size > 1;
    const learnHref = typeof options.learnHref === "function" ? options.learnHref : null;

    let timeUpNotice = false;
    let openPanel = null;
    let lastSave = now();
    let saveTimer = null;
    let lastStimulusKey = null;
    let timerId = null;
    let closed = false;
    const refs = {};

    // Passage tools. Highlights are kept per passage (questions that share
    // a passage share its highlights) as offsets into its text, and with
    // the line reader's settings ride in the snapshot as scratch: they
    // never reach the result or the progress record.
    const passageKeys = Annotations
      ? Annotations.passageKeys(session.state.questions.map(passageTextOf))
      : session.state.questions.map((question, index) => (passageTextOf(question) ? `p${index}` : null));
    let annotations = Annotations
      ? Annotations.prune(Annotations.restore(resumeShell && resumeShell.annotations), passageKeys)
      : {};
    let readerPrefs = LineReader
      ? LineReader.restorePrefs(resumeShell && resumeShell.lineReader)
      : { on: false, lines: 3 };
    // The highlight open in the notes panel: { key, start }.
    let noteTarget = null;
    // The selection as the Annotate button was pressed, before a tap on it
    // can clear the selection: { range, pointer, at }.
    let armed = null;
    let lastPointerType = "mouse";
    // The line reader's measured lines, its first line per passage, and a
    // drag in progress.
    let readerLines = [];
    let readerIndex = 0;
    const readerAt = new Map();
    let readerDrag = null;
    let readerFrame = null;
    const readerObserver = typeof root.ResizeObserver === "function"
      ? new root.ResizeObserver(() => { if (readerShown()) layoutReader(); })
      : null;

    // `paused`: the student chose Save and exit, so a timed practice set's
    // clock waits for them instead of running while the set is put away. A
    // module's clock never waits (wallClock), so the engine ignores it there.
    function snapshot(settings) {
      return {
        schema: SHELL_SCHEMA,
        version: SHELL_VERSION,
        title,
        sectionKey,
        runCode,
        tools,
        directions,
        module: moduleInfo,
        view,
        timerHidden,
        annotations: Annotations ? Annotations.serialize(annotations) : undefined,
        lineReader: { on: readerPrefs.on, lines: readerPrefs.lines },
        finished: session.state.finished,
        session: session.serialize({ paused: Boolean(settings && settings.paused) }),
      };
    }

    // Writes a snapshot now. Snapshots stop once the report has been
    // delivered, so an app that clears its saved session in onFinish does
    // not see it written back.
    function flushSave(settings) {
      if (saveTimer !== null) {
        root.clearTimeout(saveTimer);
        saveTimer = null;
      }
      const force = Boolean(settings && settings.force);
      if (closed || (session.state.reported && !force)) return;
      lastSave = now();
      call("onSave", snapshot(settings));
    }

    // Asks for a snapshot soon; repeated changes share one write.
    function save(force) {
      if (force) {
        flushSave({ force: true });
        return;
      }
      if (closed || session.state.reported || saveTimer !== null) return;
      saveTimer = root.setTimeout(() => {
        saveTimer = null;
        flushSave();
      }, SAVE_DEBOUNCE_MS);
    }

    /* ---- frame */
    const shell = h("div", {
      className: "lm-shell",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": `Digital test mode: ${title}`,
      dataset: { view },
    });
    refs.root = shell;

    function toolButton(name, text, onClick, extra) {
      return h("button", Object.assign({
        type: "button",
        className: `lm-tool lm-tool-${name}`,
        "aria-label": text,
        title: text,
        onClick,
      }, extra || {}), [icon(name), h("span", { className: "lm-tool-label", text })]);
    }

    refs.directionsToggle = h("button", {
      type: "button",
      className: "lm-directions-toggle",
      "aria-expanded": "false",
      "aria-controls": "lm-directions",
      onClick: () => togglePanel("directions"),
    }, ["Directions", icon("down", "lm-caret")]);

    refs.timerValue = h("span", { className: "lm-timer-value" });
    refs.timerCaption = h("span", { className: "lm-timer-caption" });
    refs.timerIcon = icon("clock", "lm-timer-clock");
    refs.timer = h("div", { className: "lm-timer", role: "timer" }, [
      refs.timerIcon, refs.timerValue, refs.timerCaption,
    ]);
    refs.timerToggle = h("button", {
      type: "button",
      className: "lm-timer-toggle",
      onClick: () => {
        timerHidden = !timerHidden;
        updateTimer();
        save();
      },
    });
    refs.centerLabel = h("p", { className: "lm-center-label" });

    refs.calcButton = tools.calculator
      ? toolButton("calculator", "Calculator", openCalculator, {
        title: "Calculator (opens the Desmos graphing calculator in a new window)",
      })
      : null;
    refs.refButton = tools.reference
      ? toolButton("reference", "Reference", () => togglePanel("reference"), {
        "aria-expanded": "false",
        "aria-controls": "lm-reference",
      })
      : null;
    refs.reportButton = toolButton("list", "Report", () => showView("report"));
    refs.exitButton = toolButton("close", "Exit", requestExit);
    refs.sectionLabel = h("p", { className: "lm-section-label", hidden: true });
    refs.annotateButton = tools.annotate && Annotations
      ? toolButton("annotate", "Annotate", onAnnotate, {
        title: "Annotate: highlight the text you selected in the passage and add a note (Alt+Shift+H)",
        "aria-keyshortcuts": "Alt+Shift+H",
        "aria-expanded": "false",
        "aria-controls": "lm-notes",
        onPointerdown: armSelection,
      })
      : null;
    refs.readerButton = tools.lineReader && LineReader
      ? toolButton("reader", "Line reader", toggleReader, {
        title: "Line reader: dim all but a few lines of the passage",
        "aria-pressed": "false",
      })
      : null;

    refs.top = h("header", { className: "lm-top" }, [
      h("div", { className: "lm-top-left" }, [
        h("h1", { className: "lm-title", text: title }),
        refs.sectionLabel,
        refs.directionsToggle,
      ]),
      h("div", { className: "lm-top-center" }, [refs.timer, refs.timerToggle, refs.centerLabel]),
      h("div", { className: "lm-top-right" }, [
        refs.annotateButton, refs.readerButton,
        refs.calcButton, refs.refButton, refs.reportButton, refs.exitButton,
      ]),
    ]);

    refs.directions = h("div", {
      id: "lm-directions",
      className: "lm-panel lm-directions",
      role: "region",
      "aria-label": "Directions",
      hidden: true,
    });

    refs.alertText = h("p", { className: "lm-alert-text", text: "5 minutes remaining." });
    refs.alert = h("div", { className: "lm-alert", hidden: true }, [
      icon("clock"),
      refs.alertText,
      h("button", {
        type: "button",
        className: "lm-alert-close",
        "aria-label": "Dismiss alert",
        onClick: () => { refs.alert.hidden = true; },
      }, [icon("close")]),
    ]);

    refs.main = h("main", { className: "lm-main", id: "lm-main" });

    refs.navToggle = h("button", {
      type: "button",
      className: "lm-nav-toggle",
      "aria-expanded": "false",
      "aria-controls": "lm-navigator",
      onClick: () => togglePanel("nav"),
    });
    refs.backButton = h("button", {
      type: "button",
      className: "lm-btn lm-btn-primary lm-back",
      text: "Back",
      onClick: onBack,
    });
    refs.nextButton = h("button", {
      type: "button",
      className: "lm-btn lm-btn-primary lm-next",
      text: "Next",
      onClick: onNext,
    });
    refs.bottomLeft = h("p", { className: "lm-bottom-left", text: "Digital test mode" });
    refs.bottom = h("footer", { className: "lm-bottom" }, [
      refs.bottomLeft,
      h("div", { className: "lm-bottom-center" }, [refs.navToggle]),
      h("div", { className: "lm-bottom-right" }, [refs.backButton, refs.nextButton]),
    ]);

    refs.navigator = h("div", {
      id: "lm-navigator",
      className: "lm-panel lm-navigator",
      role: "dialog",
      "aria-label": "Question navigator",
      hidden: true,
    });
    refs.reference = h("div", {
      id: "lm-reference",
      className: "lm-panel lm-reference",
      role: "dialog",
      "aria-label": "Reference sheet",
      hidden: true,
    }, [
      h("div", { className: "lm-panel-head" }, [
        h("h2", { className: "lm-panel-title", text: "Reference" }),
        h("button", {
          type: "button",
          className: "lm-icon-btn",
          "aria-label": "Close reference sheet",
          onClick: () => closePanel(true),
        }, [icon("close")]),
      ]),
      buildReferenceSheet(),
    ]);
    // Highlights and notes: not modal, so the student can go on selecting
    // and reading the passage while it is open.
    refs.notes = h("div", {
      id: "lm-notes",
      className: "lm-panel lm-notes",
      role: "dialog",
      "aria-label": "Highlights and notes",
      hidden: true,
    });
    // The line reader's band (the clear lines; its shadow dims the rest of
    // the passage) and its handle, placed in the passage pane when on.
    refs.readerBand = h("div", { className: "lm-reader-band", "aria-hidden": "true" });
    refs.readerGrip = h("div", {
      className: "lm-reader-grip",
      role: "slider",
      tabindex: "0",
      "aria-label": "Line reader position",
      "aria-orientation": "vertical",
      title: "Drag, or use the arrow keys, to move the line reader",
      onKeydown: onReaderKey,
      onPointerdown: onReaderGripDown,
      onPointermove: onReaderGripMove,
      onPointerup: onReaderGripUp,
      onPointercancel: onReaderGripUp,
    }, [icon("grip")]);
    refs.readerFewer = h("button", {
      type: "button",
      className: "lm-reader-btn",
      "aria-label": "Show fewer lines",
      title: "Show fewer lines",
      onClick: () => resizeReader(-1),
    }, [icon("minus")]);
    refs.readerMore = h("button", {
      type: "button",
      className: "lm-reader-btn",
      "aria-label": "Show more lines",
      title: "Show more lines",
      onClick: () => resizeReader(1),
    }, [icon("plus")]);
    refs.readerControls = h("div", {
      className: "lm-reader-controls",
      role: "group",
      "aria-label": "Line reader",
    }, [refs.readerGrip, refs.readerFewer, refs.readerMore]);
    refs.scrim = h("div", { className: "lm-scrim", hidden: true, onClick: () => closePanel(true) });

    refs.livePolite = h("div", { className: "lm-sr-only", "aria-live": "polite", role: "status" });
    refs.liveAssertive = h("div", { className: "lm-sr-only", "aria-live": "assertive", role: "alert" });

    refs.dialog = h("dialog", { className: "lm-dialog", "aria-labelledby": "lm-dialog-title" });

    append(shell, [
      refs.top, refs.directions, refs.alert, refs.main, refs.bottom, refs.scrim,
      refs.navigator, refs.reference, refs.notes, refs.livePolite, refs.liveAssertive, refs.dialog,
    ]);

    /* ---- helpers */
    function announce(text, assertive) {
      const region = assertive ? refs.liveAssertive : refs.livePolite;
      region.textContent = "";
      setTimeout(() => { region.textContent = text; }, 60);
    }

    function lettersFor(question, index) {
      if (Core && typeof Core.answerLetters === "function" && question.test === "ACT") {
        return Core.answerLetters(question.test, index + 1);
      }
      return DEFAULT_LETTERS;
    }

    function letterOf(question, index, choice) {
      return lettersFor(question, index)[choice] || String(choice + 1);
    }

    function responseLabel(question, index, response) {
      if (!hasResponse(response)) return "—";
      if (question.responseType === "multiple-choice") return letterOf(question, index, Number(response));
      return String(response);
    }

    function correctLabel(question, index) {
      if (question.responseType === "multiple-choice") {
        return letterOf(question, index, Number(question.correctAnswer));
      }
      return String(question.correctAnswer);
    }

    // The section of the question on screen; one section for most sets.
    function currentSectionKey() {
      const question = session.state.questions[session.state.index];
      return (mixed && question && question.sectionKey) || sectionKey;
    }

    // In a mixed set the calculator belongs to math sections and the
    // reference sheet to SAT Math only. Annotate and the line reader belong
    // to a question on screen that shows a passage outside Math.
    function toolAvailable(name) {
      if (!tools[name]) return false;
      if (name === "annotate" || name === "lineReader") {
        if (!(name === "annotate" ? Annotations : LineReader) || view !== "question") return false;
        return Boolean(passageKeys[session.state.index]);
      }
      if (!mixed) return true;
      const key = currentSectionKey();
      return name === "calculator" ? isMathSection(key) : key === "sat-math";
    }

    function mathOptions(question) {
      return isMathSection((question && question.sectionKey) || sectionKey) ? { math: true } : undefined;
    }

    // Plain math text (a step, a rationale, a hint) with exponents, fractions,
    // and roots typeset; other sections keep plain text.
    function mathText(tag, question, text, props) {
      if (mathOptions(question) && typeof Render.appendMath === "function") {
        return Render.appendMath(h(tag, props || {}), String(text));
      }
      return h(tag, Object.assign({}, props || {}, { text }));
    }

    function directionsFor() {
      if (Array.isArray(directions)) return directions;
      if (typeof directions === "string") return [directions];
      return DIRECTIONS[currentSectionKey()] || [
        "Choose the best answer to each question. Use Mark for Review to flag a question and return to it from the question navigator.",
      ];
    }

    function hasNumeric() {
      return session.state.questions.some((question) => question.responseType === "numeric" &&
        (!mixed || question.sectionKey === currentSectionKey()));
    }

    function sprRulesPanel(open) {
      const details = h("details", { className: "lm-spr-rules" }, [
        h("summary", {}, [h("span", { text: "How to enter your answer" }), icon("down", "lm-caret")]),
        h("ul", {}, SPR_RULES.map((rule) => h("li", { text: rule }))),
        h("div", { className: "lm-table-wrap" }, [
          h("table", { className: "lm-table lm-spr-examples" }, [
            h("caption", { text: "Examples" }),
            h("thead", {}, [h("tr", {}, [
              h("th", { scope: "col", text: "Answer" }),
              h("th", { scope: "col", text: "Ways to enter it" }),
              h("th", { scope: "col", text: "Not accepted" }),
            ])]),
            h("tbody", {}, SPR_EXAMPLES.map((row) => h("tr", {}, [
              h("th", { scope: "row", text: row[0] }),
              h("td", { text: row[1] }),
              h("td", { text: row[2] }),
            ]))),
          ]),
        ]),
      ]);
      if (open) details.open = true;
      return details;
    }

    function renderDirections() {
      refs.directions.replaceChildren(
        h("div", { className: "lm-panel-head" }, [
          h("h2", { className: "lm-panel-title", text: "Directions" }),
          h("button", {
            type: "button",
            className: "lm-icon-btn",
            "aria-label": "Close directions",
            onClick: () => closePanel(true),
          }, [icon("close")]),
        ]),
        h("div", { className: "lm-directions-body" }, directionsFor()
          .map((text) => h("p", { text }))
          .concat(session.state.feedback === "instant"
            ? [h("p", { text: "Instant feedback is on: use Check to see whether your answer is right, then read the explanation. A checked answer is locked." })]
            : [h("p", { text: "Nothing is scored until you finish. Use Mark for Review to flag questions, and the answer eliminator to cross out choices you have ruled out." })])
          .concat(toolAvailable("annotate") || toolAvailable("lineReader")
            ? [h("p", { text: "To highlight, select text in the passage, then choose Annotate (or press Alt+Shift+H); select a highlight to add or change its note. The line reader dims all but a few lines of the passage: drag its handle, tap a dimmed line, or use the arrow keys on the handle; its minus and plus buttons show fewer or more lines." })]
            : [])
          .concat(hasNumeric() ? [sprRulesPanel(true)] : [])),
      );
    }

    /* ---- panels */
    function togglePanel(name) {
      if (openPanel === name) closePanel(true);
      else openPanelNamed(name);
    }

    function openPanelNamed(name) {
      closePanel(false);
      openPanel = name;
      if (name === "nav") {
        renderNavigator();
        refs.navigator.hidden = false;
        refs.scrim.hidden = false;
        refs.navToggle.setAttribute("aria-expanded", "true");
        const current = refs.navigator.querySelector(".lm-cell.is-current") ||
          refs.navigator.querySelector(".lm-cell");
        if (current) current.focus();
      } else if (name === "directions") {
        renderDirections();
        refs.directions.hidden = false;
        refs.directionsToggle.setAttribute("aria-expanded", "true");
        const closeButton = refs.directions.querySelector(".lm-icon-btn");
        if (closeButton) closeButton.focus();
      } else if (name === "reference") {
        refs.reference.hidden = false;
        if (refs.refButton) refs.refButton.setAttribute("aria-expanded", "true");
        const closeButton = refs.reference.querySelector(".lm-icon-btn");
        if (closeButton) closeButton.focus();
      } else if (name === "notes") {
        // openNotes renders the panel and places focus.
        refs.notes.hidden = false;
        if (refs.annotateButton) refs.annotateButton.setAttribute("aria-expanded", "true");
      }
      shell.dataset.panel = name;
    }

    function closePanel(restoreFocus) {
      const was = openPanel;
      openPanel = null;
      delete shell.dataset.panel;
      refs.navigator.hidden = true;
      refs.directions.hidden = true;
      refs.reference.hidden = true;
      refs.notes.hidden = true;
      refs.scrim.hidden = true;
      refs.navToggle.setAttribute("aria-expanded", "false");
      refs.directionsToggle.setAttribute("aria-expanded", "false");
      if (refs.refButton) refs.refButton.setAttribute("aria-expanded", "false");
      if (refs.annotateButton) refs.annotateButton.setAttribute("aria-expanded", "false");
      if (was === "notes") {
        noteTarget = null;
        refs.noteInput = null;
        paintHighlights();
      }
      if (restoreFocus && was) {
        const target = was === "nav" ? refs.navToggle
          : was === "directions" ? refs.directionsToggle
            : was === "notes" ? refs.annotateButton
              : refs.refButton;
        if (target && target.isConnected && !target.hidden) target.focus();
      }
    }

    function openCalculator() {
      root.open(CALCULATOR_URL, "_blank", "noopener,noreferrer");
    }

    /* ---- dialogs */
    function confirmDialog(settings) {
      confirmIn(refs.dialog, settings);
    }

    function closeDialog() {
      if (refs.dialog.open) {
        refs.dialog.onclose = null;
        refs.dialog.close();
      }
    }

    // Leaving never throws a set away by default: Save and exit keeps it to
    // resume from the Practice page; Discard set is its own choice.
    function requestExit() {
      if (session.state.finished) {
        exit("done");
        return;
      }
      const discard = describeDiscard(session.discardResult());
      if (moduleInfo) {
        confirmDialog({
          title: "Leave this test?",
          text: "Save and exit keeps your place: resume the test from the Practice page." +
            (session.state.timeLimitSeconds
              ? " This module's clock keeps running while you are away, as it would on test day; " +
                "if it runs out, the answers you have are submitted."
              : "") +
            " Discard test ends the whole test for good. Modules you finished stay in your progress." +
            (discard ? ` From this module: ${discard.charAt(0).toLowerCase()}${discard.slice(1)}` : ""),
          cancel: "Keep testing",
          alternative: { text: "Discard test", onChoose: () => exit("discard") },
          confirm: "Save and exit",
          onConfirm: () => exit("save"),
        });
        return;
      }
      confirmDialog({
        title: "Leave this set?",
        text: "Save and exit keeps every answer so far: resume the set from the Practice page" +
          `${session.state.timeLimitSeconds ? ", and the timer picks up where it stopped" : ""}. ` +
          `Discard set ends it for good. ${discard}`,
        cancel: "Keep testing",
        alternative: { text: "Discard set", onChoose: () => exit("discard") },
        confirm: "Save and exit",
        onConfirm: () => exit("save"),
      });
    }

    // reason: "save" (resumable; a practice set's clock is paused, a
    // module's keeps running), "discard" (with `discarded`, what the app
    // records: LiminalTestEngine.discardResult), or "done" (the report was
    // already delivered).
    function exit(reason) {
      if (reason === "save") flushSave({ paused: true, force: true });
      const discarded = reason === "discard" ? session.discardResult() : undefined;
      teardown();
      call("onExit", discarded ? { reason, discarded } : { reason });
    }

    /* ---- navigation */
    function navigate(index) {
      closePanel(false);
      hideNotice();
      session.goTo(index);
      if (view !== "question" && view !== "answers") view = "question";
      save();
      render();
    }

    function onBack() {
      if (view === "review") {
        view = "question";
        session.enterQuestion();
        save();
        render();
        return;
      }
      if (view === "report") {
        session.goTo(0);
        showView("answers");
        return;
      }
      if (session.state.index > 0) navigate(session.state.index - 1);
    }

    function onNext() {
      if (view === "review") {
        requestFinish();
        return;
      }
      if (view === "report") {
        exit("done");
        return;
      }
      if (session.isLast()) {
        showView(view === "answers" ? "report" : "review");
        return;
      }
      navigate(session.state.index + 1);
    }

    function showView(name) {
      closePanel(false);
      hideNotice();
      view = name;
      // Only a question on screen gathers time.
      if (name === "question") session.enterQuestion();
      else session.leaveQuestion();
      save();
      render();
    }

    function requestFinish() {
      const counts = session.counts();
      if (moduleInfo) {
        const blank = counts.unanswered;
        confirmDialog({
          title: blank
            ? `Submit this module with ${blank} unanswered question${blank === 1 ? "" : "s"}?`
            : "Submit this module?",
          text: `After you submit, you move on to ${moduleInfo.next || "the next part"} and can't come back to this module.` +
            (blank ? " Unanswered questions count as incorrect." : ""),
          cancel: "Go back",
          confirm: "Submit module",
          onConfirm: () => finishSession("user"),
        });
        return;
      }
      if (counts.unanswered > 0) {
        confirmDialog({
          title: `Finish with ${counts.unanswered} unanswered question${counts.unanswered === 1 ? "" : "s"}?`,
          text: "Unanswered questions count as incorrect. You can go back and answer them, or finish now.",
          cancel: "Go back",
          confirm: "Finish",
          onConfirm: () => finishSession("user"),
        });
      } else {
        finishSession("user");
      }
    }

    function finishSession(reason) {
      if (moduleInfo) {
        endModule(reason);
        return;
      }
      closePanel(false);
      closeDialog();
      if (!session.state.finished) session.finish(reason);
      view = "report";
      deliverResult();
      render();
    }

    function deliverResult() {
      if (session.state.reported) return;
      session.markReported();
      save(true);
      call("onFinish", session.result());
    }

    // A module ends by being submitted or by running out of time. Its result
    // is delivered, the screen closes, and the app opens what follows; the
    // student cannot return to it.
    function endModule(reason) {
      if (closed) return;
      closePanel(false);
      closeDialog();
      if (!session.state.finished) session.finish(reason);
      deliverResult();
      const result = session.result();
      teardown();
      root.setTimeout(() => call("onContinue", { reason: result.finishReason || reason, result }), 0);
    }

    // A one-time note over the first question (why a module started, say),
    // in the alert the five-minute warning uses; it goes on navigation.
    let noticeShown = false;
    function showNotice(text) {
      refs.alertText.textContent = text;
      refs.alert.hidden = false;
      noticeShown = true;
      announce(text, true);
    }

    function hideNotice() {
      if (!noticeShown) return;
      noticeShown = false;
      refs.alert.hidden = true;
      refs.alertText.textContent = "5 minutes remaining.";
    }

    function timeUp() {
      if (moduleInfo) {
        endModule("time");
        return;
      }
      timeUpNotice = true;
      refs.alert.hidden = true;
      closePanel(false);
      closeDialog();
      view = "report";
      deliverResult();
      render();
      announce("Time is up. The test has ended and your answers were submitted.", true);
    }

    /* ---- timer */
    function updateTimer(reading) {
      const status = reading || session.timer();
      const running = !session.state.finished && (view === "question" || view === "review");
      refs.timer.hidden = !running;
      refs.timerToggle.hidden = !running;
      refs.centerLabel.hidden = running;
      if (!running) {
        refs.centerLabel.textContent = view === "answers" ? "Answer review" : "Results";
        return;
      }
      const shown = status.timed
        ? formatClock(status.remainingMs, true)
        : formatClock(status.elapsedMs, false);
      if (refs.timerValue.textContent !== shown) refs.timerValue.textContent = shown;
      refs.timer.classList.toggle("is-hidden", timerHidden);
      refs.timer.classList.toggle("is-low", Boolean(status.timed && status.remainingMs <= session.state.alertSeconds * 1000));
      refs.timerCaption.textContent = status.timed ? "" : "elapsed";
      refs.timer.setAttribute("aria-label", timerHidden
        ? "Timer hidden"
        : status.timed
          ? `Time remaining ${spokenClock(status.remainingMs, true)}`
          : `Time elapsed ${spokenClock(status.elapsedMs, false)}`);
      refs.timerToggle.textContent = timerHidden ? "Show" : "Hide";
      refs.timerToggle.setAttribute("aria-label", timerHidden ? "Show timer" : "Hide timer");
    }

    function onTick() {
      if (closed) return;
      const wasFinished = session.state.finished;
      const reading = session.tick();
      if (reading.alertDue) {
        timerHidden = false;
        hideNotice();
        refs.alert.hidden = false;
        announce("5 minutes remaining.", true);
        save();
      }
      if (!wasFinished && session.state.finished) {
        timeUp();
        return;
      }
      updateTimer(reading);
      if (!session.state.finished && now() - lastSave >= SAVE_EVERY_MS) save();
    }

    /* ---- question rendering */
    function currentQuestion() {
      return session.state.questions[session.state.index];
    }

    function stimulusFor(question) {
      if (question.stimulus && question.stimulus.content) {
        return { stimulus: question.stimulus, stem: question.stem };
      }
      if (!isMathSection(question.sectionKey || sectionKey)) {
        const split = Render.splitStemPassage(question.stem);
        if (split.passage) {
          return { stimulus: { type: "passage", content: split.passage }, stem: split.question };
        }
      }
      return { stimulus: null, stem: question.stem };
    }

    function underlineTarget(question) {
      const match = /underlined portion (\d+)|point (\d+)/i.exec(question.stem || "");
      return match ? Number(match[1] || match[2]) : null;
    }

    function buildQuestionHeader(question, index, reviewing) {
      const total = session.state.questions.length;
      const heading = h("h2", {
        className: "lm-qnum",
        tabindex: "-1",
        id: "lm-qnum",
      }, [
        h("span", { className: "lm-sr-only", text: "Question " }),
        h("span", { className: "lm-qnum-box", text: String(index + 1) }),
        h("span", { className: "lm-sr-only", text: ` of ${total}` }),
      ]);
      const bar = h("div", { className: "lm-qbar" }, [heading]);
      refs.markButton = null;
      refs.elimToggle = null;
      if (reviewing) {
        const verdict = verdictOf(session.itemStatus(index));
        bar.appendChild(h("span", { className: `lm-verdict-tag is-${verdict}` }, [
          icon(VERDICT_ICONS[verdict]),
          VERDICT_LABELS[verdict],
        ]));
        if (status.marked) {
          bar.appendChild(h("span", { className: "lm-marked-tag" }, [icon("bookmark"), "Marked"]));
        }
        return bar;
      }
      refs.markButton = h("button", {
        type: "button",
        className: "lm-mark",
        "aria-pressed": "false",
        onClick: () => {
          session.toggleMark();
          save();
          syncQuestion();
          announce(session.state.marked[session.state.index] ? "Marked for review." : "Mark removed.");
        },
      }, [icon("bookmark"), h("span", { text: "Mark for Review" })]);
      bar.appendChild(refs.markButton);
      bar.appendChild(h("span", { className: "lm-spacer" }));
      if (question.responseType === "multiple-choice") {
        refs.elimToggle = h("button", {
          type: "button",
          className: "lm-elim-toggle",
          "aria-pressed": "false",
          "aria-label": "Answer eliminator",
          title: "Answer eliminator: cross out choices",
          onClick: () => {
            session.toggleEliminator();
            save();
            syncQuestion();
          },
        }, [h("span", { className: "lm-elim-abc", "aria-hidden": "true", text: "ABC" })]);
        bar.appendChild(refs.elimToggle);
      } else {
        refs.elimToggle = null;
      }
      return bar;
    }

    function buildChoices(question, index, reviewing) {
      const letters = lettersFor(question, index);
      refs.choiceRows = [];
      const group = h("div", {
        className: "lm-choices",
        role: "group",
        "aria-label": "Answer choices",
      });
      question.choices.forEach((choice, choiceIndex) => {
        const letter = letters[choiceIndex] || String(choiceIndex + 1);
        const text = h("span", { className: "lm-choice-text" }, [Render.renderText(choice, mathOptions(question))]);
        const button = h("button", {
          type: "button",
          className: "lm-choice",
          "aria-pressed": "false",
          dataset: { choice: String(choiceIndex) },
          onClick: () => chooseAnswer(choiceIndex),
        }, [
          h("span", { className: "lm-letter", "aria-hidden": "true", text: letter }),
          h("span", { className: "lm-sr-only", text: `${letter}. ` }),
          text,
        ]);
        const row = h("div", { className: "lm-choice-row", dataset: { choice: String(choiceIndex) } }, [button]);
        let strike = null;
        if (!reviewing) {
          strike = h("button", {
            type: "button",
            className: "lm-strike",
            "aria-pressed": "false",
            onClick: () => {
              session.toggleEliminate(choiceIndex);
              save();
              syncQuestion();
            },
          }, [
            h("span", { className: "lm-strike-letter", "aria-hidden": "true", text: letter }),
            h("span", { className: "lm-strike-undo", "aria-hidden": "true", text: "Undo" }),
          ]);
          row.appendChild(strike);
        } else {
          const correct = choiceIndex === Number(question.correctAnswer);
          const chosen = hasResponse(session.state.responses[index]) &&
            Number(session.state.responses[index]) === choiceIndex;
          if (correct) row.classList.add("is-correct");
          if (chosen) row.classList.add("is-selected");
          if (chosen && !correct) row.classList.add("is-wrong");
          const tags = [];
          if (correct) tags.push(h("span", { className: "lm-choice-tag is-correct", text: "Correct answer" }));
          if (chosen) tags.push(h("span", { className: "lm-choice-tag is-yours", text: "Your answer" }));
          if (tags.length) text.appendChild(h("span", { className: "lm-choice-tags" }, tags));
          button.disabled = true;
          button.setAttribute("aria-pressed", chosen ? "true" : "false");
        }
        refs.choiceRows.push({ row, button, strike, letter });
        group.appendChild(row);
      });
      return group;
    }

    function buildNumeric(question, index, reviewing) {
      const response = session.state.responses[index];
      const wrap = h("div", { className: "lm-spr" });
      if (reviewing) {
        const correct = session.isCorrect(index);
        wrap.append(
          h("dl", { className: "lm-spr-result" }, [
            h("div", {}, [h("dt", { text: "Your answer" }), h("dd", {
              className: hasResponse(response) ? (correct ? "is-correct" : "is-wrong") : "",
              text: hasResponse(response) ? String(response) : "Not answered",
            })]),
            h("div", {}, [h("dt", { text: "Correct answer" }), h("dd", {
              className: "is-correct",
              text: String(question.correctAnswer),
            })]),
          ]),
        );
        return wrap;
      }
      refs.sprInput = h("input", {
        type: "text",
        className: "lm-spr-input",
        id: "lm-spr-input",
        autocomplete: "off",
        autocapitalize: "off",
        autocorrect: "off",
        spellcheck: "false",
        inputmode: "text",
        "aria-describedby": "lm-spr-preview lm-spr-limit",
      });
      refs.sprInput.value = hasResponse(response) ? String(response) : "";
      refs.sprPreview = h("div", { className: "lm-spr-preview", id: "lm-spr-preview" });
      refs.sprLimit = h("p", { className: "lm-spr-limit", id: "lm-spr-limit", "aria-live": "polite" });
      refs.sprInput.addEventListener("input", () => {
        const clean = Engine.sanitizeNumericEntry(refs.sprInput.value);
        if (clean.value !== refs.sprInput.value) {
          refs.sprInput.value = clean.value;
          refs.sprLimit.textContent = clean.value.length >= clean.max
            ? `Answers can be at most ${clean.max} characters${clean.max === 6 ? " with the negative sign" : ""}.`
            : "Only digits, one decimal point, one fraction bar, and a leading minus sign.";
        } else {
          refs.sprLimit.textContent = "";
        }
        session.select(clean.value || null);
        save();
        syncQuestion();
      });
      wrap.append(
        sprRulesPanel(false),
        h("label", { className: "lm-spr-label", for: "lm-spr-input", text: "Your answer" }),
        refs.sprInput,
        refs.sprLimit,
        refs.sprPreview,
      );
      return wrap;
    }

    function renderPreview(value) {
      const info = Engine.describeNumericEntry(value);
      const target = refs.sprPreview;
      if (!target) return;
      const body = h("span", { className: "lm-preview-value" });
      if (info.kind === "empty") body.textContent = "";
      else if (info.kind === "fraction") {
        if (info.sign) body.appendChild(document.createTextNode("−"));
        body.appendChild(frac(info.numerator, info.denominator));
      } else if (info.kind === "number") {
        body.textContent = info.text.replace(/^-/, "−");
      } else {
        body.textContent = info.text.replace(/^-/, "−");
        body.classList.add("is-incomplete");
      }
      target.replaceChildren(
        h("span", { className: "lm-preview-label", text: "Answer preview:" }),
        body,
      );
    }

    function explanationBlock(question, index, full) {
      const parts = [];
      const response = session.state.responses[index];
      const math = mathOptions(question);
      if (question.explanation) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Explanation" }),
          Render.renderText(question.explanation, math),
        ]));
      }
      if (Array.isArray(question.solutionSteps) && question.solutionSteps.length) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Steps" }),
          h("ol", { className: "lm-steps" }, question.solutionSteps.map((step) => mathText("li", question, step))),
        ]));
      }
      const rationales = Array.isArray(question.distractorRationales) ? question.distractorRationales : [];
      const chosen = question.responseType === "multiple-choice" && hasResponse(response)
        ? Number(response)
        : null;
      if (full && rationales.length) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Why the other choices are wrong" }),
          h("ul", { className: "lm-rationales" }, rationales.slice()
            .sort((a, b) => a.index - b.index)
            .map((item) => h("li", { className: item.index === chosen ? "is-yours" : "" }, [
              h("strong", { text: `${letterOf(question, index, item.index)}${item.index === chosen ? " (your answer)" : ""}: ` }),
              mathText("span", question, item.reason),
            ]))),
        ]));
      } else if (chosen !== null && chosen !== Number(question.correctAnswer)) {
        const rationale = rationales.find((item) => item.index === chosen);
        if (rationale) {
          parts.push(h("section", { className: "lm-exp-section" }, [
            h("h3", { text: `Why ${letterOf(question, index, chosen)} is wrong` }),
            mathText("p", question, rationale.reason),
          ]));
        }
      }
      if (full && question.trap) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Common trap" }),
          mathText("p", question, question.trap),
        ]));
      }
      if (full && question.strategy) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Approach" }),
          mathText("p", question, question.strategy),
        ]));
      }
      const learn = learnLink(question);
      if (learn) parts.push(learn);
      return h("div", { className: "lm-explanation" }, parts);
    }

    // "Learn: <skill> — <subskill>", opening the skill's Learn page in a new
    // tab so the set stays open.
    function learnLink(question) {
      const href = learnHref ? call("learnHref", question) : null;
      if (!href || !question.skill) return null;
      const label = question.subskill ? `${question.skill} — ${question.subskill}` : question.skill;
      return h("p", { className: "lm-learn" }, [
        h("a", {
          className: "lm-learn-link",
          href,
          target: "_blank",
          rel: "noopener",
        }, [`Learn: ${label}`, h("span", { className: "lm-sr-only", text: " (opens in a new tab)" })]),
      ]);
    }

    // A correct answer reached after a hint is shown apart and never
    // called plainly correct: it is not counted as correct here or in
    // Progress.
    function verdictOf(status) {
      if (!status.answered) return "omitted";
      if (!status.correct) return "incorrect";
      return status.hinted ? "hinted" : "correct";
    }

    function verdictBanner(question, index) {
      const kind = verdictOf(session.itemStatus(index));
      const answer = correctLabel(question, index);
      const text = kind === "correct"
        ? "Correct."
        : kind === "hinted"
          ? "Correct, with a hint — not counted as correct."
          : kind === "incorrect"
            ? `Incorrect. The correct answer is ${answer}.`
            : `Not answered. The correct answer is ${answer}.`;
      return {
        kind,
        text,
        node: h("div", { className: `lm-verdict is-${kind}` }, [
          icon(VERDICT_ICONS[kind]),
          h("p", { text }),
        ]),
      };
    }

    function buildInstantArea(question, index) {
      refs.hintBox = h("div", { className: "lm-hint", hidden: true, tabindex: "-1" }, [
        h("h3", { text: "Hint" }),
        mathText("p", question, question.hint || "No hint for this question."),
      ]);
      refs.hintButton = h("button", {
        type: "button",
        className: "lm-btn lm-btn-secondary lm-hint-btn",
        "aria-expanded": "false",
        onClick: () => {
          session.useHint();
          save();
          syncQuestion();
          if (refs.hintBox && !refs.hintBox.hidden) announce(question.hint || "No hint for this question.");
          // The Hint button hides once used: keep focus on the question.
          if (refs.checkButton && !refs.checkButton.disabled && !refs.checkButton.hidden) {
            refs.checkButton.focus();
          } else if (refs.hintBox) {
            refs.hintBox.focus();
          }
        },
      }, [icon("bulb"), "Hint"]);
      refs.checkButton = h("button", {
        type: "button",
        className: "lm-btn lm-btn-primary lm-check-btn",
        text: "Check answer",
        onClick: () => {
          if (!hasResponse(session.state.responses[session.state.index])) return;
          session.check();
          const item = session.state.index;
          const verdict = verdictBanner(question, item);
          save();
          call("onAnswer", {
            index: item,
            question,
            response: session.state.responses[item],
            correct: session.isCorrect(item),
            hinted: session.state.hinted[item],
            timeMs: session.state.timeMs[item],
          });
          syncQuestion();
          announce(verdict.text);
          if (refs.feedback) refs.feedback.scrollIntoView({ block: "nearest", behavior: "smooth" });
          // The Check button is gone now; the next step is the next question.
          refs.nextButton.focus({ preventScroll: true });
        },
      });
      refs.feedback = h("div", { className: "lm-feedback" });
      return h("div", { className: "lm-instant" }, [
        refs.hintBox,
        h("div", { className: "lm-instant-actions" }, [refs.hintButton, refs.checkButton]),
        refs.feedback,
      ]);
    }

    // In a mixed set, the first question of each section says where the
    // section starts and which tools it has.
    function sectionBoundary(index) {
      if (!mixed || view !== "question") return null;
      const questions = session.state.questions;
      const current = questions[index];
      if (index > 0 && questions[index - 1].sectionKey === current.sectionKey) return null;
      let last = index;
      while (last + 1 < questions.length && questions[last + 1].sectionKey === current.sectionKey) last += 1;
      const name = current.section || current.sectionKey;
      const toolsText = toolAvailable("calculator")
        ? toolAvailable("reference")
          ? " The calculator and the reference sheet are available."
          : " The calculator is available."
        : " No calculator in this section.";
      return h("div", { className: "lm-notice lm-section-start", role: "note" }, [
        h("p", { text: `${name} section: questions ${index + 1}–${last + 1}.${toolsText}` }),
      ]);
    }

    function taxonomyLine(question) {
      return h("p", { className: "lm-taxonomy" }, [
        [question.domain, question.skill, question.difficulty].filter(Boolean).join(" · "),
      ]);
    }

    function renderQuestionView(reviewing) {
      const index = session.state.index;
      const question = currentQuestion();
      const math = isMathSection(question.sectionKey || sectionKey);
      const parts = stimulusFor(question);
      const underlines = question.sectionKey === "act-english";
      const stimulusNode = parts.stimulus
        ? Render.renderStimulus(parts.stimulus, Object.assign({ underlines }, mathOptions(question)))
        : null;
      const figureNode = question.figure ? Render.renderFigure(question.figure) : null;
      const header = buildQuestionHeader(question, index, reviewing);
      const stem = h("div", { className: "lm-stem", id: "lm-stem" }, [Render.renderText(parts.stem, mathOptions(question))]);
      const answer = question.responseType === "multiple-choice" && Array.isArray(question.choices)
        ? buildChoices(question, index, reviewing)
        : buildNumeric(question, index, reviewing);
      if (question.responseType !== "multiple-choice") refs.choiceRows = [];
      if (question.responseType === "multiple-choice" || reviewing) {
        refs.sprInput = null;
        refs.sprPreview = null;
      }

      const questionPane = h("div", { className: "lm-question-pane" }, [header]);
      const boundary = sectionBoundary(index);
      if (boundary) questionPane.appendChild(boundary);
      if (reviewing) questionPane.appendChild(taxonomyLine(question));
      const split = !math && (stimulusNode || figureNode);
      if (!split) {
        if (figureNode) questionPane.appendChild(figureNode);
        if (stimulusNode) questionPane.appendChild(stimulusNode);
      }
      questionPane.append(stem, answer);
      refs.hintBox = null;
      refs.hintButton = null;
      refs.checkButton = null;
      refs.feedback = null;
      if (reviewing) {
        questionPane.appendChild(verdictBanner(question, index).node);
        questionPane.appendChild(explanationBlock(question, index, true));
      } else if (session.state.feedback === "instant") {
        questionPane.appendChild(buildInstantArea(question, index));
      }

      const stimulusKey = parts.stimulus ? parts.stimulus.content : null;
      const previousPane = refs.main.querySelector(".lm-stimulus-pane");
      const keepScroll = previousPane && stimulusKey && stimulusKey === lastStimulusKey
        ? previousPane.scrollTop
        : 0;
      lastStimulusKey = stimulusKey;

      let layout;
      let stimulusPane = null;
      if (split) {
        stimulusPane = h("div", {
          className: "lm-stimulus-pane",
          role: "region",
          "aria-label": "Passage",
          tabindex: "0",
          onScroll: onPaneScroll,
        }, [figureNode, stimulusNode]);
        layout = h("div", { className: "lm-split" }, [
          stimulusPane,
          h("div", { className: "lm-divider", "aria-hidden": "true" }),
          h("div", { className: "lm-question-scroll" }, [questionPane]),
        ]);
        refs.main.replaceChildren(layout);
        stimulusPane.scrollTop = keepScroll;
      } else {
        layout = h("div", { className: "lm-single" }, [questionPane]);
        refs.main.replaceChildren(layout);
      }
      refs.main.scrollTop = 0;
      shell.dataset.layout = split ? "split" : "single";
      // The passage the tools act on: the stimulus text of a question on
      // screen, never the answer review.
      const tooled = !reviewing && Boolean(stimulusNode) && Boolean(passageKeys[index]);
      refs.passageText = tooled ? stimulusNode : null;
      refs.readerPane = tooled ? stimulusPane : null;

      if (underlines) {
        const target = underlineTarget(question);
        const node = target !== null
          ? refs.main.querySelector(`.lm-ul[data-n="${target}"], .lm-ul-marker[data-n="${target}"]`)
          : null;
        if (node) {
          node.classList.add("is-active");
          const pane = node.closest(".lm-stimulus-pane");
          if (pane && pane.scrollHeight > pane.clientHeight) {
            const offset = node.getBoundingClientRect().top - pane.getBoundingClientRect().top;
            pane.scrollTop = Math.max(0, pane.scrollTop + offset - pane.clientHeight / 3);
          }
        }
      }
      paintHighlights();
      layoutReader();
      observeReader();
      syncQuestion();
    }

    // Updates the mutable parts of the current question in place, so
    // selecting, striking, or typing never rebuilds the screen.
    function syncQuestion() {
      if (view !== "question") {
        updateBottom();
        return;
      }
      const state = session.state;
      const index = state.index;
      const question = currentQuestion();
      const lockedNow = session.isLocked();
      const checked = state.feedback === "instant" && state.checked[index];
      const response = state.responses[index];
      shell.classList.toggle("is-eliminating", Boolean(state.eliminatorOn) && !lockedNow);
      if (refs.markButton) {
        refs.markButton.setAttribute("aria-pressed", state.marked[index] ? "true" : "false");
        refs.markButton.classList.toggle("is-on", state.marked[index]);
      }
      if (refs.elimToggle) {
        refs.elimToggle.setAttribute("aria-pressed", state.eliminatorOn ? "true" : "false");
        refs.elimToggle.classList.toggle("is-on", state.eliminatorOn);
        refs.elimToggle.disabled = lockedNow;
      }
      (refs.choiceRows || []).forEach((entry, choiceIndex) => {
        const selected = hasResponse(response) && Number(response) === choiceIndex;
        const struck = state.eliminated[index].includes(choiceIndex);
        entry.row.classList.toggle("is-selected", selected);
        entry.row.classList.toggle("is-struck", struck);
        entry.button.setAttribute("aria-pressed", selected ? "true" : "false");
        entry.button.disabled = lockedNow;
        entry.row.dataset.struck = struck ? "true" : "false";
        if (entry.strike) {
          entry.strike.hidden = !state.eliminatorOn || lockedNow;
          entry.strike.setAttribute("aria-pressed", struck ? "true" : "false");
          entry.strike.setAttribute("aria-label", struck
            ? `Undo cross out of choice ${entry.letter}`
            : `Cross out choice ${entry.letter}`);
        }
        const srStruck = entry.button.querySelector(".lm-sr-struck");
        if (struck && !srStruck) {
          entry.button.appendChild(h("span", { className: "lm-sr-only lm-sr-struck", text: " (crossed out)" }));
        } else if (!struck && srStruck) {
          srStruck.remove();
        }
        if (checked) {
          const correct = choiceIndex === Number(question.correctAnswer);
          entry.row.classList.toggle("is-correct", correct);
          entry.row.classList.toggle("is-wrong", selected && !correct);
        } else {
          entry.row.classList.remove("is-correct", "is-wrong");
        }
      });
      if (refs.sprInput) {
        refs.sprInput.disabled = lockedNow;
        refs.sprInput.classList.toggle("is-correct", checked && session.isCorrect(index));
        refs.sprInput.classList.toggle("is-wrong", checked && !session.isCorrect(index));
        renderPreview(refs.sprInput.value);
      }
      if (refs.checkButton) {
        const info = question.responseType === "multiple-choice"
          ? null
          : Engine.describeNumericEntry(hasResponse(response) ? String(response) : "");
        const ready = hasResponse(response) &&
          (!info || info.kind === "number" || info.kind === "fraction");
        refs.checkButton.disabled = checked || !ready;
        refs.checkButton.hidden = checked;
        refs.hintButton.hidden = checked || state.hinted[index];
        refs.hintButton.setAttribute("aria-expanded", state.hinted[index] ? "true" : "false");
        refs.hintBox.hidden = !state.hinted[index];
        if (checked && !refs.feedback.childNodes.length) {
          const verdict = verdictBanner(question, index);
          refs.feedback.append(verdict.node, explanationBlock(question, index, false));
        } else if (!checked) {
          refs.feedback.replaceChildren();
        }
      }
      updateBottom();
      if (openPanel === "nav") renderNavigator();
    }

    function chooseAnswer(choiceIndex) {
      if (view !== "question" || session.isLocked()) return;
      const question = currentQuestion();
      if (question.responseType !== "multiple-choice") return;
      session.select(choiceIndex);
      save();
      syncQuestion();
    }

    /* ---- passage tools: Annotate (highlights and notes), line reader */

    // The passage text a question shows, or null (Math, or no passage).
    function passageTextOf(question) {
      if (isMathSection(question.sectionKey || sectionKey)) return null;
      const stimulus = stimulusFor(question).stimulus;
      return stimulus && stimulus.content ? String(stimulus.content) : null;
    }

    function currentPassageKey() {
      return passageKeys[session.state.index] || null;
    }

    function passageRoot() {
      return refs.passageText && refs.passageText.isConnected ? refs.passageText : null;
    }

    function markSelector(start) {
      return `mark.lm-hl[data-start="${Number(start)}"]`;
    }

    // A boundary point as an offset into the passage's text.
    function textOffset(rootNode, node, offset) {
      const range = document.createRange();
      range.setStart(rootNode, 0);
      range.setEnd(node, offset);
      return range.toString().length;
    }

    // The part of the selection inside the passage, as offsets trimmed of
    // white space; null when no passage text is selected.
    function selectionRange() {
      const rootNode = passageRoot();
      const selection = Annotations && document.getSelection ? document.getSelection() : null;
      if (!rootNode || !selection || !selection.rangeCount || selection.isCollapsed) return null;
      const range = selection.getRangeAt(0);
      if (!range.intersectsNode(rootNode)) return null;
      const all = document.createRange();
      all.selectNodeContents(rootNode);
      const text = rootNode.textContent;
      const start = range.compareBoundaryPoints(root.Range.START_TO_START, all) <= 0
        ? 0
        : textOffset(rootNode, range.startContainer, range.startOffset);
      const end = range.compareBoundaryPoints(root.Range.END_TO_END, all) >= 0
        ? text.length
        : textOffset(rootNode, range.endContainer, range.endOffset);
      return Annotations.trimRange(text, start, end);
    }

    function clearSelection() {
      const selection = document.getSelection ? document.getSelection() : null;
      if (selection && selection.removeAllRanges) selection.removeAllRanges();
    }

    // A tap on the Annotate button can clear the selection before its
    // click arrives, so the selection is taken as the press begins.
    function armSelection(event) {
      armed = { range: selectionRange(), pointer: (event && event.pointerType) || "mouse", at: Date.now() };
    }

    // Annotate highlights the selection and opens its note; with nothing
    // selected it opens the list of highlights, or closes it when open.
    function onAnnotate() {
      const pressed = armed && Date.now() - armed.at < 5000 ? armed : null;
      armed = null;
      const range = (pressed && pressed.range) || selectionRange();
      if (!range && openPanel === "notes") {
        closePanel(true);
        return;
      }
      annotate(range, !pressed || pressed.pointer !== "touch");
    }

    function annotate(range, focusNote) {
      const key = currentPassageKey();
      if (!Annotations || !key || !toolAvailable("annotate")) return;
      if (!range) {
        openNotes(noteTarget ? noteTarget.start : null, { focus: "panel" });
        announce("Select text in the passage first, then choose Annotate.");
        return;
      }
      const before = Annotations.list(annotations, key);
      const result = Annotations.add(annotations, key, range);
      if (!result.highlight) {
        openNotes(null, { focus: "panel" });
        announce("This passage has as many highlights as it can hold. Delete one to add another.");
        return;
      }
      const existed = before.some((item) => item.start === result.highlight.start &&
        item.end === result.highlight.end);
      annotations = result.store;
      clearSelection();
      save();
      openNotes(result.highlight.start, { focus: focusNote ? "note" : "panel" });
      announce(existed ? "Highlight selected." : "Text highlighted. You can add a note.");
    }

    // Draws the passage's highlights as <mark> elements around its text,
    // after removing the old ones; the text itself never changes.
    function paintHighlights() {
      const rootNode = passageRoot();
      if (!rootNode || !Annotations) return;
      const old = rootNode.querySelectorAll("mark.lm-hl");
      if (old.length) {
        old.forEach((mark) => mark.replaceWith(...mark.childNodes));
        rootNode.normalize();
      }
      const text = rootNode.textContent;
      const list = Annotations.clampToLength(Annotations.list(annotations, currentPassageKey()), text.length);
      if (!list.length) return;
      const walker = document.createTreeWalker(rootNode, root.NodeFilter.SHOW_TEXT);
      const nodes = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node);
      let at = 0;
      nodes.forEach((node) => {
        const from = at;
        at += node.data.length;
        const parts = Annotations.pieces(from, at, list);
        if (!parts.some((part) => part.highlight !== null)) return;
        const fragment = document.createDocumentFragment();
        parts.forEach((part) => {
          const piece = document.createTextNode(node.data.slice(part.start - from, part.end - from));
          if (part.highlight === null) {
            fragment.appendChild(piece);
            return;
          }
          const item = list[part.highlight];
          const current = Boolean(noteTarget) && noteTarget.start === item.start;
          const mark = h("mark", {
            className: `lm-hl${Annotations.hasNote(item) ? " has-note" : ""}${current ? " is-current" : ""}`,
            dataset: { start: String(item.start) },
          });
          mark.appendChild(piece);
          fragment.appendChild(mark);
        });
        node.parentNode.replaceChild(fragment, node);
      });
    }

    // The highlighted words, with a space where the highlight crosses from
    // one paragraph or cell to the next, and without ACT question numbers.
    function excerptOf(item) {
      const rootNode = passageRoot();
      if (!rootNode) return "";
      let text = "";
      let block = null;
      rootNode.querySelectorAll(markSelector(item.start)).forEach((mark) => {
        if (mark.closest(".lm-ul-n, .lm-ul-marker")) return;
        const owner = mark.closest("p, li, td, th, h3");
        if (text && owner !== block) text += " ";
        block = owner;
        text += mark.textContent;
      });
      if (!text) text = rootNode.textContent.slice(item.start, item.end);
      text = text.replace(/\s+/g, " ").trim();
      return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
    }

    // Opens the notes panel on one highlight (by its start), or on the list
    // when start is null. settings.focus: "note" (the note field), "panel"
    // (its heading), or "none".
    function openNotes(start, settings) {
      const key = currentPassageKey();
      if (!Annotations || !key) return;
      const focus = (settings && settings.focus) || "panel";
      noteTarget = start === null || start === undefined ? null : { key, start: Number(start) };
      if (openPanel !== "notes") openPanelNamed("notes");
      paintHighlights();
      renderNotes();
      if (focus === "note" && refs.noteInput) {
        refs.noteInput.focus({ preventScroll: true });
      } else if (focus !== "none") {
        const heading = refs.notes.querySelector(".lm-panel-title");
        if (heading) heading.focus({ preventScroll: true });
      }
    }

    function renderNotes() {
      const key = currentPassageKey();
      const list = Annotations.list(annotations, key);
      const target = noteTarget ? Annotations.findHighlight(list, noteTarget.start) : null;
      if (!target) noteTarget = null;
      refs.noteInput = null;
      const children = [
        h("div", { className: "lm-panel-head" }, [
          h("h2", { className: "lm-panel-title", tabindex: "-1", text: "Highlights and notes" }),
          h("button", {
            type: "button",
            className: "lm-icon-btn",
            "aria-label": "Close highlights and notes",
            onClick: () => closePanel(true),
          }, [icon("close")]),
        ]),
      ];
      if (target) {
        const start = target.start;
        refs.noteInput = h("textarea", {
          id: "lm-note-input",
          className: "lm-note-input",
          rows: "3",
          maxlength: String(Annotations.MAX_NOTE_LENGTH),
          "aria-describedby": "lm-note-quote",
        });
        refs.noteInput.value = target.note;
        refs.noteInput.addEventListener("input", () => {
          annotations = Annotations.note(annotations, key, start, refs.noteInput.value);
          syncNote(start);
          save();
        });
        children.push(h("div", { className: "lm-note-editor" }, [
          h("p", { className: "lm-note-quote", id: "lm-note-quote" }, [
            h("span", { className: "lm-sr-only", text: "Highlighted text: " }),
            `“${excerptOf(target)}”`,
          ]),
          h("label", { className: "lm-note-label", for: "lm-note-input", text: "Note" }),
          refs.noteInput,
          h("div", { className: "lm-note-actions" }, [
            h("button", {
              type: "button",
              className: "lm-btn lm-btn-secondary lm-btn-danger",
              text: "Delete highlight",
              onClick: () => deleteHighlight(start),
            }),
            h("button", {
              type: "button",
              className: "lm-btn lm-btn-primary",
              text: "Done",
              onClick: () => closePanel(true),
            }),
          ]),
        ]));
      } else {
        children.push(h("p", {
          className: "lm-note-hint",
          text: "Select text in the passage, then choose Annotate to highlight it. Select a highlight to add or change its note.",
        }));
      }
      if (list.length) {
        children.push(h("h3", { className: "lm-note-list-title", text: `In this passage (${list.length})` }));
        children.push(h("ul", { className: "lm-note-list" }, list.map((item) => {
          const current = Boolean(target) && target.start === item.start;
          return h("li", {}, [h("button", {
            type: "button",
            className: `lm-note-item${current ? " is-current" : ""}`,
            "aria-current": current ? "true" : null,
            dataset: { start: String(item.start) },
            onClick: () => {
              openNotes(item.start, { focus: "note" });
              revealHighlight(item.start);
            },
          }, [
            h("span", { className: "lm-note-item-quote", text: excerptOf(item) }),
            h("span", { className: "lm-sr-only", text: ". " }),
            h("span", {
              className: "lm-note-item-note",
              text: Annotations.hasNote(item) ? item.note : "No note",
            }),
          ])]);
        })));
      }
      refs.notes.replaceChildren(...children);
    }

    // After typing: the note's dashed underline and its line in the list.
    function syncNote(start) {
      const item = Annotations.findHighlight(Annotations.list(annotations, currentPassageKey()), start);
      const noted = Annotations.hasNote(item);
      const rootNode = passageRoot();
      if (rootNode) {
        rootNode.querySelectorAll(markSelector(start)).forEach((mark) => mark.classList.toggle("has-note", noted));
      }
      const preview = refs.notes.querySelector(`.lm-note-item[data-start="${Number(start)}"] .lm-note-item-note`);
      if (preview) preview.textContent = noted ? item.note : "No note";
    }

    function deleteHighlight(start) {
      annotations = Annotations.remove(annotations, currentPassageKey(), start);
      noteTarget = null;
      save();
      paintHighlights();
      renderNotes();
      const next = refs.notes.querySelector(".lm-note-item") || refs.notes.querySelector(".lm-panel-title");
      if (next) next.focus({ preventScroll: true });
      announce("Highlight deleted.");
    }

    // Brings a highlight into view, moving the line reader onto it when on.
    function revealHighlight(start) {
      const rootNode = passageRoot();
      const mark = rootNode && rootNode.querySelector(markSelector(start));
      if (!mark) return;
      if (readerShown()) {
        const offset = paneOffset();
        placeReader(LineReader.lineAt(readerLines, mark.getBoundingClientRect().top - offset + 2), { reveal: true });
      } else {
        mark.scrollIntoView({ block: "nearest" });
      }
    }

    function readerShown() {
      return Boolean(LineReader) && readerPrefs.on && toolAvailable("lineReader") &&
        Boolean(refs.readerPane) && refs.readerPane.isConnected;
    }

    // Subtracted from a viewport y to give a y in the passage pane's own
    // (scrolling) coordinates, where the band is placed.
    function paneOffset() {
      const pane = refs.readerPane;
      return pane.getBoundingClientRect().top + pane.clientTop - pane.scrollTop;
    }

    // The pane's line boxes: its text line by line, and each figure whole.
    function measureReaderLines() {
      const pane = refs.readerPane;
      const offset = paneOffset();
      const rects = [];
      const range = document.createRange();
      const walker = document.createTreeWalker(pane, root.NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.data.trim() || node.parentNode.closest("svg, .lm-reader-controls")) continue;
        range.selectNodeContents(node);
        Array.from(range.getClientRects()).forEach((rect) => {
          rects.push({ top: rect.top - offset, bottom: rect.bottom - offset });
        });
      }
      pane.querySelectorAll(".lm-figure").forEach((figure) => {
        const rect = figure.getBoundingClientRect();
        rects.push({ top: rect.top - offset, bottom: rect.bottom - offset });
      });
      readerLines = LineReader.groupLines(rects);
    }

    // Shows or hides the line reader for the question on screen, measuring
    // the passage again; the band returns to where it was on this passage.
    function layoutReader() {
      if (refs.readerButton) refs.readerButton.setAttribute("aria-pressed", readerPrefs.on ? "true" : "false");
      if (!readerShown()) {
        refs.readerBand.remove();
        refs.readerControls.remove();
        return;
      }
      const pane = refs.readerPane;
      if (refs.readerBand.parentNode !== pane) pane.append(refs.readerBand, refs.readerControls);
      measureReaderLines();
      const key = currentPassageKey();
      const start = readerAt.has(key) ? readerAt.get(key) : 0;
      placeReader(LineReader.fitInView(readerLines, start, readerPrefs.lines,
        pane.scrollTop, pane.scrollTop + pane.clientHeight));
    }

    function placeReader(index, settings) {
      const box = LineReader.band(readerLines, index, readerPrefs.lines, READER_PAD);
      refs.readerBand.hidden = !box;
      refs.readerControls.hidden = !box;
      if (!box) return;
      readerIndex = box.index;
      readerAt.set(currentPassageKey(), box.index);
      refs.readerBand.style.top = `${box.top}px`;
      refs.readerBand.style.height = `${Math.max(0, box.bottom - box.top)}px`;
      const total = readerLines.length;
      refs.readerGrip.setAttribute("aria-valuemin", "1");
      refs.readerGrip.setAttribute("aria-valuemax", String(Math.max(1, total - Math.min(box.size, total) + 1)));
      refs.readerGrip.setAttribute("aria-valuenow", String(box.first + 1));
      refs.readerGrip.setAttribute("aria-valuetext", box.first === box.last
        ? `Line ${box.first + 1} of ${total}`
        : `Lines ${box.first + 1} to ${box.last + 1} of ${total}`);
      refs.readerFewer.setAttribute("aria-disabled", readerPrefs.lines <= LineReader.MIN_LINES ? "true" : "false");
      refs.readerMore.setAttribute("aria-disabled", readerPrefs.lines >= LineReader.MAX_LINES ? "true" : "false");
      if (settings && settings.reveal) refs.readerBand.scrollIntoView({ block: "nearest" });
      placeReaderControls(box);
    }

    // The handle sits just under the band, or over it when there is no room
    // below, and inside it when there is room on neither side.
    function placeReaderControls(box) {
      const pane = refs.readerPane;
      const height = refs.readerControls.offsetHeight || 44;
      const viewTop = pane.scrollTop;
      const viewBottom = viewTop + pane.clientHeight;
      let top = box.bottom + 6;
      if (top + height > viewBottom) {
        if (box.top - 6 - height >= viewTop) top = box.top - 6 - height;
        else top = Math.max(viewTop + 4, Math.min(box.top + 4, viewBottom - height - 4));
      }
      refs.readerControls.style.top = `${Math.max(0, top)}px`;
    }

    // Scrolling the passage keeps the band on screen.
    function onPaneScroll() {
      if (readerFrame !== null || readerDrag || !readerShown()) return;
      readerFrame = root.requestAnimationFrame(() => {
        readerFrame = null;
        if (!readerShown()) return;
        const pane = refs.readerPane;
        const next = LineReader.fitInView(readerLines, readerIndex, readerPrefs.lines,
          pane.scrollTop, pane.scrollTop + pane.clientHeight);
        if (next !== readerIndex) placeReader(next);
        else {
          const box = LineReader.band(readerLines, readerIndex, readerPrefs.lines, READER_PAD);
          if (box) placeReaderControls(box);
        }
      });
    }

    function observeReader() {
      if (!readerObserver) return;
      readerObserver.disconnect();
      if (!refs.readerPane) return;
      readerObserver.observe(refs.readerPane);
      if (refs.passageText) readerObserver.observe(refs.passageText);
    }

    function toggleReader() {
      if (!LineReader || !toolAvailable("lineReader")) return;
      readerPrefs = { on: !readerPrefs.on, lines: readerPrefs.lines };
      layoutReader();
      save();
      if (!readerPrefs.on) {
        announce("Line reader off.");
        return;
      }
      const count = readerPrefs.lines;
      announce(`Line reader on, showing ${count} line${count === 1 ? "" : "s"}. ` +
        "Use the arrow keys on its handle to move it, and minus or plus for fewer or more lines.");
      if (readerShown()) refs.readerGrip.focus({ preventScroll: true });
    }

    function resizeReader(delta) {
      if (!LineReader) return;
      const count = LineReader.clampSize(readerPrefs.lines + delta);
      if (count === readerPrefs.lines) {
        announce(count === LineReader.MIN_LINES
          ? "The line reader already shows the fewest lines."
          : "The line reader already shows the most lines.");
        return;
      }
      readerPrefs = { on: readerPrefs.on, lines: count };
      if (readerShown()) placeReader(readerIndex, { reveal: true });
      save();
      announce(`Line reader shows ${count} line${count === 1 ? "" : "s"}.`);
    }

    // The handle is a vertical slider: arrows move a line, Page Up and Page
    // Down a band, Home and End to the ends; minus and plus resize.
    function onReaderKey(event) {
      if (!readerShown() || event.ctrlKey || event.metaKey || event.altKey) return;
      const size = readerPrefs.lines;
      const count = readerLines.length;
      let target;
      switch (event.key) {
        case "ArrowUp":
        case "ArrowLeft":
          target = readerIndex - 1;
          break;
        case "ArrowDown":
        case "ArrowRight":
          target = readerIndex + 1;
          break;
        case "PageUp":
          target = readerIndex - size;
          break;
        case "PageDown":
          target = readerIndex + size;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = count;
          break;
        case "+":
        case "=":
          event.preventDefault();
          resizeReader(1);
          return;
        case "-":
        case "_":
          event.preventDefault();
          resizeReader(-1);
          return;
        default:
          return;
      }
      event.preventDefault();
      placeReader(LineReader.clampIndex(target, count, size), { reveal: true });
    }

    function onReaderGripDown(event) {
      if (!readerShown() || (typeof event.button === "number" && event.button !== 0)) return;
      const box = LineReader.band(readerLines, readerIndex, readerPrefs.lines, READER_PAD);
      if (!box) return;
      event.preventDefault();
      refs.readerGrip.focus({ preventScroll: true });
      readerDrag = { id: event.pointerId, offset: event.clientY - paneOffset() - box.top };
      try {
        refs.readerGrip.setPointerCapture(event.pointerId);
      } catch (error) {
        // Capture is a nicety: the drag still follows moves over the handle.
      }
    }

    function onReaderGripMove(event) {
      if (!readerDrag || event.pointerId !== readerDrag.id || !readerShown()) return;
      event.preventDefault();
      const pane = refs.readerPane;
      const frame = pane.getBoundingClientRect();
      if (event.clientY > frame.bottom - 24) pane.scrollTop += 16;
      else if (event.clientY < frame.top + 24) pane.scrollTop -= 16;
      const top = event.clientY - paneOffset() - readerDrag.offset;
      placeReader(LineReader.lineAt(readerLines, top + READER_PAD + 1));
    }

    function onReaderGripUp(event) {
      if (!readerDrag || event.pointerId !== readerDrag.id) return;
      readerDrag = null;
    }

    // In the passage: a tap on dimmed lines moves the line reader there; a
    // tap on a highlight opens its note. Selecting text does neither.
    function onMainClick(event) {
      if (view !== "question" || !event.target || !event.target.closest) return;
      const selection = document.getSelection ? document.getSelection() : null;
      if (selection && !selection.isCollapsed) return;
      if (readerShown() && refs.readerPane.contains(event.target) &&
          !refs.readerControls.contains(event.target)) {
        const y = event.clientY - paneOffset();
        const box = LineReader.band(readerLines, readerIndex, readerPrefs.lines, READER_PAD);
        if (box && (y < box.top || y > box.bottom)) {
          placeReader(LineReader.lineAt(readerLines, y) - Math.floor((readerPrefs.lines - 1) / 2));
          return;
        }
      }
      const mark = event.target.closest("mark.lm-hl");
      const rootNode = passageRoot();
      if (!mark || !rootNode || !rootNode.contains(mark)) return;
      openNotes(Number(mark.dataset.start), { focus: lastPointerType === "touch" ? "panel" : "note" });
    }

    /* ---- navigator and review page */
    function cellFor(status, onPick, big) {
      const reviewing = view === "answers";
      const flags = [];
      let state;
      const hintedRight = status.correct === true && status.hinted;
      if (reviewing) {
        const verdict = verdictOf(status);
        state = verdict === "omitted" ? "unanswered" : verdict;
        flags.push(VERDICT_LABELS[verdict].toLowerCase());
      } else {
        state = status.answered ? "answered" : "unanswered";
        flags.push(state);
        if (hintedRight) flags.push("checked correct after a hint, not counted");
        else if (status.correct === true) flags.push("checked correct");
        if (status.correct === false && status.checked) flags.push("checked incorrect");
      }
      if (status.marked) flags.push("marked for review");
      const current = status.current && (view === "question" || view === "answers");
      if (current) flags.push("current question");
      const cell = h("button", {
        type: "button",
        className: [
          "lm-cell",
          `is-${state}`,
          status.marked ? "is-marked" : "",
          current ? "is-current" : "",
          big ? "is-big" : "",
          !reviewing && status.checked
            ? (hintedRight ? "is-checked-hinted" : status.correct ? "is-checked-correct" : "is-checked-wrong")
            : "",
        ].filter(Boolean).join(" "),
        "aria-label": `Question ${status.number}, ${flags.join(", ")}`,
        "aria-current": current ? "true" : null,
        onClick: () => onPick(status.index),
      }, [
        current ? icon("pin", "lm-cell-pin") : null,
        h("span", { className: "lm-cell-num", text: String(status.number) }),
        status.marked ? icon("bookmark", "lm-cell-flag") : null,
      ]);
      return cell;
    }

    function legend() {
      const anyHinted = session.state.hinted.some(Boolean);
      const items = view === "answers"
        ? [
          ["lm-legend-current", icon("pin"), "Current"],
          ["lm-legend-correct", h("span", { className: "lm-swatch is-correct" }), "Correct"],
          anyHinted ? ["lm-legend-hinted", h("span", { className: "lm-swatch is-hinted" }), "Right after a hint"] : null,
          ["lm-legend-incorrect", h("span", { className: "lm-swatch is-incorrect" }), "Incorrect"],
          ["lm-legend-unanswered", h("span", { className: "lm-swatch is-unanswered" }), "Not answered"],
          ["lm-legend-marked", icon("bookmark", "lm-flag-icon"), "Marked"],
        ]
        : [
          view === "question" ? ["lm-legend-current", icon("pin"), "Current"] : null,
          ["lm-legend-unanswered", h("span", { className: "lm-swatch is-unanswered" }), "Unanswered"],
          ["lm-legend-marked", icon("bookmark", "lm-flag-icon"), "For Review"],
        ];
      return h("ul", { className: "lm-legend" }, items.filter(Boolean).map(([className, glyph, text]) =>
        h("li", { className }, [glyph, h("span", { text })])));
    }

    function renderNavigator() {
      const statuses = session.statuses();
      const grid = h("div", { className: "lm-grid" }, statuses.map((status) =>
        cellFor(status, (index) => navigate(index))));
      const children = [
        h("div", { className: "lm-panel-head" }, [
          h("h2", { className: "lm-panel-title", text: `${title}: Questions` }),
          h("button", {
            type: "button",
            className: "lm-icon-btn",
            "aria-label": "Close question navigator",
            onClick: () => closePanel(true),
          }, [icon("close")]),
        ]),
        legend(),
        grid,
      ];
      if (view === "question") {
        children.push(h("button", {
          type: "button",
          className: "lm-btn lm-btn-outline lm-go-review",
          text: "Go to Review Page",
          onClick: () => showView("review"),
        }));
      } else if (view === "answers") {
        children.push(h("button", {
          type: "button",
          className: "lm-btn lm-btn-outline lm-go-review",
          text: "Back to report",
          onClick: () => showView("report"),
        }));
      }
      const focused = refs.navigator.contains(document.activeElement)
        ? document.activeElement.getAttribute("aria-label")
        : null;
      refs.navigator.replaceChildren(...children);
      if (focused) {
        const again = [...refs.navigator.querySelectorAll("button")]
          .find((button) => button.getAttribute("aria-label") === focused);
        if (again) again.focus();
      }
    }

    function renderReviewView() {
      const counts = session.counts();
      const statuses = session.statuses();
      const heading = h("h2", { className: "lm-page-title", tabindex: "-1", id: "lm-qnum", text: "Check Your Work" });
      const summaryText = [
        `${counts.answered} of ${counts.total} answered`,
        counts.unanswered ? `${counts.unanswered} unanswered` : null,
        counts.marked ? `${counts.marked} marked for review` : null,
      ].filter(Boolean).join(" · ");
      const card = h("section", { className: "lm-review-card", "aria-labelledby": "lm-review-card-title" }, [
        h("div", { className: "lm-review-card-head" }, [
          h("h3", { id: "lm-review-card-title", text: title }),
          legend(),
        ]),
        h("div", { className: "lm-grid lm-grid-big" }, statuses.map((status) =>
          cellFor(status, (index) => navigate(index), true))),
      ]);
      refs.main.replaceChildren(h("div", { className: "lm-page lm-review" }, [
        heading,
        h("p", {
          className: "lm-lede",
          text: moduleInfo
            ? `Select a question number to go back to it. When you select Next, this module is submitted and you move on to ${moduleInfo.next || "the next part"}; you can't come back to it.`
            : "Select a question number to go back to it. Nothing is scored until you select Finish.",
        }),
        h("p", { className: "lm-review-counts", text: summaryText }),
        card,
      ]));
      shell.dataset.layout = "page";
    }

    /* ---- report */
    function statBlock(labelText, valueNode, note) {
      return h("div", { className: "lm-stat" }, [
        h("dt", { text: labelText }),
        h("dd", {}, [valueNode, note ? h("span", { className: "lm-stat-note", text: note }) : null]),
      ]);
    }

    function accuracyBar(row) {
      return h("span", { className: "lm-bar", "aria-hidden": "true" }, [
        h("span", { className: "lm-bar-fill", style: `width:${Math.round(row.accuracy * 100)}%` }),
      ]);
    }

    function renderReportView() {
      const report = session.summary();
      const heading = h("h2", { className: "lm-page-title", tabindex: "-1", id: "lm-qnum", text: "Your results" });
      const children = [
        h("p", {
          className: "lm-eyebrow",
          text: `${title} · ${report.feedback === "instant" ? "Instant feedback" : "Feedback at the end"}` +
            (runCode ? ` · Set code ${runCode}` : ""),
        }),
        heading,
      ];
      if (timeUpNotice || report.finishReason === "time") {
        children.push(h("div", { className: "lm-notice", role: "note" }, [
          icon("clock"),
          h("p", { text: "Time ran out, so the set ended automatically. Unanswered questions count as incorrect." }),
        ]));
      }
      const used = formatClock(report.elapsedMs, false);
      let timeValue;
      let timeNote = null;
      if (report.timeLimitSeconds) {
        timeValue = `${used} of ${formatClock(report.timeLimitSeconds * 1000, false)}`;
      } else {
        timeValue = used;
        if (report.paceBudgetSeconds) {
          const budgetMs = report.paceBudgetSeconds * 1000;
          const diff = report.elapsedMs - budgetMs;
          timeNote = `Real-test pace for ${report.total} question${report.total === 1 ? "" : "s"}: ` +
            `${formatClock(budgetMs, false)} (${diff > 0 ? `${formatClock(diff, false)} over` : "within pace"})`;
        }
      }
      // A set that spans sections (the full-length test, a mini test)
      // reports each section on its own, as the real test scores them, with
      // its Hard questions; the combined count is secondary.
      const sections = report.bySection.length > 1 ? report.bySection : null;
      const scoreLine = (row) => [
        h("strong", { text: `${row.correct} of ${row.total}` }),
        ` correct (${percent(row.accuracy)})`,
      ];
      const headline = sections
        ? h("div", { className: "lm-score lm-score-sections" }, [
          h("ul", { className: "lm-section-scores" }, sections.map((row) => h("li", {}, [
            h("span", { className: "lm-section-name", text: row.section || row.sectionKey }),
            h("span", { className: "lm-section-score" }, scoreLine(row)),
            h("span", {
              className: "lm-section-hard",
              text: row.hard.total ? `Hard: ${row.hard.correct} of ${row.hard.total}` : "No Hard questions",
            }),
          ]))),
          h("p", {
            className: "lm-score-combined",
            text: `${sections.length === 2 ? "Both sections" : `All ${sections.length} sections`} together: ` +
              `${report.correct} of ${report.total} (${percent(report.accuracy)}). ` +
              "Only a count: the real test scores each section on its own.",
          }),
        ])
        : h("div", { className: "lm-score" }, [
          h("p", { className: "lm-score-main" }, [
            h("strong", { text: `${report.correct} of ${report.total}` }),
            " correct",
          ]),
          h("p", { className: "lm-score-pct", text: percent(report.accuracy) }),
        ]);
      children.push(h("div", { className: `lm-score-card${sections ? " has-sections" : ""}` }, [
        headline,
        h("dl", { className: "lm-stats" }, [
          statBlock("Answered", `${report.answered} of ${report.total}`),
          report.hintedCorrect
            ? statBlock("After a hint", `${report.hintedCorrect} right, not counted`)
            : null,
          statBlock("Marked for review", String(report.marked)),
          statBlock("Time used", timeValue, timeNote),
        ]),
      ]));
      if (report.hintedCorrect) {
        children.push(h("p", { className: "lm-report-note", text:
          `${report.hintedCorrect} of your answers ${report.hintedCorrect === 1 ? "was" : "were"} right only after a hint, so ` +
          `${report.hintedCorrect === 1 ? "it is" : "they are"} not counted as correct, here or in Progress: a hint shows ` +
          "you can follow the method, not yet that you can find it. Review brings these questions back." }));
      }
      // An on-screen SAT test adds why each Module 2 went the way it did.
      (Array.isArray(options.reportNotes) ? options.reportNotes : []).forEach((text) => {
        children.push(h("p", { className: "lm-report-note", text: String(text) }));
      });
      children.push(h("p", { className: "lm-caveat", text: options.caveat ||
        "This is accuracy on one practice set, not a scaled score. The real test adapts its second module to your first, weights questions differently, and draws on a wider range of difficulty, so a percent correct here does not convert to an SAT or ACT score." }));

      const actions = typeof options.reportActions === "function"
        ? (call("reportActions", report) || []).filter((action) => action && action.label && typeof action.run === "function")
        : [];
      if (actions.length) {
        children.push(h("section", { className: "lm-report-section lm-next-steps" }, [
          h("h3", { text: "Keep going" }),
          h("div", { className: "lm-next-actions" }, actions.map((action, index) => h("div", { className: "lm-next-action" }, [
            h("button", {
              type: "button",
              className: `lm-btn ${index === 0 ? "lm-btn-primary" : "lm-btn-outline"}`,
              text: action.label,
              onClick: () => {
                exit("done");
                action.run();
              },
            }),
            action.note ? h("p", { className: "lm-next-note", text: action.note }) : null,
          ]))),
        ]));
      }

      // Extra tables from the app, such as results by module: { title,
      // columns, rows }, every cell plain text, the first a row header.
      (Array.isArray(options.reportSections) ? options.reportSections : []).forEach((section) => {
        if (!section || !Array.isArray(section.columns) || !Array.isArray(section.rows)) return;
        children.push(h("section", { className: "lm-report-section" }, [
          h("h3", { text: section.title }),
          h("div", { className: "lm-table-wrap" }, [
            h("table", { className: "lm-table lm-extra-table" }, [
              h("thead", {}, [h("tr", {}, section.columns.map((text) => h("th", { scope: "col", text })))]),
              h("tbody", {}, section.rows.map((row) => h("tr", {}, row.map((cell, index) => (index
                ? h("td", { text: String(cell) })
                : h("th", { scope: "row", text: String(cell) })))))),
            ]),
          ]),
        ]));
      });

      if (report.byDifficulty.length) {
        children.push(h("section", { className: "lm-report-section" }, [
          h("h3", { text: "By difficulty" }),
          h("div", { className: "lm-difficulty" }, report.byDifficulty.map((row) =>
            h("div", { className: "lm-diff-card" }, [
              h("p", { className: "lm-diff-name", text: row.difficulty }),
              h("p", { className: "lm-diff-value", text: `${row.correct} of ${row.total}` }),
              h("p", { className: "lm-diff-pct", text: percent(row.accuracy) }),
            ]))),
        ]));
      }

      children.push(h("section", { className: "lm-report-section" }, [
        h("h3", { text: "By domain, weakest first" }),
        h("div", { className: "lm-table-wrap" }, [
          h("table", { className: "lm-table lm-domain-table" }, [
            h("thead", {}, [h("tr", {}, [
              h("th", { scope: "col", text: "Domain" }),
              h("th", { scope: "col", text: "Correct" }),
              h("th", { scope: "col", text: "Accuracy" }),
            ])]),
            h("tbody", {}, report.byDomain.map((row) => h("tr", {}, [
              h("th", { scope: "row", text: row.domain }),
              h("td", { text: `${row.correct} of ${row.total}` }),
              h("td", { className: "lm-acc-cell" }, [accuracyBar(row), h("span", { text: percent(row.accuracy) })]),
            ]))),
          ]),
        ]),
      ]));

      const columns = ["Question", "Your answer", "Correct answer", "Result", "Marked", "Domain", "Skill", "Difficulty"];
      children.push(h("section", { className: "lm-report-section" }, [
        h("h3", { text: "Question by question" }),
        h("table", { className: "lm-table lm-items-table" }, [
          h("thead", {}, [h("tr", {}, columns.map((text) => h("th", { scope: "col", text })))]),
          h("tbody", {}, report.items.map((item) => {
            const verdict = verdictOf(item);
            const result = VERDICT_LABELS[verdict];
            const resultClass = `is-${verdict}`;
            return h("tr", { className: resultClass }, [
              h("th", { scope: "row", "data-label": columns[0] }, [
                h("button", {
                  type: "button",
                  className: "lm-link",
                  "aria-label": `Review question ${item.number}`,
                  onClick: () => {
                    session.goTo(item.index);
                    showView("answers");
                  },
                  text: String(item.number),
                }),
              ]),
              h("td", { "data-label": columns[1], text: responseLabel(item.question, item.index, item.response) }),
              h("td", { "data-label": columns[2], text: correctLabel(item.question, item.index) }),
              h("td", { "data-label": columns[3], className: `lm-result ${resultClass}` }, [
                icon(VERDICT_ICONS[verdict]), result,
              ]),
              h("td", { "data-label": columns[4], text: item.marked ? "Marked" : "—" }),
              h("td", { "data-label": columns[5], text: item.question.domain || "" }),
              h("td", { "data-label": columns[6], text: item.question.skill || "" }),
              h("td", { "data-label": columns[7], text: item.question.difficulty || "" }),
            ]);
          })),
        ]),
      ]));

      refs.main.replaceChildren(h("div", { className: "lm-page lm-report" }, children));
      refs.main.scrollTop = 0;
      shell.dataset.layout = "page";
    }

    /* ---- chrome updates */
    function updateBottom() {
      const state = session.state;
      const total = state.questions.length;
      const questionLike = view === "question" || view === "answers";
      refs.navToggle.hidden = !questionLike;
      refs.navToggle.replaceChildren(
        h("span", { text: `Question ${state.index + 1} of ${total}` }),
        icon(openPanel === "nav" ? "down" : "up", "lm-caret"),
      );
      refs.backButton.hidden = false;
      refs.nextButton.hidden = false;
      refs.nextButton.classList.remove("lm-btn-finish", "lm-btn-secondary");
      refs.nextButton.classList.add("lm-btn-primary");
      if (view === "question" || view === "answers") {
        refs.backButton.textContent = "Back";
        refs.backButton.disabled = state.index === 0;
        refs.nextButton.disabled = false;
        refs.nextButton.textContent = session.isLast()
          ? (view === "answers" ? "Report" : "Review")
          : "Next";
      } else if (view === "review") {
        refs.backButton.textContent = "Back";
        refs.backButton.disabled = false;
        refs.nextButton.textContent = moduleInfo ? "Next" : "Finish";
        refs.nextButton.disabled = false;
        refs.nextButton.classList.add("lm-btn-finish");
      } else if (view === "report") {
        refs.backButton.textContent = "Review answers";
        refs.backButton.disabled = false;
        refs.nextButton.textContent = "Done";
        refs.nextButton.disabled = false;
        refs.nextButton.classList.remove("lm-btn-primary");
        refs.nextButton.classList.add("lm-btn-secondary");
      }
    }

    function updateChrome() {
      shell.dataset.view = view;
      const finished = session.state.finished;
      refs.directionsToggle.hidden = finished;
      if (refs.reportButton) refs.reportButton.hidden = view !== "answers";
      if (refs.exitButton) {
        const exitLabel = finished ? "Close" : "Exit";
        refs.exitButton.setAttribute("aria-label", exitLabel);
        refs.exitButton.title = exitLabel;
        refs.exitButton.querySelector(".lm-tool-label").textContent = exitLabel;
      }
      if (refs.calcButton) refs.calcButton.hidden = view === "report" || !toolAvailable("calculator");
      if (refs.refButton) refs.refButton.hidden = view === "report" || !toolAvailable("reference");
      if (openPanel === "reference" && !toolAvailable("reference")) closePanel(false);
      if (refs.annotateButton) refs.annotateButton.hidden = !toolAvailable("annotate");
      if (refs.readerButton) refs.readerButton.hidden = !toolAvailable("lineReader");
      if (openPanel === "notes" && !toolAvailable("annotate")) closePanel(false);
      const current = session.state.questions[session.state.index];
      refs.sectionLabel.hidden = !mixed || view === "report";
      refs.sectionLabel.textContent = mixed ? (current.section || currentSectionKey()) : "";
      if (finished) refs.alert.hidden = true;
      updateTimer();
      updateBottom();
    }

    function render() {
      if (closed) return;
      updateChrome();
      if (view === "question") renderQuestionView(false);
      else if (view === "answers") renderQuestionView(true);
      else if (view === "review") renderReviewView();
      else renderReportView();
      const heading = refs.main.querySelector("#lm-qnum");
      if (heading) heading.focus({ preventScroll: true });
    }

    /* ---- keyboard */
    function onKeyDown(event) {
      if (closed || event.defaultPrevented) return;
      if (event.key === "Escape") {
        if (refs.dialog.open) return;
        if (openPanel) {
          event.preventDefault();
          closePanel(true);
        } else if (!refs.alert.hidden) {
          refs.alert.hidden = true;
        }
        return;
      }
      const target = event.target;
      const tag = target && target.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || Boolean(target && target.isContentEditable);
      // Alt+Shift+H highlights the selected passage text, so a keyboard
      // selection is not lost on the way to the Annotate button. In a text
      // field it only acts on a passage selection, and otherwise types.
      if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === "KeyH") {
        if (view !== "question" || refs.dialog.open || !toolAvailable("annotate")) return;
        const range = selectionRange();
        if (typing && !range) return;
        event.preventDefault();
        annotate(range, true);
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (view !== "question" || refs.dialog.open) return;
      if (typing) return;
      const question = currentQuestion();
      if (question.responseType !== "multiple-choice" || !Array.isArray(question.choices)) return;
      const letters = lettersFor(question, session.state.index);
      const key = String(event.key || "").toUpperCase();
      let choice = -1;
      if (/^[1-9]$/.test(key)) choice = Number(key) - 1;
      else choice = letters.slice(0, question.choices.length).indexOf(key);
      if (choice < 0 || choice >= question.choices.length) return;
      event.preventDefault();
      chooseAnswer(choice);
    }

    function onDocumentPointer(event) {
      if (!openPanel || openPanel === "reference" || openPanel === "notes") return;
      const inside = [refs.navigator, refs.directions, refs.navToggle, refs.directionsToggle]
        .some((node) => node.contains(event.target));
      if (!inside) closePanel(false);
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") flushSave();
    }

    function onPageHide() {
      flushSave();
    }

    /* ---- lifecycle */
    let unmount = null;

    function teardown() {
      if (closed) return;
      closed = true;
      if (timerId !== null) root.clearInterval(timerId);
      if (saveTimer !== null) root.clearTimeout(saveTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onDocumentPointer, true);
      if (readerObserver) readerObserver.disconnect();
      if (readerFrame !== null) root.cancelAnimationFrame(readerFrame);
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeEventListener("pagehide", onPageHide);
      if (refs.dialog.open) {
        refs.dialog.onclose = null;
        refs.dialog.close();
      }
      if (unmount) unmount();
      if (active && active.root === shell) active = null;
    }

    unmount = mount(shell);
    refs.main.addEventListener("click", onMainClick);
    refs.main.addEventListener("pointerdown", (event) => {
      lastPointerType = event.pointerType || "mouse";
    });
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onDocumentPointer, true);
    document.addEventListener("visibilitychange", onVisibility);
    root.addEventListener("pagehide", onPageHide);

    if (session.state.finished) {
      // A module whose time ran out while the page was closed hands over at
      // once; anything else finished shows its report.
      if (moduleInfo) endModule(session.state.finishReason || "user");
      else {
        if (!session.state.reported) deliverResult();
        render();
      }
    } else {
      const first = session.tick();
      if (!session.state.finished) {
        if (first.alertDue) {
          refs.alert.hidden = false;
          timerHidden = false;
        }
        render();
        flushSave();
        timerId = root.setInterval(onTick, 250);
        if (!resume && options.openDirections) openPanelNamed("directions");
        if (!resume && options.notice) showNotice(String(options.notice));
      } else {
        timeUp();
      }
    }

    return {
      root: shell,
      close: teardown,
      snapshot,
      session,
    };
  }

  return {
    SHELL_SCHEMA,
    SHELL_VERSION,
    DIRECTIONS,
    SPR_RULES,
    canResume,
    start,
    startBreak,
    formatClock,
    describeDiscard,
  };
});
