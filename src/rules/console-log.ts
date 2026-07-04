import type { Rule } from "./types.js";

export const consoleLogRule: Rule = {
  id: "console-log",
  description: "Added console.log",
  severity: "low",
  check: (line) => line.includes("console.log"),
};
