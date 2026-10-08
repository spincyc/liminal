"use strict";
const fs = require("node:fs");
const path = require("node:path");

// Data URLs survive the existing standalone HTML export, including offline
// printing on machines without TeX fonts. Keep the source CSS and font files
// reviewable; only dist/ contains the generated base64 stylesheet.
function embed(css, fontDirectory) {
  return css.replace(/url\("\.\.\/fonts\/computer-modern\/(cmun(?:rm|bx|ti|bi)\.woff2)"\)/g, (_, name) => {
    const data = fs.readFileSync(path.join(fontDirectory, name));
    return `url("data:font/woff2;base64,${data.toString("base64")}")`;
  });
}
module.exports = { embed };
