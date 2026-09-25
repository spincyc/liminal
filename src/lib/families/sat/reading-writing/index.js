"use strict";

// Every SAT Reading and Writing template, in catalog order: each domain's
// skill files in the catalog's skill order. In the browser the same files
// load as plain scripts (each domain's common.js first) and register
// themselves through LiminalFamilyShared.register.
module.exports = [
  ...require("./information-and-ideas/central-ideas-and-details"),
  ...require("./information-and-ideas/inferences"),
  ...require("./information-and-ideas/command-of-evidence"),
  ...require("./craft-and-structure/words-in-context"),
  ...require("./craft-and-structure/text-structure-and-purpose"),
  ...require("./craft-and-structure/cross-text-connections"),
  ...require("./expression-of-ideas/rhetorical-synthesis"),
  ...require("./expression-of-ideas/transitions"),
  ...require("./standard-english-conventions/boundaries"),
  ...require("./standard-english-conventions/form-structure-and-sense"),
];
