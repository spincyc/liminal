/* Generate PDF: typesets TeX in this browser with the WebAssembly TeX runtime
 * the build staged (window.LiminalNativeTeXRuntime from native-tex/config.js)
 * through the vendored Colophon runner (window.Colophon), and saves the PDF.
 * Nothing is uploaded; the first PDF downloads the typesetter once and the
 * browser keeps it. docs/printing.md explains the design.
 *
 *   LiminalPdfAction.run({ tex, engine, filename, onProgress, signal })
 *   LiminalPdfAction.control({ prepare })   // a button, progress text and cancel
 */
(function (root) {
  "use strict";
  const UNAVAILABLE = "PDF generation is unavailable in this copy of the site.";
  const runtime = () => root.LiminalNativeTeXRuntime || null;
  const available = () => !!(runtime() && root.Colophon && typeof root.Colophon.generate === "function");

  function save(bytes, filename) {
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename; anchor.hidden = true;
    document.body.append(anchor); anchor.click(); anchor.remove();
    root.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Typesets `tex` with `engine` and, given a filename, saves the PDF.
  // Resolves to the runner's result ({ bytes, passes, cached, ... }); rejects
  // with an AbortError when `signal` aborts.
  async function run({ tex, engine, filename, onProgress, signal }) {
    if (!available()) throw new Error(UNAVAILABLE);
    const pinned = runtime();
    const result = await root.Colophon.generate({
      files: [{ path: "main.tex", data: tex }], entrypoint: "main.tex", engine,
      runtimeURL: new URL(pinned.url, document.baseURI).href, runtimeSHA256: pinned.sha256, runtimeBytes: pinned.bytes,
      signal, onProgress,
    });
    if (filename) save(result.bytes, filename);
    return result;
  }

  // A Generate PDF button with small progress text, which becomes Cancel while
  // a PDF is being made. `prepare()` returns { tex, engine, filename } for what
  // is on screen, or null when nothing is. Without a runtime the control says
  // PDF generation is unavailable instead, beside a disabled button.
  function control({ prepare, label = "Generate PDF" }) {
    const button = document.createElement("button");
    button.type = "button"; button.textContent = label; button.className = "pdf-action";
    const status = document.createElement("span");
    status.className = "pdf-action-status"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    let controller = null;
    const say = message => { status.textContent = message; };
    function cancel() { if (controller) controller.abort(); }
    async function start() {
      if (controller) { cancel(); return; }
      const job = prepare();
      if (!job) return;
      const current = controller = new AbortController();
      button.textContent = "Cancel PDF";
      const started = Date.now();
      try {
        const result = await run({ ...job, signal: current.signal, onProgress: detail => { if (controller === current) say(detail.message); } });
        say("Saved " + job.filename + (result.cached ? "." : " (" + ((Date.now() - started) / 1000).toFixed(0) + " s)."));
      } catch (error) {
        if (current.signal.aborted || (error && error.name === "AbortError")) say("PDF cancelled.");
        else { say("The PDF could not be made. " + (error && error.message ? error.message : "")); if (root.console) console.error(error); }
      } finally {
        if (controller === current) { controller = null; button.textContent = label; }
      }
    }
    button.addEventListener("click", start);
    if (!available()) { button.disabled = true; say(UNAVAILABLE); }
    const notices = runtime() && runtime().notices;
    const credits = document.createElement("a");
    credits.className = "pdf-action-notices"; credits.textContent = "Typesetter licenses";
    if (notices) credits.href = new URL(notices, document.baseURI).href; else credits.hidden = true;
    return { button, status, credits, cancel, available: available(), busy: () => !!controller };
  }

  root.LiminalPdfAction = { available, run, save, control, UNAVAILABLE };
})(window);
