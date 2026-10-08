#!/usr/bin/env node
"use strict";
// Historical tooling entry point; lesson modules are the only canonical source.
const modules = require("./build-lesson-modules.js");
function loadCourses(options) {
  const { catalog, modules: courses } = modules.loadModules(options);
  return { catalog: { ...catalog, courses: catalog.modules }, courses };
}
module.exports = { ...modules, loadCourses };
if (require.main === module) modules.build();
