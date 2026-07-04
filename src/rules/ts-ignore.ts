import type { Rule } from "./types.js";

export const tsIgnoreRule: Rule = {
  id: "ts-ignore",
  description: "Added @ts-ignore",
  severity: "high",
  check: (line) => line.includes("@ts-ignore"),
};
