#!/usr/bin/env node
"use strict";
// Preserve existing packet commands and module ids.
const packet = require("./lesson-packet.js");
module.exports = packet;
if (require.main === module) packet.main().catch(error => { console.error(`Lesson packet: ${error.message}`); process.exitCode = 1; });
