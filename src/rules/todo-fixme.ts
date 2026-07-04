import type { Rule } from "./types.js";

export const todoFixmeHackRule: Rule = {
  id: "todo-fixme-hack",
  description: "Added TODO/FIXME/HACK",
  severity: "low",
  check: (line) => /TODO|FIXME|HACK/i.test(line),
};
