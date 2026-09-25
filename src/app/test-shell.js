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
  // lives in LiminalRender; scoring comes from PracticeCore.

  const SHELL_SCHEMA = "liminal-test-shell";
  const SHELL_VERSION = 1;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const CALCULATOR_URL = "https://www.desmos.com/calculator";
  const SAVE_EVERY_MS = 15000;
  const DEFAULT_LETTERS = ["A", "B", "C", "D", "E"];

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

  /* ------------------------------------------------------------ the shell */

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
        now,
      });
    }
    if (session.state.finished && view !== "answers") view = "report";
    if (!session.state.finished && (view === "report" || view === "answers")) view = "question";

    const first = session.state.questions[0];
    const sectionKey = options.sectionKey || (resumeShell && resumeShell.sectionKey) ||
      first.sectionKey || "";
    const title = options.title || (resumeShell && resumeShell.title) || first.section ||
      "Practice set";
    // A template run's code (template mask and seed), shown in the report so
    // the exact set can be named and rebuilt.
    const runCode = options.runCode || (resumeShell && resumeShell.runCode) || null;
    const mathSection = isMathSection(sectionKey);
    const tools = Object.assign(
      { calculator: mathSection, reference: mathSection },
      (resumeShell && resumeShell.tools) || {},
      options.tools || {},
    );
    const directions = options.directions || (resumeShell && resumeShell.directions) || null;
    const exitMessage = options.exitMessage ||
      "Leave this session and go back to the practice setup? The timer stops.";

    let timeUpNotice = false;
    let openPanel = null;
    let lastSave = now();
    let lastStimulusKey = null;
    let timerId = null;
    let closed = false;
    const refs = {};

    function snapshot() {
      return {
        schema: SHELL_SCHEMA,
        version: SHELL_VERSION,
        title,
        sectionKey,
        runCode,
        tools,
        directions,
        view,
        timerHidden,
        finished: session.state.finished,
        session: session.serialize(),
      };
    }

    // Snapshots stop once the report has been delivered, so an app that
    // clears its saved session in onFinish does not see it written back.
    function save(force) {
      if (closed || (session.state.reported && !force)) return;
      lastSave = now();
      call("onSave", snapshot());
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

    refs.top = h("header", { className: "lm-top" }, [
      h("div", { className: "lm-top-left" }, [
        h("h1", { className: "lm-title", text: title }),
        refs.directionsToggle,
      ]),
      h("div", { className: "lm-top-center" }, [refs.timer, refs.timerToggle, refs.centerLabel]),
      h("div", { className: "lm-top-right" }, [
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

    refs.alert = h("div", { className: "lm-alert", hidden: true }, [
      icon("clock"),
      h("p", { className: "lm-alert-text", text: "5 minutes remaining." }),
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
    refs.scrim = h("div", { className: "lm-scrim", hidden: true, onClick: () => closePanel(true) });

    refs.livePolite = h("div", { className: "lm-sr-only", "aria-live": "polite", role: "status" });
    refs.liveAssertive = h("div", { className: "lm-sr-only", "aria-live": "assertive", role: "alert" });

    refs.dialog = h("dialog", { className: "lm-dialog", "aria-labelledby": "lm-dialog-title" });

    append(shell, [
      refs.top, refs.directions, refs.alert, refs.main, refs.bottom, refs.scrim,
      refs.navigator, refs.reference, refs.livePolite, refs.liveAssertive, refs.dialog,
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

    function directionsFor() {
      if (Array.isArray(directions)) return directions;
      if (typeof directions === "string") return [directions];
      return DIRECTIONS[sectionKey] || [
        "Choose the best answer to each question. Use Mark for Review to flag a question and return to it from the question navigator.",
      ];
    }

    function hasNumeric() {
      return session.state.questions.some((question) => question.responseType === "numeric");
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
      refs.scrim.hidden = true;
      refs.navToggle.setAttribute("aria-expanded", "false");
      refs.directionsToggle.setAttribute("aria-expanded", "false");
      if (refs.refButton) refs.refButton.setAttribute("aria-expanded", "false");
      if (restoreFocus && was) {
        const target = was === "nav" ? refs.navToggle
          : was === "directions" ? refs.directionsToggle
            : refs.refButton;
        if (target && target.isConnected && !target.hidden) target.focus();
      }
    }

    function openCalculator() {
      root.open(CALCULATOR_URL, "_blank", "noopener,noreferrer");
    }

    /* ---- dialogs */
    function confirmDialog(settings) {
      const dialog = refs.dialog;
      const cancel = h("button", {
        type: "button",
        className: "lm-btn lm-btn-secondary",
        text: settings.cancel || "Cancel",
        onClick: () => dialog.close("cancel"),
      });
      const confirm = h("button", {
        type: "button",
        className: "lm-btn lm-btn-primary",
        text: settings.confirm || "OK",
        onClick: () => dialog.close("confirm"),
      });
      dialog.replaceChildren(
        h("h2", { id: "lm-dialog-title", className: "lm-dialog-title", text: settings.title }),
        h("p", { className: "lm-dialog-text", text: settings.text }),
        h("div", { className: "lm-dialog-actions" }, [cancel, confirm]),
      );
      const opener = document.activeElement;
      dialog.returnValue = "";
      dialog.onclose = () => {
        const confirmed = dialog.returnValue === "confirm";
        if (confirmed) settings.onConfirm();
        else if (opener && opener.isConnected) opener.focus();
      };
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
        cancel.focus();
      } else if (root.confirm(`${settings.title}\n\n${settings.text}`)) {
        settings.onConfirm();
      }
    }

    function closeDialog() {
      if (refs.dialog.open) {
        refs.dialog.onclose = null;
        refs.dialog.close();
      }
    }

    function requestExit() {
      if (session.state.finished) {
        exit();
        return;
      }
      confirmDialog({
        title: "Exit digital test mode?",
        text: exitMessage,
        cancel: "Keep testing",
        confirm: "Exit",
        onConfirm: exit,
      });
    }

    function exit() {
      save();
      teardown();
      call("onExit");
    }

    /* ---- navigation */
    function navigate(index) {
      closePanel(false);
      session.goTo(index);
      if (view !== "question" && view !== "answers") view = "question";
      save();
      render();
    }

    function onBack() {
      if (view === "review") {
        view = "question";
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
        exit();
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
      view = name;
      save();
      render();
    }

    function requestFinish() {
      const counts = session.counts();
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

    function timeUp() {
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
        const status = session.itemStatus(index);
        const verdict = !status.answered ? "omitted" : status.correct ? "correct" : "incorrect";
        bar.appendChild(h("span", { className: `lm-verdict-tag is-${verdict}` }, [
          icon(verdict === "correct" ? "check" : verdict === "incorrect" ? "cross" : "warning"),
          verdict === "correct" ? "Correct" : verdict === "incorrect" ? "Incorrect" : "Not answered",
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
        const text = h("span", { className: "lm-choice-text" }, [Render.renderText(choice)]);
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
      if (question.explanation) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Explanation" }),
          Render.renderText(question.explanation),
        ]));
      }
      if (Array.isArray(question.solutionSteps) && question.solutionSteps.length) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Steps" }),
          h("ol", { className: "lm-steps" }, question.solutionSteps.map((step) => h("li", { text: step }))),
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
              item.reason,
            ]))),
        ]));
      } else if (chosen !== null && chosen !== Number(question.correctAnswer)) {
        const rationale = rationales.find((item) => item.index === chosen);
        if (rationale) {
          parts.push(h("section", { className: "lm-exp-section" }, [
            h("h3", { text: `Why ${letterOf(question, index, chosen)} is wrong` }),
            h("p", { text: rationale.reason }),
          ]));
        }
      }
      if (full && question.trap) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Common trap" }),
          h("p", { text: question.trap }),
        ]));
      }
      if (full && question.strategy) {
        parts.push(h("section", { className: "lm-exp-section" }, [
          h("h3", { text: "Approach" }),
          h("p", { text: question.strategy }),
        ]));
      }
      return h("div", { className: "lm-explanation" }, parts);
    }

    function verdictBanner(question, index) {
      const status = session.itemStatus(index);
      const answer = correctLabel(question, index);
      const kind = !status.answered ? "omitted" : status.correct ? "correct" : "incorrect";
      const text = kind === "correct"
        ? "Correct."
        : kind === "incorrect"
          ? `Incorrect. The correct answer is ${answer}.`
          : `Not answered. The correct answer is ${answer}.`;
      return {
        kind,
        text,
        node: h("div", { className: `lm-verdict is-${kind}` }, [
          icon(kind === "correct" ? "check" : kind === "incorrect" ? "cross" : "warning"),
          h("p", { text }),
        ]),
      };
    }

    function buildInstantArea(question, index) {
      refs.hintBox = h("div", { className: "lm-hint", hidden: true }, [
        h("h3", { text: "Hint" }),
        h("p", { text: question.hint || "No hint for this question." }),
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
            question,
            response: session.state.responses[item],
            correct: session.isCorrect(item),
          });
          syncQuestion();
          announce(verdict.text);
          if (refs.feedback) refs.feedback.scrollIntoView({ block: "nearest", behavior: "smooth" });
        },
      });
      refs.feedback = h("div", { className: "lm-feedback" });
      return h("div", { className: "lm-instant" }, [
        refs.hintBox,
        h("div", { className: "lm-instant-actions" }, [refs.hintButton, refs.checkButton]),
        refs.feedback,
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
        ? Render.renderStimulus(parts.stimulus, { underlines })
        : null;
      const figureNode = question.figure ? Render.renderFigure(question.figure) : null;
      const header = buildQuestionHeader(question, index, reviewing);
      const stem = h("div", { className: "lm-stem", id: "lm-stem" }, [Render.renderText(parts.stem)]);
      const answer = question.responseType === "multiple-choice" && Array.isArray(question.choices)
        ? buildChoices(question, index, reviewing)
        : buildNumeric(question, index, reviewing);
      if (question.responseType !== "multiple-choice") refs.choiceRows = [];
      if (question.responseType === "multiple-choice" || reviewing) {
        refs.sprInput = null;
        refs.sprPreview = null;
      }

      const questionPane = h("div", { className: "lm-question-pane" }, [header]);
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
      if (split) {
        const stimulusPane = h("div", {
          className: "lm-stimulus-pane",
          role: "region",
          "aria-label": "Passage",
          tabindex: "0",
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

    /* ---- navigator and review page */
    function cellFor(status, onPick, big) {
      const reviewing = view === "answers";
      const flags = [];
      let state;
      if (reviewing) {
        state = !status.answered ? "unanswered" : status.correct ? "correct" : "incorrect";
        flags.push(state === "unanswered" ? "not answered" : state);
      } else {
        state = status.answered ? "answered" : "unanswered";
        flags.push(state);
        if (status.correct === true) flags.push("checked correct");
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
          !reviewing && status.checked ? (status.correct ? "is-checked-correct" : "is-checked-wrong") : "",
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
      const items = view === "answers"
        ? [
          ["lm-legend-current", icon("pin"), "Current"],
          ["lm-legend-correct", h("span", { className: "lm-swatch is-correct" }), "Correct"],
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
        h("p", { className: "lm-lede", text: "Select a question number to go back to it. Nothing is scored until you select Finish." }),
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
      children.push(h("div", { className: "lm-score-card" }, [
        h("div", { className: "lm-score" }, [
          h("p", { className: "lm-score-main" }, [
            h("strong", { text: `${report.correct} of ${report.total}` }),
            " correct",
          ]),
          h("p", { className: "lm-score-pct", text: percent(report.accuracy) }),
        ]),
        h("dl", { className: "lm-stats" }, [
          statBlock("Answered", `${report.answered} of ${report.total}`),
          statBlock("Marked for review", String(report.marked)),
          statBlock("Time used", timeValue, timeNote),
        ]),
      ]));
      children.push(h("p", { className: "lm-caveat", text:
        "This is accuracy on one practice set, not a scaled score. The real test adapts its second module to your first, weights questions differently, and draws on a wider range of difficulty, so a percent correct here does not convert to an SAT or ACT score." }));

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
            const result = !item.answered ? "Not answered" : item.correct ? "Correct" : "Incorrect";
            const resultClass = !item.answered ? "is-omitted" : item.correct ? "is-correct" : "is-incorrect";
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
                icon(item.correct ? "check" : item.answered ? "cross" : "warning"), result,
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
        refs.nextButton.textContent = "Finish";
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
      if (refs.calcButton) refs.calcButton.hidden = view === "report";
      if (refs.refButton) refs.refButton.hidden = view === "report";
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
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (view !== "question" || refs.dialog.open) return;
      const target = event.target;
      const tag = target && target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (target && target.isContentEditable)) return;
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
      if (!openPanel || openPanel === "reference") return;
      const inside = [refs.navigator, refs.directions, refs.navToggle, refs.directionsToggle]
        .some((node) => node.contains(event.target));
      if (!inside) closePanel(false);
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") save();
    }

    function onPageHide() {
      save();
    }

    /* ---- lifecycle */
    const previousOverflow = document.documentElement.style.overflow;
    // The page behind the shell is inert while it is open, so Tab and
    // screen readers stay inside the test.
    const inerted = [];
    function setBackgroundInert() {
      Array.from(document.body.children).forEach((node) => {
        if (node === shell || node.hasAttribute("inert") || node.tagName === "SCRIPT") return;
        node.setAttribute("inert", "");
        inerted.push(node);
      });
    }

    function teardown() {
      if (closed) return;
      closed = true;
      if (timerId !== null) root.clearInterval(timerId);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onDocumentPointer, true);
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeEventListener("pagehide", onPageHide);
      if (refs.dialog.open) {
        refs.dialog.onclose = null;
        refs.dialog.close();
      }
      shell.remove();
      inerted.forEach((node) => node.removeAttribute("inert"));
      document.documentElement.style.overflow = previousOverflow;
      if (active && active.root === shell) active = null;
    }

    document.body.appendChild(shell);
    setBackgroundInert();
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onDocumentPointer, true);
    document.addEventListener("visibilitychange", onVisibility);
    root.addEventListener("pagehide", onPageHide);

    if (session.state.finished) {
      if (!session.state.reported) deliverResult();
      render();
    } else {
      const first = session.tick();
      if (!session.state.finished) {
        if (first.alertDue) {
          refs.alert.hidden = false;
          timerHidden = false;
        }
        render();
        save();
        timerId = root.setInterval(onTick, 250);
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
    start,
    formatClock,
  };
});
