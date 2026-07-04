import type { Rule } from "./types.js";
import { anyTypeRule } from "./any-type.js";
import { tsIgnoreRule } from "./ts-ignore.js";
import { todoFixmeHackRule } from "./todo-fixme.js";
import { consoleLogRule } from "./console-log.js";
import { broadCatchRule } from "./broad-catch.js";

export const rules: Rule[] = [
  anyTypeRule,
  tsIgnoreRule,
  todoFixmeHackRule,
  consoleLogRule,
  broadCatchRule,
];
