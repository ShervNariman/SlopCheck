import { execa } from "execa";

export async function getGitDiff(base?: string): Promise<string> {
  if (base) {
    const baseDiff = await execa("git", ["diff", "--unified=0", `${base}...HEAD`], {
      reject: false,
    });
    return baseDiff.stdout;
  }

  const cached = await execa("git", ["diff", "--cached", "--unified=0"], { reject: false });
  if (cached.stdout.trim()) return cached.stdout;

  const unstaged = await execa("git", ["diff", "--unified=0"], { reject: false });
  return unstaged.stdout;
}
