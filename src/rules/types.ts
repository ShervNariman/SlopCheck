export interface Rule {
  id: string;
  description: string;
  severity: "high" | "medium" | "low";
  check(line: string): boolean;
}
