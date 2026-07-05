import { describe, expect, it } from "vitest";
import { anyTypeRule } from "../../src/rules/any-type.js";
import { tsIgnoreRule } from "../../src/rules/ts-ignore.js";
import { todoFixmeHackRule } from "../../src/rules/todo-fixme.js";
import { consoleLogRule } from "../../src/rules/console-log.js";
import { broadCatchRule } from "../../src/rules/broad-catch.js";
import { rules } from "../../src/rules/index.js";

describe("anyTypeRule", () => {
  it("detects an added any type", () => {
    expect(anyTypeRule.check("const x: any = 1;")).toBe(true);
  });

  it("does not flag safe code", () => {
    expect(anyTypeRule.check("const x: number = 1;")).toBe(false);
  });

  it("has the expected id and severity", () => {
    expect(anyTypeRule.id).toBe("any-type");
    expect(anyTypeRule.severity).toBe("medium");
  });
});

describe("tsIgnoreRule", () => {
  it("detects an added @ts-ignore comment", () => {
    expect(tsIgnoreRule.check("// @ts-ignore")).toBe(true);
  });

  it("does not flag safe code", () => {
    expect(tsIgnoreRule.check("// this is fine")).toBe(false);
  });

  it("has the expected id and severity", () => {
    expect(tsIgnoreRule.id).toBe("ts-ignore");
    expect(tsIgnoreRule.severity).toBe("high");
  });
});

describe("todoFixmeHackRule", () => {
  it("detects an added TODO/FIXME/HACK comment", () => {
    expect(todoFixmeHackRule.check("// TODO: clean this up")).toBe(true);
    expect(todoFixmeHackRule.check("// FIXME later")).toBe(true);
    expect(todoFixmeHackRule.check("// HACK around bug")).toBe(true);
  });

  it("does not flag safe code", () => {
    expect(todoFixmeHackRule.check("// looks good to me")).toBe(false);
  });

  it("has the expected id and severity", () => {
    expect(todoFixmeHackRule.id).toBe("todo-fixme-hack");
    expect(todoFixmeHackRule.severity).toBe("low");
  });
});

describe("consoleLogRule", () => {
  it("detects an added console.log call", () => {
    expect(consoleLogRule.check('console.log("debug")')).toBe(true);
  });

  it("does not flag safe code", () => {
    expect(consoleLogRule.check("logger.info(\"debug\")")).toBe(false);
  });

  it("has the expected id and severity", () => {
    expect(consoleLogRule.id).toBe("console-log");
    expect(consoleLogRule.severity).toBe("low");
  });
});

describe("broadCatchRule", () => {
  it("detects an added broad catch block", () => {
    expect(broadCatchRule.check("} catch (e) {")).toBe(true);
    expect(broadCatchRule.check("} catch (error) {")).toBe(true);
  });

  it("does not flag a catch that narrows the error further on the same line", () => {
    expect(broadCatchRule.check("} catch (e) { if (e instanceof FooError) {")).toBe(false);
  });

  it("has the expected id and severity", () => {
    expect(broadCatchRule.id).toBe("broad-catch");
    expect(broadCatchRule.severity).toBe("medium");
  });
});

describe("rules registry", () => {
  it("registers exactly the five core rules", () => {
    expect(rules.map((r) => r.id).sort()).toEqual(
      ["any-type", "broad-catch", "console-log", "todo-fixme-hack", "ts-ignore"].sort(),
    );
  });
});
