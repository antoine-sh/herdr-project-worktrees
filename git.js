// Git access: run git (here or on a machine) and list a project's checkouts.

import { exec } from "herdr";

async function git(cwd, args, on) {
  const r = await exec("git", args, { cwd, on });
  return { ok: r.code === 0, out: (r.stdout ?? "").trim() };
}

// Every checkout of the project containing `folder`, or null if it isn't one.
export async function checkouts(folder, on) {
  const common = await git(folder, ["rev-parse", "--path-format=absolute", "--git-common-dir"], on);
  if (!common.ok) return null;
  const main = common.out.endsWith("/.git") ? common.out.slice(0, -5) : common.out;
  const list = await git(main, ["worktree", "list", "--porcelain"], on);
  if (!list.ok) return null;
  const out = [];
  for (const block of list.out.split(/\n\n+/)) {
    const lines = block.split("\n");
    const path = lines.find((l) => l.startsWith("worktree "))?.slice(9);
    if (!path || lines.some((l) => l === "bare" || l.startsWith("prunable"))) continue;
    const branch = lines.find((l) => l.startsWith("branch "))?.slice(7).replace(/^refs\/heads\//, "")
      ?? (lines.some((l) => l === "detached") ? "(detached)" : "?");
    out.push({ path, branch, main: out.length === 0 });
  }
  return { name: main.split("/").pop(), list: out };
}
