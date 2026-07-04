import type { Rule } from "./types.js";

export const broadCatchRule: Rule = {
  id: "broad-catch",
  description: "Added broad catch block",
  severity: "medium",
  check: (line) => /catch\s*\([^)]*\)\s*\{?\s*$/.test(line),
};
