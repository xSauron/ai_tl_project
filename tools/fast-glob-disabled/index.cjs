"use strict";

// awilix imports fast-glob only for listModules/loadModules, which AGENTS.md bans
// (dependencies are registered explicitly). Replacing it keeps braces, which has
// no patched release for GHSA-vfj7-8cjw-p6xm, out of the production tree.
function fastGlobDisabled() {
  throw new Error("awilix loadModules is disabled: register dependencies explicitly in the container");
}

fastGlobDisabled.sync = fastGlobDisabled;

module.exports = fastGlobDisabled;
