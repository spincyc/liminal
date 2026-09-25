(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const api = factory(S);
  if (node) module.exports = api;
  else (root.LiminalFamilyCommon = root.LiminalFamilyCommon || {})["sat/reading-writing/standard-english-conventions"] = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";

  // Constants shared by the Standard English Conventions skill files
  // (Boundaries and Form, Structure, and Sense).

  const STEM = "Which choice completes the text so that it conforms to the conventions of Standard English?";
  const BLANK = "______";
  const DOMAIN = "Standard English Conventions";

  return { STEM, BLANK, DOMAIN };
});
