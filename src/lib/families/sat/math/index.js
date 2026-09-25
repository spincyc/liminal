"use strict";

// Every SAT Math template, in catalog domain and skill order. The browser
// loads shared/, then each domain's common.js and skill files as plain
// scripts instead of this file.
module.exports = [
  ...require("./algebra/linear-equations-in-one-variable"),
  ...require("./algebra/linear-functions"),
  ...require("./algebra/linear-equations-in-two-variables"),
  ...require("./algebra/systems-of-two-linear-equations"),
  ...require("./algebra/linear-inequalities"),
  ...require("./advanced-math/equivalent-expressions"),
  ...require("./advanced-math/nonlinear-equations"),
  ...require("./advanced-math/systems-of-equations"),
  ...require("./advanced-math/nonlinear-functions"),
  ...require("./problem-solving-and-data-analysis/ratios-rates-and-units"),
  ...require("./problem-solving-and-data-analysis/percentages"),
  ...require("./problem-solving-and-data-analysis/one-variable-data"),
  ...require("./problem-solving-and-data-analysis/two-variable-data"),
  ...require("./problem-solving-and-data-analysis/probability"),
  ...require("./problem-solving-and-data-analysis/statistical-inference"),
  ...require("./geometry-and-trigonometry/area-and-volume"),
  ...require("./geometry-and-trigonometry/lines-angles-and-triangles"),
  ...require("./geometry-and-trigonometry/right-triangles-and-trigonometry"),
  ...require("./geometry-and-trigonometry/circles"),
];
