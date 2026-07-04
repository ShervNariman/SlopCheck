export interface Finding {
  ruleId: string;
  severity: "high" | "medium" | "low";
  message: string;
  line?: string;
}
