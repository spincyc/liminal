"use strict";

// The helpers every template uses, as one object: randomness, notation,
// figures, and instantiate. In the browser the same modules load as plain
// scripts onto window.LiminalFamilyShared.
module.exports = {
  ...require("./random"),
  ...require("./notation"),
  ...require("./figures"),
  ...require("./instantiate"),
};
