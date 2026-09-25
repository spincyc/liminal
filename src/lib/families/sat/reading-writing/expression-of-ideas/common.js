(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/reading-writing/expression-of-ideas"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Helpers shared by the Expression of Ideas skill files (Rhetorical
  // Synthesis and Transitions).

  const DOMAIN = "Expression of Ideas";
  const SECTION = "sat-reading-writing";

  const lc = (text) => String(text).toLowerCase();

  return { DOMAIN, SECTION, lc };
});
