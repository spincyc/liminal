#!/usr/bin/env node
"use strict";
// Compatibility entry point; the canonical check follows parent grade modules.
const checker = require("./check-lesson-modules.js");
module.exports = checker;
if (require.main === module) checker.main();
