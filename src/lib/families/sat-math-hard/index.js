"use strict";

// Every SAT Math Hard family, in catalog domain order. The browser loads
// shared.js and then each family file as a plain script instead of this file.
module.exports = [
  ...require("./algebra"),
  ...require("./advanced-quadratics"),
  ...require("./advanced-functions"),
  ...require("./data-analysis"),
  ...require("./geometry"),
];
