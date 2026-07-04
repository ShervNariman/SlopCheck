import type { Rule } from "./types.js";

export const anyTypeRule: Rule = {
  id: "any-type",
  description: 'Added TypeScript "any"',
  severity: "medium",
  check: (line) => /\bany\b/.test(line),
};
